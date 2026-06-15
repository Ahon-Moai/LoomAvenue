import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Play, RotateCcw, Award, Sparkles, Heart, 
  ChevronLeft, ChevronRight, HelpCircle 
} from 'lucide-react';

interface ThreadWeaverGameProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FallingItem {
  id: number;
  x: number; // percentage (0 to 100)
  y: number; // percentage (0 to 100)
  type: 'linen' | 'cotton' | 'cap' | 'needle';
  speed: number;
  rotation: number;
  spinSpeed: number;
}

export default function ThreadWeaverGame({ isOpen, onClose }: ThreadWeaverGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('loom_weaver_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [basketX, setBasketX] = useState(50); // percentage (0 to 100)
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [caughtSplash, setCaughtSplash] = useState<{ id: number; x: number; text: string } | null>(null);
  const [discountUnlocked, setDiscountUnlocked] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const nextItemIdRef = useRef(0);
  const gameLoopRef = useRef<number | null>(null);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  // 1. Listen for key inputs for moving the wooden weaver shuttle (Left / Right Arrow, A / D keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D'].includes(e.key)) {
        keysPressedRef.current[e.key.toLowerCase()] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D'].includes(e.key)) {
        keysPressedRef.current[e.key.toLowerCase()] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 2. Play cycle & logic loops
  useEffect(() => {
    if (!isPlaying || gameOver || !isOpen) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    let lastTime = performance.now();
    let spawnAccumulator = 0;

    const gameLoop = (time: number) => {
      const delta = (time - lastTime) / 1000; // seconds elapsed
      lastTime = time;

      // Handle weaver shuttle movement with smooth physics updates
      let moveDir = 0;
      if (keysPressedRef.current['arrowleft'] || keysPressedRef.current['a']) moveDir -= 1;
      if (keysPressedRef.current['arrowright'] || keysPressedRef.current['d']) moveDir += 1;

      if (moveDir !== 0) {
        setBasketX(prev => {
          const next = prev + moveDir * 75 * delta; // speed: 75% width per second
          return Math.max(8, Math.min(92, next));
        });
      }

      // Spawning loop based on current level intensity
      spawnAccumulator += delta;
      const spawnInterval = Math.max(0.6, 1.4 - level * 0.15); // spawn speed scales with level up
      if (spawnAccumulator >= spawnInterval) {
        spawnAccumulator = 0;

        // Choose item type
        const rand = Math.random();
        let type: 'linen' | 'cotton' | 'cap' | 'needle' = 'linen';
        if (rand > 0.85) {
          type = 'cap'; // ultra rare premium item
        } else if (rand > 0.6) {
          type = 'cotton'; // raw eco fiber
        } else if (rand > 0.4) {
          type = 'needle'; // toxic needle obstacle
        }

        // Speed increases slightly at higher levels
        const baseSpeed = 22 + level * 4;
        const speed = baseSpeed + Math.random() * 8;

        const newItem: FallingItem = {
          id: nextItemIdRef.current++,
          x: 10 + Math.random() * 80,
          y: -10,
          type,
          speed,
          rotation: Math.random() * 360,
          spinSpeed: (Math.random() - 0.5) * 120, // spin degrees per sec
        };

        setFallingItems(prev => [...prev, newItem]);
      }

      // Update positions of falling craft assets
      setFallingItems(prevItems => {
        const remaining: FallingItem[] = [];

        prevItems.forEach(item => {
          const nextY = item.y + item.speed * delta;
          const nextRotation = item.rotation + item.spinSpeed * delta;

          // Check if it reached the bottom (catcher plate/basket zone is at y ~ 85)
          if (nextY >= 82 && nextY <= 89) {
            const distance = Math.abs(item.x - basketX);
            // Collision horizontal boundary limit
            if (distance < 12) {
              // Caught! Raise score or trigger penalty
              if (item.type === 'needle') {
                // Penalty
                setLives(prev => {
                  const updated = prev - 1;
                  if (updated <= 0) {
                    setGameOver(true);
                  }
                  return updated;
                });
                setCaughtSplash({ id: item.id, x: item.x, text: '-20 Damage' });
                setScore(prev => Math.max(0, prev - 20));
              } else {
                // Success catches
                let pts = 10;
                let text = '+10 Linen';
                if (item.type === 'cotton') {
                  pts = 15;
                  text = '+15 Cotton';
                } else if (item.type === 'cap') {
                  pts = 30;
                  text = '+30 Venta Cap! ⭐';
                }

                setScore(prev => {
                  const nextScore = prev + pts;
                  // Dynamic leveling benchmark system
                  const nextLevel = Math.floor(nextScore / 100) + 1;
                  if (nextLevel > level) {
                    setLevel(nextLevel);
                  }
                  // Check discount milestone
                  if (nextScore >= 150 && !discountUnlocked) {
                    setDiscountUnlocked(true);
                  }
                  return nextScore;
                });
                setCaughtSplash({ id: item.id, x: item.x, text });
              }
              return; // remove from board
            }
          }

          // Let items disappear at y > 100
          if (nextY > 100) {
            // If we missed a helpful item, no hard penalty but slight feedback
            if (item.type !== 'needle') {
              // Missed premium item
            }
          } else {
            remaining.push({
              ...item,
              y: nextY,
              rotation: nextRotation,
            });
          }
        });

        return remaining;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameOver, level, basketX, isOpen, discountUnlocked]);

  // Synchronize high scores
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('loom_weaver_highscore', score.toString());
    }
  }, [score, highScore]);

  // Handle splash messages auto timeout
  useEffect(() => {
    if (caughtSplash) {
      const timer = setTimeout(() => setCaughtSplash(null), 800);
      return () => clearTimeout(timer);
    }
  }, [caughtSplash]);

  const handleStartGame = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setBasketX(50);
    setFallingItems([]);
    setGameOver(false);
    setIsPlaying(true);
  };

  const handleClose = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    setIsPlaying(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          className="bg-[#faf9f4] text-[#10352e] border-2 border-[#10352e]/25 rounded-2xl max-w-lg w-full overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.55)] relative flex flex-col h-[520px] max-h-[90vh]"
        >
          {/* Header Theme Strip */}
          <div className="h-1.5 bg-gradient-to-r from-[#10352e] via-[#8d5a38] to-[#506257] w-full" />

          {/* Top Panel Actions */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-[#10352e]/10">
            <div className="flex flex-col">
              <span className="font-mono text-[8.5px] tracking-[0.35em] text-[#8d5a38] uppercase font-bold">
                VENTA × LOOM INTERACTIVE
              </span>
              <h3 className="font-serif italic text-xl tracking-tight text-[#10352e] flex items-center gap-1.5">
                The Loom Weaver
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="p-1 text-[#10352e]/60 hover:text-[#10352e] transition-colors hover:bg-[#10352e]/5 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Interactive Playground Core */}
          <div className="flex-1 relative bg-stone-100 overflow-hidden flex flex-col justify-between">
            {/* Ambient Background Grid pattern inside space */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,53,46,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,53,46,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {!isPlaying && !gameOver ? (
              /* --- SPLASH DESK OVERLAY --- */
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="w-16 h-16 rounded-full bg-[#10352e]/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-[#10352e]" />
                </div>
                <h4 className="font-serif italic text-2xl text-[#10352e] mb-2">Weave the Golden Threads</h4>
                <p className="font-sans text-[12.5px] text-stone-650 max-w-sm mb-6 leading-relaxed">
                  Catch clean organic cotton, raw linen spools, and premium caps as they fall through the grid to score points. Avoid broken furnace needles!
                </p>

                <div className="bg-[#faf9f4] border border-[#10352e]/10 p-3.5 rounded-xl w-full max-w-xs mb-6 text-left space-y-1.5">
                  <div className="text-[11px] font-mono uppercase text-stone-400 font-semibold tracking-wider flex justify-between">
                    <span>Target Score:</span>
                    <span className="text-[#8d5a38]">150 pts</span>
                  </div>
                  <div className="text-[11px] font-sans text-stone-600 flex items-center gap-1.5">
                    <span className="inline-block w-4 text-center">🌾</span>
                    <span><strong>Cotton & Linen spools</strong> give positive points.</span>
                  </div>
                  <div className="text-[11px] font-sans text-stone-600 flex items-center gap-1.5">
                    <span className="inline-block w-4 text-center">⭐</span>
                    <span><strong>Rare Venta Caps</strong> award a huge +30 bonus.</span>
                  </div>
                  <div className="text-[11px] font-sans text-stone-600 flex items-center gap-1.5">
                    <span className="inline-block w-4 text-center">📍</span>
                    <span className="text-red-750 font-medium"><strong>Broken needles</strong> steal points & loose a heart!</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 w-full max-w-xs">
                  <button
                    onClick={handleStartGame}
                    className="w-full bg-[#10352e] text-[#faf9f4] hover:bg-[#8d5a38] py-3.5 px-6 rounded-xl font-mono text-[11px] uppercase tracking-widest font-bold transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Begin Weaving</span>
                  </button>
                  <div className="text-[10px] font-mono text-stone-400 text-center uppercase tracking-widest hidden sm:block">
                    Use Mouse drag or Left/Right Arrow keys
                  </div>
                </div>
              </div>
            ) : gameOver ? (
              /* --- GAME OVER RETROSYSTEM --- */
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-3">
                  <Award className="w-6 h-6 text-[#8d5a38]" />
                </div>
                <h4 className="font-serif italic text-3xl text-stone-900 mb-1">Weaving Halted</h4>
                <p className="font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-4">
                  Thread density compromised
                </p>

                <div className="bg-[#faf9f4] border-2 border-[#10352e]/10 py-4 px-6 rounded-2xl w-full max-w-[280px] mb-6 shadow-sm">
                  <div className="text-stone-500 font-mono text-[10px] uppercase tracking-widest mb-1">Your Yield Score</div>
                  <div className="font-serif text-4xl text-[#10352e] mb-2">{score}</div>
                  
                  <div className="w-full h-[1px] bg-[#10352e]/10 my-2" />

                  <div className="flex justify-between items-center text-[11px] font-mono text-stone-500">
                    <span>HIGH RECORD:</span>
                    <span className="font-bold text-[#8d5a38]">{highScore} pts</span>
                  </div>
                </div>

                {discountUnlocked ? (
                  <div className="bg-[#10352e] text-[#faf9f4] p-4 rounded-xl max-w-sm mb-5 border border-dashed border-[#faf9f4]/20 animate-pulse">
                    <span className="font-mono text-[8px] tracking-[0.25em] uppercase text-[#8d5a38] font-bold block mb-1">MILESTONE UNLOCKED</span>
                    <h5 className="font-serif italic text-base">You became a Master Weaver!</h5>
                    <p className="text-[11px] text-[#faf9f4]/80 mt-1 font-mono uppercase tracking-widest">
                      Enter code <span className="bg-white/10 px-1.5 py-0.5 rounded text-white font-bold tracking-normal select-text">LOOMVENTA15</span> for 15% off
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-stone-500 max-w-xs mb-5">
                    Score at least <strong className="font-semibold text-stone-800">150 points</strong> to unlock our secret weavers discount code!
                  </p>
                )}

                <button
                  onClick={handleStartGame}
                  className="bg-[#10352e] text-[#faf9f4] hover:bg-[#8d5a38] py-3 px-6 rounded-xl font-mono text-[11px] uppercase tracking-widest font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              </div>
            ) : (
              /* --- ACTIVE REAL-TIME GAMEPLAY SCREEN --- */
              <div 
                ref={containerRef}
                className="flex-1 w-full relative overflow-hidden select-none touch-none bg-stone-50 cursor-crosshair pb-12"
                onMouseMove={(e) => {
                  if (!containerRef.current) return;
                  const rect = containerRef.current.getBoundingClientRect();
                  const percentage = ((e.clientX - rect.left) / rect.width) * 100;
                  setBasketX(Math.max(8, Math.min(92, percentage)));
                }}
                onTouchMove={(e) => {
                  if (!containerRef.current || e.touches.length === 0) return;
                  const rect = containerRef.current.getBoundingClientRect();
                  const clientX = e.touches[0].clientX;
                  const percentage = ((clientX - rect.left) / rect.width) * 100;
                  setBasketX(Math.max(8, Math.min(92, percentage)));
                }}
              >
                {/* Score & Health Header */}
                <div className="absolute top-3 left-4 right-4 z-25 flex items-center justify-between font-mono pointer-events-none">
                  {/* Left stats panel */}
                  <div className="flex items-center gap-4 bg-[#faf9f4]/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#10352e]/10">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-stone-400 uppercase tracking-widest">Score</span>
                      <span className="text-sm font-bold text-[#10352e]">{score}</span>
                    </div>
                    <div className="w-[1px] h-6 bg-stone-300" />
                    <div className="flex flex-col">
                      <span className="text-[8px] text-stone-400 uppercase tracking-widest">Lvl</span>
                      <span className="text-sm font-bold text-[#8d5a38]">{level}</span>
                    </div>
                  </div>

                  {/* Right lives heart elements */}
                  <div className="flex gap-1.5 bg-[#faf9f4]/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#10352e]/10 items-center">
                    <span className="text-[8px] text-stone-400 uppercase tracking-widest mr-1">Yield</span>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Heart 
                        key={i} 
                        className={`w-3.5 h-3.5 transition-all duration-300 ${
                          i < lives ? 'text-red-650 fill-red-600 scale-100' : 'text-stone-300 scale-90 opacity-40'
                        }`} 
                      />
                    ))}
                  </div>
                </div>

                {/* Falling item nodes rendered carefully inside coordinates */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                  {fallingItems.map((item) => {
                    const inlineStyle: React.CSSProperties = {
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                      position: 'absolute',
                    };

                    let content = '🌾';
                    let label = '';
                    let color = '#506257';

                    if (item.type === 'linen') {
                      content = '🪡';
                      label = 'Linen';
                      color = '#8d5a38';
                    } else if (item.type === 'cotton') {
                      content = '💭';
                      label = 'Cotton';
                      color = '#10352e';
                    } else if (item.type === 'cap') {
                      content = '🧢';
                      label = 'Venta Cap';
                      color = '#cebfa4';
                    } else if (item.type === 'needle') {
                      content = '📍';
                      label = 'Needle';
                      color = '#b91c1c';
                    }

                    return (
                      <div 
                        key={item.id} 
                        style={inlineStyle}
                        className="flex flex-col items-center select-none"
                      >
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-white/95 shadow-md border-2"
                          style={{ borderColor: color }}
                        >
                          {content}
                        </div>
                        <span 
                          className="text-[8px] font-mono tracking-widest uppercase mt-0.5 px-1 rounded bg-[#faf9f4] font-semibold py-px shadow-xs"
                          style={{ color }}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Score catch visual splash feedback notification */}
                {caughtSplash && (
                  <motion.div
                    initial={{ opacity: 1, y: 70, scale: 0.8 }}
                    animate={{ opacity: 0, y: 35, scale: 1.15 }}
                    transition={{ duration: 0.7 }}
                    className="absolute pointer-events-none z-20 font-serif italic text-base text-[#10352e] bg-white/90 backdrop-blur-xs py-1 px-3.5 rounded-full border border-[#10352e]/20 shadow-md font-bold"
                    style={{ left: `${caughtSplash.x}%`, transform: 'translateX(-50%)', top: '78%' }}
                  >
                    {caughtSplash.text}
                  </motion.div>
                )}

                {/* Bottom Basket Platform (wooden loom shuttle) moving horizontally */}
                <div 
                  className="absolute bottom-5 h-7 w-20 bg-[#10352e] hover:bg-[#8d5a38] border-2 border-[#faf9f4] rounded-lg shadow-lg flex items-center justify-between px-2 cursor-col-resize transition-colors z-20"
                  style={{ left: `${basketX}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                  <span className="font-mono text-[8px] text-[#faf9f4] tracking-[0.2em] font-semibold uppercase">LOOM</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                </div>
              </div>
            )}

            {/* Bottom visual indicator for physical buttons/controls */}
            {isPlaying && (
              <div className="bg-[#10352e]/5 border-t border-[#10352e]/10 py-2.5 px-4 flex justify-between items-center z-10 font-mono text-[9px] text-[#10352e]/80">
                <div className="flex gap-1">
                  <span>Target:</span>
                  <span className="font-bold">150 Points</span>
                </div>
                
                {/* On-screen arrows specifically for comfortable mobile play */}
                <div className="flex gap-2.5">
                  <button
                    onMouseDown={() => { keysPressedRef.current['arrowleft'] = true; }}
                    onMouseUp={() => { keysPressedRef.current['arrowleft'] = false; }}
                    onTouchStart={() => { keysPressedRef.current['arrowleft'] = true; }}
                    onTouchEnd={() => { keysPressedRef.current['arrowleft'] = false; }}
                    className="p-1 px-3 bg-white border border-[#10352e]/20 active:bg-stone-150 rounded"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={() => { keysPressedRef.current['arrowright'] = true; }}
                    onMouseUp={() => { keysPressedRef.current['arrowright'] = false; }}
                    onTouchStart={() => { keysPressedRef.current['arrowright'] = true; }}
                    onTouchEnd={() => { keysPressedRef.current['arrowright'] = false; }}
                    className="p-1 px-3 bg-white border border-[#10352e]/20 active:bg-stone-150 rounded"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="hidden sm:inline font-bold">
                  MOVE MOUSE TO STEER
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
