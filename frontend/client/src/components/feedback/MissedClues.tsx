import { motion } from "framer-motion";
import { Check, X, AlertCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface Clue {
  id: string;
  text: string;
  importance: "critical" | "helpful" | "minor";
  asked: boolean;
}

interface MissedCluesProps {
  clues: Clue[];
}

export default function MissedClues({ clues }: MissedCluesProps) {
  const { isDarkMode } = useTheme();
  
  const getImportanceStyles = (importance: string, asked: boolean) => {
    if (asked) {
      return {
        bg: isDarkMode ? "bg-emerald-500/10" : "bg-emerald-50",
        border: isDarkMode ? "border-emerald-500/30" : "border-emerald-200",
        icon: "text-emerald-500",
        label: isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"
      };
    }
    
    switch (importance) {
      case "critical":
        return {
          bg: isDarkMode ? "bg-red-500/10" : "bg-red-50",
          border: isDarkMode ? "border-red-500/30" : "border-red-200",
          icon: "text-red-500",
          label: isDarkMode ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600"
        };
      case "helpful":
        return {
          bg: isDarkMode ? "bg-yellow-500/10" : "bg-amber-50",
          border: isDarkMode ? "border-yellow-500/30" : "border-amber-200",
          icon: "text-yellow-500",
          label: isDarkMode ? "bg-yellow-500/20 text-yellow-400" : "bg-amber-100 text-amber-600"
        };
      default:
        return {
          bg: isDarkMode ? "bg-gray-500/10" : "bg-slate-50",
          border: isDarkMode ? "border-gray-500/30" : "border-slate-200",
          icon: "text-gray-500",
          label: isDarkMode ? "bg-gray-500/20 text-gray-400" : "bg-slate-100 text-slate-600"
        };
    }
  };

  const askedClues = clues.filter(c => c.asked);
  const missedClues = clues.filter(c => !c.asked);

  return (
    <div className={`rounded-2xl p-6 border ${isDarkMode ? "bg-[#1c1c1f] border-white/10" : "bg-white border-slate-200 shadow-sm"}`}>
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-primary" />
        <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Key Symptoms Checklist</h3>
      </div>
      
      <div className={`flex gap-4 mb-4 text-xs ${isDarkMode ? "" : "text-slate-600"}`}>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" /> Critical
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-500" /> Helpful
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-500" /> Minor
        </span>
      </div>

      <div className="space-y-2">
        {askedClues.map((clue, i) => {
          const styles = getImportanceStyles(clue.importance, clue.asked);
          return (
            <motion.div
              key={clue.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-lg border ${styles.bg} ${styles.border}`}
            >
              <Check className={`w-4 h-4 ${styles.icon}`} />
              <span className={`text-sm flex-1 ${isDarkMode ? "" : "text-slate-700"}`}>{clue.text}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${styles.label}`}>
                {clue.importance}
              </span>
            </motion.div>
          );
        })}
        
        {missedClues.map((clue, i) => {
          const styles = getImportanceStyles(clue.importance, clue.asked);
          return (
            <motion.div
              key={clue.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (askedClues.length + i) * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-lg border ${styles.bg} ${styles.border}`}
            >
              <X className={`w-4 h-4 ${styles.icon}`} />
              <span className={`text-sm flex-1 ${isDarkMode ? "" : "text-slate-700"}`}>{clue.text}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${styles.label}`}>
                {clue.importance}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
