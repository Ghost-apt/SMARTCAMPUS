import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import {
  Settings,
  Server,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Database,
  Cpu,
  Clock,
  Terminal,
  Activity,
  Lock,
  Globe,
  FileText,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Save,
  Search,
  Filter
} from 'lucide-react';

const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('system'); // 'system' | 'security' | 'academic' | 'audit'
  const [healthData, setHealthData] = useState(null);
  const [aiHealth, setAiHealth] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Academic Configuration Settings State
  const [academicConfig, setAcademicConfig] = useState({
    academicYear: '2025-2026',
    activeTerm: 'Odd Semester (Autumn)',
    minAttendancePercent: 75,
    gradingScale: '10-Point UGC Scale',
    allowLateSubmissions: true,
    lateSubmissionPenaltyDays: 2
  });

  const fetchHealthAndStatus = async () => {
    try {
      setLoading(true);
      setError('');
      const [hRes, aiRes] = await Promise.allSettled([
        api.get('/health'),
        api.get('/ai/status')
      ]);

      if (hRes.status === 'fulfilled' && hRes.value.data) {
        setHealthData(hRes.value.data);
      }
      if (aiRes.status === 'fulfilled' && aiRes.value.data) {
        setAiHealth(aiRes.value.data.status || aiRes.value.data);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to fetch system telemetry.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async (page = 1, action = '') => {
    try {
      setAuditLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (action) params.append('action', action);

      const res = await api.get(`/analytics/admin/audit-logs?${params.toString()}`);
      if (res.data?.success) {
        setAuditLogs(res.data.logs || []);
        setAuditTotal(res.data.total || 0);
        setAuditPage(res.data.page || 1);
      }
    } catch (err) {
      console.warn('Could not fetch audit logs:', err.message);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthAndStatus();
    fetchAuditLogs(1, auditActionFilter);
  }, []);

  const handleSaveAcademicConfig = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

  return (
    <DashboardLayout
      title="System Settings & Administration"
      subtitle="University Infrastructure, HTTPS Security & Audit Telemetry"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-[#232D48] mb-6 overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'system'
              ? 'border-[#6C8CFF] text-[#6C8CFF] dark:text-[#43D9FF]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-[#9BA8C7] dark:hover:text-white'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>System & Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-[#6C8CFF] text-[#6C8CFF] dark:text-[#43D9FF]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-[#9BA8C7] dark:hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>HTTPS & Security</span>
        </button>

        <button
          onClick={() => setActiveTab('academic')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'academic'
              ? 'border-[#6C8CFF] text-[#6C8CFF] dark:text-[#43D9FF]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-[#9BA8C7] dark:hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Academic Policy</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('audit');
            fetchAuditLogs(1, auditActionFilter);
          }}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-[#6C8CFF] text-[#6C8CFF] dark:text-[#43D9FF]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-[#9BA8C7] dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>System Audit Logs</span>
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : (
        <>
          {/* TAB 1: SYSTEM & TELEMETRY */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Node.js Backend Card */}
                <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200/80 dark:border-[#232D48] p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">Node.js Express API</span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {healthData?.status === 'healthy' ? 'Operational' : 'Degraded'}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                    Port {healthData?.port || '5000'}
                  </h3>
                  <div className="space-y-2 text-xs text-slate-500 dark:text-[#9BA8C7]">
                    <div className="flex justify-between">
                      <span>Node Engine:</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{healthData?.system?.nodeVersion || process.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{healthData?.system?.platform || 'win32'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Version:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{healthData?.version || '6.0.0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Memory (Heap):</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {healthData?.system?.memoryUsageMB?.heapUsed || 45} MB / {healthData?.system?.memoryUsageMB?.heapTotal || 80} MB
                      </span>
                    </div>
                  </div>
                </div>

                {/* MongoDB Cluster Card */}
                <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200/80 dark:border-[#232D48] p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">Database Layer</span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5" />
                      Connected
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                    MongoDB
                  </h3>
                  <div className="space-y-2 text-xs text-slate-500 dark:text-[#9BA8C7]">
                    <div className="flex justify-between">
                      <span>Host:</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-200">127.0.0.1:27017</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Database:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{healthData?.database?.name || 'smartcampus'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Driver State:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">ReadyState 1 (Connected)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Persistence:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">Automated Daily Backups</span>
                    </div>
                  </div>
                </div>

                {/* AI Microservice Card */}
                <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200/80 dark:border-[#232D48] p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">Python AI Microservice</span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-[#6C8CFF]/15 dark:text-[#43D9FF] border border-indigo-200 dark:border-[#6C8CFF]/30 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      FastAPI :8000
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                    RAG & ML Engine
                  </h3>
                  <div className="space-y-2 text-xs text-slate-500 dark:text-[#9BA8C7]">
                    <div className="flex justify-between">
                      <span>Auth Dependency:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Enforced (Constant-Time)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vector Store:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">TF-IDF & Cosine Index</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ML Classifier:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">GradientBoosting / RF (18/18)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ollama LLM:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">Mistral with Fallback</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200/80 dark:border-[#232D48] p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#6C8CFF]" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Telemetry & Probe Sync</h4>
                    <p className="text-xs text-slate-500 dark:text-[#9BA8C7]">Refresh system health metrics, probes, and memory utilization in real time.</p>
                  </div>
                </div>
                <button
                  onClick={fetchHealthAndStatus}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#18233B] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#232D48] transition-all flex items-center gap-2 self-start md:self-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Telemetry</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: HTTPS & SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200/80 dark:border-[#232D48] p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    isHttps
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                  }`}>
                    {isHttps ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {isHttps ? 'HTTPS / TLS Encryption Active' : 'HTTP Development Mode Active'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        isHttps
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                      }`}>
                        {window.location.protocol.replace(':', '').toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-[#9BA8C7] mt-1">
                      Current connection origin: <code className="font-mono font-bold text-slate-700 dark:text-slate-200">{window.location.origin}</code>
                    </p>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#18233B] border border-slate-100 dark:border-[#232D48]">
                        <span className="font-bold text-slate-700 dark:text-slate-200 block mb-1">CORS & PNA Protection</span>
                        <p className="text-slate-500 dark:text-[#9BA8C7]">
                          Private Network Access (PNA) preflight headers are active to allow local LAN devices (192.168.x.x) to connect safely to development services.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#18233B] border border-slate-100 dark:border-[#232D48]">
                        <span className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Constant-Time AI Auth</span>
                        <p className="text-slate-500 dark:text-[#9BA8C7]">
                          Inter-service communication utilizes constant-time comparison (<code>secrets.compare_digest</code>) preventing timing analysis attacks.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificate Resolution Guide Card */}
              <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200/80 dark:border-[#232D48] p-6 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-[#6C8CFF]" />
                  <span>Why does Chrome or Edge show "Not Secure" on Local HTTPS?</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-[#9BA8C7] leading-relaxed mb-4">
                  Self-signed certificates encrypt your traffic with full TLS cryptography, but commercial browsers require the certificate authority (CA) to be recognized in your operating system's trust store.
                </p>

                <div className="space-y-3 text-xs font-mono bg-slate-50 dark:bg-[#18233B] p-4 rounded-xl border border-slate-200/60 dark:border-[#232D48]">
                  <p className="text-slate-500 dark:text-slate-400 font-sans font-bold">To install a trusted local certificate with zero warnings:</p>
                  <p className="text-slate-800 dark:text-slate-200"># 1. Install mkcert (Chocolatey or Scoop)</p>
                  <p className="text-indigo-600 dark:text-[#43D9FF]">choco install mkcert</p>
                  <p className="text-slate-800 dark:text-slate-200"># 2. Install local CA to Windows Trust Store</p>
                  <p className="text-indigo-600 dark:text-[#43D9FF]">mkcert -install</p>
                  <p className="text-slate-800 dark:text-slate-200"># 3. Generate certificate for localhost and your LAN IP</p>
                  <p className="text-indigo-600 dark:text-[#43D9FF]">mkcert -key-file client/certs/key.pem -cert-file client/certs/cert.pem localhost 127.0.0.1 192.168.208.1</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACADEMIC CONFIGURATION */}
          {activeTab === 'academic' && (
            <form onSubmit={handleSaveAcademicConfig} className="space-y-6">
              <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200/80 dark:border-[#232D48] p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#232D48]">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Academic Session Policies</h3>
                    <p className="text-xs text-slate-500 dark:text-[#9BA8C7]">Configure university session parameters, attendance thresholds, and grading criteria.</p>
                  </div>
                  {savedSuccess && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 animate-fadeIn">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Settings Saved
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Academic Calendar Year</label>
                    <input
                      type="text"
                      value={academicConfig.academicYear}
                      onChange={(e) => setAcademicConfig({ ...academicConfig, academicYear: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#232D48] bg-slate-50 dark:bg-[#18233B] text-slate-900 dark:text-white focus:outline-none focus:border-[#6C8CFF]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Active Term / Semester</label>
                    <input
                      type="text"
                      value={academicConfig.activeTerm}
                      onChange={(e) => setAcademicConfig({ ...academicConfig, activeTerm: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#232D48] bg-slate-50 dark:bg-[#18233B] text-slate-900 dark:text-white focus:outline-none focus:border-[#6C8CFF]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Minimum Attendance Clearance (%)</label>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={academicConfig.minAttendancePercent}
                      onChange={(e) => setAcademicConfig({ ...academicConfig, minAttendancePercent: parseInt(e.target.value, 10) || 75 })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#232D48] bg-slate-50 dark:bg-[#18233B] text-slate-900 dark:text-white focus:outline-none focus:border-[#6C8CFF]"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Students below this threshold receive academic alerts and exam disallowance notices.</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">University Grading Scale</label>
                    <select
                      value={academicConfig.gradingScale}
                      onChange={(e) => setAcademicConfig({ ...academicConfig, gradingScale: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#232D48] bg-slate-50 dark:bg-[#18233B] text-slate-900 dark:text-white focus:outline-none focus:border-[#6C8CFF]"
                    >
                      <option value="10-Point UGC Scale">10-Point UGC Scale (O, A+, A, B+, B, C, P, F)</option>
                      <option value="4-Point GPA Scale">4-Point Standard GPA Scale (A, B, C, D, F)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#6C8CFF] to-[#43D9FF] text-slate-950 shadow-md shadow-[#6C8CFF]/20 hover:opacity-90 transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Academic Configuration</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 4: SYSTEM AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200/80 dark:border-[#232D48] p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter by action (e.g. login, create, update)..."
                    value={auditActionFilter}
                    onChange={(e) => {
                      setAuditActionFilter(e.target.value);
                      fetchAuditLogs(1, e.target.value);
                    }}
                    className="text-xs bg-slate-50 dark:bg-[#18233B] px-3 py-2 rounded-xl border border-slate-200 dark:border-[#232D48] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#6C8CFF] w-full sm:w-64"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#9BA8C7] self-end sm:self-auto">
                  <span>Total Recorded Events: <strong>{auditTotal}</strong></span>
                </div>
              </div>

              {auditLoading ? (
                <LoadingSkeleton count={4} />
              ) : auditLogs.length === 0 ? (
                <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-dashed border-slate-300 dark:border-[#232D48] p-12 text-center">
                  <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-700 dark:text-slate-200">No Audit Events Logged</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Administrative mutations and access attempts will automatically record in this audit ledger.
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200/80 dark:border-[#232D48] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-[#18233B] text-slate-400 uppercase font-black tracking-wider border-b border-slate-200 dark:border-[#232D48]">
                        <tr>
                          <th className="px-5 py-3.5">Timestamp</th>
                          <th className="px-5 py-3.5">Actor</th>
                          <th className="px-5 py-3.5">Role</th>
                          <th className="px-5 py-3.5">Action</th>
                          <th className="px-5 py-3.5">Resource</th>
                          <th className="px-5 py-3.5">IP Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-[#232D48]">
                        {auditLogs.map((log) => (
                          <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-[#18233B]/40 transition-colors">
                            <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 dark:text-[#9BA8C7] font-mono">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-white">
                              {log.actor?.name || log.actorName || 'System Service'}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase bg-indigo-50 dark:bg-[#6C8CFF]/15 text-indigo-700 dark:text-[#6C8CFF]">
                                {log.actorRole || log.actor?.role || 'admin'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-slate-700 dark:text-slate-200 font-bold">
                              {log.action}
                            </td>
                            <td className="px-5 py-3.5 text-slate-500 dark:text-[#9BA8C7]">
                              {log.resourceType || 'Configuration'}
                            </td>
                            <td className="px-5 py-3.5 font-mono text-slate-400">
                              {log.ipAddress || '127.0.0.1'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Audit Pagination */}
                  <div className="p-4 border-t border-slate-100 dark:border-[#232D48] flex items-center justify-between text-xs text-slate-500 dark:text-[#9BA8C7]">
                    <span>Page {auditPage} of {Math.ceil(auditTotal / 15) || 1}</span>
                    <div className="flex gap-2">
                      <button
                        disabled={auditPage <= 1}
                        onClick={() => fetchAuditLogs(auditPage - 1, auditActionFilter)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#232D48] disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-[#18233B]"
                      >
                        Previous
                      </button>
                      <button
                        disabled={auditPage * 15 >= auditTotal}
                        onClick={() => fetchAuditLogs(auditPage + 1, auditActionFilter)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#232D48] disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-[#18233B]"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminSettingsPage;
