import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Sparkles, TrendingUp, Users, MessageSquare, FileText, Target, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { GlobalNav } from "@/components/GlobalNav";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function ManuscriptAnalysis() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/analysis/:manuscriptId");
  
  const manuscriptId = params?.manuscriptId ? parseInt(params.manuscriptId) : 0;
  
  const [genre, setGenre] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [specificConcerns, setSpecificConcerns] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Get manuscript
  const { data: manuscript } = trpc.manuscripts.get.useQuery(
    { manuscriptId },
    { enabled: !!user && manuscriptId > 0 }
  );

  // Get latest analysis if exists
  const { data: analyses = [] } = trpc.manuscripts.getAnalyses?.useQuery(
    { manuscriptId },
    { enabled: !!user && manuscriptId > 0 }
  ) || { data: [] };

  const latestAnalysis = analyses[0];

  // Analyze mutation
  const analyzeMutation = trpc.manuscripts.analyze.useMutation({
    onSuccess: () => {
      toast.success("Analysis complete!");
      setShowResults(true);
    },
    onError: (error) => {
      toast.error(`Analysis failed: ${error.message}`);
    },
  });

  const handleAnalyze = () => {
    if (!manuscript) return;
    
    analyzeMutation.mutate({
      manuscriptId,
      genre: genre || undefined,
      targetAudience: targetAudience || undefined,
      specificConcerns: specificConcerns || undefined,
    });
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

  if (!manuscript) {
    return (
      <div className="min-h-screen bg-background">
        <GlobalNav />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground mb-4">Manuscript not found.</p>
          <Button onClick={() => navigate("/sanctuary")}>Back to Sanctuary</Button>
        </div>
      </div>
    );
  }

  const currentAnalysis = showResults && analyzeMutation.data ? analyzeMutation.data : latestAnalysis;

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
                onClick={() => navigate("/sanctuary")}
                className="gap-2"
                aria-label="Back to sanctuary"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" aria-hidden="true" />
                  Manuscript Analysis
                </h1>
                <p className="text-sm text-muted-foreground">{manuscript.title}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-6xl">
        {!currentAnalysis && (
          <Card className="p-8 modern-card mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">Request Editorial Analysis</h2>
              <p className="text-muted-foreground">
                Our elite AI editor will provide comprehensive feedback on your manuscript's structure, 
                pacing, character development, dialogue, and prose quality.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="genre" className="text-foreground">Genre (Optional)</Label>
                <Input
                  id="genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g., Literary Fiction, Mystery, Romance"
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="audience" className="text-foreground">Target Audience (Optional)</Label>
                <Input
                  id="audience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Young Adult, Adult, Middle Grade"
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="concerns" className="text-foreground">Specific Concerns (Optional)</Label>
                <Textarea
                  id="concerns"
                  value={specificConcerns}
                  onChange={(e) => setSpecificConcerns(e.target.value)}
                  placeholder="Any specific areas you'd like feedback on?"
                  className="bg-background border-border text-foreground min-h-[100px]"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending}
                className="w-full glow-border"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Manuscript
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {currentAnalysis && (
          <>
            {/* Overall Score */}
            <Card className="p-6 modern-card mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">Overall Score</h2>
                  <p className="text-sm text-muted-foreground">
                    Analysis completed on {'createdAt' in currentAnalysis ? new Date(currentAnalysis.createdAt as Date).toLocaleDateString() : 'just now'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary">{currentAnalysis.overallScore}/10</div>
                </div>
              </div>
            </Card>

            {/* Overall Assessment */}
            <Card className="p-6 modern-card mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Overall Assessment
              </h2>
              <div className="prose prose-invert max-w-none">
                <Streamdown>{currentAnalysis.overallAssessment}</Streamdown>
              </div>
            </Card>

            {/* Structural Analysis */}
            <Card className="p-6 modern-card mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Structural Analysis
              </h2>
              <div className="prose prose-invert max-w-none">
                <Streamdown>{currentAnalysis.structuralAnalysis}</Streamdown>
              </div>
            </Card>

            {/* Character Development */}
            <Card className="p-6 modern-card mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Character Development
              </h2>
              <div className="prose prose-invert max-w-none">
                <Streamdown>{currentAnalysis.characterDevelopment}</Streamdown>
              </div>
            </Card>

            {/* Dialogue Quality */}
            <Card className="p-6 modern-card mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Dialogue Quality
              </h2>
              <div className="prose prose-invert max-w-none">
                <Streamdown>{currentAnalysis.dialogueQuality}</Streamdown>
              </div>
            </Card>

            {/* Prose & Style */}
            <Card className="p-6 modern-card mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Prose & Style
              </h2>
              <div className="prose prose-invert max-w-none">
                <Streamdown>{currentAnalysis.proseAndStyle}</Streamdown>
              </div>
            </Card>

            {/* Priority Action Items */}
            <Card className="p-6 modern-card mb-6 bg-primary/5 border-primary/20">
              <h2 className="text-xl font-semibold text-foreground mb-4">Priority Action Items</h2>
              <ul className="space-y-3">
                {(typeof currentAnalysis.priorityActionItems === 'string' 
                  ? JSON.parse(currentAnalysis.priorityActionItems) 
                  : currentAnalysis.priorityActionItems
                ).map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <p className="text-foreground flex-1">{item}</p>
                  </li>
                ))}
              </ul>
            </Card>

            {!showResults && (
              <Button
                onClick={() => {
                  setShowResults(false);
                  setGenre("");
                  setTargetAudience("");
                  setSpecificConcerns("");
                }}
                variant="outline"
                className="w-full"
              >
                Request New Analysis
              </Button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
