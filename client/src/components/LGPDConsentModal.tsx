import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Shield } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/**
 * Modal de Consentimento LGPD
 * 
 * Exibido no primeiro acesso do usuário para coletar consentimento explícito
 * conforme Art. 5º II da LGPD (dados sensíveis de saúde - TDAH).
 * 
 * Funcionalidades:
 * - Checkbox consentimento LGPD
 * - Disclaimer ANVISA (não substitui diagnóstico médico)
 * - Links Política de Privacidade e Termos de Uso
 * - Persistência no banco de dados
 */

export default function LGPDConsentModal() {
  const [open, setOpen] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: user } = trpc.auth.me.useQuery();
  const giveConsent = trpc.auth.giveConsent.useMutation({
    onSuccess: () => {
      toast.success("Consentimento registrado com sucesso!");
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao registrar consentimento");
      setLoading(false);
    },
  });

  // Verificar se usuário já deu consentimento
  useEffect(() => {
    if (user && !user.consentGiven) {
      setOpen(true);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!consentChecked) {
      toast.error("Você precisa aceitar os termos para continuar");
      return;
    }

    setLoading(true);
    giveConsent.mutate({
      consentVersion: "1.0",
    });
  };

  if (!user || user.consentGiven) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="w-6 h-6 text-green-600" />
            Proteção de Dados Pessoais (LGPD)
          </DialogTitle>
          <DialogDescription className="text-base">
            Antes de começar, precisamos do seu consentimento para processar seus dados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Disclaimer ANVISA */}
          <Alert className="border-yellow-300 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm text-gray-700">
              <strong>Importante:</strong> O NeuroExecução é uma ferramenta de produtividade e{" "}
              <strong>não substitui diagnóstico, tratamento ou acompanhamento médico</strong>.
              Se você suspeita ter TDAH, consulte um profissional de saúde qualificado.
            </AlertDescription>
          </Alert>

          {/* Informações LGPD */}
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>Dados que coletamos:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Informações de cadastro (nome, e-mail)</li>
              <li>Dados de uso da plataforma (projetos, tarefas, ciclos)</li>
              <li>Informações sobre TDAH (consideradas dados sensíveis pela LGPD)</li>
            </ul>

            <p className="mt-3">
              <strong>Como usamos seus dados:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Fornecer e melhorar nossos serviços</li>
              <li>Personalizar sua experiência de uso</li>
              <li>Enviar notificações e comunicações relevantes</li>
              <li>Cumprir obrigações legais</li>
            </ul>

            <p className="mt-3">
              <strong>Seus direitos:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Acessar, corrigir ou excluir seus dados a qualquer momento</li>
              <li>Revogar seu consentimento (resultará no encerramento da conta)</li>
              <li>Solicitar portabilidade dos seus dados</li>
            </ul>

            <p className="mt-3 text-xs text-gray-600">
              Para mais informações, leia nossa{" "}
              <a href="/privacy" target="_blank" className="text-green-600 hover:underline">
                Política de Privacidade
              </a>{" "}
              e{" "}
              <a href="/terms" target="_blank" className="text-green-600 hover:underline">
                Termos de Uso
              </a>
              .
            </p>
          </div>

          {/* Checkbox Consentimento */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Checkbox
              id="consent"
              checked={consentChecked}
              onCheckedChange={(checked) => setConsentChecked(checked as boolean)}
              className="mt-1"
            />
            <label htmlFor="consent" className="text-sm text-gray-700 cursor-pointer">
              Declaro que li e aceito a{" "}
              <a href="/privacy" target="_blank" className="text-green-600 hover:underline font-medium">
                Política de Privacidade
              </a>{" "}
              e os{" "}
              <a href="/terms" target="_blank" className="text-green-600 hover:underline font-medium">
                Termos de Uso
              </a>
              , e autorizo o processamento dos meus dados pessoais, incluindo dados sensíveis de saúde
              relacionados ao TDAH, conforme descrito acima.
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!consentChecked || loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? "Registrando..." : "Aceitar e Continuar"}
          </Button>
        </DialogFooter>

        <p className="text-xs text-center text-gray-500">
          Ao aceitar, você concorda com o tratamento dos seus dados conforme a Lei Geral de Proteção de Dados (LGPD).
        </p>
      </DialogContent>
    </Dialog>
  );
}
