import React, { useState, useEffect } from 'react';
import {
  Users,
  Server,
  Cpu,
  HardDrive,
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  Shield,
  Radio
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { ResourceMeter } from '../common/ResourceMeter';
import { ApiService } from '../../services/api';
import { VM, Node, User, StoragePool, AuditLog } from '../../types';

interface AdminOverviewProps {
  onNavigate: (route: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [vms, setVms] = useState<VM[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [storage, setStorage] = useState<StoragePool[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    Promise.all([
      ApiService.getAdminUsers(),
      ApiService.getVMs(),
      ApiService.getAdminNodes(),
      ApiService.getAdminStorage(),
      ApiService.getAuditLogs(),
    ]).then(([u, v, n, s, a]) => {
      setUsers(u);
      setVms(v);
      setNodes(n);
      setStorage(s);
      setAuditLogs(a);
    }).catch(console.error);
  }, []);

  const runningVMs = vms.filter((v) => v.status === 'running').length;
  const stoppedVMs = vms.filter((v) => v.status === 'stopped').length;
  const totalVCPUs = vms.reduce((acc, v) => acc + v.cpu, 0);
  const totalRAMGb = (vms.reduce((acc, v) => acc + v.ram, 0) / 1024).toFixed(0);
  const totalDiskGb = vms.reduce((acc, v) => acc + v.disk, 0);

  const clusterMetrics = [
    { time: '10:00', cpu: 28, memory: 42, io: 15 },
    { time: '11:00', cpu: 34, memory: 45, io: 22 },
    { time: '12:00', cpu: 52, memory: 58, io: 40 },
    { time: '13:00', cpu: 46, memory: 54, io: 30 },
    { time: '14:00', cpu: 62, memory: 61, io: 48 },
    { time: '15:00', cpu: 44, memory: 53, io: 25 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl border border-purple-500/20 p-6 sm:p-8 bg-gradient-to-r from-[#0f0c24] via-[#080812] to-[#080812] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-purple-400 font-semibold">
              SUPERADMIN INFRASTRUCTURE DASHBOARD
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1 font-sans">
              Cluster Hypervisors & QEMU Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Real-time monitoring across 3 enterprise virtualization nodes, virtio-scsi storage pools, and public network bridges.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              All 3 Nodes Healthy
            </span>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid (Rule 7 requirement: Total Users, Active Users, Total VMs, Running VMs, Stopped VMs, Total vCPU, Total RAM, Total Disk) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="glass-panel rounded-xl p-3 border border-purple-500/15 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Users</span>
          <span className="text-lg font-bold text-white font-mono mt-1 block">{users.length}</span>
        </div>
        <div className="glass-panel rounded-xl p-3 border border-purple-500/15 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Active Users</span>
          <span className="text-lg font-bold text-emerald-400 font-mono mt-1 block">
            {users.filter((u) => u.status === 'active').length}
          </span>
        </div>
        <div className="glass-panel rounded-xl p-3 border border-purple-500/15 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Total VMs</span>
          <span className="text-lg font-bold text-white font-mono mt-1 block">{vms.length}</span>
        </div>
        <div className="glass-panel rounded-xl p-3 border border-purple-500/15 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Running VMs</span>
          <span className="text-lg font-bold text-purple-400 font-mono mt-1 block">{runningVMs}</span>
        </div>
        <div className="glass-panel rounded-xl p-3 border border-purple-500/15 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Stopped VMs</span>
          <span className="text-lg font-bold text-slate-400 font-mono mt-1 block">{stoppedVMs}</span>
        </div>
        <div className="glass-panel rounded-xl p-3 border border-purple-500/15 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">vCPUs Active</span>
          <span className="text-lg font-bold text-purple-300 font-mono mt-1 block">{totalVCPUs}</span>
        </div>
        <div className="glass-panel rounded-xl p-3 border border-purple-500/15 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Allocated RAM</span>
          <span className="text-lg font-bold text-emerald-300 font-mono mt-1 block">{totalRAMGb} GB</span>
        </div>
        <div className="glass-panel rounded-xl p-3 border border-purple-500/15 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Storage</span>
          <span className="text-lg font-bold text-cyan-300 font-mono mt-1 block">{totalDiskGb} GB</span>
        </div>
      </div>

      {/* Cluster Resource Graph */}
      <div className="glass-panel rounded-2xl border border-purple-500/20 p-6 bg-[#0a0a16] shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-purple-500/15">
          <div>
            <h2 className="text-sm font-bold text-white font-sans">
              Cluster-Wide Hypervisor Telemetry
            </h2>
            <p className="text-xs text-slate-400">Aggregate CPU, Memory, and Disk IOPS load</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-purple-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" /> CPU Load
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Memory Load
            </span>
          </div>
        </div>

        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={clusterMetrics}>
              <defs>
                <linearGradient id="adminCpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="adminMemGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
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
                dataKey="cpu"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#adminCpuGrad)"
              />
              <Area
                type="monotone"
                dataKey="memory"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#adminMemGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Nodes & Storage Health Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compute Nodes */}
        <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16] shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/15">
            <h3 className="text-sm font-semibold text-white font-sans flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" /> Compute Nodes
            </h3>
            <button
              onClick={() => onNavigate('/admin/nodes')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium"
            >
              Manage Nodes →
            </button>
          </div>

          <div className="space-y-3 mt-4">
            {nodes.map((node) => (
              <div
                key={node._id}
                className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white font-mono">{node.name}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {node.ip} • {node.location} • QEMU {node.qemuVersion}
                    </span>
                  </div>
                  <StatusBadge status={node.status} />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <ResourceMeter label="CPU Load" value={node.cpuUsage ?? node.cpu?.usagePercent ?? 0} />
                  <ResourceMeter label="RAM Load" value={node.ramUsage ?? Math.round(((node.ram?.usedGB ?? 0) / (node.ram?.totalGB || 1)) * 100)} color="emerald" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Storage Pools */}
        <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16] shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/15">
            <h3 className="text-sm font-semibold text-white font-sans flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-purple-400" /> Storage Pools
            </h3>
            <button
              onClick={() => onNavigate('/admin/storage')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium"
            >
              Manage Storage →
            </button>
          </div>

          <div className="space-y-3 mt-4">
            {storage.map((pool) => {
              const used = pool.usedGB ?? pool.used ?? 0;
              const total = pool.totalGB ?? pool.total ?? 1;
              return (
                <div
                  key={pool._id}
                  className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white font-mono">{pool.name}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Type: {String(pool.type).toUpperCase()} • Path: {pool.path}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-purple-300">
                      {used} GB / {total} GB
                    </span>
                  </div>
                  <ResourceMeter
                    label="Used Capacity"
                    value={Math.round((used / total) * 100)}
                    color="cyan"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
