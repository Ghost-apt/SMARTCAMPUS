import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { GraduationCap, UserPlus, Search, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';

const AdminFacultyPage = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Add Faculty Modal State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Faculty@123');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('Computer Applications');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [qualification, setQualification] = useState('Ph.D. in Computer Science');
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchFaculty = async () => {
    try {
      const res = await api.get('/faculty');
      if (res.data.success) {
        setFacultyList(res.data.faculty || []);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to load faculty directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !employeeId.trim()) return;

    setCreating(true);
    setSuccessMsg('');
    setError('');

    try {
      const res = await api.post('/faculty', {
        name,
        email,
        password,
        employeeId,
        department,
        designation,
        qualification
      });

      if (res.data.success) {
        setSuccessMsg('Faculty member appointed and profile created successfully!');
        setName('');
        setEmail('');
        setEmployeeId('');
        await fetchFaculty();
        setTimeout(() => {
          setShowModal(false);
          setSuccessMsg('');
        }, 1200);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to add faculty member.');
    } finally {
      setCreating(false);
    }
  };

  const filteredFaculty = facultyList.filter((f) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = f.user?.name && f.user.name.toLowerCase().includes(term);
    const empMatch = f.employeeId && f.employeeId.toLowerCase().includes(term);
    const emailMatch = f.user?.email && f.user.email.toLowerCase().includes(term);
    return nameMatch || empMatch || emailMatch;
  });

  return (
    <DashboardLayout
      title="Faculty Directory & Academic Staff Management"
      subtitle="Manage university professorship, appoint department mentors, and allocate academic workload"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Control Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 mb-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by faculty name or employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-800"
          />
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Appoint New Faculty</span>
        </button>
      </div>

      {/* Faculty Table */}
      {loading ? (
        <LoadingSkeleton count={4} />
      ) : filteredFaculty.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">No Faculty Records Found</h4>
          <p className="text-xs text-slate-400 mt-1">Appoint professors using the button above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-900">Teaching Faculty Roster</h3>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1 rounded-lg">
              {filteredFaculty.length} Academic Staff
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase">
                  <th className="pb-3">Faculty Name</th>
                  <th className="pb-3">Employee ID</th>
                  <th className="pb-3">Designation</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Qualification</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFaculty.map((f) => {
                  const userName = f.name || f.user?.name || 'Faculty Member';
                  const userEmail = f.email || f.user?.email || 'N/A';

                  return (
                    <tr key={f._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                          {userName ? userName.charAt(0).toUpperCase() : 'F'}
                        </div>
                        <div>
                          <span>{userName}</span>
                          <span className="block font-normal text-[11px] text-slate-400">{userEmail}</span>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono text-teal-700 font-bold">
                        {f.employeeId}
                      </td>
                      <td className="py-3.5 font-semibold text-slate-800">
                        {f.designation || 'Assistant Professor'}
                      </td>
                      <td className="py-3.5 text-slate-600">
                        {f.department || 'Computer Applications'}
                      </td>
                      <td className="py-3.5 text-slate-500">
                        {f.qualification || 'M.Tech / Ph.D.'}
                      </td>
                      <td className="py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Appoint New Faculty Member</h3>
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

            <form onSubmit={handleAddFaculty} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Sarah Sharma"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. FAC-BCA-005"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="faculty@smartcampus.edu"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="Associate Professor"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500 bg-white"
                  >
                    <option value="Computer Applications">Computer Applications</option>
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Highest Qualification</label>
                <input
                  type="text"
                  required
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="Ph.D. in Computer Science"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Default Password</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500 bg-slate-50 font-mono"
                />
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
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-50"
                >
                  {creating ? 'Saving...' : 'Appoint Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminFacultyPage;

