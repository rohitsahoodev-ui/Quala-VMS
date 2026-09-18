import React, { useState, useEffect } from 'react';
import {
  Server,
  Plus,
  Search,
  Play,
  RotateCw,
  Square,
  Terminal,
  Trash2,
  ExternalLink,
  Cpu,
  Layers,
  HardDrive
} from 'lucide-react';
import { VM } from '../../types';
import { ApiService } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { useToast } from '../common/Toast';

interface VMManagementProps {
  onNavigate: (route: string) => void;
  onOpenDeploy: () => void;
}

export const VMManagement: React.FC<VMManagementProps> = ({ onNavigate, onOpenDeploy }) => {
  const { addToast } = useToast();
  const [vms, setVms] = useState<VM[]>([]);
  const [search, setSearch] = useState('');
  const [targetDelete, setTargetDelete] = useState<VM | null>(null);

  const fetchVMs = async () => {
    try {
      const data = await ApiService.getVMs();
      setVms(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVMs();
  }, []);

  const handleAction = async (vmId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      await ApiService.executeVMAction(vmId, action);
      addToast('success', `Action: ${action}`, 'QEMU signal executed.');
      fetchVMs();
    } catch (err: any) {
      addToast('error', 'Action failed', err.message);
    }
  };

  const handleDeleteVM = async () => {
    if (!targetDelete) return;
    try {
      await ApiService.deleteVM(targetDelete._id);
      addToast('success', 'VM Deleted', targetDelete.name);
      setTargetDelete(null);
      fetchVMs();
    } catch (err: any) {
      addToast('error', 'Deletion failed', err.message);
    }
  };

  const filtered = vms.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.ipv4.includes(search) ||
      (v.nodeId || v.node || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-sans">Virtual Machines Directory</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full inventory of tenant virtual machines across all hypervisor compute nodes.
          </p>
        </div>

        <button
          onClick={onOpenDeploy}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Deploy Virtual Machine</span>
        </button>
      </div>

      <div className="glass-panel rounded-2xl border border-purple-500/20 p-4 bg-[#0a0a16] flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by VM name, IP, or node..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-purple-500/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Showing {filtered.length} of {vms.length} instances
        </span>
      </div>

      <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16] shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-purple-500/15 text-slate-400 font-mono">
              <th className="pb-3 pl-2">Virtual Machine</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Compute Node</th>
              <th className="pb-3">IPv4 Address</th>
              <th className="pb-3">Hardware Specs</th>
              <th className="pb-3">Operating System</th>
              <th className="pb-3 text-right pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((vm) => (
              <tr
                key={vm._id}
                onClick={() => onNavigate(`/server/${vm._id}`)}
                className="hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <td className="py-3 pl-2">
                  <div className="flex items-center gap-3">
                    <Server className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-white block group-hover:text-purple-300">
                        {vm.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{vm._id}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <StatusBadge status={vm.status} />
                </td>
                <td className="py-3 font-mono text-slate-300">{vm.nodeId}</td>
                <td className="py-3 font-mono text-purple-300">{vm.ipv4}</td>
                <td className="py-3 font-mono text-slate-300">
                  {vm.cpu} vCPUs • {vm.ram / 1024} GB RAM • {vm.disk} GB
                </td>
                <td className="py-3 text-slate-400 truncate max-w-[120px]">{vm.os}</td>
                <td className="py-3 text-right pr-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    {vm.status === 'stopped' ? (
                      <button
                        onClick={() => handleAction(vm._id, 'start')}
                        className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white"
                        title="Start"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAction(vm._id, 'restart')}
                          className="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-white hover:bg-purple-600/30"
                          title="Restart"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleAction(vm._id, 'stop')}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white"
                          title="Stop"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onNavigate(`/server/${vm._id}/console`)}
                      className="p-1.5 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white"
                      title="Console"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setTargetDelete(vm)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={Boolean(targetDelete)}
        title={`Delete VM "${targetDelete?.name}"?`}
        message="This action will terminate the QEMU instance and wipe the virtual disk."
        confirmLabel="Destroy VM"
        requireTypedConfirmation={targetDelete?.name}
        onConfirm={handleDeleteVM}
        onCancel={() => setTargetDelete(null)}
      />
    </div>
  );
};
