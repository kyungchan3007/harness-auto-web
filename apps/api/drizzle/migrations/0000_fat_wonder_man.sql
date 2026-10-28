CREATE TABLE `fetch_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source` text NOT NULL,
	`started_at` text NOT NULL,
	`finished_at` text,
	`status` text NOT NULL,
	`rows` integer DEFAULT 0 NOT NULL,
	`message` text
);
--> statement-breakpoint
CREATE TABLE `fx_rates` (
	`date` text NOT NULL,
	`currency` text NOT NULL,
	`unit` integer DEFAULT 1 NOT NULL,
	`base_rate` real NOT NULL,
	`ttb` real,
	`tts` real,
	`source` text NOT NULL,
	`fetched_at` text NOT NULL,
	PRIMARY KEY(`date`, `currency`)
);
--> statement-breakpoint
CREATE TABLE `price_levels` (
	`country` text NOT NULL,
	`year` integer NOT NULL,
	`level` real NOT NULL,
	`source` text NOT NULL,
	`fetched_at` text NOT NULL,
	PRIMARY KEY(`country`, `year`)
);
