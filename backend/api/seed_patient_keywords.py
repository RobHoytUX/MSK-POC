#!/usr/bin/env python3
"""
Seed patient-specific keyword leaves in Postgres (same shape as `pipeline.write_to_db`).

Use this so the frontend only shows keywords from `/api/.../keyword-tree` (no VITE_DEMO_KEYWORD_LEAVES).

Example (Maria Santos in the UI is patient id `p-1`):

  cd backend/api && DATABASE_URL=... uv run python seed_patient_keywords.py

Optional: after rows exist, backfill DynamoDB PubMed cache (needs AWS + OpenSearch like `pipeline`):

  uv run python seed_patient_keywords.py --patient-id p-1 --pubmed

Requires `keyword_nodes` columns: id, patient_id, label, taxonomy_path (see pipeline inserts).
"""

from __future__ import annotations

import argparse
import os
import sys

import pg8000.dbapi


def _parse_db_url(url: str) -> dict:
    import urllib.parse

    p = urllib.parse.urlparse(url)
    return {
        "host": p.hostname,
        "port": p.port or 5432,
        "database": p.path.lstrip("/"),
        "user": p.username,
        "password": p.password,
    }


def _prefix_for_path(path: str) -> str:
    """Match `pipeline._prefix_for_path` so node ids align with extraction runs."""
    parts = path.split(".")
    if not parts:
        return "node"
    head = (
        "mh"
        if parts[0] == "medical-history"
        else "dx"
        if parts[0] == "diagnosis"
        else parts[0][:3]
    )
    tail = parts[1][:3] if len(parts) > 1 else ""
    return f"{head}-{tail}" if tail else head


# Canonical paths from `TAXONOMY_PATHS` / frontend `treeTaxonomy.ts`.
MARIA_SAMPLE_NODES: list[tuple[str, str]] = [
    ("Family: maternal breast cancer", "medical-history.family-history.pedigree"),
    ("Lynch syndrome screening discussed", "medical-history.family-history.syndromes"),
    ("ER positive", "diagnosis.biomarkers.ihc"),
    ("Stage IIA", "diagnosis.staging.group"),
]


def build_nodes(pairs: list[tuple[str, str]]) -> list[dict[str, str]]:
    counters: dict[str, int] = {}
    out: list[dict[str, str]] = []
    for label, path in pairs:
        pfx = _prefix_for_path(path)
        counters[pfx] = counters.get(pfx, 0) + 1
        out.append(
            {
                "id": f"{pfx}-{counters[pfx]}",
                "label": label,
                "taxonomy_path": path,
            }
        )
    return out


def seed(patient_id: str, nodes: list[dict[str, str]]) -> None:
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL is required", file=sys.stderr)
        sys.exit(1)
    conn = pg8000.dbapi.connect(**_parse_db_url(database_url))
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
    print(f"[seed] wrote {len(nodes)} keyword_nodes for patient_id={patient_id!r}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--patient-id", default="p-1", help='Frontend patient id (Maria Santos is "p-1")')
    ap.add_argument(
        "--pubmed",
        action="store_true",
        help="Run pipeline precompute_pubmed for this patient (OpenSearch + DynamoDB)",
    )
    args = ap.parse_args()
    nodes = build_nodes(MARIA_SAMPLE_NODES)
    seed(args.patient_id, nodes)
    if args.pubmed:
        from pipeline import precompute_pubmed

        precompute_pubmed(nodes, args.patient_id)


if __name__ == "__main__":
    main()
