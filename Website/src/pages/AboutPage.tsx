import React from 'react';
import { SeoHead } from '../components/seo/SeoHead';
import { Sparkles, ShieldCheck, Zap, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-12 pb-24 text-slate-100">
      <SeoHead
        title="About HardwareTest | High-Performance Browser Diagnostics"
        description="Learn about HardwareTest, the modern browser-based hardware and peripheral diagnostics platform designed for PC gamers, engineers, and creators."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Our Mission</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-6">
            Empowering Hardware Diagnostics Without Barriers
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            We believe verifying your PC hardware, input peripherals, audio systems, and graphics performance should be fast, private, and accessible instantly without downloading executables.
          </p>
        </div>

        {/* Story Section */}
        <div className="space-y-8 mb-16">
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-2xl font-bold text-white">The Web as a First-Class Hardware Test Bench</h2>
            <p className="text-slate-300 leading-relaxed">
              With the arrival of WebHID, WebGPU, WebGL 2.0, Web Audio API, and high-frequency Web Workers, the browser is no longer limited to rendering static web pages. It is now a high-performance, sandboxed diagnostic environment capable of measuring sub-millisecond polling rates, 8000Hz gaming mice, 360Hz displays, and analog stick drift.
            </p>
            <p className="text-slate-300 leading-relaxed">
              HardwareTest was built to harness these native browser capabilities into a unified, beautiful, and distraction-free suite of tools.
            </p>
          </div>

          {/* 3 Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Zero Installation</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Open a URL and test immediately. No suspicious .exe files, no installers, no bloatware.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Absolute Privacy</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Client-side execution guarantees your inputs, mic, webcam, and device specs remain strictly local.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">100% Free Forever</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                No paywalls, subscriptions, or intrusive popups. High quality tools for everyone.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/40 border border-indigo-500/30">
          <h3 className="text-2xl font-bold text-white mb-3">Ready to Test Your Hardware?</h3>
          <p className="text-sm text-slate-400 mb-6">Explore our suite of 12+ online diagnostic tools right now.</p>
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2"
          >
            <span>Explore All Diagnostic Tools</span>
            &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
};
