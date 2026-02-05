import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Novel projects table - each user can have multiple novel projects
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  genre: varchar("genre", { length: 100 }),
  targetWordCount: int("targetWordCount"),
  currentWordCount: int("currentWordCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Ticket system for managing novel writing workflow
 */
export const tickets = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", [
    "backlog",
    "research",
    "outlining",
    "first-draft",
    "revisions",
    "editing",
    "marketing",
    "done"
  ]).default("backlog").notNull(),
  taskType: mysqlEnum("taskType", [
    "chapter",
    "character",
    "worldbuilding",
    "research",
    "editing",
    "marketing",
    "idea"
  ]).default("idea").notNull(),
  dueDate: timestamp("dueDate"),
  position: int("position").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

/**
 * Sub-tasks for tickets
 */
export const subTasks = mysqlTable("subTasks", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  completed: boolean("completed").default(false).notNull(),
  position: int("position").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SubTask = typeof subTasks.$inferSelect;
export type InsertSubTask = typeof subTasks.$inferInsert;

/**
 * Comments on tickets
 */
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

/**
 * Writing content stored in the Sanctuary editor
 */
export const manuscripts = mysqlTable("manuscripts", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  ticketId: int("ticketId"),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  wordCount: int("wordCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Manuscript = typeof manuscripts.$inferSelect;
export type InsertManuscript = typeof manuscripts.$inferInsert;

/**
 * Manuscript analyses by AI editor
 */
export const manuscriptAnalyses = mysqlTable("manuscriptAnalyses", {
  id: int("id").autoincrement().primaryKey(),
  manuscriptId: int("manuscriptId").notNull(),
  userId: int("userId").notNull(),
  overallAssessment: text("overallAssessment").notNull(),
  structuralAnalysis: text("structuralAnalysis").notNull(),
  characterDevelopment: text("characterDevelopment").notNull(),
  dialogueQuality: text("dialogueQuality").notNull(),
  proseAndStyle: text("proseAndStyle").notNull(),
  priorityActionItems: text("priorityActionItems").notNull(), // JSON array
  overallScore: int("overallScore").notNull(), // 1-10
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ManuscriptAnalysis = typeof manuscriptAnalyses.$inferSelect;
export type InsertManuscriptAnalysis = typeof manuscriptAnalyses.$inferInsert;

/**
 * Chat history with The Muse AI assistant
 */
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * User progress tracking for motivation and analytics
 */
export const userProgress = mysqlTable("userProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId").notNull(),
  date: timestamp("date").notNull(),
  wordsWritten: int("wordsWritten").default(0).notNull(),
  timeSpentMinutes: int("timeSpentMinutes").default(0).notNull(),
  ticketsCompleted: int("ticketsCompleted").default(0).notNull(),
});

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

/**
 * Novel Kit - Character profiles
 */
export const characters = mysqlTable("characters", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  ticketId: int("ticketId"), // Link to related ticket
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }), // protagonist, antagonist, supporting, etc.
  genre: varchar("genre", { length: 100 }),
  age: varchar("age", { length: 50 }),
  gender: varchar("gender", { length: 100 }),
  occupation: varchar("occupation", { length: 255 }),
  imageUrl: text("imageUrl"),
  physicalDescription: text("physicalDescription"),
  personality: text("personality"),
  traits: json("traits"), // Array of trait strings
  background: text("background"), // renamed from backstory for consistency
  motivations: text("motivations"), // renamed from goals
  fears: text("fears"),
  strengths: text("strengths"),
  weaknesses: text("weaknesses"),
  conflicts: text("conflicts"),
  relationships: json("relationships"), // Array of {characterId, relationship}
  interview: json("interview"), // Interview Q&A organized by category
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = typeof characters.$inferInsert;

/**
 * Novel Kit - Worldbuilding locations
 */
export const locations = mysqlTable("locations", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  ticketId: int("ticketId"),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }), // city, region, building, etc.
  description: text("description"),
  history: text("history"),
  culture: text("culture"),
  geography: text("geography"),
  climate: varchar("climate", { length: 100 }),
  population: varchar("population", { length: 100 }),
  government: text("government"),
  economy: text("economy"),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;

/**
 * Novel Kit - Plot beats and structure
 */
export const plotBeats = mysqlTable("plotBeats", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  ticketId: int("ticketId"),
  beatName: varchar("beatName", { length: 255 }).notNull(), // Opening Image, Catalyst, Midpoint, etc.
  description: text("description"),
  chapter: varchar("chapter", { length: 100 }),
  wordCount: int("wordCount"),
  position: int("position").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlotBeat = typeof plotBeats.$inferSelect;
export type InsertPlotBeat = typeof plotBeats.$inferInsert;

/**
 * Novel Kit - Scenes
 */
export const scenes = mysqlTable("scenes", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  ticketId: int("ticketId"),
  manuscriptId: int("manuscriptId"),
  title: varchar("title", { length: 255 }).notNull(),
  chapter: varchar("chapter", { length: 100 }),
  povCharacterId: int("povCharacterId"), // Point of view character
  locationId: int("locationId"),
  summary: text("summary"),
  goal: text("goal"),
  conflict: text("conflict"),
  outcome: text("outcome"),
  position: int("position").default(0).notNull(),
  wordCount: int("wordCount").default(0),
  completed: boolean("completed").default(false).notNull(),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Scene = typeof scenes.$inferSelect;
export type InsertScene = typeof scenes.$inferInsert;

/**
 * Novel Kit - Magic systems, technologies, or special elements
 */
export const worldElements = mysqlTable("worldElements", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  ticketId: int("ticketId"),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }), // magic, technology, creature, organization, etc.
  description: text("description"),
  rules: text("rules"), // How it works, limitations
  history: text("history"),
  significance: text("significance"), // Role in the story
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorldElement = typeof worldElements.$inferSelect;
export type InsertWorldElement = typeof worldElements.$inferInsert;

/**
 * Novel Kit - Timeline events
 */
export const timelineEvents = mysqlTable("timelineEvents", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  date: varchar("date", { length: 255 }), // Flexible format for fictional dates
  description: text("description"),
  type: varchar("type", { length: 100 }), // historical, story, character
  position: int("position").default(0).notNull(),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type InsertTimelineEvent = typeof timelineEvents.$inferInsert;

/**
 * Custom ticket sections - allow users to create their own workflow columns
 */
export const customSections = mysqlTable("customSections", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  position: int("position").default(0).notNull(),
  color: varchar("color", { length: 7 }).default("#8b5cf6"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomSection = typeof customSections.$inferSelect;
export type InsertCustomSection = typeof customSections.$inferInsert;

/**
 * Ticket tags - link tickets to Novel Kit items (characters, locations, scenes, etc.)
 */
export const ticketTags = mysqlTable("ticketTags", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  tagType: mysqlEnum("tagType", [
    "character",
    "location",
    "scene",
    "plot",
    "worldbuilding",
    "research",
    "custom"
  ]).notNull(),
  tagId: int("tagId"), // References the Novel Kit item ID
  tagName: varchar("tagName", { length: 255 }).notNull(), // Display name
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TicketTag = typeof ticketTags.$inferSelect;
export type InsertTicketTag = typeof ticketTags.$inferInsert;

/**
 * Achievements - predefined milestones users can unlock
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", [
    "word_count",
    "chapters",
    "tickets",
    "streak",
    "novel_kit",
    "special"
  ]).notNull(),
  threshold: int("threshold").notNull(), // The target number to reach
  icon: varchar("icon", { length: 50 }).default("trophy"),
  color: varchar("color", { length: 7 }).default("#8b5cf6"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * User Achievements - tracks which achievements users have unlocked
 */
export const userAchievements = mysqlTable("userAchievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"), // Optional - some achievements are project-specific
  achievementId: int("achievementId").notNull(),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
  progress: int("progress").default(0), // Current progress towards the achievement
  notificationSent: boolean("notificationSent").default(false),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;


/**
 * User Preferences - stores user settings including manuscript format preferences
 */
export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  // Standard Manuscript Format cover page info
  authorName: varchar("authorName", { length: 255 }),
  authorAddress: text("authorAddress"),
  authorPhone: varchar("authorPhone", { length: 50 }),
  authorEmail: varchar("authorEmail", { length: 320 }),
  authorWebsite: varchar("authorWebsite", { length: 500 }),
  penName: varchar("penName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * Novel outlines table - stores different outlining methods for projects
 */
export const outlines = mysqlTable("outlines", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  method: mysqlEnum("method", ["snowflake", "beat_mapping", "mind_mapping", "synopsis"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(), // JSON string storing method-specific data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Outline = typeof outlines.$inferSelect;
export type InsertOutline = typeof outlines.$inferInsert;
