import React from 'react';

const LoadingSkeleton = ({ count = 3, type = 'card' }) => {
  if (type === 'stat') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 relative overflow-hidden shimmer-effect border border-slate-200/50 dark:border-slate-800/50"
          >
            <div className="p-5 flex flex-col justify-between h-full">
              <div className="flex justify-between items-center">
                <div className="w-24 h-4 bg-slate-300 dark:bg-slate-700 rounded-md"></div>
                <div className="w-10 h-10 bg-slate-300 dark:bg-slate-700 rounded-xl"></div>
              </div>
              <div className="w-16 h-7 bg-slate-300 dark:bg-slate-700 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="h-12 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center gap-4">
          <div className="w-1/4 h-4 bg-slate-300 dark:bg-slate-700 rounded"></div>
          <div className="w-1/4 h-4 bg-slate-300 dark:bg-slate-700 rounded"></div>
          <div className="w-1/4 h-4 bg-slate-300 dark:bg-slate-700 rounded"></div>
          <div className="w-1/4 h-4 bg-slate-300 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="h-16 px-6 flex items-center gap-4 relative overflow-hidden shimmer-effect">
              <div className="w-1/4 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="w-1/4 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="w-1/4 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="w-1/4 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-24 bg-slate-200/70 dark:bg-slate-800/70 rounded-2xl w-full relative overflow-hidden shimmer-effect border border-slate-200/50 dark:border-slate-800/50"
        >
          <div className="p-4 space-y-2.5">
            <div className="w-1/3 h-4 bg-slate-300 dark:bg-slate-700 rounded"></div>
            <div className="w-2/3 h-3.5 bg-slate-300/80 dark:bg-slate-700/80 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
