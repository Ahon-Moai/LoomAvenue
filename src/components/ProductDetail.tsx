/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Ruler, Eye, ExternalLink } from 'lucide-react';
import { Product, Offer } from '../types';
import { trackEvent } from '../pixel';

const FITTED_SIZE_GUIDE_IMAGE = 'https://ik.imagekit.io/t1q0n1ovm/WhatsApp%20Image%202026-10-04%20at%2023.05.33.jpeg';

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
  const [showFittedGuideModal, setShowFittedGuideModal] = useState<boolean>(false);
  
  const isFittedCap = product.category?.toLowerCase().includes('fitted') || product.name?.toLowerCase().includes('fitted');
  
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

  const handleBuyNow = () => {
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
  };

  const allImages = [product.imageUrl, ...(product.additionalImages || [])];

  return (
    <div id="product-detail-page" className="fixed inset-0 z-[100] bg-white overflow-y-auto text-black flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Close">
          <X className="w-6 h-6" />
        </button>
        <span className="font-mono text-[10px] tracking-widest uppercase text-gray-500">
          {product.category.replace('-', ' ')}
        </span>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      <div className="flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-12 gap-8 lg:gap-16">
        
        {/* Left Side: Images */}
        <div className="w-full md:w-1/2 flex flex-col space-y-4">
          <div className="w-full aspect-[4/5] sm:aspect-square bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-0 sm:p-4">
            <img
              src={currentImage}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain mix-blend-multiply scale-110 sm:scale-100"
            />
          </div>
          
          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {allImages.map((imgUrl, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentImage(imgUrl)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden shrink-0 transition-all bg-gray-50 ${currentImage === imgUrl ? 'ring-2 ring-black border-2 border-white' : 'border border-gray-200 hover:border-gray-400'}`}
                >
                  <img src={imgUrl} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-contain p-2 mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Details & Actions */}
        <div className="w-full md:w-1/2 flex flex-col">
          <h1 className="text-3xl font-serif text-gray-900 mb-6">{product.name}</h1>
          
          {/* Offers & Price */}
          <div className="mb-6">
            {product.offers && product.offers.length > 0 ? (
              <div className="space-y-3">
                {/* Standard Price */}
                <label className={`block relative border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedOfferId === null ? 'bg-gray-50 border-gray-900' : 'bg-white border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedOfferId === null ? 'border-gray-900' : 'border-gray-300'
                      }`}>
                        {selectedOfferId === null && <div className="w-2 h-2 bg-gray-900 rounded-full" />}
                      </div>
                      <span className="font-mono text-sm tracking-wider font-bold uppercase text-gray-900">
                        STANDARD PRICE
                      </span>
                    </div>
                    <span className="font-mono text-sm font-bold text-gray-900">
                      TK {product.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 ml-7">
                     <img src={product.imageUrl} alt="" className="w-8 h-8 rounded border border-gray-200 object-contain bg-white" />
                     <span className="text-xs uppercase font-mono tracking-wide text-gray-600">
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
                      isSelected ? 'bg-gray-50 border-gray-900' : 'bg-white border-gray-200 hover:border-gray-300'
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
                              isSelected ? 'border-gray-900' : 'border-gray-300'
                            }`}>
                              {isSelected && <div className="w-2 h-2 bg-gray-900 rounded-full" />}
                            </div>
                            <span className="font-mono text-sm tracking-wider font-bold uppercase text-gray-900">
                              {offer.title}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-sm font-bold text-gray-900">
                              TK {finalPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between ml-7">
                          <div className="flex flex-col">
                            <span className={`text-xs ${
                              isSelected ? 'text-gray-900 font-medium' : 'text-gray-500'
                            }`}>
                              {offer.quantity > 1 
                                ? `Choose ${offer.quantity} items (${discountPercentage}% OFF) 👇`
                                : `Special Deal (${discountPercentage}% OFF)`
                              }
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`text-xs line-through ${
                              isSelected ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              TK {originalPrice.toFixed(2)}
                            </span>
                            {discount > 0 && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono mt-1 ${offer.highlightColor || 'bg-red-50 text-red-600 border border-red-200'}`}>
                                SAVE TK {discount.toFixed(0)} ({discountPercentage}% OFF)
                              </span>
                            )}
                          </div>
                        </div>

                        {offer.freeShipping && (
                          <div className={`mt-3 ml-7 py-2 px-3 rounded flex items-center gap-2 text-xs font-bold ${
                            isSelected ? 'bg-gray-200/50 text-gray-900' : 'bg-gray-50 text-gray-600'
                          }`}>
                            <div className="w-3 h-3 flex items-center justify-center">
                              <span className="text-[10px]">🚚</span>
                            </div>
                            {offer.discountPercentage ? `${offer.discountPercentage}% OFF + ` : ''}FREE SHIPPING
                          </div>
                        )}
                      </div>

                      {isSelected && offer.quantity > 1 && (
                         <div className="mt-4 pt-4 border-t border-gray-200 ml-7 space-y-3">
                           <div className="text-[11px] font-mono font-bold uppercase text-gray-500">
                             Selected Bundle Items ({1 + bundleSelections.length}/{offer.quantity}):
                           </div>

                           {/* Cap 1: Main Product */}
                           <div className="flex items-center justify-between bg-white border border-gray-100 p-2 rounded-lg shadow-sm">
                             <div className="flex items-center gap-3">
                               <img src={product.imageUrl} className="w-10 h-10 rounded object-contain bg-gray-50 p-1 border border-gray-100" alt={product.name} />
                               <div className="flex flex-col">
                                 <span className="text-gray-900 text-[11px] font-bold uppercase">{product.name}</span>
                                 <span className="text-gray-500 text-[10px] font-mono">TK {product.price.toFixed(2)}</span>
                               </div>
                             </div>
                             <span className="text-[10px] font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold">Item 1</span>
                           </div>
                           
                           {/* Cap 2..N: Selected bundle caps */}
                           {bundleSelections.map((sel, idx) => (
                             <div key={idx} className="flex items-center justify-between bg-white border border-gray-100 p-2 rounded-lg shadow-sm">
                               <div className="flex items-center gap-3">
                                 <img src={sel.imageUrl} className="w-10 h-10 rounded object-contain bg-gray-50 p-1 border border-gray-100" alt={sel.name} />
                                 <div className="flex flex-col">
                                   <span className="text-gray-900 text-[11px] font-bold uppercase">{sel.name}</span>
                                   <span className="text-gray-500 text-[10px] font-mono">TK {sel.price.toFixed(2)}</span>
                                 </div>
                               </div>
                               <div className="flex items-center gap-2">
                                 <span className="text-[10px] font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold">Item {idx + 2}</span>
                                 <button onClick={() => {
                                    const newSel = [...bundleSelections];
                                    newSel.splice(idx, 1);
                                    setBundleSelections(newSel);
                                 }} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Remove item">
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
                                  className="w-10 h-10 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
                               >
                                 <span className="text-xl leading-none font-bold">+</span>
                               </button>
                               <button 
                                  onClick={() => setIsBundleModalOpen(true)}
                                  className="bg-black text-white text-[11px] font-bold px-4 py-2.5 rounded-lg uppercase tracking-wider hover:bg-gray-800 transition-all shadow-sm flex items-center gap-2"
                               >
                                 <span>Select Item {bundleSelections.length + 2}</span>
                                 <span className="text-xs">👉</span>
                               </button>
                             </div>
                           )}

                           {/* Real-time total breakdown summary box */}
                           <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1 font-mono text-[11px]">
                             <div className="flex justify-between text-gray-500">
                               <span>Combined Price:</span>
                               <span>TK {originalPrice.toFixed(2)}</span>
                             </div>
                             <div className="flex justify-between text-red-600 font-bold">
                               <span>Discount ({discountPercentage}% OFF):</span>
                               <span>- TK {discount.toFixed(2)}</span>
                             </div>
                             <div className="flex justify-between text-gray-900 font-bold text-xs pt-1 border-t border-gray-200">
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
            ) : (
              <div className="text-xl font-bold font-mono text-gray-900">
                TK {product.price.toFixed(2)}
              </div>
            )}
          </div>

          {/* Dedicated Size Chart Button for all Fitted Caps */}
          {isFittedCap && (
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 via-orange-50/80 to-amber-50/40 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0 shadow-inner">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-mono tracking-wider text-slate-900 uppercase">
                    Fitted Cap Sizing Chart
                  </h4>
                  <p className="text-[11px] text-slate-600 font-sans mt-0.5 leading-snug">
                    Consult our sizing chart before ordering to find your exact crown fit.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFittedGuideModal(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 shadow-sm shrink-0 cursor-pointer active:scale-95"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Sizing Chart</span>
              </button>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes.length > 0 && product.sizes[0] !== 'One Size' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="block text-sm font-medium text-gray-700">Size:</span>
                {isFittedCap && (
                  <button
                    type="button"
                    onClick={() => setShowFittedGuideModal(true)}
                    className="text-xs font-mono text-amber-700 hover:text-amber-900 font-bold underline flex items-center gap-1 cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5" /> Size Chart
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] h-10 px-4 text-sm font-medium rounded-md border transition-all duration-150 ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mb-8">
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="w-full py-4 px-6 border border-black bg-white text-black font-medium text-sm tracking-wide transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className="w-full py-4 px-6 bg-[#C45E4C] text-white font-medium text-sm tracking-wide transition-all hover:bg-[#a54f40] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy it now
            </button>
          </div>

          {/* Description */}
          <div className="prose prose-sm text-gray-600 mb-8 max-w-none font-sans leading-relaxed">
            <p>{product.description}</p>
          </div>

          {/* Product Highlights */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Product Highlights</h3>
            <ul className="space-y-3 text-sm text-gray-600 font-sans">
              <li className="flex gap-2">
                <span className="min-w-[100px] text-gray-900 font-medium">Material:</span>
                <span>{product.materials}</span>
              </li>
              {product.features && product.features.map((feature, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="min-w-[100px] text-gray-900 font-medium">Detail:</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Care Instructions */}
          {product.story && (
            <div className="mb-8 pb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Care Instructions / Story</h3>
              <p className="text-sm text-gray-600 font-sans leading-relaxed">
                {product.story}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notice Toast */}
      <AnimatePresence>
        {addedNotice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium flex items-center gap-2 z-[110]"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            Added {product.name} to cart
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bundle Selection Modal */}
      <AnimatePresence>
        {isBundleModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden relative border border-gray-200"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-mono text-xs tracking-widest uppercase font-bold text-gray-900">Select Item</h3>
                <button onClick={() => setIsBundleModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <input 
                   type="text" 
                   placeholder="Search..." 
                   className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-400 bg-white shadow-sm" 
                />
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                {allProducts.filter(p => p.id !== product.id).map(p => (
                  <div key={p.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                     <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-lg object-contain bg-gray-50 p-2 border border-gray-100" />
                     <div className="flex-1">
                        <div className="text-gray-900 text-[11px] font-bold uppercase mb-1">{p.name}</div>
                        <div className="text-gray-500 text-xs font-mono">Tk {p.price.toFixed(0)}</div>
                     </div>
                     <button
                        onClick={() => {
                          setBundleSelections([...bundleSelections, p]);
                          setIsBundleModalOpen(false);
                        }}
                        className="bg-black text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-gray-800 transition-colors"
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

      {/* Fitted Cap Sizing Chart Modal */}
      <AnimatePresence>
        {showFittedGuideModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-200"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/90">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shadow-xs">
                    <Ruler className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 font-mono tracking-wide uppercase">
                      Fitted Cap Sizing Guide
                    </h3>
                    <p className="text-[11px] text-gray-500 font-sans">
                      Official head circumference and fitted cap conversion table
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFittedGuideModal(false)}
                  className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-900 cursor-pointer"
                  title="Close Guide"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Image View */}
              <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-100/60 flex flex-col items-center justify-center min-h-[300px]">
                <img
                  src={FITTED_SIZE_GUIDE_IMAGE}
                  alt="Fitted Cap Sizing Guide"
                  className="w-full max-h-[62vh] object-contain rounded-xl shadow-lg border border-gray-200 bg-white"
                  loading="eager"
                />
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3.5 bg-white border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-gray-500 font-mono text-[11px]">
                  💡 Measure around your head ~1 inch above your eyebrows.
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={FITTED_SIZE_GUIDE_IMAGE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 font-mono text-[11px] text-gray-700 font-medium inline-flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Full Image
                  </a>
                  <button
                    onClick={() => setShowFittedGuideModal(false)}
                    className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    Got It
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
