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

        {/* AI Avatar (light) */}
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center mt-1">
            <Sparkles size={16} className="text-[var(--primary)]" />
          </div>
        )}

        <div
          className={`text-[15px] leading-relaxed whitespace-pre-wrap font-light tracking-wide ${
            isUser
              ? "px-5 py-3.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-3xl rounded-tr-md max-w-[85%] sm:max-w-[75%] border border-[var(--primary)]/20 shadow-sm"
              : "bg-[var(--card)] text-[var(--card-foreground)] px-4 py-3 rounded-2xl border border-[var(--border)] shadow-sm pt-1.5"
          }`}
        >
          {content}
        </div>
      </div>
    </div>
  )
}