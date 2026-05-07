import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Link2 } from "lucide-react";
import type { FdaKeyword } from "../lib/keytrudaFdaKeywords";
import { medicalData } from "../lib/medicalGraphData";

function getNodeLabel(nodeId: string): string {
  for (const col of medicalData) {
    const n = col.nodes.find((n) => n.id === nodeId);
    if (n) return n.label;
  }
  return nodeId;
}

interface KeywordAnalysisPanelProps {
  keyword: FdaKeyword | null;
  patientName?: string | null;
  onClose: () => void;
}

export default function KeywordAnalysisPanel({ keyword, patientName, onClose }: KeywordAnalysisPanelProps) {
  return (
    <AnimatePresence>
      {keyword && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/35 backdrop-blur-[2px] z-[80]"
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed top-0 right-0 z-[90] h-full w-[min(440px,100vw)] bg-white shadow-2xl border-l border-gray-200 flex flex-col"
          >
            <div className="shrink-0 px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-violet-50 to-white flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-600 mb-1">Keyword analysis</p>
                <h2 className="text-lg font-semibold text-gray-900 leading-snug">{keyword.label}</h2>
                <span className="inline-block mt-2 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
                  {keyword.category}
                </span>
                {patientName && (
                  <p className="text-xs text-gray-500 mt-2">
                    Context: <span className="font-medium text-gray-700">{patientName}</span>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 shrink-0"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Clinical definition</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{keyword.description}</p>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-indigo-600" />
                  Related chart elements
                </h3>
                <ul className="space-y-2">
                  {keyword.relatedNodeIds.map((id) => (
                    <li
                      key={id}
                      className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-800"
                    >
                      {getNodeLabel(id)}
                      <span className="text-[10px] text-gray-400 font-mono ml-2">{id}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Analysis summary
                </h3>
                <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-4 text-sm text-gray-800 leading-relaxed">
                  This keyword is anchored to FDA label (BLA 125514) concepts. Cross-check the related chart elements
                  against the patient record when assessing trial fit. Use the cohort canvas to compare how this
                  keyword connects to other eligibility themes.
                </div>
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
