import { Link, useLocation } from "wouter";
import { useCases, useUserStats, useCompletedCases } from "@/hooks/use-cases";
import { motion } from "framer-motion";
import {
  Flame,
  Trophy,
  Target,
  Stethoscope,
  ArrowRight,
  GraduationCap,
  BookOpen,
  ChevronRight,
  Home,
  Check,
  Sun,
  Moon,
  Zap,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Dashboard() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [, navigate] = useLocation();
  const { data: cases, isLoading } = useCases();
  const { data: stats } = useUserStats();
  const { data: completedCases } = useCompletedCases();

  const completedSet = new Set(completedCases || []);

  const beginnerCases = cases?.filter((c) => c.difficulty === "Beginner") || [];
  const intermediateCases =
    cases?.filter((c) => c.difficulty === "Intermediate") || [];
  const advancedCases = cases?.filter((c) => c.difficulty === "Advanced") || [];

  const beginnerCompleted = beginnerCases.filter((c) =>
    completedSet.has(c.id),
  ).length;
  const intermediateCompleted = intermediateCases.filter((c) =>
    completedSet.has(c.id),
  ).length;
  const advancedCompleted = advancedCases.filter((c) =>
    completedSet.has(c.id),
  ).length;

  const userStats = stats || { streak: 0, casesSolved: 0, accuracy: 0 };

  const handleDifficultyClick = (difficulty: string) => {
    navigate(`/cases?difficulty=${difficulty}`);
  };

  const handleContinueLearning = () => {
    const allCases = cases || [];
    const unsolvedCases = allCases.filter((c) => !completedSet.has(c.id));
    const targetCases = unsolvedCases.length > 0 ? unsolvedCases : allCases;

    if (targetCases.length > 0) {
      const randomIndex = Math.floor(Math.random() * targetCases.length);
      navigate(`/chat/${targetCases[randomIndex].id}`);
    }
  };

  const difficultyCards = [
    {
      key: "Beginner",
      icon: BookOpen,
      cases: beginnerCases,
      completed: beginnerCompleted,
      gradient: "from-emerald-500 to-teal-500",
      bgGlow: "bg-emerald-500/20",
      accentColor: "text-emerald-400",
      borderHover: "hover:border-emerald-500/30",
    },
    {
      key: "Intermediate",
      icon: GraduationCap,
      cases: intermediateCases,
      completed: intermediateCompleted,
      gradient: "from-amber-500 to-orange-500",
      bgGlow: "bg-amber-500/20",
      accentColor: "text-amber-400",
      borderHover: "hover:border-amber-500/30",
    },
    {
      key: "Advanced",
      icon: Target,
      cases: advancedCases,
      completed: advancedCompleted,
      gradient: "from-orange-500 to-red-500",
      bgGlow: "bg-orange-500/20",
      accentColor: "text-orange-400",
      borderHover: "hover:border-orange-500/30",
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${isDarkMode ? "bg-[hsl(180,8%,5%)]" : "bg-[hsl(45,25%,97%)]"}`}
    >
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute -top-20 left-1/4 w-[700px] h-[700px] rounded-full blur-[100px] ${isDarkMode ? "bg-amber-500/20" : "bg-amber-500/15"}`}
        />
        <div
          className={`absolute top-1/3 -right-20 w-[500px] h-[500px] rounded-full blur-[100px] ${isDarkMode ? "bg-teal-500/15" : "bg-teal-500/12"}`}
        />
        <div
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[100px] ${isDarkMode ? "bg-purple-500/12" : "bg-purple-500/10"}`}
        />
      </div>

      {/* Header */}
      <header
        className={`sticky top-0 z-50 w-full backdrop-blur-xl transition-colors duration-300 ${isDarkMode ? "bg-[hsl(180,8%,5%)]/80 border-b border-white/[0.06]" : "bg-white/80 border-b border-slate-200/80"}`}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl blur-lg opacity-50" />
              <div className="relative size-9 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
            </div>
            <span
              className={`text-xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
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
            <Link href="/">
              <motion.span
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${isDarkMode ? "text-slate-300 hover:text-white hover:bg-white/[0.06]" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Home className="w-4 h-4" />
                Home
              </motion.span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 relative z-10">
        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Your Dashboard
          </h1>
          <p className={isDarkMode ? "text-slate-500" : "text-slate-500"}>
            Track your progress and continue learning
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {[
            {
              icon: Flame,
              label: "Day Streak",
              value: userStats.streak,
              suffix: "",
              desc:
                userStats.streak > 0
                  ? "Keep it going!"
                  : "Start your streak today!",
              gradient: "from-orange-500 to-rose-500",
              bgGradient: "from-orange-500/10 to-rose-500/10",
              borderColor: "border-orange-500/20",
              valueColor: "text-orange-400",
            },
            {
              icon: Trophy,
              label: "Cases Solved",
              value: userStats.casesSolved,
              suffix: "",
              desc:
                userStats.casesSolved > 0
                  ? "Great progress!"
                  : "Solve your first case!",
              gradient: "from-blue-500 to-indigo-500",
              bgGradient: "from-blue-500/10 to-indigo-500/10",
              borderColor: "border-blue-500/20",
              valueColor: "text-blue-400",
            },
            {
              icon: Target,
              label: "Accuracy",
              value: userStats.accuracy,
              suffix: "%",
              desc: "Diagnostic accuracy",
              gradient: "from-violet-500 to-purple-500",
              bgGradient: "from-violet-500/10 to-purple-500/10",
              borderColor: "border-violet-500/20",
              valueColor: "text-violet-400",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
              className={`relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 hover-lift ${isDarkMode ? `bg-gradient-to-br ${stat.bgGradient} ${stat.borderColor}` : `bg-white ${stat.borderColor} shadow-sm`}`}
            >
              {/* Subtle glow */}
              <div
                className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30 bg-gradient-to-br ${stat.gradient}`}
              />

              <div className="relative flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    {stat.label}
                  </p>
                  <p className={`text-3xl font-bold ${stat.valueColor}`}>
                    {stat.value}
                    {stat.suffix}
                  </p>
                </div>
              </div>
              <p
                className={`mt-4 text-sm ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
              >
                {stat.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Difficulty Cards */}
        <motion.h2
          className={`text-xl font-bold mb-5 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Cases by Difficulty
        </motion.h2>

        {isLoading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[hsl(168,84%,45%)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {difficultyCards.map((card, i) => (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                onClick={() => handleDifficultyClick(card.key)}
                className={`group relative rounded-2xl p-5 border cursor-pointer transition-all duration-300 hover-lift ${isDarkMode ? `bg-white/[0.02] border-white/[0.06] ${card.borderHover}` : `bg-white border-slate-200 ${card.borderHover} shadow-sm hover:shadow-md`}`}
              >
                {/* Hover glow */}
                <div
                  className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${card.bgGlow} blur-xl -z-10`}
                />

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl bg-gradient-to-br ${card.gradient}`}
                    >
                      <card.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                      >
                        {card.key}
                      </h3>
                      <p
                        className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-600"}`}
                      >
                        {card.cases.length} cases
                      </p>
                    </div>
                  </div>
                  {card.completed === card.cases.length &&
                  card.cases.length > 0 ? (
                    <div
                      className={`p-1.5 rounded-full bg-gradient-to-br ${card.gradient}`}
                    >
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <ChevronRight
                      className={`w-5 h-5 transition-all duration-200 ${isDarkMode ? "text-slate-600 group-hover:text-slate-400" : "text-slate-300 group-hover:text-slate-500"} group-hover:translate-x-0.5`}
                    />
                  )}
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <div
                    className={`h-1.5 flex-1 rounded-full overflow-hidden ${isDarkMode ? "bg-white/[0.06]" : "bg-slate-100"}`}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width:
                          card.cases.length > 0
                            ? `${(card.completed / card.cases.length) * 100}%`
                            : "0%",
                      }}
                      transition={{
                        delay: 0.8 + i * 0.1,
                        duration: 0.8,
                        ease: "easeOut",
                      }}
                      className={`h-full rounded-full bg-gradient-to-r ${card.gradient}`}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium tabular-nums ${isDarkMode ? "text-slate-500" : "text-slate-600"}`}
                  >
                    {card.completed}/{card.cases.length}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className={`mt-10 relative overflow-hidden rounded-2xl p-6 ${isDarkMode ? "bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08]" : "bg-white border border-slate-200 shadow-sm"}`}
        >
          {/* Background decoration */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-[hsl(168,84%,45%)]/20 to-[hsl(200,80%,50%)]/20 rounded-full blur-3xl" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(168,84%,45%)] to-[hsl(200,80%,50%)] shadow-lg">
              <Zap className="w-5 h-5 text-[hsl(220,15%,5%)]" />
            </div>
            <div className="flex-1">
              <h3
                className={`font-semibold mb-0.5 ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Real-World Clinical Data
              </h3>
              <p
                className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                All cases are based on validated medical scenarios
              </p>
            </div>
            <button
              onClick={handleContinueLearning}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              Continue Learning
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
