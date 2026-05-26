import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { LayoutDashboard, Calendar as CalendarIcon, FileText, Activity, Sparkles, X, Send, Mic, Paperclip, History, CalendarDays, Bell, Layers3, UserRound, UsersRound, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import ClinicalTrialsPage from "./ClinicalTrialsPage";
import TrendingResearchPage from "./TrendingResearchPage";
import AIPage from "./AIPage";
import DashboardPage from "./DashboardPage";
import PatientChartPage from "./PatientChartPage";
import PatientChartSidePanel from "./PatientChartSidePanel";
import NewsFeedPanel from "./NewsFeedPanel";
import {
  QuantumPanel,
  DoctorFeed,
  ArticleReader,
  type DoctorFeedCanvasBridge,
  type PendingDoctorFeedConnection,
} from './keywords-wave';
import InfiniteKeywordCanvasView from './InfiniteKeywordCanvasView';
import {
  findTreeNodeById,
  type TreeNode,
} from "../lib/treeTaxonomy";
import { buildKeywordTreeForPatient, fetchKeywordTree } from '../lib/api';
import { postClinicalChat, resolveClinicalPatientId } from "../lib/clinicalIntelligence";
import ComparePatientPanel from './ComparePatientPanel';
import PatientComparisonView from './PatientComparisonView';
import TrialQualificationPanel from './TrialQualificationPanel';
import CriteriaMatchingPanel from './CriteriaMatchingPanel';
import QualifiedTrialPatientsSidebar from './QualifiedTrialPatientsSidebar';
import TrialKeywordCanvas from "./TrialKeywordCanvas";
import KeywordAnalysisPanel from "./KeywordAnalysisPanel";
import type { FdaKeyword } from "../lib/keytrudaFdaKeywords";
import { useAuth } from '../lib/AuthContext';
import ProfilePanel from './ProfilePanel';
import NotificationsPanel from './NotificationsPanel';
import { Patient, patients } from '../lib/patients';
import { getDiscoveryTimelineForPatient } from "../lib/discoveryTimeline";
import { loadNavState, saveNavState, type PersistedNav } from '../lib/appSession';

interface ClinicalAiPanelMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  references?: { title: string; pmid: string; journal: string; link: string }[];
  assistantStatus?: "success" | "blocked";
}

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  details: string;
  severity?: "Emergency" | "Severe" | "Follow Up";
}

const timelineData: {
  diagnosis: TimelineEvent[];
  treatment: TimelineEvent[];
  monitoring: TimelineEvent[];
  sideEffects: TimelineEvent[];
  labs: TimelineEvent[];
  documentation: TimelineEvent[];
} = {
  diagnosis: [
    {
      id: "diagnosis-1",
      date: "Jan 15",
      title: "Initial Diagnosis" as const,
      description: "Stage II Breast Cancer diagnosed",
      details: "Tumor size: 2.5cm, ER+/PR+, HER2-. Recommended treatment plan includes neoadjuvant chemotherapy followed by surgery.",
      severity: "Severe" as const
    },
    {
      id: "diagnosis-2",
      date: "Apr 20",
      title: "Genetic Testing" as const,
      description: "BRCA1/2 results received",
      details: "BRCA1 negative, BRCA2 negative. Family history assessment completed. No hereditary cancer syndrome detected.",
      severity: "Follow Up" as const
    },
    {
      id: "diagnosis-3",
      date: "Sep 10",
      title: "Staging Update" as const,
      description: "Post-treatment restaging",
      details: "Significant tumor response to chemotherapy. Tumor size reduced to 1.2cm. Proceeding with surgical planning."
    }
  ],
  treatment: [
    {
      id: "treatment-1",
      date: "Jan 28",
      title: "Chemotherapy Initiated" as const,
      description: "AC-T protocol started",
      details: "Adriamycin + Cyclophosphamide for 4 cycles, followed by Paclitaxel for 12 weeks. Port placement completed."
    },
    {
      id: "treatment-2",
      date: "Apr 5",
      title: "Radiation Planning" as const,
      description: "Simulation session completed",
      details: "CT simulation performed. Treatment field mapped. Planning to begin 6 weeks post-surgery."
    },
    {
      id: "treatment-3",
      date: "Jul 12",
      title: "Immunotherapy" as const,
      description: "Started checkpoint inhibitor",
      details: "Pembrolizumab initiated as part of clinical trial. First infusion well-tolerated with mild fatigue."
    },
    {
      id: "treatment-4",
      date: "Oct 8",
      title: "Surgery Scheduled" as const,
      description: "Lumpectomy procedure",
      details: "Breast-conserving surgery with sentinel lymph node biopsy scheduled. Pre-operative clearance obtained."
    }
  ],
  monitoring: [
    {
      id: "monitoring-1",
      date: "Feb 1",
      title: "Tumor Markers" as const,
      description: "CA 15-3 levels checked",
      details: "Baseline tumor markers established. CA 15-3: 22 U/mL (within normal range). Will monitor monthly during treatment."
    },
    {
      id: "monitoring-2",
      date: "May 15",
      title: "CT Scan" as const,
      description: "Chest/Abdomen/Pelvis imaging",
      details: "No evidence of metastatic disease. Primary tumor showing response to chemotherapy with 40% size reduction."
    },
    {
      id: "monitoring-3",
      date: "Aug 20",
      title: "Cardiac Function" as const,
      description: "MUGA scan performed",
      details: "Left ventricular ejection fraction: 58% (normal). No cardiotoxicity from chemotherapy observed."
    },
    {
      id: "monitoring-4",
      title: "PET Scan" as const,
      date: "Nov 2",
      description: "Full body metabolic imaging",
      details: "FDG-PET/CT shows complete metabolic response. No residual hypermetabolic activity in breast or lymph nodes."
    }
  ],
  sideEffects: [
    {
      id: "sideeffects-1",
      date: "Feb 10",
      title: "Neutropenia" as const,
      description: "Low white blood cell count",
      details: "Grade 2 neutropenia detected. Neulasta prescribed for subsequent cycles. Patient advised on infection precautions.",
      severity: "Emergency" as const
    },
    {
      id: "sideeffects-2",
      date: "Jun 18",
      title: "Peripheral Neuropathy" as const,
      description: "Tingling in hands and feet",
      details: "Grade 1 chemotherapy-induced peripheral neuropathy. Vitamin B complex started. Dose adjustment considered.",
      severity: "Follow Up" as const
    },
    {
      id: "sideeffects-3",
      date: "Oct 25",
      title: "Fatigue Management" as const,
      description: "Energy level consultation",
      details: "Persistent fatigue addressed. Exercise program initiated. Nutritional counseling provided. Sleep hygiene reviewed."
    }
  ],
  labs: [
    {
      id: "labs-1",
      date: "Jan 20",
      title: "CBC Panel" as const,
      description: "Complete blood count",
      details: "WBC: 6.8 K/uL, Hemoglobin: 13.2 g/dL, Platelets: 245 K/uL. All values within normal limits."
    },
    {
      id: "labs-2",
      date: "Mar 15",
      title: "Liver Function" as const,
      description: "Hepatic panel results",
      details: "AST: 28 U/L, ALT: 32 U/L, Total Bilirubin: 0.8 mg/dL. Liver function normal, safe to continue chemotherapy.",
      severity: "Severe" as const
    },
    {
      id: "labs-3",
      date: "Jul 5",
      title: "Kidney Function" as const,
      description: "Renal panel assessment",
      details: "Creatinine: 0.9 mg/dL, BUN: 15 mg/dL, eGFR: >60. Kidney function excellent, no dose adjustments needed."
    },
    {
      id: "labs-4",
      date: "Nov 10",
      title: "Hormone Receptors" as const,
      description: "ER/PR testing updated",
      details: "Estrogen Receptor: 85% positive, Progesterone Receptor: 70% positive. Recommending hormonal therapy post-surgery."
    }
  ],
  documentation: [
    {
      id: "doc-1",
      date: "Jan 16",
      title: "Treatment Consent" as const,
      description: "Chemotherapy agreement signed",
      details: "Patient counseled on risks, benefits, and alternatives. All questions addressed. Signed consent for AC-T protocol."
    },
    {
      id: "doc-2",
      date: "Apr 28",
      title: "Care Plan Updated" as const,
      description: "Treatment roadmap revised",
      details: "Updated care plan includes genetic counseling referral and fertility preservation discussion. Patient copy provided."
    },
    {
      id: "doc-3",
      date: "Aug 20",
      title: "Progress Notes" as const,
      description: "Mid-treatment assessment",
      details: "Comprehensive progress review completed. Patient tolerating treatment well. On track with planned protocol."
    },
    {
      id: "doc-4",
      date: "Nov 5",
      title: "Surgical Consent" as const,
      description: "Pre-operative documentation",
      details: "Surgical procedure, risks, and recovery discussed. Patient understands reconstruction options. All documents signed."
    }
  ]
};

const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Keywords extracted from timeline events
const keywords = [
  {
    id: "kw-1",
    label: "Stage II Breast Cancer",
    category: "Diagnosis",
    description: "The patient was diagnosed with Stage II breast cancer, indicating a localized tumor between 2-5cm with possible lymph node involvement.",
    color: "purple"
  },
  {
    id: "kw-2",
    label: "ER+/PR+ HER2-",
    category: "Diagnosis",
    description: "Hormone receptor positive (Estrogen and Progesterone positive), HER2 negative. This profile indicates the cancer responds to hormonal therapy.",
    color: "purple"
  },
  {
    id: "kw-3",
    label: "AC-T Chemotherapy",
    category: "Treatment",
    description: "Combined chemotherapy protocol: Adriamycin + Cyclophosphamide followed by Taxol (Paclitaxel). Standard neoadjuvant treatment for breast cancer.",
    color: "blue"
  },
  {
    id: "kw-4",
    label: "Pembrolizumab",
    category: "Treatment",
    description: "Checkpoint inhibitor immunotherapy used as part of a clinical trial to enhance the immune system's ability to fight cancer cells.",
    color: "blue"
  },
  {
    id: "kw-5",
    label: "Neutropenia",
    category: "Side Effect",
    description: "Low white blood cell count, a common side effect of chemotherapy that increases infection risk. Managed with growth factor support.",
    color: "amber"
  },
  {
    id: "kw-6",
    label: "Peripheral Neuropathy",
    category: "Side Effect",
    description: "Nerve damage causing tingling and numbness in hands and feet, typically caused by taxane-based chemotherapy.",
    color: "amber"
  },
  {
    id: "kw-7",
    label: "Tumor Markers",
    category: "Monitoring",
    description: "CA 15-3 blood test used to monitor cancer activity and treatment response. Levels tracked monthly during active treatment.",
    color: "emerald"
  },
  {
    id: "kw-8",
    label: "Complete Metabolic Response",
    category: "Monitoring",
    description: "PET scan showing no active cancer metabolism, indicating excellent response to treatment with no residual disease detected.",
    color: "emerald"
  },
  {
    id: "kw-9",
    label: "Lumpectomy",
    category: "Treatment",
    description: "Breast-conserving surgery to remove the tumor while preserving most of the breast tissue, followed by radiation therapy.",
    color: "blue"
  },
  {
    id: "kw-10",
    label: "BRCA Negative",
    category: "Diagnosis",
    description: "Genetic testing confirmed no BRCA1 or BRCA2 mutations, indicating no hereditary breast cancer syndrome.",
    color: "purple"
  }
];

const getSeverityStyles = (severity?: "Emergency" | "Severe" | "Follow Up") => {
  const styles = {
    Emergency: "bg-red-50 text-red-700 border-red-200",
    Severe: "bg-orange-50 text-orange-700 border-orange-200",
    "Follow Up": "bg-blue-50 text-blue-700 border-blue-200"
  };
  return severity ? styles[severity] : "";
};

export const getKeywordColor = (color: string) => {
  const colors = {
    purple: "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200",
    cyan: "bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200",
    rose: "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200"
  };
  return colors[color as keyof typeof colors] || colors.blue;
};

type TimelineKeywordChip = (typeof keywords)[number];

function TimelineKeywordChipsScroll({
  keywordList,
  selectedKeyword,
  onSelectKeyword,
  onClear,
}: {
  keywordList: TimelineKeywordChip[];
  selectedKeyword: string | null;
  onSelectKeyword: (label: string) => void;
  onClear: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  const updateScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const overflow = scrollWidth > clientWidth + 2;
    setHasOverflow(overflow);
    setCanScroll({
      left: overflow && scrollLeft > 2,
      right: overflow && scrollLeft + clientWidth < scrollWidth - 2,
    });
  }, []);

  useEffect(() => {
    updateScroll();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => updateScroll());
    ro.observe(el);
    return () => ro.disconnect();
  }, [keywordList.length, selectedKeyword, updateScroll]);

  const scrollBy = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div
        ref={scrollRef}
        onScroll={updateScroll}
        className="flex flex-1 min-w-0 items-center gap-3 overflow-x-auto overflow-y-hidden py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {keywordList.map((keyword) => (
          <Popover key={keyword.id}>
            <PopoverTrigger asChild>
              <button
                type="button"
                onClick={() => onSelectKeyword(keyword.label)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs border transition-all ${
                  selectedKeyword === keyword.label ? "ring-2 ring-indigo-500 ring-offset-1" : ""
                } ${getKeywordColor(keyword.color)}`}
              >
                {keyword.label}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80" side="bottom" align="start">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-gray-900">{keyword.label}</h4>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{keyword.category}</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{keyword.description}</p>
              </div>
            </PopoverContent>
          </Popover>
        ))}
        {selectedKeyword && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs text-white bg-indigo-600 hover:bg-indigo-700 border border-indigo-600 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear filter
          </button>
        )}
      </div>
      {hasOverflow && (
        <div className="flex shrink-0 items-center gap-0.5 border-l border-gray-200 pl-2 ml-1">
          <button
            type="button"
            aria-label="Scroll keywords left"
            onClick={() => scrollBy(-220)}
            disabled={!canScroll.left}
            className="p-1.5 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Scroll keywords right"
            onClick={() => scrollBy(220)}
            disabled={!canScroll.right}
            className="p-1.5 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// Function to convert date string to month index
const getMonthIndex = (dateStr: string): number => {
  const monthMap: Record<string, number> = {
    "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
    "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
  };
  const [month] = dateStr.split(' ');
  return monthMap[month];
};

// Convert event date string like "Feb 1" to a comparable day-of-year number
const dateToDayOfYear = (dateStr: string): number => {
  const monthMap: Record<string, number> = {
    "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
    "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
  };
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const [month, day] = dateStr.split(' ');
  const monthIndex = monthMap[month];
  const dayNum = parseInt(day);
  let doy = dayNum;
  for (let i = 0; i < monthIndex; i++) doy += daysInMonth[i];
  return doy;
};

// Function to convert date string to position percentage based on visible months
const getDatePosition = (
  dateStr: string,
  visibleMonths: string[],
  startMonthIndex: number,
  customFrom?: Date,
  customTo?: Date,
) => {
  const monthMap: Record<string, number> = {
    "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
    "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
  };

  const [month, day] = dateStr.split(' ');
  const monthIndex = monthMap[month];
  const dayNum = parseInt(day);

  // For custom date ranges, use exact day positioning
  if (customFrom && customTo) {
    const eventDoy = dateToDayOfYear(dateStr);
    const fromDoy = dateToDayOfYear(`${allMonths[customFrom.getMonth()]} ${customFrom.getDate()}`);
    const toDoy = dateToDayOfYear(`${allMonths[customTo.getMonth()]} ${customTo.getDate()}`);
    const totalRange = toDoy - fromDoy;
    if (totalRange <= 0) return 50;
    const offset = eventDoy - fromDoy;
    if (offset < 0 || offset > totalRange) return -100;
    return Math.min((offset / totalRange) * 100, 100);
  }

  // Standard month-based positioning
  const relativeMonth = monthIndex - startMonthIndex;
  if (relativeMonth < 0 || relativeMonth >= visibleMonths.length) {
    return -100;
  }

  const denominator = visibleMonths.length > 1 ? visibleMonths.length - 1 : 1;
  const position = (relativeMonth + (dayNum / 31)) / denominator;
  return Math.min(position * 100, 100);
};

// Filter events based on time range
const filterEventsByRange = (events: TimelineEvent[], startMonth: number, endMonth: number, customFrom?: Date, customTo?: Date) => {
  return events.filter(event => {
    if (customFrom && customTo) {
      const eventDoy = dateToDayOfYear(event.date);
      const fromDoy = dateToDayOfYear(`${allMonths[customFrom.getMonth()]} ${customFrom.getDate()}`);
      const toDoy = dateToDayOfYear(`${allMonths[customTo.getMonth()]} ${customTo.getDate()}`);
      return eventDoy >= fromDoy && eventDoy <= toDoy;
    }
    const eventMonth = getMonthIndex(event.date);
    return eventMonth >= startMonth && eventMonth <= endMonth;
  });
};

interface DashboardProps {
  selectedPatient?: Patient;
  onChangePatient?: () => void;
  /** Patients chosen during onboarding (multi-select). */
  cohortPatientIds?: string[];
  /** Patients who met clinical trial criteria (≥70%, no exclusions) after onboarding. */
  trialQualifiedPatientIds?: string[];
}

type ActiveView = "dashboard" | "patientChart" | "timeline" | "trials" | "research" | "ai";
type FeatureScope = "all" | "clinical" | "research";

const getDefaultViewForScope = (scope: FeatureScope): ActiveView =>
  scope === "research" ? "trials" : "timeline";

export default function CancerTreatmentDashboard({
  selectedPatient,
  onChangePatient,
  cohortPatientIds = [],
  trialQualifiedPatientIds = [],
}: DashboardProps) {
  const { profile, user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [pendingPostId, setPendingPostId] = useState<string | null>(null);
  const [isComparePatientOpen, setIsComparePatientOpen] = useState(false);
  const [isComparisonViewOpen, setIsComparisonViewOpen] = useState(false);
  const [isQualificationPanelOpen, setIsQualificationPanelOpen] = useState(false);
  const [qualificationPanelPatient, setQualificationPanelPatient] = useState<import('../lib/patients').Patient | undefined>(undefined);
  const [isCriteriaMatchingOpen, setIsCriteriaMatchingOpen] = useState(false);
  const [compareSelectedIds, setCompareSelectedIds] = useState<Set<string>>(new Set());
  const [, _setActiveComparePatientId] = useState<string | null>(null);
  void _setActiveComparePatientId;
  const [, setCompareIsClinicalTrialMode] = useState(false);
  const compareSelectedPatients = useMemo(
    () => patients.filter((p) => compareSelectedIds.has(p.id)),
    [compareSelectedIds]
  );
  const [isGlobalChartOpen, setIsGlobalChartOpen] = useState(false);
  const [isGlobalChartVisible, setIsGlobalChartVisible] = useState(false);

  const openGlobalChart = () => {
    setIsGlobalChartOpen(true);
    setTimeout(() => setIsGlobalChartVisible(true), 10);
  };
  const closeGlobalChart = () => {
    setIsGlobalChartVisible(false);
    setTimeout(() => setIsGlobalChartOpen(false), 300);
  };

  const doctorFeedBridgeRef = useRef<DoctorFeedCanvasBridge | null>(null);
  const [isDoctorFeedOpen, setIsDoctorFeedOpen] = useState(false);
  const [feedFocusedDoctorId, setFeedFocusedDoctorId] = useState<number | null>(null);
  const [feedFocusedPostId, setFeedFocusedPostId] = useState<number | null>(null);
  const [doctorFeedRefreshTrigger, setDoctorFeedRefreshTrigger] = useState(0);
  const [doctorFeedHighlightPostId, setDoctorFeedHighlightPostId] = useState<string | null>(null);
  const [articleReaderOpen, setArticleReaderOpen] = useState(false);
  const [readerArticle, setReaderArticle] = useState<{ title: string; description?: string; author?: string } | null>(null);
  const pendingDoctorFeedApplyRef = useRef(0);
  const [, setPendingDoctorFeedConnection] = useState<PendingDoctorFeedConnection | null>(null);
  const [activeTimeRange, setActiveTimeRange] = useState<"1m" | "3m" | "6m" | "1y" | "custom">("1y");
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [isCustomDatePickerOpen, setIsCustomDatePickerOpen] = useState(false);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [isAIPanelVisible, setIsAIPanelVisible] = useState(false);
  const [isNewsFeedOpen, setIsNewsFeedOpen] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [clinicalChatPending, setClinicalChatPending] = useState(false);
  const searchQuery = "";
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const navInitRef = useRef<PersistedNav | null>(null);
  if (navInitRef.current === null) {
    navInitRef.current = loadNavState();
  }
  const [activeView, setActiveView] = useState<ActiveView>(() => navInitRef.current!.activeView as ActiveView);
  const [clinicalTrialsNav, setClinicalTrialsNav] = useState<{
    listTab: "all" | "qualified";
    focusTrialId: string | null;
  }>({ listTab: "all", focusTrialId: null });
  const [isGlobalQuantumOpen, setIsGlobalQuantumOpen] = useState(false);
  const [featureScope] = useState<FeatureScope>(() => {
    const saved = localStorage.getItem("maps-feature-scope");
    return saved === "clinical" || saved === "research" ? saved : "all";
  });
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [showKeywordsTree, setShowKeywordsTree] = useState(false);
  const [discoveryTab, setDiscoveryTab] = useState<"timeline" | "keywords">(() => navInitRef.current!.discoveryTab);
  const [trialDiscoverySidebarOpen, setTrialDiscoverySidebarOpen] = useState(
    () => navInitRef.current!.trialDiscoverySidebarOpen
  );
  const [trialKeywordCanvasPatientId, setTrialKeywordCanvasPatientId] = useState<string | null>(null);
  const [trialKeywordAnalysis, setTrialKeywordAnalysis] = useState<FdaKeyword | null>(null);

  // --- Hierarchical keyword tree (replaces 6-column WaveVisualization for single-patient) ---
  const [keywordTree, setKeywordTree] = useState<TreeNode | null>(null);
  const [selectedTreeNode, setSelectedTreeNode] = useState<TreeNode | null>(null);
  const [keywordTreeError, setKeywordTreeError] = useState<string | null>(null);
  const [keywordTreeDimmedIds, setKeywordTreeDimmedIds] = useState<Set<string>>(() => new Set());
  /** `null` until first viewport sample — keyword panel lists the full taxonomy until measurement runs. */
  const [keywordTreeViewportVisibleIds, setKeywordTreeViewportVisibleIds] = useState<Set<string> | null>(null);
  const [keywordTreeHoveredNode, setKeywordTreeHoveredNode] = useState<TreeNode | null>(null);
  const [keywordTreeInteractionIdleTick, setKeywordTreeInteractionIdleTick] = useState(0);

  const onKeywordTreeVisibleIdsChange = useCallback((ids: Set<string>) => {
    setKeywordTreeViewportVisibleIds((prev) => {
      if (prev !== null && prev.size === ids.size) {
        let same = true;
        for (const id of prev) {
          if (!ids.has(id)) {
            same = false;
            break;
          }
        }
        if (same) return prev;
      }
      return new Set(ids);
    });
  }, []);

  const onKeywordTreeHover = useCallback((node: TreeNode | null) => {
    setKeywordTreeHoveredNode(node);
  }, []);

  const onKeywordTreeInteractionIdle = useCallback((visibleIds: Set<string>) => {
    setKeywordTreeViewportVisibleIds((prev) => {
      if (prev !== null && prev.size === visibleIds.size) {
        let same = true;
        for (const id of prev) {
          if (!visibleIds.has(id)) {
            same = false;
            break;
          }
        }
        if (same) {
          setKeywordTreeInteractionIdleTick((t) => t + 1);
          return prev;
        }
      }
      setKeywordTreeInteractionIdleTick((t) => t + 1);
      return new Set(visibleIds);
    });
  }, []);

  useEffect(() => {
    if (!selectedPatient) {
      setKeywordTree(null);
      setSelectedTreeNode(null);
      return;
    }
    let cancelled = false;
    setKeywordTreeError(null);
    fetchKeywordTree(selectedPatient.id, selectedPatient.name)
      .then((tree) => {
        if (!cancelled) setKeywordTree(tree);
      })
      .catch((err) => {
        // Backend not yet seeded — fall back to the empty taxonomy scaffold so
        // the demo still renders structure with no patient-specific leaves.
        if (cancelled) return;
        console.warn('[keyword-tree] falling back to demo/empty scaffold:', err);
        setKeywordTree(buildKeywordTreeForPatient(selectedPatient.id, selectedPatient.name, []));
        setKeywordTreeError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [selectedPatient]);

  useEffect(() => {
    setKeywordTreeDimmedIds(new Set());
    setKeywordTreeViewportVisibleIds(null);
    setKeywordTreeHoveredNode(null);
    setKeywordTreeInteractionIdleTick(0);
  }, [selectedPatient?.id, keywordTree]);

  useEffect(() => {
    if (activeView === 'timeline' && discoveryTab === 'keywords') {
      setKeywordTreeViewportVisibleIds(null);
    }
  }, [activeView, discoveryTab]);

  useEffect(() => {
    setSelectedTreeNode((cur) => {
      if (!cur || !keywordTree) return cur;
      return findTreeNodeById(keywordTree, cur.id) ? cur : null;
    });
  }, [keywordTree]);

  const toggleKeywordTreeDimmed = useCallback(
    (node: TreeNode) => {
      if (!keywordTree || node.type === 'patient') return;
      const target = findTreeNodeById(keywordTree, node.id);
      if (!target) return;

      setKeywordTreeDimmedIds((prev) => {
        const next = new Set(prev);
        if (next.has(target.id)) next.delete(target.id);
        else next.add(target.id);
        return next;
      });
    },
    [keywordTree],
  );

  const resetKeywordTreeDimmed = useCallback(() => {
    setKeywordTreeDimmedIds(new Set());
  }, []);

  const trialKeywordCanvasPatient = useMemo(
    () =>
      trialKeywordCanvasPatientId ? patients.find((p) => p.id === trialKeywordCanvasPatientId) ?? null : null,
    [trialKeywordCanvasPatientId]
  );

  /** Discovery cohort sidebar (Timeline or Keywords): Open Chart uses the selected cohort patient. */
  const patientForGlobalChartPanel = useMemo(() => {
    if (activeView === "timeline" && trialDiscoverySidebarOpen && trialKeywordCanvasPatient) {
      return trialKeywordCanvasPatient;
    }
    return selectedPatient;
  }, [activeView, trialDiscoverySidebarOpen, trialKeywordCanvasPatient, selectedPatient]);

  /** Timeline rows reflect the cohort selection when the sidebar is open; otherwise the primary patient. */
  const timelinePatientForData = useMemo(() => {
    if (trialDiscoverySidebarOpen && trialKeywordCanvasPatient) {
      return trialKeywordCanvasPatient;
    }
    return selectedPatient ?? null;
  }, [trialDiscoverySidebarOpen, trialKeywordCanvasPatient, selectedPatient]);

  const discoveryTimelineData = useMemo(() => {
    if (timelinePatientForData) {
      return getDiscoveryTimelineForPatient(timelinePatientForData);
    }
    return timelineData;
  }, [timelinePatientForData]);

  /** Trial keyword canvas + cohort sidebar (same as dashboard “trial discovery”). */
  const openTrialDiscoveryKeywordsView = useCallback(() => {
    setDiscoveryTab("keywords");
    setTrialKeywordCanvasPatientId(selectedPatient?.id ?? null);
    setTrialKeywordAnalysis(null);
    setTrialDiscoverySidebarOpen(true);
  }, [selectedPatient]);

  const trialQualifiedPatientsList = useMemo(
    () => patients.filter((p) => trialQualifiedPatientIds.includes(p.id)),
    [trialQualifiedPatientIds]
  );

  const cohortPatientsList = useMemo(
    () => cohortPatientIds.map((id) => patients.find((p) => p.id === id)).filter((p): p is Patient => !!p),
    [cohortPatientIds]
  );

  const [messages, setMessages] = useState<ClinicalAiPanelMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI assistant for cancer treatment insights. Ask about this patient's longitudinal records; I'll use the Clinical Intelligence RAG backend when patient ids map (for example cohort id p-1 → API patient 1).",
    },
  ]);

  const isClinicalEnabled = featureScope !== "research";
  const isResearchEnabled = featureScope !== "clinical";

  const isViewAllowed = useCallback((view: ActiveView, scope: FeatureScope) => {
    if (scope === "clinical")
      return (
        view === "dashboard" ||
        view === "patientChart" ||
        view === "timeline" ||
        view === "trials" ||
        view === "ai"
      );
    if (scope === "research") return view === "dashboard" || view === "trials" || view === "research";
    return true;
  }, []);

  useEffect(() => {
    localStorage.setItem("maps-feature-scope", featureScope);
  }, [featureScope]);

  useEffect(() => {
    saveNavState({
      activeView,
      discoveryTab,
      trialDiscoverySidebarOpen,
    });
  }, [activeView, discoveryTab, trialDiscoverySidebarOpen]);

  /** Restore keyword canvas patient when refreshing on Discovery with sidebar open */
  useEffect(() => {
    if (activeView !== "timeline" || !trialDiscoverySidebarOpen) return;
    if (trialKeywordCanvasPatientId || !selectedPatient) return;
    setTrialKeywordCanvasPatientId(selectedPatient.id);
  }, [activeView, trialDiscoverySidebarOpen, trialKeywordCanvasPatientId, selectedPatient]);

  useEffect(() => {
    if (!isViewAllowed(activeView, featureScope)) {
      setActiveView(getDefaultViewForScope(featureScope));
      setShowKeywordsTree(false);
    }
  }, [activeView, featureScope, isViewAllowed]);

  useEffect(() => {
    if (discoveryTab !== "keywords") {
      setTrialKeywordAnalysis(null);
    }
  }, [discoveryTab]);

  useEffect(() => {
    if (!trialDiscoverySidebarOpen) {
      setTrialKeywordAnalysis(null);
      setTrialKeywordCanvasPatientId(null);
    }
  }, [trialDiscoverySidebarOpen]);

  // Fetch unread notification count on mount
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      setUnreadNotifications(count || 0);
    };
    fetchUnread();

    // Real-time: listen for new notifications and show toast
    const channel = supabase
      .channel('global-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload: any) => {
        setUnreadNotifications(prev => prev + 1);
        const message = payload.new?.message || 'You have a new notification';
        const postId = payload.new?.post_id;
        toast(message, {
          icon: '💬',
          duration: 6000,
          action: postId ? {
            label: 'View Post',
            onClick: () => handleNotificationNav(postId),
          } : undefined,
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Reset unread count when notifications panel opens
  useEffect(() => {
    if (isNotificationsOpen) setUnreadNotifications(0);
  }, [isNotificationsOpen]);

  const handleNotificationNav = useCallback((postId: string) => {
    setShowKeywordsTree(true);
    setPendingPostId(postId);
  }, []);

  const closeDoctorFeed = useCallback(() => {
    setIsDoctorFeedOpen(false);
    setFeedFocusedDoctorId(null);
    setFeedFocusedPostId(null);
    setDoctorFeedHighlightPostId(null);
  }, []);

  // (former WaveVisualization helpers removed — DoctorFeed integration is now triggered
  // only from the legacy compare-mode flow; the new KeywordTree does not surface DoctorFeed
  // connections from the canvas.)

  useEffect(() => {
    if (!pendingPostId) return;
    setIsDoctorFeedOpen(true);
    setDoctorFeedHighlightPostId(pendingPostId);
    setDoctorFeedRefreshTrigger((t) => t + 1);
    setPendingPostId(null);
  }, [pendingPostId]);

  const renderHeaderActions = () => (
    <>
      <button
        onClick={onChangePatient}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        title="Change Patient"
      >
        <UserRound className="w-5 h-5 text-gray-600" />
      </button>
      <button
        onClick={() => setIsNotificationsOpen(true)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadNotifications > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadNotifications > 9 ? '9+' : unreadNotifications}
          </span>
        )}
      </button>
    </>
  );

  // Calculate visible months and date range based on selected time range
  const { visibleMonths, startMonth, endMonth } = useMemo(() => {
    const currentMonth = 10; // November (0-indexed)
    
    let start = 0;
    let end = 11;
    let months = allMonths;
    
    if (activeTimeRange === "custom" && customDateRange.from && customDateRange.to) {
      // Handle custom date range
      // Assume all timeline events are in the current year (2024)
      const fromMonth = customDateRange.from.getMonth();
      const toMonth = customDateRange.to.getMonth();
      
      // Clamp to valid range (0-11)
      start = Math.max(0, Math.min(11, fromMonth));
      end = Math.max(0, Math.min(11, toMonth));
      
      // Ensure start <= end
      if (start > end) {
        [start, end] = [end, start];
      }
      
      months = allMonths.slice(start, end + 1);
    } else {
      switch (activeTimeRange) {
        case "1m":
          start = currentMonth;
          end = currentMonth;
          months = [allMonths[currentMonth]];
          break;
        case "3m":
          start = Math.max(0, currentMonth - 2);
          end = currentMonth;
          months = allMonths.slice(start, end + 1);
          break;
        case "6m":
          start = Math.max(0, currentMonth - 5);
          end = currentMonth;
          months = allMonths.slice(start, end + 1);
          break;
        case "1y":
          start = 0;
          end = 11;
          months = allMonths;
          break;
      }
    }
    
    return { visibleMonths: months, startMonth: start, endMonth: end };
  }, [activeTimeRange, customDateRange]);

  const customFrom = activeTimeRange === "custom" ? customDateRange.from : undefined;
  const customTo = activeTimeRange === "custom" ? customDateRange.to : undefined;

  // Filter timeline data based on active time range and search/keyword filters
  const filteredData = useMemo(() => {
    const timeFiltered = {
      diagnosis: filterEventsByRange(discoveryTimelineData.diagnosis, startMonth, endMonth, customFrom, customTo),
      treatment: filterEventsByRange(discoveryTimelineData.treatment, startMonth, endMonth, customFrom, customTo),
      monitoring: filterEventsByRange(discoveryTimelineData.monitoring, startMonth, endMonth, customFrom, customTo),
      sideEffects: filterEventsByRange(discoveryTimelineData.sideEffects, startMonth, endMonth, customFrom, customTo),
      labs: filterEventsByRange(discoveryTimelineData.labs, startMonth, endMonth, customFrom, customTo),
      documentation: filterEventsByRange(discoveryTimelineData.documentation, startMonth, endMonth, customFrom, customTo)
    };

    // Determine which filter to apply
    const filterQuery = selectedKeyword || searchQuery;
    
    // If no filter, return time-filtered data
    if (!filterQuery.trim()) {
      return timeFiltered;
    }

    // Apply search/keyword filter
    const query = filterQuery.toLowerCase();
    const searchFilter = (event: TimelineEvent) => {
      return (
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.details.toLowerCase().includes(query) ||
        event.date.toLowerCase().includes(query)
      );
    };

    return {
      diagnosis: timeFiltered.diagnosis.filter(searchFilter),
      treatment: timeFiltered.treatment.filter(searchFilter),
      monitoring: timeFiltered.monitoring.filter(searchFilter),
      sideEffects: timeFiltered.sideEffects.filter(searchFilter),
      labs: timeFiltered.labs.filter(searchFilter),
      documentation: timeFiltered.documentation.filter(searchFilter)
    };
  }, [discoveryTimelineData, activeTimeRange, startMonth, endMonth, searchQuery, selectedKeyword, customFrom, customTo]);

  const navMenuItemClass = (active = false) =>
    `flex w-full items-center gap-3 px-3 py-2.5 text-left text-[15.5px] font-medium transition-colors ${
      active ? "rounded-full bg-blue-100 text-blue-700" : "rounded-xl text-slate-700 hover:bg-slate-100"
    }`;

  return (
    <div className="relative flex h-screen bg-slate-50">
      <div className="absolute left-5 top-5 z-[80] flex items-center gap-3">
        <Popover open={isNavMenuOpen} onOpenChange={setIsNavMenuOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={`flex h-12 w-12 items-center justify-center rounded-full shadow-2xl shadow-indigo-900/20 ring-1 ring-white/30 transition ${
                isNavMenuOpen
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
              aria-label="Open navigation menu"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
              </svg>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 rounded-2xl border border-black/10 bg-white/95 p-2 shadow-2xl backdrop-blur-xl" side="bottom" align="start" sideOffset={10}>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setActiveView("dashboard");
                  setShowKeywordsTree(false);
                  setIsNavMenuOpen(false);
                }}
                className={navMenuItemClass(activeView === "dashboard" && !showKeywordsTree)}
              >
                <LayoutDashboard className="h-[19px] w-[19px]" />
                Dashboard
              </button>
              {isClinicalEnabled && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveView("timeline");
                    setShowKeywordsTree(false);
                    setDiscoveryTab("timeline");
                    if (cohortPatientIds.length > 0) {
                      setTrialDiscoverySidebarOpen(true);
                      setTrialKeywordCanvasPatientId((prev) => prev ?? selectedPatient?.id ?? cohortPatientIds[0] ?? null);
                    }
                    setIsNavMenuOpen(false);
                  }}
                  className={navMenuItemClass(activeView === "timeline" && !showKeywordsTree)}
                >
                  <CalendarIcon className="h-[19px] w-[19px]" />
                  Discovery Timeline
                </button>
              )}
              {isClinicalEnabled && (
                <button
                  type="button"
                  onClick={() => {
                    setShowKeywordsTree(true);
                    setActiveView("timeline");
                    setDiscoveryTab("keywords");
                    setIsNavMenuOpen(false);
                  }}
                  className={navMenuItemClass(showKeywordsTree)}
                >
                  <Layers3 className="h-[19px] w-[19px]" />
                  Keyword Tree
                </button>
              )}
              {isResearchEnabled && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveView("research");
                    setIsNavMenuOpen(false);
                  }}
                  className={navMenuItemClass(activeView === "research")}
                >
                  <Activity className="h-[19px] w-[19px]" />
                  Trending Research
                </button>
              )}
            </div>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  if (isDoctorFeedOpen) closeDoctorFeed();
                  else setIsDoctorFeedOpen(true);
                  setIsNavMenuOpen(false);
                }}
                className={navMenuItemClass(isDoctorFeedOpen)}
              >
                <UsersRound className="h-[19px] w-[19px]" />
                Doctor Network
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(true);
                  setIsNavMenuOpen(false);
                }}
                className={navMenuItemClass(false)}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-300 text-xs font-bold text-white">
                  {profile?.avatar_initials || 'U'}
                </span>
                My Profile
              </button>
            </div>

          </PopoverContent>
        </Popover>
        <button
          type="button"
          onClick={() => setIsGlobalQuantumOpen(true)}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-sky-400 shadow-lg ring-1 ring-black/10 backdrop-blur-xl transition hover:bg-sky-50 hover:text-sky-500"
          title="Quantum Analysis"
          aria-label="Open Quantum Analysis"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <ellipse cx="12" cy="12" rx="10" ry="4" strokeWidth="1.5" />
            <ellipse cx="12" cy="12" rx="10" ry="4" strokeWidth="1.5" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="12" rx="10" ry="4" strokeWidth="1.5" transform="rotate(120 12 12)" />
          </svg>
        </button>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-base font-semibold tracking-[0.28em] text-slate-900 shadow-lg ring-1 ring-black/10 backdrop-blur-xl">
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
            <defs>
              <linearGradient id="maps-layer-gradient" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2563eb" />
                <stop offset="1" stopColor="#f97316" />
              </linearGradient>
            </defs>
            <path d="m12 2 9 5-9 5-9-5 9-5Z" stroke="url(#maps-layer-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m3 12 9 5 9-5" stroke="url(#maps-layer-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m3 17 9 5 9-5" stroke="url(#maps-layer-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          M.A.P.S.
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {showKeywordsTree ? (
          <div className="flex-1 min-h-0 flex">
            <div className="flex-1 min-w-0 min-h-0 flex flex-col">
              <div className="flex-1 min-w-0 bg-slate-50 min-h-0">
                {keywordTree ? (
                  <InfiniteKeywordCanvasView
                    tree={keywordTree}
                    patient={selectedPatient ?? null}
                    selectedNode={selectedTreeNode}
                    hoveredNodeId={keywordTreeHoveredNode?.id ?? null}
                    dimmedNodeIds={keywordTreeDimmedIds}
                    viewportVisibleNodeIds={keywordTreeViewportVisibleIds}
                    interactionIdleTick={keywordTreeInteractionIdleTick}
                    onSelectNode={setSelectedTreeNode}
                    onNodeHover={onKeywordTreeHover}
                    onInteractionIdle={onKeywordTreeInteractionIdle}
                    onVisibleNodeIdsChange={onKeywordTreeVisibleIdsChange}
                    onToggleDimmedKeyword={toggleKeywordTreeDimmed}
                    onResetDimmedKeywords={resetKeywordTreeDimmed}
                    onOpenChart={openGlobalChart}
                    onSelectPatient={onChangePatient}
                    onOpenNews={() => setIsNewsFeedOpen(true)}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                    {keywordTreeError ? `Loading taxonomy (${keywordTreeError})…` : 'Loading keyword tree…'}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeView === "dashboard" ? (
          <DashboardPage
            selectedPatient={selectedPatient}
            cohortPatients={cohortPatientsList}
            onChangePatient={onChangePatient}
            headerActions={renderHeaderActions()}
            onAskAI={() => {
              setIsAIPanelOpen(true);
              setTimeout(() => setIsAIPanelVisible(true), 10);
            }}
            onOpenNewsFeed={() => setIsNewsFeedOpen(true)}
            trialQualifiedPatientIds={trialQualifiedPatientIds}
            cohortPatientCount={cohortPatientIds.length}
            onOpenTrialDiscovery={() => {
              setActiveView("timeline");
              openTrialDiscoveryKeywordsView();
            }}
            onOpenPatientChart={openGlobalChart}
          />
        ) : activeView === "patientChart" ? (
          <PatientChartPage
            selectedPatient={selectedPatient}
            onChangePatient={onChangePatient}
            onBack={() => {
              setActiveView("dashboard");
              setShowKeywordsTree(false);
            }}
          />
        ) : activeView === "timeline" ? (
          <>
            {/* Keywords tab — multi-patient + sidebar: FDA trial canvas; otherwise 6-column category graph (single-patient keeps WaveVisualization even with sidebar) */}
            {discoveryTab === "keywords" && (
              <div
                className={`flex-1 overflow-hidden flex min-h-0 ${
                  trialDiscoverySidebarOpen && cohortPatientIds.length > 1
                    ? "flex-col lg:flex-row bg-gradient-to-br from-slate-50 to-violet-50/40"
                    : "flex-col"
                }`}
              >
                <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden relative">
                  {trialDiscoverySidebarOpen && cohortPatientIds.length > 1 ? (
                    <>
                      <TrialKeywordCanvas
                        selectedPatient={trialKeywordCanvasPatient}
                        onKeywordClick={(kw) => setTrialKeywordAnalysis(kw)}
                      />
                      <KeywordAnalysisPanel
                        keyword={trialKeywordAnalysis}
                        patientName={trialKeywordCanvasPatient?.name ?? null}
                        onClose={() => setTrialKeywordAnalysis(null)}
                      />
                    </>
                  ) : (
                    <div className="flex-1 min-h-0 flex min-w-0">
                      <div className="flex-1 min-w-0 min-h-0 flex flex-col">
                        <div className="flex-1 min-w-0 bg-slate-50 min-h-0">
                          {keywordTree ? (
                            <InfiniteKeywordCanvasView
                              tree={keywordTree}
                              patient={selectedPatient ?? null}
                              selectedNode={selectedTreeNode}
                              hoveredNodeId={keywordTreeHoveredNode?.id ?? null}
                              dimmedNodeIds={keywordTreeDimmedIds}
                              viewportVisibleNodeIds={keywordTreeViewportVisibleIds}
                              interactionIdleTick={keywordTreeInteractionIdleTick}
                              onSelectNode={setSelectedTreeNode}
                              onNodeHover={onKeywordTreeHover}
                              onInteractionIdle={onKeywordTreeInteractionIdle}
                              onVisibleNodeIdsChange={onKeywordTreeVisibleIdsChange}
                              onToggleDimmedKeyword={toggleKeywordTreeDimmed}
                              onResetDimmedKeywords={resetKeywordTreeDimmed}
                              onOpenChart={openGlobalChart}
                              onSelectPatient={onChangePatient}
                              onOpenNews={() => setIsNewsFeedOpen(true)}
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                              {keywordTreeError ? `Loading taxonomy (${keywordTreeError})…` : 'Loading keyword tree…'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {trialDiscoverySidebarOpen && cohortPatientIds.length > 1 && (
                  <div className="w-full lg:w-[min(420px,40vw)] shrink-0 flex flex-col min-h-0 max-h-[45vh] lg:max-h-none">
                    <QualifiedTrialPatientsSidebar
                      patients={
                        cohortPatientsList.length > 0 ? cohortPatientsList : trialQualifiedPatientsList
                      }
                      selectedPatientId={trialKeywordCanvasPatientId}
                      onSelectPatient={(id) => {
                        setTrialKeywordCanvasPatientId(id);
                        if (discoveryTab === "keywords") setTrialKeywordAnalysis(null);
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Timeline + cohort sidebar — time range & chips sit in left column only so sidebar aligns with Keywords view */}
            {discoveryTab === "timeline" && (
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
                        {timelinePatientForData ? `Timeline context for ${timelinePatientForData.name}` : 'Select a patient to begin'}
                      </p>
                    </div>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                    <div className="rounded-2xl bg-violet-50 p-4 ring-1 ring-violet-100">
                      <p className="mb-2 font-mono text-[12px] font-semibold uppercase tracking-wide text-violet-600">
                        Timeline Scope
                      </p>
                      <p className="text-sm leading-relaxed text-slate-700">
                        {timelinePatientForData
                          ? `${timelinePatientForData.diagnoses[0]} timeline with ${visibleMonths.length} visible month${visibleMonths.length === 1 ? '' : 's'} and ${selectedKeyword ? `${selectedKeyword} filtering applied` : 'all categories shown'}.`
                          : 'Choose a patient to load longitudinal events.'}
                      </p>
                    </div>
                    <div className="mt-4 space-y-3">
                      {[
                        `${filteredData.diagnosis.length + filteredData.treatment.length + filteredData.monitoring.length + filteredData.sideEffects.length + filteredData.labs.length + filteredData.documentation.length} visible timeline events`,
                        selectedKeyword ? `Keyword filter: ${selectedKeyword}` : 'No keyword filter active',
                        activeTimeRange === 'custom' && customDateRange.from && customDateRange.to
                          ? `Custom range: ${format(customDateRange.from, 'MMM d')} to ${format(customDateRange.to, 'MMM d')}`
                          : `Range: ${activeTimeRange}`,
                      ].map((item) => (
                        <div key={item} className="rounded-2xl bg-white/80 p-3 text-sm leading-relaxed text-slate-600 ring-1 ring-slate-100">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-slate-100 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAIPanelOpen(true);
                        setTimeout(() => setIsAIPanelVisible(true), 10);
                      }}
                      className="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-500 transition hover:border-violet-300 hover:text-violet-700"
                    >
                      <span className="min-w-0 flex-1 truncate">Ask about this timeline...</span>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white">
                        <Send className="h-4 w-4" />
                      </span>
                    </button>
                  </div>
                </aside>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={openGlobalChart}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openGlobalChart();
                    }
                  }}
                  className="absolute right-5 top-5 z-20 h-[116px] w-[380px] rounded-[20px] border border-black/10 bg-white/85 p-4 text-left shadow-2xl backdrop-blur-xl transition hover:border-violet-200 hover:bg-white/95"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-300 text-base font-semibold text-white">
                      {timelinePatientForData?.name.split(' ').map((n) => n[0]).join('').slice(0, 2) ?? 'PT'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-semibold">{timelinePatientForData?.name ?? 'No patient selected'}</p>
                      <p className="truncate text-sm text-slate-500">
                        {timelinePatientForData ? `${timelinePatientForData.age}yo ${timelinePatientForData.gender} · MRN ${timelinePatientForData.mrn}` : 'Open patient selection'}
                      </p>
                    </div>
                  </div>
                  {timelinePatientForData ? (
                    <div className="mt-3 flex items-end justify-between gap-3">
                      <span className="inline-flex min-w-0 rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-900">
                        <span className="truncate">{timelinePatientForData.diagnoses[0]}</span>
                      </span>
                      {onChangePatient ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onChangePatient();
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

                <aside className="absolute left-[420px] right-[420px] top-5 z-20 flex h-[116px] flex-col justify-center overflow-hidden rounded-[20px] border border-black/10 bg-white/85 p-4 shadow-2xl backdrop-blur-xl">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold">Keywords</p>
                      <p className="text-sm text-slate-500">
                        {selectedKeyword ? `Filtering by ${selectedKeyword}` : 'Filter timeline events by clinical keyword'}
                      </p>
                    </div>
                    {selectedKeyword ? (
                      <button
                        type="button"
                        onClick={() => setSelectedKeyword(null)}
                        className="shrink-0 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                      >
                        Clear
                      </button>
                    ) : null}
                  </div>
                  <TimelineKeywordChipsScroll
                    keywordList={keywords}
                    selectedKeyword={selectedKeyword}
                    onSelectKeyword={setSelectedKeyword}
                    onClear={() => setSelectedKeyword(null)}
                  />
                </aside>

                <div className="relative z-30 h-full overflow-y-auto pb-5 pl-[420px] pr-5 pt-[172px]">
              <div className="flex max-h-[calc(100vh-194px)] w-full flex-col overflow-hidden rounded-[28px] border border-black/10 bg-white/80 shadow-2xl backdrop-blur-xl">
                <div className="shrink-0 px-5 py-4 lg:px-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">Discovery Timeline</h1>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        {(["1m", "3m", "6m", "1y"] as const).map((range) => (
                          <button
                            key={range}
                            type="button"
                            onClick={() => {
                              setActiveTimeRange(range);
                              setIsCustomDatePickerOpen(false);
                            }}
                            className={`px-4 py-1.5 rounded-md transition-all ${
                              activeTimeRange === range
                                ? "bg-white shadow-sm text-gray-900"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            {range}
                          </button>
                        ))}
                      </div>
                      <Popover open={isCustomDatePickerOpen} onOpenChange={setIsCustomDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTimeRange("custom");
                              setIsCustomDatePickerOpen(true);
                            }}
                            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                              activeTimeRange === "custom"
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                            }`}
                          >
                            <CalendarDays className="w-4 h-4" />
                            {customDateRange.from && customDateRange.to ? (
                              <>
                                {format(customDateRange.from, "MMM d")} - {format(customDateRange.to, "MMM d")}
                              </>
                            ) : (
                              "Custom Range"
                            )}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-4">
                            <Calendar
                              mode="range"
                              selected={{ from: customDateRange.from, to: customDateRange.to }}
                              onSelect={(range) => {
                                if (range?.from && range?.to) {
                                  setCustomDateRange({ from: range.from, to: range.to });
                                  setActiveTimeRange("custom");
                                  setIsCustomDatePickerOpen(false);
                                } else if (range?.from) {
                                  setCustomDateRange({ from: range.from, to: undefined });
                                }
                              }}
                              numberOfMonths={2}
                              className="rounded-md border-0"
                            />
                            {customDateRange.from && customDateRange.to && (
                              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between gap-2">
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">From:</span> {format(customDateRange.from, "MMM d, yyyy")}
                                  <br />
                                  <span className="font-medium">To:</span> {format(customDateRange.to, "MMM d, yyyy")}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCustomDateRange({ from: undefined, to: undefined });
                                    setActiveTimeRange("1y");
                                    setIsCustomDatePickerOpen(false);
                                  }}
                                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                  Clear
                                </button>
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                <div className="max-h-[calc(100vh-330px)] overflow-auto bg-white/65">
              <div className="min-w-[920px] px-5 py-3 lg:px-6 lg:py-5">
                {/* Date Headers */}
                <div className="mb-6 flex items-center border-b border-slate-200 pb-6">
                  <div className="w-40" /> {/* Spacer for row labels */}
                  {activeTimeRange === "custom" && customDateRange.from && customDateRange.to ? (
                    <div className="flex-1 relative h-10 px-8">
                      {(() => {
                        const from = customDateRange.from!;
                        const to = customDateRange.to!;
                        const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
                        const labels: { date: Date; position: number }[] = [];

                        const totalMs = to.getTime() - from.getTime();
                        if (diffDays <= 14) {
                          for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
                            const pos = ((d.getTime() - from.getTime()) / totalMs) * 100;
                            labels.push({ date: new Date(d), position: pos });
                          }
                        } else {
                          const targetLabels = diffDays <= 60 ? 10 : 12;
                          const step = Math.max(1, Math.floor(diffDays / targetLabels));
                          for (let d = new Date(from); d <= to; d.setDate(d.getDate() + step)) {
                            const pos = ((d.getTime() - from.getTime()) / totalMs) * 100;
                            labels.push({ date: new Date(d), position: pos });
                          }
                          const lastLabel = labels[labels.length - 1];
                          if (lastLabel && lastLabel.position < 95) {
                            labels.push({ date: new Date(to), position: 100 });
                          }
                        }

                        return labels.map((l, idx) => (
                          <div
                            key={idx}
                            className="absolute text-gray-500 text-xs text-center flex flex-col items-center -translate-x-1/2"
                            style={{ left: `${l.position}%` }}
                          >
                            <span className="font-medium">{format(l.date, "d")}</span>
                            <span className="text-gray-400 text-[10px]">{format(l.date, "MMM")}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  ) : (
                    <div className="flex-1 flex justify-between px-8">
                      {visibleMonths.map((month, idx) => (
                        <div key={idx} className="text-gray-500 text-sm">
                          {month}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timeline Rows */}
                <div className="space-y-0">
                  {/* Diagnosis Row */}
                  <div className="py-6">
                    <div className="flex items-center">
                      <div className="w-40 pr-6">
                        <h3 className="text-gray-900 mb-1">Diagnosis</h3>
                        <p className="text-gray-500 text-sm">Initial findings & staging</p>
                      </div>
                      <div className="flex-1 relative h-16">
                        {/* Timeline line */}
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-purple-200 rounded-full" />
                        
                        {/* Events */}
                        {filteredData.diagnosis.map((event) => {
                          const position = getDatePosition(event.date, visibleMonths, startMonth, customFrom, customTo);
                          if (position < 0) return null;
                          
                          return (
                            <Popover key={event.id}>
                              <PopoverTrigger asChild>
                                <button
                                  className="absolute top-1/2 -translate-y-1/2 group"
                                  style={{ left: `${position}%` }}
                                >
                                  {event.severity && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 border-2 border-red-500 rounded-full" />
                                  )}
                                  <div className="w-4 h-4 bg-purple-600 rounded-full shadow-lg group-hover:scale-150 transition-transform relative z-10" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-96" side="bottom" align="center">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="text-gray-900 mb-1">{event.title}</h4>
                                      <p className="text-gray-500 text-sm">{event.date} • {event.description}</p>
                                    </div>
                                    {event.severity && (
                                      <span className={`text-xs px-2 py-1 rounded border ml-2 whitespace-nowrap ${getSeverityStyles(event.severity)}`}>
                                        {event.severity}
                                      </span>
                                    )}
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-600 text-sm leading-relaxed">{event.details}</p>
                                  </div>
                                  <div className="pt-2 border-t border-gray-200">
                                    <button className="text-indigo-600 hover:text-indigo-700 text-sm transition-colors inline-flex items-center gap-1">
                                      View in Epic →
                                    </button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Treatment Row */}
                  <div className="border-b border-gray-200 py-6">
                    <div className="flex items-center">
                      <div className="w-40 pr-6">
                        <h3 className="text-gray-900 mb-1">Treatment</h3>
                        <p className="text-gray-500 text-sm">Therapy & procedures</p>
                      </div>
                      <div className="flex-1 relative h-16">
                        {/* Timeline line */}
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-blue-200 rounded-full" />
                        
                        {/* Events */}
                        {filteredData.treatment.map((event) => {
                          const position = getDatePosition(event.date, visibleMonths, startMonth, customFrom, customTo);
                          if (position < 0) return null;
                          
                          return (
                            <Popover key={event.id}>
                              <PopoverTrigger asChild>
                                <button
                                  className="absolute top-1/2 -translate-y-1/2 group"
                                  style={{ left: `${position}%` }}
                                >
                                  <div className="w-4 h-4 bg-blue-600 rounded-full shadow-lg group-hover:scale-150 transition-transform" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-96" side="top" align="center">
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="text-gray-900 mb-1">{event.title}</h4>
                                    <p className="text-gray-500 text-sm">{event.date} • {event.description}</p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-600 text-sm leading-relaxed">{event.details}</p>
                                  </div>
                                  <div className="pt-2 border-t border-gray-200">
                                    <button className="text-indigo-600 hover:text-indigo-700 text-sm transition-colors inline-flex items-center gap-1">
                                      View in Epic →
                                    </button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Monitoring Row */}
                  <div className="border-b border-gray-200 py-6">
                    <div className="flex items-center">
                      <div className="w-40 pr-6">
                        <h3 className="text-gray-900 mb-1">Monitoring</h3>
                        <p className="text-gray-500 text-sm">Tests & imaging</p>
                      </div>
                      <div className="flex-1 relative h-16">
                        {/* Timeline line */}
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-emerald-200 rounded-full" />
                        
                        {/* Events */}
                        {filteredData.monitoring.map((event) => {
                          const position = getDatePosition(event.date, visibleMonths, startMonth, customFrom, customTo);
                          if (position < 0) return null;
                          
                          return (
                            <Popover key={event.id}>
                              <PopoverTrigger asChild>
                                <button
                                  className="absolute top-1/2 -translate-y-1/2 group"
                                  style={{ left: `${position}%` }}
                                >
                                  <div className="w-4 h-4 bg-emerald-600 rounded-full shadow-lg group-hover:scale-150 transition-transform" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-96" side="top" align="center">
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="text-gray-900 mb-1">{event.title}</h4>
                                    <p className="text-gray-500 text-sm">{event.date} • {event.description}</p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-600 text-sm leading-relaxed">{event.details}</p>
                                  </div>
                                  <div className="pt-2 border-t border-gray-200">
                                    <button className="text-indigo-600 hover:text-indigo-700 text-sm transition-colors inline-flex items-center gap-1">
                                      View in Epic →
                                    </button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Side Effects Row */}
                  <div className="border-b border-gray-200 py-6">
                    <div className="flex items-center">
                      <div className="w-40 pr-6">
                        <h3 className="text-gray-900 mb-1">Side Effects</h3>
                        <p className="text-gray-500 text-sm">Reactions & symptoms</p>
                      </div>
                      <div className="flex-1 relative h-16">
                        {/* Timeline line */}
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-amber-200 rounded-full" />
                        
                        {/* Events */}
                        {filteredData.sideEffects.map((event) => {
                          const position = getDatePosition(event.date, visibleMonths, startMonth, customFrom, customTo);
                          if (position < 0) return null;
                          
                          return (
                            <Popover key={event.id}>
                              <PopoverTrigger asChild>
                                <button
                                  className="absolute top-1/2 -translate-y-1/2 group"
                                  style={{ left: `${position}%` }}
                                >
                                  {event.severity && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 border-2 border-red-500 rounded-full" />
                                  )}
                                  <div className="w-4 h-4 bg-amber-600 rounded-full shadow-lg group-hover:scale-150 transition-transform relative z-10" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-96" side="top" align="center">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="text-gray-900 mb-1">{event.title}</h4>
                                      <p className="text-gray-500 text-sm">{event.date} • {event.description}</p>
                                    </div>
                                    {event.severity && (
                                      <span className={`text-xs px-2 py-1 rounded border ml-2 whitespace-nowrap ${getSeverityStyles(event.severity)}`}>
                                        {event.severity}
                                      </span>
                                    )}
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-600 text-sm leading-relaxed">{event.details}</p>
                                  </div>
                                  <div className="pt-2 border-t border-gray-200">
                                    <button className="text-indigo-600 hover:text-indigo-700 text-sm transition-colors inline-flex items-center gap-1">
                                      View in Epic →
                                    </button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Labs Row */}
                  <div className="border-b border-gray-200 py-6">
                    <div className="flex items-center">
                      <div className="w-40 pr-6">
                        <h3 className="text-gray-900 mb-1">Labs</h3>
                        <p className="text-gray-500 text-sm">Blood tests & panels</p>
                      </div>
                      <div className="flex-1 relative h-16">
                        {/* Timeline line */}
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-cyan-200 rounded-full" />
                        
                        {/* Events */}
                        {filteredData.labs.map((event) => {
                          const position = getDatePosition(event.date, visibleMonths, startMonth, customFrom, customTo);
                          if (position < 0) return null;
                          
                          return (
                            <Popover key={event.id}>
                              <PopoverTrigger asChild>
                                <button
                                  className="absolute top-1/2 -translate-y-1/2 group"
                                  style={{ left: `${position}%` }}
                                >
                                  {event.severity && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 border-2 border-red-500 rounded-full" />
                                  )}
                                  <div className="w-4 h-4 bg-cyan-600 rounded-full shadow-lg group-hover:scale-150 transition-transform relative z-10" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-96" side="top" align="center">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="text-gray-900 mb-1">{event.title}</h4>
                                      <p className="text-gray-500 text-sm">{event.date} • {event.description}</p>
                                    </div>
                                    {event.severity && (
                                      <span className={`text-xs px-2 py-1 rounded border ml-2 whitespace-nowrap ${getSeverityStyles(event.severity)}`}>
                                        {event.severity}
                                      </span>
                                    )}
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-600 text-sm leading-relaxed">{event.details}</p>
                                  </div>
                                  <div className="pt-2 border-t border-gray-200">
                                    <button className="text-indigo-600 hover:text-indigo-700 text-sm transition-colors inline-flex items-center gap-1">
                                      View lab →
                                    </button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Documents Row */}
                  <div className="py-6">
                    <div className="flex items-center">
                      <div className="w-40 pr-6">
                        <h3 className="text-gray-900 mb-1">Documents</h3>
                        <p className="text-gray-500 text-sm">Records & consents</p>
                      </div>
                      <div className="flex-1 relative h-16">
                        {/* Timeline line */}
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-rose-200 rounded-full" />
                        
                        {/* Events */}
                        {filteredData.documentation.map((event) => {
                          const position = getDatePosition(event.date, visibleMonths, startMonth, customFrom, customTo);
                          if (position < 0) return null;
                          
                          return (
                            <Popover key={event.id}>
                              <PopoverTrigger asChild>
                                <button
                                  className="absolute top-1/2 -translate-y-1/2 group"
                                  style={{ left: `${position}%` }}
                                >
                                  <div className="w-4 h-4 bg-rose-600 rounded-full shadow-lg group-hover:scale-150 transition-transform" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-96" side="top" align="center">
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="text-gray-900 mb-1">{event.title}</h4>
                                    <p className="text-gray-500 text-sm">{event.date} • {event.description}</p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-600 text-sm leading-relaxed">{event.details}</p>
                                  </div>
                                  <div className="pt-2 border-t border-gray-200">
                                    <button className="text-indigo-600 hover:text-indigo-700 text-sm transition-colors inline-flex items-center gap-1">
                                      View document →
                                    </button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              </div>
              </div>

              </div>
              </div>
            )}
          </>
        ) : activeView === "trials" ? (
          <div className="relative h-full">
            <ClinicalTrialsPage
              onClose={() => setActiveView(getDefaultViewForScope(featureScope))}
              headerActions={<div className="flex items-center gap-3">{renderHeaderActions()}</div>}
              tabRowActions={<>
                <button
                  onClick={openGlobalChart}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Open Chart
                </button>
                <button
                  onClick={() => { setIsAIPanelOpen(true); setTimeout(() => setIsAIPanelVisible(true), 10); }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Ask AI
                </button>
              </>}
              selectedPatient={selectedPatient}
              onChangePatient={onChangePatient}
              trialsListTab={clinicalTrialsNav.listTab}
              onTrialsListTabChange={(tab) =>
                setClinicalTrialsNav((s) => ({ ...s, listTab: tab }))
              }
              focusTrialId={clinicalTrialsNav.focusTrialId}
              onTrialFocusConsumed={() =>
                setClinicalTrialsNav((s) => ({ ...s, focusTrialId: null }))
              }
            />
          </div>
        ) : activeView === "research" ? (
          <div className="relative h-full">
            <TrendingResearchPage
              onClose={() => setActiveView(getDefaultViewForScope(featureScope))}
              selectedPatient={selectedPatient}
              onChangePatient={onChangePatient}
              onOpenChart={openGlobalChart}
              onAskAI={() => { setIsAIPanelOpen(true); setTimeout(() => setIsAIPanelVisible(true), 10); }}
            />
          </div>
        ) : (
          <div className="relative h-full">
            <AIPage onClose={() => setActiveView(getDefaultViewForScope(featureScope))} />
            <div className="absolute top-5 right-8 flex items-center gap-3 z-10">
              <button
                onClick={onChangePatient}
                className="p-2 bg-white hover:bg-gray-100 rounded-full transition-colors shadow-sm border border-gray-200"
                title="Change Patient"
              >
                <UserRound className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setIsNotificationsOpen(true)}
                className="p-2 bg-white hover:bg-gray-100 rounded-full transition-colors shadow-sm border border-gray-200"
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setIsProfileOpen(true)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold hover:scale-105 transition-transform shadow-md"
                title="My Profile"
              >
                {profile?.avatar_initials || 'U'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Chat Side Panel */}
      {isAIPanelOpen && (
        <>
          {/* Overlay */}
          <div 
            className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
              isAIPanelVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => {
              setIsAIPanelVisible(false);
              setTimeout(() => setIsAIPanelOpen(false), 300);
            }}
          />
          
          {/* Side Panel */}
          <div className={`fixed right-0 top-0 h-full bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
            isAIPanelVisible ? "translate-x-0" : "translate-x-full"
          }`} style={{ width: '576px' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-indigo-600" />
                <div>
                  <h2 className="text-gray-900">Clinical AI</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Powered by Clinical Intelligence RAG (5–15s typical).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                  title="Chat history"
                >
                  <History className="w-5 h-5" />
                </button>
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                  title="Upload document"
                >
                  <FileText className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsVoiceMode(!isVoiceMode)}
                  className={`p-2 rounded-lg transition-all ${
                    isVoiceMode 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                  title={isVoiceMode ? "Switch to text mode" : "Switch to voice mode"}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setIsAIPanelVisible(false);
                    setTimeout(() => setIsAIPanelOpen(false), 300);
                  }}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.role === "user" ? (
                    <div className={`flex justify-end`}>
                      <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-indigo-600 text-white">
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 items-start max-w-[85%]">
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed w-full ${
                          message.assistantStatus === "blocked"
                            ? "bg-amber-50 text-amber-950 border border-amber-200"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p>{message.content}</p>
                      </div>
                      {message.references && message.references.length > 0 && (
                        <div className="w-full space-y-2 pl-1">
                          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Evidence</p>
                          <ul className="space-y-2">
                            {message.references.map((ref) => (
                              <li
                                key={`${message.id}-${ref.pmid}-${ref.title.slice(0, 24)}`}
                                className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm text-xs text-gray-800"
                              >
                                <a
                                  href={ref.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-indigo-600 hover:underline"
                                >
                                  {ref.title}
                                </a>
                                <p className="text-gray-500 mt-1">{ref.journal} · PMID {ref.pmid}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {clinicalChatPending && (
                <div className="flex gap-3 rounded-xl border border-indigo-100 bg-indigo-50/90 px-4 py-3 text-sm text-gray-800">
                  <div className="mt-1 w-8 h-8 shrink-0 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  <div>
                    <p className="font-medium text-indigo-900">Analyzing longitudinal data…</p>
                    <p className="text-xs text-indigo-800/90 mt-0.5">
                      RAG synthesis can take several seconds across the medical record corpus.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 px-6 py-4">
              {isVoiceMode ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <button
                    className="w-16 h-16 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                    onClick={() => {
                      // Voice recording logic would go here
                      const aiResponse: ClinicalAiPanelMessage = {
                        id: String(messages.length + 1),
                        role: "assistant",
                        content:
                          "Voice mode is active. In a production environment, this would record your voice, transcribe it, and provide a spoken response.",
                      };
                      setMessages([...messages, aiResponse]);
                    }}
                  >
                    <Mic className="w-8 h-8 text-white" />
                  </button>
                  <p className="text-gray-500 text-sm mt-3">Tap to speak</p>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const trimmed = chatInput.trim();
                    if (!trimmed || clinicalChatPending) return;

                    const userMessage: ClinicalAiPanelMessage = {
                      id: `u-${Date.now()}`,
                      role: "user",
                      content: trimmed,
                    };
                    setChatInput("");
                    setMessages((prev) => [...prev, userMessage]);

                    const cid = timelinePatientForData?.id
                      ? resolveClinicalPatientId(timelinePatientForData.id)
                      : null;

                    if (cid === null) {
                      setMessages((prev) => [
                        ...prev,
                        {
                          id: `a-${Date.now()}`,
                          role: "assistant",
                          content:
                            "This patient id cannot be mapped to the Clinical Intelligence backend. Demo cohort ids use the pattern p-N (for example p-1 calls /patient/1/timeline and /chat with patient_id 1).",
                        },
                      ]);
                      return;
                    }

                    setClinicalChatPending(true);
                    try {
                      const res = await postClinicalChat({ patient_id: cid, user_query: trimmed });
                      const blocked = res.status === "blocked";
                      setMessages((prev) => [
                        ...prev,
                        {
                          id: `a-${Date.now()}`,
                          role: "assistant",
                          content: res.ai_analysis,
                          references: res.references,
                          assistantStatus: blocked ? "blocked" : "success",
                        },
                      ]);
                    } catch (err) {
                      setMessages((prev) => [
                        ...prev,
                        {
                          id: `a-${Date.now()}`,
                          role: "assistant",
                          content:
                            err instanceof Error ? err.message : "Unable to reach the Clinical Intelligence API.",
                        },
                      ]);
                    } finally {
                      setClinicalChatPending(false);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about longitudinal records (RAG-backed)…"
                    disabled={clinicalChatPending}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  <button
                    type="submit"
                    disabled={clinicalChatPending || !chatInput.trim()}
                    className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </>
      )}

      {/* News Feed Side Panel */}
      <NewsFeedPanel isOpen={isNewsFeedOpen} onClose={() => setIsNewsFeedOpen(false)} />


      {/* Profile Panel */}
      <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNotificationClick={handleNotificationNav}
      />

      {/* Global Quantum Side Panel */}
      <QuantumPanel isOpen={isGlobalQuantumOpen} onClose={() => setIsGlobalQuantumOpen(false)} />

      {/* Global Patient Chart Side Panel */}
      {isGlobalChartOpen && (
        <>
          <button
            type="button"
            aria-label="Close patient chart"
            className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${isGlobalChartVisible ? "opacity-100" : "opacity-0"}`}
            onClick={closeGlobalChart}
          />
          <aside
            className={`fixed top-0 right-0 h-full w-[50vw] min-w-[480px] bg-white/95 shadow-[-24px_0_64px_rgba(15,23,42,0.16)] backdrop-blur-2xl z-50 flex flex-col border-l border-black/10 transition-transform duration-300 ease-out ${isGlobalChartVisible ? "translate-x-0" : "translate-x-full"}`}
          >
            <PatientChartSidePanel
              selectedPatient={patientForGlobalChartPanel}
              onClose={closeGlobalChart}
            />
          </aside>
        </>
      )}

      <DoctorFeed
        isOpen={isDoctorFeedOpen}
        onClose={closeDoctorFeed}
        onArticleClick={(article) => {
          setReaderArticle(article);
          setArticleReaderOpen(true);
        }}
        onConnectionClick={(connection, doctorInfo) => {
          if (doctorFeedBridgeRef.current) {
            doctorFeedBridgeRef.current.handleConnectionClick(connection, doctorInfo);
            return;
          }
          const id = ++pendingDoctorFeedApplyRef.current;
          closeDoctorFeed();
          setPendingDoctorFeedConnection({ id, connection, doctorInfo });
          if (isClinicalEnabled) {
            setShowKeywordsTree(false);
            setActiveView("timeline");
            openTrialDiscoveryKeywordsView();
          } else {
            setShowKeywordsTree(true);
          }
        }}
        focusedDoctorId={feedFocusedDoctorId}
        focusedPostId={feedFocusedPostId}
        refreshTrigger={doctorFeedRefreshTrigger}
        highlightSupabasePostId={doctorFeedHighlightPostId}
      />

      <ArticleReader
        isOpen={articleReaderOpen}
        onClose={() => {
          setArticleReaderOpen(false);
          setReaderArticle(null);
        }}
        article={readerArticle}
      />

      <ComparePatientPanel
        isOpen={isComparePatientOpen}
        onClose={() => setIsComparePatientOpen(false)}
        currentPatient={selectedPatient}
        selectedIds={compareSelectedIds}
        onSelectionChange={setCompareSelectedIds}
        onCompare={(ctMode) => setCompareIsClinicalTrialMode(ctMode)}
      />

      <PatientComparisonView
        isOpen={isComparisonViewOpen}
        onClose={() => setIsComparisonViewOpen(false)}
        patients={compareSelectedPatients}
      />

      <CriteriaMatchingPanel
        isOpen={isCriteriaMatchingOpen}
        onClose={() => setIsCriteriaMatchingOpen(false)}
        onViewPatientQualification={(patient) => {
          setQualificationPanelPatient(patient);
          setIsQualificationPanelOpen(true);
        }}
      />

      <TrialQualificationPanel
        isOpen={isQualificationPanelOpen}
        onClose={() => setIsQualificationPanelOpen(false)}
        patient={qualificationPanelPatient ?? selectedPatient}
        onOpenTrials={() => {
          setIsQualificationPanelOpen(false);
          setClinicalTrialsNav({ listTab: "qualified", focusTrialId: null });
          setActiveView("trials");
        }}
      />
    </div>
  );
}