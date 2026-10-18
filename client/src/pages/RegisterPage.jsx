import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Building, IdCard, ArrowRight, AlertCircle, Eye, EyeOff, GraduationCap, Users } from 'lucide-react';
import SmartCampusLogo from '../components/SmartCampusLogo';

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
    <div className="min-h-screen bg-[#07162E] text-[#F8F6F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-[#D9AE4B]/30 selection:text-white">
      {/* Subtle Academic Ambient Lighting */}
      <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] bg-[#173F78]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] bg-[#0B2347]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-[#D9AE4B]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#9BA8C7] hover:text-[#F8F6F0] mb-6 transition-all px-3 py-1.5 rounded-full bg-[#0B2347]/60 border border-[#173F78]/50 hover:border-[#D9AE4B]/40 backdrop-blur-md"
        >
          <span>← Back to University Home</span>
        </Link>
        
        {/* University Crest Logo */}
        <div className="mb-3">
          <SmartCampusLogo variant="full" size="lg" showTagline={true} />
        </div>
        <p className="mt-2 text-xs font-medium text-[#9BA8C7] uppercase tracking-wider">
          University Member Registration Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0 z-10">
        <div className="bg-[#0B2347]/85 backdrop-blur-xl border border-[#173F78]/60 rounded-3xl p-6 sm:p-8 shadow-2xl hover:border-[#D9AE4B]/35 transition-all">
          <div className="mb-5 pb-3 border-b border-[#173F78]/40 text-center">
            <h3 className="text-lg font-bold text-white tracking-tight">Create University Account</h3>
            <p className="text-xs text-[#9BA8C7] mt-0.5">Register for student or faculty portal privileges</p>
          </div>

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
                      ? 'bg-gradient-to-r from-[#0B2347] to-[#173F78] text-[#F8F6F0] border-[#D9AE4B] shadow-md font-bold ring-1 ring-[#D9AE4B]'
                      : 'bg-[#07162E]/80 text-[#9BA8C7] border-[#173F78]/60 hover:bg-[#0B2347] hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4 text-[#D9AE4B]" />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'faculty', department: 'Computer Applications' })}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    formData.role === 'faculty'
                      ? 'bg-gradient-to-r from-[#0B2347] to-[#173F78] text-[#F8F6F0] border-[#6CE1FF] shadow-md font-bold ring-1 ring-[#6CE1FF]'
                      : 'bg-[#07162E]/80 text-[#9BA8C7] border-[#173F78]/60 hover:bg-[#0B2347] hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-[#6CE1FF]" />
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
                    className="w-full bg-[#07162E]/90 border border-[#173F78]/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F8F6F0] placeholder-slate-500 focus:outline-none focus:border-[#D9AE4B] focus:ring-1 focus:ring-[#D9AE4B] transition-colors"
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
                    className="w-full bg-[#07162E]/90 border border-[#173F78]/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F8F6F0] placeholder-slate-500 focus:outline-none focus:border-[#D9AE4B] focus:ring-1 focus:ring-[#D9AE4B] transition-colors"
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
                  className="w-full bg-[#07162E]/90 border border-[#173F78]/60 rounded-xl px-4 py-2.5 text-sm text-[#F8F6F0] focus:outline-none focus:border-[#D9AE4B] transition-colors"
                >
                  <option value="BCA" className="bg-[#0B2347] text-white">Bachelor of Computer Applications (BCA)</option>
                  <option value="Computer Applications" className="bg-[#0B2347] text-white">Computer Applications (MCA/M.Sc)</option>
                  <option value="Computer Science" className="bg-[#0B2347] text-white">Computer Science & Engineering</option>
                  <option value="Information Technology" className="bg-[#0B2347] text-white">Information Technology</option>
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
                    className="w-full bg-[#07162E]/90 border border-[#173F78]/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F8F6F0] placeholder-slate-500 focus:outline-none focus:border-[#D9AE4B] focus:ring-1 focus:ring-[#D9AE4B] transition-colors"
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
                    className="w-full bg-[#07162E]/90 border border-[#173F78]/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F8F6F0] placeholder-slate-500 focus:outline-none focus:border-[#D9AE4B] focus:ring-1 focus:ring-[#D9AE4B] transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 bg-gradient-to-r from-[#0B2347] via-[#173F78] to-[#0B2347] hover:from-[#173F78] hover:to-[#0B2347] text-[#F8F6F0] font-bold py-3 px-4 rounded-xl border border-[#D9AE4B]/40 shadow-lg shadow-[#07162E]/50 flex items-center justify-center gap-2 text-sm transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 text-[#D9AE4B]" />
                </>
              )}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-xs text-[#9BA8C7]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#D9AE4B] font-semibold hover:text-[#F2D78A] transition-colors">
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

