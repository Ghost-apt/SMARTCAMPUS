import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import {
  BookOpen,
  CalendarCheck,
  FileText,
  Clock,
  Sparkles,
  Bot,
  Send,
  AlertCircle,
  CheckCircle2,
  Bell,
  ArrowUpRight
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // AI Chat Bar State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/student');
        if (res.data.success) {
          setDashboardData(res.data.data);
        }
      } catch (err) {
        setError(err.userMessage || 'Failed to load student dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setAiLoading(true);
    setAiResponse('');
    try {
      const res = await api.post('/ai/chat', { query: aiQuery, category: 'Academic' });
      if (res.data.success) {
        setAiResponse(res.data.response);
      }
    } catch (err) {
      setAiResponse(err.userMessage || 'Could not connect to AI service. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Student Portal" subtitle="Loading your academic overview...">
        <LoadingSkeleton type="stat" />
        <div className="mt-6">
          <LoadingSkeleton count={3} />
        </div>
      </DashboardLayout>
    );
  }

  const attendanceRate = dashboardData?.attendanceRate ?? 88.5;
  const enrolledCoursesCount = dashboardData?.enrolledCoursesCount ?? 2;
  const courses = dashboardData?.courses || [];
  const notices = dashboardData?.recentNotices || [];

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.name || 'Student'}!`}
      subtitle={`Enrolled in ${user?.department || 'BCA'} • Roll Number: ${user?.studentId || dashboardData?.profile?.rollNumber || 'BCA-2023-042'}`}
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          subtitle={attendanceRate >= 75 ? 'Eligibility Criteria Met' : 'Action Required (<75%)'}
          trend={attendanceRate >= 75 ? '+2.1% this week' : '-3.5%'}
          icon={CalendarCheck}
          color={attendanceRate >= 75 ? 'teal' : 'rose'}
        />
        <StatCard
          title="Enrolled Courses"
          value={enrolledCoursesCount}
          subtitle="Semester 5 (Active)"
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Current CGPA"
          value={dashboardData?.profile?.cgpa || '8.75'}
          subtitle="Scale of 10.0"
          trend="Top 10% in batch"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Assignments Due"
          value="2"
          subtitle="Within 5 days"
          icon={FileText}
          color="blue"
        />
      </div>

      {/* AI Assistant Quick Consultation Widget */}
      <div className="mb-8 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl border border-indigo-900/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">SmartCampus AI Academic Assistant</h3>
            <p className="text-xs text-slate-300">Ask any question regarding university policies, attendance rules, examinations, or syllabus.</p>
          </div>
        </div>

        <form onSubmit={handleAskAI} className="flex gap-2 mt-4">
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="e.g. What is the minimum attendance required for final exams?"
            className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-teal-400"
          />
          <button
            type="submit"
            disabled={aiLoading}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {aiLoading ? (
              <span>Consulting AI...</span>
            ) : (
              <>
                <span>Ask AI</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {aiResponse && (
          <div className="mt-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-slate-200">
            <div className="flex items-center gap-2 font-semibold text-teal-400 text-xs uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Response</span>
            </div>
            <p className="leading-relaxed">{aiResponse}</p>
          </div>
        )}
      </div>

      {/* Main Grid: Enrolled Courses & Recent Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Enrolled Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900">Enrolled Courses (Semester 5)</h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                {courses.length} Registered
              </span>
            </div>

            {courses.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No courses enrolled yet</p>
                <p className="text-xs text-slate-500 mt-1">Course registration will open for your semester shortly.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => (
                  <div
                    key={course._id || course.courseCode}
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-slate-50/50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {course.courseCode}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{course.courseName}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{course.description || 'Full-credit university major course'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700">{course.credits || 4} Credits</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Timetable Preview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="font-bold text-lg text-slate-900 mb-4">Today's Academic Schedule</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <span className="text-xs font-bold text-indigo-600">09:30 AM – 11:00 AM</span>
                <p className="font-semibold text-sm text-slate-900 mt-1">Artificial Intelligence & ML</p>
                <p className="text-xs text-slate-500 mt-0.5">Lab 304 • Dr. Sarah Sharma</p>
              </div>
              <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-100">
                <span className="text-xs font-bold text-teal-600">11:30 AM – 01:00 PM</span>
                <p className="font-semibold text-sm text-slate-900 mt-1">Full-Stack Web Engineering</p>
                <p className="text-xs text-slate-500 mt-0.5">Hall B • Prof. Sharma</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Campus Notices */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-lg text-slate-900">Recent Notices</h3>
              </div>
            </div>

            {notices.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No new notices posted today.</p>
            ) : (
              <div className="space-y-3">
                {notices.map((n) => (
                  <div key={n._id || n.title} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        n.priority === 'Urgent' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {n.priority || 'Notice'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Today'}
                      </span>
                    </div>
                    <h5 className="font-semibold text-xs text-slate-900">{n.title}</h5>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.content}</p>
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

export default StudentDashboard;
