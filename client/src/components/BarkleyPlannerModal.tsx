import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Sparkles,
  Zap,
  Target,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader,
  X,
  Plus,
} from 'lucide-react';

interface BarkleyPlannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCycleCreated?: (cycleData: any) => void;
}

/**
 * Barkley Planner Modal - AI-Powered 3-Day Cycle Generator
 * 
 * Allows users to:
 * 1. Describe their project
 * 2. Generate a 3-day cycle with A-B-C tasks
 * 3. Review and confirm
 * 4. Create tasks in dashboard
 */
export default function BarkleyPlannerModal({
  open,
  onOpenChange,
  onCycleCreated,
}: BarkleyPlannerModalProps) {
  const [step, setStep] = useState<'input' | 'generating' | 'review'>('input');
  const [projectDescription, setProjectDescription] = useState('');
  const [generatedCycle, setGeneratedCycle] = useState<any>(null);

  const generateCycleMutation = trpc.barkleyPlanner.generateCycle.useMutation({
    onSuccess: (data) => {
      setGeneratedCycle(data);
      setStep('review');
    },
    onError: (error) => {
      toast.error('Erro ao gerar ciclo: ' + error.message);
      setStep('input');
    },
  });

  const handleGenerateCycle = async () => {
    if (!projectDescription.trim()) {
      toast.error('Por favor, descreva seu projeto');
      return;
    }

    setStep('generating');
    await generateCycleMutation.mutateAsync({
      projectDescription: projectDescription.trim(),
    });
  };

  const handleConfirmCycle = () => {
    if (generatedCycle && onCycleCreated) {
      onCycleCreated(generatedCycle);
      toast.success('Ciclo criado com sucesso!');
      handleClose();
    }
  };

  const handleClose = () => {
    setStep('input');
    setProjectDescription('');
    setGeneratedCycle(null);
    onOpenChange(false);
  };

  const getViabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getViabilityBg = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Input Step */}
        {step === 'input' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--neuro-orange-primary)] to-[var(--neuro-blue-primary)] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle>Agente Planner Barkley</DialogTitle>
                  <DialogDescription>
                    Descreva seu projeto e deixe a IA gerar um ciclo de 3 dias otimizado
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Info Cards */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-3 text-center">
                  <Target className="w-5 h-5 mx-auto mb-2 text-[var(--neuro-orange-primary)]" />
                  <p className="text-xs font-medium">Tarefas A-B-C</p>
                  <p className="text-xs text-gray-500">Priorizadas</p>
                </Card>
                <Card className="p-3 text-center">
                  <Clock className="w-5 h-5 mx-auto mb-2 text-[var(--neuro-blue-primary)]" />
                  <p className="text-xs font-medium">3 Dias</p>
                  <p className="text-xs text-gray-500">Distribuídas</p>
                </Card>
                <Card className="p-3 text-center">
                  <Zap className="w-5 h-5 mx-auto mb-2 text-[var(--neuro-green-primary)]" />
                  <p className="text-xs font-medium">Neuroadaptado</p>
                  <p className="text-xs text-gray-500">Para TDAH</p>
                </Card>
              </div>

              {/* Project Description Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Descreva seu projeto</label>
                <Textarea
                  placeholder="Ex: Preciso criar uma landing page para meu novo produto de IA. Deve incluir hero section, features, pricing e CTA. Tenho 3 dias e conhecimento básico de React."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                <p className="text-xs text-gray-500">
                  Quanto mais detalhes você fornecer, melhor será o ciclo gerado.
                </p>
              </div>

              {/* Helper Tips */}
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Dicas para melhor resultado:</p>
                    <ul className="text-xs space-y-1 ml-4 list-disc">
                      <li>Seja específico sobre o resultado final desejado</li>
                      <li>Mencione restrições (tempo, recursos, conhecimento)</li>
                      <li>Indique se há dependências ou pré-requisitos</li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  variant="gradient"
                  onClick={handleGenerateCycle}
                  disabled={!projectDescription.trim() || generateCycleMutation.isPending}
                >
                  {generateCycleMutation.isPending ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerar Ciclo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Generating Step */}
        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--neuro-orange-primary)] animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-medium">Gerando seu ciclo de 3 dias...</p>
              <p className="text-sm text-gray-500 mt-1">
                Analisando projeto, decompondo entregas e distribuindo tarefas
              </p>
            </div>
          </div>
        )}

        {/* Review Step */}
        {step === 'review' && generatedCycle && (
          <>
            <DialogHeader>
              <DialogTitle>Seu Ciclo de 3 Dias</DialogTitle>
              <DialogDescription>
                Revise as tarefas geradas e confirme para criar no dashboard
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
              {/* Viability Score */}
              <Card className={`p-4 ${getViabilityBg(generatedCycle.viabilityScore)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Viabilidade do Ciclo</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {generatedCycle.viabilityScore >= 80
                        ? 'Ciclo muito viável! Você consegue completar tudo.'
                        : generatedCycle.viabilityScore >= 60
                        ? 'Ciclo viável, mas desafiador. Foco será necessário.'
                        : 'Ciclo desafiador. Considere estender para 4 dias.'}
                    </p>
                  </div>
                  <div className={`text-3xl font-bold ${getViabilityColor(generatedCycle.viabilityScore)}`}>
                    {generatedCycle.viabilityScore}%
                  </div>
                </div>
              </Card>

              {/* Warnings */}
              {generatedCycle.warnings.length > 0 && (
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    Atenção
                  </p>
                  <ul className="text-sm space-y-1 text-yellow-900">
                    {generatedCycle.warnings.map((warning: string, idx: number) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-3 text-center">
                  <p className="text-2xl font-bold text-[var(--neuro-orange-primary)]">
                    {generatedCycle.tasks.length}
                  </p>
                  <p className="text-xs text-gray-600">Tarefas</p>
                </Card>
                <Card className="p-3 text-center">
                  <p className="text-2xl font-bold text-[var(--neuro-blue-primary)]">
                    {generatedCycle.totalEstimatedHours.toFixed(1)}h
                  </p>
                  <p className="text-xs text-gray-600">Tempo Total</p>
                </Card>
                <Card className="p-3 text-center">
                  <p className="text-2xl font-bold text-[var(--neuro-green-primary)]">
                    {generatedCycle.deliverables.length}
                  </p>
                  <p className="text-xs text-gray-600">Entregas</p>
                </Card>
              </div>

              {/* Day Breakdown */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Distribuição por Dia</p>
                {[1, 2, 3].map((dayNum) => {
                  const dayTasks = generatedCycle.dayBreakdown[`day${dayNum}`] || [];
                  const dayLoad = dayTasks.reduce((sum: number, t: any) => sum + t.estimatedMinutes, 0);
                  return (
                    <Card key={dayNum} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-medium">Dia {dayNum}</p>
                        <Badge variant="outline">{dayLoad} min</Badge>
                      </div>
                      <div className="space-y-2">
                        {dayTasks.map((task: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 p-2 rounded bg-gray-50">
                            <Badge
                              variant={
                                task.priority === 'A'
                                  ? 'default'
                                  : task.priority === 'B'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {task.priority}
                            </Badge>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{task.title}</p>
                              <p className="text-xs text-gray-600">{task.estimatedMinutes} min</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Success Criteria */}
              {generatedCycle.successCriteria.length > 0 && (
                <Card className="p-4 bg-green-50 border-green-200">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Critérios de Sucesso
                  </p>
                  <ul className="text-sm space-y-1 text-green-900">
                    {generatedCycle.successCriteria.map((criteria: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        {criteria}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setStep('input')}>
                Voltar
              </Button>
              <Button variant="gradient" onClick={handleConfirmCycle}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Ciclo no Dashboard
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
