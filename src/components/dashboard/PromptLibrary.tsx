/**
 * PROMPT LIBRARY COMPONENT
 * NeuroExecução (KNH4)
 *
 * Biblioteca de prompts estruturados com busca e favoritos
 * 22+ prompts organizados por categoria
 *
 * Baseado em: REF-024 (Referências de Design)
 */

import React, { useState, useMemo } from 'react';
import {
  Prompt,
  PromptCategory,
  PROMPT_CATEGORY_LABELS,
  PROMPT_CATEGORY_COLORS,
  SAMPLE_PROMPTS,
} from '@/types';
import { Card } from '@/components/shared';

interface PromptLibraryProps {
  /** Callback quando usar prompt */
  onUsePrompt?: (prompt: Prompt) => void;
  /** Classe CSS adicional */
  className?: string;
}

export const PromptLibrary: React.FC<PromptLibraryProps> = ({
  onUsePrompt,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | 'all'>('all');
  const [favoritedOnly, setFavoritedOnly] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Converter SAMPLE_PROMPTS para prompts completos (mock)
  const allPrompts: Prompt[] = useMemo(() => {
    return SAMPLE_PROMPTS.map((sample) => ({
      ...sample,
      id: sample.id!,
      name: sample.name!,
      description: sample.description!,
      category: sample.category!,
      tags: sample.tags || [],
      content: `# ${sample.name}\n\n${sample.description}\n\n## Instruções\n\n1. Preencha as variáveis abaixo\n2. Execute o prompt\n3. Revise o resultado`,
      variables: sample.variables || [],
      usageCount: sample.usageCount || 0,
      favorited: favorites.has(sample.id!),
      createdAt: new Date(),
      updatedAt: new Date(),
    })) as Prompt[];
  }, [favorites]);

  // Filtrar prompts
  const filteredPrompts = useMemo(() => {
    return allPrompts.filter((prompt) => {
      // Filtro de busca
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          prompt.name.toLowerCase().includes(query) ||
          prompt.description.toLowerCase().includes(query) ||
          prompt.tags.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Filtro de categoria
      if (selectedCategory !== 'all' && prompt.category !== selectedCategory) {
        return false;
      }

      // Filtro de favoritos
      if (favoritedOnly && !favorites.has(prompt.id)) {
        return false;
      }

      return true;
    });
  }, [allPrompts, searchQuery, selectedCategory, favoritedOnly, favorites]);

  const handleToggleFavorite = (promptId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(promptId)) {
        newFavorites.delete(promptId);
      } else {
        newFavorites.add(promptId);
      }
      return newFavorites;
    });
  };

  const handleUsePrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    if (onUsePrompt) {
      onUsePrompt(prompt);
    }
  };

  return (
    <div className={`prompt-library ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
          Biblioteca de Prompts
        </h2>
        <p className="text-base text-[#6B6B6B]">
          {filteredPrompts.length} prompts disponíveis
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-3 pl-12 bg-[#F5F5F5] border-0 rounded-[12px] text-base text-[#1A1A1A] placeholder:text-[#A8A8A8] focus:outline-none focus:bg-[#EBEBEB] focus:ring-2 focus:ring-[#FFC738] transition"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6B6B]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <FilterPill
            label="Todos"
            active={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
          />
          {Object.values(PromptCategory).map((category) => (
            <FilterPill
              key={category}
              label={PROMPT_CATEGORY_LABELS[category]}
              active={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
              color={PROMPT_CATEGORY_COLORS[category]}
            />
          ))}
        </div>

        {/* Favorited Toggle */}
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={favoritedOnly}
            onChange={(e) => setFavoritedOnly(e.target.checked)}
            className="w-5 h-5 rounded border-2 border-[#D4D1C7] text-[#FFD400] focus:ring-2 focus:ring-[#FFC738]"
          />
          <span className="text-sm font-medium text-[#1A1A1A]">
            Apenas favoritos
          </span>
        </label>
      </div>

      {/* Prompts Grid */}
      {filteredPrompts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#6B6B6B] text-lg">Nenhum prompt encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              favorited={favorites.has(prompt.id)}
              onToggleFavorite={() => handleToggleFavorite(prompt.id)}
              onUse={() => handleUsePrompt(prompt)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ============================================
   FILTER PILL
   ============================================ */

interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}

const FilterPill: React.FC<FilterPillProps> = ({ label, active, onClick, color }) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2
        rounded-full
        text-sm font-medium
        transition-all duration-200
        ${
          active
            ? 'bg-[#1A1A1A] text-[#FFFFFF] shadow-md'
            : 'bg-[#FFFFFF] text-[#1A1A1A] border-2 border-[#E8E5DD] hover:border-[#FFC738]'
        }
      `}
    >
      {color && (
        <span
          className="inline-block w-2 h-2 rounded-full mr-2"
          style={{ backgroundColor: color }}
        />
      )}
      {label}
    </button>
  );
};

/* ============================================
   PROMPT CARD
   ============================================ */

interface PromptCardProps {
  prompt: Prompt;
  favorited: boolean;
  onToggleFavorite: () => void;
  onUse: () => void;
}

const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  favorited,
  onToggleFavorite,
  onUse,
}) => {
  const categoryColor = PROMPT_CATEGORY_COLORS[prompt.category];

  return (
    <Card padding="md" hoverable className="relative">
      {/* Category Badge */}
      <div
        className="absolute top-4 right-4 px-2 py-1 rounded-md text-xs font-semibold text-white"
        style={{ backgroundColor: categoryColor }}
      >
        {PROMPT_CATEGORY_LABELS[prompt.category]}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-3 pr-24">
        <div>
          <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">{prompt.name}</h3>
          <p className="text-xs text-[#A8A8A8] font-mono">{prompt.id}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-[#6B6B6B] leading-relaxed mb-4 line-clamp-2">
        {prompt.description}
      </p>

      {/* Tags */}
      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {prompt.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-[#F5F5F5] text-[#6B6B6B] text-xs rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E8E5DD]">
        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-[#A8A8A8]">
          <span>📊 {prompt.usageCount} usos</span>
          {prompt.variables.length > 0 && (
            <span>🔧 {prompt.variables.length} variáveis</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Favorite Button */}
          <button
            onClick={onToggleFavorite}
            className={`
              p-2 rounded-lg transition
              ${
                favorited
                  ? 'text-[#FFD400]'
                  : 'text-[#A8A8A8] hover:text-[#FFD400]'
              }
            `}
            aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <svg className="w-5 h-5" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>

          {/* Use Button */}
          <button
            onClick={onUse}
            className="px-4 py-2 bg-[#FFD400] text-[#000000] text-sm font-semibold rounded-lg hover:bg-[#FFBE00] hover:shadow-accent transition"
          >
            Usar
          </button>
        </div>
      </div>
    </Card>
  );
};

PromptLibrary.displayName = 'PromptLibrary';
