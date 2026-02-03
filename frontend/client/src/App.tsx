import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import PatientCases from "@/pages/PatientCases";
import Chat from "@/pages/Chat";
import Feedback from "@/pages/Feedback";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/cases" component={PatientCases} />
      <Route path="/chat/:id" component={Chat} />
      <Route path="/feedback/:chatId" component={Feedback} />
      <Route>
        <div className="h-screen bg-[#0a0a0c] flex items-center justify-center text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
            <a href="/" className="text-primary hover:underline">Go Home</a>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
