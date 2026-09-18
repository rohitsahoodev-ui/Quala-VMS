import React, { useState, useEffect } from 'react';
import {
  Server,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Play,
  RotateCw,
  Square,
  Terminal,
  MoreVertical,
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

interface MyServersProps {
  onNavigate: (route: string) => void;
  onOpenDeploy: () => void;
}

export const MyServers: React.FC<MyServersProps> = ({ onNavigate, onOpenDeploy }) => {
  const { addToast } = useToast();
  const [vms, setVms] = useState<VM[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'stopped'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [targetDeleteVM, setTargetDeleteVM] = useState<VM | null>(null);

  const fetchVMs = async () => {
    try {
      const data = await ApiService.getVMs();
      setVms(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVMs();
  }, []);

  const handleAction = async (vmId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      await ApiService.executeVMAction(vmId, action);
      addToast('success', `Action: ${action}`, 'Signal sent to VM');
      fetchVMs();
    } catch (err: any) {
      addToast('error', 'Action failed', err.message);
    }
  };

  const handleDelete = async () => {
    if (!targetDeleteVM) return;
    try {
      await ApiService.deleteVM(targetDeleteVM._id);
      addToast('success', 'Server Terminated', `${targetDeleteVM.name} has been removed.`);
      setTargetDeleteVM(null);
      fetchVMs();
    } catch (err: any) {
      addToast('error', 'Delete failed', err.message);
    }
  };

  const filteredVMs = vms.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.ipv4.includes(search) ||
      (v.os || v.image || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ? true : v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-sans">My Virtual Servers</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your deployed instances, allocate resources, and access cloud terminals.
          </p>
        </div>

        <button
          onClick={onOpenDeploy}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Server</span>
        </button>
      </div>

      {/* Filter & View Bar */}
      <div className="glass-panel rounded-2xl border border-purple-500/20 p-4 bg-[#0a0a16] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name, IP, or OS..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-purple-500/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-purple-500/20 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                statusFilter === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('running')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                statusFilter === 'running'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Running
            </button>
            <button
              onClick={() => setStatusFilter('stopped')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                statusFilter === 'stopped'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Stopped
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-purple-500/20 text-slate-400">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-purple-600 text-white' : 'hover:text-white'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'table' ? 'bg-purple-600 text-white' : 'hover:text-white'
            }`}
            title="Table view"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Render View: Grid vs Table */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVMs.map((vm) => (
            <div
              key={vm._id}
              onClick={() => onNavigate(`/server/${vm._id}`)}
              className="glass-panel glass-panel-hover rounded-2xl border border-purple-500/15 p-5 bg-[#0d0d20] cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      {vm.name}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                      {vm.ipv4}
                    </span>
                  </div>
                  <StatusBadge status={vm.status} />
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="p-2 rounded-xl bg-black/40">
                    <span className="text-slate-400 text-[10px] block">vCPU</span>
                    <span className="text-white font-bold">{vm.cpu}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40">
                    <span className="text-slate-400 text-[10px] block">RAM</span>
                    <span className="text-white font-bold">{vm.ram / 1024} GB</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40">
                    <span className="text-slate-400 text-[10px] block">Disk</span>
                    <span className="text-white font-bold">{vm.disk} GB</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 truncate max-w-[140px]">{vm.os}</span>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
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
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-purple-500/20 p-4 bg-[#0a0a16] overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-purple-500/15 text-slate-400 font-mono">
                <th className="pb-3 pl-2">Name</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">IPv4</th>
                <th className="pb-3">OS</th>
                <th className="pb-3">vCPU / RAM</th>
                <th className="pb-3">Disk</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredVMs.map((vm) => (
                <tr
                  key={vm._id}
                  onClick={() => onNavigate(`/server/${vm._id}`)}
                  className="hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <td className="py-3 pl-2 font-semibold text-white group-hover:text-purple-300">
                    {vm.name}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={vm.status} />
                  </td>
                  <td className="py-3 font-mono text-purple-300">{vm.ipv4}</td>
                  <td className="py-3 text-slate-400">{vm.os}</td>
                  <td className="py-3 font-mono text-slate-300">
                    {vm.cpu} Cores / {vm.ram / 1024} GB
                  </td>
                  <td className="py-3 font-mono text-slate-300">{vm.disk} GB</td>
                  <td className="py-3 text-right pr-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onNavigate(`/server/${vm._id}/console`)}
                        className="p-1.5 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white"
                        title="Console"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setTargetDeleteVM(vm)}
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
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(targetDeleteVM)}
        title={`Delete ${targetDeleteVM?.name}?`}
        message={`Are you sure you want to terminate ${targetDeleteVM?.name}? All associated virtual disks and data will be destroyed.`}
        confirmLabel="Destroy VM"
        requireTypedConfirmation={targetDeleteVM?.name}
        onConfirm={handleDelete}
        onCancel={() => setTargetDeleteVM(null)}
      />
    </div>
  );
};
