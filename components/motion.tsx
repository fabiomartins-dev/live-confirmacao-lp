"use client";

import { motion, type TargetAndTransition } from "motion/react";
import type { ElementType, ReactNode } from "react";

/** Easing calmo e preciso (easeOutExpo suavizado) usado em toda a página. */
export const EASE = [0.22, 1, 0.36, 1] as const;

const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

type Common = {
  delay?: number;
  /** true = anima na carga (hero); false = anima ao entrar na área visível, uma única vez. */
  immediate?: boolean;
};

function trigger(immediate: boolean | undefined, to: TargetAndTransition) {
  return immediate ? { animate: to } : { whileInView: to, viewport: VIEWPORT };
}

/** Fade + deslocamento vertical curto. */
export function Reveal({
  children, className, delay = 0, immediate, y = 20,
}: Common & { children: ReactNode; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      data-reveal=""
      initial={{ opacity: 0, y }}
      {...trigger(immediate, { opacity: 1, y: 0 })}
      transition={{ duration: 0.85, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Título revelado por linhas: cada linha sobe dentro de uma máscara (overflow hidden). */
export function MaskLines({
  as = "h2", lines, className, id, delay = 0, immediate, stagger = 0.11, y = 26,
}: Common & { as?: "h1" | "h2" | "h3" | "p"; lines: string[]; className?: string; id?: string; stagger?: number; y?: number }) {
  const Tag = as as ElementType;
  return (
    <Tag className={className} id={id}>
      {lines.map((line, i) => (
        <span className="mask" key={line}>
          <motion.span
            className="mask-line"
            data-reveal=""
            initial={{ opacity: 0, y }}
            {...trigger(immediate, { opacity: 1, y: 0 })}
            transition={{ duration: 0.9, ease: EASE, delay: delay + i * stagger }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Linha tracejada horizontal, desenhada progressivamente (scaleX) ao entrar na tela. */
export function HLine({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      className="hline"
      data-draw=""
      aria-hidden="true"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "0px 0px -4% 0px" }}
      transition={{ duration: 1.4, ease: EASE, delay }}
    />
  );
}
