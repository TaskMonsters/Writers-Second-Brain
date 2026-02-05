import { Button } from "@/components/ui/button";
import { BookOpen, LayoutDashboard, Sparkles, PenTool, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

export function GlobalNav() {
  const [location, navigate] = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/novel-kit", label: "Novel Kit", icon: Sparkles },
    { path: "/statistics", label: "Statistics", icon: TrendingUp },
    { path: "/sanctuary", label: "Sanctuary", icon: PenTool },
  ];

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-primary" aria-hidden="true" />
            <h1 className="text-xl font-bold text-foreground glow-text">Second Brain for Writers</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Button
                key={path}
                variant={location === path ? "default" : "ghost"}
                onClick={() => navigate(path)}
                className={location === path ? "gradient-purple glow-border" : ""}
                aria-label={`Navigate to ${label}`}
                aria-current={location === path ? "page" : undefined}
              >
                <Icon className="w-4 h-4 mr-2" aria-hidden="true" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
