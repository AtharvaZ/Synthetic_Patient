import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Stethoscope, Brain, Target, Award, ChevronRight, Activity, Zap, Play, ArrowRight } from "lucide-react";

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
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-sm font-medium hover:text-[#137fec] transition-colors" href="#" data-testid="link-home">Home</a>
            <a className="text-sm font-medium hover:text-[#137fec] transition-colors" href="#" data-testid="link-courses">Courses</a>
            <a className="text-sm font-medium hover:text-[#137fec] transition-colors" href="#" data-testid="link-progress">Progress</a>
            <a className="text-sm font-medium hover:text-[#137fec] transition-colors" href="#" data-testid="link-profile">Profile</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/quiz">
              <Button variant="ghost" className="hidden sm:block text-sm font-semibold" data-testid="button-login">
                Log In
              </Button>
            </Link>
            <Link href="/quiz">
              <Button className="bg-[#137fec] hover:bg-[#137fec]/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105" data-testid="button-get-started">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
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
            <Zap className="w-4 h-4 text-[#137fec]" />
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
            Test your diagnostic skills with our AI-powered symptom quiz. Learn to identify diseases from symptoms with instant feedback, hints, and progress tracking.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/quiz">
              <Button size="lg" className="h-14 px-8 text-lg rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" data-testid="button-start-learning">
                Start Learning Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-2xl border-white/10 hover:bg-white/5 text-white" data-testid="button-watch-demo">
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
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
                <img 
                  key={i} 
                  src={`https://i.pravatar.cc/100?img=${i}`} 
                  alt={`User ${i}`}
                  className="w-10 h-10 rounded-full border-2 border-background"
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Joined by <span className="text-white font-semibold">10,000+</span> medical students
            </p>
          </motion.div>
        </div>
      </section>

      {/* Partners */}
      <section className="border-y border-[#283039] py-12 bg-[#161618]/30">
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Trusted by students from</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 font-black text-2xl italic">H-MED</div>
            <div className="flex items-center gap-2 font-black text-2xl italic">STANFORD</div>
            <div className="flex items-center gap-2 font-black text-2xl italic">MAYO-C</div>
            <div className="flex items-center gap-2 font-black text-2xl italic">J-HOPKINS</div>
            <div className="flex items-center gap-2 font-black text-2xl italic">OXFORD</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-[#0d0d10] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Empowering Your Medical Journey</h2>
            <p className="text-muted-foreground">Designed for the modern medical student, our platform provides tools that bridge the gap between theory and practice.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Brain}
              title="AI Symptom Quiz"
              desc="Test your diagnostic skills with AI-generated symptom scenarios and instant feedback."
              color="primary"
            />
            <FeatureCard 
              icon={Target}
              title="Smart Hints"
              desc="Get progressive hints to guide your learning without giving away the answer immediately."
              color="teal"
            />
            <FeatureCard 
              icon={Award}
              title="Progress Tracking"
              desc="Monitor your mastery with detailed progress bars and performance analytics."
              color="indigo"
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-[#283039] -z-10"></div>
            
            {[
              { step: "1", title: "Read Symptoms", desc: "AI presents you with a set of patient symptoms." },
              { step: "2", title: "Use Hints", desc: "Request hints if you need help narrowing down." },
              { step: "3", title: "Make Diagnosis", desc: "Submit your diagnosis and get instant feedback." },
              { step: "4", title: "Track Progress", desc: "See your improvement over time with analytics." }
            ].map((item, i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="size-12 rounded-full bg-[#137fec] text-white flex items-center justify-center font-bold text-lg ring-8 ring-[#0a0a0c]">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="bg-gradient-to-r from-[#137fec]/20 to-indigo-500/20 rounded-3xl p-12 text-center border border-[#283039]">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Test Your Skills?</h2>
          <p className="text-muted-foreground mb-8 max-w-[500px] mx-auto">Start diagnosing diseases from symptoms and track your progress as you learn.</p>
          <Link href="/quiz">
            <Button className="bg-[#137fec] text-white px-8 py-4 h-auto rounded-xl text-base font-bold" data-testid="button-start-quiz">
              Start Quiz Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-[#0d0d10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Stethoscope className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-bold">MediTutor AI</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 MediTutor AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
  const colorClasses = {
    primary: "bg-[#137fec]/10 text-[#137fec] group-hover:bg-[#137fec]/20",
    teal: "bg-teal-500/10 text-teal-500 group-hover:bg-teal-500/20",
    indigo: "bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500/20"
  };
  
  const borderClasses = {
    primary: "hover:border-[#137fec]/50",
    teal: "hover:border-teal-500/50",
    indigo: "hover:border-indigo-500/50"
  };

  return (
    <div className={`p-8 rounded-3xl bg-[#161618] border border-white/5 ${borderClasses[color as keyof typeof borderClasses]} transition-colors group`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${colorClasses[color as keyof typeof colorClasses]}`}>
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
