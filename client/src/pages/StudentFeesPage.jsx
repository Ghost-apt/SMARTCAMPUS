import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { CreditCard, CheckCircle2, Clock, AlertTriangle, FileText, Download, AlertCircle } from 'lucide-react';

const StudentFeesPage = () => {
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await api.get('/fees/my');
        if (res.data.success) {
          setFeeData(res.data);
        }
      } catch (err) {
        setError(err.userMessage || 'Failed to load fee records.');
      } finally {
        setLoading(false);
      }
    };

    fetchFees();
  }, []);

  const totalBilled = feeData?.totalBilled ?? 0;
  const totalPaid = feeData?.totalPaid ?? 0;
  const totalBalance = feeData?.totalBalance ?? 0;
  const fees = feeData?.fees || [];

  return (
    <DashboardLayout
      title="Fee Management & Payment Receipts"
      subtitle="Tuition installments, university dues, and official transaction receipts"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Billed Fees</span>
          <h3 className="text-3xl font-black text-slate-900 mt-2">₹{totalBilled.toLocaleString('en-IN')}</h3>
          <p className="text-xs text-slate-400 mt-1">Semester 5 Annual Invoices</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Cleared</span>
          <h3 className="text-3xl font-black text-emerald-600 mt-2">₹{totalPaid.toLocaleString('en-IN')}</h3>
          <p className="text-xs text-slate-400 mt-1">Confirmed payments received</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Outstanding Balance</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              totalBalance === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}>
              {totalBalance === 0 ? 'Fully Paid' : 'Due'}
            </span>
          </div>
          <h3 className={`text-3xl font-black mt-2 ${totalBalance === 0 ? 'text-teal-600' : 'text-rose-600'}`}>
            ₹{totalBalance.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Pending finance clearance</p>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : fees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">No Fee Records Found</h4>
          <p className="text-xs text-slate-400 mt-1">You do not have any pending fee invoices at this time.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <h3 className="font-bold text-base text-slate-900 mb-4">Official Fee Invoices & Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase">
                  <th className="pb-3">Invoice Type</th>
                  <th className="pb-3 text-center">Semester</th>
                  <th className="pb-3 text-right">Total Amount</th>
                  <th className="pb-3 text-right">Paid Amount</th>
                  <th className="pb-3 text-right">Balance Due</th>
                  <th className="pb-3 text-center">Due Date</th>
                  <th className="pb-3 text-center">Receipt No</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fees.map((fee) => (
                  <tr key={fee._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 font-bold text-slate-900">
                      {fee.feeType}
                      <span className="block font-normal text-[11px] text-slate-400">
                        {fee.remarks || 'Standard Semester Fee'}
                      </span>
                    </td>
                    <td className="py-3.5 text-center text-slate-600 font-medium">
                      Sem {fee.semester}
                    </td>
                    <td className="py-3.5 text-right font-bold text-slate-900">
                      ₹{fee.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 text-right font-bold text-emerald-600">
                      ₹{fee.paidAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 text-right font-bold text-rose-600">
                      ₹{fee.balanceAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 text-center text-slate-500">
                      {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'N/A'}
                    </td>
                    <td className="py-3.5 text-center font-mono text-[11px] text-indigo-700 font-semibold">
                      {fee.receiptNumber || 'Pending'}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        fee.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : fee.status === 'Partial'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {fee.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentFeesPage;

