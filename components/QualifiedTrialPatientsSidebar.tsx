import { Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import type { Patient } from "../lib/patients";
import { evaluateKeytrudaQualification } from "../lib/keytrudaEligibility";

type SortOption = "name" | "diagnosis" | "percentage";

interface QualifiedTrialPatientsSidebarProps {
  patients: Patient[];
  /** @deprecated Panel no longer shows a close control; kept for call-site compatibility. */
  onClose?: () => void;
  /** Highlights the row; `null` means full keyword map (all patients). */
  selectedPatientId?: string | null;
  onSelectPatient?: (patientId: string | null) => void;
}

export default function QualifiedTrialPatientsSidebar({
  patients: list,
  selectedPatientId = null,
  onSelectPatient,
}: QualifiedTrialPatientsSidebarProps) {
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("percentage");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.mrn.toLowerCase().includes(s) ||
        p.diagnoses.some((d) => d.toLowerCase().includes(s))
    );
  }, [list, q]);

  const qualificationById = useMemo(() => {
    const m = new Map<string, ReturnType<typeof evaluateKeytrudaQualification>>();
    list.forEach((p) => {
      m.set(p.id, evaluateKeytrudaQualification(p));
    });
    return m;
  }, [list]);

  const sortedFiltered = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      }
      if (sortBy === "diagnosis") {
        const da = (a.diagnoses[0] ?? "").toLowerCase();
        const db = (b.diagnoses[0] ?? "").toLowerCase();
        const cmp = da.localeCompare(db, undefined, { sensitivity: "base" });
        if (cmp !== 0) return cmp;
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      }
      const pa = qualificationById.get(a.id)?.confidenceScore ?? 0;
      const pb = qualificationById.get(b.id)?.confidenceScore ?? 0;
      if (pb !== pa) return pb - pa;
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
    return arr;
  }, [filtered, sortBy, qualificationById]);

  return (
    <aside className="flex flex-col h-full w-full min-h-0 bg-transparent">
      <div className="shrink-0 px-5 pt-4 pb-3 lg:px-8">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-indigo-600 shrink-0" aria-hidden />
          <h2 className="text-lg font-semibold text-gray-900">Cohort patients</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          All cohort members ({list.length}) · 0–100 Keytruda qualification confidence — select one to filter the
          keyword map
        </p>
      </div>

      <div className="shrink-0 px-5 pb-3 space-y-3 lg:px-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, MRN, diagnosis..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <label htmlFor="qualified-patients-sort" className="text-xs font-medium text-gray-500 shrink-0">
            Sort
          </label>
          <select
            id="qualified-patients-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="percentage">Percentage (high → low)</option>
            <option value="name">Name (A → Z)</option>
            <option value="diagnosis">Diagnosis (A → Z)</option>
          </select>
        </div>
        {onSelectPatient && (
          <button
            type="button"
            onClick={() => onSelectPatient(null)}
            className={`w-full text-left text-xs px-3 py-2 rounded-lg font-medium border transition-colors ${
              selectedPatientId === null
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            All patients — full trial keyword map
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pl-5 lg:pl-8 pr-[calc(1.25rem+6px)] lg:pr-[calc(2rem+6px)] pb-6 space-y-2 min-h-0 [scrollbar-width:thin] [scrollbar-color:rgb(148_163_184)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 hover:[&::-webkit-scrollbar-thumb]:bg-gray-500">
        {sortedFiltered.map((p) => {
          const initials = p.name
            .split(" ")
            .map((n) => n[0])
            .join("");
          const qual = qualificationById.get(p.id);
          const pct = qual?.confidenceScore ?? 0;
          const badgeClass =
            pct >= 70
              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
              : pct >= 40
              ? "bg-amber-100 text-amber-800 border-amber-200"
              : "bg-gray-100 text-gray-700 border-gray-200";
          const isSelected = selectedPatientId === p.id;
          return (
            <div
              key={p.id}
              role={onSelectPatient ? "button" : undefined}
              tabIndex={onSelectPatient ? 0 : undefined}
              onClick={() => onSelectPatient?.(p.id)}
              onKeyDown={(e) => {
                if (onSelectPatient && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onSelectPatient(p.id);
                }
              }}
              className={`rounded-xl border bg-white/90 p-3 shadow-sm transition-colors text-left ${
                isSelected
                  ? "border-indigo-400 ring-2 ring-indigo-300"
                  : "border-emerald-100 hover:border-emerald-200"
              } ${onSelectPatient ? "cursor-pointer" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold shrink-0 border border-emerald-200">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                    <span
                      className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full border tabular-nums ${badgeClass}`}
                      title="Keytruda qualification confidence (0–100)"
                    >
                      {pct}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {p.age}yo {p.gender} · {p.mrn}
                  </p>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-400" : "bg-gray-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">{p.diagnoses[0]}</p>
                </div>
              </div>
            </div>
          );
        })}
        {sortedFiltered.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">{list.length === 0 ? "No qualified patients stored." : "No matches for search."}</p>
        )}
      </div>
    </aside>
  );
}
