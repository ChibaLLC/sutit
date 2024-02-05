-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `forms` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`user_id` int(11) unsigned NOT NULL,
	`form_name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT 'current_timestamp()',
	`updated_at` timestamp NOT NULL DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `form_fields` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`form_id` int(11) unsigned NOT NULL,
	`field_name` varchar(255) NOT NULL,
	`field_type` varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `responses` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`form_id` int(11) unsigned NOT NULL,
	`user_id` int(11) unsigned NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT 'current_timestamp()',
	`updated_at` timestamp NOT NULL DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `response_data` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`response_id` int(11) unsigned NOT NULL,
	`form_field_id` int(11) unsigned NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`user_id` int(11) unsigned NOT NULL,
	`token` varchar(255) NOT NULL,
	`is_valid` tinyint NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT 'current_timestamp()',
	`updated_at` timestamp NOT NULL DEFAULT 'current_timestamp()',
	CONSTRAINT `token` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`salt` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT 'current_timestamp()',
	`updated_at` timestamp NOT NULL DEFAULT 'current_timestamp()',
	CONSTRAINT `email` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `user_id` ON `forms` (`user_id`);--> statement-breakpoint
CREATE INDEX `form_id` ON `form_fields` (`form_id`);--> statement-breakpoint
CREATE INDEX `form_id` ON `responses` (`form_id`);--> statement-breakpoint
CREATE INDEX `user_id` ON `responses` (`user_id`);--> statement-breakpoint
CREATE INDEX `response_id` ON `response_data` (`response_id`);--> statement-breakpoint
CREATE INDEX `form_field_id` ON `response_data` (`form_field_id`);--> statement-breakpoint
CREATE INDEX `user_id` ON `sessions` (`user_id`);--> statement-breakpoint
ALTER TABLE `forms` ADD CONSTRAINT `forms_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `form_fields` ADD CONSTRAINT `form_fields_ibfk_1` FOREIGN KEY (`form_id`) REFERENCES `forms`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `responses` ADD CONSTRAINT `responses_ibfk_1` FOREIGN KEY (`form_id`) REFERENCES `forms`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `responses` ADD CONSTRAINT `responses_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `response_data` ADD CONSTRAINT `response_data_ibfk_1` FOREIGN KEY (`response_id`) REFERENCES `responses`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `response_data` ADD CONSTRAINT `response_data_ibfk_2` FOREIGN KEY (`form_field_id`) REFERENCES `form_fields`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;
*/