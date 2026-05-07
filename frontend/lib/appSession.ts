export const APP_SESSION_KEY = "msk-poc-session";
export const APP_NAV_KEY = "msk-poc-nav";

export type OnboardingPhase = "patients" | "matching" | null;

export type PersistedAppSession = {
  onboardingPhase: OnboardingPhase;
  cohortPatientIds: string[];
  trialQualifiedPatientIds: string[];
};

export function loadAppSession(validIds: Set<string>): PersistedAppSession {
  try {
    const raw = localStorage.getItem(APP_SESSION_KEY);
    if (!raw) {
      return emptySession();
    }
    const p = JSON.parse(raw) as Partial<PersistedAppSession>;
    let cohort = Array.isArray(p.cohortPatientIds) ? p.cohortPatientIds.filter((id) => validIds.has(id)) : [];
    const trialQ = Array.isArray(p.trialQualifiedPatientIds)
      ? p.trialQualifiedPatientIds.filter((id) => validIds.has(id))
      : [];

    let phase: OnboardingPhase = "patients";
    if (p.onboardingPhase === "matching" || p.onboardingPhase === "patients" || p.onboardingPhase === null) {
      phase = p.onboardingPhase;
    }

    if (cohort.length === 0) {
      return emptySession();
    }

    if (phase === "patients") {
      phase = null;
    }
    if (phase === "matching" && cohort.length < 2) {
      phase = null;
    }

    return {
      onboardingPhase: phase,
      cohortPatientIds: cohort,
      trialQualifiedPatientIds: trialQ.filter((id) => cohort.includes(id)),
    };
  } catch {
    return emptySession();
  }
}

export function emptySession(): PersistedAppSession {
  return { onboardingPhase: "patients", cohortPatientIds: [], trialQualifiedPatientIds: [] };
}

export function saveAppSession(s: PersistedAppSession) {
  localStorage.setItem(APP_SESSION_KEY, JSON.stringify(s));
}

export function clearAppSessionStorage() {
  localStorage.removeItem(APP_SESSION_KEY);
  localStorage.removeItem(APP_NAV_KEY);
}

/** Mirrors `ActiveView` in CancerTreatmentDashboard */
export type PersistedActiveView =
  | "dashboard"
  | "patientChart"
  | "timeline"
  | "trials"
  | "research"
  | "ai";

export type PersistedNav = {
  activeView: PersistedActiveView;
  discoveryTab: "timeline" | "keywords";
  trialDiscoverySidebarOpen: boolean;
};

const VALID_VIEWS: PersistedActiveView[] = [
  "dashboard",
  "patientChart",
  "timeline",
  "trials",
  "research",
  "ai",
];

export function defaultNav(): PersistedNav {
  return {
    activeView: "dashboard",
    discoveryTab: "timeline",
    trialDiscoverySidebarOpen: false,
  };
}

export function loadNavState(): PersistedNav {
  try {
    const raw = localStorage.getItem(APP_NAV_KEY);
    if (!raw) return defaultNav();
    const p = JSON.parse(raw) as Partial<PersistedNav>;
    const av = p.activeView;
    const activeView = VALID_VIEWS.includes(av as PersistedActiveView) ? (av as PersistedActiveView) : "dashboard";
    const discoveryTab = p.discoveryTab === "keywords" ? "keywords" : "timeline";
    const trialDiscoverySidebarOpen =
      typeof p.trialDiscoverySidebarOpen === "boolean"
        ? p.trialDiscoverySidebarOpen
        : discoveryTab === "keywords";
    return { activeView, discoveryTab, trialDiscoverySidebarOpen };
  } catch {
    return defaultNav();
  }
}

export function saveNavState(n: PersistedNav) {
  localStorage.setItem(APP_NAV_KEY, JSON.stringify(n));
}
