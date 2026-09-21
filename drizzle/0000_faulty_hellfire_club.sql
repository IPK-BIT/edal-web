CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`gitlab_token` text,
	`rocrate_link` text,
	`user_id` integer,
	`arc_id` integer,
	`submitted_at` integer
);
