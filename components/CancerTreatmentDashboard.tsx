import { useState, useMemo } from "react";
import { Calendar, FileText, Activity, Sparkles, X, Send, Mic, Newspaper, Paperclip, History, Search, RefreshCw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import ClinicalTrialsPage from "./ClinicalTrialsPage";
import TrendingResearchPage from "./TrendingResearchPage";
import AIPage from "./AIPage";
import NewsFeedPanel from "./NewsFeedPanel";

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

const getKeywordColor = (color: string) => {
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

// Function to convert date string to position percentage based on visible months
const getDatePosition = (dateStr: string, visibleMonths: string[], startMonthIndex: number) => {
  const monthMap: Record<string, number> = {
    "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
    "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
  };
  
  const [month, day] = dateStr.split(' ');
  const monthIndex = monthMap[month];
  const dayNum = parseInt(day);
  
  // Calculate relative position within the visible range
  const relativeMonth = monthIndex - startMonthIndex;
  if (relativeMonth < 0 || relativeMonth >= visibleMonths.length) {
    return -100; // Hide if outside range
  }
  
  const position = (relativeMonth + (dayNum / 31)) / (visibleMonths.length - 1);
  // Clamp to ensure nodes don't exceed 100%
  return Math.min(position * 100, 100);
};

// Filter events based on time range
const filterEventsByRange = (events: TimelineEvent[], startMonth: number, endMonth: number) => {
  return events.filter(event => {
    const eventMonth = getMonthIndex(event.date);
    return eventMonth >= startMonth && eventMonth <= endMonth;
  });
};

export default function CancerTreatmentDashboard() {
  const [activeTimeRange, setActiveTimeRange] = useState("1y");
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
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI assistant for cancer treatment insights. I can help you understand timeline events, answer questions about treatments, and provide guidance. How can I assist you today?"
    }
  ]);

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
    
    return { visibleMonths: months, startMonth: start, endMonth: end };
  }, [activeTimeRange]);

  // Filter timeline data based on active time range and search/keyword filters
  const filteredData = useMemo(() => {
    const timeFiltered = {
      diagnosis: filterEventsByRange(timelineData.diagnosis, startMonth, endMonth),
      treatment: filterEventsByRange(timelineData.treatment, startMonth, endMonth),
      monitoring: filterEventsByRange(timelineData.monitoring, startMonth, endMonth),
      sideEffects: filterEventsByRange(timelineData.sideEffects, startMonth, endMonth),
      labs: filterEventsByRange(timelineData.labs, startMonth, endMonth),
      documentation: filterEventsByRange(timelineData.documentation, startMonth, endMonth)
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
  }, [activeTimeRange, startMonth, endMonth, searchQuery, selectedKeyword]);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-20 bg-indigo-600 flex flex-col items-center py-8 gap-6 shadow-2xl">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg" />
        </div>
        
        <div className="flex-1 flex flex-col gap-4 pt-8">
          <button 
            onClick={() => setActiveView("timeline")}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg ${
              activeView === "timeline" ? "bg-white" : "bg-white/10 hover:bg-white/20 hover:scale-110"
            }`}
          >
            <Calendar className={`w-6 h-6 ${activeView === "timeline" ? "text-indigo-600" : "text-white"}`} />
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
        {activeView === "timeline" ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
              <div className="px-8 py-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-gray-900 mb-1">Patient Timeline</h1>
                    <p className="text-gray-500">Track treatment progress and key milestones</p>
                  </div>
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
                </div>
                
                {/* Time Range Selector */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    {["1m", "3m", "6m", "1y"].map((range) => (
                      <button
                        key={range}
                        onClick={() => setActiveTimeRange(range)}
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
                  
                  <div className="flex items-center gap-3">
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
              </div>
            </div>

            {/* Timeline Content */}
            <div className="flex-1 overflow-auto bg-white">
              <div className="px-8 py-6">
                {/* Month Headers */}
                <div className="flex items-center mb-8">
                  <div className="w-40" /> {/* Spacer for row labels */}
                  <div className="flex-1 flex justify-between px-8">
                    {visibleMonths.map((month, idx) => (
                      <div key={idx} className="text-gray-500 text-sm">
                        {month}
                      </div>
                    ))}
                  </div>
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
                          const position = getDatePosition(event.date, visibleMonths, startMonth);
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
                          const position = getDatePosition(event.date, visibleMonths, startMonth);
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
                          const position = getDatePosition(event.date, visibleMonths, startMonth);
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
                          const position = getDatePosition(event.date, visibleMonths, startMonth);
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
                          const position = getDatePosition(event.date, visibleMonths, startMonth);
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

                  {/* Documentation Row */}
                  <div className="border-b border-gray-200 py-6">
                    <div className="flex items-center">
                      <div className="w-40 pr-6">
                        <h3 className="text-gray-900 mb-1">Documentation</h3>
                        <p className="text-gray-500 text-sm">Forms & records</p>
                      </div>
                      <div className="flex-1 relative h-16">
                        {/* Timeline line */}
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-rose-200 rounded-full" />
                        
                        {/* Events */}
                        {filteredData.documentation.map((event) => {
                          const position = getDatePosition(event.date, visibleMonths, startMonth);
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
                                      View Documentation →
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

                {/* Keywords Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-gray-900">Smart Keywords</h3>
                      <button className="text-indigo-600 hover:text-indigo-700 text-sm transition-colors">
                        View all keywords
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        Last updated - {lastUpdated}
                      </span>
                      <button
                        onClick={handleRefreshKeywords}
                        className={`p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-indigo-600 transition-all ${
                          isRefreshing ? 'animate-spin' : ''
                        }`}
                        title="Refresh keywords"
                        disabled={isRefreshing}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword) => (
                      <Popover key={keyword.id}>
                        <PopoverTrigger asChild>
                          <button
                            onClick={() => setSelectedKeyword(keyword.label)}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                              selectedKeyword === keyword.label 
                                ? 'ring-2 ring-indigo-500 ring-offset-2' 
                                : ''
                            } ${getKeywordColor(keyword.color)}`}
                          >
                            {keyword.label}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" side="top" align="start">
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
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm text-white bg-indigo-600 hover:bg-indigo-700 border border-indigo-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Clear filter
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : activeView === "trials" ? (
          <ClinicalTrialsPage onClose={() => setActiveView("timeline")} />
        ) : activeView === "research" ? (
          <TrendingResearchPage onClose={() => setActiveView("timeline")} />
        ) : (
          <AIPage onClose={() => setActiveView("timeline")} />
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
    </div>
  );
}