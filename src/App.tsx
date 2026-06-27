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

export default function App() {
  const [view, setView] = useState<'entrance' | 'shop'>('entrance');

  // Smoothly scroll window to the absolute top on view transitions
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [view]);

  return (
    <div className="w-full min-h-screen bg-transparent overflow-x-clip selection:bg-earth-300 selection:text-earth-950">
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
            <EntranceScreen onEnter={() => setView('shop')} />
          </motion.div>
        ) : (
          <motion.div
            key="shop-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full min-h-screen"
          >
            <ShopLayout onBackToEntrance={() => setView('entrance')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
