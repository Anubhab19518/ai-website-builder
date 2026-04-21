"use client"

import { useState, useRef } from "react"
import { SendHorizonal, Lightbulb, Image as ImageIcon, Search as SearchIcon, Sparkles, Paperclip, Code, MessageSquare, X } from "lucide-react"

export type ToolType = "chat" | "reasoning" | "generate" | "research"

export interface SendPayload {
  message: string
  tool: ToolType
  files: File[]
}

export default function ChatInput({ 
  onSend, 
  disabled 
}: { 
  onSend: (payload: SendPayload) => void
  disabled?: boolean
}) {
  const [input, setInput] = useState("")
  const [selectedTool, setSelectedTool] = useState<ToolType>("chat")
  const [files, setFiles] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if ((!input.trim() && files.length === 0) || disabled) return
    
    onSend({
      message: input,
      tool: selectedTool,
      files: files
    })
    
    setInput("")
    setFiles([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const tools = [
    { id: "chat", label: "Chat", icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: "reasoning", label: "Reasoning", icon: <Lightbulb className="w-3.5 h-3.5" /> },
    { id: "generate", label: "Generate App", icon: <Code className="w-3.5 h-3.5" /> },
    { id: "research", label: "Deep Research", icon: <SearchIcon className="w-3.5 h-3.5" /> },
  ] as const

  return (
    <div className="p-4 sm:p-6 pt-2 bg-transparent w-full relative z-20">
      <div className={`w-full bg-[var(--card)] border rounded-3xl p-4 pb-3 shadow-[0_8px_30px_rgba(2,6,23,0.06)] flex flex-col transition-all group ${disabled ? 'opacity-70 pointer-events-none border-[var(--border)]' : 'border-[var(--border)] hover:border-[var(--ring)] focus-within:border-[var(--ring)] focus-within:ring-2 focus-within:ring-[var(--ring)]/20'}`}>
        
        {/* File Attachments Preview */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 px-2 pb-3">
            {files.map((file, i) => (
                <div key={i} className="flex items-center gap-2 bg-[var(--muted)] text-[var(--muted-foreground)] text-xs px-3 py-1.5 rounded-lg border border-[var(--border)]">
                <span className="truncate max-w-[120px]">{file.name}</span>
                <button onClick={() => removeFile(i)} className="hover:text-white transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Top part: Icon + Textarea */}
        <div className="flex items-start gap-3 px-2 pt-2 pb-6">
          <Sparkles className="w-6 h-6 text-[var(--primary)] shrink-0 mt-0.5 opacity-90" />
          <textarea
            ref={textareaRef}
            className="w-full bg-transparent resize-none outline-none text-[var(--foreground)] text-[17px] placeholder-[var(--muted-foreground)] min-h-[50px] max-h-[250px] leading-relaxed disabled:opacity-50"
            placeholder="Initiate a query or send a command to the AI..."
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
          />
        </div>
        
        {/* Bottom part: Buttons */}
        <div className="flex items-center justify-between px-1">
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 hidden sm:flex">
            
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--secondary)] border border-[var(--border)] hover:bg-[var(--muted)] transition-all text-[var(--muted-foreground)]"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            
            <div className="w-[1px] h-4 bg-[var(--border)] mx-1"></div>

            {/* Dynamic Tools */}
            {tools.map((tool) => {
              const isActive = selectedTool === tool.id
              return (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[13px] font-medium ${
                      isActive
                        ? 'bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]'
                        : 'bg-[var(--secondary)] border-[var(--border)] hover:bg-[var(--muted)] text-[var(--muted-foreground)]'
                    }`}
                >
                  {tool.icon}
                  {tool.label}
                </button>
              )
            })}
          </div>

          <div className="sm:hidden text-[11px] text-[#71717a] font-medium px-2 uppercase tracking-widest">
            {tools.find(t => t.id === selectedTool)?.label || 'AI'}
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={(!input.trim() && files.length === 0) || disabled}
            className="flex items-center justify-center w-8 h-8 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:brightness-95 disabled:opacity-20 transition-all shrink-0 ml-auto"
          >
            <SendHorizonal size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}