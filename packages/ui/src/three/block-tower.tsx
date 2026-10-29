"use client";

// 🧱 블록 탑 — 블록 count 개를 젠가처럼 쌓음 · 아래 → 위로 오로라 색 (청록 → 보라 → 핑크) · 맨 위(최신) 블록이 위에서 떨어져 앉음
// 블록이 무엇인지는 쓰는 쪽이 정함 (만드는 중: 머지된 PR 하나) · 탑이 높아지면 전체를 줄여 화면에 맞춤
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, type Group } from "three";
import { Stage, tokenColor } from "./stage";
import { BLOCK, towerLayout } from "./tower";

export type BlockTowerProps = { count: number; className?: string; label?: string };

const FIT = 2.6; // 탑이 이 높이보다 크면 줄임
const DROP = 1.6; // 최신 블록이 떨어지기 시작하는 높이

function aurora(t: number, stops: Color[]): Color {
  const x = Math.min(1, Math.max(0, t)) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  return stops[i].clone().lerp(stops[i + 1], x - i);
}

function Tower({ count, animate }: { count: number; animate: boolean }) {
  const { spots, height } = useMemo(() => towerLayout(count), [count]);
  const colors = useMemo(() => {
    const stops = [tokenColor("--hav-aurora-1", "#4ff0e0"), tokenColor("--hav-aurora-2", "#9c8cff"), tokenColor("--hav-aurora-3", "#ff8ad8")].map((c) => new Color(c));
    // 아래쪽은 어둡게 눌러 최신 쪽이 더 빛나 보이게
    return spots.map((s) => aurora(s.t, stops).multiplyScalar(0.45 + 0.55 * s.t));
  }, [spots]);
  const spin = useRef<Group>(null);
  const top = useRef<Group>(null);
  const born = useRef<number | null>(null);
  const scale = height > FIT ? FIT / height : 1;

  useFrame(({ clock }) => {
    if (spin.current && animate) spin.current.rotation.y = 0.6 + clock.elapsedTime * 0.12;
    if (!top.current) return;
    if (!animate) {
      top.current.position.y = 0;
      return;
    }
    born.current ??= clock.elapsedTime;
    // 0.4초 기다렸다가 떨어지고 살짝 튐
    const t = Math.max(0, clock.elapsedTime - born.current - 0.4);
    const fall = Math.min(1, t / 0.7);
    const bounce = fall < 1 ? 0 : Math.max(0, Math.sin((t - 0.7) * 14) * 0.06 * Math.exp(-(t - 0.7) * 6));
    top.current.position.y = DROP * (1 - fall * fall) + bounce;
  });

  return (
    <group scale={scale} position={[0, (-height * scale) / 2, 0]}>
      <group ref={spin} rotation={[0, 0.6, 0]}>
        {spots.map((s, i) => {
          const last = i === spots.length - 1;
          const block = (
            <RoundedBox key={i} args={[BLOCK.long, BLOCK.tall, BLOCK.short]} radius={0.05} smoothness={3} position={s.position} rotation={[0, s.rotationY, 0]}>
              <meshStandardMaterial color={colors[i]} roughness={0.55} emissive={last ? colors[i] : "#000000"} emissiveIntensity={last ? 0.45 : 0} />
            </RoundedBox>
          );
          return last ? (
            <group key={i} ref={top}>
              {block}
            </group>
          ) : (
            block
          );
        })}
      </group>
    </group>
  );
}

export default function BlockTower({ count, className = "", label }: BlockTowerProps) {
  return (
    <Stage className={className} camera={{ position: [0, 1.4, 6.2], fov: 32 }} label={label}>
      {(animate) => (
        <>
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 5, 4]} intensity={1.8} />
          <pointLight position={[-3, 1, 2]} intensity={5} color={tokenColor("--hav-aurora-3", "#ff8ad8")} />
          <group rotation={[0.12, 0, 0]}>
            <Tower count={count} animate={animate} />
          </group>
        </>
      )}
    </Stage>
  );
}
