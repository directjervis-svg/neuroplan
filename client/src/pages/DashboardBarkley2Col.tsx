import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  AlertCircle,
  Target,
  Send,
  ChevronDown,
  ChevronUp,
  Brain,
  Clock
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

/**
 * Dashboard Barkley 2 Colunas - Layout Otimizado TDAH
 * 
 * Reduz sobrecarga cognitiva com layout simplificado:
 * 
 * Desktop (lg+):
 * - Coluna Principal (70%): Tarefas + Workspace integrado
 * - Coluna Contexto (30%): Colapsável, informações secundárias
 * 
 * Mobile (< lg):
 * - Layout de coluna única com navegação por abas
 * 
 * Benefícios TDAH:
 * - Menos distrações visuais
 * - Foco na tarefa atual
 * - Contexto disponível mas não intrusivo
 * - Menos movimento ocular horizontal
 */

interface CycleTask {
  id: number;
  title: string;
  description: unknown;
  priority: "A" | "B" | "C";
  dayNumber: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED" | null;
  estimatedMinutes: number | null;
  checklist: unknown;
}

interface WhereILeftOff {
  id: number;
  content: string;
  nextAction: string | null;
  blockers: string | null;
}

export default function DashboardBarkley2Col() {
  const { user, loading: authLoading } = useAuth();
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState("");
  const [contextOpen, setContextOpen] = useState(false); // Colapsável por padrão
  const [mobileTab, setMobileTab] = useState("tasks");
  
  // Task description as string
  const getTaskDescription = (desc: unknown): string => {
    if (typeof desc === 'string') return desc;
    if (desc === null || desc === undefined) return '';
    return JSON.stringify(desc);
  };

  // Queries
  const { data: activeCycle, isLoading: cycleLoading } = trpc.cycles.getActive.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: todayTasks = [], isLoading: tasksLoading } = trpc.cycles.getTodayTasks.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: whereILeft } = trpc.cycles.getWhereILeftOff.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: projectContext } = trpc.cycles.getProjectContext.useQuery(
    activeCycle?.projectId ? { projectId: activeCycle.projectId } : undefined,
    { enabled: !!activeCycle?.projectId }
  );

  // Mutations
  const completeTask = trpc.cycles.completeTask.useMutation({
    onSuccess: () => {
      toast.success("Tarefa concluída! 🎉");
      setActiveTaskId(null);
    },
  });

  const askAssistant = trpc.ai.askAssistant.useMutation({
    onSuccess: (data) => {
      toast.success("Resposta do assistente recebida!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao consultar assistente");
    },
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Auto-select first task
  useEffect(() => {
    if (todayTasks.length > 0 && !activeTaskId) {
      const firstIncomplete = todayTasks.find(t => t.status !== "COMPLETED");
      if (firstIncomplete) {
        setActiveTaskId(firstIncomplete.id);
      }
    }
  }, [todayTasks, activeTaskId]);

  const activeTask = todayTasks.find(t => t.id === activeTaskId);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "A": return "bg-red-100 text-red-700 border-red-300";
      case "B": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "C": return "bg-green-100 text-green-700 border-green-300";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  if (authLoading || cycleLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-3 animate-pulse text-green-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!activeCycle) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600">Nenhum ciclo ativo. Crie um projeto primeiro!</p>
        </div>
      </div>
    );
  }

  // Mobile Layout
  const MobileLayout = () => (
    <div className="flex flex-col h-screen bg-white lg:hidden">
      <Tabs value={mobileTab} onValueChange={setMobileTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full rounded-none border-b border-gray-200 bg-transparent">
          <TabsTrigger value="tasks" className="flex-1">Tarefas</TabsTrigger>
          <TabsTrigger value="workspace" className="flex-1">Workspace</TabsTrigger>
          <TabsTrigger value="context" className="flex-1">Contexto</TabsTrigger>
        </TabsList>

        {/* Tab: Tasks */}
        <TabsContent value="tasks" className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Hoje</h2>
            <p className="text-sm text-gray-600">
              Dia {activeCycle.currentDay || 1} do ciclo de 3 dias
            </p>
          </div>

          {whereILeft && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                Onde parei ontem
              </h3>
              <p className="text-sm text-gray-700 line-clamp-2">
                {whereILeft.content}
              </p>
            </div>
          )}

          <div className="space-y-2">
            {todayTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => {
                  setActiveTaskId(task.id);
                  setMobileTab("workspace");
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  activeTaskId === task.id
                    ? "bg-green-50 border-green-300"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  <Checkbox checked={task.status === "COMPLETED"} className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {task.estimatedMinutes}min
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      {task.title}
                    </h4>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Workspace */}
        <TabsContent value="workspace" className="flex-1 flex flex-col overflow-hidden">
          {activeTask ? (
            <>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <div>
                    <Badge className={getPriorityColor(activeTask.priority)}>
                      {activeTask.priority}
                    </Badge>
                    <h1 className="text-xl font-bold text-gray-900 mt-2">
                      {activeTask.title}
                    </h1>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {getTaskDescription(activeTask.description)}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">Tempo investido</p>
                    <p className="text-3xl font-bold text-green-600 font-mono">
                      {formatTime(timerSeconds)}
                    </p>
                  </div>
                </div>
              </ScrollArea>

              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {timerRunning ? "Pausar" : "Começar"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => completeTask.mutate({ taskId: activeTask.id })}
                    className="flex-1"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Concluir
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Selecione uma tarefa</p>
            </div>
          )}
        </TabsContent>

        {/* Tab: Context */}
        <TabsContent value="context" className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {whereILeft && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Onde Parei</h3>
                <p className="text-sm text-gray-700 mb-2">{whereILeft.content}</p>
                {whereILeft.nextAction && (
                  <p className="text-sm text-gray-600">
                    <strong>Próxima ação:</strong> {whereILeft.nextAction}
                  </p>
                )}
              </div>
            )}

            {projectContext?.summaryBullets && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Projeto</h3>
                <div className="space-y-2">
                  {Array.isArray(projectContext.summaryBullets) && projectContext.summaryBullets.map((bullet: any, idx: number) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-green-600">•</span>
                      <p className="text-sm text-gray-700">{bullet.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Desktop Layout - 2 Colunas
  const DesktopLayout = () => (
    <div className="hidden lg:flex h-screen bg-white overflow-hidden">
      {/* MAIN COLUMN - 70% */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden border-r border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 bg-white">
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">Hoje</h2>
          <p className="text-sm text-gray-600">
            Dia {activeCycle.currentDay || 1} do ciclo de 3 dias
          </p>
        </div>

        {/* Tasks List + Workspace Combined */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* "Onde Parei" Block */}
            {whereILeft && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  Onde parei ontem
                </h3>
                <p className="text-sm text-gray-700">
                  {whereILeft.content}
                </p>
                {whereILeft.nextAction && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Próxima ação:</strong> {whereILeft.nextAction}
                  </p>
                )}
              </div>
            )}

            {/* Tasks List */}
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setActiveTaskId(task.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    activeTaskId === task.id
                      ? "bg-green-50 border-green-300 shadow-md ring-2 ring-green-200"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.status === "COMPLETED"}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.estimatedMinutes}min
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 text-base">
                        {task.title}
                      </h4>
                      {activeTaskId === task.id && (
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                          {getTaskDescription(task.description)}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Active Task Workspace */}
            {activeTask && (
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Workspace</h3>
                
                {/* Timer */}
                <div className="p-4 bg-white rounded-lg border border-gray-200 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Tempo investido</p>
                    <p className="text-5xl font-bold text-green-600 font-mono">
                      {formatTime(timerSeconds)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 text-base"
                  >
                    {timerRunning ? "⏸ Pausar" : "▶ Começar"} por 10 min
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => completeTask.mutate({ taskId: activeTask.id })}
                    className="flex-1 h-12 text-base"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Concluir Tarefa
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* CONTEXT COLUMN - 30% (Collapsible) */}
      <aside className="w-[30%] flex flex-col bg-gray-50 border-l border-gray-200">
        <Collapsible open={contextOpen} onOpenChange={setContextOpen}>
          <CollapsibleTrigger className="w-full p-4 flex items-center justify-between border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-green-600" />
              Contexto & Assistente
            </h3>
            {contextOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </CollapsibleTrigger>

          <CollapsibleContent className="flex-1 flex flex-col overflow-hidden">
            <Tabs defaultValue="assistant" className="flex-1 flex flex-col">
              <TabsList className="w-full rounded-none border-b border-gray-200 bg-transparent p-0">
                <TabsTrigger value="assistant" className="flex-1 rounded-none">
                  Assistente
                </TabsTrigger>
                <TabsTrigger value="project" className="flex-1 rounded-none">
                  Projeto
                </TabsTrigger>
              </TabsList>

              {/* Tab: Assistant */}
              <TabsContent value="assistant" className="flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 p-4">
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">
                      💬 Olá! Sou seu assistente neuroadaptado. Faça perguntas sobre seu projeto ou tarefa atual.
                    </p>
                  </div>
                </ScrollArea>
                <div className="border-t border-gray-200 p-4 bg-white">
                  <div className="flex gap-2">
                    <Input
                      value={assistantMessage}
                      onChange={(e) => setAssistantMessage(e.target.value)}
                      placeholder="Faça uma pergunta..."
                      className="text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && assistantMessage.trim()) {
                          askAssistant.mutate({
                            projectId: activeCycle.projectId,
                            message: assistantMessage,
                          });
                          setAssistantMessage("");
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        if (assistantMessage.trim()) {
                          askAssistant.mutate({
                            projectId: activeCycle.projectId,
                            message: assistantMessage,
                          });
                          setAssistantMessage("");
                        }
                      }}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Project */}
              <TabsContent value="project" className="flex-1 overflow-y-auto p-4">
                {projectContext?.summaryBullets ? (
                  <div className="space-y-3">
                    {Array.isArray(projectContext.summaryBullets) && projectContext.summaryBullets.map((bullet: any, idx: number) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <p className="text-sm text-gray-700">{bullet.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum resumo disponível</p>
                )}
              </TabsContent>
            </Tabs>
          </CollapsibleContent>
        </Collapsible>

        {/* Collapsed State */}
        {!contextOpen && (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500">
              Clique acima para ver contexto e assistente
            </p>
          </div>
        )}
      </aside>
    </div>
  );

  return (
    <>
      <MobileLayout />
      <DesktopLayout />
    </>
  );
}
