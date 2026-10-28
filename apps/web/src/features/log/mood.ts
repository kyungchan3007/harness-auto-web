// 실시간 기록 → 🧳 캐릭터 표정 — 실제 기록이 들어올 때만 바뀜 (지어낸 움직임 없음 · docs/design.md 🧳 표)
import type { Mood } from "@hav/ui/three/suitcase";
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
  typing: "여행 가방이 키보드를 두드리는 중",
  looking: "여행 가방이 돋보기로 살펴보는 중",
  working: "여행 가방 머리 위에서 톱니가 도는 중",
  browsing: "여행 가방이 작은 화면을 들여다보는 중",
  happy: "여행 가방이 폴짝 뛰는 중",
  startled: "여행 가방이 화들짝 놀란 중",
  sad: "여행 가방이 시무룩한 중",
  sleeping: "여행 가방이 꾸벅꾸벅 조는 중",
  neutral: "여행 가방이 기다리는 중",
};
