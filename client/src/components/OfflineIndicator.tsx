/**
 * OfflineIndicator Component
 * Shows connection status and pending sync operations
 */

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Cloud, CloudOff, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useOffline } from '@/hooks/useOffline';
import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function OfflineIndicator({ className, showDetails = true }: OfflineIndicatorProps) {
  const { 
    isOnline, 
    isSyncing, 
    pendingSyncCount, 
    lastSyncAt,
    forceSyncNow 
  } = useOffline();
  
  const [showBanner, setShowBanner] = useState(false);

  // Show banner when going offline
  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
    } else if (showBanner) {
      // Keep banner visible for a moment when coming back online
      const timer = setTimeout(() => setShowBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Nunca';
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Agora mesmo';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    return new Date(timestamp).toLocaleDateString('pt-BR');
  };

  // Simple indicator without details
  if (!showDetails) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors",
            isOnline 
              ? "bg-green-500/10 text-green-500" 
              : "bg-amber-500/10 text-amber-500",
            className
          )}>
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </>
            )}
            {pendingSyncCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-amber-500/20 rounded-full">
                {pendingSyncCount}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {isOnline 
            ? `Conectado${pendingSyncCount > 0 ? ` • ${pendingSyncCount} pendentes` : ''}`
            : 'Modo offline - alterações serão sincronizadas quando reconectar'
          }
        </TooltipContent>
      </Tooltip>
    );
  }

  // Full indicator with popover
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-2 h-8 px-3",
            !isOnline && "text-amber-500",
            isSyncing && "animate-pulse",
            className
          )}
        >
          {isSyncing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : isOnline ? (
            <Cloud className="w-4 h-4 text-green-500" />
          ) : (
            <CloudOff className="w-4 h-4" />
          )}
          {pendingSyncCount > 0 && (
            <span className="text-xs bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-full">
              {pendingSyncCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          {/* Status Header */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isOnline ? "bg-green-500/10" : "bg-amber-500/10"
            )}>
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-amber-500" />
              )}
            </div>
            <div>
              <h4 className="font-medium">
                {isOnline ? 'Conectado' : 'Modo Offline'}
              </h4>
              <p className="text-xs text-muted-foreground">
                {isOnline 
                  ? 'Seus dados estão sincronizados'
                  : 'Alterações serão salvas localmente'
                }
              </p>
            </div>
          </div>

          {/* Sync Status */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Última sincronização</span>
              <span className="font-medium">{formatLastSync(lastSyncAt)}</span>
            </div>
            
            {pendingSyncCount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pendentes</span>
                <span className="font-medium text-amber-500">
                  {pendingSyncCount} {pendingSyncCount === 1 ? 'operação' : 'operações'}
                </span>
              </div>
            )}
          </div>

          {/* Sync Button */}
          {isOnline && pendingSyncCount > 0 && (
            <Button 
              className="w-full" 
              size="sm"
              onClick={forceSyncNow}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sincronizar agora
                </>
              )}
            </Button>
          )}

          {/* Offline Tips */}
          {!isOnline && (
            <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Dicas para modo offline:</p>
                  <ul className="space-y-1">
                    <li>• Suas tarefas e ideias são salvas localmente</li>
                    <li>• O timer de foco funciona normalmente</li>
                    <li>• Dados serão sincronizados ao reconectar</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Success indicator when synced */}
          {isOnline && pendingSyncCount === 0 && lastSyncAt && (
            <div className="flex items-center gap-2 text-sm text-green-500">
              <Check className="w-4 h-4" />
              <span>Todos os dados sincronizados</span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Offline Banner component for prominent display
export function OfflineBanner() {
  const { isOnline, pendingSyncCount, isSyncing, forceSyncNow } = useOffline();
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state when going offline
  useEffect(() => {
    if (!isOnline) {
      setDismissed(false);
    }
  }, [isOnline]);

  if (isOnline || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <WifiOff className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground">Você está offline</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Suas alterações estão sendo salvas localmente e serão sincronizadas quando a conexão retornar.
            </p>
            {pendingSyncCount > 0 && (
              <p className="text-xs text-amber-500 mt-2">
                {pendingSyncCount} {pendingSyncCount === 1 ? 'alteração pendente' : 'alterações pendentes'}
              </p>
            )}
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="sr-only">Fechar</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Install PWA prompt component
export function InstallPWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check if user has dismissed before
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('[PWA] User accepted install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground">Instalar NeuroExecução</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Instale o app para acesso rápido e uso offline.
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleInstall}>
                Instalar
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Agora não
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
