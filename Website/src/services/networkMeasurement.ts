/** HTTP application throughput, including request overhead; never a link-speed guarantee. */
export function throughputMbps(bytes: number, milliseconds: number): number {
  if (bytes <= 0 || milliseconds <= 0) throw new Error('No measurable transfer completed.');
  return bytes * 8 / milliseconds / 1000;
}

export function latencySummary(samples: number[]) {
  if (samples.length < 2) throw new Error('Not enough successful latency requests.');
  return {
    avgPing: Math.round(samples.reduce((sum, value) => sum + value, 0) / samples.length),
    jitter: Number((samples.slice(1).reduce((sum, value, index) => sum + Math.abs(value - samples[index]), 0) / (samples.length - 1)).toFixed(1)),
  };
}

export async function measuredRequest(url: string, signal: AbortSignal, init: RequestInit = {}): Promise<Response> {
  signal.throwIfAborted();
  const response = await fetch(url, { ...init, cache: 'no-store', signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]) });
  signal.throwIfAborted();
  if (!response.ok) throw new Error(`Measurement server returned HTTP ${response.status}.`);
  return response;
}

export async function measureLatency(signal: AbortSignal, onSample: (ms: number) => void) {
  const samples: number[] = [];
  for (let i = 0; i < 6; i++) {
    const started = performance.now();
    const response = await measuredRequest(`https://speed.cloudflare.com/__down?bytes=0&t=${Date.now()}-${i}`, signal);
    await response.arrayBuffer();
    signal.throwIfAborted();
    samples.push(performance.now() - started);
    onSample(Math.round(samples[samples.length - 1]));
  }
  return latencySummary(samples);
}

export async function measureTransfer(direction: 'download' | 'upload', signal: AbortSignal, onSample: (mbps: number, progress: number, peak: number) => void) {
  const duration = 6000;
  const started = performance.now();
  let totalBytes = 0;
  let peak = 0;
  const payload = new Uint8Array(1024 * 1024);
  // Random payload avoids artificially favorable compression; Web Crypto limits each call to 64 KiB.
  if (direction === 'upload') for (let offset = 0; offset < payload.length; offset += 65536) crypto.getRandomValues(payload.subarray(offset, offset + 65536));
  do {
    signal.throwIfAborted();
    const requestStarted = performance.now();
    const response = await measuredRequest(direction === 'download'
      ? `https://speed.cloudflare.com/__down?bytes=1000000&t=${Date.now()}`
      : 'https://speed.cloudflare.com/__up', signal, direction === 'upload' ? { method: 'POST', body: payload } : {});
    const received = await response.arrayBuffer();
    signal.throwIfAborted();
    const bytes = direction === 'download' ? received.byteLength : payload.byteLength;
    totalBytes += bytes;
    const now = performance.now();
    peak = Math.max(peak, throughputMbps(bytes, now - requestStarted));
    onSample(throughputMbps(totalBytes, now - started), Math.min(100, (now - started) / duration * 100), peak);
  } while (performance.now() - started < duration);
  return { speed: throughputMbps(totalBytes, performance.now() - started), peak };
}
