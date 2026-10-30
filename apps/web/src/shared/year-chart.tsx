// 1년 흐름 — SVG 선 하나 · 최저 · 최고 · 오늘 점 (3D 리본은 나중) · 그래프 밑에 같은 숫자를 글자로 (색 · 그림만으로 전하지 않음)
//   최고 · 최저 글자는 SVG 밖 HTML 로 얹음 — SVG 안 글자는 그래프와 같이 줄어 휴대폰에서 6px 쯤으로 작아졌음 (작업 0109)
//   위아래 py-6 = 글자 자리 · 없으면 "최고" 글자가 위 기간 단추에 붙었음 (작업 0108)
import { chartOf } from "./chart";

const W = 600;
const H = 160;

export function YearChart({ rates, unitText, title = "1년 흐름" }: { rates: { date: string; baseRate: number }[]; unitText: string; title?: string }) {
  const c = chartOf(rates, W, H, 10);
  if (!c) return <p className="rounded-card border border-line p-6 text-sm text-fg-2">{title}을 그릴 기록이 모자랍니다</p>;
  const label = `${title} — 최저 ${c.min.date} ${fmt(c.min.value)} · 최고 ${c.max.date} ${fmt(c.max.value)} · 마지막 ${c.last.date} ${fmt(c.last.value)} ${unitText}`;
  return (
    <div className="py-6">
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="block h-auto w-full overflow-visible">
          <path d={c.path} fill="none" stroke="var(--hav-accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <circle cx={c.max.x} cy={c.max.y} r={4} fill="var(--hav-expensive)" />
          <circle cx={c.min.x} cy={c.min.y} r={4} fill="var(--hav-cheap)" />
          <circle cx={c.last.x} cy={c.last.y} r={5} fill="var(--hav-accent)" stroke="var(--hav-surface-2)" strokeWidth={2} />
        </svg>
        <Label dot={c.max} className="text-expensive" text={`최고 ${fmt(c.max.value)}`} above />
        <Label dot={c.min} className="text-cheap" text={`최저 ${fmt(c.min.value)}`} />
      </div>
    </div>
  );
}

/** 점 위치(SVG 좌표)를 % 로 바꿔 글자를 얹음 · 양 끝 점은 글자가 칸 밖으로 안 나가게 한쪽으로 붙임 */
function Label({ dot, className, text, above = false }: { dot: { x: number; y: number }; className: string; text: string; above?: boolean }) {
  const shiftX = dot.x < 80 ? "0%" : dot.x > W - 80 ? "-100%" : "-50%";
  const shiftY = above ? "calc(-100% - 8px)" : "8px";
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute text-xs font-semibold whitespace-nowrap sm:text-[13px] ${className}`}
      style={{ left: `${(dot.x / W) * 100}%`, top: `${(dot.y / H) * 100}%`, transform: `translate(${shiftX}, ${shiftY})` }}
    >
      {text}
    </span>
  );
}

const fmt = (n: number) => n.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
