CREATE TABLE `aiInteractionLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`cycleId` int,
	`actionType` enum('PLANNER_BARKLEY','TASK_ASSISTANT','BRIEFING_PROCESS','FIVE_WHYS','METACOGNITION','REFINE_TASK','GENERATE_STEPS') NOT NULL,
	`inputPrompt` text,
	`outputResponse` text,
	`tokensInput` int,
	`tokensOutput` int,
	`latencyMs` int,
	`success` boolean DEFAULT true,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiInteractionLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cycleTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cycleId` int NOT NULL,
	`projectId` int NOT NULL,
	`dayNumber` int NOT NULL,
	`priority` enum('A','B','C') NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`estimatedMinutes` int DEFAULT 30,
	`checklist` json,
	`status` enum('PENDING','IN_PROGRESS','COMPLETED','SKIPPED') DEFAULT 'PENDING',
	`completedAt` timestamp,
	`skipReason` text,
	`actualMinutes` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cycleTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectContext` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`summaryBullets` json,
	`problem` text,
	`solution` text,
	`uniqueValue` text,
	`targetAudience` text,
	`successCriteria` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projectContext_id` PRIMARY KEY(`id`),
	CONSTRAINT `projectContext_projectId_unique` UNIQUE(`projectId`)
);
--> statement-breakpoint
CREATE TABLE `projectCycles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`cycleNumber` int NOT NULL,
	`day1Date` timestamp NOT NULL,
	`day2Date` timestamp,
	`day3Date` timestamp,
	`status` enum('PLANNING','DAY_1','DAY_2','DAY_3','COMPLETED','ABANDONED') DEFAULT 'PLANNING',
	`currentDay` int DEFAULT 1,
	`whatWorked` text,
	`whatDidntWork` text,
	`whatToChange` text,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projectCycles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whereILeftOff` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cycleId` int NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`dayNumber` int NOT NULL,
	`content` text NOT NULL,
	`nextAction` text,
	`blockers` text,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whereILeftOff_id` PRIMARY KEY(`id`)
);
