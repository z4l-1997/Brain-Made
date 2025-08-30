"use client";

import type * as React from "react";
import { motion } from "framer-motion";
import { Wrench, Bot, Palette, Zap, Star, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  gradient: string;
  iconColor: string;
}

const menuItems: MenuItem[] = [
  {
    icon: <Wrench className="h-5 w-5" />,
    label: "Toolkit",
    href: "/toolkit",
    gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
    iconColor: "text-blue-500",
  },
  {
    icon: <Bot className="h-5 w-5" />,
    label: "AI Toolkit",
    href: "/ai-toolkit",
    gradient: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)",
    iconColor: "text-orange-500",
  },
  // {
  //   icon: <Palette className="h-5 w-5" />,
  //   label: "CSS Framework",
  //   href: "/css",
  //   gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
  //   iconColor: "text-green-500",
  // },
  // {
  //   icon: <Zap className="h-5 w-5" />,
  //   label: "Code Snippets",
  //   href: "/snippets",
  //   gradient: "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)",
  //   iconColor: "text-red-500",
  // },
  // {
  //   icon: <Star className="h-5 w-5" />,
  //   label: "Trending Repos",
  //   href: "/trending",
  //   gradient: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(219,39,119,0.06) 50%, rgba(190,24,93,0) 100%)",
  //   iconColor: "text-pink-500",
  // },
  // {
  //   icon: <Globe className="h-5 w-5" />,
  //   label: "Open Source",
  //   href: "/opensource",
  //   gradient: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(8,145,178,0.06) 50%, rgba(14,116,144,0) 100%)",
  //   iconColor: "text-cyan-500",
  // },
];

// Safelist for Tailwind CSS to ensure hover classes are included
// group-hover:text-blue-500 group-hover:text-orange-500 group-hover:text-green-500
// group-hover:text-red-500 group-hover:text-pink-500 group-hover:text-cyan-500

const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
};

const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
};

const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      duration: 0.5,
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  },
};

const navGlowVariants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeInOut" as const,
    },
  },
};

const sharedTransition = {
  type: "spring" as const,
  stiffness: 100,
  damping: 20,
  duration: 0.5,
};

// Create motion components
const MotionLink = motion(Link);

export default function MenuBar() {
  const { theme } = useTheme();
  const pathname = usePathname();

  const isDarkTheme = theme === "dark";

  // Helper function to check if route is active
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <motion.nav
      className="w-max p-2 rounded-2xl bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-lg border border-border/40 shadow-lg relative overflow-hidden"
      initial="initial"
      whileHover="hover"
    >
      <motion.div
        className={`absolute -inset-2 rounded-3xl z-0 pointer-events-none ${
          isDarkTheme
            ? "bg-gradient-radial from-blue-400/10 via-purple-400/5 to-transparent"
            : "bg-gradient-radial from-blue-400/5 via-purple-400/3 to-transparent"
        }`}
        variants={navGlowVariants}
      />
      <ul className="flex items-center gap-2 relative z-10">
        {menuItems.map((item, index) => {
          const active = isActive(item.href);

          return (
            <motion.li key={item.label} className="relative">
              <motion.div
                className="rounded-xl overflow-visible group relative"
                style={{ perspective: "600px" }}
                whileHover="hover"
                initial="initial"
              >
                <motion.div
                  className="absolute inset-0 z-0 pointer-events-none rounded-2xl"
                  variants={glowVariants}
                  style={{
                    background: item.gradient,
                    opacity: active ? 0.3 : 0,
                  }}
                  animate={active ? "hover" : "initial"}
                />
                <motion.div
                  className="absolute inset-0 z-0 pointer-events-none rounded-2xl"
                  variants={glowVariants}
                  style={{
                    background: item.gradient,
                  }}
                />
                <MotionLink
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 relative z-10 transition-colors rounded-xl ${
                    active
                      ? "text-foreground bg-background/20 border border-border/20"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                  variants={itemVariants}
                  transition={sharedTransition}
                  style={{ transformStyle: "preserve-3d", transformOrigin: "center bottom" }}
                >
                  <span
                    className={`transition-colors duration-300 ${
                      active ? item.iconColor : `text-muted-foreground group-hover:${item.iconColor}`
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </MotionLink>
                <MotionLink
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 absolute inset-0 z-10 transition-colors rounded-xl ${
                    active
                      ? "text-foreground bg-background/20 border border-border/20"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                  variants={backVariants}
                  transition={sharedTransition}
                  style={{ transformStyle: "preserve-3d", transformOrigin: "center top", rotateX: 90 }}
                >
                  <span
                    className={`transition-colors duration-300 ${
                      active ? item.iconColor : `text-muted-foreground group-hover:${item.iconColor}`
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </MotionLink>
              </motion.div>
            </motion.li>
          );
        })}
      </ul>
    </motion.nav>
  );
}
