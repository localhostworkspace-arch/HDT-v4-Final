import { useEffect, useState } from 'react';
import { Cpu, Layers, Monitor, RefreshCw } from 'lucide-react';
type Snapshot = { threads: string; memory: string; display: string; ratio: string };
function readSnapshot(): Snapshot {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return { threads: navigator.hardwareConcurrency ? String(navigator.hardwareConcurrency) : 'Unknown', memory: memory ? `≈ ${memory} GB` : 'Not exposed', display: `${screen.width} × ${screen.height}`, ratio: `${window.devicePixelRatio || 1}× pixel ratio` };
}
export function LiveSystemBar() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  useEffect(() => { setSnapshot(readSnapshot()); }, []);
  return <section className="system-strip" id="system-overview"><div className="lab-container system-inner"><div className="system-label"><span className="lab-eyebrow"><i className="status-dot" /> BROWSER SNAPSHOT</span><small>Reported by this browser</small></div><div className="system-reading"><Cpu size={19} /><div><strong>{snapshot?.threads ?? '—'}</strong><small>Logical processors</small></div></div><div className="system-reading"><Layers size={19} /><div><strong>{snapshot?.memory ?? '—'}</strong><small>Coarse memory estimate</small></div></div><div className="system-reading"><Monitor size={19} /><div><strong>{snapshot?.display ?? '—'}</strong><small>Screen CSS pixels · {snapshot?.ratio}</small></div></div><button className="icon-button" aria-label="Refresh browser snapshot" onClick={() => setSnapshot(readSnapshot())}><RefreshCw size={17} /></button></div></section>;
}
