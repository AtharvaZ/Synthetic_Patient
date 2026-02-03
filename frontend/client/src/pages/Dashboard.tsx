import { Link } from "wouter";
import { useCases } from "@/hooks/use-cases";
import { 
  Flame, Trophy, Target, Stethoscope, ArrowRight, 
  GraduationCap, BookOpen, ChevronRight, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: cases, isLoading } = useCases();

  const beginnerCases = cases?.filter(c => c.difficulty === "Beginner") || [];
  const intermediateCases = cases?.filter(c => c.difficulty === "Intermediate") || [];
  const advancedCases = cases?.filter(c => c.difficulty === "Advanced") || [];

  const stats = {
    streak: 5,
    casesSolved: 12,
    accuracy: 78,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      <header className="sticky top-0 z-50 w-full border-b border-[#283039] bg-[#0a0a0c]/80 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-gradient-to-br from-[#137fec] to-teal-500 rounded flex items-center justify-center text-white">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">CaseLab</h2>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <span className="text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                <Home className="w-4 h-4" />
                Home
              </span>
            </Link>
            <Link href="/quiz">
              <Button className="bg-gradient-to-r from-[#137fec] to-teal-500 hover:opacity-90 text-white px-5 py-2 rounded-lg text-sm font-bold">
                Start Quiz
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
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
                <p className="text-3xl font-bold text-orange-400">{stats.streak}</p>
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
                <p className="text-3xl font-bold text-emerald-400">{stats.casesSolved}</p>
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
                <p className="text-3xl font-bold text-[#137fec]">{stats.accuracy}%</p>
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
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/quiz?difficulty=Beginner">
              <div className="group bg-[#161618] hover:bg-[#1a1a1d] rounded-2xl p-6 border border-[#283039] hover:border-green-500/30 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Beginner</h3>
                      <p className="text-sm text-slate-400">{beginnerCases.length} cases</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-green-500 transition-colors" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 bg-[#283039] rounded-full overflow-hidden">
                    <div className="h-full w-1/4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                  </div>
                  <span className="text-xs text-slate-500">0/{beginnerCases.length}</span>
                </div>
              </div>
            </Link>

            <Link href="/quiz?difficulty=Intermediate">
              <div className="group bg-[#161618] hover:bg-[#1a1a1d] rounded-2xl p-6 border border-[#283039] hover:border-yellow-500/30 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Intermediate</h3>
                      <p className="text-sm text-slate-400">{intermediateCases.length} cases</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-yellow-500 transition-colors" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 bg-[#283039] rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" />
                  </div>
                  <span className="text-xs text-slate-500">0/{intermediateCases.length}</span>
                </div>
              </div>
            </Link>

            <Link href="/quiz?difficulty=Advanced">
              <div className="group bg-[#161618] hover:bg-[#1a1a1d] rounded-2xl p-6 border border-[#283039] hover:border-red-500/30 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Advanced</h3>
                      <p className="text-sm text-slate-400">{advancedCases.length} cases</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-red-500 transition-colors" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 bg-[#283039] rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full" />
                  </div>
                  <span className="text-xs text-slate-500">0/{advancedCases.length}</span>
                </div>
              </div>
            </Link>
          </div>
        )}

        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-[#137fec]/10 via-teal-500/10 to-cyan-500/10 border border-[#283039]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#137fec] to-teal-500 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Real-World Clinical Data</h3>
              <p className="text-sm text-slate-400">All cases are based on validated medical scenarios used in clinical training</p>
            </div>
            <Link href="/quiz">
              <Button className="bg-gradient-to-r from-[#137fec] to-teal-500 hover:opacity-90">
                Continue Learning
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
