/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Trash2, Heart, Search, 
  Sparkles, Check, ChevronRight, Menu, X, HelpCircle, 
  Volume2, CheckCircle, Smartphone, ArrowUpRight,
  Disc, Copy, ArrowLeft
} from 'lucide-react';
import { Product, CartItem, Collection, Offer } from '../types';
import { collections } from '../data';
import ProductCard from './ProductCard';
import ProductDetail from './ProductDetail';
import AudioPlayer from './AudioPlayer';
import FAQSection from './FAQSection';
import Chatbot from './Chatbot';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../pixel';

interface ShopLayoutProps {
  onBackToEntrance: () => void;
  onAdmin: () => void;
  products: Product[];
}

export default function ShopLayout({ onBackToEntrance, onAdmin, products }: ShopLayoutProps) {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
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
  const [checkoutStep, setCheckoutStep] = useState<'info' | 'payment' | 'completed'>('info');
  const [shippingForm, setShippingForm] = useState({
    name: '',
    email: '',
    address: '',
    deliveryZone: 'inside', // 'inside' or 'outside'
    phoneNumber: '',
    transactionId: '',
    paymentMethod: 'cod' // 'cod' or 'bkash'
  });
  const [copiedNumber, setCopiedNumber] = useState<boolean>(false);
  const [lastOrderId, setLastOrderId] = useState<string>('');
  const [completedOrderSummary, setCompletedOrderSummary] = useState<{
    orderId: string;
    items: Array<{
      productName: string;
      imageUrl?: string;
      selectedSize: string;
      quantity: number;
      price: number;
      finalPaidAmount: number;
      selectedOfferName?: string;
      bundleSelections?: string[];
    }>;
    subtotal: number;
    shippingFee: number;
    total: number;
    paymentMethod: string;
    transactionId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
  } | null>(null);

  // Story modal state
  const [isStoryOpen, setIsStoryOpen] = useState<boolean>(false);

  // Search input expansion state
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);

  // Scroll state for premium glassmorphic sticky behavior
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY !== undefined ? window.scrollY : window.pageYOffset;
      setIsScrolled(scrollPos > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Trigger initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track PageView on mount
  useEffect(() => {
    trackEvent('PageView');
  }, []);

  // Sync cart to local storage and update header counters
  useEffect(() => {
    localStorage.setItem('flawed_basket', JSON.stringify(cart));
  }, [cart]);

  // Handle adding item
  const handleAddToCart = (product: Product, size: string, offer?: Offer, bundleSelections?: Product[]) => {
    // If offer has fixed quantity, use it, else 1
    const addQuantity = offer ? offer.quantity : 1;
    
    // Calculate final price with offer
    const finalPrice = offer
      ? offer.fixedDiscount
        ? (product.price * offer.quantity) - offer.fixedDiscount
        : offer.discountPercentage
        ? (product.price * offer.quantity) * (1 - offer.discountPercentage / 100)
        : (product.price * offer.quantity)
      : product.price;

    trackEvent('AddToCart', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      currency: 'BDT',
      value: finalPrice
    });

    setCart((prevCart) => {
      const matchIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === size && item.selectedOffer?.id === offer?.id && JSON.stringify(item.bundleSelections?.map(p => p.id)) === JSON.stringify(bundleSelections?.map(p => p.id))
      );
      if (matchIndex > -1) {
        // Increment quantity by offer quantity (or 1)
        const updated = [...prevCart];
        updated[matchIndex].quantity += addQuantity;
        return updated;
      } else {
        // Add fresh item with quantity equal to offer quantity
        return [...prevCart, { product, selectedSize: size, quantity: addQuantity, selectedOffer: offer, bundleSelections }];
      }
    });
  };

  // Adjust basket quantities
  const handleUpdateQuantity = (idx: number, change: number) => {
    setCart((prevCart) => {
      const updated = [...prevCart];
      const item = updated[idx];
      const step = item.selectedOffer ? item.selectedOffer.quantity : 1;
      const newQty = item.quantity + (change * step);
      if (newQty <= 0) {
        updated.splice(idx, 1);
      } else {
        item.quantity = newQty;
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

  // Helper function for cart item pricing with offer and bundle selections
  const getItemPricing = (item: CartItem) => {
    const offer = item.selectedOffer;
    if (!offer) {
      const originalTotal = item.product.price * item.quantity;
      return { originalTotal, finalPaidAmount: originalTotal, savings: 0, sets: item.quantity };
    }
    const offerQty = offer.quantity > 0 ? offer.quantity : 1;
    const sets = Math.max(1, Math.floor(item.quantity / offerQty));
    let singleSetOriginal = item.product.price;
    const bundles = item.bundleSelections || [];
    for (let b = 0; b < offerQty - 1; b++) {
      if (bundles[b]) {
        singleSetOriginal += bundles[b].price;
      } else {
        singleSetOriginal += item.product.price;
      }
    }
    const originalTotal = singleSetOriginal * sets;
    let savings = 0;
    if (offer.fixedDiscount) {
      savings = offer.fixedDiscount * sets;
    } else if (offer.discountPercentage) {
      savings = (singleSetOriginal * (offer.discountPercentage / 100)) * sets;
    }
    const finalPaidAmount = Math.max(0, originalTotal - savings);
    return { originalTotal, finalPaidAmount, savings, sets };
  };

  // Basket summary math
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + getItemPricing(item).finalPaidAmount, 0);
  const hasFreeShipping = cart.some(item => item.selectedOffer?.freeShipping);
  const shippingFee = hasFreeShipping ? 0 : (shippingForm.deliveryZone === 'inside' ? 70 : 130);
  const cartTotal = cartSubtotal + shippingFee;

  const completeOrder = async (transactionId: string) => {
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    setLastOrderId(orderId);
    
    const items = cart.map(i => {
      const offer = i.selectedOffer;
      const pricing = getItemPricing(i);

      return { 
        productName: i.product.name, 
        quantity: i.quantity, 
        price: i.product.price,
        selectedOfferName: offer ? offer.title : undefined,
        discountApplied: pricing.savings,
        originalTotal: pricing.originalTotal,
        finalPaidAmount: pricing.finalPaidAmount,
        savings: pricing.savings,
        freeShipping: offer?.freeShipping,
        bundleSelections: i.bundleSelections?.map(p => p.name)
      };
    });

    const summaryItems = cart.map(i => {
      const offer = i.selectedOffer;
      const pricing = getItemPricing(i);

      return { 
        productName: i.product.name, 
        imageUrl: i.product.imageUrl,
        selectedSize: i.selectedSize,
        quantity: i.quantity, 
        price: i.product.price,
        selectedOfferName: offer ? offer.title : undefined,
        finalPaidAmount: pricing.finalPaidAmount,
        bundleSelections: i.bundleSelections?.map(p => p.name)
      };
    });

    setCompletedOrderSummary({
      orderId,
      items: summaryItems,
      subtotal: cartSubtotal,
      shippingFee: shippingFee,
      total: cartTotal,
      paymentMethod: shippingForm.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Pay with bKash',
      transactionId: transactionId,
      customerName: shippingForm.name,
      customerEmail: shippingForm.email,
      customerPhone: shippingForm.phoneNumber,
      customerAddress: shippingForm.address
    });

    trackEvent('Purchase', {
      currency: 'BDT',
      value: cartTotal,
      transaction_id: orderId,
      content_ids: cart.map(i => i.product.id),
      content_type: 'product'
    }, {
      email: shippingForm.email,
      phone: shippingForm.phoneNumber
    });

    if (supabase) {
      await supabase.from('orders').insert([{
        id: orderId,
        customerName: shippingForm.name,
        customerEmail: shippingForm.email,
        customerPhone: shippingForm.phoneNumber,
        customerAddress: shippingForm.address,
        transactionId: transactionId,
        status: 'Pending',
        date: new Date().toISOString(),
        total: cartTotal,
        items: items
      }]);
    }

    setCheckoutStep('completed');
    setCart([]); // Reset basket
    localStorage.removeItem('flawed_basket');
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingForm.name || !shippingForm.email || !shippingForm.address || !shippingForm.phoneNumber) return;
    trackEvent('InitiateCheckout', {
      currency: 'BDT',
      value: cartTotal,
      num_items: cartItemCount
    }, {
      email: shippingForm.email,
      phone: shippingForm.phoneNumber
    });
    
    if (shippingForm.paymentMethod === 'cod') {
      await completeOrder('Cash on Delivery');
    } else {
      setCheckoutStep('payment');
    }
  };

  // Handle order purchase trigger
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingForm.transactionId) return;
    await completeOrder(shippingForm.transactionId);
  };

  return (
    <div id="shop-container" className="min-h-screen bg-transparent text-earth-100 font-sans relative pb-24 flex flex-col justify-between">
      
      {/* ULTRA-PREMIUM TICKER ANNOUNCEMENT STRIP */}
      <div className="w-full bg-black/30 backdrop-blur-md text-earth-200 py-2 overflow-hidden whitespace-nowrap border-b border-white/10 select-none relative z-50">
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
        <div className="animate-marquee-slow flex items-center gap-16 text-[9.5px] font-mono tracking-[0.22em] uppercase text-stone-300 font-semibold pr-16">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <span className="text-orange-400">✨</span> NEW WEBSITE. NEW PRIVILEGE. ENJOY A FLAT 7% OFF ALL ONLINE ORDERS THROUGHOUT JULY.
            </div>
          ))}
        </div>
      </div>

      {/* REVERSED-PROXY COMPLIANT GLASS-PHORIUM HEADER */}
      <header className={`sticky top-0 z-40 transition-all duration-500 ease-in-out ${
        isScrolled 
          ? 'bg-white/10 backdrop-blur-2xl border-b border-white/20 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.3)]' 
          : 'bg-black/20 backdrop-blur-lg border-b border-white/10'
      }`}>
        <div className={`max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-4 transition-all duration-500 ease-in-out ${
          isScrolled ? 'py-2 sm:py-2.5' : 'py-4 sm:py-5'
        }`}>
          
          {/* Leftside Branding Emblem */}
          <div className="flex items-center gap-2.5 cursor-pointer group shrink-0" onClick={onBackToEntrance}>
            <div className={`w-8 h-8 rounded-lg border font-serif font-black text-sm flex items-center justify-center transition-all duration-500 ease-in-out ${
              isScrolled 
                ? 'bg-white/20 border-white/30 text-white rotate-6 scale-95 shadow-sm backdrop-blur-md'
                : 'bg-white/10 border-white/20 text-white backdrop-blur-md'
            }`}>
              L
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs sm:text-sm font-semibold tracking-[0.22em] font-sans group-hover:text-white/80 transition-colors leading-none uppercase">
                LOOM AVENUE
              </span>
              <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-white/60 mt-1 leading-none font-medium">
                Sustainably Crafted
              </span>
            </div>
          </div>

          {/* Centered Capsule Pill Navigator */}
          <div className={`hidden md:flex items-center gap-1.5 border p-1 rounded-full backdrop-blur-2xl transition-all duration-500 ease-in-out ${
            isScrolled 
              ? 'bg-black/20 border-white/20 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.2)] scale-[0.98]' 
              : 'bg-white/5 border-white/10 shadow-[inset_0_1px_4px_rgba(0,0,0,0.1)]'
          }`}>
            <button
              onClick={onBackToEntrance}
              className="px-3.5 py-1.5 text-[9.5px] font-mono font-bold tracking-[0.15em] uppercase rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all duration-150"
            >
              Home
            </button>

            <button
              onClick={() => setSelectedCollection(null)}
              className={`px-3.5 py-1.5 text-[9.5px] font-mono font-bold tracking-[0.15em] uppercase rounded-full transition-all duration-150 ${
                selectedCollection === null
                  ? 'bg-white text-black shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/20'
              }`}
            >
              Categories
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
                    ? 'bg-white text-black shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/20'
                }`}
              >
                {col.name}
              </button>
            ))}
          </div>

          {/* Right Action Widgets Grid */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0 relative">
            
            <button
              onClick={onAdmin}
              className="px-3.5 py-1.5 text-[9.5px] font-mono font-bold tracking-[0.15em] uppercase rounded-full text-white/70 hover:text-white border border-white/20 hover:bg-white/20 transition-all duration-150"
            >
              Admin
            </button>

            {/* Inline Toggleable Search Panel */}
            <div className="flex items-center relative">
              <AnimatePresence>
                {isSearchActive && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 160 }}
                    exit={{ opacity: 0, width: 0 }}
                    className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center px-2.5 py-1 shadow-sm overflow-hidden"
                  >
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="text-[10px] w-full focus:outline-none text-white placeholder-white/70 bg-transparent pr-4"
                      autoFocus
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-2 text-white/70 hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={() => setIsSearchActive(!isSearchActive)}
                className="w-8.5 h-8.5 rounded-full flex items-center justify-center hover:bg-white/20 text-white/90 hover:text-white transition-all duration-150 cursor-pointer"
                title="Toggle search input"
              >
                <Search className="w-[17px] h-[17px]" />
              </button>
            </div>

            {/* Premium Custom Basket Indicator matching the precise mock-up badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 hover:bg-white/20 rounded-full transition-all duration-150 flex items-center justify-center text-white"
              title="Open cart basket"
            >
              <ShoppingBag className="w-[19px] h-[19px]" />
              <div 
                className="absolute -top-1 -right-1 bg-[#d8af47] border border-white text-earth-950 text-[9.5px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs"
              >
                {cartItemCount}
              </div>
            </button>
          </div>

        </div>

        {/* Dynamic Fallback mobile bar with horizontal swipe menu */}
        <div className="md:hidden flex items-center gap-1.5 px-4 py-2 bg-black/20 backdrop-blur-md overflow-x-auto no-scrollbar border-t border-white/10">
          <button
            onClick={() => setSelectedCollection(null)}
            className={`px-3 py-1 font-mono text-[9px] uppercase tracking-wider rounded-full whitespace-nowrap transition-all ${
              selectedCollection === null
                ? 'bg-white text-black'
                : 'text-white/80 bg-white/10 border border-white/20'
            }`}
          >
            Categories
          </button>
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => setSelectedCollection(col.slug)}
              className={`px-3 py-1 font-mono text-[9px] uppercase tracking-wider rounded-full whitespace-nowrap transition-all ${
                selectedCollection === col.slug
                  ? 'bg-white text-black'
                  : 'text-white/80 bg-white/10 border border-white/20'
              }`}
            >
              {col.name}
            </button>
          ))}
        </div>

      </header>

      {/* CORE WORK AREA: CATEGORY SELECTOR & PRODUCTS GRID */}
      <main className={`w-full flex-1 flex flex-col pb-16 ${!selectedCollection ? 'pt-8' : ''}`}>
        
        {/* DISMISSIBLE USER DIRECTIVE FOR AMBIENT CONTROLLER ASSETS SETUP */}
        <AnimatePresence>
          {showSetupGuide && !selectedCollection && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 w-full mb-8"
            >
              <div className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
                <div className="flex items-start gap-2.5">
                  <span className="text-lg select-none">🎚️</span>
                  <div>
                    <h4 className="font-serif italic text-white text-sm sm:text-base leading-snug">
                      "Tailor Your Ambiance"
                    </h4>
                    <p className="text-xs text-white/80 font-sans mt-0.5 leading-relaxed">
                      Choose your vibe. Click the floating <strong className="font-semibold text-white">Sound Mixer</strong> button in the bottom corner of your screen to adjust volume channels for Nostalgic Keys, Gentle Rain, and Vintage Vinyl.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDismissGuide}
                  className="text-[10px] font-mono uppercase tracking-wider bg-white/10 hover:bg-white/20 py-1.5 px-3 rounded-md transition-colors text-white/90 hover:text-white self-end sm:self-center shrink-0 cursor-pointer"
                  title="Acknowledge setup tips"
                >
                  got it
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedCollection ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto px-4 sm:px-6 w-full"
          >
            {collections.slice(0, 2).map((col) => {
              // Find the first product to use as the background image
              const bgProduct = products.find(p => p.category === col.slug);
              
              return (
                <div
                  key={col.id}
                  onClick={() => setSelectedCollection(col.slug)}
                  className="group relative h-[55vh] md:h-[65vh] rounded-2xl overflow-hidden cursor-pointer border border-white/20 shadow-xl"
                >
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all duration-700 z-10" />
                  
                  {(col.imageUrl || bgProduct) && (
                    <img 
                      src={col.imageUrl || bgProduct?.imageUrl} 
                      alt={col.name}
                      className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                  )}
                  
                  <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end">
                    <span className="inline-block w-fit px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[10px] font-mono tracking-widest uppercase rounded-full mb-4">
                      Explore Collection
                    </span>
                    <h3 className="font-serif italic text-4xl md:text-5xl text-white mb-3 tracking-tight group-hover:text-white/90 transition-colors">
                      {col.name}
                    </h3>
                    <p className="text-sm text-white/70 font-sans max-w-sm leading-relaxed mb-6">
                      {col.description}
                    </p>
                    <div className="flex items-center gap-2 text-white font-mono text-[10px] tracking-widest uppercase">
                      <span className="relative overflow-hidden">
                        <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">Enter</span>
                        <span className="absolute left-0 top-0 inline-block transition-transform duration-300 translate-y-full group-hover:translate-y-0">Enter</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            {/* Selected Collection Hero Section */}
            {(() => {
              const activeCol = collections.find(c => c.slug === selectedCollection);
              if (!activeCol) return null;
              
              return (
                <div className="relative w-full mb-12 shadow-2xl border-b border-white/20 flex flex-col justify-between -mt-[116px] pt-[116px] bg-earth-900">
                  {/* Background Video */}
                  <video 
                    key={activeCol.slug}
                    autoPlay loop muted playsInline preload="auto"
                    className="absolute inset-0 w-full h-full object-cover object-center z-0 filter brightness-[0.45]"
                  >
                    {activeCol.videoUrl ? (
                      <source src={activeCol.videoUrl} type="video/mp4" />
                    ) : activeCol.slug === 'earth-clay' ? (
                      <source src="https://ik.imagekit.io/t1q0n1ovm/WhatsApp%20Video%202026-06-16%20at%2022.36.54(1).mp4" type="video/mp4" />
                    ) : (
                      <>
                        <source src="https://res.cloudinary.com/deyatjand/video/upload/f_webm,q_auto,vc_vp9,ac_none,w_1920,c_limit/v1782572836/IMG_2439_lnghj5.webm" type="video/webm" />
                        <source src="https://res.cloudinary.com/deyatjand/video/upload/f_mp4,q_auto,vc_h264,ac_none,w_1920,c_limit/v1782572836/IMG_2439_lnghj5.mp4" type="video/mp4" />
                      </>
                    )}
                  </video>
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-0" />
                  
                  {/* Top Content Row */}
                  <div className="relative z-10 p-8 md:p-12 flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center w-full max-w-7xl mx-auto min-h-[55vh]">
                    <div className="max-w-xl">
                      <div className="inline-block px-4 py-1.5 border border-white/30 rounded-full mb-6 backdrop-blur-md bg-white/5">
                        <span className="font-mono text-[9px] text-[#e8dcc4] tracking-[0.2em] uppercase">{activeCol.tagline}</span>
                      </div>
                      <h2 className="font-serif text-5xl md:text-6xl font-bold text-white leading-tight mb-2 tracking-tight">
                        Discover Your
                      </h2>
                      <h2 className="font-serif italic text-5xl md:text-6xl text-[#e8dcc4] mb-6 tracking-tight">
                        {activeCol.name}
                      </h2>
                      <p className="text-sm md:text-base text-white/80 font-sans leading-relaxed max-w-md">
                        {activeCol.description}
                      </p>
                    </div>
                    
                    {/* Right side floating cards */}
                    <div className="flex flex-col gap-4 w-full md:w-auto">
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all cursor-pointer group pr-8">
                        <div className="w-12 h-12 rounded-xl bg-black/40 overflow-hidden border border-white/10 flex-shrink-0 flex items-center justify-center relative">
                            <Sparkles className="w-5 h-5 text-[#e8dcc4] group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                          <h4 className="font-serif text-white font-medium text-lg">Raw Materials</h4>
                          <p className="text-[11px] font-sans text-white/60 mt-0.5">Ethically sourced fabrics</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all cursor-pointer group pr-8">
                        <div className="w-12 h-12 rounded-xl bg-black/40 overflow-hidden border border-white/10 flex-shrink-0 flex items-center justify-center relative">
                            <Disc className="w-5 h-5 text-[#e8dcc4] group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                          <h4 className="font-serif text-white font-medium text-lg">Artisan Crafted</h4>
                          <p className="text-[11px] font-sans text-white/60 mt-0.5">Hand-finished details</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Stats Bar */}
                  <div className="relative z-10 w-full bg-black/40 backdrop-blur-md border-t border-white/10">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3">
                      <div className="p-6 flex flex-col items-center justify-center text-center border-b sm:border-b-0 sm:border-r border-white/10">
                        <span className="font-serif text-xl sm:text-2xl font-bold text-[#e8dcc4] mb-1">MULTI STAGE</span>
                        <span className="text-[9px] font-mono tracking-widest text-white/60 uppercase">QUALITY CHECKS</span>
                      </div>
                      <div className="p-6 flex flex-col items-center justify-center text-center border-b sm:border-b-0 sm:border-r border-white/10">
                        <span className="font-serif text-xl sm:text-2xl font-bold text-[#e8dcc4] mb-1">100%</span>
                        <span className="text-[9px] font-mono tracking-widest text-white/60 uppercase">COMMUNITY TRUST</span>
                      </div>
                      <div className="p-6 flex flex-col items-center justify-center text-center">
                        <span className="font-serif text-xl sm:text-2xl font-bold text-[#e8dcc4] mb-1">PRIORITY</span>
                        <span className="text-[9px] font-mono tracking-widest text-white/60 uppercase">BUYER CARE</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Active product grid with clean transition delays */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
              <AnimatePresence mode="popLayout">
                {filteredProducts.length > 0 ? (
                  <motion.div 
                    layout
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full"
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
                    className="text-center py-20 px-4 bg-white/5 backdrop-blur-md border border-dashed border-white/30 rounded-xl"
                  >
                    <HelpCircle className="w-8 h-8 text-white/50 mx-auto mb-3" />
                    <p className="font-mono text-xs tracking-wider text-white/80 uppercase">No aligned catalog items found</p>
                    <p className="text-xs text-white/60 mt-1 font-sans">Try searching another creative detail</p>
                    <button
                      onClick={() => { setSearchQuery(''); }}
                      className="mt-4 px-4 py-2 bg-white/10 w-auto inline-block border border-white/20 hover:border-white/50 hover:bg-white/20 text-white font-mono text-[10px] tracking-wider uppercase rounded transition-all"
                    >
                      Clear Search
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </main>

      <FAQSection />

      {/* THE DETAILS EXPAND OVERLAY DRAWER */}
      <AnimatePresence>
        {selectedProductDetail && (
          <ProductDetail
            product={selectedProductDetail}
            allProducts={products}
            onClose={() => setSelectedProductDetail(null)}
            onAddToCart={handleAddToCart}
            onBuyNow={(product, size, offer, bundleSelections) => {
              handleAddToCart(product, size, offer, bundleSelections);
              setIsCartOpen(true);
              setSelectedProductDetail(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* CHATBOT WIDGET */}
      <Chatbot />

      {/* COZY AMBIENT RETRO TAPE CONTROLLER AVAILABLE DYNAMICALLY IN CORNER */}
      <div className="fixed bottom-4 right-4 left-4 xs:left-auto z-40 max-w-[calc(100vw-32px)] xs:max-w-[340px] ml-auto">
        <div className="opacity-95 sm:opacity-85 hover:opacity-100 transition-opacity duration-300">
          <AudioPlayer />
        </div>
      </div>

      {/* PERSISTED BASKET SLIDE OUT COMPONENT */}
      <AnimatePresence>
        {isCartOpen && (
          <div id="cart-drawer-modal" className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-md">
            <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-md h-full bg-white/10 backdrop-blur-3xl shadow-2xl flex flex-col justify-between z-10 border-l border-white/20"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/20 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-2 text-white">
                  <ShoppingBag className="w-5 h-5 text-white/80" />
                  <h3 className="font-serif italic text-xl">My Custom Basket</h3>
                  <span className="text-[10px] font-mono text-white/50">({cartItemCount} stack)</span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition-colors"
                  title="Close basket"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List area */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
                {cart.length > 0 ? (
                  cart.map((item, idx) => {
                    const pricing = getItemPricing(item);
                    const offer = item.selectedOffer;
                    const bundles = item.bundleSelections || [];

                    return (
                      <div 
                        key={`${item.product.id}-${item.selectedSize}-${idx}`}
                        className="p-3.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-sm hover:shadow-md transition-all space-y-3"
                      >
                        {/* Top Info Row */}
                        <div className="flex gap-3 items-start">
                          <div className="w-16 h-18 bg-white/10 rounded-lg overflow-hidden border border-white/10 p-1 shrink-0 flex items-center justify-center">
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain"
                            />
                          </div>

                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div className="flex justify-between items-start gap-1">
                              <div>
                                <h4 className="font-serif text-sm font-semibold leading-snug text-white truncate">{item.product.name}</h4>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-[10px] font-mono text-white/60 uppercase">
                                    SIZE: <span className="text-white font-bold">{item.selectedSize}</span>
                                  </span>
                                  {offer && (
                                    <span className="text-[9px] font-mono bg-white/20 text-white px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                                      {offer.title}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Bundle Included Items Details */}
                        {offer && offer.quantity > 1 && (
                          <div className="p-2.5 bg-black/25 rounded-lg border border-white/10 space-y-2">
                            <div className="text-[10px] font-mono font-bold text-white/80 uppercase tracking-wider">
                              Included Items ({1 + bundles.length} Caps):
                            </div>
                            
                            {/* Main Cap */}
                            <div className="flex items-center justify-between text-xs bg-white/5 p-1.5 rounded">
                              <div className="flex items-center gap-2 min-w-0">
                                <img src={item.product.imageUrl} alt={item.product.name} className="w-6 h-6 object-contain bg-white/10 rounded p-0.5 border border-white/10 shrink-0" />
                                <span className="text-white/90 text-[11px] font-medium truncate">{item.product.name}</span>
                              </div>
                              <span className="text-[10px] font-mono text-white/60 shrink-0">TK {item.product.price.toFixed(0)}</span>
                            </div>

                            {/* Bundled Selected Caps */}
                            {bundles.map((bItem, bIdx) => (
                              <div key={bIdx} className="flex items-center justify-between text-xs bg-white/5 p-1.5 rounded">
                                <div className="flex items-center gap-2 min-w-0">
                                  <img src={bItem.imageUrl} alt={bItem.name} className="w-6 h-6 object-contain bg-white/10 rounded p-0.5 border border-white/10 shrink-0" />
                                  <span className="text-white/90 text-[11px] font-medium truncate">{bItem.name}</span>
                                </div>
                                <span className="text-[10px] font-mono text-white/60 shrink-0">TK {bItem.price.toFixed(0)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Pricing & Quantity Stepper Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-white">
                                TK {pricing.finalPaidAmount.toFixed(2)}
                              </span>
                              {pricing.savings > 0 && (
                                <span className="font-mono text-[10px] text-white/40 line-through">
                                  TK {pricing.originalTotal.toFixed(2)}
                                </span>
                              )}
                            </div>
                            {pricing.savings > 0 && (
                              <span className="text-[9px] text-emerald-400 font-mono font-bold mt-0.5">
                                SAVE TK {pricing.savings.toFixed(0)} ({offer?.discountPercentage || 0}% OFF)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center border border-white/20 rounded-lg overflow-hidden bg-white/10 text-white">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(idx, -1)}
                              className="px-2 py-1 text-xs hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                            >
                              -
                            </button>
                            <span className="px-2 font-mono text-xs font-bold text-white">
                              {pricing.sets} {offer ? (pricing.sets > 1 ? 'Sets' : 'Set') : ''}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(idx, 1)}
                              className="px-2 py-1 text-xs hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-20 px-4">
                    <ShoppingBag className="w-10 h-10 text-white/20 mx-auto mb-3" />
                    <p className="font-mono text-xs tracking-wider text-white/60 uppercase">Your basket is empty</p>
                    <p className="text-xs text-white/40 mt-1 font-sans">Celebrate slow selection. Add some fine imperfect wear.</p>
                  </div>
                )}
              </div>

              {/* Drawer footer containing pricing summary and checkout drawer activator */}
              {cart.length > 0 && (
                <div className="bg-white/5 border-t border-white/20 p-6 space-y-4">
                  <div className="space-y-2 text-xs font-mono text-white/70">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-bold text-white">TK {cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Charge:</span>
                      <span className="text-white">TK {shippingFee.toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-white/50 italic text-right mt-1 border-t border-white/10 pt-2">
                      ({shippingForm.deliveryZone === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'})
                    </p>
                    <div className="border-t border-white/20 pt-2 flex justify-between text-sm font-sans font-bold text-white mt-1">
                      <span>Total:</span>
                      <span>TK {cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsCheckingOut(true)}
                    className="w-full py-4 bg-white text-black hover:bg-white/80 font-display text-xs tracking-widest uppercase rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center gap-2"
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
          <div id="checkout-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-xl max-w-md w-full shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
            >
              {checkoutStep === 'info' ? (
                <form onSubmit={handleInfoSubmit} className="p-6 sm:p-8 space-y-5 overflow-y-auto">
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <div>
                      <h4 className="font-serif italic text-xl text-white">Shipping Details</h4>
                      <p className="text-[10px] font-mono text-white/50 uppercase">carbon-neutral slow transport alignment</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCheckingOut(false)}
                      className="p-1 hover:bg-white/10 rounded-full text-white/60 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-white/60 uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Laurence Miller"
                        value={shippingForm.name}
                        onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                        className="w-full text-xs p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/50 text-white placeholder-white/40"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-white/60 uppercase mb-1">Email Coordinates</label>
                      <input
                        type="email"
                        required
                        placeholder="laurence@evolving.com"
                        value={shippingForm.email}
                        onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                        className="w-full text-xs p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/50 text-white placeholder-white/40"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-white/60 uppercase mb-1">Wabi-Sabi Delivery Location</label>
                      <input
                        type="text"
                        required
                        placeholder="104 Stone pathway, Mossy Creek"
                        value={shippingForm.address}
                        onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                        className="w-full text-xs p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/50 text-white placeholder-white/40"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono tracking-wider text-white/60 uppercase mb-1">Phone Number</label>
                        <input
                          type="tel"
                          required
                          placeholder="017XXXXXXXX"
                          value={shippingForm.phoneNumber}
                          onChange={(e) => setShippingForm({ ...shippingForm, phoneNumber: e.target.value })}
                          className="w-full text-xs p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/50 text-white placeholder-white/40"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono tracking-wider text-white/60 uppercase mb-1">Delivery Zone</label>
                        <select
                          required
                          value={shippingForm.deliveryZone}
                          onChange={(e) => setShippingForm({ ...shippingForm, deliveryZone: e.target.value })}
                          className="w-full text-xs p-3 bg-black/40 backdrop-blur-md border border-white/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/50 text-white placeholder-white/40 appearance-none"
                        >
                          <option value="inside">Inside Dhaka (TK 70)</option>
                          <option value="outside">Outside Dhaka (TK 130)</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-white/60 uppercase mb-2">Payment Method</label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className={`cursor-pointer text-xs p-3 border rounded-lg flex items-center justify-center gap-2 transition-all ${
                          shippingForm.paymentMethod === 'cod' 
                            ? 'bg-white/20 border-white text-white' 
                            : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
                        }`}>
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            value="cod" 
                            checked={shippingForm.paymentMethod === 'cod'} 
                            onChange={(e) => setShippingForm({ ...shippingForm, paymentMethod: e.target.value })} 
                            className="hidden" 
                          />
                          <span className="font-mono tracking-wider uppercase">Cash on Delivery</span>
                        </label>
                        <label className={`cursor-pointer text-xs p-3 border rounded-lg flex items-center justify-center gap-2 transition-all ${
                          shippingForm.paymentMethod === 'bkash' 
                            ? 'bg-[#E2136E]/20 border-[#E2136E] text-white' 
                            : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
                        }`}>
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            value="bkash" 
                            checked={shippingForm.paymentMethod === 'bkash'} 
                            onChange={(e) => setShippingForm({ ...shippingForm, paymentMethod: e.target.value })} 
                            className="hidden" 
                          />
                          <span className="font-mono tracking-wider uppercase font-bold text-pink-400">bKash</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCheckingOut(false)}
                      className="flex-1 py-3 bg-white/5 border border-white/20 text-white/80 hover:bg-white/10 hover:text-white font-mono text-[10px] tracking-widest uppercase rounded-lg transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-white hover:bg-white/80 text-black font-mono text-[10px] tracking-widest uppercase rounded-lg transition-colors shadow-sm font-bold"
                    >
                      {shippingForm.paymentMethod === 'cod' ? 'Complete Order' : 'Proceed to Payment'}
                    </button>
                  </div>
                </form>
              ) : checkoutStep === 'payment' ? (
                <div className="bg-[#f8fafc] text-[#334155] font-sans flex flex-col h-[580px] max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
                  {/* Header - Sticky */}
                  <div className="bg-white px-4 py-3 flex justify-between items-center shadow-sm border-b border-gray-100 shrink-0">
                    <button type="button" onClick={() => setCheckoutStep('info')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <span className="font-bold text-gray-800 text-sm">bKash Payment Verification</span>
                    <button type="button" onClick={() => setIsCheckingOut(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <X className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Amount Section */}
                    <div className="bg-white rounded-xl p-4 flex justify-between items-center shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2">
                        {/* Mock bkash logo */}
                        <div className="flex items-center gap-1.5">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 21.6444C17.3259 21.6444 21.6444 17.3259 21.6444 12C21.6444 6.67406 17.3259 2.35553 12 2.35553C6.67406 2.35553 2.35553 6.67406 2.35553 12C2.35553 17.3259 6.67406 21.6444 12 21.6444Z" fill="#E2136E"/>
                            <path d="M10.8267 15.8267L14.7333 12L10.8267 8.17333L9.65332 9.34667L12.3067 12L9.65332 14.6533L10.8267 15.8267Z" fill="white"/>
                          </svg>
                          <span className="text-[#E2136E] font-bold text-xl tracking-tight">bKash</span>
                        </div>
                      </div>
                      <div className="font-bold text-xl text-[#334155]">
                        ৳ {shippingFee}.00
                      </div>
                    </div>

                    {/* Note Section */}
                    <div className="bg-[#fef9c3] border border-[#fef08a] text-[#854d0e] text-[11px] text-center py-2.5 rounded shadow-sm">
                      <span className="font-bold">নোটঃ</span> টাকা পাঠানোর ৫-১০ সেকেন্ড পর ভেরিফাই করবেন।
                    </div>

                    {/* Main Pink Box */}
                    <div className="bg-[#E2136E] rounded-xl text-white p-5 shadow-lg">
                      <h3 className="text-center text-lg font-bold mb-4 tracking-wide text-white">ট্রানজেকশন আইডি দিন</h3>
                      <input
                        type="text"
                        placeholder="ট্রানজেকশন আইডি দিন"
                        value={shippingForm.transactionId}
                        onChange={(e) => setShippingForm({ ...shippingForm, transactionId: e.target.value })}
                        className="w-full bg-white text-gray-800 px-4 py-3.5 rounded text-center mb-5 focus:outline-none focus:ring-2 focus:ring-pink-300 shadow-inner font-mono text-sm"
                      />
                      
                      <div>
                        <h4 className="font-bold text-sm tracking-wider mb-4 text-white">INSTRUCTIONS</h4>
                        <ul className="space-y-4 text-xs sm:text-[13px] leading-relaxed">
                          <li className="flex items-start gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                            <p><strong className="text-[#FDE047] font-semibold">*247#</strong> ডায়াল করে আপনার <strong className="text-[#FDE047] font-semibold">BKASH</strong> মোবাইল মেনুতে যান অথবা <strong className="text-[#FDE047] font-semibold">BKASH</strong> অ্যাপে যান।</p>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                            <p><strong className="text-[#FDE047] font-semibold">"Send Money"</strong> -এ ক্লিক করুন।</p>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                            <div className="flex flex-col gap-1.5 w-full">
                              <p>প্রাপক নম্বর হিসেবে এই নম্বরটি লিখুন: </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <strong className="text-[#FDE047] text-base font-semibold">01629178834</strong> 
                                <button 
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText('01629178834');
                                    setCopiedNumber(true);
                                    setTimeout(() => setCopiedNumber(false), 2000);
                                  }}
                                  className="inline-flex items-center gap-1 bg-black/20 px-2 py-1 rounded text-[10px] hover:bg-black/30 transition-colors uppercase font-mono tracking-wider font-semibold"
                                >
                                  <Copy className="w-3 h-3" /> {copiedNumber ? 'Copied!' : 'Copy'}
                                </button>
                              </div>
                            </div>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                            <p>পরিমাণ: <strong className="text-[#FDE047] text-base font-semibold">{shippingFee}</strong> টাকা দিয়ে <strong className="text-[#FDE047] font-semibold">SUBMIT</strong> করুন।</p>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                            <p>এখন উপরের বক্সে আপনার <strong className="text-[#FDE047] font-semibold">Transaction ID</strong> দিন এবং <strong className="text-[#FDE047] font-semibold">VERIFY</strong> করুন।</p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Verify Button - Sticky */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0">
                    <button
                      type="button"
                      onClick={handleCheckoutSubmit}
                      className="w-full py-3.5 bg-[#E2136E] hover:bg-[#c91162] text-white font-bold text-sm tracking-wider uppercase rounded-xl transition-colors shadow-lg text-center"
                    >
                      VERIFY TRANSACTION
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 sm:p-8 space-y-6 text-left max-w-lg mx-auto overflow-y-auto max-h-[85vh]">
                  <div className="text-center space-y-2">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
                    <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase block font-bold">── ORDER CONFIRMED ──</span>
                    <span className="inline-block bg-white/10 text-emerald-400 font-mono text-xs px-3 py-1 rounded-full font-bold border border-emerald-400/30">
                      ID: {completedOrderSummary?.orderId || lastOrderId}
                    </span>
                  </div>

                  <div className="text-xs text-white/80 font-sans leading-relaxed text-center border-b border-white/10 pb-4">
                    Deep appreciation, <strong className="text-white">{completedOrderSummary?.customerName || shippingForm.name}</strong>. Your order is confirmed and currently being prepared for dispatch.
                  </div>

                  {/* Order Items Breakdown */}
                  {completedOrderSummary && completedOrderSummary.items.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[11px] font-mono tracking-wider text-emerald-400 uppercase font-bold border-b border-white/10 pb-1">
                        ORDERED ITEMS
                      </h4>
                      <div className="space-y-2.5">
                        {completedOrderSummary.items.map((item, idx) => (
                          <div key={idx} className="flex gap-3 bg-white/5 p-2.5 rounded-lg border border-white/10 text-xs">
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt={item.productName} className="w-12 h-12 object-contain bg-white/5 rounded border border-white/10 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-white truncate">{item.productName}</div>
                              <div className="text-[10px] text-white/60 font-mono">
                                Size: {item.selectedSize} {item.quantity > 1 ? `| Qty: ${item.quantity}` : ''}
                              </div>
                              {item.selectedOfferName && (
                                <div className="text-[10px] text-yellow-400 font-mono mt-0.5">
                                  Deal: {item.selectedOfferName}
                                </div>
                              )}
                              {item.bundleSelections && item.bundleSelections.length > 0 && (
                                <div className="text-[10px] text-white/50 font-mono mt-0.5">
                                  Included: {item.bundleSelections.join(', ')}
                                </div>
                              )}
                            </div>
                            <div className="text-right font-mono font-bold text-white shrink-0">
                              TK {item.finalPaidAmount.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Full Price Breakdown */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2 font-mono text-xs">
                    <h4 className="text-[11px] tracking-wider text-emerald-400 uppercase font-bold border-b border-white/10 pb-1.5 mb-2">
                      PAYMENT SUMMARY
                    </h4>
                    <div className="flex justify-between text-white/70">
                      <span>Items Subtotal:</span>
                      <span>TK {(completedOrderSummary?.subtotal || cartSubtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Delivery Fee:</span>
                      <span>
                        {(completedOrderSummary?.shippingFee ?? shippingFee) === 0 
                          ? 'FREE' 
                          : `TK ${(completedOrderSummary?.shippingFee ?? shippingFee).toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-white/10">
                      <span>Total Paid / Due:</span>
                      <span className="text-emerald-400">TK {(completedOrderSummary?.total || cartTotal).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Customer & Shipping Details */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-[11px] font-mono text-white/90 space-y-2">
                    <h4 className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider border-b border-white/10 pb-1.5">
                      DELIVERY & PAYMENT INFO
                    </h4>
                    <div className="space-y-1 text-white/80">
                      <p><span className="text-white/50">Recipient:</span> {completedOrderSummary?.customerName || shippingForm.name}</p>
                      <p><span className="text-white/50">Phone:</span> {completedOrderSummary?.customerPhone || shippingForm.phoneNumber}</p>
                      <p><span className="text-white/50">Address:</span> {completedOrderSummary?.customerAddress || shippingForm.address}</p>
                      <p><span className="text-white/50">Payment Method:</span> <strong className="text-white">{completedOrderSummary?.paymentMethod || (shippingForm.paymentMethod === 'cod' ? 'Cash on Delivery' : 'bKash')}</strong></p>
                      {completedOrderSummary?.transactionId && completedOrderSummary.transactionId !== 'Cash on Delivery' && (
                        <p><span className="text-white/50">Trx ID:</span> <strong className="text-yellow-400">{completedOrderSummary.transactionId}</strong></p>
                      )}
                      <p><span className="text-white/50">Shipping Carrier:</span> Pathao Merchant Express</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckingOut(false);
                      setCheckoutStep('info');
                      setIsCartOpen(false);
                    }}
                    className="w-full py-3.5 bg-white hover:bg-white/80 text-black font-display text-[10px] tracking-widest uppercase rounded-lg transition-colors mt-4 font-bold"
                  >
                    Return to browsing
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
          <div id="story-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-xl max-w-lg w-full shadow-2xl p-6 sm:p-8 space-y-5 max-h-[85vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center border-b border-white/20 pb-3">
                <div>
                  <h4 className="font-serif italic text-2xl text-white">The loomavenue.bd Blueprint</h4>
                  <p className="text-[9px] font-mono text-white/50 uppercase tracking-widest">LOOM AVENUE x VENTA STUDIOS</p>
                </div>
                <button
                  onClick={() => setIsStoryOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-full text-white/50 hover:text-white"
                  title="Close story"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-white/80 font-sans leading-relaxed">
                <p>
                  We don’t just drop products; we execute them after exhaustive research. From the hypersensitive selection of premium fabrics to the final stitch, every cap is engineered using the highest quality materials on the market. Our core philosophy is simple: delivering elite, uncompromised quality at a price point that defies industry norms.
                </p>
                <blockquote className="border-l-2 border-white/50 pl-4 py-2 italic text-white/90 bg-white/5 rounded-r-lg">
                  "We refuse to inflate our prices. Our community deserves premium construction without the luxury markup, a commitment proven by our flawless record of zero negative feedback since day one."
                </blockquote>
                <p>
                  But we aren't stopping there. Something massive is shifting behind the scenes. We are currently architecting a covert sustainability initiative designed to tackle our carbon footprint and make a definitive impact on our country. We’re keeping the exact details under wraps for now...but a cleaner future is coming soon, and we’re going to need our community's full energy to pull it off.
                </p>
                <p className="font-semibold text-white">
                  HIGHEST QUALITY. LIMITED PRICE. THE FUTURE IS COMING.
                </p>
              </div>

              <div className="border-t border-white/20 pt-4">
                <button
                  type="button"
                  onClick={() => setIsStoryOpen(false)}
                  className="w-full py-3 bg-white text-black hover:bg-white/80 font-mono text-[10px] tracking-widest uppercase rounded-lg transition-colors font-bold"
                >
                  Return to browsing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-white/10 py-8 px-4 text-center text-white/40 bg-transparent">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono">
          <p>© 2026 LOOM Avenue. All flaws perfected.</p>
          <div className="flex gap-6">
            <a href="https://www.instagram.com/loomavenue.bd?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" className="hover:text-white/80 transition-colors">instagram</a>
            <a href="https://www.facebook.com/share/1H5UCyX2cD/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="hover:text-white/80 transition-colors">facebook</a>
            <a href="https://www.tiktok.com/@loomavenue?is_from_webapp=1&sender_device=pc" target="_blank" rel="noreferrer" className="hover:text-white/80 transition-colors">tiktok</a>
            <button onClick={() => setIsStoryOpen(true)} className="hover:text-white/80 transition-colors">concept manifesto</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
