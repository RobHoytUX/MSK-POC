import { motion } from 'motion/react';
import { UserCircle, X } from 'lucide-react';

interface DoctorInfo {
  name: string;
  avatar: string;
  specialty: string;
  postTitle: string;
}

interface DoctorConnectionBannerProps {
  doctorInfo: DoctorInfo;
  onDoctorClick: () => void;
  onClose: () => void;
}

export function DoctorConnectionBanner({ doctorInfo, onDoctorClick, onClose }: DoctorConnectionBannerProps) {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      className="absolute top-4 left-4 right-4 mx-auto max-w-2xl z-20"
    >
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl shadow-lg p-4">
        <div className="flex items-start gap-3">
          {/* Doctor Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
            {doctorInfo.avatar}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-blue-700 font-medium mb-1">
                  Viewing connection pattern from:
                </p>
                <button
                  onClick={onDoctorClick}
                  className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors group flex items-center gap-2"
                >
                  <span>{doctorInfo.name}</span>
                  <UserCircle className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <p className="text-sm text-gray-600">{doctorInfo.specialty}</p>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-blue-200/50 rounded-lg transition-colors flex-shrink-0"
                title="Clear and return to your view"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Post Title */}
            <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-gray-900">
                {doctorInfo.postTitle}
              </p>
            </div>

            {/* Hint */}
            <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
              <UserCircle className="w-3.5 h-3.5" />
              Click the doctor's name to see the original post
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
