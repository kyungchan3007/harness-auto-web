"use client";

// 🐱 작업 고양이 — 렉돌 + 노란 안전모 (만드는 중 페이지 패널) · 몸은 ragdoll.tsx
import { RagdollFigure, type Mood } from "./ragdoll";
import { Stage, tokenColor } from "./stage";

export type { Mood } from "./ragdoll";
export { MOODS } from "./ragdoll";
export type WorkerCatProps = { mood: Mood; className?: string; label?: string };

export default function WorkerCat({ mood, className = "", label }: WorkerCatProps) {
  return (
    <Stage className={className} camera={{ position: [0, 0.35, 3.4], fov: 36 }} label={label}>
      {(animate) => (
        <>
          <ambientLight intensity={0.85} />
          <directionalLight position={[2, 3, 4]} intensity={1.4} />
          <pointLight position={[-2, 1, 2]} intensity={5} color={tokenColor("--hav-aurora-3", "#ff8ad8")} />
          <RagdollFigure mood={mood} gear="hardhat" animate={animate} />
        </>
      )}
    </Stage>
  );
}
