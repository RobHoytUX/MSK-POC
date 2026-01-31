import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, FileText, BookOpen, Link as LinkIcon, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface PostToFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionTitle?: string;
}

export function PostToFeedModal({ isOpen, onClose, connectionTitle }: PostToFeedModalProps) {
  const [postType, setPostType] = useState<'finding' | 'research' | 'article' | 'connection'>('finding');
  const [content, setContent] = useState('');
  const [attachmentTitle, setAttachmentTitle] = useState('');
  const [attachmentDescription, setAttachmentDescription] = useState('');

  const handlePost = () => {
    if (!content.trim()) {
      toast.error('Please write something before posting');
      return;
    }

    // In a real app, this would send the post to the backend
    toast.success('Posted to Doctor Network!', {
      description: `Your ${getPostTypeLabel(postType).toLowerCase()} has been shared`,
      duration: 3000,
    });

    // Reset form
    setContent('');
    setAttachmentTitle('');
    setAttachmentDescription('');
    onClose();
  };

  const getPostTypeLabel = (type: typeof postType) => {
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

  const getPostTypeIcon = (type: typeof postType) => {
    switch (type) {
      case 'finding':
        return <TrendingUp className="w-5 h-5" />;
      case 'research':
        return <FileText className="w-5 h-5" />;
      case 'article':
        return <BookOpen className="w-5 h-5" />;
      case 'connection':
        return <LinkIcon className="w-5 h-5" />;
    }
  };

  const getPostTypeColor = (type: typeof postType) => {
    switch (type) {
      case 'finding':
        return 'from-green-500 to-emerald-600';
      case 'research':
        return 'from-purple-500 to-violet-600';
      case 'article':
        return 'from-blue-500 to-indigo-600';
      case 'connection':
        return 'from-cyan-500 to-teal-600';
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden mx-4"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getPostTypeIcon(postType)}
                  <h3 className="text-xl font-semibold text-gray-900">Post to Doctor Network</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Post Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['finding', 'research', 'article', 'connection'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setPostType(type)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        postType === type
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className={`flex flex-col items-center gap-2 ${
                        postType === type ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {getPostTypeIcon(type)}
                        <span className="text-xs font-medium">
                          {type === 'finding' && 'Finding'}
                          {type === 'research' && 'Research'}
                          {type === 'article' && 'Article'}
                          {type === 'connection' && 'Connection'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Your Insights
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    postType === 'finding'
                      ? 'Describe your clinical finding or observation...'
                      : postType === 'research'
                      ? 'Share your research findings or study...'
                      : postType === 'article'
                      ? 'What insights did you gain from this article?...'
                      : 'Explain this node connection pattern and its clinical significance...'
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {content.length} / 500 characters
                </p>
              </div>

              {/* Attachment Section (for research, article, and connection) */}
              {(postType === 'research' || postType === 'article' || postType === 'connection') && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    {postType === 'connection' ? <LinkIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    {postType === 'connection' ? 'Connection Details' : 'Attachment Details'}
                  </h4>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {postType === 'connection' ? 'Connection Pattern' : 'Title'}
                    </label>
                    <input
                      type="text"
                      value={attachmentTitle || (postType === 'connection' ? connectionTitle || '' : '')}
                      onChange={(e) => setAttachmentTitle(e.target.value)}
                      placeholder={
                        postType === 'connection'
                          ? 'e.g., Imaging Studies → Lab Monitoring → Radiation'
                          : 'Enter article or research title...'
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={attachmentDescription}
                      onChange={(e) => setAttachmentDescription(e.target.value)}
                      placeholder="Add a brief description..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Preview */}
              {content && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900 mb-2">Preview</p>
                  <p className="text-sm text-gray-800 leading-relaxed">{content}</p>
                  {attachmentTitle && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                      <p className="text-sm font-semibold text-gray-900">{attachmentTitle}</p>
                      {attachmentDescription && (
                        <p className="text-xs text-gray-600 mt-1">{attachmentDescription}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <p className="text-xs text-gray-600">
                Your post will be visible to all doctors in the network
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePost}
                  disabled={!content.trim()}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all ${
                    content.trim()
                      ? `bg-gradient-to-r ${getPostTypeColor(postType)} hover:shadow-lg`
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  Post to Network
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
