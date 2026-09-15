import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Info, X, Sparkles, Shield, Zap, HardDrive } from 'lucide-react';
import { ADSENSE_CONFIG } from '../../config/adsense';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export interface AdSenseSlotProps {
  /** Ad Slot ID from Google AdSense */
  slotId?: string;
  /** Ad format type: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical' | 'sidebar' */
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical' | 'sidebar';
  /** Whether to make the ad unit responsive */
  responsive?: boolean;
  /** Layout key for in-feed ads */
  layoutKey?: string;
  /** Custom wrapper CSS class */
  className?: string;
  /** Inline styles for the ad container */
  style?: React.CSSProperties;
  /** Show compliance "Advertisement" text above the unit (Recommended by Google) */
  showLabel?: boolean;
}

export const AdSenseSlot: React.FC<AdSenseSlotProps> = ({
  slotId = ADSENSE_CONFIG.slots.dashboardHorizontal,
  format = 'auto',
  responsive = true,
  layoutKey,
  className = '',
  style,
  showLabel = true,
}) => {
  const adRef = useRef<HTMLModElement | null>(null);
  const isPushedRef = useRef(false);
  const [demoDismissed, setDemoDismissed] = useState(false);

  // Check if we are in local development or if placeholder ID is still active
  const isPlaceholder = 
    !ADSENSE_CONFIG.clientId || 
    ADSENSE_CONFIG.clientId.includes('XXXXXXXXXXXXXXXX') ||
    import.meta.env.DEV;

  useEffect(() => {
    // If running in development or placeholder mode, do not push real adsbygoogle call
    if (isPlaceholder || !ADSENSE_CONFIG.enabled) {
      return;
    }

    if (adRef.current && !isPushedRef.current) {
      const alreadyLoaded = adRef.current.getAttribute('data-adsbygoogle-status');
      if (!alreadyLoaded) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          isPushedRef.current = true;
        } catch (err) {
          console.warn('[AdSense] Failed to push ad unit:', err);
        }
      }
    }
  }, [isPlaceholder, slotId]);

  // Completely hide the component if ads are disabled or if demo ads are turned off
  if (!ADSENSE_CONFIG.enabled || (isPlaceholder && !ADSENSE_CONFIG.showDemoAds) || demoDismissed) {
    return null;
  }

  return (
    <div className={`my-4 flex flex-col items-center justify-center w-full overflow-hidden ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between w-full max-w-5xl px-2 mb-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-500 select-none flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
            Advertisement &bull; Google AdSense Placement
          </span>
          <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-mono">
            Slot: {slotId}
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REAL GOOGLE ADSENSE (Rendered in production when real Publisher ID is set) */}
      {/* ========================================================================= */}
      {!isPlaceholder ? (
        <div className="w-full flex justify-center" style={style}>
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', ...(style || {}) }}
            data-ad-client={ADSENSE_CONFIG.clientId}
            data-ad-slot={slotId}
            data-ad-format={format === 'sidebar' ? 'rectangle' : format}
            data-full-width-responsive={responsive ? 'true' : 'false'}
            data-ad-layout-key={layoutKey}
          />
        </div>
      ) : (
        /* ========================================================================= */
        /* REALISTIC DEMO DISPLAY AD PREVIEWS (Shown in localhost / demo mode)       */
        /* ========================================================================= */
        <div className="w-full max-w-5xl relative group">
          
          {/* Top-Right Google AdChoices Controls */}
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <span className="text-[9px] font-sans font-medium text-slate-500 dark:text-slate-400">
              AdChoices
            </span>
            <div className="w-3 h-3 bg-blue-600 rounded-[2px] flex items-center justify-center text-white">
              <Info className="w-2 h-2" />
            </div>
            <button 
              onClick={() => setDemoDismissed(true)} 
              title="Close demo ad preview"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer ml-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* 1. HORIZONTAL LEADERBOARD DEMO (e.g. 728x90 / 970x90) */}
          {(format === 'horizontal' || format === 'auto') && (
            <div className="w-full rounded-2xl bg-gradient-to-r from-slate-900 via-[#0B1528] to-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 text-white shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="absolute inset-0 bg-radial-at-c from-blue-600/10 via-transparent to-transparent pointer-events-none" />
              
              <div className="flex items-center gap-4 z-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                  <HardDrive className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                      Sponsored
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      Next-Gen PCIe 5.0 NVMe SSD — Up to 14,000 MB/s
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Eliminate load times and hardware bottlenecks. Zero thermal throttling with graphene heat dissipation.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 z-1 w-full sm:w-auto justify-end">
                <div className="text-right hidden md:block">
                  <div className="text-xs text-emerald-400 font-semibold font-mono">Special: $149.99</div>
                  <div className="text-[10px] text-slate-400">Free Worldwide Delivery</div>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Shop Now</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 2. RECTANGLE DEMO (300x250) */}
          {format === 'rectangle' && (
            <div className="w-full max-w-[360px] mx-auto rounded-2xl bg-gradient-to-b from-indigo-950 via-[#0E172A] to-slate-900 border border-slate-200 dark:border-slate-800 p-5 text-white shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[220px]">
              <div className="flex items-center justify-between mb-2">
                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase">
                  Sponsored
                </span>
                <span className="text-[10px] text-slate-400 font-mono">NordPass Security</span>
              </div>
              <div className="my-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-3">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white leading-snug">
                  Hardware-grade Password Encryption
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Keep your gaming accounts, Steam credentials, and hardware profiles bulletproof.
                </p>
              </div>
              <button
                type="button"
                className="w-full mt-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30"
              >
                <span>Get 68% Off Deal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 3. SIDEBAR COMPACT DEMO */}
          {format === 'sidebar' && (
            <div className="w-full rounded-2xl bg-gradient-to-b from-slate-900 via-blue-950/40 to-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 text-white shadow-xs relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold uppercase">
                  Ad
                </span>
                <span className="text-[10px] text-slate-400">Pro Flight Gear</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white leading-tight">HOTAS Throttle &amp; Stick</h5>
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold">15% Off HDT Readers</span>
                </div>
              </div>
              <button
                type="button"
                className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Learn More</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Subtle Dev Note */}
          <div className="text-center mt-1.5">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono inline-flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
              Interactive Demo Ad &bull; In production, your approved Google AdSense ads will automatically replace this.
            </span>
          </div>

        </div>
      )}
    </div>
  );
};
