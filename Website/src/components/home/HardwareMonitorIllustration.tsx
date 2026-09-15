import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Gamepad2, 
  Monitor, 
  Zap, 
  CheckCircle2, 
  Volume2, 
  ArrowUpRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const HardwareMonitorIllustration: React.FC = () => {
  const [fps, setFps] = useState(165);
  const [latency, setLatency] = useState(0.4);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });

  // Subtle simulated live telemetry oscillation
  useEffect(() => {
    const interval = setInterval(() => {
      setFps(Math.floor(160 + Math.random() * 8));
      setLatency(Number((0.35 + Math.random() * 0.15).toFixed(2)));
      
      const angle = Date.now() / 1000;
      setStickPos({
        x: Math.sin(angle) * 12,
        y: Math.cos(angle * 1.5) * 10
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
      
      {/* Ambient background glows */}
      <div className="absolute -top-12 -left-12 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      
      {/* Main Glass Dashboard Card */}
      <div className="relative rounded-3xl bg-slate-900/80 dark:bg-[#0E1526]/90 border border-slate-700/60 dark:border-slate-800/90 shadow-2xl p-5 sm:p-6 backdrop-blur-2xl">
        
        {/* Top Bar of the Mock Dashboard */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-xs font-mono text-slate-400 ml-2 font-medium">
              hardware-lab://v2.4/live-telemetry
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Sensor Bus
            </span>
          </div>
        </div>

        {/* 2x2 Telemetry Grid inside the illustration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
          
          {/* Card 1: Display & GPU Render Frame Time */}
          <div className="p-4 rounded-2xl bg-slate-800/50 dark:bg-slate-900/60 border border-slate-700/40 hover:border-indigo-500/30 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Monitor className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-300">Display Refresh</span>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                G-Sync Active
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white tracking-tight">{fps}</span>
              <span className="text-xs font-medium text-slate-400">Hz / FPS</span>
            </div>
            
            {/* Waveform Bar Mini-Graph */}
            <div className="flex items-end gap-1 h-6 mt-2 pt-1">
              {[40, 65, 80, 75, 90, 85, 95, 90, 100, 95, 90, 100, 95].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-indigo-600 to-purple-400 rounded-xs transition-all duration-300"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Card 2: Input Latency & Polling Rate */}
          <div className="p-4 rounded-2xl bg-slate-800/50 dark:bg-slate-900/60 border border-slate-700/40 hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-300">Input Polling</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                8000 Hz
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white tracking-tight">{latency}</span>
              <span className="text-xs font-medium text-slate-400">ms Latency</span>
            </div>

            {/* Sub-bar indicator */}
            <div className="w-full bg-slate-700/50 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-400 via-indigo-400 to-purple-500 h-full w-[94%] rounded-full" />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1 font-mono">
              <span>0.1ms</span>
              <span className="text-emerald-400 font-semibold">Sub-Millisecond Perfect</span>
            </div>
          </div>

          {/* Card 3: Gamepad Analog Stick Circularity Test */}
          <div className="p-4 rounded-2xl bg-slate-800/50 dark:bg-slate-900/60 border border-slate-700/40 hover:border-indigo-500/30 transition-all flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-300">Controller Drift</span>
              </div>
              <span className="text-lg font-black text-white block tracking-tight">0.2% Error</span>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Zero Deadzone Drift
              </span>
            </div>

            {/* Interactive stick circularity canvas mock */}
            <div className="relative w-14 h-14 rounded-full border border-dashed border-indigo-400/40 flex items-center justify-center bg-slate-950/60">
              <div className="absolute w-2 h-2 rounded-full bg-indigo-500/40" />
              <div 
                className="w-4 h-4 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md shadow-indigo-500/50 transition-transform duration-200"
                style={{
                  transform: `translate(${stickPos.x}px, ${stickPos.y}px)`
                }}
              />
            </div>
          </div>

          {/* Card 4: Audio Dynamic Spectrum FFT */}
          <div className="p-4 rounded-2xl bg-slate-800/50 dark:bg-slate-900/60 border border-slate-700/40 hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Volume2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-300">Spatial Audio FFT</span>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                96 kHz 32-bit
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-white tracking-tight">-48 dB</span>
              <span className="text-xs text-slate-400">Noise Floor</span>
            </div>

            {/* Live Audio Equalizer Bars */}
            <div className="flex items-end gap-1 h-5 mt-2">
              {[20, 45, 70, 95, 60, 85, 40, 65, 90, 50, 30].map((bar, i) => (
                <div
                  key={i}
                  className="flex-1 bg-cyan-400/70 rounded-xs"
                  style={{ height: `${bar}%` }}
                />
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Hardware Status Strip */}
        <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span className="font-medium">Parallel Web Workers:</span>
            <span className="font-mono text-indigo-300 font-semibold">{navigator?.hardwareConcurrency || 16} Threads Ready</span>
          </div>
          <Link
            to="/gpu-test"
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
          >
            <span>Launch Benchmark</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* Floating interactive badge - safely positioned at top right without overlapping readouts */}
      <div className="hidden sm:flex absolute -top-5 -right-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 shadow-xl backdrop-blur-xl items-center gap-3 animate-float z-10">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-white">100% In-Browser Engine</p>
          <p className="text-xs text-slate-400">0 Downloads • 0 Installs</p>
        </div>
      </div>
    </div>
  );
};
