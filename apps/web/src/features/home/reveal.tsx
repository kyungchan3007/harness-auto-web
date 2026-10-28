"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** 섹션이 화면에 들어올 때 아래에서 살짝 떠오름 — "움직임 줄이기"면 그대로 */
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
