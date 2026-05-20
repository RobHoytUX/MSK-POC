import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Tree, { type CustomNodeElementProps, type RawNodeDatum } from 'react-d3-tree'
import type { TreeNode, TreeNodeType } from '../lib/treeTaxonomy'

function rectsIntersect(a: DOMRectReadOnly, b: DOMRectReadOnly): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
}

/**
 * Hierarchical keyword tree rendered with react-d3-tree.
 *
 * - Patient is the root (purple).
 * - Branches (Medical History / Diagnosis) are orange.
 * - Categories / subcategories are gray.
 * - Leaves (patient-specific extracted keywords) are green and clickable.
 *
 * Click any node to open the PubMed panel via the `onNodeClick` callback.
 */

interface KeywordTreeProps {
  tree: TreeNode
  onNodeClick: (node: TreeNode) => void
  selectedNodeId?: string | null
  hoveredNodeId?: string | null
  onNodeHover?: (node: TreeNode | null) => void
  /** Fires after pan/zoom/pointer motion settles — use for viewport overview in chat. */
  onInteractionIdle?: (visibleIds: Set<string>) => void
  /** Strike / grey styling when the chip is toggled off visually (does not remove nodes). */
  dimmedNodeIds?: ReadonlySet<string>
  /** After zoom / pan / layout, ids of taxonomy nodes whose graphics intersect the viewport. */
  onVisibleNodeIdsChange?: (visibleIds: Set<string>) => void
  className?: string
}

const TYPE_STYLE: Record<TreeNodeType, { fill: string; stroke: string; r: number; textWeight: number }> = {
  patient:     { fill: '#7c3aed', stroke: '#7c3aed', r: 14, textWeight: 700 },
  branch:      { fill: '#f59e0b', stroke: '#f59e0b', r: 10, textWeight: 600 },
  /** Not pure white — reads on slate-50 / white keyword canvas backgrounds */
  category:    { fill: '#e2e8f0', stroke: '#64748b', r: 8,  textWeight: 500 },
  subcategory: { fill: '#f1f5f9', stroke: '#94a3b8', r: 6,  textWeight: 400 },
  leaf:        { fill: '#10b981', stroke: '#10b981', r: 6,  textWeight: 500 },
}

const DIMMED_ADJUST: Record<TreeNodeType, { fill: string; stroke: string }> = {
  patient:     { fill: '#c4b5fd', stroke: '#94a3b8' },
  branch:      { fill: '#fde68a', stroke: '#94a3b8' },
  category:    { fill: '#e2e8f0', stroke: '#cbd5e1' },
  subcategory: { fill: '#e2e8f0', stroke: '#cbd5e1' },
  leaf:        { fill: '#94a3b8', stroke: '#cbd5e1' },
}

interface NodeAttributes {
  type: TreeNodeType
  /** Original node id so click handlers can resolve back to the source data. */
  nodeId: string
  pubmedAvailable: 'yes' | 'no'
}

function toRawDatum(node: TreeNode): RawNodeDatum {
  return {
    name: node.label,
    attributes: {
      type: node.type,
      nodeId: node.id,
      pubmedAvailable: node.pubmedAvailable ? 'yes' : 'no',
    } satisfies NodeAttributes,
    children: node.children?.map(toRawDatum),
  }
}

const HOVER_SHOW_MS = 250
const HOVER_HIDE_MS = 150
const INTERACTION_IDLE_MS = 650

export default function KeywordTree({
  tree,
  onNodeClick,
  selectedNodeId,
  hoveredNodeId,
  onNodeHover,
  onInteractionIdle,
  dimmedNodeIds,
  onVisibleNodeIdsChange,
  className,
}: KeywordTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 80, y: 300 })
  const rafRef = useRef<number | undefined>(undefined)
  const lastEmittedSigRef = useRef('')
  const lastVisibleRef = useRef<Set<string>>(new Set())
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const nodeIndex = useMemo(() => {
    const map = new Map<string, TreeNode>()
    function walk(n: TreeNode) {
      map.set(n.id, n)
      n.children?.forEach(walk)
    }
    walk(tree)
    return map
  }, [tree])

  const data = useMemo<RawNodeDatum>(() => toRawDatum(tree), [tree])

  const scheduleInteractionIdle = useCallback(() => {
    if (!onInteractionIdle) return
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current)
    idleTimeoutRef.current = setTimeout(() => {
      idleTimeoutRef.current = null
      onInteractionIdle(new Set(lastVisibleRef.current))
    }, INTERACTION_IDLE_MS)
  }, [onInteractionIdle])

  const notifyVisibleIds = useCallback(
    (visible: Set<string>) => {
      lastVisibleRef.current = new Set(visible)
      scheduleInteractionIdle()
      if (!onVisibleNodeIdsChange) return
      const sig = [...visible].sort().join('\x1e')
      if (sig === lastEmittedSigRef.current) return
      lastEmittedSigRef.current = sig
      onVisibleNodeIdsChange(new Set(visible))
    },
    [onVisibleNodeIdsChange, scheduleInteractionIdle],
  )

  const measureViewportNodes = useCallback(() => {
    const rootEl = containerRef.current
    if (!rootEl || !onVisibleNodeIdsChange) return
    const cr = rootEl.getBoundingClientRect()
    if (cr.width < 16 || cr.height < 16) return

    const els = rootEl.querySelectorAll<SVGElement>('[data-keyword-tree-node-id]')
    const visible = new Set<string>()
    for (let i = 0; i < els.length; i++) {
      const id = els[i].getAttribute('data-keyword-tree-node-id')
      if (!id) continue
      const box = els[i].getBoundingClientRect()
      if (!box.width || !box.height) continue
      if (rectsIntersect(box, cr)) visible.add(id)
    }
    notifyVisibleIds(visible)
  }, [notifyVisibleIds, onVisibleNodeIdsChange])

  const scheduleMeasure = useCallback(() => {
    if (!onVisibleNodeIdsChange) return
    if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = undefined
      measureViewportNodes()
    })
  }, [measureViewportNodes, onVisibleNodeIdsChange])

  /** New dataset / patient resets dedupe baseline so identical layouts still emit once. */
  useEffect(() => {
    lastEmittedSigRef.current = ''
    scheduleMeasure()
  }, [data, scheduleMeasure])

  useEffect(() => {
    function recenter() {
      if (!containerRef.current) return
      const { width, height } = containerRef.current.getBoundingClientRect()
      setTranslate({ x: Math.max(80, width * 0.12), y: height / 2 })
      scheduleMeasure()
    }
    recenter()
    window.addEventListener('resize', recenter)
    return () => window.removeEventListener('resize', recenter)
  }, [scheduleMeasure])

  useLayoutEffect(() => {
    scheduleMeasure()
  }, [scheduleMeasure])

  useEffect(() => {
    const root = containerRef.current
    if (!root || !onVisibleNodeIdsChange) return
    const ro = new ResizeObserver(() => scheduleMeasure())
    ro.observe(root)
    return () => ro.disconnect()
  }, [scheduleMeasure, onVisibleNodeIdsChange])

  useEffect(() => {
    const root = containerRef.current
    if (!root || !onInteractionIdle) return
    const onPointerMove = () => scheduleInteractionIdle()
    root.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => root.removeEventListener('pointermove', onPointerMove)
  }, [onInteractionIdle, scheduleInteractionIdle])

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current)
    }
  }, [])

  const emitHover = useCallback(
    (node: TreeNode | null) => {
      if (!onNodeHover) return
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
      if (node) {
        hoverTimeoutRef.current = setTimeout(() => onNodeHover(node), HOVER_SHOW_MS)
      } else {
        hoverTimeoutRef.current = setTimeout(() => onNodeHover(null), HOVER_HIDE_MS)
      }
    },
    [onNodeHover],
  )

  const handleTreeUpdate = useCallback(() => {
    scheduleMeasure()
  }, [scheduleMeasure])

  const renderNode = useCallback(
    ({ nodeDatum, toggleNode }: CustomNodeElementProps) => {
      const attrs = (nodeDatum.attributes ?? {}) as unknown as NodeAttributes
      const type = (attrs.type ?? 'leaf') as TreeNodeType
      const base = TYPE_STYLE[type]
      const sourceId = attrs.nodeId as string
      const dimmed = dimmedNodeIds?.has(sourceId) ?? false
      const strokeFill = dimmed ? DIMMED_ADJUST[type] : { fill: base.fill, stroke: base.stroke }
      const isSelected = selectedNodeId === sourceId
      const isHovered = hoveredNodeId === sourceId

      const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        toggleNode()
        const src = nodeIndex.get(sourceId)
        if (src) onNodeClick(src)
      }

      const handleMouseEnter = () => {
        const src = nodeIndex.get(sourceId)
        if (src) emitHover(src)
      }

      const handleMouseLeave = () => {
        emitHover(null)
      }

      return (
        <g
          data-keyword-tree-node-id={sourceId}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: 'pointer', opacity: dimmed ? 0.52 : 1 }}
        >
          <circle
            r={base.r}
            fill={strokeFill.fill}
            stroke={isSelected ? '#0f172a' : isHovered ? '#6366f1' : strokeFill.stroke}
            strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 1.5}
          />
          <text
            x={base.r + 8}
            y={4}
            fontSize={type === 'patient' ? 17.5 : type === 'branch' ? 15.5 : 13.5}
            fontWeight={base.textWeight}
            fill={dimmed ? '#94a3b8' : '#0f172a'}
            style={{
              userSelect: 'none',
              paintOrder: 'stroke',
              stroke: '#ffffff',
              strokeWidth: 3,
              textDecoration: dimmed ? 'line-through' : 'none',
              textDecorationColor: '#94a3b8',
            }}
          >
            {nodeDatum.name}
          </text>
        </g>
      )
    },
    [dimmedNodeIds, emitHover, hoveredNodeId, nodeIndex, onNodeClick, selectedNodeId],
  )

  return (
    <div ref={containerRef} className={className ?? 'w-full h-full min-h-[600px]'}>
      <Tree
        data={data}
        orientation="horizontal"
        translate={translate}
        pathFunc="diagonal"
        collapsible
        initialDepth={Infinity}
        renderCustomNodeElement={renderNode}
        separation={{ siblings: 1, nonSiblings: 1.4 }}
        nodeSize={{ x: 240, y: 56 }}
        zoom={0.8}
        scaleExtent={{ min: 0.2, max: 2 }}
        onUpdate={onVisibleNodeIdsChange ? handleTreeUpdate : undefined}
      />
    </div>
  )
}
