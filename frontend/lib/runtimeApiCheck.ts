/**
 * Vite inlines `VITE_*` at **build** time. For hosted deploys, define `VITE_API_URL`
 * in the Vercel **Environment Variables** UI (Production + Preview) and **Redeploy**.
 */
export function warnIfProductionApiMissing(): void {
  if (!import.meta.env.PROD) return
  const raw = (import.meta.env.VITE_API_URL ?? '').trim()
  if (!raw || /localhost|127\.0\.0\.1/i.test(raw)) {
    console.warn(
      '[MAPS] Production build has no public API base. In Vercel: Project → Settings → Environment Variables → add VITE_API_URL = https://<your-fastapi-host> (no trailing slash). Enable for Production and Preview, then Redeploy.',
    )
  }
}

warnIfProductionApiMissing()
