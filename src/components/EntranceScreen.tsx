import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface EntranceScreenProps {
  onEnter: () => void;
  onOpenAdmin: () => void;
}

export const EntranceScreen: React.FC<EntranceScreenProps> = ({ onEnter, onOpenAdmin }) => {
  return (
    <div className="relative z-10 min-h-screen flex flex-col justify-between items-center px-6 py-12 text-center select-none">
      {/* Brand Top Header */}
      <div className="flex flex-col items-center">
        <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-amber-500/80 mb-2">
          Autumn / Winter 2026
        </span>
        <h1 className="text-4xl sm:text-6xl font-serif tracking-widest text-white uppercase drop-shadow-md">
          Loom-Avenue
        </h1>
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent my-4" />
        <p className="text-xs sm:text-sm text-neutral-300 font-light tracking-widest italic font-serif">
          "Wear it, live it, own it."
        </p>
      </div>

      {/* Center CTA */}
      <div className="max-w-md my-auto py-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-mono mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Handcrafted Limited Edition
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif text-white font-light mb-4 leading-relaxed">
          Tactile Textiles for Mindful Living
        </h2>
        
        <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed mb-8 max-w-sm">
          A celebration of raw linen, heavyweight organic cottons, and earth-glazed pottery.
        </p>

        <button
          onClick={onEnter}
          className="group relative px-8 py-3.5 rounded-full bg-white hover:bg-neutral-200 text-neutral-950 font-medium text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 flex items-center gap-3 shadow-xl shadow-black/50 hover:shadow-white/10 hover:scale-105 active:scale-95"
        >
          <span>Explore Atelier</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Footer */}
      <div className="w-full max-w-5xl flex items-center justify-between text-[11px] text-neutral-500 font-mono tracking-wider pt-6 border-t border-neutral-800/40">
        <span>EST. 2026 • ARTISANAL EDITIONS</span>
        <button
          onClick={onOpenAdmin}
          className="text-neutral-500 hover:text-amber-400 transition-colors uppercase tracking-widest"
        >
          Staff Gateway
        </button>
      </div>
    </div>
  );
};
