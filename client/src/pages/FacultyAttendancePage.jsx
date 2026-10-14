import React, { useEffect, useState, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { CalendarCheck, Users, CheckCircle2, XCircle, Clock, Save, AlertCircle, QrCode, X, Copy, Check, RefreshCw } from 'lucide-react';

const FacultyAttendancePage = () => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  // QR Session State
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDuration, setQrDuration] = useState(10);
  const [qrCreating, setQrCreating] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const pollTimerRef = useRef(null);

  const fetchStudentsAndSubjects = async () => {
    try {
      const [subRes, studRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/students')
      ]);

      if (subRes.data.success && subRes.data.subjects?.length > 0) {
        setSubjects(subRes.data.subjects);
        if (!selectedSubject) {
          setSelectedSubject(subRes.data.subjects[0]._id);
        }
      }

      if (studRes.data.success) {
        const list = studRes.data.students || [];
        setStudents(list);
        const initialMap = {};
        list.forEach((s) => {
          const id = s.user?._id || s.user;
          initialMap[id] = { status: 'Present', remarks: '' };
        });
        setAttendanceMap(initialMap);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to initialize attendance session.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsAndSubjects();
  }, []);

  // Poll active QR session status
  useEffect(() => {
    if (!activeSession || !activeSession.sessionId) return;

    const fetchSessionStatus = async () => {
      try {
        const res = await api.get(`/attendance/session/${activeSession.sessionId}/status`);
        if (res.data.success) {
          setActiveSession((prev) => ({
            ...prev,
            ...res.data.session,
            attendees: res.data.attendees || []
          }));
          if (!res.data.session.isActive || res.data.isExpired) {
            clearInterval(pollTimerRef.current);
          }
        }
      } catch {
        // Suppress background poll errors
      }
    };

    pollTimerRef.current = setInterval(fetchSessionStatus, 4000);
    return () => clearInterval(pollTimerRef.current);
  }, [activeSession?.sessionId]);

  // Countdown timer for active QR session
  useEffect(() => {
    if (!activeSession || !activeSession.expiresAt) return;

    const timer = setInterval(() => {
      const remainingMs = new Date(activeSession.expiresAt).getTime() - Date.now();
      if (remainingMs <= 0) {
        setSessionTimeLeft('Expired');
        clearInterval(timer);
      } else {
        const mins = Math.floor(remainingMs / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        setSessionTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession?.expiresAt]);

  const handleLaunchQr = async (e) => {
    e.preventDefault();
    if (!selectedSubject) {
      setError('Please select a subject to create a QR session.');
      return;
    }
    setQrCreating(true);
    setError('');

    try {
      const res = await api.post('/attendance/session/create', {
        subjectId: selectedSubject,
        courseCode: 'BCA',
        semester: 5,
        durationMinutes: Number(qrDuration)
      });

      if (res.data.success) {
        setActiveSession({
          sessionId: res.data.sessionId,
          sessionCode: res.data.sessionCode,
          qrCodeDataUrl: res.data.qrCodeDataUrl,
          expiresAt: res.data.expiresAt,
          subject: res.data.subject,
          attendees: []
        });
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to generate QR attendance session.');
    } finally {
      setQrCreating(false);
    }
  };

  const handleCloseSessionEarly = async () => {
    if (!activeSession?.sessionId) return;
    try {
      await api.patch(`/attendance/session/${activeSession.sessionId}/close`);
      setActiveSession((prev) => ({ ...prev, isActive: false }));
      setSessionTimeLeft('Closed');
      clearInterval(pollTimerRef.current);
      // Refresh students to reflect updated attendance rates
      fetchStudentsAndSubjects();
    } catch (err) {
      setError(err.userMessage || 'Failed to close attendance session.');
    }
  };

  const copySessionCode = () => {
    if (activeSession?.sessionCode) {
      navigator.clipboard.writeText(activeSession.sessionCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleStatusChange = (studentUserId, newStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentUserId]: {
        ...prev[studentUserId],
        status: newStatus
      }
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      const id = s.user?._id || s.user;
      updated[id] = { status, remarks: '' };
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    if (!selectedSubject) {
      setError('Please select a subject.');
      return;
    }

    setSaving(true);
    setSuccessMsg('');
    setError('');

    const attendanceList = Object.keys(attendanceMap).map((studentId) => ({
      studentId,
      status: attendanceMap[studentId].status,
      remarks: attendanceMap[studentId].remarks || ''
    }));

    try {
      const res = await api.post('/attendance/mark', {
        subjectId: selectedSubject,
        courseCode: 'BCA',
        semester: 5,
        date: selectedDate,
        attendanceList
      });

      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Attendance saved and synchronized successfully!');
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to save attendance records.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="Lecture Attendance Management"
      subtitle="Record student presence, track absenteeism, and synchronize compliance logs"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Control Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 mb-8 shadow-sm">
        <form onSubmit={handleSaveAttendance} className="flex flex-col md:flex-row items-end gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Academic Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full sm:w-64 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-teal-500 bg-white"
              >
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.subjectCode} - {sub.subjectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Session Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-44 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500 text-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
            <button
              type="button"
              onClick={() => {
                setShowQrModal(true);
                setError('');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 flex items-center gap-2 transition-colors"
            >
              <QrCode className="w-4 h-4 text-indigo-600" />
              <span>Launch QR Session</span>
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('Present')}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              All Present
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* QR Attendance Session Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowQrModal(false);
                fetchStudentsAndSubjects();
              }}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Dynamic QR Attendance Session</h3>
                <p className="text-xs text-slate-500">Live lecture check-in with fraud-resistant tokens</p>
              </div>
            </div>

            {!activeSession ? (
              <form onSubmit={handleLaunchQr} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Lecture Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    {subjects.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.subjectCode} - {sub.subjectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    QR Validity Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[5, 10, 15].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setQrDuration(mins)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          qrDuration === mins
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {mins} Minutes
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                  💡 <strong>How it works:</strong> Students scan the QR code via their portal or enter the 6-character session fallback code. Duplicate scans are blocked automatically.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowQrModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={qrCreating}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{qrCreating ? 'Generating QR...' : 'Start Session'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Active QR Display */}
                <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <img
                    src={activeSession.qrCodeDataUrl}
                    alt="Session QR Code"
                    className="w-52 h-52 mx-auto rounded-xl shadow-md border border-slate-200 bg-white p-2"
                  />
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Session Code:</span>
                    <span className="text-sm font-black font-mono tracking-widest text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                      {activeSession.sessionCode}
                    </span>
                    <button
                      type="button"
                      onClick={copySessionCode}
                      className="p-1 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-slate-200 transition-colors"
                      title="Copy Code"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Session Telemetry */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Time Remaining</span>
                    <span className={`text-base font-black ${sessionTimeLeft === 'Expired' || sessionTimeLeft === 'Closed' ? 'text-rose-600' : 'text-teal-600'}`}>
                      {sessionTimeLeft || 'Active'}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scanned Students</span>
                    <span className="text-base font-black text-indigo-600">
                      {activeSession.attendees?.length || 0} Checked In
                    </span>
                  </div>
                </div>

                {/* Live Attendees List */}
                {activeSession.attendees?.length > 0 && (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-700 block mb-2">Live Scanned Roster</span>
                    <div className="max-h-28 overflow-y-auto space-y-1.5 text-xs">
                      {activeSession.attendees.map((att, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200/70">
                          <span className="font-semibold text-slate-800">{att.student?.name || att.student?.rollNumber || 'Student'}</span>
                          <span className="text-[10px] font-mono text-emerald-600 font-bold">
                            {att.scannedAt ? new Date(att.scannedAt).toLocaleTimeString() : 'Verified'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleCloseSessionEarly}
                    disabled={sessionTimeLeft === 'Closed' || sessionTimeLeft === 'Expired'}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 disabled:opacity-40 transition-colors"
                  >
                    Close Session Early
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSession(null);
                      setShowQrModal(false);
                      fetchStudentsAndSubjects();
                    }}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                  >
                    Done & Refresh Roster
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Student Roster Table */}
      {loading ? (
        <LoadingSkeleton count={4} />
      ) : students.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">No Enrolled Students Found</h4>
          <p className="text-xs text-slate-400 mt-1">There are no students registered in this section.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-900">Student Roll Call (BCA Semester 5 - Section A)</h3>
            <span className="text-xs font-bold text-slate-500">
              {students.length} Total Students
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase">
                  <th className="pb-3">Student</th>
                  <th className="pb-3">Roll Number</th>
                  <th className="pb-3 text-center">Cumulative Attendance</th>
                  <th className="pb-3 text-right">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((stud) => {
                  const studentUserId = stud.user?._id || stud.user;
                  const currentStatus = attendanceMap[studentUserId]?.status || 'Present';
                  const userName = stud.user?.name || stud.rollNumber;
                  const userEmail = stud.user?.email || '';

                  return (
                    <tr key={stud._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                          {userName.charAt(0)}
                        </div>
                        <div>
                          <span>{userName}</span>
                          <span className="block font-normal text-[11px] text-slate-400">{userEmail}</span>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono text-slate-700 font-semibold">
                        {stud.rollNumber}
                      </td>
                      <td className="py-3.5 text-center font-bold text-teal-700">
                        {stud.attendancePercentage ?? 85}%
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(studentUserId, 'Present')}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-emerald-700'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(studentUserId, 'Absent')}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                              currentStatus === 'Absent'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-rose-700'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(studentUserId, 'Late')}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                              currentStatus === 'Late'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-amber-700'
                            }`}
                          >
                            Late
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default FacultyAttendancePage;

