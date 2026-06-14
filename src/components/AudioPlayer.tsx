/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Music, CloudRain, Disc, Play, Pause, Sliders, ChevronDown, ChevronUp } from 'lucide-react';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isKeysEnabled, setIsKeysEnabled] = useState<boolean>(true);
  const [isRainEnabled, setIsRainEnabled] = useState<boolean>(true);
  const [isVinylEnabled, setIsVinylEnabled] = useState<boolean>(true);
  
  const [keysVolume, setKeysVolume] = useState<number>(0.25);
  const [rainVolume, setRainVolume] = useState<number>(0.35);
  const [vinylVolume, setVinylVolume] = useState<number>(0.15);

  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Audio node references
  const keysVolumeNode = useRef<GainNode | null>(null);
  const rainVolumeNode = useRef<GainNode | null>(null);
  const vinylVolumeNode = useRef<GainNode | null>(null);
  const masterVolumeNode = useRef<GainNode | null>(null);

  const synthIntervalRef = useRef<number | null>(null);

  // Initialize Web Audio Context and Synthesis layers
  const initAudio = () => {
    if (audioCtxRef.current) return;

    try {
      // Establish context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Master gain node
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.7, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterVolumeNode.current = masterGain;

      // 1. Rain Synthesizer (White noise + Lowpass filter + LFO)
      const rainGain = ctx.createGain();
      rainGain.gain.setValueAtTime(rainVolume, ctx.currentTime);
      rainGain.connect(masterGain);
      rainVolumeNode.current = rainGain;
      createProceduralRain(ctx, rainGain);

      // 2. Vinyl Crackle Generator (Pink/white noise + envelope peaks)
      const vinylGain = ctx.createGain();
      vinylGain.gain.setValueAtTime(vinylVolume, ctx.currentTime);
      vinylGain.connect(masterGain);
      vinylVolumeNode.current = vinylGain;
      createProceduralVinyl(ctx, vinylGain);

      // 3. Chill keys Synthesizer (Subtle triangle + sine warm keys with delay)
      const keysGain = ctx.createGain();
      keysGain.gain.setValueAtTime(keysVolume, ctx.currentTime);
      keysGain.connect(masterGain);
      keysVolumeNode.current = keysGain;
      startMelodySequencer(ctx, keysGain);

    } catch (e) {
      console.error('Audio initialization failed:', e);
    }
  };

  // Create highly realistic ambient rain
  const createProceduralRain = (ctx: AudioContext, destination: AudioNode) => {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Generate white/pinkish noise
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to make it sound like rain (warm lowpass)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);
    filter.Q.setValueAtTime(1, ctx.currentTime);

    // LFO to make it dynamic like passing wind/waves
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // slow flow

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(400, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    filter.connect(destination);
    whiteNoise.connect(filter);

    lfo.start();
    whiteNoise.start();
  };

  // Generate vinyl static pop & hum
  const createProceduralVinyl = (ctx: AudioContext, destination: AudioNode) => {
    // Humble 60Hz hum
    const hum = ctx.createOscillator();
    hum.type = 'sine';
    hum.frequency.setValueAtTime(55, ctx.currentTime); // low earth hum
    
    const humGain = ctx.createGain();
    humGain.gain.setValueAtTime(0.04, ctx.currentTime);
    hum.connect(humGain);
    humGain.connect(destination);
    hum.start();

    // Crackle noise
    const bufferSize = ctx.sampleRate * 4;
    const crackleBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = crackleBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Mostly silent, occasional crackling spikes
      const rand = Math.random();
      if (rand > 0.9995) {
        output[i] = (Math.random() * 2 - 1) * 0.85;
      } else {
        output[i] = (Math.random() * 2 - 1) * 0.005; // tiny continuous noise
      }
    }

    const crackSource = ctx.createBufferSource();
    crackSource.buffer = crackleBuffer;
    crackSource.loop = true;

    const crackFilter = ctx.createBiquadFilter();
    crackFilter.type = 'bandpass';
    crackFilter.frequency.setValueAtTime(2500, ctx.currentTime);
    crackFilter.Q.setValueAtTime(1.5, ctx.currentTime);

    crackSource.connect(crackFilter);
    crackFilter.connect(destination);
    crackSource.start();
  };

  // Sequencer playing lofi minor chords on delay loops (Eearth-tone minor 9ths)
  const startMelodySequencer = (ctx: AudioContext, destination: AudioNode) => {
    // Delay effect node to give spacious, ambient feeling
    const delay = ctx.createDelay();
    delay.delayTime.setValueAtTime(0.65, ctx.currentTime);

    const feedback = ctx.createGain();
    feedback.gain.setValueAtTime(0.45, ctx.currentTime);

    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.setValueAtTime(800, ctx.currentTime);

    // feedback loop
    delay.connect(delayFilter);
    delayFilter.connect(feedback);
    feedback.connect(delay);

    delay.connect(destination);

    // Chord progressions for a relaxing lofi lul (Muted jazz chords)
    // Fmaj9, Cmaj9, Am9, Em7 (in Hz)
    const chords = [
      [174.61, 220.00, 261.63, 329.63, 392.00], // Fmaj9 (F3, A3, C4, E4, G4)
      [130.81, 196.00, 261.63, 329.63, 392.00], // Cmaj9 (C3, G3, C4, E4, G4)
      [110.00, 220.00, 293.66, 349.23, 440.00], // Am9 (A2, A3, D4, F4, A4)
      [164.81, 246.94, 293.66, 329.63, 493.88]  // Em9 (E3, B3, D4, E4, B4)
    ];

    let chordIdx = 0;

    const playNote = (freq: number, startTime: number, duration: number) => {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Cozy triangle wave
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      
      // Warm low pass
      const toneFilter = ctx.createBiquadFilter();
      toneFilter.type = 'lowpass';
      toneFilter.frequency.setValueAtTime(500, startTime);

      gain.gain.setValueAtTime(0, startTime);
      // Soft organic attack
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.15);
      // Long cozy decline
      gain.gain.setValueAtTime(0.12, startTime + duration - 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(toneFilter);
      toneFilter.connect(gain);
      
      // Connect to direct AND to delay line
      gain.connect(destination);
      gain.connect(delay);

      // Clean up nodes once playback ends to prevent memory leakage
      osc.onended = () => {
        try {
          osc.disconnect();
          toneFilter.disconnect();
          gain.disconnect();
        } catch (e) {
          // Catch any context closed errors quietly
        }
      };

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const triggerChord = () => {
      const now = ctx.currentTime;
      const currentChord = chords[chordIdx];
      
      // Arpeggiate (strum) the notes for beautiful imperfection
      currentChord.forEach((freq, idx) => {
        // Humanizing delay slightly
        const microDelay = idx * 0.12 + (Math.random() * 0.03);
        const duration = 4.2 + (Math.random() * 0.5);
        playNote(freq, now + microDelay, duration);
      });

      chordIdx = (chordIdx + 1) % chords.length;
    };

    // Initial chord trigger
    triggerChord();

    // Loop trigger every 6 seconds
    const intervalId = window.setInterval(triggerChord, 6200);
    synthIntervalRef.current = intervalId;
  };

  const togglePlayback = async () => {
    if (!audioCtxRef.current) {
      initAudio();
    }

    if (audioCtxRef.current) {
      if (isPlaying) {
        await audioCtxRef.current.suspend();
        setIsPlaying(false);
      } else {
        await audioCtxRef.current.resume();
        setIsPlaying(true);
      }
    }
  };

  // Volumes state effects
  useEffect(() => {
    if (keysVolumeNode.current && audioCtxRef.current) {
      const vol = isKeysEnabled ? keysVolume : 0;
      keysVolumeNode.current.gain.setTargetAtTime(vol, audioCtxRef.current.currentTime, 0.1);
    }
  }, [keysVolume, isKeysEnabled, isPlaying]);

  useEffect(() => {
    if (rainVolumeNode.current && audioCtxRef.current) {
      const vol = isRainEnabled ? rainVolume : 0;
      rainVolumeNode.current.gain.setTargetAtTime(vol, audioCtxRef.current.currentTime, 0.1);
    }
  }, [rainVolume, isRainEnabled, isPlaying]);

  useEffect(() => {
    if (vinylVolumeNode.current && audioCtxRef.current) {
      const vol = isVinylEnabled ? vinylVolume : 0;
      vinylVolumeNode.current.gain.setTargetAtTime(vol, audioCtxRef.current.currentTime, 0.1);
    }
  }, [vinylVolume, isVinylEnabled, isPlaying]);

  // Clean-up on unmount
  useEffect(() => {
    return () => {
      if (synthIntervalRef.current) {
        clearInterval(synthIntervalRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div id="lofi-beat-player" className="bg-[#24201a]/95 backdrop-blur-md border border-[#dfd9cc]/20 p-3.5 sm:p-4 rounded-xl text-[#dfd9cc] max-w-sm w-full mx-auto shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex-shrink-0">
            <Disc className={`w-8 h-8 text-earth-300 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            {isPlaying && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-sans font-medium text-xs tracking-wider uppercase text-stone-200 truncate">Ambient Lofi Mix</h4>
            <span className="text-[9px] font-mono text-stone-400 block truncate">
              {isPlaying ? '● synthesizing organic audio...' : '○ audio offline'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Collapse/Expand Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800/40 transition-colors duration-150 flex items-center gap-1 text-[10px] font-mono tracking-wider uppercase border border-stone-700/50 ${!isCollapsed ? 'bg-stone-800/50 text-white' : ''}`}
            title={isCollapsed ? "Open Sound Mixer" : "Close Sound Mixer"}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{isCollapsed ? 'Mixer' : 'Hide'}</span>
            {isCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Core play/pause toggler */}
          <button
            onClick={togglePlayback}
            className="p-2.5 bg-stone-100 text-[#1d1813] hover:bg-white rounded-full transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-stone-300"
            title={isPlaying ? "Pause audio generator" : "Play audio generator"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Accordion Sliders Area */}
      {!isCollapsed && (
        <div className="space-y-3.5 pt-3.5 mt-3 border-t border-[#dfd9cc]/10 animate-fadeIn">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-[#b0a99c]">
            <span>Mixer Levels (Analog)</span>
            <span className="font-mono text-[9px] lowercase opacity-60">real-time synthesis</span>
          </div>

          <div className="space-y-2.5">
            {/* Chord Keys */}
            <div className="flex items-center gap-2.5 text-xs bg-stone-900/40 p-2 rounded-lg border border-stone-800/50">
              <button 
                type="button"
                onClick={() => setIsKeysEnabled(!isKeysEnabled)}
                className={`p-1 rounded hover:bg-stone-800/30 transition-colors ${isKeysEnabled ? 'text-earth-300' : 'text-stone-600'}`}
                title={isKeysEnabled ? "Mute Keys" : "Unmute Keys"}
              >
                <Music className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono w-24 text-stone-300 truncate">Nostalgic Keys</span>
              <input
                type="range"
                min="0"
                max="0.6"
                step="0.01"
                value={keysVolume}
                onChange={(e) => setKeysVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-stone-200 focus:outline-none max-w-[120px]"
                disabled={!isKeysEnabled}
              />
              <span className="text-[9px] font-mono text-stone-400 w-8 text-right">
                {isKeysEnabled ? `${Math.round(keysVolume * 166)}%` : 'MUTED'}
              </span>
            </div>

            {/* Rain Sound */}
            <div className="flex items-center gap-2.5 text-xs bg-stone-900/40 p-2 rounded-lg border border-stone-800/50">
              <button 
                type="button"
                onClick={() => setIsRainEnabled(!isRainEnabled)}
                className={`p-1 rounded hover:bg-stone-800/30 transition-colors ${isRainEnabled ? 'text-earth-300' : 'text-stone-600'}`}
                title={isRainEnabled ? "Mute Rain" : "Unmute Rain"}
              >
                <CloudRain className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono w-24 text-stone-300 truncate">Gentle Rain</span>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.01"
                value={rainVolume}
                onChange={(e) => setRainVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-stone-200 focus:outline-none max-w-[120px]"
                disabled={!isRainEnabled}
              />
              <span className="text-[9px] font-mono text-stone-400 w-8 text-right">
                {isRainEnabled ? `${Math.round(rainVolume * 125)}%` : 'MUTED'}
              </span>
            </div>

            {/* Vinyl crackle */}
            <div className="flex items-center gap-2.5 text-xs bg-stone-900/40 p-2 rounded-lg border border-stone-800/50">
              <button 
                type="button"
                onClick={() => setIsVinylEnabled(!isVinylEnabled)}
                className={`p-1 rounded hover:bg-stone-800/30 transition-colors ${isVinylEnabled ? 'text-earth-300' : 'text-stone-600'}`}
                title={isVinylEnabled ? "Mute Vinyl Dust" : "Unmute Vinyl Dust"}
              >
                <Disc className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono w-24 text-stone-300 truncate">Vinyl Dust</span>
              <input
                type="range"
                min="0"
                max="0.4"
                step="0.01"
                value={vinylVolume}
                onChange={(e) => setVinylVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-stone-200 focus:outline-none max-w-[120px]"
                disabled={!isVinylEnabled}
              />
              <span className="text-[9px] font-mono text-stone-400 w-8 text-right">
                {isVinylEnabled ? `${Math.round(vinylVolume * 250)}%` : 'MUTED'}
              </span>
            </div>
          </div>
          
          <p className="text-[8.5px] font-mono text-center text-stone-400">
            * Procedural synthesis - zero audio files loaded or cached *
          </p>
        </div>
      )}
      
      {!isPlaying && isCollapsed && (
        <p className="text-[8px] font-mono text-center text-stone-400 mt-1.5 uppercase tracking-wider">
          * click play to activate cozy soundscape *
        </p>
      )}
    </div>
  );
}
