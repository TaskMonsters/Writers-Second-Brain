import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { interviewQuestions, interviewCategories, type InterviewCategory, type InterviewAnswers } from "@/lib/interviewQuestions";
import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";

interface CharacterInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characterName: string;
  initialAnswers?: InterviewAnswers;
  onSave: (answers: InterviewAnswers) => void;
}

export function CharacterInterviewDialog({
  open,
  onOpenChange,
  characterName,
  initialAnswers = {},
  onSave
}: CharacterInterviewDialogProps) {
  const [answers, setAnswers] = useState<InterviewAnswers>(initialAnswers);
  const [activeCategory, setActiveCategory] = useState<InterviewCategory>("basics");

  useEffect(() => {
    if (open) {
      setAnswers(initialAnswers);
    }
  }, [open, initialAnswers]);

  const handleAnswerChange = (category: InterviewCategory, questionIndex: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [questionIndex]: value
      }
    }));
  };

  const handleSave = () => {
    onSave(answers);
    onOpenChange(false);
  };

  const getAnsweredCount = (category: InterviewCategory) => {
    const categoryAnswers = answers[category] || {};
    return Object.values(categoryAnswers).filter(a => a && a.trim()).length;
  };

  const getTotalQuestions = (category: InterviewCategory) => {
    return interviewQuestions[category].length;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Character Interview: {characterName}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Answer questions to develop a deeper understanding of your character
          </p>
        </DialogHeader>

        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as InterviewCategory)} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-3 lg:grid-cols-9 gap-2 h-auto p-2" style={{display: 'inline-flex'}}>
            {(Object.keys(interviewCategories) as InterviewCategory[]).map((category) => (
              <TabsTrigger key={category} value={category} className="text-xs px-3 py-2 h-auto">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="font-medium leading-tight">{interviewCategories[category]}</span>
                  <span className="text-[11px] text-muted-foreground leading-tight">
                    {getAnsweredCount(category)}/{getTotalQuestions(category)}
                  </span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4 space-y-4">
            {(Object.keys(interviewQuestions) as InterviewCategory[]).map((category) => (
              <TabsContent key={category} value={category} className="space-y-4 mt-0">
                <div className="space-y-6">
                  {interviewQuestions[category].map((question, index) => (
                    <div key={index} className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {index + 1}. {question}
                      </label>
                      <Textarea
                        value={answers[category]?.[index] || ""}
                        onChange={(e) => handleAnswerChange(category, index, e.target.value)}
                        placeholder="Type your answer here..."
                        className="min-h-[80px] resize-none"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Interview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
