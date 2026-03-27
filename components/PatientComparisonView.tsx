import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, GitCompare, Check } from "lucide-react";
import type { Patient } from "../lib/patients";
import { getPatientRelevantNodes } from "../lib/patientNodeRelevance";
import { medicalData } from "../lib/medicalGraphData";

interface PatientComparisonViewProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
}

const categoryColors: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  "Patient Data":  { bg: "bg-blue-50",   text: "text-blue-800",  dot: "bg-blue-400",   border: "border-blue-200" },
  "Categories":    { bg: "bg-pink-50",   text: "text-pink-800",  dot: "bg-pink-400",   border: "border-pink-200" },
  "Specifics":     { bg: "bg-emerald-50",text: "text-emerald-800",dot: "bg-emerald-400",border: "border-emerald-200" },
  "Treatments":    { bg: "bg-amber-50",  text: "text-amber-800", dot: "bg-amber-400",  border: "border-amber-200" },
  "Biomarkers":    { bg: "bg-violet-50", text: "text-violet-800",dot: "bg-violet-400", border: "border-violet-200" },
  "Monitoring":    { bg: "bg-fuchsia-50",text: "text-fuchsia-800",dot: "bg-fuchsia-400",border: "border-fuchsia-200" },
};

type FilterMode = "all" | "shared" | "unique";

export default function PatientComparisonView({ isOpen, onClose, patients }: PatientComparisonViewProps) {
  const [filter, setFilter] = useState<FilterMode>("all");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const relevanceSets = useMemo(
    () => patients.map((p) => ({ id: p.id, nodes: getPatientRelevantNodes(p) })),
    [patients]
  );

  const getNodeRelevance = (nodeId: string) => {
    const relevantCount = relevanceSets.filter((r) => r.nodes.has(nodeId)).length;
    return { relevantCount, isAll: relevantCount === patients.length, isSome: relevantCount > 0 };
  };

  const shouldShowNode = (nodeId: string) => {
    const { relevantCount, isAll } = getNodeRelevance(nodeId);
    if (filter === "shared") return isAll;
    if (filter === "unique") return relevantCount > 0 && !isAll;
    return true;
  };

  const avatarColors = [
    "bg-indigo-100 text-indigo-700 border-indigo-300",
    "bg-emerald-100 text-emerald-700 border-emerald-300",
    "bg-violet-100 text-violet-700 border-violet-300",
    "bg-amber-100 text-amber-700 border-amber-300",
    "bg-pink-100 text-pink-700 border-pink-300",
    "bg-cyan-100 text-cyan-700 border-cyan-300",
  ];

  return (
    <AnimatePresence>
      {isOpen && patients.length > 0 && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[55]"
            onClick={onClose}
          />

          {/* Side panel — 75% width */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[75%] bg-white shadow-2xl z-[60] flex flex-col"
          >
      <div className="bg-white flex flex-col h-full">

        {/* Header */}
        <div className="shrink-0 px-8 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <GitCompare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Patient Comparison</h2>
              <p className="text-sm text-gray-500">
                Comparing {patients.length} patient{patients.length !== 1 ? "s" : ""} across {medicalData.reduce((t, c) => t + c.nodes.length, 0)} medical keyword nodes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Legend */}
            <div className="flex items-center gap-4 mr-4 text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
                Shared by all
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block" />
                Partially shared
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300 inline-block" />
                Not applicable
              </span>
            </div>
            {/* Filter tabs */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {(["all", "shared", "unique"] as FilterMode[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                    filter === f ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {f === "all" ? "All Nodes" : f === "shared" ? "Shared Only" : "Unique Diffs"}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Scrollable comparison grid */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse min-w-max">
            {/* Patient column headers — sticky top */}
            <thead className="sticky top-0 z-20 bg-white shadow-sm">
              <tr>
                {/* Category + node name column — sticky left */}
                <th className="sticky left-0 z-30 text-left px-6 py-4 w-72 bg-white border-b border-r border-gray-200">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Medical Node</span>
                </th>
                {patients.map((patient, idx) => {
                  const initials = patient.name.split(" ").map((n) => n[0]).join("");
                  const colorCls = avatarColors[idx % avatarColors.length];
                  return (
                    <th key={patient.id} className="px-4 py-4 text-center bg-white border-b border-gray-200 min-w-[160px]">
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold ${colorCls}`}>
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 leading-tight">{patient.name.split(" ")[0]} {patient.name.split(" ").slice(-1)}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{patient.age}yo · {patient.gender}</p>
                          <p className="text-[10px] text-indigo-600 font-medium mt-0.5 leading-tight max-w-[140px] mx-auto">
                            {patient.diagnoses[0].length > 28 ? patient.diagnoses[0].slice(0, 28) + "…" : patient.diagnoses[0]}
                          </p>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {medicalData.map((category) => {
                const visibleNodes = category.nodes.filter((n) => shouldShowNode(n.id));
                if (visibleNodes.length === 0) return null;

                const catStyle = categoryColors[category.title] ?? categoryColors["Patient Data"];

                return (
                  <>
                    {/* Category header row */}
                    <tr key={`cat-${category.title}`} className="sticky top-[97px] z-10">
                      <td
                        className={`sticky left-0 z-10 px-6 py-2 text-xs font-bold uppercase tracking-wider border-r ${catStyle.text} ${catStyle.bg} border-y ${catStyle.border}`}
                      >
                        {category.title}
                      </td>
                      <td
                        colSpan={patients.length}
                        className={`px-6 py-2 text-xs font-bold uppercase tracking-wider ${catStyle.text} ${catStyle.bg} border-y ${catStyle.border}`}
                      />
                    </tr>

                    {/* Node rows */}
                    {visibleNodes.map((node) => {
                      const { relevantCount, isAll } = getNodeRelevance(node.id);
                      const isHovered = hoveredNode === node.id;
                      return (
                        <tr
                          key={node.id}
                          className={`group border-b border-gray-100 transition-colors ${isHovered ? "bg-indigo-50/50" : "hover:bg-gray-50"}`}
                          onMouseEnter={() => setHoveredNode(node.id)}
                          onMouseLeave={() => setHoveredNode(null)}
                        >
                          {/* Node label — sticky left */}
                          <td className={`sticky left-0 z-10 px-6 py-3 w-72 border-r border-gray-200 ${isHovered ? "bg-indigo-50/90" : "bg-white group-hover:bg-gray-50"}`}>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${catStyle.dot}`} />
                              <span className="text-sm text-gray-800 font-medium">{node.label}</span>
                              {/* Shared indicator */}
                              {isAll && (
                                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium shrink-0">
                                  All
                                </span>
                              )}
                              {!isAll && relevantCount > 0 && (
                                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-700 font-medium shrink-0">
                                  {relevantCount}/{patients.length}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Patient cells */}
                          {patients.map((patient, idx) => {
                            const isRelevant = relevanceSets[idx].nodes.has(node.id);
                            return (
                              <td key={patient.id} className="px-4 py-3 text-center">
                                {isRelevant ? (
                                  <div className="flex items-center justify-center">
                                    <div
                                      className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${
                                        isAll
                                          ? "bg-indigo-500"
                                          : "bg-cyan-400"
                                      }`}
                                    >
                                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center">
                                    <div className="w-7 h-7 rounded-full border-2 border-gray-200 bg-gray-50" />
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </>
                );
              })}
            </tbody>
          </table>

          {/* Empty state for filter */}
          {medicalData.every((cat) => cat.nodes.every((n) => !shouldShowNode(n.id))) && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <GitCompare className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No nodes match this filter.</p>
              <button
                onClick={() => setFilter("all")}
                className="mt-3 text-indigo-600 text-sm hover:underline"
              >
                Show all nodes
              </button>
            </div>
          )}
        </div>

        {/* Footer summary bar */}
        <div className="shrink-0 px-8 py-3 border-t border-gray-200 bg-gray-50 flex items-center gap-6 text-xs text-gray-600">
          {medicalData.map((cat) => {
            const shared = cat.nodes.filter((n) => getNodeRelevance(n.id).isAll).length;
            const partial = cat.nodes.filter((n) => { const r = getNodeRelevance(n.id); return r.isSome && !r.isAll; }).length;
            return (
              <span key={cat.title} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${categoryColors[cat.title]?.dot ?? "bg-gray-400"}`} />
                <span className="font-medium">{cat.title}:</span>
                <span className="text-indigo-600">{shared} shared</span>
                {partial > 0 && <span className="text-gray-400">· {partial} partial</span>}
              </span>
            );
          })}
        </div>
      </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
