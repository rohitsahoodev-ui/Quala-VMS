import React, { useState } from 'react';
import { Settings, Save, Shield, Cpu, Mail, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '../common/Toast';

export const SystemSettings: React.FC = () => {
  const { addToast } = useToast();
  const [panelName, setPanelName] = useState('Quala VMS');
  const [supportEmail, setSupportEmail] = useState('support@qualavms.io');
  const [defaultCpu, setDefaultCpu] = useState('host-passthrough');
  const [defaultDiskBus, setDefaultDiskBus] = useState('virtio-scsi');
  const [defaultNetModel, setDefaultNetModel] = useState('virtio-net');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('60');

  const handleSave = () => {
    addToast('success', 'Settings Saved', 'System hypervisor configuration updated.');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-sans">Global System Configuration</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Hypervisor virtualization defaults, security thresholds, and panel branding.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Maintenance Mode Banner */}
      <div className="glass-panel rounded-2xl border border-amber-500/30 p-5 bg-amber-950/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="text-sm font-semibold text-white block">Cluster Maintenance Mode</span>
            <span className="text-xs text-slate-400">
              When enabled, only administrators can access the panel and provision new resources.
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setMaintenanceMode(!maintenanceMode);
            addToast('warning', 'Maintenance Mode', maintenanceMode ? 'Deactivated' : 'Activated');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            maintenanceMode
              ? 'bg-amber-600 text-white'
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          {maintenanceMode ? 'Active' : 'Disabled'}
        </button>
      </div>

      {/* Virtualization Defaults (Rule 1 / Rule 7) */}
      <div className="glass-panel rounded-2xl border border-purple-500/20 p-6 bg-[#0a0a16] space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" /> QEMU/KVM Virtualization Drivers
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <label className="block text-slate-400 mb-1">CPU Emulation Model</label>
            <select
              value={defaultCpu}
              onChange={(e) => setDefaultCpu(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-white focus:outline-none"
            >
              <option value="host-passthrough">host-passthrough (Max Performance)</option>
              <option value="qemu64">qemu64 (High Compatibility)</option>
              <option value="EPYC-Rome">EPYC-Rome (AMD)</option>
              <option value="Skylake-Server">Skylake-Server (Intel)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Disk Controller Bus</label>
            <select
              value={defaultDiskBus}
              onChange={(e) => setDefaultDiskBus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-white focus:outline-none"
            >
              <option value="virtio-scsi">virtio-scsi (Multi-queue)</option>
              <option value="virtio-blk">virtio-blk (Legacy fast)</option>
              <option value="nvme">nvme (Emulated PCIe)</option>
              <option value="sata">sata (Emulated AHCI)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Network Device Model</label>
            <select
              value={defaultNetModel}
              onChange={(e) => setDefaultNetModel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-white focus:outline-none"
            >
              <option value="virtio-net">virtio-net (Paravirtualized)</option>
              <option value="e1000e">e1000e (Intel Gigabit)</option>
              <option value="vmxnet3">vmxnet3 (VMware)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security & Authentication */}
      <div className="glass-panel rounded-2xl border border-purple-500/20 p-6 bg-[#0a0a16] space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-400" /> Security & Session Policy
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <label className="block text-slate-400 mb-1">Session Inactivity Timeout (Minutes)</label>
            <input
              type="number"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Max Login Failures Before Lockout</label>
            <input
              type="number"
              defaultValue={5}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-white focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
