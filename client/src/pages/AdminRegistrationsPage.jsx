import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import {
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Eye,
  ShieldCheck,
  IdCard,
  Building,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  ArrowRight,
  X
} from 'lucide-react';

const AdminRegistrationsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering & Pagination
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING, APPROVED, REJECTED, ALL
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [pendingCount, setPendingCount] = useState(0);

  // Selected Request for Modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states for approval/rejection
  const [customStudentId, setCustomStudentId] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const fetchRequests = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const params = {
        status: activeTab === 'ALL' ? undefined : activeTab,
        department: departmentFilter !== 'all' ? departmentFilter : undefined,
        search: searchTerm.trim() ? searchTerm.trim() : undefined
      };

      const res = await api.get('/admin/registration-requests', { params });
      if (res.data.success) {
        setRequests(res.data.requests || []);
        if (typeof res.data.pendingCount === 'number') {
          setPendingCount(res.data.pendingCount);
        }
      }
    } catch (err) {
      if (!isSilent) {
        setError(err.userMessage || 'Failed to retrieve student registration requests.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, departmentFilter, searchTerm]);

  useEffect(() => {
    fetchRequests();
    // Auto-refresh interval (every 15s) for real-time awareness
    const interval = setInterval(() => {
      fetchRequests(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const handleOpenReview = (request) => {
    setSelectedRequest(request);
    setIsRejecting(false);
    setAdminNotes('');
    setRejectionReason('');

    // Pre-populate suggested Student ID
    const year = new Date().getFullYear();
    const deptCode = (request.department || 'BCA').substring(0, 3).toUpperCase();
    const suffix = Date.now().toString().slice(-4);
    setCustomStudentId(`${deptCode}-${year}-${suffix}`);

    setShowModal(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.post(`/admin/registration-requests/${selectedRequest._id}/approve`, {
        customStudentId: customStudentId.trim() || undefined,
        notes: adminNotes.trim() || undefined
      });

      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Registration request approved successfully!');
        setShowModal(false);
        await fetchRequests();
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to approve registration request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.post(`/admin/registration-requests/${selectedRequest._id}/reject`, {
        reason: rejectionReason.trim() || undefined,
        notes: adminNotes.trim() || undefined
      });

      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Registration request rejected.');
        setShowModal(false);
        await fetchRequests();
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to reject registration request.');
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics for overview cards
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter((r) => r.status === 'REJECTED').length;

  return (
    <DashboardLayout
      title="Student Registration & Admission Approvals"
      subtitle="Review pending student admissions, verify institutional qualifications, and activate university accounts"
    >
      {/* Alert Notices */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Review</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{pendingCount}</span>
            {pendingCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                Action Required
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">Awaiting administrative decision</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Students</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{approvedCount}</span>
            <span className="text-xs text-emerald-600 font-semibold">Active Profiles</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Admitted & issued roll numbers</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rejected Requests</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{rejectedCount}</span>
            <span className="text-xs text-rose-600 font-semibold">Declined</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Non-qualifying applicants</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Queue Total</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{requests.length}</span>
            <span className="text-xs text-blue-600 font-semibold">In View</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Registered applications</p>
        </div>
      </div>

      {/* Control Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto overflow-x-auto">
          {[
            { id: 'PENDING', label: 'Pending', count: pendingCount },
            { id: 'APPROVED', label: 'Approved' },
            { id: 'REJECTED', label: 'Rejected' },
            { id: 'ALL', label: 'All Requests' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, email, or REF-ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#D9AE4B] focus:bg-white transition-all"
            />
          </div>

          <button
            onClick={() => fetchRequests()}
            disabled={refreshing}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50"
            title="Refresh queue"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#D9AE4B]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8">
            <LoadingSkeleton count={5} />
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
              <UserCheck className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-800 mb-1">No registration requests found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeTab === 'PENDING'
                ? 'Great news! There are currently no pending student applications awaiting review.'
                : 'No registration requests matched your current filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Ref Number</th>
                  <th className="py-3.5 px-5">Applicant</th>
                  <th className="py-3.5 px-5">Academic Program</th>
                  <th className="py-3.5 px-5">Submission Date</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-800">
                      {req.registrationId}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900">{req.name}</div>
                      <div className="text-[11px] text-slate-500">{req.email}</div>
                      {req.phone && <div className="text-[10px] text-slate-400">{req.phone}</div>}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-medium text-slate-800">{req.department}</div>
                      <div className="text-[11px] text-slate-500">
                        {req.course} • Sem {req.semester || 1} • {req.academicYear}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap">
                      {new Date(req.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      <div className="text-[10px] text-slate-400">
                        {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      {req.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Pending Review
                        </span>
                      )}
                      {req.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Approved
                        </span>
                      )}
                      {req.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenReview(req)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          req.status === 'PENDING'
                            ? 'bg-[#0B2347] hover:bg-[#173F78] text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {req.status === 'PENDING' ? (
                          <>
                            <span>Review & Decide</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Decision Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#07162E] to-[#0B2347] text-white p-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#D9AE4B] uppercase">
                  Admissions Decision Review
                </span>
                <h3 className="text-lg font-bold mt-0.5">{selectedRequest.name}</h3>
                <p className="text-xs text-slate-300 font-mono mt-0.5">{selectedRequest.registrationId}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Applicant Profile Grid */}
              <div className="grid grid-cols-2 gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Email Address</span>
                  <p className="font-semibold text-slate-800 break-all">{selectedRequest.email}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Phone Number</span>
                  <p className="font-semibold text-slate-800">{selectedRequest.phone || 'Not Provided'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Department</span>
                  <p className="font-semibold text-slate-800">{selectedRequest.department}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Course / Program</span>
                  <p className="font-semibold text-slate-800">{selectedRequest.course}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Intended Semester</span>
                  <p className="font-semibold text-slate-800">Semester {selectedRequest.semester || 1}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Academic Year</span>
                  <p className="font-semibold text-slate-800">{selectedRequest.academicYear}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Submission Timestamp</span>
                  <p className="font-semibold text-slate-800">
                    {new Date(selectedRequest.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Verification</span>
                  <p className="font-semibold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Email Verified
                  </p>
                </div>
              </div>

              {/* Status Specific Section */}
              {selectedRequest.status === 'APPROVED' ? (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Application Approved & Account Active</span>
                  </div>
                  <p className="text-xs">
                    <strong>Official Student ID:</strong>{' '}
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300">
                      {selectedRequest.assignedStudentId}
                    </span>
                  </p>
                  {selectedRequest.reviewedAt && (
                    <p className="text-[11px] text-emerald-700">
                      Reviewed on: {new Date(selectedRequest.reviewedAt).toLocaleString()}
                    </p>
                  )}
                  {selectedRequest.adminNotes && (
                    <p className="text-[11px] text-emerald-800 bg-white/70 p-2 rounded-lg border border-emerald-200">
                      <em>Notes:</em> {selectedRequest.adminNotes}
                    </p>
                  )}
                </div>
              ) : selectedRequest.status === 'REJECTED' ? (
                <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-rose-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Application Rejected</span>
                  </div>
                  <p className="text-xs">
                    <strong>Reason:</strong> {selectedRequest.rejectionReason}
                  </p>
                  {selectedRequest.reviewedAt && (
                    <p className="text-[11px] text-rose-700">
                      Reviewed on: {new Date(selectedRequest.reviewedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                /* PENDING Decision Workflow */
                <div className="space-y-4 pt-1">
                  {!isRejecting ? (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Assigned Roll Number / Student ID
                        </label>
                        <div className="relative">
                          <IdCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            value={customStudentId}
                            onChange={(e) => setCustomStudentId(e.target.value)}
                            placeholder="e.g. BCA-2026-1001"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-[#D9AE4B] focus:bg-white"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Generated from department and academic year. Can be modified before approval.
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Administrative Decision Notes (Optional)
                        </label>
                        <textarea
                          rows={2}
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="e.g. Qualifications verified against state council records..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-[#D9AE4B] focus:bg-white"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                      <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        Confirm Application Rejection
                      </span>
                      <div>
                        <label className="block text-[11px] font-semibold text-rose-700 mb-1">
                          State Rejection Reason (Required)
                        </label>
                        <textarea
                          rows={3}
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Specify reason (e.g. Ineligible qualifying degree, missing prerequisites, seat capacity reached)..."
                          className="w-full bg-white border border-rose-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              {selectedRequest.status === 'PENDING' ? (
                !isRejecting ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsRejecting(true)}
                      disabled={actionLoading}
                      className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 font-bold hover:bg-rose-50 text-xs transition-colors"
                    >
                      Reject Request
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        disabled={actionLoading}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 text-xs transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
                      >
                        {actionLoading ? (
                          <span>Activating Account...</span>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve & Activate Account</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsRejecting(false)}
                      disabled={actionLoading}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 text-xs transition-colors"
                    >
                      Back to Approval
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={actionLoading || !rejectionReason.trim()}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      {actionLoading ? <span>Rejecting...</span> : <span>Confirm Rejection</span>}
                    </button>
                  </>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition-colors"
                >
                  Close Inspection
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminRegistrationsPage;
