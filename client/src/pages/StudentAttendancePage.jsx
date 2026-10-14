import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { CalendarCheck, AlertTriangle, CheckCircle2, XCircle, Clock, BookOpen, AlertCircle } from 'lucide-react';

const StudentAttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get('/attendance/student');
        if (res.data.success) {
          setAttendanceData(res.data);
        }
      } catch (err) {
        setError(err.userMessage || 'Failed to load attendance records.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const overallPercentage = attendanceData?.overallPercentage ?? 85.0;
  const isEligible = overallPercentage >= 75;
  const totalSessions = attendanceData?.totalSessions ?? 0;
  const presentSessions = attendanceData?.presentSessions ?? 0;
  const absentSessions = Math.max(0, totalSessions - presentSessions);
  const subjectBreakdown = attendanceData?.subjectBreakdown || [];
  const recentHistory = attendanceData?.recentHistory || [];

  return (
    <DashboardLayout
      title="Attendance Records & Analytics"
      subtitle="Track your lecture attendance compliance against university requirements (75% Minimum Required)"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Compliance Alert Banner if < 75% */}
      {!isEligible && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div>
            <span className="font-bold">Attendance Warning: </span>
            Your overall attendance is below the university 75% threshold. You may be debarred from mid-term/end-term examinations if not improved.
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overall Attendance</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isEligible ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {isEligible ? 'Eligible' : 'Debarred'}
            </span>
          </div>
          <h3 className={`text-3xl font-black mt-2 ${isEligible ? 'text-teal-600' : 'text-rose-600'}`}>
            {overallPercentage}%
          </h3>
          <p className="text-xs text-slate-400 mt-1">University standard: 75.0%</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Lectures</span>
          <h3 className="text-3xl font-black text-slate-900 mt-2">{totalSessions}</h3>
          <p className="text-xs text-slate-400 mt-1">Conducted to date</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lectures Attended</span>
          <h3 className="text-3xl font-black text-emerald-600 mt-2">{presentSessions}</h3>
          <p className="text-xs text-slate-400 mt-1">Marked Present</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lectures Missed</span>
          <h3 className="text-3xl font-black text-rose-600 mt-2">{absentSessions}</h3>
          <p className="text-xs text-slate-400 mt-1">Absent or unexcused</p>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subject-Wise Attendance Progress */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-4">Subject-wise Compliance</h3>
            {subjectBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No subject breakdown available yet.</p>
            ) : (
              <div className="space-y-4">
                {subjectBreakdown.map((item) => {
                  const pct = item.percentage || 0;
                  return (
                    <div key={item.subjectCode} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{item.subjectCode}</span>
                        <span className={`font-black ${pct >= 75 ? 'text-teal-600' : 'text-rose-600'}`}>
                          {pct}% ({item.present}/{item.total})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{item.subjectName}</p>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct >= 75 ? 'bg-teal-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Historical Log Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-4">Detailed Attendance Logs</h3>
            {recentHistory.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No attendance logs found for this semester.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Subject</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentHistory.map((rec, idx) => (
                      <tr key={rec._id || idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 font-medium text-slate-700">
                          {rec.date ? new Date(rec.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'N/A'}
                        </td>
                        <td className="py-3">
                          <span className="font-bold text-slate-900">
                            {rec.subject?.subjectCode || 'General'}
                          </span>
                          <span className="block text-[11px] text-slate-400">
                            {rec.subject?.subjectName || 'Lecture Session'}
                          </span>
                        </td>
                        <td className="py-3">
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
                          {rec.remarks || 'Regular session'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentAttendancePage;

