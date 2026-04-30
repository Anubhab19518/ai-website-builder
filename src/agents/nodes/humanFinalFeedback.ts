/**
 * @module src/agents/nodes/humanFinalFeedback
 *
 * Human-in-the-Loop Final Feedback Node
 *
 * This node pauses execution to allow the user to review the refined and
 * validated website blueprint. The user can either approve to proceed to render
 * or provide feedback to revise the content again via the refiner.
 */

import { interrupt, Command } from "@langchain/langgraph";
import type { GraphState } from "../state";
import type { SectionConfig } from "./layoutExecutor";

// ---------------------------------------------------------------------------
// Approval payload type surfaced to the caller via __interrupt__
// ---------------------------------------------------------------------------

export interface FinalApprovalPayload {
  type: "final_preview";
  blueprint: SectionConfig[];
  message: string;
  instructions: string;
}

// ---------------------------------------------------------------------------
// Human Final Feedback Node
// ---------------------------------------------------------------------------

export async function humanFinalFeedbackNode(
  state: GraphState
): Promise<Command> {
  if (!state.blueprint || state.blueprint.length === 0) {
    return new Command({
      update: {
        currentStep: "human_final_feedback",
        errors: ["humanFinalFeedbackNode reached without a blueprint — routing back to refiner"],
      },
      goto: "refiner",
    });
  }

  const payload: FinalApprovalPayload = {
    type: "final_preview",
    blueprint: state.blueprint as SectionConfig[],
    message: "The website content has been refined and polished. Please review the final version.",
    instructions: 'Reply "yes" (or "approved") to finalize and render, or describe what content changes you still want.',
  };

  // ── BLOCKING INTERRUPT ───────────────────────────────────────────────────
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
        currentStep: "ready_to_render",
        history: [
          {
            role: "user",
            content: humanResponse,
          },
          {
            role: "assistant",
            content: "✓ Final content approved! Website is ready to render.",
          },
        ],
      },
      goto: "__end__", // Ready to render
    });
  }

  // Rejected — loop back to refiner with feedback
  const revisedPlanNotes = state.plan?.notes 
     ? `${state.plan.notes}\n\nFinal Refinement Feedback: ${humanResponse}` 
     : `Final Refinement Feedback: ${humanResponse}`;

  return new Command({
    update: {
      currentStep: "final_revision_requested",
      plan: state.plan ? { ...state.plan, notes: revisedPlanNotes } : undefined,
      history: [
        {
          role: "user",
          content: humanResponse,
        },
        {
          role: "assistant",
          content: "Understood — I'll refine the content further based on your feedback...",
        },
      ],
    },
    goto: "refiner",
  });
}
