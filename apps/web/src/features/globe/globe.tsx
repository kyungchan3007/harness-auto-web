"use client";

// 🌏 지구본 — 어두운 구 · 위경도선 · 오로라 테두리 빛 · 서울 → 여행지 호 (색 = 그 통화 신호) · 천천히 회전
import type { Signal } from "@hav/shared/signal";
import { Line } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useInView, useReducedMotion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { AdditiveBlending, BackSide, type Group, type Mesh } from "three";
import { DESTINATIONS, SEOUL, type Vec3, arcPoints, faceRotationY, toVec3 } from "./geo";

export type ArcSignal = { currency: string; signal: Signal | null };

/** 색의 원본은 packages/ui/src/tokens.css — 화면에서 CSS 변수로 읽고, 못 읽으면 같은 값 */
function tokenColor(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}
const signalColor = (s: Signal | null) =>
  s === "cheap" ? tokenColor("--hav-cheap", "#4c9bff") : s === "expensive" ? tokenColor("--hav-expensive", "#ff5a5f") : tokenColor("--hav-normal", "#c7c7cc");

/** 테두리가 빛나는 대기 — 카메라를 향한 면일수록 투명 (fresnel) · 오로라 청록 → 보라 */
const atmosphere = {
  uniforms: {},
  vertexShader: /* glsl */ `
    varying vec3 vNormal;
    void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    varying vec3 vNormal;
    void main() {
      float rim = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
      vec3 aurora = mix(vec3(0.31, 0.94, 0.88), vec3(0.61, 0.55, 1.0), vNormal.y * 0.5 + 0.5);
      gl_FragColor = vec4(aurora, 1.0) * rim;
    }`,
};

function Graticule() {
  const lines = useMemo(() => {
    const out: Vec3[][] = [];
    for (let lat = -60; lat <= 60; lat += 30) out.push(Array.from({ length: 73 }, (_, i) => toVec3(lat, i * 5 - 180, 1.001)));
    for (let lng = -180; lng < 180; lng += 30) out.push(Array.from({ length: 37 }, (_, i) => toVec3(i * 5 - 90, lng, 1.001)));
    return out;
  }, []);
  return lines.map((pts, i) => <Line key={i} points={pts} color="#3a3f4b" lineWidth={0.6} transparent opacity={0.55} />);
}

function Arc({ to, color, animate, offset }: { to: (typeof DESTINATIONS)[number]; color: string; animate: boolean; offset: number }) {
  const pts = useMemo(() => arcPoints(SEOUL, to, { segments: 96, lift: 0.28 }), [to]);
  const spark = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!spark.current) return;
    const t = animate ? (clock.elapsedTime * 0.25 + offset) % 1 : 0.5;
    const p = pts[Math.floor(t * (pts.length - 1))];
    spark.current.position.set(p[0], p[1], p[2]);
  });
  const end = toVec3(to.lat, to.lng, 1.004);
  return (
    <group>
      <Line points={pts} color={color} lineWidth={1.6} transparent opacity={0.85} />
      <mesh ref={spark}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={end}>
        <sphereGeometry args={[0.014, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function Earth({ arcs, animate }: { arcs: ArcSignal[]; animate: boolean }) {
  const spin = useRef<Group>(null);
  const bySignal = useMemo(() => new Map(arcs.map((a) => [a.currency, a.signal])), [arcs]);
  useFrame((_, delta) => {
    if (animate && spin.current) spin.current.rotation.y += delta * 0.06;
  });
  const seoul = toVec3(SEOUL.lat, SEOUL.lng, 1.005);
  return (
    // 기울기 · 처음에 서울이 앞을 보게
    <group rotation={[0.35, 0, 0]}>
      <group ref={spin} rotation={[0, faceRotationY(SEOUL) - 0.5, 0]}>
        <mesh>
          <sphereGeometry args={[1, 64, 64]} />
          <meshBasicMaterial color="#07080c" />
        </mesh>
        <Graticule />
        <mesh position={seoul}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshBasicMaterial color={tokenColor("--hav-accent", "#4ff0e0")} />
        </mesh>
        {DESTINATIONS.map((d, i) => (
          // 빛이 한꺼번에 출발하지 않게 호마다 시작점을 어긋나게
          <Arc key={d.id} to={d} offset={i / DESTINATIONS.length} color={signalColor(bySignal.get(d.currency ?? "") ?? null)} animate={animate} />
        ))}
      </group>
      <mesh scale={1.18}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial {...atmosphere} side={BackSide} blending={AdditiveBlending} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

/** WebGL 을 쓸 수 있는지 — 못 쓰면 지구본만 빠진다 (글자는 그대로) */
function canUseWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function Globe({ arcs, className = "" }: { arcs: ArcSignal[]; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { margin: "200px" });
  const reduce = useReducedMotion();
  const [webgl] = useState(canUseWebGL);
  const animate = !reduce;
  return (
    <div ref={box} className={className} aria-hidden>
      {webgl && (
        <Canvas
          camera={{ position: [0, 0, 4.2], fov: 42 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          // 화면 밖이면 그리지 않음 · 움직임 줄이기면 한 번만 그림
          frameloop={!inView ? "never" : animate ? "always" : "demand"}
        >
          <Earth arcs={arcs} animate={animate} />
        </Canvas>
      )}
    </div>
  );
}
