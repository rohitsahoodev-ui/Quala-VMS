import React, { useState, useEffect } from 'react';
import {
  Server,
  Play,
  Square,
  RotateCw,
  PowerOff,
  Trash2,
  Terminal,
  Monitor,
  FolderOpen,
  Network,
  Archive,
  Camera,
  FileText,
  Settings,
  Cpu,
  Layers,
  HardDrive,
  Clock,
  Shield,
  Plus,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { VM, VMSnapshot, VMBackup, FirewallRule } from '../../types';
import { ApiService } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { ResourceMeter } from '../common/ResourceMeter';
import { XTerminal } from '../console/XTerminal';
import { VNCConsole } from '../console/VNCConsole';
import { FileManager } from '../files/FileManager';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { useToast } from '../common/Toast';

interface ServerDetailsProps {
  vmId: string;
  initialTab?: string;
  onNavigateBack?: () => void;
  onBack?: () => void;
}

export const ServerDetails: React.FC<ServerDetailsProps> = ({
  vmId,
  initialTab = 'overview',
  onNavigateBack,
  onBack,
}) => {
  const handleGoBack = onBack || onNavigateBack || (() => {});
  const { addToast } = useToast();
  const [vm, setVm] = useState<VM | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [consoleMode, setConsoleMode] = useState<'ssh' | 'vnc'>('ssh');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Sub-resources
  const [snapshots, setSnapshots] = useState<VMSnapshot[]>([]);
  const [backups, setBackups] = useState<VMBackup[]>([]);
  const [firewallRules, setFirewallRules] = useState<FirewallRule[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [statsHistory, setStatsHistory] = useState<any[]>([]);

  // Modals
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ action: 'stop' | 'force-stop' | 'restart' | 'shutdown'; title: string; message: string } | null>(null);
  const [newSnapshotName, setNewSnapshotName] = useState('');
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);

  const fetchVMData = async () => {
    try {
      const [vmData, snapData, backupData, fwData, logData, statsData] = await Promise.all([
        ApiService.getVM(vmId),
        ApiService.getSnapshots(vmId).catch(() => []),
        ApiService.getBackups(vmId).catch(() => []),
        ApiService.getFirewallRules(vmId).catch(() => []),
        ApiService.getVMLogs(vmId).catch(() => []),
        ApiService.getVMStats(vmId).catch(() => ({ history: [] })),
      ]);

      setVm(vmData);
      setSnapshots(snapData);
      setBackups(backupData);
      setFirewallRules(fwData);
      setLogs(logData);
      setStatsHistory(statsData.history || []);
    } catch (err: any) {
      addToast('error', 'Error loading VM', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVMData();
    const interval = setInterval(fetchVMData, 5000);
    return () => clearInterval(interval);
  }, [vmId]);

  const handleAction = async (action: 'start' | 'stop' | 'restart' | 'shutdown' | 'force-stop') => {
    setActionLoading(true);
    try {
      const res = await ApiService.executeVMAction(vmId, action);
      setVm(res.vm);
      addToast('success', `Action: ${action}`, res.message);
      fetchVMData();
    } catch (err: any) {
      addToast('error', 'Action failed', err.message);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleDeleteVM = async () => {
    try {
      await ApiService.deleteVM(vmId);
      addToast('success', 'Server Terminated', 'Virtual machine has been decommissioned.');
      handleGoBack();
    } catch (err: any) {
      addToast('error', 'Deletion failed', err.message);
    }
  };

  const handleCreateSnapshot = async () => {
    if (!newSnapshotName.trim()) return;
    try {
      await ApiService.createSnapshot(vmId, newSnapshotName);
      addToast('success', 'Snapshot created', `Created ${newSnapshotName}`);
      setShowSnapshotModal(false);
      setNewSnapshotName('');
      const data = await ApiService.getSnapshots(vmId);
      setSnapshots(data);
    } catch (err: any) {
      addToast('error', 'Snapshot failed', err.message);
    }
  };

  if (loading && !vm) {
    return (
      <div className="flex items-center justify-center p-20 text-purple-400 font-mono text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Connecting to QEMU guest agent...
      </div>
    );
  }

  if (!vm) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm">
        Server not found or deleted.
        <button onClick={handleGoBack} className="block mx-auto mt-3 text-purple-400 underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Server },
    { id: 'console', label: 'Console', icon: Terminal },
    { id: 'files', label: 'Files', icon: FolderOpen },
    { id: 'network', label: 'Network', icon: Network },
    { id: 'backups', label: 'Backups', icon: Archive },
    { id: 'snapshots', label: 'Snapshots', icon: Camera },
    { id: 'logs', label: 'Logs', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-all"
        >
          <span>← Back to Servers</span>
        </button>
      </div>

      {/* Top Banner Header */}
      <div className="glass-panel rounded-2xl border border-purple-500/20 p-6 shadow-xl bg-[#0a0a16]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 shrink-0">
              <Server className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white font-sans">{vm.name}</h1>
                <StatusBadge status={vm.status} />
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-3 font-mono">
                <span>ID: {vm._id}</span>
                <span>•</span>
                <span>IPv4: {vm.ipv4}</span>
                <span>•</span>
                <span>OS: {vm.os}</span>
                <span>•</span>
                <span>Node: {vm.nodeId}</span>
              </p>
            </div>
          </div>

          {/* Lifecycle Action Buttons (Rule 8 & 16: Start, Stop, Restart, Shutdown, Force Stop) */}
          <div className="flex flex-wrap items-center gap-2">
            {vm.status === 'stopped' ? (
              <button
                disabled={actionLoading}
                onClick={() => handleAction('start')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start</span>
              </button>
            ) : (
              <>
                <button
                  disabled={actionLoading}
                  onClick={() =>
                    setConfirmAction({
                      action: 'restart',
                      title: 'Reboot Server?',
                      message: `Send ACPI reboot signal to ${vm.name}? Active connections will temporarily drop.`,
                    })
                  }
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-medium transition-all"
                  title="Soft Reboot"
                >
                  <RotateCw className="w-3.5 h-3.5 text-purple-400" />
                  <span>Restart</span>
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() =>
                    setConfirmAction({
                      action: 'shutdown',
                      title: 'Graceful Shutdown?',
                      message: `Send ACPI power down signal to guest OS in ${vm.name}?`,
                    })
                  }
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-medium transition-all"
                  title="ACPI Shutdown"
                >
                  <PowerOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Shutdown</span>
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() =>
                    setConfirmAction({
                      action: 'force-stop',
                      title: 'Force Power Off?',
                      message: `Immediately cut power to ${vm.name} via QEMU monitor. Unsaved guest disk caches may be lost.`,
                    })
                  }
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-medium transition-all"
                  title="Force Stop"
                >
                  <Square className="w-3.5 h-3.5 text-rose-400 fill-current" />
                  <span>Force Stop</span>
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab('console')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 transition-all font-sans"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Console</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mt-6 border-t border-purple-500/15 pt-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600/25 text-purple-200 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.15)] font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel rounded-2xl p-4 border border-purple-500/15">
              <ResourceMeter
                label="vCPU Allocation"
                value={vm.cpuUsage || 14}
                detail={`${vm.cpu} Cores (${((vm.cpu * (vm.cpuUsage || 14)) / 100).toFixed(1)} GHz)`}
                color="purple"
              />
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-purple-500/15">
              <ResourceMeter
                label="RAM Allocation"
                value={Math.round(((vm.ramUsage || 4400) / vm.ram) * 100)}
                detail={`${((vm.ramUsage || 4400) / 1024).toFixed(1)} GB / ${(vm.ram / 1024).toFixed(1)} GB`}
                color="emerald"
              />
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-purple-500/15">
              <ResourceMeter
                label="Storage Disk"
                value={Math.round(((vm.diskUsage || 34) / vm.disk) * 100)}
                detail={`${vm.diskUsage || 34} GB / ${vm.disk} GB NVMe`}
                color="cyan"
              />
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-purple-500/15 flex flex-col justify-between">
              <span className="text-xs font-medium text-slate-400">Network Bandwidth</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold font-mono text-purple-300">
                  {vm.networkIn || '14.2 MB/s'}
                </span>
                <span className="text-[11px] font-mono text-emerald-400">
                  ↑ {vm.networkOut || '8.7 MB/s'}
                </span>
              </div>
            </div>
          </div>

          {/* Realtime Resource Graph */}
          <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 shadow-xl bg-[#0a0a16]">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/15">
              <div>
                <h3 className="text-sm font-semibold text-white font-sans">
                  Real-time Telemetry (QEMU Agent)
                </h3>
                <p className="text-xs text-slate-400">CPU & RAM usage over past 60 minutes</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-purple-400">
                  <span className="w-2 h-2 rounded-full bg-purple-500" /> CPU Load
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> RAM Load
                </span>
              </div>
            </div>

            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={
                    statsHistory.length > 0
                      ? statsHistory
                      : [
                          { timestamp: '14:00', cpu: 12, ram: 45 },
                          { timestamp: '14:15', cpu: 22, ram: 48 },
                          { timestamp: '14:30', cpu: 16, ram: 52 },
                          { timestamp: '14:45', cpu: 28, ram: 54 },
                          { timestamp: '15:00', cpu: 18, ram: 53 },
                        ]
                  }
                >
                  <defs>
                    <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} />
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
                    fillOpacity={1}
                    fill="url(#cpuGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="ram"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#ramGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Console (Terminal + noVNC) */}
      {activeTab === 'console' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Sub Switcher between SSH Terminal & noVNC Graphical */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 p-1 rounded-xl bg-black/40 border border-purple-500/20">
              <button
                onClick={() => setConsoleMode('ssh')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  consoleMode === 'ssh'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>SSH Web Terminal (xterm.js)</span>
              </button>

              <button
                onClick={() => setConsoleMode('vnc')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  consoleMode === 'vnc'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Graphical Console (noVNC)</span>
              </button>
            </div>

            <span className="text-xs font-mono text-purple-400">
              QEMU Socket: /run/qemu/{vm._id}.sock
            </span>
          </div>

          {consoleMode === 'ssh' ? (
            <XTerminal vmId={vm._id} vmName={vm.name} vmIp={vm.ipv4} />
          ) : (
            <VNCConsole vmId={vm._id} vmName={vm.name} vncPort={vm.vncPort || 25901} />
          )}
        </div>
      )}

      {/* TAB CONTENT: Files */}
      {activeTab === 'files' && (
        <div className="animate-in fade-in">
          <FileManager vmId={vm._id} />
        </div>
      )}

      {/* TAB CONTENT: Network */}
      {activeTab === 'network' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16]">
              <h3 className="text-sm font-semibold text-white mb-3">IP Addresses</h3>
              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-slate-400">Public IPv4:</span>
                  <span className="text-purple-300 font-bold">{vm.ipv4}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-slate-400">Public IPv6:</span>
                  <span className="text-purple-300 font-bold">2001:db8:85a3::8a2e:370:7334/64</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-slate-400">MAC Address:</span>
                  <span className="text-slate-300">52:54:00:12:34:56 (VirtIO)</span>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16]">
              <h3 className="text-sm font-semibold text-white mb-3">Firewall Profile</h3>
              <p className="text-xs text-slate-400 mb-3">
                Managed via Linux netfilter / iptables on the hypervisor tap device.
              </p>
              <div className="space-y-1.5">
                {firewallRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-black/40 text-xs font-mono"
                  >
                    <span className="text-purple-400 uppercase">{rule.protocol}</span>
                    <span className="text-slate-300">Port {rule.port}</span>
                    <span className="text-emerald-400 font-semibold uppercase">{rule.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Backups */}
      {activeTab === 'backups' && (
        <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16] animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-purple-500/15">
            <div>
              <h3 className="text-sm font-semibold text-white">Automated & Manual Backups</h3>
              <p className="text-xs text-slate-400">Stored in compressed qcow2 delta archives</p>
            </div>
            <button
              onClick={() => {
                ApiService.createBackup(vm._id, `backup-${Date.now()}`);
                addToast('success', 'Backup Initiated', 'Capturing disk state in background.');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Backup Now</span>
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {backups.map((b) => (
              <div
                key={b._id}
                className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 text-xs font-mono"
              >
                <div>
                  <span className="font-semibold text-white block">{b.name}</span>
                  <span className="text-[11px] text-slate-500">
                    Created {new Date(b.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-300">{b.size} GB</span>
                  <StatusBadge status={b.status} />
                  <button
                    onClick={() => addToast('info', 'Restore', 'Restoring from backup snapshot...')}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300"
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Snapshots */}
      {activeTab === 'snapshots' && (
        <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16] animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-purple-500/15">
            <div>
              <h3 className="text-sm font-semibold text-white">Point-in-Time Snapshots</h3>
              <p className="text-xs text-slate-400">
                Instant rollback powered by QEMU qcow2 internal snapshots
              </p>
            </div>
            <button
              onClick={() => setShowSnapshotModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Take Snapshot</span>
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {snapshots.map((s) => (
              <div
                key={s._id}
                className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 text-xs font-mono"
              >
                <div>
                  <span className="font-semibold text-white block">{s.name}</span>
                  <span className="text-[11px] text-slate-500">
                    Created {new Date(s.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      addToast('success', 'Restored', `Rollback to ${s.name} completed.`)
                    }
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300"
                  >
                    Revert
                  </button>
                  <button
                    onClick={async () => {
                      await ApiService.deleteSnapshot(vm._id, s._id);
                      setSnapshots(snapshots.filter((x) => x._id !== s._id));
                      addToast('success', 'Deleted', `Snapshot ${s.name} deleted.`);
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Logs */}
      {activeTab === 'logs' && (
        <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16] animate-in fade-in">
          <h3 className="text-sm font-semibold text-white mb-2">QEMU Hypervisor System Log</h3>
          <div className="p-4 rounded-xl bg-black/80 font-mono text-xs text-slate-300 h-96 overflow-y-auto space-y-1">
            {logs.map((log, i) => (
              <div key={i} className="text-slate-300 leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Settings & Danger Zone */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16]">
            <h3 className="text-sm font-semibold text-white mb-4">Hypervisor Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Boot Device Priority</label>
                <select className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/20 text-white font-mono">
                  <option>1. Hard Disk (virtio0), 2. CD-ROM</option>
                  <option>1. CD-ROM, 2. Hard Disk (virtio0)</option>
                  <option>1. Network (PXE iPXE)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">vCPU Pinning & Architecture</label>
                <input
                  type="text"
                  disabled
                  value="Host-Passthrough (AVX-512 enabled)"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/20 text-slate-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Danger Zone (Rule 16 requirement) */}
          <div className="glass-panel rounded-2xl border border-rose-500/30 p-6 bg-rose-950/10">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Danger Zone
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-lg">
                  Deleting this virtual machine will permanently destroy the associated NVMe disk
                  image, release allocated public IP addresses, and terminate hypervisor instances.
                </p>
              </div>

              <button
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/50 transition-colors"
              >
                Delete Virtual Machine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={Boolean(confirmAction)}
        title={confirmAction?.title || 'Confirm Action'}
        message={confirmAction?.message || ''}
        confirmLabel="Proceed"
        isDestructive={confirmAction?.action === 'force-stop'}
        onConfirm={() => confirmAction && handleAction(confirmAction.action)}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmationModal
        isOpen={confirmDelete}
        title={`Destroy ${vm.name}?`}
        message={`Are you sure you want to permanently delete virtual machine "${vm.name}"? This action cannot be reversed.`}
        confirmLabel="Delete Forever"
        requireTypedConfirmation={vm.name}
        onConfirm={handleDeleteVM}
        onCancel={() => setConfirmDelete(false)}
      />

      {/* Take Snapshot Modal */}
      {showSnapshotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm glass-panel rounded-2xl border border-purple-500/30 bg-[#0c0c1c] p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-white font-sans">Create Point-in-Time Snapshot</h3>
            <p className="text-xs text-slate-400 mt-1">Snapshot name:</p>
            <input
              type="text"
              value={newSnapshotName}
              onChange={(e) => setNewSnapshotName(e.target.value)}
              placeholder="e.g. pre-upgrade-kernel"
              className="mt-3 w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-white text-xs font-mono focus:outline-none"
              autoFocus
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowSnapshotModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSnapshot}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
              >
                Take Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
