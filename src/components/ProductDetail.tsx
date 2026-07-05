/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Leaf, BookOpen, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, size: string) => void;
}

export default function ProductDetail({ product, onClose, onAddToCart }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'One Size');
  const [activeTab, setActiveTab] = useState<'materials' | 'story' | 'care'>('materials');
  const [addedNotice, setAddedNotice] = useState<boolean>(false);

  const handleAdd = () => {
    onAddToCart(product, selectedSize);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2400);
  };

  return (
    <div id="product-detail-modal" className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-md">
      {/* Click outside backdrop close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide out drawer panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        className="relative w-full max-w-lg sm:max-w-xl h-full bg-white/10 backdrop-blur-3xl shadow-2xl flex flex-col justify-between overflow-y-auto no-scrollbar z-10 border-l border-white/20"
      >
        <div className="p-6 sm:p-8 flex-1">
          {/* Header row with close button */}
          <div className="flex items-center justify-between mb-6">
            <span className="font-mono text-[9px] tracking-[0.25em] text-white/60 uppercase">
              {product.category.replace('-', ' ')} / catalogue
            </span>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-full text-white transition-colors"
              title="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Banner Product Image with organic grain effect */}
          <div className="relative w-full aspect-[16/10] bg-white/5 rounded-lg overflow-hidden border border-white/10 mb-6">
            <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>

          {/* Title & Price */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-4">
            <h2 className="font-serif italic text-2xl sm:text-3xl text-white tracking-tight">
              {product.name}
            </h2>
            <span className="font-mono text-lg font-semibold text-white">
              TK {product.price ? product.price.toFixed(2) : '0.00'}
            </span>
          </div>

          {/* Text Description */}
          <p className="text-sm text-white/80 leading-relaxed font-sans mb-6">
            {product.description}
          </p>

          {/* Size Selectors */}
          {product.sizes.length > 0 && product.sizes[0] !== 'One Size' && (
            <div className="mb-6">
              <span className="block font-mono text-[10px] tracking-wider text-white/60 uppercase mb-2">
                Available imperfect fits:
              </span>
              <div className="flex gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[42px] h-[40px] px-3 font-mono text-xs rounded border backdrop-blur-md transition-all duration-150 ${
                      selectedSize === size
                        ? 'bg-white text-black border-white focus:outline-none'
                        : 'bg-white/10 text-white/80 border-white/20 hover:border-white/50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Info toggle segments */}
          <div className="border-t border-b border-white/20 py-4 mb-6">
            <div className="flex gap-4 mb-3 border-b border-white/10 pb-2">
              <button
                onClick={() => setActiveTab('materials')}
                className={`font-mono text-[10px] uppercase tracking-widest pb-1 relative transition-colors ${
                  activeTab === 'materials' ? 'text-white font-medium' : 'text-white/50 hover:text-white/80'
                }`}
              >
                materials
                {activeTab === 'materials' && <span className="absolute bottom-[-9px] left-0 right-0 h-[1.5px] bg-white" />}
              </button>
              <button
                onClick={() => setActiveTab('story')}
                className={`font-mono text-[10px] uppercase tracking-widest pb-1 relative transition-colors ${
                  activeTab === 'story' ? 'text-white font-medium' : 'text-white/50 hover:text-white/80'
                }`}
              >
                maker story
                {activeTab === 'story' && <span className="absolute bottom-[-9px] left-0 right-0 h-[1.5px] bg-white" />}
              </button>
              <button
                onClick={() => setActiveTab('care')}
                className={`font-mono text-[10px] uppercase tracking-widest pb-1 relative transition-colors ${
                  activeTab === 'care' ? 'text-white font-medium' : 'text-white/50 hover:text-white/80'
                }`}
              >
                features
                {activeTab === 'care' && <span className="absolute bottom-[-9px] left-0 right-0 h-[1.5px] bg-white" />}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'materials' && (
                <motion.div
                  key="materials-tab"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-2 text-xs text-white/80"
                >
                  <p className="flex items-center gap-1.5 font-sans">
                    <Leaf className="w-3.5 h-3.5 text-white/50" />
                    <strong>Composition:</strong> {product.materials}
                  </p>
                  <p className="font-sans leading-relaxed">
                    Harvested sustainably and fabricated with fair working wages. Flawed textiles use minimal or non-synthetic chemical coloring to maintain raw thread vitality.
                  </p>
                </motion.div>
              )}

              {activeTab === 'story' && (
                <motion.div
                  key="story-tab"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-2 text-xs text-white/80"
                >
                  <p className="flex items-start gap-1.5 font-sans leading-relaxed">
                    <BookOpen className="w-3.5 h-3.5 text-white/50 mt-0.5" />
                    <span>{product.story}</span>
                  </p>
                </motion.div>
              )}

              {activeTab === 'care' && (
                <motion.div
                  key="care-tab"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-1.5"
                >
                  {product.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-white/80 font-sans">
                      <Sparkles className="w-3.5 h-3.5 text-white/50" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Add To Basket Panel */}
        <div className="bg-black/20 backdrop-blur-3xl p-6 border-t border-white/20 sticky bottom-0">
          <div className="flex gap-4">
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className={`flex-1 relative group py-4 px-6 rounded-lg font-display text-xs tracking-widest uppercase transition-all duration-300 transform active:scale-98 flex items-center justify-center gap-2.5 ${
                product.inStock
                  ? 'bg-white hover:bg-white/80 text-black shadow-lg'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{product.inStock ? 'Add to custom basket' : 'Sold Out'}</span>
            </button>
          </div>

          <AnimatePresence>
            {addedNotice && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute left-6 right-6 -top-12 bg-white/20 backdrop-blur-xl border border-white/30 text-white py-2 px-4 rounded text-center text-xs font-mono tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl"
              >
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Added {product.name} ({selectedSize})</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
