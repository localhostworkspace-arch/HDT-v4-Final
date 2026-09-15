import { ArrowDown, ArrowUpRight, Star, Keyboard, Monitor, CircuitBoard, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SeoHead } from '../components/seo/SeoHead';
import { LiveSystemBar } from '../components/home/LiveSystemBar';
import { ToolsGridSection } from '../components/home/ToolsGridSection';
export function HomePage() {
  return <main className="lab-home">
    <SeoHead title="HardwareTest — Your browser. A hardware lab." description="Test your keyboard, mouse, controller, screen, audio and connection with focused browser diagnostics." />
    <section className="lab-hero lab-container">
      <div className="hero-meta"><span className="lab-eyebrow"><i className="status-dot" /> HARDWARE DIAGNOSTICS / IN YOUR BROWSER</span><span className="lab-eyebrow hero-meta-end">NO INSTALLATION REQUIRED</span></div>
      <h1>Your hardware.<br /><span>Understood.</span></h1>
      <div className="hero-bottom"><p>Turn questions into signals. A focused set of instruments to test your devices, measure performance, and find what needs attention.</p><div className="hero-actions"><a href="#instruments" className="lab-button">Explore the instruments <ArrowUpRight size={18} /></a><a href="#system-overview" className="text-link">Inside your browser <ArrowDown size={16} /></a></div></div>
      <div className="machine-stage" aria-label="Hardware diagnostic stations">
        <div className="machine-caption lab-eyebrow">SYSTEM MAP <span>SELECT A STATION TO BEGIN</span></div>
        <svg className="circuit-lines" viewBox="0 0 1100 210" preserveAspectRatio="none" aria-hidden="true"><path d="M80 105H350L410 55H550M1020 105H750L690 55H550M80 105H350L410 155H550M1020 105H750L690 155H550" /><path className="circuit-minor" d="M0 35H280L350 105M1100 175H820L750 105M0 175H220L290 105M1100 35H880L810 105" /><circle cx="350" cy="105" r="4" /><circle cx="750" cy="105" r="4" /></svg>
        <Link to="/keyboard-tester" className="station station-input"><Keyboard size={25} strokeWidth={1.3} /><span><small>01 / INPUT</small>Every press. Every signal.</span><ArrowUpRight size={16} /></Link>
        <Link to="/can-i-run-it" className="processor"><span className="processor-pins" /><Star size={36} strokeWidth={1} /><span>SPECS</span><small>CAN I RUN IT</small></Link>
        <Link to="/screen-test" className="station station-output"><Monitor size={25} strokeWidth={1.3} /><span><small>02 / OUTPUT</small>See the whole picture.</span><ArrowUpRight size={16} /></Link>
        <div className="stage-foot lab-eyebrow"><span>BROWSER-NATIVE INSTRUMENTS</span><span>INPUT → COMPUTE → OUTPUT</span></div>
      </div>
    </section>
    <LiveSystemBar />
    <ToolsGridSection compact />
    <section className="method-section lab-container"><div><span className="lab-eyebrow">THE METHOD</span><h2>Real signals.<br />Clear boundaries.</h2><ShieldCheck size={42} strokeWidth={1} /></div><div className="method-steps"><article><span>01</span><div><h3>Choose an instrument</h3><p>Start with the device you want to understand. Tests run only when you start them.</p></div></article><article><span>02</span><div><h3>Observe what happens</h3><p>Inspect browser events, rendered frames and completed workloads. Repeat a test under the same conditions to compare results.</p></div></article><article><span>03</span><div><h3>Know what a browser can tell you</h3><p>Browser readings are not native hardware sensor measurements. CPU temperature, exact memory capacity and free disk space require other tools.</p><Link to="/about" className="text-link">How the lab works <ArrowUpRight size={16} /></Link></div></article></div></section>
    <section className="compatibility-invite lab-container"><CircuitBoard size={42} strokeWidth={1} /><div><span className="lab-eyebrow">BEFORE YOU HIT PLAY</span><h2>Can your setup run it?</h2><p>Compare your hardware with game and software requirements.</p></div><Link to="/can-i-run-it" className="lab-button secondary">Check compatibility <ArrowUpRight size={18} /></Link></section>
  </main>;
}
