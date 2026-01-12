/**
 * ConflictResolver Component
 * 
 * Modal/Dialog for resolving sync conflicts between local and server data.
 * Shows both versions side by side and lets the user choose which to keep.
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  Cloud,
  Smartphone,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConflictData {
  id: string;
  entityType: 'task' | 'idea' | 'project' | 'focusSession';
  localData: Record<string, unknown>;
  serverData: Record<string, unknown>;
  localTimestamp: Date;
  serverTimestamp: Date;
}

interface ConflictResolverProps {
  conflicts: ConflictData[];
  onResolve: (conflictId: string, keepLocal: boolean) => Promise<void>;
  onResolveAll: (keepLocal: boolean) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConflictResolver({
  conflicts,
  onResolve,
  onResolveAll,
  open,
  onOpenChange,
}: ConflictResolverProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resolving, setResolving] = useState(false);
  
  const currentConflict = conflicts[currentIndex];
  const hasConflicts = conflicts.length > 0;
  
  // Reset index when conflicts change
  useEffect(() => {
    setCurrentIndex(0);
  }, [conflicts.length]);
  
  const handleResolve = async (keepLocal: boolean) => {
    if (!currentConflict) return;
    
    setResolving(true);
    try {
      await onResolve(currentConflict.id, keepLocal);
      
      // Move to next conflict or close if done
      if (currentIndex >= conflicts.length - 1) {
        if (conflicts.length === 1) {
          onOpenChange(false);
        }
      } else {
        // Stay at same index (next conflict will slide in)
      }
    } finally {
      setResolving(false);
    }
  };
  
  const handleResolveAll = async (keepLocal: boolean) => {
    setResolving(true);
    try {
      await onResolveAll(keepLocal);
      onOpenChange(false);
    } finally {
      setResolving(false);
    }
  };
  
  const getEntityLabel = (type: string): string => {
    switch (type) {
      case 'task': return 'Tarefa';
      case 'idea': return 'Ideia';
      case 'project': return 'Projeto';
      case 'focusSession': return 'Sessão de Foco';
      default: return 'Item';
    }
  };
  
  const formatTimestamp = (date: Date): string => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const renderDataComparison = (local: Record<string, unknown>, server: Record<string, unknown>) => {
    const allKeys = new Set([...Object.keys(local), ...Object.keys(server)]);
    const relevantKeys = Array.from(allKeys).filter(key => 
      !key.startsWith('_') && 
      !['id', 'userId', 'createdAt'].includes(key)
    );
    
    return (
      <div className="space-y-3">
        {relevantKeys.map(key => {
          const localValue = local[key];
          const serverValue = server[key];
          const isDifferent = JSON.stringify(localValue) !== JSON.stringify(serverValue);
          
          return (
            <div 
              key={key}
              className={cn(
                "grid grid-cols-3 gap-2 text-sm p-2 rounded",
                isDifferent && "bg-yellow-50"
              )}
            >
              <div className="font-medium text-muted-foreground capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className={cn(
                "truncate",
                isDifferent && "text-blue-600 font-medium"
              )}>
                {formatValue(localValue)}
              </div>
              <div className={cn(
                "truncate",
                isDifferent && "text-green-600 font-medium"
              )}>
                {formatValue(serverValue)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };
  
  if (!hasConflicts) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Conflito de Sincronização
          </DialogTitle>
          <DialogDescription>
            Existem diferenças entre os dados locais e do servidor. 
            Escolha qual versão manter.
          </DialogDescription>
        </DialogHeader>
        
        {currentConflict && (
          <>
            {/* Navigation */}
            {conflicts.length > 1 && (
              <div className="flex items-center justify-between py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentIndex + 1} de {conflicts.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentIndex(i => Math.min(conflicts.length - 1, i + 1))}
                  disabled={currentIndex === conflicts.length - 1}
                >
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
            
            {/* Entity Info */}
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline">
                {getEntityLabel(currentConflict.entityType)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                ID: {currentConflict.id}
              </span>
            </div>
            
            {/* Comparison Header */}
            <div className="grid grid-cols-3 gap-2 text-sm font-medium mb-2">
              <div>Campo</div>
              <div className="flex items-center gap-1 text-blue-600">
                <Smartphone className="h-4 w-4" />
                Local
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <Cloud className="h-4 w-4" />
                Servidor
              </div>
            </div>
            
            <Separator />
            
            {/* Data Comparison */}
            <ScrollArea className="h-[300px] pr-4">
              {renderDataComparison(
                currentConflict.localData,
                currentConflict.serverData
              )}
            </ScrollArea>
            
            <Separator />
            
            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">Modificado localmente:</span>
                <br />
                {formatTimestamp(currentConflict.localTimestamp)}
              </div>
              <div>
                <span className="font-medium">Modificado no servidor:</span>
                <br />
                {formatTimestamp(currentConflict.serverTimestamp)}
              </div>
            </div>
          </>
        )}
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {conflicts.length > 1 && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResolveAll(true)}
                disabled={resolving}
                className="flex-1 sm:flex-none"
              >
                Manter todos locais
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResolveAll(false)}
                disabled={resolving}
                className="flex-1 sm:flex-none"
              >
                Manter todos do servidor
              </Button>
            </div>
          )}
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="default"
              onClick={() => handleResolve(true)}
              disabled={resolving}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Manter Local
            </Button>
            <Button
              variant="default"
              onClick={() => handleResolve(false)}
              disabled={resolving}
              className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
            >
              <Cloud className="h-4 w-4 mr-2" />
              Manter Servidor
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to manage conflict resolution state
 */
export function useConflictResolver() {
  const [conflicts, setConflicts] = useState<ConflictData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const addConflict = (conflict: ConflictData) => {
    setConflicts(prev => [...prev, conflict]);
    setIsOpen(true);
  };
  
  const resolveConflict = async (conflictId: string, keepLocal: boolean) => {
    // Here you would call the actual resolution logic
    console.log(`Resolving conflict ${conflictId}, keepLocal: ${keepLocal}`);
    
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
  };
  
  const resolveAllConflicts = async (keepLocal: boolean) => {
    // Here you would call the actual resolution logic for all
    console.log(`Resolving all conflicts, keepLocal: ${keepLocal}`);
    
    setConflicts([]);
  };
  
  const clearConflicts = () => {
    setConflicts([]);
    setIsOpen(false);
  };
  
  return {
    conflicts,
    isOpen,
    setIsOpen,
    addConflict,
    resolveConflict,
    resolveAllConflicts,
    clearConflicts,
    hasConflicts: conflicts.length > 0,
  };
}
