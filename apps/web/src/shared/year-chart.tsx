// 1년 흐름 — SVG 선 하나 · 최저 · 최고 · 오늘 점 (3D 리본은 나중) · 그래프 밑에 같은 숫자를 글자로 (색 · 그림만으로 전하지 않음)
import { chartOf } from "./chart";

const W = 600;
const H = 160;

export function YearChart({ rates, unitText }: { rates: { date: string; baseRate: number }[]; unitText: string }) {
  const c = chartOf(rates, W, H, 10);
  if (!c) return <p className="rounded-card border border-line p-6 text-sm text-fg-2">1년 흐름을 그릴 기록이 모자랍니다</p>;
  const label = `1년 흐름 — 최저 ${c.min.date} ${fmt(c.min.value)} · 최고 ${c.max.date} ${fmt(c.max.value)} · 마지막 ${c.last.date} ${fmt(c.last.value)} ${unitText}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="h-auto w-full overflow-visible">
      <path d={c.path} fill="none" stroke="var(--hav-accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <Point dot={c.max} tone="var(--hav-expensive)" text={`최고 ${fmt(c.max.value)}`} above />
      <Point dot={c.min} tone="var(--hav-cheap)" text={`최저 ${fmt(c.min.value)}`} />
      <circle cx={c.last.x} cy={c.last.y} r={5} fill="var(--hav-accent)" stroke="var(--hav-surface-2)" strokeWidth={2} />
    </svg>
  );
}

function Point({ dot, tone, text, above = false }: { dot: { x: number; y: number }; tone: string; text: string; above?: boolean }) {
  const anchor = dot.x < 80 ? "start" : dot.x > W - 80 ? "end" : "middle";
  return (
    <g>
      <circle cx={dot.x} cy={dot.y} r={4} fill={tone} />
      <text x={dot.x} y={above ? dot.y - 10 : dot.y + 20} textAnchor={anchor} fontSize={13} fontWeight={600} fill={tone}>
        {text}
      </text>
    </g>
  );
}

const fmt = (n: number) => n.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
