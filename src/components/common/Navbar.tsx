import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Palette,
  Globe,
  User,
  Shield,
  LogOut,
  ChevronDown,
  Terminal,
  Server,
  Layers,
  Sparkles,
  Check,
  Cpu
} from 'lucide-react';
import { User as UserType } from '../../types';
import { Logo } from './Logo';
import { LANGUAGES, SupportedLanguage } from '../../services/i18n';

interface NavbarProps {
  currentUser: UserType | null;
  role?: 'admin' | 'user';
  onOpenCommandPalette: () => void;
  onOpenDeploy?: () => void;
  currentTheme?: string;
  onSelectTheme?: (theme: string) => void;
  language?: SupportedLanguage;
  currentLang?: SupportedLanguage;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  onSelectLang?: (lang: SupportedLanguage) => void;
  onSwitchRole?: (role: 'Super Admin' | 'Admin' | 'User') => void;
  onLogout: () => void;
  onNavigate: (route: string) => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  role,
  onOpenCommandPalette,
  onOpenDeploy,
  currentTheme = 'purple',
  onSelectTheme = () => {},
  language = 'en',
  currentLang = language,
  onLanguageChange,
  onSelectLang = onLanguageChange || (() => {}),
  onSwitchRole = () => {},
  onLogout,
  onNavigate,
  onToggleSidebar,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const themes = [
    { id: 'theme-purple', name: 'Quala Purple', color: '#8b5cf6' },
    { id: 'theme-midnight', name: 'Midnight', color: '#3b82f6' },
    { id: 'theme-amoled', name: 'AMOLED', color: '#a855f7' },
    { id: 'theme-arctic', name: 'Arctic', color: '#06b6d4' },
    { id: 'theme-dracula', name: 'Dracula', color: '#ff79c6' },
  ];

  const notifications = [
    {
      id: '1',
      title: 'VM Started Successfully',
      msg: 'Production Web Node 01 (vm-1042) booted in 3.3s',
      time: '15m ago',
      type: 'success',
    },
    {
      id: '2',
      title: 'Daily Backup Completed',
      msg: 'auto-daily-20260916 saved to NFS storage pool',
      time: '2h ago',
      type: 'info',
    },
    {
      id: '3',
      title: 'High CPU Alert Resolved',
      msg: 'CI/CD Runner Build Agent load returned to normal (38%)',
      time: '4h ago',
      type: 'warning',
    }
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 w-full glass-panel border-b border-purple-500/15 bg-[#080812]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Menu Toggle & Logo */}
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            aria-label="Toggle menu"
          >
            <Layers className="w-5 h-5" />
          </button>
        )}
        <div className="cursor-pointer" onClick={() => onNavigate(currentUser?.role?.includes('Admin') ? '/admin' : '/dashboard')}>
          <Logo />
        </div>

        {/* DEMO MODE INDICATOR (Rule 41 requirement: Clearly show a small DEMO MODE indicator) */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[11px] font-mono font-semibold text-purple-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>DEMO MODE</span>
        </div>
      </div>

      {/* Middle: Search & Quick Command trigger */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border border-purple-500/20 text-slate-400 text-sm transition-all group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
            <span className="text-xs text-slate-400">Search VMs, users, logs...</span>
          </div>
          <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/40 border border-purple-500/20 text-[10px] font-mono text-purple-300">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Launch Terminal button */}
        <button
          onClick={() => onNavigate('/server/vm-1042/console')}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 transition-colors relative"
          title="Open Cloud Console (xterm.js)"
        >
          <Terminal className="w-4 h-4 text-purple-400" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-[#080812]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel border border-purple-500/30 shadow-2xl bg-[#0c0c1c] p-4 animate-in fade-in zoom-in-95 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  Realtime Events
                </span>
                <span className="text-[10px] text-purple-400 font-mono">3 New</span>
              </div>
              <div className="divide-y divide-white/5 max-h-64 overflow-y-auto mt-2">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 flex items-start gap-3">
                    <span className="w-2 h-2 mt-1.5 rounded-full bg-purple-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-200">{n.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{n.msg}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Picker */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 transition-colors"
            title="Select Theme"
          >
            <Palette className="w-4 h-4 text-purple-400" />
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl glass-panel border border-purple-500/30 shadow-2xl bg-[#0c0c1c] p-2 animate-in fade-in zoom-in-95 z-50">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Theme Presets
              </div>
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTheme(t.id);
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
                    currentTheme === t.id
                      ? 'bg-purple-500/20 text-white font-medium'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: t.color }}
                    />
                    <span>{t.name}</span>
                  </div>
                  {currentTheme === t.id && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Language Selector */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 transition-colors"
            title="Language"
          >
            <Globe className="w-4 h-4" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-44 rounded-2xl glass-panel border border-purple-500/30 shadow-2xl bg-[#0c0c1c] p-2 animate-in fade-in zoom-in-95 z-50">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Language
              </div>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onSelectLang(lang.code);
                    setShowLangMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                    currentLang === lang.code
                      ? 'bg-purple-500/20 text-white font-medium'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>{lang.nativeName}</span>
                  {currentLang === lang.code && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 pl-2 rounded-xl border border-purple-500/20 bg-slate-900/50 hover:border-purple-500/40 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-purple-600/30 flex items-center justify-center text-xs font-semibold text-purple-200">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser?.name?.charAt(0) || 'U'}</span>
              )}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-medium text-white leading-none">
                {currentUser?.name || 'Alexander Chen'}
              </span>
              <span className="text-[10px] text-purple-400 font-mono mt-0.5">
                {currentUser?.role || 'User'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel border border-purple-500/30 shadow-2xl bg-[#0c0c1c] p-3 animate-in fade-in zoom-in-95 z-50">
              <div className="pb-3 border-b border-white/5 px-2">
                <p className="text-xs font-semibold text-white">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-400 font-mono truncate">{currentUser?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-[10px] font-medium text-purple-300">
                  {currentUser?.role}
                </span>
              </div>

              {/* Role Switcher for seamless previewing between Admin & User interfaces */}
              <div className="py-2 border-b border-white/5">
                <p className="text-[10px] text-slate-400 px-2 uppercase tracking-wider font-semibold mb-1">
                  Switch Interface / Role
                </p>
                <button
                  onClick={() => {
                    onSwitchRole('Super Admin');
                    setShowUserMenu(false);
                    onNavigate('/admin');
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                    currentUser?.role?.includes('Admin')
                      ? 'bg-purple-500/20 text-purple-200 font-medium'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    <span>Admin Panel (/admin)</span>
                  </div>
                  {currentUser?.role?.includes('Admin') && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </button>

                <button
                  onClick={() => {
                    onSwitchRole('User');
                    setShowUserMenu(false);
                    onNavigate('/dashboard');
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                    currentUser?.role === 'User'
                      ? 'bg-purple-500/20 text-purple-200 font-medium'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-purple-400" />
                    <span>Customer Panel (/dashboard)</span>
                  </div>
                  {currentUser?.role === 'User' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onNavigate('/account');
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/5 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Account & 2FA Settings</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
