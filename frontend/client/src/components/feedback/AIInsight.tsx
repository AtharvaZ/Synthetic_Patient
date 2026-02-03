import { motion } from "framer-motion";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface AIInsightProps {
  insight: {
    summary: string;
    strengths: string[];
    improvements: string[];
    tip: string;
  };
}

export default function AIInsight({ insight }: AIInsightProps) {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`bg-gradient-to-br from-[#137fec]/10 to-teal-500/10 rounded-2xl p-6 border ${isDarkMode ? "border-primary/20" : "border-[#137fec]/30"}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/20">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">AI Analysis</h3>
      </div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`text-sm mb-6 ${isDarkMode ? "text-gray-300" : "text-slate-600"}`}
      >
        {insight.summary}
      </motion.p>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {insight.strengths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-xl p-4 border ${isDarkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className={`text-sm font-medium ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>Strengths</span>
            </div>
            <ul className="space-y-2">
              {insight.strengths.map((strength, i) => (
                <li key={i} className={`text-xs flex items-start gap-2 ${isDarkMode ? "text-gray-300" : "text-slate-600"}`}>
                  <span className="text-emerald-500 mt-0.5">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {insight.improvements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-xl p-4 border ${isDarkMode ? "bg-yellow-500/10 border-yellow-500/20" : "bg-amber-50 border-amber-200"}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span className={`text-sm font-medium ${isDarkMode ? "text-yellow-400" : "text-amber-600"}`}>Areas to Improve</span>
            </div>
            <ul className="space-y-2">
              {insight.improvements.map((improvement, i) => (
                <li key={i} className={`text-xs flex items-start gap-2 ${isDarkMode ? "text-gray-300" : "text-slate-600"}`}>
                  <span className="text-yellow-500 mt-0.5">•</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`rounded-xl p-4 border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-blue-50 border-blue-200"}`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Quick Tip</span>
        </div>
        <p className={`text-xs ${isDarkMode ? "text-gray-300" : "text-slate-600"}`}>{insight.tip}</p>
      </motion.div>
    </div>
  );
}
