import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Stethoscope, Brain, Target, Award, ArrowRight, Activity, Zap,
  Heart, Pill, Microscope, Thermometer, Clipboard, GraduationCap, ChevronRight
} from "lucide-react";

export default function Home() {
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

      {/* Interactive Diagram */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The Learning Flow</h2>
            <p className="text-muted-foreground">Your journey to diagnostic mastery</p>
          </div>
          
          {/* Flow Diagram */}
          <div className="relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/2 left-[12%] right-[12%] h-1 bg-gradient-to-r from-[#137fec] via-purple-500 to-green-500 -translate-y-1/2 rounded-full opacity-30" />
            
            <div className="grid md:grid-cols-4 gap-6">
              <FlowStep 
                icon={Clipboard}
                title="Read Case"
                desc="Review symptoms"
                color="blue"
                number={1}
              />
              <FlowStep 
                icon={Brain}
                title="Analyze"
                desc="Use clinical reasoning"
                color="purple"
                number={2}
              />
              <FlowStep 
                icon={Microscope}
                title="Diagnose"
                desc="Submit your answer"
                color="cyan"
                number={3}
              />
              <FlowStep 
                icon={GraduationCap}
                title="Learn"
                desc="Review feedback"
                color="green"
                number={4}
              />
            </div>
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

function FlowStep({ icon: Icon, title, desc, color, number }: { icon: any, title: string, desc: string, color: string, number: number }) {
  const colors: Record<string, string> = {
    blue: "bg-[#137fec] shadow-[#137fec]/30",
    purple: "bg-purple-500 shadow-purple-500/30",
    cyan: "bg-cyan-500 shadow-cyan-500/30",
    green: "bg-green-500 shadow-green-500/30",
  };
  
  return (
    <div className="flex flex-col items-center text-center">
      <div className={`w-16 h-16 rounded-2xl ${colors[color]} shadow-lg flex items-center justify-center mb-4 relative z-10`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
