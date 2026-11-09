"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EASE } from "./motion";
import { GridLines } from "./grid-lines";

type Layer = { src: string; /** deslocamento total em px ao longo da rolagem (máx. ~50) */ amount: number };

function ArtLayer({ src, amount, progress, enabled, eager }: Layer & { progress: MotionValue<number>; enabled: boolean; eager: boolean }) {
  const y = useTransform(progress, [0, 1], [0, enabled ? -amount : 0]);
  return (
    <motion.img className="art-layer" src={src} alt="" aria-hidden="true" draggable={false}
      loading={eager ? "eager" : "lazy"} decoding="async" style={{ y }} />
  );
}

/**
 * Gravura em camadas (fundo → primeiro plano) com parallax suave ligado à rolagem.
 * O parallax é desligado no mobile (<768px) e com prefers-reduced-motion;
 * a imagem funciona normalmente sem animação.
 */
export function ParallaxArt({ layers, aspect, eager = false, className = "" }: {
  layers: Layer[]; aspect: string; eager?: boolean; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const enabled = wide && !reduced;

  return (
    <motion.div
      ref={ref}
      className={`art ${className}`}
      style={{ ["--ar" as string]: aspect }}
      data-reveal=""
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -5% 0px" }}
      transition={{ duration: 1.6, ease: EASE }}
    >
      <div className="art-layers">
        {layers.map((l) => (
          <ArtLayer key={l.src} {...l} progress={scrollYProgress} enabled={enabled} eager={eager} />
        ))}
      </div>
      <GridLines />
    </motion.div>
  );
}
