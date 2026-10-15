import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';
import {
  Bot,
  Send,
  Sparkles,
  User,
  AlertCircle,
  BookOpen,
  HelpCircle,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Library,
  GraduationCap,
  FileText,
  BookmarkCheck,
  Search,
  Filter
} from 'lucide-react';

const SUGGESTED_QUERIES = [
  'What are my upcoming pending assignments?',
  'What is my today\'s class timetable?',
  'What is my current attendance standing?',
  'What are my recent examination results and GPA?',
  'What is the minimum attendance required for semester exams?',
  'What are the core topics in BCA-501 Artificial Intelligence?'
];

const SUGGESTED_RAG_QUERIES = [
  'What is normalization and BCNF according to our course notes?',
  'Explain Convolutional Neural Networks (CNN) and max-pooling.',
  'What are the best practices for RESTful API design and JWT auth?',
  'Explain Docker multi-stage builds and containerization from the lab manual.'
];

const StudentAIPage = () => {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'rag' | 'recommendations'
  
  // General Campus Assistant State
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your SmartCampus AI Academic Advisor. I have live access to your student records, schedule, assignments, and curriculum. How can I assist your studies today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // RAG Document Assistant State
  const [ragMessages, setRagMessages] = useState([
    {
      sender: 'ai',
      text: 'Welcome to the Academic Document Assistant! Ask questions regarding your enrolled course syllabi, lecture handouts, and unit notes. Every answer is grounded directly in uploaded documents with verified page citations.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [ragInput, setRagInput] = useState('');
  const [ragLoading, setRagLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [courseDocuments, setCourseDocuments] = useState([]);

  // Telemetry & Academic Insights State
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);

  // Load insights, recommendations, and available resources on mount
  useEffect(() => {
    fetchAcademicData();
    fetchCourseDocuments();
  }, []);

  const fetchAcademicData = async () => {
    setInsightsLoading(true);
    try {
      const [insightsRes, recRes, statusRes] = await Promise.allSettled([
        api.get('/ai/academic-insights'),
        api.get('/ai/recommendations'),
        api.get('/ai/status')
      ]);

      if (insightsRes.status === 'fulfilled' && insightsRes.value.data.success) {
        setInsights(insightsRes.value.data);
      }
      if (recRes.status === 'fulfilled' && recRes.value.data.success) {
        setRecommendations(recRes.value.data);
      }
      if (statusRes.status === 'fulfilled' && statusRes.value.data.success) {
        setAiStatus(statusRes.value.data.status);
      }
    } catch (err) {
      console.warn('Could not load AI academic insights:', err);
    } finally {
      setInsightsLoading(false);
    }
  };

  const fetchCourseDocuments = async () => {
    try {
      const res = await api.get('/resources');
      if (res.data.success) {
        setCourseDocuments(res.data.resources || []);
      }
    } catch (err) {
      console.warn('Could not load course documents:', err);
    }
  };

  const handleSend = async (e, directText) => {
    if (e) e.preventDefault();
    const queryText = (directText || input).trim();
    if (!queryText || loading) return;

    const userMsg = {
      sender: 'user',
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!directText) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { query: queryText });
      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: res.data.response,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            engine: res.data.engine
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: err.userMessage || 'I am currently operating in offline mode. Please consult your faculty mentor.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          error: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRagSend = async (e, directText) => {
    if (e) e.preventDefault();
    const queryText = (directText || ragInput).trim();
    if (!queryText || ragLoading) return;

    const userMsg = {
      sender: 'user',
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setRagMessages((prev) => [...prev, userMsg]);
    if (!directText) setRagInput('');
    setRagLoading(true);

    try {
      const payload = {
        query: queryText,
        subjectCode: selectedSubject !== 'all' ? selectedSubject : undefined
      };
      const res = await api.post('/ai/document-assistant/query', payload);
      if (res.data.success) {
        setRagMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: res.data.answer,
            citations: res.data.citations || [],
            hasSufficientEvidence: res.data.hasSufficientEvidence,
            engine: res.data.engine,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      setRagMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: err.userMessage || 'Failed to retrieve document passages. Please verify your course material selection.',
          citations: [],
          hasSufficientEvidence: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          error: true
        }
      ]);
    } finally {
      setRagLoading(false);
    }
  };

  const riskBadge = (level) => {
    if (level === 'High') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
          <AlertTriangle className="w-3.5 h-3.5" /> High Support Priority
        </span>
      );
    }
    if (level === 'Medium') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <AlertCircle className="w-3.5 h-3.5" /> Moderate Support
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
        <CheckCircle2 className="w-3.5 h-3.5" /> Optimal Standing
      </span>
    );
  };

  return (
    <DashboardLayout
      title="SmartCampus AI Academic Advisor & Document Assistant"
      subtitle="Role-aware intelligent consultation, RAG document question answering with verified citations, and early support diagnostics"
    >
      {/* Top Navigation Tabs & Service Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'chat'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Campus Assistant</span>
          </button>
          <button
            onClick={() => setActiveTab('rag')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'rag'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Document Q&A (RAG)</span>
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'recommendations'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Learning & Insights</span>
          </button>
        </div>

        {/* Engine Status Badge */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Engine:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-teal-300 border border-slate-700 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            {aiStatus?.service?.mlModelReady
              ? 'Python ML & RAG Engine (Active)'
              : 'Deterministic Rule Engine (Fallback Active)'}
          </span>
          <button
            onClick={() => { fetchAcademicData(); fetchCourseDocuments(); }}
            title="Refresh AI Data"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab 1: AI Campus Assistant */}
      {activeTab === 'chat' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>Contextual Academic Inquiries</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUERIES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(null, q)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[520px]">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-400 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                      m.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : m.error
                        ? 'bg-rose-50 border border-rose-200 text-rose-800 rounded-tl-none'
                        : 'bg-slate-50 border border-slate-200/70 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    <div className="flex items-center justify-between gap-3 mt-1.5">
                      <span className={`text-[10px] ${m.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {m.time}
                      </span>
                      {m.engine && (
                        <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {m.engine}
                        </span>
                      )}
                    </div>
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-white flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start items-center">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-teal-500 animate-spin" />
                    <span>Synthesizing academic advisor response...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your upcoming assignments, attendance status, timetable, or syllabus..."
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask AI</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: RAG Academic Document Assistant */}
      {activeTab === 'rag' && (
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Document Context Selector & Scope Strip */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Enrolled Course Document Corpus</h4>
                <p className="text-xs text-slate-500">
                  Select a subject scope or query all authorized course study materials.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Enrolled Subjects</option>
                <option value="BCA-501">BCA-501 (AI & Machine Learning)</option>
                <option value="BCA-502">BCA-502 (Web Engineering)</option>
                <option value="BCA-503">BCA-503 (Database Management)</option>
              </select>
            </div>
          </div>

          {/* Suggested Document Inquiries */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookmarkCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Grounded Curricular Questions</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_RAG_QUERIES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRagSend(null, q)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-teal-50/60 hover:bg-teal-100/80 text-teal-900 border border-teal-200 transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* RAG Chat Window */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[560px]">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {ragMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                      <FileText className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                      m.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : m.error
                        ? 'bg-rose-50 border border-rose-200 text-rose-800 rounded-tl-none'
                        : 'bg-slate-50 border border-slate-200/70 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>

                    {/* Verified Source Citations Box */}
                    {m.citations && m.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1">
                          <BookmarkCheck className="w-3.5 h-3.5" />
                          <span>Grounded Document Citations ({m.citations.length})</span>
                        </span>
                        <div className="space-y-1.5">
                          {m.citations.map((c, cIdx) => (
                            <div
                              key={cIdx}
                              className="p-2.5 rounded-lg bg-white border border-teal-200/70 text-[11px] space-y-1"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <FileText className="w-3 h-3 text-teal-600" />
                                  <span>{c.document_title}</span>
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 font-mono text-[10px] font-bold border border-teal-200">
                                  Page {c.page_number}
                                </span>
                              </div>
                              <p className="text-slate-600 italic line-clamp-2">"{c.excerpt}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3 mt-2">
                      <span className={`text-[10px] ${m.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {m.time}
                      </span>
                      {m.engine && (
                        <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {m.engine}
                        </span>
                      )}
                    </div>
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-white flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {ragLoading && (
                <div className="flex gap-3 justify-start items-center">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-teal-500 animate-spin" />
                    <span>Retrieving authorized document chunks and synthesizing answer citations...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <form onSubmit={handleRagSend} className="flex gap-2">
                <input
                  type="text"
                  value={ragInput}
                  onChange={(e) => setRagInput(e.target.value)}
                  placeholder="Ask any question grounded in your course materials (e.g. What is normalization in DBMS Unit 1?)..."
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                />
                <button
                  type="submit"
                  disabled={ragLoading || !ragInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Ask Notes</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Personalized Learning Recommendations & Academic Insights */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          {insightsLoading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
              <Sparkles className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Analyzing academic metrics & curriculum gaps...</p>
            </div>
          ) : (
            <>
              {insights?.analysis && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <GraduationCap className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold text-lg text-slate-900">
                          Academic Standing & ML Support Diagnostics
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500">
                        Evaluated across attendance compliance, assignment submissions, and examination scores.
                      </p>
                    </div>
                    <div>{riskBadge(insights.analysis.riskLevel)}</div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[11px] text-slate-500 block">Attendance Rate</span>
                      <span className="text-lg font-bold text-slate-900">
                        {insights.metrics?.attendanceRate ?? 0}%
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Min. required: 75%
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[11px] text-slate-500 block">Assignment Completion</span>
                      <span className="text-lg font-bold text-slate-900">
                        {insights.metrics?.assignmentCompletionRate ?? 0}%
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {insights.metrics?.totalAssignmentsSubmitted ?? 0} submitted
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[11px] text-slate-500 block">Current GPA</span>
                      <span className="text-lg font-bold text-slate-900">
                        {insights.metrics?.gpa ?? 'N/A'}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Scale of 10.0</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[11px] text-slate-500 block">Risk Score / Confidence</span>
                      <span className="text-lg font-bold text-slate-900">
                        {Math.round((insights.analysis.riskScore || 0) * 100)}%
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Confidence: {Math.round((insights.analysis.confidence || 0) * 100)}%
                      </span>
                    </div>
                  </div>

                  {insights.analysis.contributingFactors?.length > 0 && (
                    <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                        <span>Identified Performance Influencers</span>
                      </h4>
                      <ul className="space-y-1">
                        {insights.analysis.contributingFactors.map((factor, i) => (
                          <li key={i} className="text-xs text-amber-900 flex items-start gap-2">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Personalized Recommended Topics */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">
                      Curriculum Focus Recommendations
                    </h3>
                    <p className="text-xs text-slate-500">
                      Targeted syllabus modules based on performance gaps and upcoming course milestones.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendations?.recommendedTopics?.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {rec.courseCode}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              rec.priority === 'High'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {rec.priority} Priority
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-1">{rec.topic}</h4>
                        <p className="text-xs text-slate-600 mb-3">{rec.reason}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Focus Area: {rec.action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Curated Library & Academic Learning Resources */}
              {recommendations?.libraryResources?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Library className="w-5 h-5 text-teal-600" />
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">
                        Curated Learning & Library Resources
                      </h3>
                      <p className="text-xs text-slate-500">
                        Approved textbooks, practice guides, and reference material matched to your curriculum.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recommendations.libraryResources.map((res, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                              {res.type}
                            </span>
                            <span className="text-[10px] text-slate-500">{res.courseCode}</span>
                          </div>
                          <h5 className="text-xs font-bold text-slate-900">{res.title}</h5>
                          <p className="text-[11px] text-slate-500 mt-0.5">Author/Source: {res.author}</p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-white border border-slate-200 text-indigo-600 flex-shrink-0 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          <span>Access</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentAIPage;
