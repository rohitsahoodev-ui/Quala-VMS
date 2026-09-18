import React, { useState, useEffect } from 'react';
import { Layers, Plus, CheckCircle2, Sparkles } from 'lucide-react';
import { OSTemplate } from '../../types';
import { ApiService } from '../../services/api';
import { useToast } from '../common/Toast';

export const OSTemplates: React.FC = () => {
  const { addToast } = useToast();
  const [templates, setTemplates] = useState<OSTemplate[]>([]);

  useEffect(() => {
    ApiService.getTemplates().then(setTemplates).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-sans">Cloud-Init OS Templates</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Pre-baked QCOW2 cloud images with automated cloud-init network configuration and user setup.
          </p>
        </div>

        <button
          onClick={() => addToast('info', 'Template Wizard', 'Pulling official genericcloud image')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Cloud Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map((tmpl) => (
          <div
            key={tmpl._id}
            className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16] shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-sans">{tmpl.name}</h3>
                  <span className="text-[11px] font-mono text-purple-300 block mt-0.5">
                    User: {tmpl.defaultUser} • Min Disk: {tmpl.minDisk} GB
                  </span>
                </div>
                {tmpl.isCloudInit && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Cloud-Init
                  </span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 space-y-1 text-xs font-mono text-slate-400">
                <div>Distribution: {tmpl.distro} {tmpl.version}</div>
                <div>Disk Image: {tmpl.imagePath}</div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
              <button
                onClick={() => addToast('info', 'Template Details', `Viewing ${tmpl.name}`)}
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Inspect Image →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
