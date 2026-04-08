import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { FlaskConical } from "lucide-react";
import type { Patient } from "../lib/patients";
import type { FdaKeyword } from "../lib/keytrudaFdaKeywords";
import {
  getTrialKeywordsForPatient,
  getVisibleKeywordEdges,
  layoutTrialKeywords,
  sortTrialKeywordsForDisplay,
} from "../lib/trialKeywordGraph";

const colorStyles: Record<
  FdaKeyword["color"],
  { fill: string; stroke: string; text: string }
> = {
  indigo: { fill: "#e0e7ff", stroke: "#6366f1", text: "#312e81" },
  blue: { fill: "#dbeafe", stroke: "#3b82f6", text: "#1e3a8a" },
  violet: { fill: "#ede9fe", stroke: "#7c3aed", text: "#5b21b6" },
  purple: { fill: "#f3e8ff", stroke: "#a855f7", text: "#581c87" },
  emerald: { fill: "#d1fae5", stroke: "#10b981", text: "#065f46" },
  amber: { fill: "#fef3c7", stroke: "#f59e0b", text: "#92400e" },
  cyan: { fill: "#cffafe", stroke: "#06b6d4", text: "#155e75" },
  rose: { fill: "#ffe4e6", stroke: "#f43f5e", text: "#9f1239" },
};

/** Smooth curve between anchors — horizontal-ish vs vertical-ish control points (matches Wave `generateCurvePath` spirit). */
function curvePath(x1: number, y1: number, x2: number, y2: number): string {
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  if (Math.abs(x2 - x1) >= Math.abs(y2 - y1)) {
    return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
  }
  return `M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}`;
}

/** Exit/entry sides so lines connect the faces that face each other (handles reversed edges + same-column stacks). */
function edgeAnchors(a: { x: number; y: number; width: number; height: number }, b: {
  x: number;
  y: number;
  width: number;
  height: number;
}): { x1: number; y1: number; x2: number; y2: number } {
  const ax = a.x + a.width / 2;
  const ay = a.y + a.height / 2;
  const bx = b.x + b.width / 2;
  const by = b.y + b.height / 2;
  const dx = bx - ax;
  const dy = by - ay;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (ax < bx) {
      return { x1: a.x + a.width, y1: ay, x2: b.x, y2: by };
    }
    return { x1: a.x, y1: ay, x2: b.x + b.width, y2: by };
  }
  if (ay < by) {
    return { x1: ax, y1: a.y + a.height, x2: bx, y2: b.y };
  }
  return { x1: ax, y1: a.y, x2: bx, y2: b.y + b.height };
}

type AnchorSide = "left" | "right" | "top" | "bottom";

function sideAndDotCenter(
  pos: { x: number; y: number; width: number; height: number },
  x: number,
  y: number
): { side: AnchorSide; cx: number; cy: number } {
  const mx = pos.x + pos.width / 2;
  const my = pos.y + pos.height / 2;
  const eps = 4;
  if (Math.abs(y - pos.y) < eps && Math.abs(x - mx) < eps) {
    return { side: "top", cx: mx, cy: pos.y };
  }
  if (Math.abs(y - (pos.y + pos.height)) < eps && Math.abs(x - mx) < eps) {
    return { side: "bottom", cx: mx, cy: pos.y + pos.height };
  }
  if (Math.abs(x - pos.x) < eps && Math.abs(y - my) < eps) {
    return { side: "left", cx: pos.x, cy: my };
  }
  if (Math.abs(x - (pos.x + pos.width)) < eps && Math.abs(y - my) < eps) {
    return { side: "right", cx: pos.x + pos.width, cy: my };
  }
  return { side: "right", cx: pos.x + pos.width, cy: my };
}

interface TrialKeywordCanvasProps {
  /** When null, show all trial keywords; when set, filter to patient-applicable keywords. */
  selectedPatient: Patient | null;
  onKeywordClick: (kw: FdaKeyword) => void;
}

/** Match Discovery Keywords (WaveVisualization grid): cyan edges, same curve as `generateCurvePath` when not focused. */
const EDGE_STROKE = "#06b6d4";
const EDGE_STROKE_WIDTH = 2;
const EDGE_OPACITY = 0.8;
/** Same as Wave grid nodes — anchor dot on the right edge of each pill */
const DOT_R = 4;
const NODE_ANIM_DURATION = 0.12;
const NODE_STAGGER = 0.01;

/** IDs of this keyword plus any keyword it shares a visible edge with. */
function incidentKeywordIds(edges: [string, string][], id: string | null): Set<string> | null {
  if (!id) return null;
  const set = new Set<string>([id]);
  edges.forEach(([a, b]) => {
    if (a === id) set.add(b);
    if (b === id) set.add(a);
  });
  return set;
}

export default function TrialKeywordCanvas({ selectedPatient, onKeywordClick }: TrialKeywordCanvasProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const [layoutTargetWidth, setLayoutTargetWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = canvasAreaRef.current;
    if (!el) return;
    const measure = () => {
      const cw = el.clientWidth;
      if (cw > 0) setLayoutTargetWidth(cw);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const keywords = useMemo(() => getTrialKeywordsForPatient(selectedPatient), [selectedPatient]);
  const keywordsSorted = useMemo(() => sortTrialKeywordsForDisplay(keywords), [keywords]);
  const keywordIds = useMemo(() => new Set(keywords.map((k) => k.id)), [keywords]);
  const edges = useMemo(() => getVisibleKeywordEdges(keywordIds), [keywordIds]);

  const { positions, contentHeight, contentWidth, categoryHeaders } = useMemo(
    () => layoutTrialKeywords(keywords, { targetWidth: layoutTargetWidth }),
    [keywords, layoutTargetWidth]
  );

  const incident = useMemo(() => incidentKeywordIds(edges, hoveredId), [edges, hoveredId]);

  const edgePaths = useMemo(() => {
    return edges
      .map(([from, to]) => {
        const a = positions.get(from);
        const b = positions.get(to);
        if (!a || !b) return null;
        const { x1, y1, x2, y2 } = edgeAnchors(a, b);
        return { key: `${from}-${to}`, d: curvePath(x1, y1, x2, y2), from, to };
      })
      .filter(Boolean) as { key: string; d: string; from: string; to: string }[];
  }, [edges, positions]);

  /** Dots only for edges incident to the hovered keyword (hidden when idle). */
  const anchorDotsByKeyword = useMemo(() => {
    const m = new Map<string, Map<AnchorSide, { cx: number; cy: number }>>();
    if (!hoveredId) return m;
    for (const [from, to] of edges) {
      if (from !== hoveredId && to !== hoveredId) continue;
      const a = positions.get(from);
      const b = positions.get(to);
      if (!a || !b) continue;
      const { x1, y1, x2, y2 } = edgeAnchors(a, b);
      const s1 = sideAndDotCenter(a, x1, y1);
      const s2 = sideAndDotCenter(b, x2, y2);
      if (!m.has(from)) m.set(from, new Map());
      if (!m.has(to)) m.set(to, new Map());
      m.get(from)!.set(s1.side, { cx: s1.cx, cy: s1.cy });
      m.get(to)!.set(s2.side, { cx: s2.cx, cy: s2.cy });
    }
    return m;
  }, [edges, positions, hoveredId]);

  const h = Math.max(520, contentHeight);
  const w = Math.max(640, contentWidth);

  /** Same timing as WaveVisualization grid connections (`allNodesAppearTime`). */
  const allNodesAppearTime = useMemo(() => {
    if (keywords.length <= 0) return 0;
    return (keywords.length - 1) * NODE_STAGGER + NODE_ANIM_DURATION + 0.02;
  }, [keywords.length]);

  const visibleEdgePaths = useMemo(() => {
    if (!hoveredId) return [];
    return edgePaths.filter(({ from, to }) => from === hoveredId || to === hoveredId);
  }, [edgePaths, hoveredId]);

  const activeEdgeCount = visibleEdgePaths.length;

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 w-full">
      <div className="shrink-0 px-5 py-4 lg:px-8 border-b border-gray-200 bg-white">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-5 h-5 text-indigo-600 shrink-0" aria-hidden />
            <h2 className="text-lg font-semibold text-gray-900">Clinical trial keywords</h2>
          </div>
          <p className="text-sm text-gray-500">
            {selectedPatient ? (
              <>
                Showing terms applicable to <span className="font-medium text-gray-800">{selectedPatient.name}</span>
                ’s chart
              </>
            ) : (
              <>Full BLA 125514 keyword map — select a patient on the right to filter</>
            )}
          </p>
          <p className="text-sm text-gray-400 tabular-nums mt-1">
            {keywords.length} keyword{keywords.length !== 1 ? "s" : ""}
            {hoveredId ? ` · ${activeEdgeCount} connection${activeEdgeCount !== 1 ? "s" : ""}` : ""}
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto px-5 py-3 lg:px-8 min-w-0">
        {keywords.length === 0 ? (
          <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/50 px-6 py-12 text-center text-sm text-amber-900">
            No trial keywords match this patient&apos;s chart elements. Try &quot;All patients&quot; or another
            cohort member.
          </div>
        ) : (
          <div ref={canvasAreaRef} className="w-full min-w-0 flex flex-col items-stretch">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible w-full min-w-0">
              <svg
                width={w}
                height={h}
                className="block max-w-none shrink-0 overflow-visible"
                role="img"
                aria-label="Clinical trial keyword map"
              >
                  {/* Category column titles — match cohort sidebar: text-sm font-semibold text-gray-900 */}
                  {categoryHeaders.map((ch) => (
                    <foreignObject
                      key={ch.category}
                      x={ch.x}
                      y={ch.labelY - 22}
                      width={ch.width}
                      height={40}
                      className="pointer-events-none overflow-visible"
                    >
                      <div className="flex h-full items-end justify-center text-center text-sm font-semibold text-gray-900 leading-tight px-1">
                        {ch.category}
                      </div>
                    </foreignObject>
                  ))}

                  {/* Pills first (under edges) — lines draw above card fills so strokes read dot-to-dot */}
                  {keywordsSorted.map((kw, i) => {
                    const pos = positions.get(kw.id);
                    if (!pos) return null;
                    const cs = colorStyles[kw.color];
                    const isHover = hoveredId === kw.id;
                    const hasActiveConnection =
                      Boolean(hoveredId && incident?.has(kw.id) && kw.id !== hoveredId);
                    const dimNode = hoveredId && incident && !incident.has(kw.id);
                    const borderCyan = isHover || hasActiveConnection;
                    return (
                      <motion.g
                        key={kw.id}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: dimNode ? 0.45 : 1, y: 0 }}
                        transition={{ duration: NODE_ANIM_DURATION, delay: i * NODE_STAGGER }}
                        onMouseEnter={() => setHoveredId(kw.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className="cursor-pointer"
                      >
                        <foreignObject
                          x={pos.x}
                          y={pos.y}
                          width={pos.width}
                          height={pos.height}
                          className="overflow-visible pointer-events-auto"
                        >
                          <div
                            role="button"
                            tabIndex={0}
                            className="flex h-full min-h-0 w-full cursor-pointer items-center justify-center rounded-lg border px-2 py-1.5 text-center text-[12px] font-medium leading-snug outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-1"
                            style={{
                              backgroundColor: isHover ? "#ecfeff" : cs.fill,
                              borderColor: borderCyan ? EDGE_STROKE : cs.stroke,
                              color: cs.text,
                              borderWidth: borderCyan ? EDGE_STROKE_WIDTH : dimNode ? 1 : 1.5,
                              boxSizing: "border-box",
                              overflowWrap: "anywhere",
                              wordBreak: "break-word",
                            }}
                            onClick={() => onKeywordClick(kw)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onKeywordClick(kw);
                              }
                            }}
                          >
                            {kw.label}
                          </div>
                        </foreignObject>
                      </motion.g>
                    );
                  })}

                  {/* Edges only while hovering — no idle “ghost” strokes */}
                  {visibleEdgePaths.map(({ key, d }) => (
                    <motion.path
                      key={key}
                      d={d}
                      fill="none"
                      stroke={EDGE_STROKE}
                      strokeWidth={EDGE_STROKE_WIDTH}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: EDGE_OPACITY }}
                      transition={{
                        pathLength: {
                          duration: NODE_ANIM_DURATION,
                          delay: allNodesAppearTime,
                        },
                        opacity: { duration: NODE_ANIM_DURATION },
                      }}
                      className="pointer-events-none transition-all duration-75"
                    />
                  ))}

                  {/* Anchor dots on top of edges so connectors read at the ports */}
                  {keywordsSorted.map((kw, i) => {
                    const pos = positions.get(kw.id);
                    if (!pos) return null;
                    const cs = colorStyles[kw.color];
                    const isHover = hoveredId === kw.id;
                    const hasActiveConnection =
                      Boolean(hoveredId && incident?.has(kw.id) && kw.id !== hoveredId);
                    const dimNode = hoveredId && incident && !incident.has(kw.id);
                    const borderCyan = isHover || hasActiveConnection;
                    const dotFill = dimNode ? "#d1d5db" : borderCyan ? EDGE_STROKE : cs.stroke;
                    const sides = anchorDotsByKeyword.get(kw.id);
                    if (!sides || sides.size === 0) return null;
                    return (
                      <motion.g
                        key={`${kw.id}-dots`}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: dimNode ? 0.45 : 1, y: 0 }}
                        transition={{ duration: NODE_ANIM_DURATION, delay: i * NODE_STAGGER }}
                        className="pointer-events-none"
                      >
                        {Array.from(sides.entries()).map(([side, { cx, cy }]) => (
                          <circle
                            key={side}
                            cx={cx}
                            cy={cy}
                            r={DOT_R}
                            fill={dotFill}
                            opacity={dimNode ? 0.5 : 1}
                            className="transition-colors duration-200"
                          />
                        ))}
                      </motion.g>
                    );
                  })}
              </svg>
            </div>
            <p className="text-sm text-gray-500 text-center mt-2 w-full px-2">
              {hoveredId ? (
                <>Showing connections for this term. Click a keyword for details.</>
              ) : (
                <>Hover a keyword to show how it connects to related terms.</>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
