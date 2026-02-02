import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "wouter";
import { useChat, useSendMessage } from "@/hooks/use-chats";
import { useCase } from "@/hooks/use-cases";
import { DashboardSidebar } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, Loader2, ArrowLeft, Thermometer, Activity, 
  HeartPulse, TestTube, FileText, Stethoscope
} from "lucide-react";
import { clsx } from "clsx";

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const chatId = parseInt(id);
  
  const { data: chat, isLoading: chatLoading } = useChat(chatId);
  const { data: caseData, isLoading: caseLoading } = useCase(chat?.caseId ?? 0);
  const sendMessage = useSendMessage();
  
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat?.messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;

    try {
      await sendMessage.mutateAsync({
        chatId,
        content: input,
        sender: "user",
      });
      setInput("");
    } catch (error) {
      console.error(error);
    }
  };

  if (chatLoading || caseLoading) {
    return (
      <div className="h-screen bg-[#0a0a0c] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!chat || !caseData) {
    return (
      <div className="h-screen bg-[#0a0a0c] flex flex-col items-center justify-center text-white gap-4">
        <h2 className="text-xl font-semibold">Chat not found</h2>
        <Link href="/dashboard">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0c] text-white flex overflow-hidden">
      {/* Left Panel - Patient Info */}
      <aside className="w-80 border-r border-white/5 bg-[#161618] hidden lg:flex flex-col">
        <div className="p-6 border-b border-white/5">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h2 className="text-xl font-bold mb-1">{caseData.title}</h2>
          <span className="text-xs font-medium text-primary px-2 py-0.5 rounded-full bg-primary/10">
            {caseData.specialty}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Patient Vitals</h3>
            <div className="grid grid-cols-2 gap-3">
              <VitalCard icon={HeartPulse} label="HR" value="82 bpm" />
              <VitalCard icon={Activity} label="BP" value="120/80" />
              <VitalCard icon={Thermometer} label="Temp" value="37.2°C" />
              <VitalCard icon={Stethoscope} label="RR" value="16/min" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Description</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              {caseData.description}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-[#0a0a0c]">
        {/* Chat Header (Mobile only) */}
        <div className="lg:hidden h-16 border-b border-white/5 flex items-center px-4 bg-[#161618]">
          <Link href="/dashboard">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <span className="ml-4 font-semibold">{caseData.title}</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth" ref={scrollRef}>
          <div className="max-w-3xl mx-auto space-y-6">
            {chat.messages?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Start the consultation by greeting the patient.</p>
              </div>
            )}
            
            {chat.messages?.map((msg) => (
              <div
                key={msg.id}
                className={clsx(
                  "flex w-full",
                  msg.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={clsx(
                    "max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed",
                    msg.sender === "user"
                      ? "bg-primary text-white rounded-tr-sm shadow-lg shadow-primary/10"
                      : "bg-[#1c1c1f] text-gray-100 border border-white/5 rounded-tl-sm"
                  )}
                >
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
            
            {sendMessage.isPending && (
              <div className="flex justify-end">
                <div className="bg-primary/50 text-white/50 px-5 py-3 rounded-2xl rounded-tr-sm text-sm">
                  Sending...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/5 bg-[#161618]/50 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSend} className="relative flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Interview the patient..."
                className="pr-12 bg-[#1c1c1f] border-white/10 focus-visible:ring-primary/50 text-white h-12 rounded-xl"
                disabled={sendMessage.isPending}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="absolute right-1 w-10 h-10 rounded-lg bg-primary hover:bg-primary/90 text-white"
                disabled={!input.trim() || sendMessage.isPending}
              >
                {sendMessage.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>

      {/* Right Panel - Tools */}
      <aside className="w-72 border-l border-white/5 bg-[#161618] hidden xl:flex flex-col p-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-wider">Diagnostic Tools</h3>
        
        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start h-12 border-white/10 hover:bg-white/5 text-white">
            <TestTube className="w-4 h-4 mr-3 text-primary" />
            Order Labs
          </Button>
          
          <Button variant="outline" className="w-full justify-start h-12 border-white/10 hover:bg-white/5 text-white">
            <Activity className="w-4 h-4 mr-3 text-primary" />
            Request Imaging
          </Button>
          
          <Button variant="outline" className="w-full justify-start h-12 border-white/10 hover:bg-white/5 text-white">
            <FileText className="w-4 h-4 mr-3 text-primary" />
            Consult Specialist
          </Button>

          <div className="pt-6 border-t border-white/5 mt-6">
            <h4 className="text-sm font-medium mb-3">Differential Diagnosis</h4>
            <div className="space-y-2">
              <div className="h-10 rounded-lg bg-[#1c1c1f] border border-white/5 flex items-center px-3 text-sm text-muted-foreground">
                Add hypothesis...
              </div>
            </div>
            <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white">
              Finalize Diagnosis
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function VitalCard({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-[#1c1c1f] border border-white/5 p-3 rounded-xl">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <Icon className="w-3 h-3" />
        <span className="text-xs uppercase font-medium">{label}</span>
      </div>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
