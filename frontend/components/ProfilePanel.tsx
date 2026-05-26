import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Mail, Stethoscope, Building2, User, Save, LogOut } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const { profile, signOut, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [specialty, setSpecialty] = useState(profile?.specialty || '');
  const [institution, setInstitution] = useState(profile?.institution || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const initials = fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    await updateProfile({
      full_name: fullName,
      specialty,
      institution,
      avatar_initials: initials,
    });
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
      <div
        className="fixed inset-0 z-40 bg-transparent"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: 16, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 16, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-5 left-5 z-50 flex max-h-[min(680px,calc(100vh-40px))] w-[380px] flex-col overflow-hidden rounded-[20px] border border-black/10 bg-white/95 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">My Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-6 flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-xl font-bold text-white shadow-lg">
              {profile?.avatar_initials || 'U'}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">{profile?.full_name || 'Doctor'}</h3>
            <p className="text-sm text-gray-500">{profile?.specialty || 'Specialty not set'}</p>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{profile?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Specialty</p>
                    <p className="text-sm text-gray-900">{profile?.specialty || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Institution</p>
                    <p className="text-sm text-gray-900">{profile?.institution || 'Not set'}</p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {!isEditing ? (
          <div className="grid grid-cols-2 gap-3 border-t border-gray-200 p-5">
            <button
              onClick={() => {
                setFullName(profile?.full_name || '');
                setSpecialty(profile?.specialty || '');
                setInstitution(profile?.institution || '');
                setIsEditing(true);
              }}
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Edit Profile
            </button>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        ) : null}
      </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
