import { Link, useLocation } from "wouter";
import { useCases, useUserStats, useCompletedCases } from "@/hooks/use-cases";
import { 
  Flame, Trophy, Target, Stethoscope, ArrowRight, 
  GraduationCap, BookOpen, ChevronRight, Home, Check, Sun, Moon, Shuffle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

export default function Dashboard() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [, navigate] = useLocation();
  const { data: cases, isLoading } = useCases();
  const { data: stats } = useUserStats();
  const { data: completedCases } = useCompletedCases();

  const completedSet = new Set(completedCases || []);

  const beginnerCases = cases?.filter(c => c.difficulty === "Beginner") || [];
  const intermediateCases = cases?.filter(c => c.difficulty === "Intermediate") || [];
  const advancedCases = cases?.filter(c => c.difficulty === "Advanced") || [];

  const beginnerCompleted = beginnerCases.filter(c => completedSet.has(c.id)).length;
  const intermediateCompleted = intermediateCases.filter(c => completedSet.has(c.id)).length;
  const advancedCompleted = advancedCases.filter(c => completedSet.has(c.id)).length;

  const userStats = stats || { streak: 0, casesSolved: 0, accuracy: 0 };

  const handleStartCase = async (difficulty: string) => {
    let targetCases: typeof cases = [];
    
    if (difficulty === "Random") {
      // Get all unsolved cases first, or all cases if all are solved
      const allCases = cases || [];
      const unsolvedCases = allCases.filter(c => !completedSet.has(c.id));
      targetCases = unsolvedCases.length > 0 ? unsolvedCases : allCases;
    } else {
      targetCases = cases?.filter(c => c.difficulty === difficulty) || [];
    }
    
    // For Random, pick a random case; for specific difficulty, pick first unsolved or first
    let selectedCase;
    if (difficulty === "Random") {
      const randomIndex = Math.floor(Math.random() * targetCases.length);
      selectedCase = targetCases[randomIndex];
    } else {
      selectedCase = targetCases.find(c => !completedSet.has(c.id)) || targetCases[0];
    }
    
    if (selectedCase) {
      navigate(`/chat/${selectedCase.id}`);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-[#0a0a0c] text-white" : "bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900"} transition-colors duration-300`}>
      <header className={`sticky top-0 z-50 w-full border-b ${isDarkMode ? "border-[#283039] bg-[#0a0a0c]/80" : "border-slate-200 bg-white/80"} backdrop-blur-md`}>
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-gradient-to-br from-[#137fec] to-teal-500 rounded flex items-center justify-center text-white">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">ClinIQ</h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? "hover:bg-white/10" : "hover:bg-slate-100"}`}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>
            <Link href="/">
              <span className={`text-sm font-medium ${isDarkMode ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"} transition-colors cursor-pointer flex items-center gap-1`}>
                <Home className="w-4 h-4" />
                Home
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
          <p className="text-slate-400">Track your progress and continue learning</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl p-6 border border-orange-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Day Streak</p>
                <p className="text-3xl font-bold text-orange-400">{userStats.streak}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">Keep practicing daily!</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-6 border border-emerald-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Cases Solved</p>
                <p className="text-3xl font-bold text-emerald-400">{userStats.casesSolved}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">Great progress!</p>
          </div>

          <div className="bg-gradient-to-br from-[#137fec]/10 to-cyan-500/10 rounded-2xl p-6 border border-[#137fec]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#137fec] to-cyan-500 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Accuracy</p>
                <p className="text-3xl font-bold text-[#137fec]">{userStats.accuracy}%</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">Diagnostic accuracy</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Cases by Difficulty</h2>
        
        {isLoading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#137fec] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-6">
            <div 
              onClick={() => handleStartCase("Beginner")}
              className={`group rounded-2xl p-6 border transition-all cursor-pointer ${
                isDarkMode 
                  ? "bg-[#161618] hover:bg-[#1a1a1d] border-[#283039] hover:border-green-500/30" 
                  : "bg-white hover:bg-slate-50 border-slate-200 hover:border-green-500/50 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Beginner</h3>
                    <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{beginnerCases.length} cases</p>
                  </div>
                </div>
                {beginnerCompleted === beginnerCases.length && beginnerCases.length > 0 ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <ChevronRight className={`w-5 h-5 ${isDarkMode ? "text-slate-500" : "text-slate-400"} group-hover:text-green-500 transition-colors`} />
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 flex-1 rounded-full overflow-hidden ${isDarkMode ? "bg-[#283039]" : "bg-slate-200"}`}>
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: beginnerCases.length > 0 ? `${(beginnerCompleted / beginnerCases.length) * 100}%` : '0%' }}
                  />
                </div>
                <span className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>{beginnerCompleted}/{beginnerCases.length}</span>
              </div>
            </div>

            <div 
              onClick={() => handleStartCase("Intermediate")}
              className={`group rounded-2xl p-6 border transition-all cursor-pointer ${
                isDarkMode 
                  ? "bg-[#161618] hover:bg-[#1a1a1d] border-[#283039] hover:border-yellow-500/30" 
                  : "bg-white hover:bg-slate-50 border-slate-200 hover:border-yellow-500/50 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Intermediate</h3>
                    <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{intermediateCases.length} cases</p>
                  </div>
                </div>
                {intermediateCompleted === intermediateCases.length && intermediateCases.length > 0 ? (
                  <Check className="w-5 h-5 text-yellow-500" />
                ) : (
                  <ChevronRight className={`w-5 h-5 ${isDarkMode ? "text-slate-500" : "text-slate-400"} group-hover:text-yellow-500 transition-colors`} />
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 flex-1 rounded-full overflow-hidden ${isDarkMode ? "bg-[#283039]" : "bg-slate-200"}`}>
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500" 
                    style={{ width: intermediateCases.length > 0 ? `${(intermediateCompleted / intermediateCases.length) * 100}%` : '0%' }}
                  />
                </div>
                <span className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>{intermediateCompleted}/{intermediateCases.length}</span>
              </div>
            </div>

            <div 
              onClick={() => handleStartCase("Advanced")}
              className={`group rounded-2xl p-6 border transition-all cursor-pointer ${
                isDarkMode 
                  ? "bg-[#161618] hover:bg-[#1a1a1d] border-[#283039] hover:border-red-500/30" 
                  : "bg-white hover:bg-slate-50 border-slate-200 hover:border-red-500/50 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Advanced</h3>
                    <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{advancedCases.length} cases</p>
                  </div>
                </div>
                {advancedCompleted === advancedCases.length && advancedCases.length > 0 ? (
                  <Check className="w-5 h-5 text-red-500" />
                ) : (
                  <ChevronRight className={`w-5 h-5 ${isDarkMode ? "text-slate-500" : "text-slate-400"} group-hover:text-red-500 transition-colors`} />
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 flex-1 rounded-full overflow-hidden ${isDarkMode ? "bg-[#283039]" : "bg-slate-200"}`}>
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full transition-all duration-500" 
                    style={{ width: advancedCases.length > 0 ? `${(advancedCompleted / advancedCases.length) * 100}%` : '0%' }}
                  />
                </div>
                <span className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>{advancedCompleted}/{advancedCases.length}</span>
              </div>
            </div>

            <div 
              onClick={() => handleStartCase("Random")}
              className={`group rounded-2xl p-6 border transition-all cursor-pointer ${
                isDarkMode 
                  ? "bg-[#161618] hover:bg-[#1a1a1d] border-[#283039] hover:border-purple-500/30" 
                  : "bg-white hover:bg-slate-50 border-slate-200 hover:border-purple-500/50 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Shuffle className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Random</h3>
                    <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{cases?.length || 0} cases</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 ${isDarkMode ? "text-slate-500" : "text-slate-400"} group-hover:text-purple-500 transition-colors`} />
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 flex-1 rounded-full overflow-hidden ${isDarkMode ? "bg-[#283039]" : "bg-slate-200"}`}>
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" 
                    style={{ width: cases?.length ? `${(completedCases?.length || 0) / cases.length * 100}%` : '0%' }}
                  />
                </div>
                <span className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>{completedCases?.length || 0}/{cases?.length || 0}</span>
              </div>
            </div>
          </div>
        )}

        <div className={`mt-12 p-6 rounded-2xl bg-gradient-to-r from-[#137fec]/10 via-teal-500/10 to-cyan-500/10 border ${isDarkMode ? "border-[#283039]" : "border-slate-200"}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#137fec] to-teal-500 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Real-World Clinical Data</h3>
              <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>All cases are based on validated medical scenarios used in clinical training</p>
            </div>
            <Button 
              onClick={() => handleStartCase("Random")}
              className="bg-gradient-to-r from-[#137fec] to-teal-500 hover:opacity-90"
            >
              Continue Learning
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
