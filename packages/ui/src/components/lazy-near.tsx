"use client";

// 화면 가까이 올 때만 불러오는 부품 — 3D 처럼 무거운 묶음을 첫 로드에서 빼고 (성능 · 작업 0060)
//   불러오기 전에는 같은 className 의 빈 칸을 그려서 자리가 밀리지 않음 (CLS)
//   화면 근처(margin)에 들어오면 → 브라우저가 한가할 때 → 묶음을 받아 그림 · 한 번 받으면 다음부터 바로
import { type ComponentType, useEffect, useRef, useState } from "react";

type Loader<P> = () => Promise<{ default: ComponentType<P> }>;

const idle = (fn: () => void) => {
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(fn, { timeout: 1500 });
  else setTimeout(fn, 200);
};

export function lazyNear<P extends { className?: string }>(load: Loader<P>, margin = "300px"): ComponentType<P> {
  let cached: ComponentType<P> | null = null;
  function Near(props: P) {
    const box = useRef<HTMLDivElement>(null);
    const [Loaded, setLoaded] = useState<ComponentType<P> | null>(() => cached);
    useEffect(() => {
      if (Loaded || !box.current) return;
      let alive = true;
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io.disconnect();
          idle(() =>
            load().then((m) => {
              cached = m.default;
              if (alive) setLoaded(() => m.default);
            }),
          );
        },
        { rootMargin: margin },
      );
      io.observe(box.current);
      return () => {
        alive = false;
        io.disconnect();
      };
    }, [Loaded]);
    if (Loaded) return <Loaded {...props} />;
    return <div ref={box} className={props.className} aria-hidden />;
  }
  return Near;
}
