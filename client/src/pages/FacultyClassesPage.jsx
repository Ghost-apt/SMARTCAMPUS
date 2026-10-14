import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { BookOpen, GraduationCap, Users, Clock, Award, AlertCircle } from 'lucide-react';

const FacultyClassesPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

    fetchClasses();
  }, []);

  return (
    <DashboardLayout
      title="My Teaching Modules & Academic Classes"
      subtitle="Department of Computer Applications • Faculty Lecture & Practical Allocations"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : subjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">No Assigned Subjects</h4>
          <p className="text-xs text-slate-400 mt-1">Contact the Head of Department for teaching allocations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map((sub) => (
            <div
              key={sub._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-3 py-1 rounded-lg text-xs font-black tracking-wide bg-teal-50 text-teal-800 border border-teal-200">
                    {sub.subjectCode}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Sem {sub.semester || 5}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {sub.credits || 4} Credits
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2">
                  {sub.subjectName}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {sub.description || 'Core university undergraduate course curriculum and lab sessions.'}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span>Enrolled: 42 Students</span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-teal-700">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{sub.type || 'Theory + Lab'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default FacultyClassesPage;
