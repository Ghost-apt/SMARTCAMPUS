import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { BookOpen, PlusCircle, CheckCircle2, AlertCircle, X, Award, Layers } from 'lucide-react';

const AdminCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('subjects'); // 'courses' | 'subjects'

  // Add Subject Modal State
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [credits, setCredits] = useState(4);
  const [type, setType] = useState('Theory');
  const [semester, setSemester] = useState(5);
  const [creatingSubject, setCreatingSubject] = useState(false);
  const [subjectSuccess, setSubjectSuccess] = useState('');

  // Add Course Modal State
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [totalSemesters, setTotalSemesters] = useState(6);
  const [department, setDepartment] = useState('Computer Applications');
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [courseSuccess, setCourseSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        api.get('/courses'),
        api.get('/subjects')
      ]);

      if (cRes.data.success) setCourses(cRes.data.courses || []);
      if (sRes.data.success) setSubjects(sRes.data.subjects || []);
    } catch (err) {
      setError(err.userMessage || 'Failed to load curriculum data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!subjectCode.trim() || !subjectName.trim()) return;

    setCreatingSubject(true);
    setSubjectSuccess('');
    setError('');

    try {
      const res = await api.post('/subjects', {
        subjectCode,
        subjectName,
        credits: Number(credits),
        type,
        semester: Number(semester),
        department: 'Computer Applications'
      });

      if (res.data.success) {
        setSubjectSuccess('Subject added to curriculum successfully!');
        setSubjectCode('');
        setSubjectName('');
        await fetchData();
        setTimeout(() => {
          setShowSubjectModal(false);
          setSubjectSuccess('');
        }, 1200);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to add subject.');
    } finally {
      setCreatingSubject(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim()) return;

    setCreatingCourse(true);
    setCourseSuccess('');
    setError('');

    try {
      const res = await api.post('/courses', {
        courseCode,
        courseName,
        totalSemesters: Number(totalSemesters),
        department
      });

      if (res.data.success) {
        setCourseSuccess('Degree program established successfully!');
        setCourseCode('');
        setCourseName('');
        await fetchData();
        setTimeout(() => {
          setShowCourseModal(false);
          setCourseSuccess('');
        }, 1200);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to establish degree program.');
    } finally {
      setCreatingCourse(false);
    }
  };

  return (
    <DashboardLayout
      title="Curriculum & Degree Programs Management"
      subtitle="Accredit degree programs, design semester syllabus, and configure credit frameworks"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab Switcher & Actions Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 mb-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'subjects'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Syllabus Subjects ({subjects.length})
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'courses'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Degree Programs ({courses.length})
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {activeTab === 'subjects' ? (
            <button
              onClick={() => setShowSubjectModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          ) : (
            <button
              onClick={() => setShowCourseModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Degree Program</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : activeTab === 'subjects' ? (
        /* Subjects Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map((sub) => (
            <div
              key={sub._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:border-indigo-200 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-3 py-1 rounded-lg text-xs font-black tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {sub.subjectCode}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Sem {sub.semester || 5}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {sub.credits || 4} Credits
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                  {sub.subjectName}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {sub.description || 'Full-semester academic curriculum subject.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Type: <strong className="text-slate-700">{sub.type || 'Core'}</strong></span>
                <span>Department of Computer Applications</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Degree Programs Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-3 py-1 rounded-lg text-xs font-black tracking-wide bg-teal-50 text-teal-800 border border-teal-200">
                    PROGRAM: {c.courseCode}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {c.totalSemesters || 6} Semesters
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                  {c.courseName}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {c.description || 'Degree program designed for university accreditation.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Accreditation: Active</span>
                <span>UGC Approved</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Add Syllabus Subject</h3>
              <button onClick={() => setShowSubjectModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {subjectSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{subjectSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    placeholder="e.g. BCA-505"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical / Lab</option>
                    <option value="Core">Core</option>
                    <option value="Elective">Elective</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Distributed Systems & Cloud Computing"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    required
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    required
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSubject}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                >
                  {creatingSubject ? 'Adding...' : 'Add Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Add Degree Program</h3>
              <button onClick={() => setShowCourseModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {courseSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{courseSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Program Code</label>
                  <input
                    type="text"
                    required
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="e.g. BTech-AI"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Semesters</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={totalSemesters}
                    onChange={(e) => setTotalSemesters(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Degree Program Name</label>
                <input
                  type="text"
                  required
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g. B.Tech in Artificial Intelligence"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCourse}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                >
                  {creatingCourse ? 'Establishing...' : 'Establish Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminCoursesPage;

