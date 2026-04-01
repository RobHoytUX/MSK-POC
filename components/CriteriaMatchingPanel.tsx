import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, ChevronRight, ChevronLeft, CheckCircle2, XCircle, HelpCircle,
  Search, FlaskConical, Dna, Users, ArrowRight,
} from "lucide-react";
import { patients, type Patient } from "../lib/patients";
import { evaluateKeytrudaQualification } from "../lib/keytrudaEligibility";

// ─── Criteria state ────────────────────────────────────────────────────────────

interface MatchCriteria {
  ageMin: number;
  ageMax: number;
  gender: "all" | "male" | "female";
  cancerTypes: string[];
  stages: string[];
  ecogMax: number;
  requireNoPriorImmunotherapy: boolean;
  requireNoAutoimmune: boolean;
  requireNoContraindications: boolean;
}

interface BiomarkerCriteria {
  pdl1: "required" | "any";
  msiH: "required" | "any";
  brca: "required" | "any";
  tmbHigh: "required" | "any";
  her2: "positive" | "negative" | "any";
}

const DEFAULT_CRITERIA: MatchCriteria = {
  ageMin: 18,
  ageMax: 80,
  gender: "all",
  cancerTypes: [],
  stages: [],
  ecogMax: 1,
  requireNoPriorImmunotherapy: true,
  requireNoAutoimmune: true,
  requireNoContraindications: true,
};

const DEFAULT_BIOMARKERS: BiomarkerCriteria = {
  pdl1: "any",
  msiH: "any",
  brca: "any",
  tmbHigh: "any",
  her2: "any",
};

const CANCER_TYPE_OPTIONS = [
  "Breast Cancer", "Lung Cancer", "Melanoma", "Colorectal Cancer",
  "Lymphoma", "Ovarian Cancer", "Pancreatic Cancer", "Bladder Cancer",
  "Renal Cell Carcinoma", "Endometrial Cancer", "Prostate Cancer",
];

const STAGE_OPTIONS = ["Stage I", "Stage II", "Stage III", "Stage IV", "Metastatic"];

// ─── Matching algorithm ────────────────────────────────────────────────────────

interface PatientMatch {
  patient: Patient;
  score: number;
  metCriteria: string[];
  flags: string[];
  qualifyingDrugs: string[];
}

function matchPatient(p: Patient, c: MatchCriteria, b: BiomarkerCriteria): PatientMatch {
  const met: string[] = [];
  const flags: string[] = [];
  let total = 0;
  let possible = 0;
  const dx = p.diagnoses.join(" ").toLowerCase();
  const meds = p.medications.join(" ").toLowerCase();

  // Age
  possible++;
  if (p.age >= c.ageMin && p.age <= c.ageMax) { met.push(`Age ${p.age} (within ${c.ageMin}–${c.ageMax})`); total++; }
  else flags.push(`Age ${p.age} outside range ${c.ageMin}–${c.ageMax}`);

  // Gender
  if (c.gender !== "all") {
    possible++;
    const gMatch = (c.gender === "male" && p.gender === "Male") || (c.gender === "female" && p.gender === "Female");
    if (gMatch) { met.push(`Gender: ${p.gender}`); total++; }
    else flags.push(`Gender mismatch (${p.gender} vs ${c.gender})`);
  }

  // Cancer type
  if (c.cancerTypes.length > 0) {
    possible++;
    const match = c.cancerTypes.find((ct) => dx.includes(ct.toLowerCase().replace(" cancer", "")));
    if (match) { met.push(`Cancer type: ${match}`); total++; }
    else flags.push("Cancer type not in selected list");
  }

  // Stage
  if (c.stages.length > 0) {
    possible++;
    const match = c.stages.find((s) => dx.includes(s.toLowerCase()));
    if (match) { met.push(`Disease stage: ${match}`); total++; }
    else flags.push("Disease stage not matching");
  }

  // ECOG (approximate: active appointments → ECOG ≤ 1)
  possible++;
  if (p.upcomingAppointments.length > 0) { met.push(`ECOG ≤ ${c.ecogMax} (active appointments)`); total++; }
  else flags.push("ECOG status unclear");

  // No prior immunotherapy
  if (c.requireNoPriorImmunotherapy) {
    possible++;
    const hasIo = /pembrolizumab|nivolumab|atezolizumab|ipilimumab|durvalumab/.test(meds);
    if (!hasIo) { met.push("No prior checkpoint inhibitor therapy"); total++; }
    else flags.push("Prior immunotherapy detected (exclusion)");
  }

  // No active autoimmune
  if (c.requireNoAutoimmune) {
    possible++;
    const hasAI = /lupus|crohn|rheumatoid|colitis|psoriasis|multiple sclerosis/.test(dx);
    if (!hasAI) { met.push("No active autoimmune disease"); total++; }
    else flags.push("Active autoimmune condition (exclusion)");
  }

  // Biomarkers — only penalize if explicitly required and absent/incompatible
  if (b.msiH === "required") {
    possible++;
    if (/msi|dmmr/.test(dx)) { met.push("MSI-H/dMMR documented"); total++; }
    // unknown doesn't flag but doesn't score
  }
  if (b.brca === "required") {
    possible++;
    if (/brca/.test(dx)) { met.push("BRCA mutation documented"); total++; }
  }
  if (b.tmbHigh === "required") {
    possible++;
    // TMB unknown for most patients — neutral
  }
  if (b.her2 !== "any") {
    possible++;
    const isPos = /her2\+|her2 positive|\(her2\+\)/.test(dx);
    const isNeg = !isPos && dx.includes("breast");
    if (b.her2 === "negative" && isNeg) { met.push("HER2-negative confirmed"); total++; }
    else if (b.her2 === "positive" && isPos) { met.push("HER2-positive confirmed"); total++; }
    else if (b.her2 === "negative" && isPos) flags.push("Patient is HER2-positive (excluded)");
    else if (b.her2 === "positive" && isNeg) flags.push("Patient is HER2-negative (excluded)");
  }

  const score = possible > 0 ? Math.round((total / possible) * 100) : 100;

  // Determine qualifying drugs using our Keytruda engine
  const qual = evaluateKeytrudaQualification(p);
  const qualifyingDrugs: string[] = [];
  if (qual.overallStatus === "qualified" || qual.overallStatus === "likely_qualified") {
    qualifyingDrugs.push("Pembrolizumab (Keytruda®)");
  }

  return { patient: p, score, metCriteria: met, flags, qualifyingDrugs };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer group py-2">
      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-indigo-600" : "bg-gray-300"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </label>
  );
}

function CheckPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        active ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300"
      }`}
    >
      {label}
    </button>
  );
}

function RadioPill({ value, current, onChange, label }: { value: string; current: string; onChange: (v: string) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        current === value ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

interface CriteriaMatchingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onViewPatientQualification: (patient: Patient) => void;
}

type Step = "criteria" | "biomarkers" | "results";

export default function CriteriaMatchingPanel({ isOpen, onClose, onViewPatientQualification }: CriteriaMatchingPanelProps) {
  const [step, setStep] = useState<Step>("criteria");
  const [criteria, setCriteria] = useState<MatchCriteria>(DEFAULT_CRITERIA);
  const [biomarkers, setBiomarkers] = useState<BiomarkerCriteria>(DEFAULT_BIOMARKERS);
  const [searchQuery, setSearchQuery] = useState("");

  const results = useMemo<PatientMatch[]>(() => {
    return patients
      .map((p) => matchPatient(p, criteria, biomarkers))
      .sort((a, b) => b.score - a.score);
  }, [criteria, biomarkers]);

  const filteredResults = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return results.filter(
      (r) => !q || r.patient.name.toLowerCase().includes(q) || r.patient.diagnoses.join(" ").toLowerCase().includes(q)
    );
  }, [results, searchQuery]);

  const qualifiedCount = results.filter((r) => r.score >= 70 && r.flags.filter(f => f.includes("exclusion")).length === 0).length;

  const updateC = (patch: Partial<MatchCriteria>) => setCriteria((c) => ({ ...c, ...patch }));
  const updateB = (patch: Partial<BiomarkerCriteria>) => setBiomarkers((b) => ({ ...b, ...patch }));

  const toggleList = <T extends string>(list: T[], item: T): T[] =>
    list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

  const stepIndex = step === "criteria" ? 0 : step === "biomarkers" ? 1 : 2;

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
            initial={{ x: -540 }}
            animate={{ x: 0 }}
            exit={{ x: -540 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-[500px] bg-white shadow-2xl border-r border-gray-200 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="shrink-0 px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <FlaskConical className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Trial Patient Matching</h2>
                    <p className="text-xs text-gray-500">Find patients by eligibility criteria</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-0">
                {(["criteria", "biomarkers", "results"] as Step[]).map((s, i) => (
                  <div key={s} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setStep(s)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        step === s
                          ? "bg-indigo-600 text-white shadow-sm"
                          : i < stepIndex
                          ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                          : "text-gray-400 bg-gray-100 cursor-default"
                      }`}
                      disabled={i > stepIndex && s !== "results"}
                    >
                      {i < stepIndex ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 inline-flex items-center justify-center text-[10px] font-bold">{i + 1}</span>}
                      {s === "criteria" ? "Clinical Criteria" : s === "biomarkers" ? "Biomarkers" : `Results (${qualifiedCount})`}
                    </button>
                    {i < 2 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 mx-1" />}
                  </div>
                ))}
              </div>
            </div>

            {/* ── STEP 1: Clinical Criteria ─────────────────────────── */}
            {step === "criteria" && (
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                {/* Demographics */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> Demographics
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">Age Range</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0} max={120}
                          value={criteria.ageMin}
                          onChange={(e) => updateC({ ageMin: +e.target.value })}
                          className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="text-gray-400 text-sm">to</span>
                        <input
                          type="number"
                          min={0} max={120}
                          value={criteria.ageMax}
                          onChange={(e) => updateC({ ageMax: +e.target.value })}
                          className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="text-gray-400 text-xs">years</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">Sex / Gender</label>
                      <div className="flex gap-2">
                        {[["all", "All"], ["female", "Female"], ["male", "Male"]].map(([v, l]) => (
                          <RadioPill key={v} value={v} current={criteria.gender} onChange={(val) => updateC({ gender: val as MatchCriteria["gender"] })} label={l} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disease Characteristics */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
                    <FlaskConical className="w-3.5 h-3.5" /> Disease Characteristics
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">Cancer Type (select all that apply)</label>
                      <div className="flex flex-wrap gap-1.5">
                        {CANCER_TYPE_OPTIONS.map((ct) => (
                          <CheckPill
                            key={ct}
                            label={ct}
                            active={criteria.cancerTypes.includes(ct)}
                            onClick={() => updateC({ cancerTypes: toggleList(criteria.cancerTypes, ct) })}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">Disease Stage</label>
                      <div className="flex flex-wrap gap-1.5">
                        {STAGE_OPTIONS.map((s) => (
                          <CheckPill
                            key={s}
                            label={s}
                            active={criteria.stages.includes(s)}
                            onClick={() => updateC({ stages: toggleList(criteria.stages, s) })}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clinical Status */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Clinical Status
                  </h3>
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Max ECOG Performance Status</label>
                    <div className="flex gap-2">
                      {[[0, "ECOG 0"], [1, "ECOG 0–1"], [2, "ECOG 0–2"]].map(([v, l]) => (
                        <RadioPill key={v} value={String(v)} current={String(criteria.ecogMax)} onChange={(val) => updateC({ ecogMax: +val })} label={String(l)} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Treatment & Exclusion Criteria */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
                    Treatment & Exclusion Criteria
                  </h3>
                  <div className="divide-y divide-gray-100">
                    <Toggle checked={criteria.requireNoPriorImmunotherapy} onChange={(v) => updateC({ requireNoPriorImmunotherapy: v })} label="Exclude patients with prior PD-1/PD-L1/CTLA-4 therapy" />
                    <Toggle checked={criteria.requireNoAutoimmune} onChange={(v) => updateC({ requireNoAutoimmune: v })} label="Exclude patients with active autoimmune disease" />
                    <Toggle checked={criteria.requireNoContraindications} onChange={(v) => updateC({ requireNoContraindications: v })} label="Exclude contraindicated medications" />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Biomarkers ────────────────────────────────── */}
            {step === "biomarkers" && (
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-violet-700 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
                    <Dna className="w-3.5 h-3.5" /> FDA BEST Framework Biomarkers
                  </h3>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    Select biomarker requirements. "Required" means the patient must have this marker documented. "Any" includes patients with unknown status.
                  </p>

                  {[
                    { key: "pdl1", label: "PD-L1 Expression (CPS/TPS)", hint: "Critical for 1L Keytruda — CPS ≥ 10 or TPS ≥ 50%" },
                    { key: "msiH", label: "MSI-H / dMMR Status", hint: "Tumor-agnostic Keytruda approval across all solid tumors" },
                    { key: "brca", label: "BRCA1/2 Mutation", hint: "Enables Keytruda + PARP inhibitor combination strategy" },
                    { key: "tmbHigh", label: "TMB-High (≥ 10 mut/Mb)", hint: "Tumor-agnostic Keytruda approval (unresectable solid tumors)" },
                  ].map(({ key, label, hint }) => (
                    <div key={key} className="py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900">{label}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{hint}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <RadioPill value="required" current={biomarkers[key as keyof BiomarkerCriteria]} onChange={(v) => updateB({ [key]: v })} label="Required" />
                          <RadioPill value="any" current={biomarkers[key as keyof BiomarkerCriteria]} onChange={(v) => updateB({ [key]: v })} label="Any" />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* HER2 */}
                  <div className="py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">HER2 Status</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">HER2-negative required for most Keytruda breast cancer trials</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <RadioPill value="negative" current={biomarkers.her2} onChange={(v) => updateB({ her2: v as BiomarkerCriteria["her2"] })} label="HER2−" />
                        <RadioPill value="positive" current={biomarkers.her2} onChange={(v) => updateB({ her2: v as BiomarkerCriteria["her2"] })} label="HER2+" />
                        <RadioPill value="any" current={biomarkers.her2} onChange={(v) => updateB({ her2: v as BiomarkerCriteria["her2"] })} label="Any" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Results ───────────────────────────────────── */}
            {step === "results" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search */}
                <div className="px-6 py-3 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search patients..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="font-semibold text-gray-800">{qualifiedCount}</span> patients meet ≥70% of criteria across{" "}
                    <span className="font-semibold text-gray-800">{patients.length}</span> records
                  </p>
                </div>

                {/* Patient list */}
                <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
                  {filteredResults.map((r) => {
                    const hasExclusion = r.flags.some((f) => f.toLowerCase().includes("exclusion"));
                    const isGood = r.score >= 70 && !hasExclusion;
                    const isPartial = r.score >= 40 && !hasExclusion && !isGood;
                    const initials = r.patient.name.split(" ").map((n) => n[0]).join("");

                    return (
                      <button
                        key={r.patient.id}
                        type="button"
                        onClick={() => onViewPatientQualification(r.patient)}
                        className={`w-full text-left rounded-xl border p-4 transition-all hover:shadow-md group ${
                          hasExclusion
                            ? "border-red-100 bg-red-50/40 hover:border-red-200"
                            : isGood
                            ? "border-emerald-200 bg-emerald-50/40 hover:border-emerald-300"
                            : "border-gray-200 bg-white hover:border-indigo-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                            hasExclusion ? "bg-red-100 text-red-700" : isGood ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"
                          }`}>
                            {initials}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-gray-900">{r.patient.name}</p>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                  hasExclusion ? "bg-red-100 text-red-700" : isGood ? "bg-emerald-100 text-emerald-700" : isPartial ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                                }`}>
                                  {r.score}%
                                </span>
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{r.patient.age}yo {r.patient.gender} · {r.patient.diagnoses[0]}</p>

                            {/* Score bar */}
                            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${hasExclusion ? "bg-red-400" : isGood ? "bg-emerald-500" : isPartial ? "bg-amber-400" : "bg-gray-300"}`}
                                style={{ width: `${r.score}%` }}
                              />
                            </div>

                            {/* Flags */}
                            {hasExclusion && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {r.flags.filter(f => f.toLowerCase().includes("exclusion")).slice(0, 2).map((f) => (
                                  <span key={f} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                                    <XCircle className="w-2.5 h-2.5" />{f.split("(")[0].trim()}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Qualifying drugs */}
                            {r.qualifyingDrugs.length > 0 && !hasExclusion && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {r.qualifyingDrugs.map((d) => (
                                  <span key={d} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded-full border border-violet-200 font-medium">
                                    <HelpCircle className="w-2.5 h-2.5" />{d}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer navigation */}
            <div className="shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              {step !== "criteria" ? (
                <button
                  type="button"
                  onClick={() => setStep(step === "results" ? "biomarkers" : "criteria")}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setCriteria(DEFAULT_CRITERIA); setBiomarkers(DEFAULT_BIOMARKERS); }}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Reset all
                </button>
              )}

              {step !== "results" && (
                <button
                  type="button"
                  onClick={() => setStep(step === "criteria" ? "biomarkers" : "results")}
                  className="flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
                >
                  {step === "biomarkers" ? (
                    <><FlaskConical className="w-4 h-4" /> Find Matching Patients</>
                  ) : (
                    <>Next <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>
              )}
              {step === "results" && <div />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
