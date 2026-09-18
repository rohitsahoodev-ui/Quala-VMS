import React, { useState, useEffect } from 'react';
import { Camera, Plus, Trash2, RotateCcw, Server, Calendar, HardDrive } from 'lucide-react';
import { VM, VMSnapshot } from '../../types';
import { ApiService } from '../../services/api';
import { useToast } from '../common/Toast';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const UserSnapshots: React.FC = () => {
  const { addToast } = useToast();
  const [vms, setVms] = useState<VM[]>([]);
  const [selectedVmId, setSelectedVmId] = useState<string>('vm-1042');
  const [snapshots, setSnapshots] = useState<VMSnapshot[]>([]);
  const [snapshotModal, setSnapshotModal] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  const [targetDelete, setTargetDelete] = useState<VMSnapshot | null>(null);

  const fetchSnapshots = async () => {
    try {
      const [vmList, snapList] = await Promise.all([
        ApiService.getVMs(),
        ApiService.getSnapshots(selectedVmId),
      ]);
      setVms(vmList);
      setSnapshots(snapList);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSnapshots();
  }, [selectedVmId]);

  const handleCreate = async () => {
    if (!snapshotName.trim()) return;
    try {
      await ApiService.createSnapshot(selectedVmId, snapshotName);
      addToast('success', 'Snapshot created', snapshotName);
      setSnapshotName('');
      setSnapshotModal(false);
      fetchSnapshots();
    } catch (err: any) {
      addToast('error', 'Failed', err.message);
    }
  };

  const handleDelete = async () => {
    if (!targetDelete) return;
    try {
      await ApiService.deleteSnapshot(selectedVmId, targetDelete._id);
      addToast('success', 'Deleted', targetDelete.name);
      setTargetDelete(null);
      fetchSnapshots();
    } catch (err: any) {
      addToast('error', 'Delete failed', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-sans">Point-in-Time Snapshots</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Instant hypervisor disk states powered by QEMU qcow2 internal copy-on-write snapshots.
          </p>
        </div>

        <button
          onClick={() => setSnapshotModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 transition-colors"
        >
          <Camera className="w-4 h-4" />
          <span>Take New Snapshot</span>
        </button>
      </div>

      {/* Select Server Filter */}
      <div className="glass-panel rounded-2xl border border-purple-500/20 p-4 bg-[#0a0a16] flex items-center gap-3">
        <Server className="w-4 h-4 text-purple-400" />
        <span className="text-xs font-medium text-slate-300">Target Virtual Machine:</span>
        <select
          value={selectedVmId}
          onChange={(e) => setSelectedVmId(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-black/50 border border-purple-500/30 text-white text-xs font-mono focus:outline-none"
        >
          {vms.map((v) => (
            <option key={v._id} value={v._id}>
              {v.name} ({v.ipv4})
            </option>
          ))}
        </select>
      </div>

      {/* Snapshots Table */}
      <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16] shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-purple-500/15 text-slate-400 font-mono">
              <th className="pb-3 pl-2">Snapshot Identifier</th>
              <th className="pb-3">Timestamp</th>
              <th className="pb-3">Delta Disk Size</th>
              <th className="pb-3 text-right pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {snapshots.map((s) => (
              <tr key={s._id} className="hover:bg-white/5 transition-colors">
                <td className="py-3 pl-2 font-medium text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{s.name}</span>
                </td>
                <td className="py-3 text-slate-400 font-mono">
                  {new Date(s.createdAt).toLocaleString()}
                </td>
                <td className="py-3 font-mono text-purple-300">
                  {s.size ? `${s.size} GB` : '1.4 GB (delta)'}
                </td>
                <td className="py-3 text-right pr-2">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() =>
                        addToast('success', 'Reverted', `Reverting QEMU disk state to ${s.name}`)
                      }
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300"
                    >
                      Revert
                    </button>
                    <button
                      onClick={() => setTargetDelete(s)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {snapshotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm glass-panel rounded-2xl border border-purple-500/30 bg-[#0c0c1c] p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-white">Create Snapshot</h3>
            <p className="text-xs text-slate-400 mt-1">Snapshot name identifier:</p>
            <input
              type="text"
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              placeholder="e.g. pre-db-migration"
              className="mt-3 w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-white text-xs font-mono focus:outline-none"
              autoFocus
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setSnapshotModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
              >
                Capture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmationModal
        isOpen={Boolean(targetDelete)}
        title="Delete Snapshot?"
        message={`Delete point-in-time snapshot "${targetDelete?.name}"?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setTargetDelete(null)}
      />
    </div>
  );
};
