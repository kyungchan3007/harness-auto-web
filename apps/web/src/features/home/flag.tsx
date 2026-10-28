// 국기 — 서버에서 SVG 로 그려 HTML 에 넣는다 (브라우저가 국기 묶음을 받지 않음) · 이모지 국기는 Windows 에서 글자로 보여 SVG
import * as Flags from "country-flag-icons/react/3x2";
import { currencyFlag, currencyName } from "./currencies";

export function Flag({ currency, className = "h-4 w-6" }: { currency: string; className?: string }) {
  const code = currencyFlag(currency);
  const Svg = code ? (Flags as Record<string, (p: { title?: string; className?: string }) => React.ReactElement>)[code] : undefined;
  if (!Svg) return <span className={`inline-block rounded-sm bg-surface-2 ring-1 ring-line ${className}`} aria-hidden />;
  return <Svg title={`${currencyName(currency)} 국기`} className={`inline-block rounded-sm ring-1 ring-line ${className}`} />;
}
