export type ToolCategory = 
  | 'all'
  | 'input'
  | 'audio-video'
  | 'performance'
  | 'display'
  | 'network';

export interface ToolItem {
  id: string;
  name: string;
  slug: string;
  path: string;
  category: ToolCategory;
  categoryLabel: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  badge?: string;
  tags: string[];
  features: string[];
  specs: { label: string; value: string }[];
  isPopular?: boolean;
  isAvailable?: boolean;
  status: 'Ready' | 'Beta' | 'New' | 'Not Available';
  metaTitle: string;
  metaDescription: string;
}

export interface SystemDiagnostic {
  browser: string;
  os: string;
  screenResolution: string;
  devicePixelRatio: number;
  colorDepth: number;
  cpuCores: number | string;
  deviceMemory: string;
  gpuRenderer: string;
  gpuVendor: string;
  webGlVersion: string;
  touchSupport: boolean;
  gamepadApi: boolean;
  audioApi: boolean;
  webRtc: boolean;
  connectionType: string;
  downlink: string;
}

export interface FeatureCardItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  highlight: string;
  gradient: string;
}

// ─── Can I Run It — Types ─────────────────────────────────────────────────────

export type CompatibilityStatus = 'can_run' | 'may_run' | 'cannot_run' | 'insufficient_data';
export type ComponentStatus = 'pass' | 'warn' | 'fail' | 'unknown';
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unknown';

export interface HardwareCPU {
  name: string;
  vendor: string;
  cores: number;
  performanceScore: number | null; // 0–100, null if unknown
  detectionConfidence: ConfidenceLevel;
}

export interface HardwareGPU {
  name: string;
  vendor: string;
  vramGB: number | null; // null = unknown (browser cannot detect)
  performanceScore: number | null; // 0–100, null if unknown
  detectionConfidence: ConfidenceLevel;
}

export interface HardwareProfile {
  cpu: HardwareCPU;
  gpu: HardwareGPU;
  ramGB: number | null;
  storageAvailableGB: number | null;
  operatingSystem: string;
  displayWidth: number;
  displayHeight: number;
  isManual: boolean; // true if user entered data manually
}

export interface SystemRequirements {
  cpu: string;
  gpu: string;
  ramGB: number;
  vramGB: number | null;
  storageGB: number;
  operatingSystem: string;
  directX?: string;
  additionalNotes?: string;
}

export interface RequirementsMetadata {
  source: string;
  sourceUrl?: string;
  lastVerified?: string;
  confidence: ConfidenceLevel;
}

export interface CompatibilityItem {
  id: string;
  name: string;
  slug: string;
  type: 'game' | 'software';
  developer: string;
  publisher?: string;
  category: string;
  releaseYear?: number;
  icon: string; // emoji
  coverColor: string; // tailwind gradient string
  minimumRequirements: SystemRequirements;
  recommendedRequirements: SystemRequirements;
  tags: string[];
  requirementsMetadata: RequirementsMetadata;
}

export interface ComponentScore {
  status: ComponentStatus;
  score: number; // 0–100
  userValue: string;
  requiredMinValue: string;
  requiredRecValue: string;
  meetsMinimum: boolean;
  meetsRecommended: boolean;
}

export interface PerformanceEstimate {
  resolution: string;
  preset: string;
  fpsMin: number;
  fpsMax: number;
  confidence: ConfidenceLevel;
}

export interface CompatibilityResult {
  status: CompatibilityStatus;
  overallScore: number; // 0–100
  confidence: ConfidenceLevel;
  cpu: ComponentScore;
  gpu: ComponentScore;
  vram: ComponentScore;
  ram: ComponentScore;
  storage: ComponentScore;
  os: ComponentScore;
  bottleneck: string | null; // component name or null
  bottleneckReason: string | null;
  performanceEstimates: PerformanceEstimate[];
  explanations: string[]; // human-readable bullet points
  item: CompatibilityItem;
  profile: HardwareProfile;
}

// GPU benchmark record
export interface GPUBenchmark {
  name: string;
  aliases: string[]; // alternate renderer strings
  vendor: 'nvidia' | 'amd' | 'intel' | 'apple' | 'other';
  performanceScore: number; // 0–100
  vramGB: number;
  tier: 'entry' | 'mid' | 'high' | 'ultra';
}

// CPU benchmark record
export interface CPUBenchmark {
  name: string;
  aliases: string[];
  vendor: 'intel' | 'amd' | 'apple' | 'other';
  performanceScore: number; // 0–100
  cores: number;
  tier: 'entry' | 'mid' | 'high' | 'ultra';
}
