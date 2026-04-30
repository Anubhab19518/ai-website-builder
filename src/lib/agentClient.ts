/**
 * @module src/lib/agentClient
 *
 * Client for interacting with the LangGraph Agent API.
 */

import { supabase } from "@/lib/supabase/client";
import type { SectionConfig } from "@/src/agents/nodes/layoutExecutor";
import type { Plan } from "@/src/agents/state";

export interface AgentResponse {
  status: "interrupted" | "completed" | "error";
  interruptType?:
    | "clarification_needed"
    | "plan_approval"
    | "layout_preview"
    | "content_preview"
    | "final_preview"
    | "unknown";
  message?: string;
  questions?: string[];
  plan?: Plan;
  blueprint?: SectionConfig[];
  instructions?: string;
  state?: any;
  error?: string;
}

export async function startAgent(threadId: string, userPrompt: string): Promise<AgentResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || "";

  const res = await fetch("/api/agent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ threadId, userPrompt }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to start agent workflow");
  }

  return res.json();
}

export async function resumeAgent(threadId: string, resume: string): Promise<AgentResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || "";

  const res = await fetch("/api/agent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ threadId, resume }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to resume agent workflow");
  }

  return res.json();
}

export async function pollAgentState(threadId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || "";

  const res = await fetch(`/api/agent?threadId=${encodeURIComponent(threadId)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}
