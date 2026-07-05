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
import { supabase } from './lib/supabase';
import { Product } from './types';

export default function App() {
  const [view, setView] = useState<'entrance' | 'shop' | 'admin'>('entrance');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Supabase sync (Low Usage: Fetch on mount only, no real-time subscriptions)
    const fetchProducts = async () => {
      if (supabase) {
        const { data, error } = await supabase.from('products').select('*');
        if (data && data.length > 0 && !error) {
          setProducts(data);
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
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? data[0] : p));
      }
    } else {
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
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
        setProducts(prev => [...prev, data[0]]);
      }
    } else {
      setProducts(prev => [...prev, newProduct]);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (supabase) {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) {
        console.error('Delete failed:', error);
        alert(`Failed to delete product: ${error.message}`);
      } else {
        setProducts(prev => prev.filter(p => p.id !== productId));
      }
    } else {
      setProducts(prev => prev.filter(p => p.id !== productId));
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
        {/* Optimized WebM for Chrome/Firefox: explicit codec, strip audio, auto quality */}
        <source src="https://res.cloudinary.com/deyatjand/video/upload/f_webm,q_auto,vc_vp9,ac_none,w_1920,c_limit/v1782572836/IMG_2439_lnghj5.webm" type="video/webm" />
        {/* Optimized MP4 for Safari/iOS: explicit codec, strip audio, auto quality */}
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
