/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Trash2, ArrowLeft, Heart, Search, 
  Sparkles, Check, ChevronRight, Menu, X, HelpCircle, 
  Volume2, CheckCircle, Smartphone, User, ArrowUpRight
} from 'lucide-react';
import { Product, CartItem, Collection } from '../types';
import { products, collections } from '../data';
import ProductCard from './ProductCard';
import ProductDetail from './ProductDetail';
import AudioPlayer from './AudioPlayer';
import ThreadWeaverGame from './ThreadWeaverGame';

interface ShopLayoutProps {
  onBackToEntrance: () => void;
}

export default function ShopLayout({ onBackToEntrance }: ShopLayoutProps) {
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  
  // Custom setup tips guide
  const [showSetupGuide, setShowSetupGuide] = useState<boolean>(() => {
    const saved = localStorage.getItem('flawed_setup_guide_dismissed');
    return saved !== 'true';
  });

  const handleDismissGuide = () => {
    setShowSetupGuide(false);
    localStorage.setItem('flawed_setup_guide_dismissed', 'true');
  };

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('flawed_basket');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Checkout flow
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [checkoutStep, setCheckoutStep] = useState<'info' | 'completed'>('info');
  const [shippingForm, setShippingForm] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: ''
  });

  // Story modal state
  const [isStoryOpen, setIsStoryOpen] = useState<boolean>(false);

  // Mini game state
  const [isGameOpen, setIsGameOpen] = useState<boolean>(false);

  // Search input expansion state
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);

  // Micro-toast state for interactive user verification feedback
  const [showToast, setShowToast] = useState<string | null>(null);

  // Dismiss toast after brief delay
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Sync cart to local storage and update header counters
  useEffect(() => {
    localStorage.setItem('flawed_basket', JSON.stringify(cart));
  }, [cart]);

  // Handle adding item
  const handleAddToCart = (product: Product, size: string) => {
    setCart((prevCart) => {
      const matchIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === size
      );

      if (matchIndex > -1) {
        // Increment quantity
        const updated = [...prevCart];
        updated[matchIndex].quantity += 1;
        return updated;
      } else {
        // Add fresh item
        return [...prevCart, { product, selectedSize: size, quantity: 1 }];
      }
    });
  };

  // Adjust basket quantities
  const handleUpdateQuantity = (idx: number, change: number) => {
    setCart((prevCart) => {
      const updated = [...prevCart];
      const newQty = updated[idx].quantity + change;
      if (newQty <= 0) {
        updated.splice(idx, 1);
      } else {
        updated[idx].quantity = newQty;
      }
      return updated;
    });
  };

  // Remove single stack
  const handleRemoveItem = (idx: number) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== idx));
  };

  // Filter products by collection slug AND search query
  const filteredProducts = products.filter((product) => {
    const collectionMatch = selectedCollection === 'all' || product.category === selectedCollection;
    const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return collectionMatch && searchMatch;
  });

  // Basket summary math
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shippingFee = cartSubtotal > 150 ? 0 : 9.50; // Free shipping over 150
  const cartTotal = cartSubtotal + shippingFee;

  // Handle order purchase trigger
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingForm.name || !shippingForm.email || !shippingForm.address) return;

    setCheckoutStep('completed');
    setCart([]); // Reset basket
    localStorage.removeItem('flawed_basket');
  };

  return (
    <div id="shop-container" className="min-h-screen bg-earth-100 text-earth-900 font-sans relative pb-24 flex flex-col justify-between">
      
      {/* ULTRA-PREMIUM TICKER ANNOUNCEMENT STRIP */}
      <div className="w-full bg-[#1b1713] text-earth-200 py-2 overflow-hidden whitespace-nowrap border-b border-[#2d2621]/80 select-none relative z-50">
        <style>{`
          @keyframes marquee {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          .animate-marquee-slow {
            display: inline-flex;
            width: max-content;
            animation: marquee 35s linear infinite;
          }
        `}</style>
        <div className="animate-marquee-slow flex items-center gap-16 text-[9.5px] font-mono tracking-[0.22em] uppercase text-stone-300 font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-orange-400">🏷️</span> 10% OFF FOR TODAY ONLY
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-400">🏷️</span> WABI-SABI ECO EMBROIDERY GOODS
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-400">🏷️</span> 10% OFF FOR TODAY ONLY
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-400">🏷️</span> ARTISANAL LOOMS & PIECES
          </div>
          
          {/* Loop copy for seamless infinity scrolling */}
          <div className="flex items-center gap-2">
            <span className="text-orange-400">🏷️</span> 10% OFF FOR TODAY ONLY
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-400">🏷️</span> WABI-SABI ECO EMBROIDERY GOODS
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-400">🏷️</span> 10% OFF FOR TODAY ONLY
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-400">🏷️</span> ARTISANAL LOOMS & PIECES
          </div>
        </div>
      </div>

      {/* REVERSED-PROXY COMPLIANT GLASS-PHORIUM HEADER */}
      <header className="sticky top-0 bg-[#faf8f5]/80 backdrop-blur-xl border-b border-earth-200/40 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          
          {/* Leftside Branding Emblem */}
          <div className="flex items-center gap-2.5 cursor-pointer group shrink-0" onClick={onBackToEntrance}>
            <div className="w-8 h-8 rounded-lg border border-earth-950 font-serif font-black text-sm flex items-center justify-center bg-earth-950 text-white tracking-normal shadow-sm">
              L
            </div>
            <div className="flex flex-col">
              <span className="text-earth-950 text-xs sm:text-sm font-semibold tracking-[0.22em] font-sans group-hover:text-[#8d5a38] transition-colors leading-none uppercase">
                LOOM AVENUE
              </span>
              <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-earth-500 mt-1 leading-none font-medium">
                Sustainably Crafted
              </span>
            </div>
          </div>

          {/* Centered Capsule Pill Navigator */}
          <div className="hidden md:flex items-center gap-1.5 bg-earth-200/35 border border-earth-250/25 p-1 rounded-full shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)] max-w-2xl mx-auto backdrop-blur-md">
            <button
              onClick={onBackToEntrance}
              className="px-3.5 py-1.5 text-[9.5px] font-mono font-bold tracking-[0.15em] uppercase rounded-full text-earth-650 hover:text-earth-950 hover:bg-white/40 transition-all duration-150"
            >
              Home
            </button>

            <button
              onClick={() => setSelectedCollection('all')}
              className={`px-3.5 py-1.5 text-[9.5px] font-mono font-bold tracking-[0.15em] uppercase rounded-full transition-all duration-150 ${
                selectedCollection === 'all'
                  ? 'bg-earth-950 text-white shadow-sm'
                  : 'text-earth-650 hover:text-earth-950 hover:bg-white/40'
              }`}
            >
              All
            </button>

            {collections.map((col) => (
              <button
                key={col.id}
                onClick={() => {
                  setSelectedCollection(col.slug);
                  // Ensure if filtered is clicked it brings view to active list
                  const el = document.getElementById('shop-grid-anchor');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-3.5 py-1.5 text-[9.5px] font-mono font-bold tracking-[0.15em] uppercase rounded-full transition-all duration-150 whitespace-nowrap ${
                  selectedCollection === col.slug
                    ? 'bg-[#8d5a38] text-white shadow-xs'
                    : 'text-earth-650 hover:text-earth-950 hover:bg-white/40'
                }`}
              >
                {col.name}
              </button>
            ))}

            <button
              onClick={() => setIsStoryOpen(true)}
              className="px-3.5 py-1.5 text-[9.5px] font-mono font-bold tracking-[0.15em] uppercase rounded-full text-earth-650 hover:text-earth-950 hover:bg-white/40 transition-all duration-150"
            >
              Manifesto
            </button>

            {/* Special Highlighted Capsule Pill matching mockup */}
            <button
              onClick={() => setIsGameOpen(true)}
              className="px-3 py-1.5 text-[9.5px] font-mono tracking-[0.15em] uppercase rounded-full text-[#8d5a38] border border-[#8d5a38]/30 hover:border-[#8d5a38]/80 hover:bg-white/50 transition-all duration-200 font-bold bg-[#faf8f5]/40 flex items-center gap-1 scale-[0.98]"
              title="Interactive Thread Weaver Game"
            >
              <span>Weave Game</span>
              <span className="text-[8px] opacity-75">%</span>
            </button>
          </div>

          {/* Right Action Widgets Grid */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0 relative">
            
            {/* Inline Toggleable Search Panel */}
            <div className="flex items-center relative">
              <AnimatePresence>
                {isSearchActive && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 160 }}
                    exit={{ opacity: 0, width: 0 }}
                    className="absolute right-8 top-1/2 -translate-y-1/2 bg-white border border-earth-200 rounded-full flex items-center px-2.5 py-1 shadow-sm overflow-hidden"
                  >
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="text-[10px] w-full focus:outline-none text-earth-800 placeholder-earth-450 bg-transparent pr-4"
                      autoFocus
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-2 text-earth-450 hover:text-earth-850">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={() => setIsSearchActive(!isSearchActive)}
                className="w-8.5 h-8.5 rounded-full flex items-center justify-center hover:bg-earth-200/40 text-earth-850 hover:text-earth-950 transition-all duration-150 cursor-pointer"
                title="Toggle search input"
              >
                <Search className="w-[17px] h-[17px]" />
              </button>
            </div>

            {/* Interactive User Avatar Profile Button in Mockup */}
            <button
              onClick={() => {
                setShowToast("Authenticated: Loom Premium Member Verified ");
              }}
              className="w-8.5 h-8.5 rounded-full flex items-center justify-center hover:bg-earth-200/40 text-earth-850 hover:text-earth-950 transition-all duration-150 cursor-pointer"
              title="Verified User Profile Status"
            >
              <User className="w-[17px] h-[17px]" />
            </button>

            {/* Premium Custom Basket Indicator matching the precise mock-up badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 hover:bg-earth-200/40 rounded-full transition-all duration-150 flex items-center justify-center"
              title="Open cart basket"
            >
              <ShoppingBag className="w-[19px] h-[19px] text-earth-950" />
              <div 
                className="absolute -top-1 -right-1 bg-[#d8af47] border border-earth-950 text-earth-950 text-[9.5px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs"
              >
                {cartItemCount}
              </div>
            </button>
          </div>

        </div>

        {/* Dynamic Fallback mobile bar with horizontal swipe menu */}
        <div className="md:hidden flex items-center gap-1.5 px-4 py-2 bg-earth-50/80 overflow-x-auto no-scrollbar border-t border-earth-200/30">
          <button
            onClick={() => setSelectedCollection('all')}
            className={`px-3 py-1 font-mono text-[9px] uppercase tracking-wider rounded-full whitespace-nowrap transition-all ${
              selectedCollection === 'all'
                ? 'bg-earth-950 text-[#faf8f5]'
                : 'text-earth-650 bg-white/50 border border-earth-200/50'
            }`}
          >
            All Pieces
          </button>
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => setSelectedCollection(col.slug)}
              className={`px-3 py-1 font-mono text-[9px] uppercase tracking-wider rounded-full whitespace-nowrap transition-all ${
                selectedCollection === col.slug
                  ? 'bg-[#8d5a38] text-white'
                  : 'text-earth-650 bg-white/50 border border-earth-200/50'
              }`}
            >
              {col.name}
            </button>
          ))}
          <button
            onClick={() => setIsGameOpen(true)}
            className="px-3 py-1 font-mono text-[9px] uppercase tracking-wider rounded-full bg-white/80 border border-[#8d5a38]/30 text-[#8d5a38] whitespace-nowrap font-bold"
          >
            Weave Game %
          </button>
        </div>

        {/* Micro notifications toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-18 right-6 z-50 bg-earth-950 text-white text-[10px] font-mono uppercase tracking-widest px-4 py-2.5 rounded-lg shadow-xl border border-white/10 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span>{showToast}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* COMPACT INTRO STAGE */}
      <section className="bg-earth-50 border-b border-earth-200/40 py-10 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-3 bg-earth-950/5 border border-earth-950/10 px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-[0.25em] font-semibold text-earth-550">
            <span className="w-1.5 h-1.5 rounded-full bg-earth-550 animate-pulse"></span>
            LOOM AVENUE COLLABORATIVE
          </div>
          <h2 className="font-serif text-3xl sm:text-[42px] leading-tight text-earth-950 tracking-tight mb-3">
            LOOM <span className="font-serif italic font-light text-earth-800">Avenue</span>
          </h2>
          <p className="font-sans text-[12.5px] sm:text-[14px] text-earth-650 max-w-xl mx-auto leading-relaxed">
            Inspired by hand-woven textures and the beauty of the unfinished. We create natural, sustainably sourced products with wabi-sabi principles. <strong className="text-earth-950 font-semibold italic">"Wear it, live it, own it."</strong>
          </p>
        </div>
      </section>

      {/* CORE WORK AREA: CATEGORY SELECTOR & PRODUCTS GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        
        {/* DISMISSIBLE USER DIRECTIVE FOR AMBIENT CONTROLLER ASSETS SETUP */}
        <AnimatePresence>
          {showSetupGuide && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
              transition={{ duration: 0.3 }}
              className="mb-8 p-4 bg-earth-200/50 border border-earth-300/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-earth-900"
            >
              <div className="flex items-start gap-2.5">
                <span className="text-lg select-none">🎚️</span>
                <div>
                  <h4 className="font-serif italic text-earth-950 text-sm sm:text-base leading-snug">
                    "Tailor Your Ambiance"
                  </h4>
                  <p className="text-xs text-earth-800 font-sans mt-0.5 leading-relaxed">
                    Choose your vibe. Click the floating <strong className="font-semibold text-earth-950">Sound Mixer</strong> button in the bottom corner of your screen to adjust volume channels for Nostalgic Keys, Gentle Rain, and Vintage Vinyl.
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismissGuide}
                className="text-[10px] font-mono uppercase tracking-wider bg-earth-900/10 hover:bg-earth-900/20 py-1.5 px-3 rounded-md transition-colors text-earth-800 hover:text-earth-950 self-end sm:self-center shrink-0 cursor-pointer"
                title="Acknowledge setup tips"
              >
                got it
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Controls Bar */}
        <div id="shop-grid-anchor" className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8 border-b border-earth-200/40 pb-5">
          {/* Collection Filter Buttons with Active Transition Indicators */}
          <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1">
            <button
              onClick={() => setSelectedCollection('all')}
              className={`px-4 py-2 text-[10px] font-mono tracking-widest uppercase rounded-full transition-all duration-200 border whitespace-nowrap ${
                selectedCollection === 'all'
                  ? 'bg-earth-900 border-earth-900 text-[#faf8f5]'
                  : 'bg-white border-earth-200 text-earth-650 hover:border-earth-400'
              }`}
            >
              All Items
            </button>
            {collections.map((col) => (
              <button
                key={col.id}
                onClick={() => setSelectedCollection(col.slug)}
                className={`px-4 py-2 text-[10px] font-mono tracking-widest uppercase rounded-full transition-all duration-200 border whitespace-nowrap ${
                  selectedCollection === col.slug
                    ? 'bg-earth-900 border-earth-900 text-[#faf8f5]'
                    : 'bg-white border-earth-200 text-earth-650 hover:border-earth-400'
                }`}
              >
                {col.name}
              </button>
            ))}
          </div>

          {/* Search box built elegantly */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-earth-400" />
            <input
              type="text"
              placeholder="Search catalog details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-sans pl-9 pr-4 py-2.5 bg-white border border-earth-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-earth-400 text-earth-800 placeholder-earth-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-earth-400 hover:text-earth-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Selected Collection Banner story - fade in depending on key active tag */}
        <AnimatePresence mode="wait">
          {selectedCollection !== 'all' && (
            <motion.div
              key={selectedCollection}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.35 }}
              className="mb-8 p-5 bg-[#faf8f5] border-l-2 border-earth-400 pl-6 rounded-r-lg max-w-4xl"
            >
              {collections.map((col) => {
                if (col.slug === selectedCollection) {
                  return (
                    <div key={col.id}>
                      <span className="font-mono text-[9px] text-earth-400 tracking-[0.2em] uppercase">COLLECTION PRECEPT</span>
                      <h3 className="font-serif italic font-light text-xl text-earth-900 mt-1">{col.name}</h3>
                      <p className="text-xs text-earth-600 mt-1.5 leading-relaxed font-sans">{col.description}</p>
                      <span className="block font-mono text-[9px] text-earth-500 italic mt-2">— {col.tagline}</span>
                    </div>
                  );
                }
                return null;
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active product grid with clean transition delays */}
        <AnimatePresence mode="popLayout">
          {filteredProducts.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl"
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onView={(p) => setSelectedProductDetail(p)}
                  onQuickAdd={handleAddToCart}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 px-4 bg-white border border-dashed border-earth-200 rounded-xl"
            >
              <HelpCircle className="w-8 h-8 text-earth-300 mx-auto mb-3" />
              <p className="font-mono text-xs tracking-wider text-earth-500 uppercase">No aligned catalog items found</p>
              <p className="text-xs text-earth-400 mt-1 font-sans">Try searching another creative detail or clear filter tags</p>
              <button
                onClick={() => { setSelectedCollection('all'); setSearchQuery(''); }}
                className="mt-4 px-4 py-2 bg-earth-90 w-auto inline-block border border-earth-200 hover:border-earth-400 font-mono text-[10px] tracking-wider uppercase rounded"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* THE DETAILS EXPAND OVERLAY DRAWER */}
      <AnimatePresence>
        {selectedProductDetail && (
          <ProductDetail
            product={selectedProductDetail}
            onClose={() => setSelectedProductDetail(null)}
            onAddToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>

      {/* COZY AMBIENT RETRO TAPE CONTROLLER AVAILABLE DYNAMICALLY IN CORNER */}
      <div className="fixed bottom-4 right-4 left-4 xs:left-auto z-40 max-w-[calc(100vw-32px)] xs:max-w-[340px] ml-auto">
        <div className="opacity-95 sm:opacity-85 hover:opacity-100 transition-opacity duration-300">
          <AudioPlayer />
        </div>
      </div>

      {/* PERSISTED BASKET SLIDE OUT COMPONENT */}
      <AnimatePresence>
        {isCartOpen && (
          <div id="cart-drawer-modal" className="fixed inset-0 z-50 flex items-center justify-end bg-earth-950/40 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-md h-full bg-[#faf8f5] shadow-2xl flex flex-col justify-between z-10 border-l border-earth-200"
            >
              {/* Header */}
              <div className="p-6 border-b border-earth-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-earth-700" />
                  <h3 className="font-serif italic text-xl">My Custom Basket</h3>
                  <span className="text-[10px] font-mono text-earth-400">({cartItemCount} stack)</span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 hover:bg-earth-100 rounded-full text-earth-500 transition-colors"
                  title="Close basket"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List area */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
                {cart.length > 0 ? (
                  cart.map((item, idx) => (
                    <div 
                      key={`${item.product.id}-${item.selectedSize}`}
                      className="flex gap-4 p-3 bg-white border border-earth-200/50 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Product thumbnail thumbnail */}
                      <div className="w-16 h-20 bg-earth-100 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Stack information details */}
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div className="flex justify-between items-start gap-1">
                          <div>
                            <h4 className="font-serif text-sm font-medium leading-snug">{item.product.name}</h4>
                            <p className="text-[10px] font-mono text-earth-400 mt-1 uppercase">
                              size: <span className="text-earth-700 font-bold">{item.selectedSize}</span>
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 hover:bg-red-50 text-earth-400 hover:text-red-500 rounded transition-colors"
                            title="Remove stack"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Adjust details */}
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-mono text-xs font-semibold text-earth-850">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>

                          <div className="flex items-center border border-earth-200 rounded overflow-hidden bg-[#faf8f5]">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(idx, -1)}
                              className="px-2 py-1 text-xs text-earth-500 hover:bg-earth-100"
                            >
                              -
                            </button>
                            <span className="px-2 font-mono text-xs text-earth-800">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(idx, 1)}
                              className="px-2 py-1 text-xs text-earth-500 hover:bg-earth-100"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 px-4">
                    <ShoppingBag className="w-10 h-10 text-earth-200 mx-auto mb-3" />
                    <p className="font-mono text-xs tracking-wider text-earth-400 uppercase">Your basket is empty</p>
                    <p className="text-xs text-earth-400 mt-1 font-sans">Celebrate slow selection. Add some fine imperfect wear.</p>
                  </div>
                )}
              </div>

              {/* Drawer footer containing pricing summary and checkout drawer activator */}
              {cart.length > 0 && (
                <div className="bg-earth-100/90 border-t border-earth-200 p-6 space-y-4">
                  <div className="space-y-2 text-xs font-mono text-earth-600">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-bold text-earth-900">${cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Organic Shipping:</span>
                      <span className="text-earth-900">
                        {shippingFee === 0 ? <span className="text-green-600">FREE</span> : `$${shippingFee.toFixed(2)}`}
                      </span>
                    </div>
                    {shippingFee > 0 && (
                      <p className="text-[10px] text-earth-450 italic">
                        * Add <span className="font-bold">${(150 - cartSubtotal).toFixed(2)}</span> more to unlock complimentary carbon-neutral transport *
                      </p>
                    )}
                    <div className="border-t border-earth-200 pt-2 flex justify-between text-sm font-sans font-bold text-earth-900 mt-1">
                      <span>Total:</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsCheckingOut(true)}
                    className="w-full py-4 bg-earth-950 text-[#faf8f5] hover:bg-earth-800 font-display text-xs tracking-widest uppercase rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <span>Proceed to alignment</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HIGH-QUALITY CLIENT SIDE SIMULATED CHECKOUT DIALOG */}
      <AnimatePresence>
        {isCheckingOut && (
          <div id="checkout-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-earth-950/60 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#faf8f5] border border-earth-200 rounded-xl max-w-md w-full shadow-2xl overflow-hidden"
            >
              {checkoutStep === 'info' ? (
                <form onSubmit={handleCheckoutSubmit} className="p-6 sm:p-8 space-y-5">
                  <div className="flex justify-between items-center pb-3 border-b border-earth-200/40">
                    <div>
                      <h4 className="font-serif italic text-xl">Shipping Details</h4>
                      <p className="text-[10px] font-mono text-earth-400 uppercase">carbon-neutral slow transport alignment</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCheckingOut(false)}
                      className="p-1 hover:bg-earth-100 rounded-full text-earth-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-earth-500 uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Laurence Miller"
                        value={shippingForm.name}
                        onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                        className="w-full text-xs p-3 bg-white border border-earth-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-earth-400 text-earth-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-earth-500 uppercase mb-1">Email Coordinates</label>
                      <input
                        type="email"
                        required
                        placeholder="laurence@evolving.com"
                        value={shippingForm.email}
                        onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                        className="w-full text-xs p-3 bg-white border border-earth-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-earth-400 text-earth-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-earth-500 uppercase mb-1">Wabi-Sabi Delivery Location</label>
                      <input
                        type="text"
                        required
                        placeholder="104 Stone pathway, Mossy Creek"
                        value={shippingForm.address}
                        onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                        className="w-full text-xs p-3 bg-white border border-earth-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-earth-400 text-earth-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono tracking-wider text-earth-500 uppercase mb-1">City</label>
                        <input
                          type="text"
                          required
                          placeholder="Kyoto Basin"
                          value={shippingForm.city}
                          onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                          className="w-full text-xs p-3 bg-white border border-earth-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-earth-400 text-earth-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono tracking-wider text-earth-500 uppercase mb-1">Postal Code</label>
                        <input
                          type="text"
                          required
                          placeholder="604-8091"
                          value={shippingForm.postalCode}
                          onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                          className="w-full text-xs p-3 bg-white border border-earth-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-earth-400 text-earth-800"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-earth-200/40 pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCheckingOut(false)}
                      className="flex-1 py-3 bg-white border border-earth-200 text-earth-650 hover:border-earth-400 font-mono text-[10px] tracking-widest uppercase rounded-lg transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-earth-900 hover:bg-earth-800 text-white font-mono text-[10px] tracking-widest uppercase rounded-lg transition-colors shadow-sm"
                    >
                      Confirm order
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6 sm:p-8 text-center space-y-4">
                  <CheckCircle className="w-12 h-12 text-earth-400 mx-auto mb-2 animate-bounce" />
                  <h4 className="font-serif italic text-2xl text-earth-950">"Order Aligned"</h4>
                  <p className="text-xs text-earth-750 font-sans leading-relaxed max-w-sm mx-auto">
                    Deep appreciation, <strong>{shippingForm.name}</strong>. Flawed order credentials were sent to <strong>{shippingForm.email}</strong>. Our weavers have begun custom preparation under clean ambient conditions.
                  </p>
                  <div className="p-4 bg-earth-100 rounded-lg text-[10px] font-mono text-earth-600 tracking-wider uppercase text-left max-w-sm mx-auto space-y-1">
                    <p>• Transport method: Carbon-Neutral Air Express</p>
                    <p>• Estimated cycle: 4 to 6 sunrises</p>
                    <p>• Track identifier: FLW-{(Math.random()*100000).toFixed(0)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckingOut(false);
                      setCheckoutStep('info');
                      setIsCartOpen(false);
                    }}
                    className="w-full py-3.5 bg-earth-900 hover:bg-earth-800 text-white font-display text-[10px] tracking-widest uppercase rounded-lg transition-colors mt-4"
                  >
                    Return to slowest browsing
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ARTISANAL BRAND PHILOSOPHY MODAL */}
      <AnimatePresence>
        {isStoryOpen && (
          <div id="story-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-earth-900/40 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#faf8f5] border border-earth-200 rounded-xl max-w-lg w-full shadow-2xl p-6 sm:p-8 space-y-5 max-h-[85vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center border-b border-earth-200/40 pb-3">
                <div>
                  <h4 className="font-serif italic text-2xl">The LOOM Avenue Manifesto</h4>
                  <p className="text-[9px] font-mono text-earth-400 uppercase tracking-widest">loom avenue x venta studios</p>
                </div>
                <button
                  onClick={() => setIsStoryOpen(false)}
                  className="p-1 hover:bg-earth-100 rounded-full text-earth-500"
                  title="Close story"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-earth-800 font-sans leading-relaxed">
                <p>
                  In a world obsessed with glossy automation and mass production, <strong>LOOM Avenue</strong> operates as a quiet rebellion. We reject correct machine symmetry in favor of human trace elements.
                </p>
                <blockquote className="border-l-2 border-earth-400 pl-4 py-1 italic text-earth-600 bg-earth-100/50 rounded-r-lg">
                  "Only imperfect artifacts record the passage of heat, sun, and genuine attention. True quality comes not from sterile replication, but from slow, flawed maturation."
                </blockquote>
                <p>
                  Our linen is sun-bleached on grass fields, leaving miniature seed husks woven inside the fibers. Our ceramic glazing is fired in regional wood kilns, meaning no two pots share similar birthmarks.
                </p>
                <p className="font-semibold text-earth-900">
                  Wear it, live it, own it. Forever evolving.
                </p>
              </div>

              <div className="border-t border-earth-200/40 pt-4">
                <button
                  type="button"
                  onClick={() => setIsStoryOpen(false)}
                  className="w-full py-3 bg-earth-900 text-[#faf8f5] hover:bg-earth-800 font-mono text-[10px] tracking-widest uppercase rounded-lg transition-colors"
                >
                  Return to browsing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MINI WEAVE GAME OVERLAY */}
      <ThreadWeaverGame isOpen={isGameOpen} onClose={() => setIsGameOpen(false)} />

      {/* FOOTER */}
      <footer className="mt-auto border-t border-earth-200/50 py-8 px-4 text-center text-earth-405 bg-earth-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono">
          <p>© 2026 LOOM Avenue. All flaws perfected.</p>
          <div className="flex gap-6">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-earth-700 transition-colors">instagram</a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="hover:text-earth-700 transition-colors">tiktok</a>
            <button onClick={() => setIsStoryOpen(true)} className="hover:text-earth-700 transition-colors">concept manifesto</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
