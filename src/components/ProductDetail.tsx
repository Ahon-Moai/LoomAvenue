import React, { useState } from 'react';
import { Product } from '../types';
import { X, Check, ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, size?: string, color?: string) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, onClose, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes ? product.sizes[0] : '');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors ? product.colors[0] : '');
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, selectedSize, selectedColor);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-neutral-950/60 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Side */}
        <div className="md:w-1/2 aspect-[4/5] md:aspect-auto bg-neutral-950 relative overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details Side */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-amber-500 mb-2">
              <Sparkles className="w-3 h-3" />
              <span>{product.category} • {product.collection}</span>
            </div>

            <h2 className="text-xl md:text-2xl font-serif text-white mb-2">{product.name}</h2>
            <p className="text-xs text-neutral-400 mb-4">{product.tagline}</p>

            <div className="flex items-baseline gap-3 mb-6 font-mono">
              <span className="text-2xl font-semibold text-white">${product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-neutral-500 line-through">${product.originalPrice}</span>
              )}
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed mb-6 font-light">
              {product.description}
            </p>

            {/* Size Options */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-5">
                <span className="block text-xs uppercase font-mono tracking-wider text-neutral-400 mb-2">
                  Select Size
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                        selectedSize === s
                          ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Options */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <span className="block text-xs uppercase font-mono tracking-wider text-neutral-400 mb-2">
                  Palette: <strong className="text-white font-normal">{selectedColor}</strong>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3 py-1 rounded-full text-xs font-sans border transition-all ${
                        selectedColor === c
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                          : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Craft Details */}
            <div className="border-t border-neutral-800 pt-4 mb-6">
              <span className="block text-xs uppercase font-mono tracking-wider text-neutral-400 mb-2">
                Atelier Notes
              </span>
              <ul className="space-y-1.5 text-xs text-neutral-400">
                {product.details.map((d, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Add to Bag CTA */}
          <div className="pt-4 border-t border-neutral-800">
            <button
              onClick={handleAdd}
              className={`w-full py-3.5 rounded-xl font-medium text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                addedAnimation
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg shadow-amber-950/20'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-4 h-4" /> Added to Bag
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" /> Add to Bag — ${product.price}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
