import React, { useState } from 'react';
import { Radio, Plus, Send, CheckCircle2, Trash2 } from 'lucide-react';
import { useToast } from '../common/Toast';

export const WebhooksManagement: React.FC = () => {
  const { addToast } = useToast();
  const [webhooks, setWebhooks] = useState([
    {
      id: 'wh-01',
      url: 'https://api.company.com/webhooks/quala',
      events: ['vm.created', 'vm.deleted', 'vm.stopped'],
      secret: 'whsec_99a8b7c6d5e4f3a2b1',
      status: 'active',
    },
  ]);

  const handleTestPing = (url: string) => {
    addToast('success', 'Ping Sent (HTTP 200)', `Payload signed with HMAC-SHA256 and sent to ${url}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-sans">Outgoing Webhook Endpoints</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deliver event notifications with HMAC SHA-256 signatures to external systems in real-time.
          </p>
        </div>

        <button
          onClick={() => addToast('info', 'Webhook Modal', 'Add new webhook subscriber')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register Webhook</span>
        </button>
      </div>

      <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16] shadow-xl space-y-4">
        {webhooks.map((wh) => (
          <div
            key={wh.id}
            className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono"
          >
            <div>
              <span className="text-white font-bold text-sm block">{wh.url}</span>
              <div className="flex items-center gap-2 mt-1">
                {wh.events.map((ev) => (
                  <span
                    key={ev}
                    className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px]"
                  >
                    {ev}
                  </span>
                ))}
              </div>
              <span className="text-slate-500 text-[10px] mt-1 block">Secret: {wh.secret}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTestPing(wh.url)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Test Ping</span>
              </button>
              <button
                onClick={() => addToast('info', 'Deleted', 'Webhook removed')}
                className="p-1.5 text-slate-400 hover:text-rose-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
