import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { FileText, Calendar, CheckCircle2, Clock, Upload, Send, AlertCircle, X } from 'lucide-react';

const StudentAssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Submit Modal State
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/assignments');
      if (res.data.success) {
        setAssignments(res.data.assignments || []);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionContent.trim() && !submissionUrl.trim()) return;

    setSubmitting(true);
    setSubmitSuccess('');
    try {
      const res = await api.post(`/assignments/${selectedAssignment._id}/submit`, {
        content: submissionContent,
        fileUrl: submissionUrl
      });
      if (res.data.success) {
        setSubmitSuccess(res.data.message || 'Assignment submitted successfully!');
        setSubmissionContent('');
        setSubmissionUrl('');
        await fetchAssignments();
        setTimeout(() => {
          setSelectedAssignment(null);
          setSubmitSuccess('');
        }, 1500);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to submit assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Course Assignments & Projects"
      subtitle="View coursework deadlines, submit deliverables, and review faculty evaluations"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">No Assignments Active</h4>
          <p className="text-xs text-slate-400 mt-1">Faculty have not published any pending assignments yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((assignment) => {
            const mySub = assignment.mySubmission;
            const isSubmitted = !!mySub;
            const isGraded = mySub && mySub.status === 'Graded';
            const isPastDue = new Date() > new Date(assignment.dueDate);

            return (
              <div
                key={assignment._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {assignment.subject?.subjectCode || assignment.courseCode || 'Coursework'}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isGraded
                        ? 'bg-purple-50 text-purple-700 border border-purple-100'
                        : isSubmitted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : isPastDue
                        ? 'bg-rose-50 text-rose-700 border border-rose-100'
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {isGraded ? 'Graded' : isSubmitted ? 'Submitted' : isPastDue ? 'Past Due' : 'Pending'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                    {assignment.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">
                    {assignment.description || 'Deliver project report and code implementation.'}
                  </p>

                  <div className="space-y-2 text-xs text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Due Date:</span>
                      </span>
                      <span className="font-semibold text-slate-800">
                        {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'Open'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Max Marks:</span>
                      </span>
                      <span className="font-bold text-slate-800">{assignment.totalMarks || 100}</span>
                    </div>

                    {isGraded && (
                      <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-indigo-700 font-bold">
                        <span>Your Grade:</span>
                        <span>{mySub.marksObtained} / {assignment.totalMarks}</span>
                      </div>
                    )}
                  </div>

                  {mySub?.feedback && (
                    <div className="mt-3 p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900">
                      <span className="font-bold">Faculty Feedback: </span>
                      {mySub.feedback}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      setSubmissionContent(mySub?.content || '');
                      setSubmissionUrl(mySub?.fileUrl || '');
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                      isSubmitted
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isSubmitted ? 'Resubmit / Edit Submission' : 'Submit Work'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Submit: {selectedAssignment.title}
              </h3>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Submission Text / Writeup / Notes
                </label>
                <textarea
                  rows="4"
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="Paste your solution summary, code snippet, or write-up here..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Repository / Document URL (GitHub, Google Drive)
                </label>
                <input
                  type="url"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  placeholder="https://github.com/username/project-repo"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Confirm Submission'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentAssignmentsPage;

