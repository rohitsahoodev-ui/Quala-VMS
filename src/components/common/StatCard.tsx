import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  subtext?: string;
  accentColor?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  subtext,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`glass-panel glass-panel-hover rounded-xl p-5 relative overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">
              {value}
            </span>
            {change && (
              <span
                className={`text-xs font-medium font-mono ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {change}
              </span>
            )}
          </div>
          {subtext && <p className="mt-1 text-xs text-slate-400">{subtext}</p>}
        </div>

        <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Decorative subtle ambient corner glow */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
    </div>
  );
};
