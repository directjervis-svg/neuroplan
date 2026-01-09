/**
 * Notification Settings Page
 * Configure push notifications and weekly reports
 */

import DashboardLayoutNeuroPlan from "@/components/DashboardLayoutNeuroPlan";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Bell, Mail, Smartphone, Calendar, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

const DAYS_OF_WEEK = [
  { value: "0", label: "Domingo" },
  { value: "1", label: "Segunda-feira" },
  { value: "2", label: "Terça-feira" },
  { value: "3", label: "Quarta-feira" },
  { value: "4", label: "Quinta-feira" },
  { value: "5", label: "Sexta-feira" },
  { value: "6", label: "Sábado" },
];

export default function NotificationSettings() {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");

  // Check push notification support
  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setPushSupported(true);
      setPushPermission(Notification.permission);
    }
  }, []);

  // Get preferences
  const { data: reportPrefs, isLoading: loadingReportPrefs } = trpc.weeklyReports.getPreferences.useQuery();
  
  // Mutations
  const updateReportPrefs = trpc.weeklyReports.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Preferências salvas!");
    },
    onError: () => {
      toast.error("Erro ao salvar preferências");
    },
  });

  const subscribePush = trpc.push.subscribe.useMutation({
    onSuccess: () => {
      toast.success("Notificações push ativadas!");
      setPushEnabled(true);
    },
    onError: () => {
      toast.error("Erro ao ativar notificações");
    },
  });

  const unsubscribePush = trpc.push.unsubscribe.useMutation({
    onSuccess: () => {
      toast.success("Notificações push desativadas");
      setPushEnabled(false);
    },
    onError: () => {
      toast.error("Erro ao desativar notificações");
    },
  });

  // Request push permission and subscribe
  const handleEnablePush = async () => {
    if (!pushSupported) {
      toast.error("Seu navegador não suporta notificações push");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === "granted") {
        // Get service worker registration
        const registration = await navigator.serviceWorker.ready;
        
        // Subscribe to push
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            // This would be your VAPID public key
            'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
          ),
        });

        // Send subscription to server
        const subscriptionJson = subscription.toJSON();
        await subscribePush.mutateAsync({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscriptionJson.keys?.p256dh || '',
            auth: subscriptionJson.keys?.auth || '',
          },
        });
      } else {
        toast.error("Permissão negada para notificações");
      }
    } catch (error) {
      console.error("Error enabling push:", error);
      toast.error("Erro ao ativar notificações push");
    }
  };

  const handleDisablePush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await unsubscribePush.mutateAsync({ endpoint: subscription.endpoint });
      }
    } catch (error) {
      console.error("Error disabling push:", error);
      toast.error("Erro ao desativar notificações");
    }
  };

  // Helper function to convert VAPID key
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  if (loadingReportPrefs) {
    return (
      <DashboardLayoutNeuroPlan>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayoutNeuroPlan>
    );
  }

  return (
    <DashboardLayoutNeuroPlan>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações de Notificações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie como e quando você recebe alertas e relatórios
          </p>
        </div>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Notificações Push
            </CardTitle>
            <CardDescription>
              Receba alertas no navegador sobre tarefas pendentes e streaks em risco
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!pushSupported ? (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Seu navegador não suporta notificações push. Tente usar Chrome, Firefox ou Edge.
                </p>
              </div>
            ) : pushPermission === "denied" ? (
              <div className="p-4 bg-destructive/10 rounded-lg">
                <p className="text-sm text-destructive">
                  Você bloqueou as notificações. Para ativar, acesse as configurações do navegador.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Ativar notificações push</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas mesmo quando o app estiver fechado
                  </p>
                </div>
                <Switch
                  checked={pushEnabled}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleEnablePush();
                    } else {
                      handleDisablePush();
                    }
                  }}
                />
              </div>
            )}

            {pushEnabled && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Lembretes de tarefas</Label>
                      <p className="text-sm text-muted-foreground">
                        Alertas sobre tarefas pendentes do dia
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Alertas de streak</Label>
                      <p className="text-sm text-muted-foreground">
                        Aviso quando seu streak está em risco
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Conquistas</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificações de badges e níveis desbloqueados
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Weekly Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Relatórios Semanais
            </CardTitle>
            <CardDescription>
              Receba um resumo semanal de produtividade com insights personalizados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Ativar relatórios semanais</Label>
                <p className="text-sm text-muted-foreground">
                  Resumo de tarefas, foco e progresso da semana
                </p>
              </div>
              <Switch
                checked={reportPrefs?.weeklyReport ?? true}
                onCheckedChange={(checked) => {
                  updateReportPrefs.mutate({ weeklyReport: checked });
                }}
              />
            </div>

            {reportPrefs?.weeklyReport && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>Dia de envio</Label>
                  <Select
                    value={String(reportPrefs?.weeklyReportDay ?? 1)}
                    onValueChange={(value) => {
                      updateReportPrefs.mutate({ weeklyReportDay: parseInt(value) });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    O relatório será enviado pela manhã no dia selecionado
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* What's included */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              O que está incluído
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Notificações Push</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Lembretes de tarefas do dia</li>
                  <li>• Alertas de streak em risco</li>
                  <li>• Notificações de conquistas</li>
                  <li>• Resumo diário (opcional)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Relatório Semanal</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Tarefas completadas por tipo</li>
                  <li>• Tempo de foco acumulado</li>
                  <li>• Score de produtividade</li>
                  <li>• Insights personalizados com IA</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayoutNeuroPlan>
  );
}
