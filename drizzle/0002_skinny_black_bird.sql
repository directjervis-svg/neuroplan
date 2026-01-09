ALTER TABLE `users` ADD `subscriptionPlan` enum('FREE','PRO','TEAM') DEFAULT 'FREE';--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` enum('ACTIVE','INACTIVE','CANCELED','PAST_DUE') DEFAULT 'ACTIVE';--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `subscriptionTier`;