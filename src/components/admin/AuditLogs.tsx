import React, { useState, useEffect } from 'react';
import { Activity, Download, Search, Shield, Filter } from 'lucide-react';
import { AuditLog } from '../../types';
import { ApiService } from '../../services/api';
import { useToast } from '../common/Toast';

export const AuditLogs: React.FC = () => {
  const { addToast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    ApiService.getAuditLogs().then(setLogs).catch(console.error);
  }, []);

  const handleExport = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quala-audit-logs-${Date.now()}.json`;
    a.click();
    addToast('success', 'Export Complete', 'Downloaded audit logs in JSON format.');
  };

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.details || l.target || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.ip && l.ip.includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-sans">Cluster Audit & Security Trail</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log of all administrator actions, API authentication events, and hypervisor state changes.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600 hover:text-white text-xs font-semibold transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export JSON Audit Trail</span>
        </button>
      </div>

      <div className="glass-panel rounded-2xl border border-purple-500/20 p-4 bg-[#0a0a16]">
        <div className="relative max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, target, or IP address..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-purple-500/20 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16] shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-purple-500/15 text-slate-400 font-mono">
              <th className="pb-3 pl-2">Timestamp</th>
              <th className="pb-3">Action</th>
              <th className="pb-3">Target</th>
              <th className="pb-3">Details</th>
              <th className="pb-3">Origin IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {filtered.map((log) => (
              <tr key={log._id} className="hover:bg-white/5 transition-colors">
                <td className="py-3 pl-2 text-slate-400 text-[11px]">
                  {new Date(log.timestamp || log.createdAt).toLocaleString()}
                </td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold text-[10px]">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 text-white font-bold">{log.target}</td>
                <td className="py-3 text-slate-300">{log.details || (log.metadata ? JSON.stringify(log.metadata) : '-')}</td>
                <td className="py-3 text-slate-400">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
