import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

describe("Chapter Critique", () => {
  let ctx: Context;
  let projectId: number;
  let manuscriptId: number;

  beforeAll(async () => {
    // Create test context with mock user
    ctx = {
      user: { id: 1, name: "Test User", email: "test@example.com", role: "user" },
      req: {} as any,
      res: {} as any,
    };

    // Create test project
    const caller = appRouter.createCaller(ctx);
    const project = await caller.projects.create({ title: "Critique Test Project", description: "Test" });
    projectId = project.projectId;

    // Create test manuscript
    const manuscript = await caller.manuscripts.create({
      projectId,
      title: "Test Chapter",
      content: "This is a test chapter with some content for critique.",
    });
    manuscriptId = manuscript.manuscriptId;
  });

  it("should critique a chapter successfully", async () => {
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.manuscripts.critiqueChapter({
      manuscriptId,
      chapterTitle: "Chapter 1",
      selectedText: "This is a test chapter with some content for critique. The protagonist enters the room.",
    });

    expect(result).toBeDefined();
    expect(result.critique).toBeDefined();
    expect(typeof result.critique).toBe("string");
    expect(result.manuscriptId).toBe(manuscriptId);
    expect(result.chapterTitle).toBe("Chapter 1");
  }, 60000); // 60 second timeout for LLM call

  it("should critique without chapter title", async () => {
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.manuscripts.critiqueChapter({
      manuscriptId,
      selectedText: "A shorter test passage for critique.",
    });

    expect(result).toBeDefined();
    expect(result.critique).toBeDefined();
    expect(result.manuscriptId).toBe(manuscriptId);
    expect(result.chapterTitle).toBeUndefined();
  }, 60000);
});
