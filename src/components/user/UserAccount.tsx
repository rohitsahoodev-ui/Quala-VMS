import React, { useState } from 'react';
import { UserCircle, Shield, Key, Lock, CheckCircle2, QrCode } from 'lucide-react';
import { User } from '../../types';
import { useToast } from '../common/Toast';

interface UserAccountProps {
  currentUser: User | null;
}

export const UserAccount: React.FC<UserAccountProps> = ({ currentUser }) => {
  const { addToast } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(currentUser?.twoFactorEnabled || false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [totpCode, setTotpCode] = useState('');

  const handleToggle2FA = () => {
    if (twoFactorEnabled) {
      setTwoFactorEnabled(false);
      addToast('info', '2FA Disabled', 'Two-factor authentication has been disabled.');
    } else {
      setShow2FAModal(true);
    }
  };

  const handleConfirm2FA = () => {
    if (totpCode.length === 6) {
      setTwoFactorEnabled(true);
      setShow2FAModal(false);
      setTotpCode('');
      addToast('success', '2FA Enabled', 'Your account is now protected with TOTP Two-Factor Authentication.');
    } else {
      addToast('error', 'Invalid code', 'Please enter a 6-digit TOTP verification code.');
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white font-sans">Account & Security</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your personal credentials, SSH keys, and authentication methods.
        </p>
      </div>

      {/* User Information */}
      <div className="glass-panel rounded-2xl border border-purple-500/20 p-6 bg-[#0a0a16]">
        <h2 className="text-sm font-semibold text-white mb-4">Profile Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 block mb-1">Full Name</span>
            <input
              type="text"
              disabled
              value={currentUser?.name || 'Alexander Chen'}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
            />
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Email Address</span>
            <input
              type="text"
              disabled
              value={currentUser?.email || 'alex@example.com'}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
            />
          </div>
        </div>
      </div>

      {/* Security & 2FA */}
      <div className="glass-panel rounded-2xl border border-purple-500/20 p-6 bg-[#0a0a16]">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-400" /> Two-Factor Authentication (TOTP)
        </h2>
        <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-purple-500/20">
          <div>
            <span className="text-xs font-semibold text-white block">Authenticator App</span>
            <span className="text-[11px] text-slate-400">
              Use Google Authenticator, Authy, or 1Password to generate one-time codes
            </span>
          </div>
          <button
            onClick={handleToggle2FA}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              twoFactorEnabled
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/40'
                : 'bg-purple-600 text-white hover:bg-purple-500 shadow-md shadow-purple-900/30'
            }`}
          >
            {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-2xl border border-purple-500/30 bg-[#0c0c1c] p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-purple-400" /> Enable Two-Factor Authentication
            </h3>
            <p className="text-xs text-slate-300 mt-2">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):
            </p>

            {/* Stylized QR Code placeholder */}
            <div className="my-4 p-4 rounded-xl bg-white text-black flex flex-col items-center justify-center w-48 h-48 mx-auto shadow-inner">
              <div className="w-40 h-40 border-4 border-black p-2 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-8 h-8 bg-black" />
                  <div className="w-8 h-8 bg-black" />
                </div>
                <div className="text-[8px] font-mono text-center font-bold tracking-widest uppercase">
                  QUALA VMS TOTP
                </div>
                <div className="flex justify-between">
                  <div className="w-8 h-8 bg-black" />
                  <div className="w-4 h-4 bg-black" />
                </div>
              </div>
            </div>

            <p className="text-center font-mono text-xs text-purple-300 mb-3">
              Secret Key: <span className="font-bold select-all">JBSWY3DPEHPK3PXP</span>
            </p>

            <div className="space-y-2">
              <label className="block text-xs text-slate-300">Enter 6-digit TOTP code:</label>
              <input
                type="text"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-widest text-lg px-3 py-2 rounded-xl bg-black/60 border border-purple-500/30 text-white font-mono focus:outline-none focus:border-purple-500"
                autoFocus
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShow2FAModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm2FA}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40"
              >
                Verify & Activate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
