import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

describe("Manuscript Export", () => {
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
    const project = await caller.projects.create({ title: "Export Test Project", description: "Test" });
    projectId = project.projectId;

    // Create test manuscript
    const manuscript = await caller.manuscripts.create({
      projectId,
      title: "Test Manuscript",
      content: "This is a test manuscript.\n\nIt has multiple paragraphs.\n\nFor testing export functionality.",
    });
    manuscriptId = manuscript.manuscriptId;
  });

  it("should export manuscript as Word document", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.manuscriptExport.exportWord({ manuscriptId });

    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.filename).toContain(".docx");
    expect(result.mimeType).toBe("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    expect(result.data.length).toBeGreaterThan(0);
  });

  it("should export manuscript as HTML", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.manuscriptExport.exportHtml({ manuscriptId });

    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.filename).toContain(".html");
    expect(result.mimeType).toBe("text/html");
    
    // Decode and check HTML content
    const html = Buffer.from(result.data, "base64").toString();
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Test Manuscript");
  });

  it("should export manuscript as LaTeX", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.manuscriptExport.exportLatex({ manuscriptId });

    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.filename).toContain(".tex");
    expect(result.mimeType).toBe("application/x-latex");
    
    // Decode and check LaTeX content
    const latex = Buffer.from(result.data, "base64").toString();
    expect(latex).toContain("\\documentclass");
    expect(latex).toContain("Test Manuscript");
  });

  it("should export manuscript as Standard Manuscript Format", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.manuscriptExport.exportManuscript({ manuscriptId });

    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.filename).toContain("_manuscript.txt");
    expect(result.mimeType).toBe("text/plain");
    
    // Decode and check formatted content
    const formatted = Buffer.from(result.data, "base64").toString();
    expect(formatted).toContain("Author Name");
    expect(formatted).toContain("Approx.");
    expect(formatted).toContain("TEST MANUSCRIPT");
  });
});
