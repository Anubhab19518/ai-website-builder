/**
 * @module src/agents/nodes/layoutExecutor
 *
 * Layout Executor Agent — the second main node in the LangGraph workflow.
 *
 * Responsibilities:
 *  1. Read the structured plan produced by the Planner Agent.
 *  2. Query the LLM to generate a structured UI blueprint mapping to
 *     available components in the component registry.
 *  3. Only pass the component name and description to the LLM to save tokens
 *     (no props generation yet!).
 *  4. Validate the resulting blueprint against the registry to ensure
 *     only valid components are selected.
 *  5. Return the validated blueprint in the graph state.
 */

import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import type { GraphState } from "../state";
import { getRegisteredTypes, getRegistryEntry } from "../../../registry/componentRegistry";

// ---------------------------------------------------------------------------
import { createLLM } from "../../lib/llm";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SectionConfig {
  type: string;
  variant: string;
  props: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

const LAYOUT_SYSTEM = `You are the Layout Executor for an AI website builder.

Your job is to read an approved website plan and translate its "sections" into a strict technical blueprint of available UI components.

Available Components:
{COMPONENT_REGISTRY_METADATA}

Output ONLY valid JSON, no markdown, no explanation:
[
  {
    "type": "hero",
    "variant": "default",
    "props": {}
  },
  {
    "type": "features",
    "variant": "bento-grid",
    "props": {}
  }
]

Rules:
- DO NOT hallucinate components. Use ONLY the "type" keys listed in the Available Components.
- DO NOT generate props content (leave "props" as an empty object).
- The "variant" should match the available variants for that component (usually "default" or whatever is specified in the registry).
- Output an ARRAY of objects. Each object represents one section of the page, in order from top to bottom.
- If a section in the plan cannot be mapped to an available component, use your best judgement to map it to the closest available option, or omit it if nothing fits.
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildContext(history: GraphState["history"], limit = 8) {
  return history.slice(-limit).map((m) =>
    m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
  );
}

function parseJSON<T>(raw: string, fallback: T): T {
  const match = raw.match(/\[[\s\S]*\]/); // match array
  if (!match) return fallback;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return fallback;
  }
}

/**
 * Builds a compressed string of available components and their descriptions.
 */
function buildRegistryMetadataString(): string {
  const types = getRegisteredTypes();
  const metadataLines = types.map((type) => {
    const entry = getRegistryEntry(type);
    if (!entry) return "";
    return `- "${type}": ${entry.description} (variants: ${entry.variants.join(", ")})`;
  });
  return metadataLines.filter(Boolean).join("\n");
}

// ---------------------------------------------------------------------------
// Node
// ---------------------------------------------------------------------------

export async function layoutExecutorNode(state: GraphState): Promise<Partial<GraphState>> {
  const llm = createLLM();

  if (!state.plan) {
     return {
         errors: [...(state.errors || []), "Layout Executor ran without a plan"],
         nextStep: "planner"
     };
  }

  const registryMetadata = buildRegistryMetadataString();
  const systemPrompt = LAYOUT_SYSTEM.replace("{COMPONENT_REGISTRY_METADATA}", registryMetadata);

  const planSummary = [
    `Website Type: ${state.plan.type}`,
    `Sections to map: ${state.plan.sections.join(" → ")}`,
    state.plan.notes ? `Constraints/Notes: ${state.plan.notes}` : null,
  ].filter(Boolean).join("\n");

  const res = await llm.invoke([
    new SystemMessage(systemPrompt),
    ...buildContext(state.history, 4), // pass brief history context
    new HumanMessage(`Approved Plan:\n${planSummary}\n\nGenerate the layout blueprint array.`),
  ]);

  let rawBlueprint = parseJSON<SectionConfig[]>(res.content as string, []);

  // Validation Layer
  const validTypes = new Set(getRegisteredTypes());

  let validatedBlueprint: SectionConfig[] = rawBlueprint.filter((section) => {
     // Ensure it's an object with a type string that exists in our registry
     if (typeof section !== "object" || section === null) return false;
     if (typeof section.type !== "string") return false;
     return validTypes.has(section.type as any);
  }).map(section => ({
     // Normalise the object
     type: section.type,
     // Ensure variant is a string, default to "default" if missing
     variant: typeof section.variant === "string" ? section.variant : "default",
     // Ensure props is an object, but clear any hallucinated content
     props: {}
  }));

  // Fallback if LLM output was completely invalid
  if (validatedBlueprint.length === 0) {
      validatedBlueprint = [{ type: "hero", variant: "default", props: {} }];
      console.warn("Layout Executor failed to produce valid blueprint. Using fallback.");
  }

  return {
    blueprint: validatedBlueprint,
    currentStep: "layout_executor",
    nextStep: "content_executor",
  };
}
