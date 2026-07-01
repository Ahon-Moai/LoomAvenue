/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import EntranceScreen from './components/EntranceScreen';
import ShopLayout from './components/ShopLayout';
import CustomCursor from './components/CustomCursor';
import SharedBackground from './components/SharedBackground';
import AdminPanel from './components/AdminPanel';
import { products as initialProducts } from './data';
import { Product } from './types';

export default function App() {
  const [view, setView] = useState<'entrance' | 'shop' | 'admin'>('entrance');
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    const saved = localStorage.getItem('loom_products');
    if (saved) {
      try {
        setProducts(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => {
      const next = prev.map(p => p.id === updatedProduct.id ? updatedProduct : p);
      localStorage.setItem('loom_products', JSON.stringify(next));
      return next;
    });
  };

  // Smoothly scroll window to the absolute top on view transitions
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [view]);

  return (
    <div className="w-full min-h-screen bg-transparent overflow-x-clip selection:bg-earth-300 selection:text-earth-950">
      {/* Hidden preloaded video to ensure instant playback when navigating to Worn Textiles/Earth & Clay */}
      <video autoPlay loop muted playsInline preload="auto" className="fixed w-0 h-0 opacity-0 pointer-events-none z-[-9999]">
        <source src="https://res.cloudinary.com/deyatjand/video/upload/f_auto,q_auto/v1782572836/IMG_2439_lnghj5.webm" type="video/webm" />
        <source src="https://res.cloudinary.com/deyatjand/video/upload/f_auto,q_auto/v1782572836/IMG_2439_lnghj5.mp4" type="video/mp4" />
      </video>
      <CustomCursor />
      <SharedBackground />
      <AnimatePresence mode="wait">
        {view === 'entrance' ? (
          <motion.div
            key="entrance-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full h-full"
          >
            <EntranceScreen onEnter={() => setView('shop')} onAdmin={() => setView('admin')} />
          </motion.div>
        ) : view === 'shop' ? (
          <motion.div
            key="shop-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full min-h-screen"
          >
            <ShopLayout onBackToEntrance={() => setView('entrance')} onAdmin={() => setView('admin')} products={products} />
          </motion.div>
        ) : (
          <motion.div
            key="admin-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full min-h-screen"
          >
            <AdminPanel products={products} onUpdateProduct={handleUpdateProduct} onBack={() => setView('entrance')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
