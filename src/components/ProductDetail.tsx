/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Leaf, BookOpen, Star, Sparkles, CheckCircle2, ArrowLeft } from 'lucide-react';
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

  const handleBuyNowClick = () => {
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
  };

  return (
    <div id="product-detail-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md sm:p-6 md:p-12">
      {/* Click outside backdrop close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Full screen mobile / centered desktop panel with crisp light theme */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 15 }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className="relative w-full h-full max-w-6xl mx-auto sm:h-[90vh] sm:rounded-2xl bg-[#fcfbfa] text-stone-900 shadow-2xl flex flex-col md:flex-row overflow-y-auto md:overflow-hidden z-10 border border-stone-200"
      >
        {/* Mobile Sticky Header/Close Button (Clean arrow back like a real page navigation) */}
        <div className="sticky top-0 z-50 w-full bg-[#fcfbfa]/90 backdrop-blur-md border-b border-stone-100 px-4 py-3 flex items-center justify-between md:hidden">
          <button
            onClick={onClose}
            className="p-1.5 -ml-1 text-stone-800 hover:text-stone-950 flex items-center gap-1 text-xs font-semibold"
            title="Back to Catalog"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Shop</span>
          </button>
          <span className="text-[10px] font-mono tracking-widest text-stone-500 uppercase">
            Product details
          </span>
          <button
            onClick={onClose}
            className="p-1 text-stone-500 hover:text-stone-900"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Left Side: Product Image Display with customized mobile sizing */}
        <div className="w-full md:w-1/2 h-[35vh] sm:h-[45vh] md:h-full bg-stone-50/60 flex flex-col p-4 sm:p-8 shrink-0 justify-center items-center relative border-b border-stone-200/60 md:border-b-0 md:border-r border-stone-200">
          {/* Desktop Back Arrow button */}
          <button
            onClick={onClose}
            className="absolute top-6 left-6 z-10 p-2 bg-white hover:bg-stone-100 rounded-full text-stone-800 transition-colors hidden md:flex border border-stone-200 shadow-sm items-center justify-center"
            title="Back to catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 relative w-full h-full rounded-xl overflow-hidden bg-white border border-stone-200/50 flex items-center justify-center p-4">
            <img
              src={currentImage}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain drop-shadow-md"
            />
          </div>

          {/* Thumbnail Gallery */}
          {(product.additionalImages && product.additionalImages.length > 0) && (
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-3 mt-2 max-w-full shrink-0">
              <button 
                onClick={() => setCurrentImage(product.imageUrl)}
                className={`relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all bg-white ${currentImage === product.imageUrl ? 'border-black ring-2 ring-black/10' : 'border-stone-200 opacity-70 hover:opacity-100'}`}
              >
                <img src={product.imageUrl} alt={`${product.name} thumbnail`} className="w-full h-full object-contain p-1" />
              </button>
              {product.additionalImages.map((imgUrl, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentImage(imgUrl)}
                  className={`relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all bg-white ${currentImage === imgUrl ? 'border-black ring-2 ring-black/10' : 'border-stone-200 opacity-70 hover:opacity-100'}`}
                >
                  <img src={imgUrl} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Information Details & Clean Buy Section */}
        <div className="w-full md:w-1/2 h-full flex flex-col bg-[#fcfbfa]">
          <div className="flex-1 overflow-y-auto no-scrollbar p-5 sm:p-10 pb-24 md:pb-28">
            {/* Desktop Category Display */}
            <div className="hidden md:flex items-center justify-between mb-6">
              <span className="font-mono text-[9px] tracking-[0.25em] text-stone-500 uppercase">
                {product.category.replace('-', ' ')} / catalogue
              </span>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-stone-100 rounded-full text-stone-600 hover:text-stone-900 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title & Static/Base Price */}
            <div className="mb-6">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight mb-2">
                {product.name}
              </h2>

              {!product.offers || product.offers.length === 0 ? (
                <div className="mt-2 flex items-center gap-3">
                  <span className="font-mono text-xl sm:text-2xl font-bold text-stone-900">
                    TK {product.price.toFixed(2)}
                  </span>
                  <span className="px-2.5 py-1 bg-stone-100 border border-stone-200 rounded text-[10px] font-mono uppercase tracking-wider text-stone-600 font-semibold">
                    Standard Deal
                  </span>
                </div>
              ) : null}
            </div>

            {/* Highly Simplified Bundle Offers Selection */}
            {product.offers && product.offers.length > 0 && (
              <div className="mb-6 space-y-3.5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] tracking-wider text-stone-500 uppercase font-bold">Select Buying Option:</span>
                  <div className="h-px bg-stone-200 flex-1" />
                </div>

                {/* Standard Price Option */}
                <div
                  onClick={() => setSelectedOfferId(null)}
                  className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    selectedOfferId === null
                      ? 'bg-stone-50 border-black shadow-sm'
                      : 'bg-white border-stone-200/80 hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                        selectedOfferId === null ? 'border-black text-black' : 'border-stone-300'
                      }`}>
                        {selectedOfferId === null && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                      </div>
                      <div>
                        <span className="font-sans text-xs font-bold tracking-wide uppercase text-stone-950">
                          Single Purchase
                        </span>
                        <p className="text-[11px] text-stone-500 mt-0.5 font-sans">Buy 1 item at standard catalog rate</p>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-bold text-stone-900">
                      TK {product.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Offers */}
                {product.offers.map(offer => {
                  const isSelected = selectedOfferId === offer.id;

                  // Calculate combined original price of main cap + selected bundle caps
                  let originalPrice = product.price;
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
                    <div
                      key={offer.id}
                      className={`relative border-2 rounded-xl p-4 transition-all ${
                        isSelected
                          ? 'bg-stone-50 border-black shadow-sm'
                          : 'bg-white border-stone-200/80 hover:border-stone-400'
                      }`}
                    >
                      <div onClick={() => setSelectedOfferId(offer.id)} className="cursor-pointer">
                        {offer.badgeText && (
                          <div className="absolute -top-3.5 right-4 px-2.5 py-1 rounded bg-black text-white text-[9px] font-mono tracking-wider font-bold shadow-sm uppercase">
                            {offer.badgeText}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-black' : 'border-stone-300'
                            }`}>
                              {isSelected && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                            </div>
                            <div>
                              <span className="font-sans text-xs font-bold tracking-wide uppercase text-stone-950">
                                {offer.title}
                              </span>
                              <p className="text-[11px] text-stone-600 mt-0.5">
                                {offer.quantity > 1 
                                  ? `Get ${offer.quantity} items of your choice (${discountPercentage}% OFF)`
                                  : `Special promo discount deal (${discountPercentage}% OFF)`
                                }
                              </p>
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end shrink-0">
                            <span className="font-mono text-sm font-bold text-stone-900">
                              TK {finalPrice.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-stone-400 line-through font-mono">
                              TK {originalPrice.toFixed(0)}
                            </span>
                          </div>
                        </div>

                        {offer.freeShipping && (
                          <div className="mt-2.5 ml-7.5 py-1.5 px-3 bg-emerald-50 text-emerald-800 rounded-lg text-[10px] font-sans font-bold flex items-center gap-1.5 border border-emerald-100 w-fit">
                            <span>🚚</span>
                            <span>INCLUDES FREE DELIVERY</span>
                          </div>
                        )}
                      </div>

                      {/* Expanded Bundle Picker Details with simplified, elegant visual feedback */}
                      {isSelected && offer.quantity > 1 && (
                         <div className="mt-4 pt-4 border-t border-stone-200/80 ml-7.5 space-y-3">
                           <div className="text-[10px] font-mono font-bold uppercase text-stone-600 tracking-wider">
                             Selected Pack Items ({1 + bundleSelections.length} of {offer.quantity}):
                           </div>

                           {/* Main cap */}
                           <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-stone-200 shadow-2xs">
                             <div className="flex items-center gap-2.5">
                               <img src={product.imageUrl} className="w-9 h-9 rounded object-contain bg-stone-50 p-1 border border-stone-100" alt={product.name} />
                               <div className="flex flex-col">
                                 <span className="text-stone-900 text-[11px] font-bold uppercase truncate max-w-[160px]">{product.name}</span>
                                 <span className="text-stone-500 text-[10px] font-mono">Item 1 (This choice)</span>
                               </div>
                             </div>
                             <span className="text-[9px] font-mono bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-bold">Standard</span>
                           </div>

                           {/* Bundled Selected Items */}
                           {bundleSelections.map((sel, idx) => (
                             <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg border border-stone-200 shadow-2xs">
                               <div className="flex items-center gap-2.5">
                                 <img src={sel.imageUrl} className="w-9 h-9 rounded object-contain bg-stone-50 p-1 border border-stone-100" alt={sel.name} />
                                 <div className="flex flex-col">
                                   <span className="text-stone-900 text-[11px] font-bold uppercase truncate max-w-[160px]">{sel.name}</span>
                                   <span className="text-stone-500 text-[10px] font-mono">Item {idx + 2}</span>
                                 </div>
                               </div>
                               <div className="flex items-center gap-2">
                                 <button
                                   onClick={() => {
                                      const newSel = [...bundleSelections];
                                      newSel.splice(idx, 1);
                                      setBundleSelections(newSel);
                                   }}
                                   className="p-1 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded transition-colors"
                                   title="Remove item"
                                 >
                                   <X className="w-3.5 h-3.5" />
                                 </button>
                               </div>
                             </div>
                           ))}

                           {/* Trigger choice modal for missing pack items */}
                           {bundleSelections.length < offer.quantity - 1 && (
                             <button
                                type="button"
                                onClick={() => setIsBundleModalOpen(true)}
                                className="w-full bg-stone-900 hover:bg-stone-800 text-white text-[10px] font-bold py-2.5 px-4 rounded-lg uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                             >
                               <span>Choose Pack Item #{bundleSelections.length + 2}</span>
                               <span>➕</span>
                             </button>
                           )}

                           {/* Savings Calculator Summary Box */}
                           <div className="p-3 bg-stone-100/50 rounded-lg border border-stone-200/80 space-y-1 font-mono text-[10px] text-stone-700">
                             <div className="flex justify-between">
                               <span>Combined Items Price:</span>
                               <span>TK {originalPrice.toFixed(2)}</span>
                             </div>
                             <div className="flex justify-between text-emerald-700 font-bold">
                               <span>Bundle Discount:</span>
                               <span>- TK {discount.toFixed(2)}</span>
                             </div>
                             <div className="flex justify-between text-stone-900 font-bold text-xs pt-1 border-t border-stone-200">
                               <span>Final Price:</span>
                               <span>TK {finalPrice.toFixed(2)}</span>
                             </div>
                           </div>
                         </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Description Details */}
            <div className="mb-6">
              <span className="block font-mono text-[10px] tracking-wider text-stone-500 uppercase mb-1.5">Description:</span>
              <p className="text-sm text-stone-700 leading-relaxed font-sans">
                {product.description}
              </p>
            </div>

            {/* Available Sizes selection */}
            {product.sizes.length > 0 && product.sizes[0] !== 'One Size' && (
              <div className="mb-8">
                <span className="block font-mono text-[10px] tracking-wider text-stone-500 uppercase mb-2">
                  Select Fit Size:
                </span>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] h-[40px] px-3 font-mono text-xs rounded-lg border transition-all duration-150 ${
                        selectedSize === size
                          ? 'bg-black text-white border-black shadow-sm font-bold focus:outline-none'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Consolidated Single Scrollable details area (Instead of complicated navigation tabs) */}
            <div className="border-t border-stone-200 pt-6 space-y-5">
              <h3 className="font-mono text-[10px] tracking-widest text-stone-500 uppercase font-bold border-b border-stone-100 pb-2">
                Product Details & Composition
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-2 text-stone-700">
                  <Leaf className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-stone-900 block font-semibold">Materials & Production:</strong>
                    <span>{product.materials || 'Sustainably sourced premium fabrics'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-stone-700">
                  <Sparkles className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-stone-900 block font-semibold">Signature Features:</strong>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      {product.features && product.features.length > 0 ? (
                        product.features.map((feat, i) => (
                          <li key={i}>{feat}</li>
                        ))
                      ) : (
                        <li>Crafted with uncompromised quality standards</li>
                      )}
                    </ul>
                  </div>
                </div>

                {product.story && (
                  <div className="flex items-start gap-2 text-stone-700">
                    <BookOpen className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <strong className="text-stone-900 block font-semibold">Our Story:</strong>
                      <p className="leading-relaxed text-stone-600 mt-1 italic">{product.story}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Elegant Sticky Action Buy Panel Footer */}
          <div className="absolute md:absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md px-5 py-4 border-t border-stone-200 z-40">
            <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAdd}
                disabled={!product.inStock}
                className={`flex-1 py-3.5 px-6 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all duration-300 active:scale-98 flex items-center justify-center gap-2 border ${
                  product.inStock
                    ? 'bg-white text-stone-900 border-stone-800 hover:bg-stone-50 shadow-xs cursor-pointer'
                    : 'bg-stone-100 text-stone-400 border-transparent cursor-not-allowed'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{product.inStock ? 'ADD TO CART' : 'Sold Out'}</span>
              </button>

              <button
                onClick={handleBuyNowClick}
                disabled={!product.inStock}
                className={`flex-1 py-3.5 px-6 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all duration-300 active:scale-98 flex items-center justify-center gap-2 ${
                  product.inStock
                    ? 'bg-black text-white hover:bg-stone-900 shadow-md cursor-pointer'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <span>{product.inStock ? 'BUY IT NOW' : 'Sold Out'}</span>
              </button>
            </div>

            {/* Float added notice */}
            <AnimatePresence>
              {addedNotice && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-6 right-6 -top-12 bg-stone-900 text-white py-2.5 px-4 rounded-lg text-center text-[10px] font-mono tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl border border-stone-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Added {product.name} ({selectedSize}) To Basket</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Beautiful Light themed Pack Selection Inner Modal */}
        <AnimatePresence>
          {isBundleModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white w-full max-w-md rounded-xl shadow-2xl flex flex-col max-h-[75vh] overflow-hidden relative border border-stone-200 text-stone-900"
              >
                <div className="flex items-center justify-between p-4 border-b border-stone-200">
                  <h3 className="font-sans text-xs tracking-widest uppercase font-bold text-stone-800">Choose Pack Item</h3>
                  <button onClick={() => setIsBundleModalOpen(false)} className="text-stone-500 hover:text-stone-900">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/50">
                  {allProducts.filter(p => p.id !== product.id).map(p => (
                    <div key={p.id} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-stone-200 shadow-2xs">
                       <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded object-contain bg-stone-50 p-1 border border-stone-100 shrink-0" />
                       <div className="flex-1 min-w-0">
                          <div className="text-stone-900 text-[11px] font-bold uppercase truncate">{p.name}</div>
                          <div className="text-stone-500 text-[10px] font-mono mt-0.5">Tk {p.price.toFixed(0)}</div>
                       </div>
                       <button
                          onClick={() => {
                            setBundleSelections([...bundleSelections, p]);
                            setIsBundleModalOpen(false);
                          }}
                          className="bg-black text-white px-3 py-1.5 rounded text-[10px] uppercase tracking-wider font-bold hover:bg-stone-800 transition-colors cursor-pointer"
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
