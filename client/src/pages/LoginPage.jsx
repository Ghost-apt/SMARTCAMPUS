import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, ShieldCheck, GraduationCap, Users } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please enter both your university email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      // Redirect based on role
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (result.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (result.role === 'faculty') {
        navigate('/faculty/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } else {
      setLocalError(result.message || 'Invalid email or password.');
    }
  };

  // Demo auto-fill helper
  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLocalError('');
  };

  return (
    <div className="min-h-screen bg-[#080B16] text-[#F3F6FF] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-[#6C8CFF]/30 selection:text-white">
      {/* Tech Grid Background Overlay */}
      <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />

      {/* Atmospheric Ambient Glows */}
      <div className="absolute -top-24 left-1/4 w-96 h-96 bg-[#43D9FF]/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-[#6C8CFF]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-20 w-80 h-80 bg-[#A78BFA]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#9BA8C7] hover:text-white mb-6 transition-all px-3 py-1.5 rounded-full bg-[#121A2E]/70 border border-[#232D48] hover:border-[#6C8CFF]/40 backdrop-blur-md"
        >
          <span>← Back to SmartCampus Home</span>
        </Link>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6C8CFF] to-[#43D9FF] text-slate-950 shadow-glow-blue mb-4">
          <Bot className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-[#F3F6FF] tracking-tight">SmartCampus AI</h2>
        <p className="mt-1 text-sm text-[#9BA8C7]">Intelligent University Management & Student Support</p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 z-10">
        <div className="bg-[#121A2E]/90 backdrop-blur-xl border border-[#232D48] rounded-3xl p-6 sm:p-8 shadow-2xl hover:border-[#6C8CFF]/30 transition-all">
          {localError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{localError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9BA8C7] mb-1.5">
                University Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@smartcampus.edu"
                  required
                  className="w-full bg-[#0D1224]/90 border border-[#232D48] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F3F6FF] placeholder-slate-500 focus:outline-none focus:border-[#6C8CFF] focus:ring-1 focus:ring-[#6C8CFF] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9BA8C7] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0D1224]/90 border border-[#232D48] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#F3F6FF] placeholder-slate-500 focus:outline-none focus:border-[#6C8CFF] focus:ring-1 focus:ring-[#6C8CFF] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-gradient-to-r from-[#6C8CFF] to-[#43D9FF] hover:from-[#5575F5] hover:to-[#6CE1FF] text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#6C8CFF]/25 flex items-center justify-center gap-2 text-sm transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to SmartCampus</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Helper */}
          <div className="mt-6 pt-6 border-t border-[#232D48]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9BA8C7] text-center mb-3">
              One-Click Demo Accounts (Viva & Evaluation)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('student@smartcampus.edu', 'Student@123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#0D1224]/80 border border-[#232D48] hover:border-[#6C8CFF] hover:bg-[#18233B] text-slate-300 transition-all text-xs group"
              >
                <Users className="w-4 h-4 text-[#6C8CFF] mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-[11px] text-[#F3F6FF]">Student</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('faculty@smartcampus.edu', 'Faculty@123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#0D1224]/80 border border-[#232D48] hover:border-[#43D9FF] hover:bg-[#18233B] text-slate-300 transition-all text-xs group"
              >
                <GraduationCap className="w-4 h-4 text-[#43D9FF] mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-[11px] text-[#F3F6FF]">Faculty</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin@smartcampus.edu', 'Admin@123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#0D1224]/80 border border-[#232D48] hover:border-[#A78BFA] hover:bg-[#18233B] text-slate-300 transition-all text-xs group"
              >
                <ShieldCheck className="w-4 h-4 text-[#A78BFA] mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-[11px] text-[#F3F6FF]">Admin</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#9BA8C7]">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#6C8CFF] font-semibold hover:text-[#8FA8FF] transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

