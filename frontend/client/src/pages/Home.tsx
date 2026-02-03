import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Stethoscope, Brain, Target, Award, ArrowRight, Activity, Zap,
  Heart, Pill, Microscope, Thermometer, Clipboard, GraduationCap, ChevronRight,
  Star, Trophy, Sparkles, BookOpen, Globe, Palette, Calculator, FlaskConical
} from "lucide-react";
import { useState, useEffect } from "react";

// Animated counter component
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
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-primary/30">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-[#283039] bg-[#0a0a0c]/80 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-[#137fec] rounded flex items-center justify-center text-white">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">MediTutor AI</h2>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/quiz">
              <Button className="bg-[#137fec] hover:bg-[#137fec]/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105" data-testid="button-get-started">
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
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-50 mix-blend-screen" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] opacity-30 mix-blend-screen" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <Zap className="w-4 h-4 text-[#137fec]" />
            <span className="text-sm font-medium text-white/80">AI-Powered Medical Training</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            Master the Art of <br />
            <span className="text-gradient">Clinical Diagnosis</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Chat with our AI tutor to learn disease diagnosis. Get symptoms, use hints, and build your clinical reasoning skills.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/quiz">
              <Button size="lg" className="h-14 px-10 text-lg rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" data-testid="button-start-learning">
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
              <p className="text-3xl font-bold text-[#137fec]">50+</p>
              <p className="text-sm text-muted-foreground">Diseases</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#137fec]">200+</p>
              <p className="text-sm text-muted-foreground">Symptoms</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#137fec]">5</p>
              <p className="text-sm text-muted-foreground">Specialties</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Medical Specialties - Clickable */}
      <section className="py-16 border-y border-[#283039]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">Medical Specialties Covered</h2>
            <p className="text-muted-foreground">Click on a specialty to explore what's covered</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            <SpecialtyLink icon={Heart} label="Cardiology" color="red" href="/specialty/cardiology" />
            <SpecialtyLink icon={Brain} label="Neurology" color="purple" href="/specialty/neurology" />
            <SpecialtyLink icon={Activity} label="Pulmonology" color="cyan" href="/specialty/pulmonology" />
            <SpecialtyLink icon={Pill} label="Gastroenterology" color="green" href="/specialty/gastroenterology" />
            <SpecialtyLink icon={Thermometer} label="Endocrinology" color="orange" href="/specialty/endocrinology" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-[#0d0d10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Learn clinical diagnosis through interactive AI conversations</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Stethoscope}
              title="AI Presents Symptoms"
              desc="Our AI tutor presents you with realistic patient symptoms to analyze."
              step="1"
            />
            <FeatureCard 
              icon={Target}
              title="Make Your Diagnosis"
              desc="Use your knowledge to identify the disease. Request hints if needed."
              step="2"
            />
            <FeatureCard 
              icon={Award}
              title="Learn & Progress"
              desc="Get instant feedback and track your improvement over time."
              step="3"
            />
          </div>
        </div>
      </section>

      {/* Learning Journey Map */}
      <section className="py-20 border-t border-white/5 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">The Learning Journey</h2>
            <p className="text-muted-foreground">Follow the path to diagnostic mastery</p>
          </div>
          
          {/* Map Container */}
          <div className="relative">
            {/* SVG Path connecting all nodes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#137fec" />
                  <stop offset="33%" stopColor="#a855f7" />
                  <stop offset="66%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
              {/* Curved path connecting all 4 nodes */}
              <motion.path
                d="M 100 80 C 150 80 200 140 300 160 C 400 180 450 280 500 300 C 550 320 650 180 700 140"
                fill="none"
                stroke="url(#pathGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="10 5"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                viewport={{ once: true }}
              />
              {/* Animated dots along path */}
              <motion.circle
                r="6"
                fill="#137fec"
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                style={{ offsetPath: "path('M 100 80 C 150 80 200 140 300 160 C 400 180 450 280 500 300 C 550 320 650 180 700 140')" }}
              />
            </svg>
            
            {/* Map Nodes */}
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
              {/* Node 1 - Top Left */}
              <motion.div 
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="relative mb-4">
                  <div className="absolute -inset-3 bg-[#137fec]/20 rounded-full blur-xl" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#137fec] to-blue-600 flex items-center justify-center shadow-lg shadow-[#137fec]/30 border-4 border-[#0a0a0c]">
                    <Clipboard className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#137fec] flex items-center justify-center text-sm font-bold border-2 border-[#0a0a0c]">
                    1
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1">Read Case</h3>
                <p className="text-sm text-muted-foreground text-center">Review patient symptoms</p>
              </motion.div>

              {/* Node 2 - Top Right */}
              <motion.div 
                className="flex flex-col items-center md:mt-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="relative mb-4">
                  <div className="absolute -inset-3 bg-purple-500/20 rounded-full blur-xl" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30 border-4 border-[#0a0a0c]">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-sm font-bold border-2 border-[#0a0a0c]">
                    2
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1">Analyze</h3>
                <p className="text-sm text-muted-foreground text-center">Use clinical reasoning</p>
              </motion.div>

              {/* Node 3 - Bottom Left */}
              <motion.div 
                className="flex flex-col items-center md:mt-24"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="relative mb-4">
                  <div className="absolute -inset-3 bg-cyan-500/20 rounded-full blur-xl" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center shadow-lg shadow-cyan-500/30 border-4 border-[#0a0a0c]">
                    <Microscope className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center text-sm font-bold border-2 border-[#0a0a0c]">
                    3
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1">Diagnose</h3>
                <p className="text-sm text-muted-foreground text-center">Submit your answer</p>
              </motion.div>

              {/* Node 4 - Bottom Right */}
              <motion.div 
                className="flex flex-col items-center md:mt-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                viewport={{ once: true }}
              >
                <div className="relative mb-4">
                  <div className="absolute -inset-3 bg-green-500/20 rounded-full blur-xl" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg shadow-green-500/30 border-4 border-[#0a0a0c]">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-sm font-bold border-2 border-[#0a0a0c]">
                    4
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1">Learn</h3>
                <p className="text-sm text-muted-foreground text-center">Review feedback</p>
              </motion.div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#137fec] rounded-full animate-pulse" />
            <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
            <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
          </div>
        </div>
      </section>

      {/* Chat Preview */}
      <section className="py-20 bg-[#0d0d10] border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Interactive AI Chat</h2>
            <p className="text-muted-foreground">Learn through natural conversation with our AI tutor</p>
          </div>
          
          {/* Mock Chat Preview */}
          <div className="bg-[#161618] rounded-2xl border border-[#283039] overflow-hidden">
            <div className="p-4 border-b border-[#283039] flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4 text-sm text-muted-foreground">MediTutor Chat</span>
            </div>
            <div className="p-6 space-y-4">
              {/* AI Message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#137fec] flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div className="bg-[#0a0a0c] rounded-2xl rounded-tl-sm p-4 max-w-md">
                  <p className="text-sm text-slate-300">
                    A 55-year-old male presents with severe chest pain radiating to the left arm, shortness of breath, and cold sweats. What is your diagnosis?
                  </p>
                </div>
              </div>
              
              {/* User Message */}
              <div className="flex gap-3 justify-end">
                <div className="bg-[#137fec] rounded-2xl rounded-tr-sm p-4 max-w-md">
                  <p className="text-sm text-white">
                    Myocardial Infarction
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">You</span>
                </div>
              </div>
              
              {/* AI Response */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl rounded-tl-sm p-4 max-w-md">
                  <p className="text-sm text-green-400">
                    Correct! The symptoms strongly suggest an acute myocardial infarction. +10 points earned!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-[#137fec]/20 to-indigo-500/20 rounded-3xl p-12 text-center border border-[#283039] relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#137fec]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#137fec]/20 flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-[#137fec]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-muted-foreground mb-8 max-w-[500px] mx-auto">
              Begin your journey to becoming a better diagnostician with AI-powered training.
            </p>
            <Link href="/quiz">
              <Button className="bg-[#137fec] text-white px-8 py-4 h-auto rounded-xl text-base font-bold" data-testid="button-start-quiz">
                Start Quiz Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 bg-[#0d0d10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Stethoscope className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-bold">MediTutor AI</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 MediTutor AI. Educational purposes only.</p>
        </div>
      </footer>
    </div>
  );
}

function SpecialtyLink({ icon: Icon, label, color, href }: { icon: any, label: string, color: string, href: string }) {
  const colors: Record<string, string> = {
    red: "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20 hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/20",
  };
  
  return (
    <Link href={href}>
      <div 
        className={`flex items-center gap-3 px-5 py-3 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${colors[color]}`}
        data-testid={`link-specialty-${label.toLowerCase()}`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-semibold">{label}</span>
        <ChevronRight className="w-4 h-4 opacity-50" />
      </div>
    </Link>
  );
}

function FeatureCard({ icon: Icon, title, desc, step }: { icon: any, title: string, desc: string, step: string }) {
  return (
    <div className="relative p-8 rounded-3xl bg-[#161618] border border-white/5 hover:border-[#137fec]/30 transition-colors group">
      <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[#137fec] flex items-center justify-center font-bold text-white shadow-lg shadow-[#137fec]/30">
        {step}
      </div>
      <div className="w-14 h-14 rounded-2xl bg-[#137fec]/10 flex items-center justify-center mb-6 group-hover:bg-[#137fec]/20 transition-colors">
        <Icon className="w-7 h-7 text-[#137fec]" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

