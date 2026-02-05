CREATE TABLE `chatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `manuscripts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`ticketId` int,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`wordCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `manuscripts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`genre` varchar(100),
	`targetWordCount` int,
	`currentWordCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`position` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('backlog','research','outlining','first-draft','revisions','editing','marketing','done') NOT NULL DEFAULT 'backlog',
	`taskType` enum('chapter','character','worldbuilding','research','editing','marketing','idea') NOT NULL DEFAULT 'idea',
	`dueDate` timestamp,
	`position` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int NOT NULL,
	`date` timestamp NOT NULL,
	`wordsWritten` int NOT NULL DEFAULT 0,
	`timeSpentMinutes` int NOT NULL DEFAULT 0,
	`ticketsCompleted` int NOT NULL DEFAULT 0,
	CONSTRAINT `userProgress_id` PRIMARY KEY(`id`)
);
