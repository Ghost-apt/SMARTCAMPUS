import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import {
  BookOpen,
  Users,
  ClipboardCheck,
  Bell,
  Clock,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  CalendarCheck,
  Sparkles,
  AlertTriangle,
  GraduationCap,
  FileText,
  UploadCloud,
  RefreshCw,
  QrCode,
  X,
  ChevronRight
} from 'lucide-react';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quick Notice Modal State
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [postingNotice, setPostingNotice] = useState(false);
  const [noticeSuccess, setNoticeSuccess] = useState('');

  // RAG Study Resource Modal State
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resSubject, setResSubject] = useState('BCA-501');
  const [resDesc, setResDesc] = useState('');
  const [resRawText, setResRawText] = useState('');
  const [uploadingResource, setUploadingResource] = useState(false);
  const [resourceSuccess, setResourceSuccess] = useState('');

  const [analyticsData, setAnalyticsData] = useState(null);
  const [earlySupport, setEarlySupport] = useState(null);
  const [resources, setResources] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [dashRes, analyticsRes, earlySupportRes, resourcesRes] = await Promise.allSettled([
        api.get('/dashboard/faculty'),
        api.get('/analytics/faculty/overview'),
        api.get('/ai/early-support'),
        api.get('/resources')
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.data.success) {
        setData(dashRes.value.data.data);
      }
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data.success) {
        setAnalyticsData(analyticsRes.value.data.data);
      }
      if (earlySupportRes.status === 'fulfilled' && earlySupportRes.value.data.success) {
        setEarlySupport(earlySupportRes.value.data);
      }
      if (resourcesRes.status === 'fulfilled' && resourcesRes.value.data.success) {
        setResources(resourcesRes.value.data.resources || []);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to load faculty dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;

    setPostingNotice(true);
    setNoticeSuccess('');
    try {
      const res = await api.post('/notices', {
        title: noticeTitle,
        content: noticeContent,
        targetAudience: 'student',
        priority: 'High',
        department: user?.department || 'BCA'
      });
      if (res.data.success) {
        setNoticeSuccess('Notice published successfully!');
        setNoticeTitle('');
        setNoticeContent('');
        fetchDashboard();
        setTimeout(() => setShowNoticeModal(false), 1200);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to publish notice.');
    } finally {
      setPostingNotice(false);
    }
  };

  const handleUploadResource = async (e) => {
    e.preventDefault();
    if (!resTitle.trim() || !resSubject.trim()) return;

    setUploadingResource(true);
    setResourceSuccess('');
    try {
      const res = await api.post('/resources', {
        title: resTitle.trim(),
        subjectCode: resSubject.trim(),
        description: resDesc.trim(),
        rawText: resRawText.trim() || resDesc.trim(),
        category: 'Lecture Notes',
        fileUrl: 'https://smartcampus.edu/resources/sample-handout.pdf'
      });
      if (res.data.success) {
        setResourceSuccess('Document uploaded and indexed into RAG vector store successfully!');
        setResTitle('');
        setResDesc('');
        setResRawText('');
        fetchDashboard();
        setTimeout(() => setShowResourceModal(false), 1200);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to upload study material.');
    } finally {
      setUploadingResource(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Faculty Command Portal" subtitle="Loading academic courses and submissions...">
        <LoadingSkeleton type="stat" />
        <div className="mt-6">
          <LoadingSkeleton count={3} />
        </div>
      </DashboardLayout>
    );
  }

  const assignedCourses = data?.assignedCourses || [];
  const notices = data?.recentNotices || [];
  const atRiskStudents = analyticsData?.studentsNeedingSupport || [];
  const turnoutRate = analyticsData?.attendanceCompliance?.averageTurnoutRate ?? 88;

  return (
    <DashboardLayout
      title={`Welcome, ${user?.name || 'Professor'}!`}
      subtitle={`Department of ${user?.department || 'Computer Applications'} • Faculty ID: ${user?.facultyId || data?.profile?.employeeId || 'FAC-BCA-001'}`}
      headerActions={
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20 shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Teaching Load: Active
          </span>
        </div>
      }
    >
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Assigned Courses"
          value={data?.assignedCoursesCount ?? assignedCourses.length}
          subtitle="Semester 5 (Active)"
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Students Enrolled"
          value={data?.totalEnrolledStudents ?? 42}
          subtitle="Across all sections"
          trend={`${turnoutRate}% Turnout`}
          icon={Users}
          color="teal"
        />
        <StatCard
          title="Pending Submissions"
          value={data?.pendingReviewsCount ?? analyticsData?.assignments?.pendingGrading ?? 0}
          subtitle="Requires grading"
          trend={data?.pendingReviewsCount > 0 ? 'Action Needed' : 'Evaluated'}
          icon={ClipboardCheck}
          color="amber"
        />
        <StatCard
          title="Attendance Risk"
          value={atRiskStudents.length}
          subtitle="Students < 75% compliance"
          trend={atRiskStudents.length > 0 ? 'High Attention' : 'All Compliant'}
          icon={CalendarCheck}
          color={atRiskStudents.length > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Faculty Fast Actions Ribbon */}
      <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-wrap items-center justify-between gap-4 transition-all">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Faculty Command Actions</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Launch classroom QR attendance, publish announcements, or index notes into the RAG engine.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href="/faculty/attendance"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-cyan-600/25 transition-all hover:scale-[1.02]"
          >
            <QrCode className="w-4 h-4" />
            <span>Launch QR Attendance</span>
          </a>
          <button
            onClick={() => setShowNoticeModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish Notice</span>
          </button>
          <button
            onClick={() => setShowResourceModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-all hover:scale-[1.02]"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Notes (RAG)</span>
          </button>
        </div>
      </div>

      {/* Notice Publish Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 max-w-md w-full shadow-2xl relative animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Publish Campus Notice</h3>
              <button
                onClick={() => setShowNoticeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {noticeSuccess && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{noticeSuccess}</span>
              </div>
            )}
            <form onSubmit={handlePostNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Notice Headline
                </label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Minor Project Review Schedule"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Announcement Details
                </label>
                <textarea
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  rows="4"
                  placeholder="Provide schedule details, venue, requirements..."
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postingNotice}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all disabled:opacity-50"
                >
                  {postingNotice ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RAG Study Material Upload Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 max-w-lg w-full shadow-2xl relative animate-scale-in">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Index Study Material into RAG Store
                </h3>
              </div>
              <button
                onClick={() => setShowResourceModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Notes uploaded here are chunked and vectorized for authentic student Q&A with citations.
            </p>
            {resourceSuccess && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{resourceSuccess}</span>
              </div>
            )}
            <form onSubmit={handleUploadResource} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={resTitle}
                    onChange={(e) => setResTitle(e.target.value)}
                    placeholder="e.g. Unit 1: Normalization & BCNF"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Subject Code
                  </label>
                  <select
                    value={resSubject}
                    onChange={(e) => setResSubject(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="BCA-501">BCA-501 (AI & ML)</option>
                    <option value="BCA-502">BCA-502 (Web Dev)</option>
                    <option value="BCA-503">BCA-503 (DBMS)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Summary / Scope
                </label>
                <input
                  type="text"
                  value={resDesc}
                  onChange={(e) => setResDesc(e.target.value)}
                  placeholder="e.g. Complete lecture notes covering schema decomposition."
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Handout Lecture Text (Vector Index Target)
                </label>
                <textarea
                  value={resRawText}
                  onChange={(e) => setResRawText(e.target.value)}
                  rows="4"
                  placeholder="Paste handout lecture text, unit definitions, or formulas..."
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResourceModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingResource}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all disabled:opacity-50"
                >
                  {uploadingResource ? 'Extracting & Indexing...' : 'Index Document Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Early-Support Cohort Diagnostics Card */}
      <div className="mb-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                AI Early-Support Cohort Intelligence
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Machine learning risk diagnostic identifies students who may require academic interventions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-slate-900 text-cyan-400 border border-slate-700 shadow-sm">
              {earlySupport?.engine || 'RandomForest Classifier'}
            </span>
          </div>
        </div>

        {/* Risk Distribution Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5">
          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-500/10 border border-rose-200/70 dark:border-rose-500/20 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-rose-800 dark:text-rose-400">High Support Priority</span>
              <p className="text-2xl font-black text-rose-950 dark:text-rose-300 mt-1">
                {earlySupport?.highRiskCount ?? 0}
              </p>
            </div>
            <AlertTriangle className="w-6 h-6 text-rose-500" />
          </div>
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/70 dark:border-amber-500/20 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-400">Moderate Support</span>
              <p className="text-2xl font-black text-amber-950 dark:text-amber-300 mt-1">
                {earlySupport?.mediumRiskCount ?? 0}
              </p>
            </div>
            <AlertCircle className="w-6 h-6 text-amber-500" />
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200/70 dark:border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Optimal Standing</span>
              <p className="text-2xl font-black text-emerald-950 dark:text-emerald-300 mt-1">
                {earlySupport?.lowRiskCount ?? 0}
              </p>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
        </div>

        {/* Flagged Students Needing Faculty Intervention */}
        {!earlySupport?.students || earlySupport.students.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              All students are in optimal academic standing
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Attendance and assignment submissions satisfy university criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Enrolled Students & Diagnostic Risk Factors
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-800/60">
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Roll No</th>
                    <th className="py-3 px-3">Attendance</th>
                    <th className="py-3 px-3">Assignments</th>
                    <th className="py-3 px-3">GPA</th>
                    <th className="py-3 px-3">Risk Assessment</th>
                    <th className="py-3 px-3">Recommended Intervention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {earlySupport.students.map((st, idx) => (
                    <tr
                      key={st.studentId || idx}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{st.studentName}</td>
                      <td className="py-3 px-3 font-mono text-slate-500 dark:text-slate-400">{st.rollNumber}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-bold ${
                            st.attendanceRate < 75 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {st.attendanceRate}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                        {st.assignmentCompletion}%
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">{st.gpa ?? 'N/A'}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            st.riskLevel === 'High'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                              : st.riskLevel === 'Medium'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                          }`}
                        >
                          {st.riskLevel} Risk
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        <p className="line-clamp-1">{st.contributingFactors?.[0] || 'Regular performance'}</p>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">
                          Action: {st.recommendedInterventions?.[0] || 'Monitor progress'}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Courses & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-4">
              Assigned Courses & Lecture Modules
            </h3>
            {assignedCourses.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No courses assigned yet
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Dean of Academics will allocate your course load.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedCourses.map((course) => (
                  <div
                    key={course._id || course.courseCode}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-cyan-500/30 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20">
                          {course.courseCode}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {course.courseName}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {course.description || 'University Undergraduate Course'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                        {course.credits || 4} Credits
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notices */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">Department Notices</h3>
            </div>
            {notices.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">No notices currently.</p>
            ) : (
              <div className="space-y-3">
                {notices.map((n) => (
                  <div
                    key={n._id || n.title}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800"
                  >
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">
                      {n.priority || 'Notice'}
                    </span>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white mt-1.5">{n.title}</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {n.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;
