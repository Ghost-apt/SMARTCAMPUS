import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { BookOpen, Search, Filter, Award, User, Clock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const StudentCoursesPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');

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
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Courses</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{subjects.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Semester Credits</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalCredits} Credits</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Academic Standing</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">Regular / Active</h3>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search subject by code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">Type:</span>
          {['All', 'Theory', 'Practical'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedType === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">No subjects found</h4>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSubjects.map((subject) => (
            <div
              key={subject._id || subject.subjectCode}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <span className="px-3 py-1 rounded-lg text-xs font-black tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {subject.subjectCode}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {subject.type || 'Core'}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {subject.credits || 4} Credits
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2">
                  {subject.subjectName}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {subject.description || 'Comprehensive syllabus designed for foundational and advanced university curriculum.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-500" />
                  <span className="font-medium text-slate-700">
                    {subject.faculty?.name || 'Prof. Faculty Advisor'}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-indigo-600">
                  <Clock className="w-3.5 h-3.5" />
                  <span>4 Hrs / Wk</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentCoursesPage;
