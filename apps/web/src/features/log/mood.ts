// 실시간 기록 → 🐱 작업 고양이 표정 — 실제 기록이 들어올 때만 바뀜 (지어낸 움직임 없음 · docs/design.md 🐱 표)
import type { Mood } from "@hav/ui/three/worker-cat";
import type { LiveStatus } from "./status";

export function moodOf(status: LiveStatus): Mood {
  if (status.state === "none") return "neutral";
  if (status.state === "idle") return "sleeping";
  const { kind, ok } = status.last;
  switch (kind) {
    case "edit":
      return "typing";
    case "read":
    case "search":
      return "looking";
    case "browser":
      return "browsing";
    case "blocked":
      return "startled";
    case "gate":
      return ok === true ? "happy" : ok === false ? "sad" : "working";
    case "commit":
    case "pr":
      return "happy";
    case "run":
    case "test":
    case "build":
    case "install":
      return ok === false ? "sad" : "working";
    default:
      return "neutral";
  }
}

/** 화면 읽기 프로그램용 한 줄 */
export const MOOD_TEXT: Record<Mood, string> = {
  typing: "고양이가 앞발로 키보드를 꾹꾹 누르는 중",
  looking: "고양이가 고개를 갸웃하며 돋보기로 살펴보는 중",
  working: "고양이 옆에서 톱니가 돌고 꼬리가 살랑이는 중",
  browsing: "고양이가 작은 화면을 빤히 들여다보는 중",
  happy: "고양이가 폴짝 뛰고 안전모 램프가 반짝이는 중",
  startled: "고양이가 화들짝 놀라 털이 부풀고 램프가 빨개진 중",
  sad: "고양이가 귀를 납작하게 하고 시무룩한 중",
  sleeping: "고양이가 식빵 자세로 꾸벅꾸벅 조는 중",
  neutral: "고양이가 안전모를 쓰고 기다리는 중",
  walking: "고양이가 다음 책상으로 총총 걸어가는 중",
  worried: "고양이가 걱정하는 중",
};
