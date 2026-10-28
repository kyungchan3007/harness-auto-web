# 구조 · 경계

> 사람과 에이전트가 같이 읽는 구조 설명. **코드로 확인할 수 있는 경계는 린트로 옮기고 여기엔 이유만 남긴다.**
> 2026-10-28 합의 (작업 0012 · 이슈 #12). 지금 코드는 아직 단일 Next.js 앱 — 모노레포 전환은 별도 이슈

## 결정 요약
| 항목 | 결정 | 상태 |
| --- | --- | --- |
| 저장소 | 모노레포 · Turborepo (`apps/*` · `packages/*`) | 확인됨 |
| 프론트 | `apps/web` Next.js 16 · 정적 내보내기 → Cloudflare Pages · VSA | 확인됨 |
| 백엔드 | `apps/api` Hono → Cloudflare Workers · D1 · Cron Triggers · VSA | 확인됨 |
| 디자인 시스템 | `packages/ui` (토큰 · 컴포넌트) — **내용은 디자인 논의 때** | 자리만 확인됨 |
| 백엔드가 필요한 이유 | 환율 알림 · 즐겨찾기 저장 (사용자 설정 · 매일 확인 · 알림) | 확인됨 |
| 데이터 원본 | **D1** (SQLite) + **Drizzle ORM** — 나중에 Postgres 로 옮길 수 있게 (Drizzle 은 둘 다 지원) | 확인됨 (2026-10-28) |
| 수집 | `apps/api` Worker **Cron** 이 매일 수집 → 형식 검사 → D1 (스크립트 · AI 아님) | 확인됨 |
| 화면이 데이터를 읽는 법 | 빌드할 때 API 에서 받아 정적 페이지로 | 가정 |
| 공개 일지 | git 커밋 · PR · 작업 폴더 (데이터 저장 위치와 무관 · 수집 기록은 운영용) | 확인됨 |
| 로그인 · 알림 수단 | 이메일 매직 링크 · 이메일 알림 | 가정 |
| 패키지 매니저 · 이름 | npm workspaces · `@hav/<이름>` | 가정 |
| 주소 | 사이트 `tripfx.pages.dev` · API `tripfx-api.developfff.workers.dev` — Cloudflare 무료 주소, `saju-me` 는 쓰지 않음 · 도메인은 나중에 사면 연결만 바꿈 | 확인됨 (2026-10-28) |

## 전체 그림
```text
                 ┌──────────── Cloudflare ─────────────┐
방문자 ──▶ Pages: apps/web (정적 HTML)                   │
             │  읽기 전용 화면: 환율 · 신호 · 계산기 · 일지   │
             └──▶ Workers: apps/api (Hono)               │
                    ├─ 로그인 · 알림 설정 · 즐겨찾기 API     │
                    ├─ D1: 사용자 · 알림 조건 · 즐겨찾기     │
                    └─ Cron: 매일 환율 확인 → 알림 발송      │
                 └──────────────────────────────────────┘
```
- 화면은 백엔드 없이도 뜬다 — 백엔드는 로그인이 필요한 기능(알림 · 즐겨찾기)에만 (가정)
- 브라우저는 외부 환율 API를 직접 부르지 않는다 (API 키 노출 · CORS)

## 자동 배포 (2026-10-28 · 작업 0042 · 사용자 확인: "CI할때자동으로 배포될수 있게 해야지")
| 무엇 | 언제 | 어떻게 |
| --- | --- | --- |
| 사이트 (Pages) | main 머지마다 · PR 마다 미리보기 | Cloudflare Pages ↔ GitHub 연결 |
| API (Worker) | main 의 `checks` 가 통과하면 | `.github/workflows/deploy-api.yml` — D1 마이그레이션 → `wrangler deploy` → `/health` 확인 |
| 사이트 다시 빌드 | 평일 03:30 UTC (수집 30분 뒤) | `.github/workflows/rebuild-site.yml` — Pages 배포 훅 |
| 비밀값 | 사람이 GitHub Secrets 에 | `CLOUDFLARE_API_TOKEN` · `CLOUDFLARE_ACCOUNT_ID` · `PAGES_DEPLOY_HOOK` — 없으면 건너뜀 |

## 저장소 구조 (목표)
```text
apps/
├── web/                         @hav/web — Next.js
│   └── src/
│       ├── app/                 라우트 조립만 (기능 로직 없음)
│       └── features/<기능>/     VSA 슬라이스: 화면 · 데이터 읽기 · 테스트
└── api/                         @hav/api — Hono (Workers)
    └── src/
        ├── index.ts             app.route() 로 슬라이스 묶기 + scheduled(Cron)
        └── features/<기능>/     VSA 슬라이스: 라우트(핸들러 직접) · 로직 · D1 쿼리 · 스키마 · 테스트
packages/
├── ui/                          @hav/ui — 디자인 시스템 (토큰 · 컴포넌트)
├── shared/                      @hav/shared — 공용 타입 · zod 스키마
└── config/                      @hav/config — tsconfig · eslint 공용 설정
turbo.json                       작업 그래프 (build · lint · typecheck · test)
```

## 규칙
### Turborepo ([근거](https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository))
| 규칙 | 이유 |
| --- | --- |
| 앱 · 서비스는 `apps/`, 나머지는 `packages/` · 중첩 glob(`apps/**`) 금지 | 공식 권장 구조 |
| 패키지마다 `package.json` · 고유 이름(`@hav/…`) · `exports` 로 진입점 지정 · 전체를 다시 내보내는 barrel 파일 지양 | 패키지 경계를 명확히 |
| 패키지끼리 `../` 상대 경로 import 금지 → 패키지 이름으로 import | 의존성이 lock 파일 · 작업 그래프에 드러나게 |
| 루트 `tsconfig.json` 두지 않음 → 각 패키지가 `@hav/config` 를 상속 | 공식 권장 |
| 루트 `package.json` 은 `private` · 스크립트는 `turbo run …` | 게이트(`checks.sh`)가 루트 스크립트를 그대로 부름 |

### VSA — 프론트 · 백엔드 공통 ([근거](https://www.jimmybogard.com/vertical-slice-architecture/))
| 규칙 | 이유 |
| --- | --- |
| 기능(요청) 하나 = `features/<기능>/` 폴더 하나 — 화면 · 로직 · 데이터 접근 · 테스트를 같이 둠 | 변경이 슬라이스 하나에 머묾 → 이슈 하나 = 폴더 하나 = 에이전트 파일 계획 |
| 슬라이스끼리 직접 import 금지 — 함께 쓰는 것은 `packages/shared` · `packages/ui` 로 | "슬라이스 사이 결합은 줄이고, 슬라이스 안 결합은 키운다" |
| 공용 계층(repository · service)을 미리 만들지 않음 — 슬라이스마다 단순하게 시작, 복잡해지면 그 슬라이스만 나눔 | 원문: 슬라이스마다 방식이 달라도 됨 |

### Hono ([근거](https://hono.dev/docs/guides/best-practices))
| 규칙 | 이유 |
| --- | --- |
| Rails식 컨트롤러 파일을 따로 만들지 않음 — 경로 옆에 핸들러를 바로 씀 (필요하면 `hono/factory` 의 `createHandlers`) | 분리하면 경로 파라미터 타입 추론이 깨짐 |
| 슬라이스마다 `Hono` 인스턴스 → `index.ts` 에서 `app.route('/경로', 슬라이스)` | 공식 권장 큰 앱 구조 |
| 요청 · 응답 모양은 `@hav/shared` zod 스키마 한 곳 · API 는 `validate()` 로 요청 검사 · 실패는 `ApiError` 한 모양 400 | 사용자 확인: "api는 zod 사용하도록 지저분한거 싫으니까" (작업 0033) |
| `apps/web` 은 빌드 때 fetch 로 부르고 **같은 zod 스키마로 응답을 검사** — 실패해도 빌드는 성공 · 화면은 "자료 없음" (Hono RPC `hc` 는 쓰지 않음: 타입만 주고 런타임 검사는 안 해서) | 작업 0035 · 실제 응답에서 원본 오류(짐바브웨 물가 0.0003)를 스키마가 잡음 |
| HTTP 와 예약 실행을 한 Worker 에: `export default { fetch: app.fetch, scheduled }` | [Cloudflare Hono 가이드](https://developers.cloudflare.com/workers/framework-guides/web-apps/more-web-frameworks/hono/index.md) · [Cron 예제](https://developers.cloudflare.com/workers/examples/cron-trigger/) |

## 경계 규칙 → 강제 위치
| 규칙 | 강제 | 위치 |
| --- | --- | --- |
| 슬라이스끼리 import 금지 | (예정) eslint `no-restricted-imports` | `@hav/config` eslint |
| 패키지끼리 `../` import 금지 | (예정) eslint `no-restricted-imports` | `@hav/config` eslint |
| `apps/web` 은 외부 환율 API를 직접 부르지 않음 | (예정) eslint · 테스트 | `@hav/config` eslint |
| API 입력은 zod 검증을 거침 | (예정) 슬라이스 테스트 | `apps/api` 테스트 |
| 비밀값은 `.env*` · Wrangler secret · CI Secrets 에만 | `.gitignore` + 보호 파일 | `.gitignore` · `.agents/protected.txt` |

## 아직 정하지 않은 것
| 항목 | 언제 |
| --- | --- |
| 환율 출처 (수출입은행 + Frankfurter 예비 제안) · 신호 계산 · 직구 범위 | 데이터 논의 (#4) |
| 디자인 토큰 · 컴포넌트 목록 | 디자인 논의 (#3) |
| 로그인 · 알림 방식 · D1 테이블 | 백엔드 이슈 만들 때 |
| Cloudflare 무료 한도 (Cron 개수 등) | 설정할 때 공식 한도 페이지로 확인 (출처마다 숫자가 다름) |
