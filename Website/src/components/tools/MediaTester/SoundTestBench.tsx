import { Play, Square, Volume2, Music, Clock, Sparkles } from 'lucide-react';
import type { useMediaDiagnostics } from './useMediaDiagnostics';

export function SoundTestBench({ diagnostics }: { diagnostics: ReturnType<typeof useMediaDiagnostics> }) {
  const { visualizerCanvasRef, isPlayingBeat, beatDuration, setBeatDuration, beatTimeLeft, activeSpeakerChannel, soundFrequency, setSoundFrequency, stopHeavyDrumTest, startHeavyDrumTest, playSineTone, playStereoPing, playSpatial3DSweep } = diagnostics;
  return (
<div className="w-full max-w-3xl space-y-6">
                
                {/* HEAVY DRUM & BASS SPEAKER TEST CARD */}
                <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-b from-[#0F172A] to-[#0A0E1A] border border-indigo-500/30 shadow-2xl relative overflow-hidden text-left">
                  
                  {/* Header bar with Timer Duration Selector Pills */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
                        <Music className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                          Heavy Bass & Drum Speaker Test
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            High Power Audio
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400">
                          Rhythmic sub-kick, snappy snare & sub-bass synth to test laptop/desktop speaker clarity & punch.
                        </p>
                      </div>
                    </div>

                    {/* Timer Duration Selector Pills */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#070B14] p-1 rounded-xl border border-slate-800">
                      {[30, 40, 60].map((dur) => (
                        <button
                          key={dur}
                          onClick={() => {
                            setBeatDuration(dur);
                            if (isPlayingBeat) startHeavyDrumTest(dur);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            beatDuration === dur
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {dur}s
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* VISUALIZER & DUAL SPEAKER ANIMATION */}
                  <div className="my-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    {/* Left Speaker Node */}
                    <div className="md:col-span-3 flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#070B14]/80 border border-slate-800/80">
                      <div className="relative">
                        {(isPlayingBeat || activeSpeakerChannel === 'left' || activeSpeakerChannel === 'both') && (
                          <div className="absolute inset-0 rounded-full bg-rose-500/30 animate-ping" />
                        )}
                        <div className={`w-13 h-13 rounded-full flex items-center justify-center text-white transition-all ${
                          isPlayingBeat || activeSpeakerChannel === 'left' || activeSpeakerChannel === 'both'
                            ? 'bg-gradient-to-tr from-rose-600 to-indigo-600 shadow-[0_0_20px_rgba(244,63,94,0.6)] scale-105'
                            : 'bg-slate-800 text-slate-500'
                        }`}>
                          <Volume2 className="w-6 h-6" />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-300 mt-2">Left Speaker (L)</span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {isPlayingBeat || activeSpeakerChannel === 'left' || activeSpeakerChannel === 'both' ? 'ACTIVE (PUNCH)' : 'Standby'}
                      </span>
                    </div>

                    {/* Middle: Canvas Real-time Equalizer Spectrum */}
                    <div className="md:col-span-6 flex flex-col items-center justify-center bg-[#070B14] p-3 rounded-2xl border border-slate-800/80">
                      <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5 px-1">
                        <span className="text-rose-400 font-mono">Sub-Bass (40Hz)</span>
                        <span className="text-indigo-400 font-mono">Mid-Punch</span>
                        <span className="text-emerald-400 font-mono">Treble (12kHz)</span>
                      </div>
                      <canvas
                        ref={visualizerCanvasRef}
                        width={300}
                        height={85}
                        className="w-full h-[85px] rounded-lg bg-[#040711]"
                      />
                    </div>

                    {/* Right Speaker Node */}
                    <div className="md:col-span-3 flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#070B14]/80 border border-slate-800/80">
                      <div className="relative">
                        {(isPlayingBeat || activeSpeakerChannel === 'right' || activeSpeakerChannel === 'both') && (
                          <div className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping" />
                        )}
                        <div className={`w-13 h-13 rounded-full flex items-center justify-center text-white transition-all ${
                          isPlayingBeat || activeSpeakerChannel === 'right' || activeSpeakerChannel === 'both'
                            ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-[0_0_20px_rgba(99,102,241,0.6)] scale-105'
                            : 'bg-slate-800 text-slate-500'
                        }`}>
                          <Volume2 className="w-6 h-6" />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-300 mt-2">Right Speaker (R)</span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {isPlayingBeat || activeSpeakerChannel === 'right' || activeSpeakerChannel === 'both' ? 'ACTIVE (STEREO)' : 'Standby'}
                      </span>
                    </div>

                  </div>

                  {/* BOTTOM ACTION: Play/Stop Button + Live Countdown Display */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
                    <div className="flex items-center gap-3">
                      {isPlayingBeat ? (
                        <button
                          onClick={stopHeavyDrumTest}
                          className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-2.5 transition-all shadow-lg shadow-rose-600/30 cursor-pointer animate-pulse"
                        >
                          <Square className="w-4 h-4 fill-current" />
                          <span>Stop Heavy Beat Test</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => startHeavyDrumTest(beatDuration)}
                          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-indigo-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-black text-sm flex items-center gap-2.5 transition-all shadow-xl shadow-indigo-600/30 cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Play Heavy Beat Track ({beatDuration}s)</span>
                        </button>
                      )}
                    </div>

                    {/* Digital Countdown Timer */}
                    <div className="flex items-center gap-3 bg-[#070B14] px-4 py-2 rounded-2xl border border-slate-800">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-slate-400">Duration Remaining:</span>
                      <span className="text-base font-black font-mono text-white">
                        00:{beatTimeLeft < 10 ? `0${beatTimeLeft}` : beatTimeLeft}
                        <span className="text-slate-500 text-xs font-normal"> / 00:{beatDuration}s</span>
                      </span>
                    </div>
                  </div>

                </div>

                {/* 2. STEREO CHANNEL & 3D BINAURAL SPATIAL PAN */}
                <div className="p-5 rounded-2xl bg-[#080D1A] border border-slate-800 space-y-3 text-left">
                  <div className="text-xs font-bold text-slate-300">Stereo Channel Separation & 3D Spatial Position:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => playStereoPing(-1)}
                      className="px-4 py-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      <Volume2 className="w-4 h-4 text-indigo-400" />
                      <span>Left Speaker Only (◀ L)</span>
                    </button>
                    <button
                      onClick={playSpatial3DSweep}
                      className="px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600 hover:to-purple-600 border border-indigo-500/40 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>3D 360° Spatial Sweep</span>
                    </button>
                    <button
                      onClick={() => playStereoPing(1)}
                      className="px-4 py-3 rounded-xl bg-purple-600/20 hover:bg-purple-600 border border-purple-500/40 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      <Volume2 className="w-4 h-4 text-purple-400" />
                      <span>Right Speaker Only (R ▶)</span>
                    </button>
                  </div>
                </div>

                {/* 3. CONTINUOUS TONE GENERATOR (20Hz - 20,000Hz) */}
                <div className="p-5 rounded-2xl bg-[#080D1A] border border-slate-800 space-y-3 text-left">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300">Continuous Frequency Generator:</span>
                    <span className="text-indigo-400 font-mono text-sm">{soundFrequency} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="20000"
                    step="10"
                    value={soundFrequency}
                    onChange={(e) => {
                      const f = Number(e.target.value);
                      setSoundFrequency(f);
                      playSineTone(f);
                    }}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>20 Hz (Sub Bass)</span>
                    <span>500 Hz (Mids)</span>
                    <span>4,000 Hz (Presence)</span>
                    <span>20,000 Hz (Treble)</span>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                    {[
                      { label: 'Sub Bass (40Hz)', val: 40 },
                      { label: 'Punch (120Hz)', val: 120 },
                      { label: 'Vocal Mid (1kHz)', val: 1000 },
                      { label: 'Highs (10kHz)', val: 10000 },
                      { label: 'Ultra High (16kHz)', val: 16000 },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        onClick={() => {
                          setSoundFrequency(preset.val);
                          playSineTone(preset.val);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
  );
}
