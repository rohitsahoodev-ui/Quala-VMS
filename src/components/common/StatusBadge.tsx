import React from 'react';
import { VMStatus } from '../../types';

interface StatusBadgeProps {
  status: VMStatus | 'online' | 'warning' | 'offline' | 'active' | 'suspended' | 'pending' | 'completed' | 'failed' | 'in_progress' | 'paid' | 'unpaid' | 'overdue';
  showPulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showPulse = true }) => {
  const normalized = status.toLowerCase();

  let bgClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let dotClass = 'bg-emerald-400';
  let pulse = showPulse;
  let label = status.charAt(0).toUpperCase() + status.slice(1);

  switch (normalized) {
    case 'running':
    case 'online':
    case 'active':
    case 'completed':
    case 'paid':
      bgClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      dotClass = 'bg-emerald-400';
      break;

    case 'stopped':
    case 'offline':
    case 'suspended':
    case 'unpaid':
      bgClass = 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      dotClass = 'bg-slate-400';
      pulse = false;
      break;

    case 'restarting':
    case 'creating':
    case 'in_progress':
    case 'pending':
      bgClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      dotClass = 'bg-amber-400';
      break;

    case 'error':
    case 'failed':
    case 'overdue':
      bgClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      dotClass = 'bg-rose-400';
      break;

    case 'warning':
      bgClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      dotClass = 'bg-amber-400';
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${bgClass} whitespace-nowrap`}>
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotClass} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotClass}`} />
      </span>
      <span>{label}</span>
    </span>
  );
};
