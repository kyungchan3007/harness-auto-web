// 주소 → 통화 코드 — /currencies 는 달러 · /currencies/JPY 는 엔 (목록 · 동전이 같이 씀) · 로컬 정적 서버는 .html 이 붙음
export const DEFAULT_CODE = "USD";

export function codeFromPath(pathname: string | null): string {
  const m = pathname?.match(/^\/currencies\/([A-Za-z]{3})(?:\.html)?\/?$/);
  return m ? m[1].toUpperCase() : DEFAULT_CODE;
}
