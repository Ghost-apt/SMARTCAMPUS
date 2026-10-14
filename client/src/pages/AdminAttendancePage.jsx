import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { CalendarCheck, Users, AlertTriangle, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

const AdminAttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const fetchReport = async () => {
    try {
      const [attRes, subRes] = await Promise.all([
        api.get(`/attendance/report${selectedSubject ? `?subjectId=${selectedSubject}` : ''}`),
        api.get('/subjects')
      ]);

      if (attRes.data.success) {
        setRecords(attRes.data.records || []);
      }
      if (subRes.data.success) {
        setSubjects(subRes.data.subjects || []);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to load attendance reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedSubject]);

  const totalLogs = records.length;
  const presentCount = records.filter((r) => r.status === 'Present').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;
  const complianceRate = totalLogs > 0 ? ((presentCount / totalLogs) * 100).toFixed(1) : 100;

  return (
    <DashboardLayout
      title="University Attendance & Compliance Auditing"
      subtitle="Monitor institutional lecture turnout, audit faculty logs, and enforce examination debarment thresholds"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Turnout Ratio</span>
          <h3 className="text-3xl font-black text-teal-600 mt-2">{complianceRate}%</h3>
          <p className="text-xs text-slate-400 mt-1">Campus wide average</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Recorded Logs</span>
          <h3 className="text-3xl font-black text-slate-900 mt-2">{totalLogs}</h3>
          <p className="text-xs text-slate-400 mt-1">Semester sessions marked</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Present Count</span>
          <h3 className="text-3xl font-black text-emerald-600 mt-2">{presentCount}</h3>
          <p className="text-xs text-slate-400 mt-1">Attended lectures</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Absent Count</span>
          <h3 className="text-3xl font-black text-rose-600 mt-2">{absentCount}</h3>
          <p className="text-xs text-slate-400 mt-1">Unexcused leaves</p>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700">Filter by Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 bg-white"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>{s.subjectCode} - {s.subjectName}</option>
            ))}
          </select>
        </div>

        <span className="text-xs font-bold text-slate-500">Showing {records.length} logs</span>
      </div>

      {/* Detailed Table */}
      {loading ? (
        <LoadingSkeleton count={4} />
      ) : records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">No Attendance Records Found</h4>
          <p className="text-xs text-slate-400 mt-1">No attendance records match your filter criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Student</th>
                  <th className="pb-3">Subject</th>
                  <th className="pb-3">Evaluator</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 font-semibold text-slate-700">
                      {rec.date ? new Date(rec.date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 font-bold text-slate-900">
                      {rec.student?.name || 'Enrolled Student'}
                      <span className="block font-normal text-[11px] text-slate-400 font-mono">
                        {rec.student?.studentId || rec.student?.email}
                      </span>
                    </td>
                    <td className="py-3 text-slate-800">
                      {rec.subject?.subjectCode || 'BCA'} - {rec.subject?.subjectName}
                    </td>
                    <td className="py-3 text-slate-600">
                      {rec.markedBy?.name || 'Faculty Member'}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${
                        rec.status === 'Present'
                          ? 'bg-emerald-50 text-emerald-700'
                          : rec.status === 'Late'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {rec.status === 'Present' && <CheckCircle2 className="w-3 h-3" />}
                        {rec.status === 'Late' && <Clock className="w-3 h-3" />}
                        {rec.status === 'Absent' && <XCircle className="w-3 h-3" />}
                        <span>{rec.status}</span>
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 italic">
                      {rec.remarks || 'Regular log'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminAttendancePage;

