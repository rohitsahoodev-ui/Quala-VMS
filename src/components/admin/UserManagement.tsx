import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Shield,
  Key,
  Trash2,
  Lock,
  UserCheck,
  UserX,
  ExternalLink,
  Edit2
} from 'lucide-react';
import { User } from '../../types';
import { ApiService } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { useToast } from '../common/Toast';

interface UserManagementProps {
  onImpersonate?: (user: User) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onImpersonate }) => {
  const { addToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [targetDelete, setTargetDelete] = useState<User | null>(null);

  // New user form
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    username: '',
    role: 'User' as const,
    password: '',
  });

  const fetchUsers = async () => {
    try {
      const data = await ApiService.getAdminUsers();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!newUserData.name || !newUserData.email || !newUserData.username) {
      addToast('warning', 'Missing Fields', 'Please fill in all required fields.');
      return;
    }
    try {
      await ApiService.createAdminUser({
        ...newUserData,
        status: 'active',
        vmCount: 0,
      });
      addToast('success', 'User Created', `${newUserData.name} added successfully.`);
      setShowCreateModal(false);
      setNewUserData({ name: '', email: '', username: '', role: 'User', password: '' });
      fetchUsers();
    } catch (err: any) {
      addToast('error', 'Creation Failed', err.message);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await ApiService.updateAdminUser(user._id, { status: nextStatus });
      addToast('success', 'User Updated', `Status changed to ${nextStatus}`);
      fetchUsers();
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!targetDelete) return;
    try {
      await ApiService.deleteAdminUser(targetDelete._id);
      addToast('success', 'User Deleted', targetDelete.name);
      setTargetDelete(null);
      fetchUsers();
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-sans">User Accounts & Roles</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage customer access, role-based permissions (RBAC), and 2FA status.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl border border-purple-500/20 p-4 bg-[#0a0a16] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or username..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-purple-500/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-black/50 border border-purple-500/20 text-white font-mono focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 bg-[#0a0a16] shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-purple-500/15 text-slate-400 font-mono">
              <th className="pb-3 pl-2">User / Identity</th>
              <th className="pb-3">Role</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">VMs</th>
              <th className="pb-3">2FA</th>
              <th className="pb-3">Last Login</th>
              <th className="pb-3 text-right pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                <td className="py-3 pl-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/30 text-purple-200 flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-semibold text-white block">{user.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 font-mono">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                      user.role === 'Super Admin'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : user.role === 'Admin'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                        : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="py-3">
                  <StatusBadge status={user.status} />
                </td>
                <td className="py-3 font-mono text-purple-300">{user.vmCount || 0}</td>
                <td className="py-3 font-mono">
                  {user.twoFactorEnabled ? (
                    <span className="text-emerald-400 font-semibold">Enabled</span>
                  ) : (
                    <span className="text-slate-500">Disabled</span>
                  )}
                </td>
                <td className="py-3 font-mono text-slate-400 text-[11px]">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                </td>
                <td className="py-3 text-right pr-2">
                  <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                    {onImpersonate && (
                      <button
                        onClick={() => onImpersonate(user)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-purple-500/10"
                        title="Impersonate User"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10"
                      title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                    >
                      {user.status === 'active' ? (
                        <UserX className="w-3.5 h-3.5" />
                      ) : (
                        <UserCheck className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setTargetDelete(user)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                      title="Delete User"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-2xl border border-purple-500/30 bg-[#0c0c1c] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-white">Create New User</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="Jane Doe"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="jane@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Username</label>
                <input
                  type="text"
                  value={newUserData.username}
                  onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                  placeholder="janedoe"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Role Assignment</label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-white focus:outline-none"
                >
                  <option value="User">User (Customer)</option>
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(targetDelete)}
        title={`Delete User "${targetDelete?.name}"?`}
        message={`Deleting this user will revoke their authentication tokens and access permissions.`}
        confirmLabel="Delete User"
        onConfirm={handleDeleteUser}
        onCancel={() => setTargetDelete(null)}
      />
    </div>
  );
};
