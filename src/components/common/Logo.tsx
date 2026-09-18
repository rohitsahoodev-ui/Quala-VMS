import React from 'react';

interface LogoProps {
  collapsed?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ collapsed = false, className = '', size = 'md' }) => {
  const isLarge = size === 'lg';
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Stylized geometric Q with server virtualization blades */}
      <div className={`relative ${isLarge ? 'w-10 h-10' : 'w-8 h-8'} rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 p-0.5 shadow-lg shadow-purple-600/30 flex items-center justify-center shrink-0`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-white"
        >
          {/* Outer geometric Q ring */}
          <rect
            x="5"
            y="5"
            width="18"
            height="18"
            rx="4"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Virtualization layer bars */}
          <line x1="9" y1="10" x2="19" y2="10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" opacity="0.9" />
          <line x1="9" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" opacity="0.9" />
          <line x1="9" y1="18" x2="15" y2="18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" opacity="0.9" />
          {/* Hypervisor core node & tail */}
          <circle cx="21" cy="21" r="2.5" fill="#c084fc" />
          <line x1="19" y1="19" x2="26" y2="26" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {!collapsed && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg tracking-tight text-white font-sans">Quala</span>
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
              VMS
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Virtualization, Simplified.
          </span>
        </div>
      )}
    </div>
  );
};
