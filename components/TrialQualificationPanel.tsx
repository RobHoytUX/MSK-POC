import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, CheckCircle2, XCircle, HelpCircle, ChevronRight,
  FlaskConical, ShieldCheck, AlertTriangle, Dna, Pill,
  Stethoscope, Scale, Users, Info, ChevronDown, ChevronUp,
  ExternalLink
} from "lucide-react";
import type { Patient } from "../lib/patients";
import {
  evaluateKeytrudaQualification,
  type CriterionResult,
  type OverallStatus,
} from "../lib/keytrudaEligibility";

interface TrialQualificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | undefined;
  onOpenTrials?: () => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  "Demographics":                    <Users className="w-4 h-4" />,
  "Disease Characteristics":         <Stethoscope className="w-4 h-4" />,
  "Clinical Status":                 <ShieldCheck className="w-4 h-4" />,
  "Biomarkers (FDA BEST Framework)": <Dna className="w-4 h-4" />,
  "Treatment & Medication History":  <Pill className="w-4 h-4" />,
  "Functional & Cognitive Status":   <FlaskConical className="w-4 h-4" />,
  "Ethical & Regulatory":            <Scale className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  "Demographics":                    "text-blue-600 bg-blue-50 border-blue-100",
  "Disease Characteristics":         "text-indigo-600 bg-indigo-50 border-indigo-100",
  "Clinical Status":                 "text-emerald-600 bg-emerald-50 border-emerald-100",
  "Biomarkers (FDA BEST Framework)": "text-violet-600 bg-violet-50 border-violet-100",
  "Treatment & Medication History":  "text-amber-600 bg-amber-50 border-amber-100",
  "Functional & Cognitive Status":   "text-cyan-600 bg-cyan-50 border-cyan-100",
  "Ethical & Regulatory":            "text-pink-600 bg-pink-50 border-pink-100",
};

function StatusIcon({ status }: { status: CriterionResult['status'] }) {
  if (status === 'met')
    return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
  if (status === 'not_met')
    return <XCircle className="w-5 h-5 text-red-500 shrink-0" />;
  return <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" />;
}

function OverallBadge({ status, score }: { status: OverallStatus; score: number }) {
  const cfg = {
    qualified:         { label: 'Qualified',         bg: 'bg-emerald-600', ring: 'ring-emerald-200', Icon: CheckCircle2 },
    likely_qualified:  { label: 'Likely Qualified',  bg: 'bg-cyan-600',    ring: 'ring-cyan-200',    Icon: ShieldCheck  },
    not_qualified:     { label: 'Not Qualified',     bg: 'bg-red-500',     ring: 'ring-red-200',     Icon: XCircle      },
    ineligible:        { label: 'Ineligible',        bg: 'bg-gray-600',    ring: 'ring-gray-300',    Icon: XCircle      },
  }[status];

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${cfg.bg} ring-4 ${cfg.ring} text-white text-sm font-semibold shadow-sm`}>
      <cfg.Icon className="w-4 h-4" />
      {cfg.label}
      <span className="ml-1 opacity-75 text-xs font-medium">· {score}% confidence</span>
    </div>
  );
}

export default function TrialQualificationPanel({
  isOpen,
  onClose,
  patient,
  onOpenTrials,
}: TrialQualificationPanelProps) {
  const [showDrugInfo, setShowDrugInfo] = useState(false);

  const qualification = useMemo(
    () => (patient ? evaluateKeytrudaQualification(patient) : null),
    [patient]
  );

  if (!patient || !qualification) return null;

  // Group by category
  const grouped = qualification.results.reduce<Record<string, CriterionResult[]>>((acc, r) => {
    const cat = r.criterion.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(r);
    return acc;
  }, {});

  const barWidth = `${qualification.confidenceScore}%`;
  const barColor =
    qualification.overallStatus === 'qualified'        ? 'bg-emerald-500' :
    qualification.overallStatus === 'likely_qualified' ? 'bg-cyan-500' :
    qualification.overallStatus === 'ineligible'       ? 'bg-gray-400' : 'bg-red-500';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[55]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[55%] bg-white shadow-2xl z-[60] flex flex-col"
          >
            {/* ── Header ───────────────────────────────────────── */}
            <div className="shrink-0 px-8 py-5 border-b border-gray-200 bg-gradient-to-r from-violet-50 to-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-violet-600 bg-violet-100 px-2 py-0.5 rounded">
                      Pembrolizumab · Keytruda®
                    </span>
                    <span className="text-xs text-gray-500">PD-1 Checkpoint Inhibitor · FDA Approved</span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Clinical Trial Qualification Report</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {patient.name} · {patient.age}yo {patient.gender} · {patient.mrn}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowDrugInfo((v) => !v)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      showDrugInfo
                        ? "bg-violet-600 text-white"
                        : "bg-violet-100 hover:bg-violet-200 text-violet-700"
                    }`}
                    title="Drug information"
                  >
                    <Info className="w-4 h-4" />
                    Drug Info
                    {showDrugInfo ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Drug info expandable */}
              <AnimatePresence>
                {showDrugInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-5 space-y-4">
                      {/* Drug identity */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center shrink-0">
                          <Dna className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900">Pembrolizumab <span className="font-normal text-gray-500">(Keytruda®)</span></h3>
                          <p className="text-xs text-violet-700 font-semibold mt-0.5">PD-1 Monoclonal Antibody · Merck & Co., Inc.</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {['FDA Approved', 'IgG4 Antibody', 'IV Infusion', '200 mg q3w / 400 mg q6w'].map((tag) => (
                              <span key={tag} className="text-[10px] px-2 py-0.5 bg-white border border-violet-200 text-violet-700 rounded-full font-medium">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Mechanism */}
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Mechanism of Action</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          Pembrolizumab is a humanized anti-PD-1 IgG4 monoclonal antibody that blocks the interaction between PD-1 and its ligands PD-L1 and PD-L2. This releases the PD-1 pathway-mediated inhibition of the immune response, enabling T-cells to recognize and destroy cancer cells.
                        </p>
                      </div>

                      {/* FDA Approvals */}
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">FDA-Approved Indications (Selected)</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { tumor: 'NSCLC', detail: 'PD-L1 ≥ 1%, 1L monotherapy or + chemo' },
                            { tumor: 'TNBC', detail: 'PD-L1+ (CPS ≥ 10), neoadjuvant + adjuvant' },
                            { tumor: 'Melanoma', detail: 'Unresectable/metastatic, adjuvant Stage IIB–IV' },
                            { tumor: 'MSI-H / dMMR', detail: 'Tumor-agnostic, any solid tumor' },
                            { tumor: 'HNSCC', detail: 'PD-L1+ (CPS ≥ 1) 1L monotherapy' },
                            { tumor: 'TMB-High', detail: '≥ 10 mut/Mb unresectable solid tumors' },
                          ].map((item) => (
                            <div key={item.tumor} className="bg-white rounded-lg border border-violet-100 px-3 py-2">
                              <p className="text-xs font-semibold text-violet-700">{item.tumor}</p>
                              <p className="text-[11px] text-gray-600 mt-0.5 leading-tight">{item.detail}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Key biomarkers */}
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Key Biomarkers</p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: 'PD-L1 (CPS/TPS)', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
                            { label: 'MSI-H / dMMR', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                            { label: 'TMB-High (≥10 mut/Mb)', color: 'bg-amber-100 text-amber-700 border-amber-200' },
                            { label: 'BRCA1/2 (combo)', color: 'bg-violet-100 text-violet-700 border-violet-200' },
                          ].map((b) => (
                            <span key={b.label} className={`text-xs px-2.5 py-1 rounded-full border font-medium ${b.color}`}>{b.label}</span>
                          ))}
                        </div>
                      </div>

                      {/* Common adverse events */}
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Common Immune-Related Adverse Events</p>
                        <div className="grid grid-cols-3 gap-1.5 text-[11px] text-gray-600">
                          {['Pneumonitis', 'Colitis', 'Hepatitis', 'Endocrinopathy', 'Nephritis', 'Dermatitis', 'Uveitis', 'Myocarditis', 'Neuropathy'].map((ae) => (
                            <div key={ae} className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-md px-2 py-1">
                              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                              {ae}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* External link */}
                      <a
                        href="https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=125514"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 font-medium transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        FDA Drug Approval Label (NDA 125514)
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Overall status + confidence */}
              <div className="mt-4 flex items-center gap-6">
                <OverallBadge status={qualification.overallStatus} score={qualification.confidenceScore} />
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <strong>{qualification.metCount}</strong> criteria met
                  </span>
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <strong>{qualification.unknownCount}</strong> unknown
                  </span>
                  {qualification.notMetCount > 0 && (
                    <span className="flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                      <strong>{qualification.notMetCount}</strong> not met
                    </span>
                  )}
                </div>
              </div>

              {/* Confidence bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Qualification confidence</span>
                  <span className="text-xs font-semibold text-gray-700">{qualification.confidenceScore}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${barColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: barWidth }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  />
                </div>
              </div>
            </div>

            {/* ── Scrollable criteria list ──────────────────────── */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

              {/* Qualifying trials */}
              {qualification.qualifyingTrials.length > 0 && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <FlaskConical className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-sm font-semibold text-emerald-900">Eligible Keytruda Trials</h3>
                  </div>
                  <div className="space-y-2">
                    {qualification.qualifyingTrials.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={onOpenTrials}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-emerald-200 hover:border-emerald-400 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <p className="text-xs font-mono text-emerald-700">{t.nctId}</p>
                          <p className="text-sm font-medium text-gray-900 mt-0.5 leading-snug">{t.name}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Criteria by category */}
              {Object.entries(grouped).map(([category, results]) => {
                const catStyle = categoryColors[category] ?? 'text-gray-600 bg-gray-50 border-gray-100';
                const icon = categoryIcons[category] ?? <Stethoscope className="w-4 h-4" />;
                const hasIssue = results.some((r) => r.status === 'not_met');
                const hasUnknown = results.some((r) => r.status === 'unknown');

                return (
                  <div key={category}>
                    {/* Category header */}
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mb-3 ${catStyle}`}>
                      {icon}
                      <span className="text-xs font-bold uppercase tracking-wide">{category}</span>
                      {hasIssue && (
                        <span className="ml-auto flex items-center gap-1 text-red-600 text-[10px] font-semibold">
                          <AlertTriangle className="w-3 h-3" /> Action needed
                        </span>
                      )}
                      {!hasIssue && hasUnknown && (
                        <span className="ml-auto text-amber-600 text-[10px] font-semibold">Data needed</span>
                      )}
                    </div>

                    {/* Criterion rows */}
                    <div className="space-y-2 ml-1">
                      {results.map((r) => (
                        <div
                          key={r.criterion.id}
                          className={`rounded-xl border p-4 transition-colors ${
                            r.status === 'met'     ? 'border-emerald-200 bg-emerald-50/40' :
                            r.status === 'not_met' ? 'border-red-200 bg-red-50/40' :
                                                     'border-amber-200 bg-amber-50/30'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <StatusIcon status={r.status} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-gray-900">{r.criterion.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                  r.criterion.type === 'inclusion'
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {r.criterion.type === 'inclusion' ? 'Inclusion' : 'Exclusion'}
                                </span>
                                <span className="text-[10px] text-gray-400">· {r.criterion.source}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{r.criterion.description}</p>
                              <div className={`mt-2 text-xs leading-relaxed px-2 py-1.5 rounded-md ${
                                r.status === 'met'     ? 'bg-emerald-100 text-emerald-800' :
                                r.status === 'not_met' ? 'bg-red-100 text-red-800' :
                                                         'bg-amber-100 text-amber-800'
                              }`}>
                                <span className="font-medium">
                                  {r.status === 'met' ? '✓ ' : r.status === 'not_met' ? '✗ ' : '? '}
                                </span>
                                {r.note}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Disclaimer */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-500 leading-relaxed">
                <strong className="text-gray-700">Clinical Disclaimer:</strong> This qualification assessment is generated from available EHR data and is intended as a clinical decision-support tool only. Final enrollment eligibility must be confirmed by the treating oncologist and trial coordinators per the full protocol criteria.
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
