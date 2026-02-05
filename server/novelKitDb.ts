import { eq, and, desc } from "drizzle-orm";
import { 
  characters, 
  locations, 
  plotBeats, 
  scenes, 
  worldElements, 
  timelineEvents,
  InsertCharacter,
  InsertLocation,
  InsertPlotBeat,
  InsertScene,
  InsertWorldElement,
  InsertTimelineEvent
} from "../drizzle/schema";
import { getDb } from "./db";

// Characters
export async function createCharacter(data: InsertCharacter) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(characters).values(data);
  return { characterId: Number((result as any).insertId) };
}

export async function getProjectCharacters(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(characters)
    .where(and(eq(characters.projectId, projectId), eq(characters.userId, userId)))
    .orderBy(desc(characters.createdAt));
}

export async function getCharacterById(characterId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(characters)
    .where(and(eq(characters.id, characterId), eq(characters.userId, userId)))
    .limit(1);
  
  return result[0];
}

export async function updateCharacter(characterId: number, userId: number, data: Partial<InsertCharacter>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(characters)
    .set(data)
    .where(and(eq(characters.id, characterId), eq(characters.userId, userId)));
  
  return { success: true };
}

export async function deleteCharacter(characterId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(characters)
    .where(and(eq(characters.id, characterId), eq(characters.userId, userId)));
  
  return { success: true };
}

// Locations
export async function createLocation(data: InsertLocation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(locations).values(data);
  return { locationId: Number((result as any).insertId) };
}

export async function getProjectLocations(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(locations)
    .where(and(eq(locations.projectId, projectId), eq(locations.userId, userId)))
    .orderBy(desc(locations.createdAt));
}

export async function getLocationById(locationId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(locations)
    .where(and(eq(locations.id, locationId), eq(locations.userId, userId)))
    .limit(1);
  
  return result[0];
}

export async function updateLocation(locationId: number, userId: number, data: Partial<InsertLocation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(locations)
    .set(data)
    .where(and(eq(locations.id, locationId), eq(locations.userId, userId)));
  
  return { success: true };
}

export async function deleteLocation(locationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(locations)
    .where(and(eq(locations.id, locationId), eq(locations.userId, userId)));
  
  return { success: true };
}

// Plot Beats
export async function createPlotBeat(data: InsertPlotBeat) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(plotBeats).values(data);
  return { plotBeatId: Number((result as any).insertId) };
}

export async function getProjectPlotBeats(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(plotBeats)
    .where(and(eq(plotBeats.projectId, projectId), eq(plotBeats.userId, userId)))
    .orderBy(plotBeats.position);
}

export async function updatePlotBeat(plotBeatId: number, userId: number, data: Partial<InsertPlotBeat>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(plotBeats)
    .set(data)
    .where(and(eq(plotBeats.id, plotBeatId), eq(plotBeats.userId, userId)));
  
  return { success: true };
}

export async function deletePlotBeat(plotBeatId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(plotBeats)
    .where(and(eq(plotBeats.id, plotBeatId), eq(plotBeats.userId, userId)));
  
  return { success: true };
}

// Scenes
export async function createScene(data: InsertScene) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(scenes).values(data);
  return { sceneId: Number((result as any).insertId) };
}

export async function getProjectScenes(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(scenes)
    .where(and(eq(scenes.projectId, projectId), eq(scenes.userId, userId)))
    .orderBy(scenes.position);
}

export async function updateScene(sceneId: number, userId: number, data: Partial<InsertScene>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(scenes)
    .set(data)
    .where(and(eq(scenes.id, sceneId), eq(scenes.userId, userId)));
  
  return { success: true };
}

export async function deleteScene(sceneId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(scenes)
    .where(and(eq(scenes.id, sceneId), eq(scenes.userId, userId)));
  
  return { success: true };
}

// World Elements
export async function createWorldElement(data: InsertWorldElement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(worldElements).values(data);
  return { worldElementId: Number((result as any).insertId) };
}

export async function getProjectWorldElements(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(worldElements)
    .where(and(eq(worldElements.projectId, projectId), eq(worldElements.userId, userId)))
    .orderBy(desc(worldElements.createdAt));
}

export async function updateWorldElement(worldElementId: number, userId: number, data: Partial<InsertWorldElement>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(worldElements)
    .set(data)
    .where(and(eq(worldElements.id, worldElementId), eq(worldElements.userId, userId)));
  
  return { success: true };
}

export async function deleteWorldElement(worldElementId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(worldElements)
    .where(and(eq(worldElements.id, worldElementId), eq(worldElements.userId, userId)));
  
  return { success: true };
}

// Timeline Events
export async function createTimelineEvent(data: InsertTimelineEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(timelineEvents).values(data);
  return { timelineEventId: Number((result as any).insertId) };
}

export async function getProjectTimelineEvents(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(timelineEvents)
    .where(and(eq(timelineEvents.projectId, projectId), eq(timelineEvents.userId, userId)))
    .orderBy(timelineEvents.position);
}

export async function updateTimelineEvent(timelineEventId: number, userId: number, data: Partial<InsertTimelineEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(timelineEvents)
    .set(data)
    .where(and(eq(timelineEvents.id, timelineEventId), eq(timelineEvents.userId, userId)));
  
  return { success: true };
}

export async function deleteTimelineEvent(timelineEventId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(timelineEvents)
    .where(and(eq(timelineEvents.id, timelineEventId), eq(timelineEvents.userId, userId)));
  
  return { success: true };
}
