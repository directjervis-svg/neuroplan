import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserPreferences {
  focusMode: 'calm' | 'focus' | 'visual';
  colorTheme: 'calm' | 'energy' | 'cool';
  timerDefault: number;
  notificationsEnabled: boolean;
}

interface OnboardingModalProps {
  onComplete: (prefs: UserPreferences) => void;
  onSkip: () => void;
  defaultPrefs?: Partial<UserPreferences>;
}

export function OnboardingModal({ onComplete, onSkip, defaultPrefs }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState<UserPreferences>({
    focusMode: defaultPrefs?.focusMode || 'calm',
    colorTheme: defaultPrefs?.colorTheme || 'calm',
    timerDefault: defaultPrefs?.timerDefault || 25,
    notificationsEnabled: defaultPrefs?.notificationsEnabled ?? false,
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      localStorage.setItem('neuroplan_onboarding_complete', 'true');
      localStorage.setItem('neuroplan_prefs', JSON.stringify(prefs));
      onComplete(prefs);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-background-card rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-8"
        >
          {/* Progress Bar */}
          <div className="flex gap-2 mb-8" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3}>
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-action-primary' : 'bg-background-tertiary'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Step1FocusMode
                  value={prefs.focusMode}
                  onChange={(mode) => setPrefs({ ...prefs, focusMode: mode })}
                />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Step2ColorTheme
                  value={prefs.colorTheme}
                  onChange={(theme) => setPrefs({ ...prefs, colorTheme: theme })}
                />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Step3Timer
                  value={prefs.timerDefault}
                  onChange={(timer) => setPrefs({ ...prefs, timerDefault: timer })}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={onSkip}
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Pular onboarding"
            >
              Pular
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-action-primary text-white rounded-lg font-medium hover:bg-action-primaryHover transition-colors"
              aria-label={step === 3 ? 'Finalizar configuracao' : 'Proximo passo'}
            >
              {step === 3 ? 'Comecar' : 'Proximo'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Sub-componente Step 1
function Step1FocusMode({ value, onChange }: { value: string; onChange: (v: 'calm' | 'focus' | 'visual') => void }) {
  const modes = [
    { id: 'calm' as const, label: 'Calmante', icon: '🌊', desc: 'Cores frias, ritmo lento' },
    { id: 'focus' as const, label: 'Concentrado', icon: '🎯', desc: 'Contraste alto, sem distracoes' },
    { id: 'visual' as const, label: 'Visual', icon: '🎨', desc: 'Gradientes, animacoes suaves' },
  ];

  return (
    <div>
      <h2 id="onboarding-title" className="text-3xl font-bold text-text-primary mb-2">
        Bem-vindo ao NeuroExecucao! 🧠
      </h2>
      <p className="text-text-secondary mb-6">Escolha como voce trabalha melhor</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="radiogroup" aria-label="Modo de foco">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            role="radio"
            aria-checked={value === mode.id}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              value === mode.id
                ? 'border-action-primary bg-gradient-calm'
                : 'border-border-default hover:border-border-hover'
            }`}
          >
            <div className="text-2xl mb-2">{mode.icon}</div>
            <div className="text-lg font-semibold text-text-primary mb-1">{mode.label}</div>
            <div className="text-sm text-text-secondary">{mode.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Sub-componente Step 2
function Step2ColorTheme({ value, onChange }: { value: string; onChange: (v: 'calm' | 'energy' | 'cool') => void }) {
  const themes = [
    { id: 'calm' as const, label: 'Tema Calmo', gradient: 'bg-gradient-calm', desc: 'Azul-cinza frio' },
    { id: 'energy' as const, label: 'Tema Energia', gradient: 'bg-gradient-energy', desc: 'Coral-laranja' },
    { id: 'cool' as const, label: 'Tema Cool', gradient: 'bg-gradient-cool', desc: 'Roxo-azul' },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-text-primary mb-2">
        Escolha sua paleta de cores 🎨
      </h2>
      <p className="text-text-secondary mb-6">Voce pode mudar depois a qualquer momento</p>
      <div className="space-y-3" role="radiogroup" aria-label="Tema de cores">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onChange(theme.id)}
            role="radio"
            aria-checked={value === theme.id}
            className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
              value === theme.id
                ? 'border-action-primary'
                : 'border-border-default hover:border-border-hover'
            }`}
          >
            <div className={`w-12 h-12 rounded-full ${theme.gradient}`} aria-hidden="true" />
            <div className="text-left">
              <div className="font-semibold text-text-primary">{theme.label}</div>
              <div className="text-sm text-text-secondary">{theme.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Sub-componente Step 3
function Step3Timer({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const options = [
    { value: 25, label: '25 minutos', desc: 'Pomodoro classico' },
    { value: 40, label: '40 minutos', desc: 'Sessao estendida' },
    { value: 60, label: '60 minutos', desc: 'Deep work' },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-text-primary mb-2">
        Qual seu tempo de foco ideal? ⏱️
      </h2>
      <p className="text-text-secondary mb-6">Voce pode ajustar isso depois</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="radiogroup" aria-label="Duracao do timer">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            role="radio"
            aria-checked={value === opt.value}
            className={`p-6 rounded-lg border-2 transition-all ${
              value === opt.value
                ? 'border-action-primary bg-gradient-calm'
                : 'border-border-default hover:border-border-hover'
            }`}
          >
            <div className="text-2xl font-bold text-text-primary mb-1">{opt.label}</div>
            <div className="text-sm text-text-secondary">{opt.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default OnboardingModal;
