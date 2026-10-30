# 계획

## 무엇을 · 왜
- 휴대폰 "홈 화면에 추가" — 웹 앱 설명서(manifest.webmanifest) · 아이콘 PNG 192 · 512 · maskable 512 · iOS apple-icon 180
  - 여행 중 환율 계산기 · 예산을 앱처럼 바로 열게 · 바로 가기: 통화 · 여행 물가 · 직구 계산
  - 아이콘은 지금 icon.svg 를 headless Chrome 으로 그린 PNG (새 그림 없음) · maskable · apple 은 배경을 꽉 채우고 로고 80%
- robots.txt 가 없었음 → 모두 허용 · /design 뺌 · sitemap 위치
- 주소창 색(theme-color) 검정 · iOS 위 막대 이름

## 애매한 곳
- 오프라인 동작(서비스 워커)은 뺌 (가정 · 환율이 하루 지난 값으로 보이면 오해 — FX-02)

## 파일 계획
- apps/web/src/app/manifest.ts
- apps/web/src/app/robots.ts
- apps/web/src/app/layout.tsx
- apps/web/src/app/apple-icon.png
- apps/web/public/icons/**
- apps/web/public/_headers
- .agents/specs/0091-pwa-manifest/**

## 계획 밖 변경 이유

## 완료 기준
- [ ] bash .agents/checks.sh PASS
- [x] 로컬 빌드: out 에 manifest.webmanifest · robots.txt · apple-icon.png · icons/ · index.html 에 manifest · theme-color · apple-touch-icon 링크
- [ ] 운영: manifest 응답 머리글 application/manifest+json

## 허점
- 없음
