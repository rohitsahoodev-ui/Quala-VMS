import React, { useState, useEffect } from 'react';
import { Archive, Plus, Trash2, Calendar, HardDrive, ShieldCheck } from 'lucide-react';
import { VM, VMBackup } from '../../types';
import { ApiService } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { useToast } from '../common/Toast';

export const UserBackups: React.FC = () => {
  const { addToast } = useToast();
  const [vms, setVms] = useState<VM[]>([]);
  const [selectedVmId, setSelectedVmId] = useState('vm-1042');
  const [backups, setBackups] = useState<VMBackup[]>([]);

  const fetchBackups = async () => {
    try {
      const [vmList, bList] = await Promise.all([
        ApiService.getVMs(),
        ApiService.getBackups(selectedVmId),
      ]);
      setVms(vmList);
      setBackups(bList);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, [selectedVmId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-sans">Automated Backups</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full virtual machine images stored in independent NFS and Ceph object clusters.
          </p>
        </div>

        <button
          onClick={() => {
            ApiService.createBackup(selectedVmId, `manual-${Date.now()}`);
            addToast('success', 'Backup Queued', 'Full disk image export started.');
            setTimeout(fetchBackups, 1000);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Manual Backup</span>
        </button>
      </div>

      <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16] shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-purple-500/15 mb-4">
          <span className="text-xs font-medium text-slate-300">Target Server:</span>
          <select
            value={selectedVmId}
            onChange={(e) => setSelectedVmId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-black/50 border border-purple-500/30 text-white text-xs font-mono focus:outline-none"
          >
            {vms.map((v) => (
              <option key={v._id} value={v._id}>
                {v.name} ({v.ipv4})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {backups.map((b) => (
            <div
              key={b._id}
              className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5 text-xs font-mono"
            >
              <div className="flex items-center gap-3">
                <Archive className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <span className="font-semibold text-white block text-sm">{b.name}</span>
                  <span className="text-[11px] text-slate-400">
                    Created {new Date(b.createdAt).toLocaleString()} • Retention: {b.retentionDays || 30} days
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-purple-300 font-bold">{b.size} GB</span>
                <StatusBadge status={b.status} />
                <button
                  onClick={() => addToast('info', 'Restore', 'Restoring virtual machine...')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300 transition-colors"
                >
                  Restore to VM
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
