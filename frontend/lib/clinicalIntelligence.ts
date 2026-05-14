/**
 * Clinical Intelligence API — longitudinal records + RAG chat.
 * @see Integration guide surfaced in ClinicalIntelligenceApiGuideDialog
 */

const DEFAULT_CI_BASE = "http://18.191.159.27:8000";

export function getClinicalIntelligenceBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_CLINICAL_INTELLIGENCE_URL;
  return (typeof fromEnv === "string" && fromEnv.trim().length > 0 ? fromEnv : DEFAULT_CI_BASE).replace(
    /\/$/,
    "",
  );
}

/** Map cohort ids like `p-1` to backend numeric patient ids; returns null when unknown. */
export function resolveClinicalPatientId(localPatientId: string): number | null {
  const trimmed = localPatientId.trim();
  const prefixed = /^p-(\d+)$/i.exec(trimmed);
  if (prefixed) return parseInt(prefixed[1], 10);
  const numeric = Number.parseInt(trimmed, 10);
  return Number.isFinite(numeric) ? numeric : null;
}

export interface ClinicalTimelineEntry {
  filename: string;
  doc_date: string;
  snippet: string;
}

export interface ClinicalTimelineResponse {
  patient_name: string;
  total_records: number;
  timeline?: ClinicalTimelineEntry[] | null;
}

export interface ClinicalPubMedReference {
  title: string;
  pmid: string;
  journal: string;
  link: string;
}

export interface ClinicalChatResponse {
  ai_analysis: string;
  references: ClinicalPubMedReference[];
  status: string;
}

export async function fetchClinicalPatientTimeline(
  patientId: number,
  signal?: AbortSignal,
): Promise<ClinicalTimelineResponse> {
  const base = getClinicalIntelligenceBaseUrl();
  const res = await fetch(`${base}/patient/${patientId}/timeline`, { signal });
  if (!res.ok) throw new Error(`timeline ${res.status}`);
  const raw = (await res.json()) as Partial<ClinicalTimelineResponse> | null;
  return {
    patient_name: typeof raw?.patient_name === "string" ? raw.patient_name : "",
    total_records:
      typeof raw?.total_records === "number" && Number.isFinite(raw.total_records)
        ? raw.total_records
        : 0,
    timeline: Array.isArray(raw?.timeline) ? raw.timeline : [],
  };
}

export async function postClinicalChat(
  payload: { patient_id: number; user_query: string },
  signal?: AbortSignal,
): Promise<ClinicalChatResponse> {
  const base = getClinicalIntelligenceBaseUrl();
  const res = await fetch(`${base}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) throw new Error(`chat ${res.status}`);
  return res.json();
}

export function groupClinicalTimelineByYear(
  timeline: ClinicalTimelineEntry[] | null | undefined,
): { year: number; items: ClinicalTimelineEntry[] }[] {
  const list = Array.isArray(timeline) ? timeline : [];
  const map = new Map<number, ClinicalTimelineEntry[]>();
  for (const item of list) {
    const y = parseInt(item.doc_date.slice(0, 4), 10);
    if (!Number.isFinite(y)) continue;
    let arr = map.get(y);
    if (!arr) {
      arr = [];
      map.set(y, arr);
    }
    arr.push(item);
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, items]) => ({
      year,
      items: items.sort((x, y) => y.doc_date.localeCompare(x.doc_date)),
    }));
}
