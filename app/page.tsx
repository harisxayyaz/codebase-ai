import Link from "next/link";
import {
  ArrowRight,
  Code2,
  MessageSquare,
  Upload,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-accent" />
                <span>AI-Powered Code Intelligence</span>
              </div>

              <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Understand your codebase
                <span className="mt-2 block text-accent">
                  in seconds, not hours
                </span>
              </h1>

              <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Upload any GitHub repository and ask questions in plain English.
                Get instant, intelligent answers about architecture,
                dependencies, and code patterns.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/upload">
                  <Button size="lg" className="gap-2 text-base">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 text-base"
                  >
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-border bg-card/50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                How it works
              </h2>
              <p className="mt-3 text-muted-foreground">
                Three simple steps to unlock AI-powered code understanding
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Upload}
                title="Upload Repository"
                description="Paste any public GitHub URL and we'll index your codebase for AI analysis."
                step="01"
              />
              <FeatureCard
                icon={Code2}
                title="AI Processing"
                description="Our AI analyzes code structure, dependencies, and patterns across your entire project."
                step="02"
              />
              <FeatureCard
                icon={MessageSquare}
                title="Ask Questions"
                description="Chat naturally about your code. Get explanations, find bugs, and understand architecture."
                step="03"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Ready to understand your code better?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Start by uploading a repository and let AI help you navigate
                through complex codebases.
              </p>
              <div className="mt-8">
                <Link href="/upload">
                  <Button size="lg" className="gap-2">
                    Upload Your First Repo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>Built with AI to help developers understand code faster.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  step,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  step: string;
}) {
  return (
    <div className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:border-accent/50 hover:bg-card/80">
      <div className="absolute right-4 top-4 font-mono text-3xl font-bold text-muted-foreground/20">
        {step}
      </div>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
        <Icon className="h-6 w-6 text-accent" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
