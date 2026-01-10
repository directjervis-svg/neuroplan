import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Loader2, Zap } from "lucide-react";

/**
 * QuickFeedback - Feedback visual instantâneo (≤200ms)
 * 
 * Princípio Barkley: Feedback imediato é crucial para cérebros TDAH.
 * Este componente garante resposta visual em menos de 200ms.
 */

interface QuickFeedbackProps {
  status: "idle" | "loading" | "success" | "error";
  successMessage?: string;
  errorMessage?: string;
  onComplete?: () => void;
  duration?: number;
}

export function QuickFeedback({ 
  status, 
  successMessage = "Feito!", 
  errorMessage = "Erro",
  onComplete,
  duration = 1500 
}: QuickFeedbackProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status === "success" || status === "error") {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [status, duration, onComplete]);

  return (
    <AnimatePresence>
      {status === "loading" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }} // ≤200ms
          className="inline-flex items-center gap-2"
        >
          <Loader2 className="w-4 h-4 animate-spin text-[#22C55E]" />
        </motion.div>
      )}
      
      {visible && status === "success" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -10 }}
          transition={{ duration: 0.15 }} // ≤200ms
          className="inline-flex items-center gap-2 text-[#22C55E]"
        >
          <div className="w-5 h-5 rounded-full bg-[#22C55E] flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-medium">{successMessage}</span>
        </motion.div>
      )}
      
      {visible && status === "error" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -10 }}
          transition={{ duration: 0.15 }} // ≤200ms
          className="inline-flex items-center gap-2 text-red-500"
        >
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
            <X className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-medium">{errorMessage}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * XPGain - Animação de ganho de XP
 */
interface XPGainProps {
  amount: number;
  show: boolean;
  onComplete?: () => void;
}

export function XPGain({ amount, show, onComplete }: XPGainProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 1.2 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white px-6 py-4 rounded-2xl shadow-lg shadow-[#22C55E]/30">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">+{amount} XP</p>
              <p className="text-sm text-white/80">Tarefa concluída!</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * ProgressPulse - Pulso visual ao completar ações
 */
interface ProgressPulseProps {
  active: boolean;
  color?: string;
}

export function ProgressPulse({ active, color = "#22C55E" }: ProgressPulseProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 2, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
    </AnimatePresence>
  );
}

/**
 * ButtonWithFeedback - Botão com feedback visual integrado
 */
interface ButtonWithFeedbackProps {
  children: React.ReactNode;
  onClick: () => Promise<void>;
  className?: string;
  successMessage?: string;
  disabled?: boolean;
}

export function ButtonWithFeedback({ 
  children, 
  onClick, 
  className = "",
  successMessage = "Feito!",
  disabled = false
}: ButtonWithFeedbackProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleClick = async () => {
    if (disabled || status === "loading") return;
    
    setStatus("loading");
    try {
      await onClick();
      setStatus("success");
      setTimeout(() => setStatus("idle"), 1500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 1500);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || status === "loading"}
      className={`relative overflow-hidden transition-all duration-150 ${className} ${
        status === "loading" ? "opacity-80" : ""
      } ${status === "success" ? "bg-[#22C55E] text-white" : ""}`}
    >
      <AnimatePresence mode="wait">
        {status === "loading" ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="flex items-center justify-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
          </motion.div>
        ) : status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{successMessage}</span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

export default QuickFeedback;
