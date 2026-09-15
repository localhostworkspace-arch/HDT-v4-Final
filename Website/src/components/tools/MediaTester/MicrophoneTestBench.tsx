import { Play, Square, Mic, MicOff, Volume2, Repeat, Trash2, Disc } from 'lucide-react';
import type { useMediaDiagnostics } from './useMediaDiagnostics';

export function MicrophoneTestBench({ diagnostics }: { diagnostics: ReturnType<typeof useMediaDiagnostics> }) {
  const { testActive, micCanvasRef, isRecordingMic, recordingDuration, recordedAudioUrl, setRecordedAudioUrl, isPlayingRecordedAudio, isLoopingPlayback, setIsLoopingPlayback, playbackProgress, micPeakDb, micSampleRate, micVolume, stopRecordedAudioPlayback, stopMicRecording, startMicRecording, playRecordedAudio } = diagnostics;
  return (
<div className="w-full max-w-xl space-y-5">
                {/* Visualizer & Header Card */}
                <div className="p-5 rounded-2xl bg-[#080D1A] border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isRecordingMic 
                          ? 'bg-rose-500/20 text-rose-400 ring-2 ring-rose-500/50 animate-pulse' 
                          : testActive 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {testActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{testActive ? 'Microphone Stream Active' : 'Microphone Inactive'}</span>
                          {testActive && (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              LIVE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {testActive 
                            ? 'Speak into your mic to inspect frequency response and record voice samples.' 
                            : 'Click Start Testing above to enable microphone stream.'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-emerald-400">{micVolume}% Level</div>
                      <div className="text-[10px] font-mono text-slate-500">{micPeakDb} dBFS Peak</div>
                    </div>
                  </div>

                  {/* Real-time Spectrum Visualizer Canvas */}
                  <div className="h-28 w-full bg-[#050811] rounded-xl border border-slate-800/80 p-2 flex items-center justify-center relative overflow-hidden shadow-inner">
                    {testActive ? (
                      <canvas 
                        ref={micCanvasRef} 
                        width={460} 
                        height={100} 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center space-y-1">
                        <Mic className="w-6 h-6 text-slate-700 mx-auto" />
                        <div className="text-xs text-slate-500 font-medium">Frequency spectrum will appear when microphone is active</div>
                      </div>
                    )}
                  </div>

                  {/* Live VU Bar */}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-400">Input Amplitude:</span>
                      <span className={`${micVolume > 70 ? 'text-rose-400' : micVolume > 30 ? 'text-indigo-300' : 'text-emerald-400'} font-mono`}>
                        {micVolume}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-500 transition-all duration-75"
                        style={{ width: `${micVolume}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Voice Recording & Playback Section */}
                <div className="p-4 rounded-2xl bg-[#080D1A] border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Disc className="w-3.5 h-3.5 text-rose-400" />
                        Voice Recording & Speaker Playback Test
                      </div>
                      <div className="text-[11px] text-slate-400">Record a clip to hear exactly how your microphone sounds through speakers/headphones.</div>
                    </div>

                    {isRecordingMic ? (
                      <button
                        onClick={stopMicRecording}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all animate-pulse cursor-pointer"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                        Stop Recording ({recordingDuration}s)
                      </button>
                    ) : (
                      <button
                        onClick={() => startMicRecording()}
                        disabled={!testActive}
                        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                          testActive 
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-lg shadow-rose-500/10 hover:border-rose-500/50' 
                            : 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        Record Voice Clip
                      </button>
                    )}
                  </div>

                  {/* Playback Deck when Recording is Ready */}
                  {recordedAudioUrl && (
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (isPlayingRecordedAudio) {
                                stopRecordedAudioPlayback();
                              } else {
                                playRecordedAudio();
                              }
                            }}
                            className="w-9 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all cursor-pointer shadow-md shadow-indigo-600/20"
                          >
                            {isPlayingRecordedAudio ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                          </button>
                          <div className="text-left">
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>Recorded Voice Sample</span>
                              {isPlayingRecordedAudio && (
                                <span className="text-[10px] text-indigo-400 font-mono flex items-center gap-1">
                                  <Volume2 className="w-3 h-3 animate-pulse" />
                                  Playing back...
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Format: WebM / Opus &bull; Sample Rate: {micSampleRate / 1000}kHz
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setIsLoopingPlayback(!isLoopingPlayback)}
                            className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                              isLoopingPlayback 
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/10' 
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                            }`}
                            title="Repeat playback in a continuous loop"
                          >
                            <Repeat className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Repeat Loop</span>
                          </button>

                          <button
                            onClick={() => {
                              stopRecordedAudioPlayback();
                              setRecordedAudioUrl(null);
                            }}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-all cursor-pointer"
                            title="Delete and re-record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Scrubber Progress Bar */}
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-100"
                          style={{ width: `${playbackProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Microphone Health Diagnostics */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#080D1A] border border-slate-800 text-center">
                    <div className="text-[10px] font-bold text-slate-400">Peak Gain</div>
                    <div className="text-sm font-extrabold text-white mt-0.5 font-mono">{micPeakDb} dB</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#080D1A] border border-slate-800 text-center">
                    <div className="text-[10px] font-bold text-slate-400">Sample Rate</div>
                    <div className="text-sm font-extrabold text-emerald-400 mt-0.5 font-mono">{micSampleRate / 1000} kHz</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#080D1A] border border-slate-800 text-center">
                    <div className="text-[10px] font-bold text-slate-400">Signal Clarity</div>
                    <div className={`text-xs font-bold mt-1 ${micVolume > 5 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {micVolume > 5 ? 'Active Vocal' : testActive ? 'Ambient' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>
  );
}
