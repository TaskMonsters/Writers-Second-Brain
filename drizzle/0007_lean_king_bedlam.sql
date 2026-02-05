CREATE TABLE `outlines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`method` enum('snowflake','beat_mapping','mind_mapping','synopsis') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `outlines_id` PRIMARY KEY(`id`)
);
