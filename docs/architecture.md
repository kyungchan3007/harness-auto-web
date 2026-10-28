# 구조 · 경계

> 사람과 에이전트가 같이 읽는 구조 설명. **코드로 확인할 수 있는 경계는 린트로 옮기고 여기엔 이유만 남긴다.**

## 전체 흐름 (하루 1회)
| 단계 | 무엇 | 누가 |
| --- | --- | --- |
| 1. 수집 | 오픈 API → `src/data/*.json` (형식: `src/data/schema.*`) | 스크립트 (CI 예약 실행) (가정) |
| 2. 작업 | 새 데이터로 이슈 → 구현 → 게이트 → PR | 에이전트 한 세션 |
| 3. 승인 | 머지 · 배포 승인 · 비밀값 | 👤 사람 |
| 4. 배포 | `next build` 정적 내보내기 → Cloudflare Pages · PR마다 미리보기 | CI (가정) |

- 방문자는 **읽기 전용** — 서버 · 로그인 · 방문자별 세션 없음 (동시성 · 비용 때문에 확인됨)
- 화면은 빌드 시점의 JSON만 읽는다 → 브라우저에서 외부 API를 직접 부르지 않음 (API 키 노출 방지) (가정)

## 폴더 (가정 — Next.js 세팅 작업에서 확정)
```text
src/
├── app/                 라우트 · 조립 (페이지별 폴더)
├── features/<기능>/     fx · signal · import-calc · travel-price · build-log
├── shared/              공용 UI · 포맷 · 날짜 (features 를 import 하지 않음)
└── data/                수집 결과 JSON + schema (계약 · 보호 파일)
scripts/fetch/           API별 수집 스크립트 (화면 코드를 import 하지 않음)
```

## 경계 규칙 → 강제 위치
| 규칙 | 강제 | 위치 |
| --- | --- | --- |
| 화면은 `src/data/` JSON만 읽고 외부 API를 부르지 않는다 | (예정) eslint no-restricted-imports · fetch 금지 | eslint.config |
| features 끼리 직접 import 하지 않는다 | (예정) eslint no-restricted-imports | eslint.config |
| 수집 결과는 schema 를 통과해야 커밋된다 | (예정) test | scripts/fetch 테스트 |
| API 키는 `.env*` · CI Secrets 에만 | `.gitignore` + 보호 파일 | `.gitignore` · `.agents/protected.txt` |
