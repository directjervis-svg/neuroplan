import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft,
  Calendar,
  Download,
  FileText,
  Loader2,
  Printer,
  StickyNote,
  FileSpreadsheet
} from "lucide-react";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import DashboardLayoutNeuroExecucao from "@/components/DashboardLayoutNeuroExecucao";
import { toast } from "sonner";

export default function ExportProject() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id || "0");
  const [companyName, setCompanyName] = useState("");
  
  const { data: projectData, isLoading } = trpc.export.getProjectForExport.useQuery({ projectId });
  
  const generateMentalPlan = trpc.export.generateMentalPlan.useMutation({
    onSuccess: (data) => {
      downloadHTML(data.html, data.filename);
      toast.success("Plano Mental gerado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao gerar: " + error.message);
    },
  });
  
  const generatePostIts = trpc.export.generatePostIts.useMutation({
    onSuccess: (data) => {
      downloadHTML(data.html, data.filename);
      toast.success("Post-its gerados com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao gerar: " + error.message);
    },
  });
  
  const generateProjectOnePage = trpc.export.generateProjectOnePage.useMutation({
    onSuccess: (data) => {
      downloadHTML(data.html, data.filename);
      toast.success("Projeto One-Page gerado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao gerar: " + error.message);
    },
  });
  
  const generateICal = trpc.export.generateICal.useMutation({
    onSuccess: (data) => {
      downloadFile(data.ical, data.filename, "text/calendar");
      toast.success("Arquivo iCal gerado! Importe no seu calendário.");
    },
    onError: (error) => {
      toast.error("Erro ao gerar: " + error.message);
    },
  });

  // Helper to download HTML file
  const downloadHTML = (html: string, filename: string) => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper to download any file
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper to open in new window for printing
  const openForPrint = async (generateFn: any, params: any) => {
    try {
      const result = await generateFn.mutateAsync(params);
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(result.html);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    } catch (error) {
      // Error handled by mutation
    }
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

  if (!projectData) {
    return (
      <DashboardLayoutNeuroExecucao>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Projeto não encontrado</p>
          <Link href="/dashboard/projects">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar aos Projetos
            </Button>
          </Link>
        </div>
      </DashboardLayoutNeuroExecucao>
    );
  }

  const { project, tasks } = projectData;
  const isGenerating = generateMentalPlan.isPending || generatePostIts.isPending || 
                       generateProjectOnePage.isPending || generateICal.isPending;

  return (
    <DashboardLayoutNeuroExecucao>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <Link href={`/dashboard/projects/${projectId}`}>
              <Button variant="ghost" size="sm" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Projeto
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Exportar Projeto</h1>
            <p className="text-muted-foreground mt-1">
              {project.title} • {tasks.length} tarefas
            </p>
          </div>
        </div>

        {/* Company Name Input (optional) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personalização Corporativa</CardTitle>
            <CardDescription>
              Adicione o nome da sua empresa para exportações com estilo corporativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="companyName">Nome da Empresa (opcional)</Label>
                <Input
                  id="companyName"
                  placeholder="Ex: Minha Empresa Ltda"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Options Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Mental Plan One-Page */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#22C55E]/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-[#22C55E]" />
                  </div>
                  <div>
                    <CardTitle>Plano Mental One-Page</CardTitle>
                    <CardDescription>Visão completa do projeto em uma página</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Documento visual com todas as tarefas organizadas por dia, entregas A-B-C e metadados do projeto. 
                  Ideal para imprimir e manter visível durante a execução.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Tarefas organizadas por dia</li>
                  <li>✓ Entregas anti-perfeccionismo</li>
                  <li>✓ Design premium para impressão</li>
                </ul>
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => generateMentalPlan.mutate({ projectId })}
                    disabled={isGenerating}
                  >
                    {generateMentalPlan.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Baixar HTML
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => openForPrint(generateMentalPlan, { projectId })}
                    disabled={isGenerating}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Post-its */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#FF8C42]/10 flex items-center justify-center">
                    <StickyNote className="h-6 w-6 text-[#FF8C42]" />
                  </div>
                  <div>
                    <CardTitle>Post-its para Recortar</CardTitle>
                    <CardDescription>Tarefas em formato de post-it</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Cada tarefa em um post-it individual, pronto para imprimir e recortar. 
                  Cole no seu quadro, agenda ou monitor para acompanhamento físico.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Um post-it por tarefa</li>
                  <li>✓ Cores por tipo de tarefa</li>
                  <li>✓ Linhas de corte para impressão</li>
                </ul>
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => generatePostIts.mutate({ projectId })}
                    disabled={isGenerating}
                  >
                    {generatePostIts.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Baixar HTML
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => openForPrint(generatePostIts, { projectId })}
                    disabled={isGenerating}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Project One-Page */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
                    <FileSpreadsheet className="h-6 w-6 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <CardTitle>Projeto One-Page Corporativo</CardTitle>
                    <CardDescription>Documento formal para apresentações</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Documento profissional com tabela de tarefas, progresso e entregas. 
                  Ideal para compartilhar com equipe, gestores ou clientes.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Estilo corporativo premium</li>
                  <li>✓ Tabela de cronograma</li>
                  <li>✓ Métricas de progresso</li>
                </ul>
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => generateProjectOnePage.mutate({ projectId, companyName: companyName || undefined })}
                    disabled={isGenerating}
                  >
                    {generateProjectOnePage.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Baixar HTML
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => openForPrint(generateProjectOnePage, { projectId, companyName: companyName || undefined })}
                    disabled={isGenerating}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* iCal Export */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-[#3B82F6]" />
                  </div>
                  <div>
                    <CardTitle>Exportar para Calendário</CardTitle>
                    <CardDescription>Arquivo iCal para Google Calendar, Outlook, etc.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Gere um arquivo .ics com todas as tarefas como eventos. 
                  Importe no seu calendário favorito para receber lembretes.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Compatível com Google Calendar</li>
                  <li>✓ Compatível com Outlook</li>
                  <li>✓ Compatível com Apple Calendar</li>
                </ul>
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => generateICal.mutate({ projectId })}
                    disabled={isGenerating}
                  >
                    {generateICal.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Baixar .ICS
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tips */}
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-3">💡 Dicas de Uso</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>
                <strong>Para imprimir como PDF:</strong> Abra o arquivo HTML no navegador, 
                pressione Ctrl+P (ou Cmd+P no Mac) e selecione "Salvar como PDF".
              </li>
              <li>
                <strong>Post-its físicos:</strong> Imprima em papel adesivo ou cole os recortes 
                em post-its reais para um quadro Kanban físico.
              </li>
              <li>
                <strong>Calendário:</strong> Após baixar o arquivo .ics, abra-o com seu app de 
                calendário ou importe manualmente nas configurações.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayoutNeuroExecucao>
  );
}
