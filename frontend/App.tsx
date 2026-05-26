import { useEffect, useMemo, useState, type CSSProperties } from "react";
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
  const [isPatientSelectorOpen, setIsPatientSelectorOpen] = useState(false);
  const [isPatientSelectorVisible, setIsPatientSelectorVisible] = useState(false);

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

  const openPatientSelectorPanel = () => {
    setIsPatientSelectorOpen(true);
    window.setTimeout(() => setIsPatientSelectorVisible(true), 10);
  };

  const closePatientSelectorPanel = () => {
    setIsPatientSelectorVisible(false);
    window.setTimeout(() => setIsPatientSelectorOpen(false), 300);
  };

  if (loading || !hydrated) {
    const shell: CSSProperties = {
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem',
      background: '#f8fafc',
      fontFamily: 'system-ui, sans-serif',
    };
    const text: CSSProperties = {
      margin: 0,
      fontSize: '0.875rem',
      color: '#64748b',
    };
    const spin: CSSProperties = {
      width: '3rem',
      height: '3rem',
      border: '4px solid #e0e7ff',
      borderTopColor: '#4f46e5',
      borderRadius: '9999px',
      animation: 'msk-app-spin 0.85s linear infinite',
    };
    return (
      <>
        <style>{`
          @keyframes msk-app-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div style={shell} role="status" aria-busy="true" aria-live="polite">
          <div style={spin} aria-hidden />
          <p style={text}>Loading…</p>
        </div>
      </>
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
        onChangePatient={openPatientSelectorPanel}
      />
      {isPatientSelectorOpen ? (
        <>
          <button
            type="button"
            aria-label="Close patient selector"
            className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${
              isPatientSelectorVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={closePatientSelectorPanel}
          />
          <aside
            className={`fixed right-0 top-0 z-50 h-full w-[min(920px,calc(100vw-32px))] border-l border-black/10 bg-white shadow-[-24px_0_64px_rgba(15,23,42,0.18)] transition-transform duration-300 ease-out ${
              isPatientSelectorVisible ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <PatientSelectPage
              mode="panel"
              initialSelectedPatientIds={cohortPatientIds}
              onCancel={closePatientSelectorPanel}
              onContinue={(ids) => {
                setCohortPatientIds(ids);
                if (ids.length === 1) {
                  setTrialQualifiedPatientIds([]);
                } else {
                  setTrialQualifiedPatientIds((current) => current.filter((id) => ids.includes(id)));
                }
                closePatientSelectorPanel();
              }}
            />
          </aside>
        </>
      ) : null}
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
