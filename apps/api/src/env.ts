// Worker 바인딩 — wrangler.jsonc 와 같은 이름 (비밀값은 여기 이름만, 값은 wrangler secret · 로컬은 .dev.vars)
export type Env = {
  DB: D1Database;
  /** 한국수출입은행 Open API 인증키 — 없으면 Frankfurter 예비로 */
  KOREAEXIM_KEY?: string;
  /** 관리용 수집 API(POST /fx/collect) 토큰 — 없으면 그 경로는 꺼짐 */
  ADMIN_TOKEN?: string;
};
