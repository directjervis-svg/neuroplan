/**
 * TEAM PANEL COMPONENT
 * NeuroExecução (KNH4)
 *
 * Painel de 8 personas C-Level virtuais
 * Grid responsivo: 3x3 (desktop), 2x4 (tablet), 1x8 (mobile)
 *
 * Baseado em: REF-023 (Referências de Design)
 */

import React, { useState } from 'react';
import { CLevelPersona, PERSONAS, PersonaId } from '@/types';
import { Card } from '@/components/shared';

interface TeamPanelProps {
  /** Callback quando consultar persona */
  onConsultPersona?: (personaId: PersonaId) => void;
  /** Classe CSS adicional */
  className?: string;
}

export const TeamPanel: React.FC<TeamPanelProps> = ({
  onConsultPersona,
  className = '',
}) => {
  const [selectedPersona, setSelectedPersona] = useState<PersonaId | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Converter PERSONAS object para array
  const personasArray = Object.values(PERSONAS);

  const handlePersonaClick = (personaId: PersonaId) => {
    setSelectedPersona(personaId);
    setIsModalOpen(true);
  };

  const handleConsult = () => {
    if (selectedPersona && onConsultPersona) {
      onConsultPersona(selectedPersona);
      setIsModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPersona(null), 300); // Delay para animação
  };

  const selectedPersonaData = selectedPersona ? PERSONAS[selectedPersona] : null;

  return (
    <>
      {/* Grid de Personas */}
      <div className={`team-panel ${className}`}>
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
            Equipe Virtual
          </h2>
          <p className="text-base text-[#6B6B6B]">
            8 especialistas C-Level prontos para te ajudar
          </p>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {personasArray.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              onClick={() => handlePersonaClick(persona.id)}
              selected={selectedPersona === persona.id}
            />
          ))}
        </div>
      </div>

      {/* Modal de Detalhes */}
      {isModalOpen && selectedPersonaData && (
        <PersonaModal
          persona={selectedPersonaData}
          onClose={handleCloseModal}
          onConsult={handleConsult}
        />
      )}
    </>
  );
};

/* ============================================
   PERSONA CARD
   ============================================ */

interface PersonaCardProps {
  persona: CLevelPersona;
  onClick: () => void;
  selected: boolean;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ persona, onClick, selected }) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative
        bg-[#FFFFFF]
        rounded-[16px]
        p-5
        border-2
        transition-all
        duration-200
        text-left
        w-full
        hover:translate-y-[-2px]
        hover:shadow-lg
        focus:outline-none
        focus:ring-2
        focus:ring-[#FFC738]
        focus:ring-offset-2
        ${
          selected
            ? 'border-[#FFC738] bg-[#FFF9E6] shadow-accent'
            : 'border-[#E8E5DD] shadow-md'
        }
      `}
    >
      {/* Ícone */}
      <div className="flex items-center justify-center w-12 h-12 mb-3 text-2xl">
        {persona.icon}
      </div>

      {/* Nome */}
      <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">{persona.name}</h3>

      {/* Label */}
      <p className="text-sm font-medium text-[#6B6B6B] mb-2">{persona.label}</p>

      {/* Missão (truncada) */}
      <p className="text-xs text-[#A8A8A8] line-clamp-2">{persona.mission}</p>

      {/* Indicador de cor */}
      <div
        className="absolute top-3 right-3 w-3 h-3 rounded-full"
        style={{ backgroundColor: persona.color }}
        aria-label={`Cor: ${persona.color}`}
      />
    </button>
  );
};

/* ============================================
   PERSONA MODAL
   ============================================ */

interface PersonaModalProps {
  persona: CLevelPersona;
  onClose: () => void;
  onConsult: () => void;
}

const PersonaModal: React.FC<PersonaModalProps> = ({ persona, onClose, onConsult }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000] bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-[#FFFFFF] rounded-[24px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 border-b border-[#E8E5DD]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Ícone Grande */}
              <div className="flex items-center justify-center w-20 h-20 text-5xl">
                {persona.icon}
              </div>

              <div>
                <h2 className="text-3xl font-bold text-[#1A1A1A] mb-1">
                  {persona.name}
                </h2>
                <p className="text-lg text-[#6B6B6B]">{persona.fullTitle}</p>
              </div>
            </div>

            {/* Botão Fechar */}
            <button
              onClick={onClose}
              className="text-[#6B6B6B] hover:text-[#1A1A1A] transition p-2"
              aria-label="Fechar modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Missão */}
          <p className="mt-4 text-base text-[#1A1A1A] font-medium">
            {persona.mission}
          </p>
        </div>

        {/* Conteúdo */}
        <div className="p-8 space-y-6">
          {/* Expertise */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6B6B6B] mb-3">
              Expertise
            </h3>
            <div className="flex flex-wrap gap-2">
              {persona.expertise.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-[#F8F6F1] text-[#1A1A1A] text-sm font-medium rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* KPIs */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6B6B6B] mb-3">
              KPIs de Foco (90 dias)
            </h3>
            <ul className="space-y-2">
              {persona.kpis.map((kpi, index) => (
                <li key={index} className="flex items-start gap-2 text-[#1A1A1A]">
                  <span className="text-[#FFC738] mt-1">●</span>
                  <span>{kpi}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tom */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6B6B6B] mb-2">
              Tom de Comunicação
            </h3>
            <p className="text-[#1A1A1A] italic">"{persona.tone}"</p>
          </div>

          {/* Descrição */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6B6B6B] mb-2">
              Sobre
            </h3>
            <p className="text-[#1A1A1A] leading-relaxed">{persona.description}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-[#E8E5DD] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-[#F5F5F5] text-[#1A1A1A] font-semibold rounded-[12px] hover:bg-[#EBEBEB] transition"
          >
            Fechar
          </button>
          <button
            onClick={onConsult}
            className="flex-1 px-6 py-3 bg-[#FFD400] text-[#000000] font-semibold rounded-[12px] hover:bg-[#FFBE00] hover:shadow-accent transition hover:translate-y-[-1px]"
          >
            Consultar {persona.name}
          </button>
        </div>
      </div>
    </div>
  );
};

TeamPanel.displayName = 'TeamPanel';
