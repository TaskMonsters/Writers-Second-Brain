import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
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

  return ctx;
}

async function getOrCreateProject(caller: ReturnType<typeof appRouter.createCaller>) {
  const projects = await caller.projects.list();
  if (projects.length > 0) {
    return projects[0].id;
  }
  const result = await caller.projects.create({
    title: "Test Novel",
    description: "Test Description",
  });
  return result.projectId;
}

describe("Custom Sections", () => {
  it("should create a custom section", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const projectId = await getOrCreateProject(caller);

    const section = await caller.customSections.create({
      projectId,
      title: `Beta Reading ${Date.now()}`,
      position: 8,
      color: "#ff5733",
    });

    expect(section).toBeDefined();
    expect(section?.id).toBeDefined();
    expect(typeof section?.id).toBe("number");
    expect(section?.title).toContain("Beta Reading");
    expect(section?.color).toBe("#ff5733");
    expect(section?.position).toBe(8);
    expect(section?.projectId).toBe(projectId);
  });

  it("should list custom sections for a project", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const projectId = await getOrCreateProject(caller);

    const timestamp = Date.now();
    
    // Create multiple sections with unique titles
    await caller.customSections.create({
      projectId,
      title: `Beta Reading ${timestamp}`,
      position: 8,
      color: "#ff5733",
    });

    await caller.customSections.create({
      projectId,
      title: `Publishing ${timestamp}`,
      position: 9,
      color: "#33ff57",
    });

    const sections = await caller.customSections.list({
      projectId,
    });

    expect(sections.length).toBeGreaterThanOrEqual(2);
    const betaSection = sections.find(s => s.title === `Beta Reading ${timestamp}`);
    const publishingSection = sections.find(s => s.title === `Publishing ${timestamp}`);
    
    expect(betaSection).toBeDefined();
    expect(publishingSection).toBeDefined();
    expect(betaSection?.position).toBe(8);
    expect(publishingSection?.position).toBe(9);
  });

  it("should update a custom section", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const projectId = await getOrCreateProject(caller);

    // Create a section
    const section = await caller.customSections.create({
      projectId,
      title: `Beta Reading ${Date.now()}`,
      position: 8,
      color: "#ff5733",
    });

    // Update the section
    const updateResult = await caller.customSections.update({
      sectionId: section.id,
      title: "Alpha Reading",
      color: "#5733ff",
    });

    expect(updateResult.success).toBe(true);
    
    // Verify the update by listing
    const sections = await caller.customSections.list({ projectId });
    const updatedSection = sections.find(s => s.id === section.id);
    expect(updatedSection?.title).toBe("Alpha Reading");
    expect(updatedSection?.color).toBe("#5733ff");
  });

  it("should delete a custom section", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const projectId = await getOrCreateProject(caller);

    const timestamp = Date.now();
    
    // Create a section
    const section = await caller.customSections.create({
      projectId,
      title: `To Delete ${timestamp}`,
      position: 8,
      color: "#ff5733",
    });

    // Delete the section
    await caller.customSections.delete({
      sectionId: section.id,
    });

    // Verify it's deleted
    const sections = await caller.customSections.list({
      projectId,
    });

    const deletedSection = sections.find(s => s.id === section.id);
    expect(deletedSection).toBeUndefined();
  });

  it("should order sections by position", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const projectId = await getOrCreateProject(caller);

    const timestamp = Date.now();
    
    // Create sections in non-sequential order
    await caller.customSections.create({
      projectId,
      title: `Third ${timestamp}`,
      position: 10,
      color: "#ff5733",
    });

    await caller.customSections.create({
      projectId,
      title: `First ${timestamp}`,
      position: 8,
      color: "#33ff57",
    });

    await caller.customSections.create({
      projectId,
      title: `Second ${timestamp}`,
      position: 9,
      color: "#3357ff",
    });

    const sections = await caller.customSections.list({
      projectId,
    });

    // Find our test sections
    const testSections = sections.filter(s => 
      s.title === `First ${timestamp}` || 
      s.title === `Second ${timestamp}` || 
      s.title === `Third ${timestamp}`
    );

    expect(testSections).toHaveLength(3);
    
    // Verify they're ordered by position
    const positions = testSections.map(s => s.position);
    expect(positions).toEqual([8, 9, 10]);
    
    expect(testSections[0].title).toBe(`First ${timestamp}`);
    expect(testSections[1].title).toBe(`Second ${timestamp}`);
    expect(testSections[2].title).toBe(`Third ${timestamp}`);
  });
});
