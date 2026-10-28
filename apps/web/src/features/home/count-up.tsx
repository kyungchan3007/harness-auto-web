"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

/**
 * 숫자가 0 → 실제 값으로 올라감. 끝값은 항상 서버가 그린 정확한 글자 그대로 (애니메이션은 중간만)
 * "움직임 줄이기"면 처음부터 끝값
 */
export function CountUp({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    const target = Number(text.replace(/,/g, ""));
    if (!el || !inView || reduce || !Number.isFinite(target)) return;
    const decimals = text.split(".")[1]?.length ?? 0;
    const fmt = (v: number) => v.toLocaleString("ko-KR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    const controls = animate(0, target, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => (el.textContent = fmt(v)),
      onComplete: () => (el.textContent = text),
    });
    return () => controls.stop();
  }, [inView, reduce, text]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {text}
    </span>
  );
}
