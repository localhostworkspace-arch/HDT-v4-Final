import React, { useState } from 'react';
import { 
  ArrowRight, 
  Play, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  CheckCircle, 
  X
} from 'lucide-react';
import { HardwareMonitorIllustration } from './HardwareMonitorIllustration';

export const HeroSection: React.FC = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <section className="relative pt-6 pb-20 md:pt-12 md:pb-28 overflow-hidden">
      
      {/* Subtle background glow spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Top Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6 shadow-sm hover:bg-indigo-500/15 transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Next-Gen Hardware Diagnostics 2.0</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white dark:text-white light:text-slate-900 leading-[1.1] mb-6">
              Test Your PC, Devices &amp; Hardware{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300">
                All in One Place
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-lg sm:text-xl text-slate-300 dark:text-slate-300 light:text-slate-600 max-w-2xl leading-relaxed mb-8 font-normal">
              Fast, reliable browser-based tools to test your hardware, peripherals, performance and connectivity. No downloads. No installation.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <a
                href="#instruments"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/45 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group"
              >
                <span>Explore All Tools</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>

              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/60 font-semibold text-base shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Key Value Micro-Points */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 w-full">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-slate-300">100% Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-slate-300">Sub-ms Precision</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-slate-300">Private &amp; Secure</span>
              </div>
            </div>

          </div>

          {/* Right Hero Illustration */}
          <div className="lg:col-span-5 relative">
            <HardwareMonitorIllustration />
          </div>

        </div>
      </div>

      {/* Video Modal Demo */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setIsVideoModalOpen(false)}
          />
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-lg text-white">HardwareLab Quick Interactive Demo</h3>
              </div>
              <button 
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mb-4 animate-pulse">
                <Play className="w-8 h-8 fill-indigo-400 ml-1" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Instant Diagnostics in Action</h4>
              <p className="text-sm text-slate-400 max-w-md mb-6">
                All 12 diagnostic suites run locally inside your browser with WebHID, WebAudio, WebGL 2.0, and Web Workers.
              </p>
              <a
                href="#instruments"
                onClick={() => setIsVideoModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30"
              >
                Launch Testing Suite Now &rarr;
              </a>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
