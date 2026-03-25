import { ReactNode, useMemo, useState } from "react";
import myChartLogo from "../src/assets/mychart-logo.png";
import { Patient } from "../lib/patients";
import { getQualifiedTrialIds } from "../lib/trialQualification";
import { clinicalTrialsData } from "./ClinicalTrialsPage";
import { CalendarCheck2, FlaskConical, Pill, AlertTriangle, Clock, Search, X, FileText, Sparkles } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import PatientChartPage from "./PatientChartPage";

interface DashboardPageProps {
  selectedPatient?: Patient;
  onChangePatient?: () => void;
  onOpenPatientChart?: () => void;
  headerActions?: ReactNode;
  onAskAI?: () => void;
  /** Opens Clinical Trials; defaults to the Qualified tab unless `listTab` is `"all"`. */
  onOpenClinicalTrials?: (opts?: { trialId?: string; listTab?: "all" | "qualified" }) => void;
}

const cards = [
  {
    id: "visits",
    title: "Visits",
    subtitle: "Upcoming appointments and care history",
    Icon: CalendarCheck2,
    accent: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    id: "test-results",
    title: "Test Results",
    subtitle: "Latest labs, imaging, and diagnostics",
    Icon: FlaskConical,
    accent: "from-purple-500 to-fuchsia-600",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    id: "meds",
    title: "Meds",
    subtitle: "Active medications and refill status",
    Icon: Pill,
    accent: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

export default function DashboardPage({
  selectedPatient,
  headerActions,
  onAskAI,
  onOpenClinicalTrials,
}: DashboardPageProps) {
  const { profile, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isChartVisible, setIsChartVisible] = useState(false);

  const openChart = () => {
    setIsChartOpen(true);
    setTimeout(() => setIsChartVisible(true), 10);
  };

  const closeChart = () => {
    setIsChartVisible(false);
    setTimeout(() => setIsChartOpen(false), 300);
  };
  const welcomeName = useMemo(() => {
    const fromProfile = profile?.full_name?.trim();
    if (fromProfile) return fromProfile;
    const email = user?.email?.split("@")[0];
    if (email) return email;
    return "there";
  }, [profile?.full_name, user?.email]);

  const activeAlerts = selectedPatient
    ? [
        `Review recent ${selectedPatient.diagnoses[0]} progression details`,
        selectedPatient.upcomingAppointments[0]
          ? `Upcoming appointment: ${selectedPatient.upcomingAppointments[0].type} on ${selectedPatient.upcomingAppointments[0].date}`
          : "No upcoming appointment currently scheduled",
      ]
    : [];

  const qualifiedTrialIds = useMemo(
    () => (selectedPatient ? getQualifiedTrialIds(selectedPatient) : []),
    [selectedPatient]
  );
  const qualifiedTrialsForUi = useMemo(
    () =>
      qualifiedTrialIds
        .map((id) => clinicalTrialsData.find((t) => t.id === id))
        .filter((t): t is NonNullable<typeof t> => Boolean(t)),
    [qualifiedTrialIds]
  );

  return (
    <div className="h-full bg-white overflow-auto">
      <div className="bg-white">
        <div className="px-8 py-6">
          {/* Row 1: title + search + header icons — mirrors Timeline row 1 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[27px] font-medium text-gray-900 mb-1">Action Board</h1>
              <p className="text-gray-500">Welcome, {welcomeName}!</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
              {headerActions}
            </div>
          </div>

          {/* Row 2: action buttons right — mirrors Timeline row 2 */}
          <div className="flex items-center justify-end gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={openChart}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors"
              >
                <FileText className="w-4 h-4" />
                Open Chart
              </button>
              <button
                onClick={onAskAI}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Ask AI
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-4 -mt-6 flex flex-col items-center">
        <div className="w-full max-w-5xl -mt-4">

        {/* Up Next — patient summary card only */}
        {selectedPatient && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-indigo-600" />
              <p className="text-sm font-semibold text-gray-900">My Patient</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-indigo-50 to-white shadow-sm p-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center font-semibold">
                    {selectedPatient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedPatient.name}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedPatient.age}yo {selectedPatient.gender} · MRN {selectedPatient.mrn}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                        {selectedPatient.diagnoses[0]}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {selectedPatient.medications[0]}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="min-w-[200px] text-right">
                  <p className="text-xs text-gray-500">Next appointment</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {selectedPatient.upcomingAppointments[0]?.date || "Not scheduled"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="w-full flex flex-row gap-4 mb-8">
          {cards.map((card) => (
            <div
              key={card.id}
              className="relative flex-1 h-56 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden"
            >
              <div className={`absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r ${card.accent}`} />
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                    <card.Icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">Overview</span>
                </div>

                <div className="mt-5">
                  <h2 className="text-2xl font-semibold text-gray-900">{card.title}</h2>
                  <p className="text-sm text-gray-500 mt-2">{card.subtitle}</p>
                </div>

                <div className="mt-auto pt-4">
                  <button className="w-full h-10 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
                    Open {card.title}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedPatient && activeAlerts.length > 0 && (
          <div className="mb-8 rounded-2xl border border-amber-100 bg-amber-50/50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <h3 className="text-sm font-semibold text-amber-900">Active Alerts</h3>
            </div>
            <div className="flex flex-col gap-2">
              {activeAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-amber-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm"
                >
                  {alert}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedPatient && onOpenClinicalTrials && (
          <div className="mb-8 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-semibold text-emerald-900">Clinical trial qualification</h3>
            </div>
            {qualifiedTrialsForUi.length > 0 ? (
              <>
                <p className="text-sm text-gray-800 mb-3">
                  This patient is flagged as potentially qualified for{" "}
                  <span className="font-semibold">{qualifiedTrialsForUi.length}</span> demo trial
                  {qualifiedTrialsForUi.length !== 1 ? "s" : ""} based on diagnosis rules.
                </p>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                  {qualifiedTrialsForUi.map((trial) => (
                    <button
                      key={trial.id}
                      type="button"
                      onClick={() => onOpenClinicalTrials({ trialId: trial.id })}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
                    >
                      Open {trial.nctId}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => onOpenClinicalTrials()}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-emerald-600 text-emerald-800 hover:bg-emerald-100 text-sm font-medium transition-colors"
                  >
                    View all qualified trials
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  No matching demo clinical trials for this patient&apos;s current diagnoses.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenClinicalTrials({ listTab: "all" })}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium transition-colors"
                >
                  Browse all trials
                </button>
              </div>
            )}
          </div>
        )}

        {selectedPatient && (
          <div className="mb-10 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden />
              <h3 className="text-sm font-semibold text-indigo-900">AI Insights and Recommendations</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-indigo-200 bg-white px-4 py-3">
                <p className="text-xs text-indigo-700 font-medium mb-1">Insight</p>
                <p className="text-sm text-gray-800">
                  Current diagnosis and medication profile suggest stable short-term follow-up trajectory.
                </p>
              </div>
              <div className="rounded-lg border border-indigo-200 bg-white px-4 py-3">
                <p className="text-xs text-indigo-700 font-medium mb-1">Recommendation</p>
                <p className="text-sm text-gray-800">
                  Prioritize review of upcoming appointment prep and latest lab trends before chart round.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="w-full flex items-center gap-3 mb-8">
          <span className="text-sm text-gray-600">Data from :</span>
          <img src={myChartLogo} alt="MyChart powered by Epic" className="h-10 w-auto object-contain" />
        </div>

        </div> {/* end max-w-5xl wrapper */}
      </div>

      {/* Patient Chart Side Panel */}
      {isChartOpen && (
        <>
          {/* Overlay */}
          <div
            className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${isChartVisible ? "opacity-100" : "opacity-0"}`}
            onClick={closeChart}
          />
          {/* Panel — 50% width, full height */}
          <div
            className={`fixed top-0 right-0 h-full w-1/2 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${isChartVisible ? "translate-x-0" : "translate-x-full"}`}
          >
            <PatientChartPage
              selectedPatient={selectedPatient}
              onBack={closeChart}
            />
          </div>
        </>
      )}
    </div>
  );
}
