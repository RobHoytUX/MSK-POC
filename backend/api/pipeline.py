"""NeuroNode pipeline — Textract → Bedrock → keyword graph → PubMed pre-computation.

Can be run directly:
  python pipeline.py --patient-id demo --pdf path/to/chart.pdf

Or invoked as a Lambda (set LAMBDA=1 env var).
"""

import argparse
import json
import os
import time
from datetime import datetime, timezone
from typing import Any

import boto3
import urllib.parse

import pg8000.dbapi
from opensearchpy import OpenSearch, RequestsHttpConnection

# --- config ---

REGION = os.environ.get("AWS_DEFAULT_REGION", "us-east-2")
S3_BUCKET = os.environ.get("S3_BUCKET", "neuronode-ehr-711962920328")
DATABASE_URL = os.environ["DATABASE_URL"]
DYNAMODB_TABLE = os.environ.get("DYNAMODB_TABLE", "neuronode_pubmed_cache")
BEDROCK_MODEL = os.environ.get(
    "BEDROCK_MODEL", "us.anthropic.claude-haiku-4-5-20251001-v1:0"
)
OS_HOST = os.environ.get(
    "OPENSEARCH_HOST",
    "vpc-pubmed-research-v2-casrfxnixzy6g2s2abmzb5dxte.us-east-2.es.amazonaws.com",
)
OS_USER = os.environ.get("OPENSEARCH_USER", "dbadmin")
OS_PASS = os.environ.get("OPENSEARCH_PASS", "Prudvi@1999")
OS_INDEX = "pubmed_39m_v1"

VALID_COLUMNS = {
    "Patient Data", "Categories", "Specifics",
    "Treatments", "Biomarkers", "Monitoring",
}

COLUMN_PREFIXES = {
    "Patient Data": "pd",
    "Categories": "cat",
    "Specifics": "spec",
    "Treatments": "treat",
    "Biomarkers": "bio",
    "Monitoring": "mon",
}

# --- AWS clients ---

session = boto3.Session(region_name=REGION)
s3 = session.client("s3")
textract = session.client("textract")
bedrock = session.client("bedrock-runtime")
dynamo = session.resource("dynamodb").Table(DYNAMODB_TABLE)


def os_client():
    return OpenSearch(
        hosts=[{"host": OS_HOST, "port": 443}],
        http_auth=(OS_USER, OS_PASS),
        use_ssl=True,
        verify_certs=True,
        connection_class=RequestsHttpConnection,
        timeout=30,
    )


def _parse_db_url(url: str) -> dict[str, Any]:
    p = urllib.parse.urlparse(url)
    return {"host": p.hostname, "port": p.port or 5432, "database": p.path.lstrip("/"), "user": p.username, "password": p.password}


def db():
    return pg8000.dbapi.connect(**_parse_db_url(DATABASE_URL))


# --- Phase 2: Textract ---

def run_textract(patient_id: str, pdf_path: str) -> dict[str, Any]:
    """Upload PDF, run Textract, assemble EHR JSON, save to S3."""
    s3_key = f"ehr/raw/{patient_id}/chart.pdf"
    print(f"[textract] uploading {pdf_path} → s3://{S3_BUCKET}/{s3_key}")
    s3.upload_file(pdf_path, S3_BUCKET, s3_key)

    resp = textract.start_document_analysis(
        DocumentLocation={"S3Object": {"Bucket": S3_BUCKET, "Name": s3_key}},
        FeatureTypes=["TABLES", "FORMS"],
    )
    job_id = resp["JobId"]
    print(f"[textract] job {job_id} — polling…")

    while True:
        status = textract.get_document_analysis(JobId=job_id)
        state = status["JobStatus"]
        if state == "SUCCEEDED":
            break
        if state == "FAILED":
            raise RuntimeError(f"Textract failed: {status.get('StatusMessage')}")
        time.sleep(5)

    blocks = status.get("Blocks", [])
    text_blocks = [b["Text"] for b in blocks if b["BlockType"] == "LINE" and "Text" in b]
    raw_text = "\n".join(text_blocks)

    ehr = {
        "patient_id": patient_id,
        "sections": {"full_text": raw_text},
        "raw_blocks": blocks,
    }
    out_key = f"ehr/converted/{patient_id}.json"
    s3.put_object(Bucket=S3_BUCKET, Key=out_key, Body=json.dumps(ehr))
    print(f"[textract] saved → s3://{S3_BUCKET}/{out_key}")
    return ehr


def load_ehr_from_s3(patient_id: str) -> dict[str, Any]:
    key = f"ehr/converted/{patient_id}.json"
    obj = s3.get_object(Bucket=S3_BUCKET, Key=key)
    return json.loads(obj["Body"].read())


# --- Phase 3a: Bedrock node extraction ---

def bedrock_call(prompt: str, max_retries: int = 4) -> str:
    body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 8192,
        "messages": [{"role": "user", "content": prompt}],
    })
    last_err: Exception = RuntimeError("bedrock_call called with max_retries=0")
    for attempt in range(max_retries):
        try:
            resp = bedrock.invoke_model(modelId=BEDROCK_MODEL, body=body)
            result = json.loads(resp["body"].read())
            return result["content"][0]["text"]
        except Exception as e:
            last_err = e
            wait = 5 * (attempt + 1)
            print(f"[bedrock] attempt {attempt+1} failed ({type(e).__name__}); retry in {wait}s")
            time.sleep(wait)
    raise last_err


def extract_nodes(ehr: dict[str, Any]) -> list[dict[str, Any]]:
    ehr_text = ehr["sections"].get("full_text", json.dumps(ehr["sections"]))[:120000]
    prompt = f"""Given this patient chart:

{ehr_text}

Extract all clinically meaningful keywords and assign each to exactly one of these 6 categories:
- Patient Data: top-level chart sections (e.g. Medical History, Lab Results, Treatment History)
- Categories: clinical groupings (e.g. Cancer Diagnosis, Genetic Markers, Prior Chemotherapy)
- Specifics: concrete named values (e.g. Stage II, BRCA Negative, AC-T Chemotherapy)
- Treatments: treatment modalities (e.g. Chemotherapy, Surgery, Radiation, Hormone Therapy)
- Biomarkers: lab values and genomic markers (e.g. ER+/PR+ HER2-, Ki-67 Index, Oncotype Score)
- Monitoring: ongoing tests and follow-up items (e.g. Lab Monitoring, Imaging Studies, Clinical Trials)

Return ONLY a JSON array (no other text):
[{{ "label": "<keyword>", "column_name": "<category>" }}]

Include 4-8 nodes per category. Use only the exact category names above."""

    raw = bedrock_call(prompt)
    start = raw.find("[")
    end = raw.rfind("]") + 1
    candidates = json.loads(raw[start:end])

    counters: dict[str, int] = {}
    nodes = []
    for c in candidates:
        col = c.get("column_name", "").strip()
        if col not in VALID_COLUMNS:
            continue
        prefix = COLUMN_PREFIXES[col]
        counters[prefix] = counters.get(prefix, 0) + 1
        nodes.append({
            "id": f"{prefix}-{counters[prefix]}",
            "label": c["label"].strip(),
            "column_name": col,
        })

    print(f"[pass1] extracted {len(nodes)} nodes")
    return nodes


def extract_edges(nodes: list[dict[str, Any]]) -> list[dict[str, Any]]:
    node_list = json.dumps([{"id": n["id"], "label": n["label"], "column_name": n["column_name"]} for n in nodes])
    prompt = f"""Here is a list of medical keyword nodes extracted from a patient chart:
{node_list}

For each node, identify which other nodes it is clinically related to
(e.g. a treatment connects to the diagnosis it was given for;
a biomarker connects to the treatment it informed).

Only reference node IDs from the list above. Do not invent new nodes.
Each pair should be listed once (no duplicates in both directions).

Return ONLY a JSON array (no other text):
[{{ "from_id": "<id>", "to_id": "<id>" }}]"""

    raw = bedrock_call(prompt)
    start = raw.find("[")
    end = raw.rfind("]") + 1
    candidates = json.loads(raw[start:end])

    valid_ids = {n["id"] for n in nodes}
    edges = [
        e for e in candidates
        if e.get("from_id") in valid_ids and e.get("to_id") in valid_ids
        and e["from_id"] != e["to_id"]
    ]
    print(f"[pass2] extracted {len(edges)} edges")
    return edges


# --- Phase 3b: PubMed pre-computation ---

def fetch_pubmed(os: OpenSearch, keyword: str) -> list[dict[str, str]]:
    resp = os.search(
        index=OS_INDEX,
        body={
            "size": 5,
            "query": {
                "multi_match": {
                    "query": keyword,
                    "fields": ["title^3", "text", "metadata.authors", "metadata.journal"],
                }
            },
        },
    )
    papers = []
    for hit in resp["hits"]["hits"]:
        src = hit["_source"]
        meta = src.get("metadata", {})
        pmid = src.get("pmid") or meta.get("pmid", "")
        papers.append({
            "pmid": str(pmid),
            "title": src.get("title", ""),
            "abstract": (src.get("text") or "")[:300],
            "journal": meta.get("journal", ""),
            "year": str(meta.get("year", "")),
            "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/" if pmid else "",
        })
    return papers


def precompute_pubmed(nodes: list[dict[str, Any]], patient_id: str):
    osc = os_client()
    for node in nodes:
        papers = fetch_pubmed(osc, node["label"])
        dynamo.put_item(Item={
            "node_id": node["id"],
            "patient_id": patient_id,
            "label": node["label"],
            "papers": papers,
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        })
        print(f"[pubmed] {node['id']} ({node['label']}) → {len(papers)} papers cached")


# --- DB writes ---

def write_to_db(patient_id: str, nodes: list[dict[str, Any]], edges: list[dict[str, Any]]):
    conn = db()
    cur = conn.cursor()
    cur.execute("DELETE FROM keyword_edges WHERE patient_id = %s", (patient_id,))
    cur.execute("DELETE FROM keyword_nodes WHERE patient_id = %s", (patient_id,))
    for n in nodes:
        cur.execute(
            "INSERT INTO keyword_nodes (id, patient_id, label, column_name) VALUES (%s, %s, %s, %s)",
            (n["id"], patient_id, n["label"], n["column_name"]),
        )
    for e in edges:
        cur.execute(
            "INSERT INTO keyword_edges (patient_id, from_id, to_id) VALUES (%s, %s, %s)",
            (patient_id, e["from_id"], e["to_id"]),
        )
    cur.close()
    conn.commit()
    conn.close()
    print(f"[db] wrote {len(nodes)} nodes + {len(edges)} edges for patient {patient_id}")


# --- main ---

def run_pipeline(patient_id, pdf_path=None, skip_textract=False):
    if skip_textract:
        print(f"[pipeline] loading existing EHR for {patient_id}")
        ehr = load_ehr_from_s3(patient_id)
    elif pdf_path:
        ehr = run_textract(patient_id, pdf_path)
    else:
        raise ValueError("provide --pdf or --skip-textract")

    nodes = extract_nodes(ehr)
    edges = extract_edges(nodes)
    write_to_db(patient_id, nodes, edges)
    precompute_pubmed(nodes, patient_id)
    print(f"[pipeline] done for patient {patient_id}")


def lambda_handler(event, context):
    """Triggered by S3 ObjectCreated on ehr/raw/, or manually with {"patient_id": ..., "step": "precompute_pubmed"}."""
    if "Records" in event:
        record = event["Records"][0]["s3"]
        key = record["object"]["key"]
        patient_id = key.split("/")[2] if key.startswith("ehr/raw/") else key
        run_pipeline(patient_id, skip_textract=False)
        return {"statusCode": 200, "patient_id": patient_id}

    patient_id = event["patient_id"]
    step = event.get("step", "full")

    if step == "precompute_pubmed":
        conn = db()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, label FROM keyword_nodes WHERE patient_id = %s",
            (patient_id,),
        )
        nodes = [{"id": r[0], "label": r[1]} for r in cur.fetchall()]
        cur.close()
        conn.close()
        precompute_pubmed(nodes, patient_id)
        return {"statusCode": 200, "patient_id": patient_id, "nodes": len(nodes)}

    if step == "full":
        run_pipeline(patient_id, skip_textract=event.get("skip_textract", True))
        return {"statusCode": 200, "patient_id": patient_id}

    return {"statusCode": 400, "error": f"unknown step {step}"}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--patient-id", required=True)
    parser.add_argument("--pdf", help="Path to PDF to ingest via Textract")
    parser.add_argument("--skip-textract", action="store_true",
                        help="Use existing ehr/converted/{patient_id}.json from S3")
    args = parser.parse_args()
    run_pipeline(args.patient_id, args.pdf, args.skip_textract)
