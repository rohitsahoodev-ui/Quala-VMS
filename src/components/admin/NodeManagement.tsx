import React, { useState, useEffect } from 'react';
import { Cpu, Plus, Server, HardDrive, CheckCircle2, Shield, Activity } from 'lucide-react';
import { Node } from '../../types';
import { ApiService } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { ResourceMeter } from '../common/ResourceMeter';
import { useToast } from '../common/Toast';

export const NodeManagement: React.FC = () => {
  const { addToast } = useToast();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNode, setNewNode] = useState({
    name: '',
    ip: '',
    location: 'US-East (Ashburn)',
    totalCpu: 64,
    totalRam: 256,
    totalDisk: 4000,
  });

  const fetchNodes = async () => {
    try {
      const data = await ApiService.getAdminNodes();
      setNodes(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const handleAddNode = async () => {
    if (!newNode.name || !newNode.ip) return;
    try {
      await ApiService.createAdminNode({
        ...newNode,
        status: 'online',
        cpuUsage: 12,
        ramUsage: 25,
        diskUsage: 30,
        qemuVersion: '9.0.2',
        vmCount: 0,
      });
      addToast('success', 'Node Joined', `${newNode.name} added to QEMU cluster.`);
      setShowAddModal(false);
      setNewNode({ name: '', ip: '', location: 'US-East (Ashburn)', totalCpu: 64, totalRam: 256, totalDisk: 4000 });
      fetchNodes();
    } catch (err: any) {
      addToast('error', 'Failed', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-sans">KVM Hypervisor Nodes</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Physical bare-metal servers executing QEMU virtualization processes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Compute Node</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {nodes.map((node) => (
          <div
            key={node._id}
            className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16] shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-sans">{node.name}</h3>
                  <span className="text-[11px] font-mono text-purple-300 block mt-0.5">
                    {node.ip} • {node.location}
                  </span>
                </div>
                <StatusBadge status={node.status} />
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 space-y-3">
                <ResourceMeter
                  label="CPU Load"
                  value={node.cpuUsage ?? node.cpu?.usagePercent ?? 0}
                  detail={`${node.totalCpu ?? node.cpu?.cores ?? 32} Cores`}
                />
                <ResourceMeter
                  label="RAM Load"
                  value={node.ramUsage ?? Math.round(((node.ram?.usedGB ?? 0) / (node.ram?.totalGB || 1)) * 100)}
                  detail={`${node.totalRam ?? node.ram?.totalGB ?? 128} GB ECC`}
                  color="emerald"
                />
                <ResourceMeter
                  label="NVMe Disk"
                  value={node.diskUsage ?? Math.round(((node.storage?.usedTB ?? 0) / (node.storage?.totalTB || 1)) * 100)}
                  detail={`${node.totalDisk ?? (node.storage?.totalTB ? node.storage.totalTB * 1024 : 4096)} GB`}
                  color="cyan"
                />
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>QEMU: {node.qemuVersion}</span>
              <span className="text-purple-300 font-semibold">{node.vmCount || 0} VMs Active</span>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-2xl border border-purple-500/30 bg-[#0c0c1c] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-white">Join New Compute Node</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Node Identifier</label>
                <input
                  type="text"
                  value={newNode.name}
                  onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
                  placeholder="KVM Node 04 (Dallas)"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Host IP / SSH Address</label>
                <input
                  type="text"
                  value={newNode.ip}
                  onChange={(e) => setNewNode({ ...newNode, ip: e.target.value })}
                  placeholder="10.0.0.14"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Datacenter Region</label>
                <input
                  type="text"
                  value={newNode.location}
                  onChange={(e) => setNewNode({ ...newNode, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNode}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
              >
                Join Cluster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
