import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ScoreBreakdown {
  correctDiagnosis: number;
  keyQuestions: number;
  rightTests: number;
  timeEfficiency: number;
  ruledOutDifferentials: number;
}

interface ScoreRingProps {
  score: number;
  breakdown: ScoreBreakdown;
}

export default function ScoreRing({ score, breakdown }: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
  
  const getColor = (score: number) => {
    if (score >= 80) return { stroke: "#10b981", bg: "from-emerald-500/20 to-teal-500/20", text: "text-emerald-500" };
    if (score >= 60) return { stroke: "#eab308", bg: "from-yellow-500/20 to-amber-500/20", text: "text-yellow-500" };
    return { stroke: "#ef4444", bg: "from-red-500/20 to-rose-500/20", text: "text-red-500" };
  };
  
  const colors = getColor(score);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const breakdownItems = [
    { label: "Correct diagnosis", points: breakdown.correctDiagnosis, max: 40 },
    { label: "Asked key questions", points: breakdown.keyQuestions, max: 20 },
    { label: "Ordered right tests", points: breakdown.rightTests, max: 20 },
    { label: "Time efficiency", points: breakdown.timeEfficiency, max: 10 },
    { label: "Ruled out differentials", points: breakdown.ruledOutDifferentials, max: 10 },
  ];

  return (
    <div className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-6 border border-white/10`}>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative w-48 h-48 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="12"
            />
            <motion.circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={colors.stroke}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              className={`text-4xl font-bold ${colors.text}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {animatedScore}
            </motion.span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
        </div>

        <div className="flex-1 space-y-3 w-full">
          {breakdownItems.map((item, i) => (
            <motion.div 
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center justify-between"
            >
              <span className="text-sm text-gray-300">{item.label}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: colors.stroke }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.points / item.max) * 100}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                  />
                </div>
                <span className={`text-sm font-medium ${colors.text} w-12 text-right`}>
                  +{item.points}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
