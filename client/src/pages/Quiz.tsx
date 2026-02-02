import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Stethoscope, Lightbulb, ArrowRight, Check, X, 
  RotateCcw, Trophy, Home, Brain, Send, Sparkles, Star, Zap, Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

// General knowledge quiz data with encouragement
const quizData = [
  {
    id: 1,
    question: "What is the capital city of France?",
    answer: "Paris",
    hints: [
      "It's known as the City of Love",
      "The Eiffel Tower is located there",
      "It starts with the letter 'P'"
    ],
    category: "Geography",
    funFact: "Paris has over 1,800 registered bakeries!"
  },
  {
    id: 2,
    question: "What planet is known as the Red Planet?",
    answer: "Mars",
    hints: [
      "It's named after a Roman god",
      "NASA has sent rovers there",
      "It's the 4th planet from the Sun"
    ],
    category: "Science",
    funFact: "A day on Mars is about 40 minutes longer than on Earth!"
  },
  {
    id: 3,
    question: "Who painted the Mona Lisa?",
    answer: "Leonardo da Vinci",
    hints: [
      "He was an Italian Renaissance artist",
      "He also designed flying machines",
      "His first name is Leonardo"
    ],
    category: "Art & History",
    funFact: "The Mona Lisa has no eyebrows - it was fashionable to shave them off in Renaissance Florence!"
  },
  {
    id: 4,
    question: "What is the largest ocean on Earth?",
    answer: "Pacific Ocean",
    hints: [
      "It covers more than 60 million square miles",
      "Its name means 'peaceful'",
      "It touches Asia and the Americas"
    ],
    category: "Geography",
    funFact: "The Pacific Ocean is larger than all the land on Earth combined!"
  },
  {
    id: 5,
    question: "How many bones does an adult human have?",
    answer: "206",
    hints: [
      "Babies are born with more bones that fuse together",
      "It's more than 200",
      "It's between 200 and 210"
    ],
    category: "Science",
    funFact: "Babies are born with about 270 bones, but many fuse together as they grow!"
  },
  {
    id: 6,
    question: "What is the chemical symbol for gold?",
    answer: "Au",
    hints: [
      "It comes from the Latin word for gold",
      "The Latin word is 'aurum'",
      "It's a two-letter symbol"
    ],
    category: "Science",
    funFact: "All the gold ever mined could fit into a cube about 21 meters on each side!"
  },
  {
    id: 7,
    question: "In what year did World War II end?",
    answer: "1945",
    hints: [
      "It was in the 1940s",
      "It was after the atomic bombs were dropped",
      "It's between 1944 and 1946"
    ],
    category: "History",
    funFact: "The famous V-J Day kiss photo was taken in Times Square on August 14, 1945!"
  },
  {
    id: 8,
    question: "What is the fastest land animal?",
    answer: "Cheetah",
    hints: [
      "It's a big cat",
      "It has spots, not stripes",
      "It can reach speeds over 70 mph"
    ],
    category: "Nature",
    funFact: "Cheetahs can accelerate from 0 to 60 mph in just 3 seconds!"
  }
];

// Encouragement messages for correct answers
const correctMessages = [
  "Brilliant! You're on fire! 🔥",
  "Amazing work! Keep it up! ⭐",
  "Fantastic! You really know your stuff!",
  "Incredible! You're crushing it!",
  "Outstanding! Your knowledge is impressive!",
  "Superb! You're a quiz champion!",
  "Excellent! That was spot on!",
  "Perfect! You're doing wonderfully!"
];

// Encouragement messages for incorrect answers
const incorrectMessages = [
  "Don't worry! Every mistake is a learning opportunity!",
  "Keep going! You're learning something new!",
  "That's okay! The important thing is that you tried!",
  "No problem! You'll get the next one!",
  "Learning is a journey - you're doing great!",
  "Nice try! Now you'll remember this one!",
  "Keep your head up! Progress takes practice!"
];

type Message = {
  id: string;
  type: "ai" | "user" | "system" | "hint" | "funfact";
  content: string;
  isCorrect?: boolean;
};

export default function Quiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showResult, setShowResult] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentQuestion = quizData[currentQuestionIndex];
  const totalQuestions = quizData.length;
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

  const getRandomMessage = (isCorrect: boolean) => {
    const messages = isCorrect ? correctMessages : incorrectMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const initializeQuestion = () => {
    const welcomeMessage: Message = {
      id: `ai-welcome-${Date.now()}`,
      type: "ai",
      content: `**Question ${currentQuestionIndex + 1}** • ${currentQuestion.category}\n\n${currentQuestion.question}`
    };
    setMessages(prev => [...prev, welcomeMessage]);
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

    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase();
    
    setTimeout(() => {
      if (isCorrect) {
        setShowResult("correct");
        const basePoints = 10;
        const streakBonus = streak >= 2 ? 5 : 0;
        const hintPenalty = hintsUsed * 3;
        const pointsEarned = Math.max(basePoints + streakBonus - hintPenalty, 1);
        
        setScore(prev => prev + pointsEarned);
        setStreak(prev => prev + 1);
        setCorrectCount(prev => prev + 1);
        
        const encouragement = getRandomMessage(true);
        const streakText = streak >= 2 ? `\n\n🔥 **${streak + 1} correct in a row!** (+${streakBonus} bonus points)` : "";
        
        const correctMessage: Message = {
          id: `system-${Date.now()}`,
          type: "system",
          content: `${encouragement}\n\nThe answer is **${currentQuestion.answer}**! You earned **+${pointsEarned} points**!${streakText}`,
          isCorrect: true
        };
        setMessages(prev => [...prev, correctMessage]);

        // Add fun fact
        setTimeout(() => {
          const funFactMessage: Message = {
            id: `funfact-${Date.now()}`,
            type: "funfact",
            content: `**Did you know?** ${currentQuestion.funFact}`
          };
          setMessages(prev => [...prev, funFactMessage]);
        }, 800);
      } else {
        setShowResult("incorrect");
        setStreak(0);
        
        const encouragement = getRandomMessage(false);
        
        const incorrectMessage: Message = {
          id: `system-${Date.now()}`,
          type: "system",
          content: `${encouragement}\n\nThe correct answer is **${currentQuestion.answer}**.`,
          isCorrect: false
        };
        setMessages(prev => [...prev, incorrectMessage]);

        // Add fun fact to help remember
        setTimeout(() => {
          const funFactMessage: Message = {
            id: `funfact-${Date.now()}`,
            type: "funfact",
            content: `**Fun fact to remember:** ${currentQuestion.funFact}`
          };
          setMessages(prev => [...prev, funFactMessage]);
        }, 800);
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
        const nextQuestion = quizData[currentQuestionIndex + 1];
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: `**Question ${currentQuestionIndex + 2}** • ${nextQuestion.category}\n\n${nextQuestion.question}`
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
    setStreak(0);
    setCorrectCount(0);
    setQuizCompleted(false);
    setAnsweredQuestions([]);
    setMessages([]);
    
    setTimeout(() => {
      const firstQuestion = quizData[0];
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: `**Question 1** • ${firstQuestion.category}\n\n${firstQuestion.question}`
      };
      setMessages([aiMessage]);
    }, 100);
  };

  // Calculate grade
  const getGrade = () => {
    const percentage = (correctCount / totalQuestions) * 100;
    if (percentage >= 90) return { letter: "A+", color: "text-green-400", message: "Outstanding! You're a quiz master!" };
    if (percentage >= 80) return { letter: "A", color: "text-green-400", message: "Excellent work! Very impressive!" };
    if (percentage >= 70) return { letter: "B", color: "text-blue-400", message: "Great job! Keep learning!" };
    if (percentage >= 60) return { letter: "C", color: "text-yellow-400", message: "Good effort! Practice makes perfect!" };
    return { letter: "D", color: "text-orange-400", message: "Keep trying! Every quiz makes you smarter!" };
  };

  if (quizCompleted) {
    const grade = getGrade();
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <div className="bg-[#161618] border border-[#283039] rounded-2xl p-8 text-center relative overflow-hidden">
            {/* Confetti-like decorations */}
            <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
            <div className="absolute top-8 right-8 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <div className="absolute bottom-12 left-8 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <div className="absolute top-16 left-12 w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#137fec] to-purple-500 flex items-center justify-center shadow-lg shadow-[#137fec]/30"
            >
              <Trophy className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold mb-2"
            >
              Quiz Complete!
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-400 mb-6"
            >
              {grade.message}
            </motion.p>
            
            {/* Stats Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-3 mb-6"
            >
              <div className="bg-[#0a0a0c] rounded-xl p-4">
                <Star className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-black text-[#137fec]">{score}</p>
                <p className="text-xs text-slate-500">Points</p>
              </div>
              <div className="bg-[#0a0a0c] rounded-xl p-4">
                <Check className="w-5 h-5 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-black text-green-400">{correctCount}/{totalQuestions}</p>
                <p className="text-xs text-slate-500">Correct</p>
              </div>
              <div className="bg-[#0a0a0c] rounded-xl p-4">
                <Zap className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                <p className={`text-2xl font-black ${grade.color}`}>{grade.letter}</p>
                <p className="text-xs text-slate-500">Grade</p>
              </div>
            </motion.div>

            {/* Encouragement */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-[#137fec]/10 to-purple-500/10 rounded-xl p-4 mb-6 border border-[#137fec]/20"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-pink-400" />
                <span className="text-sm font-semibold text-slate-300">Keep Learning!</span>
              </div>
              <p className="text-xs text-slate-400">
                Every question you answer makes you smarter. Come back anytime to test your knowledge!
              </p>
            </motion.div>

            <div className="flex gap-4">
              <Button
                onClick={handleRestart}
                className="flex-1 bg-[#137fec] hover:bg-[#137fec]/90 h-12"
                data-testid="button-restart-quiz"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
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
              <h2 className="text-lg font-bold tracking-tight">QuizMaster AI</h2>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Streak indicator */}
            {streak >= 2 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30"
              >
                <Zap className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-sm font-bold text-orange-400">{streak} streak!</span>
              </motion.div>
            )}
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
                  {(message.type === "ai" || message.type === "hint" || message.type === "system" || message.type === "funfact") && (
                    <div className={clsx(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      message.type === "hint" && "bg-amber-500",
                      message.type === "funfact" && "bg-purple-500",
                      message.type === "system" && message.isCorrect && "bg-green-500",
                      message.type === "system" && message.isCorrect === false && "bg-red-500",
                      message.type === "ai" && "bg-[#137fec]"
                    )}>
                      {message.type === "hint" && <Lightbulb className="w-4 h-4 text-white" />}
                      {message.type === "funfact" && <Star className="w-4 h-4 text-white" />}
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
                    message.type === "funfact" && "bg-purple-500/10 border border-purple-500/30 rounded-tl-sm",
                    message.type === "system" && message.isCorrect && "bg-green-500/10 border border-green-500/30 rounded-tl-sm",
                    message.type === "system" && message.isCorrect === false && "bg-red-500/10 border border-red-500/30 rounded-tl-sm"
                  )}>
                    <p className={clsx(
                      "text-sm whitespace-pre-wrap",
                      message.type === "user" && "text-white",
                      message.type === "ai" && "text-slate-300",
                      message.type === "hint" && "text-amber-200",
                      message.type === "funfact" && "text-purple-200",
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
                <span className="text-xs text-slate-500">Using hints reduces points earned (-3 pts each)</span>
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    disabled={showResult !== null}
                    className="pl-11 bg-[#0a0a0c] border-[#283039] focus-visible:ring-[#137fec] h-12 rounded-xl"
                    onKeyDown={(e) => e.key === "Enter" && !showResult && handleSubmitAnswer()}
                    data-testid="input-answer"
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
