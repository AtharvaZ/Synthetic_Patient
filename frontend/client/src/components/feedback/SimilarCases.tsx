import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle, Circle, ArrowRight } from "lucide-react";
import { useRef } from "react";
import type { Case } from "@shared/schema";
import { useTheme } from "@/contexts/ThemeContext";

interface SimilarCasesProps {
  cases: Case[];
  completedCaseIds: number[];
  onSelectCase: (caseId: number) => void;
}

export default function SimilarCases({ cases, completedCaseIds, onSelectCase }: SimilarCasesProps) {
  const { isDarkMode } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  if (cases.length === 0) return null;

  return (
    <div className={`rounded-2xl p-6 border ${isDarkMode ? "bg-[#1c1c1f] border-white/10" : "bg-white border-slate-200 shadow-sm"}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Similar Cases to Practice</h3>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-100 hover:bg-slate-200"}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-100 hover:bg-slate-200"}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {cases.map((caseItem, i) => {
          const isCompleted = completedCaseIds.includes(caseItem.id);
          return (
            <motion.div
              key={caseItem.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`flex-shrink-0 w-64 rounded-xl border p-4 transition-colors cursor-pointer group ${
                isDarkMode 
                  ? "bg-[#0a0a0c] border-white/10 hover:border-primary/50" 
                  : "bg-slate-50 border-slate-200 hover:border-primary/50"
              }`}
              onClick={() => onSelectCase(caseItem.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-primary px-2 py-0.5 rounded-full bg-primary/10">
                  {caseItem.specialty}
                </span>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Circle className={`w-4 h-4 ${isDarkMode ? "text-gray-600" : "text-slate-400"}`} />
                )}
              </div>
              
              <h4 className="font-medium text-sm mb-2 line-clamp-2">{caseItem.title}</h4>
              
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground">{caseItem.difficulty}</span>
                <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
