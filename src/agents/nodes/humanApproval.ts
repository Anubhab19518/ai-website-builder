/**
 * @module src/agents/nodes/humanApproval
 *
 * Human-in-the-Loop Approval Node
 *
 * This is a BLOCKING node — it MUST pause graph execution and wait for
 * explicit human approval before the workflow can proceed.
 *
 * Mechanism:
 *   - Calls LangGraph's interrupt() with the plan as payload
 *   - Graph state is checkpointed; execution suspends indefinitely
 *   - The API layer surfaces the plan to the user and collects their response
 *   - When the user responds, the caller resumes with:
 *       graph.invoke(new Command({ resume: "yes" }), config)
 *     or:
 *       graph.invoke(new Command({ resume: "needs changes: ..." }), config)
 *
 * Routing (via Command.goto):
 *   - Approved  → "end" (graph terminates; Executor agents pick up next)
 *   - Rejected  → "planner" (loop back with feedback in state)
 *
 * Approval detection:
 *   The node checks if the resume string starts with "yes" (case-insensitive).
 *   Any other value is treated as a change request and stored in state.feedback.
 */

import { interrupt, Command } from "@langchain/langgraph";
import type { GraphState } from "../state";

// ---------------------------------------------------------------------------
// Approval payload type surfaced to the caller via __interrupt__
// ---------------------------------------------------------------------------

export interface ApprovalPayload {
  type: "plan_approval";
  plan: import("../state").Plan;
  message: string;
  instructions: string;
}

// ---------------------------------------------------------------------------
// Human Approval Node
// ---------------------------------------------------------------------------

/**
 * humanApprovalNode
 *
 * LangGraph node function.
 *
 * Pauses at interrupt(), resumes with human response, then routes:
 *   - "yes" / "approved" / "looks good" → approved → END
 *   - anything else                       → feedback loop → planner
 */
export async function humanApprovalNode(
  state: GraphState
): Promise<Command> {
  if (!state.plan) {
    // Guard: if somehow we arrive here without a plan, loop back
    return new Command({
      update: {
        currentStep: "human_approval",
        errors: ["humanApprovalNode reached without a plan — routing back to planner"],
      },
      goto: "planner",
    });
  }

  const planSummary = [
    `Website Type: ${state.plan.type}`,
    `Sections: ${state.plan.sections.join(" → ")}`,
    state.plan.notes ? `Notes: ${state.plan.notes}` : null,
  ].filter(Boolean).join("\n");

  const payload: ApprovalPayload = {
    type: "plan_approval",
    plan: state.plan,
    message: `Please review the plan below and respond:\n\n${planSummary}`,
    instructions:
      'Reply "yes" (or "approved") to proceed, or describe what changes you want.',
  };

  // ── BLOCKING INTERRUPT ───────────────────────────────────────────────────
  // Execution stops here until the caller calls:
  //   graph.invoke(new Command({ resume: "<user response>" }), config)
  const humanResponse = interrupt(payload) as string;
  // ────────────────────────────────────────────────────────────────────────

  const normalised = humanResponse.trim().toLowerCase();
  const approved =
    normalised.startsWith("yes") ||
    normalised.startsWith("approved") ||
    normalised.startsWith("looks good") ||
    normalised.startsWith("ok") ||
    normalised === "✓" ||
    normalised === "👍";

  if (approved) {
    return new Command({
      update: {
        currentStep: "approved",
        isApproved: true,
        history: [
          {
            role: "user",
            content: humanResponse,
          },
          {
            role: "assistant",
            content: "✓ Plan approved. Proceeding to build your website...",
          },
        ],
      },
      goto: "layout_executor",
    });
  }

  // Rejected — store feedback and loop back to planner
  return new Command({
    update: {
      currentStep: "revision_requested",
      isApproved: false,
      feedback: humanResponse,
      // Clear old plan so the planner writes a fresh one
      plan: undefined,
      nextStep: "planner",
      history: [
        {
          role: "user",
          content: humanResponse,
        },
        {
          role: "assistant",
          content:
            "Understood — I'll revise the plan based on your feedback. One moment...",
        },
      ],
    },
    goto: "planner",
  });
}
