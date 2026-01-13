import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface StreakBadgeProps {
  showAnimation?: boolean;
}

export default function StreakBadge({ showAnimation = false }: StreakBadgeProps) {
  const { data: streak, isLoading } = trpc.streaks.getStreak.useQuery();
  const [showCelebration, setShowCelebration] = useState(false);

  // Mostrar celebração a cada 7 dias de streak
  useEffect(() => {
    if (streak && streak.currentStreak > 0 && streak.currentStreak % 7 === 0 && showAnimation) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [streak?.currentStreak, showAnimation]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-full">
        <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
        <span className="text-sm font-medium text-orange-600 dark:text-orange-400">...</span>
      </div>
    );
  }

  const currentStreak = streak?.currentStreak ?? 0;
  
  // Cor baseada no tamanho do streak
  const getStreakColor = () => {
    if (currentStreak >= 30) return "text-red-500";
    if (currentStreak >= 14) return "text-orange-500";
    if (currentStreak >= 7) return "text-yellow-500";
    return "text-orange-400";
  };

  const getBgColor = () => {
    if (currentStreak >= 30) return "bg-red-50 dark:bg-red-900/20";
    if (currentStreak >= 14) return "bg-orange-50 dark:bg-orange-900/20";
    if (currentStreak >= 7) return "bg-yellow-50 dark:bg-yellow-900/20";
    return "bg-orange-50 dark:bg-orange-900/20";
  };

  return (
    <div className="relative">
      <motion.div 
        className={`flex items-center gap-1.5 px-3 py-1.5 ${getBgColor()} rounded-full cursor-default`}
        whileHover={{ scale: 1.05 }}
        title={`Streak atual: ${currentStreak} dias\nMaior streak: ${streak?.longestStreak ?? 0} dias`}
      >
        <motion.div
          animate={currentStreak > 0 ? { 
            scale: [1, 1.2, 1],
            rotate: [0, -5, 5, 0]
          } : {}}
          transition={{ 
            duration: 0.5, 
            repeat: currentStreak > 0 ? Infinity : 0, 
            repeatDelay: 2 
          }}
        >
          <Flame className={`w-4 h-4 ${getStreakColor()}`} />
        </motion.div>
        <span className={`text-sm font-semibold ${getStreakColor()}`}>
          {currentStreak}
        </span>
      </motion.div>

      {/* Celebração a cada 7 dias */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -40, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.8 }}
            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              🔥 {currentStreak} dias! Incrível!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
