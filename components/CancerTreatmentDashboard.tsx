import { useState, useMemo, useEffect, useCallback } from "react";
import { Calendar as CalendarIcon, FileText, Activity, Sparkles, X, Send, Mic, Newspaper, Paperclip, History, Search, RefreshCw, CalendarDays, Bell } from "lucide-react";
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import ClinicalTrialsPage from "./ClinicalTrialsPage";
import TrendingResearchPage from "./TrendingResearchPage";
import AIPage from "./AIPage";
import NewsFeedPanel from "./NewsFeedPanel";
import { WaveVisualization } from './keywords-wave';
import { useAuth } from '../lib/AuthContext';
import ProfilePanel from './ProfilePanel';
import NotificationsPanel from './NotificationsPanel';

interface TimelineEvent {
  id: string;
  date: string;
  title: "Initial Diagnosis" | "Genetic Testing" | "Staging Update" | "Chemotherapy Initiated" | "Radiation Planning" | "Immunotherapy" | "Surgery Scheduled" | "Tumor Markers" | "CT Scan" | "Cardiac Function" | "PET Scan" | "Neutropenia" | "Peripheral Neuropathy" | "Fatigue Management" | "CBC Panel" | "Liver Function" | "Kidney Function" | "Hormone Receptors" | "Treatment Consent" | "Care Plan Updated" | "Progress Notes" | "Surgical Consent";
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

export default function CancerTreatmentDashboard() {
  const { profile, user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [pendingPostId, setPendingPostId] = useState<string | null>(null);
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState("30 minutes ago");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeView, setActiveView] = useState<"timeline" | "trials" | "research" | "ai">("timeline");
  const [showKeywordsTree, setShowKeywordsTree] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI assistant for cancer treatment insights. I can help you understand timeline events, answer questions about treatments, and provide guidance. How can I assist you today?"
    }
  ]);

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

  const handleRefreshKeywords = () => {
    setIsRefreshing(true);
    // Simulate AI refresh
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated("Just now");
      // Reset to relative time after a moment
      setTimeout(() => {
        setLastUpdated("30 minutes ago");
      }, 3000);
    }, 1000);
  };

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
      diagnosis: filterEventsByRange(timelineData.diagnosis, startMonth, endMonth, customFrom, customTo),
      treatment: filterEventsByRange(timelineData.treatment, startMonth, endMonth, customFrom, customTo),
      monitoring: filterEventsByRange(timelineData.monitoring, startMonth, endMonth, customFrom, customTo),
      sideEffects: filterEventsByRange(timelineData.sideEffects, startMonth, endMonth, customFrom, customTo),
      labs: filterEventsByRange(timelineData.labs, startMonth, endMonth, customFrom, customTo),
      documentation: filterEventsByRange(timelineData.documentation, startMonth, endMonth, customFrom, customTo)
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
  }, [activeTimeRange, startMonth, endMonth, searchQuery, selectedKeyword, customFrom, customTo]);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-20 bg-indigo-600 flex flex-col items-center py-8 gap-6 shadow-2xl">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg" />
        </div>
        
        <div className="flex-1 flex flex-col gap-4 pt-8">
          <button 
            onClick={() => {
              setActiveView("timeline");
              setShowKeywordsTree(false);
            }}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg ${
              (activeView === "timeline" || showKeywordsTree) ? "bg-white" : "bg-white/10 hover:bg-white/20 hover:scale-110"
            }`}
          >
            <CalendarIcon className={`w-6 h-6 ${(activeView === "timeline" || showKeywordsTree) ? "text-indigo-600" : "text-white"}`} />
          </button>
          <button 
            onClick={() => setActiveView("trials")}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              activeView === "trials" ? "bg-white shadow-lg" : "bg-white/10 hover:bg-white/20 hover:scale-110"
            } group`}
          >
            <FileText className={`w-6 h-6 ${activeView === "trials" ? "text-indigo-600" : "text-white"}`} />
          </button>
          <button 
            onClick={() => setActiveView("research")}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              activeView === "research" ? "bg-white shadow-lg" : "bg-white/10 hover:bg-white/20 hover:scale-110"
            } group`}
          >
            <Activity className={`w-6 h-6 ${activeView === "research" ? "text-indigo-600" : "text-white"}`} />
          </button>
          <button 
            onClick={() => setActiveView("ai")}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              activeView === "ai" ? "bg-white shadow-lg" : "bg-white/10 hover:bg-white/20 hover:scale-110"
            } group`}
          >
            <Sparkles className={`w-6 h-6 ${activeView === "ai" ? "text-indigo-600" : "text-white"}`} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {showKeywordsTree ? (
          <WaveVisualization 
            onClose={() => setShowKeywordsTree(false)}
            pendingPostId={pendingPostId}
            onPendingPostHandled={() => setPendingPostId(null)}
          />
        ) : activeView === "timeline" ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
              <div className="px-8 py-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-gray-900 mb-1">Patient Timeline</h1>
                    <p className="text-gray-500">Track treatment progress and key milestones</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative w-96">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search timeline"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                    </div>
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
                    <button
                      onClick={() => setIsProfileOpen(true)}
                      className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold hover:scale-105 transition-transform shadow-md"
                      title="My Profile"
                    >
                      {profile?.avatar_initials || 'U'}
                    </button>
                  </div>
                </div>
                
                {/* Time Range Selector */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                      {(["1m", "3m", "6m", "1y"] as const).map((range) => (
                        <button
                          key={range}
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
                    
                    {/* Custom Date Range Picker */}
                    <Popover open={isCustomDatePickerOpen} onOpenChange={setIsCustomDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <button
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
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowKeywordsTree(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                    >
                      <Activity className="w-4 h-4" />
                      View Keywords
                    </button>
                    <button 
                      onClick={() => setIsNewsFeedOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
                    >
                      <Newspaper className="w-4 h-4" />
                      News Feed
                    </button>
                    <button 
                      onClick={() => {
                        setIsAIPanelOpen(true);
                        setTimeout(() => setIsAIPanelVisible(true), 10);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      Ask AI
                    </button>
                  </div>
                </div>

                {/* Smart Keywords */}
                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {keywords.map((keyword) => (
                      <Popover key={keyword.id}>
                        <PopoverTrigger asChild>
                          <button
                            onClick={() => setSelectedKeyword(keyword.label)}
                            className={`px-3 py-1 rounded-full text-xs border transition-all ${
                              selectedKeyword === keyword.label 
                                ? 'ring-2 ring-indigo-500 ring-offset-1' 
                                : ''
                            } ${getKeywordColor(keyword.color)}`}
                          >
                            {keyword.label}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" side="bottom" align="start">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-gray-900">{keyword.label}</h4>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                {keyword.category}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">{keyword.description}</p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ))}
                    {selectedKeyword && (
                      <button 
                        onClick={() => setSelectedKeyword(null)}
                        className="flex items-center gap-1 px-3 py-1 rounded-full text-xs text-white bg-indigo-600 hover:bg-indigo-700 border border-indigo-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                        Clear filter
                      </button>
                    )}
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      Updated {lastUpdated}
                    </span>
                    <button
                      onClick={handleRefreshKeywords}
                      className={`p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all ${
                        isRefreshing ? 'animate-spin' : ''
                      }`}
                      title="Refresh keywords"
                      disabled={isRefreshing}
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Content */}
            <div className="flex-1 overflow-auto bg-white">
              <div className="px-8 py-6">
                {/* Date Headers */}
                <div className="flex items-center mb-8">
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
                  <div className="border-b border-gray-200 py-6">
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
                  <div className="border-b border-gray-200 py-6">
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
          </>
        ) : activeView === "trials" ? (
          <div className="relative h-full">
            <ClinicalTrialsPage onClose={() => setActiveView("timeline")} />
            <div className="absolute top-5 right-8 flex items-center gap-3 z-10">
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
        ) : activeView === "research" ? (
          <div className="relative h-full">
            <TrendingResearchPage onClose={() => setActiveView("timeline")} />
            <div className="absolute top-5 right-8 flex items-center gap-3 z-10">
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
        ) : (
          <div className="relative h-full">
            <AIPage onClose={() => setActiveView("timeline")} />
            <div className="absolute top-5 right-8 flex items-center gap-3 z-10">
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
                <h2 className="text-gray-900">Clinical AI</h2>
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
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 px-6 py-4">
              {isVoiceMode ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <button
                    className="w-16 h-16 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                    onClick={() => {
                      // Voice recording logic would go here
                      const aiResponse = {
                        id: String(messages.length + 1),
                        role: "assistant",
                        content: "Voice mode is active. In a production environment, this would record your voice, transcribe it, and provide a spoken response."
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
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (chatInput.trim()) {
                      const userMessage = {
                        id: String(messages.length + 1),
                        role: "user",
                        content: chatInput
                      };
                      
                      const aiResponse = {
                        id: String(messages.length + 2),
                        role: "assistant",
                        content: "I understand your question. This is a demo AI assistant. In a production environment, this would connect to a real AI service to provide insights about the patient's treatment timeline, medications, and care plan."
                      };
                      
                      setMessages([...messages, userMessage, aiResponse]);
                      setChatInput("");
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center transition-colors"
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
    </div>
  );
}