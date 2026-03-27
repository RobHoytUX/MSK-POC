import { useState, useRef, useEffect, useCallback, useMemo, type MutableRefObject } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Patient } from '../../lib/patients';
import { getPatientRelevantNodes } from '../../lib/patientNodeRelevance';
import { medicalData as sharedMedicalData, type GraphNode } from '../../lib/medicalGraphData';
import { ShareModal } from './ShareModal';
import { SaveModal } from './SaveModal';
import { QuantumPanel } from './QuantumPanel';
import { PostToFeedModal } from './PostToFeedModal';
import { DoctorConnectionBanner } from './DoctorConnectionBanner';
import { ClinicalNotesModal } from './ClinicalNotesModal';
import { toast } from 'sonner';
export type DoctorFeedCanvasBridge = {
  handleConnectionClick: (
    connection: { title: string; description?: string },
    doctorInfo?: { name: string; avatar: string; specialty: string; doctorId: number; postId: number }
  ) => void;
};

/** Queued from Doctor Network when Keywords isn’t mounted; `id` dedupes Strict Mode double-apply. */
export type PendingDoctorFeedConnection = {
  id: number;
  connection: { title: string; description?: string };
  doctorInfo?: { name: string; avatar: string; specialty: string; doctorId: number; postId: number };
};

interface WaveVisualizationProps {
  onFocusedNodeChange?: (isFocused: boolean) => void;
  doctorFeedBridgeRef?: MutableRefObject<DoctorFeedCanvasBridge | null>;
  onDoctorFeedClose?: () => void;
  onDoctorFeedOpenFromCanvas?: (payload: { focusedDoctorId: number; focusedPostId: number }) => void;
  onDoctorFeedPostsChanged?: () => void;
  /** When set (e.g. after navigating from Doctor Network), applied once then cleared via onConsume. */
  pendingDoctorFeedConnection?: PendingDoctorFeedConnection | null;
  onConsumePendingDoctorFeedConnection?: () => void;
  comparePatients?: Patient[];
  activeComparePatientId?: string | null;
  onSetActiveComparePatient?: (id: string | null) => void;
}

const medicalData = sharedMedicalData;

export function WaveVisualization({
  onFocusedNodeChange,
  doctorFeedBridgeRef,
  onDoctorFeedClose,
  onDoctorFeedOpenFromCanvas,
  onDoctorFeedPostsChanged,
  pendingDoctorFeedConnection,
  onConsumePendingDoctorFeedConnection,
  comparePatients = [],
  activeComparePatientId = null,
  onSetActiveComparePatient,
}: WaveVisualizationProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [focusedNode, setFocusedNode] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [detailView, setDetailView] = useState<'connection' | 'node'>('connection');
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);
  const [commentPanelOpen, setCommentPanelOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showVoicePopup, setShowVoicePopup] = useState(false);
  const [showQuantumPanel, setShowQuantumPanel] = useState(false);
  const [postToFeedModalOpen, setPostToFeedModalOpen] = useState(false);
  const [savedCanvasState, setSavedCanvasState] = useState<{ focusedNode: string | null; selectedNodes: Set<string> } | null>(null);
  const [doctorConnectionInfo, setDoctorConnectionInfo] = useState<{ name: string; avatar: string; specialty: string; postTitle: string; doctorId: number; postId: number } | null>(null);
  const [clinicalNotesModalOpen, setClinicalNotesModalOpen] = useState(false);
  const [notesTarget, setNotesTarget] = useState<{ type: 'node' | 'connection'; id: string; title: string } | null>(null);
  const [nodeNotes, setNodeNotes] = useState<Record<string, string>>({});
  const [connectionNotes, setConnectionNotes] = useState<Record<string, string>>({});

  // Compare patients: node relevance
  const activeComparePatient = useMemo(
    () => comparePatients.find((p) => p.id === activeComparePatientId) ?? null,
    [comparePatients, activeComparePatientId]
  );
  const activePatientRelevantNodes = useMemo(
    () => (activeComparePatient ? getPatientRelevantNodes(activeComparePatient) : null),
    [activeComparePatient]
  );
  // Per-patient relevance for the hovered node (for badge bar dimming)
  const hoveredNodePatientRelevance = useMemo(() => {
    if (!hoveredNode || comparePatients.length === 0) return null;
    const map: Record<string, boolean> = {};
    comparePatients.forEach((p) => {
      map[p.id] = getPatientRelevantNodes(p).has(hoveredNode);
    });
    return map;
  }, [hoveredNode, comparePatients]);
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Dr. Sarah Chen',
      role: 'Oncologist',
      avatar: 'SC',
      timestamp: '2 hours ago',
      text: 'The connection between chemotherapy and ER+/PR+ status is critical here. We should monitor biomarker response closely.',
      likes: 3,
      liked: false,
      replies: [
        {
          id: 2,
          author: 'Nurse Jessica Martinez',
          role: 'Clinical Nurse',
          avatar: 'JM',
          timestamp: '1 hour ago',
          text: 'Agreed. I\'ve scheduled additional lab monitoring for next week.',
          likes: 1,
          liked: false,
        }
      ]
    },
    {
      id: 3,
      author: 'Dr. Michael Roberts',
      role: 'Radiologist',
      avatar: 'MR',
      timestamp: '45 minutes ago',
      text: 'Latest imaging shows good response to radiation therapy. Tumor markers are trending down.',
      likes: 5,
      liked: true,
      replies: []
    }
  ]);
  const [svgWidth, setSvgWidth] = useState(1200);
  const svgRef = useRef<SVGSVGElement>(null);

  // Update SVG width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (svgRef.current) {
        const width = svgRef.current.clientWidth;
        if (width > 0) {
          setSvgWidth(width);
        }
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    const timer = setTimeout(updateWidth, 100);

    return () => {
      window.removeEventListener('resize', updateWidth);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      if (svgRef.current) {
        const width = svgRef.current.getBoundingClientRect().width;
        if (width > 0) {
          setSvgWidth(width);
        }
      }
    };

    const timer1 = setTimeout(updateWidth, 50);
    const timer2 = setTimeout(updateWidth, 150);
    const timer3 = setTimeout(updateWidth, 300);
    const timer4 = setTimeout(updateWidth, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [focusedNode, commentPanelOpen]);

  const handleNodeClick = (nodeId: string) => {
    if (focusedNode === nodeId) {
      setFocusedNode(null);
      setSelectedNodes(new Set());
      setDetailView('connection');
      setDetailNodeId(null);
      onFocusedNodeChange?.(false);
    } else {
      setFocusedNode(nodeId);
      setSelectedNodes(new Set([nodeId]));
      setDetailView('connection');
      setDetailNodeId(null);
      onFocusedNodeChange?.(true);
    }
  };

  /** Connected Elements / Related Elements in the side panel — refocus the canvas on that node (same as clicking it on the graph). */
  const handleConnectedNodeClick = (nodeId: string) => {
    setFocusedNode(nodeId);
    setSelectedNodes(new Set([nodeId]));
    setDetailView('connection');
    setDetailNodeId(null);
    onFocusedNodeChange?.(true);
  };

  const handleNodeRightClick = (e: React.MouseEvent, nodeId: string, nodeLabel: string) => {
    e.preventDefault();
    e.stopPropagation();
    setNotesTarget({ type: 'node', id: nodeId, title: nodeLabel });
    setClinicalNotesModalOpen(true);
  };

  const handleConnectionRightClick = (e: React.MouseEvent, fromId: string, toId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const fromNode = medicalData.flatMap(col => col.nodes).find(n => n.id === fromId);
    const toNode = medicalData.flatMap(col => col.nodes).find(n => n.id === toId);
    const connectionId = `${fromId}-${toId}`;
    const connectionTitle = `${fromNode?.label} → ${toNode?.label}`;
    setNotesTarget({ type: 'connection', id: connectionId, title: connectionTitle });
    setClinicalNotesModalOpen(true);
  };

  const handleSaveNotes = (note: string) => {
    if (!notesTarget) return;
    
    if (notesTarget.type === 'node') {
      setNodeNotes(prev => ({ ...prev, [notesTarget.id]: note }));
      toast.success('Node notes saved', {
        description: `Clinical notes for "${notesTarget.title}" have been saved.`
      });
    } else {
      setConnectionNotes(prev => ({ ...prev, [notesTarget.id]: note }));
      toast.success('Connection notes saved', {
        description: `Clinical notes for the connection have been saved.`
      });
    }
  };

  const handleBackToConnection = () => {
    setDetailView('connection');
    setDetailNodeId(null);
  };

  const handleClear = () => {
    if (savedCanvasState) {
      setFocusedNode(savedCanvasState.focusedNode);
      setSelectedNodes(savedCanvasState.selectedNodes);
      setSavedCanvasState(null);
      onFocusedNodeChange?.(!!savedCanvasState.focusedNode);
      toast.success('Restored your previous view');
    } else {
      setFocusedNode(null);
      setSelectedNodes(new Set());
      onFocusedNodeChange?.(false);
      setShareModalOpen(false);
      setSaveModalOpen(false);
      setCommentPanelOpen(false);
    }
  };

  const handleConnectionClick = useCallback(
    (
      connection: { title: string; description?: string },
      doctorInfo?: { name: string; avatar: string; specialty: string; doctorId: number; postId: number }
    ) => {
      onDoctorFeedClose?.();
      setSavedCanvasState({
        focusedNode,
        selectedNodes: new Set(selectedNodes),
      });

      const mockConnectionNodeIds = ['mon-2', 'mon-1', 'treat-3'];

      setFocusedNode(mockConnectionNodeIds[0]);
      setSelectedNodes(new Set(mockConnectionNodeIds));
      onFocusedNodeChange?.(true);

      if (doctorInfo) {
        setDoctorConnectionInfo({
          ...doctorInfo,
          postTitle: connection.title,
        });
      }

      toast.success('Loaded connection pattern from doctor', {
        description: connection.title,
        duration: 3000,
        action: {
          label: 'Clear',
          onClick: () => handleClear(),
        },
      });
    },
    [focusedNode, selectedNodes, onDoctorFeedClose, onFocusedNodeChange, handleClear]
  );

  if (doctorFeedBridgeRef) {
    doctorFeedBridgeRef.current = { handleConnectionClick };
  }

  useEffect(() => {
    return () => {
      if (doctorFeedBridgeRef) {
        doctorFeedBridgeRef.current = null;
      }
    };
  }, [doctorFeedBridgeRef]);

  const appliedPendingFeedIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (!pendingDoctorFeedConnection) {
      appliedPendingFeedIdRef.current = null;
      return;
    }
    const { id, connection, doctorInfo } = pendingDoctorFeedConnection;
    if (appliedPendingFeedIdRef.current === id) return;
    appliedPendingFeedIdRef.current = id;
    handleConnectionClick(connection, doctorInfo);
    onConsumePendingDoctorFeedConnection?.();
  }, [pendingDoctorFeedConnection, handleConnectionClick, onConsumePendingDoctorFeedConnection]);

  const handleDoctorNameClick = () => {
    if (doctorConnectionInfo) {
      onDoctorFeedOpenFromCanvas?.({
        focusedDoctorId: doctorConnectionInfo.doctorId,
        focusedPostId: doctorConnectionInfo.postId,
      });
    }
  };

  const handleCloseDoctorBanner = () => {
    setDoctorConnectionInfo(null);
    handleClear();
  };

  const handleNodeHover = (nodeId: string | null) => {
    if (focusedNode) return;
    setHoveredNode(nodeId);
  };

  const handleLikeComment = (commentId: number) => {
    setComments(prevComments => 
      prevComments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            liked: !comment.liked,
            likes: comment.liked ? comment.likes - 1 : comment.likes + 1
          };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  liked: !reply.liked,
                  likes: reply.liked ? reply.likes - 1 : reply.likes + 1
                };
              }
              return reply;
            })
          };
        }
        return comment;
      })
    );
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (replyingTo !== null) {
      setComments(prevComments =>
        prevComments.map(comment => {
          if (comment.id === replyingTo) {
            return {
              ...comment,
              replies: [
                ...comment.replies,
                {
                  id: Date.now(),
                  author: 'You',
                  role: 'Medical Professional',
                  avatar: 'YO',
                  timestamp: 'Just now',
                  text: newComment,
                  likes: 0,
                  liked: false
                }
              ]
            };
          }
          return comment;
        })
      );
      setReplyingTo(null);
    } else {
      setComments(prevComments => [
        ...prevComments,
        {
          id: Date.now(),
          author: 'You',
          role: 'Medical Professional',
          avatar: 'YO',
          timestamp: 'Just now',
          text: newComment,
          likes: 0,
          liked: false,
          replies: []
        }
      ]);
    }
    
    setNewComment('');
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setShowVoicePopup(false);
    } else {
      setIsRecording(true);
      setShowVoicePopup(true);
    }
  };

  const handleVoicePopupClick = () => {
    const mockTranscriptions = [
      "Patient shows significant improvement in biomarker levels post-treatment. Recommend continued monitoring.",
      "Consider adjusting hormone therapy dosage based on recent lab results.",
      "Follow-up imaging scheduled for next month to assess treatment efficacy.",
      "Lab values indicate positive response to chemotherapy regimen.",
      "Patient reported minimal side effects. Continue current treatment protocol."
    ];
    const randomText = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
    setNewComment(randomText);
    setIsRecording(false);
    setShowVoicePopup(false);
  };

  const getNodeDetails = (nodeId: string): { node: GraphNode; columnTitle: string; columnIndex: number; connectedNodes: Array<{ node: GraphNode; column: string; columnIndex: number }> } | null => {
    let foundNode: GraphNode | undefined;
    let columnTitle = '';
    let columnIndex = 0;
    
    medicalData.forEach((column, colIdx) => {
      const node = column.nodes.find(n => n.id === nodeId);
      if (node) {
        foundNode = node;
        columnTitle = column.title;
        columnIndex = colIdx;
      }
    });

    if (!foundNode) return null;

    const connections = getConnections(nodeId);
    const connectedNodes: Array<{ node: GraphNode; column: string; columnIndex: number }> = [];
    
    connections.forEach(connId => {
      medicalData.forEach((column, colIdx) => {
        const node = column.nodes.find(n => n.id === connId);
        if (node) {
          connectedNodes.push({ node, column: column.title, columnIndex: colIdx });
        }
      });
    });

    return { node: foundNode, columnTitle, columnIndex, connectedNodes };
  };

  const columnWidth = 180;
  const nodeHeight = 40;
  const headerHeight = 80;

  const getNodePosition = (columnIndex: number, nodeIndex: number, totalNodes: number) => {
    const horizontalPadding = 40;
    const availableWidth = svgWidth - (horizontalPadding * 2);
    const totalColumns = medicalData.length;
    
    const totalColumnsWidth = totalColumns * columnWidth;
    const totalGapsWidth = availableWidth - totalColumnsWidth;
    const gapSize = totalGapsWidth / (totalColumns - 1);
    
    const x = horizontalPadding + columnIndex * (columnWidth + gapSize);
    
    const availableHeight = 600;
    const spacing = totalNodes > 1 ? availableHeight / (totalNodes - 1) : 0;
    const y = headerHeight + nodeIndex * spacing;
    return { x, y };
  };

  const getHorizontalPosition = (index: number, total: number) => {
    const actualSvgWidth = svgWidth;
    const nodeWidth = columnWidth;
    const minSpacing = 20;
    const maxNodesPerRow = 4;
    
    const row = Math.floor(index / maxNodesPerRow);
    const posInRow = index % maxNodesPerRow;
    const nodesInThisRow = Math.min(maxNodesPerRow, total - row * maxNodesPerRow);
    
    const totalNodesWidth = nodesInThisRow * nodeWidth;
    const totalGapsWidth = (nodesInThisRow - 1) * minSpacing;
    const rowWidth = totalNodesWidth + totalGapsWidth;
    
    const startX = (actualSvgWidth - rowWidth) / 2;
    const x = startX + posInRow * (nodeWidth + minSpacing) + nodeWidth / 2;
    
    const rowHeight = 100;
    const numRows = Math.ceil(total / maxNodesPerRow);
    const totalHeight = numRows * nodeHeight + (numRows - 1) * rowHeight;
    const startY = 350 - totalHeight / 2;
    const y = startY + row * (nodeHeight + rowHeight) + nodeHeight / 2;
    
    return { x, y };
  };

  const getConnections = (nodeId: string): string[] => {
    const allConnections: string[] = [];
    
    medicalData.forEach((column) => {
      column.nodes.forEach((node) => {
        if (node.id === nodeId) {
          allConnections.push(...node.connections);
        }
        if (node.connections.includes(nodeId)) {
          allConnections.push(node.id);
        }
      });
    });
    
    return [...new Set(allConnections)];
  };

  const isNodeVisible = (nodeId: string): boolean => {
    if (!focusedNode) return true;
    if (nodeId === focusedNode) return true;
    return getConnections(focusedNode).includes(nodeId);
  };

  const isConnectionVisible = (fromId: string, toId: string): boolean => {
    if (focusedNode) {
      return (fromId === focusedNode || toId === focusedNode) && isNodeVisible(fromId) && isNodeVisible(toId);
    }
    if (!hoveredNode && selectedNodes.size === 0) return false;
    if (hoveredNode === fromId || hoveredNode === toId) return true;
    if (selectedNodes.has(fromId) || selectedNodes.has(toId)) return true;
    return false;
  };

  const isNodeConnected = (nodeId: string): boolean => {
    if (!hoveredNode) return true;
    if (nodeId === hoveredNode) return true;
    const connections = getConnections(hoveredNode);
    return connections.includes(nodeId);
  };

  const generateCurvePath = (x1: number, y1: number, x2: number, y2: number): string => {
    if (focusedNode) {
      const midY = (y1 + y2) / 2;
      return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
    }
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
  };

  const getColumnColor = (columnIndex: number) => {
    const colors = [
      { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
      { bg: '#fce7f3', border: '#ec4899', text: '#9f1239' },
      { bg: '#dcfce7', border: '#10b981', text: '#065f46' },
      { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
      { bg: '#e0e7ff', border: '#6366f1', text: '#312e81' },
      { bg: '#f3e8ff', border: '#a855f7', text: '#581c87' },
    ];
    return colors[columnIndex % colors.length];
  };

  const getVisibleNodesInFocus = () => {
    if (!focusedNode) return [];
    
    const details = getNodeDetails(focusedNode);
    if (!details) return [];

    const visibleNodes: Array<{ id: string; label: string; columnIndex: number; isFocused: boolean }> = [
      { id: focusedNode, label: details.node.label, columnIndex: details.columnIndex, isFocused: true }
    ];

    details.connectedNodes.forEach(conn => {
      visibleNodes.push({
        id: conn.node.id,
        label: conn.node.label,
        columnIndex: conn.columnIndex,
        isFocused: false
      });
    });

    return visibleNodes;
  };

  const inCompareMode = comparePatients.length > 0;

  return (
    <div className="w-full h-full flex flex-col">

    {/* Patient compare badge bar */}
    {inCompareMode && (
      <div className="shrink-0 px-4 py-2.5 bg-white border-b border-gray-200 shadow-sm flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-gray-500 shrink-0">Viewing:</span>

        {/* All patients chip */}
        <button
          type="button"
          onClick={() => onSetActiveComparePatient?.(null)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            activeComparePatientId === null
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Patients
          <span className="opacity-70">({comparePatients.length})</span>
        </button>

        {/* Per-patient chips */}
        {comparePatients.map((patient) => {
          const isActive = activeComparePatientId === patient.id;
          const hasHoveredNode = hoveredNodePatientRelevance
            ? hoveredNodePatientRelevance[patient.id]
            : true;
          const initials = patient.name.split(' ').map((n) => n[0]).join('');
          const firstName = patient.name.split(' ')[0];
          return (
            <button
              key={patient.id}
              type="button"
              onClick={() => onSetActiveComparePatient?.(isActive ? null : patient.id)}
              title={patient.name}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${hoveredNodePatientRelevance && !hasHoveredNode ? 'opacity-30' : 'opacity-100'}`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${isActive ? 'bg-white/30 text-white' : 'bg-indigo-200 text-indigo-700'}`}>
                {initials}
              </span>
              {firstName}
            </button>
          );
        })}

      </div>
    )}

    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto relative min-h-0">
      <div className="min-w-[1200px] h-full relative flex">
        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-150 ${focusedNode ? 'mr-[440px]' : ''}`}>

        {/* Visualization */}
        <div className="p-8">
          <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Doctor Connection Banner */}
            {doctorConnectionInfo && (
              <DoctorConnectionBanner
                doctorInfo={doctorConnectionInfo}
                onDoctorClick={handleDoctorNameClick}
                onClose={handleCloseDoctorBanner}
              />
            )}
            
            {/* Action Icon Buttons - Top of Canvas spanning full width (only in focused mode) */}
            {focusedNode && (
              <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
                {/* Clear on the far left */}
                <button
                  onClick={handleClear}
                  className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg border border-gray-300 shadow-sm transition-all"
                >
                  Clear
                </button>
                {/* Action icons on the far right */}
                <div className="flex items-center gap-2">
                <button
                  onClick={() => setShareModalOpen(true)}
                  className="p-2.5 bg-white hover:bg-gray-50 rounded-lg shadow-md border border-gray-200 transition-all group"
                  title="Share"
                >
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
                
                <button
                  onClick={() => setPostToFeedModalOpen(true)}
                  className="p-2.5 bg-white hover:bg-gray-50 rounded-lg shadow-md border border-gray-200 transition-all group"
                  title="Post to Doctor Network"
                >
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </button>
                
                <button
                  onClick={() => setSaveModalOpen(true)}
                  className="p-2.5 bg-white hover:bg-gray-50 rounded-lg shadow-md border border-gray-200 transition-all group"
                  title="Save"
                >
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-cyan-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                </button>
                
                <button
                  onClick={() => setCommentPanelOpen(!commentPanelOpen)}
                  className="p-2.5 bg-white hover:bg-gray-50 rounded-lg shadow-md border border-gray-200 transition-all group"
                  title="Comments"
                >
                  <div className="relative">
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-cyan-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {comments.reduce((total, c) => total + 1 + c.replies.length, 0) > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-cyan-500 rounded-full">
                        {comments.reduce((total, c) => total + 1 + c.replies.length, 0)}
                      </span>
                    )}
                  </div>
                </button>
                </div> {/* end icon group */}
              </div>
            )}

            {/* Flex container for comment panel and canvas */}
            <div className="flex h-[875px]">
              {/* Comment Panel (pushes content) */}
              <AnimatePresence>
                {focusedNode && commentPanelOpen && (
                  <motion.div
                    key="comment-panel"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 320, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    className="flex-shrink-0 bg-white border-r border-gray-200 overflow-hidden relative"
                  >
                  <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Team Comments
                      </h4>
                      <button
                        onClick={() => setCommentPanelOpen(false)}
                        className="p-1 hover:bg-white/50 rounded transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-600">
                      {comments.reduce((total, c) => total + 1 + c.replies.length, 0)} comments from shared team members
                    </p>
                  </div>

                  <div className="p-4 h-[calc(100%-180px)] overflow-y-auto space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="space-y-2">
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-start gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {comment.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-gray-900 truncate">{comment.author}</p>
                                <span className="text-xs text-gray-500 flex-shrink-0">{comment.timestamp}</span>
                              </div>
                              <p className="text-xs text-gray-600">{comment.role}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed mb-2">{comment.text}</p>
                          <div className="flex items-center gap-3 text-xs">
                            <button
                              onClick={() => handleLikeComment(comment.id)}
                              className={`flex items-center gap-1 ${comment.liked ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'} transition-colors`}
                            >
                              <svg className={`w-4 h-4 ${comment.liked ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              <span className="font-medium">{comment.likes}</span>
                            </button>
                            <button
                              onClick={() => setReplyingTo(comment.id)}
                              className="text-gray-500 hover:text-cyan-600 transition-colors font-medium"
                            >
                              Reply
                            </button>
                          </div>
                        </div>

                        {comment.replies.length > 0 && (
                          <div className="ml-6 space-y-2">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="flex items-start gap-2 mb-2">
                                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {reply.avatar}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="text-sm font-semibold text-gray-900 truncate">{reply.author}</p>
                                      <span className="text-xs text-gray-500 flex-shrink-0">{reply.timestamp}</span>
                                    </div>
                                    <p className="text-xs text-gray-600">{reply.role}</p>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-800 leading-relaxed mb-2">{reply.text}</p>
                                <button
                                  onClick={() => handleLikeComment(reply.id)}
                                  className={`flex items-center gap-1 text-xs ${reply.liked ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'} transition-colors`}
                                >
                                  <svg className={`w-4 h-4 ${reply.liked ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                  <span className="font-medium">{reply.likes}</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
                    {replyingTo !== null && (
                      <div className="mb-2 flex items-center justify-between px-3 py-2 bg-cyan-50 rounded-lg">
                        <p className="text-xs text-cyan-700">
                          Replying to {comments.find(c => c.id === replyingTo)?.author}
                        </p>
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="text-cyan-600 hover:text-cyan-700"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <form onSubmit={handleAddComment} className="flex items-end gap-2 relative">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                        rows={1}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none resize-none"
                      />
                      
                      <div className="relative">
                        <button
                          type="button"
                          onClick={toggleVoiceRecording}
                          className={`mb-2 transition-all ${isRecording ? 'text-red-600' : 'text-gray-600 hover:text-cyan-600'}`}
                          title={isRecording ? "Stop recording" : "Start voice input"}
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </button>
                        
                        <AnimatePresence>
                          {showVoicePopup && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: 10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute bottom-full mb-2 right-0 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden cursor-pointer"
                              onClick={handleVoicePopupClick}
                            >
                              <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="relative">
                                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                      </svg>
                                    </div>
                                    <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-25"></div>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900">Listening...</p>
                                    <p className="text-xs text-gray-600">Click to add sample text</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-center gap-1 h-12">
                                  {[...Array(20)].map((_, i) => (
                                    <motion.div
                                      key={i}
                                      className="w-1 bg-red-600 rounded-full"
                                      animate={{
                                        height: [8, Math.random() * 40 + 10, 8],
                                      }}
                                      transition={{
                                        duration: 0.8,
                                        repeat: Infinity,
                                        delay: i * 0.05,
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                              
                              <div className="px-4 py-3 bg-white border-t border-gray-100">
                                <p className="text-xs text-gray-500 text-center">
                                  Tap anywhere to insert demo text
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="mb-2 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                      >
                        <svg className="w-6 h-6 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Canvas Area */}
            <div className="flex-1 p-6 pb-12">
              <svg
                ref={svgRef}
                width="100%"
                height="875"
                className="overflow-visible"
              >
              <AnimatePresence mode="wait">
                {!focusedNode ? (
                  <g key="grid-view">
                    {medicalData.map((column, colIndex) =>
                      column.nodes.map((node) => {
                        const fromPos = getNodePosition(colIndex, column.nodes.indexOf(node), column.nodes.length);
                        
                        return node.connections.map((targetId) => {
                          let toPos = { x: 0, y: 0 };
                          medicalData.forEach((targetColumn, targetColIndex) => {
                            const targetNodeIndex = targetColumn.nodes.findIndex(n => n.id === targetId);
                            if (targetNodeIndex !== -1) {
                              toPos = getNodePosition(targetColIndex, targetNodeIndex, targetColumn.nodes.length);
                            }
                          });

                          const isVisible = isConnectionVisible(node.id, targetId);
                          const isActive = hoveredNode === node.id || hoveredNode === targetId ||
                                           selectedNodes.has(node.id) || selectedNodes.has(targetId);

                          if (!isVisible) return null;

                          const totalNodes = medicalData.reduce((sum, col) => sum + col.nodes.length, 0);
                          const nodeAnimationDuration = 0.12;
                          const nodeStaggerDelay = 0.01;
                          const allNodesAppearTime = (totalNodes - 1) * nodeStaggerDelay + nodeAnimationDuration + 0.02;

                          const connectionId = `${node.id}-${targetId}`;
                          const hasNotes = connectionNotes[connectionId];

                          return (
                            <g key={connectionId}>
                              <motion.path
                                d={generateCurvePath(
                                  fromPos.x + columnWidth,
                                  fromPos.y + nodeHeight / 2,
                                  toPos.x,
                                  toPos.y + nodeHeight / 2
                                )}
                                stroke={isActive ? '#06b6d4' : (hasNotes ? '#3b82f6' : '#cbd5e1')}
                                strokeWidth={isActive ? 2 : (hasNotes ? 2 : 1)}
                                fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: isActive ? 0.8 : (hasNotes ? 0.5 : 0.3) }}
                                transition={{ duration: 0.12, delay: allNodesAppearTime }}
                                className="transition-all duration-75 cursor-pointer"
                                style={{ pointerEvents: 'stroke' }}
                                onContextMenu={(e) => handleConnectionRightClick(e, node.id, targetId)}
                              />
                            </g>
                          );
                        });
                      })
                    )}

                    {medicalData.map((column, columnIndex) => {
                      const pos = getNodePosition(columnIndex, 0, 1);
                      
                      return (
                      <g key={columnIndex}>
                        <text
                          x={pos.x}
                          y={40}
                          className="text-sm font-semibold fill-gray-700"
                        >
                          {column.title}
                        </text>
                        <text
                          x={pos.x}
                          y={60}
                          className="text-xs fill-gray-500"
                        >
                          {column.count} items
                        </text>

                        {column.nodes.map((node, nodeIndex) => {
                          const pos = getNodePosition(columnIndex, nodeIndex, column.nodes.length);
                          const isHovered = hoveredNode === node.id;
                          const isSelected = selectedNodes.has(node.id);
                          const isHighlighted = isHovered || isSelected;
                          const hasActiveConnection = hoveredNode ? 
                            getConnections(hoveredNode).includes(node.id) : false;
                          const isConnected = isNodeConnected(node.id);
                          const isDisabled = hoveredNode && !isConnected;
                          const isCompareFiltered = activePatientRelevantNodes !== null && !activePatientRelevantNodes.has(node.id);
                          const columnColor = getColumnColor(columnIndex);
                          
                          const prevNodesCount = medicalData.slice(0, columnIndex).reduce((sum, col) => sum + col.nodes.length, 0);
                          const globalNodeIndex = prevNodesCount + nodeIndex;
                          const nodeStaggerDelay = 0.01;
                          const nodeAnimationDuration = 0.12;

                          return (
                            <motion.g
                              key={node.id}
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: nodeAnimationDuration, delay: globalNodeIndex * nodeStaggerDelay }}
                              onMouseEnter={() => handleNodeHover(node.id)}
                              onMouseLeave={() => handleNodeHover(null)}
                              onClick={() => handleNodeClick(node.id)}
                              onContextMenu={(e) => handleNodeRightClick(e, node.id, node.label)}
                              className="cursor-pointer"
                              style={{ opacity: isCompareFiltered ? 0.2 : 1 }}
                            >
                              <rect
                                x={pos.x}
                                y={pos.y}
                                width={columnWidth}
                                height={nodeHeight}
                                rx={6}
                                fill={isDisabled ? '#f9fafb' : (isHighlighted ? '#ecfeff' : columnColor.bg)}
                                stroke={isDisabled ? '#e5e7eb' : (isHighlighted || hasActiveConnection ? '#06b6d4' : columnColor.border)}
                                strokeWidth={isHighlighted || hasActiveConnection ? 2 : 1}
                                opacity={isDisabled ? 0.5 : 1}
                                className="transition-all duration-200"
                              />
                              
                              {isSelected && (
                                <rect
                                  x={pos.x + 8}
                                  y={pos.y + (nodeHeight - 16) / 2}
                                  width={16}
                                  height={16}
                                  rx={3}
                                  fill={isDisabled ? '#9ca3af' : columnColor.border}
                                  opacity={isDisabled ? 0.5 : 1}
                                />
                              )}
                              {isSelected && (
                                <path
                                  d={`M ${pos.x + 11} ${pos.y + nodeHeight / 2} l 3 3 l 6 -6`}
                                  stroke="white"
                                  strokeWidth={2}
                                  fill="none"
                                  opacity={isDisabled ? 0.5 : 1}
                                />
                              )}

                              <text
                                x={pos.x + (isSelected ? 32 : 12)}
                                y={pos.y + nodeHeight / 2 + 5}
                                className="text-sm select-none"
                                fill={isDisabled ? '#9ca3af' : columnColor.text}
                                opacity={isDisabled ? 0.5 : 1}
                              >
                                {node.label.length > 20 ? node.label.substring(0, 20) + '...' : node.label}
                              </text>

                              <circle
                                cx={pos.x + columnWidth}
                                cy={pos.y + nodeHeight / 2}
                                r={4}
                                fill={isDisabled ? '#d1d5db' : (isHighlighted || hasActiveConnection ? '#06b6d4' : columnColor.border)}
                                opacity={isDisabled ? 0.5 : 1}
                                className="transition-all duration-200"
                              />

                              {nodeNotes[node.id] && (
                                <g>
                                  <circle
                                    cx={pos.x + columnWidth - 12}
                                    cy={pos.y + 8}
                                    r={8}
                                    fill="#3b82f6"
                                  />
                                  <path
                                    d={`M ${pos.x + columnWidth - 15} ${pos.y + 6} h 6 v 4 h -6 z M ${pos.x + columnWidth - 14} ${pos.y + 7} h 4 M ${pos.x + columnWidth - 14} ${pos.y + 9} h 3`}
                                    stroke="white"
                                    strokeWidth={0.5}
                                    fill="white"
                                  />
                                </g>
                              )}
                            </motion.g>
                          );
                        })}
                      </g>
                      );
                    })}
                  </g>
                ) : (
                  <g key="focused-view">
                    {(() => {
                      const visibleNodes = getVisibleNodesInFocus();
                      const sortedNodes = [...visibleNodes].sort((a, b) => a.columnIndex - b.columnIndex);
                      const focusedIndex = sortedNodes.findIndex(node => node.id === focusedNode);
                      const nodeAnimationDuration = 0.12;
                      const nodeStaggerDelay = 0.03;
                      const panelAnimationDelay = 0;
                      const allNodesAppearTime = panelAnimationDelay + (sortedNodes.length - 1) * nodeStaggerDelay + nodeAnimationDuration;
                      
                      return (
                        <>
                          {sortedNodes.map((node, index) => {
                            if (node.id === focusedNode) return null;
                            
                            const focusedPos = getHorizontalPosition(focusedIndex, sortedNodes.length);
                            const connPos = getHorizontalPosition(index, sortedNodes.length);

                            const connectionId = `${focusedNode}-${node.id}`;
                            const hasNotes = connectionNotes[connectionId];

                            return (
                              <motion.path
                                key={`conn-${node.id}`}
                                d={generateCurvePath(
                                  focusedPos.x,
                                  focusedPos.y,
                                  connPos.x,
                                  connPos.y
                                )}
                                stroke={hasNotes ? '#3b82f6' : '#06b6d4'}
                                strokeWidth={hasNotes ? 3.5 : 3}
                                fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.7 }}
                                exit={{ pathLength: 0, opacity: 0 }}
                                transition={{ duration: 0.1, delay: allNodesAppearTime + index * 0.02 }}
                                className="cursor-pointer"
                                style={{ pointerEvents: 'stroke' }}
                                onContextMenu={(e) => handleConnectionRightClick(e, focusedNode || '', node.id)}
                              />
                            );
                          })}

                          {sortedNodes.map((visNode, index) => {
                            const pos = getHorizontalPosition(index, sortedNodes.length);
                            const columnColor = getColumnColor(visNode.columnIndex);
                            const isFocusedCompareFiltered = activePatientRelevantNodes !== null && !visNode.isFocused && !activePatientRelevantNodes.has(visNode.id);

                            return (
                              <motion.g
                                key={`${visNode.id}-${svgWidth}`}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: isFocusedCompareFiltered ? 0.2 : 1, x: pos.x - columnWidth / 2, y: pos.y - nodeHeight / 2 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ 
                                  duration: 0.12, 
                                  delay: index * 0.03,
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 30,
                                }}
                                className="cursor-pointer"
                                onClick={() => visNode.isFocused ? handleNodeClick(visNode.id) : handleConnectedNodeClick(visNode.id)}
                                onContextMenu={(e) => handleNodeRightClick(e, visNode.id, visNode.label)}
                              >
                                <rect
                                  x={0}
                                  y={0}
                                  width={columnWidth}
                                  height={nodeHeight}
                                  rx={8}
                                  fill={visNode.isFocused ? '#3b82f6' : columnColor.bg}
                                  stroke={visNode.isFocused ? '#2563eb' : columnColor.border}
                                  strokeWidth={visNode.isFocused ? 3 : 2}
                                />

                                {visNode.isFocused && (
                                  <>
                                    <rect
                                      x={8}
                                      y={(nodeHeight - 16) / 2}
                                      width={16}
                                      height={16}
                                      rx={3}
                                      fill="white"
                                    />
                                    <path
                                      d={`M 11 ${nodeHeight / 2} l 3 3 l 6 -6`}
                                      stroke="#3b82f6"
                                      strokeWidth={2}
                                      fill="none"
                                    />
                                  </>
                                )}

                                <text
                                  x={visNode.isFocused ? 40 : columnWidth / 2}
                                  y={nodeHeight / 2 + 4}
                                  textAnchor={visNode.isFocused ? "start" : "middle"}
                                  className="text-sm font-medium select-none"
                                  fill={visNode.isFocused ? 'white' : columnColor.text}
                                >
                                  {visNode.label.length > 18 ? visNode.label.substring(0, 18) + '...' : visNode.label}
                                </text>

                                {nodeNotes[visNode.id] && (
                                  <g>
                                    <circle
                                      cx={columnWidth - 12}
                                      cy={8}
                                      r={8}
                                      fill={visNode.isFocused ? 'white' : '#3b82f6'}
                                    />
                                    <path
                                      d={`M ${columnWidth - 15} 6 h 6 v 4 h -6 z M ${columnWidth - 14} 7 h 4 M ${columnWidth - 14} 9 h 3`}
                                      stroke={visNode.isFocused ? '#3b82f6' : 'white'}
                                      strokeWidth={0.5}
                                      fill={visNode.isFocused ? '#3b82f6' : 'white'}
                                    />
                                  </g>
                                )}
                              </motion.g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </g>
                )}
              </AnimatePresence>
            </svg>
            </div>
            </div>
          </div>
        </div>
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {focusedNode && (() => {
            const details = getNodeDetails(focusedNode);
            if (!details) return null;

            const nodeDetails = detailView === 'node' && detailNodeId ? getNodeDetails(detailNodeId) : null;

            return (
              <motion.div
                key="detail-panel"
                initial={{ x: 440 }}
                animate={{ x: 0 }}
                exit={{ x: 440 }}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                className="fixed top-0 right-0 w-[440px] h-screen bg-white shadow-2xl border-l border-gray-200 overflow-hidden z-50"
              >
                <div className="px-6 py-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {detailView === 'connection' ? 'Connection Analysis' : 'Element Details'}
                    </h3>
                    {detailView === 'node' && (
                      <button
                        onClick={handleBackToConnection}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Back to Connection Analysis"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {detailView === 'connection' ? details.node.label : (nodeDetails?.node.label || '')}
                  </p>
                </div>

                <div className="p-6 h-[calc(100vh-120px)] overflow-y-auto">
                  {detailView === 'connection' ? (
                    <>
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Overview</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {details.node.label} connects to {details.connectedNodes.length} related medical elements across the patient chart.
                        </p>
                      </div>

                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          AI Clinical Significance
                        </h4>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            This connection pattern reveals integrated care coordination. The relationships demonstrate evidence-based practice alignment across diagnostic, therapeutic, and monitoring domains.
                          </p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                          Connected Elements ({details.connectedNodes.length})
                        </h4>
                        <div className="space-y-2">
                          {details.connectedNodes.map((conn, index) => (
                            <button
                              key={index}
                              onClick={() => handleConnectedNodeClick(conn.node.id)}
                              className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-cyan-50 rounded-lg border border-gray-200 hover:border-cyan-300 hover:shadow-sm transition-all cursor-pointer group"
                            >
                              <div className="text-left">
                                <p className="text-sm font-medium text-gray-900 group-hover:text-cyan-600 transition-colors">{conn.node.label}</p>
                                <p className="text-xs text-gray-500">{conn.column}</p>
                              </div>
                              <svg className="w-4 h-4 text-cyan-500 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Clinical Recommendations</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-700">Maintain integrated care approach</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-700">Continue regular cross-functional reviews</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-700">Update care plan based on emerging data</span>
                          </li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    nodeDetails && (
                      <>
                        <div className="mb-6">
                          <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{nodeDetails.node.label}</h4>
                              <p className="text-sm text-gray-600">{nodeDetails.columnTitle}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            This element represents a key aspect of the patient's medical record and plays an important role in their overall care plan.
                          </p>
                        </div>

                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            AI Insights
                          </h4>
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                            <p className="text-sm text-gray-800 leading-relaxed mb-3">
                              This medical element shows significant correlation with treatment outcomes and patient progression.
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-gray-700">Within normal parameters</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-gray-700">Consistent with treatment plan</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {nodeDetails.connectedNodes.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">
                              Related Elements ({nodeDetails.connectedNodes.length})
                            </h4>
                            <div className="space-y-2">
                              {nodeDetails.connectedNodes.map((conn, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleConnectedNodeClick(conn.node.id)}
                                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-cyan-300 hover:bg-cyan-50 transition-all cursor-pointer group"
                                >
                                  <div className="text-left">
                                    <p className="text-sm font-medium text-gray-900 group-hover:text-cyan-600 transition-colors">{conn.node.label}</p>
                                    <p className="text-xs text-gray-500">{conn.column}</p>
                                  </div>
                                  <svg className="w-4 h-4 text-gray-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                  </svg>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Clinical Notes</h4>
                          <div className="space-y-3">
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-xs text-blue-600 font-medium mb-1">Latest Update</p>
                              <p className="text-sm text-gray-700">Status confirmed during recent review</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-xs text-gray-500 font-medium mb-1">Historical Note</p>
                              <p className="text-sm text-gray-700">Documented as part of comprehensive assessment</p>
                            </div>
                          </div>
                        </div>
                      </>
                    )
                  )}
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        <ShareModal
          isOpen={shareModalOpen && focusedNode !== null}
          onClose={() => setShareModalOpen(false)}
          focusedNode={
            focusedNode && (() => {
              const details = getNodeDetails(focusedNode);
              return details ? {
                label: details.node.label,
                columnTitle: details.columnTitle
              } : { label: '', columnTitle: '' };
            })() || { label: '', columnTitle: '' }
          }
          connectedNodes={
            focusedNode && (() => {
              const details = getNodeDetails(focusedNode);
              return details?.connectedNodes || [];
            })() || []
          }
        />

        <SaveModal
          isOpen={saveModalOpen && focusedNode !== null}
          onClose={() => setSaveModalOpen(false)}
          focusedNode={
            focusedNode && (() => {
              const details = getNodeDetails(focusedNode);
              return details ? {
                label: details.node.label,
                columnTitle: details.columnTitle
              } : { label: '', columnTitle: '' };
            })() || { label: '', columnTitle: '' }
          }
          connectedNodes={
            focusedNode && (() => {
              const details = getNodeDetails(focusedNode);
              return details?.connectedNodes || [];
            })() || []
          }
        />
      </div>

      <AnimatePresence>
        {showQuantumPanel && (
          <QuantumPanel 
            isOpen={showQuantumPanel}
            onClose={() => setShowQuantumPanel(false)}
          />
        )}
      </AnimatePresence>

      <PostToFeedModal
        isOpen={postToFeedModalOpen}
        onClose={() => setPostToFeedModalOpen(false)}
        connectionTitle={focusedNode ? medicalData.flatMap(col => col.nodes).find(n => n.id === focusedNode)?.label : undefined}
        onPostCreated={() => onDoctorFeedPostsChanged?.()}
      />

      <ClinicalNotesModal
        isOpen={clinicalNotesModalOpen}
        onClose={() => setClinicalNotesModalOpen(false)}
        type={notesTarget?.type || 'node'}
        title={notesTarget?.title || ''}
        initialNote={notesTarget?.type === 'node' ? nodeNotes[notesTarget.id] : connectionNotes[notesTarget?.id || '']}
        onSave={handleSaveNotes}
      />

    </div>
    </div>
  );
}
