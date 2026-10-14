import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { FileText, PlusCircle, Calendar, Users, CheckCircle2, Clock, Eye, AlertCircle, X, ExternalLink } from 'lucide-react';

const FacultyAssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create Assignment Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalMarks, setTotalMarks] = useState(100);
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState('');

  // View Submissions & Grade Modal State
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [gradeModalStudent, setGradeModalStudent] = useState(null);
  const [marksInput, setMarksInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [grading, setGrading] = useState(false);
  const [gradeSuccess, setGradeSuccess] = useState('');

  const fetchAssignmentsAndSubjects = async () => {
    try {
      const [assRes, subRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/subjects')
      ]);

      if (assRes.data.success) {
        setAssignments(assRes.data.assignments || []);
      }
      if (subRes.data.success && subRes.data.subjects?.length > 0) {
        setSubjects(subRes.data.subjects);
        setSubjectId(subRes.data.subjects[0]._id);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentsAndSubjects();
  }, []);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    setCreating(true);
    setCreateSuccess('');
    setError('');

    try {
      const res = await api.post('/assignments', {
        title,
        description,
        subjectId,
        courseCode: 'BCA',
        semester: 5,
        dueDate,
        totalMarks: Number(totalMarks)
      });

      if (res.data.success) {
        setCreateSuccess('Assignment published successfully!');
        setTitle('');
        setDescription('');
        await fetchAssignmentsAndSubjects();
        setTimeout(() => {
          setShowCreateModal(false);
          setCreateSuccess('');
        }, 1200);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to create assignment.');
    } finally {
      setCreating(false);
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    if (!selectedAssignment || !gradeModalStudent) return;

    setGrading(true);
    setGradeSuccess('');

    try {
      const res = await api.patch(`/assignments/${selectedAssignment._id}/grade`, {
        studentId: gradeModalStudent.student,
        marksObtained: Number(marksInput),
        feedback: feedbackInput
      });

      if (res.data.success) {
        setGradeSuccess('Grade recorded successfully!');
        await fetchAssignmentsAndSubjects();
        // Update local selectedAssignment
        setSelectedAssignment((prev) => {
          if (!prev) return null;
          const updatedSubs = (prev.submissions || []).map((s) =>
            s.student === gradeModalStudent.student ? res.data.submission : s
          );
          return { ...prev, submissions: updatedSubs };
        });
        setTimeout(() => {
          setGradeModalStudent(null);
          setGradeSuccess('');
        }, 1200);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to grade submission.');
    } finally {
      setGrading(false);
    }
  };

  return (
    <DashboardLayout
      title="Coursework & Assignment Manager"
      subtitle="Publish assignments, review deliverables, evaluate submissions, and distribute grades"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 mb-8 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-slate-900">Active Coursework</h3>
          <p className="text-xs text-slate-500">Manage lab reports, homework assignments, and term projects.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Assignment</span>
        </button>
      </div>

      {/* Assignments List */}
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">No Assignments Published</h4>
          <p className="text-xs text-slate-400 mt-1">Click "Create Assignment" to publish coursework for students.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((assignment) => {
            const submissionsCount = assignment.submissions?.length || 0;
            return (
              <div
                key={assignment._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {assignment.subject?.subjectCode || assignment.courseCode || 'BCA'}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                    {assignment.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">
                    {assignment.description || 'Full-stack course implementation assignment.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{submissionsCount} Submission(s)</span>
                  </span>

                  <button
                    onClick={() => setSelectedAssignment(assignment)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review Submissions</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Create New Assignment</h3>
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

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Database Architecture Project"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-white"
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.subjectCode} - {s.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Submission Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Marks</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    required
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Instructions</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed submission requirements, rubric, and instructions..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
                ></textarea>
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
                  disabled={creating}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                >
                  {creating ? 'Publishing...' : 'Publish Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Submissions Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Submissions: {selectedAssignment.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Max Marks: {selectedAssignment.totalMarks || 100}
                </p>
              </div>
              <button onClick={() => setSelectedAssignment(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(!selectedAssignment.submissions || selectedAssignment.submissions.length === 0) ? (
              <p className="text-xs text-slate-400 py-8 text-center">No student submissions received yet.</p>
            ) : (
              <div className="space-y-4">
                {selectedAssignment.submissions.map((sub, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{sub.studentName}</span>
                        <span className="font-mono text-[11px] text-slate-500">({sub.studentRollNumber})</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sub.status === 'Graded'
                          ? 'bg-purple-100 text-purple-700'
                          : sub.status === 'Late'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {sub.status}
                      </span>
                    </div>

                    {sub.content && (
                      <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 font-mono">
                        {sub.content}
                      </p>
                    )}

                    {sub.fileUrl && (
                      <a
                        href={sub.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Attached Deliverable Link</span>
                      </a>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                      <span className="text-slate-500">
                        {sub.status === 'Graded' ? (
                          <span className="font-bold text-indigo-700">
                            Awarded: {sub.marksObtained} / {selectedAssignment.totalMarks} Marks
                          </span>
                        ) : (
                          <span className="text-amber-600 font-semibold">Ungraded</span>
                        )}
                      </span>

                      <button
                        onClick={() => {
                          setGradeModalStudent(sub);
                          setMarksInput(sub.marksObtained ?? '');
                          setFeedbackInput(sub.feedback || '');
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500"
                      >
                        {sub.status === 'Graded' ? 'Edit Grade' : 'Grade Submission'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grade Input Modal */}
      {gradeModalStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Grade: {gradeModalStudent.studentName}
            </h3>
            <p className="text-xs text-slate-400 mb-4">Max Marks: {selectedAssignment.totalMarks}</p>

            {gradeSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{gradeSuccess}</span>
              </div>
            )}

            <form onSubmit={handleGradeSubmission} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Marks Obtained</label>
                <input
                  type="number"
                  min="0"
                  max={selectedAssignment.totalMarks}
                  required
                  value={marksInput}
                  onChange={(e) => setMarksInput(e.target.value)}
                  placeholder={`0 - ${selectedAssignment.totalMarks}`}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback / Comments</label>
                <textarea
                  rows="3"
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="e.g. Excellent architectural breakdown. Good code organization."
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGradeModalStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={grading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                >
                  {grading ? 'Saving...' : 'Save Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default FacultyAssignmentsPage;
