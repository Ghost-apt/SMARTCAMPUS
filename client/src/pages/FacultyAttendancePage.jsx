import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { CalendarCheck, Users, CheckCircle2, XCircle, Clock, Save, AlertCircle } from 'lucide-react';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, studRes] = await Promise.all([
          api.get('/subjects'),
          api.get('/students')
        ]);

        if (subRes.data.success && subRes.data.subjects?.length > 0) {
          setSubjects(subRes.data.subjects);
          setSelectedSubject(subRes.data.subjects[0]._id);
        }

        if (studRes.data.success) {
          const list = studRes.data.students || [];
          setStudents(list);
          // Initialize attendance status to 'Present' for all students
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

    fetchData();
  }, []);

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

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
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

