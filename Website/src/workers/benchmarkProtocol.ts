export type BenchmarkRequest =
  | { kind: 'cpu'; duration: number; mode: 'integer' | 'float' }
  | { kind: 'ram'; megabytes: number; passes: number };

export interface BenchmarkSample {
  phase: string;
  progress: number;
  elapsed: number;
  operations: number;
  checksum: number;
  writeGBs?: number;
  readGBs?: number;
  verifiedBytes?: number;
  errors?: number;
}
export type BenchmarkMessage =
  | { type: 'progress' | 'done'; sample: BenchmarkSample }
  | { type: 'error'; message: string };

export function clampMemory(megabytes: number) {
  return Math.min(128, Math.max(16, Number.isFinite(megabytes) ? Math.floor(megabytes) : 16));
}

export function memoryPattern(index: number, pass: number): number {
  return (Math.imul(index + 1, 2654435761) ^ (pass % 2 ? 0x55555555 : 0xaaaaaaaa)) >>> 0;
}

export function throughput(bytes: number, milliseconds: number): number {
  return milliseconds > 0 ? bytes / (milliseconds * 1e6) : 0;
}
