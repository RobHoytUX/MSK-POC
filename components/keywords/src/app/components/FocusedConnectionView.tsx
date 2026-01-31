import { motion } from 'motion/react';
import { useState } from 'react';

interface Node {
  id: string;
  label: string;
  connections: string[];
}

interface FocusedConnectionViewProps {
  focusedNode: {
    id: string;
    label: string;
    columnTitle: string;
  };
  connectedNodes: Array<{ node: Node; column: string }>;
  onClear: () => void;
  onShare: () => void;
  onSave: () => void;
}

export function FocusedConnectionView({
  focusedNode,
  connectedNodes,
  onClear,
  onShare,
  onSave,
}: FocusedConnectionViewProps) {
  const [emailInput, setEmailInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  // Generate comprehensive connection analysis
  const getConnectionAnalysis = () => {
    return {
      overview: `${focusedNode.label} serves as a critical junction in the patient's care pathway, connecting ${connectedNodes.length} distinct medical elements across multiple domains.`,
      clinicalSignificance: 'This connection pattern reveals integrated care coordination between diagnostic findings, treatment protocols, and monitoring strategies. The multimodal approach demonstrates evidence-based practice alignment.',
      pathways: [
        {
          title: 'Diagnostic Integration',
          description: 'Biomarker results inform treatment selection and prognosis assessment',
          confidence: 'High'
        },
        {
          title: 'Treatment Coordination',
          description: 'Multimodal therapy approach with synchronized monitoring protocols',
          confidence: 'High'
        },
        {
          title: 'Monitoring Framework',
          description: 'Comprehensive surveillance strategy across multiple clinical parameters',
          confidence: 'Moderate'
        }
      ],
      recommendations: [
        'Maintain current integrated care approach',
        'Continue regular cross-functional team reviews',
        'Update care plan based on emerging biomarker data',
        'Ensure patient education on all connected elements'
      ],
      riskFactors: [
        'Potential treatment interactions requiring monitoring',
        'Complexity of care coordination across multiple specialties',
        'Patient adherence to multifaceted treatment plan'
      ]
    };
  };

  const analysis = getConnectionAnalysis();

  // Calculate horizontal positions for nodes
  const totalNodes = connectedNodes.length + 1;
  const spacing = 1000 / (totalNodes + 1);

  return (
    <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full relative"
      >
        {/* Close overlay area */}
        <div className="absolute inset-0" onClick={onClear} />

        {/* Main content */}
        <div className="relative z-10 h-full flex items-center">
          {/* Left side - Horizontal connection visualization */}
          <div className="flex-1 flex items-center justify-center px-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative"
            >
              <svg width="1000" height="200" className="overflow-visible">
                {/* Connection lines */}
                {connectedNodes.map((conn, index) => {
                  const connX = (index + 1) * spacing;
                  const centerX = ((connectedNodes.length + 1) / 2) * spacing;
                  
                  return (
                    <motion.path
                      key={conn.node.id}
                      d={`M ${centerX} 100 Q ${(centerX + connX) / 2} ${index % 2 === 0 ? 50 : 150}, ${connX} 100`}
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.6 }}
                      transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                    />
                  );
                })}

                {/* Gradient definition */}
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                  
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Center node (focused) */}
                <motion.g
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <circle
                    cx={((connectedNodes.length + 1) / 2) * spacing}
                    cy="100"
                    r="45"
                    fill="url(#gradient)"
                    filter="url(#glow)"
                  />
                  <foreignObject
                    x={((connectedNodes.length + 1) / 2) * spacing - 40}
                    y="75"
                    width="80"
                    height="50"
                  >
                    <div className="text-white text-center text-sm font-semibold px-2">
                      {focusedNode.label.length > 15 ? focusedNode.label.substring(0, 15) + '...' : focusedNode.label}
                    </div>
                  </foreignObject>
                </motion.g>

                {/* Connected nodes */}
                {connectedNodes.map((conn, index) => {
                  const x = (index + 1) * spacing;
                  const colors = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#6366f1', '#a855f7'];
                  const color = colors[index % colors.length];

                  return (
                    <motion.g
                      key={conn.node.id}
                      initial={{ scale: 0, y: -20, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    >
                      <circle
                        cx={x}
                        cy="100"
                        r="35"
                        fill={color}
                        opacity="0.9"
                      />
                      <foreignObject
                        x={x - 30}
                        y="80"
                        width="60"
                        height="40"
                      >
                        <div className="text-white text-center text-xs font-medium px-1">
                          {conn.node.label.length > 12 ? conn.node.label.substring(0, 12) + '...' : conn.node.label}
                        </div>
                      </foreignObject>
                      <text
                        x={x}
                        y="150"
                        textAnchor="middle"
                        className="text-xs font-medium fill-white"
                      >
                        {conn.column}
                      </text>
                    </motion.g>
                  );
                })}
              </svg>
            </motion.div>
          </div>

          {/* Right side - Detail panel */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-[480px] h-full bg-white shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 px-6 py-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-white">Connection Analysis</h2>
                <button
                  onClick={onClear}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-cyan-50 text-sm">{focusedNode.label} • {focusedNode.columnTitle}</p>
            </div>

            {/* Action buttons */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex gap-3">
              <button
                onClick={onSave}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white text-sm font-semibold rounded-lg shadow-md transition-all"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save
              </button>
              <button
                onClick={onShare}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-semibold rounded-lg shadow-md transition-all"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
              <button
                onClick={onClear}
                className="px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg border border-gray-300 shadow-sm transition-all"
              >
                Clear
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Overview */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Overview
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.overview}</p>
              </div>

              {/* AI Clinical Significance */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI Clinical Significance
                </h3>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                  <p className="text-sm text-gray-800 leading-relaxed">{analysis.clinicalSignificance}</p>
                </div>
              </div>

              {/* Care Pathways */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Care Pathways</h3>
                <div className="space-y-3">
                  {analysis.pathways.map((pathway, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-cyan-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm">{pathway.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          pathway.confidence === 'High' ? 'bg-green-100 text-green-700' :
                          pathway.confidence === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {pathway.confidence}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{pathway.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected Elements */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Connected Elements ({connectedNodes.length})
                </h3>
                <div className="space-y-2">
                  {connectedNodes.map((conn, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-cyan-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{conn.node.label}</p>
                        <p className="text-xs text-gray-500">{conn.column}</p>
                      </div>
                      <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Clinical Recommendations</h3>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risk Factors */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Risk Factors</h3>
                <ul className="space-y-2">
                  {analysis.riskFactors.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-sm text-gray-700">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
