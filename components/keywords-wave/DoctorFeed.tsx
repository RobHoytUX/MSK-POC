import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserCircle, Heart, Share2, Repeat, ArrowLeft, X, Search, Filter, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, Comment, Profile } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';

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
  supabasePostId?: string;
}

interface CommentWithProfile extends Comment {
  profiles?: Profile;
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
  refreshTrigger?: number;
  highlightSupabasePostId?: string | null;
}

export function DoctorFeed({ isOpen, onClose, onArticleClick, onConnectionClick, focusedDoctorId, focusedPostId, refreshTrigger, highlightSupabasePostId }: DoctorFeedProps) {
  const { user, profile } = useAuth();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Post['type'][]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'default' | 'focusedPost' | 'doctorPosts'>('default');
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [commentsByPost, setCommentsByPost] = useState<Record<string, CommentWithProfile[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [loadingComments, setLoadingComments] = useState<Set<number>>(new Set());
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const fetchSupabasePosts = async () => {
    const { data: postsData, error: postsError } = await supabase
      .from('doctor_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsError || !postsData || postsData.length === 0) {
      return;
    }

    const authorIds = [...new Set(postsData.map((p: any) => p.author_id))];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .in('id', authorIds);

    const profilesMap: Record<string, any> = {};
    if (profilesData) {
      profilesData.forEach((p: any) => { profilesMap[p.id] = p; });
    }

    // Fetch comment counts for all posts
    const postIds = postsData.map((p: any) => p.id);
    const { data: commentsData } = await supabase
      .from('comments')
      .select('post_id')
      .in('post_id', postIds);

    const counts: Record<string, number> = {};
    if (commentsData) {
      commentsData.forEach((c: any) => {
        counts[c.post_id] = (counts[c.post_id] || 0) + 1;
      });
    }
    setCommentCounts(prev => ({ ...prev, ...counts }));

    const realPosts: Post[] = postsData.map((p: any, idx: number) => {
      const authorProfile = profilesMap[p.author_id];
      return {
        id: 10000 + idx,
        doctorId: -1,
        doctorName: authorProfile?.full_name || 'Doctor',
        doctorAvatar: authorProfile?.avatar_initials || 'U',
        doctorSpecialty: authorProfile?.specialty || 'Physician',
        timestamp: timeAgo(p.created_at),
        type: p.type as Post['type'],
        content: p.content,
        attachments: p.attachments || undefined,
        likes: p.likes_count || 0,
        liked: false,
        shares: p.shares_count || 0,
        reposts: p.reposts_count || 0,
        supabasePostId: p.id,
      };
    });
    setPosts([...realPosts, ...mockPosts]);
  };

  useEffect(() => {
    if (isOpen) fetchSupabasePosts();
  }, [isOpen, refreshTrigger]);

  // Real-time comment subscription: new comments appear instantly for all users
  useEffect(() => {
    const channel = supabase
      .channel('realtime-comments')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
      }, async (payload: any) => {
        const newCommentPostId = payload.new?.post_id;
        if (!newCommentPostId) return;

        // Fetch the full comment with profile
        const { data } = await supabase
          .from('comments')
          .select('*')
          .eq('id', payload.new.id)
          .single();

        if (!data) return;

        const { data: commentProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.author_id)
          .single();

        const commentWithProfile: CommentWithProfile = {
          ...data,
          profiles: commentProfile || undefined,
        };

        // Find the comment key for this post
        const matchingPost = posts.find(p => p.supabasePostId === newCommentPostId);
        if (!matchingPost) return;
        const key = matchingPost.supabasePostId || `mock-post-${matchingPost.id}`;

        // Only add if not already present (avoid duplicates from our own insert)
        setCommentsByPost(prev => {
          const existing = prev[key] || [];
          if (existing.some(c => c.id === commentWithProfile.id)) return prev;
          return { ...prev, [key]: [...existing, commentWithProfile] };
        });
        // Update the count
        setCommentCounts(prev => ({
          ...prev,
          [newCommentPostId]: (prev[newCommentPostId] || 0) + 1,
        }));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [posts]);

  // Handle initial focus on doctor/post when opened
  useEffect(() => {
    if (focusedDoctorId && focusedPostId) {
      setViewMode('focusedPost');
      const doctor = mockDoctors.find(d => d.id === focusedDoctorId);
      if (doctor) {
        setSelectedDoctor(doctor);
      }
    } else if (focusedDoctorId) {
      setViewMode('doctorPosts');
      const doctor = mockDoctors.find(d => d.id === focusedDoctorId);
      if (doctor) {
        setSelectedDoctor(doctor);
      }
    } else {
      setViewMode('default');
    }
  }, [focusedDoctorId, focusedPostId, isOpen]);

  // Auto-expand comments when navigating from a notification
  useEffect(() => {
    if (highlightSupabasePostId && posts.length > 0) {
      const targetPost = posts.find(p => p.supabasePostId === highlightSupabasePostId);
      if (targetPost) {
        setSelectedDoctor(null);
        setViewMode('default');
        const newExpanded = new Set(expandedComments);
        newExpanded.add(targetPost.id);
        setExpandedComments(newExpanded);
        fetchComments(targetPost.id);
        // Scroll to the post after a brief delay
        setTimeout(() => {
          const el = document.getElementById(`post-${targetPost.id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    }
  }, [highlightSupabasePostId, posts]);

  const getSupabasePostId = (postId: number) => {
    const post = posts.find(p => p.id === postId);
    return post?.supabasePostId || null;
  };

  const getCommentKey = (postId: number) => {
    return getSupabasePostId(postId) || `mock-post-${postId}`;
  };

  const fetchComments = async (postId: number) => {
    const supabaseId = getSupabasePostId(postId);
    if (!supabaseId) {
      setLoadingComments(prev => { const s = new Set(prev); s.delete(postId); return s; });
      return;
    }
    const key = getCommentKey(postId);
    setLoadingComments(prev => new Set(prev).add(postId));
    try {
      const { data } = await supabase
        .from('comments')
        .select('*, profiles(*)')
        .eq('post_id', supabaseId)
        .order('created_at', { ascending: true });
      if (data) {
        setCommentsByPost(prev => ({ ...prev, [key]: data as any }));
      }
    } catch {
      // gracefully handle
    }
    setLoadingComments(prev => { const s = new Set(prev); s.delete(postId); return s; });
  };

  const toggleComments = (postId: number) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      fetchComments(postId);
    }
    setExpandedComments(newExpanded);
  };

  const handleSubmitComment = async (postId: number) => {
    const content = commentInputs[postId]?.trim();
    if (!content || !user || !profile) return;

    const supabaseId = getSupabasePostId(postId);
    if (!supabaseId) {
      toast.error('Comments are only supported on real posts');
      return;
    }

    const key = getCommentKey(postId);

    const newComment: CommentWithProfile = {
      id: `temp-${Date.now()}`,
      post_id: supabaseId,
      author_id: user.id,
      content,
      created_at: new Date().toISOString(),
      profiles: profile,
    };

    setCommentsByPost(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), newComment],
    }));
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));

    try {
      const { data } = await supabase
        .from('comments')
        .insert({ post_id: supabaseId, author_id: user.id, content })
        .select('*, profiles(*)')
        .single();

      if (data) {
        setCommentsByPost(prev => ({
          ...prev,
          [key]: (prev[key] || []).map(c => c.id === newComment.id ? (data as any) : c),
        }));

        const post = posts.find(p => p.id === postId);
        if (post && post.supabasePostId) {
          // Get post author
          const { data: postData } = await supabase
            .from('doctor_posts')
            .select('author_id')
            .eq('id', post.supabasePostId)
            .single();

          // Get all other commenters on this post
          const { data: otherComments } = await supabase
            .from('comments')
            .select('author_id')
            .eq('post_id', post.supabasePostId)
            .neq('author_id', user.id);

          const usersToNotify = new Set<string>();
          if (postData && postData.author_id !== user.id) {
            usersToNotify.add(postData.author_id);
          }
          if (otherComments) {
            otherComments.forEach((c: any) => {
              if (c.author_id !== user.id) usersToNotify.add(c.author_id);
            });
          }

          const truncated = content.slice(0, 80) + (content.length > 80 ? '...' : '');
          const notifications = [...usersToNotify].map(targetId => ({
            user_id: targetId,
            from_user_id: user.id,
            type: 'comment' as const,
            post_id: post.supabasePostId!,
            comment_id: (data as any).id,
            message: targetId === postData?.author_id
              ? `${profile.full_name} commented on your post: "${truncated}"`
              : `${profile.full_name} also commented on a post you commented on: "${truncated}"`,
          }));

          if (notifications.length > 0) {
            await supabase.from('notifications').insert(notifications).then(() => {}, () => {});
          }
        }
      }

      toast.success('Comment posted!');
    } catch {
      toast.error('Failed to post comment.');
    }
  };

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
                      id={`post-${post.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-all overflow-hidden ${
                        post.supabasePostId === highlightSupabasePostId
                          ? 'border-indigo-400 ring-2 ring-indigo-200'
                          : 'border-gray-200'
                      }`}
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
                          onClick={() => toggleComments(post.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                            expandedComments.has(post.id)
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">
                            {(() => {
                              const loaded = (commentsByPost[getCommentKey(post.id)] || []).length;
                              const preCount = post.supabasePostId ? (commentCounts[post.supabasePostId] || 0) : 0;
                              const count = Math.max(loaded, preCount);
                              return count > 0 ? count : 'Comment';
                            })()}
                          </span>
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

                      {/* Comments Section */}
                      <AnimatePresence>
                        {expandedComments.has(post.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-gray-100"
                          >
                            <div className="px-4 py-3 space-y-3">
                              {loadingComments.has(post.id) ? (
                                <div className="flex justify-center py-3">
                                  <div className="w-5 h-5 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
                                </div>
                              ) : (
                                <>
                                  {(commentsByPost[getCommentKey(post.id)] || []).length === 0 ? (
                                    <p className="text-xs text-gray-400 text-center py-2">
                                      {post.supabasePostId ? 'No comments yet. Be the first!' : 'Comments available on user-created posts'}
                                    </p>
                                  ) : (
                                    <div className="space-y-3 max-h-48 overflow-y-auto">
                                      {(commentsByPost[getCommentKey(post.id)] || []).map((comment) => (
                                        <div key={comment.id} className="flex items-start gap-2">
                                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                            {comment.profiles?.avatar_initials || '?'}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-2">
                                              <span className="text-xs font-semibold text-gray-900">
                                                {comment.profiles?.full_name || 'Anonymous'}
                                              </span>
                                              <span className="text-[10px] text-gray-400">
                                                {new Date(comment.created_at).toLocaleDateString()}
                                              </span>
                                            </div>
                                            <p className="text-xs text-gray-700 leading-relaxed mt-0.5">{comment.content}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                      {profile?.avatar_initials || 'U'}
                                    </div>
                                    <input
                                      type="text"
                                      placeholder="Write a comment..."
                                      value={commentInputs[post.id] || ''}
                                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault();
                                          handleSubmitComment(post.id);
                                        }
                                      }}
                                      className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                      onClick={() => handleSubmitComment(post.id)}
                                      disabled={!commentInputs[post.id]?.trim()}
                                      className="p-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-full transition-colors"
                                    >
                                      <Send className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
