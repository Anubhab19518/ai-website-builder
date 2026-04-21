"use client"

import { useEffect } from "react";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import Link from "next/link";
import { TerminalSquare, MessageSquare, Rocket } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/dashboard");
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push("/dashboard");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-[var(--background)]/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0 font-bold text-2xl heading-future">
            <span>SynthApp</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-[var(--muted-foreground)] font-medium">
            <Link href="#features" className="hover:text-[var(--foreground)] transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-[var(--foreground)] transition-colors">How it Works</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="text-sm font-medium bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-full shadow-md hover:brightness-95 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Hero />
        <Features />

        <section id="how-it-works" className="py-24 bg-[var(--background)]">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">From idea to reality in minutes</h2>
              <p className="text-[var(--muted-foreground)] text-lg">Our AI pipeline handles the complexity so you can focus on the product.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[var(--secondary)] rounded-2xl flex items-center justify-center mb-6 text-[var(--secondary-foreground)] shadow-sm">
                  <MessageSquare size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-3">1. Describe your app</h3>
                <p className="text-[var(--muted-foreground)]">Tell the AI what you want to build using plain English. It understands context, design patterns, and features.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[var(--secondary)] rounded-2xl flex items-center justify-center mb-6 text-[var(--secondary-foreground)] shadow-sm">
                  <TerminalSquare size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-3">2. Refine with AI</h3>
                <p className="text-[var(--muted-foreground)]">Iterate on the generated code. Chat with the AI to tweak the design, add database schemas, or change logic.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[var(--secondary)] rounded-2xl flex items-center justify-center mb-6 text-[var(--secondary-foreground)] shadow-sm">
                  <Rocket size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-3">3. Deploy instantly</h3>
                <p className="text-[var(--muted-foreground)]">One click gives you a live URL. The full-stack app is deployed globally with auto-scaling infrastructure.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t bg-[var(--background)]">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-lg heading-future">
            <span>SynthApp</span>
          </div>
          <p className="text-[var(--muted-foreground)] text-sm">© {new Date().getFullYear()} SynthApp. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-[var(--muted-foreground)]">
            <Link href="#" className="hover:text-[var(--foreground)] transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-[var(--foreground)] transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-[var(--foreground)] transition-colors">Discord</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
