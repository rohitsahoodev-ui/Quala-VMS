import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Server,
  Users,
  PlusCircle,
  Terminal,
  Settings,
  FileText,
  Camera,
  Layers,
  Cpu,
  CornerDownLeft,
  X
} from 'lucide-react';
import { VM, User } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  vms?: VM[];
  users?: User[];
  onNavigate: (route: string) => void;
  onOpenCreateModal?: () => void;
  onOpenDeploy?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  vms = [],
  users = [],
  onNavigate,
  onOpenCreateModal,
  onOpenDeploy,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const quickActions = [
    {
      id: 'act-create-vm',
      title: 'Deploy New Virtual Machine',
      category: 'Actions',
      icon: PlusCircle,
      action: () => onNavigate('/create-server'),
    },
    {
      id: 'act-term',
      title: 'Launch Cloud Terminal (SSH)',
      category: 'Actions',
      icon: Terminal,
      action: () => onNavigate('/server/vm-1042/console'),
    },
    {
      id: 'act-settings',
      title: 'System Settings & Hypervisor Config',
      category: 'Navigation',
      icon: Settings,
      action: () => onNavigate('/admin/settings'),
    },
    {
      id: 'act-audit',
      title: 'View Security Audit Logs',
      category: 'Navigation',
      icon: FileText,
      action: () => onNavigate('/admin/audit'),
    },
    {
      id: 'act-snapshot',
      title: 'Manage VM Snapshots',
      category: 'Actions',
      icon: Camera,
      action: () => onNavigate('/snapshots'),
    },
    {
      id: 'act-nodes',
      title: 'KVM Compute Nodes & Health',
      category: 'Navigation',
      icon: Cpu,
      action: () => onNavigate('/admin/nodes'),
    }
  ];

  const filteredVMs = vms.filter(
    (v) =>
      v.name.toLowerCase().includes(query.toLowerCase()) ||
      v._id.toLowerCase().includes(query.toLowerCase()) ||
      v.ipv4.includes(query)
  );

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.username.toLowerCase().includes(query.toLowerCase())
  );

  const filteredActions = quickActions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase())
  );

  const allItems = [
    ...filteredActions.map((a) => ({ ...a, type: 'action' })),
    ...filteredVMs.map((v) => ({
      id: v._id,
      title: `${v.name} (${v.ipv4})`,
      category: 'Virtual Machines',
      icon: Server,
      type: 'vm',
      action: () => onNavigate(`/server/${v._id}`),
    })),
    ...filteredUsers.map((u) => ({
      id: u._id,
      title: `${u.name} — ${u.email}`,
      category: 'Users',
      icon: Users,
      type: 'user',
      action: () => onNavigate('/admin/users'),
    })),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % (allItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl glass-panel border border-purple-500/30 bg-[#0c0c1c] shadow-2xl overflow-hidden">
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-purple-500/20 gap-3">
          <Search className="w-5 h-5 text-purple-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, VM name, IP address, or user..."
            className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none font-sans"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {allItems.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No matching commands or resources found for "{query}".
            </div>
          ) : (
            allItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.category}-${item.id}`}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-purple-600/25 text-white border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected ? 'bg-purple-500 text-white' : 'bg-white/5 text-purple-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/40 text-slate-400 border border-white/5">
                      {item.category}
                    </span>
                    {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-purple-400" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-black/40 border-t border-purple-500/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 rounded bg-white/5 text-slate-300">↑↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-white/5 text-slate-300">↵</kbd> to select
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-white/5 text-slate-300">esc</kbd> to close
            </span>
          </div>
          <span className="text-purple-400">Quala Command Palette</span>
        </div>
      </div>
    </div>
  );
};
