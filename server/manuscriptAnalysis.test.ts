import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("Manuscript Analysis", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;
  let projectId: number;
  let manuscriptId: number;

  beforeAll(async () => {
    ctx = {
      user: {
        id: 1,
        openId: "test-user",
        name: "Test User",
        email: "test@example.com",
        loginMethod: "test",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
    };
    caller = appRouter.createCaller(ctx);

    // Get or create project
    const projects = await caller.projects.list();
    if (projects.length > 0) {
      projectId = projects[0].id;
    } else {
      const result = await caller.projects.create({
        title: "Test Novel",
        description: "Test project for manuscript analysis",
      });
      projectId = result.projectId;
    }

    // Create a test manuscript
    const result = await caller.manuscripts.create({
      projectId,
      title: "Test Manuscript",
      content: `Chapter 1: The Beginning

The rain fell steadily on the cobblestone streets of London. Sarah hurried through the downpour, clutching her worn leather satchel close to her chest. Inside were the letters—the ones that would change everything.

"Wait!" a voice called from behind her.

She didn't turn around. She couldn't. Not now. Not when she was so close to the truth.

The footsteps grew louder, splashing through puddles. Her heart raced. She ducked into a narrow alley, pressing herself against the cold brick wall.

"Sarah, please," the voice said again, softer this time. "We need to talk."

She recognized that voice. It was Thomas. The man she thought she could trust.

"There's nothing to talk about," she said, her voice barely above a whisper. "You lied to me."

"I had no choice."

"There's always a choice."

The silence stretched between them, heavy with unspoken words. Finally, Thomas stepped closer, his face illuminated by the dim streetlight.

"The letters," he said. "They're not what you think."

"Then what are they?" Sarah demanded, her anger rising. "Tell me the truth for once."

Thomas hesitated, his eyes searching hers. "They're evidence. Evidence that could destroy my family."

Sarah's breath caught. She had suspected something was wrong, but this? This was bigger than she'd imagined.

"What kind of evidence?" she asked.

"The kind that proves my father wasn't the hero everyone thinks he was."

The weight of his words settled over her like a shroud. She thought of all the stories she'd heard growing up—tales of bravery and honor. All lies?

"Show me," she said finally.

Thomas nodded slowly and reached into his coat pocket.`,
    });
    manuscriptId = result.manuscriptId;
  });

  it("should create a manuscript analysis", async () => {
    const result = await caller.manuscripts.analyze({
      manuscriptId,
      genre: "Historical Fiction",
      targetAudience: "Adult",
      specificConcerns: "Is the pacing too slow? Are the characters believable?",
    });

    expect(result).toBeDefined();
    expect(result.analysisId).toBeGreaterThan(0);
    expect(result.overallAssessment).toBeDefined();
    expect(result.structuralAnalysis).toBeDefined();
    expect(result.characterDevelopment).toBeDefined();
    expect(result.dialogueQuality).toBeDefined();
    expect(result.proseAndStyle).toBeDefined();
    expect(result.priorityActionItems).toBeDefined();
    expect(Array.isArray(result.priorityActionItems)).toBe(true);
    expect(result.priorityActionItems.length).toBeGreaterThan(0);
    expect(result.overallScore).toBeGreaterThanOrEqual(1);
    expect(result.overallScore).toBeLessThanOrEqual(10);
  }, 60000); // 60 second timeout for LLM call

  it("should retrieve manuscript analyses", async () => {
    const analyses = await caller.manuscripts.getAnalyses({
      manuscriptId,
    });

    expect(analyses).toBeDefined();
    expect(Array.isArray(analyses)).toBe(true);
    expect(analyses.length).toBeGreaterThan(0);
    
    const latestAnalysis = analyses[0];
    expect(latestAnalysis.manuscriptId).toBe(manuscriptId);
    expect(latestAnalysis.overallAssessment).toBeDefined();
    expect(latestAnalysis.structuralAnalysis).toBeDefined();
    expect(latestAnalysis.characterDevelopment).toBeDefined();
    expect(latestAnalysis.dialogueQuality).toBeDefined();
    expect(latestAnalysis.proseAndStyle).toBeDefined();
    expect(latestAnalysis.overallScore).toBeGreaterThanOrEqual(1);
    expect(latestAnalysis.overallScore).toBeLessThanOrEqual(10);
  });

  it("should handle analysis without optional parameters", async () => {
    const result = await caller.manuscripts.analyze({
      manuscriptId,
    });

    expect(result).toBeDefined();
    expect(result.analysisId).toBeGreaterThan(0);
    expect(result.overallScore).toBeGreaterThanOrEqual(1);
    expect(result.overallScore).toBeLessThanOrEqual(10);
  }, 60000);
});
