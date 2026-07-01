/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Instagram, Smartphone, Disc, Volume2, ArrowRight, Sparkles } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

interface EntranceScreenProps {
  onEnter: () => void;
  onAdmin: () => void;
}

export default function EntranceScreen({ onEnter, onAdmin }: EntranceScreenProps) {
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
  const [showMusicHint, setShowMusicHint] = useState<boolean>(true);
  const [showUpcomingModal, setShowUpcomingModal] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [isPreloading, setIsPreloading] = useState<boolean>(true);

  useEffect(() => {
    // Preload highly optimized main image to trigger instant reveal
    const img = new Image();
    img.src = "https://res.cloudinary.com/deyatjand/image/upload/f_auto,q_auto:good,w_1400/v1781448482/a7eaa09f-329a-4bcc-bdc3-69e76ede4b37.png";
    img.onload = () => {
      setImageLoaded(true);
      // Brief aesthetic delay before fading out black screen for silk-smooth release transition
      setTimeout(() => {
        setIsPreloading(false);
      }, 150);
    };

    // Robust video fallback timer - ensures background video is revealed even if player events are sandboxed
    const videoTimer = setTimeout(() => {
      setVideoLoaded(true);
    }, 4000);

    // Safe fallback limit to ensure preloader is cleared regardless of network speeds
    const preloadFallback = setTimeout(() => {
      setIsPreloading(false);
    }, 600);

    const hintTimer = setTimeout(() => setShowMusicHint(false), 8000);
    
    return () => {
      clearTimeout(videoTimer);
      clearTimeout(preloadFallback);
      clearTimeout(hintTimer);
    };
  }, []);

  return (
    <div id="entrance-gate" className="relative w-full h-screen overflow-hidden flex flex-col justify-between text-[#dfd9cc] select-none z-10">
      
      {/* TOP BAR BRAND ACCENT */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 sm:py-8 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col"
        >
          <span className="font-sans text-[10px] uppercase tracking-[0.3em] font-semibold opacity-70 text-stone-200">Entrance</span>
          <span className="text-[11px] font-mono mt-1 opacity-50">01 / 04</span>
        </motion.div>

        {/* Elegant Centered Mini-Game Invitation Removed */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.1, ease: 'easeOut' }}
          className="flex items-center"
        >
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-right"
        >
          <p className="font-mono text-[10px] tracking-[0.25em] text-stone-300 uppercase">
            DEFINED BY STYLE
          </p>
        </motion.div>
      </header>

      {/* CORE HERO SECTION */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 max-w-5xl mx-auto w-full text-center">
        {/* Brand Main Title */}
        <div className="overflow-visible select-text mb-2">
          <motion.h1
            initial={{ opacity: 0, y: 35, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif italic text-4xl sm:text-6xl md:text-7xl text-stone-100 tracking-tight relative flex flex-col items-center select-all cursor-default leading-tight"
          >
            <span className="earth-glow relative tracking-wider">
              LOOM <span className="font-serif italic font-light text-stone-300">Avenue</span>
            </span>
          </motion.h1>
         </div>

        {/* Transition symbol connecting brand and slogan */}
        <motion.div 
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.5 }}
          transition={{ duration: 1.8, delay: 0.4 }}
          className="flex items-center gap-3 my-4"
        >
          <div className="h-[1px] w-12 bg-stone-100/30" />
          <span className="text-[10px] font-mono text-stone-400">→</span>
          <div className="h-[1px] w-12 bg-stone-100/30" />
        </motion.div>

        {/* Slogan - Wear it, live it, own it */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, delay: 0.6 }}
          className="text-lg sm:text-2xl font-serif italic tracking-wide text-stone-200 mb-10"
        >
          "Wear it, live it, own it."
        </motion.p>

        {/* ENTER THE SHOP CTA BUTTON styled with circular spinning SVG text ring from Design HTML */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.9, ease: 'easeOut' }}
          className="flex flex-col items-center gap-4"
        >
          <button
            onClick={onEnter}
            id="enter-shop-btn"
            className="group relative flex items-center justify-center w-32 h-32 rounded-full border border-stone-100/40 hover:border-stone-100 transition-all duration-500 cursor-pointer focus:outline-none focus:ring-1 focus:ring-stone-200"
          >
            <span className="text-stone-100 text-[10px] uppercase tracking-[0.25em] font-medium group-hover:scale-105 transition-transform duration-300">Enter</span>
            
            {/* Circular Text Ring Decoration */}
            <svg className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite] opacity-40 group-hover:opacity-100 group-hover:scale-102 transition-all duration-500">
               <path id="textCircle" d="M 16,64 a 48,48 0 1,1 96,0 a 48,48 0 1,1 -96,0" fill="transparent" />
               <text className="text-[7.5px] font-mono" letterSpacing="4" fill="white">
                 <textPath href="#textCircle">NEW ARRIVALS • FW24 • THE EARTH COLLECTION • </textPath>
               </text>
            </svg>
          </button>

          {/* Social symbols styled exactly like the provided mockup image */}
          <div className="flex items-center gap-3 mt-6 text-[#a09b8e] hover:text-[#dfd9cc] transition-colors duration-200">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" title="Instagram" className="hover:scale-105 transition-transform">
              <Instagram className="w-4 h-4 opacity-70 hover:opacity-100" />
            </a>
            <span className="text-[10px] text-earth-550">•</span>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" title="TikTok" className="hover:scale-105 transition-transform">
              <svg className="w-3.5 h-3.5 opacity-70 hover:opacity-100 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.09-1.5-.15-.11-.29-.24-.42-.37-.06 3.41-.03 6.82-.04 10.23-.09 1.18-.45 2.39-1.18 3.32-.97 1.35-2.5 2.22-4.14 2.39-1.92.25-3.95-.31-5.32-1.7-1.43-1.4-2.02-3.48-1.7-5.46.25-1.93 1.4-3.7 3.19-4.47 1.05-.47 2.21-.6 3.33-.42v4.03c-.92-.23-1.96-.06-2.73.53-.7.51-1.07 1.4-1.02 2.27.03.88.5 1.72 1.25 2.18.73.47 1.64.55 2.44.25.9-.31 1.53-1.15 1.63-2.09.11-2.09.04-4.18.06-6.27.01-4.05.01-8.1 0-12.15z"/>
              </svg>
            </a>
          </div>

          <p className="font-mono text-[7px] tracking-[0.3em] text-[#8e897e] uppercase mt-2">
            FOREVER EVOLVING.
          </p>
        </motion.div>
      </main>

      {/* FIXED AUDIO TAPE INTERFACE ON FLOATING DECK */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 sm:py-8 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Beautiful visualizer clue */}
        <div className="max-w-xs text-left">
          <p className="text-[9px] leading-relaxed uppercase tracking-[0.16em] text-stone-300">
            Embracing the beauty of the unfinished. <br />
            Designed for the wandering soul.
          </p>
        </div>

        {/* Cozy Live Analog Tape deck */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 1.3 }}
          className="w-full sm:w-auto relative"
        >
          {showMusicHint && (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-[#dfd9cc] text-[#1d1813] text-[9.5px] font-mono tracking-wider uppercase px-2.5 py-1.5 rounded-md shadow-lg flex items-center gap-1.5 whitespace-nowrap animate-pulse">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Tap play to trigger cozy lofi mix!</span>
            </div>
          )}
          <AudioPlayer />
        </motion.div>

        {/* Right side available information */}
        <div className="text-right flex flex-col text-[#b3ac9f] font-mono text-[9px] tracking-widest uppercase">
          <span className="mb-1 text-stone-300">Available Globally</span>
          <span className="opacity-50 flex items-center justify-end gap-2">
            © 2026 Venta Studios
            <button onClick={onAdmin} className="hover:text-white transition-colors cursor-pointer ml-2">Admin</button>
          </span>
        </div>
      </footer>

      {/* UPCOMING COLLECTION / ON DEV EXQUISITE MODAL */}
      <AnimatePresence>
        {showUpcomingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="bg-[#faf9f4] text-[#10352e] border-2 border-[#10352e]/20 px-6 sm:px-8 py-8 sm:py-10 rounded-2xl max-w-sm w-full shadow-[0_25px_60px_rgba(0,0,0,0.65)] text-center relative overflow-hidden"
            >
              {/* Elegant organic stripe */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#10352e] via-[#8d5a38] to-[#506257]" />

              <span className="font-mono text-[8.5px] tracking-[0.35em] uppercase text-[#8d5a38] block mb-2.5 font-bold">
                LOOM AVENUE × VENTA STUDIOS
              </span>

              <h2 className="font-serif italic text-3xl text-[#10352e] tracking-tight mb-4">
                Upcoming / on dev.
              </h2>
              
              <div className="w-12 h-[1px] bg-[#10352e]/20 mx-auto mb-5" />

              <p className="font-sans text-[12.5px] sm:text-sm text-stone-650 leading-relaxed mb-6">
                Our collaborative digital space is currently in active development. We are weaving rustic textures and flawed alignments directly onto the dev server for the upcoming <span className="font-semibold text-[#10352e] italic">FW26 collection drop</span>.
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    setShowUpcomingModal(false);
                    onEnter();
                  }}
                  className="w-full bg-[#10352e] text-[#faf9f4] hover:bg-[#8d5a38] py-3.5 px-4 rounded-xl font-mono text-[11px] uppercase tracking-widest font-bold transition-all duration-200 shadow-md flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explore Beta Shop</span>
                </button>

                <button
                  onClick={() => setShowUpcomingModal(false)}
                  className="w-full border border-[#10352e]/25 text-[#10352e]/85 hover:bg-[#10352e]/5 py-2 px-4 rounded-xl font-mono text-[10px] uppercase tracking-widest transition-all duration-200 cursor-pointer"
                >
                  <span>Remain at Gate</span>
                </button>
              </div>

              <span className="font-mono text-[7px] uppercase tracking-[0.25em] text-[#10352e]/40 block mt-6.5">
                * weaving imperfection into the fabric of dev *
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LUXURIOUS INITIAL FADE-IN OVERLAY / PRELOADER */}
      <AnimatePresence>
        {isPreloading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] bg-black pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
