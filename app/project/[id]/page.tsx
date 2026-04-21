import ChatBox from "@/components/chat/Chatbox"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Sparkles, ChevronDown } from "lucide-react"

export default function ProjectPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {/* Left Sidebar */}
      <AppSidebar />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Ambient Glow Blobs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Top Header */}
        <header className="h-16 flex items-center px-6 relative z-20">
          <button className="flex items-center gap-2.5 bg-zinc-900/40 hover:bg-zinc-800/60 transition-all px-4 py-2 rounded-xl border border-zinc-800 text-sm font-medium text-zinc-300 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Project: {params.id.split('-')[0]}
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 ml-1" />
          </button>
        </header>

        {/* Center Chat Content */}
        <div className="flex-1 flex flex-col items-center justify-end md:justify-center px-4 sm:px-6 relative z-10 w-full max-w-5xl mx-auto pb-4">
          <div className="w-full h-[88vh] md:h-[88vh]">
            <ChatBox projectId={params.id} />
          </div>
        </div>
      </main>
    </div>
  )
}