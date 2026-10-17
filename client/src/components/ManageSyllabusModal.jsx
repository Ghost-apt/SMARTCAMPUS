import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import api from '../services/api';

const ManageSyllabusModal = ({ subject, isOpen, onClose, onSyllabusUpdated }) => {
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [objectivesText, setObjectivesText] = useState('');
  const [units, setUnits] = useState([
    {
      unitNumber: 1,
      title: 'Unit 1: Introduction & Fundamentals',
      teachingHours: 8,
      topicsText: '',
      outcomesText: ''
    }
  ]);
  const [textbooks, setTextbooks] = useState([
    {
      title: '',
      author: '',
      edition: 'Latest Edition',
      isPrescribed: true
    }
  ]);
  const [internalWeightage, setInternalWeightage] = useState(30);
  const [endSemWeightage, setEndSemWeightage] = useState(70);

  const [loading, setLoading] = useState(false);
  const [fetchingExisting, setFetchingExisting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isOpen || !subject?._id) return;

    const loadExisting = async () => {
      setFetchingExisting(true);
      setError('');
      try {
        const res = await api.get(`/subjects/${subject._id}/syllabus`);
        if (res.data?.success && res.data.hasSyllabus && res.data.syllabus) {
          const s = res.data.syllabus;
          setAcademicYear(s.academicYear || '2026-2027');
          setObjectivesText(Array.isArray(s.objectives) ? s.objectives.join('\n') : '');
          if (Array.isArray(s.units) && s.units.length > 0) {
            setUnits(
              s.units.map((u, idx) => ({
                unitNumber: u.unitNumber || idx + 1,
                title: u.title || `Unit ${idx + 1}`,
                teachingHours: u.teachingHours || 8,
                topicsText: Array.isArray(u.topics) ? u.topics.join('\n') : '',
                outcomesText: Array.isArray(u.outcomes) ? u.outcomes.join('\n') : ''
              }))
            );
          }
          if (Array.isArray(s.textbooks) && s.textbooks.length > 0) {
            setTextbooks(s.textbooks);
          }
          if (s.evaluationScheme) {
            setInternalWeightage(s.evaluationScheme.internalWeightage || 30);
            setEndSemWeightage(s.evaluationScheme.endSemWeightage || 70);
          }
        } else {
          // Initialize default empty unit 1
          setUnits([
            {
              unitNumber: 1,
              title: 'Unit 1: Foundations & Core Concepts',
              teachingHours: 8,
              topicsText: '',
              outcomesText: ''
            }
          ]);
        }
      } catch {
        // Fallback default
      } finally {
        setFetchingExisting(false);
      }
    };

    loadExisting();
  }, [isOpen, subject?._id]);

  if (!isOpen) return null;

  const handleAddUnit = () => {
    setUnits((prev) => [
      ...prev,
      {
        unitNumber: prev.length + 1,
        title: `Unit ${prev.length + 1}: `,
        teachingHours: 8,
        topicsText: '',
        outcomesText: ''
      }
    ]);
  };

  const handleRemoveUnit = (idx) => {
    if (units.length <= 1) return;
    setUnits((prev) => prev.filter((_, i) => i !== idx).map((u, i) => ({ ...u, unitNumber: i + 1 })));
  };

  const handleUnitChange = (idx, field, value) => {
    setUnits((prev) =>
      prev.map((u, i) => (i === idx ? { ...u, [field]: value } : u))
    );
  };

  const handleAddTextbook = () => {
    setTextbooks((prev) => [
      ...prev,
      { title: '', author: '', edition: 'Latest Edition', isPrescribed: true }
    ]);
  };

  const handleRemoveTextbook = (idx) => {
    setTextbooks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleTextbookChange = (idx, field, value) => {
    setTextbooks((prev) =>
      prev.map((b, i) => (i === idx ? { ...b, [field]: value } : b))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    const cleanUnits = units.map((u, idx) => ({
      unitNumber: u.unitNumber || idx + 1,
      title: u.title.trim() || `Unit ${idx + 1}`,
      teachingHours: Number(u.teachingHours) || 8,
      topics: u.topicsText
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean),
      outcomes: u.outcomesText
        .split('\n')
        .map((o) => o.trim())
        .filter(Boolean)
    }));

    const hasEmptyTopics = cleanUnits.some((u) => u.topics.length === 0);
    if (hasEmptyTopics) {
      setError('Please provide at least one topic for each course unit.');
      return;
    }

    const cleanTextbooks = textbooks
      .filter((b) => b.title.trim() && b.author.trim())
      .map((b) => ({
        title: b.title.trim(),
        author: b.author.trim(),
        edition: b.edition.trim() || 'Latest Edition',
        isPrescribed: Boolean(b.isPrescribed)
      }));

    const cleanObjectives = objectivesText
      .split('\n')
      .map((o) => o.trim())
      .filter(Boolean);

    setLoading(true);

    try {
      const payload = {
        syllabus: {
          academicYear,
          objectives: cleanObjectives,
          units: cleanUnits,
          textbooks: cleanTextbooks,
          evaluationScheme: {
            internalWeightage: Number(internalWeightage) || 30,
            endSemWeightage: Number(endSemWeightage) || 70,
            hasPractical: subject?.type === 'Practical'
          }
        }
      };

      const res = await api.put(`/subjects/${subject._id}/syllabus`, payload);
      if (res.data?.success) {
        setSuccess('Course syllabus successfully published! Students can now view this curriculum.');
        if (onSyllabusUpdated) onSyllabusUpdated();
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 1200);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to update syllabus.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-black tracking-wide bg-teal-50 dark:bg-teal-500/10 text-teal-800 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20">
                {subject?.subjectCode}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Faculty Curriculum Builder
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              Manage Course Syllabus: {subject?.subjectName}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Academic Year & Scheme */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Academic Session
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                placeholder="2026-2027"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Internal Assessment (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={internalWeightage}
                onChange={(e) => setInternalWeightage(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End-Sem Exam (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={endSemWeightage}
                onChange={(e) => setEndSemWeightage(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                required
              />
            </div>
          </div>

          {/* Course Learning Objectives */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Course Learning Objectives (One per line)
            </label>
            <textarea
              rows="3"
              value={objectivesText}
              onChange={(e) => setObjectivesText(e.target.value)}
              placeholder="Understand fundamental neural architectures...&#10;Implement supervised classification pipelines...&#10;Evaluate metrics for model validation..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-2xl p-3 text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Units Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Syllabus Units ({units.length})</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Define the core course modules and topics students will study.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddUnit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20 text-xs font-bold hover:bg-teal-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Unit</span>
              </button>
            </div>

            {units.map((unit, uIdx) => (
              <div
                key={uIdx}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 relative group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Unit {uIdx + 1} Title
                      </label>
                      <input
                        type="text"
                        value={unit.title}
                        onChange={(e) => handleUnitChange(uIdx, 'title', e.target.value)}
                        placeholder={`Unit ${uIdx + 1}: Title`}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500 font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Teaching Hours
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="40"
                        value={unit.teachingHours}
                        onChange={(e) => handleUnitChange(uIdx, 'teachingHours', e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                        required
                      />
                    </div>
                  </div>

                  {units.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveUnit(uIdx)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors self-end mb-1"
                      title="Remove this unit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Topics & Sub-concepts (One topic per line — required for student revision tracker):
                  </label>
                  <textarea
                    rows="3"
                    value={unit.topicsText}
                    onChange={(e) => handleUnitChange(uIdx, 'topicsText', e.target.value)}
                    placeholder="Convolutional Neural Networks (CNNs)&#10;Convolutional filters and max-pooling&#10;Transfer learning with pre-trained models"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl p-2.5 text-xs focus:outline-none focus:border-teal-500 font-mono"
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Textbooks Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Prescribed Textbooks & Reference Books</span>
                </h4>
              </div>

              <button
                type="button"
                onClick={handleAddTextbook}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Book</span>
              </button>
            </div>

            {textbooks.map((book, bIdx) => (
              <div
                key={bIdx}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-center"
              >
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={book.title}
                    onChange={(e) => handleTextbookChange(bIdx, 'title', e.target.value)}
                    placeholder="Book Title (e.g. Artificial Intelligence: A Modern Approach)"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={book.author}
                    onChange={(e) => handleTextbookChange(bIdx, 'author', e.target.value)}
                    placeholder="Author (e.g. Stuart Russell)"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={book.isPrescribed ? 'prescribed' : 'reference'}
                    onChange={(e) => handleTextbookChange(bIdx, 'isPrescribed', e.target.value === 'prescribed')}
                    className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-2 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="prescribed">Prescribed</option>
                    <option value="reference">Reference</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleRemoveTextbook(bIdx)}
                    className="text-rose-500 hover:text-rose-700 p-1 rounded"
                    title="Remove book"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? (
                <span>Publishing Curriculum...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish Syllabus</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageSyllabusModal;

