import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Play, Square, Share2, ShieldCheck, ExternalLink, ChevronRight } from 'lucide-react';
import { TOOLS_DATA } from '../data/toolsData';
import { SeoHead } from '../components/seo/SeoHead';
import { DynamicIcon } from '../components/common/DynamicIcon';

import { MediaTestBench } from '../components/tools/MediaTester/MediaTestBench';
import { useMediaDiagnostics } from '../components/tools/MediaTester/useMediaDiagnostics';
import { AdSenseSlot } from '../components/ads/AdSenseSlot';
import { ADSENSE_CONFIG } from '../config/adsense';

export const ToolDetailPage: React.FC = () => {
  const location = useLocation();
  return <ToolDetailContent key={location.pathname} />;
};

const ToolDetailContent: React.FC = () => {
  const location = useLocation();
  const slug = location.pathname.replace('/', '');
  const tool = TOOLS_DATA.find((t) => t.slug === slug) || TOOLS_DATA[0];

  const diagnostics = useMediaDiagnostics(slug);
  const { testActive, toggleTesting, error } = diagnostics;
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareError, setShareError] = useState(false);
  const mountedRef = useRef(true);
  const shareTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
    };
  }, []);
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      if (!mountedRef.current) return;
      setCopiedLink(true);
      setShareError(false);
      if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
      shareTimerRef.current = setTimeout(() => setCopiedLink(false), 2000);
    } catch { if (mountedRef.current) setShareError(true); }
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any modern browser',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD'
    },
    description: tool.fullDesc
  };

  return (
    <div className="min-h-screen pt-4 pb-24 text-slate-100 bg-[#070B14]">
      <SeoHead
        title={tool.metaTitle}
        description={tool.metaDescription}
        canonicalUrl={window.location.href}
        jsonLd={jsonLd}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Bar */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 overflow-x-auto py-1">
          <Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <Link to="/" className="hover:text-indigo-400 transition-colors">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="text-indigo-400 font-medium truncate">{tool.name}</span>
        </nav>

        {/* Tool Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 mb-6 border-b border-slate-800/80">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 border border-indigo-400/30 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 shrink-0">
              <DynamicIcon name={tool.iconName} className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {tool.categoryLabel}
                </span>
                {tool.badge && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {tool.badge}
                  </span>
                )}
                <span className="text-xs text-slate-400 font-mono">
                  Engine: Client-Side Native
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {tool.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-400 max-w-3xl mt-1 leading-relaxed">
                {tool.shortDesc}
              </p>
            </div>
          </div>

          {/* Header Action: Start / Stop Testing Button + Share */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* PROMINENT START / STOP TESTING BUTTON */}
            <button
              onClick={toggleTesting}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-lg ${
                testActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 ring-2 ring-rose-400/40 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
              }`}
            >
              {testActive ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Testing</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Testing</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>

        {(error || shareError) && <p role="alert" className="mb-6 rounded-xl border border-rose-500/30 bg-rose-950/30 p-4 text-sm text-rose-200">{error || 'Could not copy the link. Copy the address from your browser.'}</p>}
        {/* ACTIVE CAPTURE STATUS BANNER */}
        {testActive && (
          <div className="mb-6 px-4 py-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-4 shadow-lg shadow-emerald-950/20">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34D399] animate-ping" />
              <span>
                <strong>Testing Session Active:</strong> Real-time hardware stream engaged for {tool.name}.
              </span>
            </div>
            <button
              onClick={toggleTesting}
              className="px-3 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold cursor-pointer transition-all"
            >
              Stop Test
            </button>
          </div>
        )}

        {/* Interactive Testing Bench Area */}
        <div className="rounded-3xl bg-[#080D1A] border border-slate-800/80 p-6 sm:p-8 shadow-2xl mb-10">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${testActive ? 'bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse' : 'bg-slate-600'}`} />
              <span className="font-bold text-sm text-white">Interactive Diagnostic Environment</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTesting}
                className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  testActive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30'
                }`}
              >
                {testActive ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Testing</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Testing</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* DYNAMIC TAILORED TEST BENCH MODULES */}
          <div className="min-h-[360px] rounded-2xl bg-[#0B1324] border border-slate-800 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            
            {/* 1. SOUND TEST BENCH */}
            <MediaTestBench tool={tool} diagnostics={diagnostics} />

            {/* Live Telemetry Pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-6 pt-4 border-t border-slate-800/60">
              <span className="px-3 py-1.5 rounded-xl bg-[#080D1A] border border-slate-800 text-xs font-mono text-slate-300">
                Processing: <span className="text-emerald-400 font-bold">Local browser</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-[#080D1A] border border-slate-800 text-xs font-mono text-slate-300">
                Status: <span className={testActive ? 'text-emerald-400 font-bold' : 'text-slate-400'}>{testActive ? 'Active Stream' : 'Idle'}</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-[#080D1A] border border-slate-800 text-xs font-mono text-slate-300">
                Privacy: <span className="text-emerald-400 font-bold">100% Client-Side</span>
              </span>
            </div>

          </div>
        </div>

        {/* Google AdSense Placement - Tool Page In-Content Banner */}
        <AdSenseSlot 
          slotId={ADSENSE_CONFIG.slots.toolPageBanner} 
          format="horizontal" 
          className="my-6"
        />

        {/* 2-Column Info & Specs Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Detailed Overview & Features */}
          <div className="lg:col-span-8 space-y-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#080D1A] border border-slate-800">
              <h2 className="text-xl font-bold text-white mb-4">Overview &amp; Capabilities</h2>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base mb-6">
                {tool.fullDesc}
              </p>

              <h3 className="text-base font-bold text-white mb-3">Key Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tool.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#0B1324] border border-slate-800 text-xs sm:text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Guarantee Card */}
            <div className="p-6 rounded-3xl bg-indigo-950/30 border border-indigo-500/20 flex items-start gap-4">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white mb-1">Zero Data Storage Guarantee</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  All diagnostic calculations for {tool.name} are performed entirely inside your local browser memory space. No input streams, audio signals, or device metrics are transmitted across external networks.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Technical Specifications Table */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl bg-[#080D1A] border border-slate-800">
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4">
                Technical Specifications
              </h3>
              
              <div className="space-y-3">
                {tool.specs.map((sp, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#0B1324] border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-0.5">{sp.label}</span>
                    <span className="text-sm font-semibold text-white block">{sp.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800">
                <Link
                  to="/"
                  className="w-full py-3 rounded-xl bg-[#0B1324] hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Explore Other Tools</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ToolDetailPage;
