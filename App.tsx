import { useEffect, useMemo, useState } from "react";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import CancerTreatmentDashboard from "./components/CancerTreatmentDashboard";
import AuthPage from "./components/AuthPage";
import PatientSelectPage from "./components/PatientSelectPage";
import TrialPatientMatchingPage from "./components/TrialPatientMatchingPage";
import { Patient, patients } from "./lib/patients";

type OnboardingPhase = "patients" | "matching" | null;

function AppContent() {
  const { user, loading } = useAuth();
  const [onboardingPhase, setOnboardingPhase] = useState<OnboardingPhase>("patients");
  const [cohortPatientIds, setCohortPatientIds] = useState<string[]>([]);
  const [trialQualifiedPatientIds, setTrialQualifiedPatientIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setOnboardingPhase("patients");
      setCohortPatientIds([]);
      setTrialQualifiedPatientIds([]);
    }
  }, [user]);

  const selectedPatient = useMemo<Patient | null>(() => {
    const firstId = cohortPatientIds[0];
    if (!firstId) return null;
    return patients.find((p) => p.id === firstId) ?? null;
  }, [cohortPatientIds]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (onboardingPhase === "patients") {
    return (
      <div className="app-light min-h-screen">
        <PatientSelectPage
          initialSelectedPatientIds={cohortPatientIds}
          onContinue={(ids) => {
            setCohortPatientIds(ids);
            setOnboardingPhase("matching");
          }}
        />
      </div>
    );
  }

  if (onboardingPhase === "matching") {
    return (
      <div className="app-light min-h-screen">
        <TrialPatientMatchingPage
          selectedPatientIds={cohortPatientIds}
          onBack={() => setOnboardingPhase("patients")}
          onComplete={(qualifiedIds) => {
            setTrialQualifiedPatientIds(qualifiedIds);
            setOnboardingPhase(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="app-light size-full">
      <CancerTreatmentDashboard
        selectedPatient={selectedPatient ?? undefined}
        cohortPatientIds={cohortPatientIds}
        trialQualifiedPatientIds={trialQualifiedPatientIds}
        onChangePatient={() => {
          setOnboardingPhase("patients");
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
