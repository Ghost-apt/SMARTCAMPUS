import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { Bell, PlusCircle, Trash2, Calendar, CheckCircle2, AlertCircle, X } from 'lucide-react';

const AdminNoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Publish Modal State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('High');
  const [targetAudience, setTargetAudience] = useState('all');
  const [department, setDepartment] = useState('All Departments');
  const [posting, setPosting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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

  useEffect(() => {
    fetchNotices();
  }, []);

  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setPosting(true);
    setSuccessMsg('');
    setError('');

    try {
      const res = await api.post('/notices', {
        title,
        content,
        priority,
        targetAudience,
        department
      });

      if (res.data.success) {
        setSuccessMsg('Notice published and broadcasted across campus!');
        setTitle('');
        setContent('');
        await fetchNotices();
        setTimeout(() => {
          setShowModal(false);
          setSuccessMsg('');
        }, 1200);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to publish circular.');
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Are you sure you want to retract this campus notice?')) return;
    try {
      const res = await api.delete(`/notices/${id}`);
      if (res.data.success) {
        await fetchNotices();
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to delete notice.');
    }
  };

  return (
    <DashboardLayout
      title="University Notice Board & Official Broadcasts"
      subtitle="Publish statutory circulars, emergency announcements, and official academic orders"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 mb-8 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-slate-900">Campus Circulars Registry</h3>
          <p className="text-xs text-slate-500">Official bulletins visible across student, faculty, and administrative portals.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Broadcast Notice</span>
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : notices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">No Circulars Published</h4>
          <p className="text-xs text-slate-400 mt-1">Broadcast official notices to students and faculty.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((n) => (
            <div
              key={n._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:border-indigo-200 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      n.priority === 'Urgent'
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : n.priority === 'High'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {n.priority}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Target: {n.targetAudience?.toUpperCase() || 'ALL'}
                    </span>
                    <span className="text-xs text-slate-400">• {n.department || 'Campus Wide'}</span>
                  </div>

                  <button
                    onClick={() => handleDeleteNotice(n._id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Retract circular"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="text-base font-bold text-slate-900 mb-2">{n.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line mb-4">
                  {n.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>By: {n.author?.name || 'Office of Registrar'}</span>
                <span>{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Active'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Broadcast Campus Notice</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handlePostNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Circular Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule for Mid-Term Examination Evaluation"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="all">Campus Wide (All)</option>
                    <option value="student">Students Only</option>
                    <option value="faculty">Faculty Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Circular Text</label>
                <textarea
                  rows="4"
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Official notice body and administrative instructions..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
                ></textarea>
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
                  disabled={posting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                >
                  {posting ? 'Broadcasting...' : 'Broadcast Circular'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminNoticesPage;

