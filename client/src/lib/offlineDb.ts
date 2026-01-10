/**
 * NeuroExecução Offline Database
 * IndexedDB wrapper for offline data storage and sync
 */

const DB_NAME = 'neuroplan-offline';
const DB_VERSION = 1;

// Store names
export const STORES = {
  PROJECTS: 'projects',
  TASKS: 'tasks',
  IDEAS: 'ideas',
  FOCUS_SESSIONS: 'focusSessions',
  PENDING_SYNC: 'pendingSync',
  USER_DATA: 'userData',
} as const;

type StoreName = typeof STORES[keyof typeof STORES];

// Pending sync operation types
export type SyncOperation = {
  id: string;
  store: StoreName;
  operation: 'create' | 'update' | 'delete';
  data: unknown;
  timestamp: number;
  retries: number;
};

// Initialize the database
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[OfflineDB] Failed to open database:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('[OfflineDB] Database opened successfully');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      console.log('[OfflineDB] Upgrading database...');
      const db = (event.target as IDBOpenDBRequest).result;

      // Projects store
      if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
        const projectsStore = db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
        projectsStore.createIndex('userId', 'userId', { unique: false });
        projectsStore.createIndex('status', 'status', { unique: false });
        projectsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // Tasks store
      if (!db.objectStoreNames.contains(STORES.TASKS)) {
        const tasksStore = db.createObjectStore(STORES.TASKS, { keyPath: 'id' });
        tasksStore.createIndex('projectId', 'projectId', { unique: false });
        tasksStore.createIndex('status', 'status', { unique: false });
        tasksStore.createIndex('dayNumber', 'dayNumber', { unique: false });
      }

      // Ideas store
      if (!db.objectStoreNames.contains(STORES.IDEAS)) {
        const ideasStore = db.createObjectStore(STORES.IDEAS, { keyPath: 'id' });
        ideasStore.createIndex('userId', 'userId', { unique: false });
        ideasStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Focus sessions store
      if (!db.objectStoreNames.contains(STORES.FOCUS_SESSIONS)) {
        const focusStore = db.createObjectStore(STORES.FOCUS_SESSIONS, { keyPath: 'id' });
        focusStore.createIndex('taskId', 'taskId', { unique: false });
        focusStore.createIndex('startedAt', 'startedAt', { unique: false });
      }

      // Pending sync operations store
      if (!db.objectStoreNames.contains(STORES.PENDING_SYNC)) {
        const syncStore = db.createObjectStore(STORES.PENDING_SYNC, { keyPath: 'id' });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        syncStore.createIndex('store', 'store', { unique: false });
      }

      // User data store (for caching user profile, settings, etc.)
      if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
        db.createObjectStore(STORES.USER_DATA, { keyPath: 'key' });
      }

      console.log('[OfflineDB] Database upgrade complete');
    };
  });
}

// Get database connection
let dbInstance: IDBDatabase | null = null;

export async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }
  dbInstance = await initDB();
  return dbInstance;
}

// Generic CRUD operations
export async function getAll<T>(storeName: StoreName): Promise<T[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

export async function getById<T>(storeName: StoreName, id: number | string): Promise<T | undefined> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function getByIndex<T>(
  storeName: StoreName,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

export async function put<T>(storeName: StoreName, data: T): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function putMany<T>(storeName: StoreName, items: T[]): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    let completed = 0;
    const total = items.length;

    if (total === 0) {
      resolve();
      return;
    }

    items.forEach((item) => {
      const request = store.put(item);
      request.onsuccess = () => {
        completed++;
        if (completed === total) {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  });
}

export async function deleteById(storeName: StoreName, id: number | string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearStore(storeName: StoreName): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Pending sync operations
export async function addPendingSync(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retries'>): Promise<void> {
  const syncOp: SyncOperation = {
    ...operation,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    retries: 0,
  };
  await put(STORES.PENDING_SYNC, syncOp);
}

export async function getPendingSync(): Promise<SyncOperation[]> {
  return getAll<SyncOperation>(STORES.PENDING_SYNC);
}

export async function removePendingSync(id: string): Promise<void> {
  await deleteById(STORES.PENDING_SYNC, id);
}

export async function updatePendingSyncRetries(id: string, retries: number): Promise<void> {
  const operation = await getById<SyncOperation>(STORES.PENDING_SYNC, id);
  if (operation) {
    operation.retries = retries;
    await put(STORES.PENDING_SYNC, operation);
  }
}

// User data helpers
export async function setUserData(key: string, value: unknown): Promise<void> {
  await put(STORES.USER_DATA, { key, value, updatedAt: Date.now() });
}

export async function getUserData<T>(key: string): Promise<T | undefined> {
  const data = await getById<{ key: string; value: T }>(STORES.USER_DATA, key);
  return data?.value;
}

// Generate temporary offline ID
export function generateOfflineId(): number {
  // Use negative numbers for offline-created items
  // These will be replaced with server IDs after sync
  return -Math.floor(Math.random() * 1000000000);
}

// Check if ID is an offline-generated ID
export function isOfflineId(id: number): boolean {
  return id < 0;
}

// Export database for debugging
export async function exportDatabase(): Promise<Record<string, unknown[]>> {
  const result: Record<string, unknown[]> = {};
  
  for (const storeName of Object.values(STORES)) {
    result[storeName] = await getAll(storeName);
  }
  
  return result;
}

// Clear all offline data
export async function clearAllOfflineData(): Promise<void> {
  for (const storeName of Object.values(STORES)) {
    await clearStore(storeName);
  }
  console.log('[OfflineDB] All offline data cleared');
}
