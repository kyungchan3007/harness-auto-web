/** 큰 숫자 — 오로라 그라데이션은 여기와 큰 제목에만 */
export function BigNumber({ value, unit, label }: { value: string; unit?: string; label?: string }) {
  return (
    <div>
      {label && <p className="text-eyebrow font-semibold text-fg-2">{label}</p>}
      <p className="text-hero font-bold tracking-tighter">
        <span className="text-aurora">{value}</span>
        {unit && <span className="ml-2 text-title font-semibold text-fg">{unit}</span>}
      </p>
    </div>
  );
}
