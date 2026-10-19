import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Mail,
  Lock,
  User,
  Building,
  IdCard,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Check,
  Search,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import SmartCampusLogo from '../components/SmartCampusLogo';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'status' ? 'status' : 'register');

  // Registration Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    department: 'Computer Applications',
    course: 'BCA',
    semester: 1,
    academicYear: '2026-2027',
    phone: '',
    employeeId: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [copied, setCopied] = useState(false);

  // Successful submission state (shows confirmation card)
  const [submittedData, setSubmittedData] = useState(null);

  // Status Lookup State
  const [statusInput, setStatusInput] = useState(searchParams.get('reference') || '');
  const [statusResult, setStatusResult] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');

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
      course: formData.course,
      semester: Number(formData.semester) || 1,
      academicYear: formData.academicYear,
      phone: formData.phone,
      facultyId: formData.employeeId
    });
    setIsSubmitting(false);

    if (result.success) {
      if (result.pendingApproval) {
        // Show genuine confirmation screen with registration reference
        setSubmittedData({
          registrationId: result.registrationId,
          name: formData.name,
          email: formData.email,
          department: formData.department,
          course: formData.course,
          semester: formData.semester,
          academicYear: formData.academicYear,
          message: result.message
        });
      } else if (result.role === 'faculty') {
        navigate('/faculty/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } else {
      setLocalError(result.message || 'Registration failed.');
    }
  };

  const handleCheckStatus = async (e) => {
    if (e) e.preventDefault();
    const query = statusInput.trim();
    if (!query) {
      setStatusError('Please enter a Registration Reference ID or Email address.');
      return;
    }

    setStatusLoading(true);
    setStatusError('');
    setStatusResult(null);

    try {
      const isEmail = query.includes('@');
      const param = isEmail ? `email=${encodeURIComponent(query)}` : `reference=${encodeURIComponent(query)}`;
      const res = await api.get(`/auth/registration-status?${param}`);
      if (res.data.success) {
        setStatusResult(res.data.registration);
      }
    } catch (err) {
      setStatusError(err.userMessage || 'No registration record found for the provided details.');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleCopyReference = (ref) => {
    navigator.clipboard.writeText(ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          Admissions & Member Registration Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0 z-10">
        <div className="bg-[#0B2347]/85 backdrop-blur-xl border border-[#173F78]/60 rounded-3xl p-6 sm:p-8 shadow-2xl hover:border-[#D9AE4B]/35 transition-all">
          {/* Confirmation View (Rendered after successful submission) */}
          {submittedData ? (
            <div className="text-center space-y-6 py-2 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Registration Submitted Successfully!</h3>
                <p className="text-xs text-[#9BA8C7] mt-1.5 max-w-md mx-auto leading-relaxed">
                  Your university admission request has been securely recorded and is currently awaiting administrator review.
                </p>
              </div>

              {/* Reference ID Card */}
              <div className="p-4 rounded-2xl bg-[#07162E]/90 border border-[#D9AE4B]/40 flex flex-col items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#D9AE4B]">
                  Registration Reference Number
                </span>
                <div className="flex items-center gap-2 font-mono text-lg font-black text-white">
                  <span>{submittedData.registrationId}</span>
                  <button
                    onClick={() => handleCopyReference(submittedData.registrationId)}
                    className="p-1 rounded hover:bg-[#173F78] text-[#9BA8C7] hover:text-white transition-colors"
                    title="Copy Reference"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 mt-1">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>Status: Awaiting Administrator Approval</span>
                </div>
              </div>

              {/* Submitted Summary */}
              <div className="grid grid-cols-2 gap-3 text-left p-4 rounded-2xl bg-[#07162E]/60 border border-[#173F78]/50 text-xs">
                <div>
                  <span className="text-[10px] text-[#9BA8C7] uppercase font-medium">Applicant Name</span>
                  <p className="font-semibold text-white">{submittedData.name}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#9BA8C7] uppercase font-medium">University Email</span>
                  <p className="font-semibold text-white break-all">{submittedData.email}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#9BA8C7] uppercase font-medium">Department</span>
                  <p className="font-semibold text-white">{submittedData.department}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#9BA8C7] uppercase font-medium">Academic Program</span>
                  <p className="font-semibold text-white">{submittedData.course} (Sem {submittedData.semester})</p>
                </div>
              </div>

              {/* Institutional Guidance */}
              <div className="p-3.5 rounded-xl bg-[#173F78]/30 border border-[#173F78]/60 text-xs text-left text-slate-300 space-y-1.5">
                <p className="font-semibold text-[#F2D78A] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#D9AE4B]" />
                  <span>Next Steps in Admission Workflow:</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#9BA8C7]">
                  <li>University Administration reviews and validates your academic credentials.</li>
                  <li>Upon approval, your official University Student ID is issued.</li>
                  <li>You will be able to sign in using your registered credentials.</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStatusInput(submittedData.registrationId);
                    setActiveTab('status');
                    setSubmittedData(null);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#D9AE4B]/60 text-[#F2D78A] hover:bg-[#D9AE4B]/10 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Check Application Status</span>
                </button>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0B2347] to-[#173F78] hover:from-[#173F78] hover:to-[#0B2347] text-white font-bold text-xs border border-[#173F78] shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Go to University Sign-In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Tab Selector */}
              <div className="flex items-center gap-2 mb-6 p-1 bg-[#07162E]/70 rounded-2xl border border-[#173F78]/50">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setLocalError('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    activeTab === 'register'
                      ? 'bg-gradient-to-r from-[#0B2347] to-[#173F78] text-white border border-[#D9AE4B]/40 shadow-sm'
                      : 'text-[#9BA8C7] hover:text-white'
                  }`}
                >
                  New Registration
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('status');
                    setLocalError('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    activeTab === 'status'
                      ? 'bg-gradient-to-r from-[#0B2347] to-[#173F78] text-white border border-[#D9AE4B]/40 shadow-sm'
                      : 'text-[#9BA8C7] hover:text-white'
                  }`}
                >
                  Check Application Status
                </button>
              </div>

              {/* TAB 1: NEW REGISTRATION FORM */}
              {activeTab === 'register' && (
                <>
                  <div className="mb-5 pb-3 border-b border-[#173F78]/40 text-center">
                    <h3 className="text-lg font-bold text-white tracking-tight">University Admission Form</h3>
                    <p className="text-xs text-[#9BA8C7] mt-0.5">
                      Submissions are reviewed by campus administration before portal privileges are granted
                    </p>
                  </div>

                  {localError && (
                    <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{localError}</span>
                    </div>
                  )}

                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* Role Selector */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#9BA8C7] mb-2">
                        Member Role
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, role: 'student' })}
                          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all ${
                            formData.role === 'student'
                              ? 'bg-gradient-to-r from-[#0B2347] to-[#173F78] text-[#F8F6F0] border-[#D9AE4B] shadow-md font-bold ring-1 ring-[#D9AE4B]'
                              : 'bg-[#07162E]/80 text-[#9BA8C7] border-[#173F78]/60 hover:bg-[#0B2347] hover:text-white'
                          }`}
                        >
                          <Users className="w-4 h-4 text-[#D9AE4B]" />
                          <span>Student Applicant</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, role: 'faculty' })}
                          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all ${
                            formData.role === 'faculty'
                              ? 'bg-gradient-to-r from-[#0B2347] to-[#173F78] text-[#F8F6F0] border-[#6CE1FF] shadow-md font-bold ring-1 ring-[#6CE1FF]'
                              : 'bg-[#07162E]/80 text-[#9BA8C7] border-[#173F78]/60 hover:bg-[#0B2347] hover:text-white'
                          }`}
                        >
                          <GraduationCap className="w-4 h-4 text-[#6CE1FF]" />
                          <span>Faculty Member</span>
                        </button>
                      </div>
                    </div>

                    {/* Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#9BA8C7] mb-1.5">
                          Full Name *
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
                          University / Personal Email *
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

                    {/* Department & Program */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#9BA8C7] mb-1.5">
                          Department *
                        </label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          className="w-full bg-[#07162E]/90 border border-[#173F78]/60 rounded-xl px-4 py-2.5 text-sm text-[#F8F6F0] focus:outline-none focus:border-[#D9AE4B] transition-colors"
                        >
                          <option value="Computer Applications" className="bg-[#0B2347] text-white">Computer Applications</option>
                          <option value="BCA" className="bg-[#0B2347] text-white">Bachelor of Computer Applications</option>
                          <option value="Computer Science" className="bg-[#0B2347] text-white">Computer Science & Engineering</option>
                          <option value="Information Technology" className="bg-[#0B2347] text-white">Information Technology</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#9BA8C7] mb-1.5">
                          {formData.role === 'student' ? 'Course / Degree' : 'Designation / Employee ID'}
                        </label>
                        {formData.role === 'student' ? (
                          <select
                            name="course"
                            value={formData.course}
                            onChange={handleChange}
                            className="w-full bg-[#07162E]/90 border border-[#173F78]/60 rounded-xl px-4 py-2.5 text-sm text-[#F8F6F0] focus:outline-none focus:border-[#D9AE4B] transition-colors"
                          >
                            <option value="BCA" className="bg-[#0B2347] text-white">BCA (Undergraduate)</option>
                            <option value="MCA" className="bg-[#0B2347] text-white">MCA (Postgraduate)</option>
                            <option value="B.Tech CSE" className="bg-[#0B2347] text-white">B.Tech Computer Science</option>
                            <option value="B.Tech IT" className="bg-[#0B2347] text-white">B.Tech Information Technology</option>
                          </select>
                        ) : (
                          <div className="relative">
                            <IdCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                              type="text"
                              name="employeeId"
                              value={formData.employeeId}
                              onChange={handleChange}
                              placeholder="e.g. FAC-BCA-014"
                              className="w-full bg-[#07162E]/90 border border-[#173F78]/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F8F6F0] placeholder-slate-500 focus:outline-none focus:border-[#D9AE4B] transition-colors"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Academic Session & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#9BA8C7] mb-1.5">
                          Intended Semester & Session
                        </label>
                        <select
                          name="semester"
                          value={formData.semester}
                          onChange={handleChange}
                          className="w-full bg-[#07162E]/90 border border-[#173F78]/60 rounded-xl px-4 py-2.5 text-sm text-[#F8F6F0] focus:outline-none focus:border-[#D9AE4B] transition-colors"
                        >
                          <option value="1" className="bg-[#0B2347] text-white">Semester 1 (Autumn 2026)</option>
                          <option value="2" className="bg-[#0B2347] text-white">Semester 2 (Spring 2027)</option>
                          <option value="3" className="bg-[#0B2347] text-white">Semester 3 (Autumn 2026)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#9BA8C7] mb-1.5">
                          Phone Number (Optional)
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className="w-full bg-[#07162E]/90 border border-[#173F78]/60 rounded-xl px-4 py-2.5 text-sm text-[#F8F6F0] placeholder-slate-500 focus:outline-none focus:border-[#D9AE4B] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Password Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#9BA8C7] mb-1.5">
                          Password *
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
                          Confirm Password *
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
                        <span>Submitting Application...</span>
                      ) : (
                        <>
                          <span>Submit Registration Request</span>
                          <ArrowRight className="w-4 h-4 text-[#D9AE4B]" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}

              {/* TAB 2: APPLICATION STATUS INQUIRY */}
              {activeTab === 'status' && (
                <div className="space-y-6">
                  <div className="text-center pb-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">Check Admission Status</h3>
                    <p className="text-xs text-[#9BA8C7] mt-0.5">
                      Enter your Registration Reference (e.g. REG-2026-XXXXX) or registered email address
                    </p>
                  </div>

                  {statusError && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{statusError}</span>
                    </div>
                  )}

                  <form onSubmit={handleCheckStatus} className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={statusInput}
                        onChange={(e) => setStatusInput(e.target.value)}
                        placeholder="Enter REG-2026-XXXXX or your email..."
                        className="w-full bg-[#07162E]/90 border border-[#173F78]/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D9AE4B]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={statusLoading}
                      className="px-5 py-2.5 rounded-xl bg-[#173F78] hover:bg-[#1f5196] text-white font-bold text-xs border border-[#D9AE4B]/40 transition-colors disabled:opacity-50"
                    >
                      {statusLoading ? 'Checking...' : 'Check Status'}
                    </button>
                  </form>

                  {/* Status Result Card */}
                  {statusResult && (
                    <div className="p-5 rounded-2xl bg-[#07162E]/90 border border-[#173F78]/70 space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between pb-3 border-b border-[#173F78]/40">
                        <div>
                          <span className="text-[10px] text-[#D9AE4B] font-mono font-bold">
                            {statusResult.registrationId}
                          </span>
                          <h4 className="text-sm font-bold text-white">{statusResult.name}</h4>
                        </div>
                        {statusResult.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <Clock className="w-3.5 h-3.5 animate-pulse" />
                            Awaiting Approval
                          </span>
                        )}
                        {statusResult.status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approved
                          </span>
                        )}
                        {statusResult.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            <XCircle className="w-3.5 h-3.5" />
                            Rejected
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] text-[#9BA8C7] uppercase">Department</span>
                          <p className="font-semibold text-white">{statusResult.department}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#9BA8C7] uppercase">Program / Semester</span>
                          <p className="font-semibold text-white">
                            {statusResult.course} • Sem {statusResult.semester || 1}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#9BA8C7] uppercase">Submitted On</span>
                          <p className="font-semibold text-white">
                            {new Date(statusResult.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        {statusResult.assignedStudentId && (
                          <div>
                            <span className="text-[10px] text-[#D9AE4B] uppercase font-bold">Official Student ID</span>
                            <p className="font-mono font-black text-[#F2D78A]">{statusResult.assignedStudentId}</p>
                          </div>
                        )}
                      </div>

                      {statusResult.status === 'APPROVED' && (
                        <div className="pt-2">
                          <Link
                            to="/login"
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md"
                          >
                            <span>Your Account is Active — Sign In Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}

                      {statusResult.status === 'REJECTED' && statusResult.rejectionReason && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                          <strong>University Note:</strong> {statusResult.rejectionReason}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Footer link back to sign-in */}
              <div className="mt-6 text-center">
                <p className="text-xs text-[#9BA8C7]">
                  Already registered and approved?{' '}
                  <Link to="/login" className="text-[#D9AE4B] font-semibold hover:text-[#F2D78A] transition-colors">
                    Sign in to Portal
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
