import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Crosshair, 
  RotateCcw, 
  RefreshCw, 
  AlertCircle, 
  Info, 
  Gauge, 
  ShieldAlert, 
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { SeoHead } from '../../seo/SeoHead';

interface DisplayCalibration {
  offsetX: number;
  offsetY: number;
  offsetZ: number;
}

export const FlightStickTester: React.FC = () => {
  // Gamepad Detection State
  const [gamepads, setGamepads] = useState<Gamepad[]>([]);
  const [selectedGamepadIndex, setSelectedGamepadIndex] = useState<number>(0);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  // Axis Assignments
  const [xAxisIndex, setXAxisIndex] = useState<number>(0); // Roll
  const [yAxisIndex, setYAxisIndex] = useState<number>(1); // Pitch
  const [zAxisIndex, setZAxisIndex] = useState<number>(2); // Twist / Yaw (or Throttle on some sticks)
  const [throttleAxisIndex, setThrottleAxisIndex] = useState<number>(3); // Throttle Lever
  const [invertPitch, setInvertPitch] = useState<boolean>(false);
  const [invertThrottle, setInvertThrottle] = useState<boolean>(true);

  // Live Hardware Data
  const [rawAxes, setRawAxes] = useState<number[]>([]);
  const [buttonsState, setButtonsState] = useState<{ pressed: boolean; value: number }[]>([]);
  const [pollingRate, setPollingRate] = useState<number>(0);
  const [totalInputs, setTotalInputs] = useState<number>(0);

  // Visual Display Calibration Offset (Visual reference only)
  const [calibration, setCalibration] = useState<DisplayCalibration>({ offsetX: 0, offsetY: 0, offsetZ: 0 });
  const [calibrationNotice, setCalibrationNotice] = useState<string | null>(null);

  // Refs
  const animRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(performance.now());
  const prevButtonsRef = useRef<boolean[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Check Gamepad API availability
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSupported('getGamepads' in navigator);
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

  // Gamepad event listeners
  useEffect(() => {
    const handleConnected = () => refreshGamepads();
    const handleDisconnected = () => refreshGamepads();

    window.addEventListener('gamepadconnected', handleConnected);
    window.addEventListener('gamepaddisconnected', handleDisconnected);
    refreshGamepads();

    return () => {
      window.removeEventListener('gamepadconnected', handleConnected);
      window.removeEventListener('gamepaddisconnected', handleDisconnected);
    };
  }, [refreshGamepads]);

  // Main polling loop
  useEffect(() => {
    let isRunning = true;

    const poll = () => {
      if (!isRunning) return;

      if (navigator.getGamepads) {
        const detected = Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[];
        if (detected.length > 0) {
          const gp = detected[selectedGamepadIndex] || detected[0];
          if (gp) {
            const currentAxes = Array.from(gp.axes);
            setRawAxes(currentAxes);

            const currentButtons = gp.buttons.map(b => ({ pressed: b.pressed, value: b.value }));
            setButtonsState(currentButtons);

            // Track input counter
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

            // Calculate Polling Rate
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
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [selectedGamepadIndex]);

  // Normalized Coordinates with Visual Offset
  const rawX = rawAxes[xAxisIndex] ?? 0;
  const rawY = rawAxes[yAxisIndex] ?? 0;
  const rawZ = rawAxes[zAxisIndex] ?? 0;
  const rawThrottle = rawAxes[throttleAxisIndex] ?? 0;

  const calibratedX = Math.max(-1, Math.min(1, rawX - calibration.offsetX));
  const effectiveRawY = invertPitch ? -rawY : rawY;
  const calibratedY = Math.max(-1, Math.min(1, effectiveRawY - calibration.offsetY));
  const calibratedZ = Math.max(-1, Math.min(1, rawZ - calibration.offsetZ));

  // Normalized Throttle: -1.0 to 1.0 mapped to 0% to 100%
  const throttlePercent = invertThrottle 
    ? Math.max(0, Math.min(100, Math.round(((1 - rawThrottle) / 2) * 100)))
    : Math.max(0, Math.min(100, Math.round(((rawThrottle + 1) / 2) * 100)));

  // Deflection distance from center (0.0 to 1.0+)
  const deflectionDistance = Math.min(1.0, Math.hypot(calibratedX, calibratedY));
  const deflectionPercent = Math.round(deflectionDistance * 100);

  // Recalibrate / Reset Center Display Action
  const handleRecalibrateDisplay = () => {
    setCalibration({
      offsetX: rawX,
      offsetY: effectiveRawY,
      offsetZ: rawZ
    });
    setCalibrationNotice('Visual zero reference recalibrated to current stick position.');
    setTimeout(() => setCalibrationNotice(null), 4000);
  };

  const handleResetCalibration = () => {
    setCalibration({ offsetX: 0, offsetY: 0, offsetZ: 0 });
    setCalibrationNotice('Visual offset reset to hardware zero.');
    setTimeout(() => setCalibrationNotice(null), 3000);
  };

  // Draw 2D Gimbal Radar Reticle on HTML Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = (w / 2) - 24;

    ctx.clearRect(0, 0, w, h);

    // Background Grid
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Concentric Range Rings (25%, 50%, 75%, 100%)
    [0.25, 0.5, 0.75, 1.0].forEach((ring) => {
      ctx.strokeStyle = ring === 1.0 ? 'rgba(59, 130, 246, 0.4)' : 'rgba(148, 163, 184, 0.15)';
      ctx.lineWidth = ring === 1.0 ? 2 : 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * ring, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Crosshair Lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    // Horizontal
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.stroke();
    // Vertical
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.stroke();
    ctx.setLineDash([]);

    // Bullseye Center Deadzone Marker
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.05, 0, Math.PI * 2);
    ctx.stroke();

    // Reticle Target Position
    const targetPx = cx + calibratedX * radius;
    const targetPy = cy + calibratedY * radius;

    // Vector line from center to reticle
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(targetPx, targetPy);
    ctx.stroke();

    // Reticle Outer Ring
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(targetPx, targetPy, 14, 0, Math.PI * 2);
    ctx.stroke();

    // Reticle Center Dot
    ctx.fillStyle = '#60A5FA';
    ctx.beginPath();
    ctx.arc(targetPx, targetPy, 4, 0, Math.PI * 2);
    ctx.fill();

    // Small Crosshair on Target
    ctx.strokeStyle = '#93C5FD';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(targetPx - 8, targetPy);
    ctx.lineTo(targetPx + 8, targetPy);
    ctx.moveTo(targetPx, targetPy - 8);
    ctx.lineTo(targetPx, targetPy + 8);
    ctx.stroke();

  }, [calibratedX, calibratedY]);

  // Decode 8-way POV Hat switch
  // Hat switches are either mapped to buttons (12=Up, 13=Down, 14=Left, 15=Right)
  // or mapped to axis 9 / auxiliary axis.
  const isHatUp = buttonsState[12]?.pressed || false;
  const isHatDown = buttonsState[13]?.pressed || false;
  const isHatLeft = buttonsState[14]?.pressed || false;
  const isHatRight = buttonsState[15]?.pressed || false;

  let hatDirection = 'CENTER';
  if (isHatUp && isHatRight) hatDirection = 'UP-RIGHT (NE)';
  else if (isHatUp && isHatLeft) hatDirection = 'UP-LEFT (NW)';
  else if (isHatDown && isHatRight) hatDirection = 'DOWN-RIGHT (SE)';
  else if (isHatDown && isHatLeft) hatDirection = 'DOWN-LEFT (SW)';
  else if (isHatUp) hatDirection = 'UP (N)';
  else if (isHatDown) hatDirection = 'DOWN (S)';
  else if (isHatLeft) hatDirection = 'LEFT (W)';
  else if (isHatRight) hatDirection = 'RIGHT (E)';

  const isStickConnected = gamepads.length > 0;
  const isStickActive = deflectionDistance > 0.05 || Math.abs(calibratedZ) > 0.05 || buttonsState.some(b => b.pressed);

  const activeDevice = gamepads[selectedGamepadIndex];

  return (
    <div className="min-h-screen pt-4 pb-20">
      <SeoHead
        title="Flight Stick Tester - Joystick & HOTAS Crosshair Diagnostic | HardwareTest"
        description="Comprehensive online joystick and flight stick tester. Test 2D pitch and roll gimbal deflection, twist rudder yaw, throttle collective, 8-way POV hat, and button matrix via Gamepad API."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title Section */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Crosshair className="w-3.5 h-3.5 text-blue-400" />
              <span>HTML5 Gamepad API • Avionics &amp; HOTAS Lab</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Flight Stick Tester
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1">
              Verify joystick 2D gimbal pitch/roll deflection, Z-axis rudder yaw, throttle lever, POV hat switch, and button matrix.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRecalibrateDisplay}
              title="Reset Visual Center"
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Reset Center (Visual Only)</span>
            </button>

            {(calibration.offsetX !== 0 || calibration.offsetY !== 0 || calibration.offsetZ !== 0) && (
              <button
                onClick={handleResetCalibration}
                title="Clear Visual Calibration"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Unsupported Browser Alert */}
        {!isSupported && (
          <div role="alert" className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Gamepad API Unsupported</p>
              <p className="text-xs mt-1">Your current browser does not support the Gamepad API. Please use Google Chrome, Microsoft Edge, Brave, or Firefox.</p>
            </div>
          </div>
        )}

        {/* Calibration Feedback Toast / Banner */}
        {calibrationNotice && (
          <div className="mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2 shadow-xs">
            <Info className="w-4 h-4 shrink-0" />
            <span>{calibrationNotice}</span>
          </div>
        )}

        {/* Device Status Bar */}
        <div className="p-4 mb-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              isStickConnected 
                ? isStickActive 
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500 animate-pulse' 
                  : 'bg-blue-500/15 border-blue-500/30 text-blue-500'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
            }`}>
              <Crosshair className="w-6 h-6" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {isStickConnected ? (activeDevice?.id || 'Flight Stick / Joystick Connected') : 'No Flight Stick Detected'}
                </h2>
                {isStickConnected ? (
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isStickActive 
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                      : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                  }`}>
                    {isStickActive ? 'Live Hardware Stream' : 'Neutral Position'}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    Not Detected
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isStickConnected ? (
                  <>Index #{selectedGamepadIndex} • {activeDevice?.axes.length || 0} Axes • {activeDevice?.buttons.length || 0} Buttons • Mapping: {activeDevice?.mapping || 'standard'}</>
                ) : (
                  <>Connect your flight stick or throttle via USB and move the stick or squeeze the trigger to wake up browser detection.</>
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

            {/* Refresh Action */}
            <button
              onClick={refreshGamepads}
              title="Refresh Connected Devices"
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* WORKSTATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT 7-COL: 2D Gimbal / Radar Reticle Crosshair */}
          <div className="lg:col-span-7 flex flex-col p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isStickConnected ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  2D Gimbal Crosshair Radar (Pitch &amp; Roll)
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 cursor-pointer">
                  <span>Invert Pitch (Y):</span>
                  <input
                    type="checkbox"
                    checked={invertPitch}
                    onChange={(e) => setInvertPitch(e.target.checked)}
                    className="rounded"
                  />
                </label>
              </div>
            </div>

            {/* Canvas Target Radar */}
            <div className="flex-1 flex flex-col items-center justify-center py-4">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={340}
                  className="rounded-full shadow-inner border-2 border-slate-200 dark:border-slate-800 bg-slate-950"
                />

                {/* Cardinal Deflection Indicators */}
                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase text-slate-400 font-bold">
                  {invertPitch ? 'PITCH DOWN (-Y)' : 'PITCH UP (-Y)'}
                </span>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase text-slate-400 font-bold">
                  {invertPitch ? 'PITCH UP (+Y)' : 'PITCH DOWN (+Y)'}
                </span>
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono uppercase text-slate-400 font-bold">
                  ROLL L (-X)
                </span>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono uppercase text-slate-400 font-bold">
                  ROLL R (+X)
                </span>
              </div>

              {/* Real-time Deflection Telemetry Pill */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 mr-1.5">Roll (X):</span>
                  <strong className="text-blue-600 dark:text-blue-400 font-bold">
                    {calibratedX > 0 ? `+${calibratedX.toFixed(3)}` : calibratedX.toFixed(3)}
                  </strong>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 mr-1.5">Pitch (Y):</span>
                  <strong className="text-blue-600 dark:text-blue-400 font-bold">
                    {calibratedY > 0 ? `+${calibratedY.toFixed(3)}` : calibratedY.toFixed(3)}
                  </strong>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 mr-1.5">Deflection:</span>
                  <strong className={deflectionPercent > 5 ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                    {deflectionPercent}%
                  </strong>
                </div>
              </div>
            </div>

            {/* Bottom Config Axis Map */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">Roll Axis (X):</span>
                <select
                  aria-label="Roll axis selection"
                  value={xAxisIndex}
                  onChange={(e) => setXAxisIndex(Number(e.target.value))}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold"
                >
                  {Array.from({ length: Math.max(4, rawAxes.length) }).map((_, i) => (
                    <option key={i} value={i}>Axis {i}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">Pitch Axis (Y):</span>
                <select
                  aria-label="Pitch axis selection"
                  value={yAxisIndex}
                  onChange={(e) => setYAxisIndex(Number(e.target.value))}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold"
                >
                  {Array.from({ length: Math.max(4, rawAxes.length) }).map((_, i) => (
                    <option key={i} value={i}>Axis {i}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* RIGHT 5-COL: Rudder Yaw, Throttle Collective, POV Hat & Buttons */}
          <div className="lg:col-span-5 space-y-6">

            {/* RUDDER YAW & THROTTLE LEVER */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Flight Controls (Throttle &amp; Yaw)
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                
                {/* THROTTLE / COLLECTIVE LEVER */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">THROTTLE LEVER</span>
                  <span className="text-xl font-mono font-black text-amber-500 mb-2">
                    {throttlePercent}%
                  </span>

                  {/* Vertical Graduated Throttle Lever Bar */}
                  <div className="w-10 h-36 bg-slate-200 dark:bg-slate-800 rounded-xl relative overflow-hidden border border-slate-300 dark:border-slate-700 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-400 transition-all duration-75 rounded-b-lg"
                      style={{ height: `${throttlePercent}%` }}
                    />
                    {/* Tick Marks */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-2 px-1 text-[8px] font-mono text-slate-400/60">
                      <span>100%</span>
                      <span>50%</span>
                      <span>0%</span>
                    </div>
                  </div>

                  {/* Config */}
                  <div className="mt-3 w-full space-y-1 text-[10px]">
                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                      <span>Axis:</span>
                      <select
                        aria-label="Throttle axis selection"
                        value={throttleAxisIndex}
                        onChange={(e) => setThrottleAxisIndex(Number(e.target.value))}
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
                        checked={invertThrottle}
                        onChange={(e) => setInvertThrottle(e.target.checked)}
                        className="rounded"
                      />
                    </label>
                  </div>
                </div>

                {/* Z-AXIS TWIST RUDDER / YAW */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block text-center mb-1">
                      TWIST RUDDER (YAW)
                    </span>
                    <span className="text-xl font-mono font-black text-cyan-600 dark:text-cyan-400 block text-center mb-3">
                      {calibratedZ > 0 ? `+${calibratedZ.toFixed(2)}` : calibratedZ.toFixed(2)}
                    </span>

                    {/* Horizontal Rudder Bar */}
                    <div className="w-full h-7 bg-slate-200 dark:bg-slate-800 rounded-xl relative overflow-hidden border border-slate-300 dark:border-slate-700 flex items-center justify-center">
                      <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-400/50 z-10" />
                      {calibratedZ < 0 ? (
                        <div
                          className="absolute right-1/2 top-0 bottom-0 bg-cyan-500 transition-all duration-75"
                          style={{ width: `${Math.abs(calibratedZ) * 50}%` }}
                        />
                      ) : (
                        <div
                          className="absolute left-1/2 top-0 bottom-0 bg-cyan-500 transition-all duration-75"
                          style={{ width: `${calibratedZ * 50}%` }}
                        />
                      )}
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
                      <span>PORT (L)</span>
                      <span>CTR</span>
                      <span>STBD (R)</span>
                    </div>
                  </div>

                  {/* Config */}
                  <div className="mt-3 w-full text-[10px]">
                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                      <span>Yaw Axis:</span>
                      <select
                        aria-label="Yaw axis selection"
                        value={zAxisIndex}
                        onChange={(e) => setZAxisIndex(Number(e.target.value))}
                        className="bg-slate-200 dark:bg-slate-800 rounded px-1 text-[10px]"
                      >
                        {Array.from({ length: Math.max(6, rawAxes.length) }).map((_, i) => (
                          <option key={i} value={i}>Ax {i}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* 8-WAY POV HAT SWITCH & BUTTON MATRIX */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    POV Hat Switch &amp; Buttons
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{hatDirection}</span>
              </div>

              {/* 8-Way Hat Visual D-Pad */}
              <div className="flex items-center justify-center py-2 mb-4">
                <div className="grid grid-cols-3 gap-1.5 p-2 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-36 h-36">
                  {/* Row 1: NW, UP, NE */}
                  <div className={`rounded-lg flex items-center justify-center text-[9px] font-mono ${isHatUp && isHatLeft ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400'}`}>NW</div>
                  <div className={`rounded-lg flex items-center justify-center ${isHatUp ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400'}`}>
                    <ArrowUp className="w-4 h-4" />
                  </div>
                  <div className={`rounded-lg flex items-center justify-center text-[9px] font-mono ${isHatUp && isHatRight ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400'}`}>NE</div>

                  {/* Row 2: LEFT, CENTER, RIGHT */}
                  <div className={`rounded-lg flex items-center justify-center ${isHatLeft ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400'}`}>
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                  <div className="rounded-lg flex items-center justify-center text-[9px] font-mono text-slate-400">
                    POV
                  </div>
                  <div className={`rounded-lg flex items-center justify-center ${isHatRight ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400'}`}>
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  {/* Row 3: SW, DOWN, SE */}
                  <div className={`rounded-lg flex items-center justify-center text-[9px] font-mono ${isHatDown && isHatLeft ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400'}`}>SW</div>
                  <div className={`rounded-lg flex items-center justify-center ${isHatDown ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400'}`}>
                    <ArrowDown className="w-4 h-4" />
                  </div>
                  <div className={`rounded-lg flex items-center justify-center text-[9px] font-mono ${isHatDown && isHatRight ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400'}`}>SE</div>
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
                      title={idx === 0 ? 'Trigger (B0)' : idx === 1 ? 'Thumb Fire (B1)' : `Button ${idx}`}
                    >
                      B{idx}
                    </div>
                  );
                })}
              </div>

              {/* Raw Axes Values */}
              {rawAxes.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block mb-2">Auxiliary Axes:</span>
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
                <strong className="text-slate-900 dark:text-white">Notice on Calibration &amp; Browser Diagnostics: </strong>
                The &ldquo;Reset Center / Recalibrate Display&rdquo; tool above calculates an on-screen visual offset only to assist with inspecting mechanical stick centering and spring return. It does not alter your physical joystick firmware or operating system DirectInput calibration profile.
              </p>
              <p>
                Browser detection verifies exposed analog axes and switch inputs—it does not assess hall-effect sensor linearity, potentiometer wear, gimbal physical friction, or manufacturer-specific HOTAS profile macros.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FlightStickTester;
