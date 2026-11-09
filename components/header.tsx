"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { EASE } from "./motion";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className="site-header"
      data-scrolled={scrolled}
      data-reveal=""
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <div className="frame header-inner">
        <a className="brand" href="#topo" aria-label="Autonomous Economy — início">Autonomous Economy</a>
        <nav className="header-nav" aria-label="Principal">
          <a className="link nav-link" href="#conversa">A conversa</a>
          <a className="btn btn-sm" href="#confirmar">Confirmar presença</a>
        </nav>
      </div>
    </motion.header>
  );
}
