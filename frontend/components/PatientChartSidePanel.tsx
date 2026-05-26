import {
  Activity,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Database,
  FlaskConical,
  Layers3,
  Stethoscope,
  X,
} from "lucide-react";
import type { Patient } from "../lib/patients";

interface PatientChartSidePanelProps {
  selectedPatient?: Patient;
  onClose: () => void;
}

const clinicalTiers = [
  {
    id: "tier-1",
    title: "Tier 1",
    subtitle: "Immediate Clinical Snapshot",
    Icon: Stethoscope,
    accent: "from-blue-500 to-indigo-600",
    tone: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "tier-2",
    title: "Tier 2",
    subtitle: "Extended Clinical Context",
    Icon: Activity,
    accent: "from-purple-500 to-fuchsia-600",
    tone: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    id: "tier-3",
    title: "Tier 3",
    subtitle: "Care Coordination",
    Icon: Layers3,
    accent: "from-emerald-500 to-teal-600",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "tier-4",
    title: "Tier 4",
    subtitle: "Reference Data",
    Icon: Database,
    accent: "from-amber-500 to-orange-600",
    tone: "bg-amber-50 text-amber-700 border-amber-200",
  },
];

function initialsFor(patient: Patient) {
  return patient.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function PatientChartSidePanel({ selectedPatient, onClose }: PatientChartSidePanelProps) {
  if (!selectedPatient) {
    return (
      <div className="flex h-full flex-col bg-white/95">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Patient Chart</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close patient chart"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const primaryDiagnosis = selectedPatient.diagnoses[0] ?? "Diagnosis not listed";
  const secondaryDiagnosis = selectedPatient.diagnoses[1];
  const primaryMedication = selectedPatient.medications[0] ?? "No active medication listed";
  const nextAppointment = selectedPatient.upcomingAppointments[0];

  const metaItems = [
    { label: "MRN", value: selectedPatient.mrn },
    { label: "Patient Since", value: selectedPatient.patientSince },
    { label: "Last Visit", value: selectedPatient.lastVisit },
    { label: "Insurance", value: selectedPatient.insuranceProvider },
  ];

  const overviewItems = [
    { label: "Primary Dx", value: primaryDiagnosis },
    { label: "Secondary Dx", value: secondaryDiagnosis ?? "None listed" },
    { label: "Current Medication", value: primaryMedication },
    { label: "Next Visit", value: nextAppointment ? `${nextAppointment.date} · ${nextAppointment.type}` : "Not scheduled" },
    { label: "Phone", value: selectedPatient.contact.phone },
    { label: "Email", value: selectedPatient.contact.email },
  ];

  const tierItems = [
    [
      `Primary diagnosis: ${primaryDiagnosis}`,
      `Current med: ${primaryMedication}`,
      `Next visit: ${nextAppointment?.date ?? "Not scheduled"}`,
    ],
    [
      `Secondary diagnosis: ${secondaryDiagnosis ?? "None listed"}`,
      `Last visit: ${selectedPatient.lastVisit}`,
      `Insurance: ${selectedPatient.insuranceProvider}`,
    ],
    [
      `Patient since: ${selectedPatient.patientSince}`,
      `Contact: ${selectedPatient.contact.phone}`,
      `Upcoming type: ${nextAppointment?.type ?? "N/A"}`,
    ],
    [
      `MRN: ${selectedPatient.mrn}`,
      `Email: ${selectedPatient.contact.email}`,
      `Address: ${selectedPatient.contact.address}`,
    ],
  ];

  return (
    <div className="flex h-full flex-col bg-white/95 text-slate-950 backdrop-blur-2xl">
      <div className="absolute right-5 top-5 z-10">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Close patient chart"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-7 lg:px-12">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-300 text-xl font-semibold text-white shadow-lg shadow-violet-200">
            {initialsFor(selectedPatient)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-semibold tracking-[-0.02em] text-slate-950">{selectedPatient.name}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {selectedPatient.age}yo {selectedPatient.gender} with {primaryDiagnosis}. Current chart highlights {primaryMedication}
              {nextAppointment ? ` and an upcoming ${nextAppointment.type.toLowerCase()} on ${nextAppointment.date}.` : "."}
            </p>
          </div>
        </div>

        <div className="mb-7 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-medium text-pink-900">
            {primaryDiagnosis}
          </span>
          {secondaryDiagnosis ? (
            <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-800">
              {secondaryDiagnosis}
            </span>
          ) : null}
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
            {primaryMedication}
          </span>
        </div>

        <div className="mb-8 grid gap-3 rounded-2xl bg-slate-100 p-4 sm:grid-cols-2 xl:grid-cols-4">
          {metaItems.map((item) => (
            <div key={item.label}>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{item.label}</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-7 flex flex-wrap gap-2 border-b border-slate-200 pb-5">
          <button className="inline-flex items-center gap-2 rounded-lg border border-violet-600 bg-violet-600 px-4 py-2 text-sm font-medium text-white">
            <ClipboardList className="h-4 w-4" />
            Overview
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
            <FlaskConical className="h-4 w-4" />
            Labs
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
            <CalendarClock className="h-4 w-4" />
            Reports
          </button>
        </div>

        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-violet-600" />
            <h2 className="font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-violet-600">Patient Overview</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {overviewItems.map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{item.label}</p>
                <p className="mt-1 text-sm font-medium leading-5 text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-violet-600">
            Tiered Clinical View
          </h2>
          <div className="space-y-4">
            {clinicalTiers.map((tier, index) => (
              <div key={tier.id} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className={`absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r ${tier.accent}`} />
                <div className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                        <tier.Icon className="h-5 w-5 text-slate-700" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-950">{tier.title}</h3>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-medium ${tier.tone}`}>{tier.subtitle}</span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {tierItems[index].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-violet-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
