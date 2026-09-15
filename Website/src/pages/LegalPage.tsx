import React from 'react';
import { SeoHead } from '../components/seo/SeoHead';
import { ShieldCheck, Lock } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const LegalPage: React.FC = () => {
  const location = useLocation();
  const isPrivacy = location.pathname.includes('privacy');

  return (
    <div className="min-h-screen pt-12 pb-24 text-slate-100">
      <SeoHead
        title={isPrivacy ? 'Privacy Policy | HardwareTest' : 'Terms of Service | HardwareTest'}
        description="Review the privacy and usage policies of the HardwareTest browser-based diagnostics platform."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            {isPrivacy ? <Lock className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>

          <h1 className="text-3xl font-black text-white">
            {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
          </h1>

          <p className="text-sm text-slate-400">
            Last updated: September 2026
          </p>

          <div className="space-y-4 text-sm text-slate-300 leading-relaxed pt-4 border-t border-slate-800">
            <h2 className="text-base font-bold text-white">1. Client-Side Sandboxing</h2>
            <p>
              HardwareTest operates strictly within your local web browser sandbox. No input signals, audio streams, camera video captures, or hardware serial identifiers are ever sent to or stored on external servers.
            </p>

            <h2 className="text-base font-bold text-white">2. Permitted Browser APIs</h2>
            <p>
              Our diagnostic suites utilize standard HTML5 and Web APIs (WebHID, Web Audio, WebGL, WebRTC, Gamepad API) only after receiving explicit user interaction or browser permissions.
            </p>

            <h2 className="text-base font-bold text-white">3. Disclaimer of Warranty</h2>
            <p>
              HardwareTest tools are provided for diagnostic and informational purposes. Hardware measurements reflect browser runtime performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
