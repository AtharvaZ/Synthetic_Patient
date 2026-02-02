import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Stethoscope, Lightbulb, ArrowRight, Check, X, 
  RotateCcw, Trophy, Home, Brain, Send, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

// Mock disease data
const diseaseData = [
  {
    id: 1,
    disease: "Myocardial Infarction",
    symptoms: [
      "Severe chest pain radiating to left arm",
      "Shortness of breath",
      "Nausea and cold sweats",
      "Pain worsens with exertion"
    ],
    hints: [
      "This condition affects the heart",
      "It's commonly known as a heart attack",
      "It involves blockage of coronary arteries"
    ],
    category: "Cardiology"
  },
  {
    id: 2,
    disease: "Pneumonia",
    symptoms: [
      "Productive cough with yellow-green sputum",
      "High fever with chills",
      "Difficulty breathing",
      "Chest pain when breathing deeply"
    ],
    hints: [
      "This is a respiratory infection",
      "It affects the lungs",
      "Can be caused by bacteria or viruses"
    ],
    category: "Pulmonology"
  },
  {
    id: 3,
    disease: "Appendicitis",
    symptoms: [
      "Pain starting around navel then moving to right lower abdomen",
      "Loss of appetite",
      "Nausea and vomiting",
      "Low-grade fever"
    ],
    hints: [
      "This is an abdominal condition",
      "It requires surgical intervention",
      "Located in the lower right quadrant"
    ],
    category: "Gastroenterology"
  },
  {
    id: 4,
    disease: "Migraine",
    symptoms: [
      "Severe throbbing headache, usually on one side",
      "Sensitivity to light and sound",
      "Nausea and vomiting",
      "Visual disturbances (aura)"
    ],
    hints: [
      "This is a neurological condition",
      "It's a type of headache disorder",
      "Often triggered by stress or certain foods"
    ],
    category: "Neurology"
  },
  {
    id: 5,
    disease: "Type 2 Diabetes",
    symptoms: [
      "Increased thirst and frequent urination",
      "Unexplained weight loss",
      "Fatigue and blurred vision",
      "Slow-healing wounds"
    ],
    hints: [
      "This affects blood sugar levels",
      "It's a metabolic disorder",
      "Often associated with lifestyle factors"
    ],
    category: "Endocrinology"
  }
];

type Message = {
  id: string;
  type: "ai" | "user" | "system" | "hint";
  content: string;
  isCorrect?: boolean;
};

export default function Quiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showResult, setShowResult] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentQuestion = diseaseData[currentQuestionIndex];
  const totalQuestions = diseaseData.length;
  const progress = ((answeredQuestions.length) / totalQuestions) * 100;

  // Initialize first question
  useEffect(() => {
    if (messages.length === 0) {
      initializeQuestion();
    }
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeQuestion = () => {
    const symptomsText = currentQuestion.symptoms.map((s, i) => `${i + 1}. ${s}`).join("\n");
    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      type: "ai",
      content: `**Case ${currentQuestionIndex + 1}: ${currentQuestion.category}**\n\nA patient presents with the following symptoms:\n\n${symptomsText}\n\nWhat is your diagnosis?`
    };
    setMessages(prev => [...prev, aiMessage]);
  };

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim() || showResult) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: userAnswer
    };
    setMessages(prev => [...prev, userMessage]);

    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.disease.toLowerCase();
    
    setTimeout(() => {
      if (isCorrect) {
        setShowResult("correct");
        const pointsEarned = Math.max(10 - hintsUsed * 3, 1);
        setScore(prev => prev + pointsEarned);
        
        const correctMessage: Message = {
          id: `system-${Date.now()}`,
          type: "system",
          content: `Correct! The diagnosis is **${currentQuestion.disease}**. You earned **+${pointsEarned} points**!`,
          isCorrect: true
        };
        setMessages(prev => [...prev, correctMessage]);
      } else {
        setShowResult("incorrect");
        
        const incorrectMessage: Message = {
          id: `system-${Date.now()}`,
          type: "system",
          content: `Incorrect. The correct diagnosis is **${currentQuestion.disease}**. Keep practicing!`,
          isCorrect: false
        };
        setMessages(prev => [...prev, incorrectMessage]);
      }
      setAnsweredQuestions(prev => [...prev, currentQuestionIndex]);
    }, 500);
    
    setUserAnswer("");
  };

  const handleNextQuestion = () => {
    setShowResult(null);
    setHintsUsed(0);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      
      // Add next question after state update
      setTimeout(() => {
        const nextQuestion = diseaseData[currentQuestionIndex + 1];
        const symptomsText = nextQuestion.symptoms.map((s, i) => `${i + 1}. ${s}`).join("\n");
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: `**Case ${currentQuestionIndex + 2}: ${nextQuestion.category}**\n\nA patient presents with the following symptoms:\n\n${symptomsText}\n\nWhat is your diagnosis?`
        };
        setMessages(prev => [...prev, aiMessage]);
      }, 100);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleUseHint = () => {
    if (hintsUsed < currentQuestion.hints.length && !showResult) {
      const hintMessage: Message = {
        id: `hint-${Date.now()}`,
        type: "hint",
        content: `**Hint ${hintsUsed + 1}:** ${currentQuestion.hints[hintsUsed]}`
      };
      setMessages(prev => [...prev, hintMessage]);
      setHintsUsed(prev => prev + 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setHintsUsed(0);
    setShowResult(null);
    setScore(0);
    setQuizCompleted(false);
    setAnsweredQuestions([]);
    setMessages([]);
    
    setTimeout(() => {
      const firstQuestion = diseaseData[0];
      const symptomsText = firstQuestion.symptoms.map((s, i) => `${i + 1}. ${s}`).join("\n");
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: `**Case 1: ${firstQuestion.category}**\n\nA patient presents with the following symptoms:\n\n${symptomsText}\n\nWhat is your diagnosis?`
      };
      setMessages([aiMessage]);
    }, 100);
  };

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <div className="bg-[#161618] border border-[#283039] rounded-2xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#137fec]/20 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-[#137fec]" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
            <p className="text-slate-400 mb-6">Great job practicing your diagnostic skills</p>
            
            <div className="bg-[#0a0a0c] rounded-xl p-6 mb-6">
              <p className="text-sm text-slate-400 mb-2">Your Score</p>
              <p className="text-5xl font-black text-[#137fec]">{score}</p>
              <p className="text-sm text-slate-500 mt-2">out of {totalQuestions * 10} possible points</p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleRestart}
                className="flex-1 bg-[#137fec] hover:bg-[#137fec]/90 h-12"
                data-testid="button-restart-quiz"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Link href="/" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-[#283039] hover:bg-[#283039] h-12"
                  data-testid="button-go-home"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0c] text-white flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-[#283039] bg-[#0a0a0c]">
        <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="size-7 bg-[#137fec] rounded flex items-center justify-center text-white">
                <Stethoscope className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold tracking-tight">MediTutor AI</h2>
            </div>
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="w-4 h-4 text-[#137fec]" />
              <span className="font-semibold">{score} pts</span>
            </div>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" data-testid="button-exit-quiz">
                Exit
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="flex-shrink-0 bg-[#161618] border-b border-[#283039] px-4 py-3">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-400">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#137fec]/10 border border-[#137fec]/20 text-[#137fec] text-xs font-bold">
                {currentQuestion.category}
              </span>
            </div>
            <span className="text-sm font-bold text-[#137fec]">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-[#283039]" data-testid="progress-bar" />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 max-w-[1400px] mx-auto w-full flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={clsx(
                    "flex gap-3",
                    message.type === "user" && "justify-end"
                  )}
                >
                  {/* AI Avatar */}
                  {(message.type === "ai" || message.type === "hint" || message.type === "system") && (
                    <div className={clsx(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      message.type === "hint" && "bg-amber-500",
                      message.type === "system" && message.isCorrect && "bg-green-500",
                      message.type === "system" && message.isCorrect === false && "bg-red-500",
                      message.type === "ai" && "bg-[#137fec]"
                    )}>
                      {message.type === "hint" && <Lightbulb className="w-4 h-4 text-white" />}
                      {message.type === "system" && message.isCorrect && <Check className="w-4 h-4 text-white" />}
                      {message.type === "system" && message.isCorrect === false && <X className="w-4 h-4 text-white" />}
                      {message.type === "ai" && <Brain className="w-4 h-4 text-white" />}
                    </div>
                  )}
                  
                  {/* Message Bubble */}
                  <div className={clsx(
                    "rounded-2xl p-4 max-w-xl",
                    message.type === "user" && "bg-[#137fec] rounded-tr-sm",
                    message.type === "ai" && "bg-[#161618] border border-[#283039] rounded-tl-sm",
                    message.type === "hint" && "bg-amber-500/10 border border-amber-500/30 rounded-tl-sm",
                    message.type === "system" && message.isCorrect && "bg-green-500/10 border border-green-500/30 rounded-tl-sm",
                    message.type === "system" && message.isCorrect === false && "bg-red-500/10 border border-red-500/30 rounded-tl-sm"
                  )}>
                    <p className={clsx(
                      "text-sm whitespace-pre-wrap",
                      message.type === "user" && "text-white",
                      message.type === "ai" && "text-slate-300",
                      message.type === "hint" && "text-amber-200",
                      message.type === "system" && message.isCorrect && "text-green-400",
                      message.type === "system" && message.isCorrect === false && "text-red-400"
                    )}>
                      {message.content.split('**').map((part, i) => 
                        i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part
                      )}
                    </p>
                  </div>
                  
                  {/* User Avatar */}
                  {message.type === "user" && (
                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold">You</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Next Question Button */}
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center pt-4"
              >
                <Button
                  onClick={handleNextQuestion}
                  className="bg-[#137fec] hover:bg-[#137fec]/90 px-6"
                  data-testid="button-next-question"
                >
                  {currentQuestionIndex < totalQuestions - 1 ? "Next Question" : "See Results"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 border-t border-[#283039] bg-[#161618] p-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseHint}
                  disabled={hintsUsed >= currentQuestion.hints.length || showResult !== null}
                  className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 h-8"
                  data-testid="button-use-hint"
                >
                  <Lightbulb className="w-3 h-3 mr-2" />
                  Hint ({currentQuestion.hints.length - hintsUsed} left)
                </Button>
                <span className="text-xs text-slate-500">Using hints reduces points earned</span>
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your diagnosis..."
                    disabled={showResult !== null}
                    className="pl-11 bg-[#0a0a0c] border-[#283039] focus-visible:ring-[#137fec] h-12 rounded-xl"
                    onKeyDown={(e) => e.key === "Enter" && !showResult && handleSubmitAnswer()}
                    data-testid="input-diagnosis"
                  />
                </div>
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer.trim() || showResult !== null}
                  className="bg-[#137fec] hover:bg-[#137fec]/90 h-12 px-6 rounded-xl"
                  data-testid="button-submit-answer"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
