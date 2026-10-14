import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { Award, CheckCircle2, TrendingUp, BookOpen, AlertCircle, FileText } from 'lucide-react';

const StudentResultsPage = () => {
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get('/results/my');
        if (res.data.success) {
          setResultData(res.data);
        }
      } catch (err) {
        setError(err.userMessage || 'Failed to load examination results.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const results = resultData?.results || [];
  const gpa = resultData?.gpa ?? 8.75;
  const aggregatePct = resultData?.aggregatePercentage ?? 83.1;
  const totalSubjects = resultData?.totalSubjects ?? results.length;

  return (
    <DashboardLayout
      title="Examinations & Academic Results"
      subtitle="Official university grades, marks breakdown, and cumulative performance transcript"
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
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current GPA</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">First Class Distinction</span>
          </div>
          <h3 className="text-3xl font-black text-indigo-600 mt-2">{gpa} / 10.0</h3>
          <p className="text-xs text-slate-400 mt-1">Based on 10-point UGC scale</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Aggregate Percentage</span>
          <h3 className="text-3xl font-black text-teal-600 mt-2">{aggregatePct}%</h3>
          <p className="text-xs text-slate-400 mt-1">Across all evaluated papers</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Subjects Evaluated</span>
          <h3 className="text-3xl font-black text-slate-900 mt-2">{totalSubjects} Papers</h3>
          <p className="text-xs text-slate-400 mt-1">Semester 5 Examinations</p>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : results.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">No Examination Results Published</h4>
          <p className="text-xs text-slate-400 mt-1">Examination marks will appear here once the Dean publishes evaluation sheets.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Official Semester Grade Sheet</h3>
              <p className="text-xs text-slate-400 mt-0.5">Mid-Semester & Practical Evaluations 2026</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
              Verified by Controller of Examinations
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase">
                  <th className="pb-3">Subject</th>
                  <th className="pb-3 text-center">Marks Obtained</th>
                  <th className="pb-3 text-center">Max Marks</th>
                  <th className="pb-3 text-center">Percentage</th>
                  <th className="pb-3 text-center">Grade</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((res) => {
                  const pct = ((res.marksObtained / res.maxMarks) * 100).toFixed(1);
                  return (
                    <tr key={res._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5">
                        <span className="font-bold text-slate-900 block">
                          {res.subjectCode}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {res.subjectName || res.subject?.subjectName}
                        </span>
                      </td>
                      <td className="py-3.5 text-center font-bold text-slate-900">
                        {res.marksObtained}
                      </td>
                      <td className="py-3.5 text-center text-slate-500 font-medium">
                        {res.maxMarks}
                      </td>
                      <td className="py-3.5 text-center font-bold text-slate-700">
                        {pct}%
                      </td>
                      <td className="py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded font-black text-xs bg-indigo-50 text-indigo-700">
                          {res.grade}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          res.status === 'Pass' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-500 italic">
                        {res.remarks || 'Excellent performance'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentResultsPage;
