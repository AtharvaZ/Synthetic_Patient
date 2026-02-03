import { DashboardSidebar } from "@/components/Navigation";
import { CaseCard } from "@/components/CaseCard";
import { useCases } from "@/hooks/use-cases";
import { useCreateChat } from "@/hooks/use-chats";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: cases, isLoading } = useCases();
  const createChat = useCreateChat();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleStartCase = async (caseId: number) => {
    try {
      const newChat = await createChat.mutateAsync({ caseId });
      setLocation(`/chat/${newChat.id}`);
    } catch (error) {
      toast({
        title: "Error starting case",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex">
      <DashboardSidebar />
      
      <main className="flex-1 lg:ml-64 p-8">
        <header className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Clinical Cases</h1>
          <p className="text-muted-foreground">Select a case to begin your diagnostic simulation.</p>
        </header>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cases?.map((c) => (
              <CaseCard 
                key={c.id} 
                caseData={c} 
                onStart={() => handleStartCase(c.id)}
                isLoading={createChat.isPending}
              />
            ))}
            
            {cases?.length === 0 && (
              <div className="col-span-full p-12 rounded-2xl border border-dashed border-white/10 text-center">
                <p className="text-muted-foreground">No cases available at the moment.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
