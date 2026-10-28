CREATE TABLE `github_items` (
	`number` integer PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`task` text,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`merged_at` text,
	`synced_at` text NOT NULL
);
