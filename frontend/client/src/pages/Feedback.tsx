import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Stethoscope,
  RotateCcw,
  ArrowRight,
  LayoutDashboard,
  Loader2,
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
import { useChat } from "@/hooks/use-chats";
import {
  useCase,
  useCases,
  useCompletedCases,
  useRetryDiagnosis,
} from "@/hooks/use-cases";

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
}

export default function Feedback() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { chatId } = useParams<{ chatId: string }>();
  const [, navigate] = useLocation();
  const chatIdNum = parseInt(chatId);

  const { data: chat, isLoading: chatLoading } = useChat(chatIdNum);
  const { data: caseData, isLoading: caseLoading } = useCase(chat?.caseId ?? 0);
  const { data: allCases } = useCases();
  const { data: completedCases } = useCompletedCases();
  const retryDiagnosis = useRetryDiagnosis();

  const completedSet = new Set(completedCases || []);

  const {
    data: feedbackData,
    isLoading: feedbackLoading,
    error: feedbackError,
  } = useQuery<FeedbackData, Error & { status?: string }>({
    queryKey: ["feedback", chatIdNum],
    queryFn: async () => {
      const res = await fetch(`/api/feedback/${chatIdNum}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        const error = new Error(
          errorData.message || "Failed to fetch feedback",
        ) as Error & { status?: string };
        error.status = errorData.status;
        throw error;
      }
      return res.json();
    },
    enabled: !!chatIdNum && !chatLoading,
    retry: false,
  });

  const similarCases =
    allCases
      ?.filter(
        (c) => c.specialty === caseData?.specialty && c.id !== caseData?.id,
      )
      .slice(0, 5) || [];

  const handleRetry = async () => {
    await retryDiagnosis.mutateAsync(chatIdNum);
    navigate(`/chat/${chatIdNum}`);
  };

  const handleNextPatient = async () => {
    if (!caseData || !allCases) return;

    // Get all unsolved cases (excluding current case)
    const unsolvedCases = allCases.filter(
      (c) => c.id !== caseData.id && !completedSet.has(c.id),
    );

    // Pick a random case from unsolved, or any random case if all solved
    let nextCase;
    if (unsolvedCases.length > 0) {
      const randomIndex = Math.floor(Math.random() * unsolvedCases.length);
      nextCase = unsolvedCases[randomIndex];
    } else {
      // All cases solved - pick random from all cases except current
      const otherCases = allCases.filter((c) => c.id !== caseData.id);
      if (otherCases.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherCases.length);
        nextCase = otherCases[randomIndex];
      }
    }

    if (nextCase) {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ caseId: nextCase.id }),
      });
      const newChat = await res.json();
      navigate(`/chat/${newChat.id}`);
    } else {
      navigate("/dashboard");
    }
  };

  const handleSelectCase = async (caseId: number) => {
    const res = await fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ caseId }),
    });
    const newChat = await res.json();
    navigate(`/chat/${newChat.id}`);
  };

  if (chatLoading || caseLoading || feedbackLoading) {
    return (
      <div
        className={`min-h-screen ${isDarkMode ? "bg-[#0a0a0c] text-white" : "bg-slate-50 text-slate-900"} flex items-center justify-center`}
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (feedbackError || (!feedbackLoading && !feedbackData)) {
    const isIncomplete = (feedbackError as any)?.status === "incomplete";

    return (
      <div
        className={`min-h-screen ${isDarkMode ? "bg-[#0a0a0c] text-white" : "bg-slate-50 text-slate-900"} flex flex-col items-center justify-center gap-4 p-4`}
      >
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">
            {isIncomplete
              ? "Complete the Case First"
              : "Feedback Not Available"}
          </h2>
          <p
            className={`${isDarkMode ? "text-muted-foreground" : "text-slate-500"} mb-6`}
          >
            {isIncomplete
              ? "You need to submit a diagnosis before viewing feedback."
              : "Unable to load feedback for this case."}
          </p>
          <div className="flex gap-3 justify-center">
            {isIncomplete && (
              <Button
                onClick={() => navigate(`/chat/${chatIdNum}`)}
                className="bg-primary"
              >
                Continue Case
              </Button>
            )}
            <Link href="/dashboard">
              <Button
                variant="outline"
                className={isDarkMode ? "border-white/10 text-white" : ""}
              >
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!feedbackData || !caseData) {
    return null;
  }

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-[#0a0a0c] text-white" : "bg-slate-50 text-slate-900"} transition-colors duration-300`}
    >
      <header
        className={`border-b ${isDarkMode ? "border-white/5 bg-[#161618]" : "border-slate-200 bg-white"} sticky top-0 z-10`}
      >
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className={`inline-flex items-center text-sm ${isDarkMode ? "text-muted-foreground hover:text-white" : "text-slate-500 hover:text-slate-900"} transition-colors`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
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
              <div className="size-8 bg-gradient-to-br from-[#137fec] to-teal-500 rounded flex items-center justify-center text-white">
                <Stethoscope className="w-4 h-4" />
              </div>
              <span className="font-semibold">ClinIQ</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold mb-2">Case Feedback</h1>
          <div className="flex items-center gap-3">
            <h2 className="text-lg text-muted-foreground">{caseData.title}</h2>
            <span className="text-xs font-medium text-primary px-2 py-0.5 rounded-full bg-primary/10">
              {caseData.specialty} · {caseData.difficulty}
            </span>
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ScoreRing
              score={feedbackData.score}
              breakdown={feedbackData.breakdown}
            />
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <DecisionTree
                tree={feedbackData.decisionTree}
                userDiagnosis={feedbackData.userDiagnosis}
                correctDiagnosis={feedbackData.correctDiagnosis}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <MissedClues clues={feedbackData.clues} />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <AIInsight insight={feedbackData.insight} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <SimilarCases
              cases={similarCases}
              completedCaseIds={completedCases || []}
              onSelectCase={handleSelectCase}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 pt-4"
          >
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className={`flex-1 ${isDarkMode ? "border-white/10 text-white hover:bg-white/5" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              onClick={handleRetry}
              variant="outline"
              className={`flex-1 ${isDarkMode ? "border-white/10 text-white hover:bg-white/5" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`}
              disabled={retryDiagnosis.isPending}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry Case
            </Button>
            <Button
              onClick={handleNextPatient}
              className="flex-1 bg-gradient-to-r from-[#137fec] to-teal-500 hover:opacity-90 text-white"
            >
              Next Patient
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
