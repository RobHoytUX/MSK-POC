import { useEffect, useMemo, useState } from 'react'
import type { Patient } from '../lib/patients'
import type { TreeNode, TreeNodeType } from '../lib/treeTaxonomy'
import { flattenKeywordTreeChipNodes } from '../lib/treeTaxonomy'
import { fetchPubmed, type PubmedPaper } from '../lib/api'

function chipTypeAbbrev(t: TreeNodeType): string {
  if (t === 'branch') return 'Sec'
  if (t === 'category') return 'Cat'
  if (t === 'subcategory') return 'Sub'
  if (t === 'leaf') return 'Kw'
  return ''
}

interface Props {
  patient: Patient | null
  keywordTreeFull: TreeNode | null
  selectedNode: TreeNode | null
  /** User-toggled subtree roots removed from pruning (shown as “collapsed” chips). */
  hiddenSubtreeRootIds?: ReadonlySet<string>
  onToggleNodeVisibility?: (node: TreeNode) => void
  onResetAllHidden?: () => void
  onClose: () => void
}

export default function KeywordTreePubmedPanel({
  patient,
  keywordTreeFull,
  selectedNode,
  hiddenSubtreeRootIds,
  onToggleNodeVisibility,
  onResetAllHidden,
  onClose,
}: Props) {
  const [papers, setPapers] = useState<PubmedPaper[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chipsExpanded, setChipsExpanded] = useState(true)

  useEffect(() => {
    if (!selectedNode || selectedNode.type !== 'leaf') {
      setPapers([])
      setError(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchPubmed(selectedNode.id, { keywordLabel: selectedNode.label })
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

  const keywordChips = useMemo(() => {
    if (!keywordTreeFull) return []
    return flattenKeywordTreeChipNodes(keywordTreeFull).sort((a, b) =>
      a.taxonomyPath.localeCompare(b.taxonomyPath, undefined, { sensitivity: 'base' }),
    )
  }, [keywordTreeFull])

  const chipsEnabled = Boolean(keywordTreeFull && onToggleNodeVisibility)
  const explicitCollapsedCount = hiddenSubtreeRootIds?.size ?? 0

  const isLeaf = selectedNode?.type === 'leaf'

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 min-h-0">
      {!patient && (
        <div className="shrink-0 flex justify-end px-3 py-2 border-b border-slate-200 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            Clear selection
          </button>
        </div>
      )}
      {patient && (
        <div className="shrink-0 px-5 py-4 border-b border-slate-200 bg-slate-50">
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
              aria-label="Clear selection"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {chipsEnabled && (
        <div className="shrink-0 px-5 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Keywords
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                <span className="tabular-nums">{keywordChips.length}</span> keywords ·{' '}
                <span className="tabular-nums">{explicitCollapsedCount}</span> hidden by you
                {!chipsExpanded && keywordChips.length > 0 && (
                  <span className="text-slate-400"> · keyword list tucked away</span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setChipsExpanded((v) => !v)}
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
                aria-expanded={chipsExpanded}
              >
                {chipsExpanded ? 'Hide keywords' : 'Show keywords'}
              </button>
              {explicitCollapsedCount > 0 && onResetAllHidden ? (
                <button
                  type="button"
                  onClick={onResetAllHidden}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Reset all
                </button>
              ) : null}
            </div>
          </div>
          {chipsExpanded ? (
            <>
              <p className="text-[11px] text-slate-500 mb-2.5">
                Only the chip you click is dimmed. It removes that subtree from the dendrogram; other keyword chips
                keep their styling until you toggle them individually.
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-[min(280px,42vh)] overflow-y-auto pb-1">
                {keywordChips.map((chip) => {
                  const userCollapsedThis = Boolean(hiddenSubtreeRootIds?.has(chip.id))
                  const abbreviated = chipTypeAbbrev(chip.type)
                  const label = `${chip.label}: ${
                    userCollapsedThis ? 'collapsed — click to expand this branch again' : 'expanded — click to hide this branch'
                  }`
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      role="switch"
                      aria-checked={!userCollapsedThis}
                      aria-label={label}
                      onClick={() => onToggleNodeVisibility?.(chip)}
                      title={
                        hiddenSubtreeRootIds?.has(chip.id)
                          ? 'Undo collapse for this node'
                          : 'Collapse this node and its subtree on the dendrogram'
                      }
                      className={`flex max-w-[min(260px,100%)] items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-left text-[11px] font-medium leading-snug transition-all ${
                        userCollapsedThis
                          ? 'border-slate-300 bg-slate-100 text-slate-600 opacity-[0.82] grayscale-[0.25] hover:bg-slate-200/70'
                          : 'border-emerald-200 bg-white text-slate-800 shadow-sm ring-1 ring-emerald-100 hover:border-emerald-400 hover:bg-emerald-50/40'
                      }`}
                    >
                      <span className="shrink-0 tabular-nums rounded bg-slate-200/70 px-1 py-px text-[9px] font-semibold uppercase text-slate-600">
                        {abbreviated}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{chip.label}</span>
                    </button>
                  )
                })}
              </div>
            </>
          ) : null}
        </div>
      )}

      <div className="shrink-0 px-5 py-3 border-b border-slate-100 bg-white">
        {selectedNode ? (
          <>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">{selectedNode.type}</p>
            <h3 className="text-base font-semibold text-slate-900 leading-snug">{selectedNode.label}</h3>
            {selectedNode.taxonomyPath !== 'root' && (
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono truncate">{selectedNode.taxonomyPath}</p>
            )}
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-slate-700">No node selected</p>
            <p className="text-xs text-slate-500 mt-1">
              Click any circle on the tree for details & PubMed (green leaves).
            </p>
          </>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
        {!selectedNode ? null : !isLeaf ? (
          <div className="text-sm text-slate-500">
            This is a taxonomy category. Select a specific extracted keyword (green leaf) to load PubMed
            literature.
          </div>
        ) : null}

        {selectedNode && isLeaf && loading && (
          <div className="text-sm text-slate-500">Loading PubMed…</div>
        )}

        {selectedNode && isLeaf && !loading && error && (
          <div className="text-sm text-rose-600">PubMed lookup failed: {error}</div>
        )}

        {selectedNode && isLeaf && !loading && !error && papers.length === 0 && (
          <div className="text-sm text-slate-500">No cached PubMed papers for this keyword yet.</div>
        )}

        {selectedNode && isLeaf && !loading && papers.length > 0 && (
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
