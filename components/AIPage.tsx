import { useState } from "react";
import { ArrowUp, Mic, MicOff, Paperclip, FileText, Bot, Search, Clock, Plus, History, ChevronLeft } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  mode: "agent" | "research";
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastMessage: Date;
  mode: "agent" | "research";
}

const sampleChatHistory: ChatSession[] = [
  {
    id: "chat-1",
    title: "Treatment protocol review - AC-T regimen",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Analyze the AC-T chemotherapy protocol for this Stage II ER+/PR+ HER2- patient",
        timestamp: new Date(2024, 10, 20, 10, 30),
        mode: "agent"
      },
      {
        id: "m2",
        role: "assistant",
        content: "Based on the patient timeline, the AC-T protocol (Adriamycin + Cyclophosphamide followed by Paclitaxel) is appropriate for Stage II ER+/PR+ HER2- breast cancer. The patient has shown excellent response with 40% tumor reduction by May and complete metabolic response by November. Consider discussing adjuvant endocrine therapy given the strong hormone receptor positivity (ER 85%, PR 70%).",
        timestamp: new Date(2024, 10, 20, 10, 31),
        mode: "agent"
      }
    ],
    lastMessage: new Date(2024, 10, 20, 10, 31),
    mode: "agent"
  },
  {
    id: "chat-2",
    title: "CDK4/6 inhibitor literature review",
    messages: [
      {
        id: "m3",
        role: "user",
        content: "Find recent evidence on CDK4/6 inhibitors plus fulvestrant for ER+ metastatic disease",
        timestamp: new Date(2024, 10, 18, 14, 15),
        mode: "research"
      },
      {
        id: "m4",
        role: "assistant",
        content: "Latest NEJM data (Oct 2024) shows CDK4/6 + fulvestrant + AKT inhibitor triple combination achieves median PFS of 18.4 months vs 9.1 months with fulvestrant alone in HR+/HER2- metastatic breast cancer. PIK3CA-mutated tumors show even greater benefit (21.2 months PFS). This aligns with the trending research available in the Trending Research section.",
        timestamp: new Date(2024, 10, 18, 14, 16),
        mode: "research"
      }
    ],
    lastMessage: new Date(2024, 10, 18, 14, 16),
    mode: "research"
  },
  {
    id: "chat-3",
    title: "Lab value interpretation - Liver function",
    messages: [
      {
        id: "m5",
        role: "user",
        content: "Review the March 15 liver function panel results",
        timestamp: new Date(2024, 10, 15, 9, 20),
        mode: "agent"
      },
      {
        id: "m6",
        role: "assistant",
        content: "March 15 hepatic panel: AST 28 U/L, ALT 32 U/L, Total Bilirubin 0.8 mg/dL. All values within normal limits indicating no hepatotoxicity from chemotherapy. Safe to continue with planned AC-T protocol. Recommend continued monitoring with each cycle.",
        timestamp: new Date(2024, 10, 15, 9, 21),
        mode: "agent"
      }
    ],
    lastMessage: new Date(2024, 10, 15, 9, 21),
    mode: "agent"
  }
];

interface AIPageProps {
  onClose: () => void;
}

export default function AIPage({}: AIPageProps) {
  const [mode, setMode] = useState<"agent" | "research">("agent");
  const [input, setInput] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [chatHistory] = useState<ChatSession[]>(sampleChatHistory);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
      mode: mode
    };

    setMessages([...messages, newMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: mode === "agent" 
          ? "I'm analyzing the patient's timeline data. This 52-year-old patient with Stage II ER+/PR+ HER2- breast cancer has demonstrated excellent response to AC-T chemotherapy with significant tumor reduction. The November PET scan shows complete metabolic response. Key considerations: Continue with planned lumpectomy, evaluate for adjuvant endocrine therapy (Tamoxifen or Aromatase Inhibitor given strong ER/PR positivity), and monitor for late toxicities from treatment."
          : "I've reviewed the latest research relevant to this case. The Trending Research section contains 6 recent breakthrough studies including AI-driven immunotherapy prediction (Nature Medicine, Nov 2024), surgical de-escalation data (Lancet Oncology, Oct 2024), and ctDNA monitoring advances (JAMA Oncology, Nov 2024). The Clinical Trials section lists 6 active breast cancer trials including neoadjuvant pembrolizumab studies and CDK4/6 inhibitor combinations. Would you like me to summarize specific findings?",
        timestamp: new Date(),
        mode: mode
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleFileUpload = () => {
    // Placeholder for file upload functionality
    console.log("File upload triggered - Upload patient records, pathology reports, or imaging studies");
  };

  const handleLabUpload = () => {
    // Placeholder for lab upload functionality  
    console.log("Lab upload triggered - Upload CBC, CMP, tumor markers, or other lab results");
  };

  const loadChatSession = (session: ChatSession) => {
    setCurrentSession(session);
    setMessages(session.messages);
    setMode(session.mode);
    setShowHistory(false);
  };

  const startNewChat = () => {
    setCurrentSession(null);
    setMessages([]);
    setShowHistory(false);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full flex bg-white">
      {/* Chat History Sidebar */}
      <div className={`${showHistory ? 'w-80' : 'w-0'} transition-all duration-300 border-r border-gray-200 flex flex-col overflow-hidden`}>
        <div className="px-6 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900">Chat History</h2>
            <button
              onClick={() => setShowHistory(false)}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {chatHistory.map((session) => (
              <button
                key={session.id}
                onClick={() => loadChatSession(session)}
                className={`w-full p-3 rounded-lg text-left transition-all bg-gray-100 ${
                  currentSession?.id === session.id
                    ? "border border-indigo-300"
                    : "border border-transparent hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm text-gray-900 line-clamp-2">{session.title}</p>
                  {session.mode === "research" ? (
                    <Search className="w-3 h-3 text-purple-600 flex-shrink-0 ml-2" />
                  ) : (
                    <Bot className="w-3 h-3 text-indigo-600 flex-shrink-0 ml-2" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{formatDate(session.lastMessage)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Home Button - shows when in chat mode */}
                {messages.length > 0 && (
                  <button
                    onClick={startNewChat}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                    title="Back to home"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                <div>
                  <h1 className="text-gray-900 mb-1">Clinical AI</h1>
                  <p className="text-gray-500">Intelligent analysis for oncology professionals</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Mode Switcher */}
                <div className="bg-gray-100 rounded-lg p-1 flex items-center gap-0">
                  <button
                    onClick={() => setMode("agent")}
                    className={`px-4 py-2 rounded-md text-sm transition-all flex items-center gap-2 ${
                      mode === "agent"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                    Clinical Agent
                  </button>
                  <button
                    onClick={() => setMode("research")}
                    className={`px-4 py-2 rounded-md text-sm transition-all flex items-center gap-2 ${
                      mode === "research"
                        ? "bg-white text-purple-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    Research Mode
                  </button>
                </div>

                {/* Action Buttons */}
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                  title="View history"
                >
                  <History className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={startNewChat}
                  className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                  title="New chat"
                >
                  <Plus className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            // Empty State
            <div className="h-full flex flex-col items-center px-8 max-w-3xl mx-auto pt-24">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
                mode === "agent" ? "bg-indigo-100" : "bg-purple-100"
              }`}>
                {mode === "agent" ? (
                  <Bot className={`w-10 h-10 ${mode === "agent" ? "text-indigo-600" : "text-purple-600"}`} />
                ) : (
                  <Search className="w-10 h-10 text-purple-600" />
                )}
              </div>
              <h2 className="text-gray-900 mb-2">
                {mode === "agent" ? "Clinical Agent Mode" : "Research Mode"}
              </h2>
              <p className="text-gray-500 text-center mb-8 max-w-md">
                {mode === "agent"
                  ? "Analyze patient timeline data, interpret labs, review treatment protocols, and get clinical decision support based on the complete patient record in this dashboard."
                  : "Search and synthesize evidence from the Trending Research library and Clinical Trials database. Get summaries of breakthrough studies and trial eligibility assessments."}
              </p>
              
              {/* Suggested Prompts */}
              <div className="w-full max-w-2xl">
                <p className="text-sm text-gray-600 mb-3">Suggested queries:</p>
                <div className="grid grid-cols-2 gap-3">
                  {mode === "agent" ? (
                    <>
                      <button
                        onClick={() => setInput("Summarize this patient's treatment response and recommend next steps")}
                        className="p-4 bg-white border border-gray-200 rounded-lg text-left hover:border-blue-500 hover:scale-105 transition-all"
                      >
                        <p className="text-sm text-gray-700">Summarize treatment response and recommend next steps</p>
                      </button>
                      <button
                        onClick={() => setInput("Analyze the Grade 2 neutropenia event from February - dose modification needed?")}
                        className="p-4 bg-white border border-gray-200 rounded-lg text-left hover:border-blue-500 hover:scale-105 transition-all"
                      >
                        <p className="text-sm text-gray-700">Analyze the neutropenia event - dose modification needed?</p>
                      </button>
                      <button
                        onClick={() => setInput("What are the key tumor markers and imaging findings to discuss with patient?")}
                        className="p-4 bg-white border border-gray-200 rounded-lg text-left hover:border-blue-500 hover:scale-105 transition-all"
                      >
                        <p className="text-sm text-gray-700">Key findings to discuss with patient at next visit</p>
                      </button>
                      <button
                        onClick={() => setInput("Based on BRCA negative results, what's the recurrence risk and surveillance plan?")}
                        className="p-4 bg-white border border-gray-200 rounded-lg text-left hover:border-blue-500 hover:scale-105 transition-all"
                      >
                        <p className="text-sm text-gray-700">Recurrence risk assessment and surveillance strategy</p>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setInput("Compare AI-driven immunotherapy prediction models from trending research")}
                        className="p-4 bg-white border border-gray-200 rounded-lg text-left hover:border-blue-500 hover:scale-105 transition-all"
                      >
                        <p className="text-sm text-gray-700">Compare AI immunotherapy prediction models</p>
                      </button>
                      <button
                        onClick={() => setInput("Is this patient eligible for any trials in the Clinical Trials section?")}
                        className="p-4 bg-white border border-gray-200 rounded-lg text-left hover:border-blue-500 hover:scale-105 transition-all"
                      >
                        <p className="text-sm text-gray-700">Assess patient eligibility for available clinical trials</p>
                      </button>
                      <button
                        onClick={() => setInput("Summarize latest ctDNA monitoring data from JAMA Oncology trending research")}
                        className="p-4 bg-white border border-gray-200 rounded-lg text-left hover:border-blue-500 hover:scale-105 transition-all"
                      >
                        <p className="text-sm text-gray-700">Summarize latest ctDNA monitoring evidence</p>
                      </button>
                      <button
                        onClick={() => setInput("What do breast conservation studies say about this patient's tumor profile?")}
                        className="p-4 bg-white border border-gray-200 rounded-lg text-left hover:border-blue-500 hover:scale-105 transition-all"
                      >
                        <p className="text-sm text-gray-700">Evidence for breast conservation in this case</p>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Messages Display
            <div className="px-8 py-6 max-w-4xl mx-auto w-full">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    {message.role === "assistant" && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.mode === "agent" ? "bg-indigo-100" : "bg-purple-100"
                      }`}>
                        {message.mode === "agent" ? (
                          <Bot className={`w-4 h-4 ${message.mode === "agent" ? "text-indigo-600" : "text-purple-600"}`} />
                        ) : (
                          <Search className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                    )}
                    <div className={`max-w-2xl ${message.role === "user" ? "order-first" : ""}`}>
                      <div className={`px-4 py-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 px-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white">
          <div className="px-8 py-6 max-w-4xl mx-auto w-full">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                {/* Gradient border wrapper */}
                <div className="bg-gradient-to-r from-blue-500 to-orange-500 rounded-full p-[2px]">
                  <div className="relative bg-white rounded-full">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder={
                        isVoiceMode
                          ? ""
                          : mode === "agent"
                          ? "Ask about patient timeline, labs, treatments, or clinical decisions..."
                          : "Search research articles, clinical trials, or evidence synthesis..."
                      }
                      className="w-full px-4 py-3 border-0 rounded-full focus:ring-0 focus:outline-none pr-32 bg-white"
                      disabled={isVoiceMode}
                    />
                    {/* Voice Mode Indicator - replaces placeholder */}
                    {isVoiceMode && (
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                        <div className="flex gap-1">
                          <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse"></span>
                          <span className="w-1 h-6 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: "0.1s" }}></span>
                          <span className="w-1 h-5 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></span>
                        </div>
                        <span className="text-sm text-red-600">Listening...</span>
                      </div>
                    )}
                    {/* Action Icons */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button
                        onClick={handleFileUpload}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Upload Records"
                      >
                        <Paperclip className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={handleLabUpload}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Upload Labs"
                      >
                        <FileText className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => setIsVoiceMode(!isVoiceMode)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Voice Input"
                      >
                        {isVoiceMode ? (
                          <MicOff className="w-4 h-4 text-red-500" />
                        ) : (
                          <Mic className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isVoiceMode}
                className={`w-12 h-12 rounded-full transition-colors flex items-center justify-center ${
                  mode === "agent"
                    ? "bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300"
                    : "bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300"
                } text-white disabled:cursor-not-allowed`}
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}