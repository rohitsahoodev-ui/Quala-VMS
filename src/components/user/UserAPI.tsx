import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Copy, Check, Shield } from 'lucide-react';
import { APIKey } from '../../types';
import { ApiService } from '../../services/api';
import { useToast } from '../common/Toast';

export const UserAPI: React.FC = () => {
  const { addToast } = useToast();
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchKeys = async () => {
    try {
      const data = await ApiService.getApiKeys();
      setKeys(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async () => {
    if (!keyName.trim()) return;
    try {
      const res = await ApiService.createApiKey(keyName, ['read', 'write']);
      setCreatedToken(res.rawToken);
      setKeyName('');
      fetchKeys();
    } catch (err: any) {
      addToast('error', 'Creation failed', err.message);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast('success', 'Copied to clipboard', 'API Token copied');
  };

  const handleRevoke = async (id: string) => {
    try {
      await ApiService.revokeApiKey(id);
      addToast('success', 'Revoked', 'API token revoked');
      fetchKeys();
    } catch (err: any) {
      addToast('error', 'Revocation failed', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-sans">API Access Tokens</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Authenticate programmatic REST API calls for Terraform, Ansible, and automated CI pipelines.
          </p>
        </div>

        <button
          onClick={() => {
            setCreatedToken(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New API Key</span>
        </button>
      </div>

      <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16] shadow-xl">
        <div className="space-y-3">
          {keys.map((k) => (
            <div
              key={k._id}
              className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5 text-xs font-mono"
            >
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <span className="font-semibold text-white block text-sm">{k.name}</span>
                  <span className="text-[11px] text-purple-300">{k.keyPrefix}••••••••••••</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-slate-500 text-[11px]">
                  Last used: {k.lastUsed ? new Date(k.lastUsed).toLocaleDateString() : 'Never'}
                </span>
                <button
                  onClick={() => handleRevoke(k._id)}
                  className="p-1 text-slate-400 hover:text-rose-400"
                  title="Revoke Token"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-2xl border border-purple-500/30 bg-[#0c0c1c] p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Generate API Token</h3>
            {createdToken ? (
              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs font-mono text-purple-200 break-all select-all flex items-center justify-between gap-2">
                  <span>{createdToken}</span>
                  <button
                    onClick={() => handleCopy(createdToken)}
                    className="p-1.5 rounded-lg bg-purple-600 text-white shrink-0 hover:bg-purple-500"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-rose-300">
                  ⚠️ Save this token now! You won't be able to view it again.
                </p>
                <div className="pt-2 text-right">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-medium hover:bg-white/20"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <label className="block text-xs text-slate-400">Token Description</label>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g. Terraform Deployment Key"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-white text-xs font-mono focus:outline-none"
                  autoFocus
                />
                <div className="mt-4 flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateKey}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
                  >
                    Create Key
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
