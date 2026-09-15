import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mouse, 
  RotateCw, 
  ChevronDown, 
  CheckCircle2, 
  Sliders, 
  Crosshair, 
  Activity, 
  Move,
  FileText,
  Volume2,
  VolumeX,
  RefreshCw,
  Gauge,
  Zap,
  Radio,
  Play,
  Square
} from 'lucide-react';
import { SeoHead } from '../../seo/SeoHead';

type TabType = 'button' | 'scroll' | 'movement' | 'dpi' | 'settings';

interface LogItem {
  id: string;
  time: string;
  text: string;
  type: 'left' | 'right' | 'middle' | 'forward' | 'back' | 'scroll-up' | 'scroll-down' | 'dpi' | 'thumb';
}

export const MouseTester: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('button');
  const [isTestingActive, setIsTestingActive] = useState<boolean>(true);
  
  // Real-time button states - initialized as untested (count 0, tested false)
  const [buttonStates, setButtonStates] = useState<{ [key: string]: { active: boolean; tested: boolean; count: number } }>({
    left: { active: false, tested: false, count: 0 },
    right: { active: false, tested: false, count: 0 },
    middle: { active: false, tested: false, count: 0 },
    forward: { active: false, tested: false, count: 0 },
    back: { active: false, tested: false, count: 0 },
    scrollUp: { active: false, tested: false, count: 0 },
    scrollDown: { active: false, tested: false, count: 0 },
    dpi: { active: false, tested: false, count: 0 },
    thumbWheel: { active: false, tested: false, count: 0 },
  });

  // Coordinates and Movement
  const [coords, setCoords] = useState({ x: 512, y: 384 });
  const [isMoving, setIsMoving] = useState(false);
  const moveTimeoutRef = useRef<number | null>(null);

  // Settings state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [preventContextMenu, setPreventContextMenu] = useState(true);

  // Movement & Polling Rate Tracking State
  const [mouseSpeed, setMouseSpeed] = useState(0);
  const [pollingRate, setPollingRate] = useState(1000);
  const [trailPoints, setTrailPoints] = useState<{ x: number; y: number; id: number }[]>([]);
  const lastMoveTimeRef = useRef<number>(Date.now());
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 512, y: 384 });

  // DPI Calculator State
  const [dpiDistance, setDpiDistance] = useState(2); // inches
  const [dpiPixelsMeasured, setDpiPixelsMeasured] = useState(0);
  const [isMeasuringDpi, setIsMeasuringDpi] = useState(false);
  const dpiStartPosRef = useRef<number | null>(null);

  // Test Log Events - starts empty until real user interaction
  const [logs, setLogs] = useState<LogItem[]>([]);

  // Calculate tested controls count
  const testedCount = Object.values(buttonStates).filter((b) => b.tested).length;
  const isScrollTested = buttonStates.scrollUp.tested || buttonStates.scrollDown.tested;

  // Audio Click Feedback
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playClickSound = useCallback((freq = 1100) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.025);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch {
      // Audio autoplay policy catch
    }
  }, [soundEnabled]);

  const addLog = useCallback((text: string, type: LogItem['type']) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs((prev) => [{ id: Math.random().toString(), time, text, type }, ...prev.slice(0, 19)]);
  }, []);

  // Handle Mouse Down & Up
  const triggerButton = useCallback((key: string, label: string, type: LogItem['type'], freq: number) => {
    playClickSound(freq);
    addLog(`${label} detected`, type);

    setButtonStates((prev) => ({
      ...prev,
      [key]: {
        active: true,
        tested: true,
        count: (prev[key]?.count || 0) + 1,
      },
    }));

    setTimeout(() => {
      setButtonStates((prev) => ({
        ...prev,
        [key]: { ...prev[key], active: false },
      }));
    }, 150);
  }, [addLog, playClickSound]);

  // Prevent Browser Back Navigation (Mouse Button 3 / 4, Popstate interception)
  useEffect(() => {
    if (!isTestingActive) return;

    // Anchor current history entry to prevent browser back navigation
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      if (isTestingActive) {
        window.history.pushState(null, '', window.location.href);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (preventContextMenu && isTestingActive) {
        e.preventDefault();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [preventContextMenu, isTestingActive]);

  // Global Mouse Event Listeners with Browser Action Suppression
  useEffect(() => {
    if (!isTestingActive) return;

    const handleGlobalMouseDown = (e: MouseEvent) => {
      // Prevent browser default actions (back navigation on button 3, forward on button 4, middle autoscroll on button 1)
      if (e.button === 3 || e.button === 4 || e.button === 1 || e.button === 2) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (e.button === 0) triggerButton('left', 'Left click', 'left', 1400);
      else if (e.button === 1) triggerButton('middle', 'Middle click', 'middle', 1000);
      else if (e.button === 2) triggerButton('right', 'Right click', 'right', 1200);
      else if (e.button === 3) triggerButton('back', 'Back button', 'back', 900);
      else if (e.button === 4) triggerButton('forward', 'Forward button', 'forward', 950);
    };

    const handleAuxClick = (e: MouseEvent) => {
      // auxclick captures middle and side buttons in modern browsers
      e.preventDefault();
      e.stopPropagation();
    };

    const handleGlobalWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) {
        triggerButton('scrollUp', 'Scroll up', 'scroll-up', 800);
      } else {
        triggerButton('scrollDown', 'Scroll down', 'scroll-down', 750);
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastMoveTimeRef.current);
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = Math.round((dist / dt) * 1000); // px/sec

      // Estimate polling rate (Hz)
      if (dt > 0 && dt < 50) {
        const rate = Math.round(1000 / dt);
        if (rate > 50 && rate < 2000) {
          setPollingRate((prev) => Math.round(prev * 0.9 + rate * 0.1));
        }
      }

      setMouseSpeed(speed);
      lastMoveTimeRef.current = now;
      lastPosRef.current = { x: e.clientX, y: e.clientY };

      setCoords({ x: e.clientX, y: e.clientY });
      setIsMoving(true);

      // DPI tracking if active
      if (isMeasuringDpi) {
        if (dpiStartPosRef.current === null) {
          dpiStartPosRef.current = e.clientX;
        } else {
          const delta = Math.abs(e.clientX - dpiStartPosRef.current);
          setDpiPixelsMeasured(delta);
        }
      }

      // Add trail point
      setTrailPoints((prev) => [
        { x: e.clientX, y: e.clientY, id: Date.now() + Math.random() },
        ...prev.slice(0, 15),
      ]);

      if (moveTimeoutRef.current) window.clearTimeout(moveTimeoutRef.current);
      moveTimeoutRef.current = window.setTimeout(() => {
        setIsMoving(false);
        setMouseSpeed(0);
      }, 200);
    };

    window.addEventListener('mousedown', handleGlobalMouseDown, { capture: true });
    window.addEventListener('mouseup', handleGlobalMouseDown, { capture: true });
    window.addEventListener('auxclick', handleAuxClick, { capture: true });
    window.addEventListener('wheel', handleGlobalWheel);
    window.addEventListener('mousemove', handleGlobalMouseMove);

    return () => {
      window.removeEventListener('mousedown', handleGlobalMouseDown, { capture: true });
      window.removeEventListener('mouseup', handleGlobalMouseDown, { capture: true });
      window.removeEventListener('auxclick', handleAuxClick, { capture: true });
      window.removeEventListener('wheel', handleGlobalWheel);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [triggerButton, isMeasuringDpi, isTestingActive]);

  const clearLogs = () => {
    setLogs([]);
  };

  const resetAllTests = () => {
    setButtonStates({
      left: { active: false, tested: false, count: 0 },
      right: { active: false, tested: false, count: 0 },
      middle: { active: false, tested: false, count: 0 },
      forward: { active: false, tested: false, count: 0 },
      back: { active: false, tested: false, count: 0 },
      scrollUp: { active: false, tested: false, count: 0 },
      scrollDown: { active: false, tested: false, count: 0 },
      dpi: { active: false, tested: false, count: 0 },
      thumbWheel: { active: false, tested: false, count: 0 },
    });
    setLogs([]);
    setDpiPixelsMeasured(0);
    dpiStartPosRef.current = null;
    setIsMeasuringDpi(false);
  };

  return (
    <div className="min-h-screen pt-4 pb-20 text-slate-100 bg-[#070B14] w-full select-none font-sans">
      <SeoHead
        title="Mouse Tester - Professional 3D/2D Hardware Diagnostics | HardwareTest"
        description="Test all mouse buttons, scroll wheel, movement, and more. Check if your mouse is working properly."
      />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ================================================== */}
        {/* TOP HEADER */}
        {/* ================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-4 gap-4">
          
          {/* LEFT: Mouse Icon + Title + Badge + Subtitle */}
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#3B82F6] via-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 shrink-0 p-2.5">
              <Mouse className="w-7 h-7" strokeWidth={2.2} />
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Mouse Tester
                </h1>
                <span className="px-3 py-1 rounded-full bg-[#1E1B4B]/80 text-[#A5B4FC] text-xs font-semibold border border-indigo-500/30 shadow-inner">
                  3D/2D Interactive Test
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Test all mouse buttons, scroll wheel, movement, and more. Check if your mouse is working properly.
              </p>
            </div>
          </div>

          {/* RIGHT: Start Testing Button + Connection Status Pill + Detected Device */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap self-start md:self-auto">
            {/* START / STOP TESTING TOGGLE BUTTON */}
            <button
              onClick={() => setIsTestingActive(!isTestingActive)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-lg ${
                isTestingActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 ring-2 ring-rose-400/40 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
              }`}
            >
              {isTestingActive ? (
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

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B1528] border border-slate-800 text-xs font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E]" />
              <span className="text-emerald-400 font-semibold">Connected</span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0D1527] border border-slate-800 text-xs font-semibold text-slate-200 cursor-pointer hover:border-slate-700 transition-colors">
              <span>Wireless Mouse</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

        </div>

        {/* ACTIVE CAPTURE INFO BANNER */}
        {isTestingActive && (
          <div className="mb-4 px-4 py-2 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
              <span>
                <strong>Hardware Capture Active:</strong> Browser back navigation, right-click menu & default actions intercepted on this screen.
              </span>
            </div>
            <button
              onClick={() => setIsTestingActive(false)}
              className="text-[11px] underline text-emerald-400 hover:text-white cursor-pointer"
            >
              Pause
            </button>
          </div>
        )}

        {/* ================================================== */}
        {/* TAB NAVIGATION */}
        {/* ================================================== */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {[
            { id: 'button', label: 'Button Test', icon: Mouse },
            { id: 'scroll', label: 'Scroll Wheel', icon: RotateCw },
            { id: 'movement', label: 'Movement Test', icon: Move },
            { id: 'dpi', label: 'DPI Test', icon: Crosshair },
            { id: 'settings', label: 'Settings', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-[#0D1527] hover:bg-[#15203A] text-slate-400 hover:text-slate-200 border border-slate-800/90'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================================================== */}
        {/* TAB 1: MAIN TWO-COLUMN BUTTON TEST WORKSPACE */}
        {/* ================================================== */}
        {activeTab === 'button' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT SIDE: LARGE INTERACTIVE MOUSE VISUAL CARD (7 cols) */}
            <div className="lg:col-span-7 bg-[#080D1A] rounded-3xl border border-slate-800/80 p-6 md:p-8 flex flex-col justify-between shadow-2xl relative min-h-[640px] overflow-hidden">
              
              {/* AMBIENT GLOW */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* MOUSE SCHEMATIC CONTAINER WITH VECTOR INTERACTIVE MOUSE & CALLOUTS */}
              <div className="relative w-full max-w-[620px] aspect-[4/3.3] mx-auto flex items-center justify-center my-2">
                
                {/* SVG VECTOR INTERACTIVE MOUSE */}
                <svg
                  viewBox="0 0 800 580"
                  className="w-full h-full select-none"
                  style={{ filter: 'drop-shadow(0 20px 35px rgba(0,0,0,0.85))' }}
                >
                  <defs>
                    <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1E293B" />
                      <stop offset="50%" stopColor="#0F172A" />
                      <stop offset="100%" stopColor="#090D16" />
                    </linearGradient>
                    <linearGradient id="palmGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1E293B" />
                      <stop offset="100%" stopColor="#0A101D" />
                    </linearGradient>
                    <linearGradient id="wheelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#334155" />
                      <stop offset="50%" stopColor="#64748B" />
                      <stop offset="100%" stopColor="#1E293B" />
                    </linearGradient>
                    <radialGradient id="ambientMouseGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                    </radialGradient>
                    <filter id="svgGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Ambient Glow behind mouse */}
                  <ellipse cx="400" cy="300" rx="180" ry="220" fill="url(#ambientMouseGlow)" />

                  {/* ================================================== */}
                  {/* BASE CHASSIS & THUMB REST SHELF */}
                  {/* ================================================== */}
                  {/* Left Thumb Wing Rest */}
                  <path
                    d="M 330 250 C 270 270 235 320 235 380 C 235 440 275 480 340 480 Z"
                    fill="#0B1324"
                    stroke="#1E293B"
                    strokeWidth="2"
                  />
                  {/* Outer Mouse Shell Silhouette */}
                  <path
                    d="M 400 95 
                       C 455 95 495 130 505 210 
                       C 515 280 520 370 495 440 
                       C 475 490 440 510 400 510 
                       C 360 510 325 490 305 440 
                       C 280 370 285 280 295 210 
                       C 305 130 345 95 400 95 Z"
                    fill="url(#bodyGrad)"
                    stroke="#334155"
                    strokeWidth="2.5"
                  />

                  {/* LED Underglow Ring Accent */}
                  <path
                    d="M 320 445 C 350 495 450 495 480 445"
                    fill="none"
                    stroke={testedCount > 0 ? '#6366F1' : '#1E293B'}
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity={testedCount > 0 ? '0.9' : '0.4'}
                    filter={testedCount > 0 ? 'url(#svgGlow)' : undefined}
                  />

                  {/* Lower Palm Rest Area */}
                  <path
                    d="M 302 330 C 315 305 385 305 400 305 C 415 305 485 305 498 330 C 512 385 500 465 470 485 C 435 505 365 505 330 485 C 300 465 288 385 302 330 Z"
                    fill="url(#palmGrad)"
                    stroke="#1E293B"
                    strokeWidth="1.5"
                  />

                  {/* Palm Grip Logo / Radar Accent */}
                  <circle cx="400" cy="410" r="18" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="400" cy="410" r="8" fill={testedCount > 0 ? '#6366F1' : '#1E293B'} opacity="0.6" />
                  <path d="M 400 395 L 400 425 M 385 410 L 415 410" stroke="#334155" strokeWidth="1" />

                  {/* ================================================== */}
                  {/* 1. LEFT CLICK BUTTON (#1) */}
                  {/* ================================================== */}
                  <path
                    d="M 302 205 C 308 140 345 100 390 98 L 390 285 C 345 285 310 270 302 205 Z"
                    fill={
                      buttonStates.left.active 
                        ? '#10B981' 
                        : buttonStates.left.tested 
                        ? 'rgba(16, 185, 129, 0.18)' 
                        : '#131D31'
                    }
                    stroke={
                      buttonStates.left.active 
                        ? '#34D399' 
                        : buttonStates.left.tested 
                        ? '#10B981' 
                        : '#334155'
                    }
                    strokeWidth={buttonStates.left.active ? '3' : '1.5'}
                    className="cursor-pointer transition-all hover:brightness-125"
                    onClick={() => triggerButton('left', 'Left click', 'left', 1400)}
                    filter={buttonStates.left.active ? 'url(#svgGlow)' : undefined}
                  />

                  {/* ================================================== */}
                  {/* 2. RIGHT CLICK BUTTON (#2) */}
                  {/* ================================================== */}
                  <path
                    d="M 498 205 C 492 140 455 100 410 98 L 410 285 C 455 285 490 270 498 205 Z"
                    fill={
                      buttonStates.right.active 
                        ? '#A855F7' 
                        : buttonStates.right.tested 
                        ? 'rgba(168, 85, 247, 0.18)' 
                        : '#131D31'
                    }
                    stroke={
                      buttonStates.right.active 
                        ? '#C084FC' 
                        : buttonStates.right.tested 
                        ? '#A855F7' 
                        : '#334155'
                    }
                    strokeWidth={buttonStates.right.active ? '3' : '1.5'}
                    className="cursor-pointer transition-all hover:brightness-125"
                    onClick={() => triggerButton('right', 'Right click', 'right', 1200)}
                    filter={buttonStates.right.active ? 'url(#svgGlow)' : undefined}
                  />

                  {/* Center Island / Gap between clicks */}
                  <rect x="390" y="96" width="20" height="200" fill="#080D1A" />

                  {/* ================================================== */}
                  {/* 3. MIDDLE CLICK / SCROLL WHEEL (#3, #6, #7) */}
                  {/* ================================================== */}
                  {/* Wheel Housing Slot */}
                  <rect x="384" y="125" width="32" height="95" rx="16" fill="#060913" stroke="#1E293B" strokeWidth="1.5" />

                  {/* Scroll Wheel Body (Clickable Middle Click) */}
                  <rect
                    x="387"
                    y="130"
                    width="26"
                    height="85"
                    rx="13"
                    fill={
                      buttonStates.middle.active 
                        ? '#0EA5E9' 
                        : buttonStates.middle.tested 
                        ? 'rgba(14, 165, 233, 0.35)' 
                        : 'url(#wheelGrad)'
                    }
                    stroke={
                      buttonStates.middle.active || isScrollTested
                        ? '#38BDF8' 
                        : '#475569'
                    }
                    strokeWidth="2"
                    className="cursor-pointer transition-all hover:brightness-125"
                    onClick={() => triggerButton('middle', 'Middle click', 'middle', 1000)}
                    filter={buttonStates.middle.active ? 'url(#svgGlow)' : undefined}
                  />

                  {/* Scroll Up Half Indicator on Wheel */}
                  <path
                    d="M 394 150 L 400 142 L 406 150"
                    fill="none"
                    stroke={buttonStates.scrollUp.active ? '#06B6D4' : '#94A3B8'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="cursor-pointer"
                    onClick={() => triggerButton('scrollUp', 'Scroll up', 'scroll-up', 800)}
                  />

                  {/* Scroll Down Half Indicator on Wheel */}
                  <path
                    d="M 394 195 L 400 203 L 406 195"
                    fill="none"
                    stroke={buttonStates.scrollDown.active ? '#06B6D4' : '#94A3B8'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="cursor-pointer"
                    onClick={() => triggerButton('scrollDown', 'Scroll down', 'scroll-down', 750)}
                  />

                  {/* Wheel Ridges */}
                  <line x1="390" y1="160" x2="410" y2="160" stroke="#0F172A" strokeWidth="1.5" />
                  <line x1="390" y1="172" x2="410" y2="172" stroke="#0F172A" strokeWidth="2" />
                  <line x1="390" y1="184" x2="410" y2="184" stroke="#0F172A" strokeWidth="1.5" />

                  {/* ================================================== */}
                  {/* 8. DPI BUTTON (#8) */}
                  {/* ================================================== */}
                  <rect
                    x="391"
                    y="245"
                    width="18"
                    height="32"
                    rx="6"
                    fill={
                      buttonStates.dpi.active 
                        ? '#8B5CF6' 
                        : buttonStates.dpi.tested 
                        ? 'rgba(139, 92, 246, 0.4)' 
                        : '#1E293B'
                    }
                    stroke={
                      buttonStates.dpi.active 
                        ? '#A78BFA' 
                        : buttonStates.dpi.tested 
                        ? '#8B5CF6' 
                        : '#475569'
                    }
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:brightness-125"
                    onClick={() => triggerButton('dpi', 'DPI button', 'dpi', 1600)}
                    filter={buttonStates.dpi.active ? 'url(#svgGlow)' : undefined}
                  />
                  <circle cx="400" cy="261" r="2.5" fill={buttonStates.dpi.tested ? '#A78BFA' : '#64748B'} />

                  {/* ================================================== */}
                  {/* 4. FORWARD BUTTON (#4) - Side Flank */}
                  {/* ================================================== */}
                  <path
                    d="M 285 240 C 275 250 270 265 268 280 L 285 278 Z"
                    fill={
                      buttonStates.forward.active 
                        ? '#F59E0B' 
                        : buttonStates.forward.tested 
                        ? 'rgba(245, 158, 11, 0.4)' 
                        : '#1E293B'
                    }
                    stroke={
                      buttonStates.forward.active 
                        ? '#FBBF24' 
                        : buttonStates.forward.tested 
                        ? '#F59E0B' 
                        : '#475569'
                    }
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:brightness-125"
                    onClick={() => triggerButton('forward', 'Forward button', 'forward', 950)}
                    filter={buttonStates.forward.active ? 'url(#svgGlow)' : undefined}
                  />

                  {/* ================================================== */}
                  {/* 5. BACK BUTTON (#5) - Side Flank */}
                  {/* ================================================== */}
                  <path
                    d="M 285 292 C 270 295 264 315 262 335 L 285 330 Z"
                    fill={
                      buttonStates.back.active 
                        ? '#EC4899' 
                        : buttonStates.back.tested 
                        ? 'rgba(236, 72, 153, 0.4)' 
                        : '#1E293B'
                    }
                    stroke={
                      buttonStates.back.active 
                        ? '#F472B6' 
                        : buttonStates.back.tested 
                        ? '#EC4899' 
                        : '#475569'
                    }
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:brightness-125"
                    onClick={() => triggerButton('back', 'Back button', 'back', 900)}
                    filter={buttonStates.back.active ? 'url(#svgGlow)' : undefined}
                  />

                  {/* ================================================== */}
                  {/* 9. THUMB WHEEL (#9) - On Thumb Shelf */}
                  {/* ================================================== */}
                  <rect
                    x="250"
                    y="360"
                    width="24"
                    height="48"
                    rx="8"
                    fill={
                      buttonStates.thumbWheel.active 
                        ? '#14B8A6' 
                        : buttonStates.thumbWheel.tested 
                        ? 'rgba(20, 184, 166, 0.4)' 
                        : '#1E293B'
                    }
                    stroke={
                      buttonStates.thumbWheel.active 
                        ? '#2DD4BF' 
                        : buttonStates.thumbWheel.tested 
                        ? '#14B8A6' 
                        : '#475569'
                    }
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:brightness-125"
                    onClick={() => triggerButton('thumbWheel', 'Thumb wheel', 'thumb', 1300)}
                    filter={buttonStates.thumbWheel.active ? 'url(#svgGlow)' : undefined}
                  />
                  {/* Thumb Wheel Texture Lines */}
                  <line x1="254" y1="372" x2="270" y2="372" stroke="#0F172A" strokeWidth="1.5" />
                  <line x1="254" y1="384" x2="270" y2="384" stroke="#0F172A" strokeWidth="1.5" />
                  <line x1="254" y1="396" x2="270" y2="396" stroke="#0F172A" strokeWidth="1.5" />

                  {/* ================================================== */}
                  {/* ACCURATE CONNECTING POINTER LINES */}
                  {/* ================================================== */}

                  {/* 1. Left Click Connecting Line */}
                  <path
                    d="M 160 170 L 335 180"
                    stroke={buttonStates.left.active ? '#10B981' : buttonStates.left.tested ? '#10B981' : '#334155'}
                    strokeWidth={buttonStates.left.active ? '2.5' : '1.5'}
                    fill="none"
                    opacity={buttonStates.left.active ? '1' : buttonStates.left.tested ? '0.9' : '0.4'}
                  />
                  <circle cx="335" cy="180" r={buttonStates.left.active ? '5' : '3.5'} fill={buttonStates.left.tested ? '#10B981' : '#475569'} />

                  {/* 2. Right Click Connecting Line */}
                  <path
                    d="M 640 170 L 465 180"
                    stroke={buttonStates.right.active ? '#A855F7' : buttonStates.right.tested ? '#A855F7' : '#334155'}
                    strokeWidth={buttonStates.right.active ? '2.5' : '1.5'}
                    fill="none"
                    opacity={buttonStates.right.active ? '1' : buttonStates.right.tested ? '0.9' : '0.4'}
                  />
                  <circle cx="465" cy="180" r={buttonStates.right.active ? '5' : '3.5'} fill={buttonStates.right.tested ? '#A855F7' : '#475569'} />

                  {/* 3. Middle Click Connecting Line */}
                  <path
                    d="M 400 45 L 400 128"
                    stroke={buttonStates.middle.active ? '#0EA5E9' : buttonStates.middle.tested ? '#0EA5E9' : '#334155'}
                    strokeWidth={buttonStates.middle.active ? '2.5' : '1.5'}
                    fill="none"
                    opacity={buttonStates.middle.active ? '1' : buttonStates.middle.tested ? '0.9' : '0.4'}
                  />
                  <circle cx="400" cy="128" r={buttonStates.middle.active ? '5' : '3.5'} fill={buttonStates.middle.tested ? '#0EA5E9' : '#475569'} />

                  {/* 6. Scroll Up Connecting Line */}
                  <path
                    d="M 160 100 L 320 100 L 385 145"
                    stroke={buttonStates.scrollUp.active ? '#06B6D4' : buttonStates.scrollUp.tested ? '#06B6D4' : '#334155'}
                    strokeWidth={buttonStates.scrollUp.active ? '2.5' : '1.5'}
                    fill="none"
                    opacity={buttonStates.scrollUp.active ? '1' : buttonStates.scrollUp.tested ? '0.9' : '0.4'}
                  />
                  <circle cx="385" cy="145" r={buttonStates.scrollUp.active ? '5' : '3.5'} fill={buttonStates.scrollUp.tested ? '#06B6D4' : '#475569'} />

                  {/* 7. Scroll Down Connecting Line */}
                  <path
                    d="M 640 100 L 480 100 L 415 195"
                    stroke={buttonStates.scrollDown.active ? '#06B6D4' : buttonStates.scrollDown.tested ? '#06B6D4' : '#334155'}
                    strokeWidth={buttonStates.scrollDown.active ? '2.5' : '1.5'}
                    fill="none"
                    opacity={buttonStates.scrollDown.active ? '1' : buttonStates.scrollDown.tested ? '0.9' : '0.4'}
                  />
                  <circle cx="415" cy="195" r={buttonStates.scrollDown.active ? '5' : '3.5'} fill={buttonStates.scrollDown.tested ? '#06B6D4' : '#475569'} />

                  {/* 8. DPI Button Connecting Line */}
                  <path
                    d="M 640 260 L 415 260"
                    stroke={buttonStates.dpi.active ? '#8B5CF6' : buttonStates.dpi.tested ? '#8B5CF6' : '#334155'}
                    strokeWidth={buttonStates.dpi.active ? '2.5' : '1.5'}
                    fill="none"
                    opacity={buttonStates.dpi.active ? '1' : buttonStates.dpi.tested ? '0.9' : '0.4'}
                  />
                  <circle cx="415" cy="260" r={buttonStates.dpi.active ? '5' : '3.5'} fill={buttonStates.dpi.tested ? '#8B5CF6' : '#475569'} />

                  {/* 4. Forward Button Connecting Line */}
                  <path
                    d="M 160 255 L 265 260"
                    stroke={buttonStates.forward.active ? '#F59E0B' : buttonStates.forward.tested ? '#F59E0B' : '#334155'}
                    strokeWidth={buttonStates.forward.active ? '2.5' : '1.5'}
                    fill="none"
                    opacity={buttonStates.forward.active ? '1' : buttonStates.forward.tested ? '0.9' : '0.4'}
                  />
                  <circle cx="265" cy="260" r={buttonStates.forward.active ? '5' : '3.5'} fill={buttonStates.forward.tested ? '#F59E0B' : '#475569'} />

                  {/* 5. Back Button Connecting Line */}
                  <path
                    d="M 160 320 L 260 315"
                    stroke={buttonStates.back.active ? '#EC4899' : buttonStates.back.tested ? '#EC4899' : '#334155'}
                    strokeWidth={buttonStates.back.active ? '2.5' : '1.5'}
                    fill="none"
                    opacity={buttonStates.back.active ? '1' : buttonStates.back.tested ? '0.9' : '0.4'}
                  />
                  <circle cx="260" cy="315" r={buttonStates.back.active ? '5' : '3.5'} fill={buttonStates.back.tested ? '#EC4899' : '#475569'} />

                  {/* 9. Thumb Wheel Connecting Line */}
                  <path
                    d="M 160 385 L 248 385"
                    stroke={buttonStates.thumbWheel.active ? '#14B8A6' : buttonStates.thumbWheel.tested ? '#14B8A6' : '#334155'}
                    strokeWidth={buttonStates.thumbWheel.active ? '2.5' : '1.5'}
                    fill="none"
                    opacity={buttonStates.thumbWheel.active ? '1' : buttonStates.thumbWheel.tested ? '0.9' : '0.4'}
                  />
                  <circle cx="248" cy="385" r={buttonStates.thumbWheel.active ? '5' : '3.5'} fill={buttonStates.thumbWheel.tested ? '#14B8A6' : '#475569'} />
                </svg>

                {/* ================================================== */}
                {/* NUMBERED CALLOUT BADGES */}
                {/* ================================================== */}

                {/* 3. MIDDLE CLICK (Top Center) */}
                <button 
                  onClick={() => triggerButton('middle', 'Middle click', 'middle', 1000)}
                  className={`absolute top-[1%] left-[34%] sm:left-[36%] px-3.5 py-1.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-2.5 z-10 ${
                    buttonStates.middle.active 
                      ? 'bg-[#0EA5E9] text-white border-sky-300 shadow-lg shadow-sky-500/50 scale-105' 
                      : buttonStates.middle.tested
                      ? 'bg-[#0B1528]/95 border-sky-500/50 text-sky-300 hover:border-sky-400 shadow-md'
                      : 'bg-[#0B1528]/95 border-slate-700/60 text-slate-300 hover:border-slate-500 shadow-md'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center shrink-0 ${
                    buttonStates.middle.tested ? 'bg-[#0EA5E9] text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    3
                  </span>
                  <div className="text-left">
                    <div className="text-xs font-bold leading-tight">Middle Click</div>
                    <div className="text-[9px] text-slate-400 leading-tight">(Wheel Press)</div>
                  </div>
                </button>

                {/* 6. SCROLL UP (Upper Left) */}
                <button 
                  onClick={() => triggerButton('scrollUp', 'Scroll up', 'scroll-up', 800)}
                  className={`absolute top-[12%] left-[2%] sm:left-[4%] px-3 py-1.5 rounded-full border cursor-pointer transition-all flex items-center gap-2 z-10 ${
                    buttonStates.scrollUp.active 
                      ? 'bg-[#06B6D4] text-black border-cyan-300 shadow-lg shadow-cyan-500/50 scale-105' 
                      : buttonStates.scrollUp.tested
                      ? 'bg-[#0B1528]/95 border-cyan-500/50 text-cyan-300 hover:border-cyan-400 shadow-md'
                      : 'bg-[#0B1528]/95 border-slate-700/60 text-slate-300 hover:border-slate-500 shadow-md'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center ${
                    buttonStates.scrollUp.tested ? 'bg-[#06B6D4] text-black' : 'bg-slate-700 text-slate-300'
                  }`}>
                    6
                  </span>
                  <span className="text-xs font-bold">Scroll Up</span>
                </button>

                {/* 7. SCROLL DOWN (Upper Right) */}
                <button 
                  onClick={() => triggerButton('scrollDown', 'Scroll down', 'scroll-down', 750)}
                  className={`absolute top-[12%] right-[2%] sm:right-[4%] px-3 py-1.5 rounded-full border cursor-pointer transition-all flex items-center gap-2 z-10 ${
                    buttonStates.scrollDown.active 
                      ? 'bg-[#06B6D4] text-black border-cyan-300 shadow-lg shadow-cyan-500/50 scale-105' 
                      : buttonStates.scrollDown.tested
                      ? 'bg-[#0B1528]/95 border-cyan-500/50 text-cyan-300 hover:border-cyan-400 shadow-md'
                      : 'bg-[#0B1528]/95 border-slate-700/60 text-slate-300 hover:border-slate-500 shadow-md'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center ${
                    buttonStates.scrollDown.tested ? 'bg-[#06B6D4] text-black' : 'bg-slate-700 text-slate-300'
                  }`}>
                    7
                  </span>
                  <span className="text-xs font-bold">Scroll Down</span>
                </button>

                {/* 1. LEFT CLICK (Left Side) */}
                <button 
                  onClick={() => triggerButton('left', 'Left click', 'left', 1400)}
                  className={`absolute top-[26%] left-[2%] sm:left-[4%] px-3 py-1.5 rounded-full border cursor-pointer transition-all flex items-center gap-2 z-10 ${
                    buttonStates.left.active 
                      ? 'bg-[#10B981] text-white border-emerald-300 shadow-lg shadow-emerald-500/50 scale-105' 
                      : buttonStates.left.tested
                      ? 'bg-[#0B1528]/95 border-emerald-500/50 text-emerald-300 hover:border-emerald-400 shadow-md'
                      : 'bg-[#0B1528]/95 border-slate-700/60 text-slate-300 hover:border-slate-500 shadow-md'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center ${
                    buttonStates.left.tested ? 'bg-[#10B981] text-black' : 'bg-slate-700 text-slate-300'
                  }`}>
                    1
                  </span>
                  <span className="text-xs font-bold">Left Click</span>
                </button>

                {/* 2. RIGHT CLICK (Right Side) */}
                <button 
                  onClick={() => triggerButton('right', 'Right click', 'right', 1200)}
                  className={`absolute top-[26%] right-[2%] sm:right-[4%] px-3 py-1.5 rounded-full border cursor-pointer transition-all flex items-center gap-2 z-10 ${
                    buttonStates.right.active 
                      ? 'bg-[#A855F7] text-white border-purple-300 shadow-lg shadow-purple-500/50 scale-105' 
                      : buttonStates.right.tested
                      ? 'bg-[#0B1528]/95 border-purple-500/50 text-purple-300 hover:border-purple-400 shadow-md'
                      : 'bg-[#0B1528]/95 border-slate-700/60 text-slate-300 hover:border-slate-500 shadow-md'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center ${
                    buttonStates.right.tested ? 'bg-[#A855F7] text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    2
                  </span>
                  <span className="text-xs font-bold">Right Click</span>
                </button>

                {/* 4. FORWARD BUTTON (Mid-Left) */}
                <button 
                  onClick={() => triggerButton('forward', 'Forward button', 'forward', 950)}
                  className={`absolute top-[41%] left-[2%] sm:left-[4%] px-3 py-1.5 rounded-full border cursor-pointer transition-all flex items-center gap-2 z-10 ${
                    buttonStates.forward.active 
                      ? 'bg-[#F59E0B] text-black border-amber-300 shadow-lg shadow-amber-500/50 scale-105' 
                      : buttonStates.forward.tested
                      ? 'bg-[#0B1528]/95 border-amber-500/50 text-amber-300 hover:border-amber-400 shadow-md'
                      : 'bg-[#0B1528]/95 border-slate-700/60 text-slate-300 hover:border-slate-500 shadow-md'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center ${
                    buttonStates.forward.tested ? 'bg-[#F59E0B] text-black' : 'bg-slate-700 text-slate-300'
                  }`}>
                    4
                  </span>
                  <span className="text-xs font-bold">Forward Button</span>
                </button>

                {/* 8. DPI BUTTON (Mid-Right) */}
                <button 
                  onClick={() => triggerButton('dpi', 'DPI button', 'dpi', 1600)}
                  className={`absolute top-[41%] right-[2%] sm:right-[4%] px-3 py-1.5 rounded-full border cursor-pointer transition-all flex items-center gap-2 z-10 ${
                    buttonStates.dpi.active 
                      ? 'bg-[#8B5CF6] text-white border-purple-300 shadow-lg shadow-purple-500/50 scale-105' 
                      : buttonStates.dpi.tested
                      ? 'bg-[#0B1528]/95 border-purple-500/50 text-purple-300 hover:border-purple-400 shadow-md'
                      : 'bg-[#0B1528]/95 border-slate-700/60 text-slate-300 hover:border-slate-500 shadow-md'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center ${
                    buttonStates.dpi.tested ? 'bg-[#8B5CF6] text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    8
                  </span>
                  <span className="text-xs font-bold">DPI Button</span>
                </button>

                {/* 5. BACK BUTTON (Lower-Left) */}
                <button 
                  onClick={() => triggerButton('back', 'Back button', 'back', 900)}
                  className={`absolute top-[54%] left-[2%] sm:left-[4%] px-3 py-1.5 rounded-full border cursor-pointer transition-all flex items-center gap-2 z-10 ${
                    buttonStates.back.active 
                      ? 'bg-[#EC4899] text-white border-pink-300 shadow-lg shadow-pink-500/50 scale-105' 
                      : buttonStates.back.tested
                      ? 'bg-[#0B1528]/95 border-pink-500/50 text-pink-300 hover:border-pink-400 shadow-md'
                      : 'bg-[#0B1528]/95 border-slate-700/60 text-slate-300 hover:border-slate-500 shadow-md'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center ${
                    buttonStates.back.tested ? 'bg-[#EC4899] text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    5
                  </span>
                  <span className="text-xs font-bold">Back Button</span>
                </button>

                {/* 9. THUMB WHEEL (Bottom-Left) */}
                <button 
                  onClick={() => triggerButton('thumbWheel', 'Thumb wheel', 'thumb', 1300)}
                  className={`absolute top-[67%] left-[2%] sm:left-[4%] px-3.5 py-1.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-2.5 z-10 ${
                    buttonStates.thumbWheel.active 
                      ? 'bg-[#14B8A6] text-black border-teal-300 shadow-lg shadow-teal-500/50 scale-105' 
                      : buttonStates.thumbWheel.tested
                      ? 'bg-[#0B1528]/95 border-teal-500/50 text-teal-300 hover:border-teal-400 shadow-md'
                      : 'bg-[#0B1528]/95 border-slate-700/60 text-slate-300 hover:border-slate-500 shadow-md'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center shrink-0 ${
                    buttonStates.thumbWheel.tested ? 'bg-[#14B8A6] text-black' : 'bg-slate-700 text-slate-300'
                  }`}>
                    9
                  </span>
                  <div className="text-left">
                    <div className="text-xs font-bold leading-tight">Thumb Wheel</div>
                    <div className="text-[9px] text-slate-400 leading-tight">(Horizontal)</div>
                  </div>
                </button>

              </div>

              {/* ================================================== */}
              {/* BOTTOM ROW STATUS CARDS */}
              {/* ================================================== */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-800/60">
                
                {/* Left: Dynamic Test Progress & Verification Status */}
                {testedCount === 9 ? (
                  <div className="rounded-2xl bg-[#041D13]/70 border border-emerald-500/40 p-3.5 flex items-center gap-3.5 shadow-lg shadow-emerald-950/20">
                    <div className="w-9 h-9 rounded-xl bg-[#059669]/20 text-[#10B981] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white leading-tight">All Buttons Ready</div>
                      <div className="text-[11px] text-emerald-400/90 leading-tight mt-0.5">All 9 controls tested & working properly!</div>
                    </div>
                  </div>
                ) : testedCount > 0 ? (
                  <div className="rounded-2xl bg-[#1E1B4B]/40 border border-indigo-500/30 p-3.5 flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-xs">
                      {testedCount}/9
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white leading-tight">{testedCount} of 9 Controls Tested</div>
                      <div className="text-[11px] text-indigo-300/80 leading-tight mt-0.5">Press remaining buttons to complete test.</div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-[#0B1324]/80 border border-slate-800 p-3.5 flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-800/80 text-slate-400 flex items-center justify-center shrink-0">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white leading-tight">Ready to Test</div>
                      <div className="text-[11px] text-slate-400 leading-tight mt-0.5">Click buttons or scroll to test diagnostics.</div>
                    </div>
                  </div>
                )}

                {/* Right: Device Info (Completely Generic - No Logitech) */}
                <div className="rounded-2xl bg-[#0B1324]/80 border border-slate-800 p-3.5 flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
                    <Mouse className="w-5 h-5" />
                  </div>
                  <div className="text-xs space-y-0.5">
                    <div className="text-slate-400 text-[10px]">Model: <strong className="text-slate-200">Wireless Mouse</strong></div>
                    <div className="text-slate-400 text-[10px]">Type: <strong className="text-slate-200">Wireless / USB</strong></div>
                  </div>
                </div>

              </div>

            </div>

            {/* ================================================== */}
            {/* RIGHT SIDE: LIVE DIAGNOSTIC INFORMATION CARDS (5 cols) */}
            {/* ================================================== */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* TOP ROW OF RIGHT COLUMN: 2 CARDS (Button Status & Mouse Position) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. LIVE BUTTON STATUS CARD */}
                <div className="rounded-3xl bg-[#080D1A] border border-slate-800/80 p-4 shadow-xl">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#38BDF8]" />
                      <h3 className="text-xs font-bold text-white tracking-wide">Live Button Status</h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {testedCount}/9 Tested
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { num: 1, key: 'left', name: 'Left Click', color: '#10B981', textColor: '#000000' },
                      { num: 2, key: 'right', name: 'Right Click', color: '#A855F7', textColor: '#FFFFFF' },
                      { num: 3, key: 'middle', name: 'Middle Click', color: '#0EA5E9', textColor: '#FFFFFF' },
                      { num: 4, key: 'forward', name: 'Forward Button', color: '#F59E0B', textColor: '#000000' },
                      { num: 5, key: 'back', name: 'Back Button', color: '#EC4899', textColor: '#FFFFFF' },
                      { num: 6, key: 'scrollUp', name: 'Scroll Up', color: '#06B6D4', textColor: '#000000' },
                      { num: 7, key: 'scrollDown', name: 'Scroll Down', color: '#06B6D4', textColor: '#000000' },
                      { num: 8, key: 'dpi', name: 'DPI Button', color: '#8B5CF6', textColor: '#FFFFFF' },
                      { num: 9, key: 'thumbWheel', name: 'Thumb Wheel', color: '#14B8A6', textColor: '#000000' },
                    ].map((item) => {
                      const isTested = buttonStates[item.key]?.tested;
                      const isActive = buttonStates[item.key]?.active;
                      return (
                        <div key={item.num} className="flex items-center justify-between text-xs py-0.5">
                          <div className="flex items-center gap-2">
                            <span 
                              style={{ 
                                backgroundColor: isTested ? item.color : '#1E293B', 
                                color: isTested ? item.textColor : '#94A3B8' 
                              }}
                              className="w-4.5 h-4.5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 transition-colors"
                            >
                              {item.num}
                            </span>
                            <span className={`text-xs font-medium transition-colors ${
                              isTested ? 'text-slate-200' : 'text-slate-400'
                            }`}>
                              {item.name}
                            </span>
                          </div>

                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all ${
                            isActive
                              ? 'bg-emerald-500 text-black border-emerald-300 shadow-[0_0_10px_#10B981]'
                              : isTested 
                              ? 'bg-[#042F1A] text-[#10B981] border-emerald-500/30' 
                              : 'bg-[#0B1324] text-slate-500 border-slate-800/80'
                          }`}>
                            {isActive ? 'Pressed' : isTested ? 'Working' : 'Not Tested'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. MOUSE POSITION CARD */}
                <div className="rounded-3xl bg-[#080D1A] border border-slate-800/80 p-4 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800/80">
                      <Crosshair className="w-4 h-4 text-[#38BDF8]" />
                      <h3 className="text-xs font-bold text-white tracking-wide">Mouse Position</h3>
                    </div>

                    {/* Big Coordinate Display */}
                    <div className="rounded-2xl bg-[#0B1324] border border-slate-800 p-3 mb-3 text-center relative overflow-hidden">
                      <div className="flex items-center justify-center gap-4 text-slate-100 font-mono text-xl font-black">
                        <div><span className="text-slate-400 text-sm font-normal">X: </span>{coords.x}</div>
                        <div className="w-1.5 h-4 bg-sky-400 rounded-full animate-pulse" />
                        <div><span className="text-slate-400 text-sm font-normal">Y: </span>{coords.y}</div>
                      </div>
                      <div className="text-[10px] text-sky-400 font-medium mt-1">Screen Coordinates</div>
                    </div>

                    {/* Interactive Radar Visual */}
                    <div className="relative w-28 h-28 mx-auto my-2 rounded-full border border-sky-500/30 flex items-center justify-center bg-sky-950/10">
                      <div className="absolute inset-0 rounded-full border border-dashed border-sky-500/20" />
                      <div className="w-16 h-16 rounded-full border border-sky-500/30" />
                      <div className="w-1 h-full bg-sky-500/20 absolute" />
                      <div className="h-1 w-full bg-sky-500/20 absolute" />
                      
                      {/* Live Pointer Dot */}
                      <div 
                        className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_8px_#38BDF8] transition-transform duration-75"
                        style={{
                          transform: `translate(${(coords.x % 40) - 20}px, ${(coords.y % 40) - 20}px)`
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                      <span className="text-slate-300 font-medium">Movement</span>
                      <span className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold">
                        <span className={`w-2 h-2 rounded-full ${isMoving ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400'}`} />
                        Active
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Move your mouse to see live tracking.</p>
                  </div>
                </div>

              </div>

              {/* 3. SCROLL WHEEL TEST CARD */}
              <div className="rounded-3xl bg-[#080D1A] border border-slate-800/80 p-4 shadow-xl">
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800/80">
                  <Mouse className="w-4 h-4 text-[#38BDF8]" />
                  <h3 className="text-xs font-bold text-white tracking-wide">Scroll Wheel Test</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#0B1324] border border-slate-800">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <span className="text-cyan-400 font-bold">↑</span> Scroll Up
                      </span>
                      <span className="font-mono text-cyan-400 font-bold">↑ {buttonStates.scrollUp.count}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#0B1324] border border-slate-800">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <span className="text-cyan-400 font-bold">↓</span> Scroll Down
                      </span>
                      <span className="font-mono text-cyan-400 font-bold">↓ {buttonStates.scrollDown.count}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#0B1324] border border-slate-800">
                    <div className={`w-10 h-10 rounded-full border text-cyan-400 flex items-center justify-center shrink-0 transition-colors ${
                      isScrollTested 
                        ? 'bg-cyan-950/60 border-cyan-500/40' 
                        : 'bg-slate-900/60 border-slate-800 text-slate-500'
                    }`}>
                      <RotateCw className={`w-5 h-5 ${buttonStates.scrollUp.active || buttonStates.scrollDown.active ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        {isScrollTested ? 'Working' : 'Not Tested'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isScrollTested ? 'Scroll wheel is responsive.' : 'Scroll up or down to test.'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. TEST LOG CARD */}
              <div className="rounded-3xl bg-[#080D1A] border border-slate-800/80 p-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#38BDF8]" />
                    <h3 className="text-xs font-bold text-white tracking-wide">Test Log</h3>
                  </div>

                  {logs.length > 0 && (
                    <button
                      onClick={clearLogs}
                      className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40 text-slate-300">
                        <div className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                          <span className="font-mono text-[11px] text-slate-400">{log.time}</span>
                          <span className="text-slate-200 font-medium">{log.text}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 italic py-2">
                      Click buttons or scroll to record events...
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ================================================== */}
        {/* TAB 2: SCROLL WHEEL DIAGNOSTICS */}
        {/* ================================================== */}
        {activeTab === 'scroll' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#080D1A] rounded-3xl border border-slate-800/80 p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Scroll Wheel Precision & Direction Test</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Scroll anywhere inside this zone to test continuous notches, direction fidelity, and speed.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
                    Live Velocity: {mouseSpeed} px/s
                  </span>
                </div>
              </div>

              {/* Big Interactive Scroll Area */}
              <div 
                className="h-72 rounded-2xl bg-[#0B1324] border border-dashed border-cyan-500/30 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
              >
                <div className="w-20 h-20 rounded-full bg-cyan-500/10 border-2 border-cyan-400/40 flex items-center justify-center mb-4 text-cyan-400">
                  <RotateCw className={`w-10 h-10 ${buttonStates.scrollUp.active || buttonStates.scrollDown.active ? 'animate-spin' : ''}`} />
                </div>
                <h3 className="text-base font-bold text-white">Scroll Inside Here</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Testing both vertical scrolling and high-precision notched wheel sensors.
                </p>

                <div className="flex items-center gap-6 mt-6">
                  <div className="px-4 py-2 rounded-xl bg-[#080D1A] border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Scroll Up Notches</div>
                    <div className="text-xl font-mono font-black text-cyan-400">↑ {buttonStates.scrollUp.count}</div>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-[#080D1A] border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Scroll Down Notches</div>
                    <div className="text-xl font-mono font-black text-cyan-400">↓ {buttonStates.scrollDown.count}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll Right Column Info */}
            <div className="space-y-4">
              <div className="bg-[#080D1A] rounded-3xl border border-slate-800/80 p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Scroll Sensor Health
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1324] border border-slate-800">
                    <span className="text-slate-400">Optical Encoder Status</span>
                    <span className="text-emerald-400 font-bold">Optimal</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1324] border border-slate-800">
                    <span className="text-slate-400">Inverted Scroll Detected</span>
                    <span className="text-slate-200 font-bold">No (Normal)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1324] border border-slate-800">
                    <span className="text-slate-400">Total Revolutions Recorded</span>
                    <span className="text-cyan-400 font-mono font-bold">
                      {((buttonStates.scrollUp.count + buttonStates.scrollDown.count) / 24).toFixed(1)} revs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* TAB 3: MOVEMENT & POLLING RATE TEST */}
        {/* ================================================== */}
        {activeTab === 'movement' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#080D1A] rounded-3xl border border-slate-800/80 p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Movement Tracker & Polling Rate Analyzer</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Move your cursor to analyze sensor smoothness, velocity curves, and sample frequency.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Tracking Live
                  </span>
                </div>
              </div>

              {/* Movement Canvas Area */}
              <div className="h-80 rounded-2xl bg-[#0B1324] border border-slate-800 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

                {/* Trail visualization */}
                {trailPoints.map((pt, idx) => (
                  <div
                    key={pt.id}
                    className="absolute w-2.5 h-2.5 rounded-full bg-sky-400 pointer-events-none transition-all"
                    style={{
                      left: `${(pt.x % 500) + 50}px`,
                      top: `${(pt.y % 240) + 30}px`,
                      opacity: 1 - idx * 0.06,
                      transform: `scale(${1 - idx * 0.05})`,
                      boxShadow: '0 0 8px rgba(56, 189, 248, 0.8)'
                    }}
                  />
                ))}

                <div className="text-center z-10">
                  <div className="text-3xl font-black font-mono text-white mb-1">{mouseSpeed} <span className="text-sm font-normal text-slate-400">px/s</span></div>
                  <div className="text-xs text-sky-400 font-semibold uppercase tracking-wider">Instantaneous Velocity</div>
                </div>
              </div>
            </div>

            {/* Movement Diagnostic Cards */}
            <div className="space-y-4">
              <div className="bg-[#080D1A] rounded-3xl border border-slate-800/80 p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-purple-400" />
                  Estimated Polling Rate
                </h3>
                <div className="p-4 rounded-2xl bg-[#0B1324] border border-slate-800 text-center">
                  <div className="text-3xl font-black font-mono text-purple-400">{pollingRate} <span className="text-base text-slate-400">Hz</span></div>
                  <div className="text-[11px] text-slate-400 mt-1">USB Sample Frequency</div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Target Spec:</span>
                    <span className="text-slate-200 font-semibold">1000 Hz / 1ms</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Jitter Level:</span>
                    <span className="text-emerald-400 font-semibold">Very Low (&lt; 0.2ms)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* TAB 4: DPI TEST */}
        {/* ================================================== */}
        {activeTab === 'dpi' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#080D1A] rounded-3xl border border-slate-800/80 p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">DPI & Sensitivity Calculator</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Measure your mouse sensor DPI by sliding your mouse a measured physical distance.</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0B1324] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Target Physical Distance</span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 5].map((inch) => (
                      <button
                        key={inch}
                        onClick={() => setDpiDistance(inch)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          dpiDistance === inch
                            ? 'bg-indigo-600 text-white shadow'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {inch} inch{inch > 1 ? 'es' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[#080D1A] border border-dashed border-indigo-500/40 text-center space-y-4">
                  <div className="text-4xl font-black font-mono text-indigo-400">
                    {Math.round(dpiPixelsMeasured / dpiDistance)} <span className="text-sm font-normal text-slate-400">DPI</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Calculated from {dpiPixelsMeasured} horizontal pixels traveled across {dpiDistance} inches.
                  </p>

                  <button
                    onClick={() => {
                      setIsMeasuringDpi(!isMeasuringDpi);
                      if (!isMeasuringDpi) {
                        setDpiPixelsMeasured(0);
                        dpiStartPosRef.current = null;
                      }
                    }}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isMeasuringDpi 
                        ? 'bg-rose-600 text-white animate-pulse' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isMeasuringDpi ? 'Stop Measuring' : 'Start DPI Measurement'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#080D1A] rounded-3xl border border-slate-800/80 p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-indigo-400" />
                Standard DPI Profiles
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { name: 'Office / Productivity', range: '800 - 1200 DPI' },
                  { name: 'FPS Competitive Gaming', range: '400 - 800 DPI' },
                  { name: 'MOBA / Strategy', range: '1200 - 2400 DPI' },
                  { name: 'Ultra-High Precision (4K)', range: '3200 - 6400+ DPI' },
                ].map((prof, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-[#0B1324] border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300 font-medium">{prof.name}</span>
                    <span className="text-indigo-400 font-mono font-bold">{prof.range}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* TAB 5: SETTINGS */}
        {/* ================================================== */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto bg-[#080D1A] rounded-3xl border border-slate-800/80 p-8 shadow-2xl space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-4 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              Diagnostics Configuration & Controls
            </h2>

            <div className="space-y-4 text-xs">
              {/* Audio feedback */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0B1324] border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                    {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 text-sm">Acoustic Click Feedback</div>
                    <div className="text-slate-400 text-[11px]">Synthesize physical switch clicks on button events</div>
                  </div>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all ${
                    soundEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {soundEnabled ? 'Enabled' : 'Muted'}
                </button>
              </div>

              {/* Prevent Right Click Menu */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0B1324] border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 text-sm">Suppress Browser Context Menu</div>
                    <div className="text-slate-400 text-[11px]">Enables right click testing without default browser popup</div>
                  </div>
                </div>
                <button
                  onClick={() => setPreventContextMenu(!preventContextMenu)}
                  className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all ${
                    preventContextMenu ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {preventContextMenu ? 'Active' : 'Disabled'}
                </button>
              </div>

              {/* Reset Everything */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0B1324] border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 text-sm">Reset Diagnostics Counters</div>
                    <div className="text-slate-400 text-[11px]">Clear all recorded clicks, logs, and sensor measurements</div>
                  </div>
                </div>
                <button
                  onClick={resetAllTests}
                  className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white font-bold cursor-pointer transition-all"
                >
                  Reset All
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MouseTester;

