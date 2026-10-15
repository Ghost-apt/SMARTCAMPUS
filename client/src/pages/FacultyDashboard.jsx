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
  RefreshCw
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

  const handleReindexResource = async (resourceId) => {
    try {
      await api.post(`/resources/${resourceId}/reindex`);
      fetchDashboard();
    } catch (err) {
      setError('Failed to reindex resource.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Faculty Portal" subtitle="Loading academic courses and submissions...">
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
      subtitle={`Department of ${user?.department || 'Computer Applications'} • Employee ID: ${user?.facultyId || data?.profile?.employeeId || 'FAC-BCA-001'}`}
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
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
          trend={`${turnoutRate}% avg turnout`}
          icon={Users}
          color="teal"
        />
        <StatCard
          title="Pending Submissions"
          value={data?.pendingReviewsCount ?? analyticsData?.assignments?.pendingGrading ?? 0}
          subtitle="Requires grading"
          icon={ClipboardCheck}
          color="amber"
        />
        <StatCard
          title="Attendance Risk"
          value={atRiskStudents.length}
          subtitle="Students < 75% compliance"
          trend={atRiskStudents.length > 0 ? 'Requires attention' : 'All compliant'}
          icon={CalendarCheck}
          color={atRiskStudents.length > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Quick Actions Row */}
      <div className="mb-8 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Faculty Fast Actions</h4>
          <p className="text-xs text-slate-500">Record attendance via QR code, publish announcements, or manage course grading.</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/faculty/attendance"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Launch QR Attendance</span>
          </a>
          <button
            onClick={() => setShowNoticeModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish Notice</span>
          </button>
          <button
            onClick={() => setShowResourceModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Notes (RAG)</span>
          </button>
        </div>
      </div>

      {/* Notice Publish Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Publish Campus Notice</h3>
            {noticeSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{noticeSuccess}</span>
              </div>
            )}
            <form onSubmit={handlePostNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Project Review Schedule"
                  required
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Content</label>
                <textarea
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  rows="4"
                  placeholder="Notice announcement details..."
                  required
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postingNotice}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  {postingNotice ? 'Publishing...' : 'Publish Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RAG Study Material Upload Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-slate-900">Upload & Index Study Material (RAG)</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Notes uploaded here are parsed, chunked, and embedded into the RAG vector store for student question answering.
            </p>
            {resourceSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{resourceSuccess}</span>
              </div>
            )}
            <form onSubmit={handleUploadResource} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title</label>
                  <input
                    type="text"
                    value={resTitle}
                    onChange={(e) => setResTitle(e.target.value)}
                    placeholder="e.g. Unit 1: Normalization & BCNF"
                    required
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={resSubject}
                    onChange={(e) => setResSubject(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 bg-white"
                  >
                    <option value="BCA-501">BCA-501 (AI & ML)</option>
                    <option value="BCA-502">BCA-502 (Web Dev)</option>
                    <option value="BCA-503">BCA-503 (DBMS)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Summary</label>
                <input
                  type="text"
                  value={resDesc}
                  onChange={(e) => setResDesc(e.target.value)}
                  placeholder="e.g. Complete lecture notes with schema decomposition examples."
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Note Content / Handout Text
                </label>
                <textarea
                  value={resRawText}
                  onChange={(e) => setResRawText(e.target.value)}
                  rows="4"
                  placeholder="Paste handout lecture text, unit notes, or definitions to index into the vector store..."
                  required
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-purple-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResourceModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingResource}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white"
                >
                  {uploadingResource ? 'Extracting & Indexing...' : 'Index Document Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Early-Support Cohort Diagnostics Card */}
      <div className="mb-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-lg text-slate-900">
                AI Early-Support Cohort Intelligence
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Machine learning classifier identifies students at academic risk and suggests explainable interventions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-slate-900 text-teal-300 border border-slate-700">
              {earlySupport?.engine || 'RandomForest Classifier'}
            </span>
          </div>
        </div>

        {/* Risk Distribution Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
          <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-rose-800">High Support Priority</span>
              <p className="text-2xl font-bold text-rose-950 mt-1">{earlySupport?.highRiskCount ?? 0}</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-rose-500" />
          </div>
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-800">Moderate Support</span>
              <p className="text-2xl font-bold text-amber-950 mt-1">{earlySupport?.mediumRiskCount ?? 0}</p>
            </div>
            <AlertCircle className="w-6 h-6 text-amber-500" />
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-800">Optimal Standing</span>
              <p className="text-2xl font-bold text-emerald-950 mt-1">{earlySupport?.lowRiskCount ?? 0}</p>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
        </div>

        {/* Flagged Students Needing Faculty Intervention */}
        {(!earlySupport?.students || earlySupport.students.length === 0) ? (
          <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">All students are in optimal academic standing</p>
            <p className="text-xs text-slate-500 mt-1">Attendance and assignment submissions meet departmental thresholds.</p>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Enrolled Students & Explainable Diagnostic Risk Factors
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">Attendance</th>
                    <th className="py-2.5 px-3">Assignments</th>
                    <th className="py-2.5 px-3">GPA</th>
                    <th className="py-2.5 px-3">Risk Assessment</th>
                    <th className="py-2.5 px-3">Identified Influencer & Intervention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {earlySupport.students.map((st, idx) => (
                    <tr key={st.studentId || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900">{st.studentName}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{st.rollNumber}</td>
                      <td className="py-3 px-3">
                        <span className={`font-bold ${st.attendanceRate < 75 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {st.attendanceRate}%
                        </span>
                      </td>
                      <td className="py-3 px-3">{st.assignmentCompletion}%</td>
                      <td className="py-3 px-3 font-bold text-slate-800">{st.gpa ?? 'N/A'}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            st.riskLevel === 'High'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : st.riskLevel === 'Medium'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {st.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <p className="line-clamp-1">{st.contributingFactors?.[0] || 'Regular performance'}</p>
                        <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">
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
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="font-bold text-lg text-slate-900 mb-4">Assigned Courses & Lecture Modules</h3>
            {assignedCourses.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No courses assigned yet</p>
                <p className="text-xs text-slate-500 mt-1">Dean of Academics will allocate your course load.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedCourses.map((course) => (
                  <div
                    key={course._id || course.courseCode}
                    className="p-4 rounded-xl border border-slate-200 hover:border-teal-200 hover:bg-slate-50/50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                          {course.courseCode}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{course.courseName}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{course.description || 'University Undergraduate Course'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700">{course.credits || 4} Credits</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notices */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-lg text-slate-900">Department Notices</h3>
            </div>
            {notices.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No notices currently.</p>
            ) : (
              <div className="space-y-3">
                {notices.map((n) => (
                  <div key={n._id || n.title} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {n.priority || 'Notice'}
                    </span>
                    <h5 className="font-semibold text-xs text-slate-900 mt-1">{n.title}</h5>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.content}</p>
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

