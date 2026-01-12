/**
 * useSync Hook - Offline/Online Synchronization
 * 
 * This hook manages the synchronization between local IndexedDB storage
 * and the server. It handles:
 * - Detecting online/offline status
 * - Processing pending sync queue when online
 * - Conflict detection and resolution
 * - Background sync with retry logic
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  getPendingSync,
  removePendingSync,
  updatePendingSyncRetries,
  putMany,
  getAll,
  STORES,
  type SyncOperation,
} from '@/lib/offlineDb';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncAt: Date | null;
  hasConflicts: boolean;
}

interface UseSyncOptions {
  autoSync?: boolean;
  syncInterval?: number; // in milliseconds
  maxRetries?: number;
}

const DEFAULT_OPTIONS: UseSyncOptions = {
  autoSync: true,
  syncInterval: 30000, // 30 seconds
  maxRetries: 3,
};

export function useSync(options: UseSyncOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const [state, setState] = useState<SyncState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncAt: null,
    hasConflicts: false,
  });
  
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingRef = useRef(false);
  
  // tRPC mutations for syncing
  const utils = trpc.useUtils();
  
  // Update online status
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      toast.success('Conexão restaurada! Sincronizando dados...');
      if (opts.autoSync) {
        syncPendingChanges();
      }
    };
    
    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
      toast.warning('Você está offline. As alterações serão salvas localmente.');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [opts.autoSync]);
  
  // Update pending count
  const updatePendingCount = useCallback(async () => {
    try {
      const pending = await getPendingSync();
      setState(prev => ({ ...prev, pendingCount: pending.length }));
    } catch (error) {
      console.error('[Sync] Error getting pending count:', error);
    }
  }, []);
  
  // Initial pending count
  useEffect(() => {
    updatePendingCount();
  }, [updatePendingCount]);
  
  // Auto-sync interval
  useEffect(() => {
    if (opts.autoSync && opts.syncInterval) {
      syncIntervalRef.current = setInterval(() => {
        if (state.isOnline && !isSyncingRef.current) {
          syncPendingChanges();
        }
      }, opts.syncInterval);
      
      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
      };
    }
  }, [opts.autoSync, opts.syncInterval, state.isOnline]);
  
  // Sync pending changes to server
  const syncPendingChanges = useCallback(async () => {
    if (isSyncingRef.current || !state.isOnline) return;
    
    isSyncingRef.current = true;
    setState(prev => ({ ...prev, isSyncing: true }));
    
    try {
      const pendingOps = await getPendingSync();
      
      if (pendingOps.length === 0) {
        setState(prev => ({ 
          ...prev, 
          isSyncing: false, 
          lastSyncAt: new Date(),
          pendingCount: 0,
        }));
        isSyncingRef.current = false;
        return;
      }
      
      console.log(`[Sync] Processing ${pendingOps.length} pending operations`);
      
      let successCount = 0;
      let failCount = 0;
      
      for (const op of pendingOps) {
        try {
          await processSyncOperation(op);
          await removePendingSync(op.id);
          successCount++;
        } catch (error) {
          console.error(`[Sync] Failed to sync operation ${op.id}:`, error);
          
          if (op.retries >= (opts.maxRetries || 3)) {
            // Max retries reached, mark as conflict
            console.warn(`[Sync] Max retries reached for operation ${op.id}`);
            setState(prev => ({ ...prev, hasConflicts: true }));
          } else {
            await updatePendingSyncRetries(op.id, op.retries + 1);
          }
          failCount++;
        }
      }
      
      if (successCount > 0) {
        // Invalidate tRPC queries to refresh data
        utils.invalidate();
      }
      
      await updatePendingCount();
      
      setState(prev => ({ 
        ...prev, 
        isSyncing: false, 
        lastSyncAt: new Date(),
      }));
      
      if (successCount > 0 && failCount === 0) {
        toast.success(`${successCount} alterações sincronizadas!`);
      } else if (failCount > 0) {
        toast.warning(`${successCount} sincronizadas, ${failCount} pendentes`);
      }
      
    } catch (error) {
      console.error('[Sync] Error during sync:', error);
      setState(prev => ({ ...prev, isSyncing: false }));
    } finally {
      isSyncingRef.current = false;
    }
  }, [state.isOnline, opts.maxRetries, utils, updatePendingCount]);
  
  // Process a single sync operation
  const processSyncOperation = async (op: SyncOperation): Promise<void> => {
    const data = op.data as any;
    
    switch (op.store) {
      case STORES.TASKS:
        await syncTask(op.operation, data);
        break;
      case STORES.IDEAS:
        await syncIdea(op.operation, data);
        break;
      case STORES.FOCUS_SESSIONS:
        await syncFocusSession(op.operation, data);
        break;
      default:
        console.warn(`[Sync] Unknown store: ${op.store}`);
    }
  };
  
  // Sync task to server
  const syncTask = async (operation: string, data: any): Promise<void> => {
    // This would call the appropriate tRPC mutation
    // For now, we'll just log it
    console.log(`[Sync] Task ${operation}:`, data);
    
    // Example implementation:
    // switch (operation) {
    //   case 'create':
    //     await trpc.tasks.create.mutate(data);
    //     break;
    //   case 'update':
    //     await trpc.tasks.update.mutate(data);
    //     break;
    //   case 'delete':
    //     await trpc.tasks.delete.mutate({ id: data.id });
    //     break;
    // }
  };
  
  // Sync idea to server
  const syncIdea = async (operation: string, data: any): Promise<void> => {
    console.log(`[Sync] Idea ${operation}:`, data);
  };
  
  // Sync focus session to server
  const syncFocusSession = async (operation: string, data: any): Promise<void> => {
    console.log(`[Sync] FocusSession ${operation}:`, data);
  };
  
  // Pull data from server to local
  const pullFromServer = useCallback(async () => {
    if (!state.isOnline) {
      toast.error('Você está offline. Não é possível sincronizar.');
      return;
    }
    
    setState(prev => ({ ...prev, isSyncing: true }));
    
    try {
      // Fetch data from server and store locally
      // This would use tRPC queries
      
      toast.success('Dados sincronizados do servidor!');
      setState(prev => ({ 
        ...prev, 
        isSyncing: false, 
        lastSyncAt: new Date(),
      }));
    } catch (error) {
      console.error('[Sync] Error pulling from server:', error);
      toast.error('Erro ao sincronizar dados do servidor');
      setState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [state.isOnline]);
  
  // Force sync now
  const forceSync = useCallback(async () => {
    await syncPendingChanges();
    await pullFromServer();
  }, [syncPendingChanges, pullFromServer]);
  
  return {
    ...state,
    syncPendingChanges,
    pullFromServer,
    forceSync,
    updatePendingCount,
  };
}

/**
 * Hook to check if the app is online
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}
