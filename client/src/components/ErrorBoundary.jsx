import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SmartCampus AI — UI Error Caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080B16] text-[#F3F6FF] flex items-center justify-center p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />
          <div className="absolute -top-24 left-1/4 w-96 h-96 bg-[#43D9FF]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-[#6C8CFF]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-md w-full bg-[#121A2E]/90 border border-[#232D48] rounded-3xl p-8 shadow-2xl text-center space-y-6 backdrop-blur-xl relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-black text-[#F3F6FF] tracking-tight">Something Went Wrong</h2>
              <p className="text-xs text-[#9BA8C7] mt-2 leading-relaxed">
                The application encountered an unexpected display error on this page.
              </p>
              {this.state.error?.message && (
                <div className="mt-3 p-3 bg-[#0D1224] rounded-xl text-rose-300 font-mono text-[11px] text-left overflow-x-auto border border-rose-900/30">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl bg-[#18233B] hover:bg-[#232D48] text-white text-xs font-bold flex items-center justify-center gap-2 border border-[#232D48] transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6C8CFF] to-[#43D9FF] hover:from-[#5575F5] hover:to-[#6CE1FF] text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all transform hover:scale-[1.02]"
              >
                <Home className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
