import {
  User,
  VM,
  Node,
  VMSnapshot,
  VMBackup,
  APIKey,
  Webhook,
  AuditLog,
  Plan,
  StoragePool,
  ISOLibraryItem,
  OSTemplate,
  FirewallRule,
  Invoice,
  Coupon,
  VMFile
} from '../types';

const API_BASE = '/api';

export class ApiService {
  private static token: string | null = localStorage.getItem('quala_token') || 'admin-token';
  private static activeUserId: string = localStorage.getItem('quala_user_id') || 'usr-admin-01';

  public static setAuth(token: string, userId: string) {
    this.token = token;
    this.activeUserId = userId;
    localStorage.setItem('quala_token', token);
    localStorage.setItem('quala_user_id', userId);
  }

  public static clearAuth() {
    this.token = null;
    this.activeUserId = '';
    localStorage.removeItem('quala_token');
    localStorage.removeItem('quala_user_id');
  }

  public static getActiveUserId() {
    return this.activeUserId;
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    if (this.activeUserId) {
      headers['x-quala-user-id'] = this.activeUserId;
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      return await res.json();
    } catch (err: any) {
      console.warn(`[API] Network error at ${endpoint}:`, err.message);
      throw err;
    }
  }

  // Auth
  public static async login(username: string, password: string, totpCode?: string): Promise<{ user: User; token: string; requires2FA?: boolean }> {
    const data = await this.request<{ user: User; token: string; requires2FA?: boolean }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, totpCode })
    });
    this.setAuth(data.token, data.user._id);
    return data;
  }

  public static async register(payload: { name: string; email: string; username: string; password: string }): Promise<{ user: User; token: string }> {
    const data = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.setAuth(data.token, data.user._id);
    return data;
  }

  public static async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' }).catch(() => {});
    this.clearAuth();
  }

  public static async getCurrentUser(): Promise<User> {
    const data = await this.request<{ user: User }>('/auth/me');
    return data.user;
  }

  // VMs
  public static async getVMs(owner?: string): Promise<VM[]> {
    const query = owner ? `?owner=${encodeURIComponent(owner)}` : '';
    const data = await this.request<{ vms: VM[] }>(`/vms${query}`);
    return data.vms;
  }

  public static async getVM(id: string): Promise<VM> {
    const data = await this.request<{ vm: VM }>(`/vms/${id}`);
    return data.vm;
  }

  public static async createVM(vmData: Partial<VM>): Promise<{ vm: VM; message: string }> {
    return await this.request<{ vm: VM; message: string }>('/vms', {
      method: 'POST',
      body: JSON.stringify(vmData)
    });
  }

  public static async executeVMAction(id: string, action: 'start' | 'stop' | 'restart' | 'shutdown' | 'force-stop'): Promise<{ vm: VM; message: string }> {
    return await this.request<{ vm: VM; message: string }>(`/vms/${id}/${action}`, {
      method: 'POST'
    });
  }

  public static async deleteVM(id: string): Promise<{ message: string }> {
    return await this.request<{ message: string }>(`/vms/${id}`, {
      method: 'DELETE'
    });
  }

  public static async getVMStats(id: string): Promise<{ current: VM; history: any[] }> {
    return await this.request<{ current: VM; history: any[] }>(`/vms/${id}/stats`);
  }

  public static async getVMLogs(id: string): Promise<string[]> {
    const data = await this.request<{ logs: string[] }>(`/vms/${id}/logs`);
    return data.logs;
  }

  // Files
  public static async getVMFiles(vmId: string): Promise<VMFile[]> {
    const data = await this.request<{ files: VMFile[] }>(`/vms/${vmId}/files`);
    return data.files;
  }

  public static async createVMFile(vmId: string, file: Partial<VMFile>): Promise<VMFile> {
    const data = await this.request<{ file: VMFile }>(`/vms/${vmId}/files`, {
      method: 'POST',
      body: JSON.stringify(file)
    });
    return data.file;
  }

  public static async updateVMFile(vmId: string, path: string, content: string): Promise<VMFile> {
    const data = await this.request<{ file: VMFile }>(`/vms/${vmId}/files`, {
      method: 'PUT',
      body: JSON.stringify({ path, content })
    });
    return data.file;
  }

  public static async deleteVMFile(vmId: string, path: string): Promise<void> {
    await this.request(`/vms/${vmId}/files?path=${encodeURIComponent(path)}`, {
      method: 'DELETE'
    });
  }

  // Snapshots
  public static async getSnapshots(vmId: string): Promise<VMSnapshot[]> {
    const data = await this.request<{ snapshots: VMSnapshot[] }>(`/vms/${vmId}/snapshots`);
    return data.snapshots;
  }

  public static async createSnapshot(vmId: string, name: string, description?: string): Promise<VMSnapshot> {
    const data = await this.request<{ snapshot: VMSnapshot }>(`/vms/${vmId}/snapshots`, {
      method: 'POST',
      body: JSON.stringify({ name, description })
    });
    return data.snapshot;
  }

  public static async deleteSnapshot(vmId: string, snapshotId: string): Promise<void> {
    await this.request(`/vms/${vmId}/snapshots/${snapshotId}`, {
      method: 'DELETE'
    });
  }

  // Backups
  public static async getBackups(vmId: string): Promise<VMBackup[]> {
    const data = await this.request<{ backups: VMBackup[] }>(`/vms/${vmId}/backups`);
    return data.backups;
  }

  public static async createBackup(vmId: string, name: string, schedule?: string, retentionDays?: number): Promise<VMBackup> {
    const data = await this.request<{ backup: VMBackup }>(`/vms/${vmId}/backups`, {
      method: 'POST',
      body: JSON.stringify({ name, schedule, retentionDays })
    });
    return data.backup;
  }

  // Firewall
  public static async getFirewallRules(vmId: string): Promise<FirewallRule[]> {
    const data = await this.request<{ rules: FirewallRule[] }>(`/vms/${vmId}/firewall`);
    return data.rules;
  }

  public static async createFirewallRule(vmId: string, rule: Partial<FirewallRule>): Promise<FirewallRule> {
    const data = await this.request<{ rule: FirewallRule }>(`/vms/${vmId}/firewall`, {
      method: 'POST',
      body: JSON.stringify(rule)
    });
    return data.rule;
  }

  public static async deleteFirewallRule(vmId: string, ruleId: string): Promise<void> {
    await this.request(`/vms/${vmId}/firewall/${ruleId}`, {
      method: 'DELETE'
    });
  }

  // Admin Resources
  public static async getAdminUsers(): Promise<User[]> {
    const data = await this.request<{ users: User[] }>('/admin/users');
    return data.users;
  }

  public static async createAdminUser(user: Partial<User>): Promise<User> {
    const data = await this.request<{ user: User }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(user)
    });
    return data.user;
  }

  public static async updateAdminUser(id: string, user: Partial<User>): Promise<User> {
    const data = await this.request<{ user: User }>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user)
    });
    return data.user;
  }

  public static async deleteAdminUser(id: string): Promise<void> {
    await this.request(`/admin/users/${id}`, { method: 'DELETE' });
  }

  public static async getAdminNodes(): Promise<Node[]> {
    const data = await this.request<{ nodes: Node[] }>('/admin/nodes');
    return data.nodes;
  }

  public static async createAdminNode(node: Partial<Node>): Promise<Node> {
    const data = await this.request<{ node: Node }>('/admin/nodes', {
      method: 'POST',
      body: JSON.stringify(node)
    });
    return data.node;
  }

  public static async getAdminStorage(): Promise<StoragePool[]> {
    const data = await this.request<{ storagePools: StoragePool[] }>('/admin/storage');
    return data.storagePools;
  }

  public static async createAdminStorage(pool: Partial<StoragePool>): Promise<StoragePool> {
    const data = await this.request<{ storagePool: StoragePool }>('/admin/storage', {
      method: 'POST',
      body: JSON.stringify(pool)
    });
    return data.storagePool;
  }

  public static async getAuditLogs(): Promise<AuditLog[]> {
    const data = await this.request<{ auditLogs: AuditLog[] }>('/admin/audit-logs');
    return data.auditLogs;
  }

  public static async getISOs(): Promise<ISOLibraryItem[]> {
    const data = await this.request<{ isos: ISOLibraryItem[] }>('/admin/isos');
    return data.isos;
  }

  public static async createISO(iso: Partial<ISOLibraryItem>): Promise<ISOLibraryItem> {
    const data = await this.request<{ iso: ISOLibraryItem }>('/admin/isos', {
      method: 'POST',
      body: JSON.stringify(iso)
    });
    return data.iso;
  }

  public static async deleteISO(id: string): Promise<void> {
    await this.request(`/admin/isos/${id}`, { method: 'DELETE' });
  }

  public static async getTemplates(): Promise<OSTemplate[]> {
    const data = await this.request<{ templates: OSTemplate[] }>('/admin/templates');
    return data.templates;
  }

  public static async getPlans(): Promise<Plan[]> {
    const data = await this.request<{ plans: Plan[] }>('/admin/plans');
    return data.plans;
  }

  public static async createPlan(plan: Partial<Plan>): Promise<Plan> {
    const data = await this.request<{ plan: Plan }>('/admin/plans', {
      method: 'POST',
      body: JSON.stringify(plan)
    });
    return data.plan;
  }

  public static async deletePlan(id: string): Promise<void> {
    await this.request(`/admin/plans/${id}`, { method: 'DELETE' });
  }

  public static async getInvoices(): Promise<Invoice[]> {
    const data = await this.request<{ invoices: Invoice[] }>('/admin/invoices');
    return data.invoices;
  }

  public static async getCoupons(): Promise<Coupon[]> {
    const data = await this.request<{ coupons: Coupon[] }>('/admin/coupons');
    return data.coupons;
  }

  public static async createCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
    const data = await this.request<{ coupon: Coupon }>('/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(coupon)
    });
    return data.coupon;
  }

  public static async getSettings(): Promise<any> {
    const data = await this.request<{ settings: any }>('/admin/settings');
    return data.settings;
  }

  public static async saveSettings(settings: any): Promise<any> {
    const data = await this.request<{ settings: any }>('/admin/settings', {
      method: 'POST',
      body: JSON.stringify(settings)
    });
    return data.settings;
  }

  // Keys & Webhooks
  public static async getApiKeys(): Promise<APIKey[]> {
    const data = await this.request<{ keys: APIKey[] }>('/user/keys');
    return data.keys;
  }

  public static async createApiKey(name: string, scopes: string[]): Promise<{ key: APIKey; rawToken: string }> {
    return await this.request<{ key: APIKey; rawToken: string }>('/user/keys', {
      method: 'POST',
      body: JSON.stringify({ name, scopes })
    });
  }

  public static async revokeApiKey(id: string): Promise<void> {
    await this.request(`/user/keys/${id}`, { method: 'DELETE' });
  }

  public static async getWebhooks(): Promise<Webhook[]> {
    const data = await this.request<{ webhooks: Webhook[] }>('/user/webhooks');
    return data.webhooks;
  }

  public static async createWebhook(payload: Partial<Webhook>): Promise<Webhook> {
    const data = await this.request<{ webhook: Webhook }>('/user/webhooks', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return data.webhook;
  }

  public static async pingWebhook(id: string): Promise<{ success: boolean; status: number; message: string }> {
    return await this.request<{ success: boolean; status: number; message: string }>(`/user/webhooks/${id}/ping`, {
      method: 'POST'
    });
  }
}
