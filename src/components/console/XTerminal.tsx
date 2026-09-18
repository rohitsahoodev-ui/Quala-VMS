import React, { useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, Maximize2, Minimize2, RotateCw, Trash2, Plus, X, Shield } from 'lucide-react';
import { Terminal } from 'xterm';

interface XTerminalProps {
  vmId?: string;
  vmName?: string;
  vmIp?: string;
  isDemo?: boolean;
}

interface TerminalSession {
  id: string;
  name: string;
}

export const XTerminal: React.FC<XTerminalProps> = ({
  vmId = 'vm-1042',
  vmName = 'Production Web Node 01',
  vmIp = '198.51.100.42',
  isDemo = true,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<Terminal | null>(null);
  const [sessions, setSessions] = useState<TerminalSession[]>([
    { id: 'sess-1', name: 'SSH 1' },
    { id: 'sess-2', name: 'SSH 2' },
  ]);
  const [activeSessionId, setActiveSessionId] = useState('sess-1');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Command buffer for interactive simulation
  const cmdBuffer = useRef<string>('');

  const initTerminal = () => {
    if (!terminalRef.current) return;
    terminalRef.current.innerHTML = '';

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 13,
      lineHeight: 1.25,
      theme: {
        background: '#0a0a14',
        foreground: '#e2e8f0',
        cursor: '#a855f7',
        selectionBackground: 'rgba(168, 85, 247, 0.3)',
        black: '#121124',
        red: '#f43f5e',
        green: '#10b981',
        yellow: '#f59e0b',
        blue: '#6366f1',
        magenta: '#d946ef',
        cyan: '#06b6d4',
        white: '#f8fafc',
      },
      convertEol: true,
      disableStdin: false,
    });

    term.open(terminalRef.current);
    xtermInstance.current = term;

    // Welcome banner
    term.writeln('\x1b[1;35m  ___              _          __   ____  __ ____  \x1b[0m');
    term.writeln('\x1b[1;35m / _ \\ _   _  __ _| | __ _    \\ \\ / /  \\/  / ___| \x1b[0m');
    term.writeln('\x1b[1;35m| | | | | | |/ _` | |/ _` |____\\ V /| |\\/| \\___ \\ \x1b[0m');
    term.writeln('\x1b[1;35m| |_| | |_| | (_| | | (_| |_____| | | |  | |___) |\x1b[0m');
    term.writeln('\x1b[1;35m \\__\\_\\\\__,_|\\__,_|_|\\__,_|     |_| |_|  |_|____/ \x1b[0m');
    term.writeln('\x1b[90m------------------------------------------------------------\x1b[0m');
    term.writeln(`\x1b[32m✔ Authenticated to \x1b[1m${vmName}\x1b[0m (${vmIp}) via QEMU VirtIO Serial\x1b[0m`);
    term.writeln(`\x1b[36mℹ Session: ${activeSessionId} | Secure SSH Tunnel Active\x1b[0m`);
    term.writeln('\x1b[90mType "help" for a list of available diagnostic commands.\x1b[0m\n');
    term.write(`\x1b[1;32mubuntu@${vmName.toLowerCase().replace(/\s+/g, '-')}\x1b[0m:\x1b[1;34m~\x1b[0m$ `);

    // Keystroke handler
    term.onData((data) => {
      // Enter
      if (data === '\r') {
        const cmd = cmdBuffer.current.trim();
        term.writeln('');
        handleCommand(cmd, term);
        cmdBuffer.current = '';
        term.write(`\x1b[1;32mubuntu@${vmName.toLowerCase().replace(/\s+/g, '-')}\x1b[0m:\x1b[1;34m~\x1b[0m$ `);
      }
      // Backspace
      else if (data === '\u007F') {
        if (cmdBuffer.current.length > 0) {
          cmdBuffer.current = cmdBuffer.current.slice(0, -1);
          term.write('\b \b');
        }
      }
      // Printable characters
      else if (data >= ' ' || data === '\t') {
        cmdBuffer.current += data;
        term.write(data);
      }
    });
  };

  const handleCommand = (cmd: string, term: Terminal) => {
    const parts = cmd.split(' ');
    const main = parts[0].toLowerCase();

    switch (main) {
      case '':
        break;
      case 'help':
        term.writeln('\x1b[1mAvailable commands:\x1b[0m');
        term.writeln('  \x1b[36mhelp\x1b[0m        - Show this reference menu');
        term.writeln('  \x1b[36mls\x1b[0m          - List directory files and permissions');
        term.writeln('  \x1b[36muname -a\x1b[0m    - Show Linux kernel architecture');
        term.writeln('  \x1b[36muptime\x1b[0m      - Display system uptime and load average');
        term.writeln('  \x1b[36mqemu-info\x1b[0m   - Inspect virtual disk image with qemu-img');
        term.writeln('  \x1b[36mip a\x1b[0m        - Display network interfaces (virtio-net)');
        term.writeln('  \x1b[36mtop\x1b[0m         - Display real-time CPU and RAM processes');
        term.writeln('  \x1b[36msystemctl\x1b[0m   - Check status of qemu-guest-agent');
        term.writeln('  \x1b[36mclear\x1b[0m       - Clear the terminal screen');
        term.writeln('  \x1b[36mreboot\x1b[0m      - Signal QEMU ACPI restart');
        break;

      case 'ls':
        term.writeln('drwxr-xr-x 4 ubuntu ubuntu 4096 Sep 16 11:20 \x1b[1;34m.\x1b[0m');
        term.writeln('drwxr-xr-x 3 root   root   4096 Sep 10 09:15 \x1b[1;34m..\x1b[0m');
        term.writeln('-rw------- 1 ubuntu ubuntu  892 Sep 16 14:02 .bash_history');
        term.writeln('-rw-r--r-- 1 ubuntu ubuntu  220 Sep 10 09:15 .bash_logout');
        term.writeln('-rw-r--r-- 1 ubuntu ubuntu 3771 Sep 10 09:15 .bashrc');
        term.writeln('drwx------ 2 ubuntu ubuntu 4096 Sep 10 09:18 \x1b[1;34m.ssh\x1b[0m');
        term.writeln('-rw-rw-r-- 1 ubuntu ubuntu 1450 Sep 15 16:40 \x1b[32mdocker-compose.yml\x1b[0m');
        term.writeln('-rw-r--r-- 1 root   root    340 Sep 16 10:00 welcome.txt');
        break;

      case 'uname':
        term.writeln('Linux web-prod-01 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux');
        break;

      case 'uptime':
        term.writeln(' 14:38:22 up 5 days,  4:12,  2 users,  load average: 0.18, 0.24, 0.19');
        break;

      case 'qemu-info':
        term.writeln('\x1b[35mimage: /var/lib/qualavms/vms/vm-1042/disk.qcow2\x1b[0m');
        term.writeln('file format: qcow2');
        term.writeln('virtual size: 80 GiB (85899345920 bytes)');
        term.writeln('disk size: 33.4 GiB');
        term.writeln('cluster_size: 65536');
        term.writeln('Format specific information:');
        term.writeln('    compat: 1.1');
        term.writeln('    compression type: zstd');
        term.writeln('    lazy refcounts: true');
        break;

      case 'ip':
        term.writeln('1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default');
        term.writeln('    inet 127.0.0.1/8 scope host lo');
        term.writeln('2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default');
        term.writeln(`    inet ${vmIp}/24 brd 198.51.100.255 scope global dynamic eth0`);
        term.writeln('    inet6 2001:db8:85a3::8a2e:370:7334/64 scope global dynamic');
        break;

      case 'top':
        term.writeln('top - 14:39:01 up 5 days, 4:13, 2 users, load average: 0.22, 0.25, 0.20');
        term.writeln('Tasks: 114 total,   1 running, 113 sleeping,   0 stopped,   0 zombie');
        term.writeln('%Cpu(s): 14.2 us,  3.1 sy,  0.0 ni, 82.1 id,  0.4 wa,  0.0 hi,  0.2 si');
        term.writeln('MiB Mem :   8192.0 total,   3750.4 free,   4441.6 used,   1220.0 buff/cache');
        term.writeln('\x1b[7m  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND       \x1b[0m');
        term.writeln(' 1042 root      20   0  145920  24120   8920 S  12.4   0.3   4:12.18 node /app/srv ');
        term.writeln('  840 root      20   0   89420  14200   6100 S   4.1   0.2   1:45.30 nginx: master ');
        term.writeln('  902 root      20   0   42100   8400   4100 S   0.8   0.1   0:18.90 qemu-ga       ');
        break;

      case 'systemctl':
        term.writeln('● qemu-guest-agent.service - QEMU Guest Agent');
        term.writeln('     Loaded: loaded (/lib/systemd/system/qemu-guest-agent.service; enabled)');
        term.writeln('     Active: \x1b[32mactive (running)\x1b[0m since Wed 2026-09-12 10:15:00 UTC');
        term.writeln('   Main PID: 902 (qemu-ga)');
        term.writeln('     Status: "Listening on /dev/virtio-ports/org.qemu.guest_agent.0"');
        break;

      case 'clear':
        term.clear();
        break;

      case 'reboot':
        term.writeln('\x1b[31mBroadcast message from root@web-prod-01:\x1b[0m');
        term.writeln('The system is going down for reboot NOW!');
        term.writeln('[  OK  ] Stopped target Multi-User System.');
        term.writeln('[  OK  ] Stopping QEMU Guest Agent...');
        break;

      default:
        term.writeln(`bash: ${parts[0]}: command not found. Type "help" for available options.`);
        break;
    }
  };

  useEffect(() => {
    initTerminal();

    return () => {
      if (xtermInstance.current) {
        xtermInstance.current.dispose();
      }
    };
  }, [activeSessionId]);

  const addSession = () => {
    const newId = `sess-${sessions.length + 1}`;
    const newSess = { id: newId, name: `SSH ${sessions.length + 1}` };
    setSessions([...sessions, newSess]);
    setActiveSessionId(newId);
  };

  const closeSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length === 1) return;
    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);
    if (activeSessionId === id) {
      setActiveSessionId(remaining[0].id);
    }
  };

  const handleClear = () => {
    xtermInstance.current?.clear();
  };

  const handleReconnect = () => {
    setIsConnected(false);
    setTimeout(() => {
      setIsConnected(true);
      initTerminal();
    }, 400);
  };

  return (
    <div
      className={`glass-panel rounded-2xl border border-purple-500/20 overflow-hidden shadow-2xl flex flex-col transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-[#0a0a14]' : 'h-[540px]'
      }`}
    >
      {/* Terminal Toolbar (Rule 13 specifications) */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/60 border-b border-purple-500/15">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-white font-sans">Terminal</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 border border-white/5 text-[11px] font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <span className={isConnected ? 'text-emerald-400' : 'text-rose-400'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Tab bar (SSH 1, SSH 2, SSH 3) */}
          <div className="flex items-center gap-1 ml-3 border-l border-white/10 pl-3">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                onClick={() => setActiveSessionId(sess.id)}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs cursor-pointer font-mono transition-colors ${
                  activeSessionId === sess.id
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{sess.name}</span>
                {sessions.length > 1 && (
                  <button
                    onClick={(e) => closeSession(sess.id, e)}
                    className="p-0.5 hover:text-rose-400 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={addSession}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="New Session"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right buttons: [New Session] [Reconnect] [Clear] [Fullscreen] */}
        <div className="flex items-center gap-2">
          <button
            onClick={addSession}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-purple-400" />
            <span>New Session</span>
          </button>

          <button
            onClick={handleReconnect}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
            title="Reconnect Tunnel"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reconnect</span>
          </button>

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
            title="Clear Screen"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Terminal Canvas Container */}
      <div className="flex-1 p-3 bg-[#0a0a14] overflow-hidden relative">
        <div ref={terminalRef} className="w-full h-full" />
      </div>

      {/* Terminal Footer Info */}
      <div className="px-4 py-1.5 bg-black/80 border-t border-purple-500/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span>QEMU VirtIO Serial (25600 baud)</span>
          <span>UTF-8 xterm-256color</span>
        </div>
        <div className="flex items-center gap-1.5 text-purple-400">
          <Shield className="w-3 h-3" />
          <span>Encrypted Gateway</span>
        </div>
      </div>
    </div>
  );
};
