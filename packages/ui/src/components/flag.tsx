// 국기 — 서버에서 SVG 로 그려 HTML 에 넣는다 (브라우저가 국기 묶음을 받지 않음) · 이모지 국기는 Windows 에서 글자로 보여 SVG
// 나라 코드(ISO 3166 · 유럽연합은 EU)만 받음 — 어느 통화가 어느 나라인지는 쓰는 쪽이 정함
import * as Flags from "country-flag-icons/react/3x2";

export function Flag({ country, label, className = "h-4 w-6" }: { country: string | null; label: string; className?: string }) {
  const Svg = country ? (Flags as Record<string, (p: { title?: string; className?: string }) => React.ReactElement>)[country] : undefined;
  if (!Svg) return <span className={`inline-block rounded-sm bg-surface-2 ring-1 ring-line ${className}`} aria-hidden />;
  return <Svg title={label} className={`inline-block rounded-sm ring-1 ring-line ${className}`} />;
}
