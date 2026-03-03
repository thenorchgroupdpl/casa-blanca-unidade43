ALTER TABLE `store_settings` ADD `webhookUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `store_settings` ADD `webhookEnabled` boolean DEFAULT false NOT NULL;