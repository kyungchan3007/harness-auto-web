"use client";

// 🐱 자리 옮기기 장면 — 책상 N개가 한 줄로 · 캐릭터가 지금 자리 앞으로 걸어감 (자리가 바뀌면 걷는 동작)
// 무슨 단계인지 · 이름은 쓰는 쪽이 정함 (디자인 시스템은 자리 번호만 받음)
import { RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Color, type Group, type PerspectiveCamera } from "three";
import { Stage, tokenColor } from "./stage";
import { CatFigure, type Mood } from "./cat-figure";

export type StationsProps = {
  count: number;
  /** 캐릭터가 갈 자리 (0부터) */
  active: number;
  /** 앞에서부터 끝난 자리 수 */
  done: number;
  /** 자리에 도착해서의 표정 (걷는 동안은 walking) */
  mood: Mood;
  className?: string;
  label?: string;
};

// 한 자리 너비 — 카메라가 화면 비율에 맞춰 물러나서, 자리 N개가 늘 화면 너비를 N등분 (아래 HTML 이름 칸과 줄이 맞음)
const GAP = 2;
const FOV = 24; // 좁은 화각 = 원근 왜곡이 적음 (캐릭터가 책상보다 앞에 있어도 크기 · 위치가 덜 틀어짐)
const WALK_Z = 0.5; // 캐릭터는 책상 앞
const SPEED = 1.6; // 초당 거리
const xOf = (i: number, n: number) => (i - (n - 1) / 2) * GAP;

function Desk({ x, state }: { x: number; state: "done" | "active" | "wait" }) {
  const c = useMemo(
    () => ({
      top: new Color(tokenColor("--hav-surface-2", "#1d1d1f")).multiplyScalar(1.9),
      leg: new Color(tokenColor("--hav-line", "#424245")),
      screen: new Color(
        state === "active" ? tokenColor("--hav-accent", "#4ff0e0") : state === "done" ? tokenColor("--hav-aurora-2", "#9c8cff") : tokenColor("--hav-line", "#424245"),
      ),
    }),
    [state],
  );
  return (
    <group position={[x, -0.35, 0]}>
      <RoundedBox args={[1.25, 0.08, 0.62]} radius={0.03} position={[0, 0.42, 0]}>
        <meshStandardMaterial color={c.top} roughness={0.6} />
      </RoundedBox>
      {[-0.52, 0.52].flatMap((lx) =>
        [-0.22, 0.22].map((lz) => (
          <mesh key={`${lx}${lz}`} position={[lx, 0.06, lz]}>
            <boxGeometry args={[0.05, 0.7, 0.05]} />
            <meshStandardMaterial color={c.leg} />
          </mesh>
        )),
      )}
      {/* 작은 모니터 — 지금 자리는 오로라 · 끝난 자리는 보라 · 기다리는 자리는 회색 */}
      <group position={[0, 0.72, -0.12]}>
        <RoundedBox args={[0.62, 0.42, 0.05]} radius={0.03}>
          <meshStandardMaterial color={c.leg} />
        </RoundedBox>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[0.54, 0.34]} />
          <meshBasicMaterial color={c.screen} transparent opacity={state === "wait" ? 0.35 : 0.9} />
        </mesh>
        <mesh position={[0, -0.27, 0]}>
          <boxGeometry args={[0.06, 0.12, 0.05]} />
          <meshStandardMaterial color={c.leg} />
        </mesh>
      </group>
      {/* 끝난 자리: 책상 위 작은 체크 상자 */}
      {state === "done" && (
        <mesh position={[0.42, 0.53, 0.12]} rotation={[0, 0.4, 0]}>
          <boxGeometry args={[0.16, 0.14, 0.16]} />
          <meshStandardMaterial color={c.screen} roughness={0.4} />
        </mesh>
      )}
    </group>
  );
}

function Walker({ target, mood, animate }: { target: number; mood: Mood; animate: boolean }) {
  const g = useRef<Group>(null);
  const [walking, setWalking] = useState(false);
  useFrame((_, dt) => {
    const w = g.current;
    if (!w) return;
    const d = target - w.position.x;
    // 움직임 줄이기면 바로 그 자리 (걷지 않음)
    const step = animate ? Math.sign(d) * Math.min(Math.abs(d), SPEED * Math.min(dt, 0.05)) : d;
    w.position.x += step;
    const moving = Math.abs(target - w.position.x) > 0.01;
    w.rotation.y = moving ? Math.sign(d) * 1.35 : w.rotation.y * 0.9; // 걸을 땐 옆모습 (네 발로) · 도착하면 앞을 봄
    if (moving !== walking) setWalking(moving);
  });
  return (
    <group ref={g} position={[target, -0.1, WALK_Z]} scale={0.55}>
      <CatFigure mood={walking ? "walking" : mood} gear="suit" animate={animate} />
    </group>
  );
}

/** z=0 에서 보이는 너비가 count × GAP 이 되는 카메라 거리 */
function useFitDistance(count: number) {
  const { width, height } = useThree((t) => t.size);
  const aspect = width / Math.max(1, height);
  return Math.max(4, (count * GAP) / (aspect * 2 * Math.tan(((FOV / 2) * Math.PI) / 180)));
}

/** 화면 비율이 바뀌면 카메라 거리를 다시 잡음 */
function FitCamera({ dist }: { dist: number }) {
  const camera = useThree((t) => t.camera) as PerspectiveCamera;
  useEffect(() => {
    camera.position.set(0, 0.9, dist);
    camera.lookAt(0, 0.15, 0);
    camera.updateProjectionMatrix();
  }, [camera, dist]);
  return null;
}

function Scene({ count, active, done, mood, animate }: Omit<StationsProps, "className" | "label"> & { animate: boolean }) {
  const dist = useFitDistance(count);
  // 캐릭터는 책상보다 카메라에 가까워서, 화면에서 책상과 같은 자리에 보이게 x 를 줄임
  const near = (dist - WALK_Z) / dist;
  return (
    <>
      <FitCamera dist={dist} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 4, 5]} intensity={1.4} />
      <pointLight position={[-3, 2, 2]} intensity={5} color={tokenColor("--hav-aurora-3", "#ff8ad8")} />
      {Array.from({ length: count }, (_, i) => (
        <Desk key={i} x={xOf(i, count)} state={i < done ? "done" : i === active ? "active" : "wait"} />
      ))}
      <Walker target={xOf(Math.max(0, Math.min(active, count - 1)), count) * near} mood={mood} animate={animate} />
    </>
  );
}

export default function Stations({ className = "", label, ...rest }: StationsProps) {
  return (
    <Stage className={className} camera={{ position: [0, 0.9, 6.6], fov: FOV }} label={label}>
      {(animate) => <Scene {...rest} animate={animate} />}
    </Stage>
  );
}
