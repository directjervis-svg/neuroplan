import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff, Clock, Sun, Briefcase, Calendar, BarChart3 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const REMINDER_CONFIG = {
  daily_start: {
    icon: Sun,
    title: "Lembrete Matinal",
    description: "Receba um lembrete para começar suas tarefas do dia",
    defaultTime: "09:00",
  },
  task_pending: {
    icon: Briefcase,
    title: "Tarefa Pendente",
    description: "Lembrete quando há tarefas A não concluídas",
    defaultTime: "14:00",
  },
  cycle_end: {
    icon: Calendar,
    title: "Fim de Ciclo",
    description: "Aviso quando seu ciclo de 3 dias está acabando",
    defaultTime: "18:00",
  },
  weekly_summary: {
    icon: BarChart3,
    title: "Resumo Semanal",
    description: "Receba um resumo do seu progresso toda semana",
    defaultTime: "10:00",
  },
};

export default function ReminderSettings() {
  const { data: reminders, isLoading, refetch } = trpc.reminders.getAll.useQuery();
  const updateReminder = trpc.reminders.update.useMutation({
    onSuccess: () => refetch(),
  });
  const toggleReminder = trpc.reminders.toggle.useMutation({
    onSuccess: () => refetch(),
  });

  const [editingTime, setEditingTime] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const handleToggle = async (reminderType: string) => {
    await toggleReminder.mutateAsync({ 
      reminderType: reminderType as any 
    });
    toast.success("Lembrete atualizado!");
  };

  const handleTimeChange = async (reminderType: string, time: string) => {
    const reminder = reminders?.find(r => r.reminderType === reminderType);
    await updateReminder.mutateAsync({
      reminderType: reminderType as any,
      time: time + ":00", // Adiciona segundos
      enabled: reminder?.enabled ?? false,
    });
    setEditingTime(null);
    toast.success("Horário atualizado!");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Lembretes</h2>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Configure lembretes gentis para te ajudar a manter o foco. 
        Todos os lembretes são opcionais e estão desligados por padrão.
      </p>

      <div className="space-y-3">
        {Object.entries(REMINDER_CONFIG).map(([type, config]) => {
          const reminder = reminders?.find(r => r.reminderType === type);
          const Icon = config.icon;
          const isEnabled = reminder?.enabled ?? false;
          const currentTime = reminder?.time?.slice(0, 5) ?? config.defaultTime;

          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border transition-colors ${
                isEnabled 
                  ? "bg-primary/5 border-primary/20" 
                  : "bg-muted/50 border-transparent"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    isEnabled ? "bg-primary/10" : "bg-muted"
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      isEnabled ? "text-primary" : "text-muted-foreground"
                    }`} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium text-sm">{config.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {config.description}
                    </p>
                    
                    {/* Seletor de horário */}
                    {isEnabled && (
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {editingTime === type ? (
                          <input
                            type="time"
                            defaultValue={currentTime}
                            onBlur={(e) => handleTimeChange(type, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleTimeChange(type, e.currentTarget.value);
                              }
                            }}
                            className="text-xs bg-background border rounded px-2 py-1"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => setEditingTime(type)}
                            className="text-xs text-primary hover:underline"
                          >
                            {currentTime}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => handleToggle(type)}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mt-4 italic">
        💡 Dica: Lembretes são enviados como notificações do navegador. 
        Certifique-se de permitir notificações quando solicitado.
      </p>
    </div>
  );
}
