import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UnauthorizedPage = () => {
  const { role } = useAuth();
  const returnPath = role === 'admin' ? '/admin/dashboard' : role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard';

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-white tracking-tight">403 — Access Restricted</h1>
      <p className="text-slate-400 max-w-md mt-2 text-sm leading-relaxed">
        You do not possess the necessary role authorization to access this university resource.
      </p>
      <Link
        to={returnPath}
        className="mt-6 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/30"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Authorized Dashboard</span>
      </Link>
    </div>
  );
};

export default UnauthorizedPage;

