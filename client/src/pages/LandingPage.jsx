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
  Clock,
  Compass,
  Activity
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
        desc: 'Consult your personal AI advisor 24/7 for syllabus clarification, lecture recaps, and exam prep.'
      },
      {
        icon: QrCode,
        title: 'Instant QR Attendance',
        desc: 'Check in to lectures in seconds with dynamic, time-expiring classroom session keys.'
      },
      {
        icon: Library,
        title: 'RAG Document Q&A',
        desc: 'Ask direct questions on uploaded study materials and receive verified page citations.'
      },
      {
        icon: Award,
        title: 'Examinations & GPA Ledger',
        desc: 'Real-time grade reports, GPA calculations, and automated academic standing metrics.'
      }
    ],
    faculty: [
      {
        icon: QrCode,
        title: 'Dynamic QR Attendance',
        desc: 'Generate rotating QR codes for classroom sessions with real-time student check-in telemetry.'
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#080B16] text-slate-900 dark:text-[#F3F6FF] selection:bg-[#6C8CFF] selection:text-white transition-colors duration-200 overflow-x-hidden relative bg-tech-grid">
      {/* Ambient Moving Gradient Lights */}
      <div className="fixed inset-0 pointer-events-none -z-0 overflow-hidden">
        {/* Blue Radial Glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-gradient-to-b from-[#6C8CFF]/15 via-[#43D9FF]/10 to-transparent rounded-full blur-3xl animate-pulse-slow" />
        {/* Cyan Ambient Field */}
        <div className="absolute top-1/3 -left-48 w-[450px] h-[450px] bg-[#43D9FF]/10 rounded-full blur-3xl" />
        {/* Soft Violet Field */}
        <div className="absolute bottom-1/4 -right-48 w-[500px] h-[500px] bg-[#A78BFA]/10 rounded-full blur-3xl" />

        {/* Sparse Ambient Particles */}
        <div className="ambient-particle top-24 left-[15%] w-2 h-2 bg-[#43D9FF] shadow-[0_0_12px_#43D9FF]" />
        <div className="ambient-particle top-48 right-[20%] w-1.5 h-1.5 bg-[#6C8CFF] shadow-[0_0_10px_#6C8CFF]" style={{ animationDelay: '2s' }} />
        <div className="ambient-particle top-[55%] left-[8%] w-2 h-2 bg-[#A78BFA] shadow-[0_0_12px_#A78BFA]" style={{ animationDelay: '4s' }} />
        <div className="ambient-particle top-[70%] right-[12%] w-1.5 h-1.5 bg-[#43D9FF] shadow-[0_0_10px_#43D9FF]" style={{ animationDelay: '6s' }} />
      </div>

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-[#0D1224]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-[#232D48]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6C8CFF] via-[#5575F5] to-[#43D9FF] flex items-center justify-center text-white shadow-lg shadow-[#6C8CFF]/25 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">SmartCampus</span>
              <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#6C8CFF]/15 dark:bg-[#43D9FF]/15 text-[#6C8CFF] dark:text-[#43D9FF] border border-[#6C8CFF]/25 dark:border-[#43D9FF]/25">
                AI 6.0
              </span>
            </div>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-[#9BA8C7]">
            <a href="#features" className="hover:text-[#6C8CFF] dark:hover:text-white transition-colors">Platform Capabilities</a>
            <a href="#modules" className="hover:text-[#6C8CFF] dark:hover:text-white transition-colors">Role Workspaces</a>
            <a href="#ai-ecosystem" className="hover:text-[#6C8CFF] dark:hover:text-white transition-colors">RAG & AI Intelligence</a>
            <a href="#telemetry" className="hover:text-[#6C8CFF] dark:hover:text-white transition-colors">System Telemetry</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-[#9BA8C7] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#18233B] transition-colors"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => navigate(getDashboardPath())}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6C8CFF] to-[#5575F5] hover:brightness-110 text-white text-xs font-bold shadow-md shadow-[#6C8CFF]/30 transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-[#F3F6FF] hover:bg-slate-100 dark:hover:bg-[#18233B] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6C8CFF] to-[#5575F5] hover:brightness-110 text-white text-xs font-bold shadow-md shadow-[#6C8CFF]/30 transition-all hover:scale-[1.02]"
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#6C8CFF]/10 dark:bg-[#6C8CFF]/15 border border-[#6C8CFF]/25 text-[#6C8CFF] dark:text-[#8FA8FF] text-xs font-semibold mb-6 animate-fade-in shadow-sm backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-[#43D9FF] animate-pulse" />
          <span>Intelligent University Management & Support Platform</span>
          <span className="w-1 h-1 rounded-full bg-[#6C8CFF]"></span>
          <span className="text-[11px] font-bold text-[#43D9FF]">Phases 1–6 Operational</span>
        </div>

        {/* Master Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
          The Future of <br />
          <span className="gradient-text-primary">Campus Intelligence.</span>
        </h1>

        {/* Master Supporting Text */}
        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-[#9BA8C7] max-w-2xl mx-auto font-normal leading-relaxed">
          Connect learning, campus operations, academic insights, and AI-powered student support in one intelligent platform.
        </p>

        {/* Primary Call to Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/login"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#6C8CFF] via-[#5575F5] to-[#43D9FF] hover:brightness-110 text-white text-sm font-bold shadow-xl shadow-[#6C8CFF]/30 hover:shadow-[#6C8CFF]/50 hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>Launch SmartCampus Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white dark:bg-[#121A2E] border border-slate-200 dark:border-[#232D48] text-slate-700 dark:text-[#F3F6FF] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-[#6C8CFF]/40 text-sm font-semibold shadow-sm hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>Explore Capabilities</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </a>
        </div>

        {/* Interactive Dashboard Mockup Preview */}
        <div className="mt-14 sm:mt-18 relative mx-auto max-w-5xl group">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#6C8CFF] via-[#43D9FF] to-[#A78BFA] opacity-25 blur-xl group-hover:opacity-40 transition-opacity duration-500" />
          
          <div className="relative rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-[#232D48] bg-white/95 dark:bg-[#0D1224]/95 backdrop-blur-2xl shadow-2xl p-4 sm:p-6 text-left overflow-hidden">
            {/* Mockup Window Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#18233B]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span className="ml-3 text-[11px] font-semibold text-slate-400 dark:text-[#9BA8C7]">smartcampus.edu / portal / overview</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  ● Cluster Healthy (Port 80/5000/8000)
                </span>
              </div>
            </div>

            {/* Mockup Dashboard Content Grid */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Stat 1 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#121A2E] border border-slate-200/70 dark:border-[#232D48]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9BA8C7]">Attendance Compliance</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">88.5%</p>
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">✓ Examination Eligible</p>
              </div>

              {/* Stat 2 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#121A2E] border border-slate-200/70 dark:border-[#232D48]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9BA8C7]">Current CGPA</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">8.75</p>
                <p className="text-[10px] font-bold text-[#6C8CFF] dark:text-[#8FA8FF] mt-1">Scale of 10.0</p>
              </div>

              {/* Stat 3 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#121A2E] border border-slate-200/70 dark:border-[#232D48]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9BA8C7]">Semester Curriculum</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">6 Courses</p>
                <p className="text-[10px] font-bold text-[#43D9FF] mt-1">Semester 5 Regular</p>
              </div>

              {/* Stat 4 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#121A2E] border border-slate-200/70 dark:border-[#232D48]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9BA8C7]">AI Risk Diagnostic</p>
                <p className="text-2xl font-black text-emerald-500 mt-1">Low Risk</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-[#9BA8C7] mt-1">RandomForest (99.8%)</p>
              </div>
            </div>

            {/* AI Assistant Banner Inside Mockup */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#080B16] via-[#121A2E] to-[#0D1224] border border-[#6C8CFF]/20 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#43D9FF]/20 text-[#43D9FF] flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">SmartCampus AI Advisor & RAG Document Assistant</p>
                  <p className="text-[11px] text-slate-300 dark:text-[#9BA8C7]">"What are the core units in BCA-501 Artificial Intelligence?"</p>
                </div>
              </div>
              <div className="text-[11px] font-bold text-[#43D9FF] px-3 py-1 rounded-lg bg-[#43D9FF]/10 border border-[#43D9FF]/30">
                Grounding: Syllabus.pdf #P4
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES SECTION */}
      <section id="features" className="py-20 bg-white/60 dark:bg-[#0D1224]/60 border-y border-slate-200/70 dark:border-[#232D48] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#6C8CFF] dark:text-[#43D9FF] mb-2">
              End-to-End Capabilities
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Built for the Future of Higher Education
            </p>
            <p className="mt-3 text-sm text-slate-600 dark:text-[#9BA8C7]">
              Integrated campus management powered by high-speed APIs, machine learning risk engines, and vector document retrieval.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121A2E] border border-slate-200/80 dark:border-[#232D48] hover:border-[#6C8CFF]/50 hover:shadow-glow-blue transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#6C8CFF]/10 text-[#6C8CFF] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Smart QR Attendance</h3>
              <p className="text-xs text-slate-600 dark:text-[#9BA8C7] leading-relaxed">
                Dynamic, anti-proxy QR session generation with real-time countdown, automatic closing, and instant compliance calculation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121A2E] border border-slate-200/80 dark:border-[#232D48] hover:border-[#43D9FF]/50 hover:shadow-glow-cyan transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#43D9FF]/10 text-[#43D9FF] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">AI Academic Advisor</h3>
              <p className="text-xs text-slate-600 dark:text-[#9BA8C7] leading-relaxed">
                Conversational assistant with direct context of student timetable, deadlines, attendance standing, and university regulations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121A2E] border border-slate-200/80 dark:border-[#232D48] hover:border-[#A78BFA]/50 hover:shadow-glow-violet transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#A78BFA]/10 text-[#A78BFA] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Library className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">RAG Document Q&A</h3>
              <p className="text-xs text-slate-600 dark:text-[#9BA8C7] leading-relaxed">
                Retrieval-Augmented Generation indexes course notes, lab guides, and slides with authentic source citations and page numbers.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121A2E] border border-slate-200/80 dark:border-[#232D48] hover:border-amber-500/40 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Examinations & GPA Ledger</h3>
              <p className="text-xs text-slate-600 dark:text-[#9BA8C7] leading-relaxed">
                Automated grade computation (O, A+, A, B+, B, C, P, F) with cumulative grade point average (CGPA) weighting and transcript views.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121A2E] border border-slate-200/80 dark:border-[#232D48] hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">ML Early Intervention</h3>
              <p className="text-xs text-slate-600 dark:text-[#9BA8C7] leading-relaxed">
                Random Forest predictive modeling detects academic risk factors early, giving professors actionable interventions before finals.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121A2E] border border-slate-200/80 dark:border-[#232D48] hover:border-[#6C8CFF]/50 hover:shadow-glow-blue transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#6C8CFF]/10 text-[#6C8CFF] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Role-Based Access Control</h3>
              <p className="text-xs text-slate-600 dark:text-[#9BA8C7] leading-relaxed">
                Rigorous security layers separate Student, Faculty, and Admin roles, protecting sensitive university records and grades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ROLE PORTAL HIGHLIGHTS TABS */}
      <section id="modules" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#6C8CFF] dark:text-[#43D9FF] mb-2">
            Tailored Experiences
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Designed for Every Campus Role
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/80 dark:bg-[#0D1224] border border-slate-200 dark:border-[#232D48]">
            <button
              onClick={() => setActiveTab('student')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'student'
                  ? 'bg-[#6C8CFF] text-white shadow-md shadow-[#6C8CFF]/30'
                  : 'text-slate-600 dark:text-[#9BA8C7] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Workspace</span>
            </button>
            <button
              onClick={() => setActiveTab('faculty')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'faculty'
                  ? 'bg-[#43D9FF] text-slate-950 shadow-md shadow-[#43D9FF]/30'
                  : 'text-slate-600 dark:text-[#9BA8C7] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Faculty Command</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'text-slate-600 dark:text-[#9BA8C7] hover:text-slate-900 dark:hover:text-white'
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
                className="p-6 rounded-2xl bg-white dark:bg-[#121A2E] border border-slate-200/80 dark:border-[#232D48] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#18233B] flex items-center justify-center text-slate-800 dark:text-white mb-4">
                  <Icon className="w-5 h-5 text-[#6C8CFF]" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">{item.title}</h4>
                <p className="text-xs text-slate-500 dark:text-[#9BA8C7] leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* TELEMETRY & SYSTEM BENCHMARKS */}
      <section id="telemetry" className="py-16 bg-slate-100/70 dark:bg-[#0D1224]/80 border-t border-slate-200 dark:border-[#232D48]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-black text-[#6C8CFF]">99.8%</p>
              <p className="text-xs font-semibold text-slate-600 dark:text-[#9BA8C7] mt-1">Platform Service Uptime</p>
            </div>
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-black text-[#43D9FF]">&lt; 350ms</p>
              <p className="text-xs font-semibold text-slate-600 dark:text-[#9BA8C7] mt-1">AI Inference Latency</p>
            </div>
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-black text-[#A78BFA]">100%</p>
              <p className="text-xs font-semibold text-slate-600 dark:text-[#9BA8C7] mt-1">Paperless Attendance & Grading</p>
            </div>
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-black text-emerald-500">47 / 47</p>
              <p className="text-xs font-semibold text-slate-600 dark:text-[#9BA8C7] mt-1">Automated Tests Passed</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center z-10 relative">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#0D1224] via-[#121A2E] to-[#0D1224] text-white border border-[#6C8CFF]/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#43D9FF]/15 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            The Future of Campus Intelligence.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 dark:text-[#9BA8C7] max-w-xl mx-auto mb-8">
            Connect learning, campus operations, academic insights, and AI-powered student support in one intelligent platform.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#6C8CFF] to-[#43D9FF] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#6C8CFF]/25 transition-all"
            >
              Enter SmartCampus AI
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 border-t border-slate-200/80 dark:border-[#232D48] text-center text-xs text-slate-500 dark:text-[#9BA8C7]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#6C8CFF]" />
            <span className="font-bold text-slate-700 dark:text-white">SmartCampus AI</span>
            <span>• Intelligent University Management</span>
          </div>
          <p>© 2026 SmartCampus AI. All rights reserved. Architecture Phases 1–6 Certified.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
