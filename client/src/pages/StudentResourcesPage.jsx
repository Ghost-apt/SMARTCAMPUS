import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { Library, Download, Search, FileText, ExternalLink, Filter, BookOpen, AlertCircle } from 'lucide-react';

const StudentResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await api.get('/resources');
        if (res.data.success) {
          setResources(res.data.resources || []);
        }
      } catch (err) {
        setError(err.userMessage || 'Failed to load study resources.');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const filteredResources = resources.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      r.title?.toLowerCase().includes(term) ||
      (r.description && r.description.toLowerCase().includes(term)) ||
      (r.subject?.subjectCode && r.subject.subjectCode.toLowerCase().includes(term));
    const matchesType =
      selectedType === 'All' ||
      r.resourceType === selectedType ||
      r.category === selectedType ||
      (selectedType === 'PDF' && (r.fileUrl?.endsWith('.pdf') || r.category === 'Lecture Notes'));
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout
      title="Study Resources & Course Materials"
      subtitle="Access lecture notes, lab manuals, reference slides, and recommended reading"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200/80 dark:border-[#232D48] p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes, slides, manuals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0D1224] border border-slate-200 dark:border-[#232D48] rounded-xl text-sm focus:outline-none focus:border-[#6C8CFF] text-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-500 dark:text-[#9BA8C7] flex-shrink-0">Format:</span>
          {['All', 'PDF', 'Notes', 'Slide', 'Code', 'Link'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                selectedType === type
                  ? 'bg-gradient-to-r from-[#6C8CFF] to-[#43D9FF] text-slate-950 font-bold'
                  : 'bg-slate-100 dark:bg-[#18233B] text-slate-600 dark:text-[#9BA8C7] hover:bg-slate-200 dark:hover:bg-[#232D48]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoadingSkeleton count={4} />
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="bg-white dark:bg-[#121A2E] rounded-2xl border border-dashed border-slate-300 dark:border-[#232D48] p-12 text-center">
          <Library className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-200">No Study Materials Found</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try another search or filter keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredResources.map((res) => (
            <div
              key={res._id}
              className="bg-white dark:bg-[#121A2E] rounded-2xl border border-slate-200/80 dark:border-[#232D48] p-6 shadow-sm hover:border-[#6C8CFF]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-black bg-indigo-50 dark:bg-[#6C8CFF]/15 text-indigo-700 dark:text-[#6C8CFF] border border-indigo-100 dark:border-[#6C8CFF]/30">
                    {res.subject?.subjectCode || res.courseCode || 'BCA'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-[#18233B] text-slate-700 dark:text-slate-300 uppercase">
                    {res.resourceType || res.category || 'PDF'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                  {res.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#9BA8C7] leading-relaxed line-clamp-3 mb-4">
                  {res.description || 'Uploaded by department faculty for academic semester reference.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-[#232D48] flex items-center justify-between">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  By: {res.uploadedBy?.name || 'Faculty Mentor'}
                </span>
                <a
                  href={res.fileUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#6C8CFF] to-[#43D9FF] text-slate-950 flex items-center gap-1.5 transition-all transform hover:scale-[1.02]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Access Resource</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentResourcesPage;

