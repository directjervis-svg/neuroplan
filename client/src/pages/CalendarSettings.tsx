/**
 * Calendar Settings Page
 * Configure Google Calendar integration and sync settings
 */

import { useState } from "react";
import DashboardLayoutNeuroExecucao from "@/components/DashboardLayoutNeuroExecucao";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { 
  Calendar, 
  Link as LinkIcon, 
  Unlink, 
  RefreshCw, 
  Download,
  Upload,
  Settings,
  Clock,
  Palette,
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react";

export default function CalendarSettings() {
  const [isSyncing, setIsSyncing] = useState(false);

  // Queries
  const { data: connectionStatus, isLoading: loadingConnection } = trpc.calendar.getConnectionStatus.useQuery();
  const { data: syncSettings, isLoading: loadingSettings } = trpc.calendar.getSyncSettings.useQuery();
  const { data: authUrl } = trpc.calendar.getAuthUrl.useQuery();

  // Mutations
  const updateSettings = trpc.calendar.updateSyncSettings.useMutation({
    onSuccess: () => {
      toast.success("Configurações salvas!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const syncToCalendar = trpc.calendar.syncToCalendar.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`${result.syncedCount} tarefas sincronizadas!`);
      } else {
        toast.info(result.message);
      }
      setIsSyncing(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsSyncing(false);
    },
  });

  const handleConnect = () => {
    if (authUrl?.url) {
      window.open(authUrl.url, '_blank');
    } else {
      toast.info(authUrl?.message || "Integração não disponível no momento.");
    }
  };

  const handleSync = () => {
    setIsSyncing(true);
    syncToCalendar.mutate({});
  };

  const handleSettingChange = (key: string, value: unknown) => {
    updateSettings.mutate({ [key]: value });
  };

  if (loadingConnection || loadingSettings) {
    return (
      <DashboardLayoutNeuroExecucao>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
        </div>
      </DashboardLayoutNeuroExecucao>
    );
  }

  return (
    <DashboardLayoutNeuroExecucao>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6 text-[#22C55E]" />
            Integração com Calendário
          </h1>
          <p className="text-muted-foreground mt-1">
            Sincronize suas tarefas com o Google Calendar para melhor visualização
          </p>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Status da Conexão
            </CardTitle>
            <CardDescription>
              Conecte sua conta Google para sincronizar tarefas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {connectionStatus?.connected ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
                    <div>
                      <p className="font-medium text-foreground">Conectado</p>
                      <p className="text-sm text-muted-foreground">{connectionStatus.email}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Não conectado</p>
                      <p className="text-sm text-muted-foreground">
                        {connectionStatus?.message || "Conecte sua conta Google"}
                      </p>
                    </div>
                  </>
                )}
              </div>
              
              {connectionStatus?.connected ? (
                <Button variant="outline" className="gap-2">
                  <Unlink className="h-4 w-4" />
                  Desconectar
                </Button>
              ) : (
                <Button 
                  onClick={handleConnect}
                  className="gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white"
                >
                  <LinkIcon className="h-4 w-4" />
                  Conectar Google
                </Button>
              )}
            </div>

            {!authUrl?.configured && (
              <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                <p className="text-sm text-warning-foreground">
                  A integração com Google Calendar requer configuração adicional. 
                  Por favor, entre em contato com o suporte para ativar esta funcionalidade.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sync Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações de Sincronização
            </CardTitle>
            <CardDescription>
              Personalize como suas tarefas são sincronizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable Sync */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sincronização Ativa</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar sincronização automática de tarefas
                </p>
              </div>
              <Switch
                checked={syncSettings?.enabled || false}
                onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
                disabled={!connectionStatus?.connected}
              />
            </div>

            <Separator />

            {/* Sync Direction */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4" />
                Direção da Sincronização
              </Label>
              <Select
                value={syncSettings?.syncDirection || 'bidirectional'}
                onValueChange={(value) => handleSettingChange('syncDirection', value)}
                disabled={!connectionStatus?.connected}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="to_calendar">
                    NeuroExecução → Calendário
                  </SelectItem>
                  <SelectItem value="from_calendar">
                    Calendário → NeuroExecução
                  </SelectItem>
                  <SelectItem value="bidirectional">
                    Bidirecional
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Escolha como as alterações são sincronizadas entre os sistemas
              </p>
            </div>

            <Separator />

            {/* Auto Sync */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sincronização Automática</Label>
                <p className="text-sm text-muted-foreground">
                  Sincronizar automaticamente em intervalos regulares
                </p>
              </div>
              <Switch
                checked={syncSettings?.autoSync || false}
                onCheckedChange={(checked) => handleSettingChange('autoSync', checked)}
                disabled={!connectionStatus?.connected}
              />
            </div>

            {/* Sync Interval */}
            {syncSettings?.autoSync && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Intervalo de Sincronização
                  </Label>
                  <Badge variant="secondary">{syncSettings?.syncInterval || 15} min</Badge>
                </div>
                <Slider
                  value={[syncSettings?.syncInterval || 15]}
                  onValueChange={([value]) => handleSettingChange('syncInterval', value)}
                  min={5}
                  max={60}
                  step={5}
                  disabled={!connectionStatus?.connected}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5 min</span>
                  <span>60 min</span>
                </div>
              </div>
            )}

            <Separator />

            {/* Default Duration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Duração Padrão de Eventos</Label>
                <Badge variant="secondary">{syncSettings?.defaultDuration || 30} min</Badge>
              </div>
              <Slider
                value={[syncSettings?.defaultDuration || 30]}
                onValueChange={([value]) => handleSettingChange('defaultDuration', value)}
                min={15}
                max={120}
                step={15}
                disabled={!connectionStatus?.connected}
              />
              <p className="text-xs text-muted-foreground">
                Duração padrão para tarefas sem tempo estimado
              </p>
            </div>

            <Separator />

            {/* Color Coding */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Cores por Tipo de Tarefa
                </Label>
                <p className="text-sm text-muted-foreground">
                  Usar cores diferentes para ACTION, RETENTION e MAINTENANCE
                </p>
              </div>
              <Switch
                checked={syncSettings?.colorCoding || false}
                onCheckedChange={(checked) => handleSettingChange('colorCoding', checked)}
                disabled={!connectionStatus?.connected}
              />
            </div>

            {syncSettings?.colorCoding && (
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
                  <span>ACTION</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF8C42]" />
                  <span>RETENTION</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FBBF24]" />
                  <span>MAINTENANCE</span>
                </div>
              </div>
            )}

            <Separator />

            {/* Include Completed */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Incluir Tarefas Concluídas</Label>
                <p className="text-sm text-muted-foreground">
                  Sincronizar tarefas já completadas
                </p>
              </div>
              <Switch
                checked={syncSettings?.includeCompleted || false}
                onCheckedChange={(checked) => handleSettingChange('includeCompleted', checked)}
                disabled={!connectionStatus?.connected}
              />
            </div>
          </CardContent>
        </Card>

        {/* Manual Sync Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Ações Manuais
            </CardTitle>
            <CardDescription>
              Sincronize manualmente ou exporte/importe tarefas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleSync}
                disabled={!connectionStatus?.connected || isSyncing}
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Sincronizar Agora
              </Button>

              <Button
                variant="outline"
                className="gap-2"
                disabled={!connectionStatus?.connected}
              >
                <Upload className="h-4 w-4" />
                Importar Eventos
              </Button>

              <Button
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar Tarefas (iCal)
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              A exportação iCal funciona independentemente da conexão com o Google Calendar.
              Você pode importar o arquivo .ics em qualquer aplicativo de calendário.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayoutNeuroExecucao>
  );
}
