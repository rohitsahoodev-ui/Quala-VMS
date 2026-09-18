import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { Plan } from '../../types';
import { ApiService } from '../../services/api';
import { useToast } from '../common/Toast';

export const PlansManagement: React.FC = () => {
  const { addToast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    cpu: 2,
    ram: 4096,
    disk: 50,
    bandwidth: 2000,
    priceMonthly: 12,
  });

  const fetchPlans = async () => {
    try {
      const data = await ApiService.getPlans();
      setPlans(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreate = async () => {
    if (!newPlan.name) return;
    try {
      await ApiService.createPlan({
        ...newPlan,
        features: ['Automated Backups', '1 Gbps Uplink', 'DDoS Protection', 'KVM VirtIO'],
      });
      addToast('success', 'Plan Created', newPlan.name);
      setShowModal(false);
      fetchPlans();
    } catch (err: any) {
      addToast('error', 'Failed', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-sans">VPS Packages & Pricing Tiers</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure compute specifications, RAM allowances, disk limits, and monthly recurring pricing.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add VPS Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map((p) => (
          <div
            key={p._id}
            className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16] shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white font-sans">{p.name}</h3>
                <span className="text-lg font-bold text-purple-400 font-mono">
                  ${p.priceMonthly}
                  <span className="text-[11px] text-slate-400 font-normal">/mo</span>
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">vCPU:</span>
                  <span className="font-bold text-white">{p.cpu} Cores</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">RAM:</span>
                  <span className="font-bold text-white">{p.ram >= 1024 ? p.ram / 1024 : p.ram} GB ECC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Disk:</span>
                  <span className="font-bold text-white">{p.disk} GB NVMe</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transfer:</span>
                  <span className="font-bold text-white">{typeof p.bandwidth === 'number' ? (p.bandwidth >= 1000 ? `${p.bandwidth / 1000} TB` : `${p.bandwidth} GB`) : p.bandwidth}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-emerald-400 text-[11px] font-mono">Active in Catalog</span>
              <button
                onClick={() => addToast('info', 'Edit Plan', `Editing ${p.name}`)}
                className="text-purple-400 hover:text-purple-300"
              >
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-2xl border border-purple-500/30 bg-[#0c0c1c] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-white">Create VPS Tier</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Plan Name</label>
                <input
                  type="text"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  placeholder="Compute XL"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-white font-mono focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">vCPU Cores</label>
                  <input
                    type="number"
                    value={newPlan.cpu}
                    onChange={(e) => setNewPlan({ ...newPlan, cpu: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Price ($/mo)</label>
                  <input
                    type="number"
                    value={newPlan.priceMonthly}
                    onChange={(e) => setNewPlan({ ...newPlan, priceMonthly: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
              >
                Save Tier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
