import { useCallback, useEffect, useRef, useState } from 'react';
import type { BenchmarkMessage, BenchmarkRequest, BenchmarkSample } from '../workers/benchmarkProtocol';

export function useWorkerBenchmark() {
  const [status, setStatus] = useState<'idle' | 'running' | 'complete' | 'cancelled' | 'error'>('idle');
  const [samples, setSamples] = useState<(BenchmarkSample | null)[]>([]);
  const [error, setError] = useState('');
  const workers = useRef<Worker[]>([]);
  const generation = useRef(0);
  const cleanup = useCallback(() => {
    generation.current++;
    workers.current.forEach((worker) => { worker.onmessage = null; worker.onerror = null; worker.terminate(); });
    workers.current = [];
  }, []);
  const stop = useCallback(() => { cleanup(); setStatus('cancelled'); }, [cleanup]);
  useEffect(() => {
    const hidden = () => { if (document.hidden && workers.current.length) stop(); };
    document.addEventListener('visibilitychange', hidden);
    return () => { document.removeEventListener('visibilitychange', hidden); cleanup(); };
  }, [cleanup, stop]);
  const start = useCallback((requests: BenchmarkRequest[]) => {
    cleanup();
    setSamples(requests.map(() => null));
    setError('');
    setStatus('running');
    const run = generation.current;
    const done = new Set<number>();
    const fail = (message: string) => {
      if (run !== generation.current) return;
      cleanup(); setError(message); setStatus('error');
    };
    try {
      if (!requests.length || requests.length > 32) throw new Error('Choose between 1 and 32 workers.');
      requests.forEach((request, index) => {
        const worker = new Worker(new URL('../workers/benchmark.worker.ts', import.meta.url), { type: 'module' });
        workers.current.push(worker);
        worker.onerror = (event) => { event.preventDefault(); fail(event.message || 'The benchmark worker could not run.'); };
        worker.onmessage = ({ data }: MessageEvent<BenchmarkMessage>) => {
          if (run !== generation.current) return;
          if (data.type === 'error') { fail(data.message); return; }
          setSamples((previous) => previous.map((sample, i) => i === index ? data.sample : sample));
          if (data.type === 'done') {
            done.add(index);
            worker.terminate();
            if (done.size === requests.length) { cleanup(); setStatus('complete'); }
          }
        };
        worker.postMessage(request);
      });
    } catch (cause) { fail(cause instanceof Error ? cause.message : 'Web Workers are unavailable.'); }
  }, [cleanup]);
  return { status, samples, error, start, stop };
}
