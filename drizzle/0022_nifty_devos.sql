CREATE TABLE `upsell_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`subtitle` varchar(255) NOT NULL,
	`isDefault` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `upsell_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `product_upsells` ADD `messageId` int;