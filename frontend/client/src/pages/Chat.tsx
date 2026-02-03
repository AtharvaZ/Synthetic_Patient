import { useEffect, useRef, useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useCase, useCases } from "@/hooks/use-cases";
import { Button } from "@/components/ui/button";
import {
  Send,
  Loader2,
  ArrowLeft,
  Stethoscope,
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
  RotateCcw,
  ArrowRight,
  MessageSquare,
  Sun,
  Moon,
  User,
  Lightbulb,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { addCompletedCase, getCompletedCaseIds } from "@/lib/localStorage";

interface Message {
  id: number;
  role: "user" | "assistant" | "hint";
  content: string;
}

type DiagnosisResult = "correct" | "partial" | "wrong" | null;

interface FeedbackData {
  result: DiagnosisResult;
  correctDiagnosis: string;
  feedback: {
    score: number;
    breakdown: {
      correctDiagnosis: number;
      keyQuestions: number;
      rightTests: number;
      timeEfficiency: number;
      ruledOutDifferentials: number;
    };
    decisionTree: unknown;
    clues: unknown[];
    insight: {
      summary: string;
      strengths: string[];
      improvements: string[];
      tip: string;
    };
  };
}

export default function Chat() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const caseId = parseInt(id);

  const { data: caseData, isLoading: caseLoading } = useCase(caseId);
  const { data: allCases } = useCases();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showDiagnoseInput, setShowDiagnoseInput] = useState(false);
  const [diagnosisInput, setDiagnosisInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult>(null);
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const completedCaseIds = getCompletedCaseIds();
  const completedSet = new Set(completedCaseIds);

  useEffect(() => {
    if (caseData && messages.length === 0) {
      const chiefComplaint = caseData.chiefComplaint || caseData.title || "I'm feeling not quite right today";
      setMessages([
        {
          id: 1,
          role: "assistant",
          content: `Hello doctor. ${chiefComplaint}`,
        },
      ]);
    }
  }, [caseData, messages.length]);

  const calculateProgress = () => {
    if (!messages.length || !caseData) return 10;

    const allText = messages.map((m) => m.content.toLowerCase()).join(" ");
    const patientMessages = messages
      .filter((m) => m.role === "assistant")
      .map((m) => m.content.toLowerCase())
      .join(" ");

    const diagnosticKeywords = [
      "pain", "hurt", "ache", "fever", "temperature", "cough", "breathing",
      "nausea", "vomit", "dizzy", "headache", "tired", "fatigue", "weak",
      "rash", "itch", "swell", "blood", "pressure", "heart", "chest",
      "stomach", "bowel", "urine", "sleep", "appetite", "weight", "muscle",
      "joint", "back", "neck", "throat", "nose", "ear", "eye", "skin",
      "medication", "allergy", "history", "family", "worse", "better",
      "started", "duration", "how long", "severity", "scale", "describe",
    ];

    const examKeywords = [
      "examine", "check", "look at", "feel", "listen", "blood pressure",
      "pulse", "temperature", "vitals", "physical", "test",
    ];

    let symptomScore = 0;
    for (const keyword of diagnosticKeywords) {
      if (patientMessages.includes(keyword)) {
        symptomScore += 2;
      }
    }
    symptomScore = Math.min(symptomScore, 50);

    let examScore = 0;
    for (const keyword of examKeywords) {
      if (allText.includes(keyword)) {
        examScore += 5;
      }
    }
    examScore = Math.min(examScore, 20);

    const userQuestions = messages.filter((m) => m.role === "user").length;
    const questionScore = Math.min(userQuestions * 3, 20);

    const baseProgress = 10;
    return Math.min(baseProgress + symptomScore + examScore + questionScore, 95);
  };

  const progressPercent = calculateProgress();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending || !caseData) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const conversation = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/patient-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: caseId,
          conversation,
          student_message: userMessage.content,
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");
      const data = await res.json();

      const aiMessage: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: data.response,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const fallbackMessage: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: "I'm here, doctor. What would you like to know?",
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleDiagnose = async () => {
    if (!diagnosisInput.trim() || !caseData) return;
    setIsSubmitting(true);

    try {
      const conversation = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/submit-diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: caseId,
          conversation,
          diagnosis: diagnosisInput,
          hints_used: hintsUsed,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit diagnosis");
      const data: FeedbackData = await res.json();

      setDiagnosisResult(data.result);
      setFeedbackData(data);
      addCompletedCase(caseId, diagnosisInput, data.result as "correct" | "partial" | "wrong", data.feedback.score);
      
      sessionStorage.setItem("lastFeedback", JSON.stringify({
        ...data,
        userDiagnosis: diagnosisInput,
        caseId,
      }));
      
      setShowPopup(true);
      setShowDiagnoseInput(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHint = async () => {
    if (isLoadingHint || !caseData) return;
    setIsLoadingHint(true);

    try {
      const conversation = messages
        .filter((m) => m.role !== "hint")
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        }));

      const res = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: caseId,
          conversation,
          hints_used: hintsUsed,
        }),
      });

      if (!res.ok) throw new Error("Failed to get hint");
      const data = await res.json();

      const hintMessage: Message = {
        id: messages.length + 1,
        role: "hint",
        content: data.hint,
      };
      setMessages((prev) => [...prev, hintMessage]);
      setHintsUsed(data.hintNumber);
    } catch (error) {
      console.error(error);
      const fallbackHints = [
        "Consider asking about the timeline and how symptoms have progressed.",
        "Think about what associated symptoms might help narrow down the diagnosis.",
        "Have you explored the patient's relevant medical history?",
      ];
      const hintMessage: Message = {
        id: messages.length + 1,
        role: "hint",
        content: fallbackHints[Math.min(hintsUsed, fallbackHints.length - 1)],
      };
      setMessages((prev) => [...prev, hintMessage]);
      setHintsUsed((prev) => prev + 1);
    } finally {
      setIsLoadingHint(false);
    }
  };

  const handleRetry = () => {
    setShowPopup(false);
    setDiagnosisResult(null);
    setDiagnosisInput("");
    setFeedbackData(null);
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

  const handleViewFeedback = () => {
    if (feedbackData) {
      sessionStorage.setItem("lastFeedback", JSON.stringify({
        ...feedbackData,
        userDiagnosis: diagnosisInput,
        caseId,
      }));
      navigate(`/feedback/${caseId}`);
    }
  };

  if (caseLoading) {
    return (
      <div className={`h-screen flex items-center justify-center ${isDarkMode ? "bg-[hsl(180,8%,5%)]" : "bg-[hsl(45,25%,97%)]"}`}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[hsl(168,65%,42%)] animate-spin" />
          <p className={`text-sm ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Loading case...</p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className={`h-screen flex flex-col items-center justify-center gap-4 ${isDarkMode ? "bg-[hsl(180,8%,5%)] text-white" : "bg-[hsl(45,25%,97%)] text-slate-900"}`}>
        <h2 className="text-xl font-semibold">Case not found</h2>
        <Link href="/dashboard">
          <button className="btn-primary">Return to Dashboard</button>
        </Link>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col overflow-hidden transition-colors duration-300 ${isDarkMode ? "bg-[hsl(180,8%,5%)]" : "bg-[hsl(45,25%,97%)]"}`}>
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Header */}
      <header className={`relative z-10 border-b backdrop-blur-xl ${isDarkMode ? "border-white/[0.06] bg-[hsl(180,8%,8%)]/90" : "border-slate-200/80 bg-white/90"}`}>
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
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
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? "hover:bg-white/[0.06]" : "hover:bg-slate-100"}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </motion.button>
              <div className="flex items-center gap-2">
                <div className="size-7 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-3.5 h-3.5 text-white" />
                </div>
                <span className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-slate-900"}`}>ClinIQ</span>
              </div>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isDarkMode ? "bg-white/[0.06] text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                {caseData.specialty}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                caseData.difficulty === "Beginner" 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : caseData.difficulty === "Intermediate"
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-rose-500/10 text-rose-400"
              }`}>
                {caseData.difficulty}
              </span>
            </div>
            <motion.button
              onClick={() => setShowDiagnoseInput(true)}
              className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Stethoscope className="w-4 h-4" />
              Make Diagnosis
            </motion.button>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className={isDarkMode ? "text-slate-500" : "text-slate-400"}>Diagnosis Progress</span>
              <span className={`font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{Math.round(progressPercent)}%</span>
            </div>
            <div className={`h-1.5 rounded-full overflow-hidden ${isDarkMode ? "bg-white/[0.06]" : "bg-slate-200"}`}>
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[hsl(168,65%,42%)] to-[hsl(150,55%,45%)]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <p className={`text-xs mt-1.5 ${isDarkMode ? "text-slate-600" : "text-slate-400"}`}>
              Interview the patient to gather more information
            </p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide" ref={scrollRef}>
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${isDarkMode ? "bg-white/[0.04]" : "bg-slate-100"}`}>
                <MessageSquare className={`w-8 h-8 ${isDarkMode ? "text-slate-600" : "text-slate-300"}`} />
              </div>
              <p className={isDarkMode ? "text-slate-500" : "text-slate-400"}>
                Start the consultation by greeting the patient.
              </p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i === messages.length - 1 ? 0.1 : 0 }}
                className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : msg.role === "hint" ? "justify-center" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0 mb-0.5">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                {msg.role === "hint" ? (
                  <div className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed rounded-xl ${
                    isDarkMode 
                      ? "bg-amber-500/10 border border-amber-500/20 text-amber-300" 
                      : "bg-amber-50 border border-amber-200 text-amber-700"
                  }`}>
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-teal-500 to-emerald-500 text-white rounded-2xl rounded-br-md"
                        : isDarkMode
                        ? "bg-white/[0.04] border border-white/[0.06] text-slate-200 rounded-2xl rounded-bl-md"
                        : "bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-bl-md shadow-sm"
                    }`}
                  >
                    <p className={msg.role === "user" ? "font-medium" : ""}>{msg.content}</p>
                  </div>
                )}
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0 mb-0.5">
                    <Stethoscope className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isSending && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-end gap-2"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <div className={`px-4 py-3 rounded-2xl rounded-bl-md ${isDarkMode ? "bg-white/[0.04] border border-white/[0.06]" : "bg-white border border-slate-200"}`}>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className={`relative z-10 p-4 border-t backdrop-blur-xl ${isDarkMode ? "border-white/[0.06] bg-[hsl(180,8%,8%)]/90" : "border-slate-200/80 bg-white/90"}`}>
        <div className="max-w-3xl mx-auto">
          {/* Hint button row */}
          <div className="flex justify-end mb-2">
            <motion.button
              type="button"
              onClick={handleHint}
              disabled={isLoadingHint || isSending}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isDarkMode
                  ? "bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
                  : "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 disabled:opacity-50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoadingHint ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Lightbulb className="w-3.5 h-3.5" />
              )}
              Get Hint
              {hintsUsed > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] ${
                  isDarkMode ? "bg-amber-500/20" : "bg-amber-200"
                }`}>
                  -{hintsUsed * 3}pts
                </span>
              )}
            </motion.button>
          </div>
          <form onSubmit={handleSend} className="relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the patient a question..."
              disabled={isSending}
              className={`w-full h-12 pl-4 pr-14 rounded-xl text-sm transition-all duration-200 ${
                isDarkMode 
                  ? "bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-slate-500 focus:bg-white/[0.06] focus:border-[hsl(168,65%,42%)]/40 focus:ring-2 focus:ring-[hsl(168,65%,42%)]/20" 
                  : "bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[hsl(168,65%,42%)]/50 focus:ring-2 focus:ring-[hsl(168,65%,42%)]/20"
              } focus:outline-none`}
            />
            <motion.button
              type="submit"
              disabled={!input.trim() || isSending}
              className="absolute right-1.5 top-1.5 w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </motion.button>
          </form>
        </div>
      </div>

      {/* Diagnosis Modal */}
      <AnimatePresence>
        {showDiagnoseInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className={`w-full max-w-md rounded-2xl p-6 ${isDarkMode ? "bg-[hsl(180,8%,10%)] border border-white/[0.08]" : "bg-white border border-slate-200 shadow-xl"}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                  Submit Your Diagnosis
                </h3>
                <button
                  onClick={() => setShowDiagnoseInput(false)}
                  className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? "hover:bg-white/[0.06] text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className={`text-sm mb-4 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                Based on your conversation, what is your diagnosis?
              </p>
              <input
                value={diagnosisInput}
                onChange={(e) => setDiagnosisInput(e.target.value)}
                placeholder="Enter your diagnosis..."
                autoFocus
                className={`w-full h-11 px-4 rounded-xl text-sm mb-4 transition-all ${
                  isDarkMode 
                    ? "bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-slate-500 focus:border-[hsl(168,65%,42%)]/40" 
                    : "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[hsl(168,65%,42%)]/50"
                } focus:outline-none focus:ring-2 focus:ring-[hsl(168,65%,42%)]/20`}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDiagnoseInput(false)}
                  className={`flex-1 h-11 rounded-xl font-medium text-sm transition-all ${isDarkMode ? "bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08]" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDiagnose}
                  disabled={!diagnosisInput.trim() || isSubmitting}
                  className="flex-1 h-11 rounded-xl font-medium text-sm btn-primary disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Modal */}
      <AnimatePresence>
        {showPopup && diagnosisResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className={`w-full max-w-md rounded-2xl p-6 text-center ${isDarkMode ? "bg-[hsl(180,8%,10%)] border border-white/[0.08]" : "bg-white border border-slate-200 shadow-xl"}`}
            >
              {diagnosisResult === "correct" && (
                <>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/20 flex items-center justify-center"
                  >
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-emerald-400 mb-2">Correct Diagnosis!</h3>
                  <p className={`mb-6 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Excellent work! You correctly identified the condition.
                  </p>
                </>
              )}
              {diagnosisResult === "partial" && (
                <>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/20 flex items-center justify-center"
                  >
                    <AlertCircle className="w-8 h-8 text-amber-400" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-amber-400 mb-2">Partially Correct</h3>
                  <p className={`mb-6 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    You're on the right track, but the diagnosis could be more specific.
                  </p>
                </>
              )}
              {diagnosisResult === "wrong" && (
                <>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/20 flex items-center justify-center"
                  >
                    <XCircle className="w-8 h-8 text-rose-400" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-rose-400 mb-2">Incorrect Diagnosis</h3>
                  <p className={`mb-6 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Keep practicing! Review the symptoms and try again.
                  </p>
                </>
              )}

              <div className="space-y-2">
                <button
                  onClick={handleViewFeedback}
                  className={`w-full h-11 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${isDarkMode ? "bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08]" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                >
                  <MessageSquare className="w-4 h-4" />
                  View Feedback
                </button>
                <button
                  onClick={handleRetry}
                  className={`w-full h-11 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${isDarkMode ? "bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08]" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  onClick={handleNextPatient}
                  className="w-full h-11 rounded-xl font-medium text-sm btn-primary flex items-center justify-center gap-2"
                >
                  Next Patient
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
