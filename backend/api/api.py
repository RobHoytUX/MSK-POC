"""NeuroNode FastAPI backend — keyword graph, PubMed cache, and research trail."""

import os
import urllib.parse
from contextlib import asynccontextmanager
from typing import Any

import boto3
import pg8000.dbapi
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from pydantic import BaseModel

DATABASE_URL = os.environ["DATABASE_URL"]
DYNAMODB_TABLE = os.environ.get("DYNAMODB_TABLE", "neuronode_pubmed_cache")
AWS_REGION = os.environ.get("AWS_DEFAULT_REGION", "us-east-2")

_db_conn: pg8000.dbapi.Connection | None = None


# --- response models ---

class KeywordNode(BaseModel):
    id: str
    label: str
    connections: list[str]

class KeywordColumn(BaseModel):
    title: str
    count: int
    nodes: list[KeywordNode]

class PubMedPaper(BaseModel):
    pmid: str
    title: str
    abstract: str
    journal: str
    year: str
    url: str

class PubMedResponse(BaseModel):
    node_id: str
    label: str
    papers: list[PubMedPaper]

class TrailEntry(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    doctor_name: str
    node_id: str
    node_label: str
    post_type: str
    content: str
    created_at: str

class TrailItem(BaseModel):
    id: str
    doctor_name: str
    post_type: str
    content: str
    node_label: str
    created_at: str


def _parse_db_url(url: str) -> dict[str, Any]:
    p = urllib.parse.urlparse(url)
    return {
        "host": p.hostname,
        "port": p.port or 5432,
        "database": p.path.lstrip("/"),
        "user": p.username,
        "password": p.password,
    }


def get_db() -> pg8000.dbapi.Connection:
    global _db_conn
    try:
        if _db_conn is not None:
            cur = _db_conn.cursor()
            cur.execute("SELECT 1")
            cur.close()
            return _db_conn
    except Exception:
        pass
    params = _parse_db_url(DATABASE_URL)
    _db_conn = pg8000.dbapi.connect(**params)
    return _db_conn


def dynamo():
    return boto3.resource("dynamodb", region_name=AWS_REGION).Table(DYNAMODB_TABLE)


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_db()
    yield
    if _db_conn is not None:
        try:
            _db_conn.close()
        except Exception:
            pass


app = FastAPI(title="NeuroNode API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _rows_as_dicts(cursor: Any) -> list[dict[str, Any]]:
    cols = [d[0] for d in cursor.description]
    return [dict(zip(cols, row)) for row in cursor.fetchall()]


# --- keyword graph ---

@app.get("/api/patients/{patient_id}/keyword-graph", response_model=list[KeywordColumn], operation_id="getKeywordGraph")
def keyword_graph(patient_id: str):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT
          n.id,
          n.label,
          n.column_name,
          COALESCE(
            array_agg(e.to_id) FILTER (WHERE e.to_id IS NOT NULL), '{}'
          ) AS connections
        FROM keyword_nodes n
        LEFT JOIN keyword_edges e
          ON e.patient_id = n.patient_id AND e.from_id = n.id
        WHERE n.patient_id = %s
        GROUP BY n.id, n.label, n.column_name
        """,
        (patient_id,),
    )
    rows = _rows_as_dicts(cur)
    cur.close()

    if not rows:
        raise HTTPException(status_code=404, detail="graph not ready")

    column_order = [
        "Patient Data", "Categories", "Specifics",
        "Treatments", "Biomarkers", "Monitoring",
    ]
    buckets: dict[str, list[dict[str, Any]]] = {c: [] for c in column_order}
    for row in rows:
        col = row["column_name"]
        if col in buckets:
            buckets[col].append({
                "id": row["id"],
                "label": row["label"],
                "connections": list(row["connections"]) if row["connections"] else [],
            })

    return [
        {"title": col, "count": len(nodes), "nodes": nodes}
        for col, nodes in buckets.items()
    ]


# --- PubMed cache ---

@app.get("/api/keywords/{node_id}/pubmed", response_model=PubMedResponse, operation_id="getPubmedPapers")
def pubmed_papers(node_id: str):
    item = dynamo().get_item(Key={"node_id": node_id}).get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="pubmed results not ready")
    return {
        "node_id": item["node_id"],
        "label": item.get("label", ""),
        "papers": item.get("papers", []),
    }


# --- research trail ---

VALID_POST_TYPES = {"finding", "research", "article", "connection"}


class TrailPost(BaseModel):
    doctor_id: str
    doctor_name: str
    node_id: str
    node_label: str
    post_type: str
    content: str


@app.post("/api/patients/{patient_id}/research-trail", status_code=201, response_model=TrailEntry, operation_id="postTrailEntry")
def post_trail(patient_id: str, body: TrailPost):
    if body.post_type not in VALID_POST_TYPES:
        raise HTTPException(status_code=422, detail=f"post_type must be one of {VALID_POST_TYPES}")
    if len(body.content) > 500:
        raise HTTPException(status_code=422, detail="content max 500 characters")

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO research_trail
          (patient_id, doctor_id, doctor_name, node_id, node_label, post_type, content)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id, patient_id, doctor_id, doctor_name,
                  node_id, node_label, post_type, content, created_at
        """,
        (
            patient_id,
            body.doctor_id,
            body.doctor_name,
            body.node_id,
            body.node_label,
            body.post_type,
            body.content,
        ),
    )
    row = _rows_as_dicts(cur)[0]
    cur.close()
    conn.commit()
    return {**row, "id": str(row["id"]), "created_at": row["created_at"].isoformat()}


@app.get("/api/patients/{patient_id}/research-trail", response_model=list[TrailItem], operation_id="getResearchTrail")
def get_trail(patient_id: str, node_id: str | None = None):
    conn = get_db()
    cur = conn.cursor()
    if node_id:
        cur.execute(
            """
            SELECT id, doctor_name, post_type, content, node_label, created_at
            FROM research_trail
            WHERE patient_id = %s AND node_id = %s
            ORDER BY created_at DESC
            """,
            (patient_id, node_id),
        )
    else:
        cur.execute(
            """
            SELECT id, doctor_name, post_type, content, node_label, created_at
            FROM research_trail
            WHERE patient_id = %s
            ORDER BY created_at DESC
            """,
            (patient_id,),
        )
    rows = _rows_as_dicts(cur)
    cur.close()
    return [
        {**r, "id": str(r["id"]), "created_at": r["created_at"].isoformat()}
        for r in rows
    ]


# Lambda handler
handler = Mangum(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
