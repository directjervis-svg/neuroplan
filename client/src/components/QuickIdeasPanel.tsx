import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Plus, Check, Trash2, Lightbulb } from 'lucide-react';

interface IdeaItemProps {
  idea: {
    id: number;
    content: string;
    convertedToTask: boolean;
    createdAt: Date;
  };
  onConvert: (id: number) => void;
  onDelete: (id: number) => void;
}

const IdeaItem: React.FC<IdeaItemProps> = ({ idea, onConvert, onDelete }) => {
  const date = new Date(idea.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  return (
    <div className={`flex items-center justify-between p-3 border-b border-gray-200 ${idea.convertedToTask ? 'bg-green-50/50 opacity-70' : 'hover:bg-gray-50'}`}>
      <div className="flex-1 pr-4">
        <p className={`text-sm ${idea.convertedToTask ? 'line-through text-gray-500' : 'text-gray-800'}`}>
          {idea.content}
        </p>
        <span className="text-xs text-gray-400 mt-1 block">{date}</span>
      </div>
      <div className="flex space-x-2">
        {!idea.convertedToTask && (
          <button
            onClick={() => onConvert(idea.id)}
            className="p-1.5 rounded-full text-green-600 hover:bg-green-100 transition duration-150"
            title="Converter para Tarefa"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(idea.id)}
          className="p-1.5 rounded-full text-red-600 hover:bg-red-100 transition duration-150"
          title="Excluir Ideia"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const QuickIdeasPanel: React.FC = () => {
  const [newIdea, setNewIdea] = useState('');
  const { data: ideas, refetch } = trpc.quickIdeas.getIdeas.useQuery();
  
  const createIdeaMutation = trpc.quickIdeas.createIdea.useMutation({
    onSuccess: () => {
      setNewIdea('');
      refetch();
    },
  });

  const convertToTaskMutation = trpc.quickIdeas.convertToTask.useMutation({
    onSuccess: () => {
      refetch();
      // TODO: Adicionar lógica para realmente criar a tarefa no banco aqui
      alert('Ideia marcada como convertida! (A tarefa real deve ser criada manualmente por enquanto)');
    },
  });

  const handleDelete = (id: number) => {
    // TODO: Implementar a mutation de exclusão
    alert(`Excluir ideia ${id} (Ainda não implementado)`);
  };

  const handleCreateIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIdea.trim()) {
      createIdeaMutation.mutate({ content: newIdea });
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
      <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center">
          <Lightbulb className="w-6 h-6 mr-2" />
          Quick Ideas (Captura Rápida)
        </h2>
        <span className="text-sm opacity-80">NeuroExecução</span>
      </div>

      <div className="p-4">
        <form onSubmit={handleCreateIdea} className="mb-4 flex space-x-2">
          <input
            type="text"
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            placeholder="Capture uma ideia rápida antes que ela fuja..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            disabled={createIdeaMutation.isLoading}
          />
          <button
            type="submit"
            className="bg-indigo-500 text-white p-2 rounded-lg hover:bg-indigo-600 transition duration-150 disabled:opacity-50"
            disabled={createIdeaMutation.isLoading || !newIdea.trim()}
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>

        <div className="max-h-96 overflow-y-auto">
          {ideas && ideas.length > 0 ? (
            ideas.map((idea) => (
              <IdeaItem
                key={idea.id}
                idea={idea}
                onConvert={convertToTaskMutation.mutate}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">
              Nenhuma ideia capturada ainda. Use o campo acima!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
