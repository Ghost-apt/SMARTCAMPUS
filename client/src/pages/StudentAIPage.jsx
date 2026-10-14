import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';
import { Bot, Send, Sparkles, User, AlertCircle, BookOpen, Clock, HelpCircle } from 'lucide-react';

const SUGGESTED_QUERIES = [
  'What is the minimum attendance required for semester exams?',
  'What are the course outcomes for BCA-501 Artificial Intelligence?',
  'How is the CGPA calculated on a 10-point scale?',
  'What are the campus guidelines for assignment submissions?'
];

const StudentAIPage = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your SmartCampus AI Academic Advisor. Ask me anything regarding university policies, attendance compliance, exam rules, or course syllabus.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    setError('');

    try {
      const res = await api.post('/ai/chat', { query: queryText, category: 'Academic Guidance' });
      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: res.data.response,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: err.userMessage || 'I am currently operating in offline mode. Please consult your faculty mentor.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="SmartCampus AI Academic Assistant"
      subtitle="Intelligent automated academic consultation and syllabus advisory engine"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Suggested Queries */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Frequently Asked Academic Inquiries</span>
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

        {/* Chat Window */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[520px]">
          {/* Messages Container */}
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
                      : 'bg-slate-50 border border-slate-200/70 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  <span
                    className={`block text-[10px] mt-1.5 ${
                      m.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400 text-left'
                    }`}
                  >
                    {m.time}
                  </span>
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
                  <span>Synthesizing academic university response...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about attendance policies, syllabus topics, grading criteria..."
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
    </DashboardLayout>
  );
};

export default StudentAIPage;

