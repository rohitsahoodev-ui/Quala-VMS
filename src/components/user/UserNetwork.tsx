import React from 'react';
import { Network, Shield, Radio, Globe, CheckCircle2, Lock } from 'lucide-react';

export const UserNetwork: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white font-sans">Network & Security Policies</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Public IP assignments, DNS PTR records, and host firewall rules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16]">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Radio className="w-4 h-4 text-purple-400" /> Allocated Public IP Addresses
          </h2>
          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-white font-bold block">198.51.100.42</span>
                <span className="text-[10px] text-slate-400">Assigned to: Production Web Node 01</span>
              </div>
              <span className="text-emerald-400">Routed /32</span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-white font-bold block">198.51.100.89</span>
                <span className="text-[10px] text-slate-400">Assigned to: Redis Cluster Alpha</span>
              </div>
              <span className="text-emerald-400">Routed /32</span>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16]">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" /> DDoS & Network Shield
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            All Quala VMS hypervisor ports are protected by 1.2 Tbps multi-layer volumetric DDoS mitigation and automated BGP Flowspec rate limiting.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>Mitigation Pipeline Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
