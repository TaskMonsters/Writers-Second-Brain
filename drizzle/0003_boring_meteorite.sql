CREATE TABLE `customSections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(100) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`color` varchar(7) DEFAULT '#8b5cf6',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customSections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ticketTags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`tagType` enum('character','location','scene','plot','worldbuilding','research','custom') NOT NULL,
	`tagId` int,
	`tagName` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticketTags_id` PRIMARY KEY(`id`)
);
