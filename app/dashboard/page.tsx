"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ChevronDown, Sparkles } from "lucide-react"
import { AppSidebar } from "@/components/layout/AppSidebar"
import ChatInput, { SendPayload } from "@/components/chat/ChatInput"

export default function Dashboard() {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/login")
        return
      }

      const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name
      if (fullName) {
        setName(fullName.split(" ")[0])
      } else {
        const emailName = session.user.email?.split("@")[0] || "there"
        setName(emailName.charAt(0).toUpperCase() + emailName.slice(1))
      }
      setLoading(false)
    }

    getUser()
  }, [router])

  const handleStartProject = (payload: SendPayload) => {
    if (!payload.message.trim() && payload.files.length === 0) return
    const projectId = crypto.randomUUID()
    // Storing full payload payload for Chatbox to use
    sessionStorage.setItem(`init_msg_${projectId}`, JSON.stringify(payload))
    router.push(`/project/${projectId}`)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-white">Loading...</div>
  }

  return (
    <div className="flex h-screen w-full bg-[#0a0a0b] text-white font-sans overflow-hidden">
      {/* Left Sidebar */}
      <AppSidebar />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-full bg-[#0a0a0b]">
        
        {/* Top Header Model Selector (Floating like reference) */}
        <header className="h-20 flex items-center px-8 relative z-20">
            <button className="flex items-center gap-2 bg-[#121214] hover:bg-[#18181b] transition-colors px-4 py-2 rounded-xl border border-[#27272a] shadow-sm text-sm font-medium text-[#e4e4e7]">
            <Sparkles className="w-4 h-4 text-[#818cf8]" />
            SynthApp 4o
            <ChevronDown className="w-4 h-4 text-[#71717a] ml-2" />
          </button>
        </header>

        {/* Center Content Focused Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 w-full overflow-y-auto">
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center pb-32">
            
            {/* Greeting Area */}
            <div className="mb-12 w-full flex flex-col items-center">
              
              {/* 3D CSS Orb */}
              <div className="w-20 h-20 rounded-full mb-8 relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#d8b4fe] via-[#a855f7] to-[#3b82f6] shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),_0_15px_35px_rgba(168,85,247,0.4)]"></div>
                {/* Highlight for 3D effect */}
                <div className="absolute top-2 left-3 w-8 h-8 rounded-full bg-white opacity-40 blur-[4px]"></div>
                <div className="absolute bottom-2 right-4 w-6 h-6 rounded-full bg-[#1e1b4b] opacity-60 blur-[6px]"></div>
              </div>

              <h1 className="text-[44px] md:text-[52px] font-semibold tracking-tight text-[#f4f4f5] leading-tight">
                {getGreeting()}, {name}
              </h1>
              <h2 className="text-[40px] md:text-[46px] font-semibold tracking-tight mt-1 flex items-center justify-center gap-2">
                <span className="text-[#a1a1aa]">How Can I</span> 
                <span className="inline-block text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, #818cf8, #a855f7)' }}>
                  Assist You Today?
                </span>
              </h2>
            </div>

            {/* Command Center Input Panel */}
            <div className="w-full mt-4">
              <ChatInput onSend={handleStartProject} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
