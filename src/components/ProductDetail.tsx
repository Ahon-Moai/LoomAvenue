/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Leaf, BookOpen, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { Product, Offer } from '../types';
import { trackEvent } from '../pixel';

interface ProductDetailProps {
  product: Product;
  allProducts: Product[];
  onClose: () => void;
  onAddToCart: (product: Product, size: string, offer?: Offer, bundleSelections?: Product[]) => void;
  onBuyNow?: (product: Product, size: string, offer?: Offer, bundleSelections?: Product[]) => void;
}

export default function ProductDetail({ product, allProducts, onClose, onAddToCart, onBuyNow }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'One Size');
  const [activeTab, setActiveTab] = useState<'materials' | 'story' | 'care'>('materials');
  const [addedNotice, setAddedNotice] = useState<boolean>(false);
  const [currentImage, setCurrentImage] = useState<string>(product.imageUrl);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  
  const [bundleSelections, setBundleSelections] = useState<Product[]>([]);
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  
  // reset bundle selections if selected offer changes
  useEffect(() => {
    setBundleSelections([]);
  }, [selectedOfferId]);

  useEffect(() => {
    trackEvent('ViewContent', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      currency: 'BDT',
      value: product.price
    });
  }, [product]);

  const handleAdd = () => {
    const offer = product.offers?.find(o => o.id === selectedOfferId);
    
    // Check if bundle selections are complete
    if (offer && offer.quantity > 1) {
      if (bundleSelections.length < offer.quantity - 1) {
        alert(`Please select ${offer.quantity - 1 - bundleSelections.length} more item(s) for this offer.`);
        return;
      }
    }
    
    onAddToCart(product, selectedSize, offer, bundleSelections);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2400);
  };

  return (
    <div id="product-detail-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md sm:p-6 md:p-12">
      {/* Click outside backdrop close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Full screen modal panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 20 }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        className="relative w-full h-full max-w-6xl mx-auto sm:h-[90vh] sm:rounded-2xl bg-[#13110d]/95 backdrop-blur-3xl shadow-2xl flex flex-col md:flex-row overflow-y-auto md:overflow-hidden z-10 border border-white/20"
      >
        {/* Close Button Mobile (Absolute) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-50 p-2.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors md:hidden border border-white/20 shadow-lg"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Images */}
        <div className="w-full md:w-1/2 min-h-[58vh] sm:min-h-[50vh] md:h-full bg-black/30 flex flex-col p-3 sm:p-8 shrink-0">
          <div className="flex-1 relative w-full min-h-[320px] sm:min-h-[380px] rounded-xl overflow-hidden bg-white/5 border border-white/10 mb-3 sm:mb-4 flex items-center justify-center transition-opacity duration-300">
            <img
              src={currentImage}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain p-1 sm:p-4"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Thumbnail Gallery */}
          {(product.additionalImages && product.additionalImages.length > 0) && (
            <div className="flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-1">
              <button 
                onClick={() => setCurrentImage(product.imageUrl)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all bg-white/5 ${currentImage === product.imageUrl ? 'border-white ring-2 ring-white/30' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={product.imageUrl} alt={`${product.name} thumbnail`} className="w-full h-full object-contain p-1" />
              </button>
              {product.additionalImages.map((imgUrl, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentImage(imgUrl)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all bg-white/5 ${currentImage === imgUrl ? 'border-white ring-2 ring-white/30' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={imgUrl} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Details & Actions */}
        <div className="w-full md:w-1/2 h-full flex flex-col bg-white/5 border-l border-white/10">
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 sm:p-10">
            {/* Header row with close button for Desktop */}
            <div className="hidden md:flex items-center justify-between mb-8">
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
            
            {/* Mobile category text */}
            <div className="md:hidden mb-4">
              <span className="font-mono text-[9px] tracking-[0.25em] text-white/60 uppercase">
                {product.category.replace('-', ' ')} / catalogue
              </span>
            </div>

          {/* Title & Offers */}
          <div className="mb-4">
            <h2 className="font-serif italic text-2xl sm:text-3xl text-white tracking-tight mb-6">
              {product.name}
            </h2>

            {product.offers && product.offers.length > 0 ? (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-px bg-white/20 flex-1" />
                  <span className="font-mono text-[10px] tracking-wider text-white/50 uppercase">GET MORE SAVE MORE</span>
                  <div className="h-px bg-white/20 flex-1" />
                </div>

                <div className="space-y-3 mb-6">
                  {/* Standard Price */}
                  <label className={`block relative border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedOfferId === null ? 'bg-white border-white' : 'bg-white/5 border-white/20 hover:border-white/50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedOfferId === null ? 'border-black' : 'border-white/50'
                        }`}>
                          {selectedOfferId === null && <div className="w-2 h-2 bg-black rounded-full" />}
                        </div>
                        <span className={`font-mono text-sm tracking-wider font-bold uppercase ${
                          selectedOfferId === null ? 'text-black' : 'text-white'
                        }`}>
                          STANDARD PRICE
                        </span>
                      </div>
                      <span className={`font-mono text-sm font-bold ${
                        selectedOfferId === null ? 'text-black' : 'text-white'
                      }`}>
                        TK {product.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 ml-7">
                       <img src={product.imageUrl} alt="" className="w-8 h-8 rounded border border-black/10 object-contain bg-black/5" />
                       <span className={`text-xs uppercase font-mono tracking-wide ${
                         selectedOfferId === null ? 'text-black/70' : 'text-white/70'
                       }`}>
                         {product.name}
                       </span>
                    </div>
                    <input 
                      type="radio" 
                      name="offer" 
                      value="standard" 
                      className="hidden" 
                      checked={selectedOfferId === null} 
                      onChange={() => setSelectedOfferId(null)} 
                    />
                  </label>

                  {/* Offers */}
                  {product.offers.map(offer => {
                    const isSelected = selectedOfferId === offer.id;

                    // Calculate combined original price of main cap + selected bundle caps
                    let originalPrice = product.price;
                    const hasAllSelections = !isSelected || offer.quantity <= 1 || bundleSelections.length >= offer.quantity - 1;

                    if (isSelected && offer.quantity > 1) {
                      for (let i = 0; i < offer.quantity - 1; i++) {
                        if (bundleSelections[i]) {
                          originalPrice += bundleSelections[i].price;
                        } else {
                          originalPrice += product.price; // fallback estimate before choice
                        }
                      }
                    } else {
                      originalPrice = product.price * offer.quantity;
                    }

                    const discountPercentage = offer.discountPercentage || 0;
                    const discount = offer.fixedDiscount 
                      ? offer.fixedDiscount 
                      : (discountPercentage > 0 ? (originalPrice * (discountPercentage / 100)) : 0);
                    const finalPrice = Math.max(0, originalPrice - discount);

                    return (
                      <div key={offer.id} className={`block relative border rounded-lg p-4 transition-all ${
                        isSelected ? 'bg-white border-white' : 'bg-white/5 border-white/20 hover:border-white/50'
                      }`}>
                        <div onClick={() => setSelectedOfferId(offer.id)} className="cursor-pointer">
                          {offer.badgeText && (
                            <div className={`absolute -top-3 right-4 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-bold ${offer.badgeColor || 'bg-black text-white'}`}>
                              {offer.badgeText}
                            </div>
                          )}

                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? 'border-black' : 'border-white/50'
                              }`}>
                                {isSelected && <div className="w-2 h-2 bg-black rounded-full" />}
                              </div>
                              <span className={`font-mono text-sm tracking-wider font-bold uppercase ${
                                isSelected ? 'text-black' : 'text-white'
                              }`}>
                                {offer.title}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className={`font-mono text-sm font-bold ${
                                isSelected ? 'text-black' : 'text-white'
                              }`}>
                                TK {finalPrice.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between ml-7">
                            <div className="flex flex-col">
                              <span className={`text-xs ${
                                isSelected ? 'text-black/70 font-medium' : 'text-white/60'
                              }`}>
                                {offer.quantity > 1 
                                  ? `Choose ${offer.quantity} caps (${discountPercentage}% OFF) 👇`
                                  : `Special Deal (${discountPercentage}% OFF)`
                                }
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={`text-xs line-through ${
                                isSelected ? 'text-black/40' : 'text-white/40'
                              }`}>
                                TK {originalPrice.toFixed(2)}
                              </span>
                              {discount > 0 && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono mt-1 ${offer.highlightColor || 'bg-red-500 text-white'}`}>
                                  SAVE TK {discount.toFixed(0)} ({discountPercentage}% OFF)
                                </span>
                              )}
                            </div>
                          </div>

                          {offer.freeShipping && (
                            <div className={`mt-3 ml-7 py-2 px-3 rounded flex items-center gap-2 text-xs font-bold ${
                              isSelected ? 'bg-black/5 text-black' : 'bg-white/10 text-white'
                            }`}>
                              <div className="w-3 h-3 bg-black/10 rounded flex items-center justify-center">
                                <span className="text-[8px]">🚚</span>
                              </div>
                              {offer.discountPercentage ? `${offer.discountPercentage}% OFF + ` : ''}FREE SHIPPING
                            </div>
                          )}
                        </div>

                        {isSelected && offer.quantity > 1 && (
                           <div className="mt-4 pt-4 border-t border-black/10 ml-7 space-y-3">
                             <div className="text-[11px] font-mono font-bold uppercase text-black/70">
                               Selected Bundle Items ({1 + bundleSelections.length}/{offer.quantity}):
                             </div>

                             {/* Cap 1: Main Product */}
                             <div className="flex items-center justify-between bg-black/5 p-2 rounded-lg">
                               <div className="flex items-center gap-3">
                                 <img src={product.imageUrl} className="w-10 h-10 rounded object-contain bg-white p-1 border border-black/10" alt={product.name} />
                                 <div className="flex flex-col">
                                   <span className="text-black text-[11px] font-bold uppercase">{product.name}</span>
                                   <span className="text-black/60 text-[10px] font-mono">TK {product.price.toFixed(2)}</span>
                                 </div>
                               </div>
                               <span className="text-[10px] font-mono bg-black/10 text-black px-2 py-0.5 rounded font-bold">Cap 1</span>
                             </div>
                             
                             {/* Cap 2..N: Selected bundle caps */}
                             {bundleSelections.map((sel, idx) => (
                               <div key={idx} className="flex items-center justify-between bg-black/5 p-2 rounded-lg">
                                 <div className="flex items-center gap-3">
                                   <img src={sel.imageUrl} className="w-10 h-10 rounded object-contain bg-white p-1 border border-black/10" alt={sel.name} />
                                   <div className="flex flex-col">
                                     <span className="text-black text-[11px] font-bold uppercase">{sel.name}</span>
                                     <span className="text-black/60 text-[10px] font-mono">TK {sel.price.toFixed(2)}</span>
                                   </div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <span className="text-[10px] font-mono bg-black/10 text-black px-2 py-0.5 rounded font-bold">Cap {idx + 2}</span>
                                   <button onClick={() => {
                                      const newSel = [...bundleSelections];
                                      newSel.splice(idx, 1);
                                      setBundleSelections(newSel);
                                   }} className="p-1 text-black/50 hover:text-black hover:bg-black/10 rounded transition-colors" title="Remove cap">
                                     <X className="w-4 h-4" />
                                   </button>
                                 </div>
                               </div>
                             ))}

                             {/* Button to choose next cap if needed */}
                             {bundleSelections.length < offer.quantity - 1 && (
                               <div className="flex items-center gap-3 pt-1">
                                 <button 
                                    onClick={() => setIsBundleModalOpen(true)}
                                    className="w-10 h-10 rounded-lg border-2 border-dashed border-black/30 flex items-center justify-center hover:bg-black/5 text-black transition-colors"
                                 >
                                   <span className="text-xl leading-none font-bold">+</span>
                                 </button>
                                 <button 
                                    onClick={() => setIsBundleModalOpen(true)}
                                    className="bg-black text-white text-[11px] font-bold px-4 py-2.5 rounded-lg uppercase tracking-wider hover:bg-black/80 transition-all shadow-sm flex items-center gap-2"
                                 >
                                   <span>Select Cap {bundleSelections.length + 2}</span>
                                   <span className="text-xs">👉</span>
                                 </button>
                               </div>
                             )}

                             {/* Real-time total breakdown summary box */}
                             <div className="mt-3 p-3 bg-black/5 rounded-lg border border-black/10 space-y-1 font-mono text-[11px]">
                               <div className="flex justify-between text-black/70">
                                 <span>Combined Price:</span>
                                 <span>TK {originalPrice.toFixed(2)}</span>
                               </div>
                               <div className="flex justify-between text-red-600 font-bold">
                                 <span>Discount ({discountPercentage}% OFF):</span>
                                 <span>- TK {discount.toFixed(2)}</span>
                               </div>
                               <div className="flex justify-between text-black font-bold text-xs pt-1 border-t border-black/10">
                                 <span>Final Offer Price:</span>
                                 <span>TK {finalPrice.toFixed(2)}</span>
                               </div>
                             </div>
                           </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <span className="font-mono text-lg font-semibold text-white">
                TK {product.price ? product.price.toFixed(2) : '0.00'}
              </span>
            )}
          </div>

          {/* Text Description */}
          <p className="text-sm text-white/80 leading-relaxed font-sans mb-6">
            {product.description ? product.description.replace(
              'Meticulously sourced premium fabrics, perfected through strict quality control. Investing in a cap means securing a flawless win.',
              'Meticulously sourced premium fabrics, perfected through strict quality control. Investing in a cap means securing a flawless win'
            ).replace(
              'Investing in a cap means securing a flawless win.',
              'Investing in a cap means securing a flawless win'
            ) : ''}
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
          <div className="flex flex-col gap-3">
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className={`w-full relative group py-4 px-6 rounded-lg font-display text-xs tracking-widest uppercase transition-all duration-300 transform active:scale-98 flex items-center justify-center gap-2.5 border ${
                product.inStock
                  ? 'bg-transparent hover:bg-white/10 text-white border-white shadow-lg'
                  : 'bg-white/10 text-white/40 cursor-not-allowed border-transparent'
              }`}
            >
              <span>{product.inStock ? 'ADD TO CART' : 'Sold Out'}</span>
            </button>
            <button
              onClick={() => {
                if (product.inStock) {
                  const offer = product.offers?.find(o => o.id === selectedOfferId);
                  
                  if (offer && offer.quantity > 1) {
                    if (bundleSelections.length < offer.quantity - 1) {
                      alert(`Please select ${offer.quantity - 1 - bundleSelections.length} more item(s) for this offer.`);
                      return;
                    }
                  }
                  
                  if (onBuyNow) {
                    onBuyNow(product, selectedSize, offer, bundleSelections);
                  } else {
                    handleAdd();
                  }
                }
              }}
              disabled={!product.inStock}
              className={`w-full relative group py-4 px-6 rounded-lg font-display text-xs tracking-widest uppercase transition-all duration-300 transform active:scale-98 flex items-center justify-center gap-2.5 ${
                product.inStock
                  ? 'bg-black hover:bg-black/80 text-white shadow-lg'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              <span>{product.inStock ? 'BUY IT NOW' : 'Sold Out'}</span>
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
        </div>
        {/* Bundle Selection Modal */}
        <AnimatePresence>
          {isBundleModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden relative border border-white/20"
              >
                <div className="flex items-center justify-between p-4 border-b border-black/10">
                  <h3 className="font-mono text-xs tracking-widest uppercase font-bold text-black">Select Caps Here</h3>
                  <button onClick={() => setIsBundleModalOpen(false)} className="text-black/50 hover:text-black">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 border-b border-black/10">
                  <input 
                     type="text" 
                     placeholder="Search" 
                     className="w-full border border-black/10 rounded-lg px-4 py-2 text-sm text-black focus:outline-none focus:border-black/30 bg-black/5" 
                  />
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                  {allProducts.filter(p => p.id !== product.id).map(p => (
                    <div key={p.id} className="flex items-center gap-4">
                       <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-lg object-contain bg-black/5 p-2" />
                       <div className="flex-1">
                          <div className="text-black text-[11px] font-bold uppercase mb-1">{p.name}</div>
                          <div className="text-black/60 text-xs font-mono">Tk {p.price.toFixed(0)}</div>
                       </div>
                       <button
                          onClick={() => {
                            setBundleSelections([...bundleSelections, p]);
                            setIsBundleModalOpen(false);
                          }}
                          className="bg-black text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-black/80 transition-colors"
                       >
                         Choose
                       </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
