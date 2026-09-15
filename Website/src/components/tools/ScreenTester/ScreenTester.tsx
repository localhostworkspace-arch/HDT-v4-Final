import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Monitor, 
  Tv, 
  Smartphone, 
  Laptop, 
  Eye, 
  Layers, 
  Grid, 
  Maximize2, 
  Minimize2, 
  ChevronDown, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Sliders, 
  Sun, 
  Moon, 
  Clock, 
  Activity, 
  Compass,
  Flame,
  Palette,
  Keyboard as KeyboardIcon,
  Box,
  Film,
  Square
} from 'lucide-react';
import { SeoHead } from '../../seo/SeoHead';

// Predefined 20 solid color palette covering full RGB, CMYK, secondary hues, and greyscales
interface ColorItem {
  id: string;
  name: string;
  hex: string;
  textColor: string;
}

const PALETTE_COLORS: ColorItem[] = [
  { id: 'white', name: 'Pure White', hex: '#FFFFFF', textColor: '#000000' },
  { id: 'black', name: 'Pure Black', hex: '#000000', textColor: '#FFFFFF' },
  { id: 'pure-red', name: 'Pure Red (100% Sat)', hex: '#FF0000', textColor: '#FFFFFF' },
  { id: 'crimson', name: 'Crimson Red', hex: '#A8322D', textColor: '#FFFFFF' },
  { id: 'pure-green', name: 'Pure Green (100% Sat)', hex: '#00FF00', textColor: '#000000' },
  { id: 'emerald', name: 'Emerald Green', hex: '#10B981', textColor: '#000000' },
  { id: 'grass-green', name: 'Grass Green', hex: '#5C9E36', textColor: '#000000' },
  { id: 'pure-blue', name: 'Pure Blue (100% Sat)', hex: '#0000FF', textColor: '#FFFFFF' },
  { id: 'royal-blue', name: 'Royal Blue', hex: '#234ABF', textColor: '#FFFFFF' },
  { id: 'pure-cyan', name: 'Pure Cyan', hex: '#00FFFF', textColor: '#000000' },
  { id: 'teal', name: 'Teal Blue', hex: '#57A6A1', textColor: '#000000' },
  { id: 'pure-yellow', name: 'Pure Yellow', hex: '#FFFF00', textColor: '#000000' },
  { id: 'olive-yellow', name: 'Olive Yellow', hex: '#9FA638', textColor: '#000000' },
  { id: 'pure-magenta', name: 'Pure Magenta', hex: '#FF00FF', textColor: '#FFFFFF' },
  { id: 'vibrant-purple', name: 'Vibrant Purple', hex: '#8C389E', textColor: '#FFFFFF' },
  { id: 'vivid-orange', name: 'Vivid Orange', hex: '#FF6B00', textColor: '#FFFFFF' },
  { id: 'amber-gold', name: 'Amber Gold', hex: '#F59E0B', textColor: '#000000' },
  { id: 'dark-grey', name: 'OLED Dark Grey (15%)', hex: '#262A33', textColor: '#FFFFFF' },
  { id: 'neutral-grey', name: 'Neutral Grey (50%)', hex: '#808080', textColor: '#FFFFFF' },
  { id: 'silver-grey', name: 'Silver Grey (75%)', hex: '#C0C0C0', textColor: '#000000' },
];

export const ScreenTester: React.FC = () => {
  // Active Color State
  const [selectedColor, setSelectedColor] = useState<ColorItem>(PALETTE_COLORS[0]);
  const [currentColorStep, setCurrentColorStep] = useState(1);
  const [customHex] = useState('#FF6B00');
  const [isCustomActive, setIsCustomActive] = useState(false);

  // Fullscreen & UI States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState(2);
  const [showHud, setShowHud] = useState(true);
  const [hudTimeout, setHudTimeout] = useState<number | null>(null);

  // Automated Timed Screen Test State
  const [timedMode, setTimedMode] = useState<'solid' | 'video'>('solid');
  const [timedDuration, setTimedDuration] = useState<number>(30); // 30s, 60s, 120s
  const [isTimedTestActive, setIsTimedTestActive] = useState(false);
  const [timedTimeLeft, setTimedTimeLeft] = useState(30);
  const [testCompletedMessage, setTestCompletedMessage] = useState(false);

  // Screen Hardware Diagnostics State
  const [resolution, setResolution] = useState({ width: 1920, height: 1080 });
  const [dpr, setDpr] = useState(1);
  const [colorDepth, setColorDepth] = useState(24);
  const [displayFps, setDisplayFps] = useState(60);
  const [detectedHz, setDetectedHz] = useState<number | null>(null);
  const [deviceType, setDeviceType] = useState('Desktop Monitor');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fpsFrameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const autoPlayTimerRef = useRef<number | null>(null);
  const timedCountdownRef = useRef<number | null>(null);
  const timedCycleRef = useRef<number | null>(null);

  // Detect Hardware Display Telemetry
  useEffect(() => {
    // 1. Resolution & DPR
    const updateDisplayMetrics = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      setDpr(pixelRatio);
      
      const realWidth = Math.round(window.screen.width * pixelRatio);
      const realHeight = Math.round(window.screen.height * pixelRatio);
      setResolution({ width: realWidth, height: realHeight });
      setColorDepth(window.screen.colorDepth || 24);

      // Device categorization
      const ua = navigator.userAgent.toLowerCase();
      const isMobile = /mobile|android|iphone|ipad|tablet/i.test(ua) || window.innerWidth < 768;
      const isTablet = /ipad|tablet/i.test(ua) || (window.innerWidth >= 768 && window.innerWidth <= 1024);
      if (isMobile) {
        setDeviceType('Mobile Screen');
      } else if (isTablet) {
        setDeviceType('Tablet Display');
      } else if (window.screen.width > 2500) {
        setDeviceType('Desktop Monitor');
      } else {
        setDeviceType('Desktop Monitor');
      }
    };

    updateDisplayMetrics();
    window.addEventListener('resize', updateDisplayMetrics);

    // 2. High-precision Refresh Rate (Hz) Telemetry
    let animId: number;
    let frames = 0;
    const startTime = performance.now();

    const measureHz = () => {
      frames++;
      const now = performance.now();
      const elapsed = now - startTime;
      
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;
      if (delta > 0) {
        fpsFrameTimesRef.current.push(1000 / delta);
        if (fpsFrameTimesRef.current.length > 30) fpsFrameTimesRef.current.shift();
        const avgFps = Math.round(
          fpsFrameTimesRef.current.reduce((a, b) => a + b, 0) / fpsFrameTimesRef.current.length
        );
        setDisplayFps(avgFps);
      }

      if (elapsed >= 1000) {
        const calculatedHz = Math.round((frames / elapsed) * 1000);
        const standardHz = [60, 75, 90, 100, 120, 144, 165, 180, 240, 280, 360, 480, 540];
        const closest = standardHz.reduce((prev, curr) => 
          Math.abs(curr - calculatedHz) < Math.abs(prev - calculatedHz) ? curr : prev
        );
        setDetectedHz(closest);
      } else {
        animId = requestAnimationFrame(measureHz);
      }
    };

    animId = requestAnimationFrame(measureHz);
    return () => {
      window.removeEventListener('resize', updateDisplayMetrics);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Enter / Exit Fullscreen
  const enterFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
        setShowHud(true);
      }
    } catch {
      // Fallback
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fallback
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [enterFullscreen, exitFullscreen]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (fs) {
        setShowHud(true);
      } else if (isTimedTestActive) {
        setIsTimedTestActive(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [isTimedTestActive]);

  // Cycle Palette Colors
  const nextColor = useCallback(() => {
    setIsCustomActive(false);
    setSelectedColor((prev) => {
      const idx = PALETTE_COLORS.findIndex((c) => c.id === prev.id);
      const nextIdx = (idx + 1) % PALETTE_COLORS.length;
      setCurrentColorStep(nextIdx + 1);
      return PALETTE_COLORS[nextIdx];
    });
  }, []);

  const prevColor = useCallback(() => {
    setIsCustomActive(false);
    setSelectedColor((prev) => {
      const idx = PALETTE_COLORS.findIndex((c) => c.id === prev.id);
      const prevIdx = (idx - 1 + PALETTE_COLORS.length) % PALETTE_COLORS.length;
      setCurrentColorStep(prevIdx + 1);
      return PALETTE_COLORS[prevIdx];
    });
  }, []);

  // Start Timed Automated Test
  const startTimedTest = useCallback((mode = timedMode, duration = timedDuration) => {
    setTimedMode(mode);
    setTimedDuration(duration);
    setTimedTimeLeft(duration);
    setIsTimedTestActive(true);
    setTestCompletedMessage(false);
    enterFullscreen();

    // Solid color sweep cycle with all 20 colors evenly distributed across the duration
    if (mode === 'solid') {
      const intervalMs = Math.max(600, Math.round((duration * 1000) / PALETTE_COLORS.length));
      let curIdx = 0;
      setSelectedColor(PALETTE_COLORS[0]);
      setCurrentColorStep(1);

      if (timedCycleRef.current) clearInterval(timedCycleRef.current);
      timedCycleRef.current = window.setInterval(() => {
        curIdx = (curIdx + 1) % PALETTE_COLORS.length;
        setSelectedColor(PALETTE_COLORS[curIdx]);
        setCurrentColorStep(curIdx + 1);
      }, intervalMs);
    }
  }, [timedMode, timedDuration, enterFullscreen]);

  // Stop Timed Automated Test
  const stopTimedTest = useCallback(() => {
    setIsTimedTestActive(false);
    if (timedCountdownRef.current) clearInterval(timedCountdownRef.current);
    if (timedCycleRef.current) clearInterval(timedCycleRef.current);
    exitFullscreen();
  }, [exitFullscreen]);

  // Timed Test Countdown Timer
  useEffect(() => {
    if (isTimedTestActive) {
      timedCountdownRef.current = window.setInterval(() => {
        setTimedTimeLeft((prev) => {
          if (prev <= 1) {
            stopTimedTest();
            setTestCompletedMessage(true);
            setTimeout(() => setTestCompletedMessage(false), 6000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timedCountdownRef.current) clearInterval(timedCountdownRef.current);
      if (timedCycleRef.current) clearInterval(timedCycleRef.current);
    }
    return () => {
      if (timedCountdownRef.current) clearInterval(timedCountdownRef.current);
      if (timedCycleRef.current) clearInterval(timedCycleRef.current);
    };
  }, [isTimedTestActive, stopTimedTest]);

  // Auto-play timer effect (Manual toggle)
  useEffect(() => {
    if (isAutoPlaying && !isTimedTestActive) {
      autoPlayTimerRef.current = window.setInterval(() => {
        nextColor();
      }, autoPlayInterval * 1000);
    } else {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    }
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlaying, isTimedTestActive, autoPlayInterval, nextColor]);

  // 4K Ultra-HD HDR Color & Contrast Video Canvas Engine
  useEffect(() => {
    if (!isTimedTestActive || timedMode !== 'video') return;
    const canvas = videoCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    // Create 45 dynamic floating color particles
    const particles = Array.from({ length: 45 }).map(() => ({
      x: Math.random() * (canvas.width || 1920),
      y: Math.random() * (canvas.height || 1080),
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      radius: 20 + Math.random() * 80,
      hue: Math.floor(Math.random() * 360),
      alpha: 0.25 + Math.random() * 0.5
    }));

    const render4KDemo = () => {
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      t += 0.015;

      // Pure OLED Deep Black Background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Rotating Dynamic Color Gamut Swirls
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const numRays = 8;
      for (let i = 0; i < numRays; i++) {
        const angle = t * 0.8 + (i * Math.PI * 2) / numRays;
        const grad = ctx.createRadialGradient(
          cx + Math.cos(angle) * (canvas.width * 0.25),
          cy + Math.sin(angle) * (canvas.height * 0.25),
          10,
          cx,
          cy,
          canvas.width * 0.65
        );
        const hue = (Math.round(t * 50) + i * 45) % 360;
        grad.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.35)`);
        grad.addColorStop(0.5, `hsla(${(hue + 60) % 360}, 100%, 50%, 0.15)`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 2. High Dynamic Range Fluid Particle Flares
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const pGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        pGrad.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${p.alpha})`);
        pGrad.addColorStop(0.4, `hsla(${p.hue}, 100%, 50%, ${p.alpha * 0.5})`);
        pGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Central 4K UHD HDR Telemetry Emblem
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 24px Inter, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 12;
      ctx.fillText('4K / 8K ULTRA-HD HDR COLOR BENCHMARK', cx, cy - 20);

      ctx.font = '600 13px Inter, sans-serif';
      ctx.fillStyle = '#A5B4FC';
      ctx.fillText(
        `Resolution: ${canvas.width}×${canvas.height} • DCI-P3 Gamut • OLED Black Level: 0.000 nits`,
        cx,
        cy + 15
      );
      ctx.restore();

      animId = requestAnimationFrame(render4KDemo);
    };

    animId = requestAnimationFrame(render4KDemo);
    return () => cancelAnimationFrame(animId);
  }, [isTimedTestActive, timedMode]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        nextColor();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevColor();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        if (isTimedTestActive) stopTimedTest();
        else exitFullscreen();
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setShowHud((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextColor, prevColor, toggleFullscreen, exitFullscreen, isTimedTestActive, stopTimedTest]);

  // Active Display Color Hex & Text Color
  const activeHex = isCustomActive ? customHex : selectedColor.hex;
  const isDarkColor = activeHex === '#000000' || activeHex === '#262A33' || activeHex === '#3A3E45' || activeHex === '#234ABF' || activeHex === '#0000FF' || activeHex === '#8C389E' || activeHex === '#A8322D' || activeHex === '#FF0000' || activeHex === '#FF6B00';
  const activeTextColor = isDarkColor ? '#FFFFFF' : '#000000';
  const activeColorName = isCustomActive ? `Custom (${customHex})` : selectedColor.name;

  // Auto-hide HUD on mouse idle in fullscreen
  const handleMouseMove = () => {
    setShowHud(true);
    if (hudTimeout) window.clearTimeout(hudTimeout);
    if (isFullscreen) {
      const timeout = window.setTimeout(() => {
        setShowHud(false);
      }, 3000);
      setHudTimeout(timeout);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 selection:bg-indigo-500 selection:text-white pb-20" onMouseMove={handleMouseMove}>
      <SeoHead
        title="Online Screen Test — Free Monitor & Display Testing Tools | ScreenTester.io"
        description="Run screen tests directly in your browser. 20 solid color sweep, 4K video benchmark, dead pixel checker, backlight bleed inspector, and fullscreen precision testing."
      />

      {/* TOP HERO HEADER */}
      <section className="pt-8 pb-4 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-gradient-to-b from-[#0D1527] to-[#070B14]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Color & Greyscale Analysis
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              20+ Screen Test Tools
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Free · No Download
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <Monitor className="w-7 h-7 text-indigo-400 shrink-0" />
                Online Screen Test — Free Monitor & Display Testing
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                No downloads required. Run screen tests directly in your browser with 20-color sweep & pixel-perfect fullscreen precision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SUCCESS COMPLETION NOTIFICATION BANNER */}
      {testCompletedMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between shadow-xl animate-fadeIn">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-xs font-bold text-white">20-Color Screen Test Completed Successfully!</div>
                <div className="text-[11px] text-emerald-300">All 20 display color passes & frame render cycles finished with zero display freeze.</div>
              </div>
            </div>
            <button 
              onClick={() => setTestCompletedMessage(false)}
              className="text-xs font-bold text-emerald-400 hover:text-white px-2 py-1 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* MAIN SCREEN TEST STUDIO WORKBENCH */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* LEFT DISPLAY PREVIEW CARD (Flex-1 / 7 Cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <div 
              ref={containerRef}
              onClick={enterFullscreen}
              style={{ backgroundColor: isTimedTestActive && timedMode === 'video' ? '#000000' : activeHex }}
              className={`w-full rounded-3xl transition-all duration-150 flex flex-col justify-between p-6 cursor-pointer select-none shadow-2xl relative border border-slate-700/60 group overflow-hidden ${
                isFullscreen 
                  ? 'fixed inset-0 z-50 rounded-none border-none w-screen h-screen p-8' 
                  : 'min-h-[440px] sm:min-h-[500px] h-full'
              }`}
            >
              {/* VIDEO CANVAS WHEN TIMED 4K VIDEO DEMO IS RUNNING */}
              {isTimedTestActive && timedMode === 'video' && (
                <canvas 
                  ref={videoCanvasRef} 
                  className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
                />
              )}

              {/* TOP HEADER IN PREVIEW / COUNTDOWN PROGRESS BAR */}
              <div className="w-full flex items-center justify-between z-10">
                {isTimedTestActive ? (
                  <div className="flex items-center justify-between w-full p-2.5 sm:p-3 rounded-2xl bg-black/85 backdrop-blur-md border border-slate-700 text-white shadow-2xl">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      <span className="text-xs font-bold font-mono">
                        {timedMode === 'video' 
                          ? '4K Ultra-HD Video Demo' 
                          : `20-Color Sweep • Color ${currentColorStep}/20: ${selectedColor.name}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        {Math.floor(timedTimeLeft / 60)}:{String(timedTimeLeft % 60).padStart(2, '0')} / {timedDuration}s
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          stopTimedTest();
                        }}
                        className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-rose-600/30 cursor-pointer"
                      >
                        <Square className="w-3 h-3 fill-current" />
                        Stop Test
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md border ${
                      isDarkColor ? 'bg-black/40 text-white border-white/20' : 'bg-white/60 text-black border-black/20'
                    }`}>
                      Live Preview Canvas
                    </span>
                    <span className={`text-[10px] font-mono font-bold ${isDarkColor ? 'text-white/70' : 'text-black/70'}`}>
                      Click anywhere for Fullscreen
                    </span>
                  </div>
                )}
              </div>

              {/* CENTER TRANSLUCENT ACTION PILL (When test is inactive) */}
              {!isTimedTestActive && (
                <div className="my-auto mx-auto pointer-events-none z-10">
                  <div className={`px-6 py-5 rounded-2xl backdrop-blur-md border text-center shadow-2xl transition-all transform group-hover:scale-105 ${
                    isDarkColor 
                      ? 'bg-white/15 border-white/20 text-white' 
                      : 'bg-black/15 border-black/20 text-black'
                  }`}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2 opacity-90">
                      <Maximize2 className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold tracking-tight">
                      Click to Enter Fullscreen Test
                    </h3>
                    <p className="text-[11px] sm:text-xs opacity-80 mt-0.5 font-medium">
                      Check for dead pixels, bright spots and dark spots
                    </p>
                  </div>
                </div>
              )}

              {/* BOTTOM FOOTER BAR INSIDE PREVIEW */}
              {!isTimedTestActive && (
                <div className="w-full flex items-center justify-between text-xs font-bold pointer-events-none pt-4 z-10">
                  <div className="flex items-center gap-2" style={{ color: activeTextColor }}>
                    <Monitor className="w-4 h-4 shrink-0" />
                    <span className="drop-shadow-sm font-semibold">
                      {activeColorName} &bull; {activeHex.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono drop-shadow-sm" style={{ color: activeTextColor, opacity: 0.85 }}>
                    Press F for Fullscreen
                  </div>
                </div>
              )}

              {/* FULLSCREEN FLOATING HUD OVERLAY */}
              {isFullscreen && !isTimedTestActive && (
                <div 
                  className={`absolute bottom-6 left-1/2 -translate-x-1/2 transition-all duration-300 z-50 ${
                    showHud ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-2xl text-white text-xs">
                    <button
                      onClick={prevColor}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all cursor-pointer"
                    >
                      &larr; Prev
                    </button>

                    <div className="flex items-center gap-1 px-1 max-w-[320px] overflow-x-auto scrollbar-none">
                      {PALETTE_COLORS.map((col, idx) => (
                        <button
                          key={col.id}
                          onClick={() => {
                            setIsCustomActive(false);
                            setSelectedColor(col);
                            setCurrentColorStep(idx + 1);
                          }}
                          style={{ backgroundColor: col.hex }}
                          className={`w-4.5 h-4.5 rounded-md border transition-all cursor-pointer shrink-0 ${
                            !isCustomActive && selectedColor.id === col.id ? 'ring-2 ring-indigo-400 scale-125 z-10' : 'border-slate-700 opacity-70 hover:opacity-100'
                          }`}
                          title={`${col.name} (${idx + 1}/20)`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={nextColor}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all cursor-pointer"
                    >
                      Next &rarr;
                    </button>

                    <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-xl">
                      <button
                        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                        className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isAutoPlaying 
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' 
                            : 'bg-transparent hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {isAutoPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                        <span>{isAutoPlaying ? 'Pause' : 'Auto'}</span>
                      </button>
                      {[1, 2, 3, 5].map((sec) => (
                        <button
                          key={sec}
                          onClick={() => setAutoPlayInterval(sec)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                            autoPlayInterval === sec ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={exitFullscreen}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span>Exit (Esc)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT 4 CARDS (2x2 Grid / 5 Cols) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* CARD 1: SCREEN INFO */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#121624] border border-slate-800/90 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                    <Monitor className="w-4 h-4 text-indigo-400" />
                    <span className="text-slate-200">Screen Info</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    {deviceType}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Resolution */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Grid className="w-3.5 h-3.5 text-indigo-400/80" />
                      <span>Resolution</span>
                    </div>
                    <span className="font-mono font-bold text-white text-xs">
                      {resolution.width} &times; {resolution.height}
                    </span>
                  </div>

                  {/* Pixel Ratio DPR */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Box className="w-3.5 h-3.5 text-purple-400/80" />
                      <span>Pixel Ratio DPR</span>
                    </div>
                    <span className="font-mono font-bold text-white text-xs">
                      {dpr.toFixed(2)}x
                    </span>
                  </div>

                  {/* Color Depth */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Palette className="w-3.5 h-3.5 text-rose-400/80" />
                      <span>Color Depth</span>
                    </div>
                    <span className="font-mono font-bold text-white text-xs">
                      {colorDepth}-bit
                    </span>
                  </div>

                  {/* Refresh Rate */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Zap className="w-3.5 h-3.5 text-yellow-400/80" />
                      <span>Refresh Rate</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ~{detectedHz || displayFps} Hz
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: COLOR PICKER (20 Solid Colors 5x4 Grid) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#121624] border border-slate-800/90 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 mb-2.5">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                    <Palette className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-200">20 Color Palette</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                    20 Colors
                  </span>
                </div>

                {/* 20 Swatches 5x4 Grid */}
                <div className="grid grid-cols-5 gap-1.5">
                  {PALETTE_COLORS.map((col, idx) => {
                    const isSelected = !isCustomActive && selectedColor.id === col.id;
                    return (
                      <button
                        key={col.id}
                        onClick={() => {
                          setIsCustomActive(false);
                          setSelectedColor(col);
                          setCurrentColorStep(idx + 1);
                        }}
                        style={{ backgroundColor: col.hex }}
                        className={`h-6 rounded-md transition-all cursor-pointer border ${
                          isSelected 
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-[#121624] scale-110 z-10' 
                            : 'border-slate-700/70 hover:scale-105'
                        }`}
                        title={`${col.name} (${idx + 1}/20)`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Selected Color Name & Hex in Card 2 */}
              <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-800/80 mt-2 font-mono">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span 
                    className="w-2.5 h-2.5 rounded-full border border-slate-600 inline-block" 
                    style={{ backgroundColor: isCustomActive ? customHex : selectedColor.hex }} 
                  />
                  <span className="font-sans font-bold text-[11px] text-white">
                    {isCustomActive ? 'Custom' : selectedColor.name}
                  </span>
                </div>
                <span className="text-slate-400 text-[10px]">
                  {(isCustomActive ? customHex : selectedColor.hex).toUpperCase()}
                </span>
              </div>
            </div>

            {/* CARD 3: SHORTCUTS */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#121624] border border-slate-800/90 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 mb-3 text-amber-400 font-bold text-xs">
                  <KeyboardIcon className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-200">Shortcuts</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* Shortcut 1 */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#090C16] border border-slate-800 font-mono font-bold text-slate-300 text-[11px]">
                      &larr; &rarr;
                    </span>
                    <span className="text-slate-400 text-[11px]">Switch test color</span>
                  </div>

                  {/* Shortcut 2 */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#090C16] border border-slate-800 font-mono font-bold text-slate-300 text-[11px]">
                      F
                    </span>
                    <span className="text-slate-400 text-[11px]">Enter fullscreen</span>
                  </div>

                  {/* Shortcut 3 */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#090C16] border border-slate-800 font-mono font-bold text-slate-300 text-[11px]">
                      Esc
                    </span>
                    <span className="text-slate-400 text-[11px]">Exit fullscreen</span>
                  </div>
                </div>
              </div>

              {/* TV Remote Notice */}
              <div className="flex items-center gap-1.5 text-[10px] text-amber-400/90 pt-3 border-t border-slate-800/80 mt-2 font-medium">
                <Tv className="w-3.5 h-3.5 shrink-0" />
                <span>TV users can use remote arrow keys</span>
              </div>
            </div>

            {/* CARD 4: TIMED SCREEN TEST (20 SOLID COLORS SWEEP & 4K VIDEO) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#121624] to-[#151C30] border border-indigo-500/30 shadow-xl flex flex-col justify-between space-y-3 relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                    <Clock className="w-4 h-4 text-rose-400" />
                    <span className="text-white">Timed Screen Test</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    20 Colors Auto
                  </span>
                </div>

                {/* Mode Selector Toggle (20 Solid Colors vs 4K HDR Video) */}
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#090C16] border border-slate-800 mb-3">
                  <button
                    onClick={() => setTimedMode('solid')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      timedMode === 'solid'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Palette className="w-3 h-3" />
                    <span>20 Solid Colors</span>
                  </button>

                  <button
                    onClick={() => setTimedMode('video')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      timedMode === 'video'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Film className="w-3 h-3 text-cyan-400" />
                    <span>4K HDR Video</span>
                  </button>
                </div>

                {/* Timer Duration Selection Pills */}
                <div className="flex items-center justify-between gap-1.5 mb-2.5">
                  <span className="text-[11px] font-bold text-slate-400">Duration:</span>
                  <div className="flex gap-1">
                    {[30, 60, 120].map((dur) => (
                      <button
                        key={dur}
                        onClick={() => setTimedDuration(dur)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          timedDuration === dur
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                            : 'bg-[#090C16] text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {dur}s
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode description with calculated speed */}
                <p className="text-[10px] text-slate-400 leading-tight">
                  {timedMode === 'solid' 
                    ? `Sweeps all 20 pure solid colors (${(timedDuration / 20).toFixed(1)}s per color) over ${timedDuration}s to catch dead pixels & spots.` 
                    : `Runs a 4K 60FPS dynamic color spectrum and OLED black contrast video demo over ${timedDuration}s.`}
                </p>
              </div>

              {/* Start Timed Test Button */}
              {isTimedTestActive ? (
                <button
                  onClick={stopTimedTest}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Timed Test ({timedTimeLeft}s)</span>
                </button>
              ) : (
                <button
                  onClick={() => startTimedTest(timedMode, timedDuration)}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-black font-extrabold text-xs transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start {timedDuration}s 20-Color Test</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* WHY CHOOSE SCREENTESTER.IO? (3 Key Pillars) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Why Choose ScreenTester.io?
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            A professional screen testing platform with 20+ testing tools covering every display quality dimension.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#0B1324] border border-slate-800 hover:border-indigo-500/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Pixel-Perfect Precision</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pure color fullscreen + F11 fullscreen mode ensures test patterns cover every physical pixel. Keyboard shortcuts and multiple test modes leave no defect undetected.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0B1324] border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Laptop className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">All Devices Supported</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Phones, tablets, laptops, desktop monitors, TVs — any device with a screen. Just open the browser and test. No software or driver installation needed.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0B1324] border border-slate-800 hover:border-purple-500/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Complete Test Coverage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dead pixels, backlight bleed, greyscale, color accuracy, gamut, refresh rate, ghosting, blooming, color depth, HDR — 20+ professional tools covering every display quality metric.
            </p>
          </div>
        </div>
      </section>

      {/* HOW TO GET STARTED (3-Step Guided Flow) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80 bg-[#080D1A]/60 rounded-3xl my-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">Simple 3-Step Flow</span>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight mt-1">
            How to Get Started
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Just three steps to fully understand your screen's quality and identify defects within your warranty return window.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 relative space-y-3">
            <div className="text-4xl font-black text-indigo-500/30 font-mono">01</div>
            <h3 className="text-base font-bold text-white">Choose a Test Tool</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select dead pixel, backlight bleed, color accuracy, or other tests based on your needs. Beginners: start with dead pixel test — it's step one of any screen inspection.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 relative space-y-3">
            <div className="text-4xl font-black text-indigo-500/30 font-mono">02</div>
            <h3 className="text-base font-bold text-white">Go Fullscreen (F11)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Press F11 to enter browser fullscreen. Pure color patterns will cover the entire screen. Use arrow keys or click to cycle colors and carefully examine every corner.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 relative space-y-3">
            <div className="text-4xl font-black text-indigo-500/30 font-mono">03</div>
            <h3 className="text-base font-bold text-white">Review & Judge</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compare against quality standards: &ge;1 bright pixel warrants a return; severe bleed warrants a return. Check our inspection guides for detailed criteria.
            </p>
          </div>
        </div>
      </section>

      {/* SCREEN TROUBLESHOOTING GUIDE (Self-Diagnosis Steps) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="mb-10">
          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">Self-Diagnosis Solutions</span>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Screen Troubleshooting Guide
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Experiencing display issues? Use these proven step-by-step diagnostic workflows:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guide 1: Bright/Dark Spots */}
          <div className="p-6 rounded-3xl bg-[#0B1324] border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Bright/Dark Spots on Screen</h3>
                <span className="text-xs text-slate-400">Dead & Stuck Pixel Verification</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {[
                'First confirm with solid color fullscreen — rule out dust or surface smudges on the screen.',
                'Verify the same spot across multiple solid colors (Red, Green, Blue, White, Black).',
                '≥1 bright stuck pixel or ≥3 dark dead pixels — recommend immediate exchange within return window.',
                'Take a close-up smartphone photo of the defective pixel location as return evidence.'
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px]">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guide 2: Screen Edge Light Leakage */}
          <div className="p-6 rounded-3xl bg-[#0B1324] border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Screen Edge Light Leakage</h3>
                <span className="text-xs text-slate-400">Backlight Bleed vs. IPS Glow</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {[
                'Test in a totally dark room with pure black fullscreen and monitor brightness set to maximum.',
                'Distinguish IPS Glow (shifts position as you tilt your viewing angle) from true bleed (fixed position at bezels).',
                'Assess severity at your normal ergonomic seating distance (50-70cm).',
                'Severe bezel bleed warrants return; uniform corner IPS Glow is a normal panel characteristic.'
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px]">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guide 3: Inaccurate / Shifted Colors */}
          <div className="p-6 rounded-3xl bg-[#0B1324] border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Inaccurate / Shifted Colors</h3>
                <span className="text-xs text-slate-400">Color Temperature & Gamut Tinting</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {[
                'Confirm monitor OSD display preset is set to sRGB or factory-calibrated Standard mode.',
                '"Vivid/Gaming" modes oversaturate colors and clip highlights — do not use as reference.',
                'Grey backgrounds (50% grey) are most sensitive — green/magenta tint indicates calibration issues.',
                'For professional color grading, calibrate with a hardware colorimeter (e.g. SpyderX or Calibrite).'
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px]">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guide 4: Wrong Refresh Rate / Stuttering */}
          <div className="p-6 rounded-3xl bg-[#0B1324] border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Wrong Refresh Rate / Stuttering</h3>
                <span className="text-xs text-slate-400">144Hz/240Hz Frame Rate Diagnostics</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {[
                'Verify maximum refresh rate is explicitly selected in Windows Display Settings > Advanced Display.',
                'Check display cable — older HDMI 1.4/2.0 cables cap at 60Hz at 4K. Use DisplayPort 1.4 or HDMI 2.1.',
                'Laptops: confirm dedicated GPU MUX switch / direct connection (not iGPU hybrid pass-through).',
                'Some gaming monitors require manually toggling Overclock / High-Hz mode in the monitor OSD menu.'
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px]">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DEVICE INSPECTION GUIDES (Laptop, Mobile, TV, Monitor, OLED, LCD) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="mb-10">
          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">Hardware Workflows</span>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Device Inspection Guides
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Specialized testing workflows tailored for different display hardware and panel technologies:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#0B1324] border border-slate-800 hover:border-slate-700 transition-all space-y-2.5">
            <div className="flex items-center gap-2.5 text-indigo-400">
              <Laptop className="w-5 h-5" />
              <h3 className="font-bold text-white text-sm">Laptop Screen Test</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              8-step laptop inspection flow. PWM flicker, gamut misrepresentation, panel lottery — all covered.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0B1324] border border-slate-800 hover:border-slate-700 transition-all space-y-2.5">
            <div className="flex items-center gap-2.5 text-emerald-400">
              <Smartphone className="w-5 h-5" />
              <h3 className="font-bold text-white text-sm">Mobile Screen Test</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              OLED burn-in, touch dead zones, PWM flicker — essential for new and used phone inspections.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0B1324] border border-slate-800 hover:border-slate-700 transition-all space-y-2.5">
            <div className="flex items-center gap-2.5 text-purple-400">
              <Tv className="w-5 h-5" />
              <h3 className="font-bold text-white text-sm">TV Screen Test</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mini LED blooming, backlight bleed, MEMC motion smoothing verification. Must-do after new TV unboxing.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0B1324] border border-slate-800 hover:border-slate-700 transition-all space-y-2.5">
            <div className="flex items-center gap-2.5 text-cyan-400">
              <Monitor className="w-5 h-5" />
              <h3 className="font-bold text-white text-sm">Monitor Screen Test</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              IPS/VA/OLED panel testing, PPI scaling verification, G-Sync/FreeSync VRR validation.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0B1324] border border-slate-800 hover:border-slate-700 transition-all space-y-2.5">
            <div className="flex items-center gap-2.5 text-rose-400">
              <Flame className="w-5 h-5" />
              <h3 className="font-bold text-white text-sm">OLED Screen Test</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Burn-in, PWM flicker, ABL auto brightness limiter, near-black crush — OLED-specific diagnostics.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0B1324] border border-slate-800 hover:border-slate-700 transition-all space-y-2.5">
            <div className="flex items-center gap-2.5 text-yellow-400">
              <Sun className="w-5 h-5" />
              <h3 className="font-bold text-white text-sm">LCD Screen Test</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              IPS bleed, VA ghosting, Mini LED local dimming blooming — complete LCD panel evaluation.
            </p>
          </div>
        </div>

        {/* 4 USE CASES SECTION */}
        <div className="mt-12 pt-8 border-t border-slate-800/80">
          <h3 className="text-lg font-bold text-white mb-6">Popular Screen Inspection Use Cases</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-[#080D1A] border border-slate-800/80 space-y-2">
              <div className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                New Device Inspection
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                First thing after unboxing a new monitor, laptop, or phone — test dead pixels, bleed, and color accuracy within your exchange return window.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#080D1A] border border-slate-800/80 space-y-2">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Used & Refurbished Devices
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Essential pre-purchase screen check. OLED: check burn-in. LCD: check bleed. Verify screen hasn't been replaced with a cheap third-party panel.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#080D1A] border border-slate-800/80 space-y-2">
              <div className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                <Palette className="w-4 h-4" />
                Design & Color Grading
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Designers and photographers confirming screen color accuracy and gamut coverage. 100% sRGB is the minimum; wide DCI-P3 gamut is preferred.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#080D1A] border border-slate-800/80 space-y-2">
              <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                Gaming Optimization
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Gamers verifying refresh rate, response time, and VRR are working correctly. Catch the '144Hz advertised, 60Hz actual' problem before competitive matches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRO DISPLAY TESTING TIPS & BEST PRACTICES (6 Cards) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="mb-10">
          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">Inspection Best Practices</span>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Display Testing Pro Tips
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Follow these essential testing guidelines for maximum accuracy:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-[#0B1324] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
              <Clock className="w-4 h-4" />
              Warm Up 15-30 min
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Panel color temperature and brightness are unstable before warm-up. Wait at least 15 minutes after boot before color accuracy and greyscale tests for more reliable results.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B1324] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Sliders className="w-4 h-4" />
              Disable Enhancements
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Turn off vivid mode, dynamic contrast, HDR, and software color enhancements. Test in sRGB or Standard mode to avoid artificial distortion.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B1324] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
              <Monitor className="w-4 h-4" />
              Use Native Resolution
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Non-native resolution triggers OS scaling that can blur and hide dead pixels. Confirm system output resolution matches panel native resolution.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B1324] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
              <Zap className="w-4 h-4" />
              Use Proper Cables
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use certified DisplayPort 1.4 or HDMI 2.1 cables. Budget cables may not support high refresh/resolution, causing frame drops and color depth degradation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B1324] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <Moon className="w-4 h-4" />
              Dark Room for Bleed
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Backlight bleed must be tested in total darkness. Set pure black fullscreen at maximum brightness. Focus on corners and bezel junctions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B1324] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs">
              <Eye className="w-4 h-4" />
              Judge at Normal Distance
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              After close-up inspection, step back to normal seating distance (50-70cm). Flaws only visible with a magnifying glass do not affect daily use.
            </p>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS ACCORDION */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-10">
          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">Got Questions?</span>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Everything you need to know about browser-based display diagnostics and panel return criteria:
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Are these online screen test tools accurate?',
              a: 'Yes. We render pure color patterns directly into browser fullscreen, which instructs your GPU to drive output directly to every physical pixel on the display panel without scaling artifacts. Dead pixel and backlight bleed detection work on the exact same principles as professional laboratory testing rigs.'
            },
            {
              q: 'Do they work on mobile phones and tablets?',
              a: 'Yes. All tools are fully compatible with mobile browsers (iOS Safari, Android Chrome, iPadOS). For mobile phone testing, disable auto-brightness and True Tone, set screen brightness to 100%, and switch to fullscreen.'
            },
            {
              q: 'How many dead pixels are acceptable for an exchange?',
              a: 'Strictly speaking, any bright/stuck pixel (always lit white, red, green, or blue on a black background) is unacceptable and highly distracting. 1-2 dark dead pixels at the far outer perimeter are technically allowed under ISO 13406-2 Class II standards, but most retailers allow no-questions-asked returns within 14-30 days.'
            },
            {
              q: 'How long does display testing take?',
              a: 'A quick test (dead pixels + backlight bleed check) takes about 5 minutes. A complete 8-step quality evaluation (including greyscale transitions, response time ghosting, and text sharpness) takes approximately 15 to 20 minutes.'
            },
            {
              q: 'Why must I test in fullscreen mode (F11)?',
              a: 'Non-fullscreen mode leaves browser address bars, tabs, and OS taskbars covering the screen edges — exactly where manufacturing backlight bleed and stuck pixels are most commonly located. Fullscreen mode guarantees 100% edge-to-edge coverage.'
            },
            {
              q: 'Do I need a dark room for screen testing?',
              a: 'Backlight bleed and OLED black uniformity tests must be conducted in a dark room. Other tests (such as color accuracy, text rendering, and UFO ghosting) should be conducted under normal ambient room lighting.'
            }
          ].map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#0B1324] border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <span className="text-sm font-bold text-white flex items-center gap-2.5">
                    <span className="text-indigo-400 font-mono text-xs">Q.</span>
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL CALL TO ACTION BANNER */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-[#0E172E] to-purple-900/60 border border-indigo-500/30 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Pixel-Perfect Precision for Every Screen
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Whether you're inspecting a newly unboxed display, validating a used monitor purchase, or diagnosing OLED burn-in, ScreenTester.io provides the most comprehensive screen diagnostics — all free, directly in your browser.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                onClick={enterFullscreen}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
                Launch Fullscreen Test
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
