import { motion } from 'motion/react';

interface QuantumPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuantumPanel({ isOpen, onClose }: QuantumPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <motion.div
        initial={{ x: -500, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -500, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 w-[500px] h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 shadow-2xl overflow-hidden z-50"
      >
        {/* Header */}
        <div className="relative px-6 py-6 border-b border-purple-500/30 bg-black/20">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="2" fill="white" />
                  <ellipse cx="12" cy="12" rx="10" ry="4" strokeWidth="1.5" />
                  <ellipse cx="12" cy="12" rx="10" ry="4" strokeWidth="1.5" transform="rotate(60 12 12)" />
                  <ellipse cx="12" cy="12" rx="10" ry="4" strokeWidth="1.5" transform="rotate(120 12 12)" />
                </svg>
              </div>
              <div className="absolute inset-0 bg-purple-500 rounded-lg animate-ping opacity-20"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Quantum Analysis</h2>
              <p className="text-sm text-purple-300">AI-Powered Forecasts & Recommendations</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-100px)] overflow-y-auto p-6 space-y-6">
          {/* Forecast Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <h3 className="text-lg font-semibold text-white">Treatment Forecasts</h3>
            </div>
            
            <div className="space-y-3">
              {[
                {
                  title: "Response Prediction",
                  probability: 87,
                  description: "High likelihood of positive response to hormone therapy based on biomarker profile and treatment history.",
                  trend: "up"
                },
                {
                  title: "Side Effect Risk",
                  probability: 23,
                  description: "Low probability of severe adverse reactions given current health status and genetic markers.",
                  trend: "down"
                },
                {
                  title: "Progression-Free Survival",
                  probability: 76,
                  description: "Strong indicators suggest extended progression-free period with current treatment protocol.",
                  trend: "up"
                }
              ].map((forecast, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white">{forecast.title}</h4>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      forecast.trend === 'up' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {forecast.probability}%
                    </span>
                  </div>
                  <p className="text-xs text-purple-200 mb-3">{forecast.description}</p>
                  <div className="w-full bg-purple-950/50 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${forecast.probability}%` }}
                      transition={{ delay: idx * 0.1 + 0.2, duration: 0.8 }}
                      className={`h-2 rounded-full ${
                        forecast.trend === 'up' ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="space-y-4 pt-4 border-t border-purple-500/30">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-lg font-semibold text-white">Key Recommendations</h3>
            </div>
            
            <div className="space-y-3">
              {[
                {
                  priority: "High",
                  title: "Consider Combination Therapy",
                  description: "Quantum analysis suggests combining hormone therapy with targeted immunotherapy could improve outcomes by 34%.",
                  action: "Review with oncology team"
                },
                {
                  priority: "Medium",
                  title: "Enhanced Biomarker Monitoring",
                  description: "Increase frequency of HER2 and hormone receptor testing to every 4 weeks for optimal treatment adjustment.",
                  action: "Schedule additional labs"
                },
                {
                  priority: "Medium",
                  title: "Genetic Panel Expansion",
                  description: "Additional genetic markers (PIK3CA, ESR1) may provide valuable insights for treatment optimization.",
                  action: "Consult genetic counselor"
                },
                {
                  priority: "Low",
                  title: "Lifestyle Intervention",
                  description: "Integrating structured exercise and nutrition plans correlates with 15% improvement in treatment tolerance.",
                  action: "Refer to wellness program"
                }
              ].map((rec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 + 0.3 }}
                  className="bg-white/5 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 px-2 py-1 rounded text-xs font-bold ${
                      rec.priority === 'High' ? 'bg-red-500/20 text-red-300' :
                      rec.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {rec.priority}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                        {rec.title}
                      </h4>
                      <p className="text-xs text-purple-200 mb-2">{rec.description}</p>
                      <div className="flex items-center gap-1 text-xs text-purple-400">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <span>{rec.action}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Confidence Score */}
          <div className="pt-4 border-t border-purple-500/30">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/40 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">Analysis Confidence</span>
                <span className="text-2xl font-bold text-purple-300">94%</span>
              </div>
              <p className="text-xs text-purple-200">
                Based on 1,247 data points and 50,000+ similar patient outcomes in quantum database
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
