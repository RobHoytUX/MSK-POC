# msk1 — MAPS Monorepo

## Structure

- **`frontend/`** — Vite + React (TypeScript) app.
- **`backend/api/`** — FastAPI backend (keyword graph, PubMed cache, research trail).
- **`backend/pubmed/`** — Python PubMed ingestion scripts and Supabase schema.
- **`infra/`** — Infrastructure definitions (Terraform / AWS).

## Getting started

```bash
# Frontend
cd frontend && npm install && npm run dev

# API backend (Python, via uv)
cd backend/api && uv run python api.py

# PubMed ingestion (Python, via uv)
cd backend/pubmed && uv run python ingest_pubmed.py
```

## Conventions

- `docs/` and `specs/` directories are **not committed** — they live locally only.
- Path alias `@` resolves to `frontend/` root (configured in `vite.config.ts` and `tsconfig.json`).
- `.env.local` lives in `frontend/.env.local`.
- `.env` files are gitignored; copy `.env.example` and fill in values.
