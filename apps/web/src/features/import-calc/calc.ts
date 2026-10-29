// 직구 예상 세금 — 순수 함수 (테스트 있음) · 브라우저 안에서만 계산하고 어디에도 보내지 않음 (IMP-01)
// 기준값은 rules.ts 한 곳 (IMP-03) · 결과는 "예상" (IMP-04) · 틀린 입력은 계산하지 않고 이유 (IMP-05)
import type { PiggyMood } from "@hav/ui/three/piggy";
import { DUTY_FREE_USD, type Route, VAT_RATE } from "./rules";

export type Rate = { baseRate: number; unit: number };

export type CalcInput = {
  currency: string;
  price: string;
  shipping: string;
  /** % · 비우면 관세는 계산하지 않음 */
  dutyRate: string;
  route: Route;
};

export type Tax = { taxableKrw: number; duty: number | null; vat: number | null; total: number | null };

export type CalcResult =
  | { ok: false; field: "price" | "shipping" | "dutyRate" | "rate"; reason: string }
  | {
      ok: true;
      priceKrw: number;
      priceUsd: number;
      limitUsd: number;
      /** 한도까지 남은 달러 (넘으면 0) */
      leftUsd: number;
      over: boolean;
      /** 한도 대비 물건 값 (막대 · 돼지 표정) */
      ratio: number;
      /** 한도 안이면 null (세금 없음) */
      tax: Tax | null;
    };

/** "1,234.5" · " 20 " → 숫자 · 빈 칸은 empty · 숫자가 아니면 NaN */
export function parseAmount(s: string): number | "empty" {
  const t = s.replace(/[,\s]/g, "");
  if (t === "") return "empty";
  return /^\d*\.?\d+$|^\d+\.$/.test(t) ? Number(t) : Number.NaN;
}

const won = (amount: number, r: Rate) => (amount / r.unit) * r.baseRate;

export function calc(input: CalcInput, rates: Record<string, Rate>): CalcResult {
  const price = parseAmount(input.price);
  if (price === "empty") return { ok: false, field: "price", reason: "물건 값을 넣어 주세요" };
  if (Number.isNaN(price)) return { ok: false, field: "price", reason: "물건 값은 0 이상의 숫자만 됩니다" };
  if (price <= 0) return { ok: false, field: "price", reason: "물건 값은 0보다 커야 합니다" };

  const ship = parseAmount(input.shipping);
  if (ship !== "empty" && Number.isNaN(ship)) return { ok: false, field: "shipping", reason: "국제 배송비는 0 이상의 숫자만 됩니다" };
  const shipping = ship === "empty" ? 0 : ship;

  const duty = parseAmount(input.dutyRate);
  if (duty !== "empty" && (Number.isNaN(duty) || duty > 100)) return { ok: false, field: "dutyRate", reason: "관세율은 0 ~ 100 사이 숫자 (%) 입니다" };

  const rate = rates[input.currency];
  const usd = rates.USD;
  // 받지 못한 환율은 지어내지 않음 (FX-02)
  if (!rate) return { ok: false, field: "rate", reason: `${input.currency} 환율을 받지 못해 계산할 수 없습니다` };
  if (!usd) return { ok: false, field: "rate", reason: "달러 환율을 받지 못해 면세 한도와 비교할 수 없습니다" };

  const priceKrw = won(price, rate);
  const priceUsd = priceKrw / usd.baseRate * usd.unit;
  const limitUsd = DUTY_FREE_USD[input.route];
  const over = priceUsd > limitUsd + 1e-9;
  const base = { ok: true as const, priceKrw: Math.round(priceKrw), priceUsd: round2(priceUsd), limitUsd, leftUsd: over ? 0 : round2(limitUsd - priceUsd), over, ratio: priceUsd / limitUsd };
  if (!over) return { ...base, tax: null };

  // 한도를 넘으면 공제 없이 물건 값 + 국제 운임 전체에 과세
  const taxable = won(price + shipping, rate);
  if (duty === "empty") return { ...base, tax: { taxableKrw: Math.round(taxable), duty: null, vat: null, total: null } };
  const dutyKrw = taxable * (duty / 100);
  const vat = (taxable + dutyKrw) * VAT_RATE;
  return { ...base, tax: { taxableKrw: Math.round(taxable), duty: Math.round(dutyKrw), vat: Math.round(vat), total: Math.round(taxable + dutyKrw + vat) } };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** 🐷 표정 — 한도 안 웃음 · 80% 넘으면 걱정 · 넘으면 시무룩 · 입력 전엔 보통 */
export function piggyMood(r: CalcResult | null): PiggyMood {
  if (!r || !r.ok) return "neutral";
  if (r.over) return "sad";
  return r.ratio >= 0.8 ? "worried" : "happy";
}
