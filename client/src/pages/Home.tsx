import { motion } from "framer-motion";
import { LandingHeader } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Bot, LineChart, Activity, ChevronRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-primary/30">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
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
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-white/80">Next-Gen Medical Training</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8"
          >
            Master the Art of <br />
            <span className="text-gradient">Diagnosis with AI</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Practice with realistic AI patients, receive instant feedback, and track your diagnostic accuracy in real-time.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/dashboard">
              <Button size="lg" className="h-14 px-8 text-lg rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                Start Simulation
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-2xl border-white/10 hover:bg-white/5 text-white">
              View Curriculum
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-16 flex items-center justify-center gap-4"
          >
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-zinc-800 flex items-center justify-center text-xs font-bold text-white/50">
                  U{i}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Joined by <span className="text-white font-semibold">10,000+</span> medical students
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-[#0d0d10] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Bot}
              title="AI Patient Simulation"
              desc="Interact with AI-driven patients that exhibit realistic symptoms and history."
            />
            <FeatureCard 
              icon={Activity}
              title="Real-time Feedback"
              desc="Get instant analysis of your diagnostic path and differential diagnosis accuracy."
            />
            <FeatureCard 
              icon={LineChart}
              title="Progress Tracking"
              desc="Monitor your improvement across different specialties and difficulty levels."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Master your clinical skills in 4 simple steps</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Choose Specialty", desc: "Select from Cardiology, Neurology, or Pediatrics cases." },
              { step: "02", title: "Interview Patient", desc: "Take a complete history using natural language chat." },
              { step: "03", title: "Order Tests", desc: "Request labs and imaging to confirm your hypothesis." },
              { step: "04", title: "Diagnose", desc: "Submit your final diagnosis and receive detailed feedback." }
            ].map((item, i) => (
              <div key={i} className="relative p-6 rounded-2xl bg-[#161618] border border-white/5">
                <span className="text-4xl font-bold text-white/5 mb-4 block">{item.step}</span>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-[#0d0d10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-bold">MediTutor AI</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 MediTutor AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-3xl bg-[#161618] border border-white/5 hover:border-primary/50 transition-colors group">
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
        <Icon className="w-7 h-7 text-white group-hover:text-primary transition-colors" />
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
