CREATE TABLE `notificationPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pushEnabled` boolean DEFAULT true,
	`taskReminders` boolean DEFAULT true,
	`streakWarnings` boolean DEFAULT true,
	`achievementAlerts` boolean DEFAULT true,
	`dailySummary` boolean DEFAULT false,
	`emailEnabled` boolean DEFAULT true,
	`weeklyReport` boolean DEFAULT true,
	`weeklyReportDay` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notificationPreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `pushSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`endpoint` varchar(500) NOT NULL,
	`p256dh` varchar(255) NOT NULL,
	`auth` varchar(255) NOT NULL,
	`active` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pushSubscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weeklyReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`weekStart` timestamp NOT NULL,
	`weekEnd` timestamp NOT NULL,
	`tasksCompleted` int DEFAULT 0,
	`projectsWorkedOn` int DEFAULT 0,
	`totalFocusMinutes` int DEFAULT 0,
	`ideasCaptured` int DEFAULT 0,
	`xpEarned` int DEFAULT 0,
	`actionTasksCompleted` int DEFAULT 0,
	`retentionTasksCompleted` int DEFAULT 0,
	`maintenanceTasksCompleted` int DEFAULT 0,
	`productivityScore` int DEFAULT 0,
	`streakDays` int DEFAULT 0,
	`streakMaintained` boolean DEFAULT true,
	`insights` json,
	`emailSent` boolean DEFAULT false,
	`emailSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weeklyReports_id` PRIMARY KEY(`id`)
);
