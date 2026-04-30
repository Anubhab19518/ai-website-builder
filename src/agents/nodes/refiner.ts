/**
 * @module src/agents/nodes/refiner
 *
 * Refiner Agent
 *
 * Takes the validated blueprint and improves the content quality using an LLM.
 * Preserves the structure strictly and only modifies props.
 */

import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import type { GraphState } from "../state";
import type { SectionConfig } from "./layoutExecutor";
import { getRegistryEntry } from "../../../registry/componentRegistry";
import { createLLM } from "../../lib/llm";

const REFINER_SYSTEM = `You are an expert copywriter and Content Refiner for an AI website builder.

Your job is to improve the quality of the generated content (props) for a specific UI component based on the user's requirements and the website plan.

Component: {COMPONENT_TYPE}
Description: {COMPONENT_DESCRIPTION}

Current Props:
{CURRENT_PROPS}

Output ONLY valid JSON representing the improved props object. Do NOT wrap it in markdown block, no explanation.

Rules:
- Improve clarity, persuasiveness, and tone consistency.
- Keep the copy concise, modern, and punchy.
- DO NOT change the structure of the props object.
- DO NOT remove any existing keys/props.
- Output ONLY the modified props object in JSON.`;

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

export async function refinerNode(state: GraphState): Promise<Partial<GraphState>> {
  const llm = createLLM();

  if (!state.blueprint || state.blueprint.length === 0) {
    return {
      errors: [...(state.errors || []), "Refiner ran without a blueprint"],
      currentStep: "refiner",
      nextStep: "ready_to_render",
    };
  }

  const requirementsSummary = [
    state.requirements?.websiteType && `Website Type: ${state.requirements.websiteType}`,
    state.requirements?.targetAudience && `Target Audience: ${state.requirements.targetAudience}`,
    state.requirements?.features?.length && `Features: ${state.requirements.features.join(", ")}`,
    state.requirements?.style && `Style: ${state.requirements.style}`,
    state.plan?.notes && `Plan Notes: ${state.plan.notes}`,
  ].filter(Boolean).join("\n");

  const refinedBlueprint: SectionConfig[] = [];

  for (const section of state.blueprint as SectionConfig[]) {
    const entry = getRegistryEntry(section.type);
    if (!entry) {
      refinedBlueprint.push(section);
      continue;
    }

    const systemPrompt = REFINER_SYSTEM
      .replace("{COMPONENT_TYPE}", section.type)
      .replace("{COMPONENT_DESCRIPTION}", entry.description)
      .replace("{CURRENT_PROPS}", JSON.stringify(section.props, null, 2));

    const res = await llm.invoke([
      new SystemMessage(systemPrompt),
      ...buildContext(state.history, 4),
      new HumanMessage(`Requirements Context:\n${requirementsSummary}\n\nRefine the props for the "${section.type}" component.`),
    ]);

    const refinedProps = parseJSON<Record<string, unknown>>(res.content as string, section.props);

    // Lightweight validation: remove invalid props, ensure required props remain
    const validProps: Record<string, unknown> = { ...section.props };
    
    for (const [key, schema] of Object.entries(entry.propSchema)) {
      if (refinedProps[key] !== undefined) {
        validProps[key] = refinedProps[key];
      }
      // Revert to original if a required prop was accidentally removed
      if (schema.required && (validProps[key] === undefined || validProps[key] === null || validProps[key] === "")) {
        validProps[key] = section.props[key];
      }
    }

    refinedBlueprint.push({
      ...section,
      props: validProps,
    });
  }

  return {
    blueprint: refinedBlueprint,
    currentStep: "refiner",
    nextStep: "ready_to_render",
  };
}
