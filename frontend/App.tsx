import { useEffect, useMemo, useState } from "react";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import CancerTreatmentDashboard from "./components/CancerTreatmentDashboard";
import AuthPage from "./components/AuthPage";
import PatientSelectPage from "./components/PatientSelectPage";
import TrialPatientMatchingPage from "./components/TrialPatientMatchingPage";
import { Patient, patients } from "./lib/patients";
import {
  clearAppSessionStorage,
  loadAppSession,
  saveAppSession,
  type OnboardingPhase,
} from "./lib/appSession";

const validPatientIds = new Set(patients.map((p) => p.id));

function AppContent() {
  const { user, loading } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [onboardingPhase, setOnboardingPhase] = useState<OnboardingPhase>("patients");
  const [cohortPatientIds, setCohortPatientIds] = useState<string[]>([]);
  const [trialQualifiedPatientIds, setTrialQualifiedPatientIds] = useState<string[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      clearAppSessionStorage();
      setOnboardingPhase("patients");
      setCohortPatientIds([]);
      setTrialQualifiedPatientIds([]);
      setHydrated(true);
      return;
    }
    const s = loadAppSession(validPatientIds);
    setOnboardingPhase(s.onboardingPhase);
    setCohortPatientIds(s.cohortPatientIds);
    setTrialQualifiedPatientIds(s.trialQualifiedPatientIds);
    setHydrated(true);
  }, [user, loading]);

  useEffect(() => {
    if (!user || !hydrated) return;
    saveAppSession({
      onboardingPhase,
      cohortPatientIds,
      trialQualifiedPatientIds,
    });
  }, [user, hydrated, onboardingPhase, cohortPatientIds, trialQualifiedPatientIds]);

  const selectedPatient = useMemo<Patient | null>(() => {
    const firstId = cohortPatientIds[0];
    if (!firstId) return null;
    return patients.find((p) => p.id === firstId) ?? null;
  }, [cohortPatientIds]);

  if (loading || !hydrated) {
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
            if (ids.length === 1) {
              setTrialQualifiedPatientIds([]);
              setOnboardingPhase(null);
            } else {
              setOnboardingPhase("matching");
            }
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
