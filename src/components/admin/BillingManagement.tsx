import React from 'react';
import { DollarSign, CreditCard, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';

export const BillingManagement: React.FC = () => {
  const invoices = [
    { id: 'INV-2026-0091', user: 'Alex Chen', amount: '$40.00', status: 'paid', date: '2026-09-01' },
    { id: 'INV-2026-0092', user: 'Sarah Jenkins', amount: '$80.00', status: 'paid', date: '2026-09-01' },
    { id: 'INV-2026-0093', user: 'DevOps Ops Corp', amount: '$160.00', status: 'pending', date: '2026-09-05' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white font-sans">Billing & Invoices</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Tenant subscription recurring billing, Stripe/PayPal webhooks, and invoice receipts.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16]">
          <span className="text-xs font-mono text-slate-400">Monthly Recurring Revenue</span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">$4,280.00</span>
          <span className="text-[11px] text-emerald-400 font-mono mt-1 block">+14% vs last month</span>
        </div>
        <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16]">
          <span className="text-xs font-mono text-slate-400">Total Invoices Issued</span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">148</span>
          <span className="text-[11px] text-purple-300 font-mono mt-1 block">98.2% collection rate</span>
        </div>
        <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16]">
          <span className="text-xs font-mono text-slate-400">Payment Gateway</span>
          <span className="text-base font-bold text-white font-mono mt-1 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-purple-400" /> Stripe Connect
          </span>
          <span className="text-[11px] text-emerald-400 font-mono mt-1 block">Live & Ready</span>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16] shadow-xl">
        <h2 className="text-sm font-semibold text-white mb-4">Recent Invoices</h2>
        <div className="space-y-3">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs font-mono"
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="font-bold text-white block">{inv.id}</span>
                  <span className="text-slate-400 text-[11px]">{inv.user} • {inv.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-white text-sm">{inv.amount}</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                    inv.status === 'paid'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {inv.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
