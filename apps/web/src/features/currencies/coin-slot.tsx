"use client";

// 🪙 동전 자리 — 레이아웃에 있어서 통화를 바꿔도 3D 장면은 그대로 · 기호만 바뀌며 뒤집힘
import { currencyName, currencySymbol } from "@hav/shared/currency";
import type { Signal } from "@hav/shared/signal";
import { signalLabel } from "@hav/ui/signal-badge";
import { usePathname } from "next/navigation";
import { CoinLazy } from "../../shared/three-lazy";
import { codeFromPath } from "./route";

export function CoinSlot({ signals }: { signals: Record<string, Signal | null> }) {
  const code = codeFromPath(usePathname());
  const signal = signals[code] ?? null;
  return (
    <CoinLazy
      symbol={currencySymbol(code)}
      tone={signal}
      label={`${currencyName(code)} 동전${signal ? ` · ${signalLabel(signal)}` : ""}`}
      className="size-32 shrink-0 sm:size-40"
    />
  );
}
