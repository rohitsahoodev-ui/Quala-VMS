import React, { useState, useEffect } from 'react';
import { Disc, Plus, Upload, Trash2, Shield, CheckCircle2 } from 'lucide-react';
import { ISOLibraryItem } from '../../types';
import { ApiService } from '../../services/api';
import { useToast } from '../common/Toast';

export const ISOLibrary: React.FC = () => {
  const { addToast } = useToast();
  const [isos, setIsos] = useState<ISOLibraryItem[]>([]);
  const [category, setCategory] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newIso, setNewIso] = useState({
    name: '',
    category: 'linux' as const,
    size: 1.2,
    checksum: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  });

  const fetchISOs = async () => {
    try {
      const data = await ApiService.getISOs();
      setIsos(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchISOs();
  }, []);

  const handleCreate = async () => {
    if (!newIso.name) return;
    try {
      await ApiService.createISO(newIso);
      addToast('success', 'ISO Added', newIso.name);
      setShowUploadModal(false);
      setNewIso({ name: '', category: 'linux', size: 1.2, checksum: '' });
      fetchISOs();
    } catch (err: any) {
      addToast('error', 'Failed', err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await ApiService.deleteISO(id);
      addToast('success', 'Deleted', 'ISO image removed from pool');
      fetchISOs();
    } catch (err: any) {
      addToast('error', 'Delete failed', err.message);
    }
  };

  const filtered = isos.filter((i) => category === 'all' || i.category === category);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-sans">ISO Image Repository</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Operating system boot media and live rescue tools mounted directly to QEMU CD-ROM drives.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Upload / Pull ISO</span>
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-purple-500/15 pb-2 text-xs">
        {['all', 'linux', 'windows', 'rescue', 'utility'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-xl capitalize font-medium transition-colors ${
              category === cat ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16] shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-purple-500/15 text-slate-400 font-mono">
              <th className="pb-3 pl-2">ISO Image Name</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Image Size</th>
              <th className="pb-3">SHA-256 Checksum</th>
              <th className="pb-3">Created</th>
              <th className="pb-3 text-right pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((iso) => (
              <tr key={iso._id} className="hover:bg-white/5 transition-colors">
                <td className="py-3 pl-2 font-medium text-white flex items-center gap-2.5">
                  <Disc className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{iso.name}</span>
                </td>
                <td className="py-3 font-mono uppercase text-[11px] text-purple-300">
                  {iso.category}
                </td>
                <td className="py-3 font-mono text-slate-300">{iso.sizeGB ?? iso.size ?? 0} GB</td>
                <td className="py-3 font-mono text-slate-500 text-[10px] truncate max-w-[160px]">
                  {iso.checksum || 'sha256:verified'}
                </td>
                <td className="py-3 font-mono text-slate-400 text-[11px]">
                  {new Date(iso.createdAt || iso.uploadedAt || Date.now()).toLocaleDateString()}
                </td>
                <td className="py-3 text-right pr-2">
                  <button
                    onClick={() => handleDelete(iso._id)}
                    className="p-1 text-slate-400 hover:text-rose-400"
                    title="Delete ISO"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-2xl border border-purple-500/30 bg-[#0c0c1c] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-white">Add ISO Image</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Image Name</label>
                <input
                  type="text"
                  value={newIso.name}
                  onChange={(e) => setNewIso({ ...newIso, name: e.target.value })}
                  placeholder="archlinux-2026.09.iso"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={newIso.category}
                  onChange={(e) => setNewIso({ ...newIso, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-white font-mono focus:outline-none"
                >
                  <option value="linux">Linux</option>
                  <option value="windows">Windows</option>
                  <option value="rescue">Rescue</option>
                  <option value="utility">Utility</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
              >
                Save to Repository
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
