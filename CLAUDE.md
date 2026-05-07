# msk1 — MAPS Monorepo

## Structure

- **`frontend/`** — Vite + React (TypeScript) app.
- **`backend/`** — Python data ingestion scripts and Supabase schema.

## Getting started

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend (Python, via uv)
cd backend && uv run python ingest_pubmed.py
```

## Conventions

- `docs/` and `specs/` directories are **not committed** — they live locally only.
- Path alias `@` resolves to `frontend/` root (configured in `vite.config.ts` and `tsconfig.json`).
- `.env.local` lives in `frontend/.env.local`.
