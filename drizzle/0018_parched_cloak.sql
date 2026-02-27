ALTER TABLE `tenants` ADD `onboardingToken` varchar(64);--> statement-breakpoint
ALTER TABLE `tenants` ADD `onboardingStatus` enum('pending','submitted','reviewed') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `tenants` ADD `onboardingSubmittedAt` timestamp;--> statement-breakpoint
ALTER TABLE `tenants` ADD `onboardingData` json;--> statement-breakpoint
ALTER TABLE `tenants` ADD CONSTRAINT `tenants_onboardingToken_unique` UNIQUE(`onboardingToken`);