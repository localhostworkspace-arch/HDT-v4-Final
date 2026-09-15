import React from 'react';
import { Cpu, Layers, MemoryStick, HardDrive, Monitor, AlertTriangle, RefreshCw } from 'lucide-react';
import type { HardwareProfile } from '../../../types';
import { getProfileConfidenceLabel } from '../../../services/hardwareService';

interface HardwareSummaryProps {
  profile: HardwareProfile;
  isDetecting: boolean;
  onChangePC: () => void;
  onReDetect: () => void;
}

export const HardwareSummary: React.FC<HardwareSummaryProps> = ({
  profile,
  isDetecting,
  onChangePC,
  onReDetect,
}) => {
  const label = getProfileConfidenceLabel(profile);

  const items = [
    {
      icon: <Cpu className="w-4 h-4 text-indigo-400" />,
      label: 'CPU',
      value: profile.cpu.name !== 'Unknown CPU'
        ? profile.cpu.name
        : `${profile.cpu.cores}-core CPU`,
      caveat: profile.cpu.name === 'Unknown CPU' ? 'Name not available via browser' : null,
    },
    {
      icon: <Layers className="w-4 h-4 text-cyan-400" />,
      label: 'GPU',
      value: profile.gpu.name !== 'Unknown GPU' ? profile.gpu.name : 'GPU not detected',
      caveat: profile.gpu.detectionConfidence === 'low' ? 'Browser detection limited' : null,
    },
    {
      icon: <MemoryStick className="w-4 h-4 text-purple-400" />,
      label: 'RAM',
      value: profile.ramGB != null ? `${profile.ramGB} GB` : 'Unknown',
      caveat: profile.ramGB != null ? 'Rounded estimate' : 'Not available',
    },
    {
      icon: <HardDrive className="w-4 h-4 text-amber-400" />,
      label: 'Storage',
      value: profile.storageAvailableGB != null ? `~${profile.storageAvailableGB} GB free` : 'Unknown',
      caveat: profile.storageAvailableGB != null ? 'Browser quota estimate' : null,
    },
    {
      icon: <Monitor className="w-4 h-4 text-emerald-400" />,
      label: 'OS',
      value: profile.operatingSystem,
      caveat: null,
    },
  ];

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-700/60 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-semibold text-white">Your PC</span>
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
              label === 'Auto-Detected'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : label === 'Manual Entry'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-slate-700/50 text-slate-400 border-slate-700'
            }`}
          >
            {isDetecting ? 'Detecting...' : label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReDetect}
            disabled={isDetecting}
            aria-label="Re-detect hardware"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
          <button
            onClick={onChangePC}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 transition-colors"
          >
            Change PC
          </button>
        </div>
      </div>

      {/* Hardware Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {items.map((item) => (
          <div key={item.label} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/40">
            <div className="flex items-center gap-1.5 mb-1">
              {item.icon}
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</span>
            </div>
            <span className="block text-sm font-semibold text-white leading-tight truncate" title={item.value}>
              {isDetecting ? (
                <span className="h-3 w-16 bg-slate-700 rounded animate-pulse inline-block" />
              ) : (
                item.value
              )}
            </span>
            {item.caveat && !isDetecting && (
              <span className="flex items-center gap-0.5 text-[10px] text-amber-400 mt-0.5">
                <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                {item.caveat}
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
        Hardware is detected locally in your browser. CPU name and GPU VRAM cannot be determined via browser APIs.{' '}
        <button onClick={onChangePC} className="text-indigo-400 hover:underline">Enter manually</button> for a more accurate result.
      </p>
    </div>
  );
};
