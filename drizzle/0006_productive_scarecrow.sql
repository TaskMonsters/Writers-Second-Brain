CREATE TABLE `userPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`authorName` varchar(255),
	`authorAddress` text,
	`authorPhone` varchar(50),
	`authorEmail` varchar(320),
	`authorWebsite` varchar(500),
	`penName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `userPreferences_userId_unique` UNIQUE(`userId`)
);
