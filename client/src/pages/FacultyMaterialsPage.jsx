import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { Library, PlusCircle, ExternalLink, Trash2, CheckCircle2, AlertCircle, X } from 'lucide-react';

const FacultyMaterialsPage = () => {
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Upload Modal State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [resourceType, setResourceType] = useState('PDF');
  const [fileUrl, setFileUrl] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  const fetchResourcesAndSubjects = async () => {
    try {
      const [resRes, subRes] = await Promise.all([
        api.get('/resources'),
        api.get('/subjects')
      ]);

      if (resRes.data.success) {
        setResources(resRes.data.resources || []);
      }
      if (subRes.data.success && subRes.data.subjects?.length > 0) {
        setSubjects(subRes.data.subjects);
        setSubjectId(subRes.data.subjects[0]._id);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to load study materials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResourcesAndSubjects();
  }, []);

  const handleUploadResource = async (e) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) return;

    setUploading(true);
    setUploadSuccess('');
    setError('');

    try {
      const res = await api.post('/resources', {
        title,
        subjectId,
        courseCode: 'BCA',
        semester: 5,
        resourceType,
        fileUrl,
        description
      });

      if (res.data.success) {
        setUploadSuccess('Study resource published successfully!');
        setTitle('');
        setFileUrl('');
        setDescription('');
        await fetchResourcesAndSubjects();
        setTimeout(() => {
          setShowModal(false);
          setUploadSuccess('');
        }, 1200);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to publish resource.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout
      title="Study Materials & Resource Repository"
      subtitle="Publish syllabus notes, code samples, reference slides, and laboratory guides"
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
          <h3 className="font-bold text-base text-slate-900">Department Materials</h3>
          <p className="text-xs text-slate-500">Provide students with downloadable reference resources.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload Study Material</span>
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : resources.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Library className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">No Study Materials Uploaded</h4>
          <p className="text-xs text-slate-400 mt-1">Upload reference materials for your students.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-black bg-teal-50 text-teal-800 border border-teal-100">
                    {item.subject?.subjectCode || 'BCA'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 uppercase">
                    {item.resourceType || 'PDF'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">
                  {item.description || 'Reference materials and syllabus guide for university lectures.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Published: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Active'}
                </span>
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Link</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Upload Study Material</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUploadResource} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unit 3: Neural Networks & Backpropagation Notes"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500 bg-white"
                  >
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.subjectCode} - {s.subjectName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Resource Format</label>
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500 bg-white"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="Notes">Lecture Notes</option>
                    <option value="Slide">Presentation Slides</option>
                    <option value="Code">Source Code</option>
                    <option value="Link">External URL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">File / Access URL</label>
                <input
                  type="url"
                  required
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or https://github.com/..."
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Syllabus Topics</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of chapters and reading topics covered..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:border-teal-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-50"
                >
                  {uploading ? 'Publishing...' : 'Publish Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default FacultyMaterialsPage;

