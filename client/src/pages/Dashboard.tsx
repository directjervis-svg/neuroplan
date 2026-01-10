import DashboardLayoutNeuroExecucao from "@/components/DashboardLayoutNeuroExecucao";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  FolderKanban, 
  Lightbulb, 
  Play, 
  Plus, 
  Target,
  Zap
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * Dashboard Page - Main hub for NeuroExecução
 * Shows overview of projects, today's tasks, and quick actions
 * Follows Barkley principles: max 3 interactive elements per viewport
 */
export default function Dashboard() {
  const { user } = useAuth();
  const { data: projects, isLoading: projectsLoading } = trpc.projects.list.useQuery();
  const { data: todayTasks } = trpc.tasks.getToday.useQuery();
  const { data: stats } = trpc.stats.overview.useQuery();

  return (
    <DashboardLayoutNeuroExecucao>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Olá, {user?.name?.split(" ")[0] || "Usuário"} 👋
          </h1>
          <p className="text-muted-foreground">
            Vamos transformar suas ideias em ações hoje.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Projetos Ativos"
            value={stats?.activeProjects ?? 0}
            icon={<FolderKanban className="h-5 w-5" />}
            color="#22C55E"
          />
          <StatsCard
            title="Tarefas Hoje"
            value={stats?.todayTasks ?? 0}
            icon={<Target className="h-5 w-5" />}
            color="#FF8C42"
          />
          <StatsCard
            title="Tempo Focado"
            value={`${stats?.focusMinutes ?? 0}min`}
            icon={<Clock className="h-5 w-5" />}
            color="#22C55E"
          />
        </div>

        {/* Today's Tasks - Primary focus area */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Tarefas de Hoje</CardTitle>
              <CardDescription>
                Sistema 3+1: Máximo 3 ações + 1 preparação para amanhã
              </CardDescription>
            </div>
            <Link href="/dashboard/focus">
              <Button variant="outline" size="sm" className="gap-2">
                <Play className="h-4 w-4" />
                Iniciar Foco
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {todayTasks && todayTasks.length > 0 ? (
              <div className="space-y-3">
                {todayTasks.slice(0, 4).map((task, index) => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    isPriming={index === 3}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Target className="h-12 w-12 text-muted-foreground/50" />}
                title="Nenhuma tarefa para hoje"
                description="Crie um novo projeto ou selecione um existente para gerar tarefas."
                action={
                  <Link href="/dashboard/projects/new">
                    <Button className="bg-[#22C55E] hover:bg-[#16A34A] text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Projeto
                    </Button>
                  </Link>
                }
              />
            )}
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Projetos Recentes</CardTitle>
                <CardDescription>Continue de onde parou</CardDescription>
              </div>
              <Link href="/dashboard/projects">
                <Button variant="ghost" size="sm" className="gap-1 text-[#22C55E]">
                  Ver todos
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : projects && projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.slice(0, 3).map((project) => (
                    <ProjectItem key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<FolderKanban className="h-10 w-10 text-muted-foreground/50" />}
                  title="Nenhum projeto ainda"
                  description="Comece criando seu primeiro projeto."
                  action={
                    <Link href="/dashboard/projects/new">
                      <Button size="sm" className="bg-[#22C55E] hover:bg-[#16A34A] text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Projeto
                      </Button>
                    </Link>
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* Quick Ideas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Quick Ideas</CardTitle>
                <CardDescription>Capture pensamentos não-lineares</CardDescription>
              </div>
              <Link href="/dashboard/ideas">
                <Button variant="ghost" size="sm" className="gap-1 text-[#22C55E]">
                  Ver todas
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <QuickIdeaInput />
                <div className="text-xs text-muted-foreground text-center pt-2">
                  Pressione Enter para salvar. Suas ideias ficam seguras aqui.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Motivational Tip - Based on Barkley */}
        <Card className="bg-gradient-to-r from-[#22C55E]/5 to-[#FF8C42]/5 border-[#22C55E]/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-[#22C55E]/10">
                <Zap className="h-5 w-5 text-[#22C55E]" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Dica do Dia</h3>
                <p className="text-sm text-muted-foreground">
                  "Não confie na memória, confie no que pode ver." — Russell Barkley. 
                  Use o registro "Onde Parei" no final do dia para externalizar seu contexto.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayoutNeuroExecucao>
  );
}

function StatsCard({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
          <div 
            className="p-3 rounded-lg" 
            style={{ backgroundColor: `${color}15` }}
          >
            <div style={{ color }}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskItem({ 
  task, 
  isPriming 
}: { 
  task: { id: number; title: string; completedAt: Date | null; type: string | null };
  isPriming: boolean;
}) {
  const isCompleted = !!task.completedAt;
  
  return (
    <div 
      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
        isCompleted 
          ? "bg-[#22C55E]/5 border-[#22C55E]/20" 
          : isPriming 
            ? "bg-[#FF8C42]/5 border-[#FF8C42]/20"
            : "bg-muted/50 border-border hover:border-[#22C55E]/30"
      }`}
    >
      <div 
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
          isCompleted 
            ? "bg-[#22C55E] border-[#22C55E]" 
            : "border-muted-foreground/30"
        }`}
      >
        {isCompleted && <CheckCircle2 className="h-4 w-4 text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
          {task.title}
        </p>
        {isPriming && (
          <span className="text-xs text-[#FF8C42]">Preparação para amanhã</span>
        )}
      </div>
      {!isCompleted && (
        <Button variant="ghost" size="sm" className="flex-shrink-0">
          <Play className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function ProjectItem({ 
  project 
}: { 
  project: { 
    id: number; 
    title: string; 
    status: string | null;
    category: string | null;
  };
}) {
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
    <Link href={`/dashboard/projects/${project.id}`}>
      <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-[#22C55E]/30 transition-colors cursor-pointer">
        <div className="p-2 rounded-lg bg-muted">
          <FolderKanban className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{project.title}</p>
          <div className="flex items-center gap-2">
            <span 
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ 
                backgroundColor: `${statusColors[status]}15`,
                color: statusColors[status]
              }}
            >
              {statusLabels[status]}
            </span>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

function QuickIdeaInput() {
  const utils = trpc.useUtils();
  const createIdea = trpc.ideas.create.useMutation({
    onSuccess: () => {
      utils.ideas.list.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("idea") as HTMLInputElement;
    if (input.value.trim()) {
      createIdea.mutate({ content: input.value.trim() });
      input.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30 focus-within:border-[#22C55E]/50 transition-colors">
        <Lightbulb className="h-5 w-5 text-[#FF8C42]" />
        <input
          name="idea"
          type="text"
          placeholder="Capturar uma ideia rápida..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          disabled={createIdea.isPending}
        />
      </div>
    </form>
  );
}

function EmptyState({ 
  icon, 
  title, 
  description, 
  action 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {icon}
      <h3 className="mt-4 text-sm font-medium text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
