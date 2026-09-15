import { useState, useEffect, useRef, useCallback } from 'react';

export function useMediaDiagnostics(slug: string) {
  const [testActive, setTestActive] = useState(false);

  const sessionRef = useRef(0);
  const channelTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const closeAudio = useCallback(() => {
    const context = audioCtxRef.current;
    audioCtxRef.current = null;
    analyserRef.current = null;
    micAnalyserRef.current = null;
    noiseBufferRef.current = null;
    if (context && context.state !== 'closed') void context.close().catch(() => {});
    channelTimeoutsRef.current.forEach(clearTimeout);
    channelTimeoutsRef.current = [];
  }, []);

  // Audio / Sound & Mic States
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  const [isPlayingBeat, setIsPlayingBeat] = useState(false);
  const [beatDuration, setBeatDuration] = useState(40); // 30s, 40s, 60s
  const [beatTimeLeft, setBeatTimeLeft] = useState(40);
  const [activeSpeakerChannel, setActiveSpeakerChannel] = useState<'both' | 'left' | 'right' | null>(null);

  // Microphone & Voice Recorder States
  const micCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedAudioChunksRef = useRef<Blob[]>([]);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);

  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecordedAudio, setIsPlayingRecordedAudio] = useState(false);
  const [isLoopingPlayback, setIsLoopingPlayback] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [micPeakDb, setMicPeakDb] = useState(-60);
  const [micSampleRate, setMicSampleRate] = useState(48000);

  const [micVolume, setMicVolume] = useState(0);
  const [micStreamActive, setMicStreamActive] = useState(false);
  const [soundFrequency, setSoundFrequency] = useState(440);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Gamepad / Steering Wheel State
  const [gamepads, setGamepads] = useState<Gamepad[]>([]);
  const [activeGamepadButtons, setActiveGamepadButtons] = useState<number[]>([]);
  const [gamepadAxes, setGamepadAxes] = useState<number[]>([]);

  // Helper to create noise buffer for snare and hi-hats
  const getNoiseBuffer = (ctx: AudioContext) => {
    if (noiseBufferRef.current) return noiseBufferRef.current;
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    noiseBufferRef.current = buffer;
    return buffer;
  };

  // Stop the heavy beat audio test
  const stopHeavyDrumTest = useCallback(() => {
    if (audioIntervalRef.current) {
      window.clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    closeAudio();
    setIsPlayingBeat(false);
    setActiveSpeakerChannel(null);
  }, [closeAudio]);

  // Start heavy bass & drum test track with timer (30s / 40s / 60s)
  const startHeavyDrumTest = (duration = 40) => {
    try {
      stopHeavyDrumTest();

      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') void ctx.resume().catch(() => setError('Audio playback could not start. Try again.'));

      // Master Analyser Node
      if (!analyserRef.current) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;
      }
      const analyser = analyserRef.current;
      analyser.disconnect();
      analyser.connect(ctx.destination);

      const noiseBuf = getNoiseBuffer(ctx);

      setIsPlayingBeat(true);
      setBeatDuration(duration);
      setBeatTimeLeft(duration);
      setActiveSpeakerChannel('both');

      // Countdown Timer
      let remaining = duration;
      timerIntervalRef.current = window.setInterval(() => {
        remaining -= 1;
        setBeatTimeLeft(remaining);
        if (remaining <= 0) {
          stopHeavyDrumTest();
        }
      }, 1000);

      // Sequencer BPM 126: 16th note step = ~119ms
      let step = 0;
      const stepDuration = 0.119;
      const bassNotes = [41.2, 41.2, 49.0, 41.2, 55.0, 49.0, 36.7, 41.2]; // E1, G1, A1, D1

      audioIntervalRef.current = window.setInterval(() => {
        const now = ctx.currentTime;

        // 1. Heavy Sub Kick Drum on quarter notes (steps 0, 4, 8, 12)
        if (step % 4 === 0) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(155, now);
          osc.frequency.exponentialRampToValueAtTime(34, now + 0.18);
          gain.gain.setValueAtTime(0.85, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
          osc.connect(gain);
          gain.connect(analyser);
          osc.start(now);
          osc.stop(now + 0.33);
        }

        // 2. Punchy Snare on backbeats (steps 4, 12)
        if (step % 8 === 4) {
          const noiseSrc = ctx.createBufferSource();
          noiseSrc.buffer = noiseBuf;
          const bandpass = ctx.createBiquadFilter();
          bandpass.type = 'bandpass';
          bandpass.frequency.value = 1100;
          bandpass.Q.value = 1.4;

          const snareGain = ctx.createGain();
          snareGain.gain.setValueAtTime(0.5, now);
          snareGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

          noiseSrc.connect(bandpass);
          bandpass.connect(snareGain);
          snareGain.connect(analyser);
          noiseSrc.start(now);
          noiseSrc.stop(now + 0.22);

          const snareTone = ctx.createOscillator();
          const toneGain = ctx.createGain();
          snareTone.type = 'triangle';
          snareTone.frequency.setValueAtTime(190, now);
          snareTone.frequency.exponentialRampToValueAtTime(90, now + 0.12);
          toneGain.gain.setValueAtTime(0.4, now);
          toneGain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
          snareTone.connect(toneGain);
          toneGain.connect(analyser);
          snareTone.start(now);
          snareTone.stop(now + 0.15);
        }

        // 3. Crisp Hi-Hats on offbeats (alternating left & right stereo pan)
        if (step % 2 === 1) {
          const hihatSrc = ctx.createBufferSource();
          hihatSrc.buffer = noiseBuf;
          const highpass = ctx.createBiquadFilter();
          highpass.type = 'highpass';
          highpass.frequency.value = 7500;

          const hihatGain = ctx.createGain();
          hihatGain.gain.setValueAtTime(0.2, now);
          hihatGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

          const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
          const panVal = step % 4 === 1 ? -0.7 : 0.7;

          if (panner) {
            panner.pan.value = panVal;
            hihatSrc.connect(highpass);
            highpass.connect(hihatGain);
            hihatGain.connect(panner);
            panner.connect(analyser);
          } else {
            hihatSrc.connect(highpass);
            highpass.connect(hihatGain);
            hihatGain.connect(analyser);
          }
          hihatSrc.start(now);
          hihatSrc.stop(now + 0.06);
        }

        // 4. Groovy Sub-Bass Synth line
        if (step % 2 === 0) {
          const bassFreq = bassNotes[(step / 2) % bassNotes.length];
          const bassOsc = ctx.createOscillator();
          bassOsc.type = 'sawtooth';

          const lowpass = ctx.createBiquadFilter();
          lowpass.type = 'lowpass';
          lowpass.frequency.setValueAtTime(320, now);
          lowpass.frequency.exponentialRampToValueAtTime(140, now + 0.22);
          lowpass.Q.value = 3.5;

          const bassGain = ctx.createGain();
          bassGain.gain.setValueAtTime(0.45, now);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

          bassOsc.frequency.setValueAtTime(bassFreq, now);
          bassOsc.connect(lowpass);
          lowpass.connect(bassGain);
          bassGain.connect(analyser);
          bassOsc.start(now);
          bassOsc.stop(now + 0.23);
        }

        step = (step + 1) % 16;
      }, stepDuration * 1000);
    } catch {
      stopHeavyDrumTest();
      setTestActive(false);
      setError('Audio playback is unavailable. Check your browser audio permissions.');
    }
  };

  // Real-time Visualizer Canvas Animation
  useEffect(() => {
    if (!isPlayingBeat || !visualizerCanvasRef.current) return;
    const canvas = visualizerCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const analyser = analyserRef.current;
    if (!analyser) return;

    let animId: number;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animId = requestAnimationFrame(render);
      analyserRef.current?.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const numBars = 32;
      const barWidth = (canvas.width / numBars) - 2;

      for (let i = 0; i < numBars; i++) {
        const dataIndex = Math.floor((i / numBars) * (bufferLength / 2));
        const value = dataArray[dataIndex] || 0;
        const percent = value / 255;
        const barHeight = Math.max(3, percent * (canvas.height - 8));
        const x = i * (barWidth + 2);
        const y = canvas.height - barHeight;

        // Gradient color for frequencies
        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        if (i < 10) {
          grad.addColorStop(0, '#E11D48'); // Sub Bass (Rose)
          grad.addColorStop(1, '#FB7185');
        } else if (i < 22) {
          grad.addColorStop(0, '#6366F1'); // Mids (Indigo)
          grad.addColorStop(1, '#A855F7');
        } else {
          grad.addColorStop(0, '#06B6D4'); // Treble (Cyan)
          grad.addColorStop(1, '#10B981');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        ctx.fill();

        if (barHeight > 8) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(x, y - 2, barWidth, 1.5);
        }
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlayingBeat]);

  // Sound Frequency Player
  const playSineTone = (freq: number) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') void ctx.resume().catch(() => setError('Audio playback could not start. Try again.'));

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.85);
      setActiveSpeakerChannel('both');
      channelTimeoutsRef.current.push(setTimeout(() => setActiveSpeakerChannel(null), 850));
    } catch {
      setError('Audio playback is unavailable. Check your browser audio permissions.');
    }
  };

  // Stereo Channel Ping (Left or Right)
  const playStereoPing = (pan: -1 | 1) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') void ctx.resume().catch(() => setError('Audio playback could not start. Try again.'));

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pan === -1 ? 520 : 880, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      if (panner) {
        panner.pan.value = pan;
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(ctx.destination);
      } else {
        osc.connect(gain);
        gain.connect(ctx.destination);
      }
      osc.start();
      osc.stop(ctx.currentTime + 0.55);

      setActiveSpeakerChannel(pan === -1 ? 'left' : 'right');
      channelTimeoutsRef.current.push(setTimeout(() => setActiveSpeakerChannel(null), 600));
    } catch {
      setError('Audio playback is unavailable. Check your browser audio permissions.');
    }
  };

  // 3D Spatial Audio Pan Sweep (Left -> Center -> Right -> Left)
  const playSpatial3DSweep = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') void ctx.resume().catch(() => setError('Audio playback could not start. Try again.'));

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(660, ctx.currentTime + 3);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 2.8);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.2);

      if (panner) {
        panner.pan.setValueAtTime(-1, ctx.currentTime);
        panner.pan.linearRampToValueAtTime(1, ctx.currentTime + 1.5);
        panner.pan.linearRampToValueAtTime(-1, ctx.currentTime + 3);
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(ctx.destination);
      } else {
        osc.connect(gain);
        gain.connect(ctx.destination);
      }
      osc.start();
      osc.stop(ctx.currentTime + 3.3);

      setActiveSpeakerChannel('both');
      channelTimeoutsRef.current.push(setTimeout(() => setActiveSpeakerChannel(null), 3300));
    } catch {
      setError('Audio playback is unavailable. Check your browser audio permissions.');
    }
  };

  // Stop recorded audio playback
  const stopRecordedAudioPlayback = useCallback(() => {
    if (playbackAudioRef.current) {
      playbackAudioRef.current.pause();
      playbackAudioRef.current.currentTime = 0;
      playbackAudioRef.current.ontimeupdate = null;
      playbackAudioRef.current.onended = null;
      playbackAudioRef.current = null;
    }
    setIsPlayingRecordedAudio(false);
    setPlaybackProgress(0);
  }, []);

  // Stop mic recording
  const stopMicRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsRecordingMic(false);
  }, []);

  // Start live mic recording
  const startMicRecording = useCallback((customStream?: MediaStream) => {
    const stream = customStream || mediaStreamRef.current;
    if (!stream) return;
    recordedAudioChunksRef.current = [];
    setRecordedAudioUrl(null);
    setRecordingDuration(0);
    stopRecordedAudioPlayback();
    
    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
        ? 'audio/ogg;codecs=opus'
        : '';
      
      const recorder = mimeType 
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
        
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (mediaRecorderRef.current === recorder && e.data && e.data.size > 0) {
          recordedAudioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        if (mediaRecorderRef.current !== recorder) return;
        const blob = new Blob(recordedAudioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        setIsRecordingMic(false);
      };

      recorder.start(100);
      setIsRecordingMic(true);
    } catch {
      setError('Audio recording is unavailable in this browser.');
    }
  }, [stopRecordedAudioPlayback]);

  // Play recorded audio
  const playRecordedAudio = useCallback(() => {
    if (!recordedAudioUrl) return;
    if (playbackAudioRef.current) {
      playbackAudioRef.current.pause();
    }
    const audio = new Audio(recordedAudioUrl);
    playbackAudioRef.current = audio;
    audio.loop = isLoopingPlayback;
    
    audio.ontimeupdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setPlaybackProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    
    audio.onended = () => {
      if (!audio.loop) {
        setIsPlayingRecordedAudio(false);
        setPlaybackProgress(0);
      }
    };
    
    audio.play().then(() => {
      if (playbackAudioRef.current === audio) setIsPlayingRecordedAudio(true);
    }).catch(() => {
      setIsPlayingRecordedAudio(false);
    });
  }, [recordedAudioUrl, isLoopingPlayback]);

  useEffect(() => {
    if (playbackAudioRef.current) playbackAudioRef.current.loop = isLoopingPlayback;
  }, [isLoopingPlayback]);
  useEffect(() => () => {
    if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
  }, [recordedAudioUrl]);

  // Recording Timer effect
  useEffect(() => {
    let interval: number;
    if (isRecordingMic) {
      interval = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecordingMic]);

  // Live Microphone Canvas Visualizer & Input Amplitude Meter
  useEffect(() => {
    if (!testActive || !micStreamActive || slug !== 'microphone-test' || !micAnalyserRef.current) return;
    const canvas = micCanvasRef.current;
    const analyser = micAnalyserRef.current;
    if (!analyser) return;
    const ctx = canvas ? canvas.getContext('2d') : null;

    let animId: number;
    const freqBins = analyser.frequencyBinCount;
    const freqData = new Uint8Array(freqBins);
    const timeData = new Uint8Array(analyser.fftSize);

    let smoothVol = 0;
    let lastStateUpdate = 0;

    const render = (time: number) => {
      animId = requestAnimationFrame(render);
      analyser.getByteFrequencyData(freqData);
      analyser.getByteTimeDomainData(timeData);

      // 1. Instant RMS Time-Domain Amplitude Calculation (Natural human voice response)
      let sumSquares = 0;
      for (let i = 0; i < timeData.length; i++) {
        const norm = (timeData[i] - 128) / 128;
        sumSquares += norm * norm;
      }
      const rms = Math.sqrt(sumSquares / timeData.length);
      // Voice dynamics curve (0.01 - 0.35 typical speaking amplitude mapped to 0-100%)
      const instantVol = Math.min(100, Math.round(rms * 340));

      // Fast attack, smooth decay filter for natural VU response
      if (instantVol > smoothVol) {
        smoothVol = instantVol;
      } else {
        smoothVol = Math.max(0, smoothVol - 3.2);
      }

      // Sync React state at ~30 FPS for buttery smooth input amplitude progress bar
      if (time - lastStateUpdate > 30) {
        setMicVolume(Math.round(smoothVol));
        const peakDb = smoothVol > 0 ? Math.round(20 * Math.log10(Math.max(0.001, rms))) : -60;
        setMicPeakDb(Math.max(-60, peakDb));
        lastStateUpdate = time;
      }

      // 2. High-Framerate 60 FPS Visualizer Canvas
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const numBars = 36;
        const barWidth = (canvas.width / numBars) - 2;

        for (let i = 0; i < numBars; i++) {
          // Logarithmic distribution focusing on vocal spectrum (100Hz - 4kHz)
          const dataIndex = Math.min(freqBins - 1, Math.floor(Math.pow(i / numBars, 1.25) * (freqBins * 0.75)));
          const rawVal = freqData[dataIndex] || 0;
          const boostedVal = Math.min(255, rawVal * 1.35);
          const percent = boostedVal / 255;
          const barHeight = Math.max(3, percent * (canvas.height - 8));
          const x = i * (barWidth + 2);
          const y = canvas.height - barHeight;

          // Dynamic vibrant gradient
          const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
          if (percent > 0.65) {
            grad.addColorStop(0, '#E11D48'); // Peak Red
            grad.addColorStop(1, '#FB7185');
          } else if (percent > 0.32) {
            grad.addColorStop(0, '#6366F1'); // Mid Indigo
            grad.addColorStop(1, '#A855F7');
          } else {
            grad.addColorStop(0, '#10B981'); // Emerald
            grad.addColorStop(1, '#34D399');
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
          ctx.fill();

          if (barHeight > 8) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x, y - 2, barWidth, 1.5);
          }
        }
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [testActive, micStreamActive, slug]);

  // Start / Stop Hardware Testing Sessions
  const toggleTesting = async () => {
    setError(null);
    const session = ++sessionRef.current;
    if (testActive) {
      // Stop testing
      setTestActive(false);
      setMicStreamActive(false);
      setMicVolume(0);
      setMicPeakDb(-60);
      setGamepads([]);
      setActiveGamepadButtons([]);
      setGamepadAxes([]);
      stopHeavyDrumTest();
      stopMicRecording();
      stopRecordedAudioPlayback();
      closeAudio();
      if (videoRef.current) videoRef.current.srcObject = null;

      // Stop camera/mic streams if any
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    } else {
      // Start testing
      setTestActive(true);

      // Category / Tool specific activations:
      if (slug === 'sound-test') {
        startHeavyDrumTest(beatDuration);
      } else if (slug === 'microphone-test') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (session !== sessionRef.current) {
            stream.getTracks().forEach(track => track.stop());
            return;
          }
          mediaStreamRef.current = stream;
          const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const audioCtx = new AudioCtx();
          audioCtxRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.smoothingTimeConstant = 0.65;
          analyser.fftSize = 256;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
          micAnalyserRef.current = analyser;
          setMicSampleRate(audioCtx.sampleRate || 48000);
          setMicStreamActive(true);
          startMicRecording(stream);
        } catch {
          if (session !== sessionRef.current) return;
          mediaStreamRef.current?.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
          closeAudio();
          setError('Microphone access failed. Allow access in your browser and try again.');
          setTestActive(false);
          setMicStreamActive(false);
        }
      } else if (slug === 'webcam-test') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
          if (session !== sessionRef.current) {
            stream.getTracks().forEach(track => track.stop());
            return;
          }
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
        } catch {
          if (session !== sessionRef.current) return;
          mediaStreamRef.current?.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
          setTestActive(false);
          setError('Camera access failed. Check permissions and whether another app is using it.');
        }
      }
    }
  };

  // The route-keyed owner scopes all hardware resources to one mount.
  useEffect(() => () => {
    sessionRef.current += 1;
    stopHeavyDrumTest();
    const recorder = mediaRecorderRef.current;
    if (recorder) { recorder.onstop = null; recorder.ondataavailable = null; }
    stopMicRecording();
    stopRecordedAudioPlayback();
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
    closeAudio();
  }, [stopHeavyDrumTest, stopMicRecording, stopRecordedAudioPlayback, closeAudio]);

  // Gamepad polling loop
  useEffect(() => {
    if (!testActive || (slug !== 'gamepad-tester' && slug !== 'steering-wheel-tester')) return;

    let animId: number;
    const pollGamepads = () => {
      const detected = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[] : [];
      setGamepads(detected);

      if (detected.length > 0) {
        const gp = detected[0];
        const pressedIndices = gp.buttons.map((b, i) => (b.pressed ? i : -1)).filter((i) => i !== -1);
        setActiveGamepadButtons(pressedIndices);
        setGamepadAxes(Array.from(gp.axes));
      } else {
        setActiveGamepadButtons([]);
        setGamepadAxes([]);
      }
      animId = requestAnimationFrame(pollGamepads);
    };
    animId = requestAnimationFrame(pollGamepads);
    return () => cancelAnimationFrame(animId);
  }, [testActive, slug]);

  return { testActive, visualizerCanvasRef, isPlayingBeat, beatDuration, setBeatDuration, beatTimeLeft, activeSpeakerChannel, micCanvasRef, isRecordingMic, recordingDuration, recordedAudioUrl, setRecordedAudioUrl, isPlayingRecordedAudio, isLoopingPlayback, setIsLoopingPlayback, playbackProgress, micPeakDb, micSampleRate, micVolume, soundFrequency, setSoundFrequency, videoRef, gamepads, activeGamepadButtons, gamepadAxes, stopHeavyDrumTest, startHeavyDrumTest, playSineTone, playStereoPing, playSpatial3DSweep, stopRecordedAudioPlayback, stopMicRecording, startMicRecording, playRecordedAudio, toggleTesting, error };
}
