import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, Users, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Patient, patients } from "../lib/patients";

interface ComparePatientPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentPatient?: Patient;
}

export default function ComparePatientPanel({ isOpen, onClose, currentPatient }: ComparePatientPanelProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [diagnosisFilter, setDiagnosisFilter] = useState<string | null>(null);
  const [diagnosisOpen, setDiagnosisOpen] = useState(false);

  const allDiagnoses = useMemo(() => {
    const set = new Set<string>();
    patients.forEach((p) => p.diagnoses.forEach((d) => set.add(d)));
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return patients.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q) ||
        p.diagnoses.some((d) => d.toLowerCase().includes(q));
      const matchesDx = !diagnosisFilter || p.diagnoses.includes(diagnosisFilter);
      return matchesSearch && matchesDx;
    });
  }, [search, diagnosisFilter]);

  const allSelected = filtered.length > 0 && filtered.every((p) => selectedIds.has(p.id));

  const togglePatient = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((p) => next.add(p.id));
        return next;
      });
    }
  };

  const selectedPatients = patients.filter((p) => selectedIds.has(p.id));

  const handleCompare = () => {
    // Placeholder — wire to comparison view in a future iteration
    alert(`Comparing ${selectedPatients.length} patient${selectedPatients.length !== 1 ? "s" : ""}: ${selectedPatients.map((p) => p.name).join(", ")}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[45]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: -520, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -520, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="fixed top-0 left-0 w-[500px] h-full bg-white shadow-2xl border-r border-gray-200 flex flex-col z-50"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white shrink-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Compare Patients</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Select patients to compare alongside{" "}
                <span className="font-medium text-gray-700">{currentPatient?.name ?? "the current patient"}</span>.
              </p>
            </div>

            {/* Filters */}
            <div className="px-6 pt-4 pb-3 shrink-0 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, MRN, or diagnosis…"
                  className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center hover:text-gray-900 text-gray-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Diagnosis filter */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDiagnosisOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-full text-sm bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className={diagnosisFilter ? "text-gray-900 font-medium" : "text-gray-400"}>
                    {diagnosisFilter ?? "Filter by diagnosis…"}
                  </span>
                  {diagnosisOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </button>

                {diagnosisOpen && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-10 max-h-52 overflow-y-auto">
                    <button
                      onClick={() => { setDiagnosisFilter(null); setDiagnosisOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 border-b border-gray-100"
                    >
                      All diagnoses
                    </button>
                    {allDiagnoses.map((dx) => (
                      <button
                        key={dx}
                        onClick={() => { setDiagnosisFilter(dx); setDiagnosisOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors ${
                          diagnosisFilter === dx ? "text-indigo-700 font-medium bg-indigo-50" : "text-gray-700"
                        }`}
                      >
                        {dx}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Select all row */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={toggleAll}
                  className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      allSelected
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {allSelected && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  {allSelected ? "Deselect all" : "Select all"}
                </button>
                <span className="text-xs text-gray-500">
                  {filtered.length} patient{filtered.length !== 1 ? "s" : ""}
                  {selectedIds.size > 0 && (
                    <span className="ml-2 text-indigo-600 font-medium">· {selectedIds.size} selected</span>
                  )}
                </span>
              </div>
            </div>

            {/* Patient list */}
            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-2">
              {filtered.length === 0 ? (
                <p className="text-sm text-gray-500 text-center pt-10">No patients match your search.</p>
              ) : (
                filtered.map((p) => {
                  const selected = selectedIds.has(p.id);
                  const isCurrent = p.id === currentPatient?.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={isCurrent}
                      onClick={() => !isCurrent && togglePatient(p.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                        isCurrent
                          ? "border-indigo-200 bg-indigo-50 opacity-70 cursor-not-allowed"
                          : selected
                          ? "border-indigo-300 bg-indigo-50"
                          : "border-gray-200 bg-white hover:border-indigo-200 hover:shadow-sm"
                      }`}
                    >
                      {/* Checkbox */}
                      <div
                        className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          selected || isCurrent
                            ? "bg-indigo-600 border-indigo-600"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {(selected || isCurrent) && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>

                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-sm font-semibold flex items-center justify-center shrink-0">
                        {p.name.split(" ").map((n) => n[0]).join("")}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-900">{p.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-600 text-white font-medium">Current</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {p.age}yo {p.gender} · {p.mrn}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {p.diagnoses.slice(0, 2).map((dx) => (
                            <span
                              key={dx}
                              className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200"
                            >
                              {dx}
                            </span>
                          ))}
                          {p.diagnoses.length > 2 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                              +{p.diagnoses.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer action */}
            <div className="shrink-0 px-6 py-4 border-t border-gray-200 bg-white">
              <button
                type="button"
                disabled={selectedIds.size === 0}
                onClick={handleCompare}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                <Users className="w-4 h-4" />
                Compare {selectedIds.size > 0 ? `${selectedIds.size} Patient${selectedIds.size !== 1 ? "s" : ""}` : "Patients"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
