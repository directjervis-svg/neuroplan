import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { NeuroTooltip, NeuroInfoBadge } from "@/components/NeuroTooltip";
import { QuickFeedback, XPGain } from "@/components/QuickFeedback";
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  Brain, 
  MessageSquare,
  Plus,
  Target,
  Calendar,
  Send,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  HelpCircle,
  AlertCircle,
  Menu,
  X,
  ListTodo,
  FileText,
  Bot
} from "lucide-react";

/**
 * Dashboard Barkley - Layout Responsivo
 * 
 * Desktop (lg+):
 * - Painel Esquerdo (30-35%): Lista de tarefas A-B-C + "Onde parei"
 * - Painel Central (45-50%): Workspace da tarefa ativa
 * - Painel Direito (20-25%): Abas (Projeto, Onde Parei, Assistente)
 * 
 * Mobile (< lg):
 * - Sistema de Tabs: Tarefas | Workspace | Info
 * - Layout de coluna única com navegação por abas
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

export default function DashboardBarkley() {
  const { user, loading: authLoading } = useAuth();
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [assistantTab, setAssistantTab] = useState("project");
  const [mobileTab, setMobileTab] = useState("tasks");
  const [assistantMessage, setAssistantMessage] = useState("");
  
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
    { projectId: activeCycle?.projectId ?? 0 },
    { enabled: !!activeCycle?.projectId }
  );

  // Mutations
  const completeTask = trpc.cycles.completeTask.useMutation({
    onSuccess: () => toast.success("Tarefa concluída! +50 XP"),
  });

  const startTask = trpc.cycles.startTask.useMutation();
  const askAssistant = trpc.ai.askAssistant.useMutation();

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "A": return "bg-red-100 text-red-800 border-red-300";
      case "B": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "C": return "bg-green-100 text-green-800 border-green-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const activeTask = todayTasks.find(t => t.id === activeTaskId);

  // Handle task selection on mobile - switch to workspace tab
  const handleTaskSelect = (taskId: number) => {
    setActiveTaskId(taskId);
    setMobileTab("workspace");
  };

  if (authLoading || cycleLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (!activeCycle) {
    return (
      <div className="flex items-center justify-center h-screen bg-white p-4">
        <div className="text-center">
          <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Nenhum ciclo ativo</h2>
          <p className="text-gray-600 mb-6 text-sm md:text-base">Crie seu primeiro ciclo de 3 dias para começar</p>
          <Link href="/projects">
            <Button className="bg-green-600 hover:bg-green-700 text-white min-h-[48px] px-6">
              Criar Ciclo
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ============================================
  // MOBILE LAYOUT (< lg)
  // ============================================
  const MobileLayout = () => (
    <div className="flex flex-col h-screen bg-white lg:hidden">
      {/* Mobile Header */}
      <header className="border-b border-gray-200 p-4 bg-white">
        <h1 className="text-lg font-semibold text-gray-900">
          Dia {activeCycle.currentDay || 1} do ciclo
        </h1>
        <p className="text-sm text-gray-600">
          {todayTasks.filter(t => t.status === "COMPLETED").length}/{todayTasks.length} tarefas concluídas
        </p>
      </header>

      {/* Mobile Tabs Content */}
      <Tabs value={mobileTab} onValueChange={setMobileTab} className="flex-1 flex flex-col overflow-hidden">
        {/* Tab: Tasks List */}
        <TabsContent value="tasks" className="flex-1 overflow-y-auto m-0 p-0">
          <div className="p-4 space-y-4">
            {/* "Onde Parei" Block */}
            {whereILeft && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  Onde parei ontem
                </h3>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {whereILeft.content}
                </p>
              </div>
            )}

            {/* Tasks List */}
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleTaskSelect(task.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all min-h-[72px] ${
                    activeTaskId === task.id
                      ? "bg-green-50 border-green-300 shadow-md"
                      : "bg-white border-gray-200 active:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.status === "COMPLETED"}
                      className="mt-1 min-w-[20px] min-h-[20px]"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {task.estimatedMinutes}min
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm leading-snug">
                        {task.title}
                      </h4>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tab: Workspace */}
        <TabsContent value="workspace" className="flex-1 flex flex-col overflow-hidden m-0 p-0">
          {activeTask ? (
            <>
              {/* Task Header */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className={getPriorityColor(activeTask.priority)}>
                    {activeTask.priority}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {activeTask.estimatedMinutes} minutos
                  </span>
                </div>
                <h1 className="text-lg font-bold text-gray-900 leading-snug">
                  {activeTask.title}
                </h1>
              </div>

              {/* Task Content */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {/* Description */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">Descrição</h3>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {getTaskDescription(activeTask.description)}
                    </p>
                  </div>

                  {/* Checklist */}
                  {(() => {
                    const checklist = activeTask.checklist as any[];
                    if (!checklist || !Array.isArray(checklist)) return null;
                    return (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Checklist</h3>
                        <div className="space-y-3">
                          {checklist.map((item: any, idx: number) => (
                            <label key={idx} className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                              <Checkbox defaultChecked={item.completed} className="min-w-[20px] min-h-[20px]" />
                              <span className="text-gray-700 text-sm">{item.text}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Timer */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Tempo investido</p>
                      <p className="text-4xl font-bold text-green-600 font-mono">
                        {formatTime(timerSeconds)}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Action Bar */}
              <div className="border-t border-gray-200 p-4 bg-white safe-area-inset-bottom">
                <div className="flex gap-3">
                  <Button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white min-h-[48px]"
                  >
                    {timerRunning ? "Pausar" : "Começar"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => completeTask.mutate({ taskId: activeTask.id })}
                    className="flex-1 min-h-[48px]"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Concluir
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Selecione uma tarefa para começar</p>
                <Button 
                  variant="link" 
                  className="mt-2 text-green-600"
                  onClick={() => setMobileTab("tasks")}
                >
                  Ver tarefas
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab: Info (Project, Where I Left, Assistant) */}
        <TabsContent value="info" className="flex-1 flex flex-col overflow-hidden m-0 p-0">
          <Tabs value={assistantTab} onValueChange={setAssistantTab} className="flex-1 flex flex-col">
            <TabsList className="w-full rounded-none border-b border-gray-200 bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="project" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 py-3 text-sm"
              >
                Projeto
              </TabsTrigger>
              <TabsTrigger 
                value="whereILeft" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 py-3 text-sm"
              >
                Onde Parei
              </TabsTrigger>
              <TabsTrigger 
                value="assistant" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 py-3 text-sm"
              >
                Assistente
              </TabsTrigger>
            </TabsList>

            {/* Sub-Tab: Project */}
            <TabsContent value="project" className="flex-1 overflow-y-auto p-4 m-0">
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

            {/* Sub-Tab: Onde Parei */}
            <TabsContent value="whereILeft" className="flex-1 overflow-y-auto p-4 m-0">
              {whereILeft ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">Contexto</h4>
                    <p className="text-sm text-gray-700">{whereILeft.content}</p>
                  </div>
                  {whereILeft.nextAction && (
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">Próxima Ação</h4>
                      <p className="text-sm text-gray-700">{whereILeft.nextAction}</p>
                    </div>
                  )}
                  {whereILeft.blockers && (
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">Bloqueadores</h4>
                      <p className="text-sm text-gray-700">{whereILeft.blockers}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum registro ainda</p>
              )}
            </TabsContent>

            {/* Sub-Tab: Assistant */}
            <TabsContent value="assistant" className="flex-1 flex flex-col m-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      Olá! Sou seu assistente neuroadaptado. Faça perguntas sobre seu projeto ou tarefa atual.
                    </p>
                  </div>
                </div>
              </ScrollArea>
              <div className="border-t border-gray-200 p-4 safe-area-inset-bottom">
                <div className="flex gap-2">
                  <Input
                    value={assistantMessage}
                    onChange={(e) => setAssistantMessage(e.target.value)}
                    placeholder="Faça uma pergunta..."
                    className="text-sm min-h-[44px]"
                  />
                  <Button
                    className="bg-green-600 hover:bg-green-700 min-w-[48px] min-h-[48px]"
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
          </Tabs>
        </TabsContent>

        {/* Mobile Bottom Navigation */}
        <TabsList className="w-full rounded-none border-t border-gray-200 bg-white p-0 h-auto safe-area-inset-bottom">
          <TabsTrigger 
            value="tasks" 
            className="flex-1 flex flex-col items-center gap-1 py-3 rounded-none data-[state=active]:bg-green-50 data-[state=active]:text-green-700 min-h-[60px]"
          >
            <ListTodo className="w-5 h-5" />
            <span className="text-xs">Tarefas</span>
          </TabsTrigger>
          <TabsTrigger 
            value="workspace" 
            className="flex-1 flex flex-col items-center gap-1 py-3 rounded-none data-[state=active]:bg-green-50 data-[state=active]:text-green-700 min-h-[60px]"
          >
            <Target className="w-5 h-5" />
            <span className="text-xs">Foco</span>
          </TabsTrigger>
          <TabsTrigger 
            value="info" 
            className="flex-1 flex flex-col items-center gap-1 py-3 rounded-none data-[state=active]:bg-green-50 data-[state=active]:text-green-700 min-h-[60px]"
          >
            <Bot className="w-5 h-5" />
            <span className="text-xs">Info</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );

  // ============================================
  // DESKTOP LAYOUT (lg+)
  // ============================================
  const DesktopLayout = () => (
    <div className="hidden lg:flex h-screen bg-white overflow-hidden">
      {/* LEFT PANEL - 30-35% */}
      <aside className="flex flex-col w-1/3 border-r border-gray-200 bg-white">
        <ScrollArea className="flex-1">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">Hoje</h2>
              <p className="text-sm text-gray-600">
                Dia {activeCycle.currentDay || 1} do ciclo de 3 dias
              </p>
            </div>

            {/* "Onde Parei" Block */}
            {whereILeft && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  Onde parei ontem
                </h3>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {whereILeft.content}
                </p>
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
                      ? "bg-green-50 border-green-300 shadow-md"
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
                        <span className="text-xs text-gray-500">
                          {task.estimatedMinutes}min
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {task.title}
                      </h4>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* CENTER PANEL - 45-50% */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden">
        {activeTask ? (
          <>
            {/* Task Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getPriorityColor(activeTask.priority)}>
                      {activeTask.priority}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {activeTask.estimatedMinutes} minutos
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {activeTask.title}
                  </h1>
                </div>
              </div>
            </div>

            {/* Task Content */}
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {getTaskDescription(activeTask.description)}
                  </p>
                </div>

                {/* Checklist */}
                {(() => {
                  const checklist = activeTask.checklist as any[];
                  if (!checklist || !Array.isArray(checklist)) return null;
                  return (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Checklist</h3>
                      <div className="space-y-2">
                        {checklist.map((item: any, idx: number) => (
                          <label key={idx} className="flex items-center gap-3 cursor-pointer">
                            <Checkbox defaultChecked={item.completed} />
                            <span className="text-gray-700">{item.text}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Timer */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Tempo investido</p>
                    <p className="text-4xl font-bold text-green-600 font-mono">
                      {formatTime(timerSeconds)}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Action Bar */}
            <div className="border-t border-gray-200 p-6 bg-white">
              <div className="flex gap-3">
                <Button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {timerRunning ? "Pausar" : "Começar"} por 10 min
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
            <div className="text-center text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Selecione uma tarefa para começar</p>
            </div>
          </div>
        )}
      </main>

      {/* RIGHT PANEL - 20-25% */}
      <aside className="flex flex-col w-1/4 border-l border-gray-200 bg-white">
        <Tabs value={assistantTab} onValueChange={setAssistantTab} className="flex-1 flex flex-col">
          <TabsList className="w-full rounded-none border-b border-gray-200 bg-transparent p-0">
            <TabsTrigger value="project" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-green-600">
              Projeto
            </TabsTrigger>
            <TabsTrigger value="whereILeft" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-green-600">
              Onde Parei
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-green-600">
              Assistente
            </TabsTrigger>
          </TabsList>

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

          {/* Tab: Onde Parei */}
          <TabsContent value="whereILeft" className="flex-1 overflow-y-auto p-4">
            {whereILeft ? (
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Contexto</h4>
                  <p className="text-sm text-gray-700">{whereILeft.content}</p>
                </div>
                {whereILeft.nextAction && (
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">Próxima Ação</h4>
                    <p className="text-sm text-gray-700">{whereILeft.nextAction}</p>
                  </div>
                )}
                {whereILeft.blockers && (
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">Bloqueadores</h4>
                    <p className="text-sm text-gray-700">{whereILeft.blockers}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhum registro ainda</p>
            )}
          </TabsContent>

          {/* Tab: Assistant */}
          <TabsContent value="assistant" className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Olá! Sou seu assistente neuroadaptado. Faça perguntas sobre seu projeto ou tarefa atual.
                  </p>
                </div>
              </div>
            </ScrollArea>
            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <Input
                  value={assistantMessage}
                  onChange={(e) => setAssistantMessage(e.target.value)}
                  placeholder="Faça uma pergunta..."
                  className="text-sm"
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
        </Tabs>
      </aside>
    </div>
  );

  // Render appropriate layout based on screen size
  return (
    <>
      <MobileLayout />
      <DesktopLayout />
    </>
  );
}
