import React from 'react';
import { Zap, Sparkles, ShieldCheck, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { WHY_CHOOSE_US_DATA } from '../../data/toolsData';

export const WhyChooseUs: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-6 h-6 text-amber-400" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-indigo-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-emerald-400" />;
      case 'LayoutGrid':
      default:
        return <LayoutGrid className="w-6 h-6 text-cyan-400" />;
    }
  };

  return (
    <section className="relative py-20 md:py-28 bg-slate-950/40 dark:bg-slate-950/40 light:bg-slate-50 border-y border-slate-800/80">
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Engineered for Precision</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white dark:text-white light:text-slate-900 mb-4">
            Why Choose Our Testing Platform?
          </h2>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Experience benchmark-grade diagnostics directly from your web browser with uncompromising performance, total privacy, and instant availability.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_CHOOSE_US_DATA.map((card, idx) => (
            <div
              key={card.id}
              className="relative p-7 rounded-3xl bg-slate-900/80 dark:bg-[#0E1526]/90 light:bg-white border border-slate-700/60 dark:border-slate-800 hover:border-indigo-500/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 group flex flex-col justify-between"
            >
              <div>
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/90 dark:bg-slate-800/90 border border-slate-700/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getIcon(card.icon)}
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    0{idx + 1}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white dark:text-white light:text-slate-900 mb-2.5">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed mb-6">
                  {card.description}
                </p>
              </div>

              {/* Bottom Feature Pill */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs font-semibold text-indigo-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{card.highlight}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900/60 dark:bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <div className="text-center p-3">
            <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 block mb-1">
              0ms
            </span>
            <span className="text-xs font-medium text-slate-400">Download Wait Time</span>
          </div>
          <div className="text-center p-3">
            <span className="text-3xl sm:text-4xl font-black text-white block mb-1">
              12+
            </span>
            <span className="text-xs font-medium text-slate-400">Specialized Test Suites</span>
          </div>
          <div className="text-center p-3">
            <span className="text-3xl sm:text-4xl font-black text-white block mb-1">
              8000Hz
            </span>
            <span className="text-xs font-medium text-slate-400">Max Polling Rate Test</span>
          </div>
          <div className="text-center p-3">
            <span className="text-3xl sm:text-4xl font-black text-emerald-400 block mb-1">
              100%
            </span>
            <span className="text-xs font-medium text-slate-400">Privacy Guaranteed</span>
          </div>
        </div>

      </div>
    </section>
  );
};
