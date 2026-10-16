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
  Info
} from 'lucide-react';

const StudentFeesPage = () => {
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('structure'); // 'structure' or 'ledger'
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState('');

  const [structureData, setStructureData] = useState(null);

  useEffect(() => {
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

    fetchFees();
  }, []);

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

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200 dark:border-[#232D48] p-5 shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#9BA8C7]">
              Total Invoiced (Sem 5)
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            ₹{totalBilled.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#9BA8C7] mt-1 flex items-center gap-1">
            <span>BCA Semester 5 Current Dues</span>
          </p>
        </div>

        <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200 dark:border-[#232D48] p-5 shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#9BA8C7]">
              Total Cleared
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            ₹{totalPaid.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#9BA8C7] mt-1">Confirmed payments received</p>
        </div>

        <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200 dark:border-[#232D48] p-5 shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#9BA8C7]">
              Outstanding Balance
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                totalBalance === 0
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                  : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
              }`}
            >
              {totalBalance === 0 ? 'Fully Paid' : 'Action Due'}
            </span>
          </div>
          <h3
            className={`text-2xl sm:text-3xl font-black mt-2 ${
              totalBalance === 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            ₹{totalBalance.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#9BA8C7] mt-1">Pending finance clearance</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-[#232D48] pb-3">
        <button
          onClick={() => setActiveTab('structure')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
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
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'ledger'
              ? 'bg-gradient-to-r from-[#6C8CFF] to-[#43D9FF] text-slate-950 shadow-md'
              : 'text-slate-600 dark:text-[#9BA8C7] hover:text-white hover:bg-slate-100 dark:hover:bg-[#18233B]'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>My Invoices & Receipts</span>
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
        <div>
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Official Fee Invoices & Transactions
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#9BA8C7] mt-0.5">
                    Real-time financial invoices registered against your university student account.
                  </p>
                </div>
                <button
                  onClick={() => handleSimulateDownload('Semester_5_Complete_Fee_Statement.pdf')}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#18233B] hover:bg-slate-200 dark:hover:bg-[#202E4C] text-slate-800 dark:text-[#9BA8C7] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-[#2A3654]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Ledger</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-[#232D48] text-slate-400 font-semibold uppercase tracking-wider">
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
                  <tbody className="divide-y divide-slate-100 dark:divide-[#1C2640]">
                    {fees.map((fee) => (
                      <tr key={fee._id} className="hover:bg-slate-50/70 dark:hover:bg-[#18233B]/50 transition-colors">
                        <td className="py-3.5 pr-4">
                          <span className="font-bold text-slate-900 dark:text-white block text-xs sm:text-sm">
                            {fee.feeType}
                          </span>
                          <span className="block font-normal text-[11px] text-slate-500 dark:text-[#9BA8C7] mt-0.5">
                            {fee.remarks || 'Standard Semester Fee'}
                          </span>
                        </td>
                        <td className="py-3.5 text-center text-slate-600 dark:text-slate-300 font-medium">
                          Sem {fee.semester}
                        </td>
                        <td className="py-3.5 text-right font-bold text-slate-900 dark:text-white">
                          ₹{Number(fee.totalAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{Number(fee.paidAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 text-right font-bold text-rose-600 dark:text-rose-400">
                          ₹{Number(fee.balanceAmount || 0).toLocaleString('en-IN')}
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
                          {fee.receiptNumber || 'Pending'}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentFeesPage;
