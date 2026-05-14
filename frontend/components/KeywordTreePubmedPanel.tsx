import { useEffect, useState } from 'react'
import type { Patient } from '../lib/patients'
import type { TreeNode } from '../lib/treeTaxonomy'
import { fetchPubmed, type PubmedPaper } from '../lib/api'

interface Props {
  patient: Patient | null
  selectedNode: TreeNode | null
  onClose: () => void
}

/**
 * Right-hand side panel for the tree view. Shows a compact patient header
 * at the top, then a PubMed list for the currently-selected leaf node.
 *
 * Intermediate (scaffold) nodes do not have PubMed results — we render a
 * helper message instead. Only `leaf` nodes trigger a fetch.
 */
export default function KeywordTreePubmedPanel({ patient, selectedNode, onClose }: Props) {
  const [papers, setPapers] = useState<PubmedPaper[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedNode || selectedNode.type !== 'leaf' || !selectedNode.pubmedAvailable) {
      setPapers([])
      setError(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchPubmed(selectedNode.id)
      .then((p) => {
        if (cancelled) return
        setPapers(p)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'pubmed fetch failed')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedNode])

  if (!selectedNode) return null

  const isLeaf = selectedNode.type === 'leaf'

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">
      {/* Patient header */}
      {patient && (
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-sm">
                  {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{patient.name}</p>
                  <p className="text-xs text-slate-500">
                    {patient.age}yo {patient.gender} · MRN {patient.mrn}
                  </p>
                </div>
              </div>
              {patient.diagnoses.length > 0 && (
                <p className="text-xs text-slate-600 mt-2">{patient.diagnoses[0]}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 text-xl leading-none"
              aria-label="Close panel"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Selected node header */}
      <div className="px-5 py-4 border-b border-slate-200">
        <p className="text-xs uppercase tracking-wide text-slate-500">{selectedNode.type}</p>
        <h3 className="text-lg font-semibold text-slate-900 mt-0.5">{selectedNode.label}</h3>
        {selectedNode.taxonomyPath !== 'root' && (
          <p className="text-xs text-slate-400 mt-1 font-mono">{selectedNode.taxonomyPath}</p>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {!isLeaf && (
          <div className="text-sm text-slate-500">
            This is a taxonomy category. Select a specific extracted keyword (green leaf) to load PubMed literature.
          </div>
        )}

        {isLeaf && loading && (
          <div className="text-sm text-slate-500">Loading PubMed…</div>
        )}

        {isLeaf && !loading && error && (
          <div className="text-sm text-rose-600">PubMed lookup failed: {error}</div>
        )}

        {isLeaf && !loading && !error && papers.length === 0 && (
          <div className="text-sm text-slate-500">
            No cached PubMed papers for this keyword yet.
          </div>
        )}

        {isLeaf && !loading && papers.length > 0 && (
          <ul className="space-y-4">
            {papers.map((paper) => (
              <li key={paper.pmid} className="border-b border-slate-100 pb-3 last:border-0">
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-indigo-700 hover:underline"
                >
                  {paper.title}
                </a>
                <p className="text-xs text-slate-500 mt-0.5">
                  {paper.journal}
                  {paper.year ? ` · ${paper.year}` : ''}
                </p>
                {paper.abstract && (
                  <p className="text-xs text-slate-600 mt-2 line-clamp-4">{paper.abstract}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
