import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { NeuroTooltip, NeuroInfoBadge } from "@/components/NeuroTooltip";
import { QuickFeedback, XPGain, ButtonWithFeedback } from "@/components/QuickFeedback";
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  Clock, 
  Brain, 
  Lightbulb,
  MessageSquare,
  FileText,
  ChevronRight,
  Plus,
  Sparkles,
  Target,
  Calendar,
  ArrowRight,
  SkipForward,
  AlertCircle,
  Zap,
  BookOpen,
  HelpCircle,
  Send,
  RefreshCw
} from "lucide-react";

/**
 * Dashboard Barkley - 3 Column Layout (NotebookLM-inspired)
 * 
 * Left Column (30-35%): "Today" Panel
 * - "Where I left off" block at top
 * - Current cycle day indicator
 * - Max 3 tasks (A-B-C priority)
 * 
 * Center Column (45-50%): Active Task Workspace
 * - Expandable card with description, checklist
 * - "Start for 10 min" button
 * - Action bar (Metacognition, 5 Whys, Prompts)
 * 
 * Right Column (20-25%): Assistant Panel (NotebookLM-like)
 * - Tab 1: Project Summary (bullets)
 * - Tab 2: Where I Left Off (editable)
 * - Tab 3: AI Assistant (chat + quick buttons)
 */



// Types
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
  const [, navigate] = useLocation();
  
  // State
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [whereILeftContent, setWhereILeftContent] = useState("");
  const [assistantMessage, setAssistantMessage] = useState("");
  const [assistantTab, setAssistantTab] = useState("summary");
  
  // Queries
  const { data: activeCycle, isLoading: cycleLoading } = trpc.cycles.getActive.useQuery(
    undefined,
    { enabled: !!user }
  );
  
  const { data: todayTasks, isLoading: tasksLoading } = trpc.cycles.getTodayTasks.useQuery(
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
  const updateWhereILeft = trpc.cycles.updateWhereILeftOff.useMutation({
    onSuccess: () => toast.success("Salvo!"),
  });
  
  const completeTask = trpc.cycles.completeTask.useMutation({
    onSuccess: () => {
      toast.success("Tarefa concluída! +50 XP");
    },
  });
  
  const startTask = trpc.cycles.startTask.useMutation();
  
  const askAssistant = trpc.ai.askAssistant.useMutation();
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);
  
  // Format timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "A": return "bg-green-500/20 text-green-700 border-green-500";
      case "B": return "bg-orange-500/20 text-orange-700 border-orange-500";
      case "C": return "bg-red-500/20 text-red-700 border-red-500";
      default: return "bg-muted";
    }
  };
  
  // Get priority label
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "A": return "Mínimo Aceitável";
      case "B": return "Ideal";
      case "C": return "Excepcional";
      default: return priority;
    }
  };
  
  // Handle task start
  const handleStartTask = (taskId: number) => {
    setActiveTaskId(taskId);
    setTimerRunning(true);
    setTimerSeconds(0);
    startTask.mutate({ taskId });
    toast.success("Começando! Foque por 10 minutos.");
  };
  
  // Handle task complete
  const handleCompleteTask = (taskId: number) => {
    setTimerRunning(false);
    completeTask.mutate({ taskId, actualMinutes: Math.ceil(timerSeconds / 60) });
    setActiveTaskId(null);
    setTimerSeconds(0);
  };
  
  // Handle assistant question
  const handleAskAssistant = () => {
    if (!assistantMessage.trim()) return;
    askAssistant.mutate({ 
      message: assistantMessage,
      projectId: activeCycle?.projectId 
    });
    setAssistantMessage("");
  };
  
  // Loading state
  if (authLoading || cycleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando seu espaço de trabalho...</p>
        </div>
      </div>
    );
  }
  
  // No active cycle - show onboarding
  if (!activeCycle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Comece seu primeiro ciclo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center">
              O NeuroExecução usa ciclos de 3 dias para ajudar você a executar projetos 
              sem sobrecarga. Vamos criar seu primeiro ciclo?
            </p>
            <Button className="w-full" size="lg" asChild>
              <Link href="/projects/new">
                <Plus className="w-4 h-4 mr-2" />
                Criar Projeto e Ciclo
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const activeTask = (todayTasks?.find((t: CycleTask) => t.id === activeTaskId) || todayTasks?.[0]) as CycleTask | undefined;
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-bold text-xl flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              <span>NeuroExecução</span>
            </Link>
            <Badge variant="outline" className="hidden sm:flex">
              Dia {activeCycle.currentDay} de 3
            </Badge>
          </div>
          
          {timerRunning && (
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full">
              <Clock className="w-4 h-4 text-primary animate-pulse" />
              <span className="font-mono font-bold text-primary">{formatTime(timerSeconds)}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/projects">Projetos</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/profile">Perfil</Link>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main 3-Column Layout */}
      <main className="container px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Today Panel (30-35%) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Where I Left Off - Fixed at top */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Onde parei ontem
                </CardTitle>
              </CardHeader>
              <CardContent>
                {whereILeft ? (
                  <div className="space-y-2">
                    <p className="text-sm">{whereILeft.content}</p>
                    {whereILeft.nextAction && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ArrowRight className="w-4 h-4 mt-0.5 text-primary" />
                        <span>{whereILeft.nextAction}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Nenhum registro ainda. Ao final do dia, registre onde parou.
                  </p>
                )}
              </CardContent>
            </Card>
            
            {/* Cycle Progress */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Ciclo de 3 Dias</CardTitle>
                  <Badge variant="secondary">
                    {activeCycle.status === "COMPLETED" ? "Concluído" : `Dia ${activeCycle.currentDay}`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3].map(day => (
                    <div 
                      key={day}
                      className={`flex-1 h-2 rounded-full ${
                        day < (activeCycle.currentDay || 1) ? "bg-green-500" :
                        day === (activeCycle.currentDay || 1) ? "bg-primary" :
                        "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(activeCycle.currentDay || 1) === 1 && "Foco no essencial. Complete a tarefa A."}
                  {(activeCycle.currentDay || 1) === 2 && "Bom progresso! Avance para a tarefa B."}
                  {(activeCycle.currentDay || 1) === 3 && "Último dia! Finalize e revise."}
                </p>
              </CardContent>
            </Card>
            
            {/* Today's Tasks (Max 3) */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Tarefas de Hoje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayTasks && todayTasks.length > 0 ? (
                  todayTasks.slice(0, 3).map((task, index) => (
                    <div 
                      key={task.id}
                      onClick={() => setActiveTaskId(task.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        activeTaskId === task.id 
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                          : "hover:border-primary/50"
                      } ${task.status === "COMPLETED" ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${index === 0 ? "text-base" : "text-sm"} ${task.status === "COMPLETED" ? "line-through" : ""}`}>
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {getPriorityLabel(task.priority)}
                            {task.estimatedMinutes && ` • ~${task.estimatedMinutes}min`}
                          </p>
                        </div>
                        {task.status === "COMPLETED" && (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma tarefa para hoje</p>
                    <Button variant="link" size="sm" className="mt-2" asChild>
                      <Link href={`/projects/${activeCycle.projectId}`}>
                        Adicionar tarefas
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href="/ideas">
                  <Lightbulb className="w-4 h-4 mr-1" />
                  Ideia Rápida
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href="/analytics">
                  <Zap className="w-4 h-4 mr-1" />
                  Analytics
                </Link>
              </Button>
            </div>
          </div>
          
          {/* CENTER COLUMN: Active Task Workspace (45-50%) */}
          <div className="lg:col-span-5 space-y-4">
            
            {activeTask ? (() => {
              const taskDescription = activeTask.description ? String(activeTask.description) : '';
              const taskChecklist = Array.isArray(activeTask.checklist) ? activeTask.checklist as Array<{id: string; text: string; completed: boolean}> : [];
              return (
              <>
                {/* Active Task Card */}
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 ${getPriorityColor(activeTask.priority)}`}>
                          {activeTask.priority}
                        </div>
                        <div>
                          <CardTitle className="text-xl">{activeTask.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {getPriorityLabel(activeTask.priority)}
                          </p>
                        </div>
                      </div>
                      {activeTask.status === "COMPLETED" ? (
                        <Badge className="bg-green-500">Concluída</Badge>
                      ) : activeTask.status === "IN_PROGRESS" ? (
                        <Badge className="bg-primary">Em Progresso</Badge>
                      ) : (
                        <Badge variant="outline">Pendente</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Description */}
                    {taskDescription.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Descrição</h4>
                        <p className="text-sm text-muted-foreground">
                          {taskDescription}
                        </p>
                      </div>
                    )}
                    
                    {/* Checklist */}
                    {taskChecklist.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Checklist</h4>
                        <div className="space-y-2">
                          {taskChecklist.map((item) => (
                            <div key={item.id} className="flex items-center gap-2">
                              <Checkbox 
                                id={item.id} 
                                checked={item.completed}
                                className="data-[state=checked]:bg-green-500"
                              />
                              <label 
                                htmlFor={item.id} 
                                className={`text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}
                              >
                                {item.text}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Timer and Actions */}
                    <div className="pt-4 border-t">
                      {activeTask.status !== "COMPLETED" ? (
                        <div className="flex flex-col sm:flex-row gap-3">
                          {!timerRunning ? (
                            <Button 
                              size="lg" 
                              className="flex-1"
                              onClick={() => handleStartTask(activeTask.id)}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Começar por 10 min
                            </Button>
                          ) : (
                            <>
                              <Button 
                                size="lg" 
                                variant="outline"
                                className="flex-1"
                                onClick={() => setTimerRunning(false)}
                              >
                                <Pause className="w-4 h-4 mr-2" />
                                Pausar
                              </Button>
                              <Button 
                                size="lg" 
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={() => handleCompleteTask(activeTask.id)}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Concluir
                              </Button>
                            </>
                          )}
                          <Button 
                            size="lg" 
                            variant="ghost"
                            onClick={() => toast.info("Funcionalidade em breve")}
                          >
                            <SkipForward className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                          <p className="font-medium">Tarefa concluída!</p>
                          <p className="text-sm text-muted-foreground">Selecione a próxima tarefa à esquerda</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Action Bar */}
                <Card>
                  <CardContent className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => setAssistantTab("assistant")}>
                        <Brain className="w-4 h-4 mr-1" />
                        Metacognição
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setAssistantTab("assistant")}>
                        <HelpCircle className="w-4 h-4 mr-1" />
                        5 Porquês
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setAssistantTab("assistant")}>
                        <Sparkles className="w-4 h-4 mr-1" />
                        Dividir Tarefa
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setAssistantTab("assistant")}>
                        <Lightbulb className="w-4 h-4 mr-1" />
                        Dica Rápida
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            );
            })() : (
              <Card className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-medium mb-2">Selecione uma tarefa</h3>
                  <p className="text-sm text-muted-foreground">
                    Escolha uma tarefa na lista à esquerda para começar
                  </p>
                </div>
              </Card>
            )}
          </div>
          
          {/* RIGHT COLUMN: Assistant Panel (20-25%) */}
          <div className="lg:col-span-3">
            <Card className="h-full min-h-[500px] flex flex-col">
              <Tabs value={assistantTab} onValueChange={setAssistantTab} className="flex-1 flex flex-col">
                <TabsList className="grid grid-cols-3 m-2">
                  <TabsTrigger value="summary" className="text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    Resumo
                  </TabsTrigger>
                  <TabsTrigger value="whereileft" className="text-xs">
                    <BookOpen className="w-3 h-3 mr-1" />
                    Onde Parei
                  </TabsTrigger>
                  <TabsTrigger value="assistant" className="text-xs">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    IA
                  </TabsTrigger>
                </TabsList>
                
                {/* Summary Tab */}
                <TabsContent value="summary" className="flex-1 p-4 pt-0">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Sobre o Projeto</h4>
                        {projectContext?.summaryBullets ? (
                          <ul className="space-y-2">
                            {(projectContext.summaryBullets as any[]).map((bullet: any, i: number) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <ChevronRight className="w-4 h-4 mt-0.5 text-primary" />
                                {bullet.text}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            Resumo será gerado automaticamente
                          </p>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Critérios de Sucesso</h4>
                        {projectContext?.successCriteria ? (
                          <ul className="space-y-2">
                            {(projectContext.successCriteria as any[]).map((criteria: any, i: number) => (
                              <li key={i} className="text-sm flex items-center gap-2">
                                <Checkbox checked={criteria.met} className="w-4 h-4" />
                                <span className={criteria.met ? "line-through text-muted-foreground" : ""}>
                                  {criteria.text}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            Defina critérios no projeto
                          </p>
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                {/* Where I Left Tab */}
                <TabsContent value="whereileft" className="flex-1 p-4 pt-0">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">O que estava fazendo?</label>
                      <Textarea 
                        placeholder="Descreva onde parou..."
                        className="mt-2 min-h-[100px]"
                        value={whereILeftContent}
                        onChange={(e) => setWhereILeftContent(e.target.value)}
                      />
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => {
                        updateWhereILeft.mutate({
                          cycleId: activeCycle.id,
                          content: whereILeftContent,
                        });
                      }}
                      disabled={!whereILeftContent.trim() || updateWhereILeft.isPending}
                    >
                      Salvar
                    </Button>
                    
                    <Separator />
                    
                    <div className="text-xs text-muted-foreground">
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      Registrar onde parou ajuda a retomar o trabalho amanhã sem perder contexto.
                    </div>
                  </div>
                </TabsContent>
                
                {/* Assistant Tab */}
                <TabsContent value="assistant" className="flex-1 flex flex-col p-4 pt-0">
                  <ScrollArea className="flex-1 mb-4">
                    <div className="space-y-4">
                      {/* Quick action buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs h-auto py-2"
                          onClick={() => setAssistantMessage("Me ajude a começar esta tarefa")}
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Como começar?
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs h-auto py-2"
                          onClick={() => setAssistantMessage("Divida esta tarefa em passos menores")}
                        >
                          <Target className="w-3 h-3 mr-1" />
                          Dividir tarefa
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs h-auto py-2"
                          onClick={() => setAssistantMessage("Estou travado, me faça perguntas para destravar")}
                        >
                          <Brain className="w-3 h-3 mr-1" />
                          Estou travado
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs h-auto py-2"
                          onClick={() => setAssistantMessage("Aplique os 5 Porquês para entender meu bloqueio")}
                        >
                          <HelpCircle className="w-3 h-3 mr-1" />
                          5 Porquês
                        </Button>
                      </div>
                      
                      {/* AI Response area */}
                      {askAssistant.data && (
                        <Card className="bg-primary/5 border-primary/20">
                          <CardContent className="p-3">
                            <p className="text-sm">{askAssistant.data.response}</p>
                          </CardContent>
                        </Card>
                      )}
                      
                      {askAssistant.isPending && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Pensando...
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  
                  {/* Input */}
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Pergunte algo..."
                      value={assistantMessage}
                      onChange={(e) => setAssistantMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAskAssistant()}
                    />
                    <Button size="icon" onClick={handleAskAssistant} disabled={askAssistant.isPending}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
