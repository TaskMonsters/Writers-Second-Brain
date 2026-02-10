/**
 * Neo-Brutalist Dark Academia: Welcome/Landing Page
 * Asymmetric layout with glowing purple accents
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useData } from "@/contexts/DataContext";
import { BookOpen, Sparkles, Target, Zap } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Welcome() {
  const { projects, createProject, isLoading } = useData();
  const [, setLocation] = useLocation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateProject = async () => {
    if (!title.trim()) return;
    
    await createProject(title, description);
    setLocation("/dashboard");
  };

  const handleSelectProject = () => {
    setLocation("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-shimmer h-2 w-64 rounded-full bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
      </div>
    );
  }

  if (projects.length > 0 && !showCreateForm) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="text-center space-y-6 paper-texture bg-card p-12 rounded-lg shadow-float">
            <h1 className="text-5xl font-bold gradient-text">
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-lg">
              Continue your writing journey
            </p>
            
            <div className="flex gap-4 justify-center pt-6">
              <Button
                size="lg"
                onClick={handleSelectProject}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Open Dashboard
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowCreateForm(true)}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl font-bold leading-tight">
                <span className="gradient-text">Second Brain</span>
                <br />
                <span className="text-foreground">for Writers</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                A powerful writing companion that helps you organize your novel projects, 
                plan your stories, and write distraction-free—all while keeping your work 
                safe and accessible, even offline.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Kanban Dashboard</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Novel Planning Tools</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Distraction-Free Editor</span>
              </div>
            </div>
          </div>

          {/* Right: Create Project Form */}
          <div className="paper-texture bg-card p-8 rounded-lg shadow-float border-2 border-transparent hover:border-primary/50 transition-colors glow-border">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Create Your First Project</h2>
                <p className="text-muted-foreground">
                  Start your writing journey with a new novel project
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Project Title
                  </label>
                  <Input
                    id="title"
                    placeholder="My Epic Fantasy Novel"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description (Optional)
                  </label>
                  <Textarea
                    id="description"
                    placeholder="A brief description of your novel project..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="bg-background/50 resize-none"
                  />
                </div>

                <Button
                  size="lg"
                  onClick={handleCreateProject}
                  disabled={!title.trim()}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Create Project
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid md:grid-cols-3 gap-8">
          <div className="paper-texture bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Kanban Dashboard</h3>
            <p className="text-muted-foreground">
              Organize your writing tasks with a visual Kanban board. Track progress from research to final edits.
            </p>
          </div>

          <div className="paper-texture bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-2">Novel Kit</h3>
            <p className="text-muted-foreground">
              Build your story world with character profiles, location details, plot structures, and scene tracking.
            </p>
          </div>

          <div className="paper-texture bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">The Sanctuary</h3>
            <p className="text-muted-foreground">
              Write in a distraction-free environment with customizable typography and full-screen focus mode.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
