"use client";

// 💰 돈 든 고양이 — 렉돌이 ₩ 금화를 안고 있음 (직구 계산기) · 몸은 ragdoll.tsx
// happy 금화를 안고 웃음 · worried 금화를 꽉 쥐고 땀 · sad 귀 납작 + 금화 위로 세금 동전이 날아감 · neutral 꼬리만 살랑
import { RagdollFigure } from "./ragdoll";
import { Stage } from "./stage";

export const MONEY_MOODS = ["happy", "worried", "sad", "neutral"] as const;
export type MoneyMood = (typeof MONEY_MOODS)[number];
export type MoneyCatProps = { mood: MoneyMood; className?: string; label?: string };

export default function MoneyCat({ mood, className = "", label }: MoneyCatProps) {
  return (
    <Stage className={className} camera={{ position: [0.35, 0.4, 3.3], fov: 36 }} label={label}>
      {(animate) => (
        <>
          <ambientLight intensity={1} />
          <directionalLight position={[2, 3, 4]} intensity={1.5} />
          <RagdollFigure mood={mood} gear="coin" animate={animate} />
        </>
      )}
    </Stage>
  );
}
