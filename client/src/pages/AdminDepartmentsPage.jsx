import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { Building2, PlusCircle, Users, CheckCircle2, AlertCircle, X } from 'lucide-react';

const AdminDepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create Modal State
  const [showModal, setShowModal] = useState(false);
  const [departmentCode, setDepartmentCode] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [headOfDepartment, setHeadOfDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.departments || []);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to load university departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!departmentCode.trim() || !departmentName.trim()) return;

    setCreating(true);
    setSuccessMsg('');
    setError('');

    try {
      const res = await api.post('/departments', {
        departmentCode,
        departmentName,
        headOfDepartment,
        description
      });

      if (res.data.success) {
        setSuccessMsg('Academic department established successfully!');
        setDepartmentCode('');
        setDepartmentName('');
        setHeadOfDepartment('');
        setDescription('');
        await fetchDepartments();
        setTimeout(() => {
          setShowModal(false);
          setSuccessMsg('');
        }, 1200);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to establish department.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout
      title="Academic Departments & Faculties"
      subtitle="Establish university departments, appoint heads of departments, and configure academic units"
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
          <h3 className="font-bold text-base text-slate-900">University Academic Divisions</h3>
          <p className="text-xs text-slate-500">Manage academic governance and schools of study.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Department</span>
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : departments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">No Departments Established</h4>
          <p className="text-xs text-slate-400 mt-1">Create academic departments to organize courses and faculty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-3 py-1 rounded-lg text-xs font-black tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-100">
                    CODE: {dept.departmentCode}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Active Division
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                  {dept.departmentName}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {dept.description || 'University academic department supporting undergraduate and postgraduate degrees.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold">
                  Head of Dept: <span className="text-indigo-600">{dept.headOfDepartment || 'Prof. Sharma'}</span>
                </span>
                <span className="text-slate-400">School of Computing</span>
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
              <h3 className="text-base font-bold text-slate-900">Establish Department</h3>
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

            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={departmentCode}
                    onChange={(e) => setDepartmentCode(e.target.value)}
                    placeholder="e.g. CA"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Head of Department (HOD)</label>
                  <input
                    type="text"
                    value={headOfDepartment}
                    onChange={(e) => setHeadOfDepartment(e.target.value)}
                    placeholder="e.g. Dr. A. K. Verma"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="e.g. Department of Computer Applications"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Faculty focus, lab equipment, and academic scope..."
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
                  disabled={creating}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                >
                  {creating ? 'Saving...' : 'Establish Division'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDepartmentsPage;

