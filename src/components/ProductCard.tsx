import React from 'react';
import { Product } from '../types';
import { Plus, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onQuickAdd }) => {
  return (
    <div className="group relative bg-neutral-900/40 border border-neutral-800/60 rounded-xl overflow-hidden hover:border-amber-500/30 transition-all duration-300 flex flex-col">
      {/* Image Container */}
      <div 
        onClick={() => onSelect(product)}
        className="relative aspect-[4/5] bg-neutral-950 overflow-hidden cursor-pointer"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />

        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
            title="Inspect item"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd(product);
            }}
            className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-medium backdrop-blur-md transition-colors flex items-center gap-1.5 shadow-lg"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Category tag */}
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-neutral-950/70 backdrop-blur-md border border-white/10 text-[10px] font-mono uppercase tracking-widest text-neutral-300">
          {product.category}
        </div>
      </div>

      {/* Info Container */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 
            onClick={() => onSelect(product)}
            className="text-sm font-medium text-white group-hover:text-amber-300 transition-colors cursor-pointer"
          >
            {product.name}
          </h3>
          <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{product.tagline}</p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-800/40">
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-sm font-semibold text-white">${product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-neutral-500 line-through">${product.originalPrice}</span>
            )}
          </div>
          <span className="text-[10px] font-mono text-neutral-500">{product.stock} in atelier</span>
        </div>
      </div>
    </div>
  );
};
