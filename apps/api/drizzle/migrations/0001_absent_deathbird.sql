CREATE TABLE `activity_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`at` text NOT NULL,
	`kind` text NOT NULL,
	`label` text NOT NULL,
	`file` text,
	`ok` integer,
	`task` text
);
