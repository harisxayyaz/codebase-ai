"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2, ChevronDown, Code2, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

interface Repo {
  id: string;
  name: string;
}

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function ChatPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const res = await fetch("/api/repos");
        const data = await res.json();
        setRepos(data.repos || []);
        if (data.repos?.length) setSelectedRepo(data.repos[0].id);
      } catch (error) {
        console.error("Failed to fetch repos:", error);
      }
    }
    fetchRepos();
  }, []);

  const handleAsk = async () => {
    if (!question || !selectedRepo) return;
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    const currentQuestion = question;
    setQuestion("");

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId: selectedRepo, question: currentQuestion }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.answer },
      ]);
    } catch (err) {
      console.log(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, I couldn&apos;t process your request. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg: Message) => {
    if (msg.role === "assistant") {
      const lines = msg.text.split("\n");
      return lines.map((line, idx) => {
        if (line.startsWith("File:")) {
          return (
            <div key={idx} className="mt-2 flex items-center gap-2 font-mono text-sm text-accent">
              <FileCode className="h-4 w-4" />
              {line}
            </div>
          );
        } else if (line.includes("[truncated]")) {
          return (
            <div key={idx} className="text-sm italic text-muted-foreground">
              {line}
            </div>
          );
        } else if (line.startsWith("```")) {
          return (
            <pre key={idx} className="mt-2 overflow-x-auto rounded-lg bg-background p-3 text-sm">
              <code>{line.replace(/```/g, "")}</code>
            </pre>
          );
        } else {
          return <div key={idx}>{line}</div>;
        }
      });
    }
    return <div>{msg.text}</div>;
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <Navbar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-card/50 px-4 py-4">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Code2 className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h1 className="font-semibold">AI Chat</h1>
                <p className="text-sm text-muted-foreground">Ask questions about your code</p>
              </div>
            </div>
            
            <Select value={selectedRepo} onValueChange={setSelectedRepo}>
              <SelectTrigger className="w-[200px] bg-background">
                <SelectValue placeholder="Select repository" />
              </SelectTrigger>
              <SelectContent>
                {repos.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No repositories
                  </SelectItem>
                ) : (
                  repos.map((repo) => (
                    <SelectItem key={repo.id} value={repo.id}>
                      {repo.name || repo.id}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chat Area */}
        <ScrollArea className="flex-1">
          <div className="mx-auto max-w-4xl px-4 py-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                  <Bot className="h-8 w-8 text-accent" />
                </div>
                <h2 className="text-xl font-semibold">Start a conversation</h2>
                <p className="mt-2 max-w-md text-muted-foreground">
                  Ask questions about your codebase. I can help you understand architecture, 
                  find specific code, explain functions, and more.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {[
                    "How is the project structured?",
                    "What are the main dependencies?",
                    "Explain the authentication flow",
                  ].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      className="text-sm"
                      onClick={() => setQuestion(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex gap-4",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent/10 text-accent"
                      )}
                    >
                      {msg.role === "user" ? (
                        <User className="h-5 w-5" />
                      ) : (
                        <Bot className="h-5 w-5" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border"
                      )}
                    >
                      <div className="text-sm leading-relaxed">
                        {renderMessage(msg)}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="rounded-2xl border border-border bg-card px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Thinking...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border bg-card/50 p-4">
          <div className="mx-auto flex max-w-4xl gap-3">
            <Input
              type="text"
              placeholder="Ask a question about your codebase..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 bg-background"
              onKeyDown={(e) => e.key === "Enter" && !loading && handleAsk()}
              disabled={loading || !selectedRepo}
            />
            <Button 
              onClick={handleAsk} 
              disabled={loading || !question || !selectedRepo}
              size="icon"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
