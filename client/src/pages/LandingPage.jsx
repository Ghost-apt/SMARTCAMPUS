import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Bot,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Users,
  QrCode,
  BookOpen,
  Award,
  BarChart3,
  CheckCircle2,
  CalendarCheck,
  FileText,
  Library,
  Sun,
  Moon,
  Zap,
  Cpu,
  Layers,
  ChevronRight,
  Clock
} from 'lucide-react';

const LandingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('student');

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'faculty') return '/faculty/dashboard';
    return '/student/dashboard';
  };

  const roleFeatures = {
    student: [
      {
        icon: Bot,
        title: 'AI Academic Assistant',
        desc: 'Consult your personal AI tutor 24/7 for syllabus questions, lecture recaps, and exam prep.'
      },
      {
        icon: QrCode,
        title: 'Instant QR Attendance',
        desc: 'Check in to lectures in seconds with dynamic time-expiring session codes.'
      },
      {
        icon: Library,
        title: 'RAG Document Q&A',
        desc: 'Ask questions on uploaded lecture PDFs and receive answers with verified page citations.'
      },
      {
        icon: Award,
        title: 'Examinations & GPA Ledger',
        desc: 'Instant grade reports, GPA calculations, and automated academic standing metrics.'
      }
    ],
    faculty: [
      {
        icon: QrCode,
        title: 'Dynamic QR Attendance',
        desc: 'Generate secure, rotating QR codes for classroom sessions with real-time student check-in telemetry.'
      },
      {
        icon: Cpu,
        title: 'Early Support Analytics',
        desc: 'Automated machine learning risk diagnostics identify at-risk students before final exams.'
      },
      {
        icon: BookOpen,
        title: 'RAG Study Material Indexing',
        desc: 'Upload lecture slides and syllabus notes to automatically index vectors for student retrieval.'
      },
      {
        icon: FileText,
        title: 'Assignment & Grading Hub',
        desc: 'Publish coursework, track submissions, and grade assignments with feedback.'
      }
    ],
    admin: [
      {
        icon: BarChart3,
        title: 'Executive Campus Analytics',
        desc: 'Real-time telemetry across attendance compliance, faculty teaching loads, and department metrics.'
      },
      {
        icon: Users,
        title: 'Unified User Management',
        desc: 'Full role-based access control for students, faculty, and departmental staff.'
      },
      {
        icon: ShieldCheck,
        title: 'Enterprise Security & Audit',
        desc: 'JWT session tokens, helmet security headers, rate limiting, and encrypted storage.'
      },
      {
        icon: Layers,
        title: 'Automated Database Backups',
        desc: 'Scheduled JSON backups with point-in-time disaster recovery and demo database seeding.'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1020] text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200 overflow-x-hidden">
      {/* Background Glows & Grid */}
      <div className="fixed inset-0 pointer-events-none -z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-indigo-500/15 via-violet-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">SmartCampus</span>
              <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/10 dark:bg-cyan-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-500/20 dark:border-cyan-500/20">
                AI 6.0
              </span>
            </div>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Features</a>
            <a href="#modules" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Roles & Portals</a>
            <a href="#ai-ecosystem" className="hover:text-indigo-600 dark:hover:text-white transition-colors">AI & RAG Engine</a>
            <a href="#telemetry" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Architecture</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => navigate(getDashboardPath())}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all"
                >
                  <span>Launch Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center z-10">
        {/* Release Tag Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-semibold mb-6 animate-fade-in shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          <span>Next-Generation Intelligent University Platform</span>
          <span className="w-1 h-1 rounded-full bg-indigo-400"></span>
          <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400">Phases 1–6 Live</span>
        </div>

        {/* Main Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
          Your Campus. <br />
          <span className="gradient-text-primary">Smarter Than Ever.</span>
        </h1>

        {/* Supporting Subtext */}
        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          One intelligent platform for students, faculty, and administrators — powered by connected campus management, real-time insights, and AI assistance.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/login"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>Launch SmartCampus Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 text-sm font-semibold shadow-sm hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>Explore Modules</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </a>
        </div>

        {/* Hero Interactive Dashboard Mockup Preview */}
        <div className="mt-14 sm:mt-18 relative mx-auto max-w-5xl group">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500 via-cyan-400 to-violet-600 opacity-25 blur-xl group-hover:opacity-40 transition-opacity duration-500" />
          
          <div className="relative rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl shadow-2xl p-4 sm:p-6 text-left overflow-hidden">
            {/* Mockup Window Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span className="ml-3 text-[11px] font-semibold text-slate-400">smartcampus.edu / portal / overview</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  ● Systems Operational
                </span>
              </div>
            </div>

            {/* Mockup Dashboard Content Grid */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Stat 1 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/60">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attendance Standing</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">88.5%</p>
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">✓ Exam Eligible</p>
              </div>

              {/* Stat 2 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/60">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cumulative GPA</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">8.75</p>
                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-1">Top 10% Cohort</p>
              </div>

              {/* Stat 3 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/60">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Courses</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">6 Registered</p>
                <p className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 mt-1">Semester 5 Active</p>
              </div>

              {/* Stat 4 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/60">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Risk Diagnostic</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">Low Risk</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1">RandomForest (99.8%)</p>
              </div>
            </div>

            {/* AI Assistant Banner Inside Mockup */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">SmartCampus AI Advisor & RAG Document Assistant</p>
                  <p className="text-[11px] text-slate-300">"What are the core units in BCA-501 Artificial Intelligence?"</p>
                </div>
              </div>
              <div className="text-[11px] font-bold text-cyan-400 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                Grounding: Syllabus.pdf #P4
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE MODULES SECTION */}
      <section id="features" className="py-20 bg-white/60 dark:bg-slate-950/60 border-y border-slate-200/70 dark:border-slate-800/70 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-cyan-400 mb-2">
              End-to-End Capabilities
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Built for the Future of Higher Education
            </p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Integrated campus management powered by high-speed APIs, machine learning risk engines, and vector document retrieval.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/40 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Smart QR Attendance</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Dynamic, anti-proxy QR session generation with real-time countdown, automatic closing, and instant compliance calculation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-500/40 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">AI Academic Advisor</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Conversational assistant with direct context of student timetable, deadlines, attendance standing, and university regulations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 hover:border-violet-500/40 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Library className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">RAG Document Q&A</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Retrieval-Augmented Generation indexes course notes, lab guides, and slides with authentic source citations and page numbers.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/40 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Examinations & GPA Ledger</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Automated grade computation (O, A+, A, B+, B, C, P, F) with cumulative grade point average (CGPA) weighting and transcript views.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">ML Early Intervention</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Random Forest predictive modeling detects academic risk factors early, giving professors actionable interventions before finals.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/40 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Role-Based Access Control</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Rigorous security layers separate Student, Faculty, and Admin roles, protecting sensitive university records and grades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ROLE PORTAL HIGHLIGHTS TABS */}
      <section id="modules" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-cyan-400 mb-2">
            Tailored Experiences
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Designed for Every Campus Role
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('student')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'student'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Workspace</span>
            </button>
            <button
              onClick={() => setActiveTab('faculty')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'faculty'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Faculty Command</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'admin'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Operations</span>
            </button>
          </div>
        </div>

        {/* Tab Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {roleFeatures[activeTab].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-white mb-4">
                  <Icon className="w-5 h-5 text-indigo-500" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">{item.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* TELEMETRY & SYSTEM BENCHMARKS */}
      <section id="telemetry" className="py-16 bg-slate-100/70 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400">99.8%</p>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Platform Service Uptime</p>
            </div>
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-black text-cyan-600 dark:text-cyan-400">&lt; 350ms</p>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">AI Inference Latency</p>
            </div>
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-black text-violet-600 dark:text-violet-400">100%</p>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Paperless Attendance & Grading</p>
            </div>
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">47 / 47</p>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Automated Tests Passed</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center z-10 relative">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white border border-indigo-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Ready to experience the future of university operations?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8">
            Access your role dashboard today. Seamless, automated, and powered by verified academic AI.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-cyan-400/20 transition-all"
            >
              Enter SmartCampus
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300">SmartCampus AI</span>
            <span>• Intelligent University Management</span>
          </div>
          <p>© 2026 SmartCampus AI. All rights reserved. Architecture Phases 1–6 Certified.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
