import { Camera } from 'lucide-react';
import type { useMediaDiagnostics } from './useMediaDiagnostics';

export function WebcamTestBench({ diagnostics }: { diagnostics: ReturnType<typeof useMediaDiagnostics> }) {
  const { testActive, videoRef } = diagnostics;
  return (
<div className="w-full max-w-xl space-y-4">
                <div className="aspect-video w-full rounded-2xl bg-[#080D1A] border border-slate-800 overflow-hidden relative flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${testActive ? 'block' : 'hidden'}`}
                  />
                  {!testActive && (
                    <div className="text-center p-6 space-y-2">
                      <Camera className="w-12 h-12 text-slate-600 mx-auto" />
                      <div className="text-sm font-bold text-slate-300">Camera Feed Inactive</div>
                      <div className="text-xs text-slate-500">Click Start Testing to preview optical sensor and resolution.</div>
                    </div>
                  )}
                </div>
              </div>
  );
}
