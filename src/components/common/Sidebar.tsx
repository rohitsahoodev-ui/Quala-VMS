import React from 'react';
import {
  LayoutDashboard,
  Users,
  Server,
  Cpu,
  HardDrive,
  Network,
  Disc,
  Layers,
  CreditCard,
  Ticket,
  Key,
  Webhook,
  FileText,
  Settings,
  RefreshCw,
  FolderOpen,
  Terminal,
  Camera,
  Archive,
  Activity,
  PlusCircle,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Radio
} from 'lucide-react';

interface NavItem {
  label: string;
  route: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
}

interface SidebarProps {
  isAdmin?: boolean;
  role?: 'admin' | 'user';
  currentRoute: string;
  onNavigate: (route: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isAdmin,
  role,
  currentRoute,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const isActualAdmin = role ? role === 'admin' : Boolean(isAdmin);
  // Admin sidebar items (Rule 6 requirements: Overview, Users, Virtual Machines, Nodes, Storage, Network, IP Addresses, ISO Library, OS Templates, Plans, Billing, Coupons, API Keys, Webhooks, Audit Logs, System Settings, Updates)
  const adminNav: NavItem[] = [
    { label: 'Overview', route: '/admin', icon: LayoutDashboard },
    { label: 'Users', route: '/admin/users', icon: Users, badge: '5' },
    { label: 'Virtual Machines', route: '/admin/vms', icon: Server, badge: '4' },
    { label: 'Nodes', route: '/admin/nodes', icon: Cpu },
    { label: 'Storage', route: '/admin/storage', icon: HardDrive },
    { label: 'Network', route: '/admin/network', icon: Network },
    { label: 'IP Addresses', route: '/admin/ips', icon: Radio },
    { label: 'ISO Library', route: '/admin/iso', icon: Disc },
    { label: 'OS Templates', route: '/admin/templates', icon: Layers },
    { label: 'Plans', route: '/admin/plans', icon: CreditCard },
    { label: 'Billing', route: '/admin/billing', icon: CreditCard },
    { label: 'Coupons', route: '/admin/coupons', icon: Ticket },
    { label: 'API Keys', route: '/admin/api-keys', icon: Key },
    { label: 'Webhooks', route: '/admin/webhooks', icon: Webhook },
    { label: 'Audit Logs', route: '/admin/audit', icon: FileText },
    { label: 'System Settings', route: '/admin/settings', icon: Settings },
    { label: 'Updates', route: '/admin/updates', icon: RefreshCw },
  ];

  // User sidebar items (Rule 11 requirements: Dashboard, My Servers, Create Server, Console, Files, Backups, Snapshots, Network, Activity, API, Account)
  const userNav: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: LayoutDashboard },
    { label: 'My Servers', route: '/servers', icon: Server, badge: '3' },
    { label: 'Create Server', route: '/create-server', icon: PlusCircle, highlight: true },
    { label: 'Console', route: '/server/vm-1042/console', icon: Terminal },
    { label: 'Files', route: '/server/vm-1042/files', icon: FolderOpen },
    { label: 'Backups', route: '/backups', icon: Archive },
    { label: 'Snapshots', route: '/snapshots', icon: Camera },
    { label: 'Network', route: '/network', icon: Network },
    { label: 'Activity', route: '/activity', icon: Activity },
    { label: 'API', route: '/api-keys', icon: Key },
    { label: 'Account', route: '/account', icon: UserCircle },
  ];

  const items = isActualAdmin ? adminNav : userNav;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#080812]/95 backdrop-blur-xl border-r border-purple-500/15">
      {/* Scope Header */}
      <div className="p-4 border-b border-purple-500/15 flex items-center justify-between">
        {!collapsed ? (
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-purple-400">
              {isAdmin ? 'ADMIN CONTROL PANEL' : 'CUSTOMER CONSOLE'}
            </span>
            <p className="text-xs text-slate-400 truncate">
              {isAdmin ? 'Hypervisor Cluster Manager' : 'Virtual Private Servers'}
            </p>
          </div>
        ) : (
          <span className="mx-auto text-xs font-mono font-bold text-purple-400">
            {isAdmin ? 'ADM' : 'VPS'}
          </span>
        )}

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.route;

          return (
            <button
              key={item.route}
              onClick={() => {
                onNavigate(item.route);
                if (onCloseMobile) onCloseMobile();
              }}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] font-semibold'
                  : item.highlight
                  ? 'text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              )}

              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive
                    ? 'text-purple-400'
                    : item.highlight
                    ? 'text-purple-400'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />

              {!collapsed && (
                <div className="flex items-center justify-between w-full">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Cluster / Node Status Footer */}
      {!collapsed && (
        <div className="p-3 m-2 rounded-xl glass-panel border border-purple-500/20 bg-purple-950/20">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-300 font-medium">QEMU/KVM Engine</span>
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              v9.0.2
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Nodes: 3 Online</span>
            <span>Uptime: 99.98%</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className={`fixed top-16 bottom-0 ${collapsed ? 'w-16' : 'w-64'}`}>
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-50 animate-in slide-in-from-left">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
