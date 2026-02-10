/**
 * Neo-Brutalist Dark Academia: The Sanctuary - Distraction-Free Writing Editor
 * Full-screen focus mode with customizable typography
 */

import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import { ArrowLeft, Maximize2, Minimize2, Save, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function Sanctuary() {
  const { currentProject, manuscripts, createManuscript, updateManuscript } = useData();
  const [, setLocation] = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [content, setContent] = useState("");
  const [currentManuscript, setCurrentManuscript] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (manuscripts.length > 0 && !currentManuscript) {
      const manuscript = manuscripts[0];
      setCurrentManuscript(manuscript.id);
      setContent(manuscript.content);
    }
  }, [manuscripts, currentManuscript]);

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  }, [content]);

  const handleSave = async () => {
    if (!currentProject) return;
    
    setIsSaving(true);
    
    try {
      if (currentManuscript) {
        const manuscript = manuscripts.find(m => m.id === currentManuscript);
        if (manuscript) {
          await updateManuscript({
            ...manuscript,
            content,
            wordCount,
          });
        }
      } else {
        const newManuscript = await createManuscript(currentProject.title);
        setCurrentManuscript(newManuscript.id);
        await updateManuscript({
          ...newManuscript,
          content,
          wordCount,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No project selected</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header (hidden in fullscreen) */}
      {!isFullscreen && (
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
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
                  <Button variant="ghost" className="font-medium">
                    Sanctuary
                  </Button>
                  <Button variant="ghost" onClick={() => setLocation("/achievements")}>
                    <Trophy className="h-4 w-4 mr-2" />
                    Achievements
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b border-border bg-card/30 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {isFullscreen && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation("/dashboard")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Exit
                  </Button>
                )}
                <span className="text-sm text-muted-foreground">
                  {wordCount.toLocaleString()} words
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Writing Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-12 max-w-4xl">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Begin writing your story..."
              className="w-full min-h-[calc(100vh-16rem)] bg-transparent border-none outline-none resize-none text-lg leading-relaxed placeholder:text-muted-foreground/50"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.125rem',
                lineHeight: '1.75',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
