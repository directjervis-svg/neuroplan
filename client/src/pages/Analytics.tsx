import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayoutNeuroExecucao from "@/components/DashboardLayoutNeuroExecucao";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { 
  BarChart3, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Loader2, 
  Target, 
  TrendingUp,
  Zap,
  Brain,
  Award
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Legend
} from "recharts";
import { useState, useMemo } from "react";

/**
 * Analytics Dashboard
 * Visualização de produtividade, progresso e métricas ao longo do tempo
 */
export default function Analytics() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");
  
  const { data: stats, isLoading: statsLoading } = trpc.gamification.getStats.useQuery();
  const { data: projects } = trpc.projects.list.useQuery();
  // Focus cycles data would come from a dedicated endpoint
  const focusCycles: any[] = [];

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    if (!stats || !projects || !focusCycles) return null;

    // Weekly data for charts
    const weeklyData = generateWeeklyData(focusCycles, projects);
    
    // Task type distribution
    const taskTypeData = [
      { name: "ACTION", value: 60, color: "#22C55E" },
      { name: "RETENTION", value: 25, color: "#FF8C42" },
      { name: "MAINTENANCE", value: 15, color: "#6B7280" },
    ];

    // Productivity score calculation
    const productivityScore = calculateProductivityScore(stats);

    // Coefficient breakdown
    const coefficients = {
      action: { weight: 1.0, count: Math.round((stats.totalTasksCompleted || 0) * 0.6) },
      retention: { weight: 0.7, count: Math.round((stats.totalTasksCompleted || 0) * 0.25) },
      maintenance: { weight: 0.5, count: Math.round((stats.totalTasksCompleted || 0) * 0.15) },
    };

    return {
      weeklyData,
      taskTypeData,
      productivityScore,
      coefficients,
    };
  }, [stats, projects, focusCycles]);

  if (statsLoading) {
    return (
      <DashboardLayoutNeuroExecucao>
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
        </div>
      </DashboardLayoutNeuroExecucao>
    );
  }

  return (
    <DashboardLayoutNeuroExecucao>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">
              Acompanhe seu progresso e produtividade ao longo do tempo
            </p>
          </div>
          
          <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <TabsList>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="month">Mês</TabsTrigger>
              <TabsTrigger value="year">Ano</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Produtividade"
            value={`${analyticsData?.productivityScore || 0}%`}
            icon={TrendingUp}
            trend="+12%"
            trendUp={true}
            color="#22C55E"
          />
          <MetricCard
            title="Streak Atual"
            value={`${stats?.currentStreak || 0} dias`}
            icon={Flame}
            trend={stats?.currentStreak && stats.currentStreak > 0 ? "Ativo" : "Inativo"}
            trendUp={(stats?.currentStreak || 0) > 0}
            color="#FF8C42"
          />
          <MetricCard
            title="Horas de Foco"
            value={`${Math.round((stats?.totalFocusMinutes || 0) / 60)}h`}
            icon={Clock}
            trend={`${stats?.totalFocusMinutes || 0} min total`}
            trendUp={true}
            color="#A78BFA"
          />
          <MetricCard
            title="XP Total"
            value={stats?.totalXp?.toLocaleString() || "0"}
            icon={Zap}
            trend={`Nível ${stats?.currentLevel || 1}`}
            trendUp={true}
            color="#FBBF24"
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Focus Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#22C55E]" />
                Tempo de Foco
              </CardTitle>
              <CardDescription>Minutos de foco por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData?.weeklyData || []}>
                    <defs>
                      <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="focusMinutes" 
                      stroke="#22C55E" 
                      strokeWidth={2}
                      fill="url(#focusGradient)" 
                      name="Minutos de Foco"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Completed Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
                Tarefas Concluídas
              </CardTitle>
              <CardDescription>Tarefas por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData?.weeklyData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="tasksCompleted" 
                      fill="#22C55E" 
                      radius={[4, 4, 0, 0]}
                      name="Tarefas"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Task Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[#FF8C42]" />
                Tipos de Tarefa
              </CardTitle>
              <CardDescription>Distribuição por coeficiente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData?.taskTypeData || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analyticsData?.taskTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Coefficient Breakdown */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-[#A78BFA]" />
                Coeficientes de Produtividade
              </CardTitle>
              <CardDescription>
                Peso das tarefas no cálculo de produtividade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* ACTION */}
                <CoefficientRow
                  type="ACTION"
                  description="Tarefas de execução principal"
                  weight={1.0}
                  count={analyticsData?.coefficients.action.count || 0}
                  color="#22C55E"
                />
                
                {/* RETENTION */}
                <CoefficientRow
                  type="RETENTION"
                  description="Tarefas de revisão e consolidação"
                  weight={0.7}
                  count={analyticsData?.coefficients.retention.count || 0}
                  color="#FF8C42"
                />
                
                {/* MAINTENANCE */}
                <CoefficientRow
                  type="MAINTENANCE"
                  description="Tarefas de manutenção e rotina"
                  weight={0.5}
                  count={analyticsData?.coefficients.maintenance.count || 0}
                  color="#6B7280"
                />

                {/* Score Calculation */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Score Total = Σ (Tarefas × Peso)
                    </span>
                    <span className="text-lg font-bold text-[#22C55E]">
                      {calculateWeightedScore(analyticsData?.coefficients)} pts
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* XP Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-[#FBBF24]" />
              Progresso de XP
            </CardTitle>
            <CardDescription>Evolução do seu nível ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData?.weeklyData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="xpGained" 
                    stroke="#FBBF24" 
                    strokeWidth={2}
                    dot={{ fill: '#FBBF24', r: 4 }}
                    name="XP Ganho"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayoutNeuroExecucao>
  );
}

// Helper Components
function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp, 
  color 
}: { 
  title: string; 
  value: string; 
  icon: React.ElementType; 
  trend: string; 
  trendUp: boolean;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            <p className={`text-xs mt-1 ${trendUp ? 'text-[#22C55E]' : 'text-muted-foreground'}`}>
              {trend}
            </p>
          </div>
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CoefficientRow({ 
  type, 
  description, 
  weight, 
  count, 
  color 
}: { 
  type: string; 
  description: string; 
  weight: number; 
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div 
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium text-foreground">{type}</span>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium" style={{ color }}>
              ×{weight.toFixed(1)}
            </span>
            <p className="text-xs text-muted-foreground">{count} tarefas</p>
          </div>
        </div>
        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all"
            style={{ 
              backgroundColor: color,
              width: `${Math.min(100, (count / 50) * 100)}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Helper Functions
function generateWeeklyData(focusCycles: any[], projects: any[]) {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const today = new Date();
  
  return days.map((day, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    
    // Simulated data - in production, aggregate from actual data
    return {
      day,
      date: date.toISOString().split('T')[0],
      focusMinutes: Math.floor(Math.random() * 120) + 30,
      tasksCompleted: Math.floor(Math.random() * 5) + 1,
      xpGained: Math.floor(Math.random() * 150) + 50,
    };
  });
}

function calculateProductivityScore(stats: any): number {
  if (!stats) return 0;
  
  const taskScore = Math.min(100, (stats.totalTasksCompleted || 0) * 2);
  const focusScore = Math.min(100, ((stats.totalFocusMinutes || 0) / 60) * 5);
  const streakScore = Math.min(100, (stats.currentStreak || 0) * 10);
  
  return Math.round((taskScore + focusScore + streakScore) / 3);
}

function calculateWeightedScore(coefficients: any): number {
  if (!coefficients) return 0;
  
  return Math.round(
    coefficients.action.count * coefficients.action.weight +
    coefficients.retention.count * coefficients.retention.weight +
    coefficients.maintenance.count * coefficients.maintenance.weight
  );
}
