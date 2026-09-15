import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutGrid, Sparkles } from 'lucide-react';
import { SeoHead } from '../components/seo/SeoHead';
import { TOOLS_DATA } from '../data/toolsData';

export const NotAvailableToolPage: React.FC<{ toolName?: string }> = ({ toolName }) => {
  const location = useLocation();
  const slug = location.pathname.replace('/', '').replace('-tester', '-test');
  const matchedTool = TOOLS_DATA.find((t) => t.slug === slug || t.path === location.pathname);
  const displayName = toolName || matchedTool?.name || 'Diagnostic Module';

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <SeoHead
        title={`${displayName} - Currently Not Available | HardwareTest`}
        description={`${displayName} is temporarily unavailable. Please explore other available diagnostic tools.`}
      />

      <div className="max-w-lg w-full text-center p-8 sm:p-10 rounded-3xl bg-slate-900/80 dark:bg-[#0E1526]/90 border border-amber-500/30 shadow-2xl backdrop-blur-xl">
        {/* Warning Icon Badge */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 shadow-xl shadow-amber-500/10">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Module Status: Not Available
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
          {displayName}
        </h1>

        <p className="text-base text-slate-300 leading-relaxed mb-8">
          This hardware testing suite is currently <span className="text-amber-400 font-semibold">Not Available</span>. You can test your other hardware components using our active diagnostic tools below.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Browse Available Tools</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
