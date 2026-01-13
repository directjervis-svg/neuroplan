import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayoutNeuroExecucao from "@/components/DashboardLayout";
import ReminderSettings from "@/components/ReminderSettings";
import { Settings as SettingsIcon, User, Bell, Palette } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();

  return (
    <DashboardLayoutNeuroExecucao>
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Configurações</h1>
        </div>

        <div className="space-y-8">
          {/* Seção de Lembretes */}
          <section className="bg-card rounded-xl p-6 shadow-sm border">
            <ReminderSettings />
          </section>

          {/* Outras seções de configuração podem ser adicionadas aqui */}
        </div>
      </div>
    </DashboardLayoutNeuroExecucao>
  );
}
