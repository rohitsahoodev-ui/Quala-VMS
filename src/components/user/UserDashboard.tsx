import React, { useState, useEffect } from 'react';
import {
  Server,
  Cpu,
  Layers,
  HardDrive,
  Plus,
  Terminal,
  Activity,
  ArrowUpRight,
  Play,
  RotateCw,
  Square,
  Shield,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { VM } from '../../types';
import { ApiService } from '../../services/api';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { useToast } from '../common/Toast';

interface UserDashboardProps {
  onNavigate: (route: string) => void;
  onOpenDeploy: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigate, onOpenDeploy }) => {
  const { addToast } = useToast();
  const [vms, setVms] = useState<VM[]>([]);
  const [loading, setLoading] = useState(true);

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
    const interval = setInterval(fetchVMs, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickAction = async (e: React.MouseEvent, vmId: string, action: 'start' | 'stop' | 'restart') => {
    e.stopPropagation();
    try {
      await ApiService.executeVMAction(vmId, action);
      addToast('success', `Action: ${action}`, `Signal sent to VM`);
      fetchVMs();
    } catch (err: any) {
      addToast('error', 'Failed', err.message);
    }
  };

  const runningCount = vms.filter((v) => v.status === 'running').length;
  const totalCpus = vms.reduce((acc, v) => acc + v.cpu, 0);
  const totalRamGb = (vms.reduce((acc, v) => acc + v.ram, 0) / 1024).toFixed(0);

  const graphData = [
    { time: '10:00', traffic: 35, cpu: 18 },
    { time: '11:00', traffic: 42, cpu: 24 },
    { time: '12:00', traffic: 68, cpu: 32 },
    { time: '13:00', traffic: 55, cpu: 28 },
    { time: '14:00', traffic: 72, cpu: 36 },
    { time: '15:00', traffic: 61, cpu: 29 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden glass-panel rounded-2xl border border-purple-500/20 p-6 sm:p-8 bg-gradient-to-r from-purple-950/40 via-[#0a0a16] to-[#0a0a16]">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-mono font-semibold">
                QUALA CLOUD INFRASTRUCTURE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-2 font-sans">
              Customer VPS Control Panel
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
              Manage your high-performance KVM virtual machines, interactive SSH shells, automated backups, and software-defined networking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDeploy}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 transition-all font-sans"
            >
              <Plus className="w-4 h-4" />
              <span>Deploy Server</span>
            </button>
          </div>
        </div>

        {/* Ambient glow accent */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active VPS Instances"
          value={`${runningCount} / ${vms.length}`}
          change="+1 this month"
          isPositive={true}
          icon={Server}
          subtext="Hypervisor KVM Nodes Online"
        />
        <StatCard
          title="Allocated Compute"
          value={`${totalCpus} vCPUs`}
          icon={Cpu}
          subtext="VirtIO Host-Passthrough"
        />
        <StatCard
          title="Allocated Memory"
          value={`${totalRamGb} GB`}
          icon={Layers}
          subtext="DDR5 ECC Hypervisor Pool"
        />
        <StatCard
          title="Network Ingress"
          value="48.2 MB/s"
          change="Optimal"
          isPositive={true}
          icon={Activity}
          subtext="VirtIO-Net Interface"
        />
      </div>

      {/* My Virtual Machines Grid */}
      <div className="glass-panel rounded-2xl border border-purple-500/20 p-6 bg-[#0a0a16] shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-purple-500/15">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="text-base font-bold text-white font-sans">My Virtual Machines</h2>
              <p className="text-xs text-slate-400">Click any server to launch details and console</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/servers')}
            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {vms.map((vm) => (
            <div
              key={vm._id}
              onClick={() => onNavigate(`/server/${vm._id}`)}
              className="glass-panel glass-panel-hover rounded-2xl border border-purple-500/15 p-5 bg-[#0d0d20] cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white font-sans group-hover:text-purple-300 transition-colors">
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
                    <span className="text-white font-bold">{vm.cpu} Cores</span>
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

              {/* Card Footer Quick Actions */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                  {vm.os}
                </span>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {vm.status === 'stopped' ? (
                    <button
                      onClick={(e) => handleQuickAction(e, vm._id, 'start')}
                      className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                      title="Start Server"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={(e) => handleQuickAction(e, vm._id, 'restart')}
                        className="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-white hover:bg-purple-600/30 transition-colors"
                        title="Restart"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleQuickAction(e, vm._id, 'stop')}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                        title="Stop"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => onNavigate(`/server/${vm._id}/console`)}
                    className="p-1.5 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white transition-colors"
                    title="Launch Terminal"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aggregate Bandwidth Graph */}
      <div className="glass-panel rounded-2xl border border-purple-500/20 p-6 bg-[#0a0a16] shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/15">
          <div>
            <h3 className="text-sm font-semibold text-white">Cluster Network Bandwidth</h3>
            <p className="text-xs text-slate-400">Total ingress & egress throughput across nodes</p>
          </div>
          <span className="text-xs font-mono text-purple-400">1 Gbps Uplink Active</span>
        </div>

        <div className="h-56 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={graphData}>
              <defs>
                <linearGradient id="userTrafficGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c0c1c',
                  borderColor: '#a855f7',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="traffic"
                stroke="#a855f7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#userTrafficGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
