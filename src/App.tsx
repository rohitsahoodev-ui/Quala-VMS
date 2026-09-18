import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './components/common/Toast';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { CommandPalette } from './components/common/CommandPalette';
import { CreateVMWizard } from './components/user/CreateVMWizard';
import { ServerDetails } from './components/user/ServerDetails';
import { UserDashboard } from './components/user/UserDashboard';
import { MyServers } from './components/user/MyServers';
import { UserSnapshots } from './components/user/UserSnapshots';
import { UserBackups } from './components/user/UserBackups';
import { UserNetwork } from './components/user/UserNetwork';
import { UserActivity } from './components/user/UserActivity';
import { UserAPI } from './components/user/UserAPI';
import { UserAccount } from './components/user/UserAccount';

// Admin Components
import { AdminOverview } from './components/admin/AdminOverview';
import { VMManagement } from './components/admin/VMManagement';
import { UserManagement } from './components/admin/UserManagement';
import { NodeManagement } from './components/admin/NodeManagement';
import { StorageManagement } from './components/admin/StorageManagement';
import { NetworkManagement } from './components/admin/NetworkManagement';
import { ISOLibrary } from './components/admin/ISOLibrary';
import { OSTemplates } from './components/admin/OSTemplates';
import { PlansManagement } from './components/admin/PlansManagement';
import { BillingManagement } from './components/admin/BillingManagement';
import { WebhooksManagement } from './components/admin/WebhooksManagement';
import { AuditLogs } from './components/admin/AuditLogs';
import { SystemSettings } from './components/admin/SystemSettings';
import { SystemUpdates } from './components/admin/SystemUpdates';

// Auth Components
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';

import { ApiService } from './services/api';
import { getSocket } from './services/socket';
import { User } from './types';
import { SupportedLanguage } from './services/i18n';
import { Eye, LogOut } from 'lucide-react';

function AppContent() {
  const { addToast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoute, setCurrentRoute] = useState<string>('/dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [deployWizardOpen, setDeployWizardOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [theme, setTheme] = useState<string>('theme-purple');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const [originalAdmin, setOriginalAdmin] = useState<User | null>(null);

  useEffect(() => {
    // Initial user setup
    ApiService.getCurrentUser()
      .then((user) => setCurrentUser(user))
      .catch(() => {});

    // Sync path if window.location specifies something or defaults
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      setCurrentRoute(path);
    } else if (path === '/login' || path === '/register') {
      setCurrentRoute(path);
    } else if (path !== '/' && path !== '') {
      setCurrentRoute(path);
    }

    // Keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Determine role based on route and currentUser
  const isAdminRoute = currentRoute.startsWith('/admin');
  const role = isAdminRoute ? 'admin' : 'user';

  // Real-time backend updates via Socket.IO
  useEffect(() => {
    const socket = getSocket();
    const onVmStatus = (data: { vmId: string; status: string; action: string }) => {
      addToast('info', 'Virtual Machine Updated', `VM ${data.vmId} is now ${data.status} (${data.action})`);
    };
    const onVmCreated = (newVm: any) => {
      addToast('success', 'Virtual Machine Deployed', `${newVm.name || newVm._id} has been provisioned.`);
    };
    const onVmDeleted = (data: { vmId: string }) => {
      addToast('info', 'Server Decommissioned', `Instance ${data.vmId} removed.`);
    };
    const onAuditNew = (log: any) => {
      if (isAdminRoute) {
        addToast('info', 'Security Audit Event', `${log.action} on ${log.target} by ${log.actor}`);
      }
    };

    socket.on('vm:status', onVmStatus);
    socket.on('vm:created', onVmCreated);
    socket.on('vm:deleted', onVmDeleted);
    socket.on('audit:new', onAuditNew);

    return () => {
      socket.off('vm:status', onVmStatus);
      socket.off('vm:created', onVmCreated);
      socket.off('vm:deleted', onVmDeleted);
      socket.off('audit:new', onAuditNew);
    };
  }, [addToast, isAdminRoute]);

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
    window.history.pushState({}, '', route);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'Super Admin' || user.role === 'Admin') {
      handleNavigate('/admin');
    } else {
      handleNavigate('/dashboard');
    }
  };

  const handleLogout = async () => {
    await ApiService.logout();
    setCurrentUser(null);
    setImpersonatedUser(null);
    setOriginalAdmin(null);
    handleNavigate('/login');
    addToast('info', 'Logged Out', 'You have been signed out.');
  };

  const handleSwitchRole = (newRole: 'Super Admin' | 'Admin' | 'User') => {
    if (!currentUser) return;
    const updated = { ...currentUser, role: newRole };
    setCurrentUser(updated);
    if (newRole.includes('Admin')) {
      handleNavigate('/admin');
      addToast('info', 'Interface Switched', 'Switched to Admin Control Panel (/admin)');
    } else {
      handleNavigate('/dashboard');
      addToast('info', 'Interface Switched', 'Switched to Customer Panel (/dashboard)');
    }
  };

  const handleImpersonate = (targetUser: User) => {
    if (!currentUser) return;
    setOriginalAdmin(currentUser);
    setImpersonatedUser(targetUser);
    setCurrentUser(targetUser);
    handleNavigate('/dashboard');
    addToast('info', 'Impersonating User', `Viewing panel as ${targetUser.name}`);
  };

  const handleExitImpersonation = () => {
    if (originalAdmin) {
      setCurrentUser(originalAdmin);
      setImpersonatedUser(null);
      setOriginalAdmin(null);
      handleNavigate('/admin/users');
      addToast('success', 'Impersonation Ended', 'Returned to administrator session.');
    }
  };

  // Auth pages
  if (!currentUser) {
    if (currentRoute === '/register') {
      return (
        <Register
          onRegisterSuccess={() => handleNavigate('/login')}
          onNavigateLogin={() => handleNavigate('/login')}
        />
      );
    }
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onNavigateRegister={() => handleNavigate('/register')}
      />
    );
  }

  // Render main content based on route
  const renderView = () => {
    // Single Server Details Route (e.g., /server/vm-1042 or /server/vm-1042/console)
    if (currentRoute.startsWith('/server/')) {
      const parts = currentRoute.split('/');
      const vmId = parts[2];
      const initialTab = parts[3] || 'overview';
      return (
        <ServerDetails
          vmId={vmId}
          initialTab={initialTab}
          onBack={() => handleNavigate(isAdminRoute ? '/admin/vms' : '/servers')}
        />
      );
    }

    // Admin Routes
    if (isAdminRoute) {
      switch (currentRoute) {
        case '/admin':
          return <AdminOverview onNavigate={handleNavigate} />;
        case '/admin/vms':
          return (
            <VMManagement
              onNavigate={handleNavigate}
              onOpenDeploy={() => setDeployWizardOpen(true)}
            />
          );
        case '/admin/users':
          return <UserManagement onImpersonate={handleImpersonate} />;
        case '/admin/nodes':
          return <NodeManagement />;
        case '/admin/storage':
          return <StorageManagement />;
        case '/admin/network':
          return <NetworkManagement />;
        case '/admin/iso':
          return <ISOLibrary />;
        case '/admin/templates':
          return <OSTemplates />;
        case '/admin/plans':
          return <PlansManagement />;
        case '/admin/billing':
          return <BillingManagement />;
        case '/admin/api-keys':
          return <UserAPI />;
        case '/admin/webhooks':
          return <WebhooksManagement />;
        case '/admin/audit':
          return <AuditLogs />;
        case '/admin/settings':
          return <SystemSettings />;
        case '/admin/updates':
          return <SystemUpdates />;
        default:
          return <AdminOverview onNavigate={handleNavigate} />;
      }
    }

    // Customer/User Routes
    switch (currentRoute) {
      case '/dashboard':
        return (
          <UserDashboard
            onNavigate={handleNavigate}
            onOpenDeploy={() => setDeployWizardOpen(true)}
          />
        );
      case '/servers':
        return (
          <MyServers
            onNavigate={handleNavigate}
            onOpenDeploy={() => setDeployWizardOpen(true)}
          />
        );
      case '/snapshots':
        return <UserSnapshots />;
      case '/backups':
        return <UserBackups />;
      case '/network':
        return <UserNetwork />;
      case '/activity':
        return <UserActivity />;
      case '/api-keys':
        return <UserAPI />;
      case '/account':
        return <UserAccount currentUser={currentUser} />;
      default:
        return (
          <UserDashboard
            onNavigate={handleNavigate}
            onOpenDeploy={() => setDeployWizardOpen(true)}
          />
        );
    }
  };

  const themeStyles: Record<string, string> = {
    'theme-purple': 'bg-[#080812]',
    'theme-midnight': 'bg-[#030712]',
    'theme-amoled': 'bg-[#000000]',
    'theme-arctic': 'bg-[#050e17]',
    'theme-dracula': 'bg-[#0d0914]',
  };

  return (
    <div
      data-theme={theme}
      className={`min-h-screen ${themeStyles[theme] || 'bg-[#080812]'} text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white transition-colors duration-300`}
    >
      {/* Impersonation Alert Banner */}
      {impersonatedUser && (
        <div className="bg-amber-600/90 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-lg sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 animate-pulse" />
            <span>
              Impersonating Customer Account: <strong>{impersonatedUser.name}</strong> ({impersonatedUser.email})
            </span>
          </div>
          <button
            onClick={handleExitImpersonation}
            className="flex items-center gap-1 px-3 py-1 rounded bg-black/40 hover:bg-black/60 text-amber-200 hover:text-white transition-colors text-[11px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Impersonation</span>
          </button>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        currentUser={currentUser}
        role={role}
        currentTheme={theme}
        onSelectTheme={setTheme}
        language={language}
        currentLang={language}
        onLanguageChange={setLanguage}
        onSelectLang={setLanguage}
        onSwitchRole={handleSwitchRole}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenDeploy={() => setDeployWizardOpen(true)}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />

      {/* Body with Sidebar and Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentRoute={currentRoute}
          role={role}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onNavigate={handleNavigate}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="max-w-7xl mx-auto">{renderView()}</div>
        </main>
      </div>

      {/* Modals */}
      <CreateVMWizard
        isOpen={deployWizardOpen}
        onClose={() => setDeployWizardOpen(false)}
        onSuccess={() => {
          setDeployWizardOpen(false);
          handleNavigate(isAdminRoute ? '/admin/vms' : '/servers');
        }}
      />

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
        onOpenDeploy={() => {
          setCommandPaletteOpen(false);
          setDeployWizardOpen(true);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
