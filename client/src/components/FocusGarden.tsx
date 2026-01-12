import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sprout, Flower2, Trees } from "lucide-react";

interface FocusGardenProps {
  completedCycles: number;
}

/**
 * Jardim do Foco - Visualização de progresso gamificado
 * Baseado no design minimalista do NotebookLM
 */
export default function FocusGarden({ completedCycles }: FocusGardenProps) {
  const [plants, setPlants] = useState<Array<{ id: number; stage: number }>>([]);

  useEffect(() => {
    // Cada ciclo completo = 1 planta
    const newPlants = Array.from({ length: Math.min(completedCycles, 12) }, (_, i) => ({
      id: i,
      stage: Math.min(Math.floor(i / 3) + 1, 3), // 3 estágios: semente, broto, flor
    }));
    setPlants(newPlants);
  }, [completedCycles]);

  const getPlantIcon = (stage: number) => {
    switch (stage) {
      case 1:
        return <Sprout className="w-8 h-8 text-green-400" />;
      case 2:
        return <Flower2 className="w-10 h-10 text-green-500" />;
      case 3:
        return <Trees className="w-12 h-12 text-green-600" />;
      default:
        return <Sprout className="w-8 h-8 text-gray-300" />;
    }
  };

  return (
    <div className="bg-gradient-to-b from-green-50 to-white rounded-2xl p-8 shadow-sm border border-green-100">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Seu Jardim do Foco</h3>
        <p className="text-gray-600">
          {completedCycles === 0
            ? "Complete seu primeiro ciclo para plantar sua primeira semente!"
            : `${completedCycles} ciclo${completedCycles > 1 ? "s" : ""} completado${completedCycles > 1 ? "s" : ""}. Continue cultivando!`}
        </p>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-6 gap-4 min-h-[200px] items-end">
        {plants.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
            <Sprout className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-sm">Seu jardim está esperando...</p>
          </div>
        ) : (
          plants.map((plant, index) => (
            <motion.div
              key={plant.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
              className="flex flex-col items-center"
            >
              {getPlantIcon(plant.stage)}
              <div className="w-full h-2 bg-green-200 rounded-full mt-2"></div>
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 italic">
          💡 Dica: Ciclos não concluídos não matam suas plantas, elas apenas esperam por você.
        </p>
      </div>
    </div>
  );
}
