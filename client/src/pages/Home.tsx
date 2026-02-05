import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { BookOpen, Sparkles, Target, Zap } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-foreground glow-text">Second Brain for Writers</h1>
          </div>
          <Button onClick={() => window.location.href = getLoginUrl()} className="glow-border">
            Sign In
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-4xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-foreground glow-text">
              Your Novel Writing Command Center
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Organize your creative workflow, write distraction-free, and receive AI-powered encouragement throughout your writing journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="modern-card p-6 space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Target className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Kanban Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Manage your novel workflow from backlog to publication with customizable ticket boards.
              </p>
            </div>

            <div className="modern-card p-6 space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">The Muse AI</h3>
              <p className="text-sm text-muted-foreground">
                Your personal AI writing assistant provides context-aware suggestions and motivation.
              </p>
            </div>

            <div className="modern-card p-6 space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">The Sanctuary</h3>
              <p className="text-sm text-muted-foreground">
                Distraction-free editor with eBook and Kindle formatting for professional publishing.
              </p>
            </div>
          </div>

          <div className="pt-8">
            <Button 
              size="lg" 
              onClick={() => window.location.href = getLoginUrl()}
              className="gradient-purple glow-border text-lg px-8 py-6 hover:shadow-2xl transition-all"
            >
              Start Writing Today
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Second Brain for Writers - Empowering authors to achieve their creative goals</p>
        </div>
      </footer>
    </div>
  );
}
