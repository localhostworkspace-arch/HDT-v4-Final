import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Wifi, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Activity, 
  Globe, 
  ShieldCheck, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Server, 
  Sparkles, 
  Zap, 
  ChevronDown, 
  Laptop, 
  Gamepad2, 
  Tv, 
  Video,
  Play,
  Square,
  RefreshCw,
  Radio,
  Share2,
  Gauge
} from 'lucide-react';
import { measureLatency, measureTransfer } from '../../../services/networkMeasurement';
import { SeoHead } from '../../seo/SeoHead';

type TestPhase = 'idle' | 'ping' | 'download' | 'upload' | 'completed';
type SpeedUnit = 'Mbps' | 'MB/s';

interface SpeedTestResults {
  ping: number;
  jitter: number;
  download: number; // in Mbps
  upload: number; // in Mbps
  peakDownload: number;
  peakUpload: number;
  timestamp: string;
}

interface NetworkTelemetry {
  ip: string;
  isp: string;
  org: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  asn: string;
  protocol: string;
  ipVersion: string;
  loading: boolean;
  lastUpdated: string;
}

export const InternetSpeedTester: React.FC = () => {
  // Unit Selection: Megabits (Mbps) vs MegaBytes (MB/s)
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>('Mbps');

  // Test Lifecycle State
  const [phase, setPhase] = useState<TestPhase>('idle');
  const [currentSpeedMbps, setCurrentSpeedMbps] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0); // 0 to 100%

  // Live Metric States (stored in base Mbps / ms)
  const [ping, setPing] = useState<number | null>(null);
  const [jitter, setJitter] = useState<number | null>(null);
  const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
  const [peakDownload, setPeakDownload] = useState<number>(0);
  const [peakUpload, setPeakUpload] = useState<number>(0);

  // Final Results & History
  const [results, setResults] = useState<SpeedTestResults | null>(null);
  const [copiedResults, setCopiedResults] = useState(false);

  // Real-Time Public IP & ISP Telemetry
  const [telemetry, setTelemetry] = useState<NetworkTelemetry>({
    ip: 'Detecting...',
    isp: 'Detecting ISP...',
    org: 'Detecting Network...',
    city: 'Detecting City...',
    region: 'Detecting Region...',
    country: 'Detecting Country...',
    countryCode: '',
    asn: 'AS-Pending',
    protocol: 'HTTPS',
    ipVersion: 'Unknown',
    loading: true,
    lastUpdated: ''
  });

  const [hideIp, setHideIp] = useState<boolean>(false);
  const [copiedIp, setCopiedIp] = useState<boolean>(false);

  // Real-time Graph Data Points (in Mbps)
  const [graphPoints, setGraphPoints] = useState<number[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Abort controller ref for canceling
  const abortControllerRef = useRef<AbortController | null>(null);
  const isRunningRef = useRef<boolean>(false);
  const [testError, setTestError] = useState<string | null>(null);
  const telemetryControllerRef = useRef<AbortController | null>(null);

  // Real-Time ISP & IP Telemetry Fetcher
  const fetchNetworkTelemetry = useCallback(async () => {
    telemetryControllerRef.current?.abort();
    const controller = new AbortController();
    telemetryControllerRef.current = controller;
    setTelemetry((prev) => ({ ...prev, loading: true }));
    const endpoints = ['https://ipwhois.app/json/', 'https://ipapi.co/json/', 'https://api.ipify.org?format=json'];
    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(4500)]) });
        if (!res.ok) continue;
        const data = await res.json();
        controller.signal.throwIfAborted();
        if (typeof data.ip !== 'string' || !data.ip || data.success === false || data.error) continue;
        setTelemetry({
          ip: data.ip,
          isp: data.isp || data.org || 'Unavailable',
          org: data.org || 'Unavailable',
          city: data.city || 'Unavailable',
          region: data.region || data.region_name || 'Unavailable',
          country: data.country_name || data.country || 'Unavailable',
          countryCode: data.country_code || '',
          asn: data.asn || data.asn_code || 'Unavailable',
          protocol: 'HTTPS',
          ipVersion: data.ip.includes(':') ? 'IPv6' : 'IPv4',
          loading: false,
          lastUpdated: new Date().toLocaleTimeString(),
        });
        return;
      } catch {
        if (controller.signal.aborted) return;
      }
    }
    if (!controller.signal.aborted) setTelemetry({
      ip: 'Unavailable', isp: 'Unavailable', org: 'Unavailable', city: 'Unavailable',
      region: 'Unavailable', country: 'Unavailable', countryCode: '', asn: 'Unavailable',
      protocol: 'HTTPS', ipVersion: 'Unknown', loading: false, lastUpdated: new Date().toLocaleTimeString(),
    });
  }, []);

  // Fetch telemetry on component mount
  useEffect(() => {
    void fetchNetworkTelemetry();
    return () => {
      telemetryControllerRef.current?.abort();
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      isRunningRef.current = false;
    };
  }, [fetchNetworkTelemetry]);

  // Main Speed Test Execution Orchestrator
  const startSpeedTest = useCallback(async () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    // Reset states
    setResults(null);
    setTestError(null);
    setCurrentSpeedMbps(0);
    setProgress(0);
    setDownloadSpeed(null);
    setUploadSpeed(null);
    setPing(null);
    setJitter(null);
    setPeakDownload(0);
    setPeakUpload(0);
    setGraphPoints([]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // 1. PING & JITTER PHASE
      setPhase('ping');
      setProgress(10);
      const { avgPing, jitter: calcJitter } = await measureLatency(controller.signal, setPing);
      controller.signal.throwIfAborted();
      setPing(avgPing);
      setJitter(calcJitter);

      // 2. DOWNLOAD SPEED PHASE
      setPhase('download');
      setGraphPoints([]);
      setProgress(0);
      const download = await measureTransfer('download', controller.signal, (speed, completion, peak) => {
        setCurrentSpeedMbps(speed); setDownloadSpeed(speed); setProgress(completion); setPeakDownload(peak);
        setGraphPoints(prev => [...prev.slice(-30), speed]);
      });
      controller.signal.throwIfAborted();
      const finalDownload = download.speed;
      setDownloadSpeed(finalDownload);

      // 3. UPLOAD SPEED PHASE
      setPhase('upload');
      setGraphPoints([]);
      setProgress(0);
      const upload = await measureTransfer('upload', controller.signal, (speed, completion, peak) => {
        setCurrentSpeedMbps(speed); setUploadSpeed(speed); setProgress(completion); setPeakUpload(peak);
        setGraphPoints(prev => [...prev.slice(-30), speed]);
      });
      controller.signal.throwIfAborted();
      const finalUpload = upload.speed;
      setUploadSpeed(finalUpload);

      // 4. TEST COMPLETED
      setPhase('completed');
      setCurrentSpeedMbps(finalDownload);
      const testRes: SpeedTestResults = {
        ping: avgPing,
        jitter: calcJitter,
        download: finalDownload,
        upload: finalUpload,
        peakDownload: download.peak,
        peakUpload: upload.peak,
        timestamp: new Date().toLocaleTimeString()
      };
      setResults(testRes);
    } catch (error) {
      if (abortControllerRef.current === controller && !controller.signal.aborted) {
        setTestError(error instanceof Error ? error.message : 'Network measurement failed. Please retry.');
        setPhase('idle');
      }
    } finally {
      if (abortControllerRef.current === controller) {
        isRunningRef.current = false;
        abortControllerRef.current = null;
      }
    }
  }, []);

  // Cancel running test
  const stopSpeedTest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = null;
    isRunningRef.current = false;
    setPhase('idle');
    setTestError('Test canceled. Any displayed measurements are partial.');
    setCurrentSpeedMbps(0);
    setProgress(0);
  };

  // Speed Unit Conversion Helper (Mbps vs MB/s)
  // 1 Byte = 8 Bits, so 1 MB/s = 8 Mbps (Value in MB/s = Value in Mbps / 8)
  const formatSpeedVal = (valMbps: number | null): string => {
    if (valMbps === null || isNaN(valMbps)) return '--';
    if (speedUnit === 'MB/s') {
      const mbpsConverted = valMbps / 8;
      return mbpsConverted < 10 ? mbpsConverted.toFixed(2) : mbpsConverted.toFixed(1);
    }
    return valMbps < 10 ? valMbps.toFixed(2) : valMbps.toFixed(1);
  };

  // Copy Results to Clipboard
  const handleCopyResults = () => {
    if (!results) return;
    const dlText = speedUnit === 'MB/s' ? `${(results.download / 8).toFixed(2)} MB/s` : `${results.download} Mbps`;
    const ulText = speedUnit === 'MB/s' ? `${(results.upload / 8).toFixed(2)} MB/s` : `${results.upload} Mbps`;
    const text = `🚀 HardwareTest Internet Speed Results:\n📥 Download: ${dlText} (Peak: ${formatSpeedVal(results.peakDownload)} ${speedUnit})\n📤 Upload: ${ulText}\n⚡ Ping: ${results.ping} ms | Jitter: ${results.jitter} ms\n🌐 Public IP: ${telemetry.ip}\n🏢 ISP: ${telemetry.isp} (${telemetry.city}, ${telemetry.country})\n🔗 Tested at: ${window.location.href}`;
    navigator.clipboard.writeText(text);
    setCopiedResults(true);
    setTimeout(() => setCopiedResults(false), 2000);
  };

  // Copy IP to Clipboard
  const handleCopyIp = () => {
    navigator.clipboard.writeText(telemetry.ip);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  // Calculate Speedometer Angle (240 degree arc: -120deg to +120deg)
  const maxScaleMbps = currentSpeedMbps > 500 ? 1000 : currentSpeedMbps > 100 ? 500 : 100;
  const normalizedSpeed = Math.min(1, Math.max(0, currentSpeedMbps / maxScaleMbps));
  const needleAngle = -120 + normalizedSpeed * 240;

  // Scale labels in current unit
  const getScaleTick = (pct: number) => {
    const rawMbps = (pct / 100) * maxScaleMbps;
    if (speedUnit === 'MB/s') {
      const mbVal = rawMbps / 8;
      return mbVal % 1 === 0 ? mbVal.toFixed(0) : mbVal.toFixed(1);
    }
    return Math.round(rawMbps).toString();
  };

  // Speed Quality Rating
  const getSpeedGrade = (dl: number) => {
    if (dl >= 300) return { title: 'High Throughput', desc: 'High measured throughput. Gaming responsiveness also depends on latency and the game server.', color: 'text-emerald-400', badge: 'Tier 1 Ultra' };
    if (dl >= 100) return { title: 'High-Speed Broadband', desc: 'Measured bandwidth may support multiple video streams. Upload performance and latency are measured separately.', color: 'text-cyan-400', badge: 'Tier 2 Fast' };
    if (dl >= 40) return { title: 'Standard Broadband', desc: 'Great for 1080p Full HD video streaming, Zoom conference calls & daily multi-user browsing.', color: 'text-indigo-400', badge: 'Tier 3 Good' };
    return { title: 'Basic Connection', desc: 'Suitable for standard web browsing, email and audio streaming.', color: 'text-amber-400', badge: 'Tier 4 Basic' };
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 selection:bg-indigo-500 selection:text-white pb-20">
      <SeoHead
        title="Internet Speed Test — Fast Ping, Download & Upload Test | HardwareTest"
        description="Test your internet connection speed in real time. Accurate speedometer gauge measuring download bandwidth, upload throughput, ping latency, jitter, ISP provider, and public IP detection."
      />

      {testError && <p role="alert" className="mx-auto max-w-5xl px-6 py-4 text-amber-300">{testError} No complete result was saved.</p>}
      <p className="mx-auto max-w-5xl px-6 pt-6 text-sm text-slate-400">Measures HTTPS request latency and application throughput to Cloudflare, including server overhead. This is not ICMP ping or guaranteed line speed. Tests transfer data to and from Cloudflare and can use significant bandwidth. IP lookup uses external providers.</p>
      {/* HERO HEADER */}
      <section className="pt-8 pb-4 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-gradient-to-b from-[#0D1527] to-[#070B14]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Real-Time Speedometer
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Live ISP & IP Telemetry
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
              <Gauge className="w-3 h-3 text-purple-400" />
              Mbps & MB/s Dual Mode
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <Wifi className="w-7 h-7 text-indigo-400 shrink-0" />
                Internet Speed Test — Broadband & Fiber Benchmark
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Measure HTTP download and upload throughput, request latency and jitter, and available network information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN SPEED TEST STUDIO WORKBENCH */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT: SPEEDOMETER GAUGE & LIVE BENCHMARK (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#0F172A] to-[#0A0E1A] border border-slate-800 shadow-2xl relative overflow-hidden">
            
            {/* TOP HEADER CONTROLS: Status Pill + Unit Switcher (Mbps vs MB/s) */}
            <div className="flex flex-wrap items-center justify-between gap-3 z-10">
              
              {/* Phase Status Pill */}
              <div className="flex items-center gap-2.5">
                <span className={`w-3 h-3 rounded-full ${
                  phase === 'download' ? 'bg-cyan-400 animate-ping' :
                  phase === 'upload' ? 'bg-purple-400 animate-ping' :
                  phase === 'ping' ? 'bg-amber-400 animate-ping' :
                  phase === 'completed' ? 'bg-emerald-400' : 'bg-slate-600'
                }`} />
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300">
                  {phase === 'idle' && 'Ready to Benchmark'}
                  {phase === 'ping' && 'Calibrating Ping & Jitter...'}
                  {phase === 'download' && 'Testing Download Speed...'}
                  {phase === 'upload' && 'Testing Upload Speed...'}
                  {phase === 'completed' && 'Benchmark Completed'}
                </span>

                {phase !== 'idle' && phase !== 'completed' && (
                  <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    {progress}%
                  </span>
                )}
              </div>

              {/* UNIT SWITCHER: Mbps (Megabits) vs MB/s (MegaBytes) */}
              <div className="flex items-center bg-[#070B14] p-1 rounded-xl border border-slate-700/80 shadow-inner">
                <button
                  onClick={() => setSpeedUnit('Mbps')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    speedUnit === 'Mbps'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Megabits per second (standard ISP connection speed)"
                >
                  Mbps
                </button>
                <button
                  onClick={() => setSpeedUnit('MB/s')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    speedUnit === 'MB/s'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="MegaBytes per second (actual file download transfer rate = Mbps / 8)"
                >
                  MB/s
                </button>
              </div>

            </div>

            {/* RADIAL SPEEDOMETER GAUGE */}
            <div className="relative my-4 mx-auto flex flex-col items-center justify-center w-full max-w-[320px] sm:max-w-[360px] aspect-[1/0.85]">
              
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 240">
                {/* Background Outer Arc (240 deg arc) */}
                <path
                  d="M 45 210 A 130 130 0 1 1 255 210"
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="16"
                  strokeLinecap="round"
                />

                {/* Dynamic Active Glow Arc */}
                <path
                  d="M 45 210 A 130 130 0 1 1 255 210"
                  fill="none"
                  stroke={phase === 'upload' ? '#A855F7' : '#06B6D4'}
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray="565"
                  strokeDashoffset={565 - (normalizedSpeed * 565)}
                  className="transition-all duration-150 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 12px ${phase === 'upload' ? 'rgba(168,85,247,0.7)' : 'rgba(6,182,212,0.7)'})`
                  }}
                />

                {/* Scale Ticks (5 Steps) */}
                {[0, 25, 50, 75, 100].map((pct, i) => {
                  const angle = -120 + (i / 4) * 240;
                  const rad = (angle - 90) * (Math.PI / 180);
                  const x1 = 150 + Math.cos(rad) * 112;
                  const y1 = 150 + Math.sin(rad) * 112;
                  const tx = 150 + Math.cos(rad) * 92;
                  const ty = 150 + Math.sin(rad) * 92;
                  const tickText = getScaleTick(pct);

                  return (
                    <g key={pct}>
                      <circle cx={x1} cy={y1} r="2.5" fill="#475569" />
                      <text
                        x={tx}
                        y={ty + 4}
                        fill="#64748B"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {tickText}
                      </text>
                    </g>
                  );
                })}

                {/* Sweeping Needle */}
                <g transform={`rotate(${needleAngle} 150 150)`} className="transition-transform duration-100 ease-out">
                  <line
                    x1="150"
                    y1="150"
                    x2="150"
                    y2="38"
                    stroke={phase === 'upload' ? '#EC4899' : '#38BDF8'}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    style={{
                      filter: `drop-shadow(0 0 8px ${phase === 'upload' ? '#EC4899' : '#38BDF8'})`
                    }}
                  />
                  <circle cx="150" cy="38" r="4" fill="#FFFFFF" />
                </g>

                {/* Center Hub */}
                <circle cx="150" cy="150" r="14" fill="#0F172A" stroke="#334155" strokeWidth="3" />
                <circle cx="150" cy="150" r="5" fill={phase === 'upload' ? '#EC4899' : '#38BDF8'} />
              </svg>
            </div>

            {/* DEDICATED SPEED READOUT DISPLAY (Positioned neatly below gauge & above Action Button) */}
            <div className="my-2 p-4 rounded-2xl bg-[#090D1A] border border-slate-800/90 shadow-inner flex flex-col items-center justify-center text-center max-w-sm mx-auto w-full">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow-md">
                  {formatSpeedVal(currentSpeedMbps)}
                </span>
                <span className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-indigo-400">
                  {speedUnit}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-medium">
                <span>
                  {phase === 'upload' ? 'Active Upload Throughput' : phase === 'download' ? 'Active Download Bandwidth' : 'Connection Speed Gauge'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-500 font-mono">
                  Scale 0 - {speedUnit === 'MB/s' ? `${(maxScaleMbps / 8).toFixed(0)} MB/s` : `${maxScaleMbps} Mbps`}
                </span>
              </div>
            </div>

            {/* ACTION BUTTON (Start / Test Again / Stop) */}
            <div className="z-10 mt-3 flex flex-col items-center gap-2">
              {phase === 'idle' || phase === 'completed' ? (
                <button
                  onClick={startSpeedTest}
                  className="px-10 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-indigo-600/30 transition-all transform hover:scale-105 cursor-pointer flex items-center gap-2.5"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{phase === 'completed' ? 'Test Again' : 'Start Speed Test'}</span>
                </button>
              ) : (
                <button
                  onClick={stopSpeedTest}
                  className="px-10 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-xl shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-2 animate-pulse"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop Test</span>
                </button>
              )}

              {phase === 'completed' && results && (
                <span className="text-[11px] text-slate-500 font-mono">
                  Completed at {results.timestamp}
                </span>
              )}
            </div>

            {/* Real-time Waveform Progress Line */}
            {graphPoints.length > 2 && (
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Bandwidth Throughput Stream</span>
                <span>{formatSpeedVal(graphPoints[graphPoints.length - 1])} {speedUnit} Live</span>
              </div>
            )}
          </div>

          {/* RIGHT: METRICS, REAL-TIME ISP & TELEMETRY (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            
            {/* 4 PRIMARY METRICS CARDS (Ping, Jitter, Download, Upload) */}
            <div className="grid grid-cols-2 gap-3">
              
              {/* DOWNLOAD SPEED */}
              <div className={`p-4 rounded-2xl border transition-all ${
                phase === 'download' 
                  ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10' 
                  : 'bg-[#0F172A] border-slate-800'
              }`}>
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                    <ArrowDownCircle className="w-4 h-4" />
                    <span>Download</span>
                  </div>
                  {peakDownload > 0 && (
                    <span className="text-[9px] font-mono text-slate-500">
                      Peak {formatSpeedVal(peakDownload)}
                    </span>
                  )}
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
                  {formatSpeedVal(downloadSpeed)}
                  <span className="text-xs font-normal text-slate-400 ml-1">{speedUnit}</span>
                </div>
              </div>

              {/* UPLOAD SPEED */}
              <div className={`p-4 rounded-2xl border transition-all ${
                phase === 'upload' 
                  ? 'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/10' 
                  : 'bg-[#0F172A] border-slate-800'
              }`}>
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                    <ArrowUpCircle className="w-4 h-4" />
                    <span>Upload</span>
                  </div>
                  {peakUpload > 0 && (
                    <span className="text-[9px] font-mono text-slate-500">
                      Peak {formatSpeedVal(peakUpload)}
                    </span>
                  )}
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
                  {formatSpeedVal(uploadSpeed)}
                  <span className="text-xs font-normal text-slate-400 ml-1">{speedUnit}</span>
                </div>
              </div>

              {/* PING / LATENCY */}
              <div className={`p-4 rounded-2xl border transition-all ${
                phase === 'ping' 
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10' 
                  : 'bg-[#0F172A] border-slate-800'
              }`}>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
                  <Activity className="w-4 h-4" />
                  <span>Ping (Latency)</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
                  {ping !== null ? ping : '--'}
                  <span className="text-xs font-normal text-slate-400 ml-1">ms</span>
                </div>
              </div>

              {/* JITTER */}
              <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 mb-1">
                  <Zap className="w-4 h-4" />
                  <span>Jitter</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
                  {jitter !== null ? jitter : '--'}
                  <span className="text-xs font-normal text-slate-400 ml-1">ms</span>
                </div>
              </div>

            </div>

            {/* REAL-TIME PUBLIC IP & ISP NETWORK TELEMETRY CARD */}
            <div className="p-5 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-3.5">
              
              {/* Header with Live Status & Refresh Button */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 font-bold text-xs text-indigo-400">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span className="text-white">Real-Time Network & ISP Telemetry</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchNetworkTelemetry}
                    disabled={telemetry.loading}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
                    title="Refresh Live Network Telemetry"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${telemetry.loading ? 'animate-spin text-indigo-400' : ''}`} />
                  </button>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                
                {/* Public IP Row with Mask/Unmask & Copy */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090C16] border border-slate-800">
                  <div className="text-slate-400 font-medium flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Public IP:</span>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-mono font-bold">
                      {telemetry.ipVersion}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-xs">
                      {telemetry.loading 
                        ? 'Fetching...' 
                        : hideIp 
                          ? '••••.••••.••••.••••' 
                          : telemetry.ip}
                    </span>
                    <button
                      onClick={() => setHideIp(!hideIp)}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                      title={hideIp ? 'Show Public IP' : 'Hide Public IP'}
                    >
                      {hideIp ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={handleCopyIp}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                      title="Copy Public IP Address"
                    >
                      {copiedIp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* ISP Provider Row */}
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-slate-500" />
                    <span>ISP Provider:</span>
                  </span>
                  <span className="font-bold text-slate-200 text-right truncate max-w-[210px]" title={telemetry.isp}>
                    {telemetry.loading ? 'Detecting ISP...' : telemetry.isp}
                  </span>
                </div>

                {/* Autonomous System Number (ASN) */}
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-400">Autonomous System:</span>
                  <span className="font-mono text-[11px] font-semibold text-slate-300 text-right">
                    {telemetry.loading ? '...' : telemetry.asn}
                  </span>
                </div>

                {/* Gateway Region & Country */}
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-400">Region & Country:</span>
                  <span className="font-semibold text-slate-200 text-right truncate max-w-[210px]">
                    {telemetry.loading ? 'Detecting location...' : `${telemetry.city}, ${telemetry.country}`}
                  </span>
                </div>

                {/* Protocol & TLS */}
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-400">Protocol:</span>
                  <span className="font-mono text-emerald-400 text-[11px] font-bold">
                    {telemetry.protocol}
                  </span>
                </div>

              </div>
            </div>

            {/* RESULTS SUMMARY & SHARE CARD (When completed) */}
            {results && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-[#0F172A] border border-indigo-500/30 space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      {getSpeedGrade(results.download).badge}
                    </span>
                    <h3 className="text-sm font-black text-white">
                      {getSpeedGrade(results.download).title}
                    </h3>
                  </div>
                  <button
                    onClick={handleCopyResults}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-600/20"
                  >
                    {copiedResults ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedResults ? 'Copied!' : 'Share Results'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {getSpeedGrade(results.download).desc}
                </p>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* CONNECTION CAPABILITIES GRID */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            What Can Your Internet Handle?
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Real-world performance estimates based on your current network speed & latency:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 4K UHD Streaming */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">4K / 8K Video Streaming</h3>
              <p className="text-xs text-slate-400 mt-1">Requires at least 25-50 Mbps for bufferless Ultra HD HDR playback.</p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500">Status</span>
              <span className={`font-bold ${downloadSpeed && downloadSpeed >= 25 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {downloadSpeed === null ? 'Run Test' : downloadSpeed >= 25 ? '✓ Flawless' : '⚠ May Buffer'}
              </span>
            </div>
          </div>

          {/* Low Latency Gaming */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Online Esports Gaming</h3>
              <p className="text-xs text-slate-400 mt-1">Requires low ping (&lt;30 ms) and jitter (&lt;5 ms) for responsive hit registration.</p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500">Status</span>
              <span className={`font-bold ${ping && ping <= 40 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {ping === null ? 'Run Test' : ping <= 40 ? '✓ Competitive' : '⚠ Moderate Latency'}
              </span>
            </div>
          </div>

          {/* Video Conferencing */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Zoom & Team Calls</h3>
              <p className="text-xs text-slate-400 mt-1">Requires symmetric 10+ Mbps upload & download bandwidth for 1080p video.</p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500">Status</span>
              <span className={`font-bold ${uploadSpeed && uploadSpeed >= 8 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {uploadSpeed === null ? 'Run Test' : uploadSpeed >= 8 ? '✓ Crystal Clear' : '⚠ Basic HD'}
              </span>
            </div>
          </div>

          {/* Large File & Cloud Sync */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Cloud Backup & Downloads</h3>
              <p className="text-xs text-slate-400 mt-1">Gigabit tier downloads 50 GB games in under 8 minutes.</p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500">Status</span>
              <span className={`font-bold ${downloadSpeed && downloadSpeed >= 100 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {downloadSpeed === null ? 'Run Test' : downloadSpeed >= 100 ? '✓ Ultra Fast' : 'Standard Speed'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILED TROUBLESHOOTING & FAQ SECTION */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-800/80">
        <h2 className="text-xl sm:text-2xl font-black text-white text-center mb-8">
          Frequently Asked Questions & Speed Optimization
        </h2>

        <div className="space-y-3">
          {[
            {
              q: "What is the difference between Mbps and MB/s?",
              a: "Mbps stands for MegaBITS per second (used by ISPs to advertise connection speed), while MB/s stands for MegaBYTES per second (used by Windows, Steam, and browsers for file download speeds). Since 1 Byte contains 8 Bits, a 100 Mbps connection downloads files at 12.5 MB/s."
            },
            {
              q: "What is Latency (Ping) and Packet Jitter?",
              a: "This tool measures HTTPS request round-trip time to Cloudflare, including browser and server overhead. Request jitter is the mean absolute difference between consecutive samples. Game-server ping may differ substantially."
            },
            {
              q: "Why is my speed test result lower than what my ISP promised?",
              a: "Wi-Fi interference, physical distance from the router, network congestion, running background downloads (e.g. Windows Updates, cloud sync), or hardware limitations on older Ethernet cards can reduce measured speeds."
            },
            {
              q: "How can I increase my internet speed immediately?",
              a: "1. Connect directly via a Cat6 Ethernet cable instead of 2.4GHz Wi-Fi.\n2. Restart your optical modem/router every 30 days to clear DNS cache.\n3. Switch your router Wi-Fi band to 5GHz or Wi-Fi 6 (802.11ax).\n4. Change DNS servers to Cloudflare (1.1.1.1) or Google DNS (8.8.8.8)."
            }
          ].map((item, idx) => (
            <div key={idx} className="rounded-2xl bg-[#0F172A] border border-slate-800 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-sm font-bold text-white hover:text-indigo-400 transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openFaq === idx ? 'rotate-180 text-indigo-400' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3 whitespace-pre-line">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
