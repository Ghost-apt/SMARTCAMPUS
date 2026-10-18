import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, ShieldCheck, GraduationCap, Users } from 'lucide-react';
import SmartCampusLogo from '../components/SmartCampusLogo';

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
    <div className="min-h-screen bg-[#07162E] text-[#F8F6F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-[#D9AE4B]/30 selection:text-white">
      {/* Subtle Academic Ambient Lighting */}
      <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-[#173F78]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-[500px] h-[500px] bg-[#0B2347]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-[#D9AE4B]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Full Official Crest */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#9BA8C7] hover:text-[#F8F6F0] mb-6 transition-all px-3 py-1.5 rounded-full bg-[#0B2347]/60 border border-[#173F78]/50 hover:border-[#D9AE4B]/40 backdrop-blur-md"
        >
          <span>← Back to University Home</span>
        </Link>
        
        {/* Full University Crest Logo */}
        <div className="mb-3">
          <SmartCampusLogo variant="full" size="xl" showTagline={true} />
        </div>
        <p className="mt-2 text-xs font-medium text-[#9BA8C7] uppercase tracking-wider">
          Institutional Access & Administration Portal
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 z-10">
        <div className="bg-[#0B2347]/85 backdrop-blur-xl border border-[#173F78]/60 rounded-3xl p-6 sm:p-8 shadow-2xl hover:border-[#D9AE4B]/35 transition-all">
          <div className="mb-5 pb-3 border-b border-[#173F78]/40 text-center">
            <h3 className="text-lg font-bold text-white tracking-tight">University Sign-In</h3>
            <p className="text-xs text-[#9BA8C7] mt-0.5">Enter your institutional credentials</p>
          </div>

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
                  className="w-full bg-[#07162E]/90 border border-[#173F78]/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F8F6F0] placeholder-slate-500 focus:outline-none focus:border-[#D9AE4B] focus:ring-1 focus:ring-[#D9AE4B] transition-colors"
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
                  className="w-full bg-[#07162E]/90 border border-[#173F78]/60 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#F8F6F0] placeholder-slate-500 focus:outline-none focus:border-[#D9AE4B] focus:ring-1 focus:ring-[#D9AE4B] transition-colors"
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
              className="w-full mt-2 bg-gradient-to-r from-[#0B2347] via-[#173F78] to-[#0B2347] hover:from-[#173F78] hover:to-[#0B2347] text-[#F8F6F0] font-bold py-3 px-4 rounded-xl border border-[#D9AE4B]/40 shadow-lg shadow-[#07162E]/50 flex items-center justify-center gap-2 text-sm transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to SmartCampus</span>
                  <ArrowRight className="w-4 h-4 text-[#D9AE4B]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Helper */}
          <div className="mt-6 pt-5 border-t border-[#173F78]/50">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9BA8C7] text-center mb-3">
              One-Click Demo Accounts (Viva & Evaluation)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('student@smartcampus.edu', 'Student@123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#07162E]/80 border border-[#173F78]/60 hover:border-[#D9AE4B] hover:bg-[#0B2347] text-slate-300 transition-all text-xs group"
              >
                <Users className="w-4 h-4 text-[#D9AE4B] mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-[11px] text-[#F8F6F0]">Student</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('faculty@smartcampus.edu', 'Faculty@123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#07162E]/80 border border-[#173F78]/60 hover:border-[#6CE1FF] hover:bg-[#0B2347] text-slate-300 transition-all text-xs group"
              >
                <GraduationCap className="w-4 h-4 text-[#6CE1FF] mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-[11px] text-[#F8F6F0]">Faculty</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin@smartcampus.edu', 'Admin@123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#07162E]/80 border border-[#173F78]/60 hover:border-[#F2D78A] hover:bg-[#0B2347] text-slate-300 transition-all text-xs group"
              >
                <ShieldCheck className="w-4 h-4 text-[#F2D78A] mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-[11px] text-[#F8F6F0]">Admin</span>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center">
            <p className="text-xs text-[#9BA8C7]">
              New campus member?{' '}
              <Link to="/register" className="text-[#D9AE4B] font-semibold hover:text-[#F2D78A] transition-colors">
                Register account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

