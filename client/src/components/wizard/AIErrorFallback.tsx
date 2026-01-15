import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AIErrorFallbackProps {
  error: Error;
  onRetry: () => void;
  onManualMode: () => void;
}

export function AIErrorFallback({ error, onRetry, onManualMode }: AIErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 max-w-md mx-auto">
      <AlertCircle className="w-16 h-16 text-destructive" />
      
      <Alert variant="destructive">
        <AlertTitle>Ops! Algo deu errado com a IA</AlertTitle>
        <AlertDescription>
          {error.message || 'Não conseguimos processar seu projeto no momento.'}
        </AlertDescription>
      </Alert>

      <div className="space-y-3 w-full">
        <Button onClick={onRetry} className="w-full">
          Tentar Novamente
        </Button>
        <Button onClick={onManualMode} variant="outline" className="w-full">
          Continuar Manualmente
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        No modo manual, você poderá criar seu projeto sem assistência da IA, 
        preenchendo cada campo manualmente.
      </p>
    </div>
  );
}
