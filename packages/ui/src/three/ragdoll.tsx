"use client";

// 🐱 렉돌 고양이 — three.js 도형만 (모델 파일 없음) · 실 포인트 미티드 (2026-10-29 사용자 확인: "색갈은 A")
//   크림 몸 · 진갈색 얼굴 가면 · 귀 · 꼬리 · 흰 턱받이 · 흰 앞발(미티드) · 크고 파란 눈 · 복슬한 볼
// 표정(mood) 이름과 차림(gear)만 받고, 무엇을 보고 고를지는 쓰는 쪽이 정함
//   gear "hardhat" = 작업 고양이 (노란 안전모 · 이마 램프 — 통과면 청록 · 막힘 · 실패면 빨강)
//   gear "coin"    = 돈 든 고양이 (₩ 금화를 안고 있음 · 시무룩하면 금화 위로 세금 동전이 날아감)
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, type Group, type Mesh, type MeshBasicMaterial } from "three";
import { faceTexture } from "./coin";
import { tokenColor } from "./stage";

export const MOODS = ["typing", "looking", "working", "browsing", "happy", "startled", "sad", "sleeping", "neutral", "walking", "worried"] as const;
export type Mood = (typeof MOODS)[number];
export type Gear = "hardhat" | "coin";

/** 움직임 줄이기면 이 시각의 자세로 멈춰 그림 */
export const STILL_T = 1.2;

function useColors() {
  return useMemo(
    () => ({
      cream: new Color("#f3e9da"),
      white: new Color("#fffdf8"),
      point: new Color("#5a3e2b"), // 실 포인트 (진갈색)
      mask: new Color("#6e4e37"),
      inner: new Color("#e9a6a6"),
      iris: new Color("#4a8fe0"),
      pupil: new Color("#10243d"),
      nose: new Color("#e58b9a"),
      blush: new Color("#f7a8b8"),
      hat: new Color("#ffc928"),
      hatDark: new Color("#e0a800"),
      gold: new Color("#f4c542"),
      accent: new Color(tokenColor("--hav-accent", "#4ff0e0")),
      pink: new Color(tokenColor("--hav-aurora-3", "#ff8ad8")),
      red: new Color(tokenColor("--hav-expensive", "#ff5a5f")),
      blue: new Color(tokenColor("--hav-cheap", "#4c9bff")),
      grey: new Color(tokenColor("--hav-normal", "#c7c7cc")),
      dark: new Color(tokenColor("--hav-surface-2", "#1d1d1f")),
    }),
    [],
  );
}
type Colors = ReturnType<typeof useColors>;

function Eye({ x, eye, pupil, c }: { x: number; eye: React.Ref<Group>; pupil: React.Ref<Group>; c: Colors }) {
  return (
    <group ref={eye} position={[x, 0.39, 0.4]}>
      <mesh scale={[1, 1.08, 0.5]}>
        <sphereGeometry args={[0.095, 24, 24]} />
        <meshStandardMaterial color={c.iris} roughness={0.25} />
      </mesh>
      <group ref={pupil}>
        <mesh position={[0, 0, 0.04]} scale={[0.8, 1, 0.5]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color={c.pupil} />
        </mesh>
        <mesh position={[0.025, 0.035, 0.065]}>
          <sphereGeometry args={[0.02, 10, 10]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
}

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

/** 고양이 몸 — 다른 장면(stations 등)에서도 씀 · 위치 · 크기는 바깥 group 이 정함 · 앞 = +z */
export function RagdollFigure({ mood, gear, animate }: { mood: Mood; gear: Gear; animate: boolean }) {
  const c = useColors();
  const root = useRef<Group>(null);
  const head = useRef<Group>(null);
  const earL = useRef<Group>(null);
  const earR = useRef<Group>(null);
  const eyeL = useRef<Group>(null);
  const eyeR = useRef<Group>(null);
  const pupilL = useRef<Group>(null);
  const pupilR = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const armR = useRef<Group>(null);
  const legL = useRef<Group>(null);
  const legR = useRef<Group>(null);
  const tail = useRef<Group>(null);
  const prop = useRef<Group>(null);
  const zees = useRef<Group>(null);
  const sweat = useRef<Mesh>(null);
  const taxes = useRef<Group>(null);
  const hugging = gear === "coin";

  useFrame(({ clock }) => {
    const t = animate ? clock.elapsedTime : STILL_T;
    const r = root.current;
    if (!r) return;
    let y = Math.sin(t * 2) * 0.025;
    let rotX = 0;
    let rotY = 0;
    let rotZ = 0;
    let headX = 0;
    let headZ = Math.sin(t * 0.9) * 0.04;
    let puff = 1;
    let ears = 0; // + 쫑긋 · - 납작
    let eyeOpen = 1;
    let eyeScale = 1;
    let look: [number, number] = [0, 0];
    // 앞발: 왼 z · 오른 z · 왼 x · 오른 x (금화를 안으면 앞으로 모음)
    let arms: [number, number, number, number] = hugging ? [-0.35, -0.35, -1.05, -1.05] : [0.12, 0.12, 0, 0];
    let stride = 0;
    let tailSway = Math.sin(t * 1.6) * 0.35;
    const blink = mood !== "sleeping" && mood !== "startled" && t % 3.4 < 0.12;

    switch (mood) {
      case "typing": {
        const tap = Math.sin(t * 14); // 앞발로 꾹꾹
        arms = [0.05, 0.05, -1.2 + Math.max(0, tap) * 0.3, -1.2 + Math.max(0, -tap) * 0.3];
        headX = 0.18;
        look = [0, -0.03];
        break;
      }
      case "looking":
        headZ = Math.sin(t * 1.3) * 0.22; // 갸웃
        look = [Math.sin(t * 1.3) * 0.03, 0];
        arms = [0.12, 0.2, 0, -1.25];
        break;
      case "working":
        tailSway = Math.sin(t * 3.2) * 0.6;
        look = [0, 0.03];
        headX = Math.max(0, Math.sin(t * 2.2)) * 0.12; // 끄덕
        break;
      case "browsing":
        rotY = -0.4;
        look = [0.035, 0];
        arms = [0.12, 0.12, 0, -0.7];
        break;
      case "happy": {
        const hop = Math.abs(Math.sin(t * 4.2));
        y = hop * 0.26;
        eyeOpen = 0.45;
        ears = 0.15;
        tailSway = Math.sin(t * 6) * 0.25;
        if (!hugging) arms = [2.3 + Math.sin(t * 8) * 0.2, 2.3 + Math.sin(t * 8) * 0.2, 0, 0];
        break;
      }
      case "startled":
        y = 0.12 + Math.sin(t * 38) * 0.012;
        rotZ = Math.sin(t * 45) * 0.025;
        puff = 1.1; // 털 부풀림
        ears = 0.25;
        eyeScale = 1.25;
        arms = [2.0, 2.0, 0, 0];
        tailSway = 0;
        break;
      case "sad":
        headX = 0.2;
        ears = -0.9; // 귀 납작
        eyeOpen = 0.7;
        look = [0, -0.04];
        tailSway = Math.sin(t * 0.8) * 0.1;
        break;
      case "worried":
        rotZ = Math.sin(t * 22) * 0.012; // 덜덜
        ears = -0.35;
        eyeScale = 1.1;
        look = [Math.sin(t * 2.5) * 0.03, 0];
        arms = [-0.45, -0.45, -1.15, -1.15]; // 금화를 꽉
        break;
      case "sleeping":
        y = -0.08 + Math.sin(t * 1.1) * 0.015; // 식빵 자세로 낮게
        headX = 0.22 + Math.max(0, Math.sin(t * 0.8)) * 0.1; // 꾸벅
        eyeOpen = 0.06;
        ears = -0.2;
        arms = hugging ? arms : [0.05, 0.05, -0.5, -0.5];
        tailSway = 0.05;
        break;
      case "walking": {
        const step = Math.sin(t * 11); // 네 발로 총총
        stride = step * 0.55;
        y = Math.abs(step) * 0.05;
        arms = [0.1, 0.1, -step * 0.55, step * 0.55];
        tailSway = Math.sin(t * 5.5) * 0.4;
        look = [0.02, 0];
        break;
      }
      default:
        break;
    }

    r.position.y = y;
    r.rotation.set(rotX, rotY, rotZ);
    r.scale.setScalar(puff);
    head.current?.rotation.set(headX, 0, headZ);
    earL.current?.rotation.set(0, 0, 0.35 - ears);
    earR.current?.rotation.set(0, 0, -0.35 + ears);
    const open = blink ? 0.08 : eyeOpen;
    for (const e of [eyeL.current, eyeR.current]) e?.scale.set(eyeScale, open * eyeScale, 1);
    for (const p of [pupilL.current, pupilR.current]) p?.position.set(look[0], look[1], 0);
    armL.current?.rotation.set(arms[2], 0, -arms[0]);
    armR.current?.rotation.set(arms[3], 0, arms[1]);
    legL.current?.rotation.set(stride, 0, 0);
    legR.current?.rotation.set(-stride, 0, 0);
    if (tail.current) tail.current.rotation.set(-0.2, 0, tailSway);

    const g = prop.current;
    if (g) {
      if (mood === "working") g.rotation.z = -t * 2.2;
      if (mood === "looking") g.position.x = 0.55 + Math.sin(t * 1.3) * 0.06;
      if (mood === "happy") g.children.forEach((s, i) => s.scale.setScalar(0.6 + Math.abs(Math.sin(t * 5 + i)) * 0.8));
      if (mood === "startled") g.position.y = 1.18 + Math.sin(t * 12) * 0.03;
    }
    if (zees.current) {
      zees.current.children.forEach((z, i) => {
        const k = (t * 0.35 + i / 3) % 1;
        z.position.set(0.42 + k * 0.35, 0.75 + k * 0.6, 0);
        z.scale.setScalar(0.5 + k * 0.6);
        z.children.forEach((m) => (((m as Mesh).material as MeshBasicMaterial).opacity = 1 - k));
      });
    }
    if (sweat.current) {
      const k = (t * 0.6) % 1;
      sweat.current.position.set(0.42, 0.55 - k * 0.3, 0.25);
      (sweat.current.material as MeshBasicMaterial).opacity = 1 - k;
    }
    if (taxes.current) {
      taxes.current.children.forEach((m, i) => {
        const k = (t * 0.45 + i / 3) % 1;
        m.position.set(-0.25 + i * 0.25 + Math.sin(k * 6 + i) * 0.05, -0.05 + k * 0.9, 0.5);
        m.rotation.y = t * 4 + i;
        ((m as Mesh).material as MeshBasicMaterial).opacity = 1 - k;
      });
    }
  });

  return (
    <group position={[0, -0.05, 0]}>
      <group ref={root}>
        {/* 몸 · 흰 턱받이 */}
        <mesh position={[0, -0.22, 0]} scale={[1, 1.02, 0.88]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color={c.cream} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.12, 0.2]} scale={[1, 1.15, 0.55]}>
          <sphereGeometry args={[0.27, 24, 24]} />
          <meshStandardMaterial color={c.white} roughness={0.85} />
        </mesh>

        {/* 두꺼운 꼬리 — 뒤에서 위로 감아 올림 · 끝으로 갈수록 진함 */}
        <group ref={tail} position={[0.22, -0.45, -0.28]}>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[0.12 + i * 0.07, i * 0.13, -0.05 - i * 0.02]}>
              <sphereGeometry args={[0.1 + (i === 4 ? 0.01 : 0), 16, 16]} />
              <meshStandardMaterial color={i < 2 ? c.mask : c.point} roughness={0.85} />
            </mesh>
          ))}
        </group>

        {/* 뒷발 (걸을 때 앞뒤) */}
        {[
          { ref: legL, x: -0.2 },
          { ref: legR, x: 0.2 },
        ].map(({ ref, x }) => (
          <group key={x} ref={ref} position={[x, -0.52, 0.05]}>
            <mesh position={[0, -0.04, 0.06]} scale={[1, 0.65, 1.35]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color={c.white} roughness={0.85} />
            </mesh>
          </group>
        ))}

        {/* 앞발 — 어깨를 축으로 · 흰 장갑(미티드) */}
        {[
          { ref: armL, x: -0.24 },
          { ref: armR, x: 0.24 },
        ].map((a) => (
          <group key={a.x} ref={a.ref} position={[a.x, -0.08, 0.2]}>
            <mesh position={[0, -0.14, 0]}>
              <capsuleGeometry args={[0.07, 0.16, 4, 10]} />
              <meshStandardMaterial color={c.cream} roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.27, 0.01]}>
              <sphereGeometry args={[0.085, 16, 16]} />
              <meshStandardMaterial color={c.white} roughness={0.85} />
            </mesh>
          </group>
        ))}

        {/* 머리 */}
        <group ref={head} position={[0, 0.02, 0]}>
          <mesh position={[0, 0.36, 0]} scale={[1.12, 0.94, 0.95]}>
            <sphereGeometry args={[0.4, 32, 32]} />
            <meshStandardMaterial color={c.cream} roughness={0.8} />
          </mesh>
          {/* 복슬한 볼 */}
          {[-0.3, 0.3].map((x) => (
            <mesh key={x} position={[x, 0.22, 0.1]} scale={[1, 0.85, 0.9]}>
              <sphereGeometry args={[0.18, 20, 20]} />
              <meshStandardMaterial color={c.cream} roughness={0.85} />
            </mesh>
          ))}
          {/* 얼굴 가면 · 하얀 입가 */}
          <mesh position={[0, 0.41, 0.25]} scale={[1.08, 0.74, 0.58]}>
            <sphereGeometry args={[0.3, 28, 28]} />
            <meshStandardMaterial color={c.mask} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.25, 0.37]} scale={[1.35, 0.85, 0.7]}>
            <sphereGeometry args={[0.12, 20, 20]} />
            <meshStandardMaterial color={c.white} roughness={0.8} />
          </mesh>
          <Eye x={-0.15} eye={eyeL} pupil={pupilL} c={c} />
          <Eye x={0.15} eye={eyeR} pupil={pupilR} c={c} />
          {/* 코 · 입 · 볼터치 · 수염 */}
          <mesh position={[0, 0.3, 0.45]} rotation={[0.3, 0, 0]} scale={[1.3, 0.8, 0.7]}>
            <sphereGeometry args={[0.028, 12, 12]} />
            <meshStandardMaterial color={c.nose} roughness={0.4} />
          </mesh>
          <Mouth mood={mood} c={c} />
          {[-0.24, 0.24].map((x) => (
            <mesh key={x} position={[x, 0.25, 0.37]} scale={[1, 0.55, 0.3]}>
              <sphereGeometry args={[0.055, 14, 14]} />
              <meshBasicMaterial color={c.blush} transparent opacity={0.75} />
            </mesh>
          ))}
          {[-1, 1].flatMap((s) =>
            [-0.05, 0.03].map((dy) => (
              <mesh key={`${s}${dy}`} position={[s * 0.27, 0.25 + dy, 0.39]} rotation={[0, 0, s * dy * 3]}>
                <boxGeometry args={[0.2, 0.007, 0.007]} />
                <meshBasicMaterial color={c.white} />
              </mesh>
            )),
          )}
          {/* 귀 — 납작 · 쫑긋은 바깥 축으로 */}
          {[
            { ref: earL, x: -0.25 },
            { ref: earR, x: 0.25 },
          ].map(({ ref, x }) => (
            <group key={x} ref={ref} position={[x, 0.62, 0]}>
              <mesh position={[0, 0.1, 0]}>
                <coneGeometry args={[0.13, 0.26, 4]} />
                <meshStandardMaterial color={c.point} roughness={0.8} />
              </mesh>
              <mesh position={[0, 0.08, 0.05]} scale={[0.6, 0.7, 0.4]}>
                <coneGeometry args={[0.13, 0.26, 4]} />
                <meshStandardMaterial color={c.inner} roughness={0.8} />
              </mesh>
            </group>
          ))}
          {gear === "hardhat" && <HardHat mood={mood} c={c} />}
        </group>

        {gear === "coin" && <HugCoin c={c} />}
        {gear === "hardhat" && <Props mood={mood} prop={prop} c={c} />}
        {gear === "coin" && mood === "happy" && <Props mood="happy" prop={prop} c={c} />}
        {(mood === "sad" || mood === "worried") && (
          <mesh ref={sweat} scale={[0.8, 1.3, 0.8]}>
            <sphereGeometry args={[0.045, 14, 14]} />
            <meshBasicMaterial color={c.blue} transparent />
          </mesh>
        )}
      </group>

      {/* 몸을 따라 흔들리지 않게 밖에: Z · 날아가는 세금 동전 */}
      {mood === "sleeping" && (
        <group ref={zees}>
          {[0, 1, 2].map((i) => (
            <Zee key={i} color={c.grey} />
          ))}
        </group>
      )}
      {gear === "coin" && mood === "sad" && (
        <group ref={taxes}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.02, 20]} />
              <meshBasicMaterial color={c.gold} transparent />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

function Mouth({ mood, c }: { mood: Mood; c: Colors }) {
  const m = <meshBasicMaterial color={c.point} />;
  if (mood === "startled")
    return (
      <mesh position={[0, 0.2, 0.445]}>
        <torusGeometry args={[0.03, 0.012, 8, 20]} />
        {m}
      </mesh>
    );
  if (mood === "sad" || mood === "worried")
    return (
      <mesh position={[0, 0.19, 0.445]}>
        <torusGeometry args={[0.035, 0.01, 8, 16, Math.PI]} />
        {m}
      </mesh>
    );
  // ω 입 — 반원 두 개
  return (
    <group position={[0, 0.235, 0.45]} rotation={[0, 0, Math.PI]}>
      {[-0.028, 0.028].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <torusGeometry args={[mood === "happy" ? 0.032 : 0.026, 0.009, 8, 16, Math.PI]} />
          {m}
        </mesh>
      ))}
    </group>
  );
}

/** 노란 안전모 · 이마 램프 — 통과 · 커밋은 청록 · 막힘 · 실패 · 걱정은 빨강 · 그 밖은 따뜻한 노랑 */
function HardHat({ mood, c }: { mood: Mood; c: Colors }) {
  const lamp = mood === "happy" ? c.accent : mood === "startled" || mood === "sad" ? c.red : new Color("#fff3b0");
  const lampRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (lampRef.current) lampRef.current.scale.setScalar(mood === "happy" || mood === "startled" ? 1 + Math.abs(Math.sin(clock.elapsedTime * 6)) * 0.35 : 1);
  });
  return (
    <group position={[0, 0.56, 0]}>
      <mesh scale={[1.12, 0.78, 1.08]}>
        <sphereGeometry args={[0.36, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={c.hat} roughness={0.35} metalness={0.05} />
      </mesh>
      {/* 가운데 줄 · 챙 */}
      <mesh scale={[0.18, 0.8, 1.1]}>
        <sphereGeometry args={[0.37, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={c.hatDark} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.005, 0.05]}>
        <cylinderGeometry args={[0.45, 0.45, 0.03, 40]} />
        <meshStandardMaterial color={c.hatDark} roughness={0.4} />
      </mesh>
      {/* 이마 램프 */}
      <group position={[0, 0.14, 0.37]} rotation={[Math.PI / 2 - 0.35, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.07, 0.08, 0.06, 20]} />
          <meshStandardMaterial color={c.dark} roughness={0.4} />
        </mesh>
        <mesh ref={lampRef} position={[0, 0.035, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 0.015, 20]} />
          <meshBasicMaterial color={lamp} />
        </mesh>
      </group>
    </group>
  );
}

/** ₩ 금화 — 앞발로 안음 */
function HugCoin({ c }: { c: Colors }) {
  const tex = useMemo(() => (typeof document === "undefined" ? null : faceTexture("₩", `#${c.gold.getHexString()}`, "#7a5200")), [c]);
  useEffect(() => () => tex?.dispose(), [tex]);
  return (
    <mesh position={[0, -0.24, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.22, 0.22, 0.06, 40]} />
      <meshStandardMaterial attach="material-0" color={c.hatDark} metalness={0.6} roughness={0.3} />
      <meshStandardMaterial attach="material-1" map={tex} metalness={0.35} roughness={0.35} />
      <meshStandardMaterial attach="material-2" map={tex} metalness={0.35} roughness={0.35} />
    </mesh>
  );
}

function Props({ mood, prop, c }: { mood: Mood; prop: React.Ref<Group>; c: Colors }) {
  switch (mood) {
    case "typing":
      return (
        <group ref={prop} position={[0, -0.52, 0.62]}>
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
        <group ref={prop} position={[0.55, 0.05, 0.5]} rotation={[0, -0.3, 0]}>
          <mesh>
            <torusGeometry args={[0.12, 0.022, 10, 28]} />
            <meshStandardMaterial color={c.hatDark} roughness={0.3} />
          </mesh>
          <mesh>
            <circleGeometry args={[0.12, 28]} />
            <meshBasicMaterial color={c.accent} transparent opacity={0.25} />
          </mesh>
          <mesh position={[0.09, -0.18, 0]} rotation={[0, 0, 0.5]}>
            <cylinderGeometry args={[0.022, 0.022, 0.18, 10]} />
            <meshStandardMaterial color={c.dark} />
          </mesh>
        </group>
      );
    case "working":
      return (
        <group ref={prop} position={[0.62, 0.62, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.05, 20]} />
            <meshStandardMaterial color={c.grey} metalness={0.4} roughness={0.35} />
          </mesh>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={i} rotation={[0, 0, (i / 8) * Math.PI * 2]} position={[Math.cos((i / 8) * Math.PI * 2) * 0.14, Math.sin((i / 8) * Math.PI * 2) * 0.14, 0]}>
              <boxGeometry args={[0.06, 0.05, 0.05]} />
              <meshStandardMaterial color={c.grey} metalness={0.4} roughness={0.35} />
            </mesh>
          ))}
        </group>
      );
    case "browsing":
      return (
        <group ref={prop} position={[0.68, 0.2, 0.38]} rotation={[0, -0.7, 0]}>
          <mesh>
            <boxGeometry args={[0.5, 0.36, 0.03]} />
            <meshStandardMaterial color={c.dark} />
          </mesh>
          <mesh position={[0, 0, 0.017]}>
            <planeGeometry args={[0.44, 0.3]} />
            <meshBasicMaterial color={c.accent} transparent opacity={0.85} />
          </mesh>
        </group>
      );
    case "happy":
      return (
        <group ref={prop}>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.85, 0.25 + Math.sin(a) * 0.65, -0.1]}>
                <octahedronGeometry args={[0.05]} />
                <meshBasicMaterial color={i % 2 ? c.pink : c.accent} />
              </mesh>
            );
          })}
        </group>
      );
    case "startled":
      return (
        <group ref={prop} position={[0.5, 1.18, 0]}>
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
