"use client";

// 환율 계산기 — 원 · 외화 칸 어느 쪽에 써도 반대쪽이 바로 바뀜 (작업 0086)
//   입력은 이 화면 상태에만 (보내지 않음 · 저장하지 않음) · 기준일 · 출처를 같이 (FX-01) · 송금 환율이 있으면 "실제로 바꿀 때" 값도
import { SOURCE_NAME, currencyName } from "@hav/shared/currency";
import type { FxRate } from "@hav/shared/fx";
import { Input } from "@hav/ui/field";
import { useState } from "react";
import { type Side, amountText, convert, convertRemit, parseInput, presets } from "./convert";

export function Converter({ code, rate }: { code: string; rate: FxRate }) {
  const [side, setSide] = useState<Side>("foreign");
  const [text, setText] = useState(String(presets("foreign", rate)[2]));
  const amount = parseInput(text);
  const other: Side = side === "won" ? "foreign" : "won";
  const result = amount == null ? null : convert(amount, side, rate);
  const remit = amount == null ? null : convertRemit(amount, side, rate);
  const label = (s: Side) => (s === "won" ? "원" : code);
  const value = (s: Side) => (s === side ? text : result == null ? "" : amountText(result, s, rate));
  const edit = (s: Side) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSide(s);
    setText(e.target.value);
  };

  return (
    <section aria-labelledby="converter-title" className="rounded-card bg-surface-2 p-5 sm:p-6">
      <h2 id="converter-title" className="text-sm font-semibold text-fg">
        환율 계산기 <span className="font-normal text-fg-2">· 어느 칸에 써도 됩니다</span>
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {(["foreign", "won"] as const).map((s) => (
          <label key={s} className="grid gap-1.5">
            <span className="text-xs text-fg-2">{s === "won" ? "원화" : `${currencyName(code)} ${code}`}</span>
            <div className="relative">
              <Input inputMode="decimal" autoComplete="off" value={value(s)} onChange={edit(s)} onFocus={(e) => e.target.select()} className="pr-14 text-lg font-semibold" aria-describedby="converter-note" />
              <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-fg-2">{label(s)}</span>
            </div>
          </label>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="빠른 금액">
        {(["foreign", "won"] as const).flatMap((s) =>
          presets(s, rate).map((p) => (
            <button
              key={`${s}${p}`}
              type="button"
              onClick={() => {
                setSide(s);
                setText(String(p));
              }}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${side === s && amount === p ? "border-accent text-accent" : "border-line text-fg-2 hover:text-fg"}`}
            >
              {amountText(p, s, rate)} {label(s)}
            </button>
          )),
        )}
      </div>
      <p id="converter-note" className="mt-4 text-xs leading-relaxed text-fg-2" aria-live="polite">
        {text.trim() !== "" && amount == null ? (
          <span className="text-expensive">0 이상의 숫자만 넣어 주세요.</span>
        ) : (
          <>
            매매기준율 · {rate.date} · {SOURCE_NAME[rate.source]}
            {remit != null && result != null && (
              <>
                {" "}
                · 송금으로 바꾸면 약 <span className="font-semibold text-fg">{amountText(remit, other, rate)} {label(other)}</span>
              </>
            )}
            <br />
            실제 환전은 은행 · 환전소 수수료(우대율)에 따라 달라집니다.
          </>
        )}
      </p>
    </section>
  );
}
