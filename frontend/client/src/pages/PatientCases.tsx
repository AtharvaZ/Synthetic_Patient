import { useLocation, Link } from "wouter";
import { useCases } from "@/hooks/use-cases";
import { getCaseStatus } from "@/lib/localStorage";
import { motion } from "framer-motion";
import { 
  Stethoscope, ArrowRight, BookOpen, GraduationCap, Target,
  Sun, Moon, Home, Shuffle, Play
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useMemo, useState, useEffect } from "react";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

const difficultyConfig: Record<Difficulty, { icon: typeof BookOpen; gradient: string; bgGlow: string }> = {
  Beginner: {
    icon: BookOpen,
    gradient: "from-emerald-500 to-teal-500",
    bgGlow: "bg-emerald-500/20",
  },
  Intermediate: {
    icon: GraduationCap,
    gradient: "from-amber-500 to-orange-500",
    bgGlow: "bg-amber-500/20",
  },
  Advanced: {
    icon: Target,
    gradient: "from-orange-500 to-red-500",
    bgGlow: "bg-orange-500/20",
  },
};

const statusColors = {
  correct: "bg-emerald-500",
  partial: "bg-amber-500",
  wrong: "bg-red-500",
  undiscovered: "bg-slate-500/50",
};

export default function PatientCases() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [location, navigate] = useLocation();
  const { data: cases, isLoading } = useCases();
  
  const getDifficultyFromUrl = (): Difficulty => {
    const params = new URLSearchParams(window.location.search);
    const diff = params.get("difficulty");
    if (diff === "Beginner" || diff === "Intermediate" || diff === "Advanced") {
      return diff;
    }
    return "Beginner";
  };
  
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(getDifficultyFromUrl);
  
  useEffect(() => {
    setSelectedDifficulty(getDifficultyFromUrl());
  }, [location]);
  
  useEffect(() => {
    const handlePopState = () => {
      setSelectedDifficulty(getDifficultyFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const filteredCases = useMemo(() => {
    return cases?.filter(c => c.difficulty === selectedDifficulty) || [];
  }, [cases, selectedDifficulty]);

  const statusCounts = useMemo(() => {
    const counts = { correct: 0, partial: 0, wrong: 0, undiscovered: 0 };
    filteredCases.forEach(c => {
      const status = getCaseStatus(c.id);
      counts[status]++;
    });
    return counts;
  }, [filteredCases]);

  const handleDifficultyChange = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    navigate(`/cases?difficulty=${difficulty}`);
  };

  const handleCaseClick = (caseId: number) => {
    navigate(`/chat/${caseId}`);
  };

  const handleNextAvailable = () => {
    const diffCases = filteredCases;
    const nextCase = diffCases.find(c => {
      const status = getCaseStatus(c.id);
      return status === "undiscovered" || status === "partial" || status === "wrong";
    });
    if (nextCase) {
      navigate(`/chat/${nextCase.id}`);
    } else if (diffCases.length > 0) {
      navigate(`/chat/${diffCases[0].id}`);
    }
  };

  const handleRandomCase = () => {
    const allCases = cases || [];
    if (allCases.length > 0) {
      const randomIndex = Math.floor(Math.random() * allCases.length);
      navigate(`/chat/${allCases[randomIndex].id}`);
    }
  };

  const difficulties: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? "bg-[hsl(180,8%,5%)]" : "bg-[hsl(45,25%,97%)]"}`}>
      <div className="noise-overlay" />
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-20 left-1/4 w-[700px] h-[700px] rounded-full blur-[100px] ${isDarkMode ? "bg-amber-500/20" : "bg-amber-500/12"}`} />
        <div className={`absolute top-1/3 -right-20 w-[500px] h-[500px] rounded-full blur-[100px] ${isDarkMode ? "bg-teal-500/15" : "bg-teal-500/10"}`} />
      </div>

      <header className={`sticky top-0 z-50 w-full backdrop-blur-xl transition-colors duration-300 ${isDarkMode ? "bg-[hsl(180,8%,5%)]/80 border-b border-white/[0.06]" : "bg-white/80 border-b border-slate-200/80"}`}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link href="/">
              <div className="relative cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl blur-lg opacity-50" />
                <div className="relative size-9 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
              </div>
            </Link>
            <span className={`text-xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              ClinIQ
            </span>
          </motion.div>
          
          <div className="flex items-center gap-2">
            <motion.button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all duration-200 ${isDarkMode ? "hover:bg-white/[0.06]" : "hover:bg-slate-100"}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </motion.button>
            <Link href="/dashboard">
              <motion.span
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${isDarkMode ? "text-slate-300 hover:text-white hover:bg-white/[0.06]" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Home className="w-4 h-4" />
                Dashboard
              </motion.span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 relative z-10">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Patient Cases
          </h1>
          <p className={isDarkMode ? "text-slate-500" : "text-slate-500"}>
            Select a case to practice your diagnostic skills
          </p>
        </motion.div>

        <motion.div 
          className="flex flex-wrap gap-3 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {difficulties.map((diff) => {
            const config = difficultyConfig[diff];
            const Icon = config.icon;
            const isActive = selectedDifficulty === diff;
            
            return (
              <button
                key={diff}
                onClick={() => handleDifficultyChange(diff)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg`
                    : isDarkMode
                    ? "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {diff}
              </button>
            );
          })}
        </motion.div>

        <motion.div 
          className="flex flex-wrap gap-3 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={handleNextAvailable}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
          >
            <Play className="w-4 h-4" />
            Next Available
          </button>
          <button
            onClick={handleRandomCase}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
          >
            <Shuffle className="w-4 h-4" />
            Random Case
          </button>
        </motion.div>

        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Correct</span>
              <span className={`font-semibold ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>({statusCounts.correct})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Partial</span>
              <span className={`font-semibold ${isDarkMode ? "text-amber-400" : "text-amber-600"}`}>({statusCounts.partial})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Wrong</span>
              <span className={`font-semibold ${isDarkMode ? "text-red-400" : "text-red-600"}`}>({statusCounts.wrong})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-500/50" />
              <span className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Not Attempted</span>
              <span className={`font-semibold ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>({statusCounts.undiscovered})</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[hsl(168,84%,45%)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCases.map((caseItem, i) => {
              const status = getCaseStatus(caseItem.id);
              const statusColor = statusColors[status];
              
              return (
                <motion.div
                  key={caseItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
                  onClick={() => handleCaseClick(caseItem.id)}
                  className={`group relative rounded-2xl p-5 border cursor-pointer transition-all duration-300 hover-lift overflow-hidden ${
                    isDarkMode 
                      ? "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]" 
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className={`absolute bottom-0 left-0 right-0 h-1 ${statusColor}`} />
                  
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold truncate ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                          {caseItem.title}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                          status === "correct" ? "bg-emerald-500/20 text-emerald-400" :
                          status === "partial" ? "bg-amber-500/20 text-amber-400" :
                          status === "wrong" ? "bg-red-500/20 text-red-400" :
                          isDarkMode ? "bg-slate-500/20 text-slate-400" : "bg-slate-200 text-slate-500"
                        }`}>
                          {status === "correct" ? "Correct" :
                           status === "partial" ? "Partial" :
                           status === "wrong" ? "Wrong" : "Not Attempted"}
                        </span>
                      </div>
                      <p className={`text-sm line-clamp-2 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                        {caseItem.description}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? "bg-white/[0.06] text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                          {caseItem.specialty}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className={`w-5 h-5 flex-shrink-0 transition-all duration-200 ${
                      isDarkMode 
                        ? "text-slate-600 group-hover:text-slate-400" 
                        : "text-slate-300 group-hover:text-slate-500"
                    } group-hover:translate-x-0.5`} />
                  </div>
                </motion.div>
              );
            })}
            
            {filteredCases.length === 0 && (
              <div className={`text-center py-12 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                No cases found for this difficulty level.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
