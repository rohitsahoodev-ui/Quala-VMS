import React, { useState, useRef, useEffect } from 'react';
import {
  Monitor,
  Maximize2,
  Minimize2,
  RotateCw,
  Clipboard,
  Shield,
  Sliders,
  Power,
  Keyboard,
  Check,
  X
} from 'lucide-react';

interface VNCConsoleProps {
  vmId?: string;
  vmName?: string;
  vncPort?: number;
}

export const VNCConsole: React.FC<VNCConsoleProps> = ({
  vmId = 'vm-1042',
  vmName = 'Production Web Node 01',
  vncPort = 25901,
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isScaled, setIsScaled] = useState(true);
  const [showClipboard, setShowClipboard] = useState(false);
  const [clipboardText, setClipboardText] = useState('');
  const [sentAlert, setSentAlert] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render a simulated live QEMU display buffer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      // Draw background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw top status bar of guest OS
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, 32);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '12px Plus Jakarta Sans, sans-serif';
      ctx.fillText(`Quala VMS Guest OS Display — ${vmName}`, 16, 20);

      const timeStr = new Date().toLocaleTimeString();
      ctx.fillText(timeStr, canvas.width - 90, 20);

      // Draw console terminal area or mock server desktop
      ctx.fillStyle = '#020617';
      ctx.fillRect(24, 48, canvas.width - 48, canvas.height - 72);

      ctx.strokeStyle = '#334155';
      ctx.strokeRect(24, 48, canvas.width - 48, canvas.height - 72);

      // Terminal text inside guest display
      ctx.fillStyle = '#a855f7';
      ctx.font = '14px JetBrains Mono, monospace';
      ctx.fillText('Ubuntu 24.04 LTS web-prod-01 tty1', 40, 75);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '13px JetBrains Mono, monospace';
      ctx.fillText(`web-prod-01 login: ubuntu`, 40, 105);
      ctx.fillText(`Password: **********`, 40, 130);
      ctx.fillText(`Last login: ${new Date(Date.now() - 1000 * 60 * 30).toLocaleString()} on tty1`, 40, 160);
      ctx.fillText(`System load: 0.28, 0.35, 0.22 | Memory usage: 4.4GB / 8.0GB`, 40, 185);
      ctx.fillText(`IPv4 Address for eth0: 198.51.100.42`, 40, 210);

      ctx.fillStyle = '#10b981';
      ctx.fillText(`● active (running) - Nginx Reverse Proxy Cluster [PID 840]`, 40, 245);
      ctx.fillText(`● active (running) - QEMU Guest Agent VirtIO [PID 902]`, 40, 270);
      ctx.fillText(`● active (running) - Node.js Production Worker [PID 1042]`, 40, 295);

      // Blinking cursor
      if (frame % 2 === 0) {
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(40, 320, 8, 16);
      }
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`ubuntu@web-prod-01:~$ `, 40, 332);
    }, 500);

    return () => clearInterval(interval);
  }, [vmName]);

  const sendCtrlAltDel = () => {
    setSentAlert('Sent keystroke: Ctrl+Alt+Del to QEMU guest');
    setTimeout(() => setSentAlert(null), 3000);
  };

  const handleReconnect = () => {
    setIsConnected(false);
    setTimeout(() => {
      setIsConnected(true);
      setSentAlert('noVNC connection re-established on port ' + vncPort);
      setTimeout(() => setSentAlert(null), 3000);
    }, 500);
  };

  return (
    <div
      className={`glass-panel rounded-2xl border border-purple-500/20 overflow-hidden shadow-2xl flex flex-col transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-[#0a0a14]' : 'h-[580px]'
      }`}
    >
      {/* noVNC Top Bar (Rule 14 requirements) */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/60 border-b border-purple-500/15">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-white font-sans">noVNC Graphical Console</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/40 border border-white/5 text-[11px] font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <span className={isConnected ? 'text-emerald-400' : 'text-rose-400'}>
              {isConnected ? `Connected :${vncPort}` : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Toolbar buttons: [Ctrl+Alt+Del] [Scale] [Clipboard] [Reconnect] [Fullscreen] */}
        <div className="flex items-center gap-2">
          {sentAlert && (
            <span className="text-xs text-purple-300 font-mono animate-in fade-in mr-2 hidden sm:inline">
              {sentAlert}
            </span>
          )}

          <button
            onClick={sendCtrlAltDel}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 text-xs font-mono transition-colors"
            title="Send Ctrl+Alt+Del keystroke"
          >
            <Keyboard className="w-3.5 h-3.5 text-purple-400" />
            <span>Ctrl+Alt+Del</span>
          </button>

          <button
            onClick={() => setIsScaled(!isScaled)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
              isScaled ? 'bg-purple-600/20 text-purple-300' : 'bg-white/5 text-slate-400'
            }`}
            title="Toggle Scaling"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scale</span>
          </button>

          <button
            onClick={() => setShowClipboard(!showClipboard)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors"
            title="Remote Clipboard"
          >
            <Clipboard className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={handleReconnect}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors"
            title="Reconnect"
          >
            <RotateCw className="w-4 h-4 text-slate-400" />
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

      {/* Clipboard Drawer/Modal */}
      {showClipboard && (
        <div className="bg-slate-900/90 border-b border-purple-500/20 p-3 flex items-center gap-3">
          <input
            type="text"
            value={clipboardText}
            onChange={(e) => setClipboardText(e.target.value)}
            placeholder="Paste text here to send to remote QEMU clipboard..."
            className="flex-1 px-3 py-1.5 rounded-lg bg-black/50 border border-purple-500/30 text-white text-xs font-mono focus:outline-none"
          />
          <button
            onClick={() => {
              setSentAlert('Copied to guest OS clipboard buffer');
              setShowClipboard(false);
              setTimeout(() => setSentAlert(null), 3000);
            }}
            className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-500"
          >
            Send to VNC
          </button>
          <button
            onClick={() => setShowClipboard(false)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Graphical Framebuffer Canvas */}
      <div className="flex-1 bg-[#020617] flex items-center justify-center p-2 overflow-auto">
        <canvas
          ref={canvasRef}
          width={800}
          height={480}
          className={`rounded-lg shadow-2xl transition-all ${
            isScaled ? 'max-w-full max-h-full object-contain' : 'w-[800px] h-[480px]'
          }`}
        />
      </div>

      {/* Footer Info */}
      <div className="px-4 py-1.5 bg-black/80 border-t border-purple-500/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span>RFB Protocol 003.008 (QEMU VNC)</span>
          <span>Truecolor 24-bit 800x480</span>
        </div>
        <div className="flex items-center gap-1.5 text-purple-400">
          <Shield className="w-3 h-3" />
          <span>WebSocket WSS Encrypted</span>
        </div>
      </div>
    </div>
  );
};
