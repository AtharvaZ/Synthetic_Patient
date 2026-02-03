import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Stethoscope,
  Brain,
  Target,
  ArrowRight,
  Activity,
  Zap,
  Heart,
  Pill,
  Clipboard,
  GraduationCap,
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
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

function AnimatedCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
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
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? "bg-[hsl(220,15%,5%)]" : "bg-[hsl(220,20%,97%)]"}`}>
      {/* Noise overlay for texture */}
      <div className="noise-overlay" />
      
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] ${isDarkMode ? "bg-[hsl(168,84%,45%)]/8" : "bg-[hsl(168,84%,45%)]/6"}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] ${isDarkMode ? "bg-[hsl(280,75%,60%)]/6" : "bg-[hsl(280,75%,60%)]/4"}`} />
      </div>

      {/* Navigation */}
      <header className={`sticky top-0 z-50 w-full backdrop-blur-xl transition-colors duration-300 ${isDarkMode ? "bg-[hsl(220,15%,5%)]/80 border-b border-white/[0.06]" : "bg-white/80 border-b border-slate-200/80"}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(168,84%,45%)] to-[hsl(200,80%,50%)] rounded-xl blur-lg opacity-50" />
              <div className="relative size-9 bg-gradient-to-br from-[hsl(168,84%,45%)] to-[hsl(200,80%,50%)] rounded-xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-[hsl(220,15%,5%)]" />
              </div>
            </div>
            <span className={`text-xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              ClinIQ
            </span>
          </motion.div>
          
          <div className="flex items-center gap-2">
            <motion.button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all duration-200 ${isDarkMode ? "hover:bg-white/[0.06]" : "hover:bg-slate-100"}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </motion.button>
            <Link href="/dashboard">
              <motion.span
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${isDarkMode ? "text-slate-300 hover:text-white hover:bg-white/[0.06]" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Dashboard
              </motion.span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 lg:pt-28 lg:pb-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${isDarkMode ? "bg-white/[0.06] border border-white/[0.08] text-white/80" : "bg-white border border-slate-200 text-slate-600 shadow-sm"}`}>
              <Sparkles className="w-4 h-4 text-[hsl(168,84%,45%)]" />
              AI-Powered Clinical Training
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Master the Art of{" "}
            <span className="text-gradient-primary">
              Clinical Diagnosis
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`text-lg lg:text-xl max-w-2xl mx-auto mb-10 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
          >
            Practice with real clinical cases. Interview AI patients. Build the diagnostic intuition that textbooks can't teach.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/dashboard">
              <button className="btn-primary inline-flex items-center gap-2 text-base">
                Start Learning
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 flex justify-center gap-12 lg:gap-16"
          >
            {[
              { value: 62, label: "Patient Cases", suffix: "+" },
              { value: 12, label: "Specialties", suffix: "" },
              { value: 150, label: "Symptoms", suffix: "+" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-gradient-primary">
                  <AnimatedCounter end={stat.value} />{stat.suffix}
                </p>
                <p className={`text-sm mt-1 ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className={`py-16 border-y transition-colors duration-300 ${isDarkMode ? "border-white/[0.06]" : "border-slate-200/80"}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Conditions Covered
            </h2>
            <p className={`${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
              Practice diagnosing common GP-level conditions
            </p>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {[
              { icon: Heart, label: "Cardio", color: "rose" },
              { icon: Wind, label: "Respiratory", color: "cyan" },
              { icon: Brain, label: "Neuro", color: "violet" },
              { icon: Pill, label: "GI", color: "emerald" },
              { icon: Bone, label: "Ortho", color: "orange" },
              { icon: Droplets, label: "Derm", color: "pink" },
              { icon: Ear, label: "ENT", color: "teal" },
              { icon: Activity, label: "Urology", color: "blue" },
              { icon: Gauge, label: "Endocrine", color: "amber" },
              { icon: Smile, label: "Psych", color: "indigo" },
              { icon: Bug, label: "Infectious", color: "lime" },
              { icon: Eye, label: "Ophthal", color: "sky" },
            ].map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.4 }}
                viewport={{ once: true }}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 ${isDarkMode ? "hover:bg-white/[0.04]" : "hover:bg-slate-50"}`}
              >
                <div className={`p-2.5 rounded-xl ${isDarkMode ? "bg-white/[0.06]" : "bg-slate-100"}`}>
                  <cat.icon className={`w-5 h-5 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`} />
                </div>
                <span className={`text-xs font-medium ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                  {cat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              How It Works
            </h2>
            <p className={`${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
              Four steps to diagnostic mastery
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Clipboard, title: "Meet Patient", desc: "Review the presenting complaint", color: "from-[hsl(168,84%,45%)] to-[hsl(180,70%,45%)]" },
              { icon: MessageCircle, title: "Investigate", desc: "Ask targeted questions", color: "from-[hsl(200,80%,50%)] to-[hsl(220,75%,55%)]" },
              { icon: Target, title: "Diagnose", desc: "Submit your diagnosis", color: "from-[hsl(280,75%,60%)] to-[hsl(300,70%,55%)]" },
              { icon: GraduationCap, title: "Learn", desc: "Get AI-powered feedback", color: "from-[hsl(35,90%,55%)] to-[hsl(15,85%,55%)]" },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className={`relative p-6 rounded-2xl transition-all duration-300 hover-lift ${isDarkMode ? "bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12]" : "bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"}`}
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${step.color} mb-4`}>
                  <step.icon className="w-5 h-5 text-white" />
                </div>
                <span className={`absolute top-5 right-5 text-xs font-bold ${isDarkMode ? "text-slate-600" : "text-slate-300"}`}>
                  0{i + 1}
                </span>
                <h3 className={`text-lg font-semibold mb-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                  {step.title}
                </h3>
                <p className={`text-sm ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Chat Preview */}
      <section className={`py-20 transition-colors duration-300 ${isDarkMode ? "bg-[hsl(220,12%,6%)]" : "bg-slate-50"}`}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Interactive Consultations
            </h2>
            <p className={`${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
              Chat naturally with AI patients
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className={`rounded-2xl overflow-hidden ${isDarkMode ? "bg-[hsl(220,12%,8%)] border border-white/[0.08]" : "bg-white border border-slate-200 shadow-xl"}`}
          >
            {/* Window controls */}
            <div className={`px-4 py-3 border-b flex items-center gap-2 ${isDarkMode ? "border-white/[0.06]" : "border-slate-100"}`}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[hsl(0,72%,51%)]" />
                <div className="w-3 h-3 rounded-full bg-[hsl(45,93%,47%)]" />
                <div className="w-3 h-3 rounded-full bg-[hsl(142,71%,45%)]" />
              </div>
              <span className={`text-xs font-medium ml-2 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                Patient Consultation
              </span>
            </div>

            {/* Chat messages */}
            <div className="p-6 space-y-4">
              {/* Patient message */}
              <motion.div 
                className="flex gap-3"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className={`rounded-2xl rounded-tl-md px-4 py-3 max-w-sm ${isDarkMode ? "bg-white/[0.06]" : "bg-slate-100"}`}>
                  <p className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    Doctor, I've been having terrible headaches for a week. They're mostly on one side and I feel nauseous.
                  </p>
                </div>
              </motion.div>

              {/* Doctor message */}
              <motion.div 
                className="flex gap-3 justify-end"
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="rounded-2xl rounded-tr-md px-4 py-3 max-w-sm bg-gradient-to-br from-[hsl(168,84%,45%)] to-[hsl(200,80%,50%)]">
                  <p className="text-sm text-[hsl(220,15%,5%)] font-medium">
                    Do you notice any sensitivity to light or sound during these headaches?
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(168,84%,45%)] to-[hsl(200,80%,50%)] flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-4 h-4 text-[hsl(220,15%,5%)]" />
                </div>
              </motion.div>

              {/* Patient response */}
              <motion.div 
                className="flex gap-3"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className={`rounded-2xl rounded-tl-md px-4 py-3 max-w-sm ${isDarkMode ? "bg-white/[0.06]" : "bg-slate-100"}`}>
                  <p className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    Yes! Bright lights make it much worse, I have to lie down in a dark room.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className={`p-10 rounded-3xl ${isDarkMode ? "bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08]" : "bg-white border border-slate-200 shadow-lg"}`}
          >
            <h2 className={`text-2xl lg:text-3xl font-bold mb-3 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Ready to practice?
            </h2>
            <p className={`mb-6 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Start with your first patient case today
            </p>
            <Link href="/dashboard">
              <button className="btn-primary inline-flex items-center gap-2">
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-8 border-t transition-colors duration-300 ${isDarkMode ? "border-white/[0.06]" : "border-slate-200"}`}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-gradient-to-br from-[hsl(168,84%,45%)]/20 to-[hsl(200,80%,50%)]/20 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-[hsl(168,84%,45%)]" />
            </div>
            <span className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              ClinIQ
            </span>
          </div>
          <p className={`text-sm ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
            © 2026 ClinIQ. Educational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
