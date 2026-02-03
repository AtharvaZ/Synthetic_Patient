import { useParams, Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Stethoscope,
  RotateCcw,
  ArrowRight,
  LayoutDashboard,
  Sun,
  Moon,
  CheckCircle,
  AlertCircle,
  XCircle,
  BookOpen,
  Sparkles,
  Cpu,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import ScoreRing from "@/components/feedback/ScoreRing";
import DecisionTree, {
  type TreeNode,
} from "@/components/feedback/DecisionTree";
import MissedClues from "@/components/feedback/MissedClues";
import SimilarCases from "@/components/feedback/SimilarCases";
import AIInsight from "@/components/feedback/AIInsight";
import {
  useCase,
  useCases,
  useCompletedCases,
  useSimilarCases,
} from "@/hooks/use-cases";
import { useEffect, useState } from "react";

interface FeedbackData {
  score: number;
  breakdown: {
    correctDiagnosis: number;
    keyQuestions: number;
    rightTests: number;
    timeEfficiency: number;
    ruledOutDifferentials: number;
  };
  decisionTree: TreeNode;
  clues: Array<{
    id: string;
    text: string;
    importance: "critical" | "helpful" | "minor";
    asked: boolean;
  }>;
  insight: {
    summary: string;
    strengths: string[];
    improvements: string[];
    tip: string;
  };
  userDiagnosis: string;
  correctDiagnosis: string;
  result: "correct" | "partial" | "wrong";
  caseId: number;
  source?: {
    isAiGenerated: boolean;
    reason?: string;
  };
}

export default function Feedback() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { chatId } = useParams<{ chatId: string }>();
  const [, navigate] = useLocation();
  const caseId = parseInt(chatId);

  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const { data: caseData } = useCase(caseId);
  const { data: allCases } = useCases();
  const { data: similarCasesData } = useSimilarCases(caseId);
  const { data: completedCases } = useCompletedCases();

  const completedSet = new Set(completedCases || []);

  useEffect(() => {
    const stored = sessionStorage.getItem("lastFeedback");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.caseId === caseId) {
          setFeedbackData({
            score: parsed.feedback.score,
            breakdown: parsed.feedback.breakdown,
            decisionTree: parsed.feedback.decisionTree,
            clues: parsed.feedback.clues,
            insight: parsed.feedback.insight,
            userDiagnosis: parsed.userDiagnosis,
            correctDiagnosis: parsed.correctDiagnosis,
            result: parsed.result,
            caseId: parsed.caseId,
            source: parsed.feedback.source,
          });
        }
      } catch (e) {
        console.error("Failed to parse feedback:", e);
      }
    }
  }, [caseId]);

  const similarCases = similarCasesData || [];

  const handleRetry = () => {
    navigate(`/chat/${caseId}`);
  };

  const handleNextPatient = () => {
    if (!caseData || !allCases) return;

    const unsolvedCases = allCases.filter(
      (c) => c.id !== caseData.id && !completedSet.has(c.id),
    );

    let nextCase;
    if (unsolvedCases.length > 0) {
      const randomIndex = Math.floor(Math.random() * unsolvedCases.length);
      nextCase = unsolvedCases[randomIndex];
    } else {
      const otherCases = allCases.filter((c) => c.id !== caseData.id);
      if (otherCases.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherCases.length);
        nextCase = otherCases[randomIndex];
      }
    }

    if (nextCase) {
      navigate(`/chat/${nextCase.id}`);
    } else {
      navigate("/dashboard");
    }
  };

  if (!feedbackData) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center gap-4 ${isDarkMode ? "bg-[hsl(180,8%,5%)] text-white" : "bg-[hsl(45,25%,97%)] text-slate-900"}`}
      >
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDarkMode ? "bg-white/[0.04]" : "bg-slate-100"}`}
        >
          <Stethoscope
            className={`w-8 h-8 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
          />
        </div>
        <h2 className="text-xl font-semibold">No feedback available</h2>
        <p className={isDarkMode ? "text-slate-500" : "text-slate-500"}>
          Complete a case first to see feedback
        </p>
        <Link href="/dashboard">
          <button className="btn-primary mt-2">Return to Dashboard</button>
        </Link>
      </div>
    );
  }

  const resultConfig = {
    correct: {
      icon: CheckCircle,
      color: isDarkMode ? "text-emerald-400" : "text-emerald-600",
      bg: isDarkMode ? "bg-emerald-500/10" : "bg-emerald-100",
      label: "Correct",
    },
    partial: {
      icon: AlertCircle,
      color: isDarkMode ? "text-amber-400" : "text-amber-600",
      bg: isDarkMode ? "bg-amber-500/10" : "bg-amber-100",
      label: "Partial",
    },
    wrong: {
      icon: XCircle,
      color: isDarkMode ? "text-rose-400" : "text-rose-600",
      bg: isDarkMode ? "bg-rose-500/10" : "bg-rose-100",
      label: "Incorrect",
    },
  };

  const result =
    feedbackData.result && resultConfig[feedbackData.result]
      ? resultConfig[feedbackData.result]
      : resultConfig.wrong;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-[hsl(180,8%,5%)]" : "bg-[hsl(45,25%,97%)]"}`}
    >
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Background glow - centered subtle amber for feedback page */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] ${isDarkMode ? "bg-amber-500/20" : "bg-amber-400/25"}`}
        />
      </div>

      {/* Header */}
      <header
        className={`sticky top-0 z-50 w-full backdrop-blur-xl transition-colors duration-300 ${isDarkMode ? "bg-[hsl(180,8%,5%)]/80 border-b border-white/[0.06]" : "bg-white/80 border-b border-slate-200/80"}`}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard">
            <motion.span
              className={`inline-flex items-center text-sm font-medium transition-colors cursor-pointer ${isDarkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
              whileHover={{ x: -2 }}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Dashboard
            </motion.span>
          </Link>
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
            <div className="flex items-center gap-2">
              <div className="size-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <span
                className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                ClinIQ
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h1
                className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Case Feedback
              </h1>
              {feedbackData.source && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    feedbackData.source.isAiGenerated
                      ? isDarkMode
                        ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                        : "bg-teal-100 text-teal-700 border border-teal-200"
                      : isDarkMode
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-amber-100 text-amber-700 border border-amber-200"
                  }`}
                >
                  {feedbackData.source.isAiGenerated ? (
                    <>
                      <Sparkles className="w-3 h-3" />
                      AI Analysis
                    </>
                  ) : (
                    <>
                      <Cpu className="w-3 h-3" />
                      Auto Analysis
                    </>
                  )}
                </span>
              )}
            </div>
            {caseData && (
              <p className={isDarkMode ? "text-slate-500" : "text-slate-500"}>
                {caseData.title} · {caseData.specialty}
              </p>
            )}
          </div>

          {/* About This Condition */}
          {caseData?.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className={`mb-6 rounded-2xl p-6 ${isDarkMode ? "bg-gradient-to-br from-primary/40 to-emerald-500/40 border border-primary/40" : "bg-gradient-to-br from-primary/30 to-emerald-500/30 border border-primary/45"}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`p-1.5 rounded-lg ${isDarkMode ? "bg-primary/20" : "bg-primary/10"}`}
                >
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <h3
                  className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  About {feedbackData.correctDiagnosis}
                </h3>
              </div>
              <p
                className={`text-sm leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}
              >
                {caseData.description}
              </p>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-5">
              {/* Score Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`rounded-2xl p-6 ${isDarkMode ? "bg-white/[0.02] border border-white/[0.06]" : "bg-white border border-slate-200 shadow-sm"}`}
              >
                <h3
                  className={`text-base font-semibold mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  Your Score
                </h3>
                <ScoreRing
                  score={feedbackData.score}
                  breakdown={feedbackData.breakdown}
                />
                <div className="mt-6 space-y-3">
                  {Object.entries(feedbackData.breakdown).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center text-sm"
                      >
                        <span
                          className={`capitalize ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}
                        >
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span
                          className={`font-medium tabular-nums ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                        >
                          {value}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </motion.div>

              {/* Diagnosis Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`rounded-2xl p-6 ${isDarkMode ? "bg-white/[0.02] border border-white/[0.06]" : "bg-white border border-slate-200 shadow-sm"}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-lg ${result.bg}`}>
                    <result.icon className={`w-4 h-4 ${result.color}`} />
                  </div>
                  <h3
                    className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    Your Diagnosis
                  </h3>
                </div>
                <p className={`text-lg font-medium ${result.color}`}>
                  {feedbackData.userDiagnosis}
                </p>
                {feedbackData.result !== "correct" && (
                  <div
                    className={`mt-4 pt-4 border-t ${isDarkMode ? "border-white/[0.06]" : "border-slate-100"}`}
                  >
                    <p
                      className={`text-xs mb-1 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                    >
                      Correct Answer:
                    </p>
                    <p className={`font-medium ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>
                      {feedbackData.correctDiagnosis}
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-5">
              {/* Decision Tree */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`rounded-2xl p-6 ${isDarkMode ? "bg-white/[0.02] border border-white/[0.06]" : "bg-white border border-slate-200 shadow-sm"}`}
              >
                <h3
                  className={`text-base font-semibold mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  Decision Path
                </h3>
                <DecisionTree
                  tree={feedbackData.decisionTree as TreeNode}
                  userDiagnosis={feedbackData.userDiagnosis}
                  correctDiagnosis={feedbackData.correctDiagnosis}
                />
              </motion.div>

              {/* Key Clues */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`rounded-2xl p-6 ${isDarkMode ? "bg-white/[0.02] border border-white/[0.06]" : "bg-white border border-slate-200 shadow-sm"}`}
              >
                <h3
                  className={`text-base font-semibold mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  Key Clues
                </h3>
                <MissedClues clues={feedbackData.clues} />
              </motion.div>
            </div>
          </div>

          {/* Full-width sections */}
          <div className="mt-6 space-y-5">
            {/* AI Insight */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <AIInsight insight={feedbackData.insight} />
            </motion.div>

            {/* Similar Cases */}
            {similarCases.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <SimilarCases
                  cases={similarCases}
                  completedCaseIds={Array.from(completedSet)}
                  onSelectCase={(id) => navigate(`/chat/${id}`)}
                />
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 flex flex-wrap gap-3 justify-center"
          >
            <motion.button
              onClick={handleRetry}
              className={`h-11 px-5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${isDarkMode ? "bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08]" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </motion.button>
            <motion.button
              onClick={handleNextPatient}
              className="btn-primary h-11 flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Next Patient
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <Link href="/dashboard">
              <motion.button
                className={`h-11 px-5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${isDarkMode ? "bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08]" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
