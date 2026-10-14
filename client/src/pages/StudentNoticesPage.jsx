import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { Bell, AlertTriangle, Calendar, User, Search, Filter, AlertCircle } from 'lucide-react';

const StudentNoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await api.get('/notices');
        if (res.data.success) {
          setNotices(res.data.notices || []);
        }
      } catch (err) {
        setError(err.userMessage || 'Failed to load notices.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || n.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <DashboardLayout
      title="Official University Notice Board"
      subtitle="University circulars, administrative announcements, exam schedules, and academic updates"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search circulars and notices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">Priority:</span>
          {['All', 'Urgent', 'High', 'Normal'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                priorityFilter === p
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : filteredNotices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">No Notices Found</h4>
          <p className="text-xs text-slate-400 mt-1">There are no active notices matching your filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((n) => (
            <div
              key={n._id}
              className={`bg-white rounded-2xl border p-6 shadow-sm transition-all ${
                n.priority === 'Urgent'
                  ? 'border-rose-200 bg-rose-50/20'
                  : 'border-slate-200/80 hover:border-indigo-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    n.priority === 'Urgent'
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : n.priority === 'High'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {n.priority || 'Normal'} Priority
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                    Audience: {n.targetAudience ? n.targetAudience.toUpperCase() : 'ALL'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'Today'}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">{n.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {n.content}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Author: {n.author?.name || 'Office of the Registrar'}</span>
                </div>
                <span>Department: {n.department || 'University Wide'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentNoticesPage;
