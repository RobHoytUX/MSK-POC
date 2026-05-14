"""Batch-ingest a folder of PDFs for one patient.

Runs Textract async on each PDF in parallel, concatenates all extracted text,
writes one combined EHR JSON to S3, then runs the keyword + PubMed pipeline.

Usage:
  python ingest_batch.py --patient-id p-1 --pdf-dir "/tmp/patient-data/updated medical history LL"
"""

import argparse
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import boto3

from pipeline import (
    REGION, S3_BUCKET, s3, textract,
    extract_nodes, extract_edges, write_to_db,
)


def textract_one(pdf_path: Path, patient_id: str) -> tuple[str, str]:
    """Upload one PDF, start Textract, poll, return (filename, extracted_text)."""
    safe_name = pdf_path.name.replace(" ", "_")
    s3_key = f"ehr/raw/{patient_id}/{safe_name}"
    print(f"[upload] {pdf_path.name}")
    s3.upload_file(str(pdf_path), S3_BUCKET, s3_key)

    resp = textract.start_document_analysis(
        DocumentLocation={"S3Object": {"Bucket": S3_BUCKET, "Name": s3_key}},
        FeatureTypes=["TABLES", "FORMS"],
    )
    job_id = resp["JobId"]

    while True:
        status = textract.get_document_analysis(JobId=job_id)
        state = status["JobStatus"]
        if state == "SUCCEEDED":
            break
        if state == "FAILED":
            print(f"[textract] FAILED on {pdf_path.name}: {status.get('StatusMessage')}")
            return (pdf_path.name, "")
        time.sleep(4)

    blocks = status.get("Blocks", [])
    next_token = status.get("NextToken")
    while next_token:
        nxt = textract.get_document_analysis(JobId=job_id, NextToken=next_token)
        blocks.extend(nxt.get("Blocks", []))
        next_token = nxt.get("NextToken")

    lines = [b["Text"] for b in blocks if b["BlockType"] == "LINE" and "Text" in b]
    text = "\n".join(lines)
    print(f"[textract] {pdf_path.name} → {len(lines)} lines, {len(text)} chars")
    return (pdf_path.name, text)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--patient-id", required=True)
    parser.add_argument("--pdf-dir", required=True)
    parser.add_argument("--max-workers", type=int, default=10)
    parser.add_argument("--limit", type=int, help="Process only first N PDFs")
    parser.add_argument("--skip-textract", action="store_true",
                        help="Skip Textract; load existing EHR JSON from S3")
    args = parser.parse_args()

    if args.skip_textract:
        from pipeline import load_ehr_from_s3
        ehr = load_ehr_from_s3(args.patient_id)
        print(f"[batch] loaded existing EHR for {args.patient_id} ({len(json.dumps(ehr))} chars)")
        nodes = extract_nodes(ehr)
        edges = extract_edges(nodes)
        write_to_db(args.patient_id, nodes, edges)
        print("[batch] invoking pipeline Lambda for PubMed pre-computation…")
        lam = boto3.client("lambda", region_name=REGION)
        resp = lam.invoke(
            FunctionName="neuronode-pipeline",
            InvocationType="RequestResponse",
            Payload=json.dumps({"patient_id": args.patient_id, "step": "precompute_pubmed"}).encode(),
        )
        print(f"[batch] Lambda response: {resp['Payload'].read().decode()}")
        return

    pdfs = sorted(Path(args.pdf_dir).glob("*.[pP][dD][fF]"))
    if args.limit:
        pdfs = pdfs[:args.limit]
    print(f"[batch] processing {len(pdfs)} PDFs for patient {args.patient_id}")

    sections: dict[str, str] = {}
    with ThreadPoolExecutor(max_workers=args.max_workers) as ex:
        futures = {ex.submit(textract_one, pdf, args.patient_id): pdf for pdf in pdfs}
        for fut in as_completed(futures):
            name, text = fut.result()
            if text:
                sections[name] = text

    combined_text = "\n\n".join(
        f"=== {name} ===\n{text}" for name, text in sections.items()
    )
    print(f"[batch] combined text: {len(combined_text)} chars from {len(sections)} PDFs")

    ehr = {
        "patient_id": args.patient_id,
        "sections": {
            "full_text": combined_text,
            "documents": sections,
        },
    }
    out_key = f"ehr/converted/{args.patient_id}.json"
    s3.put_object(Bucket=S3_BUCKET, Key=out_key, Body=json.dumps(ehr))
    print(f"[batch] saved EHR → s3://{S3_BUCKET}/{out_key}")

    print("[batch] running keyword extraction…")
    nodes = extract_nodes(ehr)
    edges = extract_edges(nodes)
    write_to_db(args.patient_id, nodes, edges)

    print("[batch] invoking pipeline Lambda for PubMed pre-computation (VPC-only)…")
    lam = boto3.client("lambda", region_name=REGION)
    resp = lam.invoke(
        FunctionName="neuronode-pipeline",
        InvocationType="RequestResponse",
        Payload=json.dumps({"patient_id": args.patient_id, "step": "precompute_pubmed"}).encode(),
    )
    payload = resp["Payload"].read().decode()
    print(f"[batch] Lambda response: {payload}")

    print(f"[batch] DONE for {args.patient_id}")


if __name__ == "__main__":
    main()
