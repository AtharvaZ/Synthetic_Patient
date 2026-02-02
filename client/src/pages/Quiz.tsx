import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Stethoscope, Lightbulb, ArrowRight, Check, X, 
  RotateCcw, Trophy, Home, Brain, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

// Mock disease data - this will come from database later
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

export default function Quiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showResult, setShowResult] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);

  const currentQuestion = diseaseData[currentQuestionIndex];
  const totalQuestions = diseaseData.length;
  const progress = ((answeredQuestions.length) / totalQuestions) * 100;

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) return;

    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.disease.toLowerCase();
    
    if (isCorrect) {
      setShowResult("correct");
      const pointsEarned = Math.max(10 - hintsUsed * 3, 1);
      setScore(prev => prev + pointsEarned);
    } else {
      setShowResult("incorrect");
    }

    setAnsweredQuestions(prev => [...prev, currentQuestionIndex]);
  };

  const handleNextQuestion = () => {
    setShowResult(null);
    setUserAnswer("");
    setHintsUsed(0);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleUseHint = () => {
    if (hintsUsed < currentQuestion.hints.length) {
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
  };

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <Card className="bg-[#161618] border-[#283039]">
            <CardContent className="p-8 text-center">
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
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#283039] bg-[#0a0a0c]/80 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="size-8 bg-[#137fec] rounded flex items-center justify-center text-white">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">MediTutor AI</h2>
            </div>
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <Trophy className="w-4 h-4 text-[#137fec]" />
              <span className="font-semibold">{score} pts</span>
            </div>
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-exit-quiz">
                Exit Quiz
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-400">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <span className="text-sm font-medium text-[#137fec]">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-[#283039]" data-testid="progress-bar" />
        </div>

        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className="px-3 py-1 rounded-full bg-[#137fec]/10 border border-[#137fec]/20 text-[#137fec] text-xs font-bold uppercase tracking-wider">
            {currentQuestion.category}
          </span>
        </div>

        {/* Main Quiz Card */}
        <Card className="bg-[#161618] border-[#283039] mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#137fec]/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-[#137fec]" />
              </div>
              <span>Identify the Disease</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Symptoms List */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Patient Symptoms:
              </h3>
              <ul className="space-y-3">
                {currentQuestion.symptoms.map((symptom, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-[#0a0a0c] border border-[#283039]"
                  >
                    <ChevronRight className="w-4 h-4 text-[#137fec] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{symptom}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Hints Section */}
            <div className="mb-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-500">Hints</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseHint}
                  disabled={hintsUsed >= currentQuestion.hints.length || showResult !== null}
                  className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 h-8"
                  data-testid="button-use-hint"
                >
                  <Lightbulb className="w-3 h-3 mr-2" />
                  Get Hint ({currentQuestion.hints.length - hintsUsed} left)
                </Button>
              </div>
              
              <AnimatePresence>
                {hintsUsed > 0 && (
                  <motion.div className="space-y-2">
                    {currentQuestion.hints.slice(0, hintsUsed).map((hint, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-2 text-sm text-amber-200/80"
                      >
                        <span className="text-amber-500 font-bold">{index + 1}.</span>
                        <span>{hint}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {hintsUsed === 0 && (
                <p className="text-sm text-slate-500">Use hints if you're stuck. Each hint reduces potential points.</p>
              )}
            </div>

            {/* Answer Input */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">
                  Your Diagnosis:
                </label>
                <div className="flex gap-3">
                  <Input
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Enter the disease name..."
                    disabled={showResult !== null}
                    className="flex-1 bg-[#0a0a0c] border-[#283039] focus-visible:ring-[#137fec] h-12"
                    onKeyDown={(e) => e.key === "Enter" && !showResult && handleSubmitAnswer()}
                    data-testid="input-diagnosis"
                  />
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!userAnswer.trim() || showResult !== null}
                    className="bg-[#137fec] hover:bg-[#137fec]/90 h-12 px-6"
                    data-testid="button-submit-answer"
                  >
                    Submit
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Result Feedback */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={clsx(
                      "p-4 rounded-xl flex items-center justify-between",
                      showResult === "correct"
                        ? "bg-green-500/10 border border-green-500/30"
                        : "bg-red-500/10 border border-red-500/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {showResult === "correct" ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <p className={clsx(
                          "font-semibold",
                          showResult === "correct" ? "text-green-500" : "text-red-500"
                        )}>
                          {showResult === "correct" ? "Correct!" : "Incorrect"}
                        </p>
                        <p className="text-sm text-slate-400">
                          {showResult === "correct"
                            ? `+${Math.max(10 - hintsUsed * 3, 1)} points earned`
                            : `The answer was: ${currentQuestion.disease}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleNextQuestion}
                      className="bg-[#137fec] hover:bg-[#137fec]/90"
                      data-testid="button-next-question"
                    >
                      {currentQuestionIndex < totalQuestions - 1 ? "Next Question" : "See Results"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Score Summary */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#161618] border border-[#283039]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#137fec]" />
              <span className="text-sm font-medium">Current Score:</span>
              <span className="text-lg font-bold text-[#137fec]">{score}</span>
            </div>
          </div>
          <div className="text-sm text-slate-400">
            {answeredQuestions.length} of {totalQuestions} answered
          </div>
        </div>
      </main>
    </div>
  );
}
