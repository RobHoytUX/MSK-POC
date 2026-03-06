import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, X, Calendar, Clock, Pill, Stethoscope, Phone, Mail, MapPin, ChevronRight, Users, LogOut, Moon, Sun } from 'lucide-react';
import { patients, Patient } from '../lib/patients';
import { useAuth } from '../lib/AuthContext';
import mapsLogo from '../src/assets/maps-logo.png';

interface PatientSelectPageProps {
  onSelectPatient: (patient: Patient) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function PatientSelectPage({ onSelectPatient, isDark, onToggleTheme }: PatientSelectPageProps) {
  const { profile, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);

  const filtered = patients.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      p.diagnoses.some(d => d.toLowerCase().includes(q)) ||
      p.medications.some(m => m.toLowerCase().includes(q))
    );
  });

  const toggleExpand = (id: string) => {
    setExpandedPatient(expandedPatient === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <img
                src={mapsLogo}
                alt="MAPS logo"
                className="h-[30px] w-[30px] object-contain shrink-0"
              />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Select Patient</h1>
                <p className="text-sm text-gray-500">Choose a patient to view their chart</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{filtered.length} patients</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onToggleTheme}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                  title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                  <p className="text-xs text-gray-500">{profile?.specialty || 'Physician'}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  {profile?.avatar_initials || 'U'}
                </div>
                <button
                  onClick={signOut}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, MRN, diagnosis, or medication..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid gap-3">
          {filtered.map((patient, idx) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Main row */}
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer group"
                onClick={() => toggleExpand(patient.id)}
              >
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 text-sm font-bold flex-shrink-0 border border-indigo-200/50">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </div>

                {/* Name & basics */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{patient.name}</h3>
                    <span className="text-xs text-gray-400">{patient.mrn}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {patient.age}yo {patient.gender} · Patient for {patient.yearsAsPatient} {patient.yearsAsPatient === 1 ? 'year' : 'years'}
                  </p>
                </div>

                {/* Diagnoses pills */}
                <div className="hidden md:flex items-center gap-1.5 flex-shrink-0 max-w-xs">
                  {patient.diagnoses.slice(0, 2).map((d, i) => (
                    <span key={i} className="px-2 py-0.5 bg-red-50 text-red-700 text-[11px] rounded-full border border-red-100 whitespace-nowrap truncate max-w-[160px]">
                      {d}
                    </span>
                  ))}
                  {patient.diagnoses.length > 2 && (
                    <span className="text-[11px] text-gray-400">+{patient.diagnoses.length - 2}</span>
                  )}
                </div>

                {/* Last visit */}
                <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{patient.lastVisit}</span>
                </div>

                {/* Upcoming */}
                <div className="hidden xl:flex items-center gap-1.5 text-xs text-indigo-600 flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{patient.upcomingAppointments[0]?.date || 'None'}</span>
                </div>

                {/* Expand indicator */}
                <ChevronRight className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expandedPatient === patient.id ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
              </div>

              {/* Expanded details */}
              {expandedPatient === patient.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-100"
                >
                  <div className="px-5 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Diagnoses & Medications */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5" /> Diagnoses
                          </h4>
                          <div className="space-y-1">
                            {patient.diagnoses.map((d, i) => (
                              <div key={i} className="text-sm text-gray-800 flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                                {d}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5" /> Medications
                          </h4>
                          <div className="space-y-1">
                            {patient.medications.map((m, i) => (
                              <div key={i} className="text-sm text-gray-800 flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                                {m}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Appointments */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Upcoming Appointments
                        </h4>
                        <div className="space-y-2">
                          {patient.upcomingAppointments.map((appt, i) => (
                            <div key={i} className="p-2.5 bg-indigo-50 rounded-lg border border-indigo-100">
                              <p className="text-sm font-medium text-gray-900">{appt.type}</p>
                              <p className="text-xs text-indigo-600 mt-0.5">{appt.date}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 p-2.5 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">Last Visit</p>
                          <p className="text-sm font-medium text-gray-900">{patient.lastVisit}</p>
                        </div>
                      </div>

                      {/* Contact */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Contact Details</h4>
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2.5 text-sm text-gray-700">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {patient.contact.phone}
                          </div>
                          <div className="flex items-center gap-2.5 text-sm text-gray-700">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {patient.contact.email}
                          </div>
                          <div className="flex items-start gap-2.5 text-sm text-gray-700">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                            {patient.contact.address}
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
                          <span className="font-medium">Insurance:</span> {patient.insuranceProvider}
                        </div>

                        {/* Select Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPatient(patient);
                          }}
                          className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 group"
                        >
                          Open Chart
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No patients match your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
