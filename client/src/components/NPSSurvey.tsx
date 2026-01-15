/**
 * NPS Survey Component
 * Appears after 3 days of usage to collect Net Promoter Score
 */

import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface NPSSurveyProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NPSSurvey({ isOpen, onClose }: NPSSurveyProps) {
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitNPS = trpc.analytics.submitNPS.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Obrigado pelo seu feedback!');
      setTimeout(() => {
        onClose();
      }, 2000);
    },
  });

  const handleSubmit = () => {
    if (score === null) {
      toast.error('Por favor, selecione uma nota de 0 a 10');
      return;
    }

    submitNPS.mutate({ score, feedback });
  };

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🙏 Obrigado!</DialogTitle>
            <DialogDescription>
              Seu feedback é muito importante para nós.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center">
            <p className="text-lg">
              Continuamos trabalhando para melhorar o NeuroExecução todos os dias.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Como está sendo sua experiência?</DialogTitle>
          <DialogDescription>
            Sua opinião nos ajuda a melhorar o NeuroExecução
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* NPS Question */}
          <div className="space-y-3">
            <p className="text-sm font-medium">
              De 0 a 10, qual a probabilidade de você recomendar o NeuroExecução
              para um amigo com TDAH?
            </p>
            <div className="grid grid-cols-11 gap-1">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setScore(i)}
                  className={`
                    h-10 rounded border text-sm font-medium transition-all
                    ${
                      score === i
                        ? 'bg-primary text-primary-foreground border-primary scale-110'
                        : 'bg-background hover:bg-muted border-border'
                    }
                  `}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Nada provável</span>
              <span>Muito provável</span>
            </div>
          </div>

          {/* Feedback */}
          {score !== null && (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
              <label className="text-sm font-medium">
                {score >= 9
                  ? '😍 Que ótimo! O que você mais gostou?'
                  : score >= 7
                  ? '😊 Obrigado! Como podemos melhorar?'
                  : '😔 Sentimos muito. O que podemos fazer melhor?'}
              </label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Seu feedback (opcional)"
                rows={3}
                maxLength={1000}
              />
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Depois
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={score === null || submitNPS.isPending}
              className="flex-1"
            >
              {submitNPS.isPending ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to manage NPS survey display logic
 * Shows after 3 days of usage, only once
 */
export function useNPSSurvey() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: engagement } = trpc.analytics.getUserEngagement.useQuery();

  React.useEffect(() => {
    // Show NPS survey after 3 days, only if not shown before
    const hasShownNPS = localStorage.getItem('nps_survey_shown');
    
    if (
      !hasShownNPS &&
      engagement?.daysSinceSignup >= 3 &&
      engagement?.projectsCreated >= 1
    ) {
      setIsOpen(true);
      localStorage.setItem('nps_survey_shown', 'true');
    }
  }, [engagement]);

  return {
    isOpen,
    onClose: () => setIsOpen(false),
  };
}
