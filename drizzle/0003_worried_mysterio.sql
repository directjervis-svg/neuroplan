CREATE TABLE `badgeDefinitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(50) NOT NULL,
	`color` varchar(20) DEFAULT '#22C55E',
	`category` enum('STREAK','TASKS','PROJECTS','FOCUS','IDEAS','SPECIAL') DEFAULT 'TASKS',
	`threshold` int DEFAULT 1,
	`xpReward` int DEFAULT 50,
	`rarity` enum('COMMON','UNCOMMON','RARE','EPIC','LEGENDARY') DEFAULT 'COMMON',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `badgeDefinitions_id` PRIMARY KEY(`id`),
	CONSTRAINT `badgeDefinitions_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `onboardingProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`welcomeViewed` boolean DEFAULT false,
	`profileSetup` boolean DEFAULT false,
	`firstProjectCreated` boolean DEFAULT false,
	`firstTaskCompleted` boolean DEFAULT false,
	`firstFocusSession` boolean DEFAULT false,
	`firstIdeaCaptured` boolean DEFAULT false,
	`tourCompleted` boolean DEFAULT false,
	`currentStep` int DEFAULT 0,
	`totalSteps` int DEFAULT 7,
	`completedAt` timestamp,
	`skippedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `onboardingProgress_id` PRIMARY KEY(`id`),
	CONSTRAINT `onboardingProgress_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `projectTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(50) DEFAULT 'FileText',
	`color` varchar(20) DEFAULT '#22C55E',
	`category` enum('PERSONAL','PROFESSIONAL','ACADEMIC','CONTENT','SOFTWARE','HEALTH') DEFAULT 'PERSONAL',
	`defaultBriefing` text,
	`defaultDeliverableA` text,
	`defaultDeliverableB` text,
	`defaultDeliverableC` text,
	`defaultCycleDuration` enum('DAYS_3','DAYS_7','DAYS_14') DEFAULT 'DAYS_3',
	`defaultTasks` json,
	`usageCount` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`isPremium` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projectTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userBadges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`badgeId` int NOT NULL,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	`notified` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userBadges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userGamification` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalXp` int DEFAULT 0,
	`currentLevel` int DEFAULT 1,
	`xpToNextLevel` int DEFAULT 100,
	`currentStreak` int DEFAULT 0,
	`longestStreak` int DEFAULT 0,
	`lastActiveDate` timestamp,
	`totalTasksCompleted` int DEFAULT 0,
	`totalProjectsCompleted` int DEFAULT 0,
	`totalFocusMinutes` int DEFAULT 0,
	`totalIdeasCaptured` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userGamification_id` PRIMARY KEY(`id`),
	CONSTRAINT `userGamification_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `xpTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`reason` varchar(100) NOT NULL,
	`sourceType` enum('TASK','PROJECT','FOCUS','IDEA','BADGE','STREAK','BONUS') DEFAULT 'TASK',
	`sourceId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `xpTransactions_id` PRIMARY KEY(`id`)
);
