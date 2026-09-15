import type { HardwareProfile, HardwareCPU, HardwareGPU, ConfidenceLevel } from '../types';
import { matchGPU, matchCPU } from '../data/hardwareBenchmarks';

/**
 * Hardware Detection Service
 *
 * Detects the user's PC hardware using available browser APIs.
 * Clearly marks the confidence level of each detected value.
 *
 * Limitations (disclosed in UI):
 * - RAM: navigator.deviceMemory reports a coarse, privacy-limited bucket
 * - GPU VRAM: NOT detectable by any browser API — must be looked up from benchmark DB
 * - Storage: navigator.storage.estimate() returns quota, not total disk size
 * - CPU name: NOT available via browser — only logical processor count is available
 * - OS: derived from User Agent string — approximate
 */

function detectOS(): string {
  const ua = navigator.userAgent;
  if (/Windows NT 10\.0.*Win64/.test(ua)) {
    // Try to distinguish Win 10 vs Win 11 (not always possible via UA)
    return 'Windows 10/11 64-bit';
  }
  if (/Android/.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'iOS';
  if (/Mac OS X/.test(ua)) return 'macOS';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Unknown OS';
}

function detectGPU(): HardwareGPU {
  let rendererRaw = '';
  let vendorRaw = '';
  let gl: WebGLRenderingContext | null = null;

  try {
    const canvas = document.createElement('canvas');
    gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null;
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        rendererRaw = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
        vendorRaw = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
      }
    }
  } catch {
    // Detection may be blocked by privacy settings.
  } finally {
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  }

  // Attempt to match against benchmark DB
  const benchmark = matchGPU(rendererRaw);

  const vendor = vendorRaw.toLowerCase().includes('nvidia')
    ? 'NVIDIA'
    : vendorRaw.toLowerCase().includes('amd') || vendorRaw.toLowerCase().includes('advanced micro')
    ? 'AMD'
    : vendorRaw.toLowerCase().includes('intel')
    ? 'Intel'
    : vendorRaw || 'Unknown';

  // Confidence: high if we matched a benchmark, medium if we have a renderer string, low otherwise
  const detectionConfidence: ConfidenceLevel = benchmark
    ? 'high'
    : rendererRaw
    ? 'medium'
    : 'low';

  return {
    name: rendererRaw || 'Unknown GPU',
    vendor,
    vramGB: benchmark ? benchmark.vramGB : null, // Cannot detect via browser; look up from DB
    performanceScore: benchmark ? benchmark.performanceScore : null,
    detectionConfidence,
  };
}

function detectCPU(): HardwareCPU {
  const cores = navigator.hardwareConcurrency || 0;

  // Logical processor count cannot identify a CPU model or performance tier.

  return {
    name: 'Unknown CPU', // Browser cannot determine CPU model
    vendor: 'Unknown',
    cores,
    performanceScore: null,
    detectionConfidence: 'low', // We only know logical processor count
  };
}

// Browser storage quota is not free disk space; manual entry is required.
function detectRAMGB(): number | null {
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (mem) return mem; // Already in GB (rounded bucket)
  return null;
}

/** Detect the user's hardware profile from browser APIs */
export async function detectHardwareProfile(): Promise<HardwareProfile> {
  const gpu = detectGPU();
  const cpu = detectCPU();
  const ramGB = detectRAMGB();
  const storageAvailableGB = null;
  const os = detectOS();

  return {
    cpu,
    gpu,
    ramGB,
    storageAvailableGB,
    operatingSystem: os,
    displayWidth: window.screen.width,
    displayHeight: window.screen.height,
    isManual: false,
  };
}

/** Create a manual hardware profile from user-selected values */
export function createManualProfile(opts: {
  cpuName: string;
  gpuName: string;
  ramGB: number;
  vramGB: number | null;
  storageGB: number;
  operatingSystem: string;
}): HardwareProfile {
  const cpuBenchmark = matchCPU(opts.cpuName);
  const gpuBenchmark = matchGPU(opts.gpuName);

  const cpu: HardwareCPU = {
    name: opts.cpuName,
    vendor: cpuBenchmark?.vendor ?? 'Unknown',
    cores: cpuBenchmark?.cores ?? 0,
    performanceScore: cpuBenchmark?.performanceScore ?? null,
    detectionConfidence: cpuBenchmark ? 'high' : 'low',
  };

  const gpu: HardwareGPU = {
    name: opts.gpuName,
    vendor: gpuBenchmark?.vendor ?? 'Unknown',
    vramGB: opts.vramGB ?? (gpuBenchmark ? gpuBenchmark.vramGB : null),
    performanceScore: gpuBenchmark?.performanceScore ?? null,
    detectionConfidence: gpuBenchmark ? 'high' : 'low',
  };

  return {
    cpu,
    gpu,
    ramGB: opts.ramGB,
    storageAvailableGB: opts.storageGB,
    operatingSystem: opts.operatingSystem,
    displayWidth: window.screen.width,
    displayHeight: window.screen.height,
    isManual: true,
  };
}

/** Return a human-friendly label for the profile's overall detection quality */
export function getProfileConfidenceLabel(profile: HardwareProfile): string {
  if (profile.isManual) return 'Manual Entry';
  if (profile.gpu.detectionConfidence === 'high' && profile.ramGB != null) return 'Auto-Detected';
  if (profile.gpu.detectionConfidence === 'medium') return 'Partially Detected';
  return 'Limited Detection';
}
