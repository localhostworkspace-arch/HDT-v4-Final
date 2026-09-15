import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Gamepad2, 
  RotateCcw, 
  Activity, 
  HelpCircle,
  Vibrate,
  Compass
} from 'lucide-react';
import { SeoHead } from '../../seo/SeoHead';
import { XboxControllerSvg } from './XboxControllerSvg';
import { Ps5ControllerSvg } from './Ps5ControllerSvg';
import { SwitchControllerSvg } from './SwitchControllerSvg';

type ControllerType = 'xbox' | 'playstation' | 'switch';

interface StickHistoryPoint {
  x: number;
  y: number;
}

export const GamepadTester: React.FC = () => {
  // Gamepad Detection State
  const [gamepads, setGamepads] = useState<Gamepad[]>([]);
  const [selectedGamepadIndex] = useState<number>(0);
  const [controllerLayout, setControllerLayout] = useState<ControllerType>('xbox');
  const [autoDetectLayout, setAutoDetectLayout] = useState(true);

  // Simulation / Interactive Demo Mode
  const [simulatedMode, setSimulatedMode] = useState(false);
  const [simulatedButtons, setSimulatedButtons] = useState<{ [key: number]: { pressed: boolean; value: number } }>({});

  // Live Controller Input Data
  const [buttonsState, setButtonsState] = useState<{ pressed: boolean; value: number }[]>([]);
  const [axesState, setAxesState] = useState<number[]>([0, 0, 0, 0]);
  const [pollingRate, setPollingRate] = useState<number>(0);
  const [totalPresses, setTotalPresses] = useState<number>(0);

  // Stick Drift & Circularity Tracking
  const [leftStickHistory, setLeftStickHistory] = useState<StickHistoryPoint[]>([]);
  const [rightStickHistory, setRightStickHistory] = useState<StickHistoryPoint[]>([]);
  const [leftCircularityError, setLeftCircularityError] = useState<number>(0);
  const [rightCircularityError, setRightCircularityError] = useState<number>(0);

  // Vibration State
  const [isVibrating, setIsVibrating] = useState(false);
  const [strongMagnitude, setStrongMagnitude] = useState(1.0);
  const [weakMagnitude, setWeakMagnitude] = useState(1.0);

  // Press Log
  const [eventLog, setEventLog] = useState<{ time: string; text: string }[]>([]);

  // Refs for requestAnimationFrame
  const animRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(performance.now());
  const prevButtonsRef = useRef<boolean[]>([]);

  // Canvas Refs for Stick Circularity Error visualization
  const leftCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Detect Controller Brand from gamepad ID string
  const detectLayoutFromId = (id: string): ControllerType => {
    const s = id.toLowerCase();
    if (s.includes('dualsense') || s.includes('ps5') || s.includes('playstation') || s.includes('ps4') || s.includes('dualshock') || s.includes('sony') || s.includes('054c')) {
      return 'playstation';
    }
    if (s.includes('switch') || s.includes('nintendo') || s.includes('joy-con') || s.includes('pro controller') || s.includes('057e')) {
      return 'switch';
    }
    return 'xbox'; // Default standard layout
  };

  // Poll Gamepads Loop
  useEffect(() => {
    const handleGamepadConnected = (e: GamepadEvent) => {
      const detected = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[] : [];
      setGamepads(detected);
      if (detected.length > 0) {
        if (autoDetectLayout) {
          setControllerLayout(detectLayoutFromId(e.gamepad.id));
        }
      }
    };

    const handleGamepadDisconnected = () => {
      const detected = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[] : [];
      setGamepads(detected);
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    // Initial check
    if (navigator.getGamepads) {
      const detected = Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[];
      setGamepads(detected);
      if (detected.length > 0 && autoDetectLayout) {
        setControllerLayout(detectLayoutFromId(detected[0].id));
      }
    }

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, [autoDetectLayout]);

  // Main input polling loop
  useEffect(() => {
    let running = true;

    const poll = () => {
      if (!running) return;

      const now = performance.now();
      frameCountRef.current++;

      // Compute Polling Rate every 500ms
      if (now - lastFpsUpdateRef.current >= 500) {
        const rate = Math.round((frameCountRef.current * 1000) / (now - lastFpsUpdateRef.current));
        setPollingRate(rate);
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }

      const rawGamepads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[] : [];
      if (rawGamepads.length !== gamepads.length) {
        setGamepads(rawGamepads);
      }

      const activeGp = rawGamepads[selectedGamepadIndex] || rawGamepads[0];

      if (activeGp) {
        // Read Buttons
        const btns = activeGp.buttons.map((b) => ({
          pressed: b.pressed || b.value > 0.1,
          value: b.value
        }));
        setButtonsState(btns);

        // Detect new presses for logs & counter
        btns.forEach((b, idx) => {
          const wasPressed = prevButtonsRef.current[idx];
          if (b.pressed && !wasPressed) {
            setTotalPresses((p) => p + 1);
            const timeStr = new Date().toLocaleTimeString().split(' ')[0];
            const btnName = getButtonName(idx, controllerLayout);
            setEventLog((prev) => [
              { time: timeStr, text: `[${btnName}] Pressed (${(b.value * 100).toFixed(0)}%)` },
              ...prev.slice(0, 19)
            ]);
          }
        });
        prevButtonsRef.current = btns.map((b) => b.pressed);

        // Read Axes
        const axes = Array.from(activeGp.axes || [0, 0, 0, 0]).map((a) => Math.abs(a) < 0.001 ? 0 : a);
        setAxesState(axes);

        const lx = axes[0] || 0;
        const ly = axes[1] || 0;
        const rx = axes[2] || 0;
        const ry = axes[3] || 0;

        // Stick tracking when moved
        if (Math.hypot(lx, ly) > 0.1) {
          setLeftStickHistory((prev) => {
            const next = [...prev, { x: lx, y: ly }];
            return next.length > 250 ? next.slice(next.length - 250) : next;
          });
        }
        if (Math.hypot(rx, ry) > 0.1) {
          setRightStickHistory((prev) => {
            const next = [...prev, { x: rx, y: ry }];
            return next.length > 250 ? next.slice(next.length - 250) : next;
          });
        }
      } else if (simulatedMode) {
        // Use Simulated State
        const btns = Array.from({ length: 18 }, (_, i) => ({
          pressed: simulatedButtons[i]?.pressed || false,
          value: simulatedButtons[i]?.value || 0
        }));
        setButtonsState(btns);
      }

      animRef.current = requestAnimationFrame(poll);
    };

    animRef.current = requestAnimationFrame(poll);

    return () => {
      running = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [selectedGamepadIndex, gamepads.length, controllerLayout, simulatedMode, simulatedButtons]);

  // Calculate Stick Circularity Errors
  useEffect(() => {
    if (leftStickHistory.length > 20) {
      const outerPoints = leftStickHistory.filter((p) => Math.hypot(p.x, p.y) > 0.7);
      if (outerPoints.length > 10) {
        const errorSum = outerPoints.reduce((acc, p) => {
          const dist = Math.hypot(p.x, p.y);
          return acc + Math.abs(dist - 1.0);
        }, 0);
        const avgErr = (errorSum / outerPoints.length) * 100;
        setLeftCircularityError(Math.min(99.9, Math.max(0.1, avgErr)));
      }
    }
  }, [leftStickHistory]);

  useEffect(() => {
    if (rightStickHistory.length > 20) {
      const outerPoints = rightStickHistory.filter((p) => Math.hypot(p.x, p.y) > 0.7);
      if (outerPoints.length > 10) {
        const errorSum = outerPoints.reduce((acc, p) => {
          const dist = Math.hypot(p.x, p.y);
          return acc + Math.abs(dist - 1.0);
        }, 0);
        const avgErr = (errorSum / outerPoints.length) * 100;
        setRightCircularityError(Math.min(99.9, Math.max(0.1, avgErr)));
      }
    }
  }, [rightStickHistory]);

  // Draw Circularity Canvas Radar
  const drawStickRadar = useCallback(
    (canvas: HTMLCanvasElement | null, history: StickHistoryPoint[], curX: number, curY: number, color: string) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const r = (w / 2) - 16;

      ctx.clearRect(0, 0, w, h);

      // Background radial
      const bgGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, r);
      bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.8)');
      bgGrad.addColorStop(1, 'rgba(30, 41, 59, 0.95)');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Outer boundary ring (Ideal 1.0)
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Deadzone ring (0.1)
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Crosshairs
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy);
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy + r);
      ctx.stroke();

      // History Trail Points
      if (history.length > 1) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        history.forEach((pt, i) => {
          const px = cx + pt.x * r;
          const py = cy + pt.y * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      // Live Position Dot
      const livePx = cx + curX * r;
      const livePy = cy + curY * r;

      // Glow behind live point
      const glowGrad = ctx.createRadialGradient(livePx, livePy, 0, livePx, livePy, 14);
      glowGrad.addColorStop(0, color);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(livePx, livePy, 14, 0, Math.PI * 2);
      ctx.fill();

      // Live Dot
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(livePx, livePy, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Line from center to live
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(livePx, livePy);
      ctx.stroke();
    },
    []
  );

  useEffect(() => {
    const lx = axesState[0] || 0;
    const ly = axesState[1] || 0;
    drawStickRadar(leftCanvasRef.current, leftStickHistory, lx, ly, '#6366F1');
  }, [axesState, leftStickHistory, drawStickRadar]);

  useEffect(() => {
    const rx = axesState[2] || 0;
    const ry = axesState[3] || 0;
    drawStickRadar(rightCanvasRef.current, rightStickHistory, rx, ry, '#EC4899');
  }, [axesState, rightStickHistory, drawStickRadar]);

  // Controller Vibration Trigger
  const triggerVibration = async (duration = 500, strong = strongMagnitude, weak = weakMagnitude) => {
    const rawGamepads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[] : [];
    const gp = (rawGamepads[selectedGamepadIndex] || rawGamepads[0]) as any;

    if (!gp) {
      if (simulatedMode) {
        setIsVibrating(true);
        setTimeout(() => setIsVibrating(false), duration);
      }
      return;
    }

    try {
      if (gp.vibrationActuator && typeof gp.vibrationActuator.playEffect === 'function') {
        setIsVibrating(true);
        await gp.vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: duration,
          weakMagnitude: weak,
          strongMagnitude: strong,
        });
        setTimeout(() => setIsVibrating(false), duration);
      } else if (gp.hapticActuators && gp.hapticActuators[0]) {
        setIsVibrating(true);
        await gp.hapticActuators[0].pulse(strong, duration);
        setTimeout(() => setIsVibrating(false), duration);
      } else {
        alert('Your connected controller or browser does not support the vibration/rumble API.');
      }
    } catch (e) {
      console.error('Vibration failed', e);
      setIsVibrating(false);
    }
  };

  const resetCircularityHistory = () => {
    setLeftStickHistory([]);
    setRightStickHistory([]);
    setLeftCircularityError(0);
    setRightCircularityError(0);
    setEventLog([]);
    setTotalPresses(0);
  };

  // Helper to map button standard index to friendly name based on layout
  const getButtonName = (idx: number, layout: ControllerType): string => {
    if (layout === 'playstation') {
      const names = [
        'Cross (✕)', 'Circle (○)', 'Square (□)', 'Triangle (△)', 
        'L1 Bumper', 'R1 Bumper', 'L2 Trigger', 'R2 Trigger', 
        'Create / Share', 'Options', 'L3 (Stick Press)', 'R3 (Stick Press)', 
        'D-Pad Up', 'D-Pad Down', 'D-Pad Left', 'D-Pad Right', 
        'PS Button', 'Touchpad'
      ];
      return names[idx] || `Button ${idx}`;
    }
    if (layout === 'switch') {
      const names = [
        'B Button', 'A Button', 'Y Button', 'X Button', 
        'L Bumper', 'R Bumper', 'ZL Trigger', 'ZR Trigger', 
        'Minus (-)', 'Plus (+)', 'Left Stick (L3)', 'Right Stick (R3)', 
        'D-Pad Up', 'D-Pad Down', 'D-Pad Left', 'D-Pad Right', 
        'Home Button', 'Capture'
      ];
      return names[idx] || `Button ${idx}`;
    }
    // Default Xbox Layout
    const names = [
      'A Button', 'B Button', 'X Button', 'Y Button', 
      'LB (Left Bumper)', 'RB (Right Bumper)', 'LT (Left Trigger)', 'RT (Right Trigger)', 
      'View (Back)', 'Menu (Start)', 'LS (Left Stick)', 'RS (Right Stick)', 
      'D-Pad Up', 'D-Pad Down', 'D-Pad Left', 'D-Pad Right', 
      'Xbox Guide / Home', 'Share'
    ];
    return names[idx] || `Button ${idx}`;
  };

  // Stick Positions
  const lx = axesState[0] || 0;
  const ly = axesState[1] || 0;
  const rx = axesState[2] || 0;
  const ry = axesState[3] || 0;

  // Trigger Values
  const ltValue = buttonsState[6]?.value || 0;
  const rtValue = buttonsState[7]?.value || 0;

  // Button Press Checks
  const isBtn = (idx: number) => buttonsState[idx]?.pressed || false;

  // Simulated button press handler for on-screen clicking
  const handleSimButton = (idx: number, isDown: boolean, val = 1.0) => {
    if (!simulatedMode) setSimulatedMode(true);
    setSimulatedButtons((prev) => ({
      ...prev,
      [idx]: { pressed: isDown, value: isDown ? val : 0 }
    }));
    if (isDown) {
      setTotalPresses((p) => p + 1);
      const timeStr = new Date().toLocaleTimeString().split(' ')[0];
      const btnName = getButtonName(idx, controllerLayout);
      setEventLog((prev) => [
        { time: timeStr, text: `[${btnName}] Clicked` },
        ...prev.slice(0, 19)
      ]);
    }
  };

  return (
    <div className="min-h-screen pt-4 pb-20">
      <SeoHead
        title="Gamepad Tester - Controller Stick Drift, Latency & Button Diagnostic | HardwareTest"
        description="Comprehensive online gamepad tester. Diagnose analog stick drift, calculate circularity error %, test trigger pressure, button responsiveness, and dual-rumble vibration for Xbox, PS5 DualSense, and Switch controllers."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title Section */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Gamepad2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>DirectInput &amp; HTML5 Gamepad Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Gamepad &amp; Controller Tester
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-1">
              Test your Xbox, PlayStation DualSense, Nintendo Switch Pro, or generic gamepad with real-time vector visualization.
            </p>
          </div>

          {/* Layout Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 shrink-0">
            <button
              onClick={() => { setControllerLayout('xbox'); setAutoDetectLayout(false); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                controllerLayout === 'xbox'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Xbox Wireless
            </button>
            <button
              onClick={() => { setControllerLayout('playstation'); setAutoDetectLayout(false); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                controllerLayout === 'playstation'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PS5 DualSense
            </button>
            <button
              onClick={() => { setControllerLayout('switch'); setAutoDetectLayout(false); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                controllerLayout === 'switch'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Switch Pro
            </button>
          </div>
        </div>

        {/* Connected Controller Notification / Top Status Banner */}
        <div className="p-4 mb-6 rounded-2xl bg-slate-900/90 dark:bg-[#0E1526]/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
              gamepads.length > 0 
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
            }`}>
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  {gamepads.length > 0 
                    ? (gamepads[selectedGamepadIndex]?.id || 'Controller Connected') 
                    : simulatedMode 
                      ? 'Interactive Test Mode Active' 
                      : 'Connect Controller or Click to Test'}
                </h2>
                {gamepads.length > 0 ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live Hardware
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Ready
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {gamepads.length > 0
                  ? `Index #${selectedGamepadIndex} • ${gamepads[selectedGamepadIndex]?.buttons.length || 17} Buttons • ${gamepads[selectedGamepadIndex]?.axes.length || 4} Axes • Mapping: ${gamepads[selectedGamepadIndex]?.mapping || 'standard'}`
                  : 'Connect your USB / Bluetooth controller and press any button, or click any button below to test.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Polling Rate Badge */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Poll Rate</span>
              <span className="text-sm font-bold text-indigo-400">{pollingRate > 0 ? `${pollingRate} Hz` : '60 Hz'}</span>
            </div>

            {/* Total Press Counter */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Inputs Registered</span>
              <span className="text-sm font-bold text-emerald-400">{totalPresses}</span>
            </div>

            <button
              onClick={resetCircularityHistory}
              title="Reset Test Data"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main 2-Column Workstation Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT 7-COL: Interactive High-Definition Controller Graphic */}
          <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-slate-900/80 dark:bg-[#0E1526]/80 border border-slate-800 shadow-2xl relative overflow-hidden">
            
            {/* Ambient Lighting Glow Behind Graphic */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Trigger Pressure Status Bars (Top) */}
            <div className="grid grid-cols-2 gap-4 mb-4 z-10">
              {/* Left Trigger (LT / L2) */}
              <div 
                onMouseDown={() => handleSimButton(6, true, 1.0)}
                onMouseUp={() => handleSimButton(6, false, 0)}
                className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 cursor-pointer hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-slate-300">
                    {controllerLayout === 'playstation' ? 'L2 Trigger (Analog)' : controllerLayout === 'switch' ? 'ZL Trigger' : 'LT Trigger (Analog)'}
                  </span>
                  <span className="text-amber-400">{(ltValue * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 rounded-full transition-all duration-75 shadow-sm shadow-amber-500/50"
                    style={{ width: `${Math.min(100, Math.max(0, ltValue * 100))}%` }}
                  />
                </div>
              </div>

              {/* Right Trigger (RT / R2) */}
              <div 
                onMouseDown={() => handleSimButton(7, true, 1.0)}
                onMouseUp={() => handleSimButton(7, false, 0)}
                className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 cursor-pointer hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-slate-300">
                    {controllerLayout === 'playstation' ? 'R2 Trigger (Analog)' : controllerLayout === 'switch' ? 'ZR Trigger' : 'RT Trigger (Analog)'}
                  </span>
                  <span className="text-amber-400">{(rtValue * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 rounded-full transition-all duration-75 shadow-sm shadow-amber-500/50"
                    style={{ width: `${Math.min(100, Math.max(0, rtValue * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* ULTRA-HD MODULAR VECTOR CONTROLLER */}
            <div className="relative w-full max-w-[620px] mx-auto my-auto aspect-[16/11] flex items-center justify-center z-10 py-2">
              {controllerLayout === 'playstation' ? (
                <Ps5ControllerSvg
                  isBtn={isBtn}
                  lx={lx}
                  ly={ly}
                  rx={rx}
                  ry={ry}
                  ltValue={ltValue}
                  rtValue={rtValue}
                  onButtonPress={handleSimButton}
                />
              ) : controllerLayout === 'switch' ? (
                <SwitchControllerSvg
                  isBtn={isBtn}
                  lx={lx}
                  ly={ly}
                  rx={rx}
                  ry={ry}
                  ltValue={ltValue}
                  rtValue={rtValue}
                  onButtonPress={handleSimButton}
                />
              ) : (
                <XboxControllerSvg
                  isBtn={isBtn}
                  lx={lx}
                  ly={ly}
                  rx={rx}
                  ry={ry}
                  ltValue={ltValue}
                  rtValue={rtValue}
                  onButtonPress={handleSimButton}
                />
              )}
            </div>

            {/* Bottom Graphic Tip */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live 60 FPS Visual Feedback (Click on any button to test)
              </span>
              <span>All 17 Buttons &amp; 4 Analog Axes Tracked</span>
            </div>
          </div>

          {/* RIGHT 5-COL: Stick Drift Radar & Circularity Error Analysis */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* STICK PRECISION & CIRCULARITY GAUGES */}
            <div className="p-6 rounded-3xl bg-slate-900/80 dark:bg-[#0E1526]/80 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">Stick Drift &amp; Circularity</h3>
                </div>
                <span className="text-xs text-slate-400">Deadzone &amp; Outer Circle</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Left Stick Radar */}
                <div className="flex flex-col items-center">
                  <div className="text-xs font-bold text-indigo-400 mb-1">Left Stick (LS)</div>
                  <canvas
                    ref={leftCanvasRef}
                    width={180}
                    height={180}
                    className="w-full max-w-[170px] aspect-square rounded-2xl bg-slate-950 border border-slate-800 shadow-inner"
                  />
                  <div className="w-full mt-2 space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>X: <strong className="text-white">{lx.toFixed(4)}</strong></span>
                      <span>Y: <strong className="text-white">{ly.toFixed(4)}</strong></span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400">Circularity Error:</span>
                      <span className={`font-bold ${leftCircularityError < 8 ? 'text-emerald-400' : leftCircularityError < 15 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {leftCircularityError > 0 ? `${leftCircularityError.toFixed(1)}%` : 'Rotate stick'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Stick Radar */}
                <div className="flex flex-col items-center">
                  <div className="text-xs font-bold text-pink-400 mb-1">Right Stick (RS)</div>
                  <canvas
                    ref={rightCanvasRef}
                    width={180}
                    height={180}
                    className="w-full max-w-[170px] aspect-square rounded-2xl bg-slate-950 border border-slate-800 shadow-inner"
                  />
                  <div className="w-full mt-2 space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>X: <strong className="text-white">{rx.toFixed(4)}</strong></span>
                      <span>Y: <strong className="text-white">{ry.toFixed(4)}</strong></span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400">Circularity Error:</span>
                      <span className={`font-bold ${rightCircularityError < 8 ? 'text-emerald-400' : rightCircularityError < 15 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {rightCircularityError > 0 ? `${rightCircularityError.toFixed(1)}%` : 'Rotate stick'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTROLLER RUMBLE & HAPTIC VIBRATION MOTOR TEST */}
            <div className="p-6 rounded-3xl bg-slate-900/80 dark:bg-[#0E1526]/80 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Vibrate className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Dual-Rumble Vibration Test</h3>
                </div>
                {isVibrating && (
                  <span className="text-xs font-bold text-amber-400 animate-pulse flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" /> Motors Active
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {/* Sliders */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1 font-medium">Strong Motor (Low Freq)</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={strongMagnitude}
                      onChange={(e) => setStrongMagnitude(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500 text-right block">{(strongMagnitude * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1 font-medium">Weak Motor (High Freq)</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={weakMagnitude}
                      onChange={(e) => setWeakMagnitude(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500 text-right block">{(weakMagnitude * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => triggerVibration(500, strongMagnitude, weakMagnitude)}
                    disabled={isVibrating}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    Ping Dual Rumble (0.5s)
                  </button>
                  <button
                    onClick={() => triggerVibration(1500, 1.0, 1.0)}
                    disabled={isVibrating}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Max Pulse (1.5s)
                  </button>
                </div>
              </div>
            </div>

            {/* REAL-TIME INPUT EVENT LOG */}
            <div className="p-6 rounded-3xl bg-slate-900/80 dark:bg-[#0E1526]/80 border border-slate-800 shadow-xl flex-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Live Event Logger</h3>
                </div>
                <button
                  onClick={() => setEventLog([])}
                  className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                >
                  Clear Log
                </button>
              </div>

              <div className="h-32 overflow-y-auto font-mono text-xs space-y-1 p-2 rounded-xl bg-slate-950 border border-slate-800/80 scrollbar-none">
                {eventLog.length > 0 ? (
                  eventLog.map((ev, i) => (
                    <div key={i} className="text-slate-300 flex items-center justify-between">
                      <span className="text-emerald-400">{ev.text}</span>
                      <span className="text-slate-500 text-[10px]">{ev.time}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-center py-8">
                    Press any button or trigger on your controller to log events...
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Informational Guidance Section */}
        <div className="mt-12 p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            How to Test and Troubleshoot Gamepad Stick Drift
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-300 leading-relaxed">
            <div>
              <h4 className="font-semibold text-white mb-1">1. Neutral Deadzone Check</h4>
              <p className="text-xs text-slate-400">
                Release both analog sticks. The live (X, Y) coordinate readout should remain within <span className="text-indigo-400">±0.05</span> inside the red dashed deadzone ring. If it deviates without touching, your controller has stick drift.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">2. Circularity Error %</h4>
              <p className="text-xs text-slate-400">
                Slowly rotate each stick 360° along its full outer edge. Good gamepads with Hall Effect or calibrated potentiometers typically achieve under <span className="text-emerald-400">8.0% error</span>.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">3. Trigger Linear Pressure</h4>
              <p className="text-xs text-slate-400">
                Gently squeeze LT/RT (or L2/R2). The pressure percentage bar should scale smoothly from 0% to 100% without jitter, stutter, or dead spots.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
