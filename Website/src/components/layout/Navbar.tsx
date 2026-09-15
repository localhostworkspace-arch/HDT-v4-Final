import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Activity, ArrowUpRight, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { CommandPalette } from './CommandPalette';
export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(open => !open); }
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, []);
  return <><header className="lab-header"><div className="lab-nav">
    <Link className="lab-brand" to="/" aria-label="HardwareTest home"><span className="brand-mark"><Activity size={23} strokeWidth={1.6} /></span><span>Hardware<span className="brand-light">Test</span><small>THE BROWSER DIAGNOSTIC LAB</small></span></Link>
    <nav className={`nav-links ${menuOpen ? 'is-open' : ''}`} id="primary-navigation" aria-label="Main navigation"><NavLink to="/" end>Overview</NavLink><NavLink to="/#instruments">Instruments</NavLink><NavLink to="/can-i-run-it">Can I run it? <ArrowUpRight size={13} /></NavLink><NavLink to="/about">About the lab</NavLink></nav>
    <div className="nav-actions"><button className="search-trigger" onClick={() => setSearchOpen(true)} aria-label="Search diagnostic tools"><Search size={17} /><kbd>Ctrl K</kbd></button><button className="icon-button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button><button className="icon-button mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-controls="primary-navigation" aria-expanded={menuOpen} aria-label="Toggle navigation">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
  </div></header><CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} /></>;
}
