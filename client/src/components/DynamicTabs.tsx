import { useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
  content: ReactNode;
  disabled?: boolean;
}

interface DynamicTabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: "default" | "pills" | "underline" | "cards";
  className?: string;
  contentClassName?: string;
}

/**
 * Componente de Tabs dinâmicas com múltiplas variantes visuais
 * - default: tabs tradicionais com borda inferior
 * - pills: tabs em formato de pílulas
 * - underline: apenas linha inferior
 * - cards: tabs em formato de cards
 */
export function DynamicTabs({
  tabs,
  defaultTab,
  onChange,
  variant = "default",
  className,
  contentClassName,
}: DynamicTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeContent = tabs.find(tab => tab.id === activeTab)?.content;

  const tabStyles = {
    default: {
      container: "border-b border-border",
      tab: "px-4 py-3 text-sm font-medium transition-colors relative",
      active: "text-primary",
      inactive: "text-muted-foreground hover:text-foreground",
      indicator: "absolute bottom-0 left-0 right-0 h-0.5 bg-primary",
    },
    pills: {
      container: "bg-muted p-1 rounded-lg inline-flex",
      tab: "px-4 py-2 text-sm font-medium rounded-md transition-all",
      active: "bg-background text-foreground shadow-sm",
      inactive: "text-muted-foreground hover:text-foreground",
      indicator: "",
    },
    underline: {
      container: "border-b border-border",
      tab: "px-4 py-3 text-sm font-medium transition-colors relative",
      active: "text-primary",
      inactive: "text-muted-foreground hover:text-foreground",
      indicator: "absolute bottom-0 left-0 right-0 h-0.5 bg-primary",
    },
    cards: {
      container: "flex gap-2",
      tab: "px-4 py-3 text-sm font-medium rounded-lg border transition-all",
      active: "bg-primary text-primary-foreground border-primary",
      inactive: "bg-card text-card-foreground border-border hover:border-primary/50",
      indicator: "",
    },
  };

  const styles = tabStyles[variant];

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className={cn("flex", styles.container)}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              styles.tab,
              activeTab === tab.id ? styles.active : styles.inactive,
              tab.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && (
                <span className={cn(
                  "px-1.5 py-0.5 text-xs rounded-full",
                  activeTab === tab.id
                    ? "bg-white/20"
                    : "bg-muted text-muted-foreground"
                )}>
                  {tab.badge}
                </span>
              )}
            </span>
            
            {/* Indicator for default/underline variants */}
            {(variant === "default" || variant === "underline") && activeTab === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                className={styles.indicator}
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn("mt-4", contentClassName)}
        >
          {activeContent}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * Componente de Tabs verticais para sidebars
 */
interface VerticalTabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export function VerticalTabs({
  tabs,
  defaultTab,
  onChange,
  className,
}: VerticalTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={cn("flex gap-6", className)}>
      {/* Vertical Tab List */}
      <div className="flex flex-col gap-1 min-w-[200px]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              "px-4 py-3 text-sm font-medium rounded-lg text-left transition-all flex items-center gap-3",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              tab.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {tab.icon}
            <span className="flex-1">{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={cn(
                "px-2 py-0.5 text-xs rounded-full",
                activeTab === tab.id
                  ? "bg-white/20"
                  : "bg-muted"
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeContent}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default DynamicTabs;
