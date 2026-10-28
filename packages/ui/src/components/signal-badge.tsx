// 신호 배지 — 색만으로 전하지 않고 항상 글자를 같이 (docs/design.md 성능 · 접근성)

export type Signal = "cheap" | "normal" | "expensive";

const LABEL: Record<Signal, string> = { cheap: "싼 편", normal: "보통", expensive: "비싼 편" };
const TONE: Record<Signal, string> = {
  cheap: "text-cheap border-cheap",
  normal: "text-normal border-normal",
  expensive: "text-expensive border-expensive",
};

export function signalLabel(signal: Signal): string {
  return LABEL[signal];
}

export function SignalBadge({ signal }: { signal: Signal }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 text-sm font-semibold ${TONE[signal]}`}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {signalLabel(signal)}
    </span>
  );
}
