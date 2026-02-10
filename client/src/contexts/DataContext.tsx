import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import {
  getAllItems,
  getItemsByIndex,
  putItem,
  deleteItem,
  STORES,
  scheduleAutoSave,
  initDB,
} from '@/lib/storage';
import type {
  Project,
  Section,
  Ticket,
  Character,
  Location,
  Scene,
  Plot,
  Manuscript,
  Achievement,
} from '@/lib/types';

interface DataContextType {
  // Current project
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  
  // Projects
  projects: Project[];
  createProject: (title: string, description: string) => Promise<Project>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Sections
  sections: Section[];
  createSection: (title: string, color: string) => Promise<Section>;
  updateSection: (section: Section) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;
  
  // Tickets
  tickets: Ticket[];
  createTicket: (sectionId: string, title: string) => Promise<Ticket>;
  updateTicket: (ticket: Ticket) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  moveTicket: (ticketId: string, newSectionId: string) => Promise<void>;
  
  // Characters
  characters: Character[];
  createCharacter: (name: string) => Promise<Character>;
  updateCharacter: (character: Character) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  
  // Locations
  locations: Location[];
  createLocation: (name: string, type: string) => Promise<Location>;
  updateLocation: (location: Location) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  
  // Scenes
  scenes: Scene[];
  createScene: (title: string) => Promise<Scene>;
  updateScene: (scene: Scene) => Promise<void>;
  deleteScene: (id: string) => Promise<void>;
  
  // Plots
  plots: Plot[];
  createPlot: (type: string, title: string) => Promise<Plot>;
  updatePlot: (plot: Plot) => Promise<void>;
  deletePlot: (id: string) => Promise<void>;
  
  // Manuscripts
  manuscripts: Manuscript[];
  createManuscript: (title: string) => Promise<Manuscript>;
  updateManuscript: (manuscript: Manuscript) => Promise<void>;
  deleteManuscript: (id: string) => Promise<void>;
  
  // Achievements
  achievements: Achievement[];
  unlockAchievement: (id: string) => Promise<void>;
  
  // Loading state
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize database and load data
  useEffect(() => {
    async function loadData() {
      try {
        await initDB();
        
        const loadedProjects = await getAllItems<Project>(STORES.projects);
        setProjects(loadedProjects);
        
        // Set current project to the first one or create a default
        if (loadedProjects.length > 0) {
          setCurrentProject(loadedProjects[0]);
        }
        
        // Initialize achievements if none exist
        const loadedAchievements = await getAllItems<Achievement>(STORES.achievements);
        if (loadedAchievements.length === 0) {
          const defaultAchievements = createDefaultAchievements();
          for (const achievement of defaultAchievements) {
            await putItem(STORES.achievements, achievement);
          }
          setAchievements(defaultAchievements);
        } else {
          setAchievements(loadedAchievements);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Load project-specific data when current project changes
  useEffect(() => {
    if (!currentProject) return;
    
    const projectId = currentProject.id;
    
    async function loadProjectData() {
      try {
        const [
          loadedSections,
          loadedTickets,
          loadedCharacters,
          loadedLocations,
          loadedScenes,
          loadedPlots,
          loadedManuscripts,
        ] = await Promise.all([
          getItemsByIndex<Section>(STORES.sections, 'projectId', projectId),
          getItemsByIndex<Ticket>(STORES.tickets, 'projectId', projectId),
          getItemsByIndex<Character>(STORES.characters, 'projectId', projectId),
          getItemsByIndex<Location>(STORES.locations, 'projectId', projectId),
          getItemsByIndex<Scene>(STORES.scenes, 'projectId', projectId),
          getItemsByIndex<Plot>(STORES.plots, 'projectId', projectId),
          getItemsByIndex<Manuscript>(STORES.manuscripts, 'projectId', projectId),
        ]);
        
        setSections(loadedSections.sort((a, b) => a.order - b.order));
        setTickets(loadedTickets);
        setCharacters(loadedCharacters);
        setLocations(loadedLocations);
        setScenes(loadedScenes.sort((a, b) => a.order - b.order));
        setPlots(loadedPlots);
        setManuscripts(loadedManuscripts);
      } catch (error) {
        console.error('Failed to load project data:', error);
      }
    }
    
    loadProjectData();
  }, [currentProject]);

  // Projects
  const createProject = useCallback(async (title: string, description: string): Promise<Project> => {
    const project: Project = {
      id: nanoid(),
      title,
      description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await putItem(STORES.projects, project);
    setProjects(prev => [...prev, project]);
    setCurrentProject(project);
    
    // Create default sections
    const defaultSections = [
      { title: 'Backlog', color: '#6b7280' },
      { title: 'Research', color: '#3b82f6' },
      { title: 'Outlining', color: '#8b5cf6' },
      { title: 'First Draft', color: '#a855f7' },
      { title: 'Revisions', color: '#ec4899' },
      { title: 'Editing', color: '#f59e0b' },
      { title: 'Done', color: '#10b981' },
    ];
    
    const createdSections: Section[] = [];
    for (let i = 0; i < defaultSections.length; i++) {
      const section: Section = {
        id: nanoid(),
        projectId: project.id,
        title: defaultSections[i].title,
        color: defaultSections[i].color,
        order: i,
      };
      await putItem(STORES.sections, section);
      createdSections.push(section);
    }
    setSections(createdSections);
    
    return project;
  }, []);

  const updateProject = useCallback(async (project: Project): Promise<void> => {
    const updated = { ...project, updatedAt: Date.now() };
    await putItem(STORES.projects, updated);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    if (currentProject?.id === updated.id) {
      setCurrentProject(updated);
    }
  }, [currentProject]);

  const deleteProject = useCallback(async (id: string): Promise<void> => {
    await deleteItem(STORES.projects, id);
    setProjects(prev => prev.filter(p => p.id !== id));
    if (currentProject?.id === id) {
      setCurrentProject(null);
    }
  }, [currentProject]);

  // Sections
  const createSection = useCallback(async (title: string, color: string): Promise<Section> => {
    if (!currentProject) throw new Error('No current project');
    
    const section: Section = {
      id: nanoid(),
      projectId: currentProject.id,
      title,
      color,
      order: sections.length,
    };
    
    await putItem(STORES.sections, section);
    setSections(prev => [...prev, section]);
    return section;
  }, [currentProject, sections.length]);

  const updateSection = useCallback(async (section: Section): Promise<void> => {
    await putItem(STORES.sections, section);
    setSections(prev => prev.map(s => s.id === section.id ? section : s));
  }, []);

  const deleteSection = useCallback(async (id: string): Promise<void> => {
    await deleteItem(STORES.sections, id);
    setSections(prev => prev.filter(s => s.id !== id));
  }, []);

  // Tickets
  const createTicket = useCallback(async (sectionId: string, title: string): Promise<Ticket> => {
    if (!currentProject) throw new Error('No current project');
    
    const ticket: Ticket = {
      id: nanoid(),
      projectId: currentProject.id,
      sectionId,
      title,
      description: '',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await putItem(STORES.tickets, ticket);
    setTickets(prev => [...prev, ticket]);
    return ticket;
  }, [currentProject]);

  const updateTicket = useCallback(async (ticket: Ticket): Promise<void> => {
    const updated = { ...ticket, updatedAt: Date.now() };
    await putItem(STORES.tickets, updated);
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
    scheduleAutoSave(() => {});
  }, []);

  const deleteTicket = useCallback(async (id: string): Promise<void> => {
    await deleteItem(STORES.tickets, id);
    setTickets(prev => prev.filter(t => t.id !== id));
  }, []);

  const moveTicket = useCallback(async (ticketId: string, newSectionId: string): Promise<void> => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    const updated = { ...ticket, sectionId: newSectionId, updatedAt: Date.now() };
    await putItem(STORES.tickets, updated);
    setTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
  }, [tickets]);

  // Characters
  const createCharacter = useCallback(async (name: string): Promise<Character> => {
    if (!currentProject) throw new Error('No current project');
    
    const character: Character = {
      id: nanoid(),
      projectId: currentProject.id,
      name,
      role: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await putItem(STORES.characters, character);
    setCharacters(prev => [...prev, character]);
    return character;
  }, [currentProject]);

  const updateCharacter = useCallback(async (character: Character): Promise<void> => {
    const updated = { ...character, updatedAt: Date.now() };
    await putItem(STORES.characters, updated);
    setCharacters(prev => prev.map(c => c.id === updated.id ? updated : c));
    scheduleAutoSave(() => {});
  }, []);

  const deleteCharacter = useCallback(async (id: string): Promise<void> => {
    await deleteItem(STORES.characters, id);
    setCharacters(prev => prev.filter(c => c.id !== id));
  }, []);

  // Locations
  const createLocation = useCallback(async (name: string, type: string): Promise<Location> => {
    if (!currentProject) throw new Error('No current project');
    
    const location: Location = {
      id: nanoid(),
      projectId: currentProject.id,
      name,
      type,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await putItem(STORES.locations, location);
    setLocations(prev => [...prev, location]);
    return location;
  }, [currentProject]);

  const updateLocation = useCallback(async (location: Location): Promise<void> => {
    const updated = { ...location, updatedAt: Date.now() };
    await putItem(STORES.locations, updated);
    setLocations(prev => prev.map(l => l.id === updated.id ? updated : l));
    scheduleAutoSave(() => {});
  }, []);

  const deleteLocation = useCallback(async (id: string): Promise<void> => {
    await deleteItem(STORES.locations, id);
    setLocations(prev => prev.filter(l => l.id !== id));
  }, []);

  // Scenes
  const createScene = useCallback(async (title: string): Promise<Scene> => {
    if (!currentProject) throw new Error('No current project');
    
    const scene: Scene = {
      id: nanoid(),
      projectId: currentProject.id,
      title,
      order: scenes.length,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await putItem(STORES.scenes, scene);
    setScenes(prev => [...prev, scene]);
    return scene;
  }, [currentProject, scenes.length]);

  const updateScene = useCallback(async (scene: Scene): Promise<void> => {
    const updated = { ...scene, updatedAt: Date.now() };
    await putItem(STORES.scenes, updated);
    setScenes(prev => prev.map(s => s.id === updated.id ? updated : s));
    scheduleAutoSave(() => {});
  }, []);

  const deleteScene = useCallback(async (id: string): Promise<void> => {
    await deleteItem(STORES.scenes, id);
    setScenes(prev => prev.filter(s => s.id !== id));
  }, []);

  // Plots
  const createPlot = useCallback(async (type: string, title: string): Promise<Plot> => {
    if (!currentProject) throw new Error('No current project');
    
    const plot: Plot = {
      id: nanoid(),
      projectId: currentProject.id,
      type,
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await putItem(STORES.plots, plot);
    setPlots(prev => [...prev, plot]);
    return plot;
  }, [currentProject]);

  const updatePlot = useCallback(async (plot: Plot): Promise<void> => {
    const updated = { ...plot, updatedAt: Date.now() };
    await putItem(STORES.plots, updated);
    setPlots(prev => prev.map(p => p.id === updated.id ? updated : p));
    scheduleAutoSave(() => {});
  }, []);

  const deletePlot = useCallback(async (id: string): Promise<void> => {
    await deleteItem(STORES.plots, id);
    setPlots(prev => prev.filter(p => p.id !== id));
  }, []);

  // Manuscripts
  const createManuscript = useCallback(async (title: string): Promise<Manuscript> => {
    if (!currentProject) throw new Error('No current project');
    
    const manuscript: Manuscript = {
      id: nanoid(),
      projectId: currentProject.id,
      title,
      content: '',
      wordCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await putItem(STORES.manuscripts, manuscript);
    setManuscripts(prev => [...prev, manuscript]);
    return manuscript;
  }, [currentProject]);

  const updateManuscript = useCallback(async (manuscript: Manuscript): Promise<void> => {
    const updated = { ...manuscript, updatedAt: Date.now() };
    await putItem(STORES.manuscripts, updated);
    setManuscripts(prev => prev.map(m => m.id === updated.id ? updated : m));
    scheduleAutoSave(() => {});
  }, []);

  const deleteManuscript = useCallback(async (id: string): Promise<void> => {
    await deleteItem(STORES.manuscripts, id);
    setManuscripts(prev => prev.filter(m => m.id !== id));
  }, []);

  // Achievements
  const unlockAchievement = useCallback(async (id: string): Promise<void> => {
    const achievement = achievements.find(a => a.id === id);
    if (!achievement || achievement.unlocked) return;
    
    const updated = { ...achievement, unlocked: true, unlockedAt: Date.now() };
    await putItem(STORES.achievements, updated);
    setAchievements(prev => prev.map(a => a.id === id ? updated : a));
  }, [achievements]);

  const value: DataContextType = {
    currentProject,
    setCurrentProject,
    projects,
    createProject,
    updateProject,
    deleteProject,
    sections,
    createSection,
    updateSection,
    deleteSection,
    tickets,
    createTicket,
    updateTicket,
    deleteTicket,
    moveTicket,
    characters,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    locations,
    createLocation,
    updateLocation,
    deleteLocation,
    scenes,
    createScene,
    updateScene,
    deleteScene,
    plots,
    createPlot,
    updatePlot,
    deletePlot,
    manuscripts,
    createManuscript,
    updateManuscript,
    deleteManuscript,
    achievements,
    unlockAchievement,
    isLoading,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}

function createDefaultAchievements(): Achievement[] {
  return [
    {
      id: 'first-project',
      title: 'First Steps',
      description: 'Create your first project',
      icon: '📝',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
    },
    {
      id: 'first-character',
      title: 'Character Creator',
      description: 'Add your first character',
      icon: '👤',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
    },
    {
      id: 'word-count-1k',
      title: 'Wordsmith',
      description: 'Write 1,000 words',
      icon: '✍️',
      unlocked: false,
      progress: 0,
      maxProgress: 1000,
    },
    {
      id: 'word-count-10k',
      title: 'Novelist',
      description: 'Write 10,000 words',
      icon: '📖',
      unlocked: false,
      progress: 0,
      maxProgress: 10000,
    },
    {
      id: 'complete-chapter',
      title: 'Chapter Complete',
      description: 'Complete your first chapter',
      icon: '✅',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
    },
  ];
}
