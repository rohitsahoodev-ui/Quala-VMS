import React, { useState } from 'react';
import { Lock, Mail, Key, Shield, ArrowRight, Sparkles, UserCheck } from 'lucide-react';
import { Logo } from '../common/Logo';
import { ApiService } from '../../services/api';
import { User } from '../../types';
import { useToast } from '../common/Toast';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onNavigateRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateRegister }) => {
  const { addToast } = useToast();
  const [email, setEmail] = useState('admin@qualavms.io');
  const [password, setPassword] = useState('admin123');
  const [totpCode, setTotpCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await ApiService.login(email, password, totpCode);
      if (res.requires2FA && !totpCode) {
        setRequires2FA(true);
        addToast('info', '2FA Required', 'Enter your 6-digit TOTP code to proceed.');
        setLoading(false);
        return;
      }
      addToast('success', 'Authenticated', `Welcome back, ${res.user.name}`);
      onLoginSuccess(res.user);
    } catch (err: any) {
      addToast('error', 'Login Failed', err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      setEmail('admin@qualavms.io');
      setPassword('admin123');
      setRequires2FA(false);
      setTimeout(() => {
        ApiService.login('admin@qualavms.io', 'admin123').then((res) => {
          onLoginSuccess(res.user);
        });
      }, 100);
    } else {
      setEmail('alex@example.com');
      setPassword('user123');
      setRequires2FA(false);
      setTimeout(() => {
        ApiService.login('alex@example.com', 'user123').then((res) => {
          onLoginSuccess(res.user);
        });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#080812] relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel rounded-3xl border border-purple-500/20 bg-[#0a0a18]/90 p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center">
          <Logo size="lg" />
          <h1 className="text-xl font-bold text-white mt-4 font-sans">
            Virtualization Cloud Access
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Sign in to manage your high-performance QEMU/KVM virtual machine fleet.
          </p>
        </div>

        {/* Quick Demo Switchers */}
        <div className="mt-6 p-3 rounded-2xl bg-purple-950/20 border border-purple-500/20">
          <span className="text-[10px] font-mono uppercase text-purple-300 font-semibold block text-center mb-2">
            Quick One-Click Demo Role Switcher
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="py-1.5 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 text-white text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin Panel</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('user')}
              className="py-1.5 px-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-white text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>User Panel</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@qualavms.io"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/50 border border-purple-500/25 text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">Master Password</label>
              <a href="#" className="text-[11px] text-purple-400 hover:text-purple-300">
                Forgot?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/50 border border-purple-500/25 text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {requires2FA && (
            <div className="p-3 rounded-xl bg-purple-900/20 border border-purple-500/30">
              <label className="block text-xs font-medium text-purple-200 mb-1">
                Authenticator TOTP (2FA Code)
              </label>
              <input
                type="text"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                placeholder="000000"
                className="w-full text-center tracking-widest text-base py-2 rounded-xl bg-black/60 border border-purple-500/40 text-white font-mono focus:outline-none focus:border-purple-400"
                autoFocus
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold font-sans shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Quala VMS</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <button
            onClick={onNavigateRegister}
            className="text-purple-400 font-semibold hover:text-purple-300 ml-1"
          >
            Register account
          </button>
        </div>
      </div>
    </div>
  );
};
