import React from 'react';

interface ResourceMeterProps {
  label: string;
  value: number; // 0 to 100
  detail?: string;
  color?: 'purple' | 'emerald' | 'amber' | 'cyan';
}

export const ResourceMeter: React.FC<ResourceMeterProps> = ({
  label,
  value,
  detail,
  color = 'purple',
}) => {
  const clampedValue = Math.min(100, Math.max(0, Math.round(value)));

  let barGradient = 'bg-gradient-to-r from-purple-600 to-indigo-500';
  let textColor = 'text-purple-400';

  if (clampedValue > 85) {
    barGradient = 'bg-gradient-to-r from-rose-600 to-amber-500';
    textColor = 'text-rose-400';
  } else if (clampedValue > 70) {
    barGradient = 'bg-gradient-to-r from-amber-600 to-amber-400';
    textColor = 'text-amber-400';
  } else if (color === 'cyan') {
    barGradient = 'bg-gradient-to-r from-cyan-600 to-sky-400';
    textColor = 'text-cyan-400';
  } else if (color === 'emerald') {
    barGradient = 'bg-gradient-to-r from-emerald-600 to-teal-400';
    textColor = 'text-emerald-400';
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-slate-300 font-medium">{label}</span>
        <div className="flex items-center gap-2">
          {detail && <span className="text-slate-400 font-mono text-[11px]">{detail}</span>}
          <span className={`font-mono font-semibold ${textColor}`}>{clampedValue}%</span>
        </div>
      </div>
      <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-purple-500/10">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barGradient}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
