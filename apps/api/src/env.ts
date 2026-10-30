// Worker 바인딩 — wrangler.jsonc 와 같은 이름 (비밀값은 여기 이름만, 값은 wrangler secret · 로컬은 .dev.vars)
export type Env = {
  DB: D1Database;
  /** 한국수출입은행 Open API 인증키 — 없으면 Frankfurter 예비로 */
  KOREAEXIM_KEY?: string;
  /** 관리용 수집 API(POST /fx/collect) 토큰 — 없으면 그 경로는 꺼짐 */
  ADMIN_TOKEN?: string;
  /** 실시간 작업 기록(POST /activity) 토큰 — 에이전트 훅만 씀 · 없으면 그 경로는 꺼짐 */
  ACTIVITY_TOKEN?: string;
  /** 배포 버전 — 읽기 캐시 키에 넣어 새 코드를 배포하면 예전 응답을 안 씀 (wrangler.jsonc version_metadata · 작업 0083) · 테스트에는 없음 */
  CF_VERSION_METADATA?: WorkerVersionMetadata;
  /** Cloudflare Pages 배포 훅 주소 — 새 환율을 저장하면 사이트를 바로 다시 빌드 (비밀값 · deploy-api 가 GitHub Secrets 에서 넣음 · 작업 0094) · 없으면 안 함 */
  PAGES_DEPLOY_HOOK?: string;
};
