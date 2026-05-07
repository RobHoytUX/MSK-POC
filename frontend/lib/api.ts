import type { GraphColumn } from "./medicalGraphData";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export async function fetchKeywordGraph(patientId: string): Promise<GraphColumn[]> {
  const res = await fetch(`${API_BASE}/api/patients/${patientId}/keyword-graph`);
  if (!res.ok) throw new Error(`keyword-graph ${res.status}`);
  return res.json();
}

export interface PubmedPaper {
  pmid: string;
  title: string;
  abstract: string;
  journal: string;
  year: string;
  url: string;
}

export async function fetchPubmed(nodeId: string): Promise<PubmedPaper[]> {
  const res = await fetch(`${API_BASE}/api/keywords/${nodeId}/pubmed`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.papers ?? [];
}

export interface TrailEntry {
  id: string;
  doctor_name: string;
  post_type: string;
  content: string;
  node_label: string;
  created_at: string;
}

export async function fetchResearchTrail(patientId: string, nodeId?: string): Promise<TrailEntry[]> {
  const url = nodeId
    ? `${API_BASE}/api/patients/${patientId}/research-trail?node_id=${nodeId}`
    : `${API_BASE}/api/patients/${patientId}/research-trail`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

export async function postResearchTrail(
  patientId: string,
  payload: {
    doctor_id: string;
    doctor_name: string;
    node_id: string;
    node_label: string;
    post_type: string;
    content: string;
  }
): Promise<TrailEntry> {
  const res = await fetch(`${API_BASE}/api/patients/${patientId}/research-trail`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`research-trail POST ${res.status}`);
  return res.json();
}
