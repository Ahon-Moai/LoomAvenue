/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EntranceScreen } from './components/EntranceScreen';
import ShopLayout from './components/ShopLayout';
import CustomCursor from './components/CustomCursor';
import { SharedBackground } from './components/SharedBackground';
import AdminPanel from './components/AdminPanel';
import { supabase } from './lib/supabase';
import { Product } from './types';

const CACHE_KEY = 'aether_products_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

const updateCache = (data: Product[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data
    }));
  } catch (e) {
    console.warn('Failed to update products cache in localStorage:', e);
  }
};

export default function App() {
  const [view, setView] = useState<'entrance' | 'shop' | 'admin'>('entrance');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Supabase sync with client-side cache fallback for high efficiency
    const fetchProducts = async () => {
      // Check cache first
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { timestamp, data } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL && data && data.length > 0) {
            setProducts(data);
            return; // Cache hit - avoid DB query completely
          }
        }
      } catch (e) {
        // Fallback to fresh fetch on parse error
      }

      if (supabase) {
        const { data, error } = await supabase.from('products').select('*');
        if (data && data.length > 0 && !error) {
          setProducts(data);
          updateCache(data);
        }
      }
    };
    
    fetchProducts();
  }, []);

  const handleUpdateProduct = async (updatedProduct: Product) => {
    if (supabase) {
      const { data, error } = await supabase.from('products')
        .update(updatedProduct)
        .eq('id', updatedProduct.id)
        .select();
        
      if (error) {
        console.error('Update failed:', error);
        alert(`Failed to update product: ${error.message}`);
      } else if (data && data.length > 0) {
        setProducts(prev => {
          const updated = prev.map(p => p.id === updatedProduct.id ? data[0] : p);
          updateCache(updated);
          return updated;
        });
      }
    } else {
      setProducts(prev => {
        const updated = prev.map(p => p.id === updatedProduct.id ? updatedProduct : p);
        updateCache(updated);
        return updated;
      });
    }
  };

  const handleAddProduct = async (newProduct: Product) => {
    if (supabase) {
      // Omit the temporary ID so Supabase can generate a valid UUID
      const { id, ...productToInsert } = newProduct;
      const { data, error } = await supabase.from('products').insert([productToInsert]).select();
      
      if (error) {
        console.error('Insert failed:', error);
        alert(`Failed to add product: ${error.message}`);
      } else if (data && data.length > 0) {
        setProducts(prev => {
          const updated = [...prev, data[0]];
          updateCache(updated);
          return updated;
        });
      }
    } else {
      setProducts(prev => {
        const updated = [...prev, newProduct];
        updateCache(updated);
        return updated;
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (supabase) {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) {
        console.error('Delete failed:', error);
        alert(`Failed to delete product: ${error.message}`);
      } else {
        setProducts(prev => {
          const updated = prev.filter(p => p.id !== productId);
          updateCache(updated);
          return updated;
        });
      }
    } else {
      setProducts(prev => {
        const updated = prev.filter(p => p.id !== productId);
        updateCache(updated);
        return updated;
      });
    }
  };

  // Smoothly scroll window to the absolute top on view transitions
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [view]);

  return (
    <div className="w-full min-h-screen bg-transparent overflow-x-clip selection:bg-earth-300 selection:text-earth-950">
      {/* Hidden preloaded video to ensure instant playback when navigating to Worn Textiles/Earth & Clay */}
      <video autoPlay loop muted playsInline preload="auto" className="fixed w-0 h-0 opacity-0 pointer-events-none z-[-9999]">
        <source src="https://ik.imagekit.io/t1q0n1ovm/WhatsApp%20Video%202026-06-16%20at%2022.36.54(1).mp4" type="video/mp4" />
        <source src="https://res.cloudinary.com/deyatjand/video/upload/f_mp4,q_auto,vc_h264,ac_none,w_1920,c_limit/v1782572836/IMG_2439_lnghj5.mp4" type="video/mp4" />
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
            <EntranceScreen onEnter={() => setView('shop')} onOpenAdmin={() => setView('admin')} />
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
            <AdminPanel
              products={products}
              onUpdateProduct={handleUpdateProduct}
              onAddProduct={handleAddProduct}
              onDeleteProduct={handleDeleteProduct}
              onBack={() => setView('entrance')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
