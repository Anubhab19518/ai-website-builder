"use client"

import { useEffect, useState, useRef } from "react"
import Message from "./Message"
import ChatInput from "./ChatInput"
import { supabase } from "@/lib/supabase/client"
import { Sparkles } from "lucide-react"

export default function ChatBox({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  // Fetch existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ""
      
      fetch(`/api/chat?projectId=${projectId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          let loadedMessages = []
          if (Array.isArray(data)) {
            loadedMessages = data
            setMessages(data)
          }

          // Check for initial message from dashboard
          const initPayloadStr = sessionStorage.getItem(`init_msg_${projectId}`)
          if (initPayloadStr && loadedMessages.length === 0) {
            sessionStorage.removeItem(`init_msg_${projectId}`)
            try {
              const payload = JSON.parse(initPayloadStr)
              setTimeout(() => {
                handleSend(payload)
              }, 100)
            } catch(e) {
              // fallback if it was the old string format
              setTimeout(() => {
                handleSend({ message: initPayloadStr, tool: "chat", files: [] })
              }, 100)
            }
          }
        })
    }
    fetchMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const handleSend = async (payload: { message: string, tool: string, files: File[] }) => {
    // For now, render the message normally. 
    // In a real app, you might upload files to a bucket here first and pass URLs.
    
    // Create an optimistic UI message, indicating tool usage if not standard chat
    const toolIndicator = payload.tool !== "chat" ? `[Using tool: ${payload.tool}] ` : ""
    const fileIndicator = payload.files.length > 0 ? ` [Attached ${payload.files.length} file(s)]` : ""
    
    const newMsg = { role: "user", content: `${toolIndicator}${payload.message}${fileIndicator}` }
    setMessages((prev) => [...prev, newMsg])
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ""

      // Reduce token use client-side: normalize whitespace and cap message length
      const normalized = payload.message.replace(/\s+/g, ' ').trim()
      const MAX_CHARS = 2000
      const contentToSend = normalized.length > MAX_CHARS ? (normalized.slice(0, MAX_CHARS) + '...') : normalized

      // Pass the reduced payload to the backend
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          projectId, 
          content: contentToSend,
          tool: payload.tool,
          // We don't send raw files in JSON, just meta. Real implementation would require FormData
          hasFiles: payload.files.length > 0 
        }),
      })

      const data = await res.json()
      
      if (data.reply) {
        setMessages((prev) => [...prev, data.reply])
      }
    } catch (err) {
      console.error("Chat Error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-[var(--background)] relative z-10">
      <div className="flex-1 overflow-y-auto px-2 sm:px-6 space-y-6 scrollbar-hide">
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-[var(--muted-foreground)] gap-3 opacity-90">
            <div className="w-12 h-12 rounded-full bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center">
              <Sparkles size={20} className="text-[var(--primary)]" />
            </div>
            <p className="font-light tracking-wide text-[15px]">Start typing to build your app</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <Message key={i} role={msg.role} content={msg.content} />
        ))}
        {loading && (
          <div className="flex justify-start pt-2">
            <div className="px-5 py-4 rounded-2xl rounded-tl-sm text-sm flex items-center gap-1.5 opacity-90 bg-[var(--card)] border border-[var(--border)]">
              <div className="w-1.5 h-1.5 bg-[var(--muted-foreground)] rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-[var(--muted-foreground)] rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-1.5 h-1.5 bg-[var(--muted-foreground)] rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="mt-auto">
        <ChatInput onSend={handleSend} disabled={loading} />
      </div>
    </div>
  )
}