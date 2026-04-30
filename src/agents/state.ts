/**
 * @module src/agents/state
 *
 * Global agent state definition for the LangGraph orchestrator.
 *
 * Design principles:
 *  - Store RAW structured data, not formatted strings
 *  - All fields except `userPrompt`, `currentStep`, `isApproved`, and
 *    `history` are optional — nodes only set what they produce
 *  - `history` is append-only (concat reducer)
 *  - `errors` is append-only (concat reducer)
 */

import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

// ---------------------------------------------------------------------------
// Sub-types (structured — NOT strings)
// ---------------------------------------------------------------------------

/**
 * Structured website requirements.
 * Written by the Planner after clarification; read by Executor agents.
 * Replaces the old `clarifiedRequirements: string`.
 */
export type Requirements = {
  websiteType?: string;
  targetAudience?: string;
  sections?: string[];
  features?: string[];
  style?: string;
};

/**
 * Structured plan produced by the Planner.
 * Replaces the old `plan: string`.
 *
 * Executor agents consume `sections` directly — no text parsing needed.
 */
export type Plan = {
  /** e.g. "SaaS Landing Page", "Portfolio", "E-commerce" */
  type: string;
  /** Ordered list of section names, e.g. ["Hero", "Features", "Pricing"] */
  sections: string[];
  /** Any extra constraints or notes for executor agents */
  notes?: string;
};

/**
 * Which agent should run next. Used by the graph router and for debugging
 * in the UI. Extends easily as new executors are added.
 */
export type NextStep =
  | "planner"
  | "human_approval"
  | "layout_executor"
  | "content_executor"
  | "data_executor"
  | "refiner"
  | "validator"
  | "ready_to_render"
  | "done";

// ---------------------------------------------------------------------------
// Canonical AgentState type (plain TS — used throughout the codebase)
// ---------------------------------------------------------------------------

export type AgentState = {
  // ── Identity ─────────────────────────────────────────────────────────────
  /** Stable ID for this workflow thread (maps to LangGraph thread_id) */
  threadId?: string;

  // ── Input ─────────────────────────────────────────────────────────────────
  /** The raw user input that kicked off this workflow */
  userPrompt: string;

  // ── Planner outputs ───────────────────────────────────────────────────────
  /**
   * Structured requirements extracted after clarification.
   * Written by plannerNode after clarifying questions.
   * Read by Executor agents.
   */
  requirements?: Requirements;

  /**
   * Structured plan produced by the Planner.
   * Written by plannerNode; read by humanApprovalNode and Executor agents.
   */
  plan?: Plan;

  // ── Executor outputs ──────────────────────────────────────────────────────
  /**
   * Array of DynamicRenderer section configs produced by Executor agents.
   * e.g. [{ type: "hero", props: { headline: "..." } }]
   */
  blueprint?: unknown[];

  // ── Feedback loop ─────────────────────────────────────────────────────────
  /**
   * Human feedback from the approval checkpoint.
   * Cleared by plannerNode after incorporating it into a revised plan.
   */
  feedback?: string;

  // ── Conversation memory ───────────────────────────────────────────────────
  /** Full conversation transcript — append-only */
  history: {
    role: "user" | "assistant";
    content: string;
  }[];

  // ── Routing & progress ───────────────────────────────────────────────────
  /** Name of the node currently executing (for UI progress indicators) */
  currentStep: string;

  /** Explicit next node hint — helps debugging and future conditional routing */
  nextStep?: NextStep;

  /** Set to true by humanApprovalNode when the user approves the plan */
  isApproved: boolean;

  // ── Error accumulator ─────────────────────────────────────────────────────
  /** Non-fatal errors accumulated across nodes */
  errors?: string[];
};

// ---------------------------------------------------------------------------
// LangGraph Annotation (the runtime state schema)
// ---------------------------------------------------------------------------

export const AgentStateAnnotation = Annotation.Root({
  // ── Identity ───────────────────────────────────────────────────────────────
  threadId: Annotation<string | undefined>({
    reducer: (_prev, next) => next,
    default: () => undefined,
  }),

  // ── Input ──────────────────────────────────────────────────────────────────
  userPrompt: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => "",
  }),

  // ── Planner outputs ────────────────────────────────────────────────────────
  requirements: Annotation<Requirements | undefined>({
    reducer: (prev, next) =>
      next === undefined ? prev : { ...(prev ?? {}), ...next },
    default: () => undefined,
  }),

  plan: Annotation<Plan | undefined>({
    reducer: (_prev, next) => next,
    default: () => undefined,
  }),

  // ── Executor outputs ───────────────────────────────────────────────────────
  blueprint: Annotation<unknown[] | undefined>({
    reducer: (_prev, next) => next,
    default: () => undefined,
  }),

  // ── Feedback loop ──────────────────────────────────────────────────────────
  feedback: Annotation<string | undefined>({
    reducer: (_prev, next) => next,
    default: () => undefined,
  }),

  // ── Conversation memory ────────────────────────────────────────────────────
  history: Annotation<{ role: "user" | "assistant"; content: string }[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),

  // ── Routing & progress ─────────────────────────────────────────────────────
  currentStep: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => "idle",
  }),

  nextStep: Annotation<NextStep | undefined>({
    reducer: (_prev, next) => next,
    default: () => undefined,
  }),

  isApproved: Annotation<boolean>({
    reducer: (_prev, next) => next,
    default: () => false,
  }),

  // ── Error accumulator ──────────────────────────────────────────────────────
  errors: Annotation<string[]>({
    reducer: (prev, next) => [...(prev ?? []), ...(next ?? [])],
    default: () => [],
  }),
});

/** Convenience type alias for the inferred runtime state */
export type GraphState = typeof AgentStateAnnotation.State;

// ---------------------------------------------------------------------------
// LangGraph messages state (for future streaming nodes)
// ---------------------------------------------------------------------------

export const MessagesAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
});
