ALTER TABLE `tenants` ADD `cnpj` varchar(20);--> statement-breakpoint
ALTER TABLE `tenants` ADD `subscriptionPlan` enum('starter','professional','enterprise') DEFAULT 'starter' NOT NULL;--> statement-breakpoint
ALTER TABLE `tenants` ADD `clientStatus` enum('active','disabled','implementing') DEFAULT 'implementing' NOT NULL;--> statement-breakpoint
ALTER TABLE `tenants` ADD `landingStatus` enum('published','draft','error') DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `tenants` ADD `niche` varchar(100);--> statement-breakpoint
ALTER TABLE `tenants` ADD `city` varchar(100);--> statement-breakpoint
ALTER TABLE `tenants` ADD `state` varchar(2);