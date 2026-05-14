import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  ClipboardList,
  FileText,
  FlaskConical,
  Layers3,
  Stethoscope,
  Activity,
  Database,
  CheckCircle2,
} from "lucide-react";
import { Patient } from "../lib/patients";

type PatientChartTab = "overview" | "labs" | "reports";

interface PatientChartPageProps {
  selectedPatient?: Patient;
  onChangePatient?: () => void;
  onBack?: () => void;
}

export default function PatientChartPage({ selectedPatient, onChangePatient, onBack }: PatientChartPageProps) {
  const [activeTab, setActiveTab] = useState<PatientChartTab>("overview");

  const overviewItems = useMemo(() => {
    if (!selectedPatient) return [];
    return [
      { label: "Primary Dx", value: selectedPatient.diagnoses[0] },
      { label: "Secondary Dx", value: selectedPatient.diagnoses[1] || "None listed" },
      { label: "Medication", value: selectedPatient.medications[0] || "None listed" },
      { label: "Patient Since", value: selectedPatient.patientSince },
      { label: "Insurance", value: selectedPatient.insuranceProvider },
      { label: "Contact", value: selectedPatient.contact.phone },
      { label: "MRN", value: selectedPatient.mrn },
      { label: "Last Visit", value: selectedPatient.lastVisit },
    ];
  }, [selectedPatient]);

  const tierSections = useMemo(() => {
    if (!selectedPatient) return [];
    return [
      {
        id: "tier-1",
        title: "Tier 1",
        subtitle: "Immediate Clinical Snapshot",
        Icon: Stethoscope,
        accent: "from-blue-500 to-indigo-600",
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        items: [
          `Primary diagnosis: ${selectedPatient.diagnoses[0]}`,
          `Current med: ${selectedPatient.medications[0] || "N/A"}`,
          `Next visit: ${selectedPatient.upcomingAppointments[0]?.date || "Not scheduled"}`,
        ],
      },
      {
        id: "tier-2",
        title: "Tier 2",
        subtitle: "Extended Clinical Context",
        Icon: Activity,
        accent: "from-purple-500 to-fuchsia-600",
        badge: "bg-purple-50 text-purple-700 border-purple-200",
        items: [
          `Secondary diagnosis: ${selectedPatient.diagnoses[1] || "None listed"}`,
          `Last visit: ${selectedPatient.lastVisit}`,
          `Insurance: ${selectedPatient.insuranceProvider}`,
        ],
      },
      {
        id: "tier-3",
        title: "Tier 3",
        subtitle: "Operational / Coordination Data",
        Icon: Layers3,
        accent: "from-emerald-500 to-teal-600",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        items: [
          `Patient since: ${selectedPatient.patientSince}`,
          `Contact: ${selectedPatient.contact.phone}`,
          `Upcoming type: ${selectedPatient.upcomingAppointments[0]?.type || "N/A"}`,
        ],
      },
      {
        id: "tier-4",
        title: "Tier 4",
        subtitle: "Reference & Supporting Data",
        Icon: Database,
        accent: "from-amber-500 to-orange-600",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        items: [
          `MRN: ${selectedPatient.mrn}`,
          `Email: ${selectedPatient.contact.email}`,
          `Address: ${selectedPatient.contact.address}`,
        ],
      },
    ];
  }, [selectedPatient]);

  if (!selectedPatient) {
    return <div className="h-full bg-white" />;
  }

  return (
    <div className="h-full bg-white overflow-auto">
      <div className="px-8 py-6 border-b border-gray-200 shadow-sm">
        <div className="flex items-start gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-gray-900">{selectedPatient.name}</h1>
              {onChangePatient && (
                <button
                  onClick={onChangePatient}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-2 py-1 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                >
                  Change Patient
                </button>
              )}
            </div>
            <p className="text-gray-500 mt-1">
              {selectedPatient.age}yo {selectedPatient.gender} · MRN {selectedPatient.mrn} · {selectedPatient.diagnoses[0]}
            </p>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8">
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          {(
            [
              { id: "overview", label: "Overview", Icon: ClipboardList },
              { id: "labs", label: "Labs", Icon: FlaskConical },
              { id: "reports", label: "Reports", Icon: FileText },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                activeTab === id
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
              {selectedPatient.diagnoses[0]}
            </span>
            {selectedPatient.diagnoses[1] && (
              <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                {selectedPatient.diagnoses[1]}
              </span>
            )}
            <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {selectedPatient.medications[0]}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Upcoming</p>
              <p className="text-sm text-gray-900 mt-1">{selectedPatient.upcomingAppointments[0]?.date || "N/A"}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Appointment Type</p>
              <p className="text-sm text-gray-900 mt-1">{selectedPatient.upcomingAppointments[0]?.type || "N/A"}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Phone</p>
              <p className="text-sm text-gray-900 mt-1">{selectedPatient.contact.phone}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Insurance</p>
              <p className="text-sm text-gray-900 mt-1">{selectedPatient.insuranceProvider}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {activeTab === "overview" && (
          <div className="flex gap-6 items-start">
            {/* Left: Patient Overview */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <CalendarClock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900">Patient Overview</h3>
              </div>
              <div className="flex flex-col gap-2">
                {overviewItems.map((item) => (
                  <div key={item.label} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wide">{item.label}</p>
                    <p className="text-sm text-gray-900 mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Tiered Clinical View */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Tiered Clinical View</h3>
              </div>
              <div className="flex flex-col gap-4">
                {tierSections.map((tier) => (
                  <div key={tier.id} className="relative rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className={`absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r ${tier.accent}`} />
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <tier.Icon className="w-4 h-4 text-gray-700" />
                          </div>
                          <h4 className="text-base font-semibold text-gray-900">{tier.title}</h4>
                        </div>
                        <span className={`text-[11px] px-2 py-1 rounded-full border ${tier.badge}`}>
                          {tier.subtitle}
                        </span>
                      </div>
                      <ul className="mt-3 space-y-2">
                        {tier.items.map((item) => (
                          <li key={item} className="text-sm text-gray-700 flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === "labs" && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-gray-700">
            Labs tab content can be expanded here as needed.
          </div>
        )}
        {activeTab === "reports" && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-gray-700">
            Reports tab content can be expanded here as needed.
          </div>
        )}
      </div>
    </div>
  );
}
