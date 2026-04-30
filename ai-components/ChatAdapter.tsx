"use client";

/**
 * @module ai-components/ChatAdapter
 *
 * Read-only chat thread renderer for the AI system.
 *
 * This adapter composes /components/chat/Message to render a static list
 * of messages — useful when the AI wants to preview a conversation without
 * wiring up live API calls. ChatInput and Chatbox are platform-only
 * components (they hold Supabase session logic) and are NOT exposed here.
 */

import Message from "@/components/chat/Message";
import { ChatAdapterProps } from "./types";
import { Sparkles } from "lucide-react";

/**
 * ChatAdapter
 *
 * Renders a read-only scrollable chat thread from a messages array.
 * Does NOT include an input box — use the platform Chatbox for that.
 */
export const ChatAdapter = ({ messages = [], loading = false }: ChatAdapterProps) => {
  return (
    <div className="flex flex-col h-full w-full bg-[var(--background)] relative z-10">
      <div className="flex-1 overflow-y-auto px-2 sm:px-6 space-y-6 scrollbar-hide">
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-[var(--muted-foreground)] gap-3 opacity-90">
            <div className="w-12 h-12 rounded-full bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center">
              <Sparkles size={20} className="text-[var(--primary)]" />
            </div>
            <p className="font-light tracking-wide text-[15px]">No messages yet</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <Message key={i} role={msg.role} content={msg.content} />
        ))}

        {loading && (
          <div className="flex justify-start pt-2">
            <div className="px-5 py-4 rounded-2xl rounded-tl-sm text-sm flex items-center gap-1.5 opacity-90 bg-[var(--card)] border border-[var(--border)]">
              <div className="w-1.5 h-1.5 bg-[var(--muted-foreground)] rounded-full animate-pulse" />
              <div className="w-1.5 h-1.5 bg-[var(--muted-foreground)] rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
              <div className="w-1.5 h-1.5 bg-[var(--muted-foreground)] rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatAdapter;
