import Link from "next/link";
import { ArrowRight, Sparkles, Bot, Code2, Database } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] opacity-30 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-indigo-300 font-medium mb-8">
            <Sparkles size={16} />
            <span>Next-gen AI code generation</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold tracking-wide mb-6 bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent leading-[1.1]">
            Build full-stack apps with AI
          </h1>
          
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Describe your idea, refine it with chat, and deploy instantly. We write the frontend, backend, and configure the database for you.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors">
              Get Started <ArrowRight size={18} />
            </Link>
            <Link href="#demo" className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
              View Demo
            </Link>
          </div>
        </div>

        {/* Visual Element - Chat / Code Interface */}
        <div className="flex-1 w-full max-w-xl lg:max-w-none relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20" />
          <div className="relative bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
            {/* Window header */}
            <div className="h-10 bg-zinc-900 border-b border-white/10 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="mx-auto text-xs text-zinc-500 font-medium font-mono">app-builder.tsx</div>
            </div>
            
            {/* Interface body */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              <div className="w-16 border-r border-white/10 flex flex-col items-center py-4 gap-6 text-zinc-500">
                <Bot size={20} className="text-indigo-400" />
                <Code2 size={20} />
                <Database size={20} />
              </div>
              
              {/* Main content */}
              <div className="flex-1 flex flex-col bg-[#0d0d0d]">
                <div className="p-4 border-b border-white/5 font-mono text-sm">
                  <div className="text-zinc-400 mb-2">{"// Describe your app"}</div>
                  <div className="text-indigo-300">Create a modern dashboard with a dark theme, a sidebar, and a chart component.</div>
                </div>
                <div className="p-4 flex-1 font-mono text-sm overflow-hidden text-zinc-300">
                  <div className="text-purple-400 mb-2">import</div>
                  <div className="pl-4 mb-1">{"{ useState }"} <span className="text-purple-400">from</span> <span className="text-green-300">&apos;react&apos;</span>;</div>
                  <div className="pl-4 mb-4">{"{ DashboardLayout }"} <span className="text-purple-400">from</span> <span className="text-green-300">&apos;@/components/layout&apos;</span>;</div>
                  
                  <div className="text-blue-400 mb-2">export default function</div>
                  <div className="pl-4 mb-1">{"Dashboard() {"}</div>
                  <div className="pl-8 text-zinc-500 mb-2">{"// AI is generating UI components..."}</div>
                  <div className="pl-8 mb-1"><span className="text-pink-400">return</span> (</div>
                  <div className="pl-12 text-blue-300">{"<DashboardLayout>"}</div>
                  <div className="pl-16 text-blue-300">{"<Sidebar />"}</div>
                  <div className="pl-16 text-blue-300">{"<MainContent>"}</div>
                  <div className="pl-20 text-blue-300">{"<ChartWidget data={mockData} />"}</div>
                  <div className="pl-16 text-blue-300">{"</MainContent>"}</div>
                  <div className="pl-12 text-blue-300">{"</DashboardLayout>"}</div>
                  <div className="pl-8">);</div>
                  <div className="pl-4">{"}"}</div>
                </div>
                
                {/* Generation animation bar */}
                <div className="h-1 w-full bg-zinc-800">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-2/3 animate-[pulse_2s_ease-in-out_infinite]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
