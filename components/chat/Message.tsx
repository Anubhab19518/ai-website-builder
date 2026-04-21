import { Sparkles, User } from "lucide-react"

type Props = {
  role: "user" | "assistant"
  content: string
}

export default function Message({ role, content }: Props) {
  const isUser = role === "user"

  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div className={`flex gap-4 sm:gap-5 w-full ${isUser ? "justify-end" : "max-w-[90%] sm:max-w-[85%]"}`}>
        
        {/* AI Avatar */}
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/[0.05] border border-white/[0.05] flex items-center justify-center mt-1">
            <Sparkles size={16} className="text-zinc-400" />
          </div>
        )}

        <div
          className={`text-[15px] leading-relaxed whitespace-pre-wrap font-light tracking-wide ${
            isUser
              ? "px-5 py-3.5 bg-zinc-800/80 text-zinc-100 rounded-3xl rounded-tr-md max-w-[85%] sm:max-w-[75%] border border-white/[0.05] shadow-sm"
              : "text-zinc-300 pt-1.5"
          }`}
        >
          {content}
        </div>
      </div>
    </div>
  )
}