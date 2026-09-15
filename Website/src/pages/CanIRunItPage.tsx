import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Cpu, Layers, Search, ShieldCheck, Loader2, ScanLine, RotateCcw, ExternalLink } from 'lucide-react';
import { SeoHead } from '../components/seo/SeoHead';
import { SearchBar } from '../components/tools/CanIRunIt/SearchBar';
import { PopularItems } from '../components/tools/CanIRunIt/PopularItems';
import { HardwareSummary } from '../components/tools/CanIRunIt/HardwareSummary';
import { ManualHardwareForm } from '../components/tools/CanIRunIt/ManualHardwareForm';
import { CompatibilityHero } from '../components/tools/CanIRunIt/CompatibilityHero';
import { RequirementTable } from '../components/tools/CanIRunIt/RequirementTable';
import { ComponentBreakdown } from '../components/tools/CanIRunIt/ComponentBreakdown';
import { BottleneckAlert } from '../components/tools/CanIRunIt/BottleneckAlert';
import { PerformanceEstimateCard } from '../components/tools/CanIRunIt/PerformanceEstimate';
import { StorageCheck } from '../components/tools/CanIRunIt/StorageCheck';
import { OSCheck } from '../components/tools/CanIRunIt/OSCheck';
import { GameCard } from '../components/tools/CanIRunIt/GameCard';
import type { HardwareProfile, CompatibilityItem, CompatibilityResult } from '../types';
import { detectHardwareProfile } from '../services/hardwareService';
import { calculateCompatibility } from '../services/compatibilityService';
import { POPULAR_GAMES, POPULAR_SOFTWARE, ALL_GAMES, ALL_SOFTWARE } from '../data/compatibilityData';

type PageState = 'search' | 'result';

export const CanIRunItPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const [pageState, setPageState] = useState<PageState>('search');
  const [profile, setProfile] = useState<HardwareProfile | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CompatibilityItem | null>(null);
  const [result, setResult] = useState<CompatibilityResult | null>(null);

  // ─── Hardware Detection ───────────────────────────────────────────────
  const detectHardware = useCallback(async () => {
    setIsDetecting(true);
    try {
      const detected = await detectHardwareProfile();
      setProfile(detected);
    } catch {
      setProfile(null);
    }
    setIsDetecting(false);
  }, []);

  useEffect(() => {
    detectHardware();
  }, [detectHardware]);

  // ─── Direct URL Slug Support ──────────────────────────────────────────
  useEffect(() => {
    if (slug) {
      const allItems = [...ALL_GAMES, ...ALL_SOFTWARE];
      const match = allItems.find(
        (i) => i.id.toLowerCase() === slug.toLowerCase() || i.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug.toLowerCase()
      );
      if (match) {
        setSelectedItem(match);
        if (profile) {
          const r = calculateCompatibility(profile, match);
          setResult(r);
          setPageState('result');
        }
      }
    }
  }, [slug, profile]);

  // ─── Selection Handler ────────────────────────────────────────────────
  const handleItemSelect = useCallback(
    (item: CompatibilityItem) => {
      setSelectedItem(item);
      if (profile) {
        const r = calculateCompatibility(profile, item);
        setResult(r);
        setPageState('result');
        // Scroll to top of result
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
      } else {
        // No profile yet — show manual form
        setShowManualForm(true);
      }
    },
    [profile]
  );

  const handleManualSubmit = useCallback(
    (manualProfile: HardwareProfile) => {
      setProfile(manualProfile);
      setShowManualForm(false);
      if (selectedItem) {
        const r = calculateCompatibility(manualProfile, selectedItem);
        setResult(r);
        setPageState('result');
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
      }
    },
    [selectedItem]
  );

  const handleReset = () => {
    setPageState('search');
    setSelectedItem(null);
    setResult(null);
  };

  // ─── Result State ──────────────────────────────────────────────────────────
  if (pageState === 'result' && result) {
    return (
      <main className="min-h-screen bg-[#0B0F19] text-slate-100">
        <SeoHead
          title={`Can I Run ${result.item.name}? | HardwareTest`}
          description={`Check if your PC can run ${result.item.name}. Compatibility: ${result.overallScore}%.`}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
            <button onClick={handleReset} className="hover:text-indigo-400 transition-colors flex items-center gap-1">
              <Search className="w-3.5 h-3.5" />
              Can I Run It?
            </button>
            <span>/</span>
            <span className="text-slate-300">{result.item.name}</span>
          </nav>

          <div className="space-y-6">
            {/* Main result hero */}
            <CompatibilityHero result={result} />

            {/* Explanation bullets */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-700/60 p-5">
              <h3 className="font-bold text-white text-sm mb-3">Why This Result?</h3>
              <ul className="space-y-1.5">
                {result.explanations.map((line, i) => (
                  <li key={i} className="text-sm text-slate-300 leading-relaxed">{line}</li>
                ))}
              </ul>
            </div>

            {/* Your PC strip */}
            {profile && (
              <HardwareSummary
                profile={profile}
                isDetecting={isDetecting}
                onChangePC={() => setShowManualForm(true)}
                onReDetect={detectHardware}
              />
            )}
            {showManualForm && (
              <ManualHardwareForm
                onSubmit={handleManualSubmit}
                onCancel={() => setShowManualForm(false)}
              />
            )}

            {/* Bottleneck */}
            <BottleneckAlert result={result} />

            {/* Requirement table */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-700/60 p-5">
              <RequirementTable result={result} />
            </div>

            {/* Component breakdown */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-700/60 p-5">
              <ComponentBreakdown result={result} />
            </div>

            {/* Two-column: FPS + Storage/OS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceEstimateCard result={result} />
              <div className="space-y-4">
                <StorageCheck result={result} />
                <OSCheck result={result} />
              </div>
            </div>

            {/* Data source confidence */}
            <div className="rounded-2xl bg-slate-900/40 border border-slate-700/40 p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-300">Data source: </span>
                {result.item.requirementsMetadata.source}
                {result.item.requirementsMetadata.sourceUrl && (
                  <a
                    href={result.item.requirementsMetadata.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 ml-1.5 text-indigo-400 hover:underline"
                  >
                    View source <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <span className="ml-2 text-slate-500">
                  · Confidence: <span className="capitalize font-medium text-slate-400">{result.item.requirementsMetadata.confidence}</span>
                </span>
                <br />
                <span className="text-slate-500 mt-0.5 block">
                  Hardware detected locally in your browser. Your data is not sent to any server.
                </span>
              </div>
            </div>

            {/* Try another */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 text-sm font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Check Another
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ─── Search / Landing State ────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#0B0F19] text-slate-100 overflow-x-hidden">
      <SeoHead
        title="Can I Run It? — PC Game & Software Compatibility Checker | HardwareTest"
        description="Check whether your PC can run a game or software application. Instant hardware detection and compatibility analysis — no download required."
      />

      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />

      {/* Glow orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 right-0 w-96 h-96 bg-purple-700/8 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="text-center mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-sm font-semibold mb-6">
            <ScanLine className="w-4 h-4" />
            PC Compatibility Engine
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4">
            Can I{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300">
              Run It?
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed mb-10">
            Check whether your PC can run a game or software before you install or buy it.
          </p>

          {/* Search bar */}
          <SearchBar onSelect={handleItemSelect} />
        </div>

        {/* Popular games/software chips */}
        <div className="mb-14">
          <PopularItems
            onSelect={handleItemSelect}
            games={POPULAR_GAMES}
            software={POPULAR_SOFTWARE}
          />
        </div>

        {/* ── Your PC Strip ─────────────────────────────────────────────── */}
        <div className="mb-10">
          {showManualForm ? (
            <ManualHardwareForm
              onSubmit={handleManualSubmit}
              onCancel={() => setShowManualForm(false)}
            />
          ) : profile ? (
            <HardwareSummary
              profile={profile}
              isDetecting={isDetecting}
              onChangePC={() => setShowManualForm(true)}
              onReDetect={detectHardware}
            />
          ) : isDetecting ? (
            <div className="rounded-2xl bg-slate-900/60 border border-slate-700/60 p-6 flex items-center gap-4">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              <div>
                <p className="font-semibold text-white text-sm">Detecting your hardware...</p>
                <p className="text-xs text-slate-400 mt-0.5">Using browser APIs to scan GPU, CPU, and memory</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-900/60 border border-slate-700/60 p-6">
              <p className="text-slate-300 font-medium mb-4 text-sm">We need your PC specifications to check compatibility.</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={detectHardware}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/25"
                >
                  <ScanLine className="w-4 h-4" />
                  Detect My PC
                </button>
                <button
                  onClick={() => setShowManualForm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 text-sm font-medium transition-colors"
                >
                  Enter Hardware Manually
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Popular Grid ──────────────────────────────────────────────── */}
        <section aria-labelledby="popular-heading">
          <div className="flex items-center justify-between mb-5">
            <h2 id="popular-heading" className="text-base font-bold text-white flex items-center gap-2">
              <span>Popular Compatibility Checks</span>
            </h2>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Games ({ALL_GAMES.length})</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {ALL_GAMES.map((item) => (
                <GameCard key={item.id} item={item} onClick={handleItemSelect} />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Software ({ALL_SOFTWARE.length})</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {ALL_SOFTWARE.map((item) => (
                <GameCard key={item.id} item={item} onClick={handleItemSelect} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Info Bar ──────────────────────────────────────────────────── */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />, title: '100% Local Detection', desc: 'Your hardware data never leaves your device.' },
            { icon: <Cpu className="w-5 h-5 text-indigo-400" />, title: 'Real Requirements', desc: 'Official minimum & recommended specs from publishers.' },
            { icon: <Layers className="w-5 h-5 text-purple-400" />, title: 'Instant Results', desc: 'Compatibility calculated in under 100ms after detection.' },
          ].map((info) => (
            <div key={info.title} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">{info.icon}</div>
              <div>
                <h3 className="font-semibold text-white text-sm">{info.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{info.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};
