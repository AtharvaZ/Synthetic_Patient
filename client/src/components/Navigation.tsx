import { Link, useLocation } from "wouter";
import { Stethoscope, User, LayoutDashboard, History, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";

export function LandingHeader() {
  return (
    <header className="fixed top-0 w-full z-50 glass-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Stethoscope className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">MediTutor AI</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Home</Link>
          <Link href="/courses" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Courses</Link>
          <Link href="/progress" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Progress</Link>
          <Link href="/profile" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Profile</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="hidden sm:inline-flex text-white/70 hover:text-white hover:bg-white/5">
              Log In
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-xl">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function DashboardSidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard", icon: Stethoscope, label: "Cases" },
    { href: "/dashboard", icon: History, label: "History" },
    { href: "/dashboard", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="w-64 fixed h-full bg-[#161618] border-r border-white/5 flex flex-col hidden lg:flex">
      <div className="h-20 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Stethoscope className="w-5 h-5 text-primary" />
          </div>
          <span className="text-lg font-bold">MediTutor AI</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <Link key={link.label} href={link.href}>
            <div className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer",
              location === link.href 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-white/5 hover:text-white"
            )}>
              <link.icon className="w-5 h-5" />
              {link.label}
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">Dr. Smith</p>
            <p className="text-xs text-muted-foreground truncate">Resident</p>
          </div>
          <LogOut className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-white" />
        </div>
      </div>
    </aside>
  );
}
