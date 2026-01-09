import DashboardLayoutNeuroPlan from "@/components/DashboardLayoutNeuroPlan";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft, 
  Lightbulb, 
  Plus, 
  Search,
  Sparkles,
  Trash2,
  FolderKanban
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Quick Ideas Page
 * Capture non-linear thoughts without losing focus on current task
 * Based on Barkley: "Externalize working memory"
 */
export default function QuickIdeas() {
  const [newIdea, setNewIdea] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: ideas, isLoading } = trpc.ideas.list.useQuery({});
  const { data: projects } = trpc.projects.list.useQuery();

  const utils = trpc.useUtils();

  const createIdea = trpc.ideas.create.useMutation({
    onSuccess: () => {
      utils.ideas.list.invalidate();
      setNewIdea("");
      toast.success("Ideia capturada!");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIdea.trim()) {
      createIdea.mutate({ content: newIdea.trim() });
    }
  };

  const filteredIdeas = ideas?.filter((idea) =>
    idea.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayoutNeuroPlan>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quick Ideas</h1>
            <p className="text-muted-foreground">Capture pensamentos sem perder o foco</p>
          </div>
        </div>

        {/* Quick Capture */}
        <Card className="border-[#FF8C42]/30">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="flex-1 relative">
                <Lightbulb className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#FF8C42]" />
                <Input
                  placeholder="Capturar uma ideia rápida... (Enter para salvar)"
                  value={newIdea}
                  onChange={(e) => setNewIdea(e.target.value)}
                  className="pl-10 text-base"
                  disabled={createIdea.isPending}
                />
              </div>
              <Button 
                type="submit" 
                disabled={!newIdea.trim() || createIdea.isPending}
                className="bg-[#FF8C42] hover:bg-[#F97316] text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Barkley Tip */}
        <div className="bg-gradient-to-r from-[#FF8C42]/5 to-[#22C55E]/5 rounded-lg p-4 flex items-start gap-3 border border-[#FF8C42]/20">
          <Sparkles className="h-5 w-5 text-[#FF8C42] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Por que Quick Ideas?</p>
            <p className="text-sm text-muted-foreground">
              O TDAH traz pensamentos não-lineares constantes. Ao invés de lutar contra eles, 
              capture-os rapidamente aqui e volte ao foco. Sua memória de trabalho agradece.
            </p>
          </div>
        </div>

        {/* Search */}
        {ideas && ideas.length > 5 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ideias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Ideas List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredIdeas && filteredIdeas.length > 0 ? (
          <div className="space-y-3">
            {filteredIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} projects={projects || []} />
            ))}
          </div>
        ) : (
          <EmptyState hasSearch={!!searchQuery} />
        )}
      </div>
    </DashboardLayoutNeuroPlan>
  );
}

function IdeaCard({
  idea,
  projects,
}: {
  idea: {
    id: number;
    content: string;
    projectId: number | null;
    createdAt: Date;
  };
  projects: Array<{ id: number; title: string }>;
}) {
  const linkedProject = projects.find((p) => p.id === idea.projectId);

  return (
    <Card className="group hover:border-[#FF8C42]/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-[#FF8C42]/10 flex-shrink-0">
              <Lightbulb className="h-4 w-4 text-[#FF8C42]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground">{idea.content}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>{new Date(idea.createdAt).toLocaleDateString("pt-BR")}</span>
                {linkedProject && (
                  <span className="flex items-center gap-1">
                    <FolderKanban className="h-3 w-3" />
                    {linkedProject.title}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={() => toast.info("Funcionalidade em desenvolvimento")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-full bg-[#FF8C42]/10 mb-4">
        <Lightbulb className="h-8 w-8 text-[#FF8C42]" />
      </div>
      {hasSearch ? (
        <>
          <h3 className="text-lg font-medium text-foreground">Nenhuma ideia encontrada</h3>
          <p className="text-muted-foreground mt-1">Tente ajustar sua busca</p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium text-foreground">Nenhuma ideia ainda</h3>
          <p className="text-muted-foreground mt-1 max-w-md">
            Use o campo acima para capturar pensamentos rápidos. 
            Não se preocupe em organizar agora, apenas capture!
          </p>
        </>
      )}
    </div>
  );
}
