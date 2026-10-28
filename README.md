# 💱 harness-auto-web

**환율 · 물가 오픈 API를 하루 한 번 받아, 여행 · 직구 타이밍을 보여 주는 대시보드**

> 이 사이트는 [harness-template](https://github.com/kyungchan3007/harness-template)을 써서 AI 코딩 에이전트가 이슈부터 PR까지 만듭니다. 만드는 과정은 사이트의 "만드는 중" 페이지에 공개합니다.

## 기능 (첫 버전)
| 기능 | 내용 |
| --- | --- |
| 오늘 환율 · 추이 | 통화별 오늘 값 · 30일 · 1년 흐름 |
| 지금 살 때인가 | 최근 기간 대비 위치 (예측 아님) |
| 직구 계산기 | 외화 금액 → 원화 · 예상 관부가세 |
| 여행지 물가 비교 | 한국 대비 여행지 물가 수준 |
| 만드는 중 | 에이전트 작업 일지 (요청 원문 · 질문 · 실수 · PR) |

## 구조
| 항목 | 값 |
| --- | --- |
| 프레임워크 | Next.js (정적 내보내기) |
| 배포 | Cloudflare Pages |
| 데이터 | 오픈 API 하루 1회 수집 → JSON |
| 규칙 · 구조 | [AGENTS.md](AGENTS.md) · [docs/architecture.md](docs/architecture.md) · [docs/domain/](docs/domain/) |

## 개발
```bash
bash .agents/checks.sh            # 게이트 (완료 = PASS)
npm run spec:new -- 이름          # 새 작업 폴더
npm run test:harness              # 하네스 자체 테스트
```

## 하네스 문제 알리기
- 이 저장소에서 에이전트가 한 실수: 이 저장소 이슈 · 🐞 에이전트 실수 보고
- 하네스 자체 문제는 원본 [harness-template 이슈](https://github.com/kyungchan3007/harness-template/issues)로

MIT License
