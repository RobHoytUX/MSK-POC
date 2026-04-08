import { ReactNode, useMemo, useState } from "react";
import myChartLogo from "../src/assets/mychart-logo.png";
import { Patient } from "../lib/patients";
import { CalendarCheck2, FlaskConical, Pill, AlertTriangle, Clock, Search, X, Sparkles, UserRound, Newspaper, Network, UsersRound, ChevronRight } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import MyPatientsDialog from "./MyPatientsDialog";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface DashboardPageProps {
  selectedPatient?: Patient;
  /** Full cohort from onboarding (order preserved; first is primary chart). */
  cohortPatients?: Patient[];
  onChangePatient?: () => void;
  headerActions?: ReactNode;
  onAskAI?: () => void;
  onOpenNewsFeed?: () => void;
  /** IDs of patients who matched trial criteria during onboarding. */
  trialQualifiedPatientIds?: string[];
  cohortPatientCount?: number;
  /** Opens Discovery on Keywords with trial keyword strip + qualified cohort sidebar. */
  onOpenTrialDiscovery?: () => void;
  /** Single-patient cohort: open patient chart in the same side panel as “Open Chart” (not full-page). */
  onOpenPatientChart?: () => void;
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
  cohortPatients = [],
  onChangePatient,
  headerActions,
  onAskAI,
  onOpenNewsFeed,
  trialQualifiedPatientIds = [],
  cohortPatientCount = 0,
  onOpenTrialDiscovery,
  onOpenPatientChart,
}: DashboardPageProps) {
  const { profile, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [myPatientsOpen, setMyPatientsOpen] = useState(false);

  const patientsForDialog = cohortPatients.length > 0 ? cohortPatients : selectedPatient ? [selectedPatient] : [];

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

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Fixed header */}
      <div className="bg-white shadow-sm shrink-0">
        <div className="px-8 pt-6 pb-4">
          {/* Row 1: title + search + header icons — mirrors Timeline row 1 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[27px] font-medium text-gray-900 mb-1">Welcome, {welcomeName}!</h1>
              {selectedPatient ? (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-gray-500 text-base mt-1">
                  {patientsForDialog.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setMyPatientsOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium border border-indigo-200 transition-colors"
                    >
                      <UsersRound className="w-3.5 h-3.5" />
                      My Patients
                    </button>
                  )}
                  {onChangePatient && (
                    <button
                      type="button"
                      onClick={onChangePatient}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium border border-indigo-200 transition-colors"
                    >
                      <UserRound className="w-3.5 h-3.5" />
                      Change Patient
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 mt-1">Action Board</p>
              )}
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

          {/* Row 2: alert badges (left) + primary actions (right) */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1 justify-start">
              {selectedPatient &&
                activeAlerts.map((alert, idx) => (
                  <Popover key={idx}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label={`View alert ${idx + 1} details`}
                        className="inline-flex items-center gap-1.5 max-w-[min(100%,16rem)] pl-2.5 pr-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-950 text-xs font-medium shadow-sm hover:bg-amber-100 transition-colors text-left"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" aria-hidden />
                        <span className="truncate">{alert}</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96 max-w-[calc(100vw-2rem)]" align="start" sideOffset={8}>
                      <p className="text-xs font-semibold text-amber-900 mb-2">Alert {idx + 1}</p>
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{alert}</p>
                    </PopoverContent>
                  </Popover>
                ))}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onOpenNewsFeed && (
                <button
                  onClick={onOpenNewsFeed}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
                >
                  <Newspaper className="w-4 h-4" />
                  News Feed
                </button>
              )}
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

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
      <div className="px-8 pt-10 pb-4 flex flex-col items-center">
        <div className="w-full max-w-5xl -mt-4">

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

        {/* Up Next — cohort summary (click to open full list) */}
        {selectedPatient && patientsForDialog.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-indigo-600" />
              <p className="text-sm font-semibold text-gray-900">My Patients</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (patientsForDialog.length === 1 && onOpenPatientChart) {
                  onOpenPatientChart();
                } else {
                  setMyPatientsOpen(true);
                }
              }}
              className="w-full text-left rounded-2xl border border-gray-200 bg-gradient-to-br from-indigo-50 to-white shadow-sm p-6 hover:border-indigo-300 hover:shadow-md transition-all group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="flex -space-x-2 shrink-0">
                    {patientsForDialog.slice(0, 6).map((p) => (
                      <div
                        key={p.id}
                        className="w-11 h-11 rounded-full bg-indigo-100 border-2 border-white text-indigo-700 flex items-center justify-center text-xs font-bold shadow-sm"
                        title={p.name}
                      >
                        {p.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                    ))}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {patientsForDialog.length} patient{patientsForDialog.length !== 1 ? "s" : ""} in cohort
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Primary chart: {selectedPatient.name} · {selectedPatient.diagnoses[0]}
                    </p>
                    {patientsForDialog.length > 1 && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                        {patientsForDialog.map((p) => p.name).join(" · ")}
                      </p>
                    )}
                    {patientsForDialog.length === 1 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                          {selectedPatient.diagnoses[0]}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {selectedPatient.medications[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
                    View
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Next appointment (primary)</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">
                      {selectedPatient.upcomingAppointments[0]?.date || "Not scheduled"}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Clinical trial keyword discovery — multi-patient cohort only (single-patient flow skips trial onboarding) */}
        {selectedPatient && onOpenTrialDiscovery && cohortPatientCount > 1 && (
          <div className="mb-8 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/90 to-white p-6 shadow-sm flex flex-col">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <FlaskConical className="w-5 h-5 text-violet-700" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {trialQualifiedPatientIds.length > 0
                    ? "Qualified patients for trials"
                    : "Clinical trial keyword discovery"}
                </h3>
                <p className="text-sm text-gray-600 mt-1 max-w-xl">
                  {trialQualifiedPatientIds.length > 0 ? (
                    <>
                      {trialQualifiedPatientIds.length} patient{trialQualifiedPatientIds.length !== 1 ? "s" : ""} from your cohort
                      {cohortPatientCount > 0 ? (
                        <>
                          {" "}
                          (of {cohortPatientCount} selected)
                        </>
                      ) : null}{" "}
                      met your clinical trial criteria. Explore keyword nodes with the qualified list alongside.
                    </>
                  ) : (
                    <>
                      Open Discovery on the Keywords tab to explore BLA trial terms, connections, and the qualified
                      cohort sidebar.{" "}
                      {cohortPatientCount > 0
                        ? "Use clinical trials onboarding to highlight which cohort members meet your criteria."
                        : "Add patients to your cohort to compare qualification across the list."}
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={onOpenTrialDiscovery}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors"
              >
                <Network className="w-4 h-4" />
                Open trial discovery
              </button>
            </div>
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
      </div> {/* end scrollable content */}

      <MyPatientsDialog
        open={myPatientsOpen}
        onOpenChange={setMyPatientsOpen}
        patients={patientsForDialog}
        onChangePatient={onChangePatient}
      />
    </div>
  );
}
