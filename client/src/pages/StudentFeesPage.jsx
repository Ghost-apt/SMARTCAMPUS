import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Download,
  AlertCircle,
  Building2,
  QrCode,
  ShieldCheck,
  Calendar,
  Sparkles,
  Receipt,
  Layers,
  ArrowDownRight,
  Info,
  History,
  X,
  ArrowRight
} from 'lucide-react';
import SmartCampusLogo from '../components/SmartCampusLogo';

const StudentFeesPage = () => {
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('structure'); // 'structure' or 'ledger'
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [payingFeeId, setPayingFeeId] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [confirmPaymentFee, setConfirmPaymentFee] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingTxns, setLoadingTxns] = useState(false);
  const [txError, setTxError] = useState('');

  const [structureData, setStructureData] = useState(null);

  const fetchFees = async () => {
    try {
      const [myRes, structRes] = await Promise.allSettled([
        api.get('/fees/my'),
        api.get('/fees/structure')
      ]);
      if (myRes.status === 'fulfilled' && myRes.value.data.success) {
        setFeeData(myRes.value.data);
      }
      if (structRes.status === 'fulfilled' && structRes.value.data.success) {
        setStructureData(structRes.value.data);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to load fee records.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoadingTxns(true);
    setTxError('');
    try {
      const res = await api.get('/fees/me/payments');
      if (res.data.success) {
        setTransactions(res.data.transactions || []);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.userMessage || err.message || 'Could not fetch transaction history.';
      setTxError(msg);
      setTransactions([]);
      console.warn('Could not fetch transaction history:', msg);
    } finally {
      setLoadingTxns(false);
    }
  };

  useEffect(() => {
    fetchFees();
    fetchTransactions();
  }, []);

  const handleRazorpayPay = async (fee) => {
    try {
      setPaymentProcessing(true);
      setPayingFeeId(fee._id);
      setError('');
      setPaymentSuccess('');

      // 1. Request authoritative server-signed order
      const orderRes = await api.post('/fees/order', {
        feeId: fee._id
      });

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Failed to create payment order.');
      }

      const { orderId, amountPaise, amount, currency, receiptNumber, keyId } = orderRes.data;

      // 2. Check if Razorpay SDK script is available in browser
      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Razorpay Checkout SDK is loading or unavailable. Please reload the page.');
      }

      const activeKey = import.meta.env.VITE_RAZORPAY_KEY_ID || keyId;
      if (!activeKey) {
        throw new Error('Payment gateway configuration is missing. Please contact university finance administration.');
      }

      const options = {
        key: activeKey,
        amount: amountPaise,
        currency: currency || 'INR',
        name: 'SmartCampus University',
        description: `${fee.feeType} (Sem ${fee.semester}) • Receipt ${receiptNumber}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            setPaymentProcessing(true);
            // 3. Cryptographically verify signature on backend
            const verifyRes = await api.post('/fees/verify', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              setPaymentSuccess(
                `Payment of ₹${amount.toLocaleString('en-IN')} confirmed! Transaction ID: ${response.razorpay_payment_id}`
              );
              await fetchFees();
              await fetchTransactions();
            } else {
              setError(verifyRes.data.message || 'Payment verification could not be confirmed.');
            }
          } catch (verErr) {
            setError(
              verErr.response?.data?.message || verErr.message || 'Signature verification failed on the server.'
            );
          } finally {
            setPaymentProcessing(false);
            setPayingFeeId(null);
          }
        },
        prefill: {
          name: feeData?.studentName || '',
          email: feeData?.studentEmail || ''
        },
        notes: {
          feeId: fee._id,
          feeType: fee.feeType,
          semester: String(fee.semester)
        },
        theme: {
          color: '#4F46E5'
        },
        modal: {
          ondismiss: () => {
            setPaymentProcessing(false);
            setPayingFeeId(null);
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', (failRes) => {
        setError(`Payment failed: ${failRes.error?.description || 'Transaction declined by gateway.'}`);
        setPaymentProcessing(false);
        setPayingFeeId(null);
      });
      rzpInstance.open();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not initiate payment order.');
      setPaymentProcessing(false);
      setPayingFeeId(null);
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
      setDownloadSuccess(`Official PDF Receipt (${receiptNo || feeId}) downloaded.`);
      setTimeout(() => setDownloadSuccess(''), 4000);
    } catch (err) {
      setError('Failed to download fee receipt. Please verify invoice clearance status.');
    }
  };

  const totalBilled = feeData?.totalBilled ?? 0;
  const totalPaid = feeData?.totalPaid ?? 0;
  const totalBalance = feeData?.totalBalance ?? 0;
  const fees = feeData?.fees || [];

  // University Approved Fee Structure aligned with backend FeeRecord.feeType schema
  const feeStructureItems = structureData?.feeStructure || [
    {
      feeType: 'Tuition Fee',
      componentName: 'Academic Tuition & Instruction Fee',
      amount: 45000,
      frequency: 'Per Semester',
      mandatory: true,
      category: 'Mandatory Tuition',
      description: 'Major credit lectures, professor mentorship, curriculum delivery, and ongoing internal continuous assessments.'
    },
    {
      feeType: 'Examination Fee',
      componentName: 'University Examination & Assessment Fee',
      amount: 2500,
      frequency: 'Per Semester',
      mandatory: true,
      category: 'Mandatory Examination',
      description: 'Mid-term evaluations, semester terminal examinations, central grading, and UGC 10-point GPA transcript generation.'
    },
    {
      feeType: 'Lab Fee',
      componentName: 'Computer Science Lab & Cloud Sandbox',
      amount: 3500,
      frequency: 'Per Semester',
      mandatory: true,
      category: 'Laboratory & Compute',
      description: 'Access to high-performance labs, Docker container sandboxes, AI GPU compute instances, and development workstations.'
    },
    {
      feeType: 'Library Fee',
      componentName: 'Library & Digital E-Resource Access',
      amount: 1500,
      frequency: 'Per Semester',
      mandatory: true,
      category: 'Library & Subscriptions',
      description: 'Central university library borrowing, IEEE Xplore digital library access, ACM subscriptions, and research databases.'
    },
    {
      feeType: 'Hostel Fee',
      componentName: 'Campus Residential Hostel & Dining (Optional)',
      amount: 30000,
      frequency: 'Per Semester (Optional)',
      mandatory: false,
      category: 'Residential & Boarding',
      description: 'Air-conditioned double-sharing room, mess dining facilities, high-speed Wi-Fi, and 24/7 power backup.'
    },
    {
      feeType: 'Other',
      componentName: 'Student Welfare, Sports & Campus Infrastructure',
      amount: 1500,
      frequency: 'Per Academic Year',
      mandatory: true,
      category: 'Institutional Development',
      description: 'University sports complex facilities, annual technical symposiums, student health insurance, and campus maintenance.'
    }
  ];

  const semTotalFee = structureData?.totalMandatorySemester || feeStructureItems
    .filter((f) => f.mandatory && (f.frequency || '').includes('Semester'))
    .reduce((acc, item) => acc + item.amount, 0);

  const annualTotalFee = structureData?.totalAnnualMandatory || feeStructureItems
    .filter((f) => f.mandatory)
    .reduce((acc, item) => acc + ((item.frequency || '').includes('Semester') ? item.amount * 2 : item.amount), 0);

  const handleSimulateDownload = (title) => {
    setDownloadSuccess(`Generated official statement: "${title}". Downloading PDF...`);
    setTimeout(() => {
      setDownloadSuccess('');
    }, 3500);
  };

  return (
    <DashboardLayout
      title="Fee Management & Academic Fee Structure"
      subtitle="University approved tuition breakdown, payment installment schedules, and official transaction receipts"
    >
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {downloadSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Institutional Finance Office Banner */}
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#07162E] via-[#0B2347] to-[#173F78] text-white border border-[#D9AE4B]/30 shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block flex-shrink-0">
            <SmartCampusLogo variant="crest" size="md" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D9AE4B] px-2 py-0.5 rounded bg-[#D9AE4B]/15 border border-[#D9AE4B]/30">
                University Bursar & Finance Office
              </span>
              <span className="text-xs text-slate-300 font-medium">BCA Department • Session 2026-27</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#F8F6F0] mt-1">
              Semester-Wise Fee Assessments & Payment Gateway
            </h2>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-right">
          <span className="text-[11px] font-bold text-[#D9AE4B] tracking-wider uppercase">
            Razorpay Secure • 256-Bit SSL
          </span>
        </div>
      </div>

      {/* Metric Cards Banner (6 Critical Institutional Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 mb-8">
        {/* 1. Total Assessed */}
        <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200 dark:border-[#232D48] p-4 shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#9BA8C7]">
              Total Assessed
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1.5">
            ₹{totalBilled.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-[#9BA8C7] mt-0.5">All semesters billed</p>
        </div>

        {/* 2. Total Paid */}
        <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200 dark:border-[#232D48] p-4 shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#9BA8C7]">
              Total Paid
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
            ₹{totalPaid.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-[#9BA8C7] mt-0.5">Cleared payments</p>
        </div>

        {/* 3. Total Outstanding */}
        <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200 dark:border-[#232D48] p-4 shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#9BA8C7]">
              Total Outstanding
            </span>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                totalBalance === 0
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                  : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
              }`}
            >
              {totalBalance === 0 ? 'Clear' : 'Due'}
            </span>
          </div>
          <h3
            className={`text-xl sm:text-2xl font-black mt-1.5 ${
              totalBalance === 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            ₹{totalBalance.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-[#9BA8C7] mt-0.5">Net balance due</p>
        </div>

        {/* 4. Overdue Amount */}
        <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200 dark:border-[#232D48] p-4 shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#9BA8C7]">
              Overdue Amount
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-rose-500 dark:text-rose-400 mt-1.5">
            ₹{Number(feeData?.overdueAmount || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-[#9BA8C7] mt-0.5">Passed due date</p>
        </div>

        {/* 5. Current Semester Outstanding */}
        <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200 dark:border-[#232D48] p-4 shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#9BA8C7]">
              Current Sem Dues
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1.5">
            ₹{Number(feeData?.currentSemesterOutstanding || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-[#9BA8C7] mt-0.5">
            Semester {feeData?.currentSemester || 5}
          </p>
        </div>

        {/* 6. Previous Semester Outstanding */}
        <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200 dark:border-[#232D48] p-4 shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#9BA8C7]">
              Prior Sem Dues
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1.5">
            ₹{Number(feeData?.previousSemesterOutstanding || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-[#9BA8C7] mt-0.5">Arrears / backlogs</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-[#232D48] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('structure')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'structure'
              ? 'bg-gradient-to-r from-[#6C8CFF] to-[#43D9FF] text-slate-950 shadow-md'
              : 'text-slate-600 dark:text-[#9BA8C7] hover:text-white hover:bg-slate-100 dark:hover:bg-[#18233B]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Course Fee Structure (BCA)</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'ledger'
              ? 'bg-gradient-to-r from-[#6C8CFF] to-[#43D9FF] text-slate-950 shadow-md'
              : 'text-slate-600 dark:text-[#9BA8C7] hover:text-white hover:bg-slate-100 dark:hover:bg-[#18233B]'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Fee Invoices & Categories</span>
          {fees.length > 0 && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeTab === 'ledger'
                  ? 'bg-slate-950/20 text-slate-950 font-black'
                  : 'bg-indigo-500/20 text-indigo-400'
              }`}
            >
              {fees.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('history');
            fetchTransactions();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-gradient-to-r from-[#6C8CFF] to-[#43D9FF] text-slate-950 shadow-md'
              : 'text-slate-600 dark:text-[#9BA8C7] hover:text-white hover:bg-slate-100 dark:hover:bg-[#18233B]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Payment History & Receipts</span>
          {transactions.length > 0 && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeTab === 'history'
                  ? 'bg-slate-950/20 text-slate-950 font-black'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {transactions.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: ACADEMIC FEE STRUCTURE */}
      {activeTab === 'structure' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-[#0D1224] via-[#121A2E] to-[#0D1224] rounded-2xl border border-[#232D48] p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#43D9FF]/15 text-[#43D9FF] border border-[#43D9FF]/30 text-[11px] font-bold">
                  Official University Schedule
                </span>
                <span className="text-xs text-slate-400">Academic Year 2026–2027</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Bachelor of Computer Applications (BCA)
              </h3>
              <p className="text-xs text-slate-300 dark:text-[#9BA8C7] mt-1">
                Standard approved fee schedule per semester and academic session. Dues are billed at semester registration.
              </p>
            </div>
            <button
              onClick={() => handleSimulateDownload('BCA_Approved_Fee_Structure_2026_27.pdf')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-300 border border-white/10 hover:border-cyan-400/40 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF</span>
            </button>
          </div>

          {/* Fee Components Table */}
          <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200 dark:border-[#232D48] p-6 shadow-sm">
            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#43D9FF]" />
              <span>Component-wise Fee Breakdown</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#232D48] text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Component Description</th>
                    <th className="pb-3 text-center">Frequency</th>
                    <th className="pb-3 text-right">Per Semester (₹)</th>
                    <th className="pb-3 text-right">Annual Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1C2640]">
                  {feeStructureItems.map((item, idx) => {
                    const semAmt = Number(item.amount || item.semAmount || 0);
                    const annAmt = Number(item.annualAmount || (item.frequency?.includes('Semester') ? semAmt * 2 : semAmt));
                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-[#18233B]/50 transition-colors">
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                              {item.componentName || item.component}
                            </span>
                            {item.feeType && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                                {item.feeType}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-[#9BA8C7] mt-0.5 block">
                            {item.description}
                          </span>
                        </td>
                        <td className="py-3.5 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#18233B] text-slate-700 dark:text-slate-300 text-[10px] font-semibold border border-slate-200 dark:border-[#2A3654]">
                            {item.category || item.frequency}
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                          ₹{semAmt.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 text-right font-bold text-indigo-600 dark:text-[#6C8CFF] text-xs sm:text-sm">
                          ₹{annAmt.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Totals Row */}
                  <tr className="border-t-2 border-slate-300 dark:border-[#2A3654] bg-slate-50/50 dark:bg-[#162035]/60 font-black">
                    <td className="py-4 text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                      Total Course Fee Structure
                    </td>
                    <td className="py-4 text-center text-slate-500 dark:text-[#9BA8C7] text-xs">
                      2 Semesters / Year
                    </td>
                    <td className="py-4 text-right text-base text-slate-900 dark:text-white">
                      ₹{semTotalFee.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 text-right text-base text-emerald-600 dark:text-emerald-400">
                      ₹{annualTotalFee.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Schedules & Bank Details Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Installment Milestones */}
            <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200 dark:border-[#232D48] p-5 sm:p-6 shadow-sm">
              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>Semester Installment Due Dates</span>
              </h4>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#162035] border border-slate-200/80 dark:border-[#232D48]">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span>Installment 1 (Tuition & Registration)</span>
                    <span className="text-emerald-600 dark:text-emerald-400">₹45,000</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-[#9BA8C7] mt-1">
                    Due at the time of semester enrollment (Before August 30). Required for class allotment.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#162035] border border-slate-200/80 dark:border-[#232D48]">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span>Installment 2 (Exam & Lab Assessment)</span>
                    <span className="text-amber-600 dark:text-amber-400">₹7,500</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-[#9BA8C7] mt-1">
                    Due 14 days before mid-semester examinations. Mandatory for Examination Hall Ticket generation.
                  </p>
                </div>
              </div>
            </div>

            {/* Official Bank Account / UPI Transfer Details */}
            <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200 dark:border-[#232D48] p-5 sm:p-6 shadow-sm">
              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>Official University Remittance Details</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#1C2640]">
                  <span className="text-slate-500 dark:text-[#9BA8C7]">Account Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">SmartCampus University Central Finance</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#1C2640]">
                  <span className="text-slate-500 dark:text-[#9BA8C7]">Bank & Branch</span>
                  <span className="font-bold text-slate-900 dark:text-white">State Bank of India (Campus Branch)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#1C2640]">
                  <span className="text-slate-500 dark:text-[#9BA8C7]">Account Number</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">3948201948201</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#1C2640]">
                  <span className="text-slate-500 dark:text-[#9BA8C7]">IFSC Code</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">SBIN0004921</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 dark:text-[#9BA8C7]">UPI Virtual ID</span>
                  <span className="font-mono font-bold text-[#43D9FF]">fees@smartcampus.edu</span>
                </div>
              </div>
              <div className="mt-3 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300 flex items-center gap-2">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>Quote your Student Roll Number in the payment remarks to ensure instant clearance.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVOICES & TRANSACTION LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          {/* 7 Recognized University Categories Overview & 1-Click Filters */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Institutional Fee Categories Breakdown</span>
              </span>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-[11px] font-bold text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Reset Category</span>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {[
                { id: 'Debarred Fees', label: '1. Debarred Fees' },
                { id: 'Academic Fees', label: '2. Academic Fees' },
                { id: 'Hostel Fees', label: '3. Hostel Fees' },
                { id: 'Transportation Fees', label: '4. Transport Fees' },
                { id: 'Backlogs Fees', label: '5. Backlogs Fees' },
                { id: 'Miscellaneous Fees', label: '6. Misc Fees' },
                { id: 'TOTAL_OUTSTANDING', label: '7. Net Balance Due', isTotal: true }
              ].map((cat) => {
                const isSelected = selectedCategory === cat.id;
                let dueAmt = 0;
                if (cat.isTotal) {
                  dueAmt = totalBalance;
                } else {
                  const matched = fees.filter((f) => {
                    if (cat.id === 'Academic Fees') return f.feeType === 'Academic Fees' || f.feeType === 'Tuition Fee';
                    if (cat.id === 'Hostel Fees') return f.feeType === 'Hostel Fees' || f.feeType === 'Hostel Fee';
                    if (cat.id === 'Transportation Fees') return f.feeType === 'Transportation Fees' || f.feeType === 'Transport Fee';
                    if (cat.id === 'Debarred Fees') return f.feeType === 'Debarred Fees' || f.feeType === 'Debarred Fee';
                    if (cat.id === 'Backlogs Fees') return f.feeType === 'Backlogs Fees' || f.feeType === 'Backlog Fee';
                    if (cat.id === 'Miscellaneous Fees') return f.feeType === 'Miscellaneous Fees' || f.feeType === 'Other';
                    return f.feeType === cat.id;
                  });
                  dueAmt = matched.reduce((sum, f) => sum + (Number(f.balanceAmount) || 0), 0);
                }

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (cat.isTotal) {
                        setSelectedCategory('all');
                      } else {
                        setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id);
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'ring-2 ring-indigo-500 bg-indigo-500/10 border-indigo-500/30 shadow-sm'
                        : 'bg-white dark:bg-[#121A2E] border-slate-200 dark:border-[#232D48] hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-500 dark:text-[#9BA8C7] block truncate">
                      {cat.label}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-1 block">
                      ₹{dueAmt.toLocaleString('en-IN')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : fees.length === 0 ? (
            <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-dashed border-slate-300 dark:border-[#232D48] p-12 text-center">
              <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-900 dark:text-white">No Fee Invoices Found</h4>
              <p className="text-xs text-slate-500 dark:text-[#9BA8C7] mt-1">
                You do not have any pending fee invoices at this time. All cleared!
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200 dark:border-[#232D48] p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-[#1C2640]">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Official Fee Invoices & Assessments
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-indigo-400" />
                      Razorpay Gateway Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-[#9BA8C7]">
                    Real-time authoritative fee assessments. Select Pay Online to settle dues via Razorpay test mode.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end flex-wrap">
                  {/* Academic Year Filter */}
                  <div className="flex items-center gap-1.5">
                    <label htmlFor="year-filter" className="text-xs font-semibold text-slate-500 dark:text-[#9BA8C7]">
                      Year:
                    </label>
                    <select
                      id="year-filter"
                      value={selectedAcademicYear}
                      onChange={(e) => setSelectedAcademicYear(e.target.value)}
                      className="bg-slate-50 dark:bg-[#18233B] border border-slate-200 dark:border-[#2A3654] text-slate-900 dark:text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Sessions</option>
                      <option value="2026-2027">AY 2026-2027</option>
                      <option value="2025-2026">AY 2025-2026</option>
                    </select>
                  </div>

                  {/* Semester Filter */}
                  <div className="flex items-center gap-1.5">
                    <label htmlFor="sem-filter" className="text-xs font-semibold text-slate-500 dark:text-[#9BA8C7]">
                      Semester:
                    </label>
                    <select
                      id="sem-filter"
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      className="bg-slate-50 dark:bg-[#18233B] border border-slate-200 dark:border-[#2A3654] text-slate-900 dark:text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Semesters</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={String(sem)}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => handleSimulateDownload('Semester_5_Complete_Fee_Statement.pdf')}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#18233B] hover:bg-slate-200 dark:hover:bg-[#202E4C] text-slate-800 dark:text-[#9BA8C7] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-[#2A3654]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Statement</span>
                  </button>
                </div>
              </div>

              {/* Invoices Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-[#232D48] text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-3">Invoice & Category</th>
                      <th className="pb-3 text-center">Session / Sem</th>
                      <th className="pb-3 text-right">Assessed</th>
                      <th className="pb-3 text-right">Concession</th>
                      <th className="pb-3 text-right">Paid</th>
                      <th className="pb-3 text-right">Balance Due</th>
                      <th className="pb-3 text-center">Due Date</th>
                      <th className="pb-3 text-center">Receipt No</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#1C2640]">
                    {fees
                      .filter((fee) => {
                        const matchSem = selectedSemester === 'all' || String(fee.semester) === String(selectedSemester);
                        const matchYear = selectedAcademicYear === 'all' || (fee.academicYear || '2026-2027') === selectedAcademicYear;
                        let matchCat = true;
                        if (selectedCategory !== 'all') {
                          if (selectedCategory === 'Academic Fees') matchCat = fee.feeType === 'Academic Fees' || fee.feeType === 'Tuition Fee';
                          else if (selectedCategory === 'Hostel Fees') matchCat = fee.feeType === 'Hostel Fees' || fee.feeType === 'Hostel Fee';
                          else if (selectedCategory === 'Transportation Fees') matchCat = fee.feeType === 'Transportation Fees' || fee.feeType === 'Transport Fee';
                          else if (selectedCategory === 'Debarred Fees') matchCat = fee.feeType === 'Debarred Fees' || fee.feeType === 'Debarred Fee';
                          else if (selectedCategory === 'Backlogs Fees') matchCat = fee.feeType === 'Backlogs Fees' || fee.feeType === 'Backlog Fee';
                          else if (selectedCategory === 'Miscellaneous Fees') matchCat = fee.feeType === 'Miscellaneous Fees' || fee.feeType === 'Other';
                          else matchCat = fee.feeType === selectedCategory;
                        }
                        return matchSem && matchYear && matchCat;
                      })
                      .map((fee) => {
                        const balance = Number(fee.balanceAmount ?? (fee.totalAmount - (fee.concessionAmount || 0) - fee.paidAmount));
                        const isPaid = fee.status === 'Paid' || balance <= 0;
                        const hasReceipt = Boolean(fee.receiptNumber);

                        const getCategoryBadgeClass = (type) => {
                          switch (type) {
                            case 'Academic Fees':
                            case 'Tuition Fee':
                              return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                            case 'Hostel Fees':
                            case 'Hostel Fee':
                              return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                            case 'Transportation Fees':
                            case 'Transportation Fee':
                              return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                            case 'Debarred Fees':
                            case 'Debarred Fee':
                              return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                            case 'Backlogs Fees':
                            case 'Backlog Fee':
                              return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                            case 'Miscellaneous Fees':
                            case 'Miscellaneous Fee':
                            default:
                              return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
                          }
                        };

                        return (
                          <tr key={fee._id} className="hover:bg-slate-50/70 dark:hover:bg-[#18233B]/50 transition-colors">
                            <td className="py-3.5 pr-4">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 dark:text-white block text-xs sm:text-sm">
                                  {fee.feeType}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeClass(
                                    fee.feeType
                                  )}`}
                                >
                                  {fee.feeType}
                                </span>
                              </div>
                              <span className="block font-normal text-[11px] text-slate-500 dark:text-[#9BA8C7] mt-0.5">
                                {fee.remarks || `AY ${fee.academicYear || '2026-2027'} Assessment`}
                              </span>
                            </td>
                            <td className="py-3.5 text-center text-slate-600 dark:text-slate-300 font-medium">
                              <div>Sem {fee.semester}</div>
                              <span className="text-[10px] text-slate-400 block">{fee.academicYear || '2026-2027'}</span>
                            </td>
                            <td className="py-3.5 text-right font-bold text-slate-900 dark:text-white">
                              ₹{Number(fee.totalAmount || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 text-right font-medium text-slate-500 dark:text-slate-400">
                              {fee.concessionAmount > 0 ? (
                                <span className="text-emerald-500 font-semibold">
                                  -₹{Number(fee.concessionAmount).toLocaleString('en-IN')}
                                </span>
                              ) : (
                                '₹0'
                              )}
                            </td>
                            <td className="py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                              ₹{Number(fee.paidAmount || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 text-right font-bold text-rose-600 dark:text-rose-400">
                              ₹{balance.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 text-center text-slate-500 dark:text-[#9BA8C7]">
                              {fee.dueDate
                                ? new Date(fee.dueDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })
                                : 'N/A'}
                            </td>
                            <td className="py-3.5 text-center font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                              {fee.receiptNumber || '—'}
                            </td>
                            <td className="py-3.5 text-center">
                              <span
                                className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                                  fee.status === 'Paid'
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                                    : fee.status === 'Partial'
                                    ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                                    : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                                }`}
                              >
                                {fee.status}
                              </span>
                            </td>
                            <td className="py-3.5 text-center">
                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                {!isPaid && (
                                  <button
                                    onClick={() => setConfirmPaymentFee(fee)}
                                    disabled={paymentProcessing}
                                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all disabled:opacity-50"
                                    title="Confirm & pay securely via Razorpay"
                                  >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span>Pay Online</span>
                                  </button>
                                )}

                                {hasReceipt && (
                                  <button
                                    onClick={() => handleDownloadReceipt(fee._id, fee.receiptNumber)}
                                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#18233B] hover:bg-slate-200 dark:hover:bg-[#202E4C] text-slate-700 dark:text-cyan-300 text-[11px] font-bold flex items-center gap-1 border border-slate-200 dark:border-cyan-500/20 transition-colors"
                                    title="Download Official PDF Receipt"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Receipt</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PAYMENT TRANSACTION HISTORY & RECEIPTS */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200 dark:border-[#232D48] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-[#1C2640]">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                <span>Verified Online Payment History</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#9BA8C7] mt-0.5">
                Authoritative record of gateway attempts, cryptographically verified transactions, and downloadable official receipts.
              </p>
            </div>
            <button
              onClick={fetchTransactions}
              disabled={loadingTxns}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#18233B] hover:bg-slate-200 dark:hover:bg-[#202E4C] text-slate-700 dark:text-[#9BA8C7] text-xs font-bold border border-slate-200 dark:border-[#2A3654]"
            >
              {loadingTxns ? 'Refreshing...' : 'Refresh History'}
            </button>
          </div>

          {txError && (
            <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{txError}</span>
              </div>
              <button
                onClick={fetchTransactions}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-bold transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {loadingTxns ? (
            <LoadingSkeleton count={3} />
          ) : transactions.length === 0 ? (
            <div className="border border-dashed border-slate-300 dark:border-[#232D48] rounded-2xl p-12 text-center">
              <Receipt className="w-10 h-10 text-slate-400 mx-auto mb-2.5" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Payment Transactions Recorded</h4>
              <p className="text-xs text-slate-500 dark:text-[#9BA8C7] mt-1">
                Completed online payments and receipts will be recorded here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#232D48] text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Order / Payment ID</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3 text-center">Semester</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-center">Date & Time</th>
                    <th className="pb-3 text-center">Gateway Status</th>
                    <th className="pb-3 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1C2640]">
                  {transactions.map((txn) => (
                    <tr key={txn._id} className="hover:bg-slate-50/70 dark:hover:bg-[#18233B]/50 transition-colors">
                      <td className="py-3 pr-4 font-mono">
                        <span className="font-bold text-slate-900 dark:text-white block text-xs">
                          {txn.orderId}
                        </span>
                        {txn.paymentId && (
                          <span className="text-[10px] text-slate-500 dark:text-[#9BA8C7] block">
                            {txn.paymentId}
                          </span>
                        )}
                      </td>
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {txn.feeType || txn.feeRecord?.feeType || 'University Fee'}
                      </td>
                      <td className="py-3 text-center text-slate-600 dark:text-slate-300">
                        Sem {txn.semester || txn.feeRecord?.semester || '—'}
                      </td>
                      <td className="py-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                        ₹{Number(txn.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 text-center text-slate-500 dark:text-[#9BA8C7]">
                        {new Date(txn.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            txn.status === 'captured'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : txn.status === 'failed'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        {txn.status === 'captured' ? (
                          <button
                            onClick={() => handleDownloadReceipt(txn._id, txn.receiptNumber)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-[11px] font-bold flex items-center gap-1 mx-auto transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            <span>Receipt</span>
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[11px]">—</span>
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

      {/* Payment Confirmation Modal Dialog */}
      {confirmPaymentFee && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121A2E] rounded-3xl border border-slate-200 dark:border-[#232D48] p-6 max-w-md w-full shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1C2640] mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">Confirm Payment Order</h3>
                  <span className="text-[10px] text-slate-500 dark:text-[#9BA8C7]">Authoritative Institutional Assessment</span>
                </div>
              </div>
              <button
                onClick={() => setConfirmPaymentFee(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1C2640]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs mb-6">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1C2640]">
                <span className="text-slate-500 dark:text-[#9BA8C7]">Fee Category</span>
                <span className="font-bold text-slate-900 dark:text-white">{confirmPaymentFee.feeType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1C2640]">
                <span className="text-slate-500 dark:text-[#9BA8C7]">Academic Session</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  AY {confirmPaymentFee.academicYear || '2026-2027'} • Semester {confirmPaymentFee.semester}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1C2640]">
                <span className="text-slate-500 dark:text-[#9BA8C7]">Original Assessed</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  ₹{Number(confirmPaymentFee.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
              {confirmPaymentFee.concessionAmount > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1C2640] text-emerald-500">
                  <span>Approved Concession</span>
                  <span className="font-bold">-₹{Number(confirmPaymentFee.concessionAmount).toLocaleString('en-IN')}</span>
                </div>
              )}
              {confirmPaymentFee.lateFee > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1C2640] text-rose-500">
                  <span>Late Fee / Surcharge</span>
                  <span className="font-bold">+₹{Number(confirmPaymentFee.lateFee).toLocaleString('en-IN')}</span>
                </div>
              )}
              {confirmPaymentFee.paidAmount > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1C2640] text-blue-500">
                  <span>Already Credited</span>
                  <span className="font-bold">₹{Number(confirmPaymentFee.paidAmount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 text-sm font-black text-slate-900 dark:text-white">
                <span>Net Payable Due</span>
                <span className="text-indigo-600 dark:text-[#6C8CFF]">
                  ₹{Number(confirmPaymentFee.balanceAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-400 mb-5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Payment is cryptographically verified on server. Zero payment card data is retained.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmPaymentFee(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-[#2A3654] text-xs font-bold text-slate-700 dark:text-[#9BA8C7] hover:bg-slate-100 dark:hover:bg-[#18233B]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={paymentProcessing}
                onClick={() => {
                  const target = confirmPaymentFee;
                  setConfirmPaymentFee(null);
                  handleRazorpayPay(target);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>Proceed to Pay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentFeesPage;
