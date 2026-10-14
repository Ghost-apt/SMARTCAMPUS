import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { Calendar, PlusCircle, Trash2, Clock, MapPin, User, CheckCircle2, AlertCircle, X } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AdminTimetablePage = () => {
  const [entries, setEntries] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDay, setActiveDay] = useState('Monday');

  // Schedule Modal State
  const [showModal, setShowModal] = useState(false);
  const [subjectId, setSubjectId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [room, setRoom] = useState('Lab 304');
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('09:30');
  const [endTime, setEndTime] = useState('11:00');
  const [scheduling, setScheduling] = useState(false);
  const [conflictMsg, setConflictMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      const [tRes, sRes, fRes] = await Promise.all([
        api.get('/timetable'),
        api.get('/subjects'),
        api.get('/faculty')
      ]);

      if (tRes.data.success) setEntries(tRes.data.entries || []);
      if (sRes.data.success && sRes.data.subjects?.length > 0) {
        setSubjects(sRes.data.subjects);
        setSubjectId(sRes.data.subjects[0]._id);
      }
      if (fRes.data.success && fRes.data.faculty?.length > 0) {
        setFacultyList(fRes.data.faculty);
        const fUserId = fRes.data.faculty[0].user?._id || fRes.data.faculty[0].user;
        setFacultyId(fUserId);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to load timetable data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setScheduling(true);
    setConflictMsg('');
    setSuccessMsg('');
    setError('');

    try {
      const res = await api.post('/timetable', {
        courseCode: 'BCA',
        semester: 5,
        section: 'A',
        subjectId,
        facultyId,
        room,
        day,
        startTime,
        endTime
      });

      if (res.data.success) {
        setSuccessMsg('Lecture slot scheduled with zero conflicts!');
        await fetchData();
        setTimeout(() => {
          setShowModal(false);
          setSuccessMsg('');
        }, 1200);
      }
    } catch (err) {
      // Backend conflict check (409) or other error
      setConflictMsg(err.userMessage || 'Failed to schedule slot.');
    } finally {
      setScheduling(false);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lecture slot?')) return;
    try {
      const res = await api.delete(`/timetable/${id}`);
      if (res.data.success) {
        await fetchData();
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to delete slot.');
    }
  };

  const dayEntries = entries
    .filter((e) => e.day === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <DashboardLayout
      title="University Timetable & Resource Allocation"
      subtitle="Schedule lecture rooms, assign professors, and run automatic 3-way conflict collision checks"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Control Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 mb-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Day Selector */}
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                activeDay === d
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Schedule Lecture Slot</span>
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : dayEntries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">No Timetable Slots Scheduled for {activeDay}</h4>
          <p className="text-xs text-slate-400 mt-1">Use the "Schedule Lecture Slot" button to allocate lectures without conflict.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dayEntries.map((slot) => (
            <div
              key={slot._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-indigo-200 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-indigo-700 flex-shrink-0">
                  <Clock className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-black uppercase">{slot.startTime}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[11px] font-black bg-slate-100 text-slate-700">
                      {slot.subjectCode || 'BCA'}
                    </span>
                    <span className="text-xs font-bold text-indigo-600">
                      {slot.startTime} – {slot.endTime}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {slot.subjectName || slot.subject?.subjectName}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{slot.facultyName || slot.faculty?.name || 'Assigned Faculty'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-100 text-teal-800 text-xs font-bold">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>Room: {slot.room}</span>
                </div>

                <button
                  onClick={() => handleDeleteSlot(slot._id)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                  title="Remove slot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Slot Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Schedule Lecture Slot</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {conflictMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{conflictMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateSlot} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Day of Week</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room / Lab Number</label>
                  <input
                    type="text"
                    required
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. Lab 304, Hall B"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-white"
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.subjectCode} - {s.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Faculty Member</label>
                <select
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-white"
                >
                  {facultyList.map((f) => {
                    const fUid = f.user?._id || f.user;
                    return (
                      <option key={f._id} value={fUid}>
                        {f.user?.name || f.employeeId} ({f.employeeId})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time (24h)</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time (24h)</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                >
                  {scheduling ? 'Validating Conflicts...' : 'Schedule Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminTimetablePage;

