"use client";

// 3D 공용 틀 — 모든 three.js 장면은 이 안에 (docs/design.md 3D 성능 기준)
//   화면 밖이면 그리지 않음 · WebGL 이 없으면 빈 칸 (글자는 그대로) · 움직임 줄이기면 한 번만 그림 · 픽셀 밀도 최대 2
import { Canvas } from "@react-three/fiber";
import { useInView, useReducedMotion } from "motion/react";
import { type ReactNode, useRef, useState } from "react";

/** 색의 원본은 tokens.css — 화면에서 CSS 변수로 읽고, 못 읽으면 같은 값 */
export function tokenColor(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export type Tone = "cheap" | "normal" | "expensive";
export const toneColor = (t: Tone | null) =>
  t === "cheap" ? tokenColor("--hav-cheap", "#4c9bff") : t === "expensive" ? tokenColor("--hav-expensive", "#ff5a5f") : tokenColor("--hav-normal", "#c7c7cc");

export function canUseWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function Stage({
  className = "",
  camera,
  label,
  children,
}: {
  className?: string;
  camera: { position: [number, number, number]; fov: number };
  /** 화면 읽기 프로그램용 설명 — 없으면 꾸밈으로 숨김 */
  label?: string;
  /** animate=false 면 시간에 따라 움직이지 말 것 (움직임 줄이기) */
  children: (animate: boolean) => ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { margin: "200px" });
  const reduce = useReducedMotion();
  const [webgl] = useState(canUseWebGL);
  const animate = !reduce;
  return (
    <div ref={box} className={className} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {webgl && (
        <Canvas camera={camera} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} frameloop={!inView ? "never" : animate ? "always" : "demand"}>
          {children(animate)}
        </Canvas>
      )}
    </div>
  );
}
