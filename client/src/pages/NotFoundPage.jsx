import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-300 mt-1">Page Not Found</h2>
      <p className="text-slate-400 max-w-md mt-2 text-sm leading-relaxed">
        The requested university portal URL does not exist or has been relocated.
      </p>
      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/30"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Login</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;

