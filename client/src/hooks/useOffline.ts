/**
 * useOffline Hook
 * Manages offline state, data caching, and synchronization
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import {
  getAll,
  put,
  putMany,
  getByIndex,
  addPendingSync,
  getPendingSync,
  removePendingSync,
  updatePendingSyncRetries,
  STORES,
  generateOfflineId,
  isOfflineId,
  type SyncOperation,
} from '@/lib/offlineDb';
import { toast } from 'sonner';

// Types for offline data
export interface OfflineProject {
  id: number;
  userId: number;
  title: string;
  briefing: string | null;
  status: string;
  cycleDays: number;
  currentCycle: number;
  createdAt: number;
  updatedAt: number;
  _offline?: boolean;
}

export interface OfflineTask {
  id: number;
  projectId: number;
  title: string;
  description: string | null;
  type: string;
  status: string;
  dayNumber: number;
  priority: number;
  effort: number | null;
  impact: number | null;
  createdAt: number;
  updatedAt: number;
  _offline?: boolean;
}

export interface OfflineIdea {
  id: number;
  userId: number;
  content: string;
  projectId: number | null;
  createdAt: number;
  _offline?: boolean;
}

export interface OfflineState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  lastSyncAt: number | null;
}

const MAX_SYNC_RETRIES = 3;
const SYNC_RETRY_DELAY = 5000; // 5 seconds

export function useOffline() {
  const [state, setState] = useState<OfflineState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    pendingSyncCount: 0,
    lastSyncAt: null,
  });

  const syncInProgress = useRef(false);
  const utils = trpc.useUtils();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('[Offline] Connection restored');
      setState(prev => ({ ...prev, isOnline: true }));
      toast.success('Conexão restaurada! Sincronizando dados...');
      syncPendingOperations();
    };

    const handleOffline = () => {
      console.log('[Offline] Connection lost');
      setState(prev => ({ ...prev, isOnline: false }));
      toast.warning('Você está offline. Suas alterações serão salvas localmente.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check pending sync count on mount
    updatePendingSyncCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for service worker sync messages
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_TASKS' || event.data.type === 'SYNC_IDEAS') {
          syncPendingOperations();
        }
      });
    }
  }, []);

  // Update pending sync count
  const updatePendingSyncCount = useCallback(async () => {
    try {
      const pending = await getPendingSync();
      setState(prev => ({ ...prev, pendingSyncCount: pending.length }));
    } catch (error) {
      console.error('[Offline] Failed to get pending sync count:', error);
    }
  }, []);

  // Sync pending operations to server
  const syncPendingOperations = useCallback(async () => {
    if (syncInProgress.current || !navigator.onLine) {
      return;
    }

    syncInProgress.current = true;
    setState(prev => ({ ...prev, isSyncing: true }));

    try {
      const pendingOps = await getPendingSync();
      
      if (pendingOps.length === 0) {
        setState(prev => ({ 
          ...prev, 
          isSyncing: false, 
          lastSyncAt: Date.now() 
        }));
        syncInProgress.current = false;
        return;
      }

      console.log(`[Offline] Syncing ${pendingOps.length} pending operations...`);

      // Sort by timestamp to process in order
      pendingOps.sort((a, b) => a.timestamp - b.timestamp);

      for (const op of pendingOps) {
        try {
          await processSyncOperation(op);
          await removePendingSync(op.id);
          console.log(`[Offline] Synced operation: ${op.id}`);
        } catch (error) {
          console.error(`[Offline] Failed to sync operation ${op.id}:`, error);
          
          if (op.retries < MAX_SYNC_RETRIES) {
            await updatePendingSyncRetries(op.id, op.retries + 1);
          } else {
            // Max retries reached, remove operation and notify user
            await removePendingSync(op.id);
            toast.error(`Falha ao sincronizar: ${getOperationDescription(op)}`);
          }
        }
      }

      // Invalidate queries to refresh data
      utils.projects.list.invalidate();
      utils.tasks.getByProject.invalidate();
      utils.ideas.list.invalidate();

      await updatePendingSyncCount();
      
      setState(prev => ({ 
        ...prev, 
        isSyncing: false, 
        lastSyncAt: Date.now() 
      }));
      
      toast.success('Dados sincronizados com sucesso!');
    } catch (error) {
      console.error('[Offline] Sync failed:', error);
      setState(prev => ({ ...prev, isSyncing: false }));
    } finally {
      syncInProgress.current = false;
    }
  }, [utils]);

  // Process a single sync operation
  const processSyncOperation = async (op: SyncOperation): Promise<void> => {
    // This would call the actual tRPC mutations
    // For now, we'll just log the operation
    console.log('[Offline] Processing sync operation:', op);
    
    // In a real implementation, you would call the appropriate tRPC mutation
    // based on op.store and op.operation
    // Example:
    // if (op.store === STORES.TASKS && op.operation === 'create') {
    //   await trpcClient.tasks.create.mutate(op.data);
    // }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
  };

  // Get operation description for error messages
  const getOperationDescription = (op: SyncOperation): string => {
    const storeNames: Record<string, string> = {
      [STORES.PROJECTS]: 'projeto',
      [STORES.TASKS]: 'tarefa',
      [STORES.IDEAS]: 'ideia',
      [STORES.FOCUS_SESSIONS]: 'sessão de foco',
    };
    
    const opNames: Record<string, string> = {
      create: 'criar',
      update: 'atualizar',
      delete: 'excluir',
    };
    
    return `${opNames[op.operation] || op.operation} ${storeNames[op.store] || op.store}`;
  };

  // Cache projects locally
  const cacheProjects = useCallback(async (projects: OfflineProject[]) => {
    try {
      await putMany(STORES.PROJECTS, projects);
      console.log(`[Offline] Cached ${projects.length} projects`);
    } catch (error) {
      console.error('[Offline] Failed to cache projects:', error);
    }
  }, []);

  // Get cached projects
  const getCachedProjects = useCallback(async (): Promise<OfflineProject[]> => {
    try {
      return await getAll<OfflineProject>(STORES.PROJECTS);
    } catch (error) {
      console.error('[Offline] Failed to get cached projects:', error);
      return [];
    }
  }, []);

  // Cache tasks locally
  const cacheTasks = useCallback(async (tasks: OfflineTask[]) => {
    try {
      await putMany(STORES.TASKS, tasks);
      console.log(`[Offline] Cached ${tasks.length} tasks`);
    } catch (error) {
      console.error('[Offline] Failed to cache tasks:', error);
    }
  }, []);

  // Get cached tasks by project
  const getCachedTasksByProject = useCallback(async (projectId: number): Promise<OfflineTask[]> => {
    try {
      return await getByIndex<OfflineTask>(STORES.TASKS, 'projectId', projectId);
    } catch (error) {
      console.error('[Offline] Failed to get cached tasks:', error);
      return [];
    }
  }, []);

  // Cache ideas locally
  const cacheIdeas = useCallback(async (ideas: OfflineIdea[]) => {
    try {
      await putMany(STORES.IDEAS, ideas);
      console.log(`[Offline] Cached ${ideas.length} ideas`);
    } catch (error) {
      console.error('[Offline] Failed to cache ideas:', error);
    }
  }, []);

  // Get cached ideas
  const getCachedIdeas = useCallback(async (): Promise<OfflineIdea[]> => {
    try {
      return await getAll<OfflineIdea>(STORES.IDEAS);
    } catch (error) {
      console.error('[Offline] Failed to get cached ideas:', error);
      return [];
    }
  }, []);

  // Create task offline
  const createTaskOffline = useCallback(async (task: Omit<OfflineTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfflineTask> => {
    const offlineTask: OfflineTask = {
      ...task,
      id: generateOfflineId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      _offline: true,
    };

    await put(STORES.TASKS, offlineTask);
    await addPendingSync({
      store: STORES.TASKS,
      operation: 'create',
      data: offlineTask,
    });
    await updatePendingSyncCount();

    console.log('[Offline] Created task offline:', offlineTask.id);
    return offlineTask;
  }, [updatePendingSyncCount]);

  // Create idea offline
  const createIdeaOffline = useCallback(async (idea: Omit<OfflineIdea, 'id' | 'createdAt'>): Promise<OfflineIdea> => {
    const offlineIdea: OfflineIdea = {
      ...idea,
      id: generateOfflineId(),
      createdAt: Date.now(),
      _offline: true,
    };

    await put(STORES.IDEAS, offlineIdea);
    await addPendingSync({
      store: STORES.IDEAS,
      operation: 'create',
      data: offlineIdea,
    });
    await updatePendingSyncCount();

    console.log('[Offline] Created idea offline:', offlineIdea.id);
    return offlineIdea;
  }, [updatePendingSyncCount]);

  // Update task offline
  const updateTaskOffline = useCallback(async (taskId: number, updates: Partial<OfflineTask>): Promise<void> => {
    const tasks = await getAll<OfflineTask>(STORES.TASKS);
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
      const updatedTask = { ...task, ...updates, updatedAt: Date.now() };
      await put(STORES.TASKS, updatedTask);
      
      if (!isOfflineId(taskId)) {
        await addPendingSync({
          store: STORES.TASKS,
          operation: 'update',
          data: updatedTask,
        });
        await updatePendingSyncCount();
      }
      
      console.log('[Offline] Updated task offline:', taskId);
    }
  }, [updatePendingSyncCount]);

  // Request background sync
  const requestBackgroundSync = useCallback(async (tag: string) => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register(tag);
        console.log(`[Offline] Background sync registered: ${tag}`);
      } catch (error) {
        console.error('[Offline] Background sync registration failed:', error);
      }
    }
  }, []);

  // Force sync now
  const forceSyncNow = useCallback(async () => {
    if (!navigator.onLine) {
      toast.error('Você está offline. Não é possível sincronizar agora.');
      return;
    }
    await syncPendingOperations();
  }, [syncPendingOperations]);

  return {
    ...state,
    cacheProjects,
    getCachedProjects,
    cacheTasks,
    getCachedTasksByProject,
    cacheIdeas,
    getCachedIdeas,
    createTaskOffline,
    createIdeaOffline,
    updateTaskOffline,
    requestBackgroundSync,
    forceSyncNow,
    updatePendingSyncCount,
  };
}

// Hook for checking if we should use cached data
export function useOfflineData<T>(
  onlineData: T | undefined,
  getCachedData: () => Promise<T>,
  cacheData: (data: T) => Promise<void>,
  isOnline: boolean,
  isLoading: boolean
) {
  const [data, setData] = useState<T | undefined>(onlineData);
  const [isUsingCache, setIsUsingCache] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (isOnline && onlineData !== undefined) {
        // Online and have data - use it and cache
        setData(onlineData);
        setIsUsingCache(false);
        await cacheData(onlineData);
      } else if (!isOnline || (isLoading && !onlineData)) {
        // Offline or loading - try to use cache
        try {
          const cached = await getCachedData();
          if (cached) {
            setData(cached);
            setIsUsingCache(true);
          }
        } catch (error) {
          console.error('[Offline] Failed to load cached data:', error);
        }
      }
    };

    loadData();
  }, [onlineData, isOnline, isLoading, getCachedData, cacheData]);

  return { data, isUsingCache };
}
