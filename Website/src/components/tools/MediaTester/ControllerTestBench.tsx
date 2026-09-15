import { Gamepad2, Disc } from 'lucide-react';
import type { useMediaDiagnostics } from './useMediaDiagnostics';

export function ControllerTestBench({ diagnostics, tool }: { diagnostics: ReturnType<typeof useMediaDiagnostics>; tool: { slug: string } }) {
  const { gamepads, activeGamepadButtons, gamepadAxes } = diagnostics;
  return (
<div className="w-full max-w-lg space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  {tool.slug === 'steering-wheel-tester' ? <Disc className="w-8 h-8" /> : <Gamepad2 className="w-8 h-8" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {gamepads.length > 0 ? `${gamepads[0].id}` : 'No Controller Connected'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {gamepads.length > 0
                      ? 'Move analog sticks, press buttons, or turn wheel to test response in real time.'
                      : 'Connect your USB or Bluetooth gamepad/racing wheel and press any button to engage.'}
                  </p>
                </div>

                {gamepads.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#080D1A] border border-slate-800 space-y-3 text-left text-xs">
                    <div className="font-bold text-slate-300">Active Buttons:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeGamepadButtons.length > 0 ? (
                        activeGamepadButtons.map((b) => (
                          <span key={b} className="px-2.5 py-1 rounded-lg bg-emerald-500 text-black font-bold text-[10px]">
                            B{b}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 italic">None pressed</span>
                      )}
                    </div>

                    {gamepadAxes.length > 0 && (
                      <div className="pt-2 border-t border-slate-800 space-y-1.5">
                        <div className="font-bold text-slate-300">Analog Axes:</div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                          {gamepadAxes.map((axis, i) => (
                            <div key={i} className="flex justify-between bg-slate-900 px-2 py-1 rounded">
                              <span className="text-slate-400">Axis {i}:</span>
                              <span className={Math.abs(axis) > 0.1 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                                {axis.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
  );
}
