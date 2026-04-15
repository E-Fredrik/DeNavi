"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export default function CustomCursor() {
  const [hovered, setHovered] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    borderRadius: number;
  } | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isClient, setIsClient] = useState(false);

  // Quick responsivness for the dot
  const cursorX = useSpring(mouseX, { stiffness: 800, damping: 40, mass: 0.1 });
  const cursorY = useSpring(mouseY, { stiffness: 800, damping: 40, mass: 0.1 });

  // Smoother, slightly delayed responsiveness for the ring/trail
  const trailX = useSpring(mouseX, { stiffness: 300, damping: 30, mass: 0.5 });
  const trailY = useSpring(mouseY, { stiffness: 300, damping: 30, mass: 0.5 });

  useEffect(() => {
    setIsClient(true);
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // If we are currently hovering over an element, we don't necessarily want the track to move freely,
      // but here we let it snap entirely using framer motion's declarative variants
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const hoverable = target.closest("button, a, [role='button'], input, select, textarea");

      if (hoverable) {
        const rect = hoverable.getBoundingClientRect();
        const style = window.getComputedStyle(hoverable);
        const br = parseInt(style.borderRadius) || 8;
        
        // Add slightly elegant padding
        const padding = 6;
        setHovered({
          x: rect.left - padding,
          y: rect.top - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
          borderRadius: br + padding / 2, // Smooth scaling
        });
      } else {
        setHovered(null);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY]);

  useEffect(() => {
    if (!isClient) return;
    document.body.classList.add("hide-cursor");
    return () => document.body.classList.remove("hide-cursor");
  }, [isClient]);

  if (!isClient) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        body, a, button, [role="button"], input[type="button"], input[type="submit"] {
          cursor: none !important;
        }
      `}} />
      
      {/* Central exact cursor point */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[10000] rounded-full mix-blend-difference bg-white"
        style={{
          x: cursorX,
          y: cursorY,
          width: 6,
          height: 6,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          opacity: hovered ? 0 : 1, // Hide dot when hovered
        }}
      />

      {/* Morphing Trail / Box */}
      {hovered ? (
        <motion.div
          className="pointer-events-none fixed left-0 top-0 z-[9999] border border-white/40 bg-white/5 mix-blend-difference"
          initial={false}
          animate={{
            x: hovered.x,
            y: hovered.y,
            width: hovered.width,
            height: hovered.height,
            borderRadius: hovered.borderRadius,
            opacity: 1,
            scale: 1,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            mass: 0.8
          }}
        />
      ) : (
        <motion.div
          className="pointer-events-none fixed left-0 top-0 z-[9999] border-2 border-white/50 mix-blend-difference"
          style={{
            x: trailX,
            y: trailY,
            width: 32,
            height: 32,
            borderRadius: 16,
            translateX: "-50%",
            translateY: "-50%",
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        />
      )}
    </>
  );
}
