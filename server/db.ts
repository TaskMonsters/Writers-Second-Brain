import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  projects, InsertProject,
  tickets, InsertTicket,
  subTasks, InsertSubTask,
  comments, InsertComment,
  manuscripts, InsertManuscript,
  manuscriptAnalyses, InsertManuscriptAnalysis,
  chatMessages, InsertChatMessage,
  userProgress, InsertUserProgress,
  ticketTags, InsertTicketTag,
  customSections, InsertCustomSection,
  achievements, InsertAchievement,
  userAchievements, InsertUserAchievement,
  userPreferences, InsertUserPreference,
  outlines, InsertOutline
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Project queries
export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt));
}

export async function getProjectById(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(
    and(eq(projects.id, projectId), eq(projects.userId, userId))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProject(project: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(projects).values(project).$returningId();
  return result.id;
}

export async function updateProject(projectId: number, userId: number, updates: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projects).set(updates).where(
    and(eq(projects.id, projectId), eq(projects.userId, userId))
  );
}

// Ticket queries
export async function getProjectTickets(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  const ticketList = await db.select().from(tickets).where(
    and(eq(tickets.projectId, projectId), eq(tickets.userId, userId))
  ).orderBy(tickets.position);
  
  // Fetch tags for all tickets
  const ticketsWithTags = await Promise.all(
    ticketList.map(async (ticket) => {
      const tags = await db.select().from(ticketTags).where(eq(ticketTags.ticketId, ticket.id));
      return { ...ticket, tags };
    })
  );
  
  return ticketsWithTags;
}

export async function getTicketById(ticketId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tickets).where(
    and(eq(tickets.id, ticketId), eq(tickets.userId, userId))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createTicket(ticket: InsertTicket) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tickets).values(ticket).$returningId();
  return result[0].id;
}

export async function updateTicket(ticketId: number, userId: number, updates: Partial<InsertTicket>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tickets).set(updates).where(
    and(eq(tickets.id, ticketId), eq(tickets.userId, userId))
  );
}

export async function deleteTicket(ticketId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tickets).where(
    and(eq(tickets.id, ticketId), eq(tickets.userId, userId))
  );
}

// SubTask queries
export async function getTicketSubTasks(ticketId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(subTasks).where(eq(subTasks.ticketId, ticketId)).orderBy(subTasks.position);
}

export async function createSubTask(subTask: InsertSubTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.insert(subTasks).values(subTask);
  return Number(result.insertId);
}

export async function updateSubTask(subTaskId: number, updates: Partial<InsertSubTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(subTasks).set(updates).where(eq(subTasks.id, subTaskId));
}

export async function deleteSubTask(subTaskId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(subTasks).where(eq(subTasks.id, subTaskId));
}

// Comment queries
export async function getTicketComments(ticketId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(comments).where(eq(comments.ticketId, ticketId)).orderBy(desc(comments.createdAt));
}

export async function createComment(comment: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.insert(comments).values(comment);
  return Number(result.insertId);
}

// Manuscript queries
export async function getProjectManuscripts(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(manuscripts).where(
    and(eq(manuscripts.projectId, projectId), eq(manuscripts.userId, userId))
  ).orderBy(desc(manuscripts.updatedAt));
}

export async function getManuscriptById(manuscriptId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(manuscripts).where(
    and(eq(manuscripts.id, manuscriptId), eq(manuscripts.userId, userId))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createManuscript(manuscript: InsertManuscript) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(manuscripts).values(manuscript).$returningId();
  return result[0].id;
}

export async function updateManuscript(manuscriptId: number, userId: number, updates: Partial<InsertManuscript>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(manuscripts).set(updates).where(
    and(eq(manuscripts.id, manuscriptId), eq(manuscripts.userId, userId))
  );
}

export async function deleteManuscript(manuscriptId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(manuscripts).where(
    and(eq(manuscripts.id, manuscriptId), eq(manuscripts.userId, userId))
  );
}

// Manuscript analysis queries
export async function createManuscriptAnalysis(analysis: InsertManuscriptAnalysis) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(manuscriptAnalyses).values(analysis).$returningId();
  return result[0].id;
}

export async function getManuscriptAnalyses(manuscriptId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(manuscriptAnalyses).where(
    and(eq(manuscriptAnalyses.manuscriptId, manuscriptId), eq(manuscriptAnalyses.userId, userId))
  ).orderBy(desc(manuscriptAnalyses.createdAt));
}

export async function getLatestManuscriptAnalysis(manuscriptId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(manuscriptAnalyses).where(
    and(eq(manuscriptAnalyses.manuscriptId, manuscriptId), eq(manuscriptAnalyses.userId, userId))
  ).orderBy(desc(manuscriptAnalyses.createdAt)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Chat message queries
export async function getUserChatMessages(userId: number, projectId?: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = projectId 
    ? and(eq(chatMessages.userId, userId), eq(chatMessages.projectId, projectId))
    : eq(chatMessages.userId, userId);
    
  return await db.select().from(chatMessages)
    .where(conditions)
    .orderBy(chatMessages.createdAt)
    .limit(limit);
}

export async function createChatMessage(message: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.insert(chatMessages).values(message);
  return Number(result.insertId);
}

// User progress queries
export async function getUserProgressByDate(userId: number, projectId: number, date: Date) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userProgress).where(
    and(
      eq(userProgress.userId, userId),
      eq(userProgress.projectId, projectId),
      eq(userProgress.date, date)
    )
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createOrUpdateProgress(progress: InsertUserProgress) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(userProgress).values(progress).onDuplicateKeyUpdate({
    set: {
      wordsWritten: progress.wordsWritten,
      timeSpentMinutes: progress.timeSpentMinutes,
      ticketsCompleted: progress.ticketsCompleted,
    }
  });
}

// Ticket Tags
export async function createTicketTag(tag: InsertTicketTag) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(ticketTags).values(tag);
  return Number((result as any).insertId);
}

export async function getTicketTags(ticketId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(ticketTags).where(eq(ticketTags.ticketId, ticketId));
}

export async function deleteTicketTag(tagId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(ticketTags).where(eq(ticketTags.id, tagId));
}

// Custom Sections
export async function createCustomSection(section: InsertCustomSection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(customSections).values(section).$returningId();
  return result[0].id;
}

export async function getCustomSections(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(customSections)
    .where(eq(customSections.projectId, projectId))
    .orderBy(customSections.position);
}

export async function getCustomSectionById(sectionId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(customSections)
    .where(eq(customSections.id, sectionId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCustomSection(sectionId: number, updates: Partial<InsertCustomSection>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(customSections)
    .set(updates)
    .where(eq(customSections.id, sectionId));
}

export async function deleteCustomSection(sectionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(customSections).where(eq(customSections.id, sectionId));
}

// Achievement queries
export async function getAllAchievements() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(achievements);
}

export async function getAchievementById(achievementId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(achievements)
    .where(eq(achievements.id, achievementId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAchievement(achievement: InsertAchievement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(achievements).values(achievement).$returningId();
  return result[0].id;
}

export async function getUserAchievements(userId: number, projectId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = projectId 
    ? and(eq(userAchievements.userId, userId), eq(userAchievements.projectId, projectId))
    : eq(userAchievements.userId, userId);
  
  return await db.select().from(userAchievements)
    .where(conditions)
    .orderBy(desc(userAchievements.unlockedAt));
}

export async function getUserAchievementProgress(userId: number, achievementId: number, projectId?: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const conditions = projectId
    ? and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId),
        eq(userAchievements.projectId, projectId)
      )
    : and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      );
  
  const result = await db.select().from(userAchievements)
    .where(conditions)
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function unlockAchievement(data: InsertUserAchievement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(userAchievements).values(data).$returningId();
  return result[0].id;
}

export async function updateAchievementProgress(
  userId: number,
  achievementId: number,
  progress: number,
  projectId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const conditions = projectId
    ? and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId),
        eq(userAchievements.projectId, projectId)
      )
    : and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      );
  
  await db.update(userAchievements)
    .set({ progress })
    .where(conditions);
}

export async function markAchievementNotificationSent(userAchievementId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(userAchievements)
    .set({ notificationSent: true })
    .where(eq(userAchievements.id, userAchievementId));
}


// User Preferences functions
export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const prefs = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  return prefs[0] || null;
}

export async function upsertUserPreferences(userId: number, data: Partial<InsertUserPreference>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getUserPreferences(userId);
  
  if (existing) {
    await db.update(userPreferences)
      .set(data)
      .where(eq(userPreferences.userId, userId));
    return getUserPreferences(userId);
  } else {
    const [result] = await db.insert(userPreferences)
      .values({ userId, ...data })
      .$returningId();
    return getUserPreferences(userId);
  }
}


// ===== Outlines =====
export async function createOutline(data: InsertOutline) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(outlines).values(data).$returningId();
  return result.id;
}

export async function getProjectOutlines(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(outlines).where(eq(outlines.projectId, projectId)).orderBy(outlines.updatedAt);
}

export async function getOutlineById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const results = await db.select().from(outlines).where(eq(outlines.id, id)).limit(1);
  return results[0] || null;
}

export async function updateOutline(id: number, data: Partial<InsertOutline>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(outlines).set(data).where(eq(outlines.id, id));
  return { success: true };
}

export async function deleteOutline(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(outlines).where(eq(outlines.id, id));
  return { success: true };
}
