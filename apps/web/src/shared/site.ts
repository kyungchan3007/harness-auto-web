// 이 사이트의 주소 · 이름 — 공유 미리보기(og) · sitemap 이 같이 씀
export const SITE_URL = "https://tripfx.pages.dev";
export const SITE_NAME = "Tripfx";
/** 저장소 주소 — 서버 · 브라우저 둘 다 씀 ("use client" 파일에서 내보낸 값은 서버에서 함수 껍데기가 돼 링크가 깨졌음 · 작업 0092) */
export const REPO_URL = "https://github.com/kyungchan3007/harness-auto-web";
export const SITE_DESCRIPTION = "환율 · 물가를 매일 받아 여행 · 직구 타이밍을 보여 주는 대시보드";

/** 검색에 내보낼 페이지 — 개발용 /design 은 뺌 · 통화 상세는 sitemap 이 API 에서 더함 */
export const PUBLIC_PAGES = ["/", "/currencies", "/prices", "/calc", "/log"] as const;
