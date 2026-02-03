import { useEffect, useRef, useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useCase, useCases } from "@/hooks/use-cases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { addCompletedCase, getCompletedCaseIds } from "@/lib/localStorage";

interface Message {
  id: number;
  role: "user" | "assistant";
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const completedCaseIds = getCompletedCaseIds();
  const completedSet = new Set(completedCaseIds);

  useEffect(() => {
    if (caseData && messages.length === 0) {
      setMessages([
        {
          id: 1,
          role: "assistant",
          content: "Hello doctor. I'm feeling not quite right today...",
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
        }),
      });

      if (!res.ok) throw new Error("Failed to submit diagnosis");
      const data: FeedbackData = await res.json();

      setDiagnosisResult(data.result);
      setFeedbackData(data);
      addCompletedCase(caseId, diagnosisInput, data.result as "correct" | "partial" | "wrong");
      
      // Store feedback in sessionStorage for the feedback page
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
      <div
        className={`h-screen ${isDarkMode ? "bg-[#0a0a0c] text-white" : "bg-slate-50 text-slate-900"} flex items-center justify-center`}
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div
        className={`h-screen ${isDarkMode ? "bg-[#0a0a0c] text-white" : "bg-slate-50 text-slate-900"} flex flex-col items-center justify-center gap-4`}
      >
        <h2 className="text-xl font-semibold">Case not found</h2>
        <Link href="/dashboard">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`h-screen ${isDarkMode ? "bg-[#0a0a0c] text-white" : "bg-slate-50 text-slate-900"} flex flex-col overflow-hidden transition-colors duration-300`}
    >
      <header
        className={`border-b ${isDarkMode ? "border-white/5 bg-[#161618]" : "border-slate-200 bg-white"}`}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
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

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">{caseData.title}</h2>
              <span className="text-xs font-medium text-primary px-2 py-0.5 rounded-full bg-primary/10">
                {caseData.specialty} · {caseData.difficulty}
              </span>
            </div>
            <Button
              onClick={() => setShowDiagnoseInput(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white"
            >
              <Stethoscope className="w-4 h-4 mr-2" />
              Make Diagnosis
            </Button>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Diagnosis Progress</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className={`h-2 ${isDarkMode ? "bg-[#283039]" : "bg-slate-200"} rounded-full overflow-hidden`}>
              <motion.div
                className="h-full bg-gradient-to-r from-[#137fec] to-teal-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Interview the patient to gather more information
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 scroll-smooth" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Start the consultation by greeting the patient.</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={clsx(
                "flex w-full",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={clsx(
                  "max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-sm shadow-lg shadow-primary/10"
                    : isDarkMode
                      ? "bg-[#1c1c1f] text-gray-100 border border-white/5 rounded-tl-sm"
                      : "bg-white text-slate-900 border border-slate-200 rounded-tl-sm shadow-sm"
                )}
              >
                <p>{msg.content}</p>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex justify-start">
              <div className={`${isDarkMode ? "bg-[#1c1c1f] border-white/5" : "bg-white border-slate-200"} border px-5 py-3 rounded-2xl rounded-tl-sm text-sm`}>
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`p-4 border-t ${isDarkMode ? "border-white/5 bg-[#161618]/50" : "border-slate-200 bg-white/50"} backdrop-blur-sm`}>
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the patient a question..."
              className={`pr-12 h-12 rounded-xl ${isDarkMode ? "bg-[#1c1c1f] border-white/10 text-white focus-visible:ring-primary/50" : "bg-white border-slate-200 text-slate-900"}`}
              disabled={isSending}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1 w-10 h-10 rounded-lg bg-primary hover:bg-primary/90 text-white"
              disabled={!input.trim() || isSending}
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {showDiagnoseInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${isDarkMode ? "bg-[#1c1c1f] border-white/10" : "bg-white border-slate-200"} border rounded-2xl p-6 w-full max-w-md`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Submit Your Diagnosis</h3>
                <button
                  onClick={() => setShowDiagnoseInput(false)}
                  className="text-muted-foreground hover:text-current"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Based on your conversation with the patient, what is your
                diagnosis?
              </p>
              <Input
                value={diagnosisInput}
                onChange={(e) => setDiagnosisInput(e.target.value)}
                placeholder="Enter your diagnosis..."
                className={`mb-4 ${isDarkMode ? "bg-[#0a0a0c] border-white/10 text-white" : "bg-slate-50 border-slate-200"}`}
                autoFocus
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDiagnoseInput(false)}
                  className={`flex-1 ${isDarkMode ? "border-white/10 text-white hover:bg-white/5" : ""}`}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDiagnose}
                  disabled={!diagnosisInput.trim() || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPopup && diagnosisResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${isDarkMode ? "bg-[#1c1c1f] border-white/10" : "bg-white border-slate-200"} border rounded-2xl p-6 w-full max-w-md text-center`}
            >
              {diagnosisResult === "correct" && (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-500 mb-2">
                    Correct Diagnosis!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Excellent work! You correctly identified the condition.
                  </p>
                </>
              )}
              {diagnosisResult === "partial" && (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-yellow-500" />
                  </div>
                  <h3 className="text-xl font-bold text-yellow-500 mb-2">
                    Partially Correct
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    You're on the right track, but the diagnosis could be more
                    specific.
                  </p>
                </>
              )}
              {diagnosisResult === "wrong" && (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-red-500 mb-2">
                    Incorrect Diagnosis
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Keep practicing! Review the symptoms and try again.
                  </p>
                </>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleViewFeedback}
                  variant="outline"
                  className={`w-full ${isDarkMode ? "border-white/10 text-white hover:bg-white/5" : ""}`}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View Feedback
                </Button>
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className={`w-full ${isDarkMode ? "border-white/10 text-white hover:bg-white/5" : ""}`}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry Diagnosis
                </Button>
                <Button
                  onClick={handleNextPatient}
                  className="w-full bg-gradient-to-r from-[#137fec] to-teal-500 hover:opacity-90 text-white"
                >
                  Next Patient
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
