import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { trpc } from '@/lib/trpc';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AgeVerificationModalProps {
  open: boolean;
  onComplete: () => void;
}

export function AgeVerificationModal({ open, onComplete }: AgeVerificationModalProps) {
  const [error, setError] = useState<string>('');
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const updateBirthDate = trpc.users.updateBirthDate.useMutation({
    onSuccess: () => {
      onComplete();
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  const onSubmit = (data: any) => {
    setError('');
    updateBirthDate.mutate({ birthDate: data.birthDate });
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Verificação de Idade</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Para continuar usando o NeuroExecução, precisamos confirmar que você tem 18 anos ou mais.
            Esta informação é necessária para conformidade com a LGPD.
          </p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                {...register('birthDate', { required: 'Data de nascimento é obrigatória' })}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.birthDate && (
                <p className="text-sm text-destructive mt-1">
                  {errors.birthDate.message as string}
                </p>
              )}
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="bg-muted p-3 rounded-md text-xs text-muted-foreground">
              <p className="font-semibold mb-1">Por que precisamos desta informação?</p>
              <p>
                O NeuroExecução coleta dados sensíveis de saúde (TDAH). A LGPD exige que apenas
                maiores de 18 anos possam fornecer consentimento para processamento destes dados.
              </p>
            </div>
            
            <Button type="submit" className="w-full" disabled={updateBirthDate.isPending}>
              {updateBirthDate.isPending ? 'Verificando...' : 'Confirmar Idade'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
