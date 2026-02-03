import { ArrowRight, Brain, Heart, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Case } from "@shared/schema";

const icons: Record<string, any> = {
  Cardiology: Heart,
  Neurology: Brain,
  Pediatrics: Baby,
};

const difficulties: Record<string, string> = {
  Beginner: "bg-green-500/10 text-green-500 border-green-500/20",
  Intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Advanced: "bg-red-500/10 text-red-500 border-red-500/20",
};

interface CaseCardProps {
  caseData: Case;
  onStart: () => void;
  isLoading?: boolean;
}

export function CaseCard({ caseData, onStart, isLoading }: CaseCardProps) {
  const Icon = icons[caseData.specialty] || Brain;
  
  return (
    <div className="group relative bg-[#1c1c1f] rounded-2xl p-6 border border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary/10 transition-colors">
          <Icon className="w-6 h-6 text-white group-hover:text-primary transition-colors" />
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficulties[caseData.difficulty]}`}>
          {caseData.difficulty}
        </span>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">{caseData.title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-2">
        {caseData.description}
      </p>

      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {caseData.specialty}
        </span>
        <Button 
          onClick={onStart} 
          disabled={isLoading}
          className="rounded-xl bg-white/5 hover:bg-primary hover:text-white text-white border-0 transition-all duration-300"
          size="sm"
        >
          {isLoading ? "Starting..." : "Start Simulation"}
          {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
