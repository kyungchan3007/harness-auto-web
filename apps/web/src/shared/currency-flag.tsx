// 통화 → 국기 — 홈 · 통화 둘러보기 · 직구 계산기가 같이 씀 (국기 모양은 디자인 시스템 · 어느 나라인지는 @hav/shared/currency)
import { currencyFlag, currencyName } from "@hav/shared/currency";
import { Flag } from "@hav/ui/flag";

export function CurrencyFlag({ currency, className }: { currency: string; className?: string }) {
  return <Flag country={currencyFlag(currency)} label={`${currencyName(currency)} 국기`} className={className} />;
}
