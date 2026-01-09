CREATE TABLE `aiUsage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tokensUsed` int DEFAULT 0,
	`month` varchar(7) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiUsage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dailyLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`dayNumber` int NOT NULL,
	`whereILeft` text NOT NULL,
	`nextSteps` text,
	`blockers` text,
	`mood` enum('GREAT','GOOD','NEUTRAL','STRUGGLING','DIFFICULT'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dailyLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `focusCycles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taskId` int,
	`projectId` int,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp,
	`pauseCount` int DEFAULT 0,
	`totalFocusSeconds` int DEFAULT 0,
	`targetSeconds` int,
	`timerType` enum('PROGRESSIVE','COUNTDOWN') DEFAULT 'PROGRESSIVE',
	`completed` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `focusCycles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`briefing` text,
	`briefingProcessed` text,
	`category` enum('PERSONAL','PROFESSIONAL','ACADEMIC') DEFAULT 'PERSONAL',
	`cycleDuration` enum('DAYS_3','DAYS_7','DAYS_14') DEFAULT 'DAYS_3',
	`deliverableA` text,
	`deliverableB` text,
	`deliverableC` text,
	`startDate` timestamp DEFAULT (now()),
	`estimatedEndDate` timestamp,
	`completedAt` timestamp,
	`status` enum('PLANNING','ACTIVE','PAUSED','COMPLETED','ARCHIVED') DEFAULT 'PLANNING',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quickIdeas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`convertedToTask` boolean DEFAULT false,
	`convertedTaskId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quickIdeas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeSubscriptionId` varchar(255) NOT NULL,
	`stripeCustomerId` varchar(255) NOT NULL,
	`stripePriceId` varchar(255),
	`status` enum('ACTIVE','CANCELED','PAST_DUE','TRIALING','INCOMPLETE') DEFAULT 'ACTIVE',
	`tier` enum('FREE','PRO','BUSINESS') DEFAULT 'FREE',
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`cancelAtPeriodEnd` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`titleVerb` varchar(100),
	`description` text,
	`type` enum('ACTION','RETENTION','MAINTENANCE') DEFAULT 'ACTION',
	`dayNumber` int NOT NULL,
	`position` int NOT NULL,
	`effortScore` int DEFAULT 5,
	`impactScore` int DEFAULT 5,
	`completedAt` timestamp,
	`proofUrl` varchar(500),
	`skipReason` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `focusDuration` int DEFAULT 25;--> statement-breakpoint
ALTER TABLE `users` ADD `reducedMotion` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `timerType` enum('PROGRESSIVE','COUNTDOWN') DEFAULT 'PROGRESSIVE';--> statement-breakpoint
ALTER TABLE `users` ADD `taskBlockEnabled` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionTier` enum('FREE','PRO','BUSINESS') DEFAULT 'FREE';--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeSubscriptionId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `consentGiven` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `consentTimestamp` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `consentVersion` varchar(16);