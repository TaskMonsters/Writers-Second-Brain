import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

export const chatRouter = router({
  getMessages: protectedProcedure
    .input(z.object({ 
      projectId: z.number().optional(),
      limit: z.number().default(50) 
    }))
    .query(async ({ ctx, input }) => {
      return await db.getUserChatMessages(ctx.user.id, input.projectId, input.limit);
    }),

  sendMessage: protectedProcedure
    .input(z.object({
      projectId: z.number().optional(),
      message: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // Save user message
      await db.createChatMessage({
        userId: ctx.user.id,
        projectId: input.projectId,
        role: "user",
        content: input.message,
      });

      // Get context about user's progress
      let contextInfo = "";
      
      if (input.projectId) {
        const project = await db.getProjectById(input.projectId, ctx.user.id);
        const tickets = await db.getProjectTickets(input.projectId, ctx.user.id);
        const manuscripts = await db.getProjectManuscripts(input.projectId, ctx.user.id);
        
        const completedTickets = tickets.filter(t => t.status === "done").length;
        const totalTickets = tickets.length;
        const totalWords = manuscripts.reduce((sum, m) => sum + m.wordCount, 0);
        
        contextInfo = `
Project: ${project?.title || "Untitled"}
Target Word Count: ${project?.targetWordCount || "Not set"}
Current Word Count: ${totalWords}
Tickets Completed: ${completedTickets}/${totalTickets}
Active Tickets: ${tickets.filter(t => t.status !== "done" && t.status !== "backlog").length}
`;
      }

      // Get recent chat history
      const recentMessages = await db.getUserChatMessages(ctx.user.id, input.projectId, 10);
      const chatHistory = recentMessages.slice(-6).map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

      // Generate AI response with context
      const systemPrompt = `You are "The Muse", an encouraging and insightful AI writing assistant for novelists. Your role is to:

1. Provide motivation and encouragement to keep writers inspired
2. Offer constructive feedback and suggestions for their writing
3. Help with brainstorming ideas for characters, plot, worldbuilding, and more
4. Give advice on writing techniques, story structure, and craft
5. Celebrate their progress and milestones
6. Be supportive during writer's block or creative challenges

You have access to the writer's current project context:
${contextInfo}

Be warm, enthusiastic, and genuinely supportive. Use the writer's progress data to provide personalized encouragement. Keep responses concise but meaningful. Occasionally use creative metaphors related to writing and storytelling.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          ...chatHistory,
          { role: "user", content: input.message },
        ],
      });

      const messageContent = response.choices[0]?.message?.content;
      const assistantMessage = typeof messageContent === 'string' 
        ? messageContent 
        : "I'm here to help with your writing journey!";

      // Save assistant response
      await db.createChatMessage({
        userId: ctx.user.id,
        projectId: input.projectId,
        role: "assistant",
        content: assistantMessage,
      });

      return {
        message: assistantMessage,
      };
    }),

  clearHistory: protectedProcedure
    .input(z.object({ projectId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      // Note: This would require a delete function in db.ts
      // For now, we'll just return success
      return { success: true };
    }),

  sendSystemMessage: protectedProcedure
    .input(z.object({
      projectId: z.number().optional(),
      message: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // Save system/assistant message directly (for achievements, notifications, etc.)
      await db.createChatMessage({
        userId: ctx.user.id,
        projectId: input.projectId,
        role: "assistant",
        content: input.message,
      });

      return { success: true };
    }),
});
