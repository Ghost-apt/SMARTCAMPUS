import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import {
  CreditCard,
  PlusCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Download,
  History,
  ShieldCheck,
  Layers,
  Send,
  FileCheck,
  RefreshCw,
  Eye,
  Building2,
  Sparkles
} from 'lucide-react';

const AdminFeesPage = () => {
  const [feeData, setFeeData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('structures'); // 'structures', 'offline', 'invoices', 'transactions'
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Fee Structures State
  const [structures, setStructures] = useState([]);
  const [loadingStructures, setLoadingStructures] = useState(false);
  const [showCreateStructureModal, setShowCreateStructureModal] = useState(false);
  const [selectedStructureForView, setSelectedStructureForView] = useState(null);
  const [publishingId, setPublishingId] = useState(null);
  const [assigningStructure, setAssigningStructure] = useState(null);
  const [assignSemester, setAssignSemester] = useState(1);
  const [assigningLoading, setAssigningLoading] = useState(false);
  const [structureSuccess, setStructureSuccess] = useState('');

  // Structure Form State
  const [structName, setStructName] = useState('BCA 2026 Batch Comprehensive Fee Structure');
  const [structCourse, setStructCourse] = useState('BCA');
  const [structCourseName, setStructCourseName] = useState('Bachelor of Computer Applications');
  const [structDepartment, setStructDepartment] = useState('Computer Applications');
  const [structAcademicYear, setStructAcademicYear] = useState('2026-2027');
  const [structSemesters, setStructSemesters] = useState('1, 2, 3, 4, 5, 6');
  const [structCohort, setStructCohort] = useState('2026 Batch');
  const [structCategories, setStructCategories] = useState([
    {
      feeType: 'Registration Fee',
      categoryName: 'One-Time University Admission & Enrollment',
      amount: 2500,
      frequency: 'ONE_TIME',
      semester: 1,
      mandatory: true,
      description: 'Official university registration, student identity file & portal setup'
    },
    {
      feeType: 'Tuition Fee',
      categoryName: 'Semester Academic Instruction & Lectures',
      amount: 45000,
      frequency: 'PER_SEMESTER',
      semester: 1,
      mandatory: true,
      description: 'Major credit courses, professors mentorship and continuous assessments'
    },
    {
      feeType: 'Examination Fee',
      categoryName: 'Terminal Semester Examinations & Evaluation',
      amount: 2500,
      frequency: 'PER_SEMESTER',
      semester: 1,
      mandatory: true,
      description: 'Central paper evaluations, UGC GPA transcript generation'
    },
    {
      feeType: 'Lab Fee',
      categoryName: 'Computing Labs & AI Cloud Workstations',
      amount: 3500,
      frequency: 'PER_SEMESTER',
      semester: 1,
      mandatory: true,
      description: 'High-speed lab computers, Docker sandbox instances, and compute access'
    },
    {
      feeType: 'Library Fee',
      categoryName: 'Digital E-Library & IEEE Xplore Journals',
      amount: 1500,
      frequency: 'PER_SEMESTER',
      semester: 1,
      mandatory: true,
      description: 'Digital research library subscriptions, ACM digital portal access'
    }
  ]);
  const [creatingStructure, setCreatingStructure] = useState(false);

  // Offline Payment Recording State
  const [offlineStudentId, setOfflineStudentId] = useState('');
  const [offlineFeeRecordId, setOfflineFeeRecordId] = useState('');
  const [offlineAmount, setOfflineAmount] = useState('');
  const [offlineMethod, setOfflineMethod] = useState('Cash');
  const [offlineRef, setOfflineRef] = useState('');
  const [offlineReceiptNo, setOfflineReceiptNo] = useState(`REC-OFF-${Date.now().toString().slice(-6)}`);
  const [offlineDate, setOfflineDate] = useState(new Date().toISOString().split('T')[0]);
  const [offlineRemarks, setOfflineRemarks] = useState('');
  const [recordingOffline, setRecordingOffline] = useState(false);
  const [offlineSuccess, setOfflineSuccess] = useState('');

  // Quick Payment Modal (from invoice table)
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [paySuccess, setPaySuccess] = useState('');

  // Create Invoice Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStudentId, setNewStudentId] = useState('');
  const [feeType, setFeeType] = useState('Academic Fees');
  const [semester, setSemester] = useState(5);
  const [totalAmount, setTotalAmount] = useState('45000');
  const [dueDate, setDueDate] = useState('');
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [createSuccess, setCreateSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [fRes, sRes] = await Promise.all([
        api.get('/fees'),
        api.get('/students')
      ]);

      if (fRes.data.success) setFeeData(fRes.data);
      if (sRes.data.success && sRes.data.students?.length > 0) {
        setStudents(sRes.data.students);
        const firstUid = sRes.data.students[0].user?._id || sRes.data.students[0].user;
        setNewStudentId(firstUid);
        if (!offlineStudentId) setOfflineStudentId(firstUid);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to load fee management data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStructures = async () => {
    setLoadingStructures(true);
    try {
      const res = await api.get('/fees/structures');
      if (res.data.success) {
        setStructures(res.data.structures || []);
      }
    } catch (err) {
      console.warn('Failed to load fee structures:', err.message);
    } finally {
      setLoadingStructures(false);
    }
  };

  const fetchTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const res = await api.get('/fees/transactions');
      if (res.data.success) {
        setTransactions(res.data.transactions || []);
      }
    } catch (err) {
      console.warn('Failed to load transactions:', err.message);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleDownloadReceipt = async (feeId, receiptNo) => {
    try {
      const response = await api.get(`/fees/${feeId}/receipt`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `SmartCampus_Receipt_${receiptNo || feeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError('Failed to download receipt for selected fee.');
    }
  };

  useEffect(() => {
    fetchData();
    fetchStructures();
    fetchTransactions();
  }, []);

  // Update selected fee record for offline payment when offlineStudentId changes
  const studentFeeRecords = (feeData?.fees || []).filter(
    (f) => (f.student?._id || f.student) === offlineStudentId && (f.balanceAmount || 0) > 0
  );

  useEffect(() => {
    if (studentFeeRecords.length > 0) {
      setOfflineFeeRecordId(studentFeeRecords[0]._id);
      setOfflineAmount(String(studentFeeRecords[0].balanceAmount));
    } else {
      setOfflineFeeRecordId('');
      setOfflineAmount('');
    }
  }, [offlineStudentId, feeData]);

  // When selected assessment in offline form changes, prefill balance
  const handleOfflineFeeChange = (fId) => {
    setOfflineFeeRecordId(fId);
    const chosen = studentFeeRecords.find((f) => f._id === fId);
    if (chosen) {
      setOfflineAmount(String(chosen.balanceAmount));
    }
  };

  const handleCreateStructure = async (e) => {
    e.preventDefault();
    setCreatingStructure(true);
    setStructureSuccess('');
    setError('');

    try {
      const parsedSemesters = structSemesters
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));

      const payload = {
        name: structName,
        course: structCourse.toUpperCase(),
        courseName: structCourseName,
        department: structDepartment,
        academicYear: structAcademicYear,
        semesters: parsedSemesters.length > 0 ? parsedSemesters : [1, 2],
        cohort: structCohort,
        currency: 'INR',
        categories: structCategories
      };

      const res = await api.post('/fees/structures', payload);
      if (res.data.success) {
        setStructureSuccess('Course fee structure created successfully as DRAFT!');
        await fetchStructures();
        setTimeout(() => {
          setShowCreateStructureModal(false);
          setStructureSuccess('');
        }, 1200);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to create fee structure.');
    } finally {
      setCreatingStructure(false);
    }
  };

  const handlePublishStructure = async (structureId) => {
    setPublishingId(structureId);
    setError('');
    setStructureSuccess('');

    try {
      const res = await api.post(`/fees/structures/${structureId}/publish`);
      if (res.data.success) {
        setStructureSuccess('Fee structure published! Enrolled students can now be assessed from this structure.');
        await fetchStructures();
        setTimeout(() => setStructureSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to publish fee structure.');
    } finally {
      setPublishingId(null);
    }
  };

  const handleAssignStructureToStudents = async () => {
    if (!assigningStructure) return;
    setAssigningLoading(true);
    setError('');
    setStructureSuccess('');

    try {
      const res = await api.post(`/fees/structures/${assigningStructure._id}/assign`, {
        semester: Number(assignSemester)
      });
      if (res.data.success) {
        setStructureSuccess(res.data.message || 'Fee assessments successfully generated for students!');
        await fetchData();
        setTimeout(() => {
          setAssigningStructure(null);
          setStructureSuccess('');
        }, 2000);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to assign fee structure to students.');
    } finally {
      setAssigningLoading(false);
    }
  };

  const handleRecordOfflinePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!offlineFeeRecordId || !offlineAmount) {
      setError('Please select an active student fee record and specify payment amount.');
      return;
    }

    setRecordingOffline(true);
    setOfflineSuccess('');
    setError('');

    try {
      const payload = {
        feeRecordId: offlineFeeRecordId,
        studentId: offlineStudentId,
        amount: Number(offlineAmount),
        paymentMethod: offlineMethod,
        referenceNumber: offlineRef,
        receiptNumber: offlineReceiptNo,
        paymentDate: offlineDate,
        remarks: offlineRemarks
      };

      const res = await api.post('/fees/offline-pay', payload);
      if (res.data.success) {
        setOfflineSuccess(`Offline payment of ₹${Number(offlineAmount).toLocaleString('en-IN')} verified & credited! Official receipt: ${res.data.transaction?.receiptNumber}`);
        await fetchData();
        await fetchTransactions();
        setOfflineRef('');
        setOfflineRemarks('');
        setOfflineReceiptNo(`REC-OFF-${Date.now().toString().slice(-6)}`);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to record offline payment.');
    } finally {
      setRecordingOffline(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedFee || !paymentAmount) return;

    setRecordingPayment(true);
    setPaySuccess('');
    setError('');

    try {
      const res = await api.patch(`/fees/${selectedFee._id}/pay`, {
        paymentAmount: Number(paymentAmount),
        receiptNumber: receiptNumber || `REC-${Date.now().toString().slice(-6)}`,
        remarks: paymentRemarks
      });

      if (res.data.success) {
        setPaySuccess('Payment credited and balance recalculated!');
        await fetchData();
        setTimeout(() => {
          setSelectedFee(null);
          setPaySuccess('');
          setPaymentAmount('');
          setReceiptNumber('');
        }, 1200);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to record payment.');
    } finally {
      setRecordingPayment(false);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!newStudentId || !totalAmount || !dueDate) return;

    setCreatingInvoice(true);
    setCreateSuccess('');
    setError('');

    try {
      const res = await api.post('/fees', {
        studentId: newStudentId,
        feeType,
        semester: Number(semester),
        totalAmount: Number(totalAmount),
        dueDate
      });

      if (res.data.success) {
        setCreateSuccess('Fee invoice generated successfully!');
        await fetchData();
        setTimeout(() => {
          setShowCreateModal(false);
          setCreateSuccess('');
        }, 1200);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to generate invoice.');
    } finally {
      setCreatingInvoice(false);
    }
  };

  const fees = feeData?.fees || [];
  const totalReceivable = feeData?.totalReceivable ?? 0;
  const totalCollected = feeData?.totalCollected ?? 0;
  const totalOutstanding = feeData?.totalOutstanding ?? 0;

  return (
    <DashboardLayout
      title="University Bursar & Fee Operations"
      subtitle="Dynamic course fee structures, offline payment recording, and reconciled university ledger"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {structureSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{structureSuccess}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Billed Receivables</span>
          <h3 className="text-3xl font-black text-slate-900 mt-2">₹{totalReceivable.toLocaleString('en-IN')}</h3>
          <p className="text-xs text-slate-400 mt-1">Across all registered cohorts</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Collected Revenue</span>
          <h3 className="text-3xl font-black text-emerald-600 mt-2">₹{totalCollected.toLocaleString('en-IN')}</h3>
          <p className="text-xs text-slate-400 mt-1">Online & offline counter credits</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Outstanding Dues</span>
          <h3 className="text-3xl font-black text-rose-600 mt-2">₹{totalOutstanding.toLocaleString('en-IN')}</h3>
          <p className="text-xs text-slate-400 mt-1">Pending student clearance</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('structures')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'structures'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Course Fee Structures ({structures.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('offline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'offline'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Offline Payment Counter</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'invoices'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Student Invoices Ledger ({fees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'transactions'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Transactions & Ledger ({transactions.length})</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: DYNAMIC COURSE FEE STRUCTURES */}
      {/* ==================================================== */}
      {activeTab === 'structures' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Configured Course Fee Structures</h3>
              <p className="text-xs text-slate-500">
                Create semester-wise fee templates, publish official fee tariffs, and auto-assign dues to enrolled cohorts.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={fetchStructures}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                title="Refresh structures"
              >
                <RefreshCw className={`w-4 h-4 ${loadingStructures ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowCreateStructureModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Fee Structure</span>
              </button>
            </div>
          </div>

          {loadingStructures ? (
            <LoadingSkeleton count={3} />
          ) : structures.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-700">No Course Fee Structures Created</h4>
              <p className="text-xs text-slate-400 mt-1">
                Configure your first course-wise fee structure to begin automated student fee billing.
              </p>
              <button
                onClick={() => setShowCreateStructureModal(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500"
              >
                Create Fee Structure Now
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase">
                      <th className="pb-3">Structure Name / Course</th>
                      <th className="pb-3 text-center">Version</th>
                      <th className="pb-3 text-center">Semesters</th>
                      <th className="pb-3 text-right">Sem Mandatory</th>
                      <th className="pb-3 text-right">Annual Est.</th>
                      <th className="pb-3 text-center">Categories</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {structures.map((struct) => (
                      <tr key={struct._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 font-bold text-slate-900 pr-4">
                          <span>{struct.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold">
                              {struct.course}
                            </span>
                            <span className="text-slate-400 text-[11px] font-normal">
                              AY {struct.academicYear} • {struct.cohort || 'All Cohorts'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold text-[10px]">
                            v{struct.version || 1}
                          </span>
                        </td>
                        <td className="py-4 text-center text-slate-600">
                          {struct.semesters?.length > 0 ? struct.semesters.join(', ') : 'All'}
                        </td>
                        <td className="py-4 text-right font-black text-slate-900">
                          ₹{Number(struct.totalMandatorySemester || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 text-right font-bold text-slate-600">
                          ₹{Number(struct.totalAnnual || (struct.totalMandatorySemester * 2)).toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 text-center">
                          <button
                            onClick={() => setSelectedStructureForView(struct)}
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{struct.categories?.length || 0} items</span>
                          </button>
                        </td>
                        <td className="py-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                              struct.status === 'PUBLISHED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : struct.status === 'DRAFT'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {struct.status}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {struct.status === 'DRAFT' && (
                              <button
                                onClick={() => handlePublishStructure(struct._id)}
                                disabled={publishingId === struct._id}
                                className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors disabled:opacity-50"
                              >
                                {publishingId === struct._id ? 'Publishing...' : 'Publish'}
                              </button>
                            )}

                            {struct.status === 'PUBLISHED' && (
                              <button
                                onClick={() => setAssigningStructure(struct)}
                                className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
                              >
                                Assign Fees
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: OFFLINE PAYMENT RECORDING COUNTER */}
      {/* ==================================================== */}
      {activeTab === 'offline' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm max-w-3xl mx-auto">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h3 className="font-bold text-lg text-slate-900">Bursar Offline Payment & Receipt Counter</h3>
            <p className="text-xs text-slate-500 mt-1">
              Verify and credit payments received via Cash, Bank Transfer, Demand Draft, or Cheque. Generates authoritative receipts and credits ledger balances.
            </p>
          </div>

          {offlineSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              <span>{offlineSuccess}</span>
            </div>
          )}

          <form onSubmit={handleRecordOfflinePaymentSubmit} className="space-y-5">
            {/* Student Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Student</label>
              <select
                value={offlineStudentId}
                onChange={(e) => setOfflineStudentId(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500 bg-white"
              >
                {students.map((stud) => {
                  const uid = stud.user?._id || stud.user;
                  return (
                    <option key={stud._id} value={uid}>
                      {stud.user?.name || stud.rollNumber} • {stud.rollNumber} ({stud.course || 'BCA'})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Assessment Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Fee Assessment to Credit</label>
              {studentFeeRecords.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs">
                  This student has no outstanding fee assessments with a balance due.
                </div>
              ) : (
                <select
                  value={offlineFeeRecordId}
                  onChange={(e) => handleOfflineFeeChange(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500 bg-white font-mono"
                >
                  {studentFeeRecords.map((fee) => (
                    <option key={fee._id} value={fee._id}>
                      {fee.feeType} (Sem {fee.semester}) — Outstanding Balance: ₹{Number(fee.balanceAmount).toLocaleString('en-IN')} (Total: ₹{Number(fee.totalAmount).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Amount and Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Verified Payment Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={offlineAmount}
                  onChange={(e) => setOfflineAmount(e.target.value)}
                  placeholder="Enter amount credited"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Offline Payment Method</label>
                <select
                  value={offlineMethod}
                  onChange={(e) => setOfflineMethod(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="Cash">Cash (Counter Deposit)</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="Demand Draft">Demand Draft (DD)</option>
                  <option value="Cheque">University Cheque Deposit</option>
                  <option value="POS Machine">Campus POS Card Swipe</option>
                  <option value="UPI Offline">Counter QR UPI Credit</option>
                </select>
              </div>
            </div>

            {/* Reference and Receipt */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bank / Instrument Ref #</label>
                <input
                  type="text"
                  value={offlineRef}
                  onChange={(e) => setOfflineRef(e.target.value)}
                  placeholder="e.g. UTR-928410294 or DD-004921"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Official University Receipt No</label>
                <input
                  type="text"
                  required
                  value={offlineReceiptNo}
                  onChange={(e) => setOfflineReceiptNo(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Remarks and Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Date</label>
                <input
                  type="date"
                  required
                  value={offlineDate}
                  onChange={(e) => setOfflineDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bursar Remarks / Notes</label>
                <input
                  type="text"
                  value={offlineRemarks}
                  onChange={(e) => setOfflineRemarks(e.target.value)}
                  placeholder="e.g. Verified against SBI deposit counter slip"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={recordingOffline || studentFeeRecords.length === 0}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FileCheck className="w-4 h-4" />
                <span>{recordingOffline ? 'Recording Payment...' : 'Record Payment & Credit Balance'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: STUDENT INVOICES LEDGER */}
      {/* ==================================================== */}
      {activeTab === 'invoices' && (
        <>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 mb-8 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Student Invoices Ledger</h3>
              <p className="text-xs text-slate-500">Record incoming payments or issue new semester fee bills across all categories.</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Generate Invoice</span>
            </button>
          </div>

          {loading ? (
            <LoadingSkeleton count={4} />
          ) : fees.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-700">No Invoices on File</h4>
              <p className="text-xs text-slate-400 mt-1">Generate fee invoices to track student dues.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase">
                      <th className="pb-3">Student</th>
                      <th className="pb-3">Invoice Type</th>
                      <th className="pb-3 text-right">Billed</th>
                      <th className="pb-3 text-right">Paid</th>
                      <th className="pb-3 text-right">Balance Due</th>
                      <th className="pb-3 text-center">Receipt Number</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fees.map((f) => (
                      <tr key={f._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 font-bold text-slate-900">
                          {f.student?.name || 'Student'}
                          <span className="block font-normal text-[11px] text-slate-400 font-mono">
                            {f.student?.studentId || f.student?.email}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-700">
                          {f.feeType}
                          <span className="block text-[11px] text-slate-400">Sem {f.semester}</span>
                        </td>
                        <td className="py-3.5 text-right font-bold text-slate-900">
                          ₹{f.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 text-right font-bold text-emerald-600">
                          ₹{f.paidAmount.toLocaleString('en-IN')}
                          {(f.offlinePaidAmount > 0 || f.onlinePaidAmount > 0) && (
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {f.onlinePaidAmount > 0 && `Online: ₹${f.onlinePaidAmount.toLocaleString('en-IN')}`}
                              {f.onlinePaidAmount > 0 && f.offlinePaidAmount > 0 && ' • '}
                              {f.offlinePaidAmount > 0 && `Offline: ₹${f.offlinePaidAmount.toLocaleString('en-IN')}`}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-right font-bold text-rose-600">
                          ₹{f.balanceAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 text-center font-mono text-[11px] text-indigo-700 font-semibold">
                          {f.receiptNumber || 'None'}
                        </td>
                        <td className="py-3.5 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            f.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : f.status === 'Partial'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {f.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {f.paidAmount > 0 && (
                              <button
                                onClick={() => handleDownloadReceipt(f._id, f.receiptNumber)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
                                title="Download Receipt PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>PDF</span>
                              </button>
                            )}
                            {f.balanceAmount > 0 ? (
                              <button
                                onClick={() => {
                                  setSelectedFee(f);
                                  setPaymentAmount(f.balanceAmount);
                                  setReceiptNumber(`REC-${Date.now().toString().slice(-6)}`);
                                }}
                                className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
                              >
                                Record Payment
                              </button>
                            ) : (
                              <span className="text-[11px] font-semibold text-emerald-600">Cleared</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ==================================================== */}
      {/* TAB 4: TRANSACTIONS & AUDIT LEDGER */}
      {/* ==================================================== */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Payment Transactions & Audit Ledger</h3>
              <p className="text-xs text-slate-500">Live Razorpay gateway order captures, counter offline receipts, and settlement ledger.</p>
            </div>
            <button
              onClick={fetchTransactions}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          {loadingTransactions ? (
            <LoadingSkeleton count={4} />
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
              <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No payment transactions recorded yet</p>
              <p className="text-xs text-slate-400">Transactions processed online or offline will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase">
                    <th className="pb-3">Order ID / Ref</th>
                    <th className="pb-3 text-center">Channel</th>
                    <th className="pb-3">Student</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-center">Date</th>
                    <th className="pb-3 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5">
                        <span className="font-mono font-bold text-slate-900 block">{tx.orderId}</span>
                        {tx.paymentChannel === 'OFFLINE' ? (
                          <span className="font-mono text-[11px] text-emerald-700 font-medium block">
                            Method: {tx.paymentMethod} {tx.offlineReference ? `(${tx.offlineReference})` : ''}
                          </span>
                        ) : tx.paymentId ? (
                          <span className="font-mono text-[11px] text-indigo-600 font-medium block">
                            {tx.paymentId}
                          </span>
                        ) : (
                          <span className="font-mono text-[11px] text-slate-400 block">Pending Gateway</span>
                        )}
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          tx.paymentChannel === 'OFFLINE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          {tx.paymentChannel || 'ONLINE'}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="font-bold text-slate-900 block">{tx.student?.name || 'Student'}</span>
                        <span className="text-[11px] text-slate-400 block">{tx.student?.email}</span>
                      </td>
                      <td className="py-3.5 text-slate-700">
                        {tx.feeRecord?.feeType || 'University Fee'}
                        <span className="block text-[11px] text-slate-400">Sem {tx.feeRecord?.semester || '-'}</span>
                      </td>
                      <td className="py-3.5 text-right font-bold text-slate-900">
                        ₹{(tx.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          tx.status === 'captured'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : tx.status === 'created'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-center text-slate-500 text-[11px]">
                        {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3.5 text-center">
                        {tx.feeRecord?._id ? (
                          <button
                            onClick={() => handleDownloadReceipt(tx.feeRecord._id, tx.receiptNumber)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: VIEW STRUCTURE CATEGORIES */}
      {/* ==================================================== */}
      {selectedStructureForView && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl w-full shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedStructureForView.name}</h3>
                <p className="text-xs text-slate-500">
                  Course: {selectedStructureForView.course} • AY {selectedStructureForView.academicYear} • Version {selectedStructureForView.version}
                </p>
              </div>
              <button onClick={() => setSelectedStructureForView(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto my-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase">
                    <th className="pb-2">Component</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2 text-right">Amount</th>
                    <th className="pb-2 text-center">Frequency</th>
                    <th className="pb-2 text-center">Mandatory</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedStructureForView.categories || []).map((cat, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 font-bold text-slate-900">
                        {cat.categoryName || cat.feeType}
                        {cat.description && <span className="block font-normal text-[10px] text-slate-400">{cat.description}</span>}
                      </td>
                      <td className="py-2.5 text-slate-600">{cat.feeType}</td>
                      <td className="py-2.5 text-right font-black text-slate-900">₹{Number(cat.amount).toLocaleString('en-IN')}</td>
                      <td className="py-2.5 text-center text-slate-500">{cat.frequency || 'PER_SEMESTER'}</td>
                      <td className="py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cat.mandatory ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {cat.mandatory ? 'YES' : 'OPTIONAL'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedStructureForView(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ASSIGN STRUCTURE TO STUDENTS */}
      {/* ==================================================== */}
      {assigningStructure && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Assign Fee Structure</h3>
              <button onClick={() => setAssigningStructure(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Apply <strong className="text-slate-800">{assigningStructure.name}</strong> to enrolled students in <strong>{assigningStructure.course}</strong>. Assessments will be created idempotently without altering already settled records.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Semester</label>
              <select
                value={assignSemester}
                onChange={(e) => setAssignSemester(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-white"
              >
                {(assigningStructure.semesters || [1, 2, 3, 4, 5, 6, 7, 8]).map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAssigningStructure(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignStructureToStudents}
                disabled={assigningLoading}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
              >
                {assigningLoading ? 'Assigning...' : 'Assign Fee Assessments'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: CREATE FEE STRUCTURE */}
      {/* ==================================================== */}
      {showCreateStructureModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Define New Course Fee Structure</h3>
                <p className="text-xs text-slate-500">Configure semester-wise financial assessments, registration fees, and optional hostel charges.</p>
              </div>
              <button onClick={() => setShowCreateStructureModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStructure} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fee Structure Title</label>
                <input
                  type="text"
                  required
                  value={structName}
                  onChange={(e) => setStructName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    value={structCourse}
                    onChange={(e) => setStructCourse(e.target.value)}
                    placeholder="BCA"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course Name</label>
                  <input
                    type="text"
                    required
                    value={structCourseName}
                    onChange={(e) => setStructCourseName(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    required
                    value={structAcademicYear}
                    onChange={(e) => setStructAcademicYear(e.target.value)}
                    placeholder="2026-2027"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={structDepartment}
                    onChange={(e) => setStructDepartment(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semesters (Comma separated)</label>
                  <input
                    type="text"
                    required
                    value={structSemesters}
                    onChange={(e) => setStructSemesters(e.target.value)}
                    placeholder="1, 2, 3, 4, 5, 6"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cohort Batch</label>
                  <input
                    type="text"
                    value={structCohort}
                    onChange={(e) => setStructCohort(e.target.value)}
                    placeholder="2026 Batch"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Dynamic Categories Builder */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-800">Fee Components & Tariffs ({structCategories.length})</label>
                  <button
                    type="button"
                    onClick={() => setStructCategories([...structCategories, { feeType: 'Tuition Fee', categoryName: 'New Assessment Component', amount: 5000, frequency: 'PER_SEMESTER', mandatory: true }])}
                    className="text-xs text-indigo-600 font-bold hover:underline"
                  >
                    + Add Component
                  </button>
                </div>

                <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50 max-h-56 overflow-y-auto">
                  {structCategories.map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                      <select
                        value={cat.feeType}
                        onChange={(e) => {
                          const updated = [...structCategories];
                          updated[idx].feeType = e.target.value;
                          setStructCategories(updated);
                        }}
                        className="border border-slate-300 rounded px-2 py-1 bg-white text-xs"
                      >
                        <option value="Registration Fee">Registration Fee</option>
                        <option value="Tuition Fee">Tuition Fee</option>
                        <option value="Examination Fee">Examination Fee</option>
                        <option value="Lab Fee">Lab Fee</option>
                        <option value="Library Fee">Library Fee</option>
                        <option value="Hostel Fee">Hostel Fee</option>
                        <option value="Transport Fee">Transport Fee</option>
                        <option value="Other">Other</option>
                      </select>

                      <input
                        type="text"
                        value={cat.categoryName}
                        onChange={(e) => {
                          const updated = [...structCategories];
                          updated[idx].categoryName = e.target.value;
                          setStructCategories(updated);
                        }}
                        placeholder="Component description"
                        className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs"
                      />

                      <input
                        type="number"
                        min="0"
                        value={cat.amount}
                        onChange={(e) => {
                          const updated = [...structCategories];
                          updated[idx].amount = Number(e.target.value);
                          setStructCategories(updated);
                        }}
                        placeholder="Amount"
                        className="w-24 border border-slate-300 rounded px-2 py-1 text-xs text-right font-bold"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          if (structCategories.length > 1) {
                            setStructCategories(structCategories.filter((_, i) => i !== idx));
                          }
                        }}
                        className="text-rose-500 hover:text-rose-700 px-1 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateStructureModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingStructure}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                >
                  {creatingStructure ? 'Creating...' : 'Save Draft Fee Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: RECORD PAYMENT (FROM INVOICE TABLE) */}
      {/* ==================================================== */}
      {selectedFee && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900">Record Fee Payment</h3>
              <button onClick={() => setSelectedFee(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Student: <strong className="text-slate-800">{selectedFee.student?.name}</strong> • Balance Due: <strong className="text-rose-600">₹{selectedFee.balanceAmount.toLocaleString('en-IN')}</strong>
            </p>

            {paySuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{paySuccess}</span>
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  max={selectedFee.balanceAmount}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt / Transaction No.</label>
                <input
                  type="text"
                  required
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Remarks</label>
                <input
                  type="text"
                  value={paymentRemarks}
                  onChange={(e) => setPaymentRemarks(e.target.value)}
                  placeholder="e.g. Bank Transfer Ref #92831"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFee(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingPayment}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                >
                  {recordingPayment ? 'Processing...' : 'Credit Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: GENERATE INVOICE */}
      {/* ==================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Issue Fee Invoice</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{createSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Student</label>
                <select
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-white"
                >
                  {students.map((stud) => {
                    const uid = stud.user?._id || stud.user;
                    return (
                      <option key={stud._id} value={uid}>
                        {stud.user?.name || stud.rollNumber} ({stud.rollNumber})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fee Category</label>
                  <select
                    value={feeType}
                    onChange={(e) => setFeeType(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="Registration Fee">Registration Fee</option>
                    <option value="Academic Fees">Academic Fees</option>
                    <option value="Debarred Fees">Debarred Fees</option>
                    <option value="Hostel Fees">Hostel Fees</option>
                    <option value="Transportation Fees">Transportation Fees</option>
                    <option value="Backlogs Fees">Backlogs Fees</option>
                    <option value="Miscellaneous Fees">Miscellaneous Fees</option>
                    <option value="Tuition Fee">Tuition Fee (Legacy)</option>
                    <option value="Hostel Fee">Hostel Fee (Legacy)</option>
                    <option value="Examination Fee">Examination Fee (Legacy)</option>
                    <option value="Library Deposit">Library Deposit (Legacy)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    required
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Fee Amount (₹)</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingInvoice}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                >
                  {creatingInvoice ? 'Issuing...' : 'Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminFeesPage;
