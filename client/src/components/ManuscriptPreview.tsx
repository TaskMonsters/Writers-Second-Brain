import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, FileCode, Book, Globe, Code, Settings } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type PreviewFormat = "word" | "pdf" | "epub" | "html" | "latex" | "manuscript";

interface ManuscriptPreviewProps {
  title: string;
  content: string;
  wordCount: number;
}

export function ManuscriptPreview({ title, content, wordCount }: ManuscriptPreviewProps) {
  const [format, setFormat] = useState<PreviewFormat>("manuscript");

  const formats = [
    { id: "manuscript" as PreviewFormat, label: "Standard MS", icon: FileText },
    { id: "word" as PreviewFormat, label: "Word", icon: FileText },
    { id: "pdf" as PreviewFormat, label: "PDF", icon: FileText },
    { id: "epub" as PreviewFormat, label: "ePub", icon: Book },
    { id: "html" as PreviewFormat, label: "HTML", icon: Globe },
    { id: "latex" as PreviewFormat, label: "LaTeX", icon: Code },
  ];

  return (
    <div className="space-y-4">
      {/* Format Toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground mr-2">Preview as:</span>
        {formats.map((fmt) => {
          const Icon = fmt.icon;
          return (
            <Button
              key={fmt.id}
              size="sm"
              variant={format === fmt.id ? "default" : "outline"}
              onClick={() => setFormat(fmt.id)}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              {fmt.label}
            </Button>
          );
        })}
      </div>

      {/* Preview Container */}
      <Card className="p-0 overflow-hidden">
        {format === "manuscript" && <StandardManuscriptPreview title={title} content={content} wordCount={wordCount} />}
        {format === "word" && <WordPreview title={title} content={content} wordCount={wordCount} />}
        {format === "pdf" && <PDFPreview title={title} content={content} wordCount={wordCount} />}
        {format === "epub" && <EPubPreview title={title} content={content} wordCount={wordCount} />}
        {format === "html" && <HTMLPreview title={title} content={content} wordCount={wordCount} />}
        {format === "latex" && <LaTeXPreview title={title} content={content} wordCount={wordCount} />}
      </Card>
    </div>
  );
}

function StandardManuscriptPreview({ title, content, wordCount }: ManuscriptPreviewProps) {
  // Standard Manuscript Format (Shunn format) - industry standard for submissions
  const currentYear = new Date().getFullYear();
  const [currentPage, setCurrentPage] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  
  // Fetch user preferences
  const { data: userPrefs } = trpc.userPreferences.get.useQuery();
  const updatePrefs = trpc.userPreferences.update.useMutation();
  
  // Form state for editing
  const [authorName, setAuthorName] = useState(userPrefs?.authorName || "Author Name");
  const [authorAddress, setAuthorAddress] = useState(userPrefs?.authorAddress || "123 Main Street, Big City");
  const [authorPhone, setAuthorPhone] = useState(userPrefs?.authorPhone || "555-123-4567");
  const [authorEmail, setAuthorEmail] = useState(userPrefs?.authorEmail || "author@example.com");
  const [authorWebsite, setAuthorWebsite] = useState(userPrefs?.authorWebsite || "https://www.example.com");
  const [penName, setPenName] = useState(userPrefs?.penName || "");
  
  // Update form when preferences load
  useEffect(() => {
    if (userPrefs) {
      setAuthorName(userPrefs.authorName || "Author Name");
      setAuthorAddress(userPrefs.authorAddress || "123 Main Street, Big City");
      setAuthorPhone(userPrefs.authorPhone || "555-123-4567");
      setAuthorEmail(userPrefs.authorEmail || "author@example.com");
      setAuthorWebsite(userPrefs.authorWebsite || "https://www.example.com");
      setPenName(userPrefs.penName || "");
    }
  }, [userPrefs]);
  
  const handleSaveSettings = async () => {
    await updatePrefs.mutateAsync({
      authorName,
      authorAddress,
      authorPhone,
      authorEmail,
      authorWebsite,
      penName,
    });
    setShowSettings(false);
  };
  
  // Split content into pages (approximate 250 words per page for double-spaced Courier)
  const wordsPerPage = 250;
  const contentWords = content.split(/\s+/);
  const totalPages = Math.ceil(contentWords.length / wordsPerPage) + 1; // +1 for title page
  
  const getPageContent = (pageNum: number) => {
    if (pageNum === 1) return null; // Title page
    const startIdx = (pageNum - 2) * wordsPerPage;
    const endIdx = startIdx + wordsPerPage;
    return contentWords.slice(startIdx, endIdx).join(' ');
  };
  
  return (
    <div className="bg-white text-black min-h-[600px]">
      {/* Pagination Controls */}
      <div className="sticky top-0 bg-gray-100 border-b border-gray-300 p-4 flex items-center justify-between z-10">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>

      {/* Page Content */}
      <div className="p-8 max-h-[700px] overflow-y-auto">
        <div className="max-w-[8.5in] mx-auto" style={{ fontFamily: 'Courier, monospace' }}>
          {currentPage === 1 ? (
            /* Title Page */
            <div className="min-h-[11in] flex flex-col">
              {/* Header - Contact Info (left) and Word Count (right) */}
              <div className="flex justify-between text-sm mb-8">
                <div className="space-y-0.5">
                  <div>{authorName}</div>
                  <div>{authorAddress}</div>
                  <div>{authorPhone}</div>
                  <div>{authorEmail}</div>
                  <div>{authorWebsite}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div>Approx. {wordCount.toLocaleString()} words</div>
                  <Dialog open={showSettings} onOpenChange={setShowSettings}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Settings className="w-3 h-3" />
                        Edit Info
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Cover Page Information</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="authorName">Author Name (Real Name)</Label>
                          <Input id="authorName" value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor="authorAddress">Address</Label>
                          <Input id="authorAddress" value={authorAddress} onChange={(e) => setAuthorAddress(e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor="authorPhone">Phone</Label>
                          <Input id="authorPhone" value={authorPhone} onChange={(e) => setAuthorPhone(e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor="authorEmail">Email</Label>
                          <Input id="authorEmail" value={authorEmail} onChange={(e) => setAuthorEmail(e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor="authorWebsite">Website</Label>
                          <Input id="authorWebsite" value={authorWebsite} onChange={(e) => setAuthorWebsite(e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor="penName">Pen Name (Optional)</Label>
                          <Input id="penName" value={penName} onChange={(e) => setPenName(e.target.value)} placeholder="Leave blank to use real name" />
                        </div>
                        <Button onClick={handleSaveSettings} className="w-full">
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Title (centered, 1/3 down the page) */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-xl uppercase tracking-wide">{title.toUpperCase()}</div>
                  <div className="text-base">by</div>
                  <div className="text-base">{penName || authorName}</div>
                </div>
              </div>

              {/* Copyright (bottom) */}
              <div className="text-center text-sm mt-auto">
                © {currentYear} {authorName}
              </div>
            </div>
          ) : (
            /* Content Pages */
            <div className="min-h-[11in]">
              {/* Page Header */}
              <div className="flex justify-between text-sm mb-6">
                <div>{authorName} / {title.toUpperCase()}</div>
                <div>{currentPage - 1}</div>
              </div>
              
              {/* Content */}
              <div style={{ lineHeight: '2' }} className="whitespace-pre-wrap">
                {getPageContent(currentPage)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WordPreview({ title, content, wordCount }: ManuscriptPreviewProps) {
  return (
    <div className="bg-white text-black p-16 min-h-[600px] max-h-[800px] overflow-y-auto">
      <div className="max-w-[8.5in] mx-auto">
        {/* Word document styling */}
        <h1 className="text-4xl font-serif text-center mb-8 font-bold">{title}</h1>
        <div className="space-y-4 text-base leading-relaxed font-serif whitespace-pre-wrap">
          {content}
        </div>
        <div className="mt-8 pt-4 border-t border-gray-300 text-sm text-gray-600 text-center">
          {wordCount} words
        </div>
      </div>
    </div>
  );
}

function PDFPreview({ title, content, wordCount }: ManuscriptPreviewProps) {
  return (
    <div className="bg-gray-100 p-8 min-h-[600px] max-h-[800px] overflow-y-auto">
      <div className="bg-white shadow-lg max-w-[8.5in] mx-auto p-16">
        {/* PDF styling with page-like appearance */}
        <h1 className="text-4xl font-serif text-center mb-8 font-bold text-black">{title}</h1>
        <div className="space-y-4 text-base leading-relaxed font-serif whitespace-pre-wrap text-black">
          {content}
        </div>
        <div className="mt-8 pt-4 border-t border-gray-400 text-sm text-gray-700 flex justify-between">
          <span>{wordCount} words</span>
          <span>Page 1</span>
        </div>
      </div>
    </div>
  );
}

function EPubPreview({ title, content, wordCount }: ManuscriptPreviewProps) {
  return (
    <div className="bg-[#f4f1ea] text-[#2b2b2b] p-8 min-h-[600px] max-h-[800px] overflow-y-auto">
      <div className="max-w-[600px] mx-auto">
        {/* ePub reader styling */}
        <h1 className="text-3xl font-serif text-center mb-6 font-bold">{title}</h1>
        <div className="space-y-4 text-lg leading-loose font-serif whitespace-pre-wrap">
          {content}
        </div>
        <div className="mt-8 pt-4 border-t border-[#d4cfc4] text-sm text-[#6b6b6b] text-center">
          {wordCount} words • Chapter 1
        </div>
      </div>
    </div>
  );
}

function HTMLPreview({ title, content, wordCount }: ManuscriptPreviewProps) {
  // Show HTML markup
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: Georgia, serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
    }
    h1 {
      text-align: center;
      margin-bottom: 2rem;
    }
    p {
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${content.split('\n\n').map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`).join('\n  ')}
  <footer>
    <p><small>${wordCount} words</small></p>
  </footer>
</body>
</html>`;

  return (
    <div className="bg-[#1e1e1e] text-[#d4d4d4] p-6 min-h-[600px] max-h-[800px] overflow-y-auto font-mono text-sm">
      <pre className="whitespace-pre-wrap">{htmlContent}</pre>
    </div>
  );
}

function LaTeXPreview({ title, content, wordCount }: ManuscriptPreviewProps) {
  // Show LaTeX markup
  const latexContent = `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{setspace}
\\doublespacing

\\title{${title}}
\\author{}
\\date{}

\\begin{document}

\\maketitle

${content.split('\n\n').map(para => para.trim()).filter(p => p).join('\n\n')}

\\vspace{1cm}
\\noindent\\textit{${wordCount} words}

\\end{document}`;

  return (
    <div className="bg-[#1e1e1e] text-[#d4d4d4] p-6 min-h-[600px] max-h-[800px] overflow-y-auto font-mono text-sm">
      <pre className="whitespace-pre-wrap">{latexContent}</pre>
    </div>
  );
}
