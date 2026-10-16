import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import ProfilePictureModal from '../components/ProfilePictureModal';
import api from '../services/api';
import { User, Mail, Phone, Building, ShieldCheck, CheckCircle2, AlertCircle, Camera, Sparkles } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || 'BCA');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const res = await api.patch('/users/me', { name, phone, department });
      if (res.data.success) {
        updateUser(res.data.user);
        setSuccess('Profile updated successfully!');
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="User Profile & Account Settings"
      subtitle="Manage your identity, avatar, contact channels, and university records."
    >
      <div className="max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm">
        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                alt="Profile Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500/30 shadow-md group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 bg-slate-950/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[2px]">
                <Camera className="w-6 h-6 drop-shadow" />
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-500 transition-transform group-hover:scale-110"
                title="Change Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                  {user?.role}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAvatarModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 self-start sm:self-auto transition-colors shadow-sm"
          >
            <Camera className="w-4 h-4 text-indigo-500" />
            <span>Change Photo</span>
          </button>
        </div>

        {/* Profile Picture Management Dialog */}
        <ProfilePictureModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          currentAvatar={user?.avatar}
          userName={user?.name}
          userRole={user?.role}
          onAvatarUpdated={(updatedUser) => updateUser(updatedUser)}
        />

        <form onSubmit={handleSave} className="space-y-4 pt-6">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
              University Email (Read-Only)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
              Contact Phone
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
              Department
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
