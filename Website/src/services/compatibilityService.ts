import type {
  HardwareProfile,
  CompatibilityItem,
  CompatibilityResult,
  ComponentScore,
  ComponentStatus,
  CompatibilityStatus,
  ConfidenceLevel,
  PerformanceEstimate,
} from '../types';
import { matchGPURequirement, matchCPU } from '../data/hardwareBenchmarks';

/**
 * Compatibility Engine
 *
 * Pure deterministic functions — no AI, no external API calls.
 * All comparisons are based on normalized performance scores from hardwareBenchmarks.ts.
 */

// ─── Category Weights ─────────────────────────────────────────────────────────

type WeightMap = { gpu: number; cpu: number; vram: number; ram: number; os: number; storage: number };

function getCategoryWeights(item: CompatibilityItem): WeightMap {
  const cat = item.category.toLowerCase();
  if (item.type === 'game') {
    return { gpu: 0.40, cpu: 0.28, vram: 0.15, ram: 0.10, os: 0.04, storage: 0.03 };
  }
  if (cat.includes('video edit') || cat.includes('motion') || cat.includes('vfx') || cat.includes('color')) {
    return { gpu: 0.28, cpu: 0.30, vram: 0.12, ram: 0.22, os: 0.04, storage: 0.04 };
  }
  if (cat.includes('3d') || cat.includes('render') || cat.includes('cad') || cat.includes('engineer')) {
    return { gpu: 0.30, cpu: 0.25, vram: 0.15, ram: 0.22, os: 0.04, storage: 0.04 };
  }
  if (cat.includes('photo')) {
    return { gpu: 0.18, cpu: 0.28, vram: 0.08, ram: 0.35, os: 0.06, storage: 0.05 };
  }
  // General software default
  return { gpu: 0.20, cpu: 0.30, vram: 0.10, ram: 0.28, os: 0.07, storage: 0.05 };
}

// ─── Component Scoring Helpers ────────────────────────────────────────────────

function scoreGPU(profile: HardwareProfile, item: CompatibilityItem): ComponentScore {
  const userScore = profile.gpu.performanceScore;
  const minReq = item.minimumRequirements.gpu;
  const recReq = item.recommendedRequirements.gpu;
  const minBenchmark = matchGPURequirement(minReq);
  const recBenchmark = matchGPURequirement(recReq);

  const minScore = minBenchmark?.performanceScore ?? null;
  const recScore = recBenchmark?.performanceScore ?? null;

  if (userScore == null || minScore == null) {
    return {
      status: 'unknown',
      score: 50,
      userValue: profile.gpu.name,
      requiredMinValue: minReq,
      requiredRecValue: recReq,
      meetsMinimum: false,
      meetsRecommended: false,
    };
  }

  const meetsMinimum = userScore >= minScore;
  const meetsRecommended = recScore != null ? userScore >= recScore : meetsMinimum;

  // Score: ratio of user vs recommended (capped at 100)
  const refScore = recScore ?? minScore;
  const ratio = Math.min(userScore / refScore, 1.5); // cap at 150% of recommended
  const normalizedScore = Math.round(Math.min((ratio / 1.5) * 100, 100));

  let status: ComponentStatus = 'fail';
  if (meetsRecommended) status = 'pass';
  else if (meetsMinimum) status = 'warn';

  return {
    status,
    score: normalizedScore,
    userValue: profile.gpu.name,
    requiredMinValue: minReq,
    requiredRecValue: recReq,
    meetsMinimum,
    meetsRecommended,
  };
}

function scoreCPU(profile: HardwareProfile, item: CompatibilityItem): ComponentScore {
  const userScore = profile.cpu.performanceScore;
  const minReq = item.minimumRequirements.cpu;
  const recReq = item.recommendedRequirements.cpu;
  const minBenchmark = matchCPU(minReq);
  const recBenchmark = matchCPU(recReq);

  const minScore = minBenchmark?.performanceScore ?? null;
  const recScore = recBenchmark?.performanceScore ?? null;

  const effectiveUserScore = userScore;
  if (minScore == null || effectiveUserScore == null) {
    return {
      status: 'unknown',
      score: 50,
      userValue: profile.cpu.name !== 'Unknown CPU'
        ? profile.cpu.name
        : `Unknown CPU (${profile.cpu.cores} logical processors)`,
      requiredMinValue: minReq,
      requiredRecValue: recReq,
      meetsMinimum: false,
      meetsRecommended: false,
    };
  }

  const meetsMinimum = effectiveUserScore >= minScore;
  const meetsRecommended = recScore != null ? effectiveUserScore >= recScore : meetsMinimum;
  const refScore = recScore ?? minScore;
  const ratio = Math.min(effectiveUserScore / refScore, 1.5);
  const normalizedScore = Math.round(Math.min((ratio / 1.5) * 100, 100));

  let status: ComponentStatus = 'fail';
  if (meetsRecommended) status = 'pass';
  else if (meetsMinimum) status = 'warn';

  const displayName = profile.cpu.name !== 'Unknown CPU'
    ? profile.cpu.name
    : `Unknown CPU (${profile.cpu.cores} logical processors)`;

  return {
    status,
    score: normalizedScore,
    userValue: displayName,
    requiredMinValue: minReq,
    requiredRecValue: recReq,
    meetsMinimum,
    meetsRecommended,
  };
}

function scoreVRAM(profile: HardwareProfile, item: CompatibilityItem): ComponentScore {
  const userVram = profile.gpu.vramGB;
  const minVram = item.minimumRequirements.vramGB;
  const recVram = item.recommendedRequirements.vramGB;

  if (minVram == null && recVram == null) {
    return { status: 'pass', score: 100, userValue: userVram == null ? 'Unknown VRAM' : `${userVram} GB`, requiredMinValue: 'N/A', requiredRecValue: 'N/A', meetsMinimum: true, meetsRecommended: true };
  }

  if (userVram == null) {
    return {
      status: 'unknown',
      score: 50,
      userValue: 'Unknown VRAM',
      requiredMinValue: minVram != null ? `${minVram} GB` : 'N/A',
      requiredRecValue: recVram != null ? `${recVram} GB` : 'N/A',
      meetsMinimum: false,
      meetsRecommended: false,
    };
  }

  if (minVram == null) {
    return {
      status: 'pass',
      score: 100,
      userValue: `${userVram} GB`,
      requiredMinValue: 'N/A',
      requiredRecValue: 'N/A',
      meetsMinimum: true,
      meetsRecommended: true,
    };
  }

  const meetsMinimum = userVram >= minVram;
  const meetsRecommended = recVram != null ? userVram >= recVram : meetsMinimum;
  const ref = recVram ?? minVram;
  const ratio = Math.min(userVram / ref, 2);
  const normalizedScore = Math.round(Math.min((ratio / 2) * 100, 100));

  return {
    status: meetsRecommended ? 'pass' : meetsMinimum ? 'warn' : 'fail',
    score: normalizedScore,
    userValue: `${userVram} GB`,
    requiredMinValue: `${minVram} GB`,
    requiredRecValue: recVram != null ? `${recVram} GB` : 'N/A',
    meetsMinimum,
    meetsRecommended,
  };
}

function scoreRAM(profile: HardwareProfile, item: CompatibilityItem): ComponentScore {
  const userRam = profile.ramGB;
  const minRam = item.minimumRequirements.ramGB;
  const recRam = item.recommendedRequirements.ramGB;

  if (userRam == null) {
    return {
      status: 'unknown',
      score: 50,
      userValue: 'Unknown RAM',
      requiredMinValue: `${minRam} GB`,
      requiredRecValue: `${recRam} GB`,
      meetsMinimum: false,
      meetsRecommended: false,
    };
  }

  const meetsMinimum = userRam >= minRam;
  const meetsRecommended = userRam >= recRam;
  const ratio = Math.min(userRam / recRam, 2);
  const normalizedScore = Math.round(Math.min((ratio / 2) * 100, 100));

  return {
    status: meetsRecommended ? 'pass' : meetsMinimum ? 'warn' : 'fail',
    score: normalizedScore,
    userValue: `${userRam} GB`,
    requiredMinValue: `${minRam} GB`,
    requiredRecValue: `${recRam} GB`,
    meetsMinimum,
    meetsRecommended,
  };
}

function scoreStorage(profile: HardwareProfile, item: CompatibilityItem): ComponentScore {
  const userStorage = profile.storageAvailableGB;
  const reqStorage = item.minimumRequirements.storageGB;

  if (userStorage == null) {
    return {
      status: 'unknown',
      score: 50,
      userValue: 'Unknown Storage',
      requiredMinValue: `${reqStorage} GB`,
      requiredRecValue: `${reqStorage} GB`,
      meetsMinimum: false,
      meetsRecommended: false,
    };
  }

  const meets = userStorage >= reqStorage;
  const ratio = Math.min(userStorage / reqStorage, 3);
  const normalizedScore = Math.round(Math.min((ratio / 3) * 100, 100));

  return {
    status: meets ? 'pass' : 'fail',
    score: normalizedScore,
    userValue: `${userStorage} GB free`,
    requiredMinValue: `${reqStorage} GB`,
    requiredRecValue: `${reqStorage} GB`,
    meetsMinimum: meets,
    meetsRecommended: meets,
  };
}

function scoreOS(profile: HardwareProfile, item: CompatibilityItem): ComponentScore {
  const userOS = profile.operatingSystem.toLowerCase();
  const reqOS = item.minimumRequirements.operatingSystem.toLowerCase();

  const family = (value: string) => /windows/.test(value) ? 'windows' : /macos|mac os/.test(value) ? 'macos' : /android/.test(value) ? 'android' : /ios/.test(value) ? 'ios' : /linux/.test(value) ? 'linux' : null;
  const userFamily = family(userOS);
  const requiredFamily = family(reqOS);
  let osStatus: ComponentStatus = 'unknown';
  if (userFamily && requiredFamily) {
    if (!reqOS.includes(userFamily)) osStatus = 'fail';
    else if (userFamily === 'windows') {
      const requiredVersion = reqOS.match(/windows\s*(\d+)/)?.[1];
      const userVersion = userOS.match(/windows\s*(\d+)/)?.[1];
      if (requiredVersion && userVersion) {
        osStatus = userOS.includes('10/11') && Number(requiredVersion) > 10 ? 'unknown' : Number(userVersion) >= Number(requiredVersion) ? 'pass' : 'fail';
      }
      if (osStatus === 'pass' && reqOS.includes('64') && !userOS.includes('64')) osStatus = 'unknown';
    } else {
      osStatus = /\d/.test(reqOS) ? 'unknown' : 'pass';
    }
  }
  const compatible = osStatus === 'pass';

  return {
    status: osStatus,
    score: osStatus === 'unknown' ? 50 : compatible ? 100 : 0,
    userValue: profile.operatingSystem,
    requiredMinValue: item.minimumRequirements.operatingSystem,
    requiredRecValue: item.recommendedRequirements.operatingSystem,
    meetsMinimum: compatible,
    meetsRecommended: compatible,
  };
}

// ─── Performance Estimates ─────────────────────────────────────────────────────

function generatePerformanceEstimates(
  gpuScore: number | null,
  item: CompatibilityItem
): PerformanceEstimate[] {
  if (gpuScore == null || item.type !== 'game') return [];

  // We only estimate if GPU score is reasonably certain
  // FPS estimates are based on GPU tier ratios relative to recommended GPU
  const recGpu = matchGPURequirement(item.recommendedRequirements.gpu);
  if (!recGpu) return [];

  const ratio = gpuScore / recGpu.performanceScore; // 1.0 = exactly recommended

  type Preset = { preset: string; gpuMultiplier: number };
  const presets: Preset[] = [
    { preset: 'Low', gpuMultiplier: 1.8 },
    { preset: 'Medium', gpuMultiplier: 1.2 },
    { preset: 'High', gpuMultiplier: 1.0 },
    { preset: 'Ultra', gpuMultiplier: 0.6 },
  ];

  const baselineFps = 60; // Target FPS at recommended GPU on High

  return ['1080p', '1440p', '4K'].flatMap<PerformanceEstimate>((resolution) => {
    const resMultiplier = resolution === '1080p' ? 1 : resolution === '1440p' ? 0.65 : 0.38;

    return presets.map<PerformanceEstimate>((p) => {
      const estimated = ratio * baselineFps * p.gpuMultiplier * resMultiplier;
      const fpsMin = Math.max(5, Math.round(estimated * 0.85));
      const fpsMax = Math.max(fpsMin, Math.round(estimated * 1.15));

      const confidence: ConfidenceLevel =
        ratio >= 0.5 && ratio <= 2.5 ? 'medium' : 'low';

      return { resolution, preset: p.preset, fpsMin, fpsMax, confidence };
    });
  });
}

// ─── Bottleneck Detection ─────────────────────────────────────────────────────

function detectBottleneck(
  components: { label: string; score: ComponentScore; weight: number }[]
): { bottleneck: string | null; reason: string | null } {
  // Find the component that is both failing/warning AND most impactful
  const failing = components
    .filter((c) => c.score.status === 'fail' || c.score.status === 'warn')
    .sort((a, b) => b.weight - a.weight);

  if (failing.length === 0) {
    // All pass — check if any has notably lower score
    const lowestByWeight = components
      .filter((c) => c.score.status === 'pass')
      .sort((a, b) => a.score.score - b.score.score)[0];

    if (lowestByWeight && lowestByWeight.score.score < 70) {
      return {
        bottleneck: lowestByWeight.label,
        reason: `Your ${lowestByWeight.label} meets requirements but may limit maximum performance.`,
      };
    }
    return { bottleneck: null, reason: null };
  }

  const primary = failing[0];
  const reasons: Record<string, string> = {
    GPU: 'Your GPU is likely to limit frame rates and graphics quality.',
    CPU: 'Your CPU may cause performance drops in complex scenes and AI-heavy workloads.',
    VRAM: 'Insufficient VRAM may cause texture pop-in or reduced graphics quality.',
    RAM: 'Limited RAM may cause hitching, longer load times, or reduced background multitasking.',
    Storage: 'Insufficient free storage space. You need to free up space before installation.',
    OS: 'Your operating system may not be compatible with this application.',
  };

  return {
    bottleneck: primary.label,
    reason: reasons[primary.label] ?? `Your ${primary.label} does not meet the requirements.`,
  };
}

// ─── Explanation Generator ────────────────────────────────────────────────────

function generateExplanations(
  gpu: ComponentScore,
  cpu: ComponentScore,
  vram: ComponentScore,
  ram: ComponentScore,
  storage: ComponentScore,
  os: ComponentScore
): string[] {
  const lines: string[] = [];
  const fmt = (label: string, score: ComponentScore): string => {
    if (score.status === 'pass') return `✓ ${label} meets the recommended requirement`;
    if (score.status === 'warn') return `⚠ ${label} meets minimum but is below recommended`;
    if (score.status === 'fail') return `✕ ${label} does not meet the minimum requirement`;
    return `? ${label} could not be determined`;
  };
  lines.push(fmt('GPU', gpu));
  lines.push(fmt('CPU', cpu));
  if (vram.status !== 'pass' || vram.userValue !== 'Unknown VRAM') {
    lines.push(fmt('VRAM', vram));
  }
  lines.push(fmt('RAM', ram));
  lines.push(fmt('Storage', storage));
  lines.push(fmt('Operating System', os));
  return lines;
}

// ─── Overall Score & Status ───────────────────────────────────────────────────

function computeOverallScore(
  components: { score: ComponentScore; weight: number }[]
): { score: number; status: CompatibilityStatus; confidence: ConfidenceLevel } {
  const unknownCount = components.filter((c) => c.score.status === 'unknown').length;
  const failCount = components.filter((c) => c.score.status === 'fail').length;

  // Weighted average of component scores
  const totalWeight = components.reduce((s, c) => s + c.weight, 0);
  const weighted = components.reduce((s, c) => s + c.score.score * c.weight, 0);
  const overallScore = Math.round(weighted / totalWeight);

  let status: CompatibilityStatus;
  if (failCount > 0) {
    status = 'cannot_run';
  } else if (unknownCount > 0) {
    status = 'insufficient_data';
  } else {
    const warnCount = components.filter((c) => c.score.status === 'warn').length;
    status = warnCount === 0 ? 'can_run' : 'may_run';
  }

  const confidence: ConfidenceLevel =
    unknownCount === 0 ? 'high' : unknownCount <= 2 ? 'medium' : 'low';

  return { score: overallScore, status, confidence };
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

/**
 * Calculate full compatibility between a hardware profile and a compatibility item.
 * This is the central compatibility engine — pure and deterministic.
 */
export function calculateCompatibility(
  profile: HardwareProfile,
  item: CompatibilityItem
): CompatibilityResult {
  const weights = getCategoryWeights(item);

  const gpuScore = scoreGPU(profile, item);
  const cpuScore = scoreCPU(profile, item);
  const vramScore = scoreVRAM(profile, item);
  const ramScore = scoreRAM(profile, item);
  const storageScore = scoreStorage(profile, item);
  const osScore = scoreOS(profile, item);

  const components = [
    { label: 'GPU', score: gpuScore, weight: weights.gpu },
    { label: 'CPU', score: cpuScore, weight: weights.cpu },
    { label: 'VRAM', score: vramScore, weight: weights.vram },
    { label: 'RAM', score: ramScore, weight: weights.ram },
    { label: 'Storage', score: storageScore, weight: weights.storage },
    { label: 'OS', score: osScore, weight: weights.os },
  ];

  const { score, status, confidence } = computeOverallScore(components);
  const { bottleneck, reason } = detectBottleneck(components);
  const explanations = generateExplanations(gpuScore, cpuScore, vramScore, ramScore, storageScore, osScore);
  const performanceEstimates = status === 'can_run' || status === 'may_run' ? generatePerformanceEstimates(profile.gpu.performanceScore, item) : [];

  return {
    status,
    overallScore: score,
    confidence,
    cpu: cpuScore,
    gpu: gpuScore,
    vram: vramScore,
    ram: ramScore,
    storage: storageScore,
    os: osScore,
    bottleneck,
    bottleneckReason: reason,
    performanceEstimates,
    explanations,
    item,
    profile,
  };
}
