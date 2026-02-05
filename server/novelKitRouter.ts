import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as novelKitDb from "./novelKitDb";

export const novelKitRouter = router({
  // Characters
  characters: router({
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        ticketId: z.number().optional(),
        name: z.string(),
        role: z.string().optional(),
        age: z.string().optional(),
        occupation: z.string().optional(),
        physicalDescription: z.string().optional(),
        personality: z.string().optional(),
        backstory: z.string().optional(),
        goals: z.string().optional(),
        conflicts: z.string().optional(),
        relationships: z.any().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await novelKitDb.createCharacter({
          ...input,
          userId: ctx.user.id,
        });
      }),

    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await novelKitDb.getProjectCharacters(input.projectId, ctx.user.id);
      }),

    get: protectedProcedure
      .input(z.object({ characterId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await novelKitDb.getCharacterById(input.characterId, ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        characterId: z.number(),
        name: z.string().optional(),
        role: z.string().optional(),
        age: z.string().optional(),
        occupation: z.string().optional(),
        physicalDescription: z.string().optional(),
        personality: z.string().optional(),
        backstory: z.string().optional(),
        goals: z.string().optional(),
        conflicts: z.string().optional(),
        relationships: z.any().optional(),
        interview: z.any().optional(),
        imageUrl: z.string().optional(),
        ticketId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { characterId, ...data } = input;
        return await novelKitDb.updateCharacter(characterId, ctx.user.id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ characterId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await novelKitDb.deleteCharacter(input.characterId, ctx.user.id);
      }),
  }),

  // Locations
  locations: router({
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        ticketId: z.number().optional(),
        name: z.string(),
        type: z.string().optional(),
        description: z.string().optional(),
        history: z.string().optional(),
        culture: z.string().optional(),
        geography: z.string().optional(),
        climate: z.string().optional(),
        population: z.string().optional(),
        government: z.string().optional(),
        economy: z.string().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await novelKitDb.createLocation({
          ...input,
          userId: ctx.user.id,
        });
      }),

    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await novelKitDb.getProjectLocations(input.projectId, ctx.user.id);
      }),

    get: protectedProcedure
      .input(z.object({ locationId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await novelKitDb.getLocationById(input.locationId, ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        locationId: z.number(),
        name: z.string().optional(),
        type: z.string().optional(),
        description: z.string().optional(),
        history: z.string().optional(),
        culture: z.string().optional(),
        geography: z.string().optional(),
        climate: z.string().optional(),
        population: z.string().optional(),
        government: z.string().optional(),
        economy: z.string().optional(),
        imageUrl: z.string().optional(),
        ticketId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { locationId, ...data } = input;
        return await novelKitDb.updateLocation(locationId, ctx.user.id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ locationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await novelKitDb.deleteLocation(input.locationId, ctx.user.id);
      }),
  }),

  // Plot Beats
  plotBeats: router({
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        ticketId: z.number().optional(),
        beatName: z.string(),
        description: z.string().optional(),
        chapter: z.string().optional(),
        wordCount: z.number().optional(),
        position: z.number().optional(),
        completed: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await novelKitDb.createPlotBeat({
          ...input,
          userId: ctx.user.id,
        });
      }),

    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await novelKitDb.getProjectPlotBeats(input.projectId, ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        plotBeatId: z.number(),
        beatName: z.string().optional(),
        description: z.string().optional(),
        chapter: z.string().optional(),
        wordCount: z.number().optional(),
        position: z.number().optional(),
        completed: z.boolean().optional(),
        ticketId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { plotBeatId, ...data } = input;
        return await novelKitDb.updatePlotBeat(plotBeatId, ctx.user.id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ plotBeatId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await novelKitDb.deletePlotBeat(input.plotBeatId, ctx.user.id);
      }),
  }),

  // Scenes
  scenes: router({
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        ticketId: z.number().optional(),
        manuscriptId: z.number().optional(),
        title: z.string(),
        chapter: z.string().optional(),
        povCharacterId: z.number().optional(),
        locationId: z.number().optional(),
        summary: z.string().optional(),
        goal: z.string().optional(),
        conflict: z.string().optional(),
        outcome: z.string().optional(),
        position: z.number().optional(),
        wordCount: z.number().optional(),
        completed: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await novelKitDb.createScene({
          ...input,
          userId: ctx.user.id,
        });
      }),

    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await novelKitDb.getProjectScenes(input.projectId, ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        sceneId: z.number(),
        title: z.string().optional(),
        chapter: z.string().optional(),
        povCharacterId: z.number().optional(),
        locationId: z.number().optional(),
        summary: z.string().optional(),
        goal: z.string().optional(),
        conflict: z.string().optional(),
        outcome: z.string().optional(),
        position: z.number().optional(),
        wordCount: z.number().optional(),
        completed: z.boolean().optional(),
        ticketId: z.number().optional(),
        manuscriptId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { sceneId, ...data } = input;
        return await novelKitDb.updateScene(sceneId, ctx.user.id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ sceneId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await novelKitDb.deleteScene(input.sceneId, ctx.user.id);
      }),
  }),

  // World Elements
  worldElements: router({
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        ticketId: z.number().optional(),
        name: z.string(),
        type: z.string().optional(),
        description: z.string().optional(),
        rules: z.string().optional(),
        history: z.string().optional(),
        significance: z.string().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await novelKitDb.createWorldElement({
          ...input,
          userId: ctx.user.id,
        });
      }),

    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await novelKitDb.getProjectWorldElements(input.projectId, ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        worldElementId: z.number(),
        name: z.string().optional(),
        type: z.string().optional(),
        description: z.string().optional(),
        rules: z.string().optional(),
        history: z.string().optional(),
        significance: z.string().optional(),
        imageUrl: z.string().optional(),
        ticketId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { worldElementId, ...data } = input;
        return await novelKitDb.updateWorldElement(worldElementId, ctx.user.id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ worldElementId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await novelKitDb.deleteWorldElement(input.worldElementId, ctx.user.id);
      }),
  }),

  // Timeline Events
  timeline: router({
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        title: z.string(),
        date: z.string().optional(),
        description: z.string().optional(),
        type: z.string().optional(),
        position: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await novelKitDb.createTimelineEvent({
          ...input,
          userId: ctx.user.id,
        });
      }),

    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await novelKitDb.getProjectTimelineEvents(input.projectId, ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        timelineEventId: z.number(),
        title: z.string().optional(),
        date: z.string().optional(),
        description: z.string().optional(),
        type: z.string().optional(),
        position: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { timelineEventId, ...data } = input;
        return await novelKitDb.updateTimelineEvent(timelineEventId, ctx.user.id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ timelineEventId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await novelKitDb.deleteTimelineEvent(input.timelineEventId, ctx.user.id);
      }),
  }),

  // Outlines
  outlines: router({
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        method: z.enum(["snowflake", "beat_mapping", "mind_mapping", "synopsis"]),
        title: z.string(),
        content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createOutline } = await import("./db");
        const id = await createOutline(input);
        return { id };
      }),

    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getProjectOutlines } = await import("./db");
        return await getProjectOutlines(input.projectId);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateOutline } = await import("./db");
        const { id, ...data } = input;
        return await updateOutline(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteOutline } = await import("./db");
        return await deleteOutline(input.id);
      }),
  }),
});
