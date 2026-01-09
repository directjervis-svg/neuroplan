import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayoutNeuroPlan from "@/components/DashboardLayoutNeuroPlan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft,
  Loader2, 
  Target, 
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Info
} from "lucide-react";
import { Link, useParams } from "wouter";
import { useState, useMemo } from "react";
import { toast } from "sonner";

/**
 * Effort/Impact Matrix (Eisenhower-style)
 * Visual prioritization of tasks based on effort and impact scores
 * 
 * Quadrants:
 * - Quick Wins (Low Effort, High Impact) - DO FIRST
 * - Major Projects (High Effort, High Impact) - SCHEDULE
 * - Fill-ins (Low Effort, Low Impact) - DELEGATE/BATCH
 * - Time Sinks (High Effort, Low Impact) - ELIMINATE
 */
export default function EffortMatrix() {
  const params = useParams<{ id: string }>();
  const projectId = params.id ? parseInt(params.id) : undefined;
  
  const { data: project, isLoading: projectLoading } = trpc.projects.getById.useQuery(
    { id: projectId! },
    { enabled: !!projectId }
  );
  const { data: tasks, isLoading: tasksLoading } = trpc.tasks.getByProject.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  const utils = trpc.useUtils();

  const updateTask = trpc.tasks.update.useMutation({
    onSuccess: () => {
      utils.tasks.getByProject.invalidate({ projectId: projectId! });
      toast.success("Tarefa atualizada!");
    },
  });

  // Categorize tasks into quadrants
  const quadrants = useMemo(() => {
    if (!tasks) return { quickWins: [], majorProjects: [], fillIns: [], timeSinks: [] };

    const incompleteTasks = tasks.filter(t => !t.completedAt);
    
    return {
      quickWins: incompleteTasks.filter(t => 
        (t.effortScore || 5) <= 5 && (t.impactScore || 5) > 5
      ),
      majorProjects: incompleteTasks.filter(t => 
        (t.effortScore || 5) > 5 && (t.impactScore || 5) > 5
      ),
      fillIns: incompleteTasks.filter(t => 
        (t.effortScore || 5) <= 5 && (t.impactScore || 5) <= 5
      ),
      timeSinks: incompleteTasks.filter(t => 
        (t.effortScore || 5) > 5 && (t.impactScore || 5) <= 5
      ),
    };
  }, [tasks]);

  // Handle drag and drop to update task scores
  const handleTaskMove = (taskId: number, newEffort: number, newImpact: number) => {
    updateTask.mutate({
      id: taskId,
      effortScore: newEffort,
      impactScore: newImpact,
    });
  };

  if (projectLoading || tasksLoading) {
    return (
      <DashboardLayoutNeuroPlan>
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
        </div>
      </DashboardLayoutNeuroPlan>
    );
  }

  if (!project) {
    return (
      <DashboardLayoutNeuroPlan>
        <div className="p-6 lg:p-8">
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-foreground">Projeto não encontrado</h2>
            <Link href="/dashboard/projects">
              <Button className="mt-4">Voltar para Projetos</Button>
            </Link>
          </div>
        </div>
      </DashboardLayoutNeuroPlan>
    );
  }

  return (
    <DashboardLayoutNeuroPlan>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Link href={`/dashboard/projects/${projectId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Matriz Esforço/Resultado</h1>
            <p className="text-muted-foreground">{project.title}</p>
          </div>
        </div>

        {/* Legend */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#22C55E]" />
                <span>Quick Wins - Faça Primeiro</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#FF8C42]" />
                <span>Projetos Maiores - Agende</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#6B7280]" />
                <span>Preenchimentos - Agrupe</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#EF4444]" />
                <span>Ralos de Tempo - Elimine</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Matrix Grid */}
        <div className="grid grid-cols-2 gap-4 min-h-[600px]">
          {/* Quick Wins - Top Left */}
          <QuadrantCard
            title="Quick Wins"
            subtitle="Baixo Esforço, Alto Impacto"
            description="Faça primeiro! Vitórias rápidas que geram resultados."
            icon={Zap}
            color="#22C55E"
            tasks={quadrants.quickWins}
            onTaskClick={(task) => {
              // Navigate to task detail or show quick actions
              toast.info(`Tarefa: ${task.title}`);
            }}
            recommendation="PRIORIDADE MÁXIMA"
          />

          {/* Major Projects - Top Right */}
          <QuadrantCard
            title="Projetos Maiores"
            subtitle="Alto Esforço, Alto Impacto"
            description="Agende tempo dedicado. Divida em subtarefas menores."
            icon={Target}
            color="#FF8C42"
            tasks={quadrants.majorProjects}
            onTaskClick={(task) => {
              toast.info(`Tarefa: ${task.title}`);
            }}
            recommendation="AGENDAR BLOCOS DE TEMPO"
          />

          {/* Fill-ins - Bottom Left */}
          <QuadrantCard
            title="Preenchimentos"
            subtitle="Baixo Esforço, Baixo Impacto"
            description="Agrupe para fazer em momentos de baixa energia."
            icon={Clock}
            color="#6B7280"
            tasks={quadrants.fillIns}
            onTaskClick={(task) => {
              toast.info(`Tarefa: ${task.title}`);
            }}
            recommendation="AGRUPAR OU DELEGAR"
          />

          {/* Time Sinks - Bottom Right */}
          <QuadrantCard
            title="Ralos de Tempo"
            subtitle="Alto Esforço, Baixo Impacto"
            description="Questione a necessidade. Considere eliminar ou simplificar."
            icon={AlertTriangle}
            color="#EF4444"
            tasks={quadrants.timeSinks}
            onTaskClick={(task) => {
              toast.info(`Tarefa: ${task.title}`);
            }}
            recommendation="ELIMINAR OU SIMPLIFICAR"
          />
        </div>

        {/* Tips */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-[#22C55E] mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Como usar a matriz:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Comece sempre pelos <strong>Quick Wins</strong> para ganhar momentum</li>
                  <li>Reserve blocos de tempo para <strong>Projetos Maiores</strong></li>
                  <li>Agrupe <strong>Preenchimentos</strong> para momentos de baixa energia</li>
                  <li>Questione cada tarefa em <strong>Ralos de Tempo</strong> - ela é realmente necessária?</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayoutNeuroPlan>
  );
}

interface QuadrantCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  tasks: any[];
  onTaskClick: (task: any) => void;
  recommendation: string;
}

function QuadrantCard({ 
  title, 
  subtitle, 
  description, 
  icon: Icon, 
  color, 
  tasks, 
  onTaskClick,
  recommendation 
}: QuadrantCardProps) {
  return (
    <Card 
      className="flex flex-col"
      style={{ borderColor: `${color}30` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription className="text-xs">{subtitle}</CardDescription>
            </div>
          </div>
          <span 
            className="text-xs font-medium px-2 py-1 rounded"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {tasks.length}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma tarefa neste quadrante
            </p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                onClick={() => onTaskClick(task)}
              >
                <div className="flex items-start gap-2">
                  <div 
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>Esforço: {task.effortScore || 5}/10</span>
                      <span>•</span>
                      <span>Impacto: {task.impactScore || 5}/10</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Recommendation */}
        <div 
          className="mt-4 p-2 rounded text-center text-xs font-medium"
          style={{ backgroundColor: `${color}10`, color }}
        >
          {recommendation}
        </div>
      </CardContent>
    </Card>
  );
}
