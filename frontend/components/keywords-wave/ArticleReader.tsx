import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, ExternalLink, Share2, Bookmark } from 'lucide-react';

interface Article {
  title: string;
  description?: string;
  author?: string;
  content?: string;
}

interface ArticleReaderProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article | null;
}

export function ArticleReader({ isOpen, onClose, article }: ArticleReaderProps) {
  if (!article) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Article Reader Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-full max-w-3xl h-full bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Article Reader</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Bookmark className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Original</span>
                </button>
              </div>
            </div>

            {/* Article Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-2xl mx-auto px-6 py-8">
                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {article.title}
                </h1>

                {/* Metadata */}
                {article.author && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                    <span>By {article.author}</span>
                  </div>
                )}

                {/* Description */}
                {article.description && (
                  <div className="text-lg text-gray-700 mb-8 pb-8 border-b border-gray-200">
                    {article.description}
                  </div>
                )}

                {/* Main Content */}
                <div className="prose prose-lg max-w-none">
                  {article.content ? (
                    <div className="text-gray-800 leading-relaxed space-y-4">
                      {article.content.split('\n\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  ) : (
                    // Mock content if none provided
                    <div className="text-gray-800 leading-relaxed space-y-4">
                      <p>
                        This groundbreaking research presents novel approaches to integrating genomic data
                        with traditional treatment planning methodologies. The study demonstrates significant
                        improvements in patient outcomes through personalized medicine strategies.
                      </p>
                      <p>
                        Recent advances in multi-omics analysis have enabled clinicians to develop more
                        precise treatment protocols tailored to individual patient profiles. By combining
                        genomic, proteomic, and metabolomic data, we can now predict treatment responses
                        with unprecedented accuracy.
                      </p>
                      <p>
                        The framework presented in this article establishes best practices for:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Integrating genomic sequencing data into clinical workflows</li>
                        <li>Correlating biomarker profiles with treatment efficacy</li>
                        <li>Developing personalized treatment algorithms</li>
                        <li>Monitoring patient response through multi-modal data analysis</li>
                      </ul>
                      <p>
                        Our analysis of 500+ patient cases reveals that personalized treatment plans based
                        on comprehensive genomic profiling lead to 30% better outcomes compared to
                        traditional approaches. The data strongly supports widespread adoption of precision
                        medicine practices across oncology departments.
                      </p>
                      <p>
                        Furthermore, the study identifies key biomarkers that serve as reliable predictors
                        of treatment response. By monitoring these markers throughout the treatment cycle,
                        clinicians can make real-time adjustments to optimize therapeutic efficacy while
                        minimizing adverse effects.
                      </p>
                      <p>
                        Looking forward, the integration of artificial intelligence and machine learning
                        algorithms promises to further enhance our ability to predict treatment outcomes
                        and identify optimal therapeutic strategies for individual patients.
                      </p>
                    </div>
                  )}
                </div>

                {/* Additional sections */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Key Takeaways</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Genomic integration significantly improves treatment personalization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Multi-omics approaches enable better outcome prediction</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Real-time biomarker monitoring optimizes treatment efficacy</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
