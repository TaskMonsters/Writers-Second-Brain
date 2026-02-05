import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
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
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("novelKit.characters", () => {
  it("creates a character successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First create a project
    const { projectId } = await caller.projects.create({
      title: "Test Novel",
      description: "A test novel project",
    });

    // Create a character
    const result = await caller.novelKit.characters.create({
      projectId,
      name: "John Doe",
      role: "Protagonist",
      age: "30",
      occupation: "Detective",
      personality: "Determined and analytical",
    });

    expect(result).toHaveProperty("characterId");
    expect(typeof result.characterId).toBe("number");
  });

  it("lists characters for a project", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a project
    const { projectId } = await caller.projects.create({
      title: "Test Novel 2",
      description: "Another test novel",
    });

    // Create multiple characters
    await caller.novelKit.characters.create({
      projectId,
      name: "Alice",
      role: "Protagonist",
    });

    await caller.novelKit.characters.create({
      projectId,
      name: "Bob",
      role: "Antagonist",
    });

    // List characters
    const characters = await caller.novelKit.characters.list({
      projectId,
    });

    expect(characters.length).toBeGreaterThanOrEqual(2);
    expect(characters.some(c => c.name === "Alice")).toBe(true);
    expect(characters.some(c => c.name === "Bob")).toBe(true);
  });
});

describe("novelKit.locations", () => {
  it("creates a location successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const { projectId } = await caller.projects.create({
      title: "Fantasy Novel",
      description: "A fantasy world",
    });

    const result = await caller.novelKit.locations.create({
      projectId,
      name: "Emerald City",
      type: "City",
      description: "A magnificent city built of green marble",
      climate: "Temperate",
    });

    expect(result).toHaveProperty("locationId");
    expect(typeof result.locationId).toBe("number");
  });

  it("lists locations for a project", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const { projectId } = await caller.projects.create({
      title: "Sci-Fi Novel",
      description: "Space exploration",
    });

    await caller.novelKit.locations.create({
      projectId,
      name: "Mars Colony",
      type: "Settlement",
    });

    const locations = await caller.novelKit.locations.list({
      projectId,
    });

    expect(locations.length).toBeGreaterThanOrEqual(1);
    expect(locations.some(l => l.name === "Mars Colony")).toBe(true);
  });
});

describe("novelKit.plotBeats", () => {
  it("creates a plot beat successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const { projectId } = await caller.projects.create({
      title: "Mystery Novel",
      description: "A thrilling mystery",
    });

    const result = await caller.novelKit.plotBeats.create({
      projectId,
      beatName: "Opening Image",
      description: "Introduce the protagonist in their ordinary world",
      chapter: "Chapter 1",
      position: 0,
    });

    expect(result).toHaveProperty("plotBeatId");
    expect(typeof result.plotBeatId).toBe("number");
  });

  it("lists plot beats in order", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const { projectId } = await caller.projects.create({
      title: "Adventure Novel",
      description: "An epic adventure",
    });

    await caller.novelKit.plotBeats.create({
      projectId,
      beatName: "Catalyst",
      position: 1,
    });

    await caller.novelKit.plotBeats.create({
      projectId,
      beatName: "Opening Image",
      position: 0,
    });

    const plotBeats = await caller.novelKit.plotBeats.list({
      projectId,
    });

    expect(plotBeats.length).toBeGreaterThanOrEqual(2);
    // Should be ordered by position
    expect(plotBeats[0]?.beatName).toBe("Opening Image");
    expect(plotBeats[1]?.beatName).toBe("Catalyst");
  });
});

describe("novelKit.scenes", () => {
  it("creates a scene successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const { projectId } = await caller.projects.create({
      title: "Drama Novel",
      description: "An emotional drama",
    });

    const result = await caller.novelKit.scenes.create({
      projectId,
      title: "The Confrontation",
      chapter: "Chapter 5",
      summary: "The protagonist confronts the antagonist",
      goal: "Reveal the truth",
      conflict: "Lies and deception",
      outcome: "Partial victory",
      position: 0,
    });

    expect(result).toHaveProperty("sceneId");
    expect(typeof result.sceneId).toBe("number");
  });
});

describe("novelKit.worldElements", () => {
  it("creates a world element successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const { projectId } = await caller.projects.create({
      title: "Fantasy Epic",
      description: "A world of magic",
    });

    const result = await caller.novelKit.worldElements.create({
      projectId,
      name: "Elemental Magic",
      type: "magic",
      description: "Magic based on the four elements",
      rules: "Requires training and natural affinity",
      significance: "Central to the plot",
    });

    expect(result).toHaveProperty("worldElementId");
    expect(typeof result.worldElementId).toBe("number");
  });
});

describe("novelKit.timeline", () => {
  it("creates a timeline event successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const { projectId } = await caller.projects.create({
      title: "Historical Fiction",
      description: "Set in ancient times",
    });

    const result = await caller.novelKit.timeline.create({
      projectId,
      title: "The Great War Begins",
      date: "Year 1205",
      description: "The conflict that changed everything",
      type: "historical",
      position: 0,
    });

    expect(result).toHaveProperty("timelineEventId");
    expect(typeof result.timelineEventId).toBe("number");
  });
});
