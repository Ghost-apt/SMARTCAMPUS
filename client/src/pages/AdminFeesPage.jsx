import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { CreditCard, PlusCircle, CheckCircle2, Clock, AlertCircle, X, DollarSign } from 'lucide-react';

const AdminFeesPage = () => {
  const [feeData, setFeeData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Payment Modal State
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [paySuccess, setPaySuccess] = useState('');

  // Create Invoice Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStudentId, setNewStudentId] = useState('');
  const [feeType, setFeeType] = useState('Tuition Fee');
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
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to load fee management data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      subtitle="Issue fee invoices, process student installment receipts, and balance institutional ledger"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
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
          <p className="text-xs text-slate-400 mt-1">Verified bank credits</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Outstanding Dues</span>
          <h3 className="text-3xl font-black text-rose-600 mt-2">₹{totalOutstanding.toLocaleString('en-IN')}</h3>
          <p className="text-xs text-slate-400 mt-1">Pending student clearance</p>
        </div>
      </div>

      {/* Control Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 mb-8 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-slate-900">Student Invoices Ledger</h3>
          <p className="text-xs text-slate-500">Record incoming payments or issue new semester fee bills.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Generate Invoice</span>
        </button>
      </div>

      {/* Fees Table */}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
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

      {/* Generate Invoice Modal */}
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
                    <option value="Tuition Fee">Tuition Fee</option>
                    <option value="Hostel Fee">Hostel Fee</option>
                    <option value="Examination Fee">Examination Fee</option>
                    <option value="Library Deposit">Library Deposit</option>
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
