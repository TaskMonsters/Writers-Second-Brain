import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Download, Eye, EyeOff, Save, FileText, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { MuseChatbotTrigger } from "@/components/MuseChatbot";
import { GlobalNav } from "@/components/GlobalNav";
import { ManuscriptPreview } from "@/components/ManuscriptPreview";

export default function Sanctuary() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [focusMode, setFocusMode] = useState(false);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [selectedManuscriptId, setSelectedManuscriptId] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState("1.125rem");
  const [lineHeight, setLineHeight] = useState("1.8");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newManuscriptTitle, setNewManuscriptTitle] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isCritiqueDialogOpen, setIsCritiqueDialogOpen] = useState(false);
  const [chapterTitle, setChapterTitle] = useState("");
  const [critiqueResult, setCritiqueResult] = useState<{ critique: any; manuscriptId: number; chapterTitle?: string } | null>(null);
  const [critiqueLoading, setCritiqueLoading] = useState(false);

  const { data: projects } = trpc.projects.list.useQuery(undefined, {
    enabled: !!user,
  });

  const currentProject = projects?.[0];

  const { data: manuscripts = [], refetch: refetchManuscripts } = trpc.manuscripts.list.useQuery(
    { projectId: currentProject?.id ?? 0 },
    { enabled: !!currentProject }
  );

  const { data: currentManuscript } = trpc.manuscripts.get.useQuery(
    { manuscriptId: selectedManuscriptId ?? 0 },
    { enabled: !!selectedManuscriptId }
  );

  const createManuscript = trpc.manuscripts.create.useMutation({
    onSuccess: (data) => {
      refetchManuscripts();
      setSelectedManuscriptId(data.manuscriptId);
      setIsCreateDialogOpen(false);
      setNewManuscriptTitle("");
      toast.success("Manuscript created successfully");
    },
  });

  const updateManuscript = trpc.manuscripts.update.useMutation({
    onSuccess: () => {
      setLastSaved(new Date());
      toast.success("Saved");
    },
  });

  useEffect(() => {
    if (currentManuscript) {
      setTitle(currentManuscript.title);
      setContent(currentManuscript.content);
    }
  }, [currentManuscript]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!selectedManuscriptId || !content) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 30000);

    return () => clearTimeout(timer);
  }, [content, selectedManuscriptId]);

  const handleSave = () => {
    if (!selectedManuscriptId) return;

    updateManuscript.mutate({
      manuscriptId: selectedManuscriptId,
      title,
      content,
    });
  };

  const handleCreateManuscript = () => {
    if (!currentProject || !newManuscriptTitle.trim()) return;

    createManuscript.mutate({
      projectId: currentProject.id,
      title: newManuscriptTitle,
      content: "",
    });
  };

  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;

  const exportWord = trpc.manuscriptExport.exportWord.useMutation();
  const exportHtml = trpc.manuscriptExport.exportHtml.useMutation();
  const exportLatex = trpc.manuscriptExport.exportLatex.useMutation();
  const exportManuscript = trpc.manuscriptExport.exportManuscript.useMutation();

  const handleExport = async (format: 'word' | 'html' | 'latex' | 'manuscript') => {
    if (!selectedManuscriptId) return;
    
    try {
      let result;
      switch (format) {
        case 'word':
          result = await exportWord.mutateAsync({ manuscriptId: selectedManuscriptId });
          break;
        case 'html':
          result = await exportHtml.mutateAsync({ manuscriptId: selectedManuscriptId });
          break;
        case 'latex':
          result = await exportLatex.mutateAsync({ manuscriptId: selectedManuscriptId });
          break;
        case 'manuscript':
          result = await exportManuscript.mutateAsync({ manuscriptId: selectedManuscriptId });
          break;
      }

      // Convert base64 to blob and download
      const binaryString = atob(result.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: result.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} file downloaded`);
    } catch (error) {
      toast.error(`Failed to export ${format}`);
    }
  };

  const critiqueChapter = trpc.manuscripts.critiqueChapter.useMutation();

  const handleCritique = async () => {
    if (!selectedManuscriptId || !content.trim()) {
      toast.error("No content to critique");
      return;
    }

    setCritiqueLoading(true);
    setCritiqueResult(null);

    try {
      const result = await critiqueChapter.mutateAsync({
        manuscriptId: selectedManuscriptId,
        chapterTitle: chapterTitle || undefined,
        selectedText: content,
      });

      setCritiqueResult(result);
      toast.success("Critique complete!");
    } catch (error) {
      toast.error("Failed to generate critique");
    } finally {
      setCritiqueLoading(false);
    }
  };

  const exportAsKindle = () => {
    // Create Kindle-optimized HTML
    const kindleContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8"/>
    <title>${title}</title>
    <style>
        body {
            font-family: serif;
            font-size: 1em;
            line-height: 1.5;
            margin: 1em;
        }
        h1 {
            font-size: 2em;
            text-align: center;
            page-break-before: always;
            margin: 1em 0;
        }
        p {
            text-indent: 1em;
            margin: 0 0 0.5em 0;
        }
        .chapter-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <h1>${title}</h1>
    ${content.split('\n\n').map(para => `<p>${para.trim()}</p>`).join('\n    ')}
</body>
</html>`;

    const blob = new Blob([kindleContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_')}_kindle.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Kindle file downloaded");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    navigate("/");
    return null;
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">No Project Found</h2>
          <p className="text-muted-foreground mb-6">
            Create a project first to start writing in The Sanctuary.
          </p>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </Card>
      </div>
    );
  }

  if (focusMode) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-4xl">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="sanctuary-editor min-h-[70vh] bg-transparent border-none focus:ring-0 resize-none text-foreground"
              style={{ fontSize, lineHeight }}
              placeholder="Begin your story..."
              aria-label="Manuscript content editor"
            />
          </div>
        </div>
        <div className="fixed bottom-4 right-4 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setFocusMode(false)}
            className="bg-card/80 backdrop-blur-sm"
            aria-label="Exit focus mode"
          >
            <EyeOff className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            onClick={handleSave}
            className="bg-primary/80 backdrop-blur-sm glow-border"
            aria-label="Save manuscript"
          >
            <Save className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GlobalNav />
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground glow-text">The Sanctuary</h1>
                <p className="text-sm text-muted-foreground">Distraction-free writing space</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {selectedManuscriptId && (
                <>
                  <div className="text-sm text-muted-foreground">
                    {wordCount} words
                    {lastSaved && (
                      <span className="ml-2">• Saved {lastSaved.toLocaleTimeString()}</span>
                    )}
                  </div>
                  <Button variant="outline" size="icon" onClick={handleSave} aria-label="Save manuscript">
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={showPreview ? "default" : "outline"}
                    onClick={() => setShowPreview(!showPreview)}
                    aria-label="Toggle preview"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Dialog open={isCritiqueDialogOpen} onOpenChange={setIsCritiqueDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="glow-border" aria-label="Get chapter critique">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Critique Chapter
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">Chapter Critique</DialogTitle>
                      </DialogHeader>
                      {critiqueLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-muted-foreground">Analyzing your chapter...</div>
                        </div>
                      ) : critiqueResult ? (
                        <div className="space-y-4">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: critiqueResult.critique.replace(/\n/g, '<br>') }} />
                          </div>
                          <Button onClick={() => setIsCritiqueDialogOpen(false)} className="w-full">
                            Close
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Get professional editorial feedback on your current chapter from our elite AI editor.
                          </p>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Chapter Title (Optional)</label>
                            <input
                              type="text"
                              value={chapterTitle}
                              onChange={(e) => setChapterTitle(e.target.value)}
                              placeholder="e.g., Chapter 1: The Beginning"
                              className="w-full px-3 py-2 bg-background border border-border rounded-md"
                            />
                          </div>
                          <Button onClick={handleCritique} className="w-full glow-border">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Get Critique
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setFocusMode(true)}
                    aria-label="Enter focus mode"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" aria-label="Export manuscript">
                        <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                        Export
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">Export Manuscript</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        <Button onClick={() => handleExport('word')} className="w-full justify-start" variant="outline">
                          <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
                          Export as Word (.docx)
                        </Button>
                        <Button onClick={() => handleExport('html')} className="w-full justify-start" variant="outline">
                          <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
                          Export as HTML
                        </Button>
                        <Button onClick={() => handleExport('latex')} className="w-full justify-start" variant="outline">
                          <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
                          Export as LaTeX (.tex)
                        </Button>
                        <Button onClick={() => handleExport('manuscript')} className="w-full justify-start" variant="outline">
                          <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
                          Export as Standard Manuscript (.txt)
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="glow-border" aria-label="Create new manuscript">
                    New Manuscript
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Create New Manuscript</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="manuscript-title" className="text-foreground">Title</Label>
                      <Input
                        id="manuscript-title"
                        value={newManuscriptTitle}
                        onChange={(e) => setNewManuscriptTitle(e.target.value)}
                        placeholder="Enter manuscript title"
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <Button onClick={handleCreateManuscript} className="w-full glow-border" disabled={!newManuscriptTitle.trim()}>
                      Create Manuscript
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="col-span-1 space-y-4">
            <Card className="p-4 bg-card border-border">
              <h3 className="font-semibold text-foreground mb-3">Manuscripts</h3>
              <div className="space-y-2">
                {manuscripts.map((manuscript) => (
                  <div key={manuscript.id} className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedManuscriptId(manuscript.id)}
                      className={`flex-1 text-left p-2 rounded transition-colors ${
                        selectedManuscriptId === manuscript.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent text-foreground"
                      }`}
                      aria-label={`Select manuscript: ${manuscript.title}`}
                      aria-pressed={selectedManuscriptId === manuscript.id}
                    >
                      <div className="font-medium truncate">{manuscript.title}</div>
                      <div className="text-xs opacity-70">{manuscript.wordCount} words</div>
                    </button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/analysis/${manuscript.id}`)}
                      className="flex-shrink-0"
                      title="Request Editorial Analysis"
                    >
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {manuscripts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No manuscripts yet. Create one to start writing!
                  </p>
                )}
              </div>
            </Card>

            <Card className="p-4 bg-card border-border">
              <h3 className="font-semibold text-foreground mb-3">Editor Settings</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="font-size" className="text-sm text-muted-foreground">Font Size</Label>
                  <Select value={fontSize} onValueChange={setFontSize}>
                    <SelectTrigger id="font-size" className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border max-h-[200px] z-50" position="popper" sideOffset={5} align="start">
                      <SelectItem value="1rem">Small</SelectItem>
                      <SelectItem value="1.125rem">Medium</SelectItem>
                      <SelectItem value="1.25rem">Large</SelectItem>
                      <SelectItem value="1.5rem">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="line-height" className="text-sm text-muted-foreground">Line Spacing</Label>
                  <Select value={lineHeight} onValueChange={setLineHeight}>
                    <SelectTrigger id="line-height" className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border max-h-[200px] z-50" position="popper" sideOffset={5} align="start">
                      <SelectItem value="1.5">Compact</SelectItem>
                      <SelectItem value="1.8">Comfortable</SelectItem>
                      <SelectItem value="2">Spacious</SelectItem>
                      <SelectItem value="2.5">Extra Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>

          {/* Editor */}
          <div className="col-span-3">
            {selectedManuscriptId ? (
              showPreview ? (
                <ManuscriptPreview
                  title={title}
                  content={content}
                  wordCount={wordCount}
                />
              ) : (
                <Card className="p-8 bg-card border-border min-h-[600px]">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-3xl font-bold mb-6 bg-transparent border-none focus:ring-0 text-foreground sanctuary-editor"
                    placeholder="Untitled"
                    aria-label="Manuscript title"
                  />
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="sanctuary-editor min-h-[500px] bg-transparent border-none focus:ring-0 resize-none text-foreground"
                    style={{ fontSize, lineHeight }}
                    placeholder="Begin your story..."
                    aria-label="Manuscript content editor"
                  />
                </Card>
              )
            ) : (
              <Card className="p-8 bg-card border-border min-h-[600px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto" aria-hidden="true" />
                  <p className="text-muted-foreground">Select a manuscript or create a new one to start writing</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Muse AI Chatbot */}
      <MuseChatbotTrigger projectId={currentProject?.id} />
    </div>
  );
}
