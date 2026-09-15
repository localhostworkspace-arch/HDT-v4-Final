import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Disc, 
  RotateCcw, 
  RefreshCw, 
  AlertCircle, 
  Info, 
  Sliders, 
  Gauge, 
  ShieldAlert
} from 'lucide-react';
import { SeoHead } from '../../seo/SeoHead';

type RotationRange = 180 | 270 | 360 | 540 | 900 | 1080;

interface PedalConfig {
  axisIndex: number;
  inverted: boolean;
}

export const SteeringWheelTester: React.FC = () => {
  // Gamepad Detection State
  const [gamepads, setGamepads] = useState<Gamepad[]>([]);
  const [selectedGamepadIndex, setSelectedGamepadIndex] = useState<number>(0);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  // Wheel Settings
  const [wheelRange, setWheelRange] = useState<RotationRange>(900);
  const [steerAxisIndex, setSteerAxisIndex] = useState<number>(0);
  const [deadzone, setDeadzone] = useState<number>(0.02);

  // Pedal Configurations
  const [throttleConfig, setThrottleConfig] = useState<PedalConfig>({ axisIndex: 1, inverted: true });
  const [brakeConfig, setBrakeConfig] = useState<PedalConfig>({ axisIndex: 2, inverted: true });
  const [clutchConfig, setClutchConfig] = useState<PedalConfig>({ axisIndex: 5, inverted: true });

  // Live Input State
  const [rawAxes, setRawAxes] = useState<number[]>([]);
  const [buttonsState, setButtonsState] = useState<{ pressed: boolean; value: number }[]>([]);
  const [pollingRate, setPollingRate] = useState<number>(0);
  const [totalInputs, setTotalInputs] = useState<number>(0);

  // Stats
  const [maxLeftAngle, setMaxLeftAngle] = useState<number>(0);
  const [maxRightAngle, setMaxRightAngle] = useState<number>(0);

  // Animation & Polling Refs
  const animRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(performance.now());
  const prevButtonsRef = useRef<boolean[]>([]);

  // Check Gamepad API availability
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = 'getGamepads' in navigator;
      setIsSupported(supported);
    }
  }, []);

  // Poll available gamepads
  const refreshGamepads = useCallback(() => {
    if (!navigator.getGamepads) return;
    const detected = Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[];
    setGamepads(detected);

    if (detected.length > 0 && selectedGamepadIndex >= detected.length) {
      setSelectedGamepadIndex(0);
    }
  }, [selectedGamepadIndex]);

  // Handle Gamepad connection events
  useEffect(() => {
    const handleConnected = () => {
      refreshGamepads();
    };

    const handleDisconnected = () => {
      refreshGamepads();
    };

    window.addEventListener('gamepadconnected', handleConnected);
    window.addEventListener('gamepaddisconnected', handleDisconnected);
    refreshGamepads();

    return () => {
      window.removeEventListener('gamepadconnected', handleConnected);
      window.removeEventListener('gamepaddisconnected', handleDisconnected);
    };
  }, [refreshGamepads]);

  // Main polling loop using requestAnimationFrame
  useEffect(() => {
    let isRunning = true;

    const poll = () => {
      if (!isRunning) return;

      if (navigator.getGamepads) {
        const detected = Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[];
        if (detected.length > 0) {
          const gp = detected[selectedGamepadIndex] || detected[0];
          if (gp) {
            // Axes
            const currentAxes = Array.from(gp.axes);
            setRawAxes(currentAxes);

            // Buttons
            const currentButtons = gp.buttons.map(b => ({ pressed: b.pressed, value: b.value }));
            setButtonsState(currentButtons);

            // Calculate input changes
            let newPresses = 0;
            currentButtons.forEach((b, idx) => {
              const wasPressed = prevButtonsRef.current[idx] || false;
              if (b.pressed && !wasPressed) {
                newPresses++;
              }
            });
            prevButtonsRef.current = currentButtons.map(b => b.pressed);

            if (newPresses > 0) {
              setTotalInputs(prev => prev + newPresses);
            }

            // Polling rate calculation
            frameCountRef.current++;
            const now = performance.now();
            if (now - lastFpsUpdateRef.current >= 1000) {
              const fps = Math.round((frameCountRef.current * 1000) / (now - lastFpsUpdateRef.current));
              setPollingRate(fps);
              frameCountRef.current = 0;
              lastFpsUpdateRef.current = now;
            }
          }
        } else {
          setRawAxes([]);
          setButtonsState([]);
          setPollingRate(0);
        }
      }

      animRef.current = requestAnimationFrame(poll);
    };

    animRef.current = requestAnimationFrame(poll);

    return () => {
      isRunning = false;
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [selectedGamepadIndex]);

  // Compute live steering angle
  const rawSteerValue = rawAxes[steerAxisIndex] ?? 0;
  const steerNormalized = Math.abs(rawSteerValue) < deadzone ? 0 : rawSteerValue;
  // Maximum half-angle for selected range (e.g. 900 deg wheel turns +/- 450 deg)
  const halfRange = wheelRange / 2;
  const currentAngle = steerNormalized * halfRange;

  // Track max angles
  useEffect(() => {
    if (currentAngle < 0 && Math.abs(currentAngle) > maxLeftAngle) {
      setMaxLeftAngle(Math.min(halfRange, Math.round(Math.abs(currentAngle))));
    } else if (currentAngle > 0 && currentAngle > maxRightAngle) {
      setMaxRightAngle(Math.min(halfRange, Math.round(currentAngle)));
    }
  }, [currentAngle, halfRange, maxLeftAngle, maxRightAngle]);

  // Helper to normalize pedal axis to 0% -> 100%
  const calculatePedalPercent = (cfg: PedalConfig): { percent: number; raw: number } => {
    const raw = rawAxes[cfg.axisIndex];
    if (raw === undefined) return { percent: 0, raw: 0 };

    let normalized: number;
    if (cfg.inverted) {
      normalized = (1 - raw) / 2;
    } else {
      normalized = (raw + 1) / 2;
    }
    const clamped = Math.max(0, Math.min(100, Math.round(normalized * 100)));
    return { percent: clamped, raw };
  };

  const throttle = calculatePedalPercent(throttleConfig);
  const brake = calculatePedalPercent(brakeConfig);
  const clutch = calculatePedalPercent(clutchConfig);

  // Active status check
  const isWheelConnected = gamepads.length > 0;
  const isWheelActive = Math.abs(steerNormalized) > 0.03 || throttle.percent > 2 || brake.percent > 2 || clutch.percent > 2 || buttonsState.some(b => b.pressed);

  // Reset angle records
  const handleResetRecord = () => {
    setMaxLeftAngle(0);
    setMaxRightAngle(0);
    setTotalInputs(0);
  };

  const activeDevice = gamepads[selectedGamepadIndex];

  return (
    <div className="min-h-screen pt-4 pb-20">
      <SeoHead
        title="Steering Wheel Tester - Racing Wheel & Pedals Diagnostic | HardwareTest"
        description="Comprehensive browser-based racing wheel tester. Inspect steering rotation angle, accelerator, brake, clutch pedals, paddle shifters, and button responsiveness with the HTML5 Gamepad API."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title Section */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Disc className="w-3.5 h-3.5 text-blue-400" />
              <span>HTML5 Gamepad API • Sim Racing Lab</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Steering Wheel Tester
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1">
              Verify wheel rotation degrees, pedal pressure linear curves, paddle shifters, and button inputs in real time.
            </p>
          </div>

          {/* Quick Rotation Angle Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Rotation Range:</span>
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              {([180, 270, 360, 540, 900, 1080] as RotationRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setWheelRange(range)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    wheelRange === range
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {range}°
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Browser Support Alert (if Gamepad API unsupported) */}
        {!isSupported && (
          <div role="alert" className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Gamepad API Unsupported</p>
              <p className="text-xs mt-1">Your current browser does not support the HTML5 Gamepad API. Please use a modern Chromium-based browser (Chrome, Edge, Brave, Opera) or Firefox.</p>
            </div>
          </div>
        )}

        {/* Driver Guidance Callout Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-slate-800 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold text-amber-900 dark:text-amber-300">Driver &amp; Software Note: </span>
              Many steering wheels (such as Logitech G29/G920/G923, Thrustmaster T300/TX, Fanatec, and Moza) require their official vendor software
              (e.g., Logitech G HUB, Thrustmaster Control Panel, Fanatec FanaLab, or Moza Pit House) installed on your operating system before your browser can expose the device axes.
            </div>
          </div>
          <div className="text-[11px] text-amber-800 dark:text-amber-400/90 whitespace-nowrap self-end sm:self-center font-medium">
            Requires USB connection
          </div>
        </div>

        {/* Device Detection & Status Bar */}
        <div className="p-4 mb-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              isWheelConnected 
                ? isWheelActive 
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500 animate-pulse' 
                  : 'bg-blue-500/15 border-blue-500/30 text-blue-500'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
            }`}>
              <Disc className="w-6 h-6" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {isWheelConnected ? (activeDevice?.id || 'Steering Wheel Connected') : 'No Wheel or Gamepad Detected'}
                </h2>
                {isWheelConnected ? (
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isWheelActive 
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                      : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                  }`}>
                    {isWheelActive ? 'Active Stream' : 'Neutral State (Ready)'}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    Disconnected
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isWheelConnected ? (
                  <>Index #{selectedGamepadIndex} • {activeDevice?.axes.length || 0} Axes • {activeDevice?.buttons.length || 0} Buttons • Mapping: {activeDevice?.mapping || 'standard'}</>
                ) : (
                  <>Connect your wheel via USB, turn the wheel or tap any pedal to activate the browser Gamepad API.</>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Multiple Devices Dropdown */}
            {gamepads.length > 1 && (
              <select
                aria-label="Select connected gamepad"
                value={selectedGamepadIndex}
                onChange={(e) => setSelectedGamepadIndex(Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                {gamepads.map((gp, i) => (
                  <option key={i} value={i}>
                    {gp.id.slice(0, 24)}... (#{i})
                  </option>
                ))}
              </select>
            )}

            {/* Polling Rate */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-center">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Poll Rate</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{pollingRate > 0 ? `${pollingRate} Hz` : 'Idle'}</span>
            </div>

            {/* Inputs Count */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-center">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Inputs</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{totalInputs}</span>
            </div>

            {/* Refresh / Connect action button */}
            <button
              onClick={refreshGamepads}
              title="Connect / Refresh Devices"
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Connect / Refresh</span>
            </button>

            {/* Reset History */}
            <button
              onClick={handleResetRecord}
              title="Reset Travel History"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MAIN WORKBENCH: 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT 7-COL: Steering Wheel Visualizer & Live Degree Metrics */}
          <div className="lg:col-span-7 flex flex-col p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
            
            {/* Header / Sub-status */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isWheelConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Steering Axis Real-Time Vector
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-500 dark:text-slate-400">Center: </span>
                <span className={`font-mono font-bold ${Math.abs(currentAngle) < 2 ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'}`}>
                  {Math.abs(currentAngle) < 2 ? 'Centered (0°)' : `${currentAngle.toFixed(1)}°`}
                </span>
              </div>
            </div>

            {/* Steering Wheel Graphic Canvas Area */}
            <div className="flex-1 flex flex-col items-center justify-center py-6 relative">
              
              {/* Center Alignment Notch Indicator at Top */}
              <div className="flex flex-col items-center mb-3">
                <div className="w-1.5 h-4 rounded-full bg-rose-500 shadow-xs shadow-rose-500/50" />
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mt-1">Center 0°</span>
              </div>

              {/* ROTATING WHEEL GRAPHIC */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                
                {/* Degrees Reference Arc Background */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 320">
                  <circle
                    cx="160"
                    cy="160"
                    r="150"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="4 6"
                    className="text-slate-200 dark:text-slate-800"
                  />
                  {/* Left Limit Marker */}
                  <line x1="20" y1="160" x2="35" y2="160" stroke="#3B82F6" strokeWidth="3" />
                  {/* Right Limit Marker */}
                  <line x1="285" y1="160" x2="300" y2="160" stroke="#3B82F6" strokeWidth="3" />
                  {/* Top Center Marker */}
                  <line x1="160" y1="20" x2="160" y2="35" stroke="#EF4444" strokeWidth="3" />
                </svg>

                {/* The Rotating Wheel */}
                <div
                  className="w-56 h-56 sm:w-72 sm:h-72 rounded-full transition-transform ease-out duration-75 flex items-center justify-center relative shadow-2xl"
                  style={{
                    transform: `rotate(${currentAngle}deg)`,
                  }}
                >
                  {/* Wheel Outer Rim (Black Leather Style) */}
                  <div className="absolute inset-0 rounded-full border-[18px] sm:border-[22px] border-slate-900 dark:border-slate-800 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.4)] flex items-center justify-center">
                    
                    {/* 12 o'clock Racing Stripe Indicator */}
                    <div className="absolute -top-[18px] sm:-top-[22px] left-1/2 -translate-x-1/2 w-4 h-[18px] sm:h-[22px] bg-rose-500 rounded-t-xs" />
                  </div>

                  {/* Left & Right Paddle Shifter Ears (Behind Wheel) */}
                  <div className={`absolute -left-5 top-1/3 w-6 h-20 rounded-l-xl transition-all border ${
                    buttonsState[4]?.pressed 
                      ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/50 scale-105' 
                      : 'bg-slate-800 border-slate-700'
                  }`} />
                  <div className={`absolute -right-5 top-1/3 w-6 h-20 rounded-r-xl transition-all border ${
                    buttonsState[5]?.pressed 
                      ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/50 scale-105' 
                      : 'bg-slate-800 border-slate-700'
                  }`} />

                  {/* Center Metal Hub & Spokes */}
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 border-4 border-slate-600 dark:border-slate-700 shadow-inner flex flex-col items-center justify-center relative">
                    
                    {/* Horizontal Center Spoke */}
                    <div className="absolute left-[-45px] right-[-45px] h-8 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 -z-10 rounded-sm" />
                    {/* Vertical Bottom Spoke */}
                    <div className="absolute bottom-[-45px] w-8 h-14 bg-gradient-to-b from-slate-700 to-slate-800 -z-10 rounded-sm" />

                    {/* Horn Cap / Logo Badge */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-950 border-2 border-blue-500/40 flex flex-col items-center justify-center text-center shadow-lg">
                      <Disc className="w-6 h-6 text-blue-400 mb-0.5" />
                      <span className="text-[9px] font-black tracking-widest text-slate-300">HDT SIM</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Dynamic Live Angle & Direction Pill */}
              <div className="mt-6 flex flex-col items-center gap-2">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
                    currentAngle < -2 
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}>
                    ← LEFT {currentAngle < 0 ? `${Math.abs(currentAngle).toFixed(1)}°` : '0°'}
                  </div>

                  <div className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white px-3 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                    {currentAngle > 0 ? `+${currentAngle.toFixed(1)}°` : `${currentAngle.toFixed(1)}°`}
                  </div>

                  <div className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
                    currentAngle > 2 
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}>
                    RIGHT {currentAngle > 0 ? `${currentAngle.toFixed(1)}°` : '0°'} →
                  </div>
                </div>

                {/* Max Observed Travel */}
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                  <span>Max Left: <strong className="text-blue-600 dark:text-blue-400">{maxLeftAngle}°</strong></span>
                  <span>•</span>
                  <span>Range: <strong className="text-slate-800 dark:text-slate-200">{wheelRange}° (±{halfRange}°)</strong></span>
                  <span>•</span>
                  <span>Max Right: <strong className="text-blue-600 dark:text-blue-400">{maxRightAngle}°</strong></span>
                </div>
              </div>
            </div>

            {/* Bottom Axis Configuration Tray */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">Steering Axis:</span>
                <select
                  aria-label="Steering axis selection"
                  value={steerAxisIndex}
                  onChange={(e) => setSteerAxisIndex(Number(e.target.value))}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold"
                >
                  {Array.from({ length: Math.max(4, rawAxes.length) }).map((_, i) => (
                    <option key={i} value={i}>
                      Axis {i} {i === 0 ? '(Standard)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">Center Deadzone:</span>
                <select
                  aria-label="Steering deadzone selection"
                  value={deadzone}
                  onChange={(e) => setDeadzone(Number(e.target.value))}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold"
                >
                  <option value={0}>0% (Raw)</option>
                  <option value={0.01}>1% (Ultra Fine)</option>
                  <option value={0.02}>2% (Standard)</option>
                  <option value={0.05}>5% (Loose)</option>
                </select>
              </div>
            </div>
          </div>

          {/* RIGHT 5-COL: Pedals, Paddle Shifters & Button Matrix */}
          <div className="lg:col-span-5 space-y-6">

            {/* PEDALS INSTRUMENT BENCH */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Pedal Pressure Gauges
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">0% – 100% Linear</span>
              </div>

              {/* Triple Pedals Layout: Clutch, Brake, Throttle */}
              <div className="grid grid-cols-3 gap-3">

                {/* CLUTCH PEDAL */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">CLUTCH</span>
                  <span className="text-lg font-mono font-black text-cyan-600 dark:text-cyan-400 mb-2">
                    {clutch.percent}%
                  </span>

                  {/* Vertical Progress Tube */}
                  <div className="w-8 h-36 bg-slate-200 dark:bg-slate-800 rounded-xl relative overflow-hidden border border-slate-300 dark:border-slate-700 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 transition-all duration-75 rounded-b-lg"
                      style={{ height: `${clutch.percent}%` }}
                    />
                  </div>

                  {/* Config options */}
                  <div className="mt-3 w-full space-y-1 text-[10px]">
                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                      <span>Axis:</span>
                      <select
                        aria-label="Clutch axis selection"
                        value={clutchConfig.axisIndex}
                        onChange={(e) => setClutchConfig(prev => ({ ...prev, axisIndex: Number(e.target.value) }))}
                        className="bg-slate-200 dark:bg-slate-800 rounded px-1 text-[10px]"
                      >
                        {Array.from({ length: Math.max(6, rawAxes.length) }).map((_, i) => (
                          <option key={i} value={i}>Ax {i}</option>
                        ))}
                      </select>
                    </div>
                    <label className="flex items-center justify-between text-slate-500 dark:text-slate-400 cursor-pointer">
                      <span>Invert:</span>
                      <input
                        type="checkbox"
                        checked={clutchConfig.inverted}
                        onChange={(e) => setClutchConfig(prev => ({ ...prev, inverted: e.target.checked }))}
                        className="rounded"
                      />
                    </label>
                  </div>
                </div>

                {/* BRAKE PEDAL */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">BRAKE</span>
                  <span className="text-lg font-mono font-black text-rose-600 dark:text-rose-400 mb-2">
                    {brake.percent}%
                  </span>

                  {/* Vertical Progress Tube */}
                  <div className="w-8 h-36 bg-slate-200 dark:bg-slate-800 rounded-xl relative overflow-hidden border border-slate-300 dark:border-slate-700 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-rose-600 to-rose-400 transition-all duration-75 rounded-b-lg"
                      style={{ height: `${brake.percent}%` }}
                    />
                  </div>

                  {/* Config options */}
                  <div className="mt-3 w-full space-y-1 text-[10px]">
                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                      <span>Axis:</span>
                      <select
                        aria-label="Brake axis selection"
                        value={brakeConfig.axisIndex}
                        onChange={(e) => setBrakeConfig(prev => ({ ...prev, axisIndex: Number(e.target.value) }))}
                        className="bg-slate-200 dark:bg-slate-800 rounded px-1 text-[10px]"
                      >
                        {Array.from({ length: Math.max(6, rawAxes.length) }).map((_, i) => (
                          <option key={i} value={i}>Ax {i}</option>
                        ))}
                      </select>
                    </div>
                    <label className="flex items-center justify-between text-slate-500 dark:text-slate-400 cursor-pointer">
                      <span>Invert:</span>
                      <input
                        type="checkbox"
                        checked={brakeConfig.inverted}
                        onChange={(e) => setBrakeConfig(prev => ({ ...prev, inverted: e.target.checked }))}
                        className="rounded"
                      />
                    </label>
                  </div>
                </div>

                {/* THROTTLE PEDAL */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">THROTTLE</span>
                  <span className="text-lg font-mono font-black text-emerald-600 dark:text-emerald-400 mb-2">
                    {throttle.percent}%
                  </span>

                  {/* Vertical Progress Tube */}
                  <div className="w-8 h-36 bg-slate-200 dark:bg-slate-800 rounded-xl relative overflow-hidden border border-slate-300 dark:border-slate-700 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-75 rounded-b-lg"
                      style={{ height: `${throttle.percent}%` }}
                    />
                  </div>

                  {/* Config options */}
                  <div className="mt-3 w-full space-y-1 text-[10px]">
                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                      <span>Axis:</span>
                      <select
                        aria-label="Throttle axis selection"
                        value={throttleConfig.axisIndex}
                        onChange={(e) => setThrottleConfig(prev => ({ ...prev, axisIndex: Number(e.target.value) }))}
                        className="bg-slate-200 dark:bg-slate-800 rounded px-1 text-[10px]"
                      >
                        {Array.from({ length: Math.max(6, rawAxes.length) }).map((_, i) => (
                          <option key={i} value={i}>Ax {i}</option>
                        ))}
                      </select>
                    </div>
                    <label className="flex items-center justify-between text-slate-500 dark:text-slate-400 cursor-pointer">
                      <span>Invert:</span>
                      <input
                        type="checkbox"
                        checked={throttleConfig.inverted}
                        onChange={(e) => setThrottleConfig(prev => ({ ...prev, inverted: e.target.checked }))}
                        className="rounded"
                      />
                    </label>
                  </div>
                </div>

              </div>
            </div>

            {/* PADDLE SHIFTERS & BUTTON MATRIX */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Paddles &amp; Buttons Matrix
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">{buttonsState.length} Exposed Buttons</span>
              </div>

              {/* Quick Paddle Indicators */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className={`p-3 rounded-xl border text-center transition-all ${
                  buttonsState[4]?.pressed
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  <span className="text-[10px] block font-semibold uppercase">Left Paddle (Downshift)</span>
                  <strong className="text-xs">{buttonsState[4]?.pressed ? 'CLICKED' : 'B4 / LB'}</strong>
                </div>

                <div className={`p-3 rounded-xl border text-center transition-all ${
                  buttonsState[5]?.pressed
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  <span className="text-[10px] block font-semibold uppercase">Right Paddle (Upshift)</span>
                  <strong className="text-xs">{buttonsState[5]?.pressed ? 'CLICKED' : 'B5 / RB'}</strong>
                </div>
              </div>

              {/* Full Button Grid */}
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                {Array.from({ length: Math.max(16, buttonsState.length) }).map((_, idx) => {
                  const isPressed = buttonsState[idx]?.pressed || false;
                  return (
                    <div
                      key={idx}
                      className={`h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold transition-all border ${
                        isPressed
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow-md scale-105'
                          : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/60'
                      }`}
                    >
                      B{idx}
                    </div>
                  );
                })}
              </div>

              {/* Raw Axes Values Table */}
              {rawAxes.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block mb-2">Raw Axis Telemetry:</span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                    {rawAxes.map((val, idx) => (
                      <div key={idx} className="flex justify-between px-2 py-1 rounded bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500 dark:text-slate-400">Ax {idx}:</span>
                        <span className={Math.abs(val) > 0.05 ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-slate-500'}>
                          {val.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* TECHNICAL SCOPE & DISCLAIMER FOOTER */}
        <div className="mt-8 p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 space-y-2">
              <p>
                <strong className="text-slate-900 dark:text-white">Browser API Capability &amp; Diagnostic Scope: </strong>
                This diagnostic tool utilizes the HTML5 Gamepad API to inspect raw analog axis deflection, linear pedal ranges, paddle engagement, and digital button presses directly from your browser.
              </p>
              <p>
                Web browsers can only read inputs exposed by the OS gamepad driver. Force feedback (FFB) motor damping, constant force effects, mechanical gear wear, proprietary load cell telemetry, and manufacturer-specific RGB/RPM LED strips cannot be controlled or tested over standard browser APIs without proprietary native software.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SteeringWheelTester;
