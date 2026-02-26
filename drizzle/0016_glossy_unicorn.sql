CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('billing','system','info','warning') NOT NULL DEFAULT 'info',
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `tenants` ADD `nextBillingDate` timestamp;--> statement-breakpoint
ALTER TABLE `tenants` ADD `billingAmount` decimal(10,2) DEFAULT '150.00';--> statement-breakpoint
ALTER TABLE `tenants` ADD `subscriptionStatus` enum('active','warning','overdue','suspended') DEFAULT 'active';