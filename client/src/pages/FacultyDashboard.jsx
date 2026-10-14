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
  CalendarCheck
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

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/faculty');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        setError(err.userMessage || 'Failed to load faculty dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

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
          trend="+4 new this semester"
          icon={Users}
          color="teal"
        />
        <StatCard
          title="Pending Submissions"
          value={data?.pendingReviewsCount ?? 0}
          subtitle="Requires grading"
          icon={ClipboardCheck}
          color="amber"
        />
        <StatCard
          title="Today's Lectures"
          value="2"
          subtitle="Scheduled"
          icon={Clock}
          color="blue"
        />
      </div>

      {/* Quick Actions Row */}
      <div className="mb-8 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Faculty Fast Actions</h4>
          <p className="text-xs text-slate-500">Record attendance, publish announcements, or manage course syllabi.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNoticeModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish Notice</span>
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

