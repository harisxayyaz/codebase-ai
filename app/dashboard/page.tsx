"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderGit2,
  MessageSquare,
  Trash2,
  Plus,
  ArrowRight,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

interface Repo {
  id: string;
  name: string;
  url?: string;
  uploadedAt?: string;
}

export default function DashboardPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const res = await fetch("/api/repos");
        const data = await res.json();
        setRepos(data.repos || []);
      } catch (error) {
        console.error("Failed to fetch repos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRepos();
  }, []);

  const deleteRepo = async (repoId: string) => {
    if (!confirm("Delete this repo?")) return;

    await fetch(`/api/chats/${repoId}`, {
      method: "DELETE",
    });
    setRepos((prev) => prev.filter((r) => r.id !== repoId));
  };
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your uploaded repositories
            </p>
          </div>
          <Link href="/upload">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Repository
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Repositories
              </CardTitle>
              <FolderGit2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{repos.length}</div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                AI Queries
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">--</div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Link href="/chat" className="flex-1">
                  <Button variant="outline" className="w-full gap-2" size="sm">
                    <MessageSquare className="h-4 w-4" />
                    Chat
                  </Button>
                </Link>
                <Link href="/upload" className="flex-1">
                  <Button variant="outline" className="w-full gap-2" size="sm">
                    <Plus className="h-4 w-4" />
                    Upload
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Repositories List */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Repositories</CardTitle>
            <CardDescription>
              Your uploaded repositories available for AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              </div>
            ) : repos.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <FolderGit2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No repositories yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload your first repository to get started
                </p>
                <Link href="/upload" className="mt-4">
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Repository
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {repos.map((repo) => (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                        <FolderGit2 className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-medium">{repo.name || repo.id}</h4>
                        {repo.url && (
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View on GitHub
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/chat?repo=${repo.id}`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span className="hidden sm:inline">Chat</span>
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete repository?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the repository from
                              your account. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteRepo(repo.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
