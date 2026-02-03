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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import ScoreRing from "@/components/feedback/ScoreRing";
import DecisionTree, {
  type TreeNode,
} from "@/components/feedback/DecisionTree";
import MissedClues from "@/components/feedback/MissedClues";
import SimilarCases from "@/components/feedback/SimilarCases";
import AIInsight from "@/components/feedback/AIInsight";
import { useCase, useCases, useCompletedCases } from "@/hooks/use-cases";
import { getCompletedCaseIds } from "@/lib/localStorage";
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
}

export default function Feedback() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { chatId } = useParams<{ chatId: string }>();
  const [, navigate] = useLocation();
  const caseId = parseInt(chatId);

  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const { data: caseData } = useCase(caseId);
  const { data: allCases } = useCases();
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
          });
        }
      } catch (e) {
        console.error("Failed to parse feedback:", e);
      }
    }
  }, [caseId]);

  const similarCases =
    allCases
      ?.filter(
        (c) => c.specialty === caseData?.specialty && c.id !== caseData?.id
      )
      .slice(0, 3)
      .map((c) => ({
        id: c.id,
        title: c.title,
        specialty: c.specialty,
        difficulty: c.difficulty,
      })) || [];

  const handleRetry = () => {
    navigate(`/chat/${caseId}`);
  };

  const handleNextPatient = () => {
    if (!caseData || !allCases) return;

    const unsolvedCases = allCases.filter(
      (c) => c.id !== caseData.id && !completedSet.has(c.id)
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
        className={`min-h-screen ${isDarkMode ? "bg-[#0a0a0c] text-white" : "bg-slate-50 text-slate-900"} flex flex-col items-center justify-center gap-4`}
      >
        <h2 className="text-xl font-semibold">No feedback available</h2>
        <p className="text-muted-foreground">Complete a case first to see feedback</p>
        <Link href="/dashboard">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-[#0a0a0c] text-white" : "bg-slate-50 text-slate-900"} transition-colors duration-300`}
    >
      <header
        className={`sticky top-0 z-50 w-full border-b ${isDarkMode ? "border-[#283039] bg-[#0a0a0c]/80" : "border-slate-200 bg-white/80"} backdrop-blur-md`}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className={`inline-flex items-center text-sm ${isDarkMode ? "text-muted-foreground hover:text-white" : "text-slate-500 hover:text-slate-900"} transition-colors`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
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
            <div className="flex items-center gap-3">
              <div className="size-8 bg-gradient-to-br from-[#137fec] to-teal-500 rounded flex items-center justify-center text-white">
                <Stethoscope className="w-4 h-4" />
              </div>
              <span className="font-semibold">ClinIQ</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Case Feedback</h1>
            {caseData && (
              <p className="text-muted-foreground">
                {caseData.title} · {caseData.specialty}
              </p>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div
                className={`${isDarkMode ? "bg-[#161618] border-white/5" : "bg-white border-slate-200"} border rounded-2xl p-6`}
              >
                <h3 className="text-lg font-semibold mb-4">Your Score</h3>
                <ScoreRing score={feedbackData.score} breakdown={feedbackData.breakdown} />
                <div className="mt-6 space-y-3">
                  {Object.entries(feedbackData.breakdown).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span className="font-medium">{value}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div
                className={`${isDarkMode ? "bg-[#161618] border-white/5" : "bg-white border-slate-200"} border rounded-2xl p-6`}
              >
                <h3 className="text-lg font-semibold mb-2">Your Diagnosis</h3>
                <p
                  className={`text-lg ${
                    feedbackData.result === "correct"
                      ? "text-emerald-500"
                      : feedbackData.result === "partial"
                        ? "text-yellow-500"
                        : "text-red-500"
                  }`}
                >
                  {feedbackData.userDiagnosis}
                </p>
                {feedbackData.result !== "correct" && (
                  <>
                    <p className="text-sm text-muted-foreground mt-2">
                      Correct Answer:
                    </p>
                    <p className="text-emerald-500">
                      {feedbackData.correctDiagnosis}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div
                className={`${isDarkMode ? "bg-[#161618] border-white/5" : "bg-white border-slate-200"} border rounded-2xl p-6`}
              >
                <h3 className="text-lg font-semibold mb-4">Decision Path</h3>
                <DecisionTree 
                  tree={feedbackData.decisionTree as TreeNode} 
                  userDiagnosis={feedbackData.userDiagnosis}
                  correctDiagnosis={feedbackData.correctDiagnosis}
                />
              </div>

              <div
                className={`${isDarkMode ? "bg-[#161618] border-white/5" : "bg-white border-slate-200"} border rounded-2xl p-6`}
              >
                <h3 className="text-lg font-semibold mb-4">Key Clues</h3>
                <MissedClues clues={feedbackData.clues} />
              </div>

              <AIInsight insight={feedbackData.insight} />

              {similarCases.length > 0 && (
                <div
                  className={`${isDarkMode ? "bg-[#161618] border-white/5" : "bg-white border-slate-200"} border rounded-2xl p-6`}
                >
                  <h3 className="text-lg font-semibold mb-4">Similar Cases</h3>
                  <SimilarCases 
                    cases={allCases?.filter(c => similarCases.some(sc => sc.id === c.id)) || []} 
                    completedCaseIds={Array.from(completedSet)}
                    onSelectCase={(id) => navigate(`/chat/${id}`)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Button
              onClick={handleRetry}
              variant="outline"
              className={`${isDarkMode ? "border-white/10 text-white hover:bg-white/5" : ""}`}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={handleNextPatient}
              className="bg-gradient-to-r from-[#137fec] to-teal-500 hover:opacity-90 text-white"
            >
              Next Patient
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Link href="/dashboard">
              <Button
                variant="outline"
                className={`${isDarkMode ? "border-white/10 text-white hover:bg-white/5" : ""}`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
