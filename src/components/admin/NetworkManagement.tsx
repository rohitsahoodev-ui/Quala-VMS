import React, { useState } from 'react';
import { Network, Plus, Radio, Shield, Globe, Layers, ArrowRight } from 'lucide-react';
import { useToast } from '../common/Toast';

export const NetworkManagement: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'bridges' | 'subnets' | 'firewall'>('bridges');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-sans">Software-Defined Networking (SDN)</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Linux bridges, isolated NAT domains, 802.1Q VLAN tags, and hypervisor IP pools.
          </p>
        </div>

        <button
          onClick={() => addToast('info', 'Network Wizard', 'Configuring virtual bridge interface')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Network Bridge</span>
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-purple-500/15 pb-2">
        <button
          onClick={() => setActiveTab('bridges')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            activeTab === 'bridges' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Bridges & Interfaces
        </button>
        <button
          onClick={() => setActiveTab('subnets')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            activeTab === 'subnets' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          IP Subnet Pools
        </button>
        <button
          onClick={() => setActiveTab('firewall')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            activeTab === 'firewall' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Hypervisor Firewall Policies
        </button>
      </div>

      {activeTab === 'bridges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-white text-sm">vmbr0 (Public Gateway)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                UP
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Physical Device: eno1 • MTU: 1500</p>
            <div className="p-3 rounded-xl bg-black/40 text-xs font-mono text-slate-300 space-y-1">
              <div>Subnet: 198.51.100.0/24</div>
              <div>Gateway: 198.51.100.1</div>
              <div>Connected VM Taps: 4 (tap1042i0, tap1043i0, ...)</div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-white text-sm">vmbr1 (Private VLAN 100)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                UP
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Physical Device: eno2.100 • MTU: 9000 (Jumbo)</p>
            <div className="p-3 rounded-xl bg-black/40 text-xs font-mono text-slate-300 space-y-1">
              <div>Subnet: 10.100.0.0/16</div>
              <div>Gateway: 10.100.0.1</div>
              <div>Connected VM Taps: 6</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'subnets' && (
        <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16]">
          <h2 className="text-sm font-semibold text-white mb-3">Allocated IP Subnets</h2>
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-black/40 flex items-center justify-between">
              <div>
                <span className="text-white font-bold">198.51.100.0/24</span>
                <span className="text-slate-500 text-[10px] block">Public IPv4 Pool • 254 Total IPs</span>
              </div>
              <span className="text-purple-300">42 Assigned (16.5%)</span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 flex items-center justify-between">
              <div>
                <span className="text-white font-bold">2001:db8:85a3::/48</span>
                <span className="text-slate-500 text-[10px] block">Global IPv6 Prefix • Routed /64 Subnets</span>
              </div>
              <span className="text-purple-300">3 Subnets Active</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'firewall' && (
        <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16]">
          <h2 className="text-sm font-semibold text-white mb-3">Host iptables / nftables Filter Rules</h2>
          <div className="p-4 rounded-xl bg-black/80 font-mono text-xs text-slate-300 space-y-1">
            <div className="text-slate-500"># Generated by Quala VMS Netfilter Engine</div>
            <div>iptables -A FORWARD -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT</div>
            <div>iptables -A FORWARD -i vmbr0 -o tap+ -m physdev --physdev-is-bridged -j ACCEPT</div>
            <div>iptables -A FORWARD -p tcp --dport 25 -j DROP <span className="text-slate-500"># Anti-Spam outbound port 25 block</span></div>
            <div>iptables -t nat -A POSTROUTING -s 10.100.0.0/16 -o eno1 -j MASQUERADE</div>
          </div>
        </div>
      )}
    </div>
  );
};
