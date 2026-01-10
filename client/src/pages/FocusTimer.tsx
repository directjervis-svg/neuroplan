import DashboardLayoutNeuroExecucao from "@/components/DashboardLayoutNeuroExecucao";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft, 
  Brain, 
  Clock, 
  Pause, 
  Play, 
  RotateCcw, 
  Square, 
  Target,
  Zap,
  CheckCircle2
} from "lucide-react";
import { Link, useSearch } from "wouter";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

/**
 * Focus Timer Page
 * Progressive timer that counts UP (not down) to activate commitment sense
 * Based on Barkley's principle: "Show what you've invested, not what's left"
 */
export default function FocusTimer() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const taskIdParam = params.get("taskId");
  const taskId = taskIdParam ? parseInt(taskIdParam) : undefined;

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const [currentCycleId, setCurrentCycleId] = useState<number | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: todayTasks } = trpc.tasks.getToday.useQuery();
  const { data: focusStats } = trpc.stats.overview.useQuery();

  const startCycle = trpc.focus.start.useMutation({
    onSuccess: (data) => {
      setCurrentCycleId(data.id);
    },
  });

  const endCycle = trpc.focus.end.useMutation({
    onSuccess: () => {
      toast.success(`Ciclo de foco finalizado! ${formatTime(seconds)} de foco.`);
    },
  });

  const completeTask = trpc.tasks.complete.useMutation({
    onSuccess: () => {
      toast.success("Tarefa concluída!");
    },
  });

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  const handleStart = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    startCycle.mutate({
      taskId,
      timerType: "PROGRESSIVE",
    });
  }, [taskId, startCycle]);

  const handlePause = useCallback(() => {
    setIsPaused(true);
    setPauseCount((prev) => prev + 1);
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    
    if (currentCycleId) {
      endCycle.mutate({
        id: currentCycleId,
        totalFocusSeconds: seconds,
        pauseCount,
        completed: true,
      });
    }

    // Reset
    setSeconds(0);
    setPauseCount(0);
    setCurrentCycleId(null);
  }, [currentCycleId, seconds, pauseCount, endCycle]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setSeconds(0);
    setPauseCount(0);
    setCurrentCycleId(null);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get current task if taskId is provided
  const currentTask = todayTasks?.find((t) => t.id === taskId);

  return (
    <DashboardLayoutNeuroExecucao>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Timer de Foco</h1>
            <p className="text-muted-foreground">Timer progressivo - veja quanto você já investiu</p>
          </div>
        </div>

        {/* Current Task */}
        {currentTask && (
          <Card className="border-[#22C55E]/30 bg-[#22C55E]/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-[#22C55E]" />
                  <div>
                    <p className="text-sm text-muted-foreground">Focando em:</p>
                    <p className="font-medium text-foreground">{currentTask.title}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => completeTask.mutate({ id: currentTask.id })}
                  disabled={!!currentTask.completedAt}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Concluir
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timer Display */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div 
              className={`py-16 px-8 text-center transition-colors ${
                isRunning && !isPaused 
                  ? "bg-gradient-to-b from-[#22C55E]/10 to-transparent" 
                  : isPaused 
                  ? "bg-gradient-to-b from-[#FF8C42]/10 to-transparent"
                  : ""
              }`}
            >
              {/* Timer */}
              <div className="mb-8">
                <p className="text-7xl md:text-9xl font-mono font-bold text-foreground tracking-tight">
                  {formatTime(seconds)}
                </p>
                {isRunning && (
                  <p className="text-sm text-muted-foreground mt-4">
                    {isPaused ? "Pausado" : "Focando..."}
                    {pauseCount > 0 && ` • ${pauseCount} pausa${pauseCount > 1 ? "s" : ""}`}
                  </p>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                {!isRunning ? (
                  <Button
                    size="lg"
                    onClick={handleStart}
                    className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-8 py-6 text-lg rounded-full"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Iniciar Foco
                  </Button>
                ) : (
                  <>
                    {isPaused ? (
                      <Button
                        size="lg"
                        onClick={handleResume}
                        className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-6 py-6 rounded-full"
                      >
                        <Play className="mr-2 h-5 w-5" />
                        Retomar
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={handlePause}
                        className="px-6 py-6 rounded-full border-[#FF8C42] text-[#FF8C42] hover:bg-[#FF8C42]/10"
                      >
                        <Pause className="mr-2 h-5 w-5" />
                        Pausar
                      </Button>
                    )}
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleStop}
                      className="px-6 py-6 rounded-full"
                    >
                      <Square className="mr-2 h-5 w-5" />
                      Finalizar
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleReset}
                      className="rounded-full"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats and Tips */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Today's Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#22C55E]" />
                Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold text-foreground">{focusStats?.focusMinutes || 0}</p>
                  <p className="text-sm text-muted-foreground">minutos focados</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{focusStats?.completedTasks || 0}</p>
                  <p className="text-sm text-muted-foreground">tarefas concluídas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Barkley Tip */}
          <Card className="bg-gradient-to-br from-[#22C55E]/5 to-[#FF8C42]/5 border-[#22C55E]/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-[#22C55E]" />
                Por que Timer Progressivo?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Timers de contagem regressiva geram ansiedade e sensação de escassez. 
                O timer progressivo mostra quanto você <strong>já investiu</strong>, 
                ativando o senso de comprometimento e tornando mais difícil abandonar.
              </p>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Baseado nos princípios de Russell Barkley
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Tasks */}
        {!taskId && todayTasks && todayTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tarefas de Hoje</CardTitle>
              <CardDescription>Selecione uma tarefa para focar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {todayTasks.slice(0, 4).map((task) => (
                  <Link key={task.id} href={`/dashboard/focus?taskId=${task.id}`}>
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        task.completedAt
                          ? "bg-[#22C55E]/5 border-[#22C55E]/20"
                          : "border-border hover:border-[#22C55E]/30"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          task.completedAt
                            ? "bg-[#22C55E] border-[#22C55E]"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {task.completedAt && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      <span
                        className={`text-sm ${
                          task.completedAt ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayoutNeuroExecucao>
  );
}
