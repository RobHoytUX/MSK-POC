import { useEffect, useState } from "react";
import { Clock, UserRound, X } from "lucide-react";
import type { Patient } from "../lib/patients";

interface MyPatientsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: Patient[];
  onChangePatient?: () => void;
}

export default function MyPatientsDialog({ open, onOpenChange, patients, onChangePatient }: MyPatientsDialogProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => setVisible(true), 10);
      return () => window.clearTimeout(id);
    }
    setVisible(false);
  }, [open]);

  const handleClose = () => {
    setVisible(false);
    window.setTimeout(() => onOpenChange(false), 300);
  };

  if (!open) return null;

  return (
    <>
      <div
        role="presentation"
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-1/2 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-gray-900">My Patients</h2>
            <p className="text-sm text-gray-500 mt-1">
              Patients you selected during setup ({patients.length}). The first patient is the primary chart focus.
            </p>
            {onChangePatient && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => {
                    onChangePatient();
                    handleClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium border border-indigo-200 transition-colors"
                >
                  <UserRound className="w-3.5 h-3.5" />
                  Change Patient
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors shrink-0"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4">
          {patients.map((p, idx) => (
            <div
              key={p.id}
              className="rounded-2xl border border-gray-200 bg-gradient-to-br from-indigo-50/80 to-white shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center font-semibold shrink-0">
                    {p.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">{p.name}</h3>
                      {idx === 0 && (
                        <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                          Primary chart
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {p.age}yo {p.gender} · MRN {p.mrn}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.diagnoses.slice(0, 3).map((d, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-800 border border-orange-200"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {p.medications.slice(0, 2).map((m, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 min-w-[140px]">
                  <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    Next appointment
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {p.upcomingAppointments[0]?.date || "Not scheduled"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.upcomingAppointments[0]?.type || "—"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
