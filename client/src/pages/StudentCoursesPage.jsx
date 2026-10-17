import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import SyllabusModal from '../components/SyllabusModal';
import api from '../services/api';
import { BookOpen, Search, Filter, Award, User, Clock, CheckCircle2, AlertCircle, Layers } from 'lucide-react';

const StudentCoursesPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSubjectForSyllabus, setSelectedSubjectForSyllabus] = useState(null);
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/subjects');
        if (res.data.success) {
          setSubjects(res.data.subjects || []);
        }
      } catch (err) {
        setError(err.userMessage || 'Failed to load course modules.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleOpenSyllabus = (subject) => {
    setSelectedSubjectForSyllabus(subject);
    setIsSyllabusOpen(true);
  };

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch =
      s.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.subjectCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || s.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalCredits = subjects.reduce((sum, s) => sum + (s.credits || 4), 0);

  return (
    <DashboardLayout
      title="My Enrolled Courses & Curriculum"
      subtitle="BCA - Bachelor of Computer Applications • Semester 5 (Academic Year 2026-2027)"
    >
      {/* Top Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Registered Courses</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{subjects.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Semester Credits</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{totalCredits} Credits</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Academic Standing</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">Regular / Active</h3>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between transition-colors">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search subject by code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Type:</span>
          {['All', 'Theory', 'Practical'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedType === type
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoadingSkeleton count={4} />
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center transition-colors">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-200">No subjects found</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSubjects.map((subject) => {
            const hasFacultySyllabus = subject.syllabus && Array.isArray(subject.syllabus.units) && subject.syllabus.units.length > 0;
            return (
              <div
                key={subject._id || subject.subjectCode}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="px-3 py-1 rounded-lg text-xs font-black tracking-wide bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                      {subject.subjectCode}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {subject.type || 'Core'}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                        {subject.credits || 4} Credits
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug mb-2">
                    {subject.subjectName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {subject.description || 'Comprehensive syllabus designed for foundational and advanced university curriculum.'}
                  </p>

                  {/* Syllabus Status Pill */}
                  <div className="mt-3 flex items-center gap-2">
                    {hasFacultySyllabus ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                        Syllabus Published ({subject.syllabus.units.length} Units)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/80">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Syllabus Not Yet Published
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                      {subject.faculty?.name || 'Prof. Faculty Advisor'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenSyllabus(subject)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 transition-all flex items-center gap-1.5 flex-shrink-0 shadow-sm"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>View Syllabus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Syllabus View & Study Tracker Modal */}
      {selectedSubjectForSyllabus && (
        <SyllabusModal
          subject={selectedSubjectForSyllabus}
          isOpen={isSyllabusOpen}
          onClose={() => {
            setIsSyllabusOpen(false);
            setSelectedSubjectForSyllabus(null);
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default StudentCoursesPage;


