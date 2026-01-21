import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { MetricCard } from "@/components/ui/metric-card";
import { CheckboxTask } from "@/components/ui/checkbox-task";
import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  ListTodo,
  Target,
  BarChart3,
  Search,
  Bell,
  Settings,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Brain,
  Zap,
  TrendingUp,
  Calendar,
  User,
  LogOut,
  Menu,
  X,
  Timer,
  Flame,
} from "lucide-react";

/**
 * NeuroFlow Dashboard - Barkley Method
 *
 * Layout otimizado para TDAH adulto:
 * - Sidebar fixa com navegação clara
 * - Métricas em cards visuais
 * - Círculo de progresso Focus Score
 * - Gráficos de tendência
 * - Tasks do dia com checkboxes celebratórios
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

// Simulated chart data (in production, fetch from API)
const weeklyData = [
  { day: "Seg", focus: 65, tasks: 4 },
  { day: "Ter", focus: 72, tasks: 5 },
  { day: "Qua", focus: 58, tasks: 3 },
  { day: "Qui", focus: 85, tasks: 6 },
  { day: "Sex", focus: 79, tasks: 5 },
  { day: "Sab", focus: 45, tasks: 2 },
  { day: "Dom", focus: 30, tasks: 1 },
];

// Mini bar chart component for weekly productivity
function WeeklyChart({ data }: { data: typeof weeklyData }) {
  const maxFocus = Math.max(...data.map(d => d.focus));

  return (
    <div className="flex items-end justify-between gap-2 h-32 px-2">
      {data.map((item, index) => {
        const height = (item.focus / maxFocus) * 100;
        const getBarColor = (value: number) => {
          if (value >= 70) return "bg-[var(--neuro-green-primary)]";
          if (value >= 50) return "bg-[var(--neuro-yellow-primary)]";
          return "bg-[var(--neuro-orange-primary)]";
        };

        return (
          <div key={item.day} className="flex flex-col items-center gap-2 flex-1">
            <div
              className={`w-full rounded-t-md transition-all duration-300 ${getBarColor(item.focus)}`}
              style={{ height: `${height}%`, minHeight: "8px" }}
            />
            <span className="text-xs text-[var(--neuro-text-tertiary)]">{item.day}</span>
          </div>
        );
      })}
    </div>
  );
}

// Focus Trend Chart (Area-like visualization)
function FocusTrendChart() {
  const points = [30, 45, 38, 65, 55, 78, 82];
  const max = Math.max(...points);
  const width = 100;
  const height = 60;

  const pathData = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - (p / max) * height;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const areaPath = `${pathData} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height + 10}`} className="w-full h-24">
      <defs>
        <linearGradient id="focusGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--neuro-blue-primary)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--neuro-blue-primary)" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path d={areaPath} fill="url(#focusGradient)" />
      {/* Line */}
      <path
        d={pathData}
        fill="none"
        stroke="var(--neuro-blue-primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Current point */}
      <circle
        cx={width}
        cy={height - (points[points.length - 1] / max) * height}
        r="4"
        fill="var(--neuro-blue-primary)"
      />
    </svg>
  );
}

// Navigation items
const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: ListTodo, label: "Tarefas", href: "/projects" },
  { icon: Target, label: "Foco", href: "/focus-timer" },
  { icon: BarChart3, label: "Insights", href: "/analytics" },
];

export default function DashboardBarkley() {
  const { user, loading: authLoading, logout } = useAuth();
  const [location] = useLocation();
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Mutations
  const updateStreak = trpc.streaks.updateStreak.useMutation();
  const completeTask = trpc.cycles.completeTask.useMutation({
    onSuccess: async () => {
      toast.success("Tarefa concluída! +50 XP", {
        icon: "🎉",
      });
      await updateStreak.mutateAsync();
    },
  });

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Dark mode toggle
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  // Format timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get priority styles
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "A":
        return "bg-[var(--neuro-red-100)] text-[var(--neuro-red-600)] border-[var(--neuro-red-200)]";
      case "B":
        return "bg-[var(--neuro-yellow-100)] text-[var(--neuro-yellow-600)] border-[var(--neuro-yellow-200)]";
      case "C":
        return "bg-[var(--neuro-green-100)] text-[var(--neuro-green-600)] border-[var(--neuro-green-200)]";
      default:
        return "bg-[var(--neuro-gray-200)] text-[var(--neuro-text-secondary)]";
    }
  };

  // Calculate metrics
  const completedTasks = todayTasks.filter((t) => t.status === "COMPLETED").length;
  const totalTasks = todayTasks.length;
  const focusScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Loading state
  if (authLoading || cycleLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--neuro-bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--neuro-orange-primary)] border-t-transparent rounded-full animate-neuro-spin" />
          <p className="text-[var(--neuro-text-secondary)]">Carregando...</p>
        </div>
      </div>
    );
  }

  // No active cycle
  if (!activeCycle) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--neuro-bg-primary)] p-4">
        <Card className="max-w-md w-full text-center p-8">
          <Brain className="w-16 h-16 text-[var(--neuro-orange-primary)] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[var(--neuro-text-primary)] mb-2">
            Nenhum ciclo ativo
          </h2>
          <p className="text-[var(--neuro-text-secondary)] mb-6">
            Crie seu primeiro ciclo de 3 dias para começar a executar com foco.
          </p>
          <Link href="/projects">
            <Button variant="gradient" size="lg" className="w-full">
              Criar Primeiro Ciclo
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const activeTask = todayTasks.find((t) => t.id === activeTaskId);

  return (
    <div className="flex h-screen bg-[var(--neuro-bg-primary)]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-[var(--neuro-bg-card)] border-r border-[var(--neuro-border-default)]
          transform transition-transform duration-200 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-[var(--neuro-border-default)]">
            <div className="w-10 h-10 rounded-xl bg-neuro-gradient-primary flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-[var(--neuro-text-primary)]">NeuroExecução</h1>
              <p className="text-xs text-[var(--neuro-text-tertiary)]">Barkley Method</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = location === item.href || (item.href === "/dashboard" && location === "/dashboard-barkley");
                return (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <a
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150
                          ${
                            isActive
                              ? "bg-[var(--neuro-orange-100)] text-[var(--neuro-orange-primary)] font-medium"
                              : "text-[var(--neuro-text-secondary)] hover:bg-[var(--neuro-gray-100)] hover:text-[var(--neuro-text-primary)]"
                          }
                        `}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </a>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-[var(--neuro-border-default)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--neuro-gray-200)] flex items-center justify-center">
                <User className="w-5 h-5 text-[var(--neuro-text-secondary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--neuro-text-primary)] truncate">
                  {user?.name || "Usuário"}
                </p>
                <p className="text-xs text-[var(--neuro-text-tertiary)] truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon-sm" onClick={toggleDarkMode}>
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Link href="/settings">
                <Button variant="ghost" size="icon-sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon-sm" onClick={() => logout()}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-[var(--neuro-border-default)] bg-[var(--neuro-bg-card)] flex items-center justify-between px-4 lg:px-6">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--neuro-gray-100)]"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6 text-[var(--neuro-text-primary)]" />
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neuro-text-tertiary)]" />
              <Input
                placeholder="Buscar tarefas..."
                className="pl-10 bg-[var(--neuro-bg-secondary)] border-transparent"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Streak Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--neuro-orange-100)]">
              <Flame className="w-4 h-4 text-[var(--neuro-orange-primary)]" />
              <span className="text-sm font-medium text-[var(--neuro-orange-primary)]">7 dias</span>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon-sm" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--neuro-red-primary)] rounded-full" />
            </Button>

            {/* Day Progress */}
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--neuro-bg-secondary)]">
              <Calendar className="w-4 h-4 text-[var(--neuro-text-tertiary)]" />
              <span className="text-sm font-medium text-[var(--neuro-text-primary)]">
                Dia {activeCycle.currentDay || 1}/3
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <ScrollArea className="flex-1">
          <main className="p-4 lg:p-6 space-y-6">
            {/* Where I Left Off Banner */}
            {whereILeft && (
              <Card className="bg-[var(--neuro-blue-50)] border-[var(--neuro-blue-200)] animate-fade-in-up">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-[var(--neuro-blue-100)]">
                    <Brain className="w-5 h-5 text-[var(--neuro-blue-primary)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--neuro-text-primary)] mb-1">
                      Onde você parou
                    </h3>
                    <p className="text-sm text-[var(--neuro-text-secondary)] line-clamp-2">
                      {whereILeft.content}
                    </p>
                    {whereILeft.nextAction && (
                      <p className="text-sm text-[var(--neuro-blue-primary)] mt-2 font-medium">
                        → {whereILeft.nextAction}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Focus Score - Large Circle */}
              <Card className="sm:col-span-2 lg:col-span-1 lg:row-span-2">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                  <ProgressCircle
                    value={focusScore || 82}
                    size="xl"
                    color="orange"
                    sublabel="Focus Score"
                  />
                  <p className="text-sm text-[var(--neuro-text-tertiary)] mt-4 text-center">
                    {completedTasks} de {totalTasks || 6} tarefas concluídas
                  </p>
                </CardContent>
              </Card>

              {/* Tasks Completed */}
              <MetricCard
                title="Tarefas Hoje"
                value={`${completedTasks}/${totalTasks || 6}`}
                subtitle="vs. meta de 6"
                trend={completedTasks >= 3 ? "up" : "down"}
                trendValue={completedTasks >= 3 ? "No ritmo" : "Acelere!"}
                icon={CheckCircle2}
                color="green"
              />

              {/* Time Focused */}
              <MetricCard
                title="Tempo de Foco"
                value={formatTime(timerSeconds) || "3h 42m"}
                subtitle="sessão atual"
                trend="up"
                trendValue="+15%"
                icon={Timer}
                color="blue"
              />

              {/* Distraction Time */}
              <MetricCard
                title="Distrações"
                value="4"
                subtitle="interrupções"
                trend="down"
                trendValue="-2"
                icon={Zap}
                color="yellow"
              />

              {/* Weekly Streak */}
              <MetricCard
                title="Streak Semanal"
                value="7"
                subtitle="dias seguidos"
                trend="up"
                icon={Flame}
                color="orange"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Focus Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[var(--neuro-blue-primary)]" />
                    Tendência de Foco
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FocusTrendChart />
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--neuro-border-default)]">
                    <span className="text-sm text-[var(--neuro-text-secondary)]">Última semana</span>
                    <span className="text-sm font-medium text-[var(--neuro-green-primary)]">
                      +12% vs. semana anterior
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Productivity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[var(--neuro-orange-primary)]" />
                    Produtividade Semanal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <WeeklyChart data={weeklyData} />
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--neuro-border-default)]">
                    <span className="text-sm text-[var(--neuro-text-secondary)]">Média: 62%</span>
                    <span className="text-sm font-medium text-[var(--neuro-orange-primary)]">
                      Melhor dia: Qui (85%)
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Tasks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ListTodo className="w-5 h-5 text-[var(--neuro-orange-primary)]" />
                    Tarefas de Hoje
                  </CardTitle>
                  <Badge className="bg-[var(--neuro-orange-100)] text-[var(--neuro-orange-primary)]">
                    Dia {activeCycle.currentDay || 1}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <ListTodo className="w-12 h-12 text-[var(--neuro-text-disabled)] mx-auto mb-3" />
                    <p className="text-[var(--neuro-text-secondary)]">
                      Nenhuma tarefa para hoje. Aproveite o descanso!
                    </p>
                  </div>
                ) : (
                  todayTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className={`
                        flex items-start gap-4 p-4 rounded-xl border transition-all duration-150 cursor-pointer
                        ${
                          activeTaskId === task.id
                            ? "border-[var(--neuro-orange-primary)] bg-[var(--neuro-orange-50)] shadow-md"
                            : "border-[var(--neuro-border-default)] hover:border-[var(--neuro-border-hover)] hover:bg-[var(--neuro-bg-secondary)]"
                        }
                        animate-fade-in-up stagger-${index + 1}
                      `}
                      onClick={() => setActiveTaskId(task.id === activeTaskId ? null : task.id)}
                    >
                      <CheckboxTask
                        checked={task.status === "COMPLETED"}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            completeTask.mutate({ taskId: task.id });
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge className={getPriorityStyles(task.priority)}>
                            {task.priority}
                          </Badge>
                          <span className="text-xs text-[var(--neuro-text-tertiary)]">
                            {task.estimatedMinutes || 15}min
                          </span>
                        </div>
                        <h4
                          className={`font-medium text-[var(--neuro-text-primary)] ${
                            task.status === "COMPLETED"
                              ? "line-through text-[var(--neuro-text-tertiary)]"
                              : ""
                          }`}
                        >
                          {task.title}
                        </h4>
                        {task.description && typeof task.description === "string" && (
                          <p className="text-sm text-[var(--neuro-text-secondary)] mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Quick Actions */}
                      {activeTaskId === task.id && task.status !== "COMPLETED" && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={timerRunning ? "secondary" : "primary"}
                            onClick={(e) => {
                              e.stopPropagation();
                              setTimerRunning(!timerRunning);
                            }}
                          >
                            {timerRunning ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}
