import { useEffect, useRef, useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useChat, useSendMessage } from "@/hooks/use-chats";
import { useCase, useCases, useCompleteCase, useRetryDiagnosis, useCompletedCases } from "@/hooks/use-cases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, Loader2, ArrowLeft, Stethoscope, X,
  CheckCircle, AlertCircle, XCircle, RotateCcw, ArrowRight, MessageSquare
} from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";

type DiagnosisResult = "correct" | "partial" | "wrong" | null;

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const chatId = parseInt(id);
  
  const { data: chat, isLoading: chatLoading, refetch: refetchChat } = useChat(chatId);
  const { data: caseData, isLoading: caseLoading } = useCase(chat?.caseId ?? 0);
  const { data: allCases } = useCases();
  const { data: completedCases } = useCompletedCases();
  const sendMessage = useSendMessage();
  const completeCase = useCompleteCase();
  const retryDiagnosis = useRetryDiagnosis();
  
  const completedSet = new Set(completedCases || []);
  
  const [input, setInput] = useState("");
  const [showDiagnoseInput, setShowDiagnoseInput] = useState(false);
  const [diagnosisInput, setDiagnosisInput] = useState("");
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult>(null);
  const [showPopup, setShowPopup] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messageCount = chat?.messages?.length || 0;
  const progressPercent = Math.min((messageCount / 10) * 100, 100);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat?.messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;

    try {
      await sendMessage.mutateAsync({
        chatId,
        content: input,
        sender: "user",
      });
      setInput("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDiagnose = async () => {
    if (!diagnosisInput.trim() || !caseData) return;

    const response = await completeCase.mutateAsync({
      caseId: caseData.id,
      chatId,
      diagnosis: diagnosisInput,
    });

    setDiagnosisResult(response.result);
    setShowPopup(true);
    setShowDiagnoseInput(false);
  };

  const handleRetry = async () => {
    await retryDiagnosis.mutateAsync(chatId);
    setShowPopup(false);
    setDiagnosisResult(null);
    setDiagnosisInput("");
  };

  const handleNextPatient = async () => {
    if (!caseData || !allCases) return;
    
    const sameDifficultyUnsolved = allCases.filter(c => 
      c.difficulty === caseData.difficulty && c.id !== caseData.id && !completedSet.has(c.id)
    );
    
    let nextCase = sameDifficultyUnsolved[0];
    
    if (!nextCase) {
      const difficulties = ["Beginner", "Intermediate", "Advanced"];
      const currentIndex = difficulties.indexOf(caseData.difficulty);
      
      for (let i = currentIndex + 1; i < difficulties.length; i++) {
        const nextDifficultyUnsolved = allCases.filter(c => 
          c.difficulty === difficulties[i] && !completedSet.has(c.id)
        );
        if (nextDifficultyUnsolved.length > 0) {
          nextCase = nextDifficultyUnsolved[0];
          break;
        }
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

  if (chatLoading || caseLoading) {
    return (
      <div className="h-screen bg-[#0a0a0c] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!chat || !caseData) {
    return (
      <div className="h-screen bg-[#0a0a0c] flex flex-col items-center justify-center text-white gap-4">
        <h2 className="text-xl font-semibold">Chat not found</h2>
        <Link href="/dashboard">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0c] text-white flex flex-col overflow-hidden">
      <header className="border-b border-white/5 bg-[#161618]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <div className="size-8 bg-gradient-to-br from-[#137fec] to-teal-500 rounded flex items-center justify-center text-white">
                <Stethoscope className="w-4 h-4" />
              </div>
              <span className="font-semibold">CaseLab</span>
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
            <div className="h-2 bg-[#283039] rounded-full overflow-hidden">
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
          {chat.messages?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Start the consultation by greeting the patient.</p>
            </div>
          )}
          
          {chat.messages?.map((msg) => (
            <div
              key={msg.id}
              className={clsx(
                "flex w-full",
                msg.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={clsx(
                  "max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed",
                  msg.sender === "user"
                    ? "bg-primary text-white rounded-tr-sm shadow-lg shadow-primary/10"
                    : "bg-[#1c1c1f] text-gray-100 border border-white/5 rounded-tl-sm"
                )}
              >
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
          
          {sendMessage.isPending && (
            <div className="flex justify-end">
              <div className="bg-primary/50 text-white/50 px-5 py-3 rounded-2xl rounded-tr-sm text-sm">
                Sending...
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-white/5 bg-[#161618]/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the patient a question..."
              className="pr-12 bg-[#1c1c1f] border-white/10 focus-visible:ring-primary/50 text-white h-12 rounded-xl"
              disabled={sendMessage.isPending}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-1 w-10 h-10 rounded-lg bg-primary hover:bg-primary/90 text-white"
              disabled={!input.trim() || sendMessage.isPending}
            >
              {sendMessage.isPending ? (
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
              className="bg-[#1c1c1f] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Submit Your Diagnosis</h3>
                <button onClick={() => setShowDiagnoseInput(false)} className="text-muted-foreground hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Based on your conversation with the patient, what is your diagnosis?
              </p>
              <Input
                value={diagnosisInput}
                onChange={(e) => setDiagnosisInput(e.target.value)}
                placeholder="Enter your diagnosis..."
                className="bg-[#0a0a0c] border-white/10 text-white mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDiagnoseInput(false)}
                  className="flex-1 border-white/10 text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDiagnose}
                  disabled={!diagnosisInput.trim() || completeCase.isPending}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white"
                >
                  {completeCase.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
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
              className="bg-[#1c1c1f] border border-white/10 rounded-2xl p-6 w-full max-w-md text-center"
            >
              {diagnosisResult === "correct" && (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-500 mb-2">Correct Diagnosis!</h3>
                  <p className="text-muted-foreground mb-6">Excellent work! You correctly identified the condition.</p>
                </>
              )}
              {diagnosisResult === "partial" && (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-yellow-500" />
                  </div>
                  <h3 className="text-xl font-bold text-yellow-500 mb-2">Partially Correct</h3>
                  <p className="text-muted-foreground mb-6">You're on the right track, but the diagnosis could be more specific.</p>
                </>
              )}
              {diagnosisResult === "wrong" && (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-red-500 mb-2">Incorrect Diagnosis</h3>
                  <p className="text-muted-foreground mb-6">Keep practicing! Review the symptoms and try again.</p>
                </>
              )}
              
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => navigate(`/feedback/${chatId}`)}
                  variant="outline" 
                  className="w-full border-white/10 text-white hover:bg-white/5"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View Feedback
                </Button>
                <Button 
                  onClick={handleRetry}
                  variant="outline" 
                  className="w-full border-white/10 text-white hover:bg-white/5"
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
