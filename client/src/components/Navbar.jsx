import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Menu,
  Bell,
  Sparkles,
  User,
  LogOut,
  CheckCircle2,
  CheckCheck,
  Clock,
  ArrowRight,
  AlertTriangle,
  Info,
  Calendar,
  Camera,
  Sun,
  Moon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ProfilePictureModal from './ProfilePictureModal';
import api from '../services/api';

const Navbar = ({ onToggleSidebar }) => {
  const { user, role, logout, updateUser } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      if (res.data?.success) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch {
      // Non-blocking telemetry
    }
  };

  // Fetch notification list
  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const res = await api.get('/notifications?limit=6');
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch {
      // Non-blocking
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleToggleNotif = () => {
    if (!notifOpen) {
      fetchNotifications();
    }
    setNotifOpen((prev) => !prev);
    setDropdownOpen(false);
  };

  const handleMarkAsRead = async (id, link) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (link) {
        setNotifOpen(false);
        navigate(link);
      }
    } catch {
      // Fallback
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Fallback
    }
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotifIcon = (type) => {
    switch (type) {
      case 'Attendance':
        return <Calendar className="w-4 h-4 text-cyan-500" />;
      case 'Assignment':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'System':
        return <AlertTriangle className="w-4 h-4 text-indigo-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const noticesPath = role === 'admin' ? '/admin/notices' : role === 'faculty' ? '/faculty/notices' : '/student/notices';

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Left: Mobile Toggle & Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 tracking-wide">
            Academic Session 2026-27
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Intelligent University System
          </span>
        </div>
      </div>

      {/* Right Controls: AI Status, Theme Toggle, Notifications & User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* AI Readiness Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>AI Engine: Active</span>
        </div>

        {/* Dark / Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 relative group"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle Theme"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600 transition-transform duration-300 group-hover:-rotate-12" />
          )}
        </button>

        {/* Notification Icon & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleToggleNotif}
            className={`relative p-2 rounded-xl transition-all duration-200 ${
              notifOpen
                ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="System & Academic Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-md animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-slide-down">
              {/* Header */}
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {loadingNotifs ? (
                  <div className="p-6 text-center text-xs text-slate-400">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">No pending alerts at this time.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => handleMarkAsRead(n._id, n.link)}
                      className={`p-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex gap-3 items-start ${
                        !n.isRead ? 'bg-indigo-50/40 dark:bg-indigo-500/10' : ''
                      }`}
                    >
                      <div className="mt-0.5 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                        {getNotifIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-bold truncate ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                            {n.title}
                          </p>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                          {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Just now'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-center">
                <Link
                  to={noticesPath}
                  onClick={() => setNotifOpen(false)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1.5"
                >
                  <span>View All Campus Notices</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-500/40 transition-all duration-200"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
            />
            <span className="hidden md:block text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
              {user?.name}
            </span>
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-slide-down"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>
              <Link
                to="/profile"
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>My Profile</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  setIsAvatarModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-left transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-indigo-500" />
                <span>Change Photo</span>
              </button>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-medium text-left transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global Profile Picture Management Dialog */}
      <ProfilePictureModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={user?.avatar}
        userName={user?.name}
        userRole={user?.role}
        onAvatarUpdated={(updatedUser) => updateUser(updatedUser)}
      />
    </header>
  );
};

export default Navbar;
