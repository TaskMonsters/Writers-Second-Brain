/**
 * Neo-Brutalist Dark Academia: Achievements Page
 * Display unlocked achievements and progress
 */

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useData } from "@/contexts/DataContext";
import { Trophy, Lock } from "lucide-react";
import { useLocation } from "wouter";

export default function Achievements() {
  const { achievements } = useData();
  const [, setLocation] = useLocation();

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold gradient-text">Manuscript OS</h1>
              <nav className="flex gap-1">
                <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/novel-kit")}>
                  Novel Kit
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/sanctuary")}>
                  Sanctuary
                </Button>
                <Button variant="ghost" className="font-medium">
                  <Trophy className="h-4 w-4 mr-2" />
                  Achievements
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-6">
        {/* Summary Card */}
        <div className="paper-texture bg-card p-8 rounded-lg border border-border mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">Your Achievements</h2>
              <p className="text-muted-foreground">
                {unlockedCount} of {totalCount} unlocked
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`paper-texture bg-card p-6 rounded-lg border transition-all ${
                achievement.unlocked
                  ? "border-primary/50 shadow-float"
                  : "border-border opacity-60"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`h-12 w-12 rounded-lg flex items-center justify-center text-2xl ${
                    achievement.unlocked
                      ? "bg-gradient-to-br from-primary to-accent"
                      : "bg-muted"
                  }`}
                >
                  {achievement.unlocked ? achievement.icon : <Lock className="h-6 w-6" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold mb-1">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {achievement.description}
                  </p>
                  
                  {!achievement.unlocked && achievement.maxProgress > 1 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {achievement.progress} / {achievement.maxProgress}
                        </span>
                      </div>
                      <Progress
                        value={(achievement.progress / achievement.maxProgress) * 100}
                        className="h-2"
                      />
                    </div>
                  )}
                  
                  {achievement.unlocked && achievement.unlockedAt && (
                    <p className="text-xs text-muted-foreground">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
