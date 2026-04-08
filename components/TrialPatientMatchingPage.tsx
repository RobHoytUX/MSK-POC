import { useMemo, useState } from "react";
import { ChevronLeft, LogOut, Users } from "lucide-react";
import mapsLogo from "../src/assets/maps-logo.png";
import { patients, type Patient } from "../lib/patients";
import { useAuth } from "../lib/AuthContext";
import { TrialMatchingCriteriaFlow } from "./TrialMatchingCriteriaFlow";
import TrialQualificationPanel from "./TrialQualificationPanel";

interface TrialPatientMatchingPageProps {
  selectedPatientIds: string[];
  onComplete: (qualifiedPatientIds: string[]) => void;
  onBack: () => void;
}

export default function TrialPatientMatchingPage({
  selectedPatientIds,
  onComplete,
  onBack,
}: TrialPatientMatchingPageProps) {
  const { profile, signOut } = useAuth();
  const [qualificationPatient, setQualificationPatient] = useState<Patient | null>(null);
  const [isQualificationOpen, setIsQualificationOpen] = useState(false);

  const patientPool = useMemo(
    () => patients.filter((p) => selectedPatientIds.includes(p.id)),
    [selectedPatientIds]
  );

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <div className="bg-white border-b border-gray-200 shadow-sm shrink-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <img src={mapsLogo} alt="MAPS logo" className="h-[30px] w-[30px] object-contain shrink-0" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Clinical Trials</h1>
                <p className="text-sm text-gray-500">Define criteria, then compare patients in your cohort</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{patientPool.length} in cohort</span>
              </div>
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Patient select
              </button>
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                  <p className="text-xs text-gray-500">{profile?.specialty || "Physician"}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  {profile?.avatar_initials || "U"}
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-4 pb-4 flex flex-col">
        {patientPool.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-gray-200 bg-white">
            <p className="text-gray-600 mb-4">No patients in your cohort. Go back and select at least one patient.</p>
            <button type="button" onClick={onBack} className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-medium">
              Back to patient select
            </button>
          </div>
        ) : (
          <TrialMatchingCriteriaFlow
            patientPool={patientPool}
            variant="page"
            onViewPatientQualification={(p) => {
              setQualificationPatient(p);
              setIsQualificationOpen(true);
            }}
            onPageComplete={onComplete}
          />
        )}
      </div>

      <TrialQualificationPanel
        isOpen={isQualificationOpen}
        onClose={() => {
          setIsQualificationOpen(false);
          setQualificationPatient(null);
        }}
        patient={qualificationPatient ?? undefined}
        onOpenTrials={() => setIsQualificationOpen(false)}
      />
    </div>
  );
}
