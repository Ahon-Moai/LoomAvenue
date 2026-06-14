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
      className="group flex flex-col bg-earth-50 border border-earth-200/70 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:border-earth-400/45 transition-all duration-400"
    >
      {/* Target Image Container with organic mask-corner */}
      <div className="relative w-full aspect-[4/5] bg-earth-100 overflow-hidden cursor-pointer" onClick={() => onView(product)}>
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-103"
          loading="lazy"
        />

        {/* Dynamic Dark Accent Overlay on hover */}
        <div className="absolute inset-0 bg-[#332b21]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Hover Fast Actions Bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(product);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-earth-900 border border-earth-200 text-[10px] font-mono tracking-wider uppercase rounded-md shadow-lg hover:bg-earth-50 transition-colors duration-150"
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
              className="px-3 py-2 bg-earth-900 text-white text-[10px] font-mono tracking-wider uppercase rounded-md shadow-lg hover:bg-earth-850 transition-colors duration-150 flex items-center gap-1"
              title="Add to basket"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          ) : (
            <span className="px-3 py-2 bg-earth-200 text-earth-400 text-[9px] font-mono tracking-wider uppercase rounded-md">
              Sold Out
            </span>
          )}
        </div>

        {/* Top left mini-tag of size range */}
        <div className="absolute top-2.5 left-2.5 px-2 py-1 bg-[#1d1813]/85 backdrop-blur-sm text-[#faf8f5] text-[8px] font-mono tracking-widest uppercase rounded">
          {product.sizes.length > 1 ? `${product.sizes[0]} - ${product.sizes[product.sizes.length-1]}` : 'Unisex'}
        </div>
      </div>

      {/* Info labels */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Subtle Tag category */}
          <span className="text-[10px] font-mono text-earth-500 tracking-widest uppercase">
            {product.category.replace('-', ' ')}
          </span>
          
          <h3 
            onClick={() => onView(product)}
            className="font-serif italic text-base text-earth-900 mt-1 hover:text-earth-600 transition-colors duration-150 cursor-pointer"
          >
            {product.name}
          </h3>
        </div>

        <div className="mt-3 pt-3 border-t border-earth-200/40 flex items-center justify-between">
          <span className="font-mono text-xs font-semibold text-earth-900">
            ${product.price ? product.price.toFixed(2) : '0.00'}
          </span>
          <span className="text-[10px] font-mono text-earth-400">
            {product.inStock ? 'in stock' : 'coming soon'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
