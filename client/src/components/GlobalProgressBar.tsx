import { motion } from "framer-motion";
import { CheckCircle2, Circle, Target } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function GlobalProgressBar() {
  const { data: stats } = trpc.stats.overview.useQuery();
  const { data: todayTasks } = trpc.tasks.getToday.useQuery();

  if (!todayTasks || todayTasks.length === 0) {
    return null;
  }

  const completedToday = todayTasks.filter(t => t.completedAt).length;
  const totalToday = todayTasks.length;
  const progress = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  // Cores baseadas no progresso
  const getProgressColor = () => {
    if (progress >= 100) return "from-green-500 to-emerald-500";
    if (progress >= 66) return "from-blue-500 to-indigo-500";
    if (progress >= 33) return "from-yellow-500 to-orange-500";
    return "from-gray-400 to-gray-500";
  };

  const getMessage = () => {
    if (progress >= 100) return "🎉 Dia completo!";
    if (progress >= 66) return "Quase lá!";
    if (progress >= 33) return "Bom progresso!";
    if (progress > 0) return "Continue assim!";
    return "Comece sua primeira tarefa";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-2"
    >
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        {/* Ícone e texto */}
        <div className="flex items-center gap-2 min-w-fit">
          <Target className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Hoje
          </span>
        </div>

        {/* Barra de progresso */}
        <div className="flex-1 relative h-2">
          <div className="h-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full`}
            />
          </div>
        </div>

        {/* Contador e mensagem */}
        <div className="flex items-center gap-3 min-w-fit">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {completedToday}/{totalToday}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-300 hidden sm:inline">
            {getMessage()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
