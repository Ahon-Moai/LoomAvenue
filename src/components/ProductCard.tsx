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
  // Grab absolute first available size for quick add
  const defaultSize = product.sizes[0] || 'One Size';

  return (
    <motion.div
      layout
      id={`product-card-${product.id}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
      className="group flex flex-col bg-white/5 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-white/40 transition-all duration-400"
    >
      {/* Target Image Container with organic mask-corner */}
      <div className="relative w-full aspect-[4/5] bg-white/5 overflow-hidden cursor-pointer" onClick={() => onView(product)}>
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-103"
          loading="lazy"
        />

        {/* Dynamic Dark Accent Overlay on hover */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Hover Fast Actions Bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(product);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/20 backdrop-blur-md text-white border border-white/30 text-[10px] font-mono tracking-wider uppercase rounded-md shadow-lg hover:bg-white/40 transition-colors duration-150"
          >
            <Eye className="w-3 h-3" />
            <span>Details</span>
          </button>
          
          {product.inStock ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(product, defaultSize);
              }}
              className="px-3 py-2 bg-white text-black text-[10px] font-mono tracking-wider uppercase rounded-md shadow-lg hover:bg-white/80 transition-colors duration-150 flex items-center gap-1"
              title="Add to basket"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          ) : (
            <span className="px-3 py-2 bg-black/40 backdrop-blur-md text-white/50 border border-white/10 text-[9px] font-mono tracking-wider uppercase rounded-md">
              Sold Out
            </span>
          )}
        </div>

        {/* Top left mini-tag of size range */}
        <div className="absolute top-2.5 left-2.5 px-2 py-1 bg-black/40 backdrop-blur-md text-white text-[8px] font-mono tracking-widest uppercase rounded">
          {product.sizes.length > 1 ? `${product.sizes[0]} - ${product.sizes[product.sizes.length-1]}` : 'Unisex'}
        </div>
      </div>

      {/* Info labels */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Subtle Tag category */}
          <span className="text-[10px] font-mono text-white/60 tracking-widest uppercase">
            {product.category.replace('-', ' ')}
          </span>
          
          <h3 
            onClick={() => onView(product)}
            className="font-serif italic text-base text-white mt-1 hover:text-white/80 transition-colors duration-150 cursor-pointer"
          >
            {product.name}
          </h3>
        </div>

        <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
          <span className="font-mono text-xs font-semibold text-white">
            ${product.price ? product.price.toFixed(2) : '0.00'}
          </span>
          <span className="text-[10px] font-mono text-white/50">
            {product.inStock ? 'in stock' : 'coming soon'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
