import { useMemo, useState } from "react";
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

function curvePath(x1: number, y1: number, x2: number, y2: number): string {
  const cx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
}

interface TrialKeywordCanvasProps {
  /** When null, show all trial keywords; when set, filter to patient-applicable keywords. */
  selectedPatient: Patient | null;
  onKeywordClick: (kw: FdaKeyword) => void;
}

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

  const keywords = useMemo(() => getTrialKeywordsForPatient(selectedPatient), [selectedPatient]);
  const keywordsSorted = useMemo(() => sortTrialKeywordsForDisplay(keywords), [keywords]);
  const keywordIds = useMemo(() => new Set(keywords.map((k) => k.id)), [keywords]);
  const edges = useMemo(() => getVisibleKeywordEdges(keywordIds), [keywordIds]);

  const { positions, contentHeight, contentWidth, categoryHeaders } = useMemo(
    () => layoutTrialKeywords(keywords),
    [keywords]
  );

  const incident = useMemo(() => incidentKeywordIds(edges, hoveredId), [edges, hoveredId]);

  const edgePaths = useMemo(() => {
    return edges
      .map(([from, to]) => {
        const a = positions.get(from);
        const b = positions.get(to);
        if (!a || !b) return null;
        const x1 = a.x + a.width;
        const y1 = a.y + a.height / 2;
        const x2 = b.x;
        const y2 = b.y + b.height / 2;
        return { key: `${from}-${to}`, d: curvePath(x1, y1, x2, y2), from, to };
      })
      .filter(Boolean) as { key: string; d: string; from: string; to: string }[];
  }, [edges, positions]);

  const h = Math.max(520, contentHeight);
  const w = Math.max(640, contentWidth);

  const visibleEdgePaths = useMemo(() => {
    if (!hoveredId) return [];
    return edgePaths.filter(({ from, to }) => from === hoveredId || to === hoveredId);
  }, [edgePaths, hoveredId]);

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0">
      <div className="shrink-0 px-5 py-4 lg:px-8">
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
            {hoveredId ? ` · ${visibleEdgePaths.length} connection${visibleEdgePaths.length !== 1 ? "s" : ""}` : ""}
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto p-4">
        {keywords.length === 0 ? (
          <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/50 px-6 py-12 text-center text-sm text-amber-900">
            No trial keywords match this patient&apos;s chart elements. Try &quot;All patients&quot; or another
            cohort member.
          </div>
        ) : (
          <div className="flex w-full min-w-0 justify-center items-start py-4">
            <div className="shrink-0 max-w-full">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-w-0">
                <svg width={w} height={h} className="block max-w-none shrink-0" role="img" aria-label="Clinical trial keyword map">
                  <defs>
                    <linearGradient id="trial-edge-active" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.85} />
                    </linearGradient>
                  </defs>

                  {/* Connection lines only while hovering a keyword */}
                  {visibleEdgePaths.map(({ key, d }) => (
                    <path
                      key={key}
                      d={d}
                      fill="none"
                      stroke="url(#trial-edge-active)"
                      strokeWidth={2.6}
                      opacity={1}
                    />
                  ))}

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

                  {keywordsSorted.map((kw, i) => {
                    const pos = positions.get(kw.id);
                    if (!pos) return null;
                    const cs = colorStyles[kw.color];
                    const isHover = hoveredId === kw.id;
                    const dimNode = hoveredId && incident && !incident.has(kw.id);
                    return (
                      <motion.g
                        key={kw.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: dimNode ? 0.45 : 1 }}
                        transition={{ delay: i * 0.02, duration: 0.2 }}
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
                            className="flex h-full min-h-0 w-full cursor-pointer items-center justify-center rounded-lg border px-2 py-1.5 text-center text-[12px] font-medium leading-snug outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
                            style={{
                              backgroundColor: cs.fill,
                              borderColor: cs.stroke,
                              color: cs.text,
                              borderWidth: isHover ? 2.8 : dimNode ? 1 : 1.5,
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
                </svg>
              </div>
              <p className="text-sm text-gray-500 text-center mt-2 max-w-xl mx-auto px-2">
                {hoveredId ? (
                  <>Showing connections for this term. Click a keyword for details.</>
                ) : (
                  <>Hover a keyword to show how it connects to related terms.</>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
