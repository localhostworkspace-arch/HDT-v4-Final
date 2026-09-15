import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Keyboard, 
  Mouse, 
  Monitor, 
  Gauge, 
  Star, 
  Volume2, 
  Gamepad2, 
  Disc,
  Crosshair,
  Headset,
  Clock, 
  Settings, 
  ShieldCheck,
  X
} from 'lucide-react';
import { AdSenseSlot } from '../ads/AdSenseSlot';
import { ADSENSE_CONFIG } from '../../config/adsense';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  mobileOpen = false, 
  onCloseMobile, 
  onOpenHistory, 
  onOpenSettings 
}) => {
  const location = useLocation();

  const primaryNavItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Keyboard Test', path: '/keyboard-tester', icon: Keyboard },
    { name: 'Mouse Test', path: '/mouse-tester', icon: Mouse },
    { name: 'On-Screen Test', path: '/screen-test', icon: Monitor },
    { name: 'Speed Test', path: '/internet-speed-test', icon: Gauge },
    { name: 'Rate My PC', path: '/can-i-run-it', icon: Star },
    { name: 'Online Sound Test', path: '/sound-test', icon: Volume2 },
    { name: 'Game Test', path: '/gamepad-tester', icon: Gamepad2 },
    { name: 'Wheel Test', path: '/steering-wheel-tester', icon: Disc },
    { name: 'Flight Stick Test', path: '/flight-stick-tester', icon: Crosshair },
    { name: 'VR Controller Test', path: '/vr-controller-tester', icon: Headset },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out
        lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Top Branding Section */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          <div className="flex items-center justify-between px-2">
            <Link 
              to="/" 
              onClick={onCloseMobile} 
              className="flex items-center gap-3 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
                <Monitor className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                  HDT
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-1 leading-none">
                  Hardware Diagnostic Tool
                </span>
              </div>
            </Link>
            {onCloseMobile && (
              <button 
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Main Navigation */}
          <nav className="space-y-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '');
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={`
                    flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Secondary Navigation */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
            <button
              onClick={() => {
                onCloseMobile?.();
                onOpenHistory();
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-left cursor-pointer"
            >
              <Clock className="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500" />
              <span>History</span>
            </button>
            <button
              onClick={() => {
                onCloseMobile?.();
                onOpenSettings();
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-left cursor-pointer"
            >
              <Settings className="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500" />
              <span>Settings</span>
            </button>
          </div>

          {/* Google AdSense Placement - Sidebar Unit */}
          <div className="pt-2 px-1">
            <AdSenseSlot 
              slotId={ADSENSE_CONFIG.slots.sidebarRectangle} 
              format="sidebar" 
              showLabel={false}
              className="my-1" 
            />
          </div>
        </div>

        {/* Bottom Promotional Card */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100/80 dark:border-blue-900/40">
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                  Test Your System Right in Your Browser
                </h4>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                  Fast · Easy · Free
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
