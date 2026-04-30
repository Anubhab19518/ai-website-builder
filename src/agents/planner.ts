/**
 * @module src/agents/planner
 *
 * Planner Agent — the first node in the LangGraph workflow.
 *
 * Responsibilities:
 *  1. Inspect the user prompt for completeness.
 *  2. If requirements are incomplete, ask targeted clarifying questions and
 *     PAUSE via interrupt() until the user responds.
 *  3. Extract a structured Requirements object from the user's answers.
 *  4. Generate a structured Plan object (type + sections + notes).
 *
 * Behaviour contract:
 *  - NEVER generates UI blueprints or component configs (that's the Executor)
 *  - NEVER hallucinates — asks rather than assumes
 *  - Reads state.feedback on re-entry (plan was rejected) and revises plan
 *  - All LLM calls go through OpenRouter (OPEN_ROUTER_API_KEY env var)
 *  - Outputs structured `requirements` and `plan` objects — never plain strings
 */

import { interrupt } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import type { GraphState } from "./state";
import type { Requirements, Plan } from "./state";
import { createLLM } from "../lib/llm";

// ---------------------------------------------------------------------------
// OpenRouter-compatible ChatOpenAI instance
// System prompts
// ---------------------------------------------------------------------------

const COMPLETENESS_SYSTEM = `You are a requirements analyst for an AI website builder platform.

Evaluate whether the user's request has ENOUGH detail to plan a website.

Check for ALL of:
1. Website type (landing page, SaaS dashboard, portfolio, e-commerce, blog, etc.)
2. Target audience (developers, consumers, businesses, general public, etc.)
3. Required sections (hero, features, pricing, testimonials, contact, footer, etc.)
4. Backend features (auth, database, API, payments, admin panel, etc.)
5. Style preference (minimal, bold, corporate, playful, dark, light, etc.)

Output ONLY valid JSON, no markdown, no explanation:
{
  "complete": true | false,
  "missingFields": ["field1", "field2"],
  "clarifyingQuestions": ["Q1?", "Q2?"]
}

Rules:
- complete = false if ANY dimension is unclear or missing
- Do NOT infer or assume — ask instead
- Keep questions short and specific`;

const REQUIREMENTS_EXTRACTION_SYSTEM = `You are a requirements extractor for an AI website builder.

Given a user's original request and their clarification answers, extract a structured requirements object.

Output ONLY valid JSON, no markdown, no explanation:
{
  "websiteType": "string — e.g. SaaS Landing Page",
  "targetAudience": "string — e.g. developers and startups",
  "sections": ["Hero", "Features", "Pricing", "Footer"],
  "features": ["Authentication", "Supabase DB"] or [],
  "style": "string — e.g. dark, minimal, modern"
}

Rules:
- Infer ONLY from what the user explicitly stated
- If a field is truly unknown, omit it
- sections must be proper names (Title Case), no duplicates`;

const PLAN_SYSTEM = `You are a senior web product planner for an AI website builder.

Given structured requirements, produce a precise build plan.

Output ONLY valid JSON, no markdown, no explanation:
{
  "type": "string — website type",
  "sections": ["Section1", "Section2", "Section3"],
  "notes": "optional string — constraints, style notes, special instructions"
}

Rules:
- sections must match the approved requirements — do NOT add extras
- If feedback is provided, address every point and revise sections accordingly
- notes should capture style, tone, backend dependencies, anything an executor needs
- Do NOT include code, component names, or implementation details`;

// ---------------------------------------------------------------------------
// LLM call helpers
// ---------------------------------------------------------------------------

interface CompletenessResult {
  complete: boolean;
  missingFields: string[];
  clarifyingQuestions: string[];
}

function buildContext(history: GraphState["history"], limit = 8) {
  return history.slice(-limit).map((m) =>
    m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
  );
}

function parseJSON<T>(raw: string, fallback: T): T {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return fallback;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return fallback;
  }
}

async function checkCompleteness(
  llm: ChatOpenAI,
  userPrompt: string,
  history: GraphState["history"]
): Promise<CompletenessResult> {
  const res = await llm.invoke([
    new SystemMessage(COMPLETENESS_SYSTEM),
    ...buildContext(history, 6),
    new HumanMessage(`User request: "${userPrompt}"`),
  ]);
  return parseJSON<CompletenessResult>(res.content as string, {
    complete: true,
    missingFields: [],
    clarifyingQuestions: [],
  });
}

async function extractRequirements(
  llm: ChatOpenAI,
  userPrompt: string,
  userAnswers: string,
  history: GraphState["history"]
): Promise<Requirements> {
  const res = await llm.invoke([
    new SystemMessage(REQUIREMENTS_EXTRACTION_SYSTEM),
    ...buildContext(history, 6),
    new HumanMessage(
      `Original request: "${userPrompt}"\n\nUser clarification answers:\n${userAnswers}`
    ),
  ]);
  return parseJSON<Requirements>(res.content as string, {
    websiteType: "Website",
    sections: ["Hero", "Features", "Footer"],
  });
}

async function generatePlan(
  llm: ChatOpenAI,
  requirements: Requirements,
  history: GraphState["history"],
  feedback?: string
): Promise<Plan> {
  const feedbackSection = feedback
    ? `\n\nIMPORTANT — The user rejected the previous plan with this feedback:\n${feedback}\nRevise the plan to address every point.`
    : "";

  const requirementsSummary = [
    requirements.websiteType && `Website Type: ${requirements.websiteType}`,
    requirements.targetAudience && `Target Audience: ${requirements.targetAudience}`,
    requirements.sections?.length && `Sections: ${requirements.sections.join(", ")}`,
    requirements.features?.length && `Backend Features: ${requirements.features.join(", ")}`,
    requirements.style && `Style: ${requirements.style}`,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await llm.invoke([
    new SystemMessage(PLAN_SYSTEM + feedbackSection),
    ...buildContext(history, 10),
    new HumanMessage(`Requirements:\n${requirementsSummary}`),
  ]);

  const parsed = parseJSON<Plan>(res.content as string, {
    type: requirements.websiteType ?? "Website",
    sections: requirements.sections ?? ["Hero", "Features", "Footer"],
    notes: undefined,
  });

  // Guarantee sections is always a populated array
  if (!Array.isArray(parsed.sections) || parsed.sections.length === 0) {
    parsed.sections = requirements.sections ?? ["Hero", "Features", "Footer"];
  }

  return parsed;
}

// ---------------------------------------------------------------------------
// Planner Node
// ---------------------------------------------------------------------------

/**
 * plannerNode
 *
 * Flow:
 *   1. Check if the user prompt has enough info.
 *   2. If not → interrupt() with clarifying questions (BLOCKING).
 *      • Resume value = user's answers.
 *      • Extract structured Requirements from answers.
 *   3. If requirements already in state (re-entry after clarification) → skip check.
 *   4. Generate structured Plan from requirements (+ optional feedback).
 *   5. Write requirements, plan, and nextStep to state.
 */
export async function plannerNode(state: GraphState): Promise<Partial<GraphState>> {
  const llm = createLLM();

  // ── Step 1: Determine if we already have requirements ─────────────────────
  // On re-entry after feedback loop, requirements are already set — skip check.
  let requirements: Requirements | undefined = state.requirements;

  if (!requirements) {
    // ── Step 2: Completeness check ─────────────────────────────────────────
    const completeness = await checkCompleteness(llm, state.userPrompt, state.history);

    if (!completeness.complete && completeness.clarifyingQuestions.length > 0) {
      // ── Step 3: Interrupt — ask clarifying questions ──────────────────────
      const questionBlock = completeness.clarifyingQuestions
        .map((q, i) => `${i + 1}. ${q}`)
        .join("\n");

      const interruptPayload = {
        type: "clarification_needed" as const,
        questions: completeness.clarifyingQuestions,
        message: `I need a bit more detail before I can create your plan.\n\n${questionBlock}\n\nPlease answer all questions above.`,
      };

      // BLOCKING — execution pauses here until the caller resumes
      const userAnswers = interrupt(interruptPayload) as string;

      // Extract structured requirements from the user's answers
      requirements = await extractRequirements(
        llm,
        state.userPrompt,
        userAnswers,
        state.history
      );

      return {
        currentStep: "planner",
        nextStep: "planner", // will loop back to generate plan
        requirements,
        history: [
          { role: "assistant", content: interruptPayload.message },
          { role: "user", content: userAnswers },
        ],
      };
    }

    // Prompt was complete — derive requirements directly from prompt + history
    requirements = await extractRequirements(
      llm,
      state.userPrompt,
      "", // no separate clarification answers
      state.history
    );
  }

  // ── Step 4: Generate the structured plan ───────────────────────────────────
  const plan = await generatePlan(llm, requirements, state.history, state.feedback);

  const planSummary = [
    `Website Type: ${plan.type}`,
    `Sections: ${plan.sections.join(" → ")}`,
    plan.notes ? `Notes: ${plan.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const planMessage = `Here is my proposed plan:\n\n${planSummary}`;

  return {
    currentStep: "planner",
    nextStep: "human_approval",
    requirements,
    plan,
    feedback: undefined, // clear after incorporating
    history: [{ role: "assistant", content: planMessage }],
  };
}
