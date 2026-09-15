import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Headset, 
  Play, 
  Square, 
  RefreshCw, 
  AlertCircle, 
  ShieldAlert 
} from 'lucide-react';
import { SeoHead } from '../../seo/SeoHead';

// WebXR Type Definitions for Universal TypeScript Compatibility
interface XRSystemMinimal extends EventTarget {
  isSessionSupported(mode: string): Promise<boolean>;
  requestSession(mode: string, options?: unknown): Promise<XRSessionMinimal>;
}

interface XRSessionMinimal extends EventTarget {
  end(): Promise<void>;
  inputSources: XRInputSourceArrayMinimal;
  requestAnimationFrame(callback: (time: DOMHighResTimeStamp, frame: unknown) => void): number;
  cancelAnimationFrame(handle: number): void;
  addEventListener(type: string, listener: (ev: Event) => void): void;
  removeEventListener(type: string, listener: (ev: Event) => void): void;
}

type XRInputSourceArrayMinimal = Iterable<XRInputSourceMinimal> & {
  length: number;
  [index: number]: XRInputSourceMinimal;
};

interface XRInputSourceMinimal {
  handedness: 'none' | 'left' | 'right';
  targetRayMode: 'gaze' | 'tracked-pointer' | 'screen';
  profiles: string[];
  gamepad?: Gamepad | null;
}

type SupportStatus = 'untested' | 'checking' | 'supported' | 'unsupported';
type SessionState = 'idle' | 'requesting' | 'active' | 'denied' | 'error';

interface ControllerData {
  handedness: 'left' | 'right' | 'none';
  targetRayMode: string;
  profiles: string[];
  triggerValue: number;
  triggerPressed: boolean;
  gripValue: number;
  gripPressed: boolean;
  thumbstickX: number;
  thumbstickY: number;
  thumbstickPressed: boolean;
  primaryButtonValue: number;
  primaryButtonPressed: boolean;
  secondaryButtonValue: number;
  secondaryButtonPressed: boolean;
  menuButtonPressed: boolean;
  rawButtons: { pressed: boolean; value: number }[];
  rawAxes: number[];
}

export const VrControllerTester: React.FC = () => {
  // WebXR Compatibility State
  const [hasXrApi, setHasXrApi] = useState<boolean | null>(null);
  const [vrSupportStatus, setVrSupportStatus] = useState<SupportStatus>('untested');
  const [supportMessage, setSupportMessage] = useState<string>('');
  
  // Session State
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Controllers Telemetry
  const [controllers, setControllers] = useState<ControllerData[]>([]);
  const [xrFps, setXrFps] = useState<number>(0);
  const [totalInputs, setTotalInputs] = useState<number>(0);

  // Active Session & Animation Ref
  const activeSessionRef = useRef<XRSessionMinimal | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(performance.now());
  const prevButtonsMapRef = useRef<{ [hand: string]: boolean[] }>({});

  // Check initial API availability on mount
  useEffect(() => {
    const nav = navigator as Navigator & { xr?: XRSystemMinimal };
    setHasXrApi(Boolean(nav.xr));
  }, []);

  // User-Initiated WebXR Support Check
  const handleCheckSupport = useCallback(async () => {
    const nav = navigator as Navigator & { xr?: XRSystemMinimal };
    if (!nav.xr) {
      setHasXrApi(false);
      setVrSupportStatus('unsupported');
      setSupportMessage('WebXR Device API is not available in your current browser.');
      return;
    }

    setVrSupportStatus('checking');
    try {
      const isImmersiveVrSupported = await nav.xr.isSessionSupported('immersive-vr');
      if (isImmersiveVrSupported) {
        setVrSupportStatus('supported');
        setSupportMessage('Immersive VR is supported and ready on your system.');
      } else {
        setVrSupportStatus('unsupported');
        setSupportMessage('WebXR API exists, but no compatible immersive VR runtime/headset was detected in active mode.');
      }
    } catch (err: unknown) {
      setVrSupportStatus('unsupported');
      const errText = err instanceof Error ? err.message : String(err);
      setSupportMessage(`WebXR support query encountered an error: ${errText}`);
    }
  }, []);

  // Stop / End Active WebXR Session
  const stopSession = useCallback(async () => {
    if (frameIdRef.current && activeSessionRef.current) {
      activeSessionRef.current.cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = null;
    }

    if (activeSessionRef.current) {
      try {
        await activeSessionRef.current.end();
      } catch {
        // Session may have already ended
      }
      activeSessionRef.current = null;
    }

    setSessionState('idle');
    setControllers([]);
    setXrFps(0);
  }, []);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (activeSessionRef.current) {
        stopSession();
      }
    };
  }, [stopSession]);

  // User-Initiated Start WebXR Session
  const startSession = async () => {
    const nav = navigator as Navigator & { xr?: XRSystemMinimal };
    if (!nav.xr) {
      setSessionState('error');
      setErrorMessage('WebXR Device API is missing from your browser.');
      return;
    }

    setSessionState('requesting');
    setErrorMessage('');

    try {
      // Request immersive-vr session. Requires user gesture click.
      const session = await nav.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
      });

      activeSessionRef.current = session;
      setSessionState('active');

      const onSessionEnd = () => {
        stopSession();
      };
      session.addEventListener('end', onSessionEnd);

      // WebXR Render / Input Polling Loop
      const onXRFrame = (time: DOMHighResTimeStamp) => {
        if (!activeSessionRef.current) return;

        // Inspect Input Sources
        const inputSources = Array.from(session.inputSources);
        const parsedControllers: ControllerData[] = [];

        inputSources.forEach((source) => {
          const gp = source.gamepad;
          const handedness = source.handedness;
          const targetRayMode = source.targetRayMode;
          const profiles = source.profiles ? Array.from(source.profiles) : [];

          if (gp) {
            // Standard WebXR Gamepad Mapping:
            // Button 0: Primary trigger (index finger)
            // Button 1: Primary squeeze / grip button
            // Button 2: Touchpad / Thumbstick click (or secondary trigger)
            // Button 3: Thumbstick click (or primary face button A / X)
            // Button 4: Primary button (A on right, X on left)
            // Button 5: Secondary button (B on right, Y on left)
            // Axis 0/1: Touchpad X/Y
            // Axis 2/3: Thumbstick X/Y
            const rawButtons = gp.buttons.map(b => ({ pressed: b.pressed, value: b.value }));
            const rawAxes = Array.from(gp.axes);

            const trigger = rawButtons[0] || { pressed: false, value: 0 };
            const grip = rawButtons[1] || { pressed: false, value: 0 };
            
            // Axes: Thumbstick is typically axes 2/3 on Oculus Touch, or axes 0/1 on generic
            let thumbX = 0;
            let thumbY = 0;
            if (rawAxes.length >= 4) {
              thumbX = rawAxes[2] ?? 0;
              thumbY = rawAxes[3] ?? 0;
            } else if (rawAxes.length >= 2) {
              thumbX = rawAxes[0] ?? 0;
              thumbY = rawAxes[1] ?? 0;
            }

            const thumbstickBtn = rawButtons[3]?.pressed || rawButtons[2]?.pressed || false;
            const primaryBtn = rawButtons[4] || { pressed: false, value: 0 };
            const secondaryBtn = rawButtons[5] || { pressed: false, value: 0 };
            const menuBtn = rawButtons[6]?.pressed || rawButtons[7]?.pressed || false;

            // Track input counts
            const prevBtns = prevButtonsMapRef.current[handedness] || [];
            let newPresses = 0;
            rawButtons.forEach((b, idx) => {
              if (b.pressed && !prevBtns[idx]) newPresses++;
            });
            prevButtonsMapRef.current[handedness] = rawButtons.map(b => b.pressed);

            if (newPresses > 0) {
              setTotalInputs(prev => prev + newPresses);
            }

            parsedControllers.push({
              handedness,
              targetRayMode,
              profiles,
              triggerValue: trigger.value,
              triggerPressed: trigger.pressed,
              gripValue: grip.value,
              gripPressed: grip.pressed,
              thumbstickX: thumbX,
              thumbstickY: thumbY,
              thumbstickPressed: thumbstickBtn,
              primaryButtonValue: primaryBtn.value,
              primaryButtonPressed: primaryBtn.pressed,
              secondaryButtonValue: secondaryBtn.value,
              secondaryButtonPressed: secondaryBtn.pressed,
              menuButtonPressed: menuBtn,
              rawButtons,
              rawAxes,
            });
          } else {
            // Source without gamepad (e.g. gaze pointer or basic hand tracker)
            parsedControllers.push({
              handedness,
              targetRayMode,
              profiles,
              triggerValue: 0,
              triggerPressed: false,
              gripValue: 0,
              gripPressed: false,
              thumbstickX: 0,
              thumbstickY: 0,
              thumbstickPressed: false,
              primaryButtonValue: 0,
              primaryButtonPressed: false,
              secondaryButtonValue: 0,
              secondaryButtonPressed: false,
              menuButtonPressed: false,
              rawButtons: [],
              rawAxes: [],
            });
          }
        });

        setControllers(parsedControllers);

        // Calculate XR Polling Rate
        frameCountRef.current++;
        if (time - lastFpsUpdateRef.current >= 1000) {
          const fps = Math.round((frameCountRef.current * 1000) / (time - lastFpsUpdateRef.current));
          setXrFps(fps);
          frameCountRef.current = 0;
          lastFpsUpdateRef.current = time;
        }

        frameIdRef.current = session.requestAnimationFrame(onXRFrame);
      };

      frameIdRef.current = session.requestAnimationFrame(onXRFrame);

    } catch (err: unknown) {
      setSessionState('error');
      const errName = err instanceof Error ? err.name : '';
      const errMessage = err instanceof Error ? err.message : String(err);

      if (errName === 'NotAllowedError' || errMessage.includes('permission')) {
        setSessionState('denied');
        setErrorMessage('VR permission was dismissed or denied by the user. Please allow VR access in your browser prompts.');
      } else if (errName === 'NotSupportedError') {
        setErrorMessage('Immersive VR session is not supported by your hardware configuration or no headset display is active.');
      } else {
        setErrorMessage(`Failed to start WebXR session: ${errMessage}`);
      }
    }
  };

  const leftController = controllers.find(c => c.handedness === 'left');
  const rightController = controllers.find(c => c.handedness === 'right');
  const otherControllers = controllers.filter(c => c.handedness !== 'left' && c.handedness !== 'right');

  return (
    <div className="min-h-screen pt-4 pb-20">
      <SeoHead
        title="VR Controller Compatibility Test - WebXR Diagnostics | HardwareTest"
        description="Browser-based VR headset and controller compatibility tester powered by WebXR. Test immersive VR session support, trigger pressure, grip squeeze, and thumbstick axes."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title Section */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Headset className="w-3.5 h-3.5 text-blue-400" />
              <span>W3C WebXR Device API • Spatial Input Lab</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              VR Controller Compatibility Test
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1">
              Verify WebXR immersive VR session support, controller connection state, triggers, grip squeeze, and analog thumbsticks.
            </p>
          </div>

          {/* User-Initiated Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCheckSupport}
              disabled={vrSupportStatus === 'checking'}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${vrSupportStatus === 'checking' ? 'animate-spin' : ''}`} />
              <span>Check VR Support</span>
            </button>

            {sessionState === 'active' ? (
              <button
                onClick={stopSession}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Exit VR Session</span>
              </button>
            ) : (
              <button
                onClick={startSession}
                disabled={sessionState === 'requesting'}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{sessionState === 'requesting' ? 'Requesting VR...' : 'Start VR Test'}</span>
              </button>
            )}
          </div>
        </div>

        {/* WEBXR CAPABILITY CHECK RESULTS CARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          
          {/* Card 1: Browser API Support */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">WebXR Device API</span>
              {hasXrApi === true && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Present
                </span>
              )}
              {hasXrApi === false && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                  Unsupported
                </span>
              )}
              {hasXrApi === null && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                  Checking…
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {hasXrApi ? 'navigator.xr is available in this browser window.' : 'Browser lacks WebXR Device API support (Use Chrome, Edge, or Quest Browser).'}
            </p>
          </div>

          {/* Card 2: Immersive VR Support */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Immersive VR Mode</span>
              {vrSupportStatus === 'supported' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Available
                </span>
              )}
              {vrSupportStatus === 'unsupported' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Unavailable
                </span>
              )}
              {vrSupportStatus === 'checking' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 animate-pulse">
                  Querying…
                </span>
              )}
              {vrSupportStatus === 'untested' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                  Click Check VR Support
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {supportMessage || 'Click "Check VR Support" to query headset runtime availability.'}
            </p>
          </div>

          {/* Card 3: Active Session Status */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">VR Session Status</span>
              {sessionState === 'active' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Active
                </span>
              )}
              {sessionState === 'requesting' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400">
                  Permission Prompt
                </span>
              )}
              {sessionState === 'denied' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400">
                  Permission Denied
                </span>
              )}
              {sessionState === 'idle' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                  Standby
                </span>
              )}
              {sessionState === 'error' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400">
                  Error
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {sessionState === 'active' 
                ? `Active Session • ${controllers.length} Input Sources • ${xrFps} FPS` 
                : 'Immersive VR requires explicit user initiation and browser permission.'}
            </p>
          </div>

        </div>

        {/* Error / Permission Denied Callout Banner */}
        {errorMessage && (
          <div role="alert" className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-rose-900 dark:text-rose-200">Session Notice: </span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* ACTIVE SESSION STATUS BANNER */}
        {sessionState === 'active' && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" />
              <span className="text-emerald-900 dark:text-emerald-200 font-semibold">
                Immersive VR Session is active. Telemetry stream engaged from connected spatial input sources.
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-emerald-800 dark:text-emerald-300">
              <span>Poll: <strong>{xrFps} Hz</strong></span>
              <span>Inputs: <strong>{totalInputs}</strong></span>
            </div>
          </div>
        )}

        {/* CONTROLLER DISPLAY WORKSTATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* LEFT CONTROLLER CARD */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${leftController ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Left Controller (Handedness: Left)
                  </h3>
                </div>
                {leftController ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Detected
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                    Not Detected
                  </span>
                )}
              </div>

              {leftController ? (
                <div className="space-y-4">
                  {/* Profiles Tag */}
                  {leftController.profiles.length > 0 && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      Profile: {leftController.profiles[0]}
                    </div>
                  )}

                  {/* Triggers & Grip */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Index Trigger */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-semibold text-slate-600 dark:text-slate-400">Index Trigger</span>
                        <strong className="font-mono text-blue-600 dark:text-blue-400">
                          {Math.round(leftController.triggerValue * 100)}%
                        </strong>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-75"
                          style={{ width: `${leftController.triggerValue * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Grip Squeeze */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-semibold text-slate-600 dark:text-slate-400">Grip Squeeze</span>
                        <strong className="font-mono text-cyan-600 dark:text-cyan-400">
                          {Math.round(leftController.gripValue * 100)}%
                        </strong>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 transition-all duration-75"
                          style={{ width: `${leftController.gripValue * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Thumbstick Vector Grid */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        Thumbstick (X, Y)
                      </span>
                      <div className="text-xs font-mono space-y-0.5">
                        <div>X: <strong className="text-blue-600 dark:text-blue-400">{leftController.thumbstickX.toFixed(2)}</strong></div>
                        <div>Y: <strong className="text-blue-600 dark:text-blue-400">{leftController.thumbstickY.toFixed(2)}</strong></div>
                      </div>
                    </div>

                    {/* Mini Thumbstick Radar */}
                    <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-700 relative flex items-center justify-center">
                      <div className="absolute w-full h-0.5 bg-slate-800" />
                      <div className="absolute h-full w-0.5 bg-slate-800" />
                      <div
                        className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-blue-300 absolute shadow-sm"
                        style={{
                          transform: `translate(${leftController.thumbstickX * 24}px, ${leftController.thumbstickY * 24}px)`
                        }}
                      />
                    </div>
                  </div>

                  {/* Face Buttons (X, Y, Menu) */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className={`p-2.5 rounded-xl border transition-all ${
                      leftController.primaryButtonPressed 
                        ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-md' 
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      Button X
                    </div>

                    <div className={`p-2.5 rounded-xl border transition-all ${
                      leftController.secondaryButtonPressed 
                        ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-md' 
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      Button Y
                    </div>

                    <div className={`p-2.5 rounded-xl border transition-all ${
                      leftController.menuButtonPressed 
                        ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-md' 
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      Menu / Home
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <Headset className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                  <p>No Left controller detected in current session.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Start a VR session and ensure your left controller is powered on.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
              Standard OpenXR &amp; WebXR left-hand spatial binding.
            </div>
          </div>

          {/* RIGHT CONTROLLER CARD */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${rightController ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Right Controller (Handedness: Right)
                  </h3>
                </div>
                {rightController ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Detected
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                    Not Detected
                  </span>
                )}
              </div>

              {rightController ? (
                <div className="space-y-4">
                  {/* Profiles Tag */}
                  {rightController.profiles.length > 0 && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      Profile: {rightController.profiles[0]}
                    </div>
                  )}

                  {/* Triggers & Grip */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Index Trigger */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-semibold text-slate-600 dark:text-slate-400">Index Trigger</span>
                        <strong className="font-mono text-blue-600 dark:text-blue-400">
                          {Math.round(rightController.triggerValue * 100)}%
                        </strong>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-75"
                          style={{ width: `${rightController.triggerValue * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Grip Squeeze */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-semibold text-slate-600 dark:text-slate-400">Grip Squeeze</span>
                        <strong className="font-mono text-cyan-600 dark:text-cyan-400">
                          {Math.round(rightController.gripValue * 100)}%
                        </strong>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 transition-all duration-75"
                          style={{ width: `${rightController.gripValue * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Thumbstick Vector Grid */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        Thumbstick (X, Y)
                      </span>
                      <div className="text-xs font-mono space-y-0.5">
                        <div>X: <strong className="text-blue-600 dark:text-blue-400">{rightController.thumbstickX.toFixed(2)}</strong></div>
                        <div>Y: <strong className="text-blue-600 dark:text-blue-400">{rightController.thumbstickY.toFixed(2)}</strong></div>
                      </div>
                    </div>

                    {/* Mini Thumbstick Radar */}
                    <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-700 relative flex items-center justify-center">
                      <div className="absolute w-full h-0.5 bg-slate-800" />
                      <div className="absolute h-full w-0.5 bg-slate-800" />
                      <div
                        className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-blue-300 absolute shadow-sm"
                        style={{
                          transform: `translate(${rightController.thumbstickX * 24}px, ${rightController.thumbstickY * 24}px)`
                        }}
                      />
                    </div>
                  </div>

                  {/* Face Buttons (A, B, Menu) */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className={`p-2.5 rounded-xl border transition-all ${
                      rightController.primaryButtonPressed 
                        ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-md' 
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      Button A
                    </div>

                    <div className={`p-2.5 rounded-xl border transition-all ${
                      rightController.secondaryButtonPressed 
                        ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-md' 
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      Button B
                    </div>

                    <div className={`p-2.5 rounded-xl border transition-all ${
                      rightController.menuButtonPressed 
                        ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-md' 
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      Oculus / Menu
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <Headset className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                  <p>No Right controller detected in current session.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Start a VR session and ensure your right controller is powered on.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
              Standard OpenXR &amp; WebXR right-hand spatial binding.
            </div>
          </div>

        </div>

        {/* Additional Input Sources (if any hands or gaze pointers are active) */}
        {otherControllers.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Additional WebXR Input Sources ({otherControllers.length})
            </h4>
            <div className="space-y-2 text-xs">
              {otherControllers.map((ctrl, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <span>Target Ray: {ctrl.targetRayMode}</span>
                  <span className="font-mono text-slate-400">Profiles: {ctrl.profiles.join(', ') || 'generic'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TECHNICAL SCOPE & COMPATIBILITY DISCLAIMER FOOTER */}
        <div className="mt-8 p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 space-y-2">
              <p>
                <strong className="text-slate-900 dark:text-white">WebXR Diagnostic Scope &amp; Compatibility Limits: </strong>
                This browser test queries standard WebXR Device API interfaces to check browser runtime readiness and verify accessible controller inputs (analog triggers, grip squeeze values, thumbstick deflection, and primary/secondary face buttons).
              </p>
              <p>
                WebXR availability does not certify complete headset performance or hardware health. Inside-out optical tracking accuracy, 6DoF sub-millimeter positional drift, display panel refresh rate stability (90Hz / 120Hz), lens sweet spot, IPD calibration, and haptic actuator frequency cannot be verified within a web browser without proprietary vendor diagnostics.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VrControllerTester;
