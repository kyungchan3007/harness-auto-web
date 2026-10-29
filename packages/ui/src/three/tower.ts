// 🧱 블록 탑 배치 — 순수 계산 (테스트 있음) · 젠가처럼 한 층에 3개 · 층마다 방향을 엇갈림
// 블록 하나 = 쓰는 쪽이 정한 한 가지 (만드는 중: 머지된 PR 하나) · 아래가 먼저 · 맨 위가 최신

export const BLOCK = { long: 1.5, short: 0.48, tall: 0.3, gap: 0.03 } as const;
export const PER_LAYER = 3;

export type BlockSpot = {
  /** 블록 중심 */
  position: [number, number, number];
  /** 긴 쪽이 x 면 0 · z 면 π/2 */
  rotationY: number;
  /** 0(맨 아래) ~ 1(맨 위) — 색을 높이로 섞을 때 */
  t: number;
};

/** 젠가처럼 긴 쪽으로 빼낸 자리 — 표시한 블록(만드는 중: 막힌 작업)이 위쪽 핑크와 섞여 안 보여서 (작업 0075) */
export const PULL = 0.28;
export function pulled(s: BlockSpot, by = PULL): [number, number, number] {
  const [x, y, z] = s.position;
  return s.rotationY === 0 ? [x + by, y, z] : [x, y, z + by];
}

/** count 개를 아래에서 위로 · 탑 전체 높이도 같이 (카메라 맞춤용) */
export function towerLayout(count: number): { spots: BlockSpot[]; height: number } {
  const n = Math.max(0, Math.floor(count));
  const pitch = BLOCK.short + BLOCK.gap;
  const spots = Array.from({ length: n }, (_, i): BlockSpot => {
    const layer = Math.floor(i / PER_LAYER);
    const slot = (i % PER_LAYER) - 1; // -1 · 0 · 1
    const y = layer * (BLOCK.tall + BLOCK.gap) + BLOCK.tall / 2;
    const along = layer % 2 === 0;
    return {
      position: along ? [0, y, slot * pitch] : [slot * pitch, y, 0],
      rotationY: along ? 0 : Math.PI / 2,
      t: n > 1 ? i / (n - 1) : 1,
    };
  });
  const layers = Math.ceil(n / PER_LAYER);
  return { spots, height: layers > 0 ? layers * (BLOCK.tall + BLOCK.gap) - BLOCK.gap : 0 };
}
