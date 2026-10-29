"use client";

// 🐱 고양이 몸 — three.js 도형만 (모델 파일 없음) · 장난감 비율 (큰 머리 · 반짝이는 큰 눈 · 말랑한 몸)
//   2026-10-29 사용자가 참고 그림 두 장을 줌: "참고 2는 만드는중 · 참고 1은 직구계산"
//   gear "suit" = 작업 고양이 (참고 2) — 하얀 고양이 · 민트 후드 작업복 · 지퍼 · 주황 신발 · 크고 짙은 눈
//   gear "coin" = 돈 든 고양이 (참고 1) — 회색 · 흰 아기 고양이 · 초록 눈 · 황금 금화를 안고 앉음
// 방방 뛰지 않고 고양이답게 (사용자: "기어 다니고 · 그루밍 · 앉아서") — 몸은 "자세"를 오가며 움직임
//   자세: 앉기 · 식빵 · 서기(걷기) · 기지개 · 말고 자기 · 등 세우기 · 삐쳐 앉기 → 부드럽게 바뀜 (lerp)
// 표정(mood) 이름과 차림(gear)만 받고, 무엇을 보고 고를지는 쓰는 쪽이 정함
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, type Group, type Mesh, type MeshBasicMaterial } from "three";
import { faceTexture } from "./coin";
import { tokenColor } from "./stage";

export const MOODS = ["typing", "looking", "working", "browsing", "happy", "startled", "sad", "sleeping", "neutral", "walking", "worried"] as const;
export type Mood = (typeof MOODS)[number];
export type Gear = "suit" | "coin";

/** 움직임 줄이기면 이 시각의 자세로 멈춰 그림 */
export const STILL_T = 1.2;

// ── 자세 ── 앞 = +z · 땅 = y -0.62 · 모든 값은 이 그룹 안 좌표
type V3 = [number, number, number];
type Leg = { y: number; z: number; rot: number; len: number };
type Pose = {
  /** 몸 전체가 보는 방향 (0 = 카메라) */
  turn: number;
  torso: V3;
  /** + 앞쪽이 내려감 · - 앞쪽이 올라감(앉기) */
  pitch: number;
  bulk: V3;
  head: V3;
  nod: number;
  front: Leg;
  hind: Leg;
  /** 앉을 때 옆으로 보이는 넓적다리 · 뒷발 (0 ~ 1) */
  haunch: number;
  tail: V3;
  tailRot: V3;
  puff: number;
};

const SIT: Pose = {
  turn: 0,
  torso: [0, -0.3, -0.02],
  pitch: -1.05,
  bulk: [1, 1, 1],
  head: [0, 0.3, 0.12],
  nod: 0,
  front: { y: -0.22, z: 0.2, rot: 0, len: 0.36 },
  hind: { y: -0.5, z: -0.05, rot: 0, len: 0 },
  haunch: 1,
  tail: [0.12, -0.58, -0.22],
  tailRot: [1.45, 0, -1.9],
  puff: 1,
};
const LOAF: Pose = {
  ...SIT,
  turn: 0.25,
  torso: [0, -0.44, -0.08],
  pitch: 0,
  bulk: [1.08, 0.9, 1],
  head: [0, 0.02, 0.32],
  nod: 0.05,
  front: { y: -0.5, z: 0.36, rot: -1.45, len: 0.1 },
  hind: { y: -0.5, z: -0.3, rot: 0, len: 0 },
  haunch: 0.55,
  tail: [0.18, -0.58, -0.4],
  tailRot: [1.5, 0, -1.6],
};
const STAND: Pose = {
  turn: 0,
  torso: [0, -0.22, -0.05],
  pitch: 0,
  bulk: [1, 1, 1],
  head: [0, 0.14, 0.4],
  nod: 0,
  front: { y: -0.3, z: 0.24, rot: 0, len: 0.33 },
  hind: { y: -0.3, z: -0.3, rot: 0, len: 0.33 },
  haunch: 0,
  tail: [0, -0.12, -0.42],
  tailRot: [-0.55, 0, 0],
  puff: 1,
};
const STRETCH: Pose = {
  ...STAND,
  turn: -1.0,
  torso: [0, -0.32, -0.08],
  pitch: 0.42,
  head: [0, -0.18, 0.5],
  nod: -0.35,
  front: { y: -0.5, z: 0.3, rot: -1.25, len: 0.36 },
  hind: { y: -0.2, z: -0.34, rot: 0.1, len: 0.42 },
  tail: [0, -0.02, -0.46],
  tailRot: [-0.25, 0, 0],
};
const CURL: Pose = {
  ...LOAF,
  turn: 0.35,
  torso: [0, -0.5, -0.08],
  bulk: [1.25, 0.72, 1.05],
  head: [0.02, -0.3, 0.26],
  nod: 0.22,
  front: { y: -0.55, z: 0.3, rot: -1.5, len: 0 },
  haunch: 0.4,
  tail: [0.3, -0.58, -0.25],
  tailRot: [1.5, 0, -2.6],
};
const ARCH: Pose = {
  ...STAND,
  turn: -1.2,
  torso: [0, -0.05, -0.05],
  bulk: [1, 1.25, 0.95],
  head: [0, 0.22, 0.42],
  nod: 0.15,
  front: { y: -0.15, z: 0.24, rot: 0, len: 0.48 },
  hind: { y: -0.15, z: -0.3, rot: 0, len: 0.48 },
  tail: [0, 0.12, -0.42],
  tailRot: [-0.08, 0, 0],
  puff: 1.12,
};
const SULK: Pose = { ...SIT, turn: 2.6 };

function lerpPose(a: Pose, b: Pose, k: number): Pose {
  const n = (x: number, y: number) => x + (y - x) * k;
  const v = (x: V3, y: V3): V3 => [n(x[0], y[0]), n(x[1], y[1]), n(x[2], y[2])];
  const l = (x: Leg, y: Leg): Leg => ({ y: n(x.y, y.y), z: n(x.z, y.z), rot: n(x.rot, y.rot), len: n(x.len, y.len) });
  return {
    turn: n(a.turn, b.turn),
    torso: v(a.torso, b.torso),
    pitch: n(a.pitch, b.pitch),
    bulk: v(a.bulk, b.bulk),
    head: v(a.head, b.head),
    nod: n(a.nod, b.nod),
    front: l(a.front, b.front),
    hind: l(a.hind, b.hind),
    haunch: n(a.haunch, b.haunch),
    tail: v(a.tail, b.tail),
    tailRot: v(a.tailRot, b.tailRot),
    puff: n(a.puff, b.puff),
  };
}

/** 기록(표정) → 자세 · 어떤 표정은 시간에 따라 두 자세를 오감 (기지개 뒤 다시 앉기 등) */
function poseFor(mood: Mood, gear: Gear, t: number): Pose {
  if (gear === "coin") return mood === "sad" ? { ...SIT, turn: 0.35 } : SIT;
  switch (mood) {
    case "looking":
    case "browsing":
      return LOAF;
    case "walking":
      return STAND;
    case "happy":
      return t % 6 < 3.2 ? STRETCH : SIT; // 쭉 기지개 → 다시 앉음
    case "startled":
      return ARCH;
    case "sad":
      return SULK;
    case "sleeping":
      return CURL;
    default:
      return SIT;
  }
}

function useColors(gear: Gear) {
  return useMemo(() => {
    const suit = gear === "suit";
    return {
      white: new Color("#fbf8f3"),
      coat: new Color("#a3a6ae"), // 참고 1 회색
      stripe: new Color("#8a8d96"),
      inner: new Color("#f4a9b8"),
      iris: new Color(suit ? "#3b2b26" : "#8fb339"), // 참고 2 짙은 눈 · 참고 1 초록 눈
      pupil: new Color("#140f0d"),
      nose: new Color("#f08aa0"),
      blush: new Color("#ffb2c4"),
      line: new Color("#6b5a55"),
      whisker: new Color("#d9d4cf"),
      suit: new Color("#8fd6c9"), // 참고 2 민트
      suitLight: new Color("#b5e6dc"),
      suitDark: new Color("#6fbfb1"),
      zip: new Color("#f2a06e"),
      shoe: new Color("#f28a6b"), // 참고 2 주황 신발
      gold: new Color("#ffbf1f"),
      goldRim: new Color("#e39b00"),
      goldInk: new Color("#8a5200"),
      accent: new Color(tokenColor("--hav-accent", "#4ff0e0")),
      blue: new Color(tokenColor("--hav-cheap", "#4c9bff")),
      grey: new Color(tokenColor("--hav-normal", "#c7c7cc")),
      dark: new Color(tokenColor("--hav-surface-2", "#1d1d1f")),
    };
  }, [gear]);
}
type Colors = ReturnType<typeof useColors>;

/** 눈 — 크고 반짝이는 장난감 눈 (참고 그림) · 색 테두리 + 큰 동공 + 반짝임 셋 · smile 이면 ^ 모양으로 감음 */
function Eye({ x, eye, pupil, shut, smile, c }: { x: number; eye: React.Ref<Group>; pupil: React.Ref<Group>; shut: React.Ref<Mesh>; smile: boolean; c: Colors }) {
  if (smile)
    return (
      <group position={[x, -0.01, 0.39]}>
        <mesh>
          <torusGeometry args={[0.07, 0.014, 8, 20, Math.PI]} />
          <meshBasicMaterial color={c.line} />
        </mesh>
      </group>
    );
  return (
    <>
      {/* 감은 눈 ‿ — 반쯤 감으면 비웃는 것처럼 보여서, 감을 땐 끝까지 감음 (useFrame 이 보이기를 바꿈) */}
      <mesh ref={shut} position={[x, -0.02, 0.39]} rotation={[0, 0, Math.PI]} visible={false}>
        <torusGeometry args={[0.07, 0.013, 8, 20, Math.PI]} />
        <meshBasicMaterial color={c.line} />
      </mesh>
    <group ref={eye} position={[x, -0.02, 0.33]}>
      <mesh scale={[1, 1.1, 0.55]}>
        <sphereGeometry args={[0.115, 32, 32]} />
        <meshStandardMaterial color={c.iris} roughness={0.08} metalness={0.1} />
      </mesh>
      <group ref={pupil}>
        <mesh position={[0, -0.005, 0.03]} scale={[1, 1.08, 0.55]}>
          <sphereGeometry args={[0.088, 24, 24]} />
          <meshStandardMaterial color={c.pupil} roughness={0.05} />
        </mesh>
        <mesh position={[0.035, 0.045, 0.075]}>
          <sphereGeometry args={[0.036, 14, 14]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.035, -0.04, 0.075]}>
          <sphereGeometry args={[0.016, 10, 10]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.05, -0.03, 0.07]}>
          <sphereGeometry args={[0.009, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
    </>
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

/** 다리 하나 — 엉덩이 · 어깨를 축으로 아래로 · len 0 이면 숨음 (식빵 · 말고 자기) */
function LegMesh({ leg, shin, paw }: { leg: React.Ref<Group>; shin: Color; paw: Color }) {
  return (
    <group ref={leg}>
      <mesh name="shin">
        <cylinderGeometry args={[0.065, 0.06, 1, 14]} />
        <meshStandardMaterial color={shin} roughness={0.8} />
      </mesh>
      <mesh name="paw" scale={[1, 0.75, 1.25]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={paw} roughness={0.7} />
      </mesh>
    </group>
  );
}

/** 고양이 몸 — 다른 장면(stations 등)에서도 씀 · 위치 · 크기 · 걷는 방향은 바깥 group 이 정함 */
export function CatFigure({ mood, gear, animate }: { mood: Mood; gear: Gear; animate: boolean }) {
  const c = useColors(gear);
  const root = useRef<Group>(null);
  const torso = useRef<Group>(null);
  const head = useRef<Group>(null);
  const earL = useRef<Group>(null);
  const earR = useRef<Group>(null);
  const eyeL = useRef<Group>(null);
  const eyeR = useRef<Group>(null);
  const pupilL = useRef<Group>(null);
  const pupilR = useRef<Group>(null);
  const shutL = useRef<Mesh>(null);
  const shutR = useRef<Mesh>(null);
  const mouthOpen = useRef<Mesh>(null);
  const legFL = useRef<Group>(null);
  const legFR = useRef<Group>(null);
  const legHL = useRef<Group>(null);
  const legHR = useRef<Group>(null);
  const haunches = useRef<Group>(null);
  const tail = useRef<Group>(null);
  const zees = useRef<Group>(null);
  const sweat = useRef<Mesh>(null);
  const taxes = useRef<Group>(null);
  const pose = useRef<Pose>(poseFor(mood, gear, STILL_T));

  useFrame(({ clock }, dt) => {
    const t = animate ? clock.elapsedTime : STILL_T;
    const r = root.current;
    if (!r) return;
    const target = poseFor(mood, gear, t);
    // 자세는 천천히 옮겨 감 · 움직임 줄이기면 바로
    const p = (pose.current = animate ? lerpPose(pose.current, target, 1 - Math.exp(-Math.min(dt, 0.1) * 5)) : target);

    // 기본 숨쉬기 · 고양이 몸짓 (덧붙이는 움직임)
    let breathe = Math.sin(t * 1.8) * 0.012;
    let headX = p.nod;
    let headZ = 0;
    let earsL = 0;
    let earsR = 0; // + 쫑긋 · - 납작
    let eyeOpen = 1;
    let look: [number, number] = [0, 0];
    let yawn = 0;
    const fl = { ...p.front };
    const fr = { ...p.front };
    const hl = { ...p.hind };
    const hr = { ...p.hind };
    let tailSwayY = Math.sin(t * 1.2) * 0.15;
    let tailSwayZ = 0;
    // 천천히 눈 깜빡 (고양이 인사) · 자는 중 · 놀람은 빼고
    const slowBlink = mood !== "sleeping" && mood !== "startled" && t % 4.6 > 4.1;

    if (gear === "coin") {
      // 금화를 앞발로 안음 — 걱정이면 더 꼭
      const hug = mood === "worried" ? -1.25 : -1.0;
      fl.rot = fr.rot = hug;
      fl.len = fr.len = 0.24;
      fl.y = fr.y = -0.12;
      if (mood === "happy") {
        tailSwayY = Math.sin(t * 2.2) * 0.35;
        eyeOpen = 0.5;
      }
      if (mood === "worried") {
        earsL = earsR = -0.4;
        look = [Math.sin(t * 2.5) * 0.03, 0];
        breathe += Math.sin(t * 20) * 0.004;
      }
      if (mood === "sad") {
        earsL = earsR = -0.95;
        headX += 0.2;
        eyeOpen = 0.7;
        look = [0, -0.04];
      }
    } else {
      switch (mood) {
        case "neutral": {
          // 가끔 하품 · 귀 한쪽 씰룩
          const k = t % 9;
          if (k > 7 && k < 8.2) {
            yawn = Math.sin(((k - 7) / 1.2) * Math.PI);
            headX -= yawn * 0.25;
            eyeOpen = 1 - yawn * 0.9;
          }
          if (t % 5 < 0.18) earsR = 0.35;
          break;
        }
        case "typing": {
          // 꾹꾹이 — 앞발 번갈아 · 눈 지그시
          const knead = Math.sin(t * 5);
          fl.rot = -Math.max(0, knead) * 0.35;
          fr.rot = -Math.max(0, -knead) * 0.35;
          fl.len -= Math.max(0, knead) * 0.06;
          fr.len -= Math.max(0, -knead) * 0.06;
          headX += 0.18;
          eyeOpen = 0.45;
          look = [0, -0.03];
          break;
        }
        case "looking":
          headZ = Math.sin(t * 0.9) * 0.22; // 갸웃
          look = [Math.sin(t * 0.9) * 0.03, -0.01];
          tailSwayY = Math.sin(t * 6) * 0.06; // 꼬리 끝만 톡톡
          earsL = earsR = 0.15;
          break;
        case "browsing":
          look = [0.04, 0];
          earsL = earsR = 0.25;
          tailSwayY = Math.sin(t * 5) * 0.08;
          break;
        case "working": {
          // 그루밍 — 앞발 핥기 (0 ~ 2.6초) → 그 발로 얼굴 세수 (2.6 ~ 4초)
          const k = t % 4;
          if (k < 2.6) {
            fr.rot = -2.1;
            fr.len = 0.26;
            headX += 0.3 + Math.sin(t * 9) * 0.05;
            headZ = 0.25;
            eyeOpen = 0.15;
          } else {
            fr.rot = -2.55 + Math.sin(t * 7) * 0.35;
            fr.len = 0.3;
            headX += 0.15;
            headZ = 0.35;
            eyeOpen = 0.1;
            earsR = -0.4;
          }
          break;
        }
        case "happy":
          eyeOpen = 0.35; // 기지개하며 눈 감음
          tailSwayZ = Math.sin(t * 1.5) * 0.08;
          break;
        case "startled":
          earsL = earsR = -0.6; // 귀 뒤로
          breathe += Math.sin(t * 40) * 0.006;
          tailSwayY = 0;
          break;
        case "sad":
          earsL = earsR = -0.9;
          tailSwayY = 0;
          tailSwayZ = Math.abs(Math.sin(t * 2.4)) * -0.35; // 바닥 탁탁
          break;
        case "sleeping":
          breathe = Math.sin(t * 1.1) * 0.02;
          eyeOpen = 0;
          tailSwayY = 0;
          earsL = earsR = -0.15;
          break;
        case "walking": {
          // 네 발로 살금살금 — 대각선 다리끼리 (왼앞 · 오른뒤)
          const g = Math.sin(t * 8);
          fl.rot = g * 0.45;
          hr.rot = g * 0.45;
          fr.rot = -g * 0.45;
          hl.rot = -g * 0.45;
          breathe += Math.abs(Math.cos(t * 8)) * 0.02;
          headX += Math.sin(t * 16) * 0.02;
          tailSwayY = Math.sin(t * 4) * 0.25;
          break;
        }
        default:
          break;
      }
    }

    r.rotation.y = p.turn;
    const T = torso.current;
    if (T) {
      T.position.set(p.torso[0], p.torso[1] + breathe, p.torso[2]);
      T.rotation.set(p.pitch, 0, 0);
      T.scale.set(p.bulk[0] * p.puff, p.bulk[1] * p.puff * (1 + breathe * 2), p.bulk[2]);
    }
    head.current?.position.set(p.head[0], p.head[1] + breathe, p.head[2]);
    head.current?.rotation.set(headX, 0, headZ);
    earL.current?.rotation.set(0, 0, 0.35 - earsL);
    earR.current?.rotation.set(0, 0, -0.35 + earsR);
    const blink = slowBlink ? 0.12 : eyeOpen;
    // 반쯤 감기는 없음 — 0.55 아래면 감은 눈 ‿ · 위면 뜬 눈 (조금 가늘게만)
    const closed = blink < 0.55;
    for (const e of [eyeL.current, eyeR.current]) if (e) {
      e.visible = !closed;
      e.scale.set(1, Math.max(0.85, blink), 1);
    }
    for (const m of [shutL.current, shutR.current]) if (m) m.visible = closed;
    for (const q of [pupilL.current, pupilR.current]) q?.position.set(look[0], look[1], 0);
    if (mouthOpen.current) mouthOpen.current.scale.setScalar(Math.max(0.001, yawn));

    const placeLeg = (g: Group | null, x: number, l: Leg) => {
      if (!g) return;
      g.position.set(x, l.y + breathe, l.z);
      g.rotation.set(l.rot, 0, 0);
      const len = Math.max(0.001, l.len);
      const shin = g.getObjectByName("shin");
      const pawMesh = g.getObjectByName("paw");
      if (shin) {
        shin.position.set(0, -len / 2, 0);
        shin.scale.set(1, len, 1);
        shin.visible = l.len > 0.02;
      }
      if (pawMesh) {
        pawMesh.position.set(0, -len, 0.02);
        pawMesh.visible = l.len > 0.005 || l.rot < -1;
      }
    };
    placeLeg(legFL.current, -0.12, fl);
    placeLeg(legFR.current, 0.12, fr);
    placeLeg(legHL.current, -0.15, hl);
    placeLeg(legHR.current, 0.15, hr);
    if (haunches.current) {
      haunches.current.scale.setScalar(Math.max(0.001, p.haunch));
      haunches.current.position.y = breathe;
    }
    if (tail.current) {
      tail.current.position.set(p.tail[0], p.tail[1], p.tail[2]);
      tail.current.rotation.set(p.tailRot[0], p.tailRot[1] + tailSwayY, p.tailRot[2] + tailSwayZ);
      tail.current.scale.setScalar(p.puff > 1.05 ? 1.35 : 1);
    }

    if (zees.current) {
      zees.current.children.forEach((z, i) => {
        const k = (t * 0.3 + i / 3) % 1;
        z.position.set(0.35 + k * 0.3, -0.1 + k * 0.55, 0.2);
        z.scale.setScalar(0.4 + k * 0.5);
        z.children.forEach((m) => (((m as Mesh).material as MeshBasicMaterial).opacity = 1 - k));
      });
    }
    if (sweat.current) {
      const k = (t * 0.6) % 1;
      sweat.current.position.set(0.38, p.head[1] + 0.2 - k * 0.3, p.head[2] + 0.1);
      (sweat.current.material as MeshBasicMaterial).opacity = 1 - k;
    }
    if (taxes.current) {
      // 세금 동전이 금화에서 떨어져 옆으로 데굴데굴
      taxes.current.children.forEach((m, i) => {
        const k = (t * 0.35 + i / 3) % 1;
        m.position.set(0.15 + k * 0.7, -0.55 + Math.abs(Math.sin(k * 9)) * 0.06 * (1 - k), 0.45 - i * 0.08);
        m.rotation.set(Math.PI / 2, 0, -k * 12);
        ((m as Mesh).material as MeshBasicMaterial).opacity = 1 - k;
      });
    }
  });

  // 웃을 때 · 꾹꾹이할 때는 ^ ^ 로 감은 눈
  const smile = mood === "happy" || (mood === "typing" && gear === "suit");
  const suit = gear === "suit";
  return (
    <group position={[0, -0.05, 0]}>
      <group ref={root}>
        {/* 몸통 — 작업 고양이는 민트 작업복 · 아기 고양이는 회색 등 */}
        <group ref={torso}>
          <mesh scale={[0.9, 0.85, 1.3]}>
            <sphereGeometry args={[0.27, 32, 32]} />
            <meshStandardMaterial color={suit ? c.suit : c.coat} roughness={0.75} />
          </mesh>
          {/* 가슴 — 아기 고양이는 복슬한 흰 가슴 · 작업복은 밝은 민트 + 지퍼 */}
          <mesh position={[0, -0.03, 0.21]} scale={[0.72, 0.78, 0.72]}>
            <sphereGeometry args={[0.23, 24, 24]} />
            <meshStandardMaterial color={suit ? c.suitLight : c.white} roughness={0.85} />
          </mesh>
          {suit && (
            <>
              <mesh position={[0, 0.0, 0.375]} rotation={[-0.1, 0, 0]}>
                <boxGeometry args={[0.022, 0.26, 0.012]} />
                <meshStandardMaterial color={c.zip} roughness={0.4} />
              </mesh>
              <mesh position={[0, 0.12, 0.37]}>
                <sphereGeometry args={[0.022, 10, 10]} />
                <meshStandardMaterial color={c.zip} roughness={0.4} />
              </mesh>
              {/* 주머니 */}
              <mesh position={[-0.1, -0.08, 0.34]} rotation={[0, -0.25, 0]}>
                <boxGeometry args={[0.07, 0.06, 0.01]} />
                <meshStandardMaterial color={c.suitDark} roughness={0.7} />
              </mesh>
            </>
          )}
        </group>

        {/* 앉을 때 옆으로 보이는 넓적다리 + 뒷발 (작업복이면 바지 · 주황 신발) */}
        <group ref={haunches}>
          {[-1, 1].map((s) => (
            <group key={s}>
              <mesh position={[s * 0.18, -0.48, -0.04]} scale={[0.85, 0.9, 1.1]}>
                <sphereGeometry args={[0.15, 20, 20]} />
                <meshStandardMaterial color={suit ? c.suit : c.coat} roughness={0.8} />
              </mesh>
              <mesh position={[s * 0.18, -0.6, 0.12]} scale={[0.95, 0.6, 1.35]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color={suit ? c.shoe : c.white} roughness={suit ? 0.5 : 0.85} />
              </mesh>
            </group>
          ))}
        </group>

        <LegMesh leg={legFL} shin={suit ? c.suit : c.white} paw={c.white} />
        <LegMesh leg={legFR} shin={suit ? c.suit : c.white} paw={c.white} />
        <LegMesh leg={legHL} shin={suit ? c.suit : c.coat} paw={suit ? c.shoe : c.white} />
        <LegMesh leg={legHR} shin={suit ? c.suit : c.coat} paw={suit ? c.shoe : c.white} />

        {/* 꼬리 — 하얀 고양이는 흰 꼬리 · 아기 고양이는 회색에 진한 줄 */}
        <group ref={tail}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh key={i} position={[0, i * 0.07, -i * 0.035]}>
              <sphereGeometry args={[0.075 + (i > 3 ? 0.006 : 0), 16, 16]} />
              <meshStandardMaterial color={suit ? c.white : i % 2 ? c.stripe : c.coat} roughness={0.9} />
            </mesh>
          ))}
        </group>

        {/* 머리 — 크게 (장난감 비율) · 그룹 원점 = 머리 가운데 */}
        <group ref={head}>
          <group scale={1.12}>
            <mesh scale={[1.12, 0.96, 0.96]}>
              <sphereGeometry args={[0.38, 40, 40]} />
              <meshStandardMaterial color={c.white} roughness={0.8} />
            </mesh>
            {!suit && (
              <>
                {/* 아기 고양이: 머리 위 회색 · 이마 줄무늬 */}
                <mesh scale={[1.125, 0.965, 0.965]} rotation={[-0.35, 0, 0]}>
                  <sphereGeometry args={[0.381, 40, 20, 0, Math.PI * 2, 0, 1.05]} />
                  <meshStandardMaterial color={c.coat} roughness={0.85} />
                </mesh>
                {[-0.07, 0, 0.07].map((x) => (
                  <mesh key={x} position={[x, 0.24, 0.27]} rotation={[-0.75, 0, x * 2]}>
                    <boxGeometry args={[0.025, 0.11, 0.01]} />
                    <meshStandardMaterial color={c.stripe} roughness={0.85} />
                  </mesh>
                ))}
              </>
            )}
            {/* 복슬한 볼 */}
            {[-0.27, 0.27].map((x) => (
              <mesh key={x} position={[x, -0.14, 0.1]} scale={[1, 0.82, 0.9]}>
                <sphereGeometry args={[0.16, 20, 20]} />
                <meshStandardMaterial color={c.white} roughness={0.85} />
              </mesh>
            ))}
            <Eye x={-0.16} eye={eyeL} pupil={pupilL} shut={shutL} smile={smile} c={c} />
            <Eye x={0.16} eye={eyeR} pupil={pupilR} shut={shutR} smile={smile} c={c} />
            <mesh position={[0, -0.09, 0.4]} rotation={[0.3, 0, 0]} scale={[1.3, 0.8, 0.7]}>
              <sphereGeometry args={[0.024, 12, 12]} />
              <meshStandardMaterial color={c.nose} roughness={0.4} />
            </mesh>
            <Mouth mood={mood} c={c} />
            <mesh ref={mouthOpen} position={[0, -0.17, 0.39]} scale={0.001}>
              <sphereGeometry args={[0.04, 14, 14]} />
              <meshBasicMaterial color="#c75a6c" />
            </mesh>
            {[-0.25, 0.25].map((x) => (
              <mesh key={x} position={[x, -0.1, 0.33]} scale={[1.4, 0.75, 0.3]}>
                <sphereGeometry args={[0.058, 14, 14]} />
                <meshBasicMaterial color={c.blush} transparent opacity={0.8} />
              </mesh>
            ))}
            {[-1, 1].flatMap((s) =>
              [-0.04, 0.02].map((dy) => (
                <mesh key={`${s}${dy}`} position={[s * 0.3, -0.12 + dy, 0.31]} rotation={[0, s * -0.4, s * dy * 3]}>
                  <boxGeometry args={[0.2, 0.005, 0.005]} />
                  <meshBasicMaterial color={suit ? c.whisker : c.white} />
                </mesh>
              )),
            )}
            {/* 귀 — 분홍 안쪽 · 아기 고양이는 회색 바깥 */}
            {[
              { ref: earL, x: -0.24 },
              { ref: earR, x: 0.24 },
            ].map(({ ref, x }) => (
              <group key={x} ref={ref} position={[x, 0.24, -0.02]}>
                <mesh position={[0, 0.11, 0]}>
                  <coneGeometry args={[0.13, 0.27, 24]} />
                  <meshStandardMaterial color={suit ? c.white : c.coat} roughness={0.8} />
                </mesh>
                <mesh position={[0, 0.09, 0.05]} scale={[0.62, 0.72, 0.4]}>
                  <coneGeometry args={[0.13, 0.27, 24]} />
                  <meshStandardMaterial color={c.inner} roughness={0.8} />
                </mesh>
              </group>
            ))}
            {suit && <Hood c={c} />}
          </group>
        </group>

        {gear === "coin" && <HugCoin c={c} />}
        {suit && <Props mood={mood} c={c} />}
        {(mood === "worried" || (mood === "sad" && suit)) && (
          <mesh ref={sweat} scale={[0.8, 1.3, 0.8]}>
            <sphereGeometry args={[0.04, 14, 14]} />
            <meshBasicMaterial color={c.blue} transparent />
          </mesh>
        )}
      </group>

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
            <mesh key={i}>
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
  const m = <meshBasicMaterial color={c.line} />;
  if (mood === "sad" || mood === "worried" || mood === "startled")
    return (
      <mesh position={[0, -0.16, 0.395]}>
        <torusGeometry args={[0.028, 0.008, 8, 16, Math.PI]} />
        {m}
      </mesh>
    );
  // ω 입 — 반원 두 개
  return (
    <group position={[0, -0.125, 0.4]} rotation={[0, 0, Math.PI]}>
      {[-0.024, 0.024].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <torusGeometry args={[0.023, 0.007, 8, 16, Math.PI]} />
          {m}
        </mesh>
      ))}
    </group>
  );
}

/** 민트 후드 — 얼굴만 열려 있고 머리 뒤 · 위를 덮음 · 이마 위 주황 단추 (참고 그림 2) */
function Hood({ c }: { c: Colors }) {
  return (
    <group>
      {/* 얼굴 쪽(+z)을 비운 공: phi 는 -x 에서 시작 → +z 는 π/2 · 그 둘레 1.9 라디안을 비움 */}
      <mesh scale={[1.16, 1.0, 1.0]}>
        <sphereGeometry args={[0.4, 40, 30, Math.PI / 2 + 0.95, Math.PI * 2 - 1.9, 0, Math.PI * 0.78]} />
        <meshStandardMaterial color={c.suit} roughness={0.75} side={2} />
      </mesh>
      {/* 얼굴 둘레 테두리 */}
      <mesh position={[0, 0.0, 0.27]} rotation={[0.08, 0, 0]} scale={[1.2, 1.05, 1]}>
        <torusGeometry args={[0.3, 0.035, 12, 40]} />
        <meshStandardMaterial color={c.suitLight} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.36, 0.14]} scale={[1, 0.45, 1]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color={c.shoe} roughness={0.5} />
      </mesh>
    </group>
  );
}

/** ₩ 금화 — 앉아서 앞발로 안음 */
function HugCoin({ c }: { c: Colors }) {
  const tex = useMemo(() => (typeof document === "undefined" ? null : faceTexture("₩", `#${c.gold.getHexString()}`, `#${c.goldInk.getHexString()}`)), [c]);
  useEffect(() => () => tex?.dispose(), [tex]);
  return (
    <mesh position={[0, -0.3, 0.38]} rotation={[Math.PI / 2 - 0.15, 0, 0]}>
      <cylinderGeometry args={[0.2, 0.2, 0.06, 40]} />
      <meshStandardMaterial attach="material-0" color={c.goldRim} metalness={0.85} roughness={0.22} emissive={c.goldRim} emissiveIntensity={0.22} />
      <meshStandardMaterial attach="material-1" map={tex} metalness={0.35} roughness={0.28} emissive={c.gold} emissiveIntensity={0.12} />
      <meshStandardMaterial attach="material-2" map={tex} metalness={0.35} roughness={0.28} emissive={c.gold} emissiveIntensity={0.12} />
    </mesh>
  );
}

/** 소품은 둘만 — 꾹꾹이 키보드 · 빤히 보는 작은 화면 (나머지는 몸짓으로) */
function Props({ mood, c }: { mood: Mood; c: Colors }) {
  if (mood === "typing")
    return (
      <group position={[0, -0.6, 0.36]}>
        <mesh>
          <boxGeometry args={[0.62, 0.05, 0.26]} />
          <meshStandardMaterial color={c.dark} roughness={0.6} />
        </mesh>
        {[-0.21, -0.07, 0.07, 0.21].flatMap((x) =>
          [-0.06, 0.06].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.035, z]}>
              <boxGeometry args={[0.11, 0.025, 0.09]} />
              <meshStandardMaterial color={c.grey} roughness={0.5} />
            </mesh>
          )),
        )}
      </group>
    );
  if (mood === "browsing")
    return (
      <group position={[0.55, -0.42, 0.55]} rotation={[0, -0.9, 0]}>
        <mesh>
          <boxGeometry args={[0.42, 0.3, 0.03]} />
          <meshStandardMaterial color={c.dark} />
        </mesh>
        <mesh position={[0, 0, 0.017]}>
          <planeGeometry args={[0.37, 0.25]} />
          <meshBasicMaterial color={c.accent} transparent opacity={0.85} />
        </mesh>
      </group>
    );
  return null;
}
