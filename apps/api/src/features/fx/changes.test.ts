import { describe, expect, it } from "vitest";
import { app } from "../../index";
import { changesOf } from "./changes";

describe("통화마다 기간 변화율 (작업 0096)", () => {
  it("첫날 → 마지막 날 · 1 외화당 원 기준 (엔 100 단위도 같은 기준)", () => {
    const c = changesOf([
      { currency: "USD", date: "2026-10-29", baseRate: 1336.3, unit: 1 },
      { currency: "USD", date: "2026-09-29", baseRate: 1360, unit: 1 },
      { currency: "JPY", date: "2026-09-29", baseRate: 900, unit: 100 },
      { currency: "JPY", date: "2026-10-29", baseRate: 846.89, unit: 100 },
    ]);
    expect(c.map((x) => x.currency)).toEqual(["JPY", "USD"]);
    expect(c[0].from).toEqual({ date: "2026-09-29", value: 9 });
    expect(c[0].pct).toBeCloseTo(((8.4689 - 9) / 9) * 100);
    expect(c[1].pct).toBeCloseTo(((1336.3 - 1360) / 1360) * 100);
  });
  it("기록이 두 날 미만이면 뺌 (지어내지 않음)", () => {
    expect(changesOf([{ currency: "AED", date: "2026-10-29", baseRate: 360, unit: 1 }])).toEqual([]);
  });
  it("days 범위 밖 → 400", async () => {
    const env = { DB: {} as D1Database };
    expect((await app.request("/fx/changes?days=3", {}, env)).status).toBe(400);
    expect((await app.request("/fx/changes?days=1000", {}, env)).status).toBe(400);
  });
});
