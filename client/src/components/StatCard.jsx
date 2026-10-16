import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtitle, trend }) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
      border: 'border-indigo-100 dark:border-indigo-500/20',
      glow: 'hover:shadow-indigo-500/10',
      accent: 'from-indigo-600 to-indigo-400'
    },
    teal: {
      bg: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
      border: 'border-cyan-100 dark:border-cyan-500/20',
      glow: 'hover:shadow-cyan-500/10',
      accent: 'from-cyan-600 to-teal-400'
    },
    cyan: {
      bg: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
      border: 'border-cyan-100 dark:border-cyan-500/20',
      glow: 'hover:shadow-cyan-500/10',
      accent: 'from-cyan-600 to-teal-400'
    },
    violet: {
      bg: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
      border: 'border-purple-100 dark:border-purple-500/20',
      glow: 'hover:shadow-purple-500/10',
      accent: 'from-purple-600 to-violet-400'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-500/20',
      glow: 'hover:shadow-amber-500/10',
      accent: 'from-amber-500 to-orange-400'
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
      border: 'border-rose-100 dark:border-rose-500/20',
      glow: 'hover:shadow-rose-500/10',
      accent: 'from-rose-500 to-pink-500'
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-500/20',
      glow: 'hover:shadow-emerald-500/10',
      accent: 'from-emerald-500 to-teal-400'
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-500/20',
      glow: 'hover:shadow-blue-500/10',
      accent: 'from-blue-600 to-cyan-500'
    }
  };

  const currentTheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-xl ${currentTheme.glow} transition-all duration-300 hover:-translate-y-1`}
    >
      {/* Decorative top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${currentTheme.accent} opacity-60 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm ${currentTheme.bg}`}
        >
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
          {value}
        </h3>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {trend && (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  trend.toLowerCase().includes('risk') || trend.toLowerCase().includes('fail')
                    ? 'text-rose-700 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/20'
                    : 'text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20'
                }`}
              >
                {trend}
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
