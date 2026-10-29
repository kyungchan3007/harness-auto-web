CREATE TABLE `task_snags` (
	`task` text PRIMARY KEY NOT NULL,
	`blocked` integer DEFAULT 0 NOT NULL,
	`failed` integer DEFAULT 0 NOT NULL,
	`since` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
-- 처음 값: 지금 남은 실시간 기록(최근 500줄)으로 채움 — 그 전 기록은 이미 지워져 모름 (작업 0075 · snagOf 와 같은 규칙)
INSERT INTO `task_snags` (`task`, `blocked`, `failed`, `since`, `updated_at`)
SELECT `task`,
  sum(CASE WHEN `kind` = 'blocked' THEN 1 ELSE 0 END),
  sum(CASE WHEN `kind` = 'gate' AND `ok` = 0 THEN 1 ELSE 0 END),
  (SELECT min(`at`) FROM `activity_events`),
  max(`at`)
FROM `activity_events`
WHERE `task` IS NOT NULL AND (`kind` = 'blocked' OR (`kind` = 'gate' AND `ok` = 0))
GROUP BY `task`;
