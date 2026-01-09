import DashboardLayoutNeuroPlan from "@/components/DashboardLayoutNeuroPlan";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { 
  ArrowRight, 
  FolderKanban, 
  Plus, 
  Search,
  Calendar,
  Target
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

/**
 * Projects List Page
 * Shows all user projects with filtering and search
 */
export default function Projects() {
  const { data: projects, isLoading } = trpc.projects.list.useQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredProjects = projects?.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: projects?.length || 0,
    ACTIVE: projects?.filter(p => p.status === "ACTIVE").length || 0,
    PLANNING: projects?.filter(p => p.status === "PLANNING").length || 0,
    COMPLETED: projects?.filter(p => p.status === "COMPLETED").length || 0,
  };

  return (
    <DashboardLayoutNeuroPlan>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Projetos</h1>
            <p className="text-muted-foreground">Gerencie seus projetos e ciclos de execução</p>
          </div>
          <Link href="/dashboard/projects/new">
            <Button className="bg-[#22C55E] hover:bg-[#16A34A] text-white">
              <Plus className="mr-2 h-4 w-4" />
              Novo Projeto
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar projetos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <FilterButton
              label="Todos"
              count={statusCounts.all}
              active={!statusFilter}
              onClick={() => setStatusFilter(null)}
            />
            <FilterButton
              label="Ativos"
              count={statusCounts.ACTIVE}
              active={statusFilter === "ACTIVE"}
              onClick={() => setStatusFilter("ACTIVE")}
              color="#22C55E"
            />
            <FilterButton
              label="Planejando"
              count={statusCounts.PLANNING}
              active={statusFilter === "PLANNING"}
              onClick={() => setStatusFilter("PLANNING")}
              color="#FF8C42"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredProjects && filteredProjects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <EmptyState searchQuery={searchQuery} />
        )}
      </div>
    </DashboardLayoutNeuroPlan>
  );
}

function FilterButton({
  label,
  count,
  active,
  onClick,
  color,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-foreground text-background"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
    >
      {label}
      <span
        className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
          active ? "bg-background/20" : "bg-background"
        }`}
        style={color && !active ? { color } : undefined}
      >
        {count}
      </span>
    </button>
  );
}

function ProjectCard({
  project,
}: {
  project: {
    id: number;
    title: string;
    briefing: string | null;
    status: string | null;
    category: string | null;
    cycleDuration: string | null;
    createdAt: Date;
  };
}) {
  const statusColors: Record<string, string> = {
    PLANNING: "#FF8C42",
    ACTIVE: "#22C55E",
    PAUSED: "#6B7280",
    COMPLETED: "#22C55E",
    ARCHIVED: "#6B7280",
  };

  const statusLabels: Record<string, string> = {
    PLANNING: "Planejando",
    ACTIVE: "Ativo",
    PAUSED: "Pausado",
    COMPLETED: "Concluído",
    ARCHIVED: "Arquivado",
  };

  const categoryLabels: Record<string, string> = {
    PERSONAL: "Pessoal",
    PROFESSIONAL: "Profissional",
    ACADEMIC: "Acadêmico",
  };

  const cycleDurationLabels: Record<string, string> = {
    DAYS_3: "3 dias",
    DAYS_7: "7 dias",
    DAYS_14: "14 dias",
  };

  const status = project.status || "PLANNING";
  const category = project.category || "PERSONAL";
  const cycleDuration = project.cycleDuration || "DAYS_3";

  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <Card className="h-full hover:border-[#22C55E]/30 transition-colors cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-lg bg-muted">
              <FolderKanban className="h-5 w-5 text-muted-foreground" />
            </div>
            <span
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{
                backgroundColor: `${statusColors[status]}15`,
                color: statusColors[status],
              }}
            >
              {statusLabels[status]}
            </span>
          </div>
          <CardTitle className="text-lg mt-3 line-clamp-1">{project.title}</CardTitle>
          {project.briefing && (
            <CardDescription className="line-clamp-2">{project.briefing}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {categoryLabels[category]}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {cycleDurationLabels[cycleDuration]}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Criado em {new Date(project.createdAt).toLocaleDateString("pt-BR")}
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyState({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-full bg-muted mb-4">
        <FolderKanban className="h-8 w-8 text-muted-foreground" />
      </div>
      {searchQuery ? (
        <>
          <h3 className="text-lg font-medium text-foreground">Nenhum projeto encontrado</h3>
          <p className="text-muted-foreground mt-1">
            Tente ajustar sua busca ou filtros
          </p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium text-foreground">Nenhum projeto ainda</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Comece criando seu primeiro projeto para transformar ideias em ações
          </p>
          <Link href="/dashboard/projects/new">
            <Button className="bg-[#22C55E] hover:bg-[#16A34A] text-white">
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Projeto
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
