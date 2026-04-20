import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import Link from "next/link";
import { Sparkles, TerminalSquare, MessageSquare, Rocket } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <span>AI App Builder</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400 font-medium">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Hero />
        <Features />
        
        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-zinc-950">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-wide">From idea to reality in minutes</h2>
              <p className="text-zinc-400 text-lg">Our AI pipeline handles the complexity so you can focus on the product.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-indigo-900/30 border border-indigo-500/30 rounded-2xl flex items-center justify-center mb-6 text-indigo-400">
                  <MessageSquare size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">1. Describe your app</h3>
                <p className="text-zinc-400">Tell the AI what you want to build using plain English. It understands context, design patterns, and features.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-900/30 border border-purple-500/30 rounded-2xl flex items-center justify-center mb-6 text-purple-400">
                  <TerminalSquare size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">2. Refine with AI</h3>
                <p className="text-zinc-400">Iterate on the generated code. Chat with the AI to tweak the design, add database schemas, or change logic.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-900/30 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-6 text-blue-400">
                  <Rocket size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">3. Deploy instantly</h3>
                <p className="text-zinc-400">One click gives you a live URL. The full-stack app is deployed globally with auto-scaling infrastructure.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/10 bg-black">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-lg text-white">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <span>AI App Builder</span>
          </div>
          <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} AI App Builder. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-zinc-500">
            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-white transition-colors">Discord</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
