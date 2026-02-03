import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Stethoscope,
  Brain,
  Target,
  Award,
  ArrowRight,
  Activity,
  Zap,
  Heart,
  Pill,
  Microscope,
  Thermometer,
  Clipboard,
  GraduationCap,
  ChevronRight,
  Star,
  Trophy,
  Sparkles,
  BookOpen,
  Globe,
  Palette,
  Calculator,
  FlaskConical,
  Sun,
  Moon,
  MessageCircle,
  User,
  Wind,
  Bone,
  Eye,
  Ear,
  Bug,
  Smile,
  Droplets,
  Gauge,
} from "lucide-react";
import { useState, useEffect } from "react";

// Animated counter component
function AnimatedCounter({
  end,
  duration = 2000,
}: {
  end: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <>{count}</>;
}

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-[#0a0a0c] text-white" : "bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900"} selection:bg-primary/30 transition-colors duration-300`}
    >
      {/* Navigation */}
      <header
        className={`sticky top-0 z-50 w-full border-b ${isDarkMode ? "border-[#283039] bg-[#0a0a0c]/80" : "border-slate-200 bg-white/80"} backdrop-blur-md`}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-gradient-to-br from-[#137fec] to-teal-500 rounded flex items-center justify-center text-white">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">ExamenAI</h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? "hover:bg-white/10" : "hover:bg-slate-100"}`}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>
            <Link href="/dashboard">
              <span
                className={`text-sm font-medium ${isDarkMode ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"} transition-colors cursor-pointer`}
              >
                Dashboard
              </span>
            </Link>
            <Link href="/quiz">
              <Button
                className="bg-gradient-to-r from-[#137fec] to-teal-500 hover:opacity-90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105"
                data-testid="button-get-started"
              >
                Start Quiz
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#137fec]/20 rounded-full blur-[120px] opacity-50 mix-blend-screen" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px] opacity-30 mix-blend-screen" />
          <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-cyan-500/15 rounded-full blur-[100px] opacity-40 mix-blend-screen" />
          <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] opacity-30 mix-blend-screen" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDarkMode ? "bg-white/5 border border-white/10" : "bg-white border border-slate-200 shadow-sm"} mb-8`}
          >
            <Zap className="w-4 h-4 text-orange-500" />
            <span
              className={`text-sm font-medium ${isDarkMode ? "text-white/80" : "text-slate-600"}`}
            >
              AI-Simulated Patient Conversations
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Master the Art of <br />
            <span className="bg-gradient-to-r from-[#137fec] via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Clinical Diagnosis
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`text-lg ${isDarkMode ? "text-slate-400" : "text-slate-600"} max-w-2xl mx-auto mb-10`}
          >
            Train with real-world clinical cases. Chat with AI patients and
            sharpen your diagnostic skills.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/dashboard">
              <Button
                size="lg"
                className="h-14 px-10 text-lg rounded-2xl bg-gradient-to-r from-[#137fec] via-teal-500 to-cyan-500 hover:opacity-90 shadow-lg shadow-teal-500/25"
                data-testid="button-start-learning"
              >
                Start Learning Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            <div className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-[#137fec] to-cyan-400 bg-clip-text text-transparent">
                <AnimatedCounter end={62} />+
              </p>
              <p
                className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                Patient Cases
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
                <AnimatedCounter end={12} />
              </p>
              <p
                className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                Categories
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                <AnimatedCounter end={150} />+
              </p>
              <p
                className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                Symptoms
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Medical Categories Covered - Non-clickable */}
      <section
        className={`py-16 border-y ${isDarkMode ? "border-[#283039]" : "border-slate-200"}`}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2
              className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              Conditions Covered
            </h2>
            <p
              className={`${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              Practice diagnosing common GP-level conditions
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            <CategoryBadge
              icon={Heart}
              label="Cardiovascular"
              color="red"
              isDarkMode={isDarkMode}
            />
            <CategoryBadge
              icon={Wind}
              label="Respiratory"
              color="cyan"
              isDarkMode={isDarkMode}
            />
            <CategoryBadge
              icon={Brain}
              label="Neurological"
              color="purple"
              isDarkMode={isDarkMode}
            />
            <CategoryBadge
              icon={Pill}
              label="Gastrointestinal"
              color="green"
              isDarkMode={isDarkMode}
            />
            <CategoryBadge
              icon={Bone}
              label="Musculoskeletal"
              color="orange"
              isDarkMode={isDarkMode}
            />
            <CategoryBadge
              icon={Droplets}
              label="Dermatological"
              color="pink"
              isDarkMode={isDarkMode}
            />
            <CategoryBadge
              icon={Ear}
              label="ENT"
              color="teal"
              isDarkMode={isDarkMode}
            />
            <CategoryBadge
              icon={Activity}
              label="Genitourinary"
              color="blue"
              isDarkMode={isDarkMode}
            />
            <CategoryBadge
              icon={Gauge}
              label="Endocrine"
              color="amber"
              isDarkMode={isDarkMode}
            />
            <CategoryBadge
              icon={Smile}
              label="Mental Health"
              color="indigo"
              isDarkMode={isDarkMode}
            />
            <CategoryBadge
              icon={Bug}
              label="Infectious"
              color="lime"
              isDarkMode={isDarkMode}
            />
            <CategoryBadge
              icon={Eye}
              label="Ophthalmology"
              color="sky"
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </section>

      {/* Learning Journey Map */}
      <section
        className={`py-20 border-t ${isDarkMode ? "border-white/5" : "border-slate-100"} overflow-hidden`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className={`text-3xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              The Learning Journey
            </h2>
            <p
              className={`${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              Follow the path to diagnostic mastery
            </p>
          </div>

          {/* Map Container */}
          <div className="relative">
            {/* Map Nodes */}
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
              {/* Node 1 - Meet Patient */}
              <motion.div
                className="flex flex-col items-center"
                initial={{ y: 0 }}
                whileInView={{ y: [0, -20, 0] }}
                transition={{ delay: 0, duration: 0.5, ease: "easeOut" }}
                viewport={{ once: false, amount: 0.5 }}
              >
                <div className="relative mb-4">
                  <div className="absolute -inset-3 bg-[#137fec]/20 rounded-full blur-xl" />
                  <div
                    className={`relative w-20 h-20 rounded-full bg-gradient-to-br from-[#137fec] to-cyan-500 flex items-center justify-center shadow-lg shadow-[#137fec]/30 border-4 ${isDarkMode ? "border-[#0a0a0c]" : "border-white"}`}
                  >
                    <Clipboard className="w-8 h-8 text-white" />
                  </div>
                  <div
                    className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#137fec] flex items-center justify-center text-sm font-bold border-2 ${isDarkMode ? "border-[#0a0a0c]" : "border-white"} text-white`}
                  >
                    1
                  </div>
                </div>
                <h3
                  className={`font-bold text-lg mb-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  Meet Patient
                </h3>
                <p
                  className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"} text-center`}
                >
                  Review initial presentation
                </p>
              </motion.div>

              {/* Node 2 - Investigate */}
              <motion.div
                className="flex flex-col items-center"
                initial={{ y: 0 }}
                whileInView={{ y: [0, -20, 0] }}
                transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
                viewport={{ once: false, amount: 0.5 }}
              >
                <div className="relative mb-4">
                  <div className="absolute -inset-3 bg-teal-500/20 rounded-full blur-xl" />
                  <div
                    className={`relative w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30 border-4 ${isDarkMode ? "border-[#0a0a0c]" : "border-white"}`}
                  >
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <div
                    className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-sm font-bold border-2 ${isDarkMode ? "border-[#0a0a0c]" : "border-white"} text-white`}
                  >
                    2
                  </div>
                </div>
                <h3
                  className={`font-bold text-lg mb-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  Investigate
                </h3>
                <p
                  className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"} text-center`}
                >
                  Ask patient questions
                </p>
              </motion.div>

              {/* Node 3 - Decide */}
              <motion.div
                className="flex flex-col items-center"
                initial={{ y: 0 }}
                whileInView={{ y: [0, -20, 0] }}
                transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                viewport={{ once: false, amount: 0.5 }}
              >
                <div className="relative mb-4">
                  <div className="absolute -inset-3 bg-sky-500/20 rounded-full blur-xl" />
                  <div
                    className={`relative w-20 h-20 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30 border-4 ${isDarkMode ? "border-[#0a0a0c]" : "border-white"}`}
                  >
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div
                    className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-sm font-bold border-2 ${isDarkMode ? "border-[#0a0a0c]" : "border-white"} text-white`}
                  >
                    3
                  </div>
                </div>
                <h3
                  className={`font-bold text-lg mb-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  Decide
                </h3>
                <p
                  className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"} text-center`}
                >
                  Submit your diagnosis
                </p>
              </motion.div>

              {/* Node 4 - Improve */}
              <motion.div
                className="flex flex-col items-center"
                initial={{ y: 0 }}
                whileInView={{ y: [0, -20, 0] }}
                transition={{ delay: 0.45, duration: 0.5, ease: "easeOut" }}
                viewport={{ once: false, amount: 0.5 }}
              >
                <div className="relative mb-4">
                  <div className="absolute -inset-3 bg-emerald-500/20 rounded-full blur-xl" />
                  <div
                    className={`relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 border-4 ${isDarkMode ? "border-[#0a0a0c]" : "border-white"}`}
                  >
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <div
                    className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold border-2 ${isDarkMode ? "border-[#0a0a0c]" : "border-white"} text-white`}
                  >
                    4
                  </div>
                </div>
                <h3
                  className={`font-bold text-lg mb-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  Improve
                </h3>
                <p
                  className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"} text-center`}
                >
                  Learn from feedback
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Preview */}
      <section
        className={`py-20 ${isDarkMode ? "bg-[#0d0d10]" : "bg-slate-50"} border-t ${isDarkMode ? "border-white/5" : "border-slate-100"}`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className={`text-3xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              Interactive Patient Chat
            </h2>
            <p
              className={`${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              Ask questions and gather information like a real consultation
            </p>
          </div>

          {/* Mock Chat Preview */}
          <div
            className={`${isDarkMode ? "bg-[#161618] border-[#283039]" : "bg-white border-slate-200"} rounded-2xl border overflow-hidden shadow-xl`}
          >
            <div
              className={`p-4 border-b ${isDarkMode ? "border-[#283039]" : "border-slate-200"} flex items-center gap-3`}
            >
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span
                className={`ml-4 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                Patient Consultation
              </span>
            </div>
            <div className="p-6 space-y-4">
              {/* Patient Message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div
                  className={`${isDarkMode ? "bg-[#0a0a0c]" : "bg-slate-100"} rounded-2xl rounded-tl-sm p-4 max-w-md`}
                >
                  <p
                    className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                  >
                    Doctor, I've been having terrible headaches for the past
                    week. They're mostly on one side and I feel nauseous too.
                  </p>
                </div>
              </div>

              {/* Doctor Question */}
              <div className="flex gap-3 justify-end">
                <div className="bg-gradient-to-r from-[#137fec] to-teal-500 rounded-2xl rounded-tr-sm p-4 max-w-md">
                  <p className="text-sm text-white">
                    Do you notice any sensitivity to light or sound during these
                    headaches?
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#137fec] to-teal-500 flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Patient Response */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div
                  className={`${isDarkMode ? "bg-[#0a0a0c]" : "bg-slate-100"} rounded-2xl rounded-tl-sm p-4 max-w-md`}
                >
                  <p
                    className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                  >
                    Yes! Bright lights make it much worse, and I have to lie
                    down in a dark room.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`py-8 border-t ${isDarkMode ? "border-white/5 bg-[#0d0d10]" : "border-slate-100 bg-white"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-[#137fec]/10 to-teal-500/10 p-2 rounded-xl">
              <Stethoscope className="w-5 h-5 text-[#137fec]" />
            </div>
            <span
              className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              Examen
            </span>
          </div>
          <p
            className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
          >
            © 2026 Examen. Educational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}

function CategoryBadge({
  icon: Icon,
  label,
  color,
  isDarkMode,
}: {
  icon: any;
  label: string;
  color: string;
  isDarkMode: boolean;
}) {
  const colors: Record<string, string> = {
    red: `${isDarkMode ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-red-50 text-red-600 border-red-200"}`,
    purple: `${isDarkMode ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-purple-50 text-purple-600 border-purple-200"}`,
    cyan: `${isDarkMode ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-cyan-50 text-cyan-600 border-cyan-200"}`,
    green: `${isDarkMode ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-green-50 text-green-600 border-green-200"}`,
    orange: `${isDarkMode ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-orange-50 text-orange-600 border-orange-200"}`,
    pink: `${isDarkMode ? "bg-pink-500/10 text-pink-400 border-pink-500/20" : "bg-pink-50 text-pink-600 border-pink-200"}`,
    teal: `${isDarkMode ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-teal-50 text-teal-600 border-teal-200"}`,
    blue: `${isDarkMode ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-600 border-blue-200"}`,
    amber: `${isDarkMode ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-600 border-amber-200"}`,
    indigo: `${isDarkMode ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-indigo-50 text-indigo-600 border-indigo-200"}`,
    lime: `${isDarkMode ? "bg-lime-500/10 text-lime-400 border-lime-500/20" : "bg-lime-50 text-lime-600 border-lime-200"}`,
    sky: `${isDarkMode ? "bg-sky-500/10 text-sky-400 border-sky-500/20" : "bg-sky-50 text-sky-600 border-sky-200"}`,
  };

  return (
    <div
      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border ${colors[color]}`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium text-sm">{label}</span>
    </div>
  );
}
