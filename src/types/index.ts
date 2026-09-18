export type UserRole = 'Super Admin' | 'Admin' | 'User';

export interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  status: 'active' | 'suspended' | 'pending';
  vmCount?: number;
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export type VMStatus = 'running' | 'stopped' | 'restarting' | 'error' | 'creating' | 'suspended';

export interface VM {
  _id: string;
  name: string;
  hostname: string;
  owner: string; // user id or name
  ownerEmail?: string;
  node: string;
  nodeId?: string; // alias
  status: VMStatus;
  cpu: number; // vCPUs
  ram: number; // in GB
  disk: number; // in GB
  image: string; // OS name or ISO
  os?: string; // OS name
  osType: 'ubuntu' | 'debian' | 'fedora' | 'rocky' | 'almalinux' | 'windows' | 'custom';
  description?: string;
  ipv4: string;
  ipv6: string;
  mac: string;
  vncPort: number;
  sshPort: number;
  agentPort: number;
  qemuPid?: number;
  networkBridge: string;
  bootDevice: 'hd' | 'cdrom' | 'network';
  bootOrder?: string;
  cpuUsage: number; // current %
  ramUsage: number; // current %
  diskUsage: number; // current %
  bandwidthIn: number; // in MB
  bandwidthOut: number; // in MB
  networkIn?: number; // alias
  networkOut?: number; // alias
  uptime: number; // seconds
  createdAt: string;
  updatedAt: string;
}

export interface Node {
  _id: string;
  name: string;
  hostname: string;
  ip: string;
  status: 'online' | 'warning' | 'offline';
  cpu: {
    cores: number;
    usagePercent: number;
    model: string;
  };
  ram: {
    totalGB: number;
    usedGB: number;
  };
  storage: {
    totalTB: number;
    usedTB: number;
  };
  cpuUsage?: number;
  ramUsage?: number;
  diskUsage?: number;
  totalCpu?: number;
  totalRam?: number;
  totalDisk?: number;
  qemuVersion: string;
  kernelVersion: string;
  vmCount: number;
  location: string;
  createdAt: string;
}

export interface VMSnapshot {
  _id: string;
  vmId: string;
  vmName: string;
  name: string;
  description?: string;
  path: string;
  sizeMB: number;
  size?: number;
  status: 'ready' | 'creating' | 'restoring' | 'error';
  createdAt: string;
}

export interface VMBackup {
  _id: string;
  vmId: string;
  vmName: string;
  name: string;
  path: string;
  sizeGB: number;
  size?: number;
  status: 'completed' | 'in_progress' | 'failed';
  schedule: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';
  cronExpression?: string;
  retentionDays: number;
  createdAt: string;
}

export interface APIKey {
  _id: string;
  userId: string;
  userName: string;
  name: string;
  keyPrefix: string;
  keyHash?: string;
  fullKeyOnce?: string;
  scopes: ('vm.read' | 'vm.create' | 'vm.power' | 'vm.delete' | 'file.read' | 'file.write' | 'network.read')[];
  lastUsedAt?: string;
  lastUsed?: string;
  createdAt: string;
}

export interface Webhook {
  _id: string;
  userId: string;
  url: string;
  events: ('vm.created' | 'vm.started' | 'vm.stopped' | 'vm.deleted' | 'backup.created' | 'snapshot.created' | 'user.created' | 'invoice.created')[];
  secret: string;
  active: boolean;
  deliveryCount: number;
  lastDeliveryStatus?: number;
  lastDeliveryAt?: string;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  actor: string;
  actorEmail?: string;
  role?: string;
  action: string;
  target: string;
  targetId?: string;
  ip: string;
  metadata?: Record<string, any>;
  createdAt: string;
  timestamp?: string;
  details?: string;
}

export interface Plan {
  _id: string;
  name: string;
  tagline?: string;
  cpu: number;
  ram: number; // GB
  disk: number; // GB
  bandwidth: string | number;
  priceMonthly: number;
  popular?: boolean;
  status: 'active' | 'archived';
  features: string[];
}

export interface StoragePool {
  _id: string;
  name: string;
  type: any;
  path: string;
  totalGB: number;
  usedGB: number;
  freeGB: number;
  total?: number;
  used?: number;
  status: 'active' | 'degraded' | 'maintenance';
}

export interface ISOLibraryItem {
  _id: string;
  name: string;
  filename?: string;
  category: any;
  sizeGB?: number;
  size?: number;
  checksum: string;
  status?: 'ready' | 'downloading' | 'verified';
  downloadUrl?: string;
  uploadedAt?: string;
  createdAt?: string;
}

export interface OSTemplate {
  _id: string;
  name: string;
  version: string;
  family: 'Ubuntu' | 'Debian' | 'Fedora' | 'Rocky' | 'AlmaLinux' | 'Windows' | 'Other';
  architecture: 'x86_64' | 'aarch64';
  imageUrl?: string;
  checksum: string;
  sizeGB: number;
  cloudInit: boolean;
  isCloudInit?: boolean;
  minRamGB: number;
  minDiskGB: number;
  minDisk?: number;
  defaultUser?: string;
  distro?: string;
  imagePath?: string;
  icon: string;
}

export interface FirewallRule {
  _id: string;
  id?: string;
  vmId: string;
  direction: 'INBOUND' | 'OUTBOUND';
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'ALL';
  portRange: string;
  port?: string;
  source: string;
  action: 'ALLOW' | 'DROP';
  description?: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  period: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'paid' | 'unpaid' | 'overdue' | 'refunded';
  createdAt: string;
  dueDate: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  status: 'active' | 'expired';
  expiresAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface VMFile {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  modified: string;
  permissions: string;
  content?: string;
}
