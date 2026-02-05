import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { chatRouter } from "./chatRouter";
import { novelKitRouter } from "./novelKitRouter";
import { manuscriptExportRouter } from "./manuscriptExport";

export const appRouter = router({
  system: systemRouter,
  chat: chatRouter,
  novelKit: novelKitRouter,
  manuscriptExport: manuscriptExportRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  userPreferences: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserPreferences(ctx.user.id);
    }),
    update: protectedProcedure
      .input(z.object({
        authorName: z.string().optional(),
        authorAddress: z.string().optional(),
        authorPhone: z.string().optional(),
        authorEmail: z.string().optional(),
        authorWebsite: z.string().optional(),
        penName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.upsertUserPreferences(ctx.user.id, input);
      }),
  }),

  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserProjects(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getProjectById(input.projectId, ctx.user.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        genre: z.string().max(100).optional(),
        targetWordCount: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const projectId = await db.createProject({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          genre: input.genre,
          targetWordCount: input.targetWordCount,
        });
        return { projectId };
      }),
    
    update: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        genre: z.string().max(100).optional(),
        targetWordCount: z.number().optional(),
        currentWordCount: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { projectId, ...updates } = input;
        await db.updateProject(projectId, ctx.user.id, updates);
        return { success: true };
      }),
  }),

  tickets: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getProjectTickets(input.projectId, ctx.user.id);
      }),
    
    get: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getTicketById(input.ticketId, ctx.user.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        status: z.enum(["backlog", "research", "outlining", "first-draft", "revisions", "editing", "marketing", "done"]).default("backlog"),
        taskType: z.enum(["chapter", "character", "worldbuilding", "research", "editing", "marketing", "idea"]).default("idea"),
        dueDate: z.date().optional(),
        position: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        const ticketId = await db.createTicket({
          ...input,
          userId: ctx.user.id,
        });
        return { ticketId };
      }),
    
    update: protectedProcedure
      .input(z.object({
        ticketId: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        status: z.enum(["backlog", "research", "outlining", "first-draft", "revisions", "editing", "marketing", "done"]).optional(),
        taskType: z.enum(["chapter", "character", "worldbuilding", "research", "editing", "marketing", "idea"]).optional(),
        dueDate: z.date().optional(),
        position: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { ticketId, ...updates } = input;
        await db.updateTicket(ticketId, ctx.user.id, updates);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteTicket(input.ticketId, ctx.user.id);
        return { success: true };
      }),
    
    // Sub-tasks
    getSubTasks: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTicketSubTasks(input.ticketId);
      }),
    
    createSubTask: protectedProcedure
      .input(z.object({
        ticketId: z.number(),
        title: z.string().min(1).max(255),
        position: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const subTaskId = await db.createSubTask(input);
        return { subTaskId };
      }),
    
    updateSubTask: protectedProcedure
      .input(z.object({
        subTaskId: z.number(),
        title: z.string().min(1).max(255).optional(),
        completed: z.boolean().optional(),
        position: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { subTaskId, ...updates } = input;
        await db.updateSubTask(subTaskId, updates);
        return { success: true };
      }),
    
    deleteSubTask: protectedProcedure
      .input(z.object({ subTaskId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSubTask(input.subTaskId);
        return { success: true };
      }),
    
    // Comments
    getComments: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTicketComments(input.ticketId);
      }),
    
    createComment: protectedProcedure
      .input(z.object({
        ticketId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const commentId = await db.createComment({
          ...input,
          userId: ctx.user.id,
        });
        return { commentId };
      }),
  }),

  ticketTags: router({
    list: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTicketTags(input.ticketId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        ticketId: z.number(),
        tagType: z.enum(["character", "location", "scene", "plot", "worldbuilding", "research", "custom"]),
        tagId: z.number().optional(),
        tagName: z.string().min(1).max(255),
      }))
      .mutation(async ({ input }) => {
        const tagId = await db.createTicketTag(input);
        return { tagId };
      }),
    
    delete: protectedProcedure
      .input(z.object({ tagId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTicketTag(input.tagId);
        return { success: true };
      }),
  }),

  customSections: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCustomSections(input.projectId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        title: z.string().min(1).max(100),
        position: z.number().default(0),
        color: z.string().max(7).default("#8b5cf6"),
      }))
      .mutation(async ({ ctx, input }) => {
        const sectionId = await db.createCustomSection({
          ...input,
          userId: ctx.user.id,
        });
        const section = await db.getCustomSectionById(sectionId);
        return section;
      }),
    
    update: protectedProcedure
      .input(z.object({
        sectionId: z.number(),
        title: z.string().min(1).max(100).optional(),
        position: z.number().optional(),
        color: z.string().max(7).optional(),
      }))
      .mutation(async ({ input }) => {
        const { sectionId, ...updates } = input;
        await db.updateCustomSection(sectionId, updates);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ sectionId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCustomSection(input.sectionId);
        return { success: true };
      }),
  }),

  manuscripts: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getProjectManuscripts(input.projectId, ctx.user.id);
      }),
    
    get: protectedProcedure
      .input(z.object({ manuscriptId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getManuscriptById(input.manuscriptId, ctx.user.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        ticketId: z.number().optional(),
        title: z.string().min(1).max(255),
        content: z.string().default(""),
      }))
      .mutation(async ({ ctx, input }) => {
        const wordCount = input.content.trim().split(/\s+/).filter(w => w.length > 0).length;
        const manuscriptId = await db.createManuscript({
          ...input,
          userId: ctx.user.id,
          wordCount,
        });
        return { manuscriptId };
      }),
    
    update: protectedProcedure
      .input(z.object({
        manuscriptId: z.number(),
        title: z.string().min(1).max(255).optional(),
        content: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { manuscriptId, ...updates } = input;
        
        // Calculate word count if content is being updated
        if (updates.content !== undefined) {
          const wordCount = updates.content.trim().split(/\s+/).filter(w => w.length > 0).length;
          await db.updateManuscript(manuscriptId, ctx.user.id, { ...updates, wordCount });
        } else {
          await db.updateManuscript(manuscriptId, ctx.user.id, updates);
        }
        
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ manuscriptId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteManuscript(input.manuscriptId, ctx.user.id);
        return { success: true };
      }),
    
    getAnalyses: protectedProcedure
      .input(z.object({ manuscriptId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getManuscriptAnalyses(input.manuscriptId, ctx.user.id);
      }),
    
    // Chapter critique - analyze selected text/chapter
    critiqueChapter: protectedProcedure
      .input(
        z.object({
          manuscriptId: z.number(),
          chapterTitle: z.string().optional(),
          selectedText: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const manuscript = await db.getManuscriptById(input.manuscriptId, ctx.user.id);
        if (!manuscript) {
          throw new Error("Manuscript not found");
        }

        const { invokeLLM } = await import("./_core/llm");
        const { EDITOR_SYSTEM_PROMPT } = await import("./editorPersona");

        const chapterPrompt = `Please provide a focused editorial critique of this chapter/section:

${input.chapterTitle ? `**Chapter**: ${input.chapterTitle}\n` : ""}**Content**:
${input.selectedText}

---

Provide your critique in this format:

## Quick Assessment
[2-3 sentence summary of strengths and key issues]

## What's Working
[Specific strengths in this section]

## Areas for Improvement
[Specific issues with concrete examples]

## Immediate Action Steps
[3-5 actionable suggestions for revision]

## Score
[Rate this section 1-10 with brief justification]`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: EDITOR_SYSTEM_PROMPT },
            { role: "user", content: chapterPrompt },
          ],
        });

        const critiqueText = response.choices[0]?.message?.content || "Unable to generate critique.";

        return {
          critique: critiqueText,
          manuscriptId: input.manuscriptId,
          chapterTitle: input.chapterTitle,
        };
      }),

    analyze: protectedProcedure
      .input(z.object({
        manuscriptId: z.number(),
        genre: z.string().optional(),
        targetAudience: z.string().optional(),
        specificConcerns: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const { buildAnalysisPrompt, parseAnalysisResponse, EDITOR_SYSTEM_PROMPT } = await import("./editorPersona");
        
        // Get manuscript
        const manuscript = await db.getManuscriptById(input.manuscriptId, ctx.user.id);
        if (!manuscript) {
          throw new Error("Manuscript not found");
        }
        
        // Build analysis prompt
        const userPrompt = buildAnalysisPrompt({
          title: manuscript.title,
          content: manuscript.content,
          genre: input.genre,
          targetAudience: input.targetAudience,
          specificConcerns: input.specificConcerns,
        });
        
        // Call LLM with editor persona
        const response = await invokeLLM({
          messages: [
            { role: "system", content: EDITOR_SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
        });
        
        const analysisText = typeof response.choices[0].message.content === 'string' 
          ? response.choices[0].message.content 
          : JSON.stringify(response.choices[0].message.content);
        const parsedAnalysis = parseAnalysisResponse(analysisText);
        
        // Save analysis to database
        const analysisId = await db.createManuscriptAnalysis({
          manuscriptId: input.manuscriptId,
          userId: ctx.user.id,
          overallAssessment: parsedAnalysis.overallAssessment,
          structuralAnalysis: parsedAnalysis.structuralAnalysis,
          characterDevelopment: parsedAnalysis.characterDevelopment,
          dialogueQuality: parsedAnalysis.dialogueQuality,
          proseAndStyle: parsedAnalysis.proseAndStyle,
          priorityActionItems: JSON.stringify(parsedAnalysis.priorityActionItems),
          overallScore: parsedAnalysis.overallScore,
        });
        
        return { analysisId, ...parsedAnalysis };
      }),
  }),

  achievements: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllAchievements();
    }),
    
    userAchievements: protectedProcedure
      .input(z.object({ projectId: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return await db.getUserAchievements(ctx.user.id, input.projectId);
      }),
    
    checkProgress: protectedProcedure
      .input(z.object({
        projectId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        // Get all achievements
        const allAchievements = await db.getAllAchievements();
        const userAchievements = await db.getUserAchievements(ctx.user.id, input.projectId);
        
        // Get current stats
        const project = await db.getProjectById(input.projectId, ctx.user.id);
        const tickets = await db.getProjectTickets(input.projectId, ctx.user.id);
        const completedTickets = tickets.filter(t => t.status === 'done');
        
        // Calculate progress for each achievement
        const progress = await Promise.all(
          allAchievements.map(async (achievement) => {
            const userAchievement = userAchievements.find(
              ua => ua.achievementId === achievement.id
            );
            
            let currentProgress = 0;
            
            // Calculate progress based on achievement category
            if (achievement.category === 'word_count') {
              currentProgress = project?.currentWordCount || 0;
            } else if (achievement.category === 'tickets') {
              currentProgress = completedTickets.length;
            } else if (achievement.category === 'chapters') {
              const chapterTickets = completedTickets.filter(t => t.taskType === 'chapter');
              currentProgress = chapterTickets.length;
            }
            
            const isUnlocked = userAchievement !== undefined;
            const progressPercent = Math.min(100, (currentProgress / achievement.threshold) * 100);
            
            return {
              achievement,
              isUnlocked,
              progress: currentProgress,
              progressPercent,
              unlockedAt: userAchievement?.unlockedAt,
            };
          })
        );
        
        return progress;
      }),
    
    unlock: protectedProcedure
      .input(z.object({
        achievementId: z.number(),
        projectId: z.number().optional(),
        progress: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if already unlocked
        const existing = await db.getUserAchievementProgress(
          ctx.user.id,
          input.achievementId,
          input.projectId
        );
        
        if (existing) {
          return { alreadyUnlocked: true };
        }
        
        // Unlock the achievement
        const userAchievementId = await db.unlockAchievement({
          userId: ctx.user.id,
          projectId: input.projectId,
          achievementId: input.achievementId,
          progress: input.progress,
          notificationSent: false,
        });
        
        return { success: true, userAchievementId };
      }),
  }),
});

export type AppRouter = typeof appRouter;
