/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Plus, Eye, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onView: (product: Product) => void;
  onQuickAdd: (product: Product, size: string) => void;
  key?: string;
}

export default function ProductCard({ product, onView, onQuickAdd }: ProductCardProps) {
  const defaultSize = product.sizes[0] || 'One Size';
  // Compute fake original price for the UI based on 7% discount (product.price is the 93%)
  const originalPrice = product.price / 0.93;

  return (
    <motion.div
      layout
      id={`product-card-${product.id}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
      className="group relative flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden cursor-pointer shadow-2xl hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:border-white/30 transition-all duration-500"
      onClick={() => onView(product)}
    >
      {/* Target Image Container */}
      <div className="relative w-full aspect-[4/5] sm:aspect-square bg-white/5 flex flex-col justify-center items-center">
        {/* Top Left New Product Badge */}
        <div className="absolute top-4 left-4 z-10 flex items-start gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 px-2 py-1 rounded-full shadow-lg">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 animate-pulse shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
          <div className="flex text-[9px] sm:text-[10px] font-mono tracking-widest text-white/90 uppercase pt-0.5">
            <span>New</span>
          </div>
        </div>

        {/* Top Right Ribbon */}
        <div className="absolute top-0 right-0 overflow-hidden w-24 h-24 z-10">
          <div className="absolute bg-red-600/90 backdrop-blur-md border-b border-white/20 text-white font-mono font-bold text-[9px] sm:text-[10px] tracking-widest text-center w-36 py-1.5 top-5 -right-10 rotate-45 transform origin-center shadow-lg">
            7% OFF
          </div>
        </div>

        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain p-6 sm:p-8 transition-transform duration-700 ease-out group-hover:scale-110 drop-shadow-2xl"
          loading="lazy"
        />

        {/* Hover Fast Actions Bar */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
          {product.inStock ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(product, defaultSize);
              }}
              className="px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[10px] sm:text-xs font-mono tracking-widest uppercase rounded-xl shadow-xl hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2 w-full justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
          ) : (
            <span className="px-6 py-3 bg-black/60 backdrop-blur-xl border border-white/10 text-white/50 text-[10px] sm:text-xs font-mono tracking-widest uppercase rounded-xl shadow-xl w-full text-center">
              Sold Out
            </span>
          )}
        </div>
      </div>

      {/* Info labels */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-transparent to-black/40">
        <div>
          <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase mb-2 block">
            {product.category.replace('-', ' ')}
          </span>
          <h3 className="font-serif italic text-base sm:text-lg text-white/90 leading-tight mb-3 line-clamp-2">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap pt-3 border-t border-white/10">
          <span className="font-mono text-xs sm:text-sm text-white/40 line-through">
            TK {originalPrice.toFixed(0)}
          </span>
          <span className="font-mono font-bold text-sm sm:text-base text-[#e8dcc4]">
            NOW TK {product.price.toFixed(0)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
