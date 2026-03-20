import { useState } from "react";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import CancerTreatmentDashboard from "./components/CancerTreatmentDashboard";
import AuthPage from "./components/AuthPage";
import PatientSelectPage from "./components/PatientSelectPage";
import { Patient } from "./lib/patients";

function AppContent() {
  const { user, loading } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

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

  if (!selectedPatient) {
    return (
      <div className="app-light min-h-screen">
        <PatientSelectPage onSelectPatient={setSelectedPatient} />
      </div>
    );
  }

  return (
    <div className="app-light size-full">
      <CancerTreatmentDashboard
        selectedPatient={selectedPatient}
        onChangePatient={() => setSelectedPatient(null)}
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
