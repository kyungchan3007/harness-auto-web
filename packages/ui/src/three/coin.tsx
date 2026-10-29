"use client";

// 🪙 동전 — 통화 둘러보기 (docs/design.md three.js 표) · 기호와 신호(tone)만 받음 · 어느 통화인지는 쓰는 쪽이 정함
// 천천히 흔들림 · 기호가 바뀌면 한 바퀴 뒤집히며 바뀜 · 싼 편이면 반짝 · 비싼 편이면 살짝 가라앉음
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { CanvasTexture, Color, type Group, type Mesh, SRGBColorSpace } from "three";
import { Stage, type Tone, tokenColor, toneColor } from "./stage";

export type CoinProps = { symbol: string; tone: Tone | null; className?: string; label?: string };

const FLIP_S = 0.7; // 뒤집는 데 걸리는 초

/** 앞면 그림 — 신호 색 바탕 · 가운데 기호 · 가장자리 고리 (글꼴 파일을 받지 않게 캔버스에 시스템 글꼴로) */
function faceTexture(symbol: string, face: string, ink: string): CanvasTexture {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.fillStyle = face;
  g.fillRect(0, 0, size, size);
  g.strokeStyle = ink;
  g.globalAlpha = 0.35;
  g.lineWidth = 10;
  g.beginPath();
  g.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
  g.stroke();
  g.globalAlpha = 1;
  g.fillStyle = ink;
  g.textAlign = "center";
  g.textBaseline = "middle";
  const px = symbol.length <= 1 ? 300 : symbol.length === 2 ? 210 : 150;
  g.font = `700 ${px}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  g.fillText(symbol, size / 2, size / 2 + px * 0.04);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  // 원기둥 윗면 UV 는 90° 돌아가 있어서 바로 세움
  t.center.set(0.5, 0.5);
  t.rotation = Math.PI / 2;
  return t;
}

function Glints({ color, animate }: { color: Color; animate: boolean }) {
  const g = useRef<Group>(null);
  useFrame(({ clock }) => {
    const w = g.current;
    if (!w) return;
    const t = animate ? clock.elapsedTime : 1;
    w.children.forEach((m, i) => {
      const k = (t * 0.9 + i / 3) % 1;
      m.scale.setScalar(Math.sin(k * Math.PI) * 0.09);
    });
  });
  return (
    <group ref={g}>
      {[
        [0.95, 0.7, 0.3],
        [-0.9, 0.45, 0.3],
        [0.7, -0.85, 0.3],
      ].map((p) => (
        <mesh key={p.join()} position={p as [number, number, number]} rotation={[0, 0, Math.PI / 4]}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ symbol, tone, animate }: Omit<CoinProps, "className" | "label"> & { animate: boolean }) {
  const coin = useRef<Group>(null);
  const face = useRef<Mesh>(null);
  // 화면에 보이는 기호 — 새 기호가 오면 뒤집는 중간(옆면이 보일 때) 바꿈
  const [shown, setShown] = useState(symbol);
  const flip = useRef<number | null>(null);
  useEffect(() => {
    if (symbol === shown) return;
    if (!animate) setShown(symbol);
    else flip.current = 0;
  }, [symbol, shown, animate]);

  const colors = useMemo(() => {
    const faceColor = new Color(toneColor(tone));
    return {
      face: `#${faceColor.getHexString()}`,
      rim: faceColor.clone().multiplyScalar(0.7),
      ink: tokenColor("--hav-surface", "#000000"),
      glint: new Color(tokenColor("--hav-accent", "#4ff0e0")),
    };
  }, [tone]);
  const texture = useMemo(() => (typeof document === "undefined" ? null : faceTexture(shown, colors.face, colors.ink)), [shown, colors]);
  useEffect(() => () => texture?.dispose(), [texture]);

  useFrame(({ clock }, dt) => {
    const c = coin.current;
    if (!c) return;
    const t = animate ? clock.elapsedTime : 0;
    let spin = 0;
    if (flip.current != null) {
      flip.current = Math.min(1, flip.current + dt / FLIP_S);
      const p = flip.current;
      const ease = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
      spin = ease * Math.PI * 2;
      if (p >= 0.25 && shown !== symbol) setShown(symbol);
      if (p >= 1) flip.current = null;
    }
    c.rotation.y = Math.sin(t * 0.6) * 0.35 + spin;
    c.rotation.x = Math.sin(t * 0.45) * 0.08;
    // 비싼 편: 살짝 가라앉고 기울어짐
    const sink = tone === "expensive" ? -0.18 : 0;
    c.position.y = sink + Math.sin(t * 1.1) * 0.05;
    c.rotation.z = tone === "expensive" ? -0.12 : 0;
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 3, 4]} intensity={1.6} />
      <pointLight position={[-3, 1, 2]} intensity={6} color={tokenColor("--hav-aurora-3", "#ff8ad8")} />
      <group ref={coin}>
        {/* 원기둥을 눕혀 앞뒤 면이 카메라를 봄 · 재질 순서 = 옆 · 윗면 · 아랫면 */}
        <mesh ref={face} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1, 1, 0.16, 64]} />
          <meshStandardMaterial attach="material-0" color={colors.rim} metalness={0.6} roughness={0.35} />
          <meshStandardMaterial attach="material-1" map={texture} metalness={0.25} roughness={0.45} />
          <meshStandardMaterial attach="material-2" map={texture} metalness={0.25} roughness={0.45} />
        </mesh>
      </group>
      {tone === "cheap" && <Glints color={colors.glint} animate={animate} />}
    </>
  );
}

export default function Coin({ className = "", label, ...rest }: CoinProps) {
  return (
    <Stage className={className} camera={{ position: [0, 0, 4.2], fov: 38 }} label={label}>
      {(animate) => <Scene {...rest} animate={animate} />}
    </Stage>
  );
}
