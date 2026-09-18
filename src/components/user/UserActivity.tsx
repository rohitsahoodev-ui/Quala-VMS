import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Terminal, Server, Clock } from 'lucide-react';
import { AuditLog } from '../../types';
import { ApiService } from '../../services/api';

export const UserActivity: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    ApiService.getAuditLogs().then(setLogs).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white font-sans">Account & Server Activity</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time chronological timeline of VM lifecycle events and API calls.
        </p>
      </div>

      <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16] shadow-xl">
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log._id}
              className="flex items-start gap-4 p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs font-mono"
            >
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0 mt-0.5">
                <Activity className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white uppercase text-[11px] tracking-wider text-purple-300">
                    {log.action}
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    {new Date(log.timestamp || log.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-300 mt-1">{log.details || (log.metadata ? JSON.stringify(log.metadata) : log.target)}</p>
                <div className="mt-1 text-[10px] text-slate-500 flex items-center gap-3">
                  <span>Target: {log.target}</span>
                  <span>•</span>
                  <span>IP: {log.ip}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
