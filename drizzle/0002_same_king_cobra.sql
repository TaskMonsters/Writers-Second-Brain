CREATE TABLE `characters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`ticketId` int,
	`name` varchar(255) NOT NULL,
	`role` varchar(100),
	`age` varchar(50),
	`occupation` varchar(255),
	`physicalDescription` text,
	`personality` text,
	`backstory` text,
	`goals` text,
	`conflicts` text,
	`relationships` json,
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `characters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`ticketId` int,
	`name` varchar(255) NOT NULL,
	`type` varchar(100),
	`description` text,
	`history` text,
	`culture` text,
	`geography` text,
	`climate` varchar(100),
	`population` varchar(100),
	`government` text,
	`economy` text,
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plotBeats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`ticketId` int,
	`beatName` varchar(255) NOT NULL,
	`description` text,
	`chapter` varchar(100),
	`wordCount` int,
	`position` int NOT NULL DEFAULT 0,
	`completed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `plotBeats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scenes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`ticketId` int,
	`manuscriptId` int,
	`title` varchar(255) NOT NULL,
	`chapter` varchar(100),
	`povCharacterId` int,
	`locationId` int,
	`summary` text,
	`goal` text,
	`conflict` text,
	`outcome` text,
	`position` int NOT NULL DEFAULT 0,
	`wordCount` int DEFAULT 0,
	`completed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scenes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timelineEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`date` varchar(255),
	`description` text,
	`type` varchar(100),
	`position` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `timelineEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `worldElements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`ticketId` int,
	`name` varchar(255) NOT NULL,
	`type` varchar(100),
	`description` text,
	`rules` text,
	`history` text,
	`significance` text,
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `worldElements_id` PRIMARY KEY(`id`)
);
