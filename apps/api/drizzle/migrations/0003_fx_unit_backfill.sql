-- 작업 0074: 예비 출처(Frankfurter)가 1 단위로 저장한 엔 · 루피아 예전 줄을 수출입은행과 같은 100 단위로 (FX-04)
-- 작업 0072 부터 새로 받는 줄은 이미 100 단위 · 1 단위 값(base_rate / unit)은 그대로 (송금 환율은 예비 출처에 없어 null)
-- 2026-10-29 운영 DB 확인: 엔 2줄 · 루피아 2줄 (2026-04-06 · 2026-09-15)
UPDATE `fx_rates`
SET `base_rate` = round(`base_rate` * 100, 4), `unit` = 100
WHERE `source` = 'frankfurter' AND `unit` = 1 AND `currency` IN ('JPY', 'IDR');
