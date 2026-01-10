import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  Award, 
  Brain, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Lightbulb, 
  Loader2, 
  Star, 
  Target, 
  Timer, 
  Trophy,
  Zap,
  Crown,
  Rocket,
  GraduationCap,
  Heart,
  Code,
  PenTool,
  User,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import DashboardLayoutNeuroExecucao from "@/components/DashboardLayoutNeuroExecucao";

// Icon mapping for badges
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame,
  CheckCircle: CheckCircle2,
  CheckCircle2,
  Zap,
  Trophy,
  Target,
  Award,
  Timer,
  Brain,
  Lightbulb,
  Sparkles,
  Crown,
  Rocket,
  GraduationCap,
  Heart,
  Code,
  PenTool,
  User,
  Star,
};

// Rarity colors
const rarityColors: Record<string, string> = {
  COMMON: "bg-slate-500",
  UNCOMMON: "bg-green-500",
  RARE: "bg-blue-500",
  EPIC: "bg-purple-500",
  LEGENDARY: "bg-amber-500",
};

const rarityLabels: Record<string, string> = {
  COMMON: "Comum",
  UNCOMMON: "Incomum",
  RARE: "Raro",
  EPIC: "Épico",
  LEGENDARY: "Lendário",
};

export default function Profile() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = trpc.gamification.getStats.useQuery();
  const { data: allBadges, isLoading: badgesLoading } = trpc.gamification.getAllBadges.useQuery();
  const { data: xpHistory } = trpc.gamification.getXpHistory.useQuery({ limit: 10 });
  
  // Initialize badges and templates on first load
  const initBadges = trpc.gamification.initializeBadges.useMutation();
  const initTemplates = trpc.gamification.initializeTemplates.useMutation();
  
  // Initialize badges and templates if needed (using useEffect pattern)
  useEffect(() => {
    if (allBadges && allBadges.length === 0) {
      initBadges.mutate();
      initTemplates.mutate();
    }
  }, [allBadges]);

  if (statsLoading || badgesLoading) {
    return (
      <DashboardLayoutNeuroExecucao>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
        </div>
      </DashboardLayoutNeuroExecucao>
    );
  }

  const earnedBadges = allBadges?.filter(b => b.earned) || [];
  const lockedBadges = allBadges?.filter(b => !b.earned) || [];

  return (
    <DashboardLayoutNeuroExecucao>
      <div className="space-y-8">
        {/* Header with User Info */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-background border-2 border-[#22C55E] rounded-full px-2 py-0.5 text-xs font-bold">
                Nv {stats?.level || 1}
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{user?.name || "Usuário"}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Flame className="h-4 w-4 text-[#FF8C42]" />
                <span className="text-sm font-medium">{stats?.currentStreak || 0} dias de streak</span>
              </div>
            </div>
          </div>
          
          <Link href="/dashboard">
            <Button variant="outline">Voltar ao Dashboard</Button>
          </Link>
        </div>

        {/* XP and Level Card */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-0 text-white">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-6">
              {/* Level */}
              <div className="text-center">
                <div className="text-5xl font-bold text-[#22C55E] mb-1">{stats?.level || 1}</div>
                <div className="text-sm text-slate-400">Nível</div>
              </div>
              
              {/* XP Progress */}
              <div className="md:col-span-2">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">XP Total</span>
                  <span className="text-[#22C55E] font-medium">{stats?.totalXp || 0} XP</span>
                </div>
                <Progress value={stats?.progress || 0} className="h-3 bg-slate-700" />
                <div className="flex justify-between text-xs mt-1 text-slate-500">
                  <span>Nível {stats?.level || 1}</span>
                  <span>{stats?.xpToNext || 100} XP para o próximo nível</span>
                </div>
              </div>
              
              {/* Streak */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Flame className="h-8 w-8 text-[#FF8C42]" />
                  <div className="text-4xl font-bold">{stats?.currentStreak || 0}</div>
                </div>
                <div className="text-sm text-slate-400">Dias Consecutivos</div>
                <div className="text-xs text-slate-500 mt-1">
                  Recorde: {stats?.longestStreak || 0} dias
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5 text-[#22C55E]" />}
            label="Tarefas Completas"
            value={stats?.totalTasksCompleted || 0}
          />
          <StatCard
            icon={<Target className="h-5 w-5 text-[#FF8C42]" />}
            label="Projetos Finalizados"
            value={stats?.totalProjectsCompleted || 0}
          />
          <StatCard
            icon={<Timer className="h-5 w-5 text-[#22C55E]" />}
            label="Minutos de Foco"
            value={stats?.totalFocusMinutes || 0}
          />
          <StatCard
            icon={<Lightbulb className="h-5 w-5 text-[#FF8C42]" />}
            label="Ideias Capturadas"
            value={stats?.totalIdeasCaptured || 0}
          />
        </div>

        {/* Badges Section */}
        <Tabs defaultValue="earned" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="earned">
              Conquistados ({earnedBadges.length})
            </TabsTrigger>
            <TabsTrigger value="locked">
              Bloqueados ({lockedBadges.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="earned" className="mt-6">
            {earnedBadges.length === 0 ? (
              <Card className="bg-muted/50">
                <CardContent className="p-8 text-center">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nenhum emblema conquistado ainda
                  </h3>
                  <p className="text-muted-foreground">
                    Complete tarefas, mantenha seu streak e explore o NeuroExecução para desbloquear emblemas!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {earnedBadges.map((badge, index) => (
                  <BadgeCard key={badge.id} badge={badge} earned index={index} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="locked" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {lockedBadges.map((badge, index) => (
                <BadgeCard key={badge.id} badge={badge} earned={false} index={index} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* XP History */}
        {xpHistory && xpHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#22C55E]" />
                Histórico de XP
              </CardTitle>
              <CardDescription>Últimas atividades que renderam XP</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {xpHistory.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-[#22C55E]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{tx.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <span className="text-[#22C55E] font-bold">+{tx.amount} XP</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayoutNeuroExecucao>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BadgeCard({ 
  badge, 
  earned, 
  index 
}: { 
  badge: any; 
  earned: boolean;
  index: number;
}) {
  const IconComponent = iconMap[badge.icon] || Award;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`relative overflow-hidden ${earned ? "" : "opacity-60"}`}>
        <CardContent className="p-4 text-center">
          {/* Rarity indicator */}
          <div className={`absolute top-0 right-0 ${rarityColors[badge.rarity]} text-white text-[10px] px-2 py-0.5 rounded-bl`}>
            {rarityLabels[badge.rarity]}
          </div>
          
          {/* Icon */}
          <div 
            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
              earned ? "bg-gradient-to-br from-[#22C55E]/20 to-[#16A34A]/20" : "bg-muted"
            }`}
            style={{ borderColor: earned ? badge.color : undefined, borderWidth: earned ? 2 : 0 }}
          >
            <IconComponent 
              className={`h-8 w-8 ${earned ? "text-[#22C55E]" : "text-muted-foreground"}`}
            />
          </div>
          
          {/* Name */}
          <h4 className="font-semibold text-foreground text-sm mb-1">{badge.name}</h4>
          
          {/* Description */}
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{badge.description}</p>
          
          {/* XP Reward */}
          <Badge variant="secondary" className="text-xs">
            +{badge.xpReward} XP
          </Badge>
          
          {/* Earned date */}
          {earned && badge.earnedAt && (
            <p className="text-[10px] text-muted-foreground mt-2">
              Conquistado em {new Date(badge.earnedAt).toLocaleDateString("pt-BR")}
            </p>
          )}
          
          {/* Lock overlay */}
          {!earned && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                🔒
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
