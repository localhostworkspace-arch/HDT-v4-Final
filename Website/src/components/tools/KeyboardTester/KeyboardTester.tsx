import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Keyboard as KeyboardIcon, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Zap, 
  Copy, 
  Check, 
  ChevronRight, 
  FileText 
} from 'lucide-react';
import { SeoHead } from '../../seo/SeoHead';
import { 
  LAYOUT_DEFINITIONS, 
  type KeyboardLayout, 
  type FormFactor, 
  type KeyConfig,
  GAMING_KEYS,
  NUMPAD_KEYS,
  FUNCTION_KEYS,
  BROWSER_RESTRICTED_KEYS,
  ROLLOVER_COMBOS
} from './keyboardLayouts';

type PlatformMode = 'windows' | 'mac';
type TestMode = 'all' | 'rollover' | 'stuck' | 'gaming' | 'numpad' | 'function';
type KeyIssueStatus = 'working' | 'not_responding' | 'intermittent' | 'sticking';

// 1. BASE ALPHANUMERIC ROWS (ANSI & ISO)
const getAlphaRows = (formFactor: FormFactor, layout: KeyboardLayout, platform: PlatformMode): (KeyConfig | { isGap: true; w: number })[][] => {
  const labels = LAYOUT_DEFINITIONS[layout] || LAYOUT_DEFINITIONS['QWERTY'];
  const isMac = platform === 'mac';
  const isISO = formFactor === 'ISO';

  const getLabel = (code: string, fallback: string, fallbackSub?: string) => {
    if (labels[code]) {
      return { label: labels[code].label, subLabel: labels[code].subLabel };
    }
    return { label: fallback, subLabel: fallbackSub };
  };

  const rows: (KeyConfig | { isGap: true; w: number })[][] = [];

  // Function Row (Omitted in 60% and 65%)
  if (formFactor !== '60%' && formFactor !== '65%') {
    if (formFactor === '75%') {
      // 75% compact F-row: Esc + F1-F12 + PrtSc + Del
      rows.push([
        { code: 'Escape', label: 'Esc', w: 1.0, section: 'function' },
        { code: 'F1', label: 'F1', w: 1.0, section: 'function' },
        { code: 'F2', label: 'F2', w: 1.0, section: 'function' },
        { code: 'F3', label: 'F3', w: 1.0, section: 'function' },
        { code: 'F4', label: 'F4', w: 1.0, section: 'function' },
        { code: 'F5', label: 'F5', w: 1.0, section: 'function' },
        { code: 'F6', label: 'F6', w: 1.0, section: 'function' },
        { code: 'F7', label: 'F7', w: 1.0, section: 'function' },
        { code: 'F8', label: 'F8', w: 1.0, section: 'function' },
        { code: 'F9', label: 'F9', w: 1.0, section: 'function' },
        { code: 'F10', label: 'F10', w: 1.0, section: 'function' },
        { code: 'F11', label: 'F11', w: 1.0, section: 'function' },
        { code: 'F12', label: 'F12', w: 1.0, section: 'function' },
        { code: 'PrintScreen', label: 'Prt', w: 1.0, section: 'nav' },
        { code: 'Delete', label: 'Del', w: 1.0, section: 'nav' }
      ]);
    } else {
      // Standard F-row: Esc, gap, F1-F4, gap, F5-F8, gap, F9-F12
      rows.push([
        { code: 'Escape', label: 'Esc', w: 1.0, section: 'function' },
        { isGap: true, w: 1.0 },
        { code: 'F1', label: 'F1', w: 1.0, section: 'function' },
        { code: 'F2', label: 'F2', w: 1.0, section: 'function' },
        { code: 'F3', label: 'F3', w: 1.0, section: 'function' },
        { code: 'F4', label: 'F4', w: 1.0, section: 'function' },
        { isGap: true, w: 0.5 },
        { code: 'F5', label: 'F5', w: 1.0, section: 'function' },
        { code: 'F6', label: 'F6', w: 1.0, section: 'function' },
        { code: 'F7', label: 'F7', w: 1.0, section: 'function' },
        { code: 'F8', label: 'F8', w: 1.0, section: 'function' },
        { isGap: true, w: 0.5 },
        { code: 'F9', label: 'F9', w: 1.0, section: 'function' },
        { code: 'F10', label: 'F10', w: 1.0, section: 'function' },
        { code: 'F11', label: 'F11', w: 1.0, section: 'function' },
        { code: 'F12', label: 'F12', w: 1.0, section: 'function' },
      ]);
    }
  }

  // Row 1: Numbers
  const numRow: (KeyConfig | { isGap: true; w: number })[] = [
    { code: 'Backquote', ...getLabel('Backquote', '`', '~'), w: 1.0, section: 'alpha' },
    { code: 'Digit1', ...getLabel('Digit1', '1', '!'), w: 1.0, section: 'alpha' },
    { code: 'Digit2', ...getLabel('Digit2', '2', '@'), w: 1.0, section: 'alpha' },
    { code: 'Digit3', ...getLabel('Digit3', '3', '#'), w: 1.0, section: 'alpha' },
    { code: 'Digit4', ...getLabel('Digit4', '4', '$'), w: 1.0, section: 'alpha' },
    { code: 'Digit5', ...getLabel('Digit5', '5', '%'), w: 1.0, section: 'alpha' },
    { code: 'Digit6', ...getLabel('Digit6', '6', '^'), w: 1.0, section: 'alpha' },
    { code: 'Digit7', ...getLabel('Digit7', '7', '&'), w: 1.0, section: 'alpha' },
    { code: 'Digit8', ...getLabel('Digit8', '8', '*'), w: 1.0, section: 'alpha' },
    { code: 'Digit9', ...getLabel('Digit9', '9', '('), w: 1.0, section: 'alpha' },
    { code: 'Digit0', ...getLabel('Digit0', '0', ')'), w: 1.0, section: 'alpha' },
    { code: 'Minus', ...getLabel('Minus', '-', '_'), w: 1.0, section: 'alpha' },
    { code: 'Equal', ...getLabel('Equal', '=', '+'), w: 1.0, section: 'alpha' },
    { code: 'Backspace', label: 'Backspace', w: 2.0, section: 'alpha' },
  ];
  if (formFactor === '75%' || formFactor === '65%') {
    numRow.push({ code: 'Home', label: 'Home', w: 1.0, section: 'nav' });
  }
  rows.push(numRow);

  // Row 2: Tab / QWERTY
  const tabRow: (KeyConfig | { isGap: true; w: number })[] = [
    { code: 'Tab', label: 'Tab', w: 1.5, section: 'alpha' },
    { code: 'KeyQ', ...getLabel('KeyQ', 'Q'), w: 1.0, section: 'alpha' },
    { code: 'KeyW', ...getLabel('KeyW', 'W'), w: 1.0, section: 'alpha' },
    { code: 'KeyE', ...getLabel('KeyE', 'E'), w: 1.0, section: 'alpha' },
    { code: 'KeyR', ...getLabel('KeyR', 'R'), w: 1.0, section: 'alpha' },
    { code: 'KeyT', ...getLabel('KeyT', 'T'), w: 1.0, section: 'alpha' },
    { code: 'KeyY', ...getLabel('KeyY', 'Y'), w: 1.0, section: 'alpha' },
    { code: 'KeyU', ...getLabel('KeyU', 'U'), w: 1.0, section: 'alpha' },
    { code: 'KeyI', ...getLabel('KeyI', 'I'), w: 1.0, section: 'alpha' },
    { code: 'KeyO', ...getLabel('KeyO', 'O'), w: 1.0, section: 'alpha' },
    { code: 'KeyP', ...getLabel('KeyP', 'P'), w: 1.0, section: 'alpha' },
    { code: 'BracketLeft', ...getLabel('BracketLeft', '[', '{'), w: 1.0, section: 'alpha' },
    { code: 'BracketRight', ...getLabel('BracketRight', ']', '}'), w: 1.0, section: 'alpha' },
    { code: 'Backslash', ...getLabel('Backslash', '\\', '|'), w: 1.5, section: 'alpha' },
  ];
  if (formFactor === '75%' || formFactor === '65%') {
    tabRow.push({ code: 'PageUp', label: 'PgUp', w: 1.0, section: 'nav' });
  }
  rows.push(tabRow);

  // Row 3: CapsLock / ASDF / Enter
  const capsRow: (KeyConfig | { isGap: true; w: number })[] = [
    { code: 'CapsLock', label: 'Caps', w: 1.75, section: 'alpha' },
    { code: 'KeyA', ...getLabel('KeyA', 'A'), w: 1.0, section: 'alpha' },
    { code: 'KeyS', ...getLabel('KeyS', 'S'), w: 1.0, section: 'alpha' },
    { code: 'KeyD', ...getLabel('KeyD', 'D'), w: 1.0, section: 'alpha' },
    { code: 'KeyF', ...getLabel('KeyF', 'F'), w: 1.0, section: 'alpha' },
    { code: 'KeyG', ...getLabel('KeyG', 'G'), w: 1.0, section: 'alpha' },
    { code: 'KeyH', ...getLabel('KeyH', 'H'), w: 1.0, section: 'alpha' },
    { code: 'KeyJ', ...getLabel('KeyJ', 'J'), w: 1.0, section: 'alpha' },
    { code: 'KeyK', ...getLabel('KeyK', 'K'), w: 1.0, section: 'alpha' },
    { code: 'KeyL', ...getLabel('KeyL', 'L'), w: 1.0, section: 'alpha' },
    { code: 'Semicolon', ...getLabel('Semicolon', ';', ':'), w: 1.0, section: 'alpha' },
    { code: 'Quote', ...getLabel('Quote', '\'', '"'), w: 1.0, section: 'alpha' },
    { code: 'Enter', label: 'Enter', w: isISO ? 2.25 : 2.25, section: 'alpha' },
  ];
  if (formFactor === '75%' || formFactor === '65%') {
    capsRow.push({ code: 'PageDown', label: 'PgDn', w: 1.0, section: 'nav' });
  }
  rows.push(capsRow);

  // Row 4: Shift / ZXCV
  const shiftRow: (KeyConfig | { isGap: true; w: number })[] = [];
  if (isISO) {
    // ISO has 1.25U left shift and an extra key (IntlBackslash)
    shiftRow.push(
      { code: 'ShiftLeft', label: 'Shift', w: 1.25, section: 'alpha' },
      { code: 'IntlBackslash', label: '<', subLabel: '>', w: 1.0, section: 'alpha' }
    );
  } else {
    shiftRow.push({ code: 'ShiftLeft', label: 'Shift', w: 2.25, section: 'alpha' });
  }
  shiftRow.push(
    { code: 'KeyZ', ...getLabel('KeyZ', 'Z'), w: 1.0, section: 'alpha' },
    { code: 'KeyX', ...getLabel('KeyX', 'X'), w: 1.0, section: 'alpha' },
    { code: 'KeyC', ...getLabel('KeyC', 'C'), w: 1.0, section: 'alpha' },
    { code: 'KeyV', ...getLabel('KeyV', 'V'), w: 1.0, section: 'alpha' },
    { code: 'KeyB', ...getLabel('KeyB', 'B'), w: 1.0, section: 'alpha' },
    { code: 'KeyN', ...getLabel('KeyN', 'N'), w: 1.0, section: 'alpha' },
    { code: 'KeyM', ...getLabel('KeyM', 'M'), w: 1.0, section: 'alpha' },
    { code: 'Comma', ...getLabel('Comma', ',', '<'), w: 1.0, section: 'alpha' },
    { code: 'Period', ...getLabel('Period', '.', '>'), w: 1.0, section: 'alpha' },
    { code: 'Slash', ...getLabel('Slash', '/', '?'), w: 1.0, section: 'alpha' }
  );

  if (formFactor === '75%' || formFactor === '65%') {
    shiftRow.push(
      { code: 'ShiftRight', label: 'Shift', w: 1.75, section: 'alpha' },
      { code: 'ArrowUp', label: '↑', w: 1.0, section: 'arrows' },
      { code: 'End', label: 'End', w: 1.0, section: 'nav' }
    );
  } else {
    shiftRow.push({ code: 'ShiftRight', label: 'Shift', w: isISO ? 2.75 : 2.75, section: 'alpha' });
  }
  rows.push(shiftRow);

  // Row 5: Modifiers & Space
  if (formFactor === '75%' || formFactor === '65%') {
    rows.push([
      { code: 'ControlLeft', label: isMac ? 'Control' : 'Ctrl', w: 1.25, section: 'alpha' },
      { code: 'MetaLeft', label: isMac ? '⌘' : 'Win', w: 1.25, section: 'alpha' },
      { code: 'AltLeft', label: isMac ? '⌥' : 'Alt', w: 1.25, section: 'alpha' },
      { code: 'Space', label: 'Space', w: 6.25, section: 'alpha' },
      { code: 'AltRight', label: isMac ? '⌥' : 'Alt', w: 1.0, section: 'alpha' },
      { code: 'ContextMenu', label: 'Fn', w: 1.0, section: 'alpha' },
      { code: 'ControlRight', label: isMac ? 'Control' : 'Ctrl', w: 1.0, section: 'alpha' },
      { code: 'ArrowLeft', label: '←', w: 1.0, section: 'arrows' },
      { code: 'ArrowDown', label: '↓', w: 1.0, section: 'arrows' },
      { code: 'ArrowRight', label: '→', w: 1.0, section: 'arrows' }
    ]);
  } else {
    rows.push([
      { code: 'ControlLeft', label: isMac ? 'Control' : 'Ctrl', w: 1.25, section: 'alpha' },
      { code: 'MetaLeft', label: isMac ? '⌘' : 'Win', w: 1.25, section: 'alpha' },
      { code: 'AltLeft', label: isMac ? '⌥' : 'Alt', w: 1.25, section: 'alpha' },
      { code: 'Space', label: 'Space', w: 6.25, section: 'alpha' },
      { code: 'AltRight', label: isMac ? '⌥' : 'Alt', w: 1.25, section: 'alpha' },
      { code: 'MetaRight', label: isMac ? '⌘' : 'Win', w: 1.25, section: 'alpha' },
      { code: 'ContextMenu', label: 'Menu', w: 1.25, section: 'alpha' },
      { code: 'ControlRight', label: isMac ? 'Control' : 'Ctrl', w: 1.25, section: 'alpha' }
    ]);
  }

  return rows;
};

// 2. NAVIGATION & ARROWS CLUSTERS (for Full, ISO, and TKL)
const NAV_ROWS: (KeyConfig | { isGap: true; w: number })[][] = [
  [
    { code: 'PrintScreen', label: 'PrtSc', w: 1.0, section: 'nav' },
    { code: 'ScrollLock', label: 'ScrLk', w: 1.0, section: 'nav' },
    { code: 'Pause', label: 'Pause', w: 1.0, section: 'nav' },
  ],
  [
    { code: 'Insert', label: 'Ins', w: 1.0, section: 'nav' },
    { code: 'Home', label: 'Home', w: 1.0, section: 'nav' },
    { code: 'PageUp', label: 'PgUp', w: 1.0, section: 'nav' },
  ],
  [
    { code: 'Delete', label: 'Del', w: 1.0, section: 'nav' },
    { code: 'End', label: 'End', w: 1.0, section: 'nav' },
    { code: 'PageDown', label: 'PgDn', w: 1.0, section: 'nav' },
  ],
  [
    { isGap: true, w: 3.0 },
  ],
  [
    { isGap: true, w: 1.0 },
    { code: 'ArrowUp', label: '↑', w: 1.0, section: 'arrows' },
    { isGap: true, w: 1.0 },
  ],
  [
    { code: 'ArrowLeft', label: '←', w: 1.0, section: 'arrows' },
    { code: 'ArrowDown', label: '↓', w: 1.0, section: 'arrows' },
    { code: 'ArrowRight', label: '→', w: 1.0, section: 'arrows' },
  ],
];


export const KeyboardTester: React.FC = () => {
  // Key state tracking
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [testedKeys, setTestedKeys] = useState<Set<string>>(new Set());
  const [keyPressCounts, setKeyPressCounts] = useState<Record<string, number>>({});
  const [selectedKey, setSelectedKey] = useState<string>('KeyA');
  const [userReportedIssues, setUserReportedIssues] = useState<Record<string, KeyIssueStatus>>({});
  const [keyHeldTimestamps, setKeyHeldTimestamps] = useState<Record<string, number>>({});
  const [stuckKeys, setStuckKeys] = useState<Set<string>>(new Set());

  // Performance & rollover metrics
  const [maxRollover, setMaxRollover] = useState(0);
  const [testStartTime] = useState(Date.now());
  const [lastEvent, setLastEvent] = useState<{ code: string; key: string; timeStamp: number } | null>(null);

  // Configuration options
  const [formFactor, setFormFactor] = useState<FormFactor>('ANSI');
  const [layout, setLayout] = useState<KeyboardLayout>('QWERTY');
  const [platform, setPlatform] = useState<PlatformMode>('windows');
  const [testMode, setTestMode] = useState<TestMode>('all');
  const [stuckThresholdSec, setStuckThresholdSec] = useState<number>(5);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFocused, setIsFocused] = useState(true);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

  // Layout sizing & Audio Context
  const [containerWidth, setContainerWidth] = useState(1200);
  const kbContainerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Audio click sound generator
  const playKeySound = useCallback(() => {
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
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.035);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Browser autoplay policy
    }
  }, [soundEnabled]);

  // Measure container width for responsive scaling
  useEffect(() => {
    if (!kbContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(kbContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute total keys in current form factor
  const getTotalKeysInLayout = useCallback((): number => {
    switch (formFactor) {
      case 'ANSI': return 104;
      case 'ISO': return 105;
      case 'TKL': return 87;
      case '75%': return 84;
      case '65%': return 68;
      case '60%': return 61;
      default: return 104;
    }
  }, [formFactor]);

  // Stuck key watchdog interval
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newlyStuck = new Set<string>();
      Object.entries(keyHeldTimestamps).forEach(([code, startTime]) => {
        if (now - startTime > stuckThresholdSec * 1000) {
          newlyStuck.add(code);
        }
      });
      setStuckKeys(newlyStuck);
    }, 500);
    return () => clearInterval(interval);
  }, [keyHeldTimestamps, stuckThresholdSec]);

  // Global Keydown & Keyup event capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      // Suppress browser default actions for keys when actively testing in the app
      if (
        ['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'F1', 'F3', 'F5', 'F7', 'F11'].includes(e.code)
      ) {
        e.preventDefault();
      }

      const code = e.code;
      playKeySound();

      setLastEvent({
        code,
        key: e.key,
        timeStamp: Math.round(e.timeStamp)
      });
      setSelectedKey(code);

      // Track active held keys
      setActiveKeys((prev) => {
        const next = new Set(prev).add(code);
        if (next.size > maxRollover) {
          setMaxRollover(next.size);
        }
        return next;
      });

      // Track start timestamp for stuck key check
      setKeyHeldTimestamps((prev) => {
        if (!prev[code]) {
          return { ...prev, [code]: Date.now() };
        }
        return prev;
      });

      // Avoid duplicate tested counts on keyboard auto-repeat
      if (!e.repeat) {
        setTestedKeys((prev) => new Set(prev).add(code));
        setKeyPressCounts((prev) => ({
          ...prev,
          [code]: (prev[code] || 0) + 1
        }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(code);
        return next;
      });

      setKeyHeldTimestamps((prev) => {
        const next = { ...prev };
        delete next[code];
        return next;
      });

      setStuckKeys((prev) => {
        const next = new Set(prev);
        next.delete(code);
        return next;
      });
    };

    // On window blur, release all held keys so nothing appears stuck
    const handleBlur = () => {
      setActiveKeys(new Set());
      setKeyHeldTimestamps({});
      setStuckKeys(new Set());
      setIsFocused(false);
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [playKeySound, maxRollover]);

  // Reset entire test
  const handleReset = () => {
    setActiveKeys(new Set());
    setTestedKeys(new Set());
    setKeyPressCounts({});
    setMaxRollover(0);
    setUserReportedIssues({});
    setStuckKeys(new Set());
    setKeyHeldTimestamps({});
  };

  // Mark selected key issue
  const setKeyIssue = (status: KeyIssueStatus | null) => {
    if (!selectedKey) return;
    setUserReportedIssues((prev) => {
      const next = { ...prev };
      if (!status) {
        delete next[selectedKey];
      } else {
        next[selectedKey] = status;
      }
      return next;
    });
  };

  // Copy Test Report
  const copyReport = () => {
    const totalKeys = getTotalKeysInLayout();
    const testedCount = testedKeys.size;
    const issueKeys = Object.keys(userReportedIssues);
    const durationMins = Math.round((Date.now() - testStartTime) / 60000);

    const report = `HDT Keyboard Tester Report
----------------------------------------
Layout: ${formFactor} (${layout})
Total Keys in Layout: ${totalKeys}
Unique Keys Tested: ${testedCount} (${Math.round((testedCount / totalKeys) * 100)}%)
Untested Keys: ${Math.max(0, totalKeys - testedCount)}
Maximum Simultaneous Keys (Rollover): ${maxRollover}
User Reported Issues: ${issueKeys.length > 0 ? issueKeys.join(', ') : 'None'}
Testing Duration: ${durationMins} minutes

Verdict: Your keyboard input test is complete. No issues were reported for the keys tested.
Note: Browser-based input test. Direct electrical switch signals cannot be verified.`;

    navigator.clipboard.writeText(report).then(() => {
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    });
  };

  // Key styling calculation
  const getKeyClass = (code: string) => {
    const isPressed = activeKeys.has(code);
    const isTested = testedKeys.has(code);
    const isSelected = selectedKey === code;
    const isStuck = stuckKeys.has(code);
    const issue = userReportedIssues[code];

    let base = 'relative flex flex-col items-center justify-center font-semibold rounded-lg border transition-all select-none cursor-pointer ';

    if (isPressed) {
      return base + 'bg-blue-600 text-white border-blue-600 shadow-inner scale-[0.98] z-20';
    }

    if (isStuck) {
      return base + 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-500 animate-pulse';
    }

    if (issue === 'not_responding') {
      return base + 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-400 dark:border-rose-700';
    }
    if (issue === 'intermittent' || issue === 'sticking') {
      return base + 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-400 dark:border-amber-700';
    }

    if (isSelected) {
      return base + 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-500 ring-2 ring-blue-500/30';
    }

    if (isTested) {
      return base + 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-800/60 shadow-2xs';
    }

    if (testMode === 'gaming' && GAMING_KEYS.has(code)) {
      return base + 'bg-blue-50/50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700 shadow-2xs';
    }
    if (testMode === 'numpad' && NUMPAD_KEYS.has(code)) {
      return base + 'bg-teal-50/50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-700 shadow-2xs';
    }
    if (testMode === 'function' && FUNCTION_KEYS.has(code)) {
      return base + 'bg-amber-50/50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-2xs';
    }

    // Default key
    return base + 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200/90 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 shadow-2xs';
  };

  // Dimensions & scaling
  const totalKeyUnits = (formFactor === 'ANSI' || formFactor === 'ISO') ? 22.5 : (formFactor === 'TKL' ? 18.5 : (formFactor === '75%' ? 16.0 : 15.0));
  const gapAllowance = (formFactor === 'ANSI' || formFactor === 'ISO') ? 160 : (formFactor === 'TKL' ? 120 : 80);
  const availableWidth = Math.max(340, containerWidth - gapAllowance);
  const unitSizePx = Math.max(20, Math.min(52, Math.floor(availableWidth / totalKeyUnits)));
  const keyHeightPx = Math.max(24, Math.round(unitSizePx * 0.95));
  const fontSizePx = Math.max(8, Math.min(13, Math.round(unitSizePx * 0.28)));

  const alphaRows = getAlphaRows(formFactor, layout, platform);
  const totalKeysCount = getTotalKeysInLayout();
  const testedCount = testedKeys.size;
  const untestedCount = Math.max(0, totalKeysCount - testedCount);
  const issuesCount = Object.keys(userReportedIssues).length;
  const progressPct = Math.min(100, Math.round((testedCount / totalKeysCount) * 100));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SeoHead 
        title="Keyboard Tester — Online Key & Latency Diagnostics | HDT"
        description="Free, browser-based Keyboard Tester. Test keystrokes, N-key rollover, key chatter, and latency. Works for all mechanical and membrane keyboards."
      />

      {/* ================= 1. PAGE HEADER ================= */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
              <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-800 dark:text-slate-200 font-medium">Keyboard Tester</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Keyboard Tester
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Test your physical keyboard keys, layout mapping, simultaneous rollover, and input latency.
            </p>
          </div>

          {/* Quick Header Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 text-xs">
              <span className={`w-2 h-2 rounded-full ${isFocused ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {isFocused ? 'Listening to Input' : 'Window Inactive (Click to Focus)'}
              </span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute Sound Feedback' : 'Enable Sound Feedback'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Reset Test Button */}
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Test</span>
            </button>

            {/* View Summary Report */}
            <button
              onClick={() => setShowSummaryModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Test Report</span>
            </button>
          </div>
        </div>

        {/* Configuration Bar: Layouts & Form Factors */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Form Factor Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Form Factor:</span>
              <select
                value={formFactor}
                onChange={(e) => setFormFactor(e.target.value as FormFactor)}
                className="py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ANSI">ANSI (104 Keys - Full)</option>
                <option value="ISO">ISO (105 Keys - European)</option>
                <option value="TKL">TKL (87 Keys - Tenkeyless)</option>
                <option value="75%">75% Compact</option>
                <option value="65%">65% Compact</option>
                <option value="60%">60% Minimal</option>
              </select>
            </div>

            {/* Language / Keymap Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Language:</span>
              <select
                value={layout}
                onChange={(e) => setLayout(e.target.value as KeyboardLayout)}
                className="py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="QWERTY">QWERTY (US/UK)</option>
                <option value="AZERTY">AZERTY (French)</option>
                <option value="QWERTZ">QWERTZ (German)</option>
                <option value="Spanish">Spanish</option>
                <option value="Nordic (SE/FI)">Nordic (SE/FI)</option>
                <option value="DVORAK">DVORAK</option>
                <option value="Colemak">Colemak</option>
              </select>
            </div>

            {/* Platform Toggle */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <button
                onClick={() => setPlatform('windows')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  platform === 'windows' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold' : 'text-slate-500'
                }`}
              >
                Windows
              </button>
              <button
                onClick={() => setPlatform('mac')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  platform === 'mac' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold' : 'text-slate-500'
                }`}
              >
                macOS
              </button>
            </div>
          </div>

          {/* Test Mode Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setTestMode('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                testMode === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All Keys
            </button>
            <button
              onClick={() => setTestMode('rollover')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                testMode === 'rollover' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Rollover (NKRO)
            </button>
            <button
              onClick={() => setTestMode('gaming')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                testMode === 'gaming' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Gaming
            </button>
            <button
              onClick={() => setTestMode('stuck')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                testMode === 'stuck' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Stuck Key
            </button>
          </div>
        </div>
      </div>

      {/* ================= 2. KEYBOARD INFORMATION PANEL ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Unique Keys Tested */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Tested Keys
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {testedCount}
            </span>
            <span className="text-xs text-slate-400">/ {totalKeysCount} ({progressPct}%)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Card 2: Untested Keys */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Untested Keys
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {untestedCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Press any remaining key to test
          </div>
        </div>

        {/* Card 3: Max Simultaneous Rollover */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Max Simultaneous (NKRO)
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {maxRollover} Keys
            </span>
            <span className="text-xs text-slate-400">({activeKeys.size} held now)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Highest simultaneous keys registered
          </div>
        </div>

        {/* Card 4: Potential Issues / User Reported */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Reported Key Issues
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-bold ${issuesCount > 0 ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
              {issuesCount}
            </span>
            {stuckKeys.size > 0 && (
              <span className="text-xs text-rose-600 font-medium">({stuckKeys.size} stuck)</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {issuesCount === 0 ? 'No defects marked' : 'User-flagged keys'}
          </div>
        </div>
      </div>

      {/* Mode Specific Guidance / Banner */}
      {testMode === 'rollover' && (
        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                Simultaneous Key (Rollover) Testing Active
              </div>
              <div className="text-xs text-blue-700/80 dark:text-blue-300">
                Press multiple keys together to measure anti-ghosting capacity.
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {ROLLOVER_COMBOS.map((combo) => (
              <span key={combo.name} className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                {combo.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {testMode === 'stuck' && (
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs text-amber-900 dark:text-amber-200">
              <strong>Stuck Key Detection:</strong> Any key held continuously for more than {stuckThresholdSec} seconds will be flagged.
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Threshold:</span>
            {[3, 5, 10].map((sec) => (
              <button
                key={sec}
                onClick={() => setStuckThresholdSec(sec)}
                className={`px-2 py-1 rounded-md border text-xs cursor-pointer ${
                  stuckThresholdSec === sec ? 'bg-amber-600 text-white border-amber-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= 3. MAIN INTERACTIVE VIRTUAL KEYBOARD ================= */}
      <div 
        ref={kbContainerRef}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs relative overflow-hidden"
      >
        {/* Unfocused overlay prompt */}
        {!isFocused && (
          <div 
            onClick={() => setIsFocused(true)}
            className="absolute inset-0 z-30 bg-slate-900/20 dark:bg-slate-950/50 backdrop-blur-2xs flex items-center justify-center p-4 cursor-pointer"
          >
            <div className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-3 animate-bounce">
              <KeyboardIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Click anywhere on the keyboard to activate test
              </span>
            </div>
          </div>
        )}

        {/* Responsive Horizontal Scroll Container */}
        <div className="overflow-x-auto pb-2">
          <div 
            className="flex gap-4 sm:gap-6 min-w-fit w-fit mx-auto justify-start md:justify-center"
            style={{ fontSize: `${fontSizePx}px` }}
          >
            {/* 1. Main Alphanumeric Section */}
            <div className="flex flex-col gap-1.5">
              {alphaRows.map((row, rIdx) => (
                <div key={rIdx} className="flex gap-1.5 items-center">
                  {row.map((item, kIdx) => {
                    if ('isGap' in item) {
                      return <div key={kIdx} style={{ width: `${item.w * unitSizePx}px` }} />;
                    }
                    const widthPx = Math.round(item.w * unitSizePx);
                    return (
                      <div
                        key={item.code}
                        onClick={() => setSelectedKey(item.code)}
                        style={{
                          width: `${widthPx}px`,
                          height: `${keyHeightPx}px`
                        }}
                        className={getKeyClass(item.code)}
                      >
                        {item.subLabel && (
                          <span className="text-[9px] text-slate-400 absolute top-1 right-1.5 leading-none">
                            {item.subLabel}
                          </span>
                        )}
                        <span className="truncate px-1 leading-tight">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* 2. Navigation & Arrows Cluster (Full, ISO, TKL) */}
            {(formFactor === 'ANSI' || formFactor === 'ISO' || formFactor === 'TKL') && (
              <div className="flex flex-col gap-1.5 border-l border-slate-100 dark:border-slate-800 pl-3">
                {NAV_ROWS.map((row, rIdx) => (
                  <div key={rIdx} className="flex gap-1.5 items-center">
                    {row.map((item, kIdx) => {
                      if ('isGap' in item) {
                        return <div key={kIdx} style={{ width: `${item.w * unitSizePx}px` }} />;
                      }
                      const widthPx = Math.round(item.w * unitSizePx);
                      return (
                        <div
                          key={item.code}
                          onClick={() => setSelectedKey(item.code)}
                          style={{
                            width: `${widthPx}px`,
                            height: `${keyHeightPx}px`
                          }}
                          className={getKeyClass(item.code)}
                        >
                          <span className="truncate px-1 leading-tight">
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* 3. Numpad Cluster (Full & ISO only) */}
            {(formFactor === 'ANSI' || formFactor === 'ISO') && (
              <div className="border-l border-slate-100 dark:border-slate-800 pl-3 flex flex-col gap-1.5 shrink-0">
                {/* Top row alignment with F-Row */}
                <div 
                  className="flex items-center justify-center text-[10px] text-slate-400 font-mono"
                  style={{ height: `${keyHeightPx}px` }}
                >
                  NUMPAD
                </div>

                {/* Numpad Keys Container (Left 3 columns + Right 1 column) */}
                <div className="flex gap-1.5">
                  {/* Left 3 Columns */}
                  <div className="flex flex-col gap-1.5">
                    {/* Row 1: NumLock, Divide, Multiply */}
                    <div className="flex gap-1.5">
                      <div
                        onClick={() => setSelectedKey('NumLock')}
                        style={{ width: `${unitSizePx}px`, height: `${keyHeightPx}px` }}
                        className={getKeyClass('NumLock')}
                        title="Num Lock"
                      >
                        <span className="truncate px-0.5 leading-tight">Num</span>
                      </div>
                      <div
                        onClick={() => setSelectedKey('NumpadDivide')}
                        style={{ width: `${unitSizePx}px`, height: `${keyHeightPx}px` }}
                        className={getKeyClass('NumpadDivide')}
                        title="Divide /"
                      >
                        <span className="truncate px-0.5 leading-tight">/</span>
                      </div>
                      <div
                        onClick={() => setSelectedKey('NumpadMultiply')}
                        style={{ width: `${unitSizePx}px`, height: `${keyHeightPx}px` }}
                        className={getKeyClass('NumpadMultiply')}
                        title="Multiply *"
                      >
                        <span className="truncate px-0.5 leading-tight">*</span>
                      </div>
                    </div>

                    {/* Row 2: 7, 8, 9 */}
                    <div className="flex gap-1.5">
                      <div
                        onClick={() => setSelectedKey('Numpad7')}
                        style={{ width: `${unitSizePx}px`, height: `${keyHeightPx}px` }}
                        className={getKeyClass('Numpad7')}
                        title="7"
                      >
                        <span className="truncate px-0.5 leading-tight">7</span>
                      </div>
                      <div
                        onClick={() => setSelectedKey('Numpad8')}
                        style={{ width: `${unitSizePx}px`, height: `${keyHeightPx}px` }}
                        className={getKeyClass('Numpad8')}
                        title="8"
                      >
                        <span className="truncate px-0.5 leading-tight">8</span>
                      </div>
                      <div
                        onClick={() => setSelectedKey('Numpad9')}
                        style={{ width: `${unitSizePx}px`, height: `${keyHeightPx}px` }}
                        className={getKeyClass('Numpad9')}
                        title="9"
                      >
                        <span className="truncate px-0.5 leading-tight">9</span>
                      </div>
                    </div>

                    {/* Row 3: 4, 5, 6 */}
                    <div className="flex gap-1.5">
                      <div
                        onClick={() => setSelectedKey('Numpad4')}
                        style={{ width: `${unitSizePx}px`, height: `${keyHeightPx}px` }}
                        className={getKeyClass('Numpad4')}
                        title="4"
                      >
                        <span className="truncate px-0.5 leading-tight">4</span>
                      </div>
                      <div
                        onClick={() => setSelectedKey('Numpad5')}
                        style={{ width: `${unitSizePx}px`, height: `${keyHeightPx}px` }}
                        className={getKeyClass('Numpad5')}
                        title="5"
                      >
                        <span className="truncate px-0.5 leading-tight">5</span>
                      </div>
                      <div
                        onClick={() => setSelectedKey('Numpad6')}
                        style={{ width: `${unitSizePx}px`, height: `${keyHeightPx}px` }}
                        className={getKeyClass('Numpad6')}
                        title="6"
                      >
                        <span className="truncate px-0.5 leading-tight">6</span>
                      </div>
                    </div>

                    {/* Row 4: 1, 2, 3 */}
                    <div className="flex gap-1.5">
                      <div
                        onClick={() => setSelectedKey('Numpad1')}
                        style={{ width: `${unitSizePx}px`, height: `${keyHeightPx}px` }}
                        className={getKeyClass('Numpad1')}
                        title="1"
                      >
                        <span className="truncate px-0.5 leading-tight">1</span>
                      </div>
                      <div
                        onClick={() => setSelectedKey('Numpad2')}
                        style={{ width: `${unitSizePx}px`, height: `${keyHeightPx}px` }}
                        className={getKeyClass('Numpad2')}
                        title="2"
                      >
                        <span className="truncate px-0.5 leading-tight">2</span>
                      </div>
                      <div
                        onClick={() => setSelectedKey('Numpad3')}
                        style={{ width: `${unitSizePx}px`, height: `${keyHeightPx}px` }}
                        className={getKeyClass('Numpad3')}
                        title="3"
                      >
                        <span className="truncate px-0.5 leading-tight">3</span>
                      </div>
                    </div>

                    {/* Row 5: 0 (2U wide), Decimal . (1U) */}
                    <div className="flex gap-1.5">
                      <div
                        onClick={() => setSelectedKey('Numpad0')}
                        style={{ width: `${2 * unitSizePx + 6}px`, height: `${keyHeightPx}px` }}
                        className={getKeyClass('Numpad0')}
                        title="0"
                      >
                        <span className="truncate px-0.5 leading-tight">0</span>
                      </div>
                      <div
                        onClick={() => setSelectedKey('NumpadDecimal')}
                        style={{ width: `${unitSizePx}px`, height: `${keyHeightPx}px` }}
                        className={getKeyClass('NumpadDecimal')}
                        title="Decimal ."
                      >
                        <span className="truncate px-0.5 leading-tight">.</span>
                      </div>
                    </div>
                  </div>

                  {/* Right 1 Column: Subtract (-), Add (+), Enter */}
                  <div className="flex flex-col gap-1.5">
                    {/* Subtract (-) */}
                    <div
                      onClick={() => setSelectedKey('NumpadSubtract')}
                      style={{ width: `${unitSizePx}px`, height: `${keyHeightPx}px` }}
                      className={getKeyClass('NumpadSubtract')}
                      title="Subtract -"
                    >
                      <span className="truncate px-0.5 leading-tight">-</span>
                    </div>

                    {/* Add (+) - 2U Tall */}
                    <div
                      onClick={() => setSelectedKey('NumpadAdd')}
                      style={{ width: `${unitSizePx}px`, height: `${2 * keyHeightPx + 6}px` }}
                      className={getKeyClass('NumpadAdd')}
                      title="Add +"
                    >
                      <span className="truncate px-0.5 leading-tight">+</span>
                    </div>

                    {/* Enter - 2U Tall */}
                    <div
                      onClick={() => setSelectedKey('NumpadEnter')}
                      style={{ width: `${unitSizePx}px`, height: `${2 * keyHeightPx + 6}px` }}
                      className={getKeyClass('NumpadEnter')}
                      title="Numpad Enter"
                    >
                      <span className="truncate px-0.5 leading-tight text-[10px]">Enter</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Visual State Legend */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
              <span>Untested</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-blue-600 text-white" />
              <span>Currently Held</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded border border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40" />
              <span>Tested</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded border border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/40" />
              <span>Flagged / Intermittent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded border border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40" />
              <span>Stuck / Not Responding</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            * Browser security limits intercepting certain OS shortcuts (Alt+Tab, Win, F1 Help).
          </div>
        </div>
      </div>

      {/* ================= 4. KEY INSPECTION & DETAILED EVENT LOG ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Key Details & Manual Reporting (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Key Inspector: <span className="font-mono text-blue-600">{selectedKey || 'None selected'}</span>
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Click any key to inspect
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Physical Code (event.code):</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{selectedKey}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Logical Value (event.key):</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {lastEvent?.code === selectedKey ? lastEvent.key : (testedKeys.has(selectedKey) ? 'Registered' : 'Not pressed yet')}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Current State:</span>
                <span className={`font-semibold ${activeKeys.has(selectedKey) ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>
                  {activeKeys.has(selectedKey) ? 'PRESSED' : 'RELEASED'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Press Count:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {keyPressCounts[selectedKey] || 0} times
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">User Flagged Status:</span>
                <span className={`font-semibold capitalize ${
                  userReportedIssues[selectedKey] === 'not_responding' ? 'text-rose-600' :
                  userReportedIssues[selectedKey] === 'intermittent' || userReportedIssues[selectedKey] === 'sticking' ? 'text-amber-600' :
                  userReportedIssues[selectedKey] === 'working' ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {userReportedIssues[selectedKey] ? userReportedIssues[selectedKey].replace('_', ' ') : 'Normal'}
                </span>
              </div>
              {BROWSER_RESTRICTED_KEYS.has(selectedKey) && (
                <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300">
                  <span className="font-semibold">Browser/OS Notice:</span> This key is often intercepted by operating system or browser shortcuts (e.g. F-keys, Win, Alt, Tab).
                </div>
              )}
            </div>
          </div>

          {/* Manual Fault Reporting Buttons */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Report / Mark Key Status:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setKeyIssue('working')}
                className="py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Mark Working
              </button>
              <button
                onClick={() => setKeyIssue('not_responding')}
                className="py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Not Responding
              </button>
              <button
                onClick={() => setKeyIssue('intermittent')}
                className="py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Intermittent
              </button>
              <button
                onClick={() => setKeyIssue(null)}
                className="py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
              >
                Clear Status
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Event Telemetry & Simultaneous Held Keys (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Input & Rollover Telemetry
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Browser Events
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Live Held Keys Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <div className="text-xs text-slate-500 font-medium mb-1.5">
                Currently Held Keys ({activeKeys.size}):
              </div>
              <div className="flex flex-wrap gap-1 min-h-[32px]">
                {activeKeys.size === 0 ? (
                  <span className="text-xs text-slate-400 italic">No keys held</span>
                ) : (
                  Array.from(activeKeys).map((k) => (
                    <span key={k} className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-[11px] font-semibold">
                      {k}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Last Received Event Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <div className="text-xs text-slate-500 font-medium mb-1.5">
                Last Keydown Event:
              </div>
              {lastEvent ? (
                <div className="text-xs space-y-0.5">
                  <div>Code: <strong className="font-mono text-slate-800 dark:text-slate-200">{lastEvent.code}</strong></div>
                  <div>Key: <strong className="font-mono text-slate-800 dark:text-slate-200">{lastEvent.key}</strong></div>
                  <div>Timestamp: <span className="font-mono text-slate-500">{lastEvent.timeStamp}ms</span></div>
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">Waiting for initial keypress...</span>
              )}
            </div>
          </div>

          {/* Browser Limitation Disclaimer */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <strong>Browser Testing Boundary:</strong> Web browsers receive standard input events but cannot directly inspect physical switch contacts, solder joints, or hardware serial numbers. A missing event may be caused by an OS shortcut, browser security sandbox, or an actual switch fault.
            </p>
          </div>
        </div>
      </div>

      {/* ================= 5. TEST SUMMARY MODAL ================= */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Keyboard Test Summary
                  </h2>
                  <p className="text-xs text-slate-500">
                    Session diagnostic results
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs py-2">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Selected Layout:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formFactor} ({layout})</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Total Available Keys:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{totalKeysCount}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Unique Keys Detected:</span>
                <span className="font-semibold text-emerald-600">{testedCount} ({progressPct}%)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Untested Keys:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{untestedCount}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Max Simultaneous Rollover:</span>
                <span className="font-semibold text-blue-600">{maxRollover} Keys</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Reported Problem Keys:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {issuesCount > 0 ? `${issuesCount} keys` : 'None reported'}
                </span>
              </div>
            </div>

            {/* Verdict Note */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>Verdict:</strong> Your keyboard input test is complete. {issuesCount === 0 ? 'No issues were reported for the keys tested.' : `User reported issues on ${issuesCount} keys.`}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={copyReport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReport ? 'Report Copied!' : 'Copy Report'}</span>
              </button>

              <button
                onClick={() => setShowSummaryModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyboardTester;
