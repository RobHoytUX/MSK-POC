import {
  getKeywordGraph,
  getPubmedPapers,
  getResearchTrail,
  postTrailEntry,
} from '../src/api/generated'
import type { KeywordColumn, PubMedPaper, TrailItem, TrailPost } from '../src/api/generated'

export type { PubMedPaper as PubmedPaper }
export type { TrailItem as TrailEntry }
export type { TrailPost }

export async function fetchKeywordGraph(patientId: string): Promise<KeywordColumn[]> {
  const { data, error } = await getKeywordGraph({ path: { patient_id: patientId } })
  if (error || !data) throw new Error('keyword-graph request failed')
  return data
}

export async function fetchPubmed(nodeId: string): Promise<PubMedPaper[]> {
  const { data } = await getPubmedPapers({ path: { node_id: nodeId } })
  return data?.papers ?? []
}

export async function fetchResearchTrail(patientId: string, nodeId?: string): Promise<TrailItem[]> {
  const { data } = await getResearchTrail({
    path: { patient_id: patientId },
    query: nodeId ? { node_id: nodeId } : undefined,
  })
  return data ?? []
}

export async function postResearchTrail(
  patientId: string,
  payload: TrailPost
) {
  const { data, error } = await postTrailEntry({
    path: { patient_id: patientId },
    body: payload,
  })
  if (error || !data) throw new Error('research-trail POST failed')
  return data
}
