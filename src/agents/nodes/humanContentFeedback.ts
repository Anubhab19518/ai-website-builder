/**
 * @module src/agents/nodes/humanContentFeedback
 *
 * Human-in-the-Loop Content Feedback Node
 *
 * This node pauses execution to allow the user to review the populated
 * content blueprint. The user can either approve the blueprint or
 * provide feedback to revise the content.
 */

import { interrupt, Command } from "@langchain/langgraph";
import type { GraphState } from "../state";
import type { SectionConfig } from "./layoutExecutor";

// ---------------------------------------------------------------------------
// Approval payload type surfaced to the caller via __interrupt__
// ---------------------------------------------------------------------------

export interface ContentApprovalPayload {
  type: "content_preview";
  blueprint: SectionConfig[];
  message: string;
  instructions: string;
}

// ---------------------------------------------------------------------------
// Human Content Feedback Node
// ---------------------------------------------------------------------------

export async function humanContentFeedbackNode(
  state: GraphState
): Promise<Command> {
  if (!state.blueprint || state.blueprint.length === 0) {
    return new Command({
      update: {
        currentStep: "human_content_feedback",
        errors: ["humanContentFeedbackNode reached without a blueprint — routing back to content_executor"],
      },
      goto: "content_executor",
    });
  }

  const payload: ContentApprovalPayload = {
    type: "content_preview",
    blueprint: state.blueprint as SectionConfig[],
    message: "The website content has been generated. Please review the populated sections.",
    instructions: 'Reply "yes" (or "approved") to proceed, or describe what content changes you want.',
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
        currentStep: "content_approved",
        history: [
          {
            role: "user",
            content: humanResponse,
          },
          {
            role: "assistant",
            content: "✓ Content approved. Proceeding...",
          },
        ],
      },
      goto: "validator", // Next node is the validator
    });
  }

  // Rejected — loop back to content executor with feedback
  const revisedPlanNotes = state.plan?.notes 
     ? `${state.plan.notes}\n\nUser Content Feedback: ${humanResponse}` 
     : `User Content Feedback: ${humanResponse}`;

  return new Command({
    update: {
      currentStep: "content_revision_requested",
      plan: state.plan ? { ...state.plan, notes: revisedPlanNotes } : undefined,
      history: [
        {
          role: "user",
          content: humanResponse,
        },
        {
          role: "assistant",
          content: "Understood — I'll revise the content based on your feedback...",
        },
      ],
    },
    goto: "content_executor",
  });
}
