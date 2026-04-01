"use client";

import { useState } from "react";
import { Github, Upload, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function UploadPage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const uploadRepo = async () => {
    if (!repoUrl) return;
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/upload-repo", {
        method: "POST",
        body: JSON.stringify({ repoUrl }),
      });

      const data = await res.json();
      console.log(data);
      setSuccess(true);
      setRepoUrl("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
            <Upload className="h-7 w-7 text-accent" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Repository</h1>
          <p className="mt-2 text-muted-foreground">
            Add a GitHub repository to start asking AI questions about your code
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Github className="h-5 w-5" />
              GitHub Repository URL
            </CardTitle>
            <CardDescription>
              Enter the URL of any public GitHub repository you want to analyze
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="flex-1 bg-background"
                onKeyDown={(e) => e.key === "Enter" && uploadRepo()}
              />
              <Button 
                onClick={uploadRepo} 
                disabled={loading || !repoUrl}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    Upload
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {success && (
              <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
                <CheckCircle2 className="h-4 w-4" />
                Repository uploaded successfully! You can now ask questions about it.
              </div>
            )}

            <div className="rounded-lg border border-border bg-background/50 p-4">
              <h4 className="mb-2 text-sm font-medium">Supported formats:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• https://github.com/owner/repo</li>
                <li>• https://github.com/owner/repo.git</li>
                <li>• github.com/owner/repo</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {success && (
          <div className="mt-6 text-center">
            <Link href="/chat">
              <Button variant="outline" className="gap-2">
                Start Chatting
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
