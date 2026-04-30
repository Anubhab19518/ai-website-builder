/**
 * @module app/api/agent/route
 *
 * HTTP API surface for the LangGraph agent system.
 *
 * Endpoints:
 *   POST /api/agent   — Start a new workflow or resume an interrupted one
 *   GET  /api/agent   — Retrieve the current graph state for a thread
 *
 * Request body (POST):
 * ```json
 * {
 *   "threadId": "uuid-of-this-conversation",
 *   "userPrompt": "Build me a SaaS landing page",   // required on first call
 *   "resume": "yes"                                  // required on resume calls
 * }
 * ```
 *
 * Response shape:
 * ```json
 * {
 *   "status": "interrupted" | "completed" | "error",
 *   "interruptType": "clarification_needed" | "plan_approval",  // when interrupted
 *   "message": "...",           // what to show the user
 *   "questions": [...],         // for clarification_needed
 *   "plan": "...",              // for plan_approval
 *   "state": { ... }            // full graph state snapshot
 * }
 * ```
 *
 * Human-in-the-loop flow:
 *   1. Client sends { threadId, userPrompt }
 *   2. Server starts graph → plannerNode may interrupt for clarification
 *   3. Response: { status: "interrupted", interruptType: "clarification_needed", ... }
 *   4. Client shows questions to user
 *   5. Client sends { threadId, resume: "<answers>" }
 *   6. Server resumes graph → planner generates plan → humanApproval interrupts
 *   7. Response: { status: "interrupted", interruptType: "plan_approval", plan: "..." }
 *   8. Client shows plan, user responds "yes" or feedback
 *   9. Client sends { threadId, resume: "yes" }
 *  10. Response: { status: "completed" }
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { Command } from "@langchain/langgraph";
import { agentGraph, buildGraphConfig } from "@/src/agents/graph";
import { createServerClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Helper: extract interrupt payload from graph result
// ---------------------------------------------------------------------------

interface GraphResult {
  __interrupt__?: Array<{ value: unknown }>;
  [key: string]: unknown;
}

function extractInterrupt(result: GraphResult) {
  const interrupts = result.__interrupt__;
  if (!interrupts || interrupts.length === 0) return null;
  return interrupts[0].value as Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// POST — start or resume a workflow turn
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { threadId, userPrompt, resume } = body as {
      threadId?: string;
      userPrompt?: string;
      resume?: string;
    };

    // Auth guard
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const supabase = createServerClient(token);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!threadId) {
      return NextResponse.json(
        { error: "threadId is required" },
        { status: 400 }
      );
    }

    const config = buildGraphConfig(threadId);

    let result: GraphResult;

    if (resume !== undefined) {
      // ── Resume path: user responded to an interrupt ────────────────────────
      result = (await agentGraph.invoke(
        new Command({ resume }),
        config
      )) as GraphResult;
    } else {
      // ── Start path: fresh invocation with userPrompt ───────────────────────
      if (!userPrompt) {
        return NextResponse.json(
          { error: "userPrompt is required for new conversations" },
          { status: 400 }
        );
      }

      result = (await agentGraph.invoke(
        {
          threadId,
          userPrompt,
          history: [{ role: "user", content: userPrompt }],
          currentStep: "start",
          isApproved: false,
        },
        config
      )) as GraphResult;
    }

    // ── Check for interrupts ───────────────────────────────────────────────
    const interrupt = extractInterrupt(result);

    if (interrupt) {
      const type = interrupt.type as string;

      if (type === "clarification_needed") {
        return NextResponse.json({
          status: "interrupted",
          interruptType: "clarification_needed",
          message: interrupt.message,
          questions: interrupt.questions,
          state: {
            currentStep: result.currentStep,
            history: result.history,
          },
        });
      }

      if (type === "plan_approval") {
        return NextResponse.json({
          status: "interrupted",
          interruptType: "plan_approval",
          message: interrupt.message,
          plan: interrupt.plan,
          instructions: interrupt.instructions,
          state: {
            currentStep: result.currentStep,
            plan: result.plan,
            history: result.history,
            isApproved: result.isApproved,
          },
        });
      }

      if (type === "layout_preview") {
        return NextResponse.json({
          status: "interrupted",
          interruptType: "layout_preview",
          message: interrupt.message,
          blueprint: interrupt.blueprint,
          instructions: interrupt.instructions,
          state: {
            currentStep: result.currentStep,
            blueprint: result.blueprint,
            history: result.history,
          },
        });
      }

      if (type === "content_preview") {
        return NextResponse.json({
          status: "interrupted",
          interruptType: "content_preview",
          message: interrupt.message,
          blueprint: interrupt.blueprint,
          instructions: interrupt.instructions,
          state: {
            currentStep: result.currentStep,
            blueprint: result.blueprint,
            history: result.history,
          },
        });
      }

      if (type === "final_preview") {
        return NextResponse.json({
          status: "interrupted",
          interruptType: "final_preview",
          message: interrupt.message,
          blueprint: interrupt.blueprint,
          instructions: interrupt.instructions,
          state: {
            currentStep: result.currentStep,
            blueprint: result.blueprint,
            history: result.history,
          },
        });
      }

      // Unknown interrupt type — surface raw payload
      return NextResponse.json({
        status: "interrupted",
        interruptType: "unknown",
        payload: interrupt,
      });
    }

    // ── No interrupt: workflow reached END ─────────────────────────────────
    return NextResponse.json({
      status: "completed",
      state: {
        currentStep: result.currentStep,
        plan: result.plan,
        blueprint: result.blueprint,
        isApproved: result.isApproved,
        history: result.history,
        errors: result.errors,
      },
    });
  } catch (err) {
    console.error("[agent route] Error:", err);
    return NextResponse.json(
      { error: (err as Error).message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// GET — inspect current thread state (useful for UI progress polling)
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get("threadId");

    if (!threadId) {
      return NextResponse.json({ error: "threadId is required" }, { status: 400 });
    }

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const supabase = createServerClient(token);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = buildGraphConfig(threadId);
    const state = await agentGraph.getState(config);

    return NextResponse.json({
      status: "ok",
      snapshot: state.values,
      nextNodes: state.next,
      tasks: state.tasks,
    });
  } catch (err) {
    console.error("[agent route GET] Error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
