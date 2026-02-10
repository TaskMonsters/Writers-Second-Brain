/**
 * IndexedDB Storage Utility
 * Provides persistent storage that survives cache clearing
 */

const DB_NAME = 'ManuscriptOS';
const DB_VERSION = 1;
const STORES = {
  projects: 'projects',
  tickets: 'tickets',
  sections: 'sections',
  characters: 'characters',
  locations: 'locations',
  scenes: 'scenes',
  plots: 'plots',
  manuscripts: 'manuscripts',
  achievements: 'achievements',
  settings: 'settings',
};

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize IndexedDB
 */
export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.projects)) {
        const projectStore = db.createObjectStore(STORES.projects, { keyPath: 'id' });
        projectStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.tickets)) {
        const ticketStore = db.createObjectStore(STORES.tickets, { keyPath: 'id' });
        ticketStore.createIndex('projectId', 'projectId', { unique: false });
        ticketStore.createIndex('sectionId', 'sectionId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.sections)) {
        const sectionStore = db.createObjectStore(STORES.sections, { keyPath: 'id' });
        sectionStore.createIndex('projectId', 'projectId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.characters)) {
        const characterStore = db.createObjectStore(STORES.characters, { keyPath: 'id' });
        characterStore.createIndex('projectId', 'projectId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.locations)) {
        const locationStore = db.createObjectStore(STORES.locations, { keyPath: 'id' });
        locationStore.createIndex('projectId', 'projectId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.scenes)) {
        const sceneStore = db.createObjectStore(STORES.scenes, { keyPath: 'id' });
        sceneStore.createIndex('projectId', 'projectId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.plots)) {
        const plotStore = db.createObjectStore(STORES.plots, { keyPath: 'id' });
        plotStore.createIndex('projectId', 'projectId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.manuscripts)) {
        const manuscriptStore = db.createObjectStore(STORES.manuscripts, { keyPath: 'id' });
        manuscriptStore.createIndex('projectId', 'projectId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.achievements)) {
        db.createObjectStore(STORES.achievements, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.settings)) {
        db.createObjectStore(STORES.settings, { keyPath: 'key' });
      }
    };
  });
}

/**
 * Generic get operation
 */
export async function getItem<T>(storeName: string, key: string): Promise<T | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Generic get all operation
 */
export async function getAllItems<T>(storeName: string): Promise<T[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Generic get by index operation
 */
export async function getItemsByIndex<T>(
  storeName: string,
  indexName: string,
  value: string
): Promise<T[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Generic put operation (add or update)
 */
export async function putItem<T>(storeName: string, item: T): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Generic delete operation
 */
export async function deleteItem(storeName: string, key: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all data from a store
 */
export async function clearStore(storeName: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Export all data (for backup)
 */
export async function exportAllData(): Promise<Record<string, any[]>> {
  const data: Record<string, any[]> = {};
  
  for (const storeName of Object.values(STORES)) {
    data[storeName] = await getAllItems(storeName);
  }
  
  return data;
}

/**
 * Import data (for restore)
 */
export async function importAllData(data: Record<string, any[]>): Promise<void> {
  for (const [storeName, items] of Object.entries(data)) {
    if (Object.values(STORES).includes(storeName)) {
      await clearStore(storeName);
      for (const item of items) {
        await putItem(storeName, item);
      }
    }
  }
}

// Auto-save debounce utility
let autoSaveTimer: NodeJS.Timeout | null = null;

export function scheduleAutoSave(callback: () => void, delay: number = 2000): void {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }
  autoSaveTimer = setTimeout(callback, delay);
}

export { STORES };
