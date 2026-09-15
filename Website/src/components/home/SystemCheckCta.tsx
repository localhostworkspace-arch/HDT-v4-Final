import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ArrowRight, Sparkles, CheckCircle2, Zap } from 'lucide-react';

export const SystemCheckCta: React.FC = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-8 sm:p-12 lg:p-16 shadow-2xl overflow-hidden">
          
          {/* Decorative blur backdrop */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Instant Full Diagnostics</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
                Want to Inspect Your Complete System Information?
              </h2>
              
              <p className="text-slate-300 text-base sm:text-lg max-w-2xl mb-8 leading-relaxed">
                Scan your operating system, CPU core topology, GPU renderer capabilities, WebGL 2.0 extensions, display color gamut, audio interfaces, and network parameters in one unified report.
              </p>

              {/* Badges list */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>GPU &amp; VRAM Extension Matrix</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>CPU Hardware Concurrency</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Screen Refresh &amp; Color Depth</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WebAudio 32-bit Float Support</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WebHID &amp; Gamepad Bus</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-Time Network Telemetry</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  to="/cpu-test"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all group"
                >
                  <Cpu className="w-5 h-5" />
                  <span>Run System Benchmark</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/gpu-test"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900/50 hover:bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/80 font-semibold text-base transition-all group"
                >
                  <Zap className="w-4 h-4 text-indigo-400" />
                  <span>Test 3D Graphics</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Mini Graphic Card */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-900/90 border border-indigo-500/20 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-mono text-indigo-400 font-semibold">DIAGNOSTIC STATUS</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ALL SYSTEMS OK
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 text-xs">
                    <span className="text-slate-400">Memory Integrity</span>
                    <span className="font-mono font-semibold text-white">Nominal</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 text-xs">
                    <span className="text-slate-400">Input Polling Latency</span>
                    <span className="font-mono font-semibold text-emerald-400">&lt; 0.5 ms</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 text-xs">
                    <span className="text-slate-400">WebGL Shader Core</span>
                    <span className="font-mono font-semibold text-indigo-400">Active (4K HDR)</span>
                  </div>
                </div>

                <div className="pt-2 text-left">
                  <p className="text-xs text-slate-400">
                    Zero installations • Zero registration required
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
