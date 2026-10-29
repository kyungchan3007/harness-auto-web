// 이 사이트의 주소 · 이름 — 공유 미리보기(og) · sitemap 이 같이 씀
export const SITE_URL = "https://tripfx.pages.dev";
export const SITE_NAME = "Tripfx";
export const SITE_DESCRIPTION = "환율 · 물가를 매일 받아 여행 · 직구 타이밍을 보여 주는 대시보드";

/** 검색에 내보낼 페이지 — 개발용 /design 은 뺌 · 통화 상세는 sitemap 이 API 에서 더함 */
export const PUBLIC_PAGES = ["/", "/currencies", "/prices", "/calc", "/log"] as const;
