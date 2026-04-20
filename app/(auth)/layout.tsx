import { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1c1a24] p-4 sm:p-8 font-sans">
      <div className="flex w-full max-w-[1100px] overflow-hidden rounded-[24px] bg-[#23212b] shadow-2xl min-h-[700px]">
        {/* Left Side - Image/Hero */}
        <div className="relative hidden w-[45%] p-4 md:block">
          <div className="relative h-full w-full overflow-hidden rounded-[16px]">
            {/* Background image overlay - Using a placeholder similar to the sand dunes */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542273917363-3b1817f69a5d?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-[#35256e]/30 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Content overlay */}
            <div className="relative flex h-full flex-col justify-between p-8 z-10">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-wider">
                  <Sparkles className="h-5 w-5 text-white" />
                  <span>AI BUILDER</span>
                </Link>
                <Link href="/" className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20 border border-white/10">
                  Back to website <ArrowRight size={14} />
                </Link>
              </div>
              
              <div className="text-center mb-6">
                <h2 className="mb-10 text-[28px] leading-tight font-medium tracking-wide text-white">
                  Build faster,<br />Deploy instantly
                </h2>
                <div className="flex justify-center gap-2">
                  <div className="h-1 w-6 rounded-full bg-white/30" />
                  <div className="h-1 w-6 rounded-full bg-white/30" />
                  <div className="h-1 w-8 rounded-full bg-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex w-full flex-col p-8 md:w-[55%] md:p-16 justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
