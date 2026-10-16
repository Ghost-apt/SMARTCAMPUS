import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { Calendar, Clock, MapPin, User, BookOpen, AlertCircle } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const StudentTimetablePage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Default to today's day of week or Monday if Sunday
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const [activeDay, setActiveDay] = useState(DAYS.includes(todayName) ? todayName : 'Monday');

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await api.get('/timetable?courseCode=BCA&semester=5');
        if (res.data.success) {
          setEntries(res.data.entries || []);
        }
      } catch (err) {
        setError(err.userMessage || 'Failed to load timetable.');
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  const dayEntries = entries
    .filter((e) => e.day === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <DashboardLayout
      title="Weekly Class Timetable"
      subtitle="BCA Semester 5 • Section A • Lecture & Lab Routine"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Day Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {DAYS.map((day) => {
          const isToday = day === todayName;
          const isActive = day === activeDay;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-gradient-to-r from-[#6C8CFF] to-[#43D9FF] text-slate-950 shadow-md shadow-[#6C8CFF]/25 font-black'
                  : 'bg-white dark:bg-[#121A2E] border border-slate-200 dark:border-[#232D48] text-slate-600 dark:text-[#9BA8C7] hover:bg-slate-50 dark:hover:bg-[#18233B]'
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-slate-950' : 'bg-[#43D9FF]'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Timetable Slot List */}
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : dayEntries.length === 0 ? (
        <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-dashed border-slate-300 dark:border-[#232D48] p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-200">No Lectures Scheduled</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">There are no lectures or lab periods scheduled for {activeDay}.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dayEntries.map((slot) => (
            <div
              key={slot._id}
              className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200/80 dark:border-[#232D48] p-5 shadow-sm hover:border-[#6C8CFF]/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-indigo-50 dark:bg-[#6C8CFF]/10 border border-indigo-100 dark:border-[#6C8CFF]/20 flex flex-col items-center justify-center text-indigo-700 dark:text-[#6C8CFF] flex-shrink-0">
                  <Clock className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-black uppercase">Lecture</span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[11px] font-black bg-slate-100 dark:bg-[#18233B] text-slate-700 dark:text-slate-200 border border-transparent dark:border-[#232D48]">
                      {slot.subjectCode || slot.subject?.subjectCode || 'BCA-500'}
                    </span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-[#43D9FF]">
                      {slot.startTime} – {slot.endTime}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {slot.subjectName || slot.subject?.subjectName || 'Academic Lecture'}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-[#9BA8C7]">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{slot.facultyName || slot.faculty?.name || 'Assigned Professor'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-[#232D48]">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-[#43D9FF]/10 border border-teal-100 dark:border-[#43D9FF]/20 text-teal-800 dark:text-[#43D9FF] text-xs font-bold">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-[#43D9FF]" />
                  <span>Room: {slot.room}</span>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Section {slot.section || 'A'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentTimetablePage;

