import { motion } from "framer-motion";
import { Check, X, AlertCircle } from "lucide-react";

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
  const getImportanceStyles = (importance: string, asked: boolean) => {
    if (asked) {
      return {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        icon: "text-emerald-500",
        label: "bg-emerald-500/20 text-emerald-400"
      };
    }
    
    switch (importance) {
      case "critical":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          icon: "text-red-500",
          label: "bg-red-500/20 text-red-400"
        };
      case "helpful":
        return {
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/30",
          icon: "text-yellow-500",
          label: "bg-yellow-500/20 text-yellow-400"
        };
      default:
        return {
          bg: "bg-gray-500/10",
          border: "border-gray-500/30",
          icon: "text-gray-500",
          label: "bg-gray-500/20 text-gray-400"
        };
    }
  };

  const askedClues = clues.filter(c => c.asked);
  const missedClues = clues.filter(c => !c.asked);

  return (
    <div className="bg-[#1c1c1f] rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Key Symptoms Checklist</h3>
      </div>
      
      <div className="flex gap-4 mb-4 text-xs">
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
              <Check className={`w-4 h-4 flex-shrink-0 ${styles.icon}`} />
              <span className="text-sm flex-1">{clue.text}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${styles.label}`}>
                Asked
              </span>
            </motion.div>
          );
        })}
        
        {missedClues.length > 0 && askedClues.length > 0 && (
          <div className="border-t border-white/10 my-3 pt-3">
            <span className="text-xs text-muted-foreground">Missed Symptoms</span>
          </div>
        )}
        
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
              <X className={`w-4 h-4 flex-shrink-0 ${styles.icon}`} />
              <span className="text-sm flex-1">{clue.text}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${styles.label}`}>
                {clue.importance}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
