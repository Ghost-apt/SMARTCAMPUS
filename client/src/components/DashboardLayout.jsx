import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = ({ children, title, subtitle, headerActions }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F6F0] dark:bg-[#07162E] text-slate-900 dark:text-[#F8F6F0] flex relative overflow-x-hidden transition-colors duration-200">
      {/* Ambient background lighting */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[400px] bg-[#173F78]/5 dark:bg-[#173F78]/15 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="fixed top-12 left-1/3 w-[500px] h-[350px] bg-[#D9AE4B]/3 dark:bg-[#D9AE4B]/5 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 relative z-10">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {(title || subtitle || headerActions) && (
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 dark:border-[#173F78]/30 pb-4">
              <div>
                {title && (
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#07162E] dark:text-white tracking-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xs sm:text-sm text-[#748197] dark:text-[#9BA8C7] mt-1 font-medium">
                    {subtitle}
                  </p>
                )}
              </div>
              {headerActions && (
                <div className="flex items-center gap-2 flex-wrap">
                  {headerActions}
                </div>
              )}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
