# 도메인 규칙 (원본)

- 기능(도메인)마다 파일 하나. 형식: [_template.md](_template.md)
- **규칙 원본은 여기 한 곳.** AGENTS.md · 주석 · 테스트는 규칙 ID(`CART-01`)로만 가리킨다 → 두 원본이 생기면 어긋난다
- 맨 아래 **"담당 경로"** 표는 게이트가 작업 범위를 판단할 때 쓴다

## 기능 목록
| 파일 | 페이지 · 기능 | ID |
| --- | --- | --- |
| [fx.md](fx.md) | 오늘 환율 + 추이 그래프 | FX |
| [signal.md](signal.md) | 지금 살 때인가 신호 | SIG |
| [import-calc.md](import-calc.md) | 직구 계산기 | IMP |
| [travel-price.md](travel-price.md) | 여행지 물가 비교 | TRV |
| [build-log.md](build-log.md) | 만드는 중 (작업 과정 공개) | LOG |

- 공통: 대상은 여행 + 직구 (확인됨) · 통화는 API가 주는 전부 (확인됨)
