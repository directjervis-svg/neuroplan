import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import BarkleyPlannerModal from './BarkleyPlannerModal';
import { Sparkles, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

/**
 * Barkley Planner Floating Action Button
 * 
 * A floating button that opens the Barkley Planner modal
 * Positioned in the bottom-right corner of the screen
 */
export default function BarkleyPlannerFAB() {
  const [open, setOpen] = useState(false);
  const createProjectMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      toast.success('Projeto criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar projeto: ' + error.message);
    },
  });

  const handleCycleCreated = async (cycleData: any) => {
    try {
      // Create a new project with the generated cycle data
      await createProjectMutation.mutateAsync({
        title: cycleData.projectTitle,
        description: cycleData.projectDescription,
        status: 'ACTIVE',
      });

      setOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 z-40 group"
        title="Gerar novo ciclo com IA"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--neuro-orange-primary)] to-[var(--neuro-blue-primary)] opacity-0 group-hover:opacity-100 transition-opacity blur-lg" />
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[var(--neuro-orange-primary)] to-[var(--neuro-blue-primary)] flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
      </button>

      {/* Tooltip */}
      <div className="fixed bottom-24 right-8 z-40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
          Gerar ciclo com IA
          <div className="absolute bottom-0 right-4 transform translate-y-full">
            <div className="border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      </div>

      {/* Modal */}
      <BarkleyPlannerModal
        open={open}
        onOpenChange={setOpen}
        onCycleCreated={handleCycleCreated}
      />
    </>
  );
}
