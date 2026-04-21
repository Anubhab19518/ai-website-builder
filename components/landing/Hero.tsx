import Link from "next/link";
import { ArrowRight, Bot, Code2, Database } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-20 pb-28 overflow-hidden bg-futuristic">
      {/* flowing blobs */}
      <div className="absolute -left-80 top-0 w-[720px] h-[720px] bg-gradient-to-tr from-[var(--primary)]/12 via-transparent to-transparent rounded-full blur-3xl opacity-45 pointer-events-none" />
      <div className="absolute right-0 -top-14 w-[520px] h-[520px] bg-gradient-to-br from-[#4c1d95]/10 to-transparent rounded-full blur-2xl opacity-40 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(255,255,255,0.03)] text-[var(--primary)] text-sm font-medium mb-6 shadow-sm border border-[var(--glass-border)]">
            <span>Next‑gen AI code generation</span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.02] bg-clip-text text-transparent bg-gradient-to-r from-[#c4a0ff] to-[var(--primary)] heading-future">
            Build full‑stack apps with AI
          </h1>

          <p className="text-lg text-[var(--muted-foreground)] mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Describe your idea, iterate with an intelligent assistant, and deploy instantly. Production-ready frontends, APIs, and schemas generated for you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link href="/signup" className="w-full sm:w-auto px-7 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full font-semibold shadow-md flex items-center gap-2 justify-center hover:brightness-95 transition-all">
              Get Started <ArrowRight size={18} />
            </Link>
            <Link href="#demo" className="w-full sm:w-auto px-7 py-3 bg-[rgba(255,255,255,0.02)] border border-[var(--glass-border)] text-[var(--muted-foreground)] rounded-full font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all">
              View Demo
            </Link>
          </div>
        </div>

        <div className="flex-1 w-full max-w-xl lg:max-w-none relative">
          <div className="absolute -inset-1 rounded-2xl blur opacity-40" />
          <div className="relative glass rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[480px] border-[1px] border-[var(--glass-border)]">
            <div className="h-12 flex items-center px-4 gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="mx-auto text-sm text-[var(--muted-foreground)] font-medium font-mono">app-builder.tsx</div>
            </div>
            <div className="flex-1 flex overflow-hidden">
              <div className="w-14 border-r border-[rgba(255,255,255,0.03)] flex flex-col items-center py-6 gap-6 text-[var(--muted-foreground)]">
                <Bot size={18} className="text-[var(--primary)]" />
                <Code2 size={18} className="text-[var(--muted-foreground)]" />
                <Database size={18} className="text-[var(--muted-foreground)]" />
              </div>

              <div className="flex-1 flex flex-col px-4">
                <div className="p-3 border-b border-[rgba(255,255,255,0.03)] font-mono text-sm">
                  <div className="text-[var(--muted-foreground)] mb-2">{"// Describe your app"}</div>
                  <div className="text-[var(--primary)]">Create a modern dashboard with a light, premium UI and thoughtful spacing.</div>
                </div>

                <div className="p-4 flex-1 font-mono text-sm overflow-hidden text-[var(--muted-foreground)] space-y-2">
                  <div className="text-[#b794f4]">import</div>
                  <div className="pl-4">{"{ useState } from 'react';"}</div>
                  <div className="pl-4">{"{ DashboardLayout } from '@/components/layout';"}</div>
                  <div className="text-[#90cdf4] mt-2">export default function Dashboard() {'{'}</div>
                  <div className="pl-4 text-[var(--muted-foreground)]">// AI is generating UI components...</div>
                </div>

                <div className="h-1 w-full bg-[rgba(255,255,255,0.02)]">
                  <div className="h-full bg-gradient-to-r from-[#c4a0ff] to-[var(--primary)] w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
