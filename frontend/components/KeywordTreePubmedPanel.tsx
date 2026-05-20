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
  /** Taxonomy node ids currently intersecting the tree viewport (zoom/pan). `null` = not measured yet — show all chips. */
  viewportVisibleNodeIds?: ReadonlySet<string> | null
  /** User toggled keywords off visually (grey/strike); tree nodes stay rendered. */
  dimmedNodeIds?: ReadonlySet<string>
  onToggleDimmedKeyword?: (node: TreeNode) => void
  onResetDimmedKeywords?: () => void
  onClose: () => void
}

export default function KeywordTreePubmedPanel({
  patient,
  keywordTreeFull,
  selectedNode,
  viewportVisibleNodeIds,
  dimmedNodeIds,
  onToggleDimmedKeyword,
  onResetDimmedKeywords,
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

  const allKeywordChips = useMemo(() => {
    if (!keywordTreeFull) return []
    return flattenKeywordTreeChipNodes(keywordTreeFull).sort((a, b) =>
      a.taxonomyPath.localeCompare(b.taxonomyPath, undefined, { sensitivity: 'base' }),
    )
  }, [keywordTreeFull])

  const keywordChips = useMemo(() => {
    if (viewportVisibleNodeIds === null || viewportVisibleNodeIds === undefined) {
      return allKeywordChips
    }
    return allKeywordChips.filter((chip) => viewportVisibleNodeIds.has(chip.id))
  }, [allKeywordChips, viewportVisibleNodeIds])

  const chipsEnabled = Boolean(keywordTreeFull && onToggleDimmedKeyword)
  const dimmedCount = dimmedNodeIds?.size ?? 0

  const isLeaf = selectedNode?.type === 'leaf'

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 min-h-0">
      {!patient && (
        <div className="shrink-0 flex justify-end px-3 py-2 border-b border-slate-200 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="text-[14px] font-medium text-slate-600 hover:text-slate-900"
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
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-[16px]">
                  {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-[18px] text-slate-900">{patient.name}</p>
                  <p className="text-[14px] text-slate-500">
                    {patient.age}yo {patient.gender} · MRN {patient.mrn}
                  </p>
                </div>
              </div>
              {patient.diagnoses.length > 0 && (
                <p className="text-[14px] text-slate-600 mt-2">{patient.diagnoses[0]}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 text-[22px] leading-none"
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
              <p className="text-[14px] font-semibold text-slate-700 uppercase tracking-wide">
                Keywords
              </p>
              <p className="text-[13px] text-slate-500 mt-0.5">
                <span className="tabular-nums">{keywordChips.length}</span>{' '}
                {viewportVisibleNodeIds !== null && viewportVisibleNodeIds !== undefined
                  ? 'visible in view'
                  : 'keywords'}
                {viewportVisibleNodeIds !== null && viewportVisibleNodeIds !== undefined && allKeywordChips.length > 0
                  ? ` · ${allKeywordChips.length} total in tree`
                  : ''}{' '}
                · <span className="tabular-nums">{dimmedCount}</span>{' '}
                greyed/strike in tree
                {!chipsExpanded && keywordChips.length > 0 && (
                  <span className="text-slate-400"> · keyword list tucked away</span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setChipsExpanded((v) => !v)}
                className="text-[14px] font-medium text-slate-600 hover:text-slate-900"
                aria-expanded={chipsExpanded}
              >
                {chipsExpanded ? 'Hide keywords' : 'Show keywords'}
              </button>
              {dimmedCount > 0 && onResetDimmedKeywords ? (
                <button
                  type="button"
                  onClick={onResetDimmedKeywords}
                  className="text-[14px] font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Clear greyed
                </button>
              ) : null}
            </div>
          </div>
          {chipsExpanded ? (
            <>
              <p className="text-[13px] text-slate-500 mb-2.5">
                Chips follow what intersects the tree view as you zoom and pan. Click a chip to grey and strike its
                label on the tree; click again to restore.
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-[min(280px,42vh)] overflow-y-auto pb-1">
                {keywordChips.map((chip) => {
                  const dimmedInTree = Boolean(dimmedNodeIds?.has(chip.id))
                  const abbreviated = chipTypeAbbrev(chip.type)
                  const label = `${chip.label}: ${
                    dimmedInTree ? 'greyed in tree — click to highlight again' : 'normal — click to grey in tree'
                  }`
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      role="switch"
                      aria-checked={!dimmedInTree}
                      aria-label={label}
                      onClick={() => onToggleDimmedKeyword?.(chip)}
                      title={
                        dimmedInTree
                          ? 'Show this keyword normally on the tree'
                          : 'Grey and strike this keyword on the tree'
                      }
                      className={`flex max-w-[min(260px,100%)] items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-left text-[13px] font-medium leading-snug transition-all ${
                        dimmedInTree
                          ? 'border-slate-300 bg-slate-100 text-slate-600 opacity-[0.82] grayscale-[0.25] hover:bg-slate-200/70'
                          : 'border-emerald-200 bg-white text-slate-800 shadow-sm ring-1 ring-emerald-100 hover:border-emerald-400 hover:bg-emerald-50/40'
                      }`}
                    >
                      <span className="shrink-0 tabular-nums rounded bg-slate-200/70 px-1 py-px text-[11px] font-semibold uppercase text-slate-600">
                        {abbreviated}
                      </span>
                      <span
                        className={`min-w-0 flex-1 truncate ${dimmedInTree ? 'line-through text-slate-500' : ''}`}
                      >
                        {chip.label}
                      </span>
                    </button>
                  )
                })}
              </div>
              {keywordChips.length === 0 && allKeywordChips.length > 0 ? (
                <p className="text-[13px] text-slate-600 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-2 mt-2">
                  Nothing in the current dendrogram framing overlaps this panel—zoom out or pan so taxonomy nodes enter
                  the tree area.
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      )}

      <div className="shrink-0 px-5 py-3 border-b border-slate-100 bg-white">
        {selectedNode ? (
          <>
            <p className="text-[12px] uppercase tracking-wide text-slate-400">{selectedNode.type}</p>
            <h3 className="text-[18px] font-semibold text-slate-900 leading-snug">{selectedNode.label}</h3>
            {selectedNode.taxonomyPath !== 'root' && (
              <p className="text-[12px] text-slate-400 mt-0.5 font-mono truncate">{selectedNode.taxonomyPath}</p>
            )}
          </>
        ) : (
          <>
            <p className="text-[16px] font-medium text-slate-700">No node selected</p>
            <p className="text-[14px] text-slate-500 mt-1">
              Click any circle on the tree for details & PubMed (green leaves).
            </p>
          </>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
        {!selectedNode ? null : !isLeaf ? (
          <div className="text-[16px] text-slate-500">
            This is a taxonomy category. Select a specific extracted keyword (green leaf) to load PubMed
            literature.
          </div>
        ) : null}

        {selectedNode && isLeaf && loading && (
          <div className="text-[16px] text-slate-500">Loading PubMed…</div>
        )}

        {selectedNode && isLeaf && !loading && error && (
          <div className="text-[16px] text-rose-600">PubMed lookup failed: {error}</div>
        )}

        {selectedNode && isLeaf && !loading && !error && papers.length === 0 && (
          <div className="text-[16px] text-slate-500">No cached PubMed papers for this keyword yet.</div>
        )}

        {selectedNode && isLeaf && !loading && papers.length > 0 && (
          <ul className="space-y-4">
            {papers.map((paper) => (
              <li key={paper.pmid} className="border-b border-slate-100 pb-3 last:border-0">
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[16px] font-semibold text-indigo-700 hover:underline"
                >
                  {paper.title}
                </a>
                <p className="text-[14px] text-slate-500 mt-0.5">
                  {paper.journal}
                  {paper.year ? ` · ${paper.year}` : ''}
                </p>
                {paper.abstract && (
                  <p className="text-[14px] text-slate-600 mt-2 line-clamp-4">{paper.abstract}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
