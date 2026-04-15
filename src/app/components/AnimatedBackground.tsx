"use client";

import { useEffect, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the movement
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20, mass: 1 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20, mass: 1 });

  useEffect(() => {
    setMounted(true);
    const setMousePos = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", setMousePos);
    return () => window.removeEventListener("mousemove", setMousePos);
  }, [mouseX, mouseY]);

  // Dynamic template for the background radial gradient
  const background = useMotionTemplate`radial-gradient(1000px circle at ${springX}px ${springY}px, rgba(120, 119, 198, 0.12), transparent 70%)`;

  if (!mounted) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[-1] min-h-screen w-full"
      style={{ background }}
    />
  );
}