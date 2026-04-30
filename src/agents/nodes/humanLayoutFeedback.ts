/**
 * @module src/agents/nodes/humanLayoutFeedback
 *
 * Human-in-the-Loop Layout Feedback Node
 *
 * This node pauses execution to allow the user to review the generated
 * layout blueprint. The user can either approve the blueprint to proceed
 * to the content executor, or provide feedback to revise the layout.
 */

import { interrupt, Command } from "@langchain/langgraph";
import type { GraphState } from "../state";
import type { SectionConfig } from "./layoutExecutor";

// ---------------------------------------------------------------------------
// Approval payload type surfaced to the caller via __interrupt__
// ---------------------------------------------------------------------------

export interface LayoutApprovalPayload {
  type: "layout_preview";
  blueprint: SectionConfig[];
  message: string;
  instructions: string;
}

// ---------------------------------------------------------------------------
// Human Layout Feedback Node
// ---------------------------------------------------------------------------

export async function humanLayoutFeedbackNode(
  state: GraphState
): Promise<Command> {
  if (!state.blueprint || state.blueprint.length === 0) {
    return new Command({
      update: {
        currentStep: "human_layout_feedback",
        errors: ["humanLayoutFeedbackNode reached without a blueprint — routing back to layout_executor"],
      },
      goto: "layout_executor",
    });
  }

  const payload: LayoutApprovalPayload = {
    type: "layout_preview",
    blueprint: state.blueprint as SectionConfig[],
    message: `Here is the proposed structural layout for your website:\n\n${(state.blueprint as SectionConfig[]).map(b => `- ${b.type}`).join('\n')}`,
    instructions:
      'Reply "yes" (or "approved") to proceed to content generation, or describe what changes you want to the layout structure.',
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
        currentStep: "layout_approved",
        history: [
          {
            role: "user",
            content: humanResponse,
          },
          {
            role: "assistant",
            content: "✓ Layout structure approved. Proceeding to generate content...",
          },
        ],
      },
      goto: "content_executor",
    });
  }

  // Rejected — loop back to layout executor with feedback
  // (We append the feedback to the plan notes, or handle it in the prompt)
  const revisedPlanNotes = state.plan?.notes 
     ? `${state.plan.notes}\n\nUser Layout Feedback: ${humanResponse}` 
     : `User Layout Feedback: ${humanResponse}`;

  return new Command({
    update: {
      currentStep: "layout_revision_requested",
      // Pass the feedback back to the layout executor by modifying the plan notes slightly,
      // or we can just push it to history. History is usually enough for the LLM.
      plan: state.plan ? { ...state.plan, notes: revisedPlanNotes } : undefined,
      history: [
        {
          role: "user",
          content: humanResponse,
        },
        {
          role: "assistant",
          content: "Understood — I'll revise the layout structure based on your feedback...",
        },
      ],
    },
    goto: "layout_executor",
  });
}
