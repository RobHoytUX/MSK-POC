import { FileText } from "lucide-react";
import type { ClinicalTimelineResponse } from "../lib/clinicalIntelligence";
import { groupClinicalTimelineByYear } from "../lib/clinicalIntelligence";

interface ClinicalTimelineSidebarProps {
  data: ClinicalTimelineResponse | null;
  loading: boolean;
  error: string | null;
}

export default function ClinicalTimelineSidebar({ data, loading, error }: ClinicalTimelineSidebarProps) {
  const grouped = data ? groupClinicalTimelineByYear(data.timeline) : [];

  return (
    <aside className="w-[min(280px,32vw)] shrink-0 flex flex-col border-r border-gray-200 bg-slate-50 min-h-0">
      <div className="shrink-0 px-3 py-3 border-b border-gray-200 bg-white/80">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Longitudinal records</p>
        {data?.patient_name && (
          <p className="text-sm text-slate-800 font-medium truncate mt-0.5" title={data.patient_name}>
            {data.patient_name}
          </p>
        )}
        {data && (
          <p className="text-xs text-slate-500 mt-1">
            {data.total_records} record{data.total_records === 1 ? "" : "s"} sorted newest first
          </p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {loading && (
          <div className="flex flex-col items-center gap-2 py-8 text-slate-500 text-sm">
            <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <span>Loading records…</span>
          </div>
        )}
        {!loading && error && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-2 py-2">
            Live timeline unavailable ({error}). The main chart continues to use the in-app demo data.
          </p>
        )}
        {!loading && !error && data && grouped.length === 0 && (
          <p className="text-xs text-slate-500">No timeline entries returned for this patient.</p>
        )}
        {!loading && data &&
          grouped.map(({ year, items }) => (
            <div key={year}>
              <h3 className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider sticky top-0 bg-slate-50 py-1">
                {year}{" "}
                <span className="font-normal text-slate-500">
                  ({items.length} record{items.length === 1 ? "" : "s"})
                </span>
              </h3>
              <ul className="mt-2 space-y-2">
                {items.map((row, idx) => (
                  <li
                    key={`${row.filename}-${row.doc_date}-${idx}`}
                    className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm"
                  >
                    <div className="flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-slate-900">{row.doc_date}</p>
                        <p className="text-[10px] text-slate-500 truncate" title={row.filename}>
                          {row.filename}
                        </p>
                        <p className="text-[11px] text-slate-600 leading-snug line-clamp-3 mt-1">{row.snippet}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </aside>
  );
}
