import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Award,
  Layers,
  Sparkles,
  FileText,
  Bookmark,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const SyllabusModal = ({ subject, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [syllabusData, setSyllabusData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('units'); // 'units' | 'books' | 'scheme' | 'objectives'
  const [expandedUnits, setExpandedUnits] = useState({ 0: true }); // Unit 1 expanded by default
  const [togglingTopic, setTogglingTopic] = useState(null);

  const fetchSyllabusAndProgress = async () => {
    if (!subject?._id) return;
    setLoading(true);
    setError('');
    try {
      const [sylRes, progRes] = await Promise.all([
        api.get(`/subjects/${subject._id}/syllabus`),
        api.get(`/subjects/${subject._id}/progress`).catch(() => ({ data: { success: false } }))
      ]);

      if (sylRes.data.success) {
        setSyllabusData(sylRes.data);
      }
      if (progRes.data?.success) {
        setProgressData(progRes.data);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to load course syllabus.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && subject?._id) {
      fetchSyllabusAndProgress();
    }
  }, [isOpen, subject?._id]);

  if (!isOpen) return null;

  const toggleUnit = (idx) => {
    setExpandedUnits((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleToggleTopic = async (topic) => {
    if (togglingTopic) return;
    setTogglingTopic(topic);
    try {
      const res = await api.post(`/subjects/${subject._id}/progress/toggle`, { topic });
      if (res.data.success) {
        // Re-fetch progress to ensure accurate counts & percentage
        const progRes = await api.get(`/subjects/${subject._id}/progress`);
        if (progRes.data.success) {
          setProgressData(progRes.data);
        }
      }
    } catch {
      // Non-blocking error
    } finally {
      setTogglingTopic(null);
    }
  };

  const hasSyllabus = syllabusData?.hasSyllabus && syllabusData?.syllabus?.units?.length > 0;
  const units = syllabusData?.syllabus?.units || [];
  const textbooks = syllabusData?.syllabus?.textbooks || [];
  const objectives = syllabusData?.syllabus?.objectives || [];
  const evaluationScheme = syllabusData?.syllabus?.evaluationScheme || {
    internalWeightage: 30,
    endSemWeightage: 70,
    hasPractical: subject?.type === 'Practical'
  };

  const completedTopics = progressData?.completedTopics || [];
  const completionPercentage = progressData?.percentage || 0;

  const handleAskAIAboutTopic = (unitTitle, topic) => {
    onClose();
    navigate('/student/ai', {
      state: {
        initialQuery: `Explain the key concepts of "${topic}" from ${subject.subjectCode}: ${unitTitle}. What are the primary formulas and examination questions?`
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-black tracking-wide bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                {subject?.subjectCode || 'COURSE'}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Sem {subject?.semester || 5}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                {subject?.credits || 4} Credits
              </span>
              {hasSyllabus && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20">
                  Academic Year {syllabusData?.syllabus?.academicYear || '2026-2027'}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {subject?.subjectName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Instructor: <span className="font-semibold text-slate-700 dark:text-slate-300">{subject?.faculty?.name || 'Assigned Faculty'}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Revision Progress Banner (shown only when syllabus is available) */}
        {hasSyllabus && (
          <div className="px-5 sm:px-6 py-3 bg-indigo-50/70 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-200">
                  Personal Study & Revision Progress
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {progressData?.completedCount || 0} of {progressData?.totalCount || 0} syllabus topics revised
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-32 sm:w-44 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, completionPercentage))}%` }}
                />
              </div>
              <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 min-w-[36px]">
                {completionPercentage}%
              </span>
            </div>
          </div>
        )}

        {/* Tab Navigation (when syllabus exists) */}
        {hasSyllabus && (
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 sm:px-6 bg-white dark:bg-slate-900 gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('units')}
              className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'units'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Course Units ({units.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('books')}
              className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'books'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Textbooks & References ({textbooks.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('scheme')}
              className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'scheme'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Marking & Exam Scheme</span>
            </button>
            {objectives.length > 0 && (
              <button
                onClick={() => setActiveTab('objectives')}
                className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'objectives'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Course Objectives ({objectives.length})</span>
              </button>
            )}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <span>Loading verified university curriculum...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs sm:text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : !hasSyllabus ? (
            /* Empty State: Shown strictly when faculty has not added syllabus yet */
            <div className="py-12 sm:py-16 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Syllabus Not Yet Published
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                The course instructor (<span className="font-semibold text-slate-700 dark:text-slate-300">{subject?.faculty?.name || 'Prof. Faculty'}</span>) has not uploaded or published the syllabus for this semester yet.
              </p>
              <div className="mt-6 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-left">
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  📌 What will be available once published:
                </p>
                <ul className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 space-y-1 list-disc list-inside">
                  <li>Unit-by-unit syllabus breakdown (Units 1 to 5)</li>
                  <li>Weekly lecture teaching hours & learning objectives</li>
                  <li>Prescribed textbooks and reference reading lists</li>
                  <li>Interactive personal topic revision tracker & exam guide</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              {/* Tab: Course Units (Accordion) */}
              {activeTab === 'units' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Click any topic to mark as revised. All items are synchronized with your account.
                    </p>
                    <button
                      onClick={() => {
                        const allOpen = {};
                        units.forEach((_, idx) => (allOpen[idx] = true));
                        setExpandedUnits(allOpen);
                      }}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Expand All
                    </button>
                  </div>

                  {units.map((unit, uIdx) => {
                    const isExpanded = !!expandedUnits[uIdx];
                    const unitTopics = unit.topics || [];
                    const unitCompleted = unitTopics.filter((t) => completedTopics.includes(t)).length;

                    return (
                      <div
                        key={uIdx}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 overflow-hidden shadow-sm transition-all"
                      >
                        {/* Unit Header Accordion Toggle */}
                        <button
                          type="button"
                          onClick={() => toggleUnit(uIdx)}
                          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-extrabold text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20">
                              {unit.unitNumber || uIdx + 1}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                  {unit.title}
                                </h4>
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {unit.teachingHours || 8} Hours
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                {unitCompleted}/{unitTopics.length} topics revised
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </span>
                          </div>
                        </button>

                        {/* Unit Expanded Content */}
                        {isExpanded && (
                          <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/20">
                            {/* Learning Outcomes */}
                            {unit.outcomes && unit.outcomes.length > 0 && (
                              <div className="mb-4 mt-3 p-3 rounded-xl bg-cyan-50/60 dark:bg-cyan-500/5 border border-cyan-100 dark:border-cyan-500/20">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 mb-1">
                                  Unit Outcomes:
                                </p>
                                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5 list-disc list-inside">
                                  {unit.outcomes.map((out, oIdx) => (
                                    <li key={oIdx}>{out}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Topics Checklist */}
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 mt-3">
                              Syllabus Topics & Key Concepts:
                            </p>
                            <div className="space-y-2">
                              {unitTopics.map((topic, tIdx) => {
                                const isDone = completedTopics.includes(topic);
                                return (
                                  <div
                                    key={tIdx}
                                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                                      isDone
                                        ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-slate-900 dark:text-slate-100'
                                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => handleToggleTopic(topic)}
                                      disabled={togglingTopic === topic}
                                      className="flex items-center gap-3 text-left flex-1"
                                    >
                                      {isDone ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                      )}
                                      <span className={`text-xs font-semibold ${isDone ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
                                        {topic}
                                      </span>
                                    </button>

                                    {/* 1-Click Ask AI Shortcut */}
                                    <button
                                      type="button"
                                      onClick={() => handleAskAIAboutTopic(unit.title, topic)}
                                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-indigo-600 dark:text-cyan-400 bg-indigo-50 dark:bg-cyan-500/10 hover:bg-indigo-100 dark:hover:bg-cyan-500/20 transition-colors flex items-center gap-1 flex-shrink-0"
                                      title="Ask AI Academic Advisor to explain this topic"
                                    >
                                      <Sparkles className="w-3 h-3" />
                                      <span>Ask AI</span>
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab: Textbooks & References */}
              {activeTab === 'books' && (
                <div className="space-y-4">
                  {textbooks.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No specific reference books specified in syllabus.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {textbooks.map((book, bIdx) => (
                        <div
                          key={bIdx}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-start gap-3.5"
                        >
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 border border-indigo-200 dark:border-indigo-500/20">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.2 rounded ${
                                  book.isPrescribed
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                {book.isPrescribed ? 'Prescribed Textbook' : 'Reference Book'}
                              </span>
                            </div>
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-1">
                              {book.title}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              Author: {book.author}
                            </p>
                            {book.edition && (
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                Edition: {book.edition}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Evaluation & Exam Scheme */}
              {activeTab === 'scheme' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/30">
                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                        Internal Assessment
                      </p>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                        {evaluationScheme.internalWeightage || 30}%
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        Calculated from mid-term tests, class attendance, and assignment submissions.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        End-Semester University Exam
                      </p>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                        {evaluationScheme.endSemWeightage || 70}%
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        Comprehensive written theory evaluation covering all Units 1 through 5.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <span className="font-bold text-slate-900 dark:text-white">Examination Policy:</span> Minimum 75% classroom attendance compliance is mandatory to appear for the end-semester examinations under university statutory bylaws.
                  </div>
                </div>
              )}

              {/* Tab: Objectives */}
              {activeTab === 'objectives' && (
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Course Learning Objectives (CLOs):
                  </h4>
                  {objectives.map((obj, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            SmartCampus Academic Curriculum Engine
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SyllabusModal;

