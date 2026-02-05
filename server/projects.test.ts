import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
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

  return ctx;
}

describe("projects router", () => {
  it("should create a new project", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.create({
      title: "My First Novel",
      description: "A thrilling sci-fi adventure",
      genre: "Science Fiction",
      targetWordCount: 80000,
    });

    expect(result).toHaveProperty("projectId");
    expect(typeof result.projectId).toBe("number");
  });

  it("should list user projects", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const projects = await caller.projects.list();

    expect(Array.isArray(projects)).toBe(true);
  });

  it("should update a project", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a project first
    const createResult = await caller.projects.create({
      title: "Test Project",
      description: "Initial description",
    });

    expect(createResult.projectId).toBeGreaterThan(0);

    // Update it
    const result = await caller.projects.update({
      projectId: createResult.projectId,
      title: "Updated Project Title",
      description: "Updated description",
    });

    expect(result.success).toBe(true);
  });
});

describe("tickets router", () => {
  it("should create a new ticket", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a project first
    const { projectId } = await caller.projects.create({
      title: "Test Project for Tickets",
    });

    // Create a ticket
    const result = await caller.tickets.create({
      projectId,
      title: "Write Chapter 1",
      description: "Introduction to the main character",
      taskType: "chapter",
      status: "backlog",
    });

    expect(result).toHaveProperty("ticketId");
    expect(typeof result.ticketId).toBe("number");
  });

  it("should list project tickets", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a project
    const { projectId } = await caller.projects.create({
      title: "Test Project",
    });

    // Create some tickets
    await caller.tickets.create({
      projectId,
      title: "Ticket 1",
      taskType: "idea",
    });

    await caller.tickets.create({
      projectId,
      title: "Ticket 2",
      taskType: "chapter",
    });

    // List tickets
    const tickets = await caller.tickets.list({ projectId });

    expect(Array.isArray(tickets)).toBe(true);
    expect(tickets.length).toBeGreaterThanOrEqual(2);
  });

  it("should update ticket status", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create project and ticket
    const { projectId } = await caller.projects.create({
      title: "Test Project",
    });

    const { ticketId } = await caller.tickets.create({
      projectId,
      title: "Test Ticket",
      status: "backlog",
    });

    // Update status
    const result = await caller.tickets.update({
      ticketId,
      status: "first-draft",
    });

    expect(result.success).toBe(true);
  });

  it("should delete a ticket", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create project and ticket
    const { projectId } = await caller.projects.create({
      title: "Test Project",
    });

    const { ticketId } = await caller.tickets.create({
      projectId,
      title: "Ticket to Delete",
    });

    // Delete it
    const result = await caller.tickets.delete({ ticketId });

    expect(result.success).toBe(true);
  });
});

describe("manuscripts router", () => {
  it("should create a new manuscript", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a project first
    const { projectId } = await caller.projects.create({
      title: "Test Project",
    });

    // Create a manuscript
    const result = await caller.manuscripts.create({
      projectId,
      title: "Chapter 1: The Beginning",
      content: "It was a dark and stormy night...",
    });

    expect(result).toHaveProperty("manuscriptId");
    expect(typeof result.manuscriptId).toBe("number");
  });

  it("should update manuscript content and calculate word count", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create project and manuscript
    const { projectId } = await caller.projects.create({
      title: "Test Project",
    });

    const { manuscriptId } = await caller.manuscripts.create({
      projectId,
      title: "Test Manuscript",
      content: "Initial content",
    });

    // Update content
    const result = await caller.manuscripts.update({
      manuscriptId,
      content: "This is a longer piece of content with more words to count.",
    });

    expect(result.success).toBe(true);
  });

  it("should list project manuscripts", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create project
    const { projectId } = await caller.projects.create({
      title: "Test Project",
    });

    // Create manuscripts
    await caller.manuscripts.create({
      projectId,
      title: "Manuscript 1",
      content: "Content 1",
    });

    await caller.manuscripts.create({
      projectId,
      title: "Manuscript 2",
      content: "Content 2",
    });

    // List manuscripts
    const manuscripts = await caller.manuscripts.list({ projectId });

    expect(Array.isArray(manuscripts)).toBe(true);
    expect(manuscripts.length).toBeGreaterThanOrEqual(2);
  });
});
