import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, TrendingUp, Target, Zap, Trophy, BookOpen, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { GlobalNav } from "@/components/GlobalNav";
import { MuseChatbotTrigger } from "@/components/MuseChatbot";

export default function Statistics() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  // Get user's projects
  const { data: projects } = trpc.projects.list.useQuery(undefined, {
    enabled: !!user,
  });

  const currentProject = projects?.[0];

  // Get tickets for progress tracking
  const { data: tickets = [] } = trpc.tickets.list.useQuery(
    { projectId: currentProject?.id || 0 },
    { enabled: !!currentProject }
  );

  // Get achievements for progress tracking
  const { data: userAchievements = [] } = trpc.achievements.userAchievements.useQuery(
    { projectId: currentProject?.id || 0 },
    { enabled: !!currentProject }
  );

  const { data: allAchievements = [] } = trpc.achievements.list.useQuery();

  // Calculate statistics
  const totalTickets = tickets.length;
  const completedTickets = tickets.filter(t => t.status === "done").length;
  const completionRate = totalTickets > 0 ? Math.round((completedTickets / totalTickets) * 100) : 0;

  const chapterTickets = tickets.filter(t => t.taskType === "chapter");
  const completedChapters = chapterTickets.filter(t => t.status === "done").length;
  const totalChapters = chapterTickets.length;

  const unlockedAchievements = userAchievements.length;
  const totalAchievements = allAchievements.length;
  const achievementProgress = totalAchievements > 0 ? Math.round((unlockedAchievements / totalAchievements) * 100) : 0;

  // Calculate word count from ticket descriptions (simplified)
  const totalWords = tickets.reduce((sum, ticket) => {
    if (ticket.description) {
      return sum + ticket.description.split(/\s+/).length;
    }
    return sum;
  }, 0);

  // Group tickets by status for progress visualization
  const ticketsByStatus = {
    backlog: tickets.filter(t => t.status === "backlog").length,
    research: tickets.filter(t => t.status === "research").length,
    outlining: tickets.filter(t => t.status === "outlining").length,
    "first-draft": tickets.filter(t => t.status === "first-draft").length,
    revisions: tickets.filter(t => t.status === "revisions").length,
    editing: tickets.filter(t => t.status === "editing").length,
    marketing: tickets.filter(t => t.status === "marketing").length,
    done: tickets.filter(t => t.status === "done").length,
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>;
  }

  if (!user) {
    navigate("/");
    return null;
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-background">
        <GlobalNav />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground mb-4">No project found. Create a project to see statistics.</p>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GlobalNav />
      
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="gap-2"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary" aria-hidden="true" />
                  Writing Statistics
                </h1>
                <p className="text-sm text-muted-foreground">{currentProject.title}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 modern-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Words</h3>
              <BookOpen className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <p className="text-3xl font-bold text-foreground">{totalWords.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Across all tickets</p>
          </Card>

          <Card className="p-6 modern-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Completion Rate</h3>
              <Target className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <p className="text-3xl font-bold text-foreground">{completionRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">{completedTickets} of {totalTickets} tickets</p>
          </Card>

          <Card className="p-6 modern-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Chapters</h3>
              <CheckCircle2 className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <p className="text-3xl font-bold text-foreground">{completedChapters}/{totalChapters}</p>
            <p className="text-xs text-muted-foreground mt-1">Completed chapters</p>
          </Card>

          <Card className="p-6 modern-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Achievements</h3>
              <Trophy className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <p className="text-3xl font-bold text-foreground">{unlockedAchievements}/{totalAchievements}</p>
            <p className="text-xs text-muted-foreground mt-1">{achievementProgress}% unlocked</p>
          </Card>
        </div>

        {/* Progress by Stage */}
        <Card className="p-6 modern-card mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Progress by Stage</h2>
          <div className="space-y-4">
            {Object.entries(ticketsByStatus).map(([status, count]) => {
              const percentage = totalTickets > 0 ? (count / totalTickets) * 100 : 0;
              const statusLabels: Record<string, string> = {
                backlog: "Backlog",
                research: "Research",
                outlining: "Outlining",
                "first-draft": "First Draft",
                revisions: "Revisions",
                editing: "Editing",
                marketing: "Marketing",
                done: "Done",
              };
              
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{statusLabels[status]}</span>
                    <span className="text-sm text-muted-foreground">{count} tickets ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Achievements */}
        {unlockedAchievements > 0 && (
          <Card className="p-6 modern-card">
            <h2 className="text-xl font-semibold text-foreground mb-6">Recent Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userAchievements.slice(0, 6).map((ua: any) => {
                const achievement = allAchievements.find((a: any) => a.id === ua.achievementId);
                if (!achievement) return null;
                
                return (
                  <div key={ua.id} className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Unlocked {new Date(ua.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </main>

      {/* Muse AI Chatbot */}
      <MuseChatbotTrigger projectId={currentProject.id} />
    </div>
  );
}
