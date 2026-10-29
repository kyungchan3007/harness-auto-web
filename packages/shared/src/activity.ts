// 실시간 작업 기록 API 계약 — 훅이 보내고 "만드는 중" 페이지가 읽는다
// 공개되는 글이라 서버에서도 한 번 더 거른다: 명령 · 경로 · 내용이 들어갈 자리는 아예 없고, 글에 비밀 모양이 있으면 거절
import { z } from "zod";
import { IsoDateTime } from "./date";

export const ACTIVITY_KINDS = ["edit", "read", "search", "run", "test", "gate", "build", "commit", "pr", "install", "browser", "blocked", "other"] as const;
export const ActivityKind = z.enum(ACTIVITY_KINDS);
export type ActivityKind = z.infer<typeof ActivityKind>;

/** 비밀값처럼 생긴 글 — 토큰 접두사 · 긴 16진수 · 긴 base64 · JWT · Bearer (.agents/scripts/activity.mjs 와 같은 규칙) */
const SECRET_SHAPES = [
  /\b(ghp|gho|ghs|ghu|github_pat|sk|pk|rk|xox[abprs]|AKIA|ASIA)[-_][A-Za-z0-9_-]{8,}/i,
  /\b[0-9a-f]{32,}\b/i,
  /[A-Za-z0-9+/_-]{40,}={0,2}/,
  /\beyJ[A-Za-z0-9_-]{10,}\./,
  /\bbearer\s+\S+/i,
];
export const looksSecret = (s: string) => SECRET_SHAPES.some((r) => r.test(s));

const NoSecret = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((s) => !looksSecret(s), "비밀값처럼 보이는 글은 공개 기록에 넣을 수 없습니다");

/** 파일 **이름만** — 경로 구분자 · 공백 없음 · .env 류는 거절 */
export const ActivityFile = NoSecret(80)
  .refine((s) => /^[\w.@+-]+$/.test(s), "파일 이름만 (경로 없이)")
  .refine((s) => !/^\.(env|dev\.vars)/i.test(s), "비밀 파일 이름은 넣지 않습니다");

export const ActivityIn = z.object({
  kind: ActivityKind,
  label: NoSecret(60),
  file: ActivityFile.nullable().default(null),
  ok: z.boolean().nullable().default(null),
  task: z
    .string()
    .regex(/^\d{4}$/, "작업 번호는 숫자 4자리")
    .nullable()
    .default(null),
});
export type ActivityIn = z.infer<typeof ActivityIn>;

export const ActivityEvent = z.object({
  id: z.number().int().positive(),
  at: IsoDateTime,
  kind: ActivityKind,
  label: z.string(),
  file: z.string().nullable(),
  ok: z.boolean().nullable(),
  task: z.string().nullable(),
});
export type ActivityEvent = z.infer<typeof ActivityEvent>;

/** GET /activity — 최신부터 · after 를 주면 그 id 보다 새 것만 (몇 초마다 부를 때) */
export const ActivityQuery = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  after: z.coerce.number().int().nonnegative().optional(),
});

export const ActivityList = z.object({ events: z.array(ActivityEvent) });
export type ActivityList = z.infer<typeof ActivityList>;

/** 남겨 두는 개수 — 더 오래된 건 지움 (공개 일지의 원본은 git · PR) */
export const ACTIVITY_KEEP = 500;

/** 작업별로 쌓아 두는 막힘인가 — 하네스가 막음 · 게이트 실패 · 작업 번호가 없으면 셀 수 없음 (작업 0075) */
export function snagOf(e: Pick<ActivityIn, "kind" | "ok" | "task">): "blocked" | "failed" | null {
  if (!e.task) return null;
  if (e.kind === "blocked") return "blocked";
  if (e.kind === "gate" && e.ok === false) return "failed";
  return null;
}
