import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowUp,
  BookOpen,
  ExternalLink,
  FileText,
  Maximize2,
  Minus,
  Plus,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'
import type { Patient } from '../lib/patients'
import type { TreeNode, TreeNodeType } from '../lib/treeTaxonomy'
import { flattenKeywordTreeChipNodes } from '../lib/treeTaxonomy'
import { fetchPubmed, type PubmedPaper } from '../lib/api'
import { postClinicalChat, resolveClinicalPatientId } from '../lib/clinicalIntelligence'

type LayoutNode = TreeNode & { x: number; y: number; depth: number; width: number }
type LayoutEdge = { from: LayoutNode; to: LayoutNode }
type Transform = { x: number; y: number; k: number }
type ClinicalMessage = { id: string; role: 'user' | 'assistant'; content: string }
type LiteraturePaper = PubmedPaper & { keywordNodeId: string; keywordLabel: string }

interface InfiniteKeywordCanvasViewProps {
  tree: TreeNode
  patient: Patient | null
  selectedNode: TreeNode | null
  hoveredNodeId?: string | null
  dimmedNodeIds?: ReadonlySet<string>
  viewportVisibleNodeIds?: ReadonlySet<string> | null
  interactionIdleTick: number
  onSelectNode: (node: TreeNode | null) => void
  onNodeHover?: (node: TreeNode | null) => void
  onInteractionIdle?: (visibleIds: Set<string>) => void
  onVisibleNodeIdsChange?: (visibleIds: Set<string>) => void
  onToggleDimmedKeyword?: (node: TreeNode) => void
  onResetDimmedKeywords?: () => void
  onOpenChart?: () => void
  onSelectPatient?: () => void
  onOpenNews?: () => void
}

const COLUMN_GAP = 92
const ROW_GAP = 62
const LEFT_PANEL = 390
const RIGHT_PANEL = 400
const BOTTOM_PANEL = 84

function cloneTree(node: TreeNode): TreeNode {
  return { ...node, children: node.children?.map(cloneTree) }
}

function buildVisibleTree(node: TreeNode, expandedIds: ReadonlySet<string>): TreeNode {
  const visible: TreeNode = { ...node }
  if (node.children?.length && expandedIds.has(node.id)) {
    visible.children = node.children.map((child) => buildVisibleTree(child, expandedIds))
  } else {
    visible.children = undefined
  }
  return visible
}

function collectDescendantIds(node: TreeNode): string[] {
  const ids: string[] = []
  function walk(current: TreeNode) {
    for (const child of current.children ?? []) {
      ids.push(child.id)
      walk(child)
    }
  }
  walk(node)
  return ids
}

function containsNodeId(node: TreeNode, id: string): boolean {
  if (node.id === id) return true
  return node.children?.some((child) => containsNodeId(child, id)) ?? false
}

function estimateNodeWidth(node: TreeNode): number {
  const badgeWidth = node.type === 'patient' ? 18 : 42
  const dotWidth = 18
  const horizontalPadding = 32
  const textWidth = node.label.length * 7.2
  return Math.min(Math.max(textWidth + badgeWidth + dotWidth + horizontalPadding, 118), 360)
}

function layoutTree(root: TreeNode): { nodes: LayoutNode[]; edges: LayoutEdge[]; bounds: Bounds } {
  const working = cloneTree(root) as LayoutNode
  let yCursor = 0

  function assign(node: LayoutNode, depth: number): number {
    node.depth = depth
    node.width = estimateNodeWidth(node)
    if (!node.children?.length) {
      node.x = 0
      node.y = yCursor * ROW_GAP
      yCursor += 1
      return node.y
    }
    const ys = node.children.map((child) => assign(child as LayoutNode, depth + 1))
    node.x = 0
    node.y = (ys[0] + ys[ys.length - 1]) / 2
    return node.y
  }

  assign(working, 0)

  const nodes: LayoutNode[] = []
  const edges: LayoutEdge[] = []
  function walk(node: LayoutNode, parent?: LayoutNode) {
    nodes.push(node)
    if (parent) edges.push({ from: parent, to: node })
    node.children?.forEach((child) => walk(child as LayoutNode, node))
  }
  walk(working)

  const maxWidthByDepth = new Map<number, number>()
  for (const node of nodes) {
    maxWidthByDepth.set(node.depth, Math.max(maxWidthByDepth.get(node.depth) ?? 0, node.width))
  }
  const maxDepth = Math.max(...nodes.map((node) => node.depth))
  const xByDepth = new Map<number, number>()
  let cursorX = 0
  for (let depth = 0; depth <= maxDepth; depth += 1) {
    const width = maxWidthByDepth.get(depth) ?? 0
    if (depth === 0) {
      cursorX = width / 2
    } else {
      const prevWidth = maxWidthByDepth.get(depth - 1) ?? 0
      cursorX += prevWidth / 2 + COLUMN_GAP + width / 2
    }
    xByDepth.set(depth, cursorX)
  }
  for (const node of nodes) {
    node.x = xByDepth.get(node.depth) ?? 0
  }

  const lefts = nodes.map((n) => n.x - n.width / 2)
  const rights = nodes.map((n) => n.x + n.width / 2)
  const ys = nodes.map((n) => n.y)
  return {
    nodes,
    edges,
    bounds: {
      minX: Math.min(...lefts) - 120,
      maxX: Math.max(...rights) + 160,
      minY: Math.min(...ys) - 80,
      maxY: Math.max(...ys) + 80,
    },
  }
}

interface Bounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

function nodeTypeLabel(type: TreeNodeType): string {
  if (type === 'patient') return ''
  if (type === 'branch') return 'SEC'
  if (type === 'category') return 'CAT'
  if (type === 'subcategory') return 'SUB'
  return 'KW'
}

function nodeTypeTone(type: TreeNodeType): string {
  if (type === 'patient') return 'bg-violet-600 text-white shadow-violet-200'
  if (type === 'branch') return 'bg-amber-100 text-amber-800 border-amber-200'
  if (type === 'category') return 'bg-blue-100 text-blue-800 border-blue-200'
  if (type === 'subcategory') return 'bg-sky-100 text-sky-800 border-sky-200'
  return 'bg-emerald-100 text-emerald-800 border-emerald-200'
}

function countLeaves(node: TreeNode): number {
  if (node.type === 'leaf') return 1
  return node.children?.reduce((sum, child) => sum + countLeaves(child), 0) ?? 0
}

function collectPathIds(root: TreeNode, targetId: string | null | undefined): Set<string> {
  if (!targetId) return new Set()
  const path: string[] = []
  function find(node: TreeNode, trail: string[]): boolean {
    if (node.id === targetId) {
      path.push(...trail, node.id)
      return true
    }
    for (const child of node.children ?? []) {
      if (find(child, [...trail, node.id])) return true
    }
    return false
  }
  find(root, [])
  return new Set(path)
}

async function fetchFullPubmedAbstract(pmid: string): Promise<string | null> {
  if (!/^\d+$/.test(pmid)) return null
  const params = new URLSearchParams({ db: 'pubmed', id: pmid, retmode: 'xml' })
  const res = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?${params}`)
  if (!res.ok) return null
  const xml = new DOMParser().parseFromString(await res.text(), 'text/xml')
  const paragraphs = Array.from(xml.querySelectorAll('AbstractText'))
    .map((node) => {
      const text = node.textContent?.replace(/\s+/g, ' ').trim()
      if (!text) return ''
      const label = node.getAttribute('Label') || node.getAttribute('NlmCategory')
      return label ? `${label}: ${text}` : text
    })
    .filter(Boolean)
  return paragraphs.length > 0 ? paragraphs.join('\n\n') : null
}

function renderArticleParagraph(text: string) {
  const match = /^([A-Z][A-Z\s/-]{2,}:)\s*(.*)$/.exec(text)
  if (!match) return text
  return (
    <>
      <strong className="font-bold text-slate-900">{match[1]}</strong>
      {match[2] ? ` ${match[2]}` : ''}
    </>
  )
}

function Minimap({
  nodes,
  bounds,
  transform,
  activeId,
}: {
  nodes: LayoutNode[]
  bounds: Bounds
  transform: Transform
  activeId?: string | null
}) {
  const width = 164
  const height = 104
  const treeW = Math.max(bounds.maxX - bounds.minX, 1)
  const treeH = Math.max(bounds.maxY - bounds.minY, 1)
  const scale = Math.min(width / treeW, height / treeH)
  const offX = (width - treeW * scale) / 2
  const offY = (height - treeH * scale) / 2
  const project = (x: number, y: number) => [
    (x - bounds.minX) * scale + offX,
    (y - bounds.minY) * scale + offY,
  ]

  return (
    <div className="absolute bottom-5 left-5 z-20 h-[120px] w-[180px] rounded-xl border border-black/10 bg-white/85 p-2 shadow-lg backdrop-blur-xl">
      <svg className="h-full w-full" viewBox={`0 0 ${width} ${height}`} aria-hidden>
        {nodes.map((node) => {
          const [x, y] = project(node.x, node.y)
          return (
            <circle
              key={node.id}
              cx={x}
              cy={y}
              r={node.id === activeId ? 2.4 : 1.3}
              className={node.id === activeId ? 'fill-violet-600' : 'fill-slate-400'}
            />
          )
        })}
        <rect
          x={Math.max(0, (-transform.x / transform.k - bounds.minX) * scale + offX)}
          y={Math.max(0, (-transform.y / transform.k - bounds.minY) * scale + offY)}
          width={Math.min(width, 220 / transform.k)}
          height={Math.min(height, 140 / transform.k)}
          className="fill-violet-500/10 stroke-violet-600"
          strokeWidth={1}
        />
      </svg>
    </div>
  )
}

export default function InfiniteKeywordCanvasView({
  tree,
  patient,
  selectedNode,
  hoveredNodeId,
  dimmedNodeIds,
  viewportVisibleNodeIds,
  onSelectNode,
  onNodeHover,
  onInteractionIdle,
  onVisibleNodeIdsChange,
  onToggleDimmedKeyword,
  onResetDimmedKeywords,
  onOpenChart,
  onSelectPatient,
  onOpenNews,
}: InfiniteKeywordCanvasViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)
  const lastVisibleSigRef = useRef('')
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoFitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 })
  const [dragging, setDragging] = useState(false)
  const [autoFitting, setAutoFitting] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())
  const [readerPaper, setReaderPaper] = useState<LiteraturePaper | null>(null)
  const [readerOpen, setReaderOpen] = useState(false)
  const [readerAbstract, setReaderAbstract] = useState<string | null>(null)
  const [readerAbstractLoading, setReaderAbstractLoading] = useState(false)
  const [papers, setPapers] = useState<LiteraturePaper[]>([])
  const [papersLoading, setPapersLoading] = useState(false)
  const [papersError, setPapersError] = useState<string | null>(null)
  const [literatureKeywordFilterId, setLiteratureKeywordFilterId] = useState<string | null>(null)
  const [literatureKeywordPickerOpen, setLiteratureKeywordPickerOpen] = useState(false)
  const [clinicalMessages, setClinicalMessages] = useState<ClinicalMessage[]>([])
  const [clinicalDraft, setClinicalDraft] = useState('')
  const [clinicalSending, setClinicalSending] = useState(false)
  const [clinicalSelectedIds, setClinicalSelectedIds] = useState<Set<string>>(() => new Set())

  const visibleTree = useMemo(() => buildVisibleTree(tree, expandedIds), [expandedIds, tree])
  const layout = useMemo(() => layoutTree(visibleTree), [visibleTree])
  const nodeIndex = useMemo(() => new Map(layout.nodes.map((node) => [node.id, node])), [layout.nodes])
  const sourceNodeIndex = useMemo(() => {
    const map = new Map<string, TreeNode>()
    function walk(node: TreeNode) {
      map.set(node.id, node)
      node.children?.forEach(walk)
    }
    walk(tree)
    return map
  }, [tree])
  const keywordChips = useMemo(
    () =>
      flattenKeywordTreeChipNodes(tree).sort((a, b) =>
        a.taxonomyPath.localeCompare(b.taxonomyPath, undefined, { sensitivity: 'base' }),
      ),
    [tree],
  )

  const visibleChips = useMemo(() => {
    if (!viewportVisibleNodeIds) return keywordChips
    return keywordChips.filter((chip) => viewportVisibleNodeIds.has(chip.id))
  }, [keywordChips, viewportVisibleNodeIds])
  const selectedClinicalNodes = useMemo(
    () =>
      [...clinicalSelectedIds]
        .map((id) => sourceNodeIndex.get(id))
        .filter((node): node is TreeNode => Boolean(node)),
    [clinicalSelectedIds, sourceNodeIndex],
  )
  const clinicalSelectionSig = useMemo(
    () => selectedClinicalNodes.map((node) => node.id).sort().join('\x1e'),
    [selectedClinicalNodes],
  )
  const selectedKeywordNodes = useMemo(
    () => selectedClinicalNodes.filter((node) => node.type === 'leaf'),
    [selectedClinicalNodes],
  )
  const activePath = useMemo(() => {
    const ids = selectedClinicalNodes.length > 0
      ? selectedClinicalNodes.map((node) => node.id)
      : selectedNode
        ? [selectedNode.id]
        : []
    const path = new Set<string>()
    for (const id of ids) {
      collectPathIds(visibleTree, id).forEach((pathId) => path.add(pathId))
    }
    return path
  }, [selectedClinicalNodes, selectedNode, visibleTree])

  const beginAutoFitTransition = useCallback(() => {
    setAutoFitting(true)
    if (autoFitTimerRef.current) clearTimeout(autoFitTimerRef.current)
    autoFitTimerRef.current = setTimeout(() => setAutoFitting(false), 360)
  }, [])

  const fitToView = useCallback((options?: { forceZoom?: boolean }) => {
    const c = containerRef.current
    if (!c) return
    const w = c.clientWidth
    const h = c.clientHeight
    const treeW = layout.bounds.maxX - layout.bounds.minX
    const treeH = layout.bounds.maxY - layout.bounds.minY
    const availW = Math.max(w - LEFT_PANEL - RIGHT_PANEL, 320)
    const availH = Math.max(h - BOTTOM_PANEL, 320)
    const fitK = layout.nodes.length === 1 ? 2.5 : Math.min(Math.max(0.32, Math.min(availW / treeW, availH / treeH)), 2.5)
    const centerX = LEFT_PANEL + availW / 2
    const centerY = availH / 2
    beginAutoFitTransition()
    setTransform((current) => {
      const k =
        layout.nodes.length === 1 || options?.forceZoom
          ? fitK
          : Math.min(current.k, fitK)
      return {
        x: centerX - (treeW * k) / 2 - layout.bounds.minX * k,
        y: centerY - (treeH * k) / 2 - layout.bounds.minY * k,
        k,
      }
    })
  }, [beginAutoFitTransition, layout.bounds, layout.nodes.length])

  useEffect(() => {
    fitToView({ forceZoom: false })
  }, [fitToView])

  useEffect(() => {
    const handleResize = () => fitToView({ forceZoom: false })
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [fitToView])

  useEffect(() => {
    setExpandedIds(new Set())
    setClinicalSelectedIds(new Set())
    onSelectNode(null)
  }, [onSelectNode, tree])

  useEffect(() => {
    if (!selectedNode) return
    if (!nodeIndex.has(selectedNode.id)) {
      onSelectNode(null)
    }
  }, [nodeIndex, onSelectNode, selectedNode])

  const measureVisible = useCallback(
    (nextTransform: Transform) => {
      const c = containerRef.current
      if (!c) return
      const { width, height } = c.getBoundingClientRect()
      const visible = new Set<string>()
      for (const node of layout.nodes) {
        const sx = node.x * nextTransform.k + nextTransform.x
        const sy = node.y * nextTransform.k + nextTransform.y
        if (sx >= 0 && sx <= width && sy >= 0 && sy <= height) {
          visible.add(node.id)
        }
      }
      const sig = [...visible].sort().join('\x1e')
      if (sig !== lastVisibleSigRef.current) {
        lastVisibleSigRef.current = sig
        onVisibleNodeIdsChange?.(new Set(visible))
      }
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(() => onInteractionIdle?.(new Set(visible)), 650)
    },
    [layout.nodes, onInteractionIdle, onVisibleNodeIdsChange],
  )

  useEffect(() => {
    measureVisible(transform)
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [measureVisible, transform])

  useEffect(() => {
    if (selectedKeywordNodes.length === 0) {
      setPapers([])
      setPapersError(null)
      setPapersLoading(false)
      setLiteratureKeywordFilterId(null)
      setLiteratureKeywordPickerOpen(false)
      return
    }
    setLiteratureKeywordFilterId((current) =>
      current && selectedKeywordNodes.some((node) => node.id === current) ? current : null,
    )
    let cancelled = false
    setPapersLoading(true)
    setPapersError(null)
    Promise.allSettled(
      selectedKeywordNodes.map(async (node) => {
        const nodePapers = await fetchPubmed(node.id, { keywordLabel: node.label })
        return nodePapers.map((paper) => ({
          ...paper,
          keywordNodeId: node.id,
          keywordLabel: node.label,
        }))
      }),
    )
      .then((results) => {
        if (cancelled) return
        const fulfilled = results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
        setPapers(fulfilled)
        const rejectedCount = results.filter((result) => result.status === 'rejected').length
        setPapersError(rejectedCount === results.length ? 'PubMed lookup failed' : null)
      })
      .finally(() => {
        if (!cancelled) setPapersLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedKeywordNodes])

  useEffect(() => {
    setClinicalMessages([])
    setClinicalDraft('')
    setClinicalSending(false)
  }, [clinicalSelectionSig])

  const handleClinicalSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const query = clinicalDraft.trim()
      if (!query || selectedClinicalNodes.length === 0 || clinicalSending) return

      const userMessage: ClinicalMessage = {
        id: `ci-user-${Date.now()}`,
        role: 'user',
        content: query,
      }
      setClinicalMessages((prev) => [...prev, userMessage])
      setClinicalDraft('')
      setClinicalSending(true)

      const clinicalPatientId = patient ? resolveClinicalPatientId(patient.id) : null
      if (clinicalPatientId === null) {
        setClinicalMessages((prev) => [
          ...prev,
          {
            id: `ci-assistant-${Date.now()}`,
            role: 'assistant',
            content: 'Clinical Intelligence is not configured for this patient id.',
          },
        ])
        setClinicalSending(false)
        return
      }

      const nodeContext = selectedClinicalNodes
        .map((node, index) => `${index + 1}. ${node.label}; type: ${node.type}; taxonomy path: ${node.taxonomyPath}`)
        .join('\n')
      const enrichedQuery = `${query}\n\n[Selected node context:\n${nodeContext}]`
      try {
        const res = await postClinicalChat({
          patient_id: clinicalPatientId,
          user_query: enrichedQuery,
        })
        setClinicalMessages((prev) => [
          ...prev,
          {
            id: `ci-assistant-${Date.now()}`,
            role: 'assistant',
            content: res.ai_analysis,
          },
        ])
      } catch {
        setClinicalMessages((prev) => [
          ...prev,
          {
            id: `ci-assistant-${Date.now()}`,
            role: 'assistant',
            content: 'Could not reach Clinical Intelligence. Try again in a moment.',
          },
        ])
      } finally {
        setClinicalSending(false)
      }
    },
    [clinicalDraft, clinicalSending, patient, selectedClinicalNodes],
  )

  useEffect(() => {
    if (!readerPaper) {
      setReaderAbstract(null)
      setReaderAbstractLoading(false)
      return
    }
    let cancelled = false
    setReaderAbstract(readerPaper.abstract || null)
    setReaderAbstractLoading(true)
    fetchFullPubmedAbstract(readerPaper.pmid)
      .then((fullAbstract) => {
        if (!cancelled && fullAbstract) setReaderAbstract(fullAbstract)
      })
      .catch(() => {
        // Keep the cached API abstract when PubMed's public endpoint is unavailable.
      })
      .finally(() => {
        if (!cancelled) setReaderAbstractLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [readerPaper])

  const openReader = useCallback((paper: LiteraturePaper) => {
    setReaderPaper(paper)
    window.setTimeout(() => setReaderOpen(true), 0)
  }, [])

  const closeReader = useCallback(() => {
    setReaderOpen(false)
    window.setTimeout(() => setReaderPaper(null), 300)
  }, [])

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
      if (autoFitTimerRef.current) clearTimeout(autoFitTimerRef.current)
    }
  }, [])

  const focusNode = useCallback(
    (nodeId: string) => {
      const node = nodeIndex.get(nodeId)
      const c = containerRef.current
      if (!node || !c) return
      const k = Math.max(transform.k, 0.86)
      setTransform({
        k,
        x: c.clientWidth / 2 - node.x * k - 140,
        y: c.clientHeight / 2 - node.y * k,
      })
    },
    [nodeIndex, transform.k],
  )

  const handleSelectNode = useCallback(
    (node: LayoutNode, shiftKey = false) => {
      const sourceNode = sourceNodeIndex.get(node.id) ?? node
      if (shiftKey) {
        setClinicalSelectedIds((prev) => {
          const next = new Set(prev)
          if (next.has(sourceNode.id)) {
            next.delete(sourceNode.id)
            if (selectedNode?.id === sourceNode.id) {
              const fallbackId = [...next][0]
              onSelectNode(fallbackId ? sourceNodeIndex.get(fallbackId) ?? null : null)
            }
          } else {
            next.add(sourceNode.id)
            if (node.type !== 'patient') onSelectNode(sourceNode)
          }
          return next
        })
        return
      }

      const hasChildren = Boolean(sourceNode.children?.length)
      if (hasChildren) {
        const closing = expandedIds.has(node.id)
        setExpandedIds((prev) => {
          const next = new Set(prev)
          if (closing) {
            next.delete(node.id)
            for (const descendantId of collectDescendantIds(sourceNode)) {
              next.delete(descendantId)
            }
          } else {
            next.add(node.id)
          }
          return next
        })
        if (closing && selectedNode && selectedNode.id !== node.id && containsNodeId(sourceNode, selectedNode.id)) {
          onSelectNode(node.type === 'patient' ? null : sourceNode)
        }
      }
      if (node.type === 'patient') {
        setClinicalSelectedIds(new Set([sourceNode.id]))
        if (!hasChildren) onSelectNode(null)
        return
      }
      onSelectNode(sourceNode)
      setClinicalSelectedIds(new Set([sourceNode.id]))
      focusNode(node.id)
    },
    [expandedIds, focusNode, onSelectNode, selectedNode?.id, sourceNodeIndex],
  )

  const emitHover = useCallback(
    (node: TreeNode | null) => {
      if (!onNodeHover) return
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = setTimeout(() => onNodeHover(node), node ? 180 : 120)
    },
    [onNodeHover],
  )

  const zoomBy = useCallback((factor: number) => {
    const c = containerRef.current
    if (!c) return
    beginAutoFitTransition()
    const cx = c.clientWidth / 2
    const cy = c.clientHeight / 2
    setTransform((t) => {
      const k = Math.min(2.5, Math.max(0.25, t.k * factor))
      const realFactor = k / t.k
      return {
        k,
        x: cx - (cx - t.x) * realFactor,
        y: cy - (cy - t.y) * realFactor,
      }
    })
  }, [beginAutoFitTransition])

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setAutoFitting(false)
    const c = containerRef.current
    if (!c) return
    const rect = c.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08
    setTransform((t) => {
      const k = Math.min(2.5, Math.max(0.25, t.k * factor))
      const realFactor = k / t.k
      return {
        k,
        x: px - (px - t.x) * realFactor,
        y: py - (py - t.y) * realFactor,
      }
    })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setAutoFitting(false)
    setDragging(true)
    dragRef.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y }
  }

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => {
      const drag = dragRef.current
      if (!drag) return
      setTransform((t) => ({
        ...t,
        x: drag.tx + e.clientX - drag.x,
        y: drag.ty + e.clientY - drag.y,
      }))
    }
    const onUp = () => {
      setDragging(false)
      dragRef.current = null
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragging])

  const activeLiterature = literatureKeywordFilterId
    ? papers.filter((paper) => paper.keywordNodeId === literatureKeywordFilterId)
    : papers
  const allLeavesCount = countLeaves(tree)
  const dimmedCount = dimmedNodeIds?.size ?? 0

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-[#f7f6f3] text-slate-950">
      <div
        ref={containerRef}
        className={`absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,#fbfaf6_0%,#f4f2ec_60%,#ecead1_100%)] ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        <div
          className="pointer-events-none absolute inset-[-2000px] opacity-80"
          style={{
            backgroundImage: 'radial-gradient(rgba(20,20,20,0.08) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            transform: `translate(${transform.x % 24}px, ${transform.y % 24}px)`,
          }}
        />
        <div
          className={`absolute inset-0 origin-top-left will-change-transform ${
            autoFitting && !dragging ? 'transition-transform duration-300 ease-out' : ''
          }`}
          style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})` }}
        >
          <svg
            className="pointer-events-none absolute"
            style={{
              left: layout.bounds.minX - 80,
              top: layout.bounds.minY - 80,
              width: layout.bounds.maxX - layout.bounds.minX + 160,
              height: layout.bounds.maxY - layout.bounds.minY + 160,
            }}
            viewBox={`${layout.bounds.minX - 80} ${layout.bounds.minY - 80} ${
              layout.bounds.maxX - layout.bounds.minX + 160
            } ${layout.bounds.maxY - layout.bounds.minY + 160}`}
            aria-hidden
          >
            {layout.edges.map((edge) => {
              const x1 = edge.from.x + edge.from.width / 2
              const y1 = edge.from.y
              const x2 = edge.to.x - edge.to.width / 2
              const y2 = edge.to.y
              const midX = (x1 + x2) / 2
              const active = activePath.has(edge.from.id) && activePath.has(edge.to.id)
              return (
                <path
                  key={`${edge.from.id}-${edge.to.id}`}
                  d={`M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`}
                  fill="none"
                  stroke={active ? '#6d4cf2' : 'rgba(20,20,20,0.16)'}
                  strokeWidth={active ? 1.8 : 1.25}
                />
              )
            })}
          </svg>

          {layout.nodes.map((node) => {
            const selected = node.id === selectedNode?.id
            const clinicalSelected = clinicalSelectedIds.has(node.id)
            const dimmed = dimmedNodeIds?.has(node.id) ?? false
            return (
              <button
                key={node.id}
                type="button"
                className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-full border bg-white px-3.5 py-2 text-[13px] font-medium shadow-sm transition ${
                  selected || clinicalSelected
                    ? 'border-violet-600 ring-4 ring-violet-500/15'
                    : hoveredNodeId === node.id
                      ? 'border-violet-300 shadow-md'
                      : 'border-black/10'
                } ${dimmed ? 'opacity-45 grayscale' : 'opacity-100'}`}
                style={{ left: node.x, top: node.y, width: node.width }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelectNode(node, e.shiftKey)
                }}
                onMouseEnter={() => emitHover(node)}
                onMouseLeave={() => emitHover(null)}
              >
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${nodeTypeTone(node.type)}`} />
                {nodeTypeLabel(node.type) ? (
                  <span className={`rounded px-1.5 py-0.5 font-mono text-[9.5px] font-semibold ${nodeTypeTone(node.type)}`}>
                    {nodeTypeLabel(node.type)}
                  </span>
                ) : null}
                <span className={`min-w-0 flex-1 truncate text-left ${dimmed ? 'line-through' : ''}`}>{node.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <aside className="absolute left-5 top-[84px] z-20 flex h-[min(540px,calc(100%_-_104px))] w-[380px] flex-col overflow-hidden rounded-[20px] border border-black/10 bg-white/85 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 shadow-[0_0_0_4px_#ece6ff]">
            <Sparkles className="h-4 w-4 animate-pulse text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold">Clinical Intelligence</p>
            <p className="truncate text-sm text-slate-500">
              {selectedClinicalNodes.length > 0
                ? `${selectedClinicalNodes.length} selected node${selectedClinicalNodes.length === 1 ? '' : 's'}`
                : 'Click a node to view context'}
            </p>
          </div>
          <Maximize2 className="h-4 w-4 text-slate-400" />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {selectedClinicalNodes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm leading-relaxed text-slate-500">
              Select a node on the canvas to ask Clinical Intelligence about it. Hold Shift while clicking to select multiple nodes.
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-col gap-4">
              <div className="rounded-2xl bg-violet-50 p-4 ring-1 ring-violet-100">
                <p className="mb-2 font-mono text-[12px] font-semibold uppercase tracking-wide text-violet-600">
                  Selected Node{selectedClinicalNodes.length === 1 ? '' : 's'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedClinicalNodes.map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => {
                        setClinicalSelectedIds((prev) => {
                          const next = new Set(prev)
                          next.delete(node.id)
                          return next
                        })
                      }}
                      className="inline-flex max-w-full items-center gap-2 rounded-full border border-violet-200 bg-white py-1.5 pl-1.5 pr-3 text-left text-[15px] font-medium text-slate-900 transition hover:border-violet-400"
                      title="Click to remove from Clinical Intelligence selection"
                    >
                      <span className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold ${nodeTypeTone(node.type)}`}>
                        {nodeTypeLabel(node.type) || 'PT'}
                      </span>
                      <span className="truncate">{node.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                {clinicalMessages.length === 0 ? (
                  <p className="rounded-2xl bg-white/70 p-3 text-sm leading-relaxed text-slate-500">
                    Ask a question about this selected node.
                  </p>
                ) : (
                  clinicalMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        message.role === 'user'
                          ? 'ml-8 bg-violet-600 text-white'
                          : 'mr-8 bg-white text-slate-700 ring-1 ring-slate-100'
                      }`}
                    >
                      {message.content}
                    </div>
                  ))
                )}
                {clinicalSending ? (
                  <p className="mr-8 rounded-2xl bg-white px-3 py-2 text-sm text-slate-400 ring-1 ring-slate-100">
                    Thinking…
                  </p>
                ) : null}
              </div>

              <form onSubmit={handleClinicalSubmit} className="flex shrink-0 items-center gap-2 border-t border-slate-100 pt-3">
                <input
                  type="text"
                  value={clinicalDraft}
                  onChange={(e) => setClinicalDraft(e.target.value)}
                  disabled={clinicalSending}
                  placeholder={
                    selectedClinicalNodes.length === 1
                      ? `Ask about ${selectedClinicalNodes[0].label.slice(0, 28)}${selectedClinicalNodes[0].label.length > 28 ? '…' : ''}`
                      : `Ask about ${selectedClinicalNodes.length} selected nodes…`
                  }
                  className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={clinicalSending || !clinicalDraft.trim()}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white transition hover:bg-violet-700 disabled:bg-slate-300"
                  aria-label="Ask Clinical Intelligence"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>

      <div
        role="button"
        tabIndex={0}
        onClick={onOpenChart}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onOpenChart?.()
          }
        }}
        className="absolute right-5 top-5 z-20 w-[380px] rounded-[20px] border border-black/10 bg-white/85 p-4 text-left shadow-2xl backdrop-blur-xl transition hover:border-violet-200 hover:bg-white/95"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-300 text-base font-semibold text-white">
            {patient?.name.split(' ').map((n) => n[0]).join('').slice(0, 2) ?? 'PT'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold">{patient?.name ?? tree.label}</p>
            <p className="truncate text-sm text-slate-500">
              {patient ? `${patient.age}yo ${patient.gender} · MRN ${patient.mrn}` : 'No patient selected'}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-end justify-between gap-3">
          {patient?.diagnoses[0] ? (
            <span className="inline-flex min-w-0 rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-900">
              <span className="truncate">{patient.diagnoses[0]}</span>
            </span>
          ) : (
            <span />
          )}
          {onSelectPatient ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onSelectPatient()
              }}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700"
            >
              <UserRound className="h-3.5 w-3.5" />
              Change Patient
            </button>
          ) : null}
        </div>
      </div>

      <aside className="absolute right-5 top-[184px] z-20 flex max-h-[min(360px,calc(100%_-_705px))] min-h-[160px] w-[380px] flex-col overflow-hidden rounded-[20px] border border-black/10 bg-white/85 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <p className="flex-1 text-[13px] font-semibold uppercase tracking-wide text-slate-400">Keywords</p>
          {dimmedCount > 0 ? (
            <button type="button" onClick={onResetDimmedKeywords} className="text-sm font-medium text-violet-700">
              Clear
            </button>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="mb-3 flex gap-3 text-[13px] text-slate-500">
            <span>
              <b className="text-slate-900">{visibleChips.length}</b> in view
            </span>
            <span>
              <b className="text-slate-900">{allLeavesCount}</b> leaves
            </span>
            <span>
              <b className="text-slate-900">{dimmedCount}</b> Disabled
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {visibleChips.map((chip) => {
              const dimmed = dimmedNodeIds?.has(chip.id) ?? false
              return (
                <button
                  key={chip.id}
                  type="button"
                  className={`inline-flex max-w-full items-center gap-1.5 rounded-full border bg-white py-1 pl-1 pr-2.5 text-left text-[13.5px] transition hover:border-violet-400 hover:text-violet-700 ${
                    dimmed ? 'opacity-45 line-through' : ''
                  }`}
                  onClick={() => {
                    onToggleDimmedKeyword?.(chip)
                  }}
                  title={dimmed ? `${chip.label} - click to re-enable` : `${chip.label} - click to disable`}
                >
                  <span className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold ${nodeTypeTone(chip.type)}`}>
                    {nodeTypeLabel(chip.type)}
                  </span>
                  <span className="truncate">{chip.label}</span>
                </button>
              )
            })}
            {visibleChips.length === 0 ? (
              <p className="text-[13.5px] text-slate-500">Open a node to bring keywords into view.</p>
            ) : null}
          </div>
        </div>
      </aside>

      <aside className="absolute bottom-5 right-5 z-20 flex h-[min(502px,calc(100%_-_280px))] w-[380px] flex-col overflow-hidden rounded-[20px] border border-black/10 bg-white/85 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <p className="flex-1 text-[13px] font-semibold uppercase tracking-wide text-slate-400">Literature</p>
          {selectedKeywordNodes.length > 1 ? (
            <button
              type="button"
              onClick={() => setLiteratureKeywordPickerOpen((open) => !open)}
              className="inline-flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-100"
              title="Choose literature keyword"
            >
              <span className="font-mono text-[10px] font-semibold leading-none">KW</span>
              <span className="text-[11px] font-semibold leading-none">+{selectedKeywordNodes.length - 1}</span>
            </button>
          ) : selectedKeywordNodes.length === 1 ? (
            <span className="inline-flex max-w-[230px] items-center gap-1.5 rounded-full border bg-white py-1 pl-1 pr-2.5 text-left text-[13.5px] text-slate-700">
              <span className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold ${nodeTypeTone(selectedKeywordNodes[0].type)}`}>
                {nodeTypeLabel(selectedKeywordNodes[0].type)}
              </span>
              <span className="truncate">{selectedKeywordNodes[0].label}</span>
            </span>
          ) : (
            <span className="text-[13px] text-slate-500">Select a keyword</span>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {selectedClinicalNodes.length === 0 ? (
            <p className="px-5 py-8 text-center text-base text-slate-500">Select one or more green keyword leaves to load literature.</p>
          ) : selectedKeywordNodes.length === 0 ? (
            <p className="px-5 py-8 text-center text-base text-slate-500">Selected nodes do not include keyword leaves.</p>
          ) : papersLoading ? (
            <p className="px-5 py-8 text-base text-slate-500">Loading PubMed…</p>
          ) : papersError ? (
            <p className="px-5 py-8 text-base text-rose-600">PubMed lookup failed: {papersError}</p>
          ) : activeLiterature.length === 0 ? (
            <p className="px-5 py-8 text-base text-slate-500">No cached PubMed papers for this keyword yet.</p>
          ) : (
            activeLiterature.map((paper) => (
              <button
                key={`${paper.keywordNodeId}-${paper.pmid}`}
                type="button"
                onClick={() => openReader(paper)}
                className="block w-full border-b border-slate-200 px-5 py-3 text-left transition hover:bg-violet-50/50"
              >
                <p className="mb-1 inline-flex max-w-full items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[12px] font-medium text-emerald-800">
                  <span className="shrink-0 font-mono text-[10px] font-semibold">KW</span>
                  <span className="truncate">{paper.keywordLabel}</span>
                </p>
                {paper.year ? (
                  <p className="mb-1 font-mono text-[12px] uppercase tracking-wide text-slate-400">{paper.year}</p>
                ) : null}
                <p className="text-[15.5px] font-medium leading-snug text-slate-950">{paper.title}</p>
                {paper.abstract ? <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-slate-500">{paper.abstract}</p> : null}
              </button>
            ))
          )}
        </div>
      </aside>

      {literatureKeywordPickerOpen && selectedKeywordNodes.length > 1 ? (
        <div className="absolute bottom-5 right-[420px] z-30 w-[320px] overflow-hidden rounded-[18px] border border-black/10 bg-white/95 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="font-mono text-[12px] font-semibold uppercase tracking-wide text-slate-400">
              Literature Keywords
            </p>
          </div>
          <div className="max-h-[360px] overflow-y-auto p-2">
            <button
              type="button"
              onClick={() => {
                setLiteratureKeywordFilterId(null)
                setLiteratureKeywordPickerOpen(false)
              }}
              className={`mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[14px] transition ${
                literatureKeywordFilterId === null ? 'bg-violet-50 text-violet-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="font-medium">All selected keywords</span>
              <span className="text-xs text-slate-400">{papers.length}</span>
            </button>
            {selectedKeywordNodes.map((node) => {
              const count = papers.filter((paper) => paper.keywordNodeId === node.id).length
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => {
                    setLiteratureKeywordFilterId(node.id)
                    setLiteratureKeywordPickerOpen(false)
                  }}
                  className={`mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[14px] transition ${
                    literatureKeywordFilterId === node.id ? 'bg-violet-50 text-violet-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10.5px] font-semibold ${nodeTypeTone(node.type)}`}>
                    KW
                  </span>
                  <span className="min-w-0 flex-1 truncate">{node.label}</span>
                  <span className="shrink-0 text-xs text-slate-400">{count}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      <Minimap nodes={layout.nodes} bounds={layout.bounds} transform={transform} activeId={selectedNode?.id} />

      <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-black/10 bg-white/85 p-1.5 shadow-lg backdrop-blur-xl">
        <button type="button" onClick={() => zoomBy(1 / 1.2)} className="rounded-full p-2 text-slate-600 hover:bg-slate-100" title="Zoom out">
          <Minus className="h-4 w-4" />
        </button>
        <span className="min-w-11 text-center font-mono text-[13px] text-slate-500">{Math.round(transform.k * 100)}%</span>
        <button type="button" onClick={() => zoomBy(1.2)} className="rounded-full p-2 text-slate-600 hover:bg-slate-100" title="Zoom in">
          <Plus className="h-4 w-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-slate-200" />
        <button type="button" onClick={() => fitToView({ forceZoom: true })} className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
          <Maximize2 className="h-3.5 w-3.5" />
          Fit
        </button>
        <button type="button" onClick={onOpenChart} className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
          <FileText className="h-3.5 w-3.5" />
          Open Chart
        </button>
        <button type="button" onClick={onSelectPatient} className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
          Select Patient
        </button>
        <button type="button" onClick={onOpenNews} className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
          <BookOpen className="h-3.5 w-3.5" />
          News Feed
        </button>
      </div>
      <div className="pointer-events-none absolute bottom-[76px] left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/70 px-3 py-1 font-mono text-[13px] tracking-wide text-slate-400">
        Drag to pan · Scroll to zoom · Click a node to focus
      </div>

      {readerPaper ? (
        <>
          <button
            type="button"
            aria-label="Close article reader"
            onClick={closeReader}
            className={`absolute inset-0 z-40 bg-black/20 transition-opacity duration-300 ${
              readerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          />
          <aside className={`absolute right-0 top-0 z-50 flex h-full w-[50vw] min-w-[480px] flex-col border-l border-black/10 bg-white shadow-2xl transition-transform duration-300 ease-out ${
            readerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
              <p className="flex-1 font-mono text-[14px] font-semibold uppercase tracking-wide text-slate-400">
                Literature
              </p>
              <a
                href={readerPaper.url}
                target="_blank"
                rel="noreferrer"
                className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
                title="Open PubMed"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <button type="button" onClick={closeReader} className="rounded p-1.5 text-slate-500 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-14 py-8">
              <p className="mb-3 font-mono text-[15px] font-semibold uppercase tracking-wide text-violet-600">
                {[readerPaper.journal, readerPaper.year].filter(Boolean).join(' · ')}
              </p>
              <h1 className="mb-6 font-serif text-4xl font-semibold leading-tight tracking-tight text-slate-950">{readerPaper.title}</h1>
              <div className="mb-8 grid grid-cols-1 gap-3 rounded-2xl bg-slate-50 p-5 text-[18px] text-slate-700">
                {readerPaper.pmid ? (
                  <div>
                    <span className="font-mono text-[15px] font-semibold uppercase tracking-wide text-slate-400">PMID</span>
                    <p className="mt-1 break-words">{readerPaper.pmid}</p>
                  </div>
                ) : null}
                {readerPaper.url ? (
                  <div>
                    <span className="font-mono text-[15px] font-semibold uppercase tracking-wide text-slate-400">Source URL</span>
                    <p className="mt-1 break-words">{readerPaper.url}</p>
                  </div>
                ) : null}
              </div>
              <h2 className="mb-3 mt-8 text-[15px] font-semibold uppercase tracking-wide text-violet-600">Abstract</h2>
              <div className="space-y-4 text-[18px] leading-8 text-slate-700">
                {readerAbstract ? (
                  readerAbstract.split(/\n{2,}/).map((paragraph, index) => (
                    <p key={index}>{renderArticleParagraph(paragraph)}</p>
                  ))
                ) : (
                  <p>No abstract is cached for this paper yet.</p>
                )}
                {readerAbstractLoading ? (
                  <p className="text-[15px] text-slate-400">Checking PubMed for the full abstract…</p>
                ) : null}
              </div>
              <div className="mt-8 flex flex-wrap gap-2 border-t border-slate-200 pt-5">
                <a
                  href={readerPaper.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-[15.5px] font-medium text-white hover:bg-blue-700"
                >
                  <BookOpen className="h-4 w-4" />
                  Read on PubMed
                </a>
              </div>
            </div>
          </aside>
        </>
      ) : null}
    </div>
  )
}
