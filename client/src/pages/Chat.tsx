import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Loader2, MessageSquare } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const topicOptions = [
  { value: "all", label: "Tutti gli argomenti" },
  { value: "git", label: "Git" },
  { value: "kubernetes", label: "Kubernetes" },
  { value: "ckad", label: "CKAD" },
  { value: "docker", label: "Docker" },
  { value: "helm", label: "Helm" },
  { value: "cicd", label: "CI/CD" },
];

function formatContent(content: string) {
  // Split by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const lines = part.slice(3, -3).split("\n");
      const lang = lines[0]?.trim() || "";
      const code = lines.slice(lang ? 1 : 0).join("\n");
      return (
        <div key={i} className="relative my-2">
          {lang && (
            <span className="absolute top-2 right-2 text-[10px] font-mono text-muted-foreground/50">
              {lang}
            </span>
          )}
          <pre className="!bg-[hsl(220,27%,6%)] border border-border rounded-lg p-3 overflow-x-auto text-xs leading-relaxed">
            <code className="text-[hsl(220,10%,85%)]">{code}</code>
          </pre>
        </div>
      );
    }
    // Handle inline code
    const inlineParts = part.split(/(`[^`]+`)/g);
    return (
      <span key={i}>
        {inlineParts.map((ip, j) => {
          if (ip.startsWith("`") && ip.endsWith("`")) {
            return (
              <code key={j} className="px-1 py-0.5 rounded text-xs bg-muted text-primary font-mono">
                {ip.slice(1, -1)}
              </code>
            );
          }
          // Handle bold
          const boldParts = ip.split(/(\*\*[^*]+\*\*)/g);
          return boldParts.map((bp, k) => {
            if (bp.startsWith("**") && bp.endsWith("**")) {
              return <strong key={`${j}-${k}`}>{bp.slice(2, -2)}</strong>;
            }
            return <span key={`${j}-${k}`}>{bp}</span>;
          });
        })}
      </span>
    );
  });
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [topic, setTopic] = useState("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  // Load history
  const { data: history } = useQuery<any[]>({
    queryKey: ["/api/chat/history"],
  });

  useEffect(() => {
    if (history && history.length > 0 && messages.length === 0) {
      setMessages(
        history.map((m: any) => ({ role: m.role, content: m.content }))
      );
    }
  }, [history]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/chat", {
        message,
        topic: topic === "all" ? undefined : topic,
        history: messages.slice(-10),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
      queryClient.invalidateQueries({ queryKey: ["/api/chat/history"] });
    },
    onError: (error: any) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Errore: ${error.message}. Riprova tra qualche secondo.`,
        },
      ]);
    },
  });

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || chatMutation.isPending) return;
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    chatMutation.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-6 py-3 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-primary" />
          <h1 className="text-sm font-semibold font-mono" data-testid="chat-title">AI Tutor</h1>
        </div>
        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger className="w-44 h-8 text-xs" data-testid="select-topic">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {topicOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" data-testid="chat-messages">
        {/* System message */}
        {messages.length === 0 && (
          <div className="flex justify-center py-8">
            <div className="text-center space-y-2 max-w-md">
              <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare size={20} className="text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Ciao! Sono il tuo AI Tutor DevOps. Chiedi qualsiasi cosa su
                Kubernetes, Docker, Git, CI/CD, Helm...
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            data-testid={`message-${idx}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border"
              }`}
            >
              <div className="whitespace-pre-wrap">{formatContent(msg.content)}</div>
            </div>
          </div>
        ))}

        {chatMutation.isPending && (
          <div className="flex justify-start" data-testid="chat-loading">
            <div className="bg-card border border-border rounded-lg px-3 py-2 space-y-1.5">
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-3 w-52" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-3 border-t border-border shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scrivi un messaggio..."
            className="flex-1 resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[40px] max-h-[120px] font-sans"
            rows={1}
            data-testid="input-chat"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
            size="sm"
            className="h-10 w-10 p-0"
            data-testid="btn-send"
          >
            {chatMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
