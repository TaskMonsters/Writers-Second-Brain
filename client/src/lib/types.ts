export interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export interface Section {
  id: string;
  projectId: string;
  title: string;
  color: string;
  order: number;
}

export interface Ticket {
  id: string;
  projectId: string;
  sectionId: string;
  title: string;
  description: string;
  dueDate?: number;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Character {
  id: string;
  projectId: string;
  name: string;
  role: string;
  age?: string;
  appearance?: string;
  personality?: string;
  background?: string;
  goals?: string;
  conflicts?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Location {
  id: string;
  projectId: string;
  name: string;
  type: string;
  description?: string;
  atmosphere?: string;
  significance?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Scene {
  id: string;
  projectId: string;
  title: string;
  chapter?: string;
  pov?: string;
  location?: string;
  characters?: string[];
  summary?: string;
  notes?: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface Plot {
  id: string;
  projectId: string;
  type: string; // 'main' | 'subplot' | 'character-arc'
  title: string;
  description?: string;
  setup?: string;
  conflict?: string;
  resolution?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Manuscript {
  id: string;
  projectId: string;
  title: string;
  content: string;
  wordCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
}

export interface Settings {
  key: string;
  value: any;
}

export type NovelKitTab = 'characters' | 'locations' | 'scenes' | 'plot' | 'world';
