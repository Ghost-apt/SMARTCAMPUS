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
  ArrowUpRight,
  GraduationCap,
  ChevronRight,
  TrendingUp,
  MapPin,
  Calendar,
  CreditCard
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

  const [analyticsData, setAnalyticsData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, analyticsRes, insightsRes] = await Promise.allSettled([
          api.get('/dashboard/student'),
          api.get('/analytics/student/overview'),
          api.get('/ai/academic-insights')
        ]);

        if (dashRes.status === 'fulfilled' && dashRes.value.data.success) {
          setDashboardData(dashRes.value.data.data);
        }
        if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data.success) {
          setAnalyticsData(analyticsRes.value.data.data);
        }
        if (insightsRes.status === 'fulfilled' && insightsRes.value.data.success) {
          setAiInsights(insightsRes.value.data);
        }
      } catch (err) {
        setError(err.userMessage || 'Failed to load student dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleAskAI = async (e, customQuery) => {
    if (e) e.preventDefault();
    const query = (customQuery || aiQuery).trim();
    if (!query) return;

    if (customQuery) setAiQuery(customQuery);
    setAiLoading(true);
    setAiResponse('');
    try {
      const res = await api.post('/ai/chat', { query, category: 'Academic' });
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
      <DashboardLayout title="Student Academic Workspace" subtitle="Loading your personalized dashboard...">
        <LoadingSkeleton type="stat" />
        <div className="mt-6">
          <LoadingSkeleton count={3} />
        </div>
      </DashboardLayout>
    );
  }

  const attendanceRate = analyticsData?.attendance?.overallPercentage ?? dashboardData?.attendanceRate ?? 88.5;
  const enrolledCoursesCount = dashboardData?.enrolledCoursesCount ?? 2;
  const courses = dashboardData?.courses || [];
  const notices = dashboardData?.recentNotices || [];
  const pendingAssignments = analyticsData?.assignments?.pending ?? 2;
  const cgpaValue = analyticsData?.academics?.currentCgpa ?? dashboardData?.profile?.cgpa ?? '8.75';

  return (
    <DashboardLayout
      title={`${getGreeting()}, ${user?.name || 'Student'}!`}
      subtitle={`Enrolled in ${user?.department || 'BCA'} • Roll Number: ${user?.studentId || dashboardData?.profile?.rollNumber || 'BCA-2023-042'}`}
      headerActions={
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 shadow-sm">
            Semester 5 Active
          </span>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Good Academic Standing
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

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          subtitle={attendanceRate >= 75 ? 'Eligibility Criteria Met (≥75%)' : 'Action Required (<75%)'}
          trend={attendanceRate >= 75 ? 'Exam Eligible' : 'Debarred Risk'}
          icon={CalendarCheck}
          color={attendanceRate >= 75 ? 'teal' : 'rose'}
        />
        <StatCard
          title="Enrolled Courses"
          value={enrolledCoursesCount}
          subtitle="Semester 5 Curriculum"
          trend="Regular Batch"
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Current CGPA"
          value={cgpaValue}
          subtitle="Scale of 10.0"
          trend="Top Tier"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Assignments Due"
          value={pendingAssignments}
          subtitle="Requires submission"
          trend={pendingAssignments > 0 ? 'Pending Tasks' : 'All Clear'}
          icon={FileText}
          color="blue"
        />
      </div>

      {/* Classroom Quick Action Check-in Strip */}
      <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-wrap items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0 border border-cyan-100 dark:border-cyan-500/20">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Active Classroom Attendance Check-In</h4>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              In class right now? Scan the live classroom QR code or enter the session key.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href="/student/attendance"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-cyan-600/25 transition-all hover:scale-[1.02]"
          >
            <span>Check-In Scanner</span>
            <ChevronRight className="w-4 h-4" />
          </a>
          <a
            href="/student/fees"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6C8CFF] to-[#43D9FF] hover:brightness-110 text-slate-950 text-xs font-bold shadow-md transition-all hover:scale-[1.02]"
          >
            <CreditCard className="w-4 h-4 text-slate-950" />
            <span>Fees & Structure</span>
          </a>
        </div>
      </div>

      {/* AI Assistant Consultation Widget */}
      <div className="mb-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-indigo-500/30 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-inner">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-base sm:text-lg text-white">SmartCampus AI Academic Advisor</h3>
                  {aiInsights?.analysis?.riskLevel && (
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        aiInsights.analysis.riskLevel === 'High'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : aiInsights.analysis.riskLevel === 'Medium'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      ML Risk Diagnostic: {aiInsights.analysis.riskLevel === 'Low' ? 'Optimal' : aiInsights.analysis.riskLevel}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Live access to your attendance compliance, assignments, and curriculum.
                </p>
              </div>
            </div>
            <a
              href="/student/ai"
              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-300 flex items-center gap-1.5 transition-all border border-white/10 hover:border-cyan-400/40"
            >
              <span>Full AI Advisor & RAG Notes</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Quick Consultation Chips */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-[11px] font-semibold text-slate-400">Try asking:</span>
            {[
              'What is my current attendance standing?',
              'What assignments are pending submission?',
              'What are the core topics in BCA-501?'
            ].map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAskAI(null, prompt)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleAskAI} className="flex gap-2">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="e.g. What is the minimum attendance required for semester examinations?"
              className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="bg-gradient-to-r from-cyan-400 to-teal-400 hover:brightness-110 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              {aiLoading ? (
                <span>Consulting...</span>
              ) : (
                <>
                  <span>Ask AI</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {aiResponse && (
            <div className="mt-4 p-4 rounded-xl bg-slate-800/90 border border-slate-700/90 text-xs sm:text-sm text-slate-200 animate-slide-up">
              <div className="flex items-center gap-2 font-bold text-cyan-400 text-xs uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Academic Advisor</span>
              </div>
              <p className="leading-relaxed">{aiResponse}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Enrolled Courses & Schedule & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Enrolled Courses & Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enrolled Courses Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  Enrolled Courses (Semester 5)
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                {courses.length} Registered
              </span>
            </div>

            {courses.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No courses enrolled yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Course registration opens at semester start.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => (
                  <div
                    key={course._id || course.courseCode}
                    className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/30 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {course.courseCode}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {course.courseName}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {course.description || 'Core undergraduate major credit course'}
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

          {/* Today's Schedule Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  Today's Class Timetable
                </h3>
              </div>
              <a
                href="/student/timetable"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Full Week</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20">
                <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  09:30 AM – 11:00 AM
                </span>
                <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-1.5">
                  Artificial Intelligence & Machine Learning
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  Lab 304 • Dr. Sarah Sharma
                </p>
              </div>

              <div className="p-4 rounded-xl bg-cyan-50/50 dark:bg-cyan-500/5 border border-cyan-100 dark:border-cyan-500/20">
                <span className="text-[11px] font-extrabold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  11:30 AM – 01:00 PM
                </span>
                <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-1.5">
                  Full-Stack Web Engineering
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  Hall B • Prof. Sharma
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Campus Notices */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">Recent Notices</h3>
              </div>
              <a
                href="/student/notices"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                All Notices
              </a>
            </div>

            {notices.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">No new notices posted today.</p>
            ) : (
              <div className="space-y-3">
                {notices.map((n) => (
                  <div
                    key={n._id || n.title}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          n.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400'
                        }`}
                      >
                        {n.priority || 'Notice'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Today'}
                      </span>
                    </div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">{n.title}</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
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

export default StudentDashboard;
