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
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();

  // Role-specific navigation links
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

  const getRoleBadgeColor = () => {
    switch (role) {
      case 'admin':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'faculty':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight">SmartCampus</span>
              <span className="ml-1 text-xs font-bold text-teal-400 uppercase tracking-wider">AI</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Card */}
        <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
            alt="User avatar"
            className="w-10 h-10 rounded-full object-cover border border-slate-600"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Campus Member'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${getRoleBadgeColor()}`}>
                {role || 'Student'}
              </span>
              <span className="text-[11px] text-slate-400 truncate">{user?.department || 'BCA'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Main Navigation
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
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Logout Footer */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
