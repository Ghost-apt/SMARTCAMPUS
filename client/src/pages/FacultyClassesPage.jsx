import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ManageSyllabusModal from '../components/ManageSyllabusModal';
import api from '../services/api';
import { BookOpen, GraduationCap, Users, Clock, Award, AlertCircle, Sparkles, Layers } from 'lucide-react';

const FacultyClassesPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubjectForSyllabus, setSelectedSubjectForSyllabus] = useState(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/subjects');
      if (res.data.success) {
        setSubjects(res.data.subjects || []);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to load assigned classes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleOpenManageSyllabus = (subject) => {
    setSelectedSubjectForSyllabus(subject);
    setIsManageModalOpen(true);
  };

  return (
    <DashboardLayout
      title="My Teaching Modules & Academic Classes"
      subtitle="Department of Computer Applications • Faculty Lecture & Practical Allocations"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : subjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center transition-colors">
          <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-200">No Assigned Subjects</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Contact the Head of Department for teaching allocations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map((sub) => {
            const hasFacultySyllabus = sub.syllabus && Array.isArray(sub.syllabus.units) && sub.syllabus.units.length > 0;
            return (
              <div
                key={sub._id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-lg text-xs font-black tracking-wide bg-teal-50 dark:bg-teal-500/10 text-teal-800 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20">
                      {sub.subjectCode}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        Sem {sub.semester || 5}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                        {sub.credits || 4} Credits
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug mb-2">
                    {sub.subjectName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    {sub.description || 'Core university undergraduate course curriculum and lab sessions.'}
                  </p>

                  {/* Syllabus Publication Status */}
                  <div className="mb-2">
                    {hasFacultySyllabus ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        Syllabus Published ({sub.syllabus.units.length} Units)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                        <Clock className="w-3 h-3 text-amber-500" />
                        Syllabus Pending (Not yet authored)
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Enrolled: 42 Students</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenManageSyllabus(sub)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-50 dark:bg-teal-500/10 hover:bg-teal-100 dark:hover:bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30 transition-all flex items-center gap-1.5 flex-shrink-0 shadow-sm"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{hasFacultySyllabus ? 'Edit Syllabus' : 'Add Syllabus'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Faculty Manage Syllabus Builder Modal */}
      {selectedSubjectForSyllabus && (
        <ManageSyllabusModal
          subject={selectedSubjectForSyllabus}
          isOpen={isManageModalOpen}
          onClose={() => {
            setIsManageModalOpen(false);
            setSelectedSubjectForSyllabus(null);
          }}
          onSyllabusUpdated={() => {
            fetchClasses();
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default FacultyClassesPage;


