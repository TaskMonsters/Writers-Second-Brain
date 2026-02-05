import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {} as any,
    res: {} as any,
  };

  return ctx;
}

describe("Achievements System", () => {
  async function getOrCreateProject(caller: any) {
    const projects = await caller.projects.list();
    if (projects.length > 0) {
      return projects[0].id;
    }
    const result = await caller.projects.create({
      title: "Test Novel",
      description: "Test project for achievements",
    });
    return result.projectId;
  }

  it("should list all available achievements", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const achievements = await caller.achievements.list();

    expect(achievements).toBeDefined();
    expect(Array.isArray(achievements)).toBe(true);
    expect(achievements.length).toBeGreaterThan(0);
    
    // Check that achievements have required fields
    const firstAchievement = achievements[0];
    expect(firstAchievement.name).toBeDefined();
    expect(firstAchievement.description).toBeDefined();
    expect(firstAchievement.category).toBeDefined();
    expect(firstAchievement.threshold).toBeDefined();
  });

  it("should check progress for all achievements", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const projectId = await getOrCreateProject(caller);

    const progress = await caller.achievements.checkProgress({ projectId });

    expect(progress).toBeDefined();
    expect(Array.isArray(progress)).toBe(true);
    expect(progress.length).toBeGreaterThan(0);

    // Check progress structure
    const firstProgress = progress[0];
    expect(firstProgress.achievement).toBeDefined();
    expect(typeof firstProgress.isUnlocked).toBe("boolean");
    expect(typeof firstProgress.progress).toBe("number");
    expect(typeof firstProgress.progressPercent).toBe("number");
  });

  it("should unlock an achievement", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const projectId = await getOrCreateProject(caller);

    // Get all achievements
    const achievements = await caller.achievements.list();
    const firstAchievement = achievements[0];

    // Unlock the achievement
    const result = await caller.achievements.unlock({
      achievementId: firstAchievement.id,
      projectId,
      progress: firstAchievement.threshold,
    });

    // Should either succeed or already be unlocked
    expect(result.success === true || result.alreadyUnlocked === true).toBe(true);
    
    // Verify it was unlocked
    const userAchievements = await caller.achievements.userAchievements({ projectId });
    const unlocked = userAchievements.find(ua => ua.achievementId === firstAchievement.id);
    expect(unlocked).toBeDefined();
  });

  it("should not unlock the same achievement twice", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const projectId = await getOrCreateProject(caller);

    // Get all achievements
    const achievements = await caller.achievements.list();
    const testAchievement = achievements[1]; // Use second achievement to avoid conflicts

    // Unlock the achievement first time
    await caller.achievements.unlock({
      achievementId: testAchievement.id,
      projectId,
      progress: testAchievement.threshold,
    });

    // Try to unlock again
    const result = await caller.achievements.unlock({
      achievementId: testAchievement.id,
      projectId,
      progress: testAchievement.threshold,
    });

    expect(result.alreadyUnlocked).toBe(true);
  });

  it("should track progress correctly for word count achievements", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const projectId = await getOrCreateProject(caller);

    // Get progress
    const progress = await caller.achievements.checkProgress({ projectId });
    
    // Find word count achievements
    const wordCountAchievements = progress.filter(
      p => p.achievement.category === "word_count"
    );

    expect(wordCountAchievements.length).toBeGreaterThan(0);

    // Check that progress is calculated
    wordCountAchievements.forEach(achievement => {
      expect(achievement.progress).toBeGreaterThanOrEqual(0);
      expect(achievement.progressPercent).toBeGreaterThanOrEqual(0);
      expect(achievement.progressPercent).toBeLessThanOrEqual(100);
    });
  });

  it("should track progress correctly for ticket achievements", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const projectId = await getOrCreateProject(caller);

    // Create a ticket and mark it as done
    const ticket = await caller.tickets.create({
      projectId,
      title: "Test Chapter",
      description: "Test chapter for achievement",
      taskType: "chapter",
      status: "backlog",
    });

    await caller.tickets.update({
      ticketId: ticket.ticketId,
      status: "done",
    });

    // Get progress
    const progress = await caller.achievements.checkProgress({ projectId });
    
    // Find ticket achievements
    const ticketAchievements = progress.filter(
      p => p.achievement.category === "tickets"
    );

    expect(ticketAchievements.length).toBeGreaterThan(0);

    // At least one ticket should be counted
    ticketAchievements.forEach(achievement => {
      expect(achievement.progress).toBeGreaterThanOrEqual(1);
    });
  });

  it("should list user achievements for a project", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const projectId = await getOrCreateProject(caller);

    const userAchievements = await caller.achievements.userAchievements({ projectId });

    expect(Array.isArray(userAchievements)).toBe(true);
    
    // If any achievements are unlocked, check their structure
    if (userAchievements.length > 0) {
      const firstUserAchievement = userAchievements[0];
      expect(firstUserAchievement.userId).toBeDefined();
      expect(firstUserAchievement.achievementId).toBeDefined();
      expect(firstUserAchievement.unlockedAt).toBeDefined();
    }
  });
});
