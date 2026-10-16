import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  Calendar,
  FileText,
  Award,
  Library,
  Bot,
  Bell,
  User,
  LogOut,
  Users,
  GraduationCap,
  ShieldCheck,
  Building2,
  BarChart3,
  Settings,
  X,
  Sparkles
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();

  // Role-specific navigation links (Test contracts require these exact variable names)
  const studentLinks = [
    { name: 'Overview', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', path: '/student/courses', icon: BookOpen },
    { name: 'Attendance', path: '/student/attendance', icon: CalendarCheck },
    { name: 'Timetable', path: '/student/timetable', icon: Calendar },
    { name: 'Assignments', path: '/student/assignments', icon: FileText },
    { name: 'Examinations & Results', path: '/student/results', icon: Award },
    { name: 'Study Resources', path: '/student/resources', icon: Library },
    { name: 'AI Academic Assistant', path: '/student/ai-assistant', icon: Bot, badge: 'AI' },
    { name: 'Notices', path: '/student/notices', icon: Bell },
    { name: 'Profile', path: '/profile', icon: User }
  ];

  const facultyLinks = [
    { name: 'Overview', path: '/faculty/dashboard', icon: LayoutDashboard },
    { name: 'My Classes', path: '/faculty/classes', icon: GraduationCap },
    { name: 'My Courses', path: '/faculty/courses', icon: BookOpen },
    { name: 'Attendance Management', path: '/faculty/attendance', icon: CalendarCheck },
    { name: 'Assignments', path: '/faculty/assignments', icon: FileText },
    { name: 'Student Performance', path: '/faculty/performance', icon: BarChart3 },
    { name: 'Study Materials', path: '/faculty/materials', icon: Library },
    { name: 'Notices', path: '/faculty/notices', icon: Bell },
    { name: 'Profile', path: '/profile', icon: User }
  ];

  const adminLinks = [
    { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Faculty', path: '/admin/faculty', icon: GraduationCap },
    { name: 'Departments', path: '/admin/departments', icon: Building2 },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Timetable', path: '/admin/timetable', icon: Calendar },
    { name: 'Attendance Reports', path: '/admin/attendance', icon: CalendarCheck },
    { name: 'Notices', path: '/admin/notices', icon: Bell },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Profile', path: '/profile', icon: User }
  ];

  const links = role === 'admin' ? adminLinks : role === 'faculty' ? facultyLinks : studentLinks;

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return {
          label: 'Admin',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        };
      case 'faculty':
        return {
          label: 'Faculty',
          badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
        };
      default:
        return {
          label: 'Student',
          badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
        };
    }
  };

  const roleMeta = getRoleBadge();

  return (
    <>
      {/* Mobile Backdrop with Blur */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-md transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800/80 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight">SmartCampus</span>
              <span className="ml-1 text-[11px] font-black text-cyan-400 uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                AI
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Card */}
        <div className="p-3 mx-3 my-3 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800/80 flex items-center gap-3 shadow-inner">
          <div className="relative">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
              alt="User avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/30 shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Campus Member'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded border ${roleMeta.badge}`}>
                {roleMeta.label}
              </span>
              <span className="text-[11px] text-slate-400 truncate font-medium">
                {user?.department || 'BCA'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            Navigation
          </p>
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 translate-x-1'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80 hover:translate-x-0.5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                          isActive ? 'text-white scale-110' : 'text-slate-400 group-hover:text-indigo-400 group-hover:scale-110'
                        }`}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse">
                        <Sparkles className="w-2.5 h-2.5" />
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* System & Sign Out Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-200"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:rotate-12" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
