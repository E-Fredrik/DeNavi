"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, Navigation } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/" },
  { name: "Services", href: "/" },
  { name: "Contact", href: "/" },
];

const EXPAND_SCROLL_THRESHOLD = 80;

const containerVariants = {
  expanded: {
    y: 0,
    opacity: 1,
    width: "auto",
    transition: {
      y: { type: "spring", damping: 18, stiffness: 250 },
      opacity: { duration: 0.3 },
      type: "spring",
      damping: 20,
      stiffness: 300,
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
  collapsed: {
    y: 0,
    opacity: 1,
    width: "3rem",
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300,
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
} as const;

const logoVariants = {
  expanded: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { type: "spring", damping: 15 },
  },
  collapsed: { opacity: 0, x: -25, rotate: -180, transition: { duration: 0.3 } },
} as const;

const itemVariants = {
  expanded: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", damping: 15 },
  },
  collapsed: { opacity: 0, x: -20, scale: 0.95, transition: { duration: 0.2 } },
} as const;

const collapsedIconVariants = {
  expanded: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  collapsed: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 300,
      delay: 0.15,
    },
  },
} as const;

export function Navbar() {
  const [isExpanded, setExpanded] = React.useState(true);
  const { data: session } = useSession();
  const isSignedIn = !!session?.user;

  const { scrollY } = useScroll();
  const lastScrollY = React.useRef(0);
  const scrollPositionOnCollapse = React.useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;

    if (isExpanded && latest > previous && latest > 150) {
      setExpanded(false);
      scrollPositionOnCollapse.current = latest;
    } else if (
      !isExpanded &&
      latest < previous &&
      scrollPositionOnCollapse.current - latest > EXPAND_SCROLL_THRESHOLD
    ) {
      setExpanded(true);
    }

    lastScrollY.current = latest;
  });

  const handleNavClick = (e: React.MouseEvent) => {
    if (!isExpanded) {
      e.preventDefault();
      setExpanded(true);
    }
  };

  const handleSignOut = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  return (
    <div className="fixed top-6 right-6 z-50">
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={containerVariants}
        whileHover={isExpanded ? {} : { scale: 1.1 }}
        whileTap={isExpanded ? {} : { scale: 0.95 }}
        onClick={handleNavClick}
        className={cn(
          "flex items-center rounded-full border bg-background/80 shadow-lg backdrop-blur-sm h-12",
          isExpanded ? "overflow-visible" : "overflow-hidden",
          !isExpanded && "cursor-pointer justify-center"
        )}
      >
        <motion.div
          variants={logoVariants}
          className="shrink-0 flex items-center font-semibold pl-4 pr-2"
        >
          <Navigation className="h-6 w-6" />
        </motion.div>

        <motion.div
          className={cn(
            "flex items-center gap-1 sm:gap-4 pr-4",
            !isExpanded && "pointer-events-none"
          )}
        >
          {navItems.map((item) => (
            <motion.a
              key={item.name}
              href={item.href}
              variants={itemVariants}
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
            >
              {item.name}
            </motion.a>
          ))}

          {isSignedIn ? (
            <>
              <ModeToggle />
              <Link
                href="/admin/dashboard"
                onClick={(e) => e.stopPropagation()}
                className="text-sm font-medium text-primary-foreground bg-primary px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors duration-200"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-sm font-medium text-foreground border border-border bg-transparent px-3 py-1.5 rounded-md hover:bg-muted transition-colors duration-200"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <ModeToggle />
              <Link
                href="/sign-in"
                onClick={(e) => e.stopPropagation()}
                className="text-sm font-medium text-primary-foreground bg-primary px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={(e) => e.stopPropagation()}
                className="text-sm font-medium text-foreground border border-border bg-transparent px-3 py-1.5 rounded-md hover:bg-muted transition-colors duration-200"
              >
                Sign Up
              </Link>
            </>
          )}
        </motion.div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            variants={collapsedIconVariants}
            animate={isExpanded ? "expanded" : "collapsed"}
          >
            <Menu className="h-6 w-6" />
          </motion.div>
        </div>
      </motion.nav>
    </div>
  );
}

