import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Trophy, Award, Star, Crown, Zap, Flame, Target, 
  CheckCircle, BookOpen, Users, Globe, Sparkles, Rocket,
  Layout, CheckSquare, Layers, FileText, Book, Pen
} from "lucide-react";
import { toast } from "sonner";

const ICON_MAP: Record<string, any> = {
  trophy: Trophy,
  award: Award,
  star: Star,
  crown: Crown,
  zap: Zap,
  flame: Flame,
  fire: Flame,
  target: Target,
  "check-circle": CheckCircle,
  "book-open": BookOpen,
  users: Users,
  globe: Globe,
  sparkles: Sparkles,
  rocket: Rocket,
  layout: Layout,
  "check-square": CheckSquare,
  layers: Layers,
  "file-text": FileText,
  book: Book,
  pen: Pen,
};

interface AchievementsProps {
  projectId: number;
}

export function Achievements({ projectId }: AchievementsProps) {
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [previousUnlocked, setPreviousUnlocked] = useState<Set<number>>(new Set());

  const { data: progressData = [], refetch } = trpc.achievements.checkProgress.useQuery(
    { projectId },
    { 
      refetchInterval: 10000, // Check every 10 seconds
      enabled: !!projectId 
    }
  );

  const sendMuseMessage = trpc.chat.sendSystemMessage.useMutation();

  const unlockMutation = trpc.achievements.unlock.useMutation({
    onSuccess: (data, variables) => {
      if (!data.alreadyUnlocked) {
        const achievement = progressData.find(p => p.achievement.id === variables.achievementId);
        if (achievement) {
          toast.success(
            `🎉 Achievement Unlocked: ${achievement.achievement.name}!`,
            {
              description: achievement.achievement.description,
              duration: 5000,
            }
          );
          
          // Send congratulations message from The Muse
          const congratsMessages = [
            `🎊 Incredible work! You've just unlocked "${achievement.achievement.name}"! ${achievement.achievement.description}. Keep this momentum going!`,
            `✨ Amazing achievement! "${achievement.achievement.name}" is yours! ${achievement.achievement.description}. You're making fantastic progress!`,
            `🌟 Congratulations! You've earned "${achievement.achievement.name}"! ${achievement.achievement.description}. Your dedication is truly inspiring!`,
            `🎉 Well done! "${achievement.achievement.name}" unlocked! ${achievement.achievement.description}. You're on fire!`,
          ];
          
          const randomMessage = congratsMessages[Math.floor(Math.random() * congratsMessages.length)];
          
          // Send congratulations message from The Muse
          sendMuseMessage.mutate({
            projectId,
            message: randomMessage,
          });
        }
      }
      refetch();
    },
  });

  // Check for newly unlocked achievements
  useEffect(() => {
    progressData.forEach((item) => {
      const shouldUnlock = item.progress >= item.achievement.threshold && !item.isUnlocked;
      
      if (shouldUnlock && !previousUnlocked.has(item.achievement.id)) {
        // Unlock the achievement
        unlockMutation.mutate({
          achievementId: item.achievement.id,
          projectId,
          progress: item.progress,
        });
        
        // Add to previous unlocked set to prevent duplicate notifications
        setPreviousUnlocked(prev => new Set(prev).add(item.achievement.id));
      }
    });
  }, [progressData, projectId, previousUnlocked]);

  const filteredData = progressData.filter((item) => {
    if (filter === "unlocked") return item.isUnlocked;
    if (filter === "locked") return !item.isUnlocked;
    return true;
  });

  const unlockedCount = progressData.filter(p => p.isUnlocked).length;
  const totalCount = progressData.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Achievements
          </h2>
          <p className="text-muted-foreground mt-1">
            {unlockedCount} of {totalCount} unlocked
          </p>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unlocked")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "unlocked"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Unlocked
          </button>
          <button
            onClick={() => setFilter("locked")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "locked"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Locked
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="p-6 bg-card border-border">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="text-foreground font-medium">
              {Math.round((unlockedCount / totalCount) * 100)}%
            </span>
          </div>
          <Progress value={(unlockedCount / totalCount) * 100} className="h-2" />
        </div>
      </Card>

      {/* Achievement Grid */}
      <ScrollArea className="h-[600px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
          {filteredData.map((item) => {
            const Icon = ICON_MAP[item.achievement.icon || "trophy"] || Trophy;
            const isUnlocked = item.isUnlocked;
            
            return (
              <Card
                key={item.achievement.id}
                className={`p-6 transition-all duration-300 ${
                  isUnlocked
                    ? "bg-card border-primary/30 shadow-lg shadow-primary/20"
                    : "bg-card/50 border-border opacity-70"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`p-3 rounded-lg ${
                      isUnlocked ? "bg-primary/20" : "bg-muted"
                    }`}
                    style={{
                      backgroundColor: isUnlocked
                        ? `${item.achievement.color}20`
                        : undefined,
                    }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{
                        color: isUnlocked ? item.achievement.color : undefined,
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">
                        {item.achievement.name}
                      </h3>
                      {isUnlocked && (
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {item.achievement.description}
                    </p>

                    {/* Progress Bar */}
                    {!isUnlocked && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {item.progress} / {item.achievement.threshold}
                          </span>
                          <span className="text-muted-foreground">
                            {Math.round(item.progressPercent)}%
                          </span>
                        </div>
                        <Progress value={item.progressPercent} className="h-1.5" />
                      </div>
                    )}

                    {/* Unlocked Date */}
                    {isUnlocked && item.unlockedAt && (
                      <Badge variant="secondary" className="text-xs">
                        Unlocked {new Date(item.unlockedAt).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
