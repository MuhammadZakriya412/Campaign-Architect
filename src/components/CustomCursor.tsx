import React, { useRef, useEffect, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  
  const [isSupported, setIsSupported] = useState(false);
  
  // refs to keep state for high-performance direct DOM updates inside requestAnimationFrame
  const mouseCoords = useRef({ x: 0, y: 0 });
  const trailCoords = useRef({ x: 0, y: 0 });
  const isHoveringRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const isHiddenRef = useRef(true);

  useEffect(() => {
    // Only enable custom cursors on fine pointer devices (desktops/laptops with mouse/trackpad)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    setIsSupported(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsSupported(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    // Apply custom-cursor-active class to document body to hide default browser cursor safely
    document.body.classList.add('custom-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      mouseCoords.current.x = e.clientX;
      mouseCoords.current.y = e.clientY;
      
      if (isHiddenRef.current) {
        isHiddenRef.current = false;
        if (dotRef.current) dotRef.current.style.opacity = '1';
        if (ringRef.current) ringRef.current.style.opacity = '1';
      }
    };

    const handleMouseLeave = () => {
      isHiddenRef.current = true;
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };

    const handleMouseEnter = () => {
      isHiddenRef.current = false;
      if (dotRef.current) dotRef.current.style.opacity = '1';
      if (ringRef.current) ringRef.current.style.opacity = '1';
    };

    const handleMouseDown = () => {
      isMouseDownRef.current = true;
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };

    // Detect if hovering over clickable elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isClickable = 
        target.closest('button') || 
        target.closest('a') || 
        target.closest('select') || 
        target.closest('input') || 
        target.closest('textarea') ||
        target.closest('[role="button"]') ||
        target.closest('.cursor-pointer') ||
        window.getComputedStyle(target).cursor === 'pointer';

      isHoveringRef.current = !!isClickable;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    // Initialize trail coordinates to prevent weird starting jumps
    trailCoords.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    let animFrameId: number;
    const tick = () => {
      if (!isHiddenRef.current) {
        // Linear interpolation for smooth trailing action (lerp factor: 0.15)
        const dx = mouseCoords.current.x - trailCoords.current.x;
        const dy = mouseCoords.current.y - trailCoords.current.y;
        
        trailCoords.current.x += dx * 0.15;
        trailCoords.current.y += dy * 0.15;

        // Interactive scales
        const dotScale = isMouseDownRef.current ? 0.6 : isHoveringRef.current ? 1.5 : 1.0;
        const ringScale = isMouseDownRef.current ? 0.8 : isHoveringRef.current ? 1.6 : 1.0;

        if (dotRef.current) {
          dotRef.current.style.transform = `translate3d(${mouseCoords.current.x}px, ${mouseCoords.current.y}px, 0) translate(-50%, -50%) scale(${dotScale})`;
        }
        
        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${trailCoords.current.x}px, ${trailCoords.current.y}px, 0) translate(-50%, -50%) scale(${ringScale})`;
          
          if (isHoveringRef.current) {
            ringRef.current.style.borderColor = 'rgba(255, 255, 255, 0.85)';
            ringRef.current.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
          } else {
            ringRef.current.style.borderColor = 'rgba(255, 255, 255, 0.45)';
            ringRef.current.style.backgroundColor = 'transparent';
          }
        }
      }
      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animFrameId);
    };
  }, [isSupported]);

  if (!isSupported) return null;

  return (
    <>
      {/* Inner Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference transition-transform duration-100 ease-out opacity-0"
        style={{ willChange: 'transform, opacity' }}
      />
      {/* Outer Halo */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-7 h-7 border border-white/45 rounded-full pointer-events-none z-[9998] mix-blend-difference transition-all duration-150 ease-out opacity-0"
        style={{ willChange: 'transform, opacity, border-color, background-color' }}
      />
    </>
  );
}
