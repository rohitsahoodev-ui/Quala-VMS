import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, ArrowUpCircle, ShieldCheck, Terminal } from 'lucide-react';
import { useToast } from '../common/Toast';

export const SystemUpdates: React.FC = () => {
  const { addToast } = useToast();
  const [checking, setChecking] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleCheck = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      addToast('success', 'Up to Date', 'Quala VMS v2.4.0 is the latest stable release.');
    }, 1200);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white font-sans">Software & Kernel Updates</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Quala VMS orchestration core, QEMU engine, and host hypervisor microcode packages.
        </p>
      </div>

      <div className="glass-panel rounded-2xl border border-purple-500/20 p-6 bg-[#0a0a16] space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-purple-500/15">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-600/20 text-purple-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base font-bold text-white font-mono block">Quala VMS v2.4.0</span>
              <span className="text-xs text-slate-400">Release Channel: Stable Production LTS</span>
            </div>
          </div>

          <button
            onClick={handleCheck}
            disabled={checking}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>Check for Updates</span>
          </button>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <h3 className="text-white font-semibold font-sans text-sm">System Components</h3>
          <div className="p-3 rounded-xl bg-black/40 flex items-center justify-between">
            <span className="text-slate-300">QEMU Virtualization Engine</span>
            <span className="text-emerald-400">qemu-system-x86_64 v9.0.2</span>
          </div>
          <div className="p-3 rounded-xl bg-black/40 flex items-center justify-between">
            <span className="text-slate-300">Linux KVM Kernel Module</span>
            <span className="text-emerald-400">6.8.0-45-generic (x86_64)</span>
          </div>
          <div className="p-3 rounded-xl bg-black/40 flex items-center justify-between">
            <span className="text-slate-300">Open vSwitch / Bridge Driver</span>
            <span className="text-emerald-400">v3.3.0 Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
