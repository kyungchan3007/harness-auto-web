"use client";

// 🐱 작업 고양이 — 하얀 고양이 · 민트 후드 작업복 (만드는 중 페이지 패널 · 참고 그림 2) · 몸은 cat-figure.tsx
import { CatFigure, type Mood } from "./cat-figure";
import { Stage, tokenColor } from "./stage";

export type { Mood } from "./cat-figure";
export { MOODS } from "./cat-figure";
export type WorkerCatProps = { mood: Mood; className?: string; label?: string };

export default function WorkerCat({ mood, className = "", label }: WorkerCatProps) {
  return (
    <Stage className={className} camera={{ position: [0, 0.35, 3.4], fov: 36 }} label={label}>
      {(animate) => (
        <>
          <ambientLight intensity={0.85} />
          <directionalLight position={[2, 3, 4]} intensity={1.4} />
          <pointLight position={[-2, 1, 2]} intensity={5} color={tokenColor("--hav-aurora-3", "#ff8ad8")} />
          <CatFigure mood={mood} gear="suit" animate={animate} />
        </>
      )}
    </Stage>
  );
}
