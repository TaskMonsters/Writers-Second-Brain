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

describe("Outline UI Integration Tests", () => {
  const ctx = createAuthContext();
  const caller = appRouter.createCaller(ctx);
  let projectId: number;

  beforeAll(async () => {
    const project = await caller.projects.create({
      title: "Outline UI Test Project",
      description: "Testing all 4 outlining methods",
    });
    projectId = project.projectId;
  });

  it("should create and retrieve a Snowflake outline with 10 steps", async () => {
    const snowflakeData = {
      step1: "A detective must solve a murder before the killer strikes again.",
      step2: "Detective Sarah investigates a serial killer case...",
      step3: "Sarah is a determined detective with a troubled past...",
      step4: "The story opens with Sarah discovering the first victim...",
      step5: "Sarah's goal is to catch the killer, her conflict is her past trauma...",
      step6: "A four-page synopsis expanding on the investigation...",
      step7: "Full character bible for Sarah including backstory...",
      step8: "Scene 1: Discovery of first victim. Scene 2: Interview witnesses...",
      step9: "Scene 1 details: Sarah arrives at crime scene at dawn...",
      step10: "First draft outline ready for writing...",
    };

    const created = await caller.novelKit.outlines.create({
      projectId,
      method: "snowflake",
      title: "Snowflake Outline",
      content: JSON.stringify(snowflakeData),
    });

    expect(created.id).toBeTypeOf("number");

    const outlines = await caller.novelKit.outlines.list({ projectId });
    const snowflake = outlines.find((o) => o.method === "snowflake");
    
    expect(snowflake).toBeDefined();
    expect(snowflake?.title).toBe("Snowflake Outline");
    
    const parsed = JSON.parse(snowflake!.content);
    expect(parsed.step1).toBe(snowflakeData.step1);
    expect(parsed.step10).toBe(snowflakeData.step10);
  });

  it("should create and retrieve a Beat Mapping outline with draggable beats", async () => {
    const beatData = {
      beats: [
        { id: "beat-1", text: "Opening: Introduce protagonist", order: 0 },
        { id: "beat-2", text: "Inciting Incident: Murder discovered", order: 1 },
        { id: "beat-3", text: "Rising Action: Investigation begins", order: 2 },
        { id: "beat-4", text: "Midpoint: Major revelation", order: 3 },
        { id: "beat-5", text: "Climax: Confrontation with killer", order: 4 },
        { id: "beat-6", text: "Resolution: Justice served", order: 5 },
      ],
    };

    const created = await caller.novelKit.outlines.create({
      projectId,
      method: "beat_mapping",
      title: "Beat Map",
      content: JSON.stringify(beatData),
    });

    expect(created.id).toBeTypeOf("number");

    const outlines = await caller.novelKit.outlines.list({ projectId });
    const beatMap = outlines.find((o) => o.method === "beat_mapping");
    
    expect(beatMap).toBeDefined();
    const parsed = JSON.parse(beatMap!.content);
    expect(parsed.beats).toHaveLength(6);
    expect(parsed.beats[0].text).toBe("Opening: Introduce protagonist");
  });

  it("should create and retrieve a Mind Mapping outline with nodes", async () => {
    const mindMapData = {
      nodes: [
        { id: "node-1", text: "Central Idea: Murder Mystery", x: 50, y: 50 },
        { id: "node-2", text: "Protagonist: Detective Sarah", x: 30, y: 30, parentId: "node-1" },
        { id: "node-3", text: "Antagonist: Serial Killer", x: 70, y: 30, parentId: "node-1" },
        { id: "node-4", text: "Setting: Urban City", x: 30, y: 70, parentId: "node-1" },
        { id: "node-5", text: "Theme: Justice vs Revenge", x: 70, y: 70, parentId: "node-1" },
      ],
    };

    const created = await caller.novelKit.outlines.create({
      projectId,
      method: "mind_mapping",
      title: "Mind Map",
      content: JSON.stringify(mindMapData),
    });

    expect(created.id).toBeTypeOf("number");

    const outlines = await caller.novelKit.outlines.list({ projectId });
    const mindMap = outlines.find((o) => o.method === "mind_mapping");
    
    expect(mindMap).toBeDefined();
    const parsed = JSON.parse(mindMap!.content);
    expect(parsed.nodes).toHaveLength(5);
    expect(parsed.nodes[0].text).toContain("Central Idea");
  });

  it("should create and retrieve a Synopsis outline", async () => {
    const synopsisText = `Detective Sarah Martinez is called to investigate a brutal murder in downtown Chicago. 
    As she delves deeper into the case, she discovers a pattern linking this crime to three unsolved murders from the past year.
    
    The killer, known only as "The Architect," leaves cryptic messages at each crime scene. Sarah must race against time
    to decode these messages before the next victim is claimed. Along the way, she confronts her own demons from a case
    that went wrong five years ago.
    
    In a thrilling climax, Sarah pieces together the killer's identity and confronts him in an abandoned warehouse.
    Justice is served, but Sarah realizes that some wounds never fully heal.`;

    const created = await caller.novelKit.outlines.create({
      projectId,
      method: "synopsis",
      title: "Synopsis",
      content: JSON.stringify({ text: synopsisText }),
    });

    expect(created.id).toBeTypeOf("number");

    const outlines = await caller.novelKit.outlines.list({ projectId });
    const synopsis = outlines.find((o) => o.method === "synopsis");
    
    expect(synopsis).toBeDefined();
    const parsed = JSON.parse(synopsis!.content);
    expect(parsed.text).toContain("Detective Sarah Martinez");
    expect(parsed.text).toContain("The Architect");
  });

  it("should update an existing outline", async () => {
    const outlines = await caller.novelKit.outlines.list({ projectId });
    const snowflake = outlines.find((o) => o.method === "snowflake");
    
    expect(snowflake).toBeDefined();

    const updatedData = {
      step1: "UPDATED: A detective must solve a murder before the killer strikes again.",
      step2: "UPDATED: Detective Sarah investigates...",
    };

    await caller.novelKit.outlines.update({
      id: snowflake!.id,
      content: JSON.stringify(updatedData),
    });

    const refreshedOutlines = await caller.novelKit.outlines.list({ projectId });
    const updated = refreshedOutlines.find((o) => o.id === snowflake!.id);
    
    const parsed = JSON.parse(updated!.content);
    expect(parsed.step1).toContain("UPDATED:");
  });

  it("should list all 4 outline methods for a project", async () => {
    const outlines = await caller.novelKit.outlines.list({ projectId });
    
    const methods = outlines.map((o) => o.method);
    expect(methods).toContain("snowflake");
    expect(methods).toContain("beat_mapping");
    expect(methods).toContain("mind_mapping");
    expect(methods).toContain("synopsis");
    expect(outlines.length).toBeGreaterThanOrEqual(4);
  });

  it("should handle empty beat list", async () => {
    const emptyBeatData = { beats: [] };

    const created = await caller.novelKit.outlines.create({
      projectId,
      method: "beat_mapping",
      title: "Empty Beat Map",
      content: JSON.stringify(emptyBeatData),
    });

    expect(created.id).toBeTypeOf("number");

    const outlines = await caller.novelKit.outlines.list({ projectId });
    const emptyBeat = outlines.find((o) => o.title === "Empty Beat Map");
    
    const parsed = JSON.parse(emptyBeat!.content);
    expect(parsed.beats).toEqual([]);
  });

  it("should handle empty mind map", async () => {
    const emptyMindMap = { nodes: [] };

    const created = await caller.novelKit.outlines.create({
      projectId,
      method: "mind_mapping",
      title: "Empty Mind Map",
      content: JSON.stringify(emptyMindMap),
    });

    expect(created.id).toBeTypeOf("number");

    const outlines = await caller.novelKit.outlines.list({ projectId });
    const empty = outlines.find((o) => o.title === "Empty Mind Map");
    
    const parsed = JSON.parse(empty!.content);
    expect(parsed.nodes).toEqual([]);
  });
});
