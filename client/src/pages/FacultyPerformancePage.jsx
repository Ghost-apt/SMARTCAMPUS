import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { BarChart3, Award, Users, CheckCircle2, Save, AlertCircle } from 'lucide-react';

const FacultyPerformancePage = () => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [marksObtained, setMarksObtained] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examRes, subRes, studRes] = await Promise.all([
          api.get('/examinations'),
          api.get('/subjects'),
          api.get('/students')
        ]);

        if (examRes.data.success && examRes.data.exams?.length > 0) {
          setExams(examRes.data.exams);
          setSelectedExam(examRes.data.exams[0]._id);
        }
        if (subRes.data.success && subRes.data.subjects?.length > 0) {
          setSubjects(subRes.data.subjects);
          setSelectedSubject(subRes.data.subjects[0]._id);
        }
        if (studRes.data.success && studRes.data.students?.length > 0) {
          setStudents(studRes.data.students);
          const firstUserId = studRes.data.students[0].user?._id || studRes.data.students[0].user;
          setSelectedStudent(firstUserId);
        }
      } catch (err) {
        setError(err.userMessage || 'Failed to load examination grading data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedSubject || marksObtained === '') return;

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    const currentSub = subjects.find((s) => s._id === selectedSubject);
    const currentExam = exams.find((e) => e._id === selectedExam);

    try {
      const res = await api.post('/results', {
        examinationId: selectedExam || null,
        examName: currentExam?.examName || 'Mid-Semester Examinations 2026',
        studentId: selectedStudent,
        subjectId: selectedSubject,
        subjectCode: currentSub?.subjectCode || 'BCA-501',
        subjectName: currentSub?.subjectName || 'Coursework',
        marksObtained: Number(marksObtained),
        maxMarks: Number(maxMarks),
        remarks
      });

      if (res.data.success) {
        setSuccessMsg(`Marks saved successfully! Grade Awarded: ${res.data.result?.grade} (${res.data.result?.status})`);
        setMarksObtained('');
        setRemarks('');
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to record student result.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Student Academic Performance & Marks Evaluation"
      subtitle="Enter examination scores, compute grade points, and update academic transcripts"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entry Form */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <span>Enter Examination Mark</span>
          </h3>

          <form onSubmit={handleSubmitResult} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Examination</label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-white"
              >
                {exams.map((ex) => (
                  <option key={ex._id} value={ex._id}>
                    {ex.examName} ({ex.academicYear})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-white"
              >
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.subjectCode} - {sub.subjectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Marks Obtained</label>
                <input
                  type="number"
                  min="0"
                  max={maxMarks}
                  required
                  value={marksObtained}
                  onChange={(e) => setMarksObtained(e.target.value)}
                  placeholder="0 - 100"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Marks</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Evaluation Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Excellent technical accuracy"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Recording Mark...' : 'Submit Evaluation'}</span>
            </button>
          </form>
        </div>

        {/* Grading Scheme Guide */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-3">University Grading Rubric (UGC 10-Point Scale)</h3>
            <p className="text-xs text-slate-500 mb-4">
              Marks entered automatically determine the letter grade and pass/fail standing.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
                <span className="text-lg font-black text-indigo-700">A+</span>
                <p className="text-[11px] font-semibold text-slate-600 mt-0.5">90% - 100%</p>
                <span className="text-[10px] text-emerald-700 font-bold uppercase">Outstanding</span>
              </div>
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-100 text-center">
                <span className="text-lg font-black text-teal-700">A</span>
                <p className="text-[11px] font-semibold text-slate-600 mt-0.5">80% - 89%</p>
                <span className="text-[10px] text-emerald-700 font-bold uppercase">Excellent</span>
              </div>
              <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-100 text-center">
                <span className="text-lg font-black text-cyan-700">B+ / B</span>
                <p className="text-[11px] font-semibold text-slate-600 mt-0.5">60% - 79%</p>
                <span className="text-[10px] text-teal-700 font-bold uppercase">Good</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-center">
                <span className="text-lg font-black text-rose-700">F</span>
                <p className="text-[11px] font-semibold text-slate-600 mt-0.5">&lt; 40%</p>
                <span className="text-[10px] text-rose-700 font-bold uppercase">Fail / Reappear</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyPerformancePage;

