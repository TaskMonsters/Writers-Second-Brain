import { describe, it, expect, beforeAll } from "vitest";
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

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Outlines Router", () => {
  const ctx = createAuthContext();
  const caller = appRouter.createCaller(ctx);
  let projectId: number;

  beforeAll(async () => {
    // Create a test project
    const project = await caller.projects.create({
      title: "Test Novel for Outlines",
      description: "Test project for outline functionality",
    });
    projectId = project.projectId;
  });

  it("should create a snowflake outline", async () => {
    const outline = await caller.novelKit.outlines.create({
      projectId,
      method: "snowflake",
      title: "My Novel Snowflake",
      content: JSON.stringify({
        step1: "A detective must solve a murder before the killer strikes again.",
        step2: "",
        step3: "",
      }),
    });

    expect(outline).toBeDefined();
    expect(outline.id).toBeTypeOf("number");
  });

  it("should list all outlines for a project", async () => {
    // Create multiple outlines
    await caller.novelKit.outlines.create({
      projectId,
      method: "beat_mapping",
      title: "Beat Map v1",
      content: JSON.stringify({ beats: ["Opening", "Inciting Incident", "Climax"] }),
    });

    await caller.novelKit.outlines.create({
      projectId,
      method: "synopsis",
      title: "Full Synopsis",
      content: "This is the full story summary...",
    });

    const outlines = await caller.novelKit.outlines.list({ projectId });

    expect(outlines).toBeDefined();
    expect(outlines.length).toBeGreaterThanOrEqual(3);
  });

  it("should update an outline", async () => {
    const outline = await caller.novelKit.outlines.create({
      projectId,
      method: "mind_mapping",
      title: "Mind Map Draft",
      content: JSON.stringify({ nodes: [] }),
    });

    const updated = await caller.novelKit.outlines.update({
      id: outline.id,
      title: "Mind Map Final",
      content: JSON.stringify({ nodes: [{ id: 1, text: "Central Idea" }] }),
    });

    expect(updated).toEqual({ success: true });

    const outlines = await caller.novelKit.outlines.list({ projectId });
    const found = outlines.find((o) => o.id === outline.id);
    expect(found?.title).toBe("Mind Map Final");
  });

  it("should delete an outline", async () => {
    const outline = await caller.novelKit.outlines.create({
      projectId,
      method: "synopsis",
      title: "Temporary Synopsis",
      content: "Delete me",
    });

    const deleted = await caller.novelKit.outlines.delete({ id: outline.id });
    expect(deleted).toEqual({ success: true });

    const outlines = await caller.novelKit.outlines.list({ projectId });
    const found = outlines.find((o) => o.id === outline.id);
    expect(found).toBeUndefined();
  });

  it("should handle different outline methods", async () => {
    const methods = ["snowflake", "beat_mapping", "mind_mapping", "synopsis"] as const;

    for (const method of methods) {
      const outline = await caller.novelKit.outlines.create({
        projectId,
        method,
        title: `Test ${method}`,
        content: JSON.stringify({ test: true }),
      });

      expect(outline.id).toBeTypeOf("number");
    }

    const outlines = await caller.novelKit.outlines.list({ projectId });
    const methodCounts = outlines.reduce((acc, o) => {
      acc[o.method] = (acc[o.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Should have at least one of each method
    expect(methodCounts.snowflake).toBeGreaterThanOrEqual(1);
    expect(methodCounts.beat_mapping).toBeGreaterThanOrEqual(1);
    expect(methodCounts.mind_mapping).toBeGreaterThanOrEqual(1);
    expect(methodCounts.synopsis).toBeGreaterThanOrEqual(1);
  });
});
