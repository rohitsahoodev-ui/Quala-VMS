import React, { useState, useEffect } from 'react';
import { HardDrive, Plus, Database, Server, CheckCircle2 } from 'lucide-react';
import { StoragePool } from '../../types';
import { ApiService } from '../../services/api';
import { ResourceMeter } from '../common/ResourceMeter';
import { useToast } from '../common/Toast';

export const StorageManagement: React.FC = () => {
  const { addToast } = useToast();
  const [pools, setPools] = useState<StoragePool[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPool, setNewPool] = useState({
    name: '',
    type: 'dir' as const,
    path: '/var/lib/qualavms/images',
    total: 2000,
  });

  const fetchStorage = async () => {
    try {
      const data = await ApiService.getAdminStorage();
      setPools(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStorage();
  }, []);

  const handleAddPool = async () => {
    if (!newPool.name) return;
    try {
      await ApiService.createAdminStorage({
        ...newPool,
        used: 10,
        status: 'active',
      });
      addToast('success', 'Storage Pool Created', newPool.name);
      setShowAddModal(false);
      setNewPool({ name: '', type: 'dir', path: '/var/lib/qualavms/images', total: 2000 });
      fetchStorage();
    } catch (err: any) {
      addToast('error', 'Failed', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-sans">Storage Pools & Volume Groups</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Local NVMe directory targets, LVM thin pools, and shared NFS volume mounts.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Storage Pool</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {pools.map((p) => (
          <div
            key={p._id}
            className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16] shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-sans">{p.name}</h3>
                  <span className="text-[11px] font-mono text-purple-300 block mt-0.5">
                    Type: {p.type.toUpperCase()} • {p.path}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-semibold">
                  ACTIVE
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5">
                <ResourceMeter
                  label="Allocated Volume"
                  value={Math.round(((p.usedGB ?? p.used ?? 0) / (p.totalGB ?? p.total ?? 1)) * 100)}
                  detail={`${p.usedGB ?? p.used ?? 0} GB / ${p.totalGB ?? p.total ?? 1} GB`}
                  color="purple"
                />
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Free: {p.freeGB ?? ((p.totalGB ?? p.total ?? 1) - (p.usedGB ?? p.used ?? 0))} GB</span>
              <span className="text-purple-300 font-semibold">QCOW2 / RAW</span>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-2xl border border-purple-500/30 bg-[#0c0c1c] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-white">Create Storage Pool</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Pool Name</label>
                <input
                  type="text"
                  value={newPool.name}
                  onChange={(e) => setNewPool({ ...newPool, name: e.target.value })}
                  placeholder="nvme-tier-02"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Storage Driver</label>
                <select
                  value={newPool.type}
                  onChange={(e) => setNewPool({ ...newPool, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-white font-mono focus:outline-none"
                >
                  <option value="dir">Directory (qcow2 / raw)</option>
                  <option value="lvm">LVM Thin Pool</option>
                  <option value="nfs">NFS Network Mount</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Filesystem Path</label>
                <input
                  type="text"
                  value={newPool.path}
                  onChange={(e) => setNewPool({ ...newPool, path: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-white font-mono focus:outline-none"
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
                onClick={handleAddPool}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
              >
                Mount Pool
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
