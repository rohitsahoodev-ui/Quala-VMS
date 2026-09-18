import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*' },
  path: '/socket.io',
});

const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';
const DEMO_MODE = process.env.DEMO_MODE !== 'false';

io.on('connection', (socket) => {
  socket.emit('system:info', { demoMode: DEMO_MODE, version: '1.0.0' });
});

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- IN-MEMORY DATABASE WITH FULL MONGOOSE-COMPATIBLE SCHEMAS ---
// This powers instant demo mode out of the box while maintaining strict schema integrity.

let users: any[] = [
  {
    _id: 'usr-admin-01',
    name: 'Rohit Verma',
    email: 'admin@qualavms.io',
    username: 'admin',
    passwordHash: '$2b$12$e9g0W.Qh.MOCK.HASH.QUALAVMS.2026',
    role: 'Super Admin',
    twoFactorEnabled: true,
    twoFactorSecret: 'JBSWY3DPEHPK3PXP',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    lastLogin: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    createdAt: '2025-01-10T08:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'usr-admin-02',
    name: 'Elena Rostova',
    email: 'elena@qualavms.io',
    username: 'elena',
    passwordHash: '$2b$12$e9g0W.Qh.MOCK.HASH.QUALAVMS.2026',
    role: 'Admin',
    twoFactorEnabled: false,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    lastLogin: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    createdAt: '2025-02-01T10:30:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'usr-cust-01',
    name: 'Alexander Chen',
    email: 'alex.chen@nexuslabs.dev',
    username: 'alexchen',
    passwordHash: '$2b$12$e9g0W.Qh.MOCK.HASH.QUALAVMS.2026',
    role: 'User',
    twoFactorEnabled: true,
    twoFactorSecret: 'NEXUSLABS2FASECRET',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    lastLogin: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    createdAt: '2025-03-01T14:15:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'usr-cust-02',
    name: 'Sarah Jenkins',
    email: 'sarah.j@cloudmatrix.io',
    username: 'sjenkins',
    passwordHash: '$2b$12$e9g0W.Qh.MOCK.HASH.QUALAVMS.2026',
    role: 'User',
    twoFactorEnabled: false,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: '2025-03-05T09:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'usr-cust-03',
    name: 'Marcus Vance',
    email: 'marcus@quantumforge.net',
    username: 'mvance',
    passwordHash: '$2b$12$e9g0W.Qh.MOCK.HASH.QUALAVMS.2026',
    role: 'User',
    twoFactorEnabled: false,
    status: 'suspended',
    lastLogin: '2025-03-10T12:00:00.000Z',
    createdAt: '2025-03-08T11:00:00.000Z',
    updatedAt: new Date().toISOString(),
  }
];

let vms = [
  {
    _id: 'vm-1042',
    name: 'Production Web Node 01',
    hostname: 'web-prod-01.quala.internal',
    owner: 'usr-cust-01',
    ownerEmail: 'alex.chen@nexuslabs.dev',
    node: 'node-us-east-01',
    status: 'running',
    cpu: 4,
    ram: 8,
    disk: 80,
    image: 'Ubuntu 24.04 LTS (Noble Numbat)',
    osType: 'ubuntu',
    ipv4: '198.51.100.42',
    ipv6: '2001:db8:85a3::8a2e:370:7334',
    mac: '52:54:00:1a:4b:2e',
    vncPort: 25901,
    sshPort: 25501,
    agentPort: 26001,
    qemuPid: 41829,
    networkBridge: 'br0',
    bootDevice: 'hd',
    cpuUsage: 28.4,
    ramUsage: 54.2,
    diskUsage: 41.8,
    bandwidthIn: 1420.5,
    bandwidthOut: 3890.2,
    uptime: 432190,
    createdAt: '2025-03-02T10:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'vm-1043',
    name: 'PostgreSQL Primary Cluster',
    hostname: 'db-master-01.quala.internal',
    owner: 'usr-cust-01',
    ownerEmail: 'alex.chen@nexuslabs.dev',
    node: 'node-us-east-01',
    status: 'running',
    cpu: 8,
    ram: 16,
    disk: 160,
    image: 'Debian 12 (Bookworm)',
    osType: 'debian',
    ipv4: '198.51.100.43',
    ipv6: '2001:db8:85a3::8a2e:370:7335',
    mac: '52:54:00:3c:9d:11',
    vncPort: 25902,
    sshPort: 25502,
    agentPort: 26002,
    qemuPid: 42104,
    networkBridge: 'br0',
    bootDevice: 'hd',
    cpuUsage: 44.1,
    ramUsage: 68.7,
    diskUsage: 58.2,
    bandwidthIn: 840.1,
    bandwidthOut: 912.4,
    uptime: 684200,
    createdAt: '2025-03-03T11:30:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'vm-1044',
    name: 'Redis Cache & PubSub',
    hostname: 'redis-cache-01.quala.internal',
    owner: 'usr-cust-01',
    ownerEmail: 'alex.chen@nexuslabs.dev',
    node: 'node-us-west-02',
    status: 'stopped',
    cpu: 2,
    ram: 4,
    disk: 40,
    image: 'Ubuntu 22.04 LTS (Jammy Jellyfish)',
    osType: 'ubuntu',
    ipv4: '198.51.100.44',
    ipv6: '2001:db8:85a3::8a2e:370:7336',
    mac: '52:54:00:7f:12:a4',
    vncPort: 25903,
    sshPort: 25503,
    agentPort: 26003,
    qemuPid: undefined,
    networkBridge: 'br0',
    bootDevice: 'hd',
    cpuUsage: 0,
    ramUsage: 0,
    diskUsage: 22.1,
    bandwidthIn: 0,
    bandwidthOut: 0,
    uptime: 0,
    createdAt: '2025-03-04T08:15:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'vm-1088',
    name: 'CI/CD Runner Build Agent',
    hostname: 'runner-01.quala.internal',
    owner: 'usr-cust-02',
    ownerEmail: 'sarah.j@cloudmatrix.io',
    node: 'node-eu-central-01',
    status: 'running',
    cpu: 6,
    ram: 12,
    disk: 120,
    image: 'Rocky Linux 9.4 (Blue Onyx)',
    osType: 'rocky',
    ipv4: '198.51.100.88',
    ipv6: '2001:db8:85a3::8a2e:370:7388',
    mac: '52:54:00:88:51:7c',
    vncPort: 25904,
    sshPort: 25504,
    agentPort: 26004,
    qemuPid: 44091,
    networkBridge: 'br0',
    bootDevice: 'hd',
    cpuUsage: 62.8,
    ramUsage: 71.3,
    diskUsage: 48.9,
    bandwidthIn: 2980.5,
    bandwidthOut: 1100.3,
    uptime: 194820,
    createdAt: '2025-03-06T15:20:00.000Z',
    updatedAt: new Date().toISOString(),
  }
];

let nodes = [
  {
    _id: 'node-us-east-01',
    name: 'KVM Node US-East 01',
    hostname: 'kvm-useast01.infra.quala.io',
    ip: '10.0.10.11',
    status: 'online',
    cpu: { cores: 64, usagePercent: 38.5, model: 'AMD EPYC 9654 64-Core Processor' },
    ram: { totalGB: 512, usedGB: 184 },
    storage: { totalTB: 16, usedTB: 6.4 },
    qemuVersion: 'QEMU 9.0.2 (Debian 1:9.0.2+ds-1)',
    kernelVersion: 'Linux 6.8.0-45-generic x86_64',
    vmCount: 14,
    location: 'Ashburn, VA, USA',
    createdAt: '2024-11-01T00:00:00.000Z',
  },
  {
    _id: 'node-us-west-02',
    name: 'KVM Node US-West 02',
    hostname: 'kvm-uswest02.infra.quala.io',
    ip: '10.0.20.12',
    status: 'online',
    cpu: { cores: 32, usagePercent: 24.1, model: 'Intel Xeon Platinum 8480+' },
    ram: { totalGB: 256, usedGB: 86 },
    storage: { totalTB: 8, usedTB: 2.9 },
    qemuVersion: 'QEMU 9.0.2 (Debian 1:9.0.2+ds-1)',
    kernelVersion: 'Linux 6.8.0-45-generic x86_64',
    vmCount: 8,
    location: 'Santa Clara, CA, USA',
    createdAt: '2024-12-05T00:00:00.000Z',
  },
  {
    _id: 'node-eu-central-01',
    name: 'KVM Node EU-Central 01',
    hostname: 'kvm-eucentral01.infra.quala.io',
    ip: '10.0.30.13',
    status: 'online',
    cpu: { cores: 64, usagePercent: 49.3, model: 'AMD EPYC 9554 64-Core Processor' },
    ram: { totalGB: 512, usedGB: 260 },
    storage: { totalTB: 16, usedTB: 9.1 },
    qemuVersion: 'QEMU 9.0.2 (Debian 1:9.0.2+ds-1)',
    kernelVersion: 'Linux 6.8.0-45-generic x86_64',
    vmCount: 21,
    location: 'Frankfurt, Germany',
    createdAt: '2025-01-15T00:00:00.000Z',
  }
];

let storagePools = [
  {
    _id: 'pool-nvme-fast',
    name: 'NVMe Fast Tier (Direct Attached)',
    type: 'Local Directory',
    path: '/var/lib/qualavms/storage/nvme-pool0',
    totalGB: 8192,
    usedGB: 3410,
    freeGB: 4782,
    status: 'active',
  },
  {
    _id: 'pool-lvm-thin',
    name: 'LVM Thin Provisioned Volume Group',
    type: 'LVM',
    path: '/dev/vg_quala_vms/thin_pool',
    totalGB: 16384,
    usedGB: 8940,
    freeGB: 7444,
    status: 'active',
  },
  {
    _id: 'pool-nfs-backups',
    name: 'NFS Cluster Backup Target',
    type: 'NFS',
    path: '10.0.0.50:/exports/qualavms/backups',
    totalGB: 32768,
    usedGB: 11200,
    freeGB: 21568,
    status: 'active',
  }
];

let isoLibrary = [
  {
    _id: 'iso-01',
    name: 'Ubuntu 24.04 LTS Live Server',
    filename: 'ubuntu-24.04-live-server-amd64.iso',
    category: 'Linux',
    sizeGB: 2.6,
    checksum: 'sha256:8762f114b00f0559a1f21e20f606e632a975f04d65a400b2ad01392044f3a91f',
    status: 'verified',
    uploadedAt: '2025-01-10T12:00:00.000Z',
  },
  {
    _id: 'iso-02',
    name: 'Debian 12.6.0 Netinst',
    filename: 'debian-12.6.0-amd64-netinst.iso',
    category: 'Linux',
    sizeGB: 0.63,
    checksum: 'sha256:550fbb4628f898a3ff6732f91b7d5320c9d7890bfa3f80c659114dbb1016ecff',
    status: 'verified',
    uploadedAt: '2025-01-12T14:20:00.000Z',
  },
  {
    _id: 'iso-03',
    name: 'SystemRescue 11.01',
    filename: 'systemrescue-11.01-amd64.iso',
    category: 'Rescue',
    sizeGB: 0.88,
    checksum: 'sha256:9182aa18bc0091ff782012431aaae887bcf912800128490a091024849182394a',
    status: 'verified',
    uploadedAt: '2025-02-05T09:10:00.000Z',
  },
  {
    _id: 'iso-04',
    name: 'Rocky Linux 9.4 Minimal',
    filename: 'Rocky-9.4-x86_64-minimal.iso',
    category: 'Linux',
    sizeGB: 1.8,
    checksum: 'sha256:1a84f479bb3d3170e1c0c3882bbd5e23c7b2a9e52516768393d25d625d97f28a',
    status: 'verified',
    uploadedAt: '2025-02-14T11:00:00.000Z',
  },
  {
    _id: 'iso-05',
    name: 'Windows Server 2022 Evaluation',
    filename: 'en-us_windows_server_2022_updated_feb_2024_x64_dvd.iso',
    category: 'Windows',
    sizeGB: 4.9,
    checksum: 'sha256:c18b28f990141b71239840134803582490812394012938491023948102938491',
    status: 'verified',
    uploadedAt: '2025-02-20T16:45:00.000Z',
  }
];

let osTemplates = [
  {
    _id: 'tmpl-ubuntu-24',
    name: 'Ubuntu 24.04 LTS',
    version: '24.04 (Noble Numbat)',
    family: 'Ubuntu',
    architecture: 'x86_64',
    imageUrl: 'https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img',
    checksum: 'sha256:9a32c2560e909a8f2191994b281f621f8a848b417c8052cf05d3cbcf6c6f67a2',
    sizeGB: 2.2,
    cloudInit: true,
    minRamGB: 1,
    minDiskGB: 20,
    icon: 'ubuntu',
  },
  {
    _id: 'tmpl-ubuntu-22',
    name: 'Ubuntu 22.04 LTS',
    version: '22.04.4 (Jammy Jellyfish)',
    family: 'Ubuntu',
    architecture: 'x86_64',
    imageUrl: 'https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img',
    checksum: 'sha256:94df223f03a67035414e21a22be1b3a53ca833b708d728565e6ebca8d4ec0913',
    sizeGB: 2.0,
    cloudInit: true,
    minRamGB: 1,
    minDiskGB: 20,
    icon: 'ubuntu',
  },
  {
    _id: 'tmpl-debian-12',
    name: 'Debian 12',
    version: '12.5 (Bookworm)',
    family: 'Debian',
    architecture: 'x86_64',
    imageUrl: 'https://cloud.debian.org/images/cloud/bookworm/latest/debian-12-generic-amd64.qcow2',
    checksum: 'sha256:6e2973167eb2e6224b74f885e33d0a21d5bb4d44007a82b3d8787fbc4bc22513',
    sizeGB: 1.6,
    cloudInit: true,
    minRamGB: 1,
    minDiskGB: 20,
    icon: 'debian',
  },
  {
    _id: 'tmpl-debian-13',
    name: 'Debian 13 (Testing)',
    version: '13 (Trixie)',
    family: 'Debian',
    architecture: 'x86_64',
    imageUrl: 'https://cloud.debian.org/images/cloud/trixie/daily/latest/debian-13-generic-amd64.qcow2',
    checksum: 'sha256:4b281f9a12cf05d3cbcf6c6f67a29a32c2560e909a8f2191994b281f621f8a84',
    sizeGB: 1.8,
    cloudInit: true,
    minRamGB: 2,
    minDiskGB: 25,
    icon: 'debian',
  },
  {
    _id: 'tmpl-rocky-9',
    name: 'Rocky Linux 9',
    version: '9.4 (Blue Onyx)',
    family: 'Rocky',
    architecture: 'x86_64',
    imageUrl: 'https://download.rockylinux.org/pub/rocky/9/images/x86_64/Rocky-9-GenericCloud-Base.latest.x86_64.qcow2',
    checksum: 'sha256:2f8490a091024849182394a9182aa18bc0091ff782012431aaae887bcf912800',
    sizeGB: 2.1,
    cloudInit: true,
    minRamGB: 2,
    minDiskGB: 30,
    icon: 'rocky',
  },
  {
    _id: 'tmpl-fedora-40',
    name: 'Fedora Cloud 40',
    version: '40.1.14',
    family: 'Fedora',
    architecture: 'x86_64',
    imageUrl: 'https://download.fedoraproject.org/pub/fedora/linux/releases/40/Cloud/x86_64/images/Fedora-Cloud-Base-Generic.x86_64-40-1.14.qcow2',
    checksum: 'sha256:a2938491023948102938491c18b28f990141b712398401348035824908123940',
    sizeGB: 1.9,
    cloudInit: true,
    minRamGB: 2,
    minDiskGB: 25,
    icon: 'fedora',
  }
];

let plans = [
  {
    _id: 'plan-starter',
    name: 'Starter',
    tagline: 'Ideal for small apps, microservices & testing',
    cpu: 1,
    ram: 2,
    disk: 30,
    bandwidth: '2 TB',
    priceMonthly: 6.00,
    status: 'active',
    features: ['1 vCPU Core', '2 GB ECC RAM', '30 GB NVMe Storage', '1 Dedicated IPv4 + /64 IPv6', 'Automated Weekly Backups', 'Basic DDoS Protection'],
  },
  {
    _id: 'plan-pro',
    name: 'Pro',
    tagline: 'Production workloads, APIs & relational databases',
    cpu: 2,
    ram: 4,
    disk: 60,
    bandwidth: '5 TB',
    priceMonthly: 14.00,
    popular: true,
    status: 'active',
    features: ['2 vCPU Cores', '4 GB ECC RAM', '60 GB NVMe Storage', '1 Dedicated IPv4 + /64 IPv6', 'Daily Backups & Snapshots', 'Advanced DDoS Protection', 'Priority CPU Scheduling'],
  },
  {
    _id: 'plan-ultra',
    name: 'Ultra',
    tagline: 'Heavy traffic web apps, analytics & distributed queues',
    cpu: 4,
    ram: 8,
    disk: 120,
    bandwidth: '10 TB',
    priceMonthly: 28.00,
    status: 'active',
    features: ['4 vCPU Cores', '8 GB ECC RAM', '120 GB NVMe Storage', '2 Dedicated IPv4 + /64 IPv6', 'Realtime Snapshot Rollback', 'High Availability Floating IP', '24/7 Priority Support'],
  },
  {
    _id: 'plan-enterprise',
    name: 'Enterprise',
    tagline: 'Dedicated performance, ML inferences & enterprise infra',
    cpu: 8,
    ram: 16,
    disk: 250,
    bandwidth: '20 TB',
    priceMonthly: 64.00,
    status: 'active',
    features: ['8 vCPU Cores (Dedicated)', '16 GB High-Speed ECC RAM', '250 GB Enterprise NVMe', '3 Dedicated IPv4 + /48 IPv6', 'Custom Kernel & ISO Support', 'BGP Anycast Routing', 'Dedicated Account Manager'],
  }
];

let snapshots = [
  {
    _id: 'snp-01',
    vmId: 'vm-1042',
    vmName: 'Production Web Node 01',
    name: 'pre-nginx-upgrade-v1.26',
    description: 'Snapshot before updating Nginx reverse proxy configuration and certbot renewal',
    path: '/var/lib/qualavms/snapshots/vm-1042-snp-01.qcow2',
    sizeMB: 1240,
    status: 'ready',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    _id: 'snp-02',
    vmId: 'vm-1042',
    vmName: 'Production Web Node 01',
    name: 'stable-gold-image',
    description: 'Clean baseline with hardened SSH and UFW firewall rules',
    path: '/var/lib/qualavms/snapshots/vm-1042-snp-02.qcow2',
    sizeMB: 860,
    status: 'ready',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    _id: 'snp-03',
    vmId: 'vm-1043',
    vmName: 'PostgreSQL Primary Cluster',
    name: 'pre-migration-pg16',
    description: 'Pre major database migration snapshot',
    path: '/var/lib/qualavms/snapshots/vm-1043-snp-01.qcow2',
    sizeMB: 3420,
    status: 'ready',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  }
];

let backups = [
  {
    _id: 'bkp-01',
    vmId: 'vm-1042',
    vmName: 'Production Web Node 01',
    name: 'auto-daily-20260916',
    path: '/exports/qualavms/backups/vm-1042/20260916-full.img.zst',
    sizeGB: 18.4,
    status: 'completed',
    schedule: 'daily',
    retentionDays: 14,
    createdAt: '2026-09-16T02:00:00.000Z',
  },
  {
    _id: 'bkp-02',
    vmId: 'vm-1042',
    vmName: 'Production Web Node 01',
    name: 'auto-weekly-20260910',
    path: '/exports/qualavms/backups/vm-1042/20260910-weekly.img.zst',
    sizeGB: 17.8,
    status: 'completed',
    schedule: 'weekly',
    retentionDays: 30,
    createdAt: '2026-09-10T02:00:00.000Z',
  }
];

let firewallRules = [
  {
    _id: 'fw-01',
    vmId: 'vm-1042',
    direction: 'INBOUND',
    protocol: 'TCP',
    portRange: '22',
    source: '0.0.0.0/0',
    action: 'ALLOW',
    description: 'SSH Management Interface',
  },
  {
    _id: 'fw-02',
    vmId: 'vm-1042',
    direction: 'INBOUND',
    protocol: 'TCP',
    portRange: '80,443',
    source: '0.0.0.0/0',
    action: 'ALLOW',
    description: 'HTTP & HTTPS Ingress Traffic',
  },
  {
    _id: 'fw-03',
    vmId: 'vm-1042',
    direction: 'INBOUND',
    protocol: 'TCP',
    portRange: '5432',
    source: '198.51.100.43/32',
    action: 'ALLOW',
    description: 'PostgreSQL internal network link',
  },
  {
    _id: 'fw-04',
    vmId: 'vm-1042',
    direction: 'INBOUND',
    protocol: 'ALL',
    portRange: '1-65535',
    source: '0.0.0.0/0',
    action: 'DROP',
    description: 'Default drop all unspecified inbound',
  }
];

let apiKeys: any[] = [
  {
    _id: 'key-01',
    userId: 'usr-cust-01',
    userName: 'Alexander Chen',
    name: 'Terraform Production Provider',
    keyPrefix: 'qvms_live_tf9821',
    scopes: ['vm.read', 'vm.create', 'vm.power', 'network.read'],
    lastUsedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    createdAt: '2025-02-10T14:00:00.000Z',
  },
  {
    _id: 'key-02',
    userId: 'usr-cust-01',
    userName: 'Alexander Chen',
    name: 'GitHub Actions Auto Deploy',
    keyPrefix: 'qvms_live_gha419',
    scopes: ['vm.read', 'vm.power', 'file.read', 'file.write'],
    lastUsedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    createdAt: '2025-02-15T09:30:00.000Z',
  }
];

let webhooks: any[] = [
  {
    _id: 'wh-01',
    userId: 'usr-cust-01',
    url: 'https://api.nexuslabs.dev/webhooks/qualavms',
    events: ['vm.created', 'vm.started', 'vm.stopped', 'backup.created'],
    secret: 'whsec_9f81bc20a918e9f2a00192bc7291a82b',
    active: true,
    deliveryCount: 38,
    lastDeliveryStatus: 200,
    lastDeliveryAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    createdAt: '2025-02-12T11:00:00.000Z',
  }
];

let auditLogs: any[] = [
  {
    _id: 'log-01',
    actor: 'admin',
    actorEmail: 'admin@qualavms.io',
    role: 'Super Admin',
    action: 'VM_STARTED',
    target: 'Production Web Node 01 (vm-1042)',
    targetId: 'vm-1042',
    ip: '192.168.1.105',
    metadata: { qemuPid: 41829, node: 'node-us-east-01', vncPort: 25901 },
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    _id: 'log-02',
    actor: 'alexchen',
    actorEmail: 'alex.chen@nexuslabs.dev',
    role: 'User',
    action: 'SNAPSHOT_CREATED',
    target: 'vm-1042 [pre-nginx-upgrade-v1.26]',
    targetId: 'vm-1042',
    ip: '198.51.100.12',
    metadata: { sizeMB: 1240, durationMs: 1420 },
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    _id: 'log-03',
    actor: 'admin',
    actorEmail: 'admin@qualavms.io',
    role: 'Super Admin',
    action: 'STORAGE_POOL_EXPANDED',
    target: 'NVMe Fast Tier',
    targetId: 'pool-nvme-fast',
    ip: '192.168.1.105',
    metadata: { addedGB: 2048, newTotalGB: 8192 },
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    _id: 'log-04',
    actor: 'alexchen',
    actorEmail: 'alex.chen@nexuslabs.dev',
    role: 'User',
    action: 'USER_LOGIN',
    target: 'Session Established',
    targetId: 'usr-cust-01',
    ip: '198.51.100.12',
    metadata: { '2faMethod': 'TOTP', userAgent: 'Mozilla/5.0 (X11; Linux x86_64)' },
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    _id: 'log-05',
    actor: 'system',
    actorEmail: 'system@qualavms.io',
    role: 'System Daemon',
    action: 'BACKUP_COMPLETED',
    target: 'vm-1042 [auto-daily-20260916]',
    targetId: 'vm-1042',
    ip: '127.0.0.1',
    metadata: { sizeGB: 18.4, targetNFS: '10.0.0.50' },
    createdAt: '2026-09-16T02:05:00.000Z',
  }
];

let invoices = [
  {
    _id: 'inv-001',
    invoiceNumber: 'QVM-00001',
    userId: 'usr-cust-01',
    customerName: 'Alexander Chen',
    customerEmail: 'alex.chen@nexuslabs.dev',
    planName: 'Ultra (4 vCPU, 8 GB RAM, 120 GB NVMe)',
    period: 'Mar 1, 2026 - Mar 31, 2026',
    subtotal: 28.00,
    discount: 0.00,
    tax: 2.24,
    total: 30.24,
    status: 'paid',
    createdAt: '2026-03-01T00:00:00.000Z',
    dueDate: '2026-03-15T00:00:00.000Z',
  },
  {
    _id: 'inv-002',
    invoiceNumber: 'QVM-00002',
    userId: 'usr-cust-02',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@cloudmatrix.io',
    planName: 'Enterprise (8 vCPU, 16 GB RAM, 250 GB NVMe)',
    period: 'Mar 1, 2026 - Mar 31, 2026',
    subtotal: 64.00,
    discount: 6.40,
    tax: 4.60,
    total: 62.20,
    status: 'paid',
    createdAt: '2026-03-01T00:00:00.000Z',
    dueDate: '2026-03-15T00:00:00.000Z',
  }
];

let coupons = [
  {
    _id: 'cpn-01',
    code: 'WELCOME20',
    discountPercent: 20,
    maxUses: 500,
    usedCount: 142,
    status: 'active',
    expiresAt: '2026-12-31T23:59:59.000Z',
  },
  {
    _id: 'cpn-02',
    code: 'DEVLAUNCH',
    discountPercent: 30,
    maxUses: 100,
    usedCount: 89,
    status: 'active',
    expiresAt: '2026-06-30T23:59:59.000Z',
  }
];

let vmFilesStore: Record<string, any[]> = {
  'vm-1042': [
    { name: 'etc', path: '/etc', type: 'directory', size: 4096, modified: '2026-09-15 11:22', permissions: 'drwxr-xr-x' },
    { name: 'var', path: '/var', type: 'directory', size: 4096, modified: '2026-09-14 09:18', permissions: 'drwxr-xr-x' },
    { name: 'home', path: '/home', type: 'directory', size: 4096, modified: '2026-09-12 18:30', permissions: 'drwxr-xr-x' },
    { name: 'root', path: '/root', type: 'directory', size: 4096, modified: '2026-09-16 14:02', permissions: 'drwx------' },
    { name: 'nginx.conf', path: '/etc/nginx/nginx.conf', type: 'file', size: 2840, modified: '2026-09-16 10:15', permissions: '-rw-r--r--', content: `# Quala VMS Production Nginx Reverse Proxy Config
user www-data;
worker_processes auto;
pid /run/nginx.pid;
error_log /var/log/nginx/error.log warn;

events {
    worker_connections 4096;
    multi_accept on;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # SSL hardening
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

    upstream app_cluster {
        server 127.0.0.1:8080 max_fails=3 fail_timeout=10s;
        keepalive 32;
    }

    server {
        listen 80 default_server;
        listen [::]:80 default_server;
        server_name _;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2 default_server;
        listen [::]:443 ssl http2 default_server;
        server_name web-prod-01.quala.internal;

        ssl_certificate /etc/ssl/certs/quala-vms.crt;
        ssl_certificate_key /etc/ssl/private/quala-vms.key;

        location / {
            proxy_pass http://app_cluster;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}` },
    { name: 'docker-compose.yml', path: '/home/ubuntu/docker-compose.yml', type: 'file', size: 1450, modified: '2026-09-15 16:40', permissions: '-rw-rw-r--', content: `version: '3.8'

services:
  api:
    image: node:20-alpine
    restart: unless-stopped
    working_dir: /app
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
      - DB_HOST=198.51.100.43
    command: npm start

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"
` }
  ]
};

let systemSettings = {
  panelName: 'Quala VMS',
  tagline: 'Virtualization, Simplified.',
  logoUrl: '',
  defaultTheme: 'Quala Purple',
  registrationOpen: true,
  maintenanceMode: false,
  require2FAForAdmin: true,
  smtpHost: 'smtp.sendgrid.net',
  smtpPort: 587,
  smtpUser: 'apikey',
  smtpFrom: 'no-reply@qualavms.io',
  qemuBinary: '/usr/bin/qemu-system-x86_64',
  qemuImgBinary: '/usr/bin/qemu-img',
  defaultBridge: 'br0',
  autoAssignIp: true,
  snapshotRetentionDays: 30,
  backupRetentionDays: 60,
  demoMode: DEMO_MODE,
};

// --- QEMU PROVIDER & VM SERVICE ABSTRACTION ---
class QEMUProvider {
  /**
   * Builds safe command arguments array for qemu-system-x86_64
   */
  public static buildQemuArgs(vm: any) {
    const memoryMB = vm.ram * 1024;
    const vncDisplay = vm.vncPort - 5900;
    return [
      '-name', `quala_${vm._id}`,
      '-enable-kvm',
      '-m', `${memoryMB}`,
      '-smp', `cores=${vm.cpu},threads=1,sockets=1`,
      '-cpu', 'host',
      '-drive', `file=/var/lib/qualavms/vms/${vm._id}/disk.qcow2,if=virtio,format=qcow2,cache=none`,
      '-netdev', `tap,id=net0,ifname=tap_${vm._id},script=no,downscript=no`,
      '-device', `virtio-net-pci,netdev=net0,mac=${vm.mac}`,
      '-vnc', `0.0.0.0:${vncDisplay},websocket=${vm.vncPort}`,
      '-boot', vm.bootDevice === 'cdrom' ? 'd' : 'c',
      '-daemonize',
      '-pidfile', `/var/run/qualavms/${vm._id}.pid`
    ];
  }

  public static buildQemuImgCreateArgs(vmId: string, sizeGB: number) {
    return [
      'create',
      '-f', 'qcow2',
      '-o', 'preallocation=metadata',
      `/var/lib/qualavms/vms/${vmId}/disk.qcow2`,
      `${sizeGB}G`
    ];
  }
}

// --- AUTHENTICATION & AUTHORIZATION HELPERS ---
const parseUserFromHeader = (req: Request) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token === 'admin-token') {
      return users[0]; // Admin
    }
    if (token === 'user-token') {
      return users[2]; // Alexander Chen
    }
    // Check if token matches a user id
    const found = users.find(u => u._id === token);
    if (found) return found;
  }
  // Default to logged-in user in demo mode if cookie or header present
  const sessionUser = req.cookies?.quala_user_id || req.headers['x-quala-user-id'];
  if (sessionUser) {
    const u = users.find(x => x._id === sessionUser);
    if (u) return u;
  }
  return users[0]; // Fallback to Super Admin in demo mode
};

// --- REST API ROUTES ---

// Health & Status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    product: 'Quala VMS',
    tagline: 'Virtualization, Simplified.',
    version: '2.4.1-lts',
    demoMode: systemSettings.demoMode,
    timestamp: new Date().toISOString(),
    nodesOnline: nodes.filter(n => n.status === 'online').length,
    vmsTotal: vms.length,
    vmsRunning: vms.filter(v => v.status === 'running').length
  });
});

// Authentication
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username || u.email === username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Account has been suspended by an administrator' });
  }

  // Set HTTP-only session cookie
  res.cookie('quala_user_id', user._id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  auditLogs.unshift({
    _id: `log-${Date.now()}`,
    actor: user.username,
    actorEmail: user.email,
    role: user.role,
    action: 'USER_LOGIN',
    target: 'Web Console Auth',
    targetId: user._id,
    ip: req.ip || '127.0.0.1',
    metadata: { userAgent: req.headers['user-agent'] },
    createdAt: new Date().toISOString(),
  });

  return res.json({
    user,
    token: user.role.includes('Admin') ? 'admin-token' : 'user-token',
    requires2FA: user.twoFactorEnabled,
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, username, password } = req.body;
  if (!name || !email || !username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (users.find(u => u.email === email || u.username === username)) {
    return res.status(400).json({ error: 'Email or username is already taken' });
  }

  const newUser = {
    _id: `usr-${Date.now()}`,
    name,
    email,
    username,
    passwordHash: '$2b$12$secure_hash_placeholder',
    role: 'User' as const,
    twoFactorEnabled: false,
    status: 'active' as const,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);

  res.cookie('quala_user_id', newUser._id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  return res.status(201).json({
    user: newUser,
    token: 'user-token'
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('quala_user_id');
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const currentUser = parseUserFromHeader(req);
  res.json({ user: currentUser });
});

// Virtual Machines API
app.get('/api/vms', (req: Request, res: Response) => {
  const currentUser = parseUserFromHeader(req);
  const filterOwner = req.query.owner;
  let result = [...vms];
  if (filterOwner) {
    result = result.filter(v => v.owner === filterOwner);
  } else if (!currentUser.role.includes('Admin')) {
    result = result.filter(v => v.owner === currentUser._id);
  }
  res.json({ vms: result });
});

app.get('/api/vms/:id', (req: Request, res: Response) => {
  const vm = vms.find(v => v._id === req.params.id);
  if (!vm) return res.status(404).json({ error: 'Virtual machine not found' });
  res.json({ vm });
});

app.post('/api/vms', (req: Request, res: Response) => {
  const currentUser = parseUserFromHeader(req);
  const { name, hostname, image, osType, cpu, ram, disk, node, networkBridge } = req.body;

  const vmId = `vm-${1000 + vms.length + 1}`;
  const randomSuffix = Math.floor(Math.random() * 200 + 50);
  const macSuffix = Math.floor(Math.random() * 255).toString(16).padStart(2, '0');

  const newVM = {
    _id: vmId,
    name: name || `VPS-${vmId}`,
    hostname: hostname || `${name?.toLowerCase().replace(/\s+/g, '-') || vmId}.quala.internal`,
    owner: req.body.owner || currentUser._id,
    ownerEmail: currentUser.email,
    node: node || nodes[0]._id,
    status: 'running' as const,
    cpu: Number(cpu) || 2,
    ram: Number(ram) || 4,
    disk: Number(disk) || 60,
    image: image || 'Ubuntu 24.04 LTS',
    osType: osType || 'ubuntu',
    ipv4: `198.51.100.${randomSuffix}`,
    ipv6: `2001:db8:85a3::8a2e:370:${randomSuffix.toString(16)}`,
    mac: `52:54:00:99:${macSuffix}:${macSuffix}`,
    vncPort: 25900 + vms.length + 1,
    sshPort: 25500 + vms.length + 1,
    agentPort: 26000 + vms.length + 1,
    qemuPid: Math.floor(Math.random() * 50000 + 10000),
    networkBridge: networkBridge || 'br0',
    bootDevice: 'hd' as const,
    cpuUsage: 14.5,
    ramUsage: 32.0,
    diskUsage: 18.0,
    bandwidthIn: 12.0,
    bandwidthOut: 5.4,
    uptime: 120,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  vms.unshift(newVM);

  // Initialize initial files
  vmFilesStore[vmId] = [
    { name: 'etc', path: '/etc', type: 'directory', size: 4096, modified: new Date().toISOString().substring(0, 16), permissions: 'drwxr-xr-x' },
    { name: 'home', path: '/home', type: 'directory', size: 4096, modified: new Date().toISOString().substring(0, 16), permissions: 'drwxr-xr-x' },
    { name: 'welcome.txt', path: '/root/welcome.txt', type: 'file', size: 340, modified: new Date().toISOString().substring(0, 16), permissions: '-rw-r--r--', content: `Welcome to your Quala VMS Cloud Instance!\nInstance ID: ${vmId}\nHostname: ${newVM.hostname}\nOS: ${newVM.image}\nIP: ${newVM.ipv4}\nProvisioned via QEMU/KVM hypervisor.\n` }
  ];

  const logEntry = {
    _id: `log-${Date.now()}`,
    actor: currentUser.username,
    actorEmail: currentUser.email,
    role: currentUser.role,
    action: 'VM_CREATED',
    target: `${newVM.name} (${newVM._id})`,
    targetId: newVM._id,
    ip: req.ip || '127.0.0.1',
    metadata: { cpu: newVM.cpu, ram: newVM.ram, disk: newVM.disk, node: newVM.node },
    createdAt: new Date().toISOString(),
  };
  auditLogs.unshift(logEntry);

  io.emit('vm:created', newVM);
  io.emit('audit:new', logEntry);

  res.status(201).json({ vm: newVM, message: 'Virtual machine provisioned and started' });
});

// VM Lifecycle Control
app.post('/api/vms/:id/:action', (req: Request, res: Response) => {
  const { id, action } = req.params;
  const vmIndex = vms.findIndex(v => v._id === id);
  if (vmIndex === -1) return res.status(404).json({ error: 'VM not found' });

  const currentUser = parseUserFromHeader(req);
  const vm = vms[vmIndex];

  if (action === 'start') {
    vm.status = 'running';
    vm.qemuPid = Math.floor(Math.random() * 50000 + 10000);
    vm.cpuUsage = 24.5;
    vm.ramUsage = 40.0;
  } else if (action === 'stop' || action === 'shutdown' || action === 'force-stop') {
    vm.status = 'stopped';
    vm.qemuPid = undefined;
    vm.cpuUsage = 0;
    vm.ramUsage = 0;
  } else if (action === 'restart') {
    vm.status = 'running';
    vm.uptime = 5;
  }

  vm.updatedAt = new Date().toISOString();

  const logEntry = {
    _id: `log-${Date.now()}`,
    actor: currentUser.username,
    actorEmail: currentUser.email,
    role: currentUser.role,
    action: `VM_${action.toUpperCase().replace('-', '_')}`,
    target: `${vm.name} (${vm._id})`,
    targetId: vm._id,
    ip: req.ip || '127.0.0.1',
    createdAt: new Date().toISOString(),
  };
  auditLogs.unshift(logEntry);

  io.emit('vm:status', { vmId: vm._id, status: vm.status, action, vm });
  io.emit('audit:new', logEntry);

  res.json({ vm, message: `VM ${action} executed successfully` });
});

app.delete('/api/vms/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const vm = vms.find(v => v._id === id);
  if (!vm) return res.status(404).json({ error: 'VM not found' });

  vms = vms.filter(v => v._id !== id);
  delete vmFilesStore[id];

  const logEntry = {
    _id: `log-${Date.now()}`,
    actor: 'admin',
    action: 'VM_DELETED',
    target: `${vm.name} (${id})`,
    targetId: id,
    ip: req.ip || '127.0.0.1',
    createdAt: new Date().toISOString(),
  };
  auditLogs.unshift(logEntry);

  io.emit('vm:deleted', { vmId: id });
  io.emit('audit:new', logEntry);

  res.json({ message: 'Virtual machine deleted' });
});

// VM Live Stats
app.get('/api/vms/:id/stats', (req: Request, res: Response) => {
  const vm = vms.find(v => v._id === req.params.id);
  if (!vm) return res.status(404).json({ error: 'VM not found' });

  // Generate realistic time-series points
  const points = [];
  const now = Date.now();
  for (let i = 12; i >= 0; i--) {
    const time = new Date(now - i * 5000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const isRunning = vm.status === 'running';
    points.push({
      time,
      cpu: isRunning ? Math.min(100, Math.max(5, Math.round(vm.cpuUsage + (Math.sin(i) * 12) + (Math.random() * 8 - 4)))) : 0,
      ram: isRunning ? Math.min(100, Math.max(10, Math.round(vm.ramUsage + (Math.cos(i) * 6) + (Math.random() * 4 - 2)))) : 0,
      disk: vm.diskUsage,
      netIn: isRunning ? Math.round(15 + Math.random() * 30) : 0,
      netOut: isRunning ? Math.round(25 + Math.random() * 45) : 0,
    });
  }

  res.json({ current: vm, history: points });
});

// VM Logs
app.get('/api/vms/:id/logs', (req: Request, res: Response) => {
  const vm = vms.find(v => v._id === req.params.id);
  if (!vm) return res.status(404).json({ error: 'VM not found' });

  const logs = [
    `[    0.000000] Linux version 6.8.0-45-generic (buildd@lcy02-amd64-073) (x86_64-linux-gnu-gcc-13)`,
    `[    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-6.8.0-45-generic root=UUID=quala-root-partition ro console=tty1 console=ttyS0,115200n8 quiet`,
    `[    0.000000] KVM: CPUID guest capability flag 0x14000002`,
    `[    0.000000] Memory: ${vm.ram * 1024 * 1024}K/${vm.ram * 1024 * 1024}K available (${vm.cpu} vCPUs enabled)`,
    `[    0.142801] ACPI: Core revision 20230628`,
    `[    0.389201] virtio_net virtio0: assigned MAC ${vm.mac}`,
    `[    0.419022] virtio_blk virtio1: [vda] ${vm.disk * 1024 * 1024 * 2} 512-byte logical blocks: (${vm.disk} GB/ ${vm.disk} GiB)`,
    `[    1.240189] systemd[1]: Inserted module 'autofs4'`,
    `[    1.589104] systemd[1]: Started Network Configuration Service (systemd-networkd).`,
    `[    1.890123] systemd-resolved[612]: Using system hostname '${vm.hostname}'.`,
    `[    2.120491] cloud-init[721]: Cloud-init v. 24.1.3 running 'init-local' at ${vm.createdAt}`,
    `[    2.540192] sshd[840]: Server listening on 0.0.0.0 port 22.`,
    `[    2.540201] sshd[840]: Server listening on :: port 22.`,
    `[    3.109280] systemd[1]: Startup finished in 1.42s (kernel) + 1.88s (userspace) = 3.30s.`,
    `[   12.490122] quala-guest-agent[902]: Guest agent initialized, listening on virtio-serial port.`
  ];

  res.json({ logs });
});

// VM Files Management
app.get('/api/vms/:id/files', (req: Request, res: Response) => {
  const vmFiles = vmFilesStore[req.params.id] || [];
  res.json({ files: vmFiles });
});

app.post('/api/vms/:id/files', (req: Request, res: Response) => {
  const { name, type, content, path: filePath } = req.body;
  if (!vmFilesStore[req.params.id]) vmFilesStore[req.params.id] = [];

  const newEntry = {
    name: name || 'untitled.txt',
    path: filePath || `/${name}`,
    type: type || 'file',
    size: content ? content.length : 0,
    modified: new Date().toISOString().substring(0, 16),
    permissions: type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--',
    content: content || ''
  };

  vmFilesStore[req.params.id].push(newEntry);
  res.status(201).json({ file: newEntry, message: 'File created successfully' });
});

app.put('/api/vms/:id/files', (req: Request, res: Response) => {
  const { path: filePath, content } = req.body;
  const list = vmFilesStore[req.params.id] || [];
  const target = list.find(f => f.path === filePath);
  if (target) {
    target.content = content;
    target.size = content.length;
    target.modified = new Date().toISOString().substring(0, 16);
    return res.json({ file: target, message: 'File saved successfully' });
  }
  res.status(404).json({ error: 'File not found' });
});

app.delete('/api/vms/:id/files', (req: Request, res: Response) => {
  const filePath = req.query.path as string;
  if (vmFilesStore[req.params.id]) {
    vmFilesStore[req.params.id] = vmFilesStore[req.params.id].filter(f => f.path !== filePath);
  }
  res.json({ message: 'File deleted' });
});

// Snapshots API
app.get('/api/vms/:id/snapshots', (req: Request, res: Response) => {
  const list = snapshots.filter(s => s.vmId === req.params.id);
  res.json({ snapshots: list });
});

app.post('/api/vms/:id/snapshots', (req: Request, res: Response) => {
  const vm = vms.find(v => v._id === req.params.id);
  if (!vm) return res.status(404).json({ error: 'VM not found' });

  const { name, description } = req.body;
  const newSnapshot = {
    _id: `snp-${Date.now()}`,
    vmId: vm._id,
    vmName: vm.name,
    name: name || `snapshot-${Date.now()}`,
    description: description || 'Manual snapshot checkpoint',
    path: `/var/lib/qualavms/snapshots/${vm._id}-${Date.now()}.qcow2`,
    sizeMB: Math.round(vm.disk * 15 + Math.random() * 200),
    status: 'ready' as const,
    createdAt: new Date().toISOString(),
  };

  snapshots.unshift(newSnapshot);

  auditLogs.unshift({
    _id: `log-${Date.now()}`,
    actor: 'admin',
    action: 'SNAPSHOT_CREATED',
    target: `${vm.name} [${newSnapshot.name}]`,
    targetId: vm._id,
    ip: req.ip || '127.0.0.1',
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ snapshot: newSnapshot, message: 'Snapshot created' });
});

app.delete('/api/vms/:id/snapshots/:snapshotId', (req: Request, res: Response) => {
  snapshots = snapshots.filter(s => s._id !== req.params.snapshotId);
  res.json({ message: 'Snapshot removed' });
});

// Backups API
app.get('/api/vms/:id/backups', (req: Request, res: Response) => {
  const list = backups.filter(b => b.vmId === req.params.id);
  res.json({ backups: list });
});

app.post('/api/vms/:id/backups', (req: Request, res: Response) => {
  const vm = vms.find(v => v._id === req.params.id);
  if (!vm) return res.status(404).json({ error: 'VM not found' });

  const { name, schedule, retentionDays } = req.body;
  const newBackup = {
    _id: `bkp-${Date.now()}`,
    vmId: vm._id,
    vmName: vm.name,
    name: name || `backup-${new Date().toISOString().substring(0, 10)}`,
    path: `/exports/qualavms/backups/${vm._id}/${Date.now()}.img.zst`,
    sizeGB: Math.round(vm.disk * 0.45 * 10) / 10,
    status: 'completed' as const,
    schedule: schedule || 'manual',
    retentionDays: Number(retentionDays) || 30,
    createdAt: new Date().toISOString(),
  };

  backups.unshift(newBackup);
  res.status(201).json({ backup: newBackup, message: 'Backup created successfully' });
});

// Firewall Rules API
app.get('/api/vms/:id/firewall', (req: Request, res: Response) => {
  const list = firewallRules.filter(r => r.vmId === req.params.id);
  res.json({ rules: list });
});

app.post('/api/vms/:id/firewall', (req: Request, res: Response) => {
  const { direction, protocol, portRange, source, action, description } = req.body;
  const newRule = {
    _id: `fw-${Date.now()}`,
    vmId: req.params.id,
    direction: direction || 'INBOUND',
    protocol: protocol || 'TCP',
    portRange: portRange || '80',
    source: source || '0.0.0.0/0',
    action: action || 'ALLOW',
    description: description || 'Custom firewall rule'
  };
  firewallRules.push(newRule);
  res.status(201).json({ rule: newRule, message: 'Firewall rule added' });
});

app.delete('/api/vms/:id/firewall/:ruleId', (req: Request, res: Response) => {
  firewallRules = firewallRules.filter(r => r._id !== req.params.ruleId);
  res.json({ message: 'Firewall rule deleted' });
});

// Admin Management APIs
app.get('/api/admin/users', (req: Request, res: Response) => {
  const userListWithCount = users.map(u => ({
    ...u,
    vmCount: vms.filter(v => v.owner === u._id).length
  }));
  res.json({ users: userListWithCount });
});

app.post('/api/admin/users', (req: Request, res: Response) => {
  const { name, email, username, role, status } = req.body;
  const newUser = {
    _id: `usr-${Date.now()}`,
    name: name || 'New User',
    email: email || `user${Date.now()}@qualavms.io`,
    username: username || `user_${Date.now()}`,
    passwordHash: '$2b$12$secure_placeholder',
    role: role || 'User',
    twoFactorEnabled: false,
    status: status || 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  users.push(newUser);
  res.status(201).json({ user: newUser, message: 'User created' });
});

app.put('/api/admin/users/:id', (req: Request, res: Response) => {
  const user = users.find(u => u._id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  Object.assign(user, req.body, { updatedAt: new Date().toISOString() });
  res.json({ user, message: 'User updated' });
});

app.delete('/api/admin/users/:id', (req: Request, res: Response) => {
  users = users.filter(u => u._id !== req.params.id);
  res.json({ message: 'User deleted' });
});

app.get('/api/admin/nodes', (req: Request, res: Response) => {
  res.json({ nodes });
});

app.post('/api/admin/nodes', (req: Request, res: Response) => {
  const newNode = {
    _id: `node-${Date.now()}`,
    name: req.body.name || 'New Hypervisor Node',
    hostname: req.body.hostname || `kvm-${Date.now()}.infra.quala.io`,
    ip: req.body.ip || '10.0.40.14',
    status: 'online' as const,
    cpu: { cores: req.body.cores || 64, usagePercent: 12.0, model: req.body.model || 'AMD EPYC 9654' },
    ram: { totalGB: req.body.ram || 512, usedGB: 32 },
    storage: { totalTB: req.body.storage || 16, usedTB: 1.2 },
    qemuVersion: 'QEMU 9.0.2',
    kernelVersion: 'Linux 6.8.0-generic',
    vmCount: 0,
    location: req.body.location || 'Singapore',
    createdAt: new Date().toISOString(),
  };
  nodes.push(newNode);
  res.status(201).json({ node: newNode, message: 'Node registered' });
});

app.get('/api/admin/storage', (req: Request, res: Response) => {
  res.json({ storagePools });
});

app.post('/api/admin/storage', (req: Request, res: Response) => {
  const newPool = {
    _id: `pool-${Date.now()}`,
    name: req.body.name || 'New Storage Pool',
    type: req.body.type || 'Local Directory',
    path: req.body.path || '/var/lib/qualavms/storage/pool1',
    totalGB: Number(req.body.totalGB) || 4096,
    usedGB: 0,
    freeGB: Number(req.body.totalGB) || 4096,
    status: 'active' as const,
  };
  storagePools.push(newPool);
  res.status(201).json({ storagePool: newPool, message: 'Storage pool added' });
});

app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
  res.json({ auditLogs });
});

app.get('/api/admin/isos', (req: Request, res: Response) => {
  res.json({ isos: isoLibrary });
});

app.post('/api/admin/isos', (req: Request, res: Response) => {
  const newIso = {
    _id: `iso-${Date.now()}`,
    name: req.body.name || 'Custom ISO',
    filename: req.body.filename || 'custom.iso',
    category: req.body.category || 'Linux',
    sizeGB: Number(req.body.sizeGB) || 1.5,
    checksum: req.body.checksum || `sha256:${Date.now()}fakehash`,
    status: 'verified' as const,
    uploadedAt: new Date().toISOString(),
  };
  isoLibrary.push(newIso);
  res.status(201).json({ iso: newIso, message: 'ISO uploaded and registered' });
});

app.delete('/api/admin/isos/:id', (req: Request, res: Response) => {
  isoLibrary = isoLibrary.filter(i => i._id !== req.params.id);
  res.json({ message: 'ISO deleted' });
});

app.get('/api/admin/templates', (req: Request, res: Response) => {
  res.json({ templates: osTemplates });
});

app.get('/api/admin/plans', (req: Request, res: Response) => {
  res.json({ plans });
});

app.post('/api/admin/plans', (req: Request, res: Response) => {
  const newPlan = {
    _id: `plan-${Date.now()}`,
    name: req.body.name || 'Custom Plan',
    tagline: req.body.tagline || 'Configured VPS tier',
    cpu: Number(req.body.cpu) || 2,
    ram: Number(req.body.ram) || 4,
    disk: Number(req.body.disk) || 50,
    bandwidth: req.body.bandwidth || '5 TB',
    priceMonthly: Number(req.body.priceMonthly) || 12.00,
    status: 'active' as const,
    features: req.body.features || ['High Performance vCPU', 'Fast NVMe Storage', 'DDoS Protection']
  };
  plans.push(newPlan);
  res.status(201).json({ plan: newPlan, message: 'Resource plan created' });
});

app.delete('/api/admin/plans/:id', (req: Request, res: Response) => {
  plans = plans.filter(p => p._id !== req.params.id);
  res.json({ message: 'Plan removed' });
});

app.get('/api/admin/invoices', (req: Request, res: Response) => {
  res.json({ invoices });
});

app.get('/api/admin/coupons', (req: Request, res: Response) => {
  res.json({ coupons });
});

app.post('/api/admin/coupons', (req: Request, res: Response) => {
  const newCoupon = {
    _id: `cpn-${Date.now()}`,
    code: req.body.code?.toUpperCase() || `SALE${Math.floor(Math.random() * 50)}`,
    discountPercent: Number(req.body.discountPercent) || 15,
    maxUses: Number(req.body.maxUses) || 200,
    usedCount: 0,
    status: 'active' as const,
    expiresAt: req.body.expiresAt || '2026-12-31T23:59:59.000Z'
  };
  coupons.push(newCoupon);
  res.status(201).json({ coupon: newCoupon, message: 'Coupon created' });
});

app.get('/api/admin/settings', (req: Request, res: Response) => {
  res.json({ settings: systemSettings });
});

app.post('/api/admin/settings', (req: Request, res: Response) => {
  Object.assign(systemSettings, req.body);
  res.json({ settings: systemSettings, message: 'Settings saved' });
});

// API Keys API
app.get('/api/user/keys', (req: Request, res: Response) => {
  res.json({ keys: apiKeys });
});

app.post('/api/user/keys', (req: Request, res: Response) => {
  const currentUser = parseUserFromHeader(req);
  const { name, scopes } = req.body;
  const rawToken = `qvms_live_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`;
  const keyPrefix = rawToken.substring(0, 16);

  const newKey = {
    _id: `key-${Date.now()}`,
    userId: currentUser._id,
    userName: currentUser.name,
    name: name || 'Default API Token',
    keyPrefix,
    scopes: scopes || ['vm.read', 'vm.power'],
    lastUsedAt: undefined,
    createdAt: new Date().toISOString(),
  };

  apiKeys.unshift(newKey);
  res.status(201).json({ key: newKey, rawToken, message: 'API key created. Save the secret now, it will not be shown again.' });
});

app.delete('/api/user/keys/:id', (req: Request, res: Response) => {
  apiKeys = apiKeys.filter(k => k._id !== req.params.id);
  res.json({ message: 'API key revoked' });
});

// Webhooks API
app.get('/api/user/webhooks', (req: Request, res: Response) => {
  res.json({ webhooks });
});

app.post('/api/user/webhooks', (req: Request, res: Response) => {
  const newWh = {
    _id: `wh-${Date.now()}`,
    userId: 'usr-cust-01',
    url: req.body.url || 'https://example.com/webhook',
    events: req.body.events || ['vm.created', 'vm.started', 'vm.stopped'],
    secret: `whsec_${Math.random().toString(36).substring(2, 15)}`,
    active: true,
    deliveryCount: 0,
    createdAt: new Date().toISOString(),
  };
  webhooks.push(newWh);
  res.status(201).json({ webhook: newWh, message: 'Webhook endpoint registered' });
});

app.post('/api/user/webhooks/:id/ping', (req: Request, res: Response) => {
  const wh = webhooks.find(w => w._id === req.params.id);
  if (!wh) return res.status(404).json({ error: 'Webhook not found' });
  wh.deliveryCount += 1;
  wh.lastDeliveryStatus = 200;
  wh.lastDeliveryAt = new Date().toISOString();
  res.json({ success: true, status: 200, message: 'Ping event delivered (HTTP 200 OK)' });
});

// --- VITE MIDDLEWARE & STATIC SERVING ---
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Periodic simulated live telemetry
  setInterval(() => {
    if (io.engine.clientsCount > 0) {
      const liveMetrics = vms.map((v: any) => ({
        vmId: v._id,
        cpuPercent: v.status === 'running' ? Math.floor(Math.random() * 35) + 5 : 0,
        ramPercent: v.status === 'running' ? Math.floor(Math.random() * 25) + 40 : 0,
        netInMbps: v.status === 'running' ? +(Math.random() * 20).toFixed(2) : 0,
        netOutMbps: v.status === 'running' ? +(Math.random() * 45).toFixed(2) : 0,
        timestamp: new Date().toISOString(),
      }));
      io.emit('telemetry:batch', liveMetrics);
    }
  }, 4000);

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[Quala VMS] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[Quala VMS] Demo mode: ${DEMO_MODE ? 'ENABLED' : 'DISABLED'}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start Quala VMS server:', err);
});
