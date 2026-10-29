import { describe, expect, it } from "vitest";
import { calc, catMood, parseAmount } from "./calc";
import { DUTY_FREE_USD, RULES_SOURCE } from "./rules";

const RATES = { USD: { baseRate: 1400, unit: 1 }, JPY: { baseRate: 900, unit: 100 }, EUR: { baseRate: 1500, unit: 1 } };
const base = { currency: "USD", price: "", shipping: "", dutyRate: "", route: "us-list" as const };

describe("기준값 (IMP-03)", () => {
  it("한 파일에 출처 · 확인한 날과 함께 · 미국 목록통관 200 · 그 밖 150", () => {
    expect(DUTY_FREE_USD).toEqual({ "us-list": 200, other: 150 });
    expect(RULES_SOURCE.url).toMatch(/^https:\/\/www\.customs\.go\.kr\//);
    expect(RULES_SOURCE.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("한도 안 — 세금 없음", () => {
  it("미국 180달러 → 20달러 남음 · 원화 252,000", () => {
    const r = calc({ ...base, price: "180" }, RATES);
    expect(r).toMatchObject({ ok: true, priceKrw: 252_000, priceUsd: 180, limitUsd: 200, leftUsd: 20, over: false, tax: null });
  });

  it("한도와 같으면 넘지 않음 (이하 면세)", () => {
    expect(calc({ ...base, price: "200" }, RATES)).toMatchObject({ ok: true, over: false, leftUsd: 0 });
    expect(calc({ ...base, price: "150", route: "other" }, RATES)).toMatchObject({ ok: true, over: false });
  });

  it("배송비는 한도 판단에 넣지 않음 (물품가격만)", () => {
    expect(calc({ ...base, price: "190", shipping: "50" }, RATES)).toMatchObject({ ok: true, over: false, tax: null });
  });

  it("엔은 100 단위 — 20,000엔 = 180,000원 = 128.57달러", () => {
    expect(calc({ ...base, currency: "JPY", price: "20,000", route: "other" }, RATES)).toMatchObject({ ok: true, priceKrw: 180_000, priceUsd: 128.57, over: false });
  });
});

describe("한도 넘음 — 물건 값 + 국제 운임 전체에 과세", () => {
  it("유로 160 + 배송 20 · 관세 8% → 과세 270,000 · 관세 21,600 · 부가세 29,160 · 합계 320,760", () => {
    const r = calc({ ...base, currency: "EUR", price: "160", shipping: "20", dutyRate: "8", route: "other" }, RATES);
    expect(r).toMatchObject({ ok: true, over: true, leftUsd: 0, tax: { taxableKrw: 270_000, duty: 21_600, vat: 29_160, total: 320_760 } });
  });

  it("관세율을 비우면 관세 · 부가세 · 합계는 null (지어내지 않음)", () => {
    const r = calc({ ...base, price: "250" }, RATES);
    expect(r).toMatchObject({ ok: true, over: true, tax: { taxableKrw: 350_000, duty: null, vat: null, total: null } });
  });

  it("관세율 0% 도 계산 (부가세만)", () => {
    expect(calc({ ...base, price: "250", dutyRate: "0" }, RATES)).toMatchObject({ tax: { duty: 0, vat: 35_000, total: 385_000 } });
  });

  it("같은 금액도 보내는 곳에 따라 — 170달러는 미국 목록통관이면 면세 · 그 밖이면 과세", () => {
    expect(calc({ ...base, price: "170" }, RATES)).toMatchObject({ over: false });
    expect(calc({ ...base, price: "170", route: "other" }, RATES)).toMatchObject({ over: true });
  });
});

describe("틀린 입력은 계산하지 않고 이유 (IMP-05)", () => {
  it("빈 값 · 음수 · 0 · 글자", () => {
    expect(calc(base, RATES)).toMatchObject({ ok: false, field: "price" });
    expect(calc({ ...base, price: "-10" }, RATES)).toMatchObject({ ok: false, field: "price" });
    expect(calc({ ...base, price: "0" }, RATES)).toMatchObject({ ok: false, field: "price", reason: "물건 값은 0보다 커야 합니다" });
    expect(calc({ ...base, price: "12abc" }, RATES)).toMatchObject({ ok: false, field: "price" });
    expect(calc({ ...base, price: "10", shipping: "-1" }, RATES)).toMatchObject({ ok: false, field: "shipping" });
    expect(calc({ ...base, price: "10", dutyRate: "120" }, RATES)).toMatchObject({ ok: false, field: "dutyRate" });
  });

  it("환율을 못 받았으면 계산하지 않음", () => {
    expect(calc({ ...base, currency: "GBP", price: "10" }, RATES)).toMatchObject({ ok: false, field: "rate" });
    expect(calc({ ...base, currency: "EUR", price: "10" }, { EUR: RATES.EUR })).toMatchObject({ ok: false, field: "rate", reason: /달러/ });
  });

  it("숫자 읽기 — 쉼표 · 띄어쓰기 · 소수", () => {
    expect(parseAmount(" 1,234.5 ")).toBe(1234.5);
    expect(parseAmount("")).toBe("empty");
    expect(parseAmount("1.2.3")).toBeNaN();
    expect(parseAmount("-3")).toBeNaN();
  });
});

describe("💰 돈 든 고양이 표정", () => {
  it("입력 전 보통 · 한도 안 웃음 · 80% 넘으면 걱정 · 넘으면 시무룩", () => {
    expect(catMood(null)).toBe("neutral");
    expect(catMood(calc({ ...base, price: "100" }, RATES))).toBe("happy");
    expect(catMood(calc({ ...base, price: "170" }, RATES))).toBe("worried");
    expect(catMood(calc({ ...base, price: "250" }, RATES))).toBe("sad");
  });
});
