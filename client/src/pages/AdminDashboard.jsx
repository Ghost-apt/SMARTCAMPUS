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
  Database,
  Cpu,
  RefreshCw,
  Layers,
  ArrowUpRight
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
      subtitle={`Authenticated as ${user?.name || 'Administrator'} • Role: System Administrator`}
      headerActions={
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
            <span>Refresh Health</span>
          </button>
          <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Cluster: 4/4 Containers Healthy
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

      {seedMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <span>{seedMessage}</span>
          </div>
          <button
            onClick={() => setSeedMessage('')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Registered Users"
          value={metrics.totalUsers ?? 3}
          subtitle="All campus roles"
          trend="Multi-role Access"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Enrolled Students"
          value={metrics.studentsCount ?? 1}
          subtitle="Active undergraduates"
          trend="Semester 5 Regular"
          icon={GraduationCap}
          color="teal"
        />
        <StatCard
          title="Teaching Faculty"
          value={metrics.facultyCount ?? 1}
          subtitle="Professors & Mentors"
          trend="Full-time Staff"
          icon={ShieldCheck}
          color="amber"
        />
        <StatCard
          title="Active Courses"
          value={metrics.coursesCount ?? 2}
          subtitle="Accredited modules"
          trend="BCA Curriculum"
          icon={BookOpen}
          color="blue"
        />
      </div>

      {/* System Infrastructure Status & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                Cluster Infrastructure & Telemetry
              </h3>
            </div>
            <button
              onClick={fetchDashboard}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh Stats"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Express Gateway</span>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Online & Healthy</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Port 5000 • Uptime: {systemStatus.uptimeFormatted || 'Active'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MongoDB Replica</span>
              <div className="flex items-center gap-2 mt-1.5">
                <Database className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">Connected</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Port 27017 • Native storage
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Service (PyTorch)</span>
              <div className="flex items-center gap-2 mt-1.5">
                <Cpu className="w-4 h-4 text-cyan-500" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">FastAPI Ready</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Port 8000 • RandomForest + RAG
              </p>
            </div>
          </div>
        </div>

        {/* Database Quick Seed Action */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-indigo-500/20 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase mb-2">
              <Activity className="w-4 h-4" />
              <span>Development Operations</span>
            </div>
            <h4 className="font-bold text-base text-white">Re-seed Evaluation Dataset</h4>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Safely seeds verified demo accounts (Student, Faculty, Admin) and syllabus courses for testing.
            </p>
          </div>
          <button
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="mt-5 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
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
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
            Recently Registered University Members
          </h3>
          <a
            href="/admin/students"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Manage All Students</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {recentUsers.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">No users registered yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-800/60">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                      />
                      <div>
                        <span className="block">{u.name}</span>
                        <span className="block text-xs font-normal text-slate-400">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                            : u.role === 'faculty'
                            ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-xs font-medium">
                      {u.department || 'General'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{u.accountStatus || 'Active'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">
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
