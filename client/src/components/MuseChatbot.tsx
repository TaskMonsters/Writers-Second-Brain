import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { Loader2, Send, X, Sparkles, Gamepad2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface MuseChatbotProps {
  projectId?: number;
  isOpen: boolean;
  onClose: () => void;
}

const MUSE_CHARACTERS = [
  {
    name: "Original Muse",
    url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663172308229/hBMBFBvbUpvqPhxB.gif"
  },
  {
    name: "Idle Animated",
    url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663172308229/hCQxeyTUknOjMzvA.gif"
  },
  {
    name: "Idle Copy",
    url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663172308229/NaIYTQofmWbswRik.gif"
  }
];

export function MuseChatbot({ projectId, isOpen, onClose }: MuseChatbotProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentMuseIndex, setCurrentMuseIndex] = useState(() => {
    const saved = localStorage.getItem('selectedMuseCharacter');
    return saved ? parseInt(saved) : 0;
  });

  const switchMuseCharacter = () => {
    const nextIndex = (currentMuseIndex + 1) % MUSE_CHARACTERS.length;
    setCurrentMuseIndex(nextIndex);
    localStorage.setItem('selectedMuseCharacter', nextIndex.toString());
    window.dispatchEvent(new Event('storage'));
    toast.success(`Switched to ${MUSE_CHARACTERS[nextIndex].name}`);
  };

  const { data: messages = [], refetch } = trpc.chat.getMessages.useQuery(
    { projectId, limit: 50 },
    { enabled: isOpen }
  );

  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      refetch();
      setMessage("");
      setIsTyping(false);
    },
    onError: (error) => {
      toast.error("Failed to send message");
      setIsTyping(false);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!message.trim() || isTyping) return;

    setIsTyping(true);
    sendMessage.mutate({
      projectId,
      message: message.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 z-50 w-96 h-[600px] flex flex-col"
      role="dialog"
      aria-label="The Muse AI Assistant"
      aria-modal="true"
    >
      <Card className="flex flex-col h-full bg-card border-border shadow-2xl glow-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16">
              <img 
                src={MUSE_CHARACTERS[currentMuseIndex].url}
                alt="The Muse" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-semibold text-foreground glow-text">The Muse</h3>
              <p className="text-xs text-muted-foreground">Your AI Writing Companion</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={switchMuseCharacter}
              aria-label="Switch muse character"
              className="hover:bg-accent"
              title="Switch Muse Character"
            >
              <Gamepad2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close chat"
              className="hover:bg-accent"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8 space-y-2">
                  <Sparkles className="w-12 h-12 text-primary mx-auto" aria-hidden="true" />
                  <p className="text-muted-foreground text-sm px-2">
                    Hello! I'm The Muse, your AI writing companion. How can I help you with your novel today?
                  </p>
                </div>
              )}
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 break-words ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="text-sm prose prose-sm prose-invert max-w-none">
                        <Streamdown>{msg.content}</Streamdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" aria-hidden="true" />
                    <span className="text-sm text-muted-foreground">The Muse is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask The Muse anything..."
              disabled={isTyping}
              className="flex-1 bg-background border-border text-foreground"
              aria-label="Message input"
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || isTyping}
              size="icon"
              className="glow-border"
              aria-label="Send message"
            >
              {isTyping ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="w-4 h-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function MuseChatbotTrigger({ projectId }: { projectId?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMuseIndex, setCurrentMuseIndex] = useState(() => {
    const saved = localStorage.getItem('selectedMuseCharacter');
    return saved ? parseInt(saved) : 0;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('selectedMuseCharacter');
      setCurrentMuseIndex(saved ? parseInt(saved) : 0);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 w-20 h-20 rounded-full glow-border shadow-2xl"
        size="icon"
        aria-label="Open The Muse AI Assistant"
      >
        <img 
          src={MUSE_CHARACTERS[currentMuseIndex].url}
          alt="The Muse" 
          className="w-16 h-16 object-contain"
        />
      </Button>
      <MuseChatbot projectId={projectId} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
