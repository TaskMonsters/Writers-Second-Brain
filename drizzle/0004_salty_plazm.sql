CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` enum('word_count','chapters','tickets','streak','novel_kit','special') NOT NULL,
	`threshold` int NOT NULL,
	`icon` varchar(50) DEFAULT 'trophy',
	`color` varchar(7) DEFAULT '#8b5cf6',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userAchievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`achievementId` int NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	`progress` int DEFAULT 0,
	`notificationSent` boolean DEFAULT false,
	CONSTRAINT `userAchievements_id` PRIMARY KEY(`id`)
);
