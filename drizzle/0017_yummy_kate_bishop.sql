CREATE TABLE `delivery_zones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`zoneName` varchar(100) NOT NULL,
	`feeAmount` decimal(10,2) NOT NULL DEFAULT '0.00',
	`isPickup` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `delivery_zones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_upsells` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`upsellProductId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_upsells_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `items` json;--> statement-breakpoint
ALTER TABLE `orders` ADD `deliveryZoneId` int;--> statement-breakpoint
ALTER TABLE `orders` ADD `deliveryZoneName` varchar(100);--> statement-breakpoint
ALTER TABLE `orders` ADD `deliveryFee` decimal(10,2);--> statement-breakpoint
ALTER TABLE `orders` ADD `status` enum('novo','em_preparacao','saiu_entrega','concluido','cancelado') DEFAULT 'novo' NOT NULL;