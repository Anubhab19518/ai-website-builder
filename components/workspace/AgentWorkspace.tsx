"use client";

import { useEffect, useState, useRef } from "react";
import Message from "@/components/chat/Message";
import ChatInput from "@/components/chat/ChatInput";
import { Sparkles, ArrowRight, CheckCircle2, CircleDashed } from "lucide-react";
import { startAgent, resumeAgent, pollAgentState, AgentResponse } from "@/src/lib/agentClient";
import { DynamicRenderer } from "@/components/renderer/DynamicRenderer";
import type { SectionConfig } from "@/src/agents/nodes/layoutExecutor";
import type { Plan } from "@/src/agents/state";

interface AgentWorkspaceProps {
  projectId: string;
}

export function AgentWorkspace({ projectId }: AgentWorkspaceProps) {
  // Chat History
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  
  // Agent State
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "running" | "interrupted" | "completed" | "error">("idle");
  const [currentStep, setCurrentStep] = useState<string>("idle");
  const [interruptType, setInterruptType] = useState<AgentResponse["interruptType"]>(undefined);
  const [questions, setQuestions] = useState<string[]>([]);
  const [plan, setPlan] = useState<Plan | undefined>(undefined);
  const [blueprint, setBlueprint] = useState<SectionConfig[] | undefined>(undefined);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, interruptType]);

  // Initialisation check
  useEffect(() => {
    const initPayloadStr = sessionStorage.getItem(`init_msg_${projectId}`);
    if (initPayloadStr && status === "idle" && messages.length === 0) {
      sessionStorage.removeItem(`init_msg_${projectId}`);
      try {
        const payload = JSON.parse(initPayloadStr);
        setTimeout(() => {
          handleSend(payload.message);
        }, 100);
      } catch (e) {
        setTimeout(() => {
          handleSend(initPayloadStr);
        }, 100);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const processAgentResponse = (data: AgentResponse) => {
    setStatus(data.status);
    setCurrentStep(data.state?.currentStep || "unknown");

    if (data.state?.history) {
      setMessages(data.state.history);
    }

    if (data.message) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message ?? "",
        },
      ]);
    }

    if (data.status === "interrupted") {
      setInterruptType(data.interruptType);

      if (data.interruptType === "clarification_needed") {
        setQuestions(data.questions || []);
      }

      if (data.interruptType === "plan_approval") {
        setPlan(data.plan);
      }

      if (["layout_preview", "content_preview", "final_preview"].includes(data.interruptType || "")) {
        setBlueprint(data.blueprint);
      }
    } else if (data.status === "completed") {
      setBlueprint(data.state?.blueprint);
    } else if (data.status === "error") {
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${data.error}` }]);
    }
  };

  const handleSend = async (message: string) => {
    setLoading(true);
    // Optimistic UI
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      if (status === "idle") {
        // Start new thread
        setStatus("running");
        const data = await startAgent(projectId, message);
        processAgentResponse(data);
      } else if (status === "interrupted") {
        // Resume thread
        setStatus("running");
        setInterruptType(undefined);
        const data = await resumeAgent(projectId, message);
        processAgentResponse(data);
      }
    } catch (err: any) {
      setStatus("error");
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  // Quick Action Handlers
  const handleApprove = () => handleSend("yes");

  // Determine layout mode
  const showPreviewPanel = !!blueprint && blueprint.length > 0;

  return (
    <div className={`flex w-full h-full gap-6 transition-all duration-500 ease-in-out`}>
      {/* LEFT: Chat Panel */}
      <div className={`flex flex-col h-full bg-[var(--background)] relative z-10 transition-all duration-500 ${showPreviewPanel ? 'w-1/3 min-w-[320px]' : 'w-full max-w-4xl mx-auto'}`}>
        
        {/* Status Header */}
        {(status !== "idle") && (
          <div className="px-4 py-3 mb-2 rounded-xl bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-between text-xs font-medium tracking-wide text-zinc-400">
            <div className="flex items-center gap-2">
              {loading ? (
                <CircleDashed className="w-4 h-4 animate-spin text-indigo-400" />
              ) : status === "completed" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Sparkles className="w-4 h-4 text-indigo-400" />
              )}
              <span>
                {loading ? `Agent thinking (${currentStep})...` : 
                 status === "completed" ? "Website built successfully." : 
                 "Awaiting your input..."}
              </span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-2 sm:px-4 space-y-6 scrollbar-hide pb-4">
          {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-[var(--muted-foreground)] gap-3 opacity-90">
              <div className="w-12 h-12 rounded-full bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center">
                <Sparkles size={20} className="text-[var(--primary)]" />
              </div>
              <p className="font-light tracking-wide text-[15px]">Describe the website you want to build...</p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <Message key={i} role={msg.role as any} content={msg.content} />
          ))}

          {/* Interruption UI Injectors */}
          {!loading && status === "interrupted" && (
            <div className="flex flex-col gap-3 mt-4 ml-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {interruptType === "plan_approval" && plan && (
                <div className="bg-zinc-900 border border-indigo-500/30 rounded-xl p-4 shadow-lg">
                  <h4 className="text-sm font-semibold text-indigo-200 mb-2">Proposed Build Plan</h4>
                  <p className="text-xs text-zinc-400 mb-4">Type: {plan.type}</p>
                  <ul className="text-sm text-zinc-300 space-y-2 mb-4">
                    {plan.sections.map((s, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <ArrowRight className="w-3 h-3 text-indigo-400" /> {s}
                      </li>
                    ))}
                  </ul>
                  <button onClick={handleApprove} className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors">
                    Approve Plan
                  </button>
                </div>
              )}

              {["layout_preview", "content_preview", "final_preview"].includes(interruptType || "") && (
                <div className="bg-zinc-900 border border-indigo-500/30 rounded-xl p-4 shadow-lg flex flex-col gap-3">
                  <p className="text-sm text-indigo-200 font-medium">Review the preview on the right.</p>
                  <button onClick={handleApprove} className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors">
                    Looks Good (Proceed)
                  </button>
                </div>
              )}

            </div>
          )}

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

        <div className="mt-auto pt-2">
          <ChatInput onSend={(payload) => handleSend(payload.message)} disabled={loading} />
        </div>
      </div>

      {/* RIGHT: Dynamic Preview Panel */}
      {showPreviewPanel && (
        <div className="flex-1 h-full animate-in fade-in slide-in-from-right-8 duration-500 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-zinc-800/60 relative">
          
          {/* Preview Overlay when loading */}
          {loading && (
             <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-all">
                <div className="bg-zinc-900 text-white px-4 py-2 rounded-full border border-zinc-800 shadow-xl flex items-center gap-2 text-sm font-medium">
                   <CircleDashed className="w-4 h-4 animate-spin text-indigo-400" />
                   Updating Preview...
                </div>
             </div>
          )}

          <div className="w-full h-8 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 shrink-0">
             <div className="flex gap-1.5">
               <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
             </div>
             <div className="mx-auto text-[10px] uppercase tracking-widest font-semibold text-zinc-500">Live Blueprint Preview</div>
          </div>
          
          <div className="w-full h-[calc(100%-2rem)] bg-white relative">
            <DynamicRenderer sections={blueprint!} />
          </div>

        </div>
      )}
    </div>
  );
}
