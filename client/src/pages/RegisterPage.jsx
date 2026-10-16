import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, Mail, Lock, User, Building, IdCard, ArrowRight, AlertCircle, Eye, EyeOff, GraduationCap, Users } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    department: 'BCA',
    rollNumber: '',
    employeeId: '',
    phone: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match. Please re-enter.');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      department: formData.department,
      studentId: formData.rollNumber,
      facultyId: formData.employeeId,
      phone: formData.phone
    });
    setIsSubmitting(false);

    if (result.success) {
      if (result.role === 'faculty') {
        navigate('/faculty/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } else {
      setLocalError(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080B16] text-[#F3F6FF] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-[#6C8CFF]/30 selection:text-white">
      {/* Tech Grid Background Overlay */}
      <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />

      {/* Atmospheric Ambient Glows */}
      <div className="absolute -top-24 right-1/4 w-96 h-96 bg-[#6C8CFF]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-[#43D9FF]/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute top-1/2 -right-20 w-80 h-80 bg-[#A78BFA]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#9BA8C7] hover:text-white mb-6 transition-all px-3 py-1.5 rounded-full bg-[#121A2E]/70 border border-[#232D48] hover:border-[#6C8CFF]/40 backdrop-blur-md"
        >
          <span>← Back to SmartCampus Home</span>
        </Link>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6C8CFF] to-[#43D9FF] text-slate-950 shadow-glow-blue mb-3">
          <Bot className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-extrabold text-[#F3F6FF] tracking-tight">Create Your Account</h2>
        <p className="mt-1 text-sm text-[#9BA8C7]">Join SmartCampus AI Intelligent University Platform</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0 z-10">
        <div className="bg-[#121A2E]/90 backdrop-blur-xl border border-[#232D48] rounded-3xl p-6 sm:p-8 shadow-2xl hover:border-[#6C8CFF]/30 transition-all">
          {localError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{localError}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9BA8C7] mb-2">
                I am Registering As
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'student', department: 'BCA' })}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    formData.role === 'student'
                      ? 'bg-gradient-to-r from-[#6C8CFF] to-[#43D9FF] text-slate-950 border-[#43D9FF] shadow-lg shadow-[#6C8CFF]/25 font-bold'
                      : 'bg-[#0D1224]/80 text-[#9BA8C7] border-[#232D48] hover:bg-[#18233B] hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'faculty', department: 'Computer Applications' })}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    formData.role === 'faculty'
                      ? 'bg-gradient-to-r from-[#43D9FF] to-[#38bdf8] text-slate-950 border-[#38bdf8] shadow-lg shadow-[#43D9FF]/25 font-bold'
                      : 'bg-[#0D1224]/80 text-[#9BA8C7] border-[#232D48] hover:bg-[#18233B] hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Faculty</span>
                </button>
              </div>
            </div>

            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9BA8C7] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Verma"
                    required
                    className="w-full bg-[#0D1224]/90 border border-[#232D48] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F3F6FF] placeholder-slate-500 focus:outline-none focus:border-[#6C8CFF] focus:ring-1 focus:ring-[#6C8CFF] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9BA8C7] mb-1.5">
                  University Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@smartcampus.edu"
                    required
                    className="w-full bg-[#0D1224]/90 border border-[#232D48] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F3F6FF] placeholder-slate-500 focus:outline-none focus:border-[#6C8CFF] focus:ring-1 focus:ring-[#6C8CFF] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Department & ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9BA8C7] mb-1.5">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full bg-[#0D1224]/90 border border-[#232D48] rounded-xl px-4 py-2.5 text-sm text-[#F3F6FF] focus:outline-none focus:border-[#6C8CFF] transition-colors"
                >
                  <option value="BCA" className="bg-[#121A2E] text-white">Bachelor of Computer Applications (BCA)</option>
                  <option value="Computer Applications" className="bg-[#121A2E] text-white">Computer Applications (MCA/M.Sc)</option>
                  <option value="Computer Science" className="bg-[#121A2E] text-white">Computer Science & Engineering</option>
                  <option value="Information Technology" className="bg-[#121A2E] text-white">Information Technology</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9BA8C7] mb-1.5">
                  {formData.role === 'student' ? 'Roll / Student ID' : 'Employee ID'}
                </label>
                <div className="relative">
                  <IdCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name={formData.role === 'student' ? 'rollNumber' : 'employeeId'}
                    value={formData.role === 'student' ? formData.rollNumber : formData.employeeId}
                    onChange={handleChange}
                    placeholder={formData.role === 'student' ? 'e.g. BCA-2023-042' : 'e.g. FAC-BCA-001'}
                    className="w-full bg-[#0D1224]/90 border border-[#232D48] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F3F6FF] placeholder-slate-500 focus:outline-none focus:border-[#6C8CFF] focus:ring-1 focus:ring-[#6C8CFF] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9BA8C7] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
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

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9BA8C7] mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    required
                    className="w-full bg-[#0D1224]/90 border border-[#232D48] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F3F6FF] placeholder-slate-500 focus:outline-none focus:border-[#6C8CFF] focus:ring-1 focus:ring-[#6C8CFF] transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 bg-gradient-to-r from-[#6C8CFF] to-[#43D9FF] hover:from-[#5575F5] hover:to-[#6CE1FF] text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#6C8CFF]/25 flex items-center justify-center gap-2 text-sm transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#9BA8C7]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#6C8CFF] font-semibold hover:text-[#8FA8FF] transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

