"use client";

// 🐷 돼지 저금통 — three.js 도형만 (모델 파일 없음) · 표정 이름만 받고, 무엇을 보고 고를지는 쓰는 쪽이 정함 (docs/design.md three.js 표)
// happy 폴짝 · 볼 빨강 · worried 땀방울 · 살짝 떪 · sad 고개 숙임 · neutral 숨쉬기
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, type Group } from "three";
import { Stage, tokenColor } from "./stage";

export const PIGGY_MOODS = ["happy", "worried", "sad", "neutral"] as const;
export type PiggyMood = (typeof PIGGY_MOODS)[number];
export type PiggyProps = { mood: PiggyMood; className?: string; label?: string };

const STILL_T = 1.2;

function Scene({ mood, animate }: { mood: PiggyMood; animate: boolean }) {
  const body = useRef<Group>(null);
  const head = useRef<Group>(null);
  const drop = useRef<Group>(null);
  const c = useMemo(() => {
    const pink = new Color(tokenColor("--hav-aurora-3", "#ff8ad8")).lerp(new Color("#ffffff"), 0.25);
    return {
      pink,
      dark: pink.clone().multiplyScalar(0.72),
      ink: new Color("#1d1d1f"),
      cheek: new Color(tokenColor("--hav-expensive", "#ff5a5f")),
      drop: new Color(tokenColor("--hav-cheap", "#4c9bff")),
      slot: new Color("#2a2a2c"),
    };
  }, []);

  useFrame(({ clock }) => {
    const t = animate ? clock.elapsedTime : STILL_T;
    const b = body.current;
    const h = head.current;
    if (!b || !h) return;
    b.position.set(0, 0, 0);
    b.rotation.set(0, -0.95, 0);
    h.rotation.set(0, 0, 0);
    if (mood === "happy") {
      b.position.y = Math.abs(Math.sin(t * 3.2)) * 0.18;
      b.rotation.z = Math.sin(t * 3.2) * 0.05;
    } else if (mood === "worried") {
      b.position.x = Math.sin(t * 22) * 0.012;
      b.rotation.z = Math.sin(t * 1.5) * 0.04;
    } else if (mood === "sad") {
      h.rotation.x = 0.28;
      b.position.y = -0.05 + Math.sin(t * 0.9) * 0.01;
    } else {
      b.scale.setScalar(1 + Math.sin(t * 1.6) * 0.015);
    }
    if (drop.current) drop.current.position.y = 0.62 - ((t * 0.5) % 1) * 0.25;
  });

  const eyeY = mood === "sad" ? 0.08 : 0.14;
  return (
    <>
      <ambientLight intensity={0.95} />
      <directionalLight position={[2, 3, 4]} intensity={1.5} />
      <group ref={body}>
        {/* 몸 · 등 위 동전 구멍 · 꼬리 */}
        <mesh scale={[1.15, 0.92, 0.92]}>
          <sphereGeometry args={[0.62, 40, 40]} />
          <meshStandardMaterial color={c.pink} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.56, -0.02]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.3, 0.03, 0.07]} />
          <meshStandardMaterial color={c.slot} />
        </mesh>
        <mesh position={[-0.74, 0.12, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.07, 0.022, 8, 20, Math.PI * 1.6]} />
          <meshStandardMaterial color={c.dark} />
        </mesh>
        {/* 다리 */}
        {[
          [-0.36, 0.26],
          [0.36, 0.26],
          [-0.36, -0.26],
          [0.36, -0.26],
        ].map(([x, z]) => (
          <mesh key={`${x}${z}`} position={[x, -0.52, z]}>
            <cylinderGeometry args={[0.1, 0.11, 0.22, 16]} />
            <meshStandardMaterial color={c.dark} roughness={0.5} />
          </mesh>
        ))}
        {/* 얼굴 (앞 = +x) */}
        <group ref={head} position={[0.5, 0.06, 0]}>
          <mesh position={[0.2, -0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.17, 0.19, 0.14, 24]} />
            <meshStandardMaterial color={c.dark} roughness={0.4} />
          </mesh>
          {[-0.06, 0.06].map((z) => (
            <mesh key={z} position={[0.275, -0.04, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.025, 0.025, 0.02, 12]} />
              <meshBasicMaterial color={c.ink} />
            </mesh>
          ))}
          {[-0.2, 0.2].map((z) => (
            <mesh key={z} position={[0.08, eyeY + 0.08, z]} scale={mood === "happy" ? [1, 0.55, 1] : 1}>
              <sphereGeometry args={[0.055, 16, 16]} />
              <meshBasicMaterial color={c.ink} />
            </mesh>
          ))}
          {mood === "happy" &&
            [-0.3, 0.3].map((z) => (
              <mesh key={z} position={[0.02, -0.1, z]} scale={[0.4, 0.6, 1]}>
                <sphereGeometry args={[0.07, 12, 12]} />
                <meshBasicMaterial color={c.cheek} transparent opacity={0.6} />
              </mesh>
            ))}
          {/* 귀 — 시무룩하면 처짐 */}
          {[-0.24, 0.24].map((z) => (
            <mesh key={z} position={[-0.12, 0.42, z]} rotation={[z > 0 ? (mood === "sad" ? 1.1 : 0.35) : mood === "sad" ? -1.1 : -0.35, 0, -0.2]}>
              <coneGeometry args={[0.11, 0.22, 4]} />
              <meshStandardMaterial color={c.dark} roughness={0.5} />
            </mesh>
          ))}
        </group>
        {mood === "worried" && (
          <group ref={drop} position={[0.45, 0.62, -0.42]}>
            <mesh>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshStandardMaterial color={c.drop} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.07, 0]}>
              <coneGeometry args={[0.042, 0.09, 12]} />
              <meshStandardMaterial color={c.drop} roughness={0.2} />
            </mesh>
          </group>
        )}
      </group>
    </>
  );
}

export default function Piggy({ mood, className = "", label }: PiggyProps) {
  return (
    <Stage className={className} camera={{ position: [0.4, 0.5, 3.2], fov: 34 }} label={label}>
      {(animate) => <Scene mood={mood} animate={animate} />}
    </Stage>
  );
}
