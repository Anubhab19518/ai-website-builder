/**
 * @module src/agents/graph
 *
 * LangGraph Orchestrator — the compiled state machine for the AI website
 * generation pipeline.
 *
 * Current graph (Phase 1):
 *
 *   START
 *     ↓
 *   plannerNode          ← clarifies requirements, writes state.plan
 *     ↓                    may interrupt() for clarifying questions
 *   humanApprovalNode    ← ALWAYS interrupts, waits for explicit approval
 *     ↓
 *   [conditional routing via Command.goto]
 *     ├── approved  → END
 *     └── rejected  → plannerNode  (feedback loop)
 *
 * Extension points (Phase 2+):
 *   Add executor nodes after the END and wire them in here.
 *   The graph is intentionally modular — each new agent is one addNode() call.
 *
 * Persistence:
 *   MemorySaver is used for development (in-memory checkpoints).
 *   In production swap it for a persistent checkpointer backed by
 *   Supabase/Postgres via @langchain/langgraph-checkpoint-postgres.
 *
 * Thread ID:
 *   Every graph invocation carries a { configurable: { thread_id } }.
 *   Reusing the same thread_id resumes from the last checkpoint.
 *   A new thread_id starts a fresh workflow.
 */

import { StateGraph, MemorySaver, START, END } from "@langchain/langgraph";
import { AgentStateAnnotation } from "./state";
import { plannerNode } from "./planner";
import { humanApprovalNode } from "./nodes/humanApproval";
import { layoutExecutorNode } from "./nodes/layoutExecutor";
import { humanLayoutFeedbackNode } from "./nodes/humanLayoutFeedback";
import { contentExecutorNode } from "./nodes/contentExecutor";
import { humanContentFeedbackNode } from "./nodes/humanContentFeedback";
import { validatorNode } from "./nodes/validator";
import { refinerNode } from "./nodes/refiner";
import { humanFinalFeedbackNode } from "./nodes/humanFinalFeedback";

// ---------------------------------------------------------------------------
// Build the graph
// ---------------------------------------------------------------------------

const workflow = new StateGraph(AgentStateAnnotation)

  // ── Nodes ─────────────────────────────────────────────────────────────────
  .addNode("planner", plannerNode)
  .addNode("human_approval", humanApprovalNode, {
    ends: ["__end__", "planner", "layout_executor"],
  })
  .addNode("layout_executor", layoutExecutorNode)
  .addNode("human_layout_feedback", humanLayoutFeedbackNode, {
    ends: ["content_executor", "layout_executor"],
  })
  .addNode("content_executor", contentExecutorNode)
  .addNode("human_content_feedback", humanContentFeedbackNode, {
    ends: ["validator", "content_executor"],
  })
  .addNode("validator", validatorNode)
  .addNode("refiner", refinerNode)
  .addNode("human_final_feedback", humanFinalFeedbackNode, {
    ends: ["__end__", "refiner"],
  })

  // ── Edges ─────────────────────────────────────────────────────────────────
  // Linear entry: START → planner
  .addEdge(START, "planner")

  // After the planner produces a plan, hand off to human approval.
  // (If the planner interrupted for clarification, the graph pauses here
  //  and re-enters plannerNode on resume — it never reaches human_approval
  //  until the plan is actually written to state.)
  .addEdge("planner", "human_approval")
  .addEdge("layout_executor", "human_layout_feedback")
  .addEdge("content_executor", "human_content_feedback")
  .addEdge("validator", "refiner")
  .addEdge("refiner", "human_final_feedback");

  // Note: human_approval uses Command({ goto: ... }) for its outgoing edges,
  // so no addEdge() calls are needed from that node. LangGraph resolves
  // Command.goto dynamically at runtime.

// ---------------------------------------------------------------------------
// Compile with MemorySaver checkpointer (enables interrupt / resume)
// ---------------------------------------------------------------------------

/**
 * The checkpointer is REQUIRED for interrupt() to work.
 * Without it, the graph cannot save state between turns and
 * interrupt() will throw at runtime.
 *
 * TODO (production): replace with PostgresSaver:
 *   import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
 *   const checkpointer = PostgresSaver.fromConnString(process.env.DATABASE_URL!);
 *   await checkpointer.setup();
 */
const checkpointer = new MemorySaver();

export const agentGraph = workflow.compile({ checkpointer });

// ---------------------------------------------------------------------------
// Type helpers for callers (API routes)
// ---------------------------------------------------------------------------

export type { GraphState } from "./state";
export type { ApprovalPayload } from "./nodes/humanApproval";

/**
 * Convenience: build a standard graph config for a given thread.
 * Every invoke/stream call for the same thread reuses the saved checkpoint.
 */
export function buildGraphConfig(threadId: string) {
  return {
    configurable: {
      thread_id: threadId,
    },
  };
}
