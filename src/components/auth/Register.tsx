import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { Logo } from '../common/Logo';
import { ApiService } from '../../services/api';
import { useToast } from '../common/Toast';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onNavigateLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onNavigateLogin }) => {
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ApiService.register({ name, username, email, password });
      addToast('success', 'Registration Complete', 'Your account has been created. Please log in.');
      onRegisterSuccess();
    } catch (err: any) {
      addToast('error', 'Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#080812] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel rounded-3xl border border-purple-500/20 bg-[#0a0a18]/90 p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center">
          <Logo size="lg" />
          <h1 className="text-xl font-bold text-white mt-4 font-sans">
            Create Customer Account
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Start deploying QEMU/KVM virtual machines in seconds with automated cloud-init.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Jenkins"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/50 border border-purple-500/25 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="sjenkins"
              className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-purple-500/25 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/50 border border-purple-500/25 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/50 border border-purple-500/25 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold font-sans shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Registering...</span>
            ) : (
              <>
                <span>Create Quala Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <button
            onClick={onNavigateLogin}
            className="text-purple-400 font-semibold hover:text-purple-300 ml-1"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};
