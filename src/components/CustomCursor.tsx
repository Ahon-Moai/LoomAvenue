import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Motion values to avoid triggering constant React re-renders on every pixel move
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth physical spring simulation for lagging premium feel
  const springConfig = { damping: 32, stiffness: 260, mass: 0.5 };
  const outerX = useSpring(mouseX, springConfig);
  const outerY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Elegant check: only activate custom cursor on fine-pointing devices (desktops)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsVisible(e.matches);
      if (e.matches) {
        document.body.classList.add('custom-cursor-active');
      } else {
        document.body.classList.remove('custom-cursor-active');
      }
    };

    // Initial check
    handler(mediaQuery);

    if (!mediaQuery.matches) return;

    // Track position
    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);

    // Track hovered interactive elements
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const checkClickable = (el: HTMLElement | null): boolean => {
        if (!el) return false;
        const tagName = el.tagName.toLowerCase();
        if (
          tagName === 'button' ||
          tagName === 'a' ||
          el.classList.contains('cursor-pointer') ||
          el.getAttribute('role') === 'button' ||
          tagName === 'input' ||
          tagName === 'select' ||
          tagName === 'textarea' ||
          el.closest('button') ||
          el.closest('a')
        ) {
          return true;
        }
        return checkClickable(el.parentElement);
      };

      if (checkClickable(target)) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', onMouseOver, { passive: true });

    // Handle cursor exiting boundary
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [mouseX, mouseY]);

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        /* Seamlessly hide default cursor only on devices where the custom cursor has booted successfully */
        @media (pointer: fine) {
          body.custom-cursor-active,
          body.custom-cursor-active * {
            cursor: none !important;
          }
        }
      `}</style>

      {/* Inner Precision Dot */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full pointer-events-none z-[9999] mix-blend-difference bg-white"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicked ? 0.7 : isHovered ? 1.8 : 1,
        }}
        transition={{ duration: 0.15 }}
      />

      {/* Outer Spring Halo Ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-white pointer-events-none z-[9998] mix-blend-difference"
        style={{
          x: outerX,
          y: outerY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicked ? 0.75 : isHovered ? 1.6 : 1,
          opacity: isClicked ? 0.9 : isHovered ? 0.75 : 0.45,
          borderWidth: isHovered ? '2px' : '1.2px',
        }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
}
