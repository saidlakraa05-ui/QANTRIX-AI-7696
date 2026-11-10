import React from 'react';

interface CantrixLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'gold' | 'neon' | 'monochrome';
}

export const CantrixLogo: React.FC<CantrixLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  variant = 'gold',
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Dynamic Cybernetic Quantum Emblem */}
      <div className={`relative ${sizeMap[size]} shrink-0 transition-transform duration-300 hover:scale-105`}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-500/30 via-cyan-500/20 to-yellow-400/30 blur-md animate-pulse" />

        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full drop-shadow-[0_4px_12px_rgba(245,158,11,0.35)]"
        >
          <defs>
            {/* Outer Armor Gradient */}
            <linearGradient id="cantrixArmorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E160A" />
              <stop offset="50%" stopColor="#2A1F0D" />
              <stop offset="100%" stopColor="#0B0904" />
            </linearGradient>

            {/* Core Gold Quantum Stream */}
            <linearGradient id="cantrixGoldCore" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE066" />
              <stop offset="35%" stopColor="#F59E0B" />
              <stop offset="70%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            {/* Neon Cyan Circuit Accent */}
            <linearGradient id="cantrixCyanAccent" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="cantrixCoreGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Shield Hexagon */}
          <path
            d="M50 4 L88 24 L88 76 L50 96 L12 76 L12 24 Z"
            fill="url(#cantrixArmorGrad)"
            stroke="url(#cantrixGoldCore)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Inner Quantum Circuit Nodes */}
          <path
            d="M50 14 L80 30 L80 70 L50 86 L20 70 L20 30 Z"
            fill="#0E0A04"
            stroke="url(#cantrixCyanAccent)"
            strokeWidth="1.2"
            strokeDasharray="4 2"
            opacity="0.8"
          />

          {/* The Stylized 'C' & Quantum Prism Core */}
          <path
            d="M66 32 C58 24, 38 24, 30 36 C22 48, 22 58, 30 68 C38 78, 58 78, 66 70 L58 62 C53 67, 43 67, 39 61 C35 55, 35 47, 39 41 C43 35, 53 35, 58 40 Z"
            fill="url(#cantrixGoldCore)"
            filter="url(#cantrixCoreGlow)"
          />

          {/* Center Energy Diamond / Singularity */}
          <polygon
            points="50,42 58,50 50,58 42,50"
            fill="url(#cantrixCyanAccent)"
            className="animate-pulse"
          />

          {/* Precision Micro Points */}
          <circle cx="50" cy="4" r="2.5" fill="#FFE066" />
          <circle cx="88" cy="24" r="2.5" fill="#F59E0B" />
          <circle cx="88" cy="76" r="2.5" fill="#06B6D4" />
          <circle cx="50" cy="96" r="2.5" fill="#FFE066" />
          <circle cx="12" cy="76" r="2.5" fill="#06B6D4" />
          <circle cx="12" cy="24" r="2.5" fill="#F59E0B" />
        </svg>
      </div>

      {/* Typography Label */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5 font-sans">
            <span className={`font-black tracking-wider ${textSizes[size]} bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent uppercase`}>
              Cantrix
            </span>
            <span className="text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 tracking-widest shadow-sm">
              AI
            </span>
          </div>
          <span className="text-[9px] text-amber-300/60 font-semibold tracking-wide hidden sm:block">
            كامتريكس إيه آي · الجيل الخارق
          </span>
        </div>
      )}
    </div>
  );
};
