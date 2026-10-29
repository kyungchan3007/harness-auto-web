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
  typing: "고양이가 키보드 위에서 꾹꾹이를 하는 중",
  looking: "고양이가 식빵 자세로 엎드려 고개를 갸웃하는 중",
  working: "고양이가 기다리면서 앞발을 핥으며 그루밍하는 중",
  browsing: "고양이가 식빵 자세로 작은 화면을 빤히 보는 중",
  happy: "작업복 입은 고양이가 쭉 기지개를 켜는 중",
  startled: "고양이가 등을 세우고 꼬리털을 부풀린 중",
  sad: "고양이가 등을 돌리고 앉아 꼬리로 바닥을 탁탁 치는 중",
  sleeping: "고양이가 동그랗게 말고 자는 중",
  neutral: "고양이가 꼬리를 감고 앉아 기다리는 중",
  walking: "고양이가 네 발로 살금살금 다음 책상으로 가는 중",
  worried: "고양이가 걱정하는 중",
};
