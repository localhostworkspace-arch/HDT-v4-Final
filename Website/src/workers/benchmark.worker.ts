import { clampMemory, memoryPattern, throughput } from './benchmarkProtocol';
import type { BenchmarkRequest, BenchmarkSample, BenchmarkMessage } from './benchmarkProtocol';

const send = (message: BenchmarkMessage) => self.postMessage(message);
const yieldTask = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

async function run(request: BenchmarkRequest) {
  const start = performance.now();
  const sample: BenchmarkSample = { phase: 'Preparing', progress: 0, elapsed: 0, operations: 0, checksum: 1 };
  const report = (done = false) => {
    sample.elapsed = (performance.now() - start) / 1000;
    send({ type: done ? 'done' : 'progress', sample });
  };
  if (request.kind === 'cpu') {
    const duration = Math.min(60, Math.max(5, request.duration || 15));
    sample.phase = request.mode === 'float' ? 'Floating-point iterations' : 'Integer mixing iterations';
    do {
      const batchStart = performance.now();
      do {
        for (let i = 0; i < 10000; i++) {
          sample.checksum = request.mode === 'float'
            ? Math.sin(sample.checksum + i) + Math.sqrt(i + 1)
            : Math.imul(sample.checksum ^ i, 1664525) + 1013904223 | 0;
        }
        sample.operations += 10000;
      } while (performance.now() - batchStart < 80);
      sample.progress = Math.min(100, (performance.now() - start) / (duration * 10));
      report();
      await yieldTask();
    } while (performance.now() - start < duration * 1000);
  } else {
    const bytes = clampMemory(request.megabytes) * 1024 * 1024;
    const buffer = new Uint32Array(bytes / 4);
    const passes = Math.min(4, Math.max(1, Math.floor(request.passes) || 1));
    const chunk = 262144;
    let writeMs = 0;
    let readMs = 0;
    sample.errors = 0;
    sample.verifiedBytes = 0;
    let lastReport = 0;
    for (let pass = 0; pass < passes; pass++) {
      for (const phase of ['write', 'read', 'verify'] as const) {
        sample.phase = `Pass ${pass + 1}/${passes} · ${phase}`;
        for (let offset = 0; offset < buffer.length; offset += chunk) {
          const end = Math.min(offset + chunk, buffer.length);
          const begin = performance.now();
          if (phase === 'write') {
            for (let i = offset; i < end; i++) buffer[i] = memoryPattern(i, pass);
            writeMs += performance.now() - begin;
          } else if (phase === 'read') {
            let checksum = sample.checksum;
            for (let i = offset; i < end; i++) checksum = (checksum + buffer[i]) >>> 0;
            sample.checksum = checksum;
            readMs += performance.now() - begin;
          } else {
            for (let i = offset; i < end; i++) if (buffer[i] !== memoryPattern(i, pass)) sample.errors++;
            sample.verifiedBytes += (end - offset) * 4;
          }
          sample.operations += end - offset;
          sample.progress = 100 * sample.operations / (buffer.length * passes * 3);
          if (performance.now() - lastReport > 80) {
            report();
            lastReport = performance.now();
            await yieldTask();
          }
        }
      }
    }
    sample.writeGBs = throughput(bytes * passes, writeMs);
    sample.readGBs = throughput(bytes * passes, readMs);
  }
  sample.progress = 100;
  sample.phase = 'Complete';
  report(true);
}

self.onmessage = (event: MessageEvent<BenchmarkRequest>) => {
  void run(event.data).catch((error: unknown) => send({ type: 'error', message: error instanceof Error ? error.message : 'Benchmark failed.' }));
};
