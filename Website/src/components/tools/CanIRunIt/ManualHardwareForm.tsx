import React, { useState } from 'react';
import { Cpu, Layers, MemoryStick, HardDrive, Monitor, X } from 'lucide-react';
import { createManualProfile } from '../../../services/hardwareService';
import type { HardwareProfile } from '../../../types';
import { GPU_BENCHMARKS, CPU_BENCHMARKS } from '../../../data/hardwareBenchmarks';

interface ManualHardwareFormProps {
  onSubmit: (profile: HardwareProfile) => void;
  onCancel: () => void;
}

const RAM_OPTIONS = [4, 8, 12, 16, 24, 32, 64, 128];
const VRAM_OPTIONS = [1, 2, 4, 6, 8, 10, 11, 12, 16, 24];
const STORAGE_OPTIONS = [5, 10, 20, 30, 50, 100, 200, 500, 1000];
const OS_OPTIONS = ['Windows 10 64-bit', 'Windows 11 64-bit', 'macOS', 'Linux', 'Other'];

export const ManualHardwareForm: React.FC<ManualHardwareFormProps> = ({ onSubmit, onCancel }) => {
  const [cpuQuery, setCpuQuery] = useState('');
  const [gpuQuery, setGpuQuery] = useState('');
  const [ramGB, setRamGB] = useState(16);
  const [vramGB, setVramGB] = useState<number | null>(8);
  const [storageGB, setStorageGB] = useState(100);
  const [os, setOs] = useState('Windows 10 64-bit');

  // CPU autocomplete
  const cpuSuggestions = cpuQuery.length > 1
    ? CPU_BENCHMARKS
        .filter((c) => c.name.toLowerCase().includes(cpuQuery.toLowerCase()) ||
          c.aliases.some((a) => a.toLowerCase().includes(cpuQuery.toLowerCase())))
        .slice(0, 6)
    : [];

  // GPU autocomplete
  const gpuSuggestions = gpuQuery.length > 1
    ? GPU_BENCHMARKS
        .filter((g) => g.name.toLowerCase().includes(gpuQuery.toLowerCase()) ||
          g.aliases.some((a) => a.toLowerCase().includes(gpuQuery.toLowerCase())))
        .slice(0, 6)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profile = createManualProfile({
      cpuName: cpuQuery || 'Unknown CPU',
      gpuName: gpuQuery || 'Unknown GPU',
      ramGB,
      vramGB,
      storageGB,
      operatingSystem: os,
    });
    onSubmit(profile);
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-700/60 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-white text-base">Enter Hardware Manually</h3>
          <p className="text-xs text-slate-400 mt-0.5">For the most accurate result, enter your actual specs.</p>
        </div>
        <button onClick={onCancel} aria-label="Cancel" className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* CPU */}
          <div className="relative">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" /> CPU
            </label>
            <input
              type="text"
              value={cpuQuery}
              onChange={(e) => setCpuQuery(e.target.value)}
              placeholder="e.g. Ryzen 5 5600X"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 focus:border-indigo-500/60 text-white placeholder-slate-500 text-sm outline-none transition-all"
            />
            {cpuSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-xl bg-slate-900 border border-slate-700 shadow-xl overflow-hidden">
                {cpuSuggestions.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setCpuQuery(c.name)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    <span>{c.name}</span>
                    <span className="text-xs text-slate-500">{c.cores}c · Score {c.performanceScore}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* GPU */}
          <div className="relative">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> GPU
            </label>
            <input
              type="text"
              value={gpuQuery}
              onChange={(e) => setGpuQuery(e.target.value)}
              placeholder="e.g. RTX 3060"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 focus:border-indigo-500/60 text-white placeholder-slate-500 text-sm outline-none transition-all"
            />
            {gpuSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-xl bg-slate-900 border border-slate-700 shadow-xl overflow-hidden">
                {gpuSuggestions.map((g) => (
                  <button
                    key={g.name}
                    type="button"
                    onClick={() => { setGpuQuery(g.name); setVramGB(g.vramGB); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    <span>{g.name}</span>
                    <span className="text-xs text-slate-500">{g.vramGB}GB VRAM · Score {g.performanceScore}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* RAM */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <MemoryStick className="w-3.5 h-3.5 text-purple-400" /> RAM
            </label>
            <select
              value={ramGB}
              onChange={(e) => setRamGB(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 focus:border-indigo-500/60 text-white text-sm outline-none transition-all"
            >
              {RAM_OPTIONS.map((v) => <option key={v} value={v}>{v} GB</option>)}
            </select>
          </div>

          {/* VRAM */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> VRAM
            </label>
            <select
              value={vramGB ?? ''}
              onChange={(e) => setVramGB(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 focus:border-indigo-500/60 text-white text-sm outline-none transition-all"
            >
              <option value="">Unknown</option>
              {VRAM_OPTIONS.map((v) => <option key={v} value={v}>{v} GB</option>)}
            </select>
          </div>

          {/* Storage */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <HardDrive className="w-3.5 h-3.5 text-amber-400" /> Free Storage
            </label>
            <select
              value={storageGB}
              onChange={(e) => setStorageGB(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 focus:border-indigo-500/60 text-white text-sm outline-none transition-all"
            >
              {STORAGE_OPTIONS.map((v) => <option key={v} value={v}>{v} GB</option>)}
            </select>
          </div>

          {/* OS */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <Monitor className="w-3.5 h-3.5 text-emerald-400" /> OS
            </label>
            <select
              value={os}
              onChange={(e) => setOs(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 focus:border-indigo-500/60 text-white text-sm outline-none transition-all"
            >
              {OS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5"
          >
            Check Compatibility
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-sm border border-slate-700/50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
