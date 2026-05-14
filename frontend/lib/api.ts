import {
  getKeywordGraph,
  getResearchTrail,
  postTrailEntry,
} from '../src/api/generated'
import type { KeywordColumn, PubMedPaper, TrailItem, TrailPost } from '../src/api/generated'
import { DEMO_KEYWORD_LEAVES_BY_PATIENT } from './demoKeywordLeaves'
import { buildPatientTree, type TreeNode } from './treeTaxonomy'

function pubmedSearchLinkPapers(keywordLabel: string): PubMedPaper[] {
  const q = keywordLabel.trim() || 'clinical'
  const url = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(q)}`
  return [
    {
      pmid: 'browser-search',
      title: `Search PubMed for “${q}”`,
      abstract:
        'The backend API is unreachable or has no cached papers for this keyword. Open the link below to run the same query on pubmed.ncbi.nlm.nih.gov in your browser.',
      journal: 'PubMed',
      year: '',
      url,
    },
  ]
}

type KeywordLeafInput = {
  id: string
  label: string
  taxonomyPath: string
  pubmedAvailable?: boolean
}

/** API leaves only unless `VITE_DEMO_KEYWORD_LEAVES=true` (see demoKeywordLeaves.ts). */
export function mergeKeywordLeavesWithDemo(patientId: string, apiLeaves: KeywordLeafInput[]): KeywordLeafInput[] {
  if (import.meta.env.VITE_DEMO_KEYWORD_LEAVES !== 'true') return apiLeaves
  const demo = DEMO_KEYWORD_LEAVES_BY_PATIENT[patientId]
  if (!demo?.length) return apiLeaves
  const byId = new Map(apiLeaves.map((n) => [n.id, n]))
  for (const n of demo) {
    if (!byId.has(n.id)) {
      byId.set(n.id, { ...n, pubmedAvailable: n.pubmedAvailable ?? true })
    }
  }
  return [...byId.values()]
}

export function buildKeywordTreeForPatient(
  patientId: string,
  patientName: string,
  apiLeaves: KeywordLeafInput[],
): TreeNode {
  return buildPatientTree(mergeKeywordLeavesWithDemo(patientId, apiLeaves), patientName)
}

export type { PubMedPaper as PubmedPaper }
export type { TrailItem as TrailEntry }
export type { TrailPost }

export async function fetchKeywordGraph(patientId: string): Promise<KeywordColumn[]> {
  const { data, error } = await getKeywordGraph({ path: { patient_id: patientId } })
  if (error || !data) throw new Error('keyword-graph request failed')
  return data
}

/** Patient-specific taxonomy leaves merged into the scaffold from `treeTaxonomy`. */
export async function fetchKeywordTree(patientId: string, patientName: string): Promise<TreeNode> {
  const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
  const res = await fetch(
    `${baseUrl}/api/patients/${encodeURIComponent(patientId)}/keyword-tree`,
  )
  if (res.status === 404) {
    return buildKeywordTreeForPatient(patientId, patientName, [])
  }
  if (!res.ok) throw new Error('keyword-tree request failed')
  const data = (await res.json()) as {
    nodes: Array<{
      id: string
      label: string
      taxonomy_path: string
      pubmed_available?: boolean
    }>
  }
  const leaves = data.nodes.map((n) => ({
    id: n.id,
    label: n.label,
    taxonomyPath: n.taxonomy_path,
    pubmedAvailable: n.pubmed_available ?? true,
  }))
  return buildKeywordTreeForPatient(patientId, patientName, leaves)
}

export async function fetchPubmed(
  nodeId: string,
  opts?: { keywordLabel?: string },
): Promise<PubMedPaper[]> {
  const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
  const label = opts?.keywordLabel?.trim() ?? ''
  const demoFallbackAllowed =
    import.meta.env.VITE_DEMO_KEYWORD_LEAVES === 'true' && nodeId.startsWith('demo-')

  const demoFallback = () => pubmedSearchLinkPapers(label || 'breast cancer family history')

  try {
    const res = await fetch(`${baseUrl}/api/keywords/${encodeURIComponent(nodeId)}/pubmed`)
    if (res.status === 404) {
      if (demoFallbackAllowed) return demoFallback()
      return []
    }
    if (!res.ok) throw new Error('pubmed request failed')
    const data = (await res.json()) as { papers?: PubMedPaper[] }
    return data.papers ?? []
  } catch (e) {
    if (demoFallbackAllowed) return demoFallback()
    const hint = `Cannot reach ${baseUrl}. Start the API (see CLAUDE.md: cd backend/api && uv run python api.py) and ensure frontend/.env.local sets VITE_API_URL if it is not localhost:8000.`
    if (e instanceof TypeError) {
      throw new Error(`${hint} (${e.message})`)
    }
    throw e
  }
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
