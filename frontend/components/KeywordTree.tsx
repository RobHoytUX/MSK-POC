import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Tree, { type CustomNodeElementProps, type RawNodeDatum } from 'react-d3-tree'
import type { TreeNode, TreeNodeType } from '../lib/treeTaxonomy'

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
  className?: string
}

const TYPE_STYLE: Record<TreeNodeType, { fill: string; stroke: string; r: number; textWeight: number }> = {
  patient:     { fill: '#7c3aed', stroke: '#7c3aed', r: 14, textWeight: 700 },
  branch:      { fill: '#f59e0b', stroke: '#f59e0b', r: 10, textWeight: 600 },
  category:    { fill: '#ffffff', stroke: '#94a3b8', r: 8,  textWeight: 500 },
  subcategory: { fill: '#ffffff', stroke: '#cbd5e1', r: 6,  textWeight: 400 },
  leaf:        { fill: '#10b981', stroke: '#10b981', r: 6,  textWeight: 500 },
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

export default function KeywordTree({ tree, onNodeClick, selectedNodeId, className }: KeywordTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 80, y: 300 })

  // index source nodes by id for fast lookup on click
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

  // center the tree vertically on mount and on resize
  useEffect(() => {
    function recenter() {
      if (!containerRef.current) return
      const { width, height } = containerRef.current.getBoundingClientRect()
      setTranslate({ x: Math.max(80, width * 0.12), y: height / 2 })
    }
    recenter()
    window.addEventListener('resize', recenter)
    return () => window.removeEventListener('resize', recenter)
  }, [])

  const renderNode = useCallback(
    ({ nodeDatum, toggleNode }: CustomNodeElementProps) => {
      const attrs = (nodeDatum.attributes ?? {}) as unknown as NodeAttributes
      const type = (attrs.type ?? 'leaf') as TreeNodeType
      const style = TYPE_STYLE[type]
      const sourceId = attrs.nodeId as string
      const isSelected = selectedNodeId === sourceId

      const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        toggleNode()
        const src = nodeIndex.get(sourceId)
        if (src) onNodeClick(src)
      }

      return (
        <g onClick={handleClick} style={{ cursor: 'pointer' }}>
          <circle
            r={style.r}
            fill={style.fill}
            stroke={isSelected ? '#0f172a' : style.stroke}
            strokeWidth={isSelected ? 3 : 1.5}
          />
          <text
            x={style.r + 8}
            y={4}
            fontSize={type === 'patient' ? 16 : type === 'branch' ? 14 : 12}
            fontWeight={style.textWeight}
            fill="#0f172a"
            style={{ userSelect: 'none', paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: 3 }}
          >
            {nodeDatum.name}
          </text>
        </g>
      )
    },
    [nodeIndex, onNodeClick, selectedNodeId],
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
      />
    </div>
  )
}
