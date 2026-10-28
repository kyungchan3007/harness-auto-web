// WCAG 2.x 대비 — 글자 · 배경 색이 읽히는지 숫자로 잰다

/** #rrggbb → 상대 휘도 (0~1) */
export function luminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`#rrggbb 형식이 아닙니다: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** 두 색의 대비 (1~21). 본문 4.5 이상 · 큰 글자 3 이상이 WCAG AA */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** tokens.css 의 `[data-surface="이름"] { --hav-…: #hex; }` 블록을 읽는다 (:root 는 dark 와 같은 블록) */
export function readSurfaces(css: string): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const block of css.matchAll(/((?:[^{}]*\[data-surface="[a-z]+"\][^{}]*))\{([^}]*)\}/g)) {
    const names = [...block[1].matchAll(/data-surface="([a-z]+)"/g)].map((n) => n[1]);
    const vars = Object.fromEntries([...block[2].matchAll(/--hav-([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map((v) => [v[1], v[2]]));
    for (const n of names) out[n] = vars;
  }
  return out;
}
