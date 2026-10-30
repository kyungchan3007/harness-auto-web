import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
// @ts-expect-error — 배포 워크플로가 node 로 바로 돌리는 .mjs (타입 없음)
import { cronsOf, fires, waitSeconds } from "../scripts/cron-window.mjs";

const CRONS = ["0 3 * * 1-5", "30 4 * * 1-5", "0 6 * * 1-5", "0 4 1 * *"];
const at = (iso: string) => new Date(iso);

describe("예약 직전 배포 막기 (작업 0097)", () => {
  it("cron 맞추기 — 평일 · 매달 1일", () => {
    expect(fires("0 3 * * 1-5", at("2026-10-30T03:00:00Z"))).toBe(true); // 금
    expect(fires("0 3 * * 1-5", at("2026-10-31T03:00:00Z"))).toBe(false); // 토
    expect(fires("0 4 1 * *", at("2026-11-01T04:00:00Z"))).toBe(true);
  });
  it("2026-10-30 02:56 배포 → 03:02 까지 기다림 (그날 실제로 놓친 경우)", () => {
    expect(waitSeconds(CRONS, at("2026-10-30T02:56:10Z"))).toBe(6 * 60 - 10);
  });
  it("04:19 배포 → 04:32 까지 (작업 0096 때)", () => {
    expect(waitSeconds(CRONS, at("2026-10-30T04:19:00Z"))).toBe(13 * 60);
  });
  it("예약과 멀면 바로 배포 · 주말은 평일 예약을 안 봄", () => {
    expect(waitSeconds(CRONS, at("2026-10-30T05:00:00Z"))).toBe(0);
    expect(waitSeconds(CRONS, at("2026-10-31T02:56:00Z"))).toBe(0);
  });
  it("wrangler.jsonc 의 crons 를 그대로 읽음", () => {
    const jsonc = readFileSync(fileURLToPath(new URL("../wrangler.jsonc", import.meta.url).href), "utf8");
    expect(cronsOf(jsonc).sort()).toEqual([...CRONS].sort());
  });
});
