"use client";

// 🧳 여행 가방 캐릭터 — three.js 도형만 (모델 파일 없음) · 표정(mood) 이름만 받고, 무엇을 보고 고를지는 쓰는 쪽이 정함
// 몸: 둥근 가방 · 띠 · 손잡이(더듬이처럼 흔들림) · 큰 눈 · 볼 · 짧은 팔다리 · 표정마다 소품 (docs/design.md 🧳 표)
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, type Group, type Mesh, type MeshBasicMaterial } from "three";
import { Stage, tokenColor } from "./stage";

export const MOODS = ["typing", "looking", "working", "browsing", "happy", "startled", "sad", "sleeping", "neutral"] as const;
export type Mood = (typeof MOODS)[number];
export type SuitcaseProps = { mood: Mood; className?: string; label?: string };

/** 움직임 줄이기면 이 시각의 자세로 멈춰 그림 */
const STILL_T = 1.2;

function useColors() {
  return useMemo(() => {
    const body = new Color(tokenColor("--hav-accent", "#4ff0e0"));
    return {
      body,
      lid: body.clone().multiplyScalar(0.82),
      strap: new Color(tokenColor("--hav-aurora-2", "#9c8cff")),
      pink: new Color(tokenColor("--hav-aurora-3", "#ff8ad8")),
      red: new Color(tokenColor("--hav-expensive", "#ff5a5f")),
      blue: new Color(tokenColor("--hav-cheap", "#4c9bff")),
      grey: new Color(tokenColor("--hav-normal", "#c7c7cc")),
      dark: new Color(tokenColor("--hav-surface-2", "#1d1d1f")),
    };
  }, []);
}

function Eye({ x, eye, pupil }: { x: number; eye: React.Ref<Group>; pupil: React.Ref<Group> }) {
  return (
    <group ref={eye} position={[x, 0.06, 0]}>
      <mesh scale={[1, 1, 0.45]}>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <group ref={pupil}>
        <mesh position={[0, 0, 0.045]}>
          <sphereGeometry args={[0.062, 20, 20]} />
          <meshStandardMaterial color="#111114" roughness={0.2} />
        </mesh>
        <mesh position={[0.024, 0.03, 0.1]}>
          <sphereGeometry args={[0.018, 10, 10]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
}

/** Z 하나 = 막대 세 개 */
function Zee({ color }: { color: Color }) {
  return (
    <group>
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[0.14, 0.03, 0.02]} />
        <meshBasicMaterial color={color} transparent />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 4.2]}>
        <boxGeometry args={[0.03, 0.19, 0.02]} />
        <meshBasicMaterial color={color} transparent />
      </mesh>
      <mesh position={[0, -0.07, 0]}>
        <boxGeometry args={[0.14, 0.03, 0.02]} />
        <meshBasicMaterial color={color} transparent />
      </mesh>
    </group>
  );
}

function Bag({ mood, animate }: { mood: Mood; animate: boolean }) {
  const c = useColors();
  const root = useRef<Group>(null);
  const lid = useRef<Group>(null);
  const handle = useRef<Group>(null);
  const eyeL = useRef<Group>(null);
  const eyeR = useRef<Group>(null);
  const pupilL = useRef<Group>(null);
  const pupilR = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const armR = useRef<Group>(null);
  const prop = useRef<Group>(null);
  const zees = useRef<Group>(null);
  const sweat = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = animate ? clock.elapsedTime : STILL_T;
    const r = root.current;
    if (!r) return;
    // 기본: 숨 쉬듯 살짝 오르내림
    let y = Math.sin(t * 2) * 0.03;
    let rotY = 0;
    let rotZ = 0;
    let rotX = 0;
    let squash = 1 + Math.sin(t * 2) * 0.015;
    let lidOpen = 0;
    let eyeOpen = 1;
    let eyeScale = 1;
    let look: [number, number] = [0, 0];
    let arms: [number, number, number, number] = [0.15, 0.15, 0, 0]; // 왼 z · 오른 z · 왼 x · 오른 x
    // 깜빡임 (3.2초마다 0.12초) — 자는 중 · 놀람은 빼고
    const blink = mood !== "sleeping" && mood !== "startled" && t % 3.2 < 0.12;

    switch (mood) {
      case "typing": {
        const tap = Math.sin(t * 16);
        arms = [0.1, 0.1, -1.15 + Math.max(0, tap) * 0.25, -1.15 + Math.max(0, -tap) * 0.25];
        y = Math.abs(Math.sin(t * 8)) * 0.015;
        rotX = 0.12;
        look = [0, -0.035];
        break;
      }
      case "looking":
        rotY = Math.sin(t * 1.3) * 0.4;
        look = [Math.sin(t * 1.3) * 0.035, 0];
        arms = [0.15, 0.2, 0, -1.2];
        break;
      case "working":
        rotZ = Math.sin(t * 3) * 0.04;
        look = [0, 0.04];
        arms = [0.3, -0.3, 0, 0];
        break;
      case "browsing":
        rotY = -0.45;
        look = [0.04, 0];
        arms = [0.15, 0.15, 0, -0.6];
        break;
      case "happy": {
        const hop = Math.abs(Math.sin(t * 4.2));
        y = hop * 0.28;
        squash = 1 + (1 - hop) * 0.08 - hop * 0.04;
        arms = [2.4 + Math.sin(t * 8) * 0.2, -2.4 - Math.sin(t * 8) * 0.2, 0, 0];
        eyeOpen = 0.55; // 웃는 눈
        break;
      }
      case "startled":
        y = 0.12 + Math.sin(t * 38) * 0.012;
        rotZ = Math.sin(t * 45) * 0.03;
        lidOpen = 0.55 + Math.sin(t * 20) * 0.05;
        eyeScale = 1.28;
        arms = [2.0, -2.0, 0, 0];
        break;
      case "sad":
        rotX = 0.14;
        eyeOpen = 0.75;
        look = [0, -0.045];
        arms = [0.05, 0.05, 0, 0];
        squash = 0.97;
        break;
      case "sleeping":
        y = Math.sin(t * 1.1) * 0.02;
        rotZ = Math.sin(t * 0.8) * 0.07;
        rotX = 0.08 + Math.max(0, Math.sin(t * 0.8)) * 0.08; // 꾸벅
        eyeOpen = 0.08;
        arms = [0.05, 0.05, 0, 0];
        break;
      default:
        break;
    }

    r.position.y = y;
    r.rotation.set(rotX, rotY, rotZ);
    r.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
    if (lid.current) lid.current.rotation.x = -lidOpen;
    if (handle.current) handle.current.rotation.z = Math.sin(t * (mood === "startled" ? 30 : 3)) * (mood === "sleeping" ? 0.05 : 0.18);
    const open = blink ? 0.1 : eyeOpen;
    for (const e of [eyeL.current, eyeR.current]) e?.scale.set(eyeScale, open * eyeScale, 1);
    for (const p of [pupilL.current, pupilR.current]) p?.position.set(look[0], look[1], 0);
    armL.current?.rotation.set(arms[2], 0, arms[0]);
    armR.current?.rotation.set(arms[3], 0, -arms[1]);

    // 소품 움직임
    const g = prop.current;
    if (g) {
      if (mood === "working") g.rotation.z = -t * 2.2;
      if (mood === "looking") g.position.x = 0.62 + Math.sin(t * 1.3) * 0.08;
      if (mood === "happy") g.children.forEach((s, i) => s.scale.setScalar(0.6 + Math.abs(Math.sin(t * 5 + i)) * 0.8));
      if (mood === "startled") g.position.y = 1.0 + Math.sin(t * 12) * 0.03;
    }
    if (zees.current) {
      zees.current.children.forEach((z, i) => {
        const k = (t * 0.35 + i / 3) % 1;
        z.position.set(0.45 + k * 0.35, 0.65 + k * 0.6, 0);
        z.scale.setScalar(0.5 + k * 0.6);
        z.children.forEach((m) => (((m as Mesh).material as MeshBasicMaterial).opacity = 1 - k));
      });
    }
    if (sweat.current) {
      const k = (t * 0.6) % 1;
      sweat.current.position.set(0.5, 0.38 - k * 0.3, 0.2);
      (sweat.current.material as MeshBasicMaterial).opacity = 1 - k;
    }
  });

  return (
    <group position={[0, -0.05, 0]}>
      <group ref={root}>
        {/* 몸 */}
        <RoundedBox args={[1.1, 0.8, 0.56]} radius={0.16} smoothness={4}>
          <meshStandardMaterial color={c.body} roughness={0.45} metalness={0.05} />
        </RoundedBox>
        {/* 띠 두 줄 */}
        {[-0.36, 0.36].map((x) => (
          <mesh key={x} position={[x, 0, 0.283]}>
            <boxGeometry args={[0.07, 0.76, 0.012]} />
            <meshStandardMaterial color={c.strap} roughness={0.5} />
          </mesh>
        ))}
        {/* 스티커 */}
        <mesh position={[-0.38, -0.26, 0.284]} rotation={[0, 0, 0.3]}>
          <circleGeometry args={[0.055, 5]} />
          <meshBasicMaterial color={c.pink} />
        </mesh>
        <mesh position={[0.4, 0.24, 0.284]}>
          <circleGeometry args={[0.04, 20]} />
          <meshBasicMaterial color="#ffe27a" />
        </mesh>

        {/* 뚜껑 — 뒤쪽 모서리를 축으로 열림 (놀람) · 손잡이는 뚜껑에 붙음 */}
        <group ref={lid} position={[0, 0.4, -0.28]}>
          <group position={[0, 0.04, 0.28]}>
            <RoundedBox args={[1.13, 0.12, 0.59]} radius={0.05} smoothness={3}>
              <meshStandardMaterial color={c.lid} roughness={0.4} />
            </RoundedBox>
            <group ref={handle} position={[0, 0.06, 0]}>
              <mesh position={[0, 0.02, 0]}>
                <torusGeometry args={[0.17, 0.042, 12, 32, Math.PI]} />
                <meshStandardMaterial color={c.strap} roughness={0.35} />
              </mesh>
            </group>
          </group>
        </group>

        {/* 얼굴 */}
        <group position={[0, 0, 0.29]}>
          <Eye x={-0.19} eye={eyeL} pupil={pupilL} />
          <Eye x={0.19} eye={eyeR} pupil={pupilR} />
          {[-0.33, 0.33].map((x) => (
            <mesh key={x} position={[x, -0.09, 0]} scale={[1, 0.6, 0.3]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshBasicMaterial color={c.pink} transparent opacity={0.85} />
            </mesh>
          ))}
          <Mouth mood={mood} />
        </group>

        {/* 팔 — 어깨를 축으로 */}
        {[
          { ref: armL, x: -0.6 },
          { ref: armR, x: 0.6 },
        ].map((a) => (
          <group key={a.x} ref={a.ref} position={[a.x, -0.02, 0]}>
            <mesh position={[0, -0.13, 0]}>
              <capsuleGeometry args={[0.055, 0.16, 4, 10]} />
              <meshStandardMaterial color={c.lid} roughness={0.5} />
            </mesh>
          </group>
        ))}

        {/* 다리 */}
        {[-0.27, 0.27].map((x) => (
          <group key={x} position={[x, -0.5, 0]}>
            <mesh>
              <cylinderGeometry args={[0.06, 0.06, 0.16, 12]} />
              <meshStandardMaterial color={c.lid} roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.09, 0.03]} scale={[1, 0.6, 1.3]}>
              <sphereGeometry args={[0.08, 14, 14]} />
              <meshStandardMaterial color={c.strap} roughness={0.5} />
            </mesh>
          </group>
        ))}

        <Props mood={mood} prop={prop} c={c} />
        {mood === "sad" && (
          <mesh ref={sweat} scale={[0.8, 1.3, 0.8]}>
            <sphereGeometry args={[0.045, 14, 14]} />
            <meshBasicMaterial color={c.blue} transparent />
          </mesh>
        )}
      </group>

      {/* Z 는 몸을 따라 흔들리지 않게 밖에 */}
      {mood === "sleeping" && (
        <group ref={zees}>
          {[0, 1, 2].map((i) => (
            <Zee key={i} color={c.grey} />
          ))}
        </group>
      )}
    </group>
  );
}

function Mouth({ mood }: { mood: Mood }) {
  const m = <meshStandardMaterial color="#111114" roughness={0.4} />;
  if (mood === "startled")
    return (
      <mesh position={[0, -0.16, 0.01]}>
        <torusGeometry args={[0.045, 0.017, 8, 20]} />
        {m}
      </mesh>
    );
  if (mood === "sad" || mood === "sleeping")
    return (
      <mesh position={[0, mood === "sad" ? -0.19 : -0.15, 0.01]}>
        {mood === "sad" ? <torusGeometry args={[0.06, 0.016, 8, 16, Math.PI]} /> : <boxGeometry args={[0.07, 0.018, 0.02]} />}
        {m}
      </mesh>
    );
  if (mood === "neutral" || mood === "working")
    return (
      <mesh position={[0, -0.15, 0.01]}>
        <boxGeometry args={[0.1, 0.02, 0.02]} />
        {m}
      </mesh>
    );
  // 웃는 입 (반원을 뒤집어 ∪)
  const big = mood === "happy";
  return (
    <mesh position={[0, -0.12, 0.01]} rotation={[0, 0, Math.PI]}>
      <torusGeometry args={[big ? 0.08 : 0.06, 0.017, 8, 16, Math.PI]} />
      {m}
    </mesh>
  );
}

function Props({ mood, prop, c }: { mood: Mood; prop: React.Ref<Group>; c: ReturnType<typeof useColors> }) {
  switch (mood) {
    case "typing":
      return (
        <group ref={prop} position={[0, -0.42, 0.62]}>
          <mesh>
            <boxGeometry args={[0.8, 0.06, 0.32]} />
            <meshStandardMaterial color={c.dark} roughness={0.6} />
          </mesh>
          {[-0.27, -0.09, 0.09, 0.27].flatMap((x) =>
            [-0.07, 0.07].map((z) => (
              <mesh key={`${x}${z}`} position={[x, 0.045, z]}>
                <boxGeometry args={[0.13, 0.03, 0.1]} />
                <meshStandardMaterial color={c.grey} roughness={0.5} />
              </mesh>
            )),
          )}
        </group>
      );
    case "looking":
      return (
        <group ref={prop} position={[0.62, 0.02, 0.45]} rotation={[0, -0.3, 0]}>
          <mesh>
            <torusGeometry args={[0.13, 0.025, 10, 28]} />
            <meshStandardMaterial color={c.strap} roughness={0.3} />
          </mesh>
          <mesh>
            <circleGeometry args={[0.13, 28]} />
            <meshBasicMaterial color={c.body} transparent opacity={0.25} />
          </mesh>
          <mesh position={[0.1, -0.2, 0]} rotation={[0, 0, 0.5]}>
            <cylinderGeometry args={[0.025, 0.025, 0.2, 10]} />
            <meshStandardMaterial color={c.dark} />
          </mesh>
        </group>
      );
    case "working":
      return (
        <group ref={prop} position={[0, 0.98, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.06, 20]} />
            <meshStandardMaterial color={c.grey} metalness={0.4} roughness={0.35} />
          </mesh>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={i} rotation={[0, 0, (i / 8) * Math.PI * 2]} position={[Math.cos((i / 8) * Math.PI * 2) * 0.17, Math.sin((i / 8) * Math.PI * 2) * 0.17, 0]}>
              <boxGeometry args={[0.07, 0.06, 0.06]} />
              <meshStandardMaterial color={c.grey} metalness={0.4} roughness={0.35} />
            </mesh>
          ))}
          <mesh position={[0, 0, 0.035]}>
            <circleGeometry args={[0.05, 16]} />
            <meshBasicMaterial color={c.dark} />
          </mesh>
        </group>
      );
    case "browsing":
      return (
        <group ref={prop} position={[0.75, 0.12, 0.35]} rotation={[0, -0.7, 0]}>
          <mesh>
            <boxGeometry args={[0.56, 0.4, 0.03]} />
            <meshStandardMaterial color={c.dark} />
          </mesh>
          <mesh position={[0, 0, 0.017]}>
            <planeGeometry args={[0.5, 0.34]} />
            <meshBasicMaterial color={c.body} transparent opacity={0.85} />
          </mesh>
          {[0.08, 0, -0.08].map((y) => (
            <mesh key={y} position={[-0.05, y, 0.02]}>
              <planeGeometry args={[0.3, 0.025]} />
              <meshBasicMaterial color={c.dark} />
            </mesh>
          ))}
        </group>
      );
    case "happy":
      return (
        <group ref={prop}>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.95, 0.15 + Math.sin(a) * 0.65, -0.1]}>
                <octahedronGeometry args={[0.05]} />
                <meshBasicMaterial color={i % 2 ? c.pink : c.body} />
              </mesh>
            );
          })}
        </group>
      );
    case "startled":
      return (
        <group ref={prop} position={[0.5, 1.0, 0]}>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[0.07, 0.26, 0.07]} />
            <meshBasicMaterial color={c.red} />
          </mesh>
          <mesh position={[0, -0.14, 0]}>
            <sphereGeometry args={[0.045, 14, 14]} />
            <meshBasicMaterial color={c.red} />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}

function Scene({ mood, animate }: { mood: Mood; animate: boolean }) {
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[2, 3, 4]} intensity={1.5} />
      <pointLight position={[-2, 1, 2]} intensity={6} color={tokenColor("--hav-aurora-3", "#ff8ad8")} />
      <Bag mood={mood} animate={animate} />
    </>
  );
}

export default function Suitcase({ mood, className = "", label }: SuitcaseProps) {
  return (
    <Stage className={className} camera={{ position: [0, 0.35, 3.4], fov: 36 }} label={label}>
      {(animate) => <Scene mood={mood} animate={animate} />}
    </Stage>
  );
}
