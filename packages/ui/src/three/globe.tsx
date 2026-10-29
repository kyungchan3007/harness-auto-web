"use client";

// 🌏 지구본 — 어두운 구 · 위경도선 · 오로라 테두리 빛 · 출발지 → 도착지 호 (색 = 받은 tone) · 출발지 주변에서 천천히 오감
// 어디를 그릴지 · 무슨 색인지는 쓰는 쪽이 정함 (디자인 시스템은 사이트 데이터를 모름)
// focus 를 주면 출발지 ~ 그 도착지 가운데가 앞으로 오게 부드럽게 돌고 그 호만 굵게 (홈 "여행지 고르기" 장면 · 작업 0070)
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, BackSide, type Group, type Mesh } from "three";
import { type Place, type Vec3, arcPoints, faceRotationY, midpoint, toVec3 } from "./geo";
import { Stage, type Tone, tokenColor, toneColor } from "./stage";

export type GlobeArc = { to: Place; tone: Tone | null };
export type GlobeProps = { origin: Place; arcs: GlobeArc[]; focus?: Place | null; className?: string };

/** 각도 a → b 로 가장 짧게 도는 차이 (-π ~ π) */
const turn = (a: number, b: number) => ((((b - a + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;
const TILT = 0.35;

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

function Arc({ from, to, color, animate, offset, emphasis }: { from: Place; to: Place; color: string; animate: boolean; offset: number; emphasis: "on" | "off" | "none" }) {
  const pts = useMemo(() => arcPoints(from, to, { segments: 96, lift: 0.28 }), [from, to]);
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
      <Line points={pts} color={color} lineWidth={emphasis === "on" ? 3 : 1.6} transparent opacity={emphasis === "off" ? 0.25 : 0.85} />
      <mesh ref={spark}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={end}>
        <sphereGeometry args={[emphasis === "on" ? 0.024 : 0.014, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function Earth({ origin, arcs, focus, animate }: { origin: Place; arcs: GlobeArc[]; focus: Place | null; animate: boolean }) {
  const spin = useRef<Group>(null);
  const tilt = useRef<Group>(null);
  // 한국 주변에서만 천천히 오감 (사용자 확인: "한국 주변에서만 오가게 해줘") — 서울이 가장자리로 밀리지 않게 ±0.35 rad · 한 번 오가는 데 약 21초
  //   ±0.55 로는 끝에서 서울이 테두리까지 가서 호가 거의 숨는 것을 화면에서 봄
  const base = faceRotationY(origin) - 0.3;
  // focus 가 있으면 출발지와 그 도착지의 가운데가 앞을 보게 (기울기도 그 위도 쪽으로) — 도착지만 가운데 두면 서울에서 오는 호가 가장자리로 숨었음
  //   움직임 줄이기면 바로 그 자리
  const mid = focus ? midpoint(origin, focus) : null;
  const target = mid ? { y: faceRotationY(mid), x: (mid.lat * Math.PI) / 180 } : null;
  useFrame(({ clock }, dt) => {
    if (!spin.current || !tilt.current) return;
    if (!target) {
      if (animate) spin.current.rotation.y = base + Math.sin(clock.elapsedTime * 0.3) * 0.35;
      tilt.current.rotation.x = TILT;
      return;
    }
    const k = animate ? 1 - Math.exp(-dt * 3) : 1;
    spin.current.rotation.y += turn(spin.current.rotation.y, target.y) * k;
    tilt.current.rotation.x += (target.x - tilt.current.rotation.x) * k;
  });
  const seoul = toVec3(origin.lat, origin.lng, 1.005);
  return (
    // 기울기 · 처음에 서울이 앞을 보게
    <group ref={tilt} rotation={[TILT, 0, 0]}>
      <group ref={spin} rotation={[0, base, 0]}>
        <mesh>
          <sphereGeometry args={[1, 64, 64]} />
          <meshBasicMaterial color="#07080c" />
        </mesh>
        <Graticule />
        <mesh position={seoul}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshBasicMaterial color={tokenColor("--hav-accent", "#4ff0e0")} />
        </mesh>
        {arcs.map((a, i) => (
          // 빛이 한꺼번에 출발하지 않게 호마다 시작점을 어긋나게
          <Arc
            key={a.to.id}
            from={origin}
            to={a.to}
            offset={i / arcs.length}
            color={toneColor(a.tone)}
            animate={animate}
            emphasis={!focus ? "none" : focus.id === a.to.id ? "on" : "off"}
          />
        ))}
      </group>
      <mesh scale={1.18}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial {...atmosphere} side={BackSide} blending={AdditiveBlending} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function Globe({ origin, arcs, focus = null, className = "" }: GlobeProps) {
  return (
    <Stage className={className} camera={{ position: [0, 0, 4.2], fov: 42 }}>
      {(animate) => <Earth origin={origin} arcs={arcs} focus={focus} animate={animate} />}
    </Stage>
  );
}
