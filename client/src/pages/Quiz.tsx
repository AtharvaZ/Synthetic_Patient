import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Stethoscope, Lightbulb, ArrowRight, Check, X, 
  RotateCcw, Trophy, Home, Brain, Send, Sparkles, Star, Zap, Heart,
  Globe, Beaker, BookOpen, Leaf, Palette, Clock, Target, Award,
  TrendingUp, Flame, Medal, Crown, Gift
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

// Category icons mapping
const categoryIcons: Record<string, any> = {
  "Geography": Globe,
  "Science": Beaker,
  "History": BookOpen,
  "Nature": Leaf,
  "Art & History": Palette,
};

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
    funFact: "Paris has over 1,800 registered bakeries!",
    difficulty: "Easy"
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
    funFact: "A day on Mars is about 40 minutes longer than on Earth!",
    difficulty: "Easy"
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
    funFact: "The Mona Lisa has no eyebrows - it was fashionable to shave them off in Renaissance Florence!",
    difficulty: "Medium"
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
    funFact: "The Pacific Ocean is larger than all the land on Earth combined!",
    difficulty: "Easy"
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
    funFact: "Babies are born with about 270 bones, but many fuse together as they grow!",
    difficulty: "Medium"
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
    funFact: "All the gold ever mined could fit into a cube about 21 meters on each side!",
    difficulty: "Medium"
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
    funFact: "The famous V-J Day kiss photo was taken in Times Square on August 14, 1945!",
    difficulty: "Easy"
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
    funFact: "Cheetahs can accelerate from 0 to 60 mph in just 3 seconds!",
    difficulty: "Easy"
  }
];

// Encouragement messages for correct answers
const correctMessages = [
  "Brilliant! You're on fire!",
  "Amazing work! Keep it up!",
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

// Achievement definitions
const achievements = [
  { id: "first_correct", name: "First Blood", icon: Target, description: "Get your first correct answer", color: "text-green-400" },
  { id: "streak_3", name: "On Fire", icon: Flame, description: "Get 3 correct in a row", color: "text-orange-400" },
  { id: "streak_5", name: "Unstoppable", icon: Zap, description: "Get 5 correct in a row", color: "text-yellow-400" },
  { id: "no_hints", name: "Solo Master", icon: Medal, description: "Answer correctly without hints", color: "text-purple-400" },
  { id: "perfect", name: "Perfectionist", icon: Crown, description: "Get 100% correct", color: "text-amber-400" },
];

type Message = {
  id: string;
  type: "ai" | "user" | "system" | "hint" | "funfact" | "achievement";
  content: string;
  isCorrect?: boolean;
  achievementIcon?: any;
};

// Animated number component
function AnimatedNumber({ value, duration = 500 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startValue + (value - startValue) * eased));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);
  
  return <>{displayValue}</>;
}

// Circular progress component
function CircularProgress({ value, size = 60, strokeWidth = 6 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#137fec" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold">{Math.round(value)}%</span>
      </div>
    </div>
  );
}

// Difficulty badge component
function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    Easy: "bg-green-500/20 text-green-400 border-green-500/30",
    Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Hard: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[difficulty]}`}>
      {difficulty}
    </span>
  );
}

export default function Quiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [showResult, setShowResult] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [showAchievement, setShowAchievement] = useState<typeof achievements[0] | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = quizData[currentQuestionIndex];
  const totalQuestions = quizData.length;
  const progress = ((answeredQuestions.length) / totalQuestions) * 100;
  const CategoryIcon = categoryIcons[currentQuestion.category] || Brain;

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  // Check and unlock achievements
  const checkAchievements = (newCorrectCount: number, newStreak: number, hintsUsedThisQuestion: number) => {
    const newAchievements: string[] = [];
    
    if (newCorrectCount === 1 && !unlockedAchievements.includes("first_correct")) {
      newAchievements.push("first_correct");
    }
    if (newStreak >= 3 && !unlockedAchievements.includes("streak_3")) {
      newAchievements.push("streak_3");
    }
    if (newStreak >= 5 && !unlockedAchievements.includes("streak_5")) {
      newAchievements.push("streak_5");
    }
    if (hintsUsedThisQuestion === 0 && !unlockedAchievements.includes("no_hints") && newCorrectCount > 0) {
      newAchievements.push("no_hints");
    }
    
    if (newAchievements.length > 0) {
      setUnlockedAchievements(prev => [...prev, ...newAchievements]);
      
      // Show achievement notification
      const achievement = achievements.find(a => a.id === newAchievements[0]);
      if (achievement) {
        setShowAchievement(achievement);
        setTimeout(() => setShowAchievement(null), 3000);
        
        // Add achievement message
        const achievementMessage: Message = {
          id: `achievement-${Date.now()}`,
          type: "achievement",
          content: `Achievement Unlocked: ${achievement.name}!`,
          achievementIcon: achievement.icon
        };
        setMessages(prev => [...prev, achievementMessage]);
      }
    }
  };

  const getRandomMessage = (isCorrect: boolean) => {
    const messageList = isCorrect ? correctMessages : incorrectMessages;
    return messageList[Math.floor(Math.random() * messageList.length)];
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
        
        const newStreak = streak + 1;
        const newCorrectCount = correctCount + 1;
        
        setScore(prev => prev + pointsEarned);
        setStreak(newStreak);
        setMaxStreak(Math.max(maxStreak, newStreak));
        setCorrectCount(newCorrectCount);
        
        checkAchievements(newCorrectCount, newStreak, hintsUsed);
        
        const encouragement = getRandomMessage(true);
        const streakText = streak >= 2 ? `\n\n**${streak + 1} correct in a row!** (+${streakBonus} bonus points)` : "";
        
        const correctMessage: Message = {
          id: `system-${Date.now()}`,
          type: "system",
          content: `${encouragement}\n\nThe answer is **${currentQuestion.answer}**! You earned **+${pointsEarned} points**!${streakText}`,
          isCorrect: true
        };
        setMessages(prev => [...prev, correctMessage]);

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
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Check for perfect score achievement
      if (correctCount === totalQuestions - 1 && showResult === "correct") {
        if (!unlockedAchievements.includes("perfect")) {
          setUnlockedAchievements(prev => [...prev, "perfect"]);
        }
      }
      
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
      setTotalHintsUsed(prev => prev + 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setHintsUsed(0);
    setTotalHintsUsed(0);
    setShowResult(null);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setQuizCompleted(false);
    setAnsweredQuestions([]);
    setMessages([]);
    setUnlockedAchievements([]);
    setTimeElapsed(0);
    
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
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
    if (percentage >= 90) return { letter: "A+", color: "text-green-400", bgColor: "from-green-500/20 to-emerald-500/20", message: "Outstanding! You're a quiz master!" };
    if (percentage >= 80) return { letter: "A", color: "text-green-400", bgColor: "from-green-500/20 to-teal-500/20", message: "Excellent work! Very impressive!" };
    if (percentage >= 70) return { letter: "B", color: "text-blue-400", bgColor: "from-blue-500/20 to-cyan-500/20", message: "Great job! Keep learning!" };
    if (percentage >= 60) return { letter: "C", color: "text-yellow-400", bgColor: "from-yellow-500/20 to-orange-500/20", message: "Good effort! Practice makes perfect!" };
    return { letter: "D", color: "text-orange-400", bgColor: "from-orange-500/20 to-red-500/20", message: "Keep trying! Every quiz makes you smarter!" };
  };

  if (quizCompleted) {
    const grade = getGrade();
    const accuracy = Math.round((correctCount / totalQuestions) * 100);
    const earnedAchievements = achievements.filter(a => unlockedAchievements.includes(a.id));
    
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <div className="bg-[#161618] border border-[#283039] rounded-2xl p-8 text-center relative overflow-hidden">
            {/* Animated background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${grade.bgColor} opacity-30`} />
            
            {/* Confetti-like decorations */}
            <motion.div 
              animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute top-4 left-4 w-3 h-3 bg-yellow-400 rounded-full" 
            />
            <motion.div 
              animate={{ y: [0, -8, 0], rotate: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="absolute top-8 right-8 w-2 h-2 bg-blue-400 rounded-full" 
            />
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              className="absolute bottom-12 left-8 w-2 h-2 bg-green-400 rounded-full" 
            />
            <motion.div 
              animate={{ y: [0, -12, 0], rotate: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 2.2 }}
              className="absolute top-16 right-12 w-2 h-2 bg-pink-400 rounded-full" 
            />
            <motion.div 
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute bottom-20 right-6 w-3 h-3 bg-purple-400 rounded-full" 
            />
            
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2, duration: 0.8 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#137fec] to-purple-500 flex items-center justify-center shadow-lg shadow-[#137fec]/30"
              >
                <Trophy className="w-12 h-12 text-white" />
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
              
              {/* Grade Display */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="mb-6"
              >
                <div className={`text-7xl font-black ${grade.color} drop-shadow-lg`}>
                  {grade.letter}
                </div>
              </motion.div>
              
              {/* Stats Grid */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-4 gap-2 mb-6"
              >
                <div className="bg-[#0a0a0c] rounded-xl p-3">
                  <Star className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                  <p className="text-xl font-black text-[#137fec]">{score}</p>
                  <p className="text-[10px] text-slate-500">Points</p>
                </div>
                <div className="bg-[#0a0a0c] rounded-xl p-3">
                  <Check className="w-4 h-4 text-green-400 mx-auto mb-1" />
                  <p className="text-xl font-black text-green-400">{correctCount}/{totalQuestions}</p>
                  <p className="text-[10px] text-slate-500">Correct</p>
                </div>
                <div className="bg-[#0a0a0c] rounded-xl p-3">
                  <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                  <p className="text-xl font-black text-orange-400">{maxStreak}</p>
                  <p className="text-[10px] text-slate-500">Best Streak</p>
                </div>
                <div className="bg-[#0a0a0c] rounded-xl p-3">
                  <Clock className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                  <p className="text-xl font-black text-cyan-400">{formatTime(timeElapsed)}</p>
                  <p className="text-[10px] text-slate-500">Time</p>
                </div>
              </motion.div>

              {/* Accuracy Bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Accuracy</span>
                  <span className="text-sm font-bold text-[#137fec]">{accuracy}%</span>
                </div>
                <div className="h-3 bg-[#0a0a0c] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${accuracy}%` }}
                    transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#137fec] to-purple-500 rounded-full"
                  />
                </div>
              </motion.div>
              
              {/* Achievements */}
              {earnedAchievements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="mb-6"
                >
                  <p className="text-sm text-slate-400 mb-3">Achievements Unlocked</p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {earnedAchievements.map(achievement => {
                      const AchievementIcon = achievement.icon;
                      return (
                        <div
                          key={achievement.id}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0a0a0c] border border-[#283039] ${achievement.color}`}
                        >
                          <AchievementIcon className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{achievement.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Encouragement */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
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
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0c] text-white flex flex-col">
      {/* Achievement Popup */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 shadow-lg shadow-yellow-500/20">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <showAchievement.icon className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-left">
                <p className="text-xs text-yellow-400/80">Achievement Unlocked!</p>
                <p className="font-bold text-yellow-400">{showAchievement.name}</p>
              </div>
              <Gift className="w-5 h-5 text-yellow-400 animate-bounce" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          
          <div className="flex items-center gap-3">
            {/* Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161618] border border-[#283039]">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-sm font-mono text-cyan-400">{formatTime(timeElapsed)}</span>
            </div>
            
            {/* Streak indicator */}
            <AnimatePresence>
              {streak >= 2 && (
                <motion.div 
                  initial={{ scale: 0, x: -20 }}
                  animate={{ scale: 1, x: 0 }}
                  exit={{ scale: 0, x: -20 }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30"
                >
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-sm font-bold text-orange-400">{streak}</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Score */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#161618] border border-[#283039]">
              <Trophy className="w-4 h-4 text-[#137fec]" />
              <span className="font-bold text-[#137fec]">
                <AnimatedNumber value={score} />
              </span>
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
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#137fec]/20 flex items-center justify-center">
                  <CategoryIcon className="w-4 h-4 text-[#137fec]" />
                </div>
                <span className="text-sm font-medium text-slate-400">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#137fec]/10 border border-[#137fec]/20 text-[#137fec] text-xs font-bold">
                {currentQuestion.category}
              </span>
              <DifficultyBadge difficulty={currentQuestion.difficulty} />
            </div>
            <div className="flex items-center gap-3">
              <CircularProgress value={progress} size={40} strokeWidth={4} />
            </div>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="relative">
            <div className="h-2 bg-[#283039] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#137fec] via-purple-500 to-[#137fec] rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </motion.div>
            </div>
            {/* Question dots */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-1">
              {quizData.map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={clsx(
                    "w-2 h-2 rounded-full transition-all",
                    answeredQuestions.includes(index) && "bg-green-400 shadow-sm shadow-green-400/50",
                    index === currentQuestionIndex && !answeredQuestions.includes(index) && "bg-[#137fec] shadow-sm shadow-[#137fec]/50 scale-125",
                    !answeredQuestions.includes(index) && index !== currentQuestionIndex && "bg-[#283039]"
                  )}
                />
              ))}
            </div>
          </div>
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
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={clsx(
                    "flex gap-3",
                    message.type === "user" && "justify-end"
                  )}
                >
                  {/* AI Avatar */}
                  {(message.type === "ai" || message.type === "hint" || message.type === "system" || message.type === "funfact" || message.type === "achievement") && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                      className={clsx(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        message.type === "hint" && "bg-amber-500",
                        message.type === "funfact" && "bg-purple-500",
                        message.type === "achievement" && "bg-yellow-500",
                        message.type === "system" && message.isCorrect && "bg-green-500",
                        message.type === "system" && message.isCorrect === false && "bg-red-500",
                        message.type === "ai" && "bg-[#137fec]"
                      )}>
                      {message.type === "hint" && <Lightbulb className="w-4 h-4 text-white" />}
                      {message.type === "funfact" && <Star className="w-4 h-4 text-white" />}
                      {message.type === "achievement" && <Award className="w-4 h-4 text-white" />}
                      {message.type === "system" && message.isCorrect && <Check className="w-4 h-4 text-white" />}
                      {message.type === "system" && message.isCorrect === false && <X className="w-4 h-4 text-white" />}
                      {message.type === "ai" && <Brain className="w-4 h-4 text-white" />}
                    </motion.div>
                  )}
                  
                  {/* Message Bubble */}
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={clsx(
                      "rounded-2xl p-4 max-w-xl",
                      message.type === "user" && "bg-[#137fec] rounded-tr-sm",
                      message.type === "ai" && "bg-[#161618] border border-[#283039] rounded-tl-sm",
                      message.type === "hint" && "bg-amber-500/10 border border-amber-500/30 rounded-tl-sm",
                      message.type === "funfact" && "bg-purple-500/10 border border-purple-500/30 rounded-tl-sm",
                      message.type === "achievement" && "bg-yellow-500/10 border border-yellow-500/30 rounded-tl-sm",
                      message.type === "system" && message.isCorrect && "bg-green-500/10 border border-green-500/30 rounded-tl-sm",
                      message.type === "system" && message.isCorrect === false && "bg-red-500/10 border border-red-500/30 rounded-tl-sm"
                    )}>
                    <p className={clsx(
                      "text-sm whitespace-pre-wrap",
                      message.type === "user" && "text-white",
                      message.type === "ai" && "text-slate-300",
                      message.type === "hint" && "text-amber-200",
                      message.type === "funfact" && "text-purple-200",
                      message.type === "achievement" && "text-yellow-200",
                      message.type === "system" && message.isCorrect && "text-green-400",
                      message.type === "system" && message.isCorrect === false && "text-red-400"
                    )}>
                      {message.content.split('**').map((part, i) => 
                        i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part
                      )}
                    </p>
                  </motion.div>
                  
                  {/* User Avatar */}
                  {message.type === "user" && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0"
                    >
                      <span className="text-xs font-bold">You</span>
                    </motion.div>
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
                  className="bg-[#137fec] hover:bg-[#137fec]/90 px-6 shadow-lg shadow-[#137fec]/20"
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
                <div className="flex items-center gap-1">
                  {[...Array(currentQuestion.hints.length)].map((_, i) => (
                    <div
                      key={i}
                      className={clsx(
                        "w-2 h-2 rounded-full transition-all",
                        i < hintsUsed ? "bg-amber-500" : "bg-[#283039]"
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500">Using hints reduces points (-3 pts each)</span>
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
                  className="bg-[#137fec] hover:bg-[#137fec]/90 h-12 px-6 rounded-xl shadow-lg shadow-[#137fec]/20"
                  data-testid="button-submit-answer"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
