import { Activity, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
export function Footer() {
  return <footer className="lab-footer"><div className="footer-top"><Link to="/" className="lab-brand"><Activity size={24} /> HardwareTest</Link><p>Know your hardware.<br />Understand its limits.</p><Link to="/" className="text-link">Open the instruments <ArrowUpRight size={18} /></Link></div><div className="footer-bottom"><span>© {new Date().getFullYear()} HardwareTest</span><nav aria-label="Footer navigation"><Link to="/blog">Field notes</Link><Link to="/contact">Contact</Link><Link to="/privacy-policy">Privacy</Link><Link to="/terms-of-service">Terms</Link></nav><span className="lab-eyebrow">BUILT FOR YOUR BROWSER</span></div></footer>;
}
