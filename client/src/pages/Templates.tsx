import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  Code, 
  FileText, 
  GraduationCap, 
  Heart, 
  Loader2, 
  PenTool, 
  Rocket, 
  User,
  ArrowRight,
  Crown,
  Sparkles
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import DashboardLayoutNeuroExecucao from "@/components/DashboardLayoutNeuroExecucao";
import { toast } from "sonner";

// Icon mapping for templates
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code,
  FileText,
  GraduationCap,
  Heart,
  PenTool,
  Rocket,
  User,
};

// Category labels
const categoryLabels: Record<string, string> = {
  PERSONAL: "Pessoal",
  PROFESSIONAL: "Profissional",
  ACADEMIC: "Acadêmico",
  CONTENT: "Conteúdo",
  SOFTWARE: "Software",
  HEALTH: "Saúde",
};

// Cycle duration labels
const cycleDurationLabels: Record<string, string> = {
  DAYS_3: "3 dias",
  DAYS_7: "7 dias",
  DAYS_14: "14 dias",
};

export default function Templates() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: templates, isLoading } = trpc.gamification.getTemplates.useQuery();
  const { data: currentPlan } = trpc.subscription.getCurrentPlan.useQuery();
  
  const createProject = trpc.projects.create.useMutation({
    onSuccess: (project) => {
      toast.success("Projeto criado com sucesso!");
      navigate(`/dashboard/projects/${project.id}`);
    },
    onError: (error) => {
      toast.error("Erro ao criar projeto: " + error.message);
    },
  });

  const handleUseTemplate = (template: any) => {
    if (template.isPremium && currentPlan?.plan === "FREE") {
      toast.error("Este template é exclusivo para assinantes Pro. Faça upgrade para usar!");
      return;
    }
    
    createProject.mutate({
      title: template.name,
      briefing: template.defaultBriefing || "",
      category: template.category || "PERSONAL",
      cycleDuration: template.defaultCycleDuration || "DAYS_3",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayoutNeuroExecucao>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
        </div>
      </DashboardLayoutNeuroExecucao>
    );
  }

  return (
    <DashboardLayoutNeuroExecucao>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-[#22C55E]" />
              Modelos de Projeto
            </h1>
            <p className="text-muted-foreground mt-1">
              Comece rapidamente com templates pré-configurados para diferentes tipos de trabalho
            </p>
          </div>
          
          <Link href="/dashboard/projects/new">
            <Button variant="outline">
              Criar do Zero
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Templates Grid */}
        {!templates || templates.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum template disponível
              </h3>
              <p className="text-muted-foreground mb-4">
                Os templates estão sendo carregados. Tente novamente em alguns segundos.
              </p>
              <Button onClick={() => window.location.reload()}>
                Recarregar Página
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => {
              const IconComponent = iconMap[template.icon || "FileText"] || FileText;
              const isPremiumLocked = template.isPremium && currentPlan?.plan === "FREE";
              
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`h-full hover:shadow-lg transition-shadow ${isPremiumLocked ? "opacity-75" : ""}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${template.color}20` }}
                        >
                          <IconComponent 
                            className="h-6 w-6 text-[#22C55E]"
                          />
                        </div>
                        <div className="flex gap-2">
                          {template.isPremium && (
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                              <Crown className="h-3 w-3 mr-1" />
                              Pro
                            </Badge>
                          )}
                          <Badge variant="secondary">
                            {categoryLabels[template.category || "PERSONAL"]}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-3">{template.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Deliverables Preview */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase">Entregas Sugeridas</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-green-500/20 text-green-600 flex items-center justify-center text-xs font-bold">A</span>
                            <span className="text-muted-foreground truncate">{template.defaultDeliverableA || "Mínimo aceitável"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-600 flex items-center justify-center text-xs font-bold">B</span>
                            <span className="text-muted-foreground truncate">{template.defaultDeliverableB || "Ideal"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-purple-500/20 text-purple-600 flex items-center justify-center text-xs font-bold">C</span>
                            <span className="text-muted-foreground truncate">{template.defaultDeliverableC || "Excepcional"}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Meta info */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span>Ciclo: {cycleDurationLabels[template.defaultCycleDuration || "DAYS_3"]}</span>
                        <span>{template.usageCount || 0} usos</span>
                      </div>
                      
                      {/* Action Button */}
                      <Button 
                        className="w-full"
                        onClick={() => handleUseTemplate(template)}
                        disabled={createProject.isPending}
                        variant={isPremiumLocked ? "outline" : "default"}
                      >
                        {createProject.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : isPremiumLocked ? (
                          <>
                            <Crown className="h-4 w-4 mr-2" />
                            Upgrade para Usar
                          </>
                        ) : (
                          <>
                            Usar Template
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* CTA for creating custom template */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-0 text-white">
          <CardContent className="p-8 text-center">
            <Rocket className="h-12 w-12 mx-auto mb-4 text-[#22C55E]" />
            <h3 className="text-xl font-bold mb-2">Não encontrou o que procura?</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Crie um projeto do zero e deixe nossa IA decompor suas tarefas automaticamente com base no seu briefing.
            </p>
            <Link href="/dashboard/projects/new">
              <Button size="lg" className="bg-[#22C55E] hover:bg-[#16A34A] text-white">
                Criar Projeto Personalizado
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayoutNeuroExecucao>
  );
}
