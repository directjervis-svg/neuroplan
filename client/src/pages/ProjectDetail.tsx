import DashboardLayoutNeuroPlan from "@/components/DashboardLayoutNeuroPlan";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Edit, 
  Loader2, 
  MoreVertical, 
  Play, 
  Plus, 
  Sparkles, 
  Target,
  FileText,
  Lightbulb,
  Brain,
  Download,
  Grid3X3
} from "lucide-react";
import { Link, useParams } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

/**
 * Project Detail Page
 * Shows project overview, tasks by day, and daily logs
 */
export default function ProjectDetail() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id || "0");

  const { data: project, isLoading: projectLoading } = trpc.projects.getById.useQuery({ id: projectId });
  const { data: tasks, isLoading: tasksLoading } = trpc.tasks.getByProject.useQuery({ projectId });
  const { data: dailyLogs } = trpc.dailyLogs.list.useQuery({ projectId });

  const utils = trpc.useUtils();

  const updateProject = trpc.projects.update.useMutation({
    onSuccess: () => {
      utils.projects.getById.invalidate({ id: projectId });
      toast.success("Projeto atualizado!");
    },
  });

  const completeTask = trpc.tasks.complete.useMutation({
    onSuccess: () => {
      utils.tasks.getByProject.invalidate({ projectId });
      toast.success("Tarefa concluída!");
    },
  });

  if (projectLoading) {
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

  const completedTasks = tasks?.filter(t => t.completedAt) || [];
  const totalTasks = tasks?.length || 0;
  const progress = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

  // Group tasks by day
  const tasksByDay: Record<number, typeof tasks> = {};
  tasks?.forEach(task => {
    if (!tasksByDay[task.dayNumber]) {
      tasksByDay[task.dayNumber] = [];
    }
    tasksByDay[task.dayNumber]!.push(task);
  });

  const statusColors: Record<string, string> = {
    PLANNING: "#FF8C42",
    ACTIVE: "#22C55E",
    PAUSED: "#6B7280",
    COMPLETED: "#22C55E",
  };

  const statusLabels: Record<string, string> = {
    PLANNING: "Planejando",
    ACTIVE: "Ativo",
    PAUSED: "Pausado",
    COMPLETED: "Concluído",
  };

  const status = project.status || "PLANNING";

  return (
    <DashboardLayoutNeuroPlan>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Link href="/dashboard/projects">
              <Button variant="ghost" size="icon" className="mt-1">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
                <span
                  className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: `${statusColors[status]}15`,
                    color: statusColors[status],
                  }}
                >
                  {statusLabels[status]}
                </span>
              </div>
              {project.briefing && (
                <p className="text-muted-foreground mt-1 max-w-2xl">{project.briefing}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {status === "PLANNING" && (
              <Button
                onClick={() => updateProject.mutate({ id: projectId, status: "ACTIVE" })}
                className="bg-[#22C55E] hover:bg-[#16A34A] text-white"
              >
                <Play className="mr-2 h-4 w-4" />
                Iniciar Projeto
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Projeto
                </DropdownMenuItem>
                <Link href={`/dashboard/projects/${projectId}/export`}>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Projeto
                  </DropdownMenuItem>
                </Link>
                <Link href={`/dashboard/projects/${projectId}/matrix`}>
                  <DropdownMenuItem>
                    <Grid3X3 className="mr-2 h-4 w-4" />
                    Matriz Esforço/Resultado
                  </DropdownMenuItem>
                </Link>
                {status === "ACTIVE" && (
                  <DropdownMenuItem onClick={() => updateProject.mutate({ id: projectId, status: "PAUSED" })}>
                    <Clock className="mr-2 h-4 w-4" />
                    Pausar Projeto
                  </DropdownMenuItem>
                )}
                {status === "PAUSED" && (
                  <DropdownMenuItem onClick={() => updateProject.mutate({ id: projectId, status: "ACTIVE" })}>
                    <Play className="mr-2 h-4 w-4" />
                    Retomar Projeto
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Progresso do Ciclo</p>
                <p className="text-2xl font-bold text-foreground">
                  {completedTasks.length}/{totalTasks} tarefas
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#22C55E]">{Math.round(progress)}%</p>
              </div>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* Deliverables A-B-C */}
        {(project.deliverableA || project.deliverableB || project.deliverableC) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-[#22C55E]" />
                Entregáveis (Anti-Perfeccionismo)
              </CardTitle>
              <CardDescription>
                Três níveis de entrega para combater a paralisia por perfeccionismo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {project.deliverableA && (
                  <DeliverableCard level="A" label="Mínimo" description={project.deliverableA} color="#22C55E" />
                )}
                {project.deliverableB && (
                  <DeliverableCard level="B" label="Ideal" description={project.deliverableB} color="#FF8C42" />
                )}
                {project.deliverableC && (
                  <DeliverableCard level="C" label="Excepcional" description={project.deliverableC} color="#EC4899" />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs: Tasks, Logs, AI */}
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Tarefas
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <FileText className="h-4 w-4" />
              Onde Parei
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="h-4 w-4" />
              IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            {tasksLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : tasks && tasks.length > 0 ? (
              Object.entries(tasksByDay)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([day, dayTasks]) => (
                  <DayCard
                    key={day}
                    dayNumber={parseInt(day)}
                    tasks={dayTasks || []}
                    onComplete={(taskId) => completeTask.mutate({ id: taskId })}
                  />
                ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-medium text-foreground mb-2">Nenhuma tarefa gerada</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Use a IA para decompor seu briefing em tarefas acionáveis
                  </p>
                  <GenerateTasksDialog projectId={projectId} briefing={project.briefing || ""} cycleDuration={project.cycleDuration || "DAYS_3"} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-foreground">Registros "Onde Parei"</h3>
              <CreateDailyLogDialog projectId={projectId} />
            </div>
            {dailyLogs && dailyLogs.length > 0 ? (
              <div className="space-y-3">
                {dailyLogs.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">Dia {log.dayNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        {log.mood && <MoodBadge mood={log.mood} />}
                      </div>
                      <p className="mt-3 text-sm text-foreground">{log.whereILeft}</p>
                      {log.nextSteps && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground">Próximos passos:</p>
                          <p className="text-sm text-foreground">{log.nextSteps}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Brain className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-medium text-foreground mb-2">Nenhum registro ainda</h3>
                  <p className="text-sm text-muted-foreground">
                    Registre onde você parou no final de cada dia para compensar o déficit de memória de trabalho
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#22C55E]" />
                  Assistente de IA
                </CardTitle>
                <CardDescription>
                  Use a IA para gerar tarefas, reformular o briefing ou obter coaching socrático
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <GenerateTasksDialog projectId={projectId} briefing={project.briefing || ""} cycleDuration={project.cycleDuration || "DAYS_3"} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayoutNeuroPlan>
  );
}

function DeliverableCard({
  level,
  label,
  description,
  color,
}: {
  level: string;
  label: string;
  description: string;
  color: string;
}) {
  return (
    <div
      className="p-4 rounded-lg border-2"
      style={{ borderColor: `${color}30`, backgroundColor: `${color}05` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {level}
        </span>
        <span className="font-medium text-foreground">{label}</span>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function DayCard({
  dayNumber,
  tasks,
  onComplete,
}: {
  dayNumber: number;
  tasks: Array<{
    id: number;
    title: string;
    type: string | null;
    position: number;
    completedAt: Date | null;
    effortScore: number | null;
    impactScore: number | null;
  }>;
  onComplete: (taskId: number) => void;
}) {
  const dayLabels: Record<number, string> = {
    0: "Dia 0 - Planejamento",
    1: "Dia 1",
    2: "Dia 2",
    3: "Dia 3",
  };

  const completedCount = tasks.filter(t => t.completedAt).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{dayLabels[dayNumber] || `Dia ${dayNumber}`}</CardTitle>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{tasks.length} concluídas
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks
          .sort((a, b) => a.position - b.position)
          .map((task) => (
            <TaskRow key={task.id} task={task} onComplete={() => onComplete(task.id)} />
          ))}
      </CardContent>
    </Card>
  );
}

function TaskRow({
  task,
  onComplete,
}: {
  task: {
    id: number;
    title: string;
    type: string | null;
    position: number;
    completedAt: Date | null;
    effortScore: number | null;
    impactScore: number | null;
  };
  onComplete: () => void;
}) {
  const isCompleted = !!task.completedAt;
  const isPriming = task.position === 4;
  const type = task.type || "ACTION";

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
        isCompleted
          ? "bg-[#22C55E]/5 border-[#22C55E]/20"
          : isPriming
          ? "bg-[#FF8C42]/5 border-[#FF8C42]/20"
          : "bg-muted/30 border-border hover:border-[#22C55E]/30"
      }`}
    >
      <button
        onClick={onComplete}
        disabled={isCompleted}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          isCompleted
            ? "bg-[#22C55E] border-[#22C55E]"
            : "border-muted-foreground/30 hover:border-[#22C55E]"
        }`}
      >
        {isCompleted && <CheckCircle2 className="h-4 w-4 text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            isCompleted ? "line-through text-muted-foreground" : "text-foreground"
          }`}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {isPriming && (
            <span className="text-xs text-[#FF8C42]">Preparação</span>
          )}
          {type === "RETENTION" && (
            <span className="text-xs text-muted-foreground">Contingência</span>
          )}
          {task.effortScore && task.impactScore && (
            <span className="text-xs text-muted-foreground">
              E:{task.effortScore} I:{task.impactScore}
            </span>
          )}
        </div>
      </div>
      {!isCompleted && (
        <Link href={`/dashboard/focus?taskId=${task.id}`}>
          <Button variant="ghost" size="sm">
            <Play className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}

function MoodBadge({ mood }: { mood: string }) {
  const moodConfig: Record<string, { label: string; color: string }> = {
    GREAT: { label: "Ótimo", color: "#22C55E" },
    GOOD: { label: "Bom", color: "#22C55E" },
    NEUTRAL: { label: "Neutro", color: "#6B7280" },
    STRUGGLING: { label: "Difícil", color: "#FF8C42" },
    DIFFICULT: { label: "Muito Difícil", color: "#EF4444" },
  };

  const config = moodConfig[mood] || moodConfig.NEUTRAL;

  return (
    <span
      className="text-xs px-2 py-1 rounded-full"
      style={{ backgroundColor: `${config.color}15`, color: config.color }}
    >
      {config.label}
    </span>
  );
}

function GenerateTasksDialog({ projectId, briefing, cycleDuration }: { projectId: number; briefing: string; cycleDuration: string }) {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const generateTasks = trpc.ai.generateTasks.useMutation({
    onSuccess: (data) => {
      utils.tasks.getByProject.invalidate({ projectId });
      utils.projects.getById.invalidate({ id: projectId });
      toast.success(`${data.tasksCreated} tarefas geradas com sucesso!`);
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Erro ao gerar tarefas: " + error.message);
    },
  });

  const handleGenerate = () => {
    if (!briefing || briefing.length < 10) {
      toast.error("Por favor, adicione um briefing mais detalhado ao projeto.");
      return;
    }
    generateTasks.mutate({
      projectId,
      briefing,
      cycleDuration: (cycleDuration as "DAYS_3" | "DAYS_7" | "DAYS_14") || "DAYS_3",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#22C55E] hover:bg-[#16A34A] text-white">
          <Sparkles className="mr-2 h-4 w-4" />
          Gerar Tarefas com IA
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerar Tarefas com IA</DialogTitle>
          <DialogDescription>
            A IA vai analisar seu briefing e criar tarefas seguindo o sistema 3+1 de Barkley.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Briefing atual:</p>
            <p className="text-sm text-foreground">{briefing || "Nenhum briefing definido"}</p>
          </div>
          {!briefing && (
            <p className="text-sm text-destructive">
              Adicione um briefing ao projeto antes de gerar tarefas.
            </p>
          )}
          {generateTasks.isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analisando briefing e gerando tarefas...
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={generateTasks.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!briefing || generateTasks.isPending}
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white"
          >
            {generateTasks.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Tarefas
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CreateDailyLogDialog({ projectId }: { projectId: number }) {
  const [open, setOpen] = useState(false);
  const [whereILeft, setWhereILeft] = useState("");
  const [nextSteps, setNextSteps] = useState("");

  const utils = trpc.useUtils();
  const createLog = trpc.dailyLogs.create.useMutation({
    onSuccess: () => {
      utils.dailyLogs.list.invalidate({ projectId });
      toast.success("Registro salvo!");
      setOpen(false);
      setWhereILeft("");
      setNextSteps("");
    },
  });

  const handleSubmit = () => {
    if (!whereILeft.trim()) {
      toast.error("Descreva onde você parou");
      return;
    }
    createLog.mutate({
      projectId,
      dayNumber: 1, // Simplified - would calculate based on project start
      whereILeft,
      nextSteps: nextSteps || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Registrar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Onde Parei Hoje</DialogTitle>
          <DialogDescription>
            Registre o contexto do seu trabalho para retomar amanhã sem perder o fio da meada.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Onde você parou?</Label>
            <Textarea
              placeholder="Descreva o que você estava fazendo, em que ponto parou, e qualquer contexto importante..."
              value={whereILeft}
              onChange={(e) => setWhereILeft(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Próximos passos (opcional)</Label>
            <Textarea
              placeholder="O que você precisa fazer quando retomar..."
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createLog.isPending}
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white"
          >
            {createLog.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
