import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserCircle, Heart, Share2, Repeat, ArrowLeft, X, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface Doctor {
  id: number;
  name: string;
  avatar: string;
  specialty: string;
  institution: string;
  bio: string;
  postsCount: number;
  followersCount: number;
}

interface Post {
  id: number;
  doctorId: number;
  doctorName: string;
  doctorAvatar: string;
  doctorSpecialty: string;
  timestamp: string;
  type: 'finding' | 'research' | 'article' | 'connection';
  content: string;
  attachments?: {
    title: string;
    description?: string;
  }[];
  likes: number;
  liked: boolean;
  shares: number;
  reposts: number;
  isRepostedByYou?: boolean;
}

const mockDoctors: Doctor[] = [
  {
    id: 1,
    name: 'Dr. Sarah Chen',
    avatar: 'SC',
    specialty: 'Oncologist',
    institution: 'Memorial Cancer Center',
    bio: 'Board-certified oncologist specializing in breast cancer treatment and research. 15+ years of clinical experience.',
    postsCount: 127,
    followersCount: 1243
  },
  {
    id: 2,
    name: 'Dr. Michael Roberts',
    avatar: 'MR',
    specialty: 'Radiologist',
    institution: 'Advanced Imaging Institute',
    bio: 'Expert in diagnostic imaging and interventional radiology. Focus on oncological imaging.',
    postsCount: 89,
    followersCount: 876
  },
  {
    id: 3,
    name: 'Dr. Emily Thompson',
    avatar: 'ET',
    specialty: 'Pathologist',
    institution: 'City Medical Laboratory',
    bio: 'Molecular pathology and genomic medicine specialist. Research interests in biomarker discovery.',
    postsCount: 156,
    followersCount: 1567
  },
  {
    id: 4,
    name: 'Dr. James Park',
    avatar: 'JP',
    specialty: 'Medical Oncologist',
    institution: 'University Hospital',
    bio: 'Clinical trials coordinator and precision medicine advocate. Published author in major oncology journals.',
    postsCount: 203,
    followersCount: 2134
  }
];

const mockPosts: Post[] = [
  {
    id: 1,
    doctorId: 1,
    doctorName: 'Dr. Sarah Chen',
    doctorAvatar: 'SC',
    doctorSpecialty: 'Oncologist',
    timestamp: '2 hours ago',
    type: 'finding',
    content: 'Interesting correlation observed between ER+/PR+ HER2- status and response to hormone therapy in post-menopausal patients. Seeing consistently positive outcomes with aromatase inhibitor protocols.',
    likes: 23,
    liked: false,
    shares: 5,
    reposts: 2
  },
  {
    id: 2,
    doctorId: 2,
    doctorName: 'Dr. Michael Roberts',
    doctorAvatar: 'MR',
    doctorSpecialty: 'Radiologist',
    timestamp: '4 hours ago',
    type: 'connection',
    content: 'Created a new node connection pattern for tracking imaging response post-radiation. This workflow helps correlate tumor markers with radiological findings.',
    attachments: [
      {
        title: 'Imaging Studies → Lab Monitoring → Radiation',
        description: 'Multi-modal tracking approach'
      }
    ],
    likes: 45,
    liked: true,
    shares: 12,
    reposts: 8
  },
  {
    id: 3,
    doctorId: 3,
    doctorName: 'Dr. Emily Thompson',
    doctorAvatar: 'ET',
    doctorSpecialty: 'Pathologist',
    timestamp: '6 hours ago',
    type: 'research',
    content: 'New research published on Ki-67 proliferation index as a predictive biomarker in triple-negative breast cancer. Link to full study in comments.',
    attachments: [
      {
        title: 'Journal of Clinical Oncology - January 2026',
        description: 'Predictive value of Ki-67 in TNBC treatment selection'
      }
    ],
    likes: 67,
    liked: false,
    shares: 28,
    reposts: 15
  },
  {
    id: 4,
    doctorId: 4,
    doctorName: 'Dr. James Park',
    doctorAvatar: 'JP',
    doctorSpecialty: 'Medical Oncologist',
    timestamp: '8 hours ago',
    type: 'article',
    content: 'Must-read article on integrating genomic data with traditional treatment planning. This aligns perfectly with our precision medicine initiative.',
    attachments: [
      {
        title: 'Nature Medicine: Genomic Integration in Clinical Practice',
        description: 'Framework for multi-omics treatment personalization'
      }
    ],
    likes: 91,
    liked: true,
    shares: 42,
    reposts: 23
  },
  {
    id: 5,
    doctorId: 1,
    doctorName: 'Dr. Sarah Chen',
    doctorAvatar: 'SC',
    doctorSpecialty: 'Oncologist',
    timestamp: '12 hours ago',
    type: 'finding',
    content: 'Patient case study: Stage II breast cancer with excellent response to AC-T chemotherapy regimen. Biomarker levels normalized within 3 cycles. Documenting this pathway for reference.',
    likes: 34,
    liked: false,
    shares: 7,
    reposts: 3
  },
  {
    id: 6,
    doctorId: 3,
    doctorName: 'Dr. Emily Thompson',
    doctorAvatar: 'ET',
    doctorSpecialty: 'Pathologist',
    timestamp: '1 day ago',
    type: 'connection',
    content: 'Discovered valuable connection between BRCA status and treatment outcomes. Sharing this node pattern with the community.',
    attachments: [
      {
        title: 'Genetic Markers → Targeted Therapy → Follow-up Care',
        description: 'Evidence-based pathway for BRCA-negative patients'
      }
    ],
    likes: 56,
    liked: false,
    shares: 19,
    reposts: 11
  },
  {
    id: 7,
    doctorId: 2,
    doctorName: 'Dr. Michael Roberts',
    doctorAvatar: 'MR',
    doctorSpecialty: 'Radiologist',
    timestamp: '1 day ago',
    type: 'finding',
    content: 'Observing improved imaging clarity with new MRI protocols. This is particularly useful for monitoring post-surgical patients.',
    likes: 28,
    liked: false,
    shares: 6,
    reposts: 2
  },
  {
    id: 8,
    doctorId: 4,
    doctorName: 'Dr. James Park',
    doctorAvatar: 'JP',
    doctorSpecialty: 'Medical Oncologist',
    timestamp: '2 days ago',
    type: 'research',
    content: 'Clinical trial results showing promising outcomes with combination immunotherapy. Enrollment continuing for phase III study.',
    attachments: [
      {
        title: 'Phase II Trial Results - Combination Immunotherapy',
        description: 'Response rates exceeding 70% in advanced cases'
      }
    ],
    likes: 103,
    liked: true,
    shares: 51,
    reposts: 34
  }
];

interface DoctorFeedProps {
  isOpen: boolean;
  onClose: () => void;
  onArticleClick?: (article: { title: string; description?: string; author?: string }) => void;
  onConnectionClick?: (connection: { title: string; description?: string }, doctorInfo?: { name: string; avatar: string; specialty: string; doctorId: number; postId: number }) => void;
  focusedDoctorId?: number | null;
  focusedPostId?: number | null;
}

export function DoctorFeed({ isOpen, onClose, onArticleClick, onConnectionClick, focusedDoctorId, focusedPostId }: DoctorFeedProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Post['type'][]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'default' | 'focusedPost' | 'doctorPosts'>('default');

  // Handle initial focus on doctor/post when opened
  useEffect(() => {
    if (focusedDoctorId && focusedPostId) {
      // Show only the specific post
      setViewMode('focusedPost');
      const doctor = mockDoctors.find(d => d.id === focusedDoctorId);
      if (doctor) {
        setSelectedDoctor(doctor);
      }
    } else if (focusedDoctorId) {
      // Show all posts from doctor
      setViewMode('doctorPosts');
      const doctor = mockDoctors.find(d => d.id === focusedDoctorId);
      if (doctor) {
        setSelectedDoctor(doctor);
      }
    } else {
      setViewMode('default');
    }
  }, [focusedDoctorId, focusedPostId, isOpen]);

  const handleLike = (postId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            liked: !post.liked,
            likes: post.liked ? post.likes - 1 : post.likes + 1
          };
        }
        return post;
      })
    );
  };

  const handleShare = (postId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            shares: post.shares + 1
          };
        }
        return post;
      })
    );
    // In a real app, this would open a share dialog
    toast('Share functionality would open here');
  };

  const handleRepost = (postId: number) => {
    const originalPost = posts.find(post => post.id === postId);
    if (!originalPost) return;

    // Create a new reposted post at the top
    const repostedPost: Post = {
      ...originalPost,
      id: Date.now(), // Generate unique ID
      timestamp: 'Just now',
      reposts: originalPost.reposts + 1,
      isRepostedByYou: true
    };

    // Add reposted post to the top and update original post
    setPosts(prevPosts => {
      const updatedPosts = prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            reposts: post.reposts + 1
          };
        }
        return post;
      });
      return [repostedPost, ...updatedPosts];
    });

    // Show toast notification
    toast.success('Post reposted successfully!', {
      description: `Reposted: ${originalPost.doctorName}'s post`,
      duration: 3000,
    });
  };

  const handleDoctorClick = (doctorId: number) => {
    const doctor = mockDoctors.find(d => d.id === doctorId);
    if (doctor) {
      setSelectedDoctor(doctor);
    }
  };

  const handleBackToAll = () => {
    setSelectedDoctor(null);
  };

  const toggleFilter = (filter: Post['type']) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const clearFilters = () => {
    setSelectedFilters([]);
    setSearchQuery('');
  };

  // Apply filters and search
  let filteredPosts = selectedDoctor 
    ? posts.filter(post => post.doctorId === selectedDoctor.id)
    : posts;

  // If in focused post mode, only show the specific post
  if (viewMode === 'focusedPost' && focusedPostId) {
    filteredPosts = posts.filter(post => post.id === focusedPostId);
  }

  // Apply search query
  if (searchQuery.trim()) {
    filteredPosts = filteredPosts.filter(post => 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.doctorSpecialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.attachments?.some(att => 
        att.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        att.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }

  // Apply type filters
  if (selectedFilters.length > 0) {
    filteredPosts = filteredPosts.filter(post => 
      selectedFilters.includes(post.type)
    );
  }

  const getPostTypeIcon = (type: Post['type']) => {
    switch (type) {
      case 'finding':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'research':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'article':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'connection':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
    }
  };

  const getPostTypeLabel = (type: Post['type']) => {
    switch (type) {
      case 'finding':
        return 'Clinical Finding';
      case 'research':
        return 'Research';
      case 'article':
        return 'Article';
      case 'connection':
        return 'Node Connection';
    }
  };

  const getPostTypeBadgeColor = (type: Post['type']) => {
    switch (type) {
      case 'finding':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'research':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'article':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'connection':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: -500, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -500, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 w-[500px] h-full bg-white shadow-2xl border-r border-gray-200 overflow-hidden z-30"
          >
            {/* Header */}
            <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {selectedDoctor && (
                    <button
                      onClick={handleBackToAll}
                      className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-blue-600" />
                    {selectedDoctor ? selectedDoctor.name : 'Doctor Network'}
                  </h4>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/50 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <p className="text-xs text-gray-600">
                {selectedDoctor 
                  ? `${selectedDoctor.postsCount} posts • ${selectedDoctor.followersCount} followers`
                  : `${posts.length} recent posts from ${mockDoctors.length} doctors`}
              </p>
            </div>

            {/* Doctor Profile (when viewing single doctor) */}
            {selectedDoctor && (
              <div className="px-4 py-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {selectedDoctor.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-gray-900">{selectedDoctor.name}</h5>
                    <p className="text-sm text-gray-600">{selectedDoctor.specialty}</p>
                    <p className="text-xs text-gray-500 mt-1">{selectedDoctor.institution}</p>
                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">{selectedDoctor.bio}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="text-xs">
                        <span className="font-semibold text-gray-900">{selectedDoctor.postsCount}</span>
                        <span className="text-gray-600"> posts</span>
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-gray-900">{selectedDoctor.followersCount}</span>
                        <span className="text-gray-600"> followers</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Controls for focused post view */}
                {viewMode === 'focusedPost' && (
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('doctorPosts')}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Show all posts from {selectedDoctor.name.split(' ')[1]}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Search and Filter Bar */}
            {!selectedDoctor && (
              <div className="px-4 py-3 bg-white border-b border-gray-200 space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search posts, doctors, topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filter Toggle and Active Filters */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      selectedFilters.length > 0 || showFilters
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                    {selectedFilters.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                        {selectedFilters.length}
                      </span>
                    )}
                  </button>

                  {(searchQuery || selectedFilters.length > 0) && (
                    <button
                      onClick={clearFilters}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Clear all
                    </button>
                  )}

                  <div className="ml-auto text-xs text-gray-500">
                    {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
                  </div>
                </div>

                {/* Filter Options */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-2 pt-2">
                        {(['finding', 'research', 'article', 'connection'] as Post['type'][]).map((type) => (
                          <button
                            key={type}
                            onClick={() => toggleFilter(type)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border transition-all ${
                              selectedFilters.includes(type)
                                ? getPostTypeBadgeColor(type)
                                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {getPostTypeIcon(type)}
                            <span className="font-medium">{getPostTypeLabel(type)}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Posts Feed */}
            <div className="h-[calc(100vh-100px)] overflow-y-auto scrollbar-hide">
              <div className="p-4 space-y-4">
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <UserCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No posts yet</p>
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      {/* Repost Banner */}
                      {post.isRepostedByYou && (
                        <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 flex items-center gap-2">
                          <Repeat className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-700">You reposted this</span>
                        </div>
                      )}

                      {/* Post Header */}
                      <div className="p-4 pb-3">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleDoctorClick(post.doctorId)}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 hover:scale-105 transition-transform"
                          >
                            {post.doctorAvatar}
                          </button>
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={() => handleDoctorClick(post.doctorId)}
                              className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-sm"
                            >
                              {post.doctorName}
                            </button>
                            <p className="text-xs text-gray-600">{post.doctorSpecialty}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">{post.timestamp}</span>
                              <span className="text-gray-400">•</span>
                              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${getPostTypeBadgeColor(post.type)}`}>
                                {getPostTypeIcon(post.type)}
                                <span className="font-medium">{getPostTypeLabel(post.type)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="mt-3">
                          <p className="text-sm text-gray-800 leading-relaxed">{post.content}</p>

                          {/* Attachments */}
                          {post.attachments && post.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {post.attachments.map((attachment, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    if (post.type === 'article' || post.type === 'research') {
                                      onArticleClick?.({
                                        title: attachment.title,
                                        description: attachment.description,
                                        author: post.doctorName
                                      });
                                    } else if (post.type === 'connection') {
                                      onConnectionClick?.({
                                        title: attachment.title,
                                        description: attachment.description
                                      }, {
                                        name: post.doctorName,
                                        avatar: post.doctorAvatar,
                                        specialty: post.doctorSpecialty,
                                        doctorId: post.doctorId,
                                        postId: post.id
                                      });
                                    }
                                  }}
                                  className="w-full text-left p-3 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
                                >
                                  <p className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                    {attachment.title}
                                  </p>
                                  {attachment.description && (
                                    <p className="text-xs text-gray-600">{attachment.description}</p>
                                  )}
                                  <p className="text-xs text-blue-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {post.type === 'connection' ? 'Click to load this connection →' : 'Click to read →'}
                                  </p>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Post Actions */}
                      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                            post.liked
                              ? 'bg-pink-50 text-pink-600'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${post.liked ? 'fill-current' : ''}`}
                          />
                          <span className="text-xs font-medium">{post.likes}</span>
                        </button>

                        <button
                          onClick={() => handleShare(post.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-all"
                        >
                          <Share2 className="w-4 h-4" />
                          <span className="text-xs font-medium">{post.shares}</span>
                        </button>

                        <button
                          onClick={() => handleRepost(post.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-all"
                        >
                          <Repeat className="w-4 h-4" />
                          <span className="text-xs font-medium">{post.reposts}</span>
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}