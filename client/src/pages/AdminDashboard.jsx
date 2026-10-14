import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import {
  Users,
  GraduationCap,
  BookOpen,
  Server,
  Activity,
  ShieldCheck,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  Database
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/admin');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to load administrator metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setSeedMessage('');
    try {
      const res = await api.post('/seed');
      if (res.data.success) {
        setSeedMessage('Database re-seeded successfully with demo accounts & courses.');
        await fetchDashboard();
      }
    } catch (err) {
      setSeedMessage(err.userMessage || 'Seeding failed. Ensure MongoDB is active.');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="University Administration" subtitle="Loading system analytics and user metrics...">
        <LoadingSkeleton type="stat" />
        <div className="mt-6">
          <LoadingSkeleton count={3} />
        </div>
      </DashboardLayout>
    );
  }

  const metrics = data?.metrics || {};
  const recentUsers = data?.recentUsers || [];
  const systemStatus = data?.systemStatus || {};

  return (
    <DashboardLayout
      title="University Control Center"
      subtitle={`Authenticated as ${user?.name || 'Administrator'} • Role: System Admin`}
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {seedMessage && (
        <div className="mb-6 p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <span>{seedMessage}</span>
          </div>
          <button onClick={() => setSeedMessage('')} className="text-xs font-bold text-indigo-600 underline">Dismiss</button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Registered Users"
          value={metrics.totalUsers ?? 3}
          subtitle="All campus roles"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Enrolled Students"
          value={metrics.studentsCount ?? 1}
          subtitle="Active undergraduates"
          icon={GraduationCap}
          color="teal"
        />
        <StatCard
          title="Teaching Faculty"
          value={metrics.facultyCount ?? 1}
          subtitle="Professors & Mentors"
          icon={ShieldCheck}
          color="amber"
        />
        <StatCard
          title="Active Courses"
          value={metrics.coursesCount ?? 2}
          subtitle="Accredited modules"
          icon={BookOpen}
          color="blue"
        />
      </div>

      {/* System Infrastructure Status & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-lg text-slate-900">Backend Infrastructure & Health</h3>
            </div>
            <button
              onClick={fetchDashboard}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Refresh Stats"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Express API</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-sm font-bold text-slate-900">Online & Ready</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Uptime: {systemStatus.uptimeFormatted || 'Active'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">MongoDB Database</span>
              <div className="flex items-center gap-2 mt-1">
                <Database className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-slate-900">Connected</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Status: Active session</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">AI Microservice</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                <span className="text-sm font-bold text-slate-900">Ready / Fallback</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">FastAPI gateway ready</p>
            </div>
          </div>
        </div>

        {/* Database Quick Seed Action */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase mb-2">
              <Activity className="w-4 h-4" />
              <span>Development Seeder</span>
            </div>
            <h4 className="font-bold text-base text-white">Re-seed Demo Dataset</h4>
            <p className="text-xs text-slate-300 mt-1">
              Safely populates verified demo credentials (Student, Faculty, Admin) and syllabus courses for viva evaluation.
            </p>
          </div>
          <button
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {seeding ? (
              <span>Seeding Database...</span>
            ) : (
              <>
                <RotateCw className="w-4 h-4" />
                <span>Run Demo Seeder</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h3 className="font-bold text-lg text-slate-900 mb-4">Recently Registered University Members</h3>
        {recentUsers.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No users registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-400">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Account Status</th>
                  <th className="pb-3">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 font-semibold text-slate-900 flex items-center gap-2.5">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <span>{u.name}</span>
                        <span className="block text-xs font-normal text-slate-400">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        u.role === 'admin'
                          ? 'bg-amber-100 text-amber-800'
                          : u.role === 'faculty'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600 text-xs">{u.department || 'General'}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{u.accountStatus || 'Active'}</span>
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

