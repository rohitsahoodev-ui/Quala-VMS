import React, { useState } from 'react';
import {
  Server,
  Cpu,
  HardDrive,
  Network,
  Shield,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Layers,
  Key,
  Globe,
  Radio,
  Sliders,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { VM } from '../../types';
import { ApiService } from '../../services/api';
import { useToast } from '../common/Toast';

interface CreateVMWizardProps {
  isOpen?: boolean;
  onSuccess: (vm?: any) => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export const CreateVMWizard: React.FC<CreateVMWizardProps> = ({ onSuccess, onCancel, onClose, isOpen }) => {
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [deploying, setDeploying] = useState(false);
  const handleCancel = onClose || onCancel || (() => {});

  // Form State
  const [formData, setFormData] = useState({
    name: 'web-prod-02',
    description: 'General compute cluster node',
    nodeId: 'node-us-east-01',
    osType: 'ubuntu-24.04',
    osName: 'Ubuntu 24.04 LTS Noble Numbat',
    cpu: 4,
    ram: 8, // GB
    disk: 80, // GB
    storageType: 'NVMe',
    networkType: 'bridge',
    enableIPv6: true,
    firewallProfile: 'web-standard',
    authType: 'ssh', // 'ssh' | 'password'
    sshKey: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExampleQualaKey admin@quala',
    password: '',
    guestAgent: true,
    autoStart: true,
    planId: 'plan-pro',
    monthlyPrice: 32,
  });

  const osOptions = [
    {
      id: 'ubuntu-24.04',
      name: 'Ubuntu',
      version: '24.04 LTS (Noble)',
      arch: 'x86_64',
      icon: '🟠',
      recommended: true,
    },
    {
      id: 'debian-12',
      name: 'Debian',
      version: '12 (Bookworm)',
      arch: 'x86_64',
      icon: '🔴',
    },
    {
      id: 'almalinux-9',
      name: 'AlmaLinux',
      version: '9.4 (Enterprise)',
      arch: 'x86_64',
      icon: '🔵',
    },
    {
      id: 'rocky-9',
      name: 'Rocky Linux',
      version: '9.4 (Green)',
      arch: 'x86_64',
      icon: '🟢',
    },
    {
      id: 'alpine-3.20',
      name: 'Alpine Linux',
      version: '3.20 (Minimal)',
      arch: 'x86_64',
      icon: '⚪',
    },
    {
      id: 'windows-2022',
      name: 'Windows Server',
      version: '2022 Standard',
      arch: 'x86_64',
      icon: '🪟',
    },
  ];

  const presets = [
    { name: 'Micro', cpu: 1, ram: 2, disk: 25, price: 8 },
    { name: 'Standard', cpu: 2, ram: 4, disk: 50, price: 16 },
    { name: 'Pro Performance', cpu: 4, ram: 8, disk: 80, price: 32 },
    { name: 'High Memory', cpu: 8, ram: 16, disk: 160, price: 64 },
    { name: 'Dedicated Compute', cpu: 16, ram: 32, disk: 320, price: 128 },
  ];

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      const response = await ApiService.createVM({
        name: formData.name,
        description: formData.description,
        node: formData.nodeId,
        nodeId: formData.nodeId,
        os: formData.osName,
        image: formData.osName,
        cpu: formData.cpu,
        ram: formData.ram,
        disk: formData.disk,
        ipv4: `198.51.100.${Math.floor(Math.random() * 200) + 10}`,
        status: 'running',
        bootDevice: 'hd',
      });

      addToast('success', 'Virtual Machine Deployed', `${formData.name} is now booting via QEMU.`);
      onSuccess(response.vm);
    } catch (err: any) {
      addToast('error', 'Deployment Failed', err.message);
      setDeploying(false);
    }
  };

  if (isOpen !== undefined && !isOpen) {
    return null;
  }

  const content = (
    <div className="max-w-4xl w-full mx-auto glass-panel rounded-2xl border border-purple-500/20 p-6 sm:p-8 shadow-2xl bg-[#0a0a16] relative max-h-[90vh] overflow-y-auto">
      {/* Wizard Header */}
      <div className="flex items-center justify-between pb-6 border-b border-purple-500/15">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
              <Server className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white font-sans">Deploy Virtual Machine</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Launch a high-performance KVM virtual machine in seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center gap-1.5">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                  currentStep === step
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 ring-2 ring-purple-400/30'
                    : currentStep > step
                    ? 'bg-purple-950 text-purple-300 border border-purple-500/30'
                    : 'bg-black/40 text-slate-500 border border-white/5'
                }`}
              >
                {currentStep > step ? <Check className="w-3.5 h-3.5" /> : step}
              </span>
              {step < 5 && <div className="w-4 h-0.5 bg-white/10" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step Contents */}
      <div className="py-6 min-h-[380px]">
        {/* STEP 1: General Info */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider text-purple-300">
              1. General Information & Region
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Server Name / Hostname
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Hypervisor Cluster Node
                </label>
                <select
                  value={formData.nodeId}
                  onChange={(e) => setFormData({ ...formData, nodeId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                >
                  <option value="node-us-east-01">KVM Node 01 (US-East, Ashburn) - 18% Load</option>
                  <option value="node-eu-west-01">KVM Node 02 (EU-West, Frankfurt) - 34% Load</option>
                  <option value="node-ap-south-01">KVM Node 03 (AP-South, Mumbai) - 12% Load</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Description / Purpose
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-white text-xs focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* STEP 2: OS Selection */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider text-purple-300">
              2. Select Operating System
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {osOptions.map((os) => {
                const isSelected = formData.osType === os.id;
                return (
                  <div
                    key={os.id}
                    onClick={() => setFormData({ ...formData, osType: os.id, osName: `${os.name} ${os.version}` })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-900/30'
                        : 'bg-black/30 border-white/10 hover:border-purple-500/40 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{os.icon}</span>
                      {os.recommended && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <h4 className="text-sm font-bold text-white font-sans">{os.name}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{os.version}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Hardware & Presets */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider text-purple-300">
                3. Hardware Configuration
              </h3>
              <span className="text-xs text-slate-400">Select a bundle or adjust custom sliders</span>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {presets.map((p) => {
                const isSelected =
                  formData.cpu === p.cpu && formData.ram === p.ram && formData.disk === p.disk;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        cpu: p.cpu,
                        ram: p.ram,
                        disk: p.disk,
                        monthlyPrice: p.price,
                      })
                    }
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-purple-600/30 border-purple-500 text-white shadow-md'
                        : 'bg-black/30 border-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <span className="block text-xs font-semibold">{p.name}</span>
                    <span className="block text-[10px] text-purple-400 font-mono mt-0.5">
                      ${p.price}/mo
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Sliders */}
            <div className="space-y-4 pt-2">
              <div className="p-3.5 rounded-xl bg-black/40 border border-purple-500/20">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                    <Cpu className="w-4 h-4 text-purple-400" /> Virtual CPUs (vCPU)
                  </span>
                  <span className="text-purple-400 font-mono font-bold text-sm">
                    {formData.cpu} Cores
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="32"
                  value={formData.cpu}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cpu: Number(e.target.value),
                      monthlyPrice: Number(e.target.value) * 4 + formData.ram * 2,
                    })
                  }
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-purple-500/20">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                    <Layers className="w-4 h-4 text-purple-400" /> Memory (RAM)
                  </span>
                  <span className="text-purple-400 font-mono font-bold text-sm">
                    {formData.ram} GB
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="64"
                  value={formData.ram}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ram: Number(e.target.value),
                      monthlyPrice: formData.cpu * 4 + Number(e.target.value) * 2,
                    })
                  }
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-purple-500/20">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                    <HardDrive className="w-4 h-4 text-purple-400" /> NVMe QCOW2 Disk
                  </span>
                  <span className="text-purple-400 font-mono font-bold text-sm">
                    {formData.disk} GB
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={formData.disk}
                  onChange={(e) => setFormData({ ...formData, disk: Number(e.target.value) })}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Network & Security */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider text-purple-300">
              4. Network & Security Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20">
                <span className="text-xs font-semibold text-white">Network Driver</span>
                <p className="text-[11px] text-slate-400 mt-1 mb-3">
                  VirtIO-Net provides near-native hypervisor throughput with checksum offloading.
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.networkType === 'bridge'}
                      onChange={() => setFormData({ ...formData, networkType: 'bridge' })}
                      className="accent-purple-500"
                    />
                    <span>Public Bridge (Dedicated Public IPv4)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.networkType === 'nat'}
                      onChange={() => setFormData({ ...formData, networkType: 'nat' })}
                      className="accent-purple-500"
                    />
                    <span>Isolated NAT + Port Forwarding</span>
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20">
                <span className="text-xs font-semibold text-white">Security & Firewall Profile</span>
                <p className="text-[11px] text-slate-400 mt-1 mb-3">
                  Default iptables rules automatically applied to host tap interface.
                </p>
                <select
                  value={formData.firewallProfile}
                  onChange={(e) => setFormData({ ...formData, firewallProfile: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-white text-xs font-mono focus:outline-none"
                >
                  <option value="web-standard">Web Standard (Ports 80, 443, 22 allowed)</option>
                  <option value="strict-ssh">Strict SSH Only (Port 22 only)</option>
                  <option value="database-node">Database Node (Ports 5432, 27017, 22)</option>
                  <option value="custom">All Inbound Dropped (Custom rules)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20">
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5 text-purple-400" />
                <div>
                  <span className="text-xs font-semibold text-white">Dual-Stack IPv6 Subnet</span>
                  <p className="text-[11px] text-slate-400">
                    Assign a routed /64 IPv6 prefix to this virtual machine
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.enableIPv6}
                onChange={(e) => setFormData({ ...formData, enableIPv6: e.target.checked })}
                className="w-4 h-4 accent-purple-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* STEP 5: Cloud-Init, Auth & Review */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider text-purple-300">
              5. Authentication & Deployment Summary
            </h3>

            {/* Authentication Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Root SSH Public Key (Cloud-Init)
              </label>
              <textarea
                value={formData.sshKey}
                onChange={(e) => setFormData({ ...formData, sshKey: e.target.value })}
                rows={2}
                placeholder="ssh-ed25519 AAAA..."
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-white text-xs font-mono focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            {/* Blueprint Summary Card */}
            <div className="p-4 rounded-xl glass-panel border border-purple-500/30 bg-purple-950/20 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                  Virtual Machine Blueprint
                </span>
                <span className="text-sm font-bold text-purple-300 font-mono">
                  ${formData.monthlyPrice}.00 / month
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Server Name</span>
                  <span className="text-white font-medium">{formData.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">OS Image</span>
                  <span className="text-white font-medium">{formData.osName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">vCPU & Memory</span>
                  <span className="text-white font-medium">
                    {formData.cpu} vCPUs / {formData.ram} GB RAM
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Storage Disk</span>
                  <span className="text-white font-medium">{formData.disk} GB NVMe</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Footer Controls */}
      <div className="flex items-center justify-between pt-6 border-t border-purple-500/15">
        <button
          type="button"
          onClick={currentStep === 1 ? handleCancel : () => setCurrentStep(currentStep - 1)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{currentStep === 1 ? 'Cancel' : 'Back'}</span>
        </button>

        {currentStep < 5 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep + 1)}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors shadow-lg shadow-purple-900/40 font-sans"
          >
            <span>Continue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={deploying}
            onClick={handleDeploy}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow-xl shadow-purple-900/40 font-sans"
          >
            {deploying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Booting KVM Hypervisor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>Deploy Virtual Machine</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  if (isOpen !== undefined) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        {content}
      </div>
    );
  }

  return content;
};
