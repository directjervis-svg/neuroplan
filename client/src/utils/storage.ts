/**
 * Storage Utility - Wrapper para localStorage + window.storage
 *
 * Fornece uma interface unificada para armazenamento local com:
 * - Suporte a serialização/deserialização JSON
 * - Fallback para memória quando localStorage não disponível
 * - Namespacing para evitar conflitos
 * - TTL (Time To Live) opcional para dados
 * - Listeners para mudanças de storage
 */

const STORAGE_PREFIX = 'neuroplan:';
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 horas em ms

interface StorageItem<T> {
  value: T;
  timestamp: number;
  ttl?: number;
}

// Fallback em memória quando localStorage não está disponível
const memoryStorage: Map<string, string> = new Map();

/**
 * Verifica se localStorage está disponível
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const useLocalStorage = isLocalStorageAvailable();

/**
 * Obtém o storage apropriado (localStorage ou memória)
 */
function getStorage() {
  if (useLocalStorage) {
    return {
      getItem: (key: string) => localStorage.getItem(key),
      setItem: (key: string, value: string) => localStorage.setItem(key, value),
      removeItem: (key: string) => localStorage.removeItem(key),
      clear: () => localStorage.clear(),
      keys: () => Object.keys(localStorage),
    };
  }

  return {
    getItem: (key: string) => memoryStorage.get(key) ?? null,
    setItem: (key: string, value: string) => memoryStorage.set(key, value),
    removeItem: (key: string) => memoryStorage.delete(key),
    clear: () => memoryStorage.clear(),
    keys: () => Array.from(memoryStorage.keys()),
  };
}

const storage = getStorage();

/**
 * Gera a chave com prefixo
 */
function prefixKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

/**
 * Verifica se um item expirou
 */
function isExpired<T>(item: StorageItem<T>): boolean {
  if (!item.ttl) return false;
  return Date.now() - item.timestamp > item.ttl;
}

/**
 * Armazena um valor com TTL opcional
 */
export function setItem<T>(key: string, value: T, ttl?: number): void {
  const item: StorageItem<T> = {
    value,
    timestamp: Date.now(),
    ttl,
  };

  try {
    storage.setItem(prefixKey(key), JSON.stringify(item));
  } catch (error) {
    console.error('[Storage] Erro ao salvar:', error);
    // Se localStorage está cheio, tenta limpar itens expirados
    cleanExpiredItems();
    try {
      storage.setItem(prefixKey(key), JSON.stringify(item));
    } catch {
      console.error('[Storage] Falha ao salvar após limpeza');
    }
  }
}

/**
 * Recupera um valor armazenado
 */
export function getItem<T>(key: string, defaultValue?: T): T | undefined {
  try {
    const raw = storage.getItem(prefixKey(key));
    if (!raw) return defaultValue;

    const item: StorageItem<T> = JSON.parse(raw);

    if (isExpired(item)) {
      removeItem(key);
      return defaultValue;
    }

    return item.value;
  } catch (error) {
    console.error('[Storage] Erro ao recuperar:', error);
    return defaultValue;
  }
}

/**
 * Remove um item do storage
 */
export function removeItem(key: string): void {
  storage.removeItem(prefixKey(key));
}

/**
 * Verifica se uma chave existe
 */
export function hasItem(key: string): boolean {
  const raw = storage.getItem(prefixKey(key));
  if (!raw) return false;

  try {
    const item = JSON.parse(raw);
    return !isExpired(item);
  } catch {
    return false;
  }
}

/**
 * Limpa todos os itens do namespace neuroplan
 */
export function clearAll(): void {
  const keys = storage.keys();
  keys.forEach(key => {
    if (key.startsWith(STORAGE_PREFIX)) {
      storage.removeItem(key);
    }
  });
}

/**
 * Remove itens expirados
 */
export function cleanExpiredItems(): number {
  let cleanedCount = 0;
  const keys = storage.keys();

  keys.forEach(key => {
    if (key.startsWith(STORAGE_PREFIX)) {
      try {
        const raw = storage.getItem(key);
        if (raw) {
          const item = JSON.parse(raw);
          if (isExpired(item)) {
            storage.removeItem(key);
            cleanedCount++;
          }
        }
      } catch {
        // Item inválido, remove
        storage.removeItem(key);
        cleanedCount++;
      }
    }
  });

  console.log(`[Storage] Limpeza: ${cleanedCount} itens removidos`);
  return cleanedCount;
}

/**
 * Obtém todas as chaves do namespace
 */
export function getAllKeys(): string[] {
  return storage.keys()
    .filter(key => key.startsWith(STORAGE_PREFIX))
    .map(key => key.slice(STORAGE_PREFIX.length));
}

/**
 * Obtém o tamanho total usado pelo storage (aproximado)
 */
export function getStorageSize(): number {
  let totalSize = 0;
  const keys = storage.keys();

  keys.forEach(key => {
    if (key.startsWith(STORAGE_PREFIX)) {
      const value = storage.getItem(key);
      if (value) {
        totalSize += key.length + value.length;
      }
    }
  });

  return totalSize;
}

// ========================
// Storage específicos para features do app
// ========================

/**
 * Storage de preferências do usuário
 */
export const userPreferences = {
  get: <T>(key: string, defaultValue?: T): T | undefined => {
    return getItem<T>(`prefs:${key}`, defaultValue);
  },

  set: <T>(key: string, value: T): void => {
    setItem(`prefs:${key}`, value);
  },

  remove: (key: string): void => {
    removeItem(`prefs:${key}`);
  },
};

/**
 * Storage de sessão (TTL curto)
 */
export const sessionStorage = {
  get: <T>(key: string, defaultValue?: T): T | undefined => {
    return getItem<T>(`session:${key}`, defaultValue);
  },

  set: <T>(key: string, value: T): void => {
    setItem(`session:${key}`, value, 30 * 60 * 1000); // 30 minutos
  },

  remove: (key: string): void => {
    removeItem(`session:${key}`);
  },
};

/**
 * Storage de cache (TTL médio)
 */
export const cacheStorage = {
  get: <T>(key: string, defaultValue?: T): T | undefined => {
    return getItem<T>(`cache:${key}`, defaultValue);
  },

  set: <T>(key: string, value: T, ttl: number = DEFAULT_TTL): void => {
    setItem(`cache:${key}`, value, ttl);
  },

  remove: (key: string): void => {
    removeItem(`cache:${key}`);
  },

  invalidate: (pattern: string): void => {
    const keys = getAllKeys().filter(k => k.startsWith(`cache:${pattern}`));
    keys.forEach(removeItem);
  },
};

/**
 * Storage para dados TDAH (persistente)
 */
export const tdahStorage = {
  getFocusHistory: (): number[] => {
    return getItem<number[]>('tdah:focus_history', []) ?? [];
  },

  addFocusSession: (duration: number): void => {
    const history = tdahStorage.getFocusHistory();
    history.push(duration);
    // Mantém apenas últimos 30 registros
    if (history.length > 30) {
      history.shift();
    }
    setItem('tdah:focus_history', history);
  },

  getStreak: (): number => {
    return getItem<number>('tdah:streak', 0) ?? 0;
  },

  setStreak: (value: number): void => {
    setItem('tdah:streak', value);
  },

  getLastActiveDate: (): string | undefined => {
    return getItem<string>('tdah:last_active');
  },

  setLastActiveDate: (date: string): void => {
    setItem('tdah:last_active', date);
  },

  getProgressiveTimerLevel: (): number => {
    return getItem<number>('tdah:timer_level', 1) ?? 1;
  },

  setProgressiveTimerLevel: (level: number): void => {
    setItem('tdah:timer_level', level);
  },
};

/**
 * Listener de mudanças no storage (entre abas)
 */
export function onStorageChange(
  callback: (key: string, newValue: unknown, oldValue: unknown) => void
): () => void {
  if (!useLocalStorage) return () => {};

  const handler = (event: StorageEvent) => {
    if (event.key?.startsWith(STORAGE_PREFIX)) {
      const key = event.key.slice(STORAGE_PREFIX.length);
      const oldValue = event.oldValue ? JSON.parse(event.oldValue)?.value : undefined;
      const newValue = event.newValue ? JSON.parse(event.newValue)?.value : undefined;
      callback(key, newValue, oldValue);
    }
  };

  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

export default {
  setItem,
  getItem,
  removeItem,
  hasItem,
  clearAll,
  cleanExpiredItems,
  getAllKeys,
  getStorageSize,
  userPreferences,
  sessionStorage,
  cacheStorage,
  tdahStorage,
  onStorageChange,
};
