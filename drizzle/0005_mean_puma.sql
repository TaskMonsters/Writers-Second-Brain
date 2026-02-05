CREATE TABLE `manuscriptAnalyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`manuscriptId` int NOT NULL,
	`userId` int NOT NULL,
	`overallAssessment` text NOT NULL,
	`structuralAnalysis` text NOT NULL,
	`characterDevelopment` text NOT NULL,
	`dialogueQuality` text NOT NULL,
	`proseAndStyle` text NOT NULL,
	`priorityActionItems` text NOT NULL,
	`overallScore` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `manuscriptAnalyses_id` PRIMARY KEY(`id`)
);
