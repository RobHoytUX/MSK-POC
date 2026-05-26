import { useMemo, useState, type ReactNode } from "react";
import myChartLogo from "../src/assets/mychart-logo.png";
import { Patient } from "../lib/patients";
import {
  AlertTriangle,
  ArrowUp,
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock,
  FlaskConical,
  HeartPulse,
  Network,
  Newspaper,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
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

function initialsFor(patient?: Patient) {
  if (!patient) return "PT";
  return patient.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function DashboardPage({
  selectedPatient,
  cohortPatients = [],
  onChangePatient,
  onAskAI,
  onOpenNewsFeed,
  trialQualifiedPatientIds = [],
  cohortPatientCount = 0,
  onOpenTrialDiscovery,
  onOpenPatientChart,
}: DashboardPageProps) {
  const [myPatientsOpen, setMyPatientsOpen] = useState(false);

  const patientsForDialog = cohortPatients.length > 0 ? cohortPatients : selectedPatient ? [selectedPatient] : [];

  const activeAlerts = useMemo(
    () =>
      selectedPatient
        ? [
        `Review recent ${selectedPatient.diagnoses[0]} progression details`,
        selectedPatient.upcomingAppointments[0]
          ? `Upcoming appointment: ${selectedPatient.upcomingAppointments[0].type} on ${selectedPatient.upcomingAppointments[0].date}`
          : "No upcoming appointment currently scheduled",
          selectedPatient.medications[0]
            ? `Medication reconciliation due for ${selectedPatient.medications[0]}`
            : "Medication list needs review",
        ]
        : [],
    [selectedPatient],
  );

  const primaryDiagnosis = selectedPatient?.diagnoses[0] ?? "No diagnosis selected";
  const nextAppointment = selectedPatient?.upcomingAppointments[0];
  const primaryMedication = selectedPatient?.medications[0] ?? "No active medication listed";
  const cohortCount = patientsForDialog.length;

  const recentActivity = selectedPatient
    ? [
        {
          id: "last-visit",
          label: "Last Visit",
          title: selectedPatient.lastVisit,
          detail: `Chart reviewed for ${primaryDiagnosis}.`,
          Icon: CalendarClock,
        },
        {
          id: "medication",
          label: "Medication",
          title: primaryMedication,
          detail: "Active treatment context available for AI review.",
          Icon: HeartPulse,
        },
        {
          id: "next-appointment",
          label: "Upcoming",
          title: nextAppointment ? nextAppointment.date : "Not scheduled",
          detail: nextAppointment ? nextAppointment.type : "No appointment is currently scheduled.",
          Icon: Clock,
        },
      ]
    : [];

  const aiInsights = selectedPatient
    ? [
        `Current chart centers on ${primaryDiagnosis} with ${primaryMedication}.`,
        nextAppointment
          ? `Upcoming ${nextAppointment.type.toLowerCase()} gives a near-term checkpoint for care-plan updates.`
          : "No upcoming appointment is scheduled, so follow-up timing should be confirmed.",
        `${activeAlerts.length} chart alert${activeAlerts.length === 1 ? "" : "s"} need review before the next handoff.`,
      ]
    : ["Select a patient to populate Clinical AI insights."];

  const recommendations = selectedPatient
    ? [
        "Open the patient chart to review longitudinal details before making care-plan changes.",
        "Ask Clinical AI to summarize recent progression, medication context, and upcoming appointment prep.",
        activeAlerts[0] ?? "Review chart alerts before the next clinical action.",
      ]
    : ["Choose a patient to generate recommendations."];

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-[#f7f6f3] text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,#fbfaf6_0%,#f4f2ec_60%,#ecead1_100%)]" />
      <div
        className="pointer-events-none absolute inset-[-2000px] opacity-70"
        style={{
          backgroundImage: "radial-gradient(rgba(20,20,20,0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <aside className="absolute left-5 top-[84px] z-20 flex h-[min(540px,calc(100%_-_104px))] w-[380px] flex-col overflow-hidden rounded-[20px] border border-black/10 bg-white/85 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 shadow-[0_0_0_4px_#ece6ff]">
            <Sparkles className="h-4 w-4 animate-pulse text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold">Clinical Intelligence</p>
            <p className="truncate text-sm text-slate-500">
              {selectedPatient ? `Ready for ${selectedPatient.name}` : "Select a patient to begin"}
            </p>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="rounded-2xl bg-violet-50 p-4 ring-1 ring-violet-100">
            <p className="mb-2 font-mono text-[12px] font-semibold uppercase tracking-wide text-violet-600">
              Patient Context
            </p>
            <p className="text-sm leading-relaxed text-slate-700">
              {selectedPatient
                ? `${primaryDiagnosis}. Latest chart focus is ${primaryMedication}, with ${nextAppointment ? `${nextAppointment.type.toLowerCase()} on ${nextAppointment.date}` : "no scheduled follow-up"}.`
                : "Choose a patient to load chart context, alerts, and recommendations."}
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {aiInsights.map((insight) => (
              <div key={insight} className="rounded-2xl bg-white/80 p-3 text-sm leading-relaxed text-slate-600 ring-1 ring-slate-100">
                {insight}
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-slate-100 px-4 py-3">
          <button
            type="button"
            onClick={onAskAI}
            className="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-500 transition hover:border-violet-300 hover:text-violet-700"
          >
            <span className="min-w-0 flex-1 truncate">Ask about this patient...</span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white">
              <ArrowUp className="h-4 w-4" />
            </span>
          </button>
        </div>
      </aside>

      <div
        role="button"
        tabIndex={0}
        onClick={onOpenPatientChart}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpenPatientChart?.();
          }
        }}
        className="absolute right-5 top-5 z-20 w-[380px] rounded-[20px] border border-black/10 bg-white/85 p-4 text-left shadow-2xl backdrop-blur-xl transition hover:border-violet-200 hover:bg-white/95"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-300 text-base font-semibold text-white">
            {initialsFor(selectedPatient)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold">{selectedPatient?.name ?? "No patient selected"}</p>
            <p className="truncate text-sm text-slate-500">
              {selectedPatient ? `${selectedPatient.age}yo ${selectedPatient.gender} · MRN ${selectedPatient.mrn}` : "Open patient selection"}
            </p>
          </div>
        </div>
        {selectedPatient ? (
          <div className="mt-3 flex items-end justify-between gap-3">
            <span className="inline-flex min-w-0 rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-900">
              <span className="truncate">{primaryDiagnosis}</span>
            </span>
            {onChangePatient ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onChangePatient();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    onChangePatient();
                  }
                }}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700"
              >
                <UserRound className="h-3.5 w-3.5" />
                Change Patient
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <aside className="absolute right-5 top-[184px] z-20 w-[380px] overflow-hidden rounded-[20px] border border-black/10 bg-white/85 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <p className="flex-1 text-[13px] font-semibold uppercase tracking-wide text-slate-400">Patient Details & Alerts</p>
          <Bell className="h-4 w-4 text-amber-500" />
        </div>
        <div className="max-h-[calc(100vh-260px)] overflow-y-auto p-4">
          {selectedPatient ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Last Visit", selectedPatient.lastVisit],
                  ["Patient Since", selectedPatient.patientSince],
                  ["Insurance", selectedPatient.insuranceProvider],
                  ["Cohort", `${cohortCount || 1} patient${(cohortCount || 1) === 1 ? "" : "s"}`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-white/80 p-3 ring-1 ring-slate-100">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
                    <p className="mt-1 text-sm font-medium leading-5 text-slate-900">{value}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="mb-2 font-mono text-[12px] font-semibold uppercase tracking-wide text-amber-600">Alerts</p>
                <div className="space-y-2">
                  {activeAlerts.map((alert, idx) => (
                    <Popover key={alert}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex w-full items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-left text-sm leading-relaxed text-amber-950 transition hover:bg-amber-100"
                        >
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                          <span className="line-clamp-2">{alert}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-96 max-w-[calc(100vw-2rem)]" align="end" sideOffset={8}>
                        <p className="mb-2 text-xs font-semibold text-amber-900">Alert {idx + 1}</p>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{alert}</p>
                      </PopoverContent>
                    </Popover>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-slate-500">Select a patient to view demographics, chart alerts, and upcoming care details.</p>
          )}
        </div>
      </aside>

      <main className="relative z-10 h-full overflow-y-auto px-[420px] pb-12 pt-[92px]">
        <div className="mx-auto w-full max-w-5xl space-y-6">
          <section className="rounded-[28px] border border-black/10 bg-white/75 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-violet-600">Dashboard</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-slate-950">Patient action board</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {patientsForDialog.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setMyPatientsOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
                  >
                    <UsersRound className="h-4 w-4" />
                    My Patients
                  </button>
                ) : null}
                {onOpenNewsFeed ? (
                  <button
                    type="button"
                    onClick={onOpenNewsFeed}
                    className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
                  >
                    <Newspaper className="h-4 w-4" />
                    News Feed
                  </button>
                ) : null}
              </div>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              {selectedPatient
                ? `Focused on ${selectedPatient.name}: ${primaryDiagnosis}, active treatment context, alerts, and next care actions.`
                : "Select a patient to populate the dashboard."}
            </p>
          </section>

          <section className="rounded-[24px] border border-black/10 bg-white/80 p-5 shadow-xl backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-violet-600" />
              <h2 className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-violet-600">Recent Activity</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">{item.label}</span>
                      <item.Icon className="h-4 w-4 text-violet-500" />
                    </div>
                    <p className="text-base font-semibold text-slate-950">{item.title}</p>
                    <p className="mt-2 text-sm leading-5 text-slate-500">{item.detail}</p>
                  </div>
                ))
              ) : (
                <p className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-500">
                  No patient activity is available yet.
                </p>
              )}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-[24px] border border-black/10 bg-white/80 p-5 shadow-xl backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-600" />
                <h2 className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-violet-600">AI Insights</h2>
              </div>
              <div className="space-y-3">
                {aiInsights.map((insight) => (
                  <div key={insight} className="rounded-2xl bg-violet-50 p-4 text-sm leading-6 text-slate-700 ring-1 ring-violet-100">
                    {insight}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-black/10 bg-white/80 p-5 shadow-xl backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <h2 className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-emerald-600">Recommendations</h2>
              </div>
              <div className="space-y-3">
                {recommendations.map((recommendation) => (
                  <div key={recommendation} className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm leading-6 text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{recommendation}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {selectedPatient && onOpenTrialDiscovery && cohortPatientCount > 1 ? (
            <section className="rounded-[24px] border border-violet-100 bg-white/80 p-5 shadow-xl backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100">
                  <FlaskConical className="h-5 w-5 text-violet-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-slate-950">
                    {trialQualifiedPatientIds.length > 0 ? "Qualified patients for trials" : "Clinical trial keyword discovery"}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                    {trialQualifiedPatientIds.length > 0
                      ? `${trialQualifiedPatientIds.length} patient${trialQualifiedPatientIds.length === 1 ? "" : "s"} from your cohort met your clinical trial criteria.`
                      : "Explore trial keywords, connections, and the qualified cohort sidebar from Discovery."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenTrialDiscovery}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  <Network className="h-4 w-4" />
                  Open trial discovery
                </button>
              </div>
            </section>
          ) : null}

          <div className="flex items-center gap-3 pb-2">
            <span className="text-sm text-slate-500">Data from:</span>
            <img src={myChartLogo} alt="MyChart powered by Epic" className="h-10 w-auto object-contain" />
          </div>
        </div>
      </main>

      <MyPatientsDialog
        open={myPatientsOpen}
        onOpenChange={setMyPatientsOpen}
        patients={patientsForDialog}
        onChangePatient={onChangePatient}
      />
    </div>
  );
}
