import React from 'react';

/**
 * Official SmartCampus AI University Crest & Brand Logo Component
 * 
 * Supports three variants:
 * - 'full': The complete heraldic university crest with motto & banner (hero/login/registration)
 * - 'compact': Crest emblem paired with institutional typography and gold badge (sidebar/navbars)
 * - 'crest': Pure crest mark for compact iconography and mobile headers
 */
const SmartCampusLogo = ({
  variant = 'compact',
  className = '',
  size = 'md',
  showTagline = true,
  onClick
}) => {
  // Dimension tokens
  const sizeMap = {
    xs: { img: 'w-6 h-6', text: 'text-sm', badge: 'text-[9px]' },
    sm: { img: 'w-8 h-8', text: 'text-base', badge: 'text-[10px]' },
    md: { img: 'w-10 h-10', text: 'text-lg', badge: 'text-[11px]' },
    lg: { img: 'w-16 h-16', text: 'text-2xl', badge: 'text-xs' },
    xl: { img: 'w-24 h-24 sm:w-28 sm:h-28', text: 'text-3xl', badge: 'text-xs' },
    hero: { img: 'w-32 h-32 sm:w-40 sm:h-40', text: 'text-4xl', badge: 'text-sm' }
  };

  const selectedSize = sizeMap[size] || sizeMap.md;

  if (variant === 'crest') {
    return (
      <div 
        className={`inline-flex items-center justify-center flex-shrink-0 transition-transform duration-200 hover:scale-[1.02] ${className}`}
        onClick={onClick}
      >
        <img
          src="/assets/smartcampus-ai-logo.svg"
          alt="SmartCampus AI university crest"
          className={`${selectedSize.img} object-contain select-none drop-shadow-sm`}
          loading="eager"
        />
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div 
        className={`flex flex-col items-center text-center transition-all duration-200 ${className}`}
        onClick={onClick}
      >
        <div className="relative group">
          <img
            src="/assets/smartcampus-ai-logo.svg"
            alt="SmartCampus AI university logo"
            className={`${selectedSize.img} object-contain select-none transition-transform duration-300 group-hover:scale-105 drop-shadow-md`}
            loading="eager"
          />
        </div>
        {showTagline && (
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="h-[1px] w-6 bg-gradient-to-r from-transparent to-[#D9AE4B]" />
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#D9AE4B] dark:text-[#F2D78A]">
              Learn • Connect • Innovate
            </p>
            <span className="h-[1px] w-6 bg-gradient-to-l from-transparent to-[#D9AE4B]" />
          </div>
        )}
      </div>
    );
  }

  // Default: 'compact' variant for Sidebar, Navbar, and headers
  return (
    <div 
      className={`inline-flex items-center gap-3 transition-opacity duration-200 hover:opacity-95 ${className}`}
      onClick={onClick}
    >
      <div className="flex-shrink-0 relative">
        <img
          src="/assets/smartcampus-ai-logo.svg"
          alt="SmartCampus AI university logo"
          className={`${selectedSize.img} object-contain select-none drop-shadow-sm`}
          loading="eager"
        />
      </div>
      <div className="flex flex-col leading-tight min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`font-extrabold tracking-tight text-slate-900 dark:text-white ${selectedSize.text}`}>
            SmartCampus
          </span>
          <span className={`font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#D9AE4B]/15 text-[#B8860B] dark:text-[#F2D78A] border border-[#D9AE4B]/30 ${selectedSize.badge}`}>
            AI
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#748197] dark:text-[#9BA8C7] truncate">
            University Portal
          </span>
        )}
      </div>
    </div>
  );
};

export default SmartCampusLogo;
