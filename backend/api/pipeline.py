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

# --- Canonical taxonomy ---
#
# Each entry is a dot-delimited "taxonomy_path" identifying a scaffold
# subcategory under which patient-specific extracted keywords may hang.
# The full hierarchy (Patient → Medical History/Diagnosis → category →
# subcategory) lives in the frontend (frontend/lib/treeTaxonomy.ts).
# Here we only need the leaf-attachment points so Bedrock can pick the right
# bucket for each extracted keyword.

TAXONOMY_PATHS: list[str] = [
    # Medical History
    "medical-history.comorbidities.cardiovascular",
    "medical-history.comorbidities.endocrine",
    "medical-history.comorbidities.renal-hepatic",
    "medical-history.prior-malignancies.secondary",
    "medical-history.prior-malignancies.prior-treatments",
    "medical-history.family-history.pedigree",
    "medical-history.family-history.syndromes",
    "medical-history.surgical.major",
    "medical-history.surgical.access",
    "medical-history.social.tobacco",
    "medical-history.social.occupational",
    # Diagnosis
    "diagnosis.primary-tumor.anatomy",
    "diagnosis.primary-tumor.histology",
    "diagnosis.primary-tumor.grade",
    "diagnosis.staging.t",
    "diagnosis.staging.n",
    "diagnosis.staging.m",
    "diagnosis.staging.group",
    "diagnosis.biomarkers.ihc",
    "diagnosis.biomarkers.serology",
    "diagnosis.biomarkers.ngs",
    "diagnosis.biomarkers.instability",
    "diagnosis.metastatic.sites",
    "diagnosis.metastatic.volume",
    "diagnosis.general.conditions",
]

VALID_PATHS = set(TAXONOMY_PATHS)


def _prefix_for_path(path: str) -> str:
    """Compact ID prefix derived from the taxonomy path (e.g. dx-bio for diagnosis.biomarkers.*)."""
    parts = path.split(".")
    if not parts:
        return "node"
    head = "mh" if parts[0] == "medical-history" else "dx" if parts[0] == "diagnosis" else parts[0][:3]
    tail = parts[1][:3] if len(parts) > 1 else ""
    return f"{head}-{tail}" if tail else head

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


ANNOTATED_PATHS = """  medical-history.comorbidities.cardiovascular    # CHF, CAD, arrhythmias, hypertension, cardiotoxicity risk, homocysteine
  medical-history.comorbidities.endocrine          # diabetes, thyroid dysfunction, adrenal/hormonal conditions
  medical-history.comorbidities.renal-hepatic      # CKD, cirrhosis, hepatitis — affects drug clearance & dosing
  medical-history.prior-malignancies.secondary     # prior unrelated cancer diagnoses
  medical-history.prior-malignancies.prior-treatments  # cumulative radiation doses, chemo limits (e.g. Doxorubicin lifetime dose)
  medical-history.family-history.pedigree          # first/second-degree relatives with cancer, age of onset
  medical-history.family-history.syndromes         # confirmed Lynch syndrome, Li-Fraumeni, BRCA1/2 germline status
  medical-history.surgical.major                   # organ resections — gastrectomy, nephrectomy, colectomy
  medical-history.surgical.access                  # Port-a-cath, PICC line, central line placements
  medical-history.social.tobacco                   # pack-year history, current/former smoker, vaping
  medical-history.social.occupational              # asbestos, benzene, heavy metal, radiation exposure
  diagnosis.primary-tumor.anatomy                  # organ and sub-site (e.g. upper outer quadrant left breast, right lower lobe)
  diagnosis.primary-tumor.histology                # cell type and morphology (e.g. invasive ductal, adenocarcinoma, NSCLC)
  diagnosis.primary-tumor.grade                    # cellular differentiation grade 1–4 / well-to-undifferentiated
  diagnosis.staging.t                              # T stage — tumor size and local extent
  diagnosis.staging.n                              # N stage — regional lymph node involvement
  diagnosis.staging.m                              # M stage — presence of distant metastasis
  diagnosis.staging.group                          # final summary stage (e.g. Stage IIIA, Stage IV)
  diagnosis.biomarkers.ihc                         # tissue staining results ONLY: ER/PR status, HER2, PD-L1 %, Ki-67 (IHC assays on biopsy/tissue)
  diagnosis.biomarkers.serology                    # serum/blood immunology: ANA, ANCA, paraneoplastic antibodies, immunoglobulin levels, complement, celiac panel
  diagnosis.biomarkers.ngs                         # genomic variants from sequencing: EGFR, ALK, KRAS, BRCA somatic mutations, translocations
  diagnosis.biomarkers.instability                 # MSI (microsatellite instability), TMB, mismatch repair status
  diagnosis.metastatic.sites                       # specific metastatic sites — visceral (liver, lung) vs non-visceral (bone, lymph node)
  diagnosis.metastatic.volume                      # disease extent: oligometastatic (≤3 sites) vs polymetastatic
  diagnosis.general.conditions                     # non-oncology active diagnoses: elevated LDL/cholesterol, GERD, obesity, osteoporosis, vitamin deficiencies, normal lab values worth noting"""

EXTRACTION_PROMPT_TEMPLATE = """You extract clinically meaningful keywords from a patient chart excerpt and \
place each one under the single most specific path in this fixed taxonomy.

Taxonomy paths with guidance (pick exactly one per keyword):
{annotated_paths}

Already extracted from earlier sections (DO NOT repeat these):
{seen}

Patient chart excerpt:
---
{chunk}
---

Rules:
- Only return findings NEW in this excerpt — skip anything in the "already extracted" list.
- Each keyword must use one of the paths above. Never invent new paths.
- Use the MOST SPECIFIC path. Examples:
    • HER2 3+ (tissue biopsy) → diagnosis.biomarkers.ihc
    • ANA negative, anti-Sjogren antibodies, hypogammaglobulinemia → diagnosis.biomarkers.serology
    • EGFR Exon 19 deletion → diagnosis.biomarkers.ngs
    • BRCA1 germline pathogenic → medical-history.family-history.syndromes
    • Elevated homocysteine → medical-history.comorbidities.cardiovascular
    • Elevated LDL, GERD, vitamin D level, eGFR → diagnosis.general.conditions
- Keep labels short and clinically faithful (e.g. "Stage IIIA", "EGFR Exon 19 del").
- Extract 5–15 keywords per excerpt. If nothing new, return [].
- If a finding genuinely fits nowhere, skip it.

Return ONLY a JSON array (no other text):
[{{ "label": "<keyword>", "taxonomy_path": "<path>" }}]"""


def _chunk_ehr_text(full_text: str, chunk_size: int = 200_000) -> list[str]:
    """Split EHR text at document boundaries (=== filename ===) into ~chunk_size chunks."""
    import re
    parts = re.split(r"(=== .+? ===)", full_text)
    chunks: list[str] = []
    current = ""
    for part in parts:
        if len(current) + len(part) > chunk_size and current:
            chunks.append(current)
            current = part
        else:
            current += part
    if current.strip():
        chunks.append(current)
    return chunks


def _normalize_label(label: str) -> str:
    """Lowercase + strip punctuation for dedup comparison."""
    import re
    return re.sub(r"[^a-z0-9 ]", "", label.lower()).strip()


def extract_nodes(ehr: dict[str, Any]) -> list[dict[str, Any]]:
    """Extract keywords from the full EHR text by chunking across all documents.

    Sends each ~200k-char chunk to Bedrock separately, passing previously
    seen labels so each call only returns genuinely new findings.
    """
    full_text = ehr["sections"].get("full_text", json.dumps(ehr["sections"]))
    chunks = _chunk_ehr_text(full_text)
    print(f"[extract] {len(chunks)} chunks from {len(full_text):,} chars")

    all_candidates: list[dict[str, str]] = []
    seen_normalized: set[str] = set()

    for i, chunk in enumerate(chunks):
        seen_summary = (
            "; ".join(c["label"] for c in all_candidates[:60])
            if all_candidates else "none yet"
        )
        prompt = EXTRACTION_PROMPT_TEMPLATE.format(
            annotated_paths=ANNOTATED_PATHS,
            seen=seen_summary,
            chunk=chunk,
        )
        try:
            raw = bedrock_call(prompt)
            start = raw.find("[")
            end = raw.rfind("]") + 1
            new_candidates = json.loads(raw[start:end])
        except Exception as e:
            print(f"[extract] chunk {i+1} failed: {e}")
            continue

        added = 0
        for c in new_candidates:
            path = (c.get("taxonomy_path") or "").strip()
            label = " ".join((c.get("label") or "").split())
            if not label or path not in VALID_PATHS:
                continue
            norm = _normalize_label(label)
            if norm in seen_normalized:
                continue
            seen_normalized.add(norm)
            all_candidates.append({"label": label, "taxonomy_path": path})
            added += 1

        print(f"[extract] chunk {i+1}/{len(chunks)}: +{added} new keywords ({len(all_candidates)} total)")

    counters: dict[str, int] = {}
    nodes = []
    for c in all_candidates:
        prefix = _prefix_for_path(c["taxonomy_path"])
        counters[prefix] = counters.get(prefix, 0) + 1
        nodes.append({
            "id": f"{prefix}-{counters[prefix]}",
            "label": c["label"],
            "taxonomy_path": c["taxonomy_path"],
        })

    print(f"[extract] {len(nodes)} keywords across {len({n['taxonomy_path'] for n in nodes})} paths")
    return nodes


# --- Phase 3b: PubMed pre-computation ---

def fetch_pubmed(os: OpenSearch, keyword: str) -> list[dict[str, str]]:
    # Fetch extra candidates so we have room to filter junk
    resp = os.search(
        index=OS_INDEX,
        body={
            "size": 20,
            "query": {
                "bool": {
                    "must": {
                        "multi_match": {
                            "query": keyword,
                            "fields": ["title^3", "text", "metadata.authors", "metadata.journal"],
                        }
                    },
                    "filter": {"exists": {"field": "text"}},
                }
            },
        },
    )
    papers = []
    for hit in resp["hits"]["hits"]:
        src = hit["_source"]
        meta = src.get("metadata", {})
        pmid = src.get("pmid") or meta.get("pmid", "")
        title = (src.get("title") or "").strip()
        raw_text = (src.get("text") or "").strip()
        # Strip papers with no real abstract: text too short or text is just the title
        if len(raw_text) < 150:
            continue
        if raw_text.lower().strip("[]., ") == title.lower().strip("[]., "):
            continue
        # Strip leading title prefix (stored as "{title}. {abstract}" in the index)
        if raw_text.lower().startswith(title.lower()):
            abstract = raw_text[len(title):].lstrip(". ").strip()
        else:
            abstract = raw_text
        abstract = abstract[:400]
        papers.append({
            "pmid": str(pmid),
            "title": title,
            "abstract": abstract,
            "journal": meta.get("journal", ""),
            "year": str(meta.get("year", "")),
            "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/" if pmid else "",
        })
        if len(papers) == 5:
            break
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

def write_to_db(patient_id: str, nodes: list[dict[str, Any]]):
    conn = db()
    cur = conn.cursor()
    cur.execute("DELETE FROM keyword_nodes WHERE patient_id = %s", (patient_id,))
    for n in nodes:
        cur.execute(
            "INSERT INTO keyword_nodes (id, patient_id, label, taxonomy_path) VALUES (%s, %s, %s, %s)",
            (n["id"], patient_id, n["label"], n["taxonomy_path"]),
        )
    cur.close()
    conn.commit()
    conn.close()
    print(f"[db] wrote {len(nodes)} nodes for patient {patient_id}")


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
    write_to_db(patient_id, nodes)
    precompute_pubmed(nodes, patient_id)
    print(f"[pipeline] done for patient {patient_id}")


def run_migration() -> str:
    """Apply schema.sql to RDS. Safe to run repeatedly."""
    import pathlib
    sql = pathlib.Path(__file__).parent.joinpath("schema.sql").read_text()
    conn = db()
    cur = conn.cursor()
    # pg8000 doesn't support multi-statement execute reliably; split on ';'
    # but preserve DO $$ ... $$ blocks. Easiest: drive each top-level statement
    # by scanning for `;` at column 0 of the trimmed line.
    stmts: list[str] = []
    buf: list[str] = []
    in_dollar = False
    for line in sql.splitlines():
        if "$$" in line:
            in_dollar = not in_dollar if line.count("$$") % 2 == 1 else in_dollar
        buf.append(line)
        if line.rstrip().endswith(";") and not in_dollar:
            stmt = "\n".join(buf).strip()
            if stmt:
                stmts.append(stmt)
            buf = []
    if buf:
        tail = "\n".join(buf).strip()
        if tail:
            stmts.append(tail)
    for s in stmts:
        cur.execute(s)
    cur.close()
    conn.commit()
    conn.close()
    return f"applied {len(stmts)} statements"


def lambda_handler(event, context):
    """Triggered by S3 ObjectCreated on ehr/raw/, or manually with {"patient_id": ..., "step": "precompute_pubmed"}."""
    if "Records" in event:
        record = event["Records"][0]["s3"]
        key = record["object"]["key"]
        patient_id = key.split("/")[2] if key.startswith("ehr/raw/") else key
        run_pipeline(patient_id, skip_textract=False)
        return {"statusCode": 200, "patient_id": patient_id}

    step = event.get("step", "full")
    if step == "migrate":
        result = run_migration()
        return {"statusCode": 200, "step": "migrate", "result": result}

    patient_id = event["patient_id"]

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
