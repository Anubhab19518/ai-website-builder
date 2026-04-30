/**
 * @module src/agents/nodes/validator
 *
 * Validator Agent
 *
 * Deterministic validation layer that ensures the generated blueprint is 100%
 * safe to be rendered by the frontend UI.
 *
 * It uses pure logic without any LLM calls:
 *  1. Checks if component type exists in registry; removes if not.
 *  2. Ensures component variant is valid; falls back to default if not.
 *  3. Strips unknown props not present in the prop schema.
 *  4. Fills missing required props with defaultProps.
 *  5. Removes the section entirely if a required prop cannot be fulfilled.
 */

import type { GraphState } from "../state";
import type { SectionConfig } from "./layoutExecutor";
import { getRegistryEntry } from "../../../registry/componentRegistry";

export async function validatorNode(state: GraphState): Promise<Partial<GraphState>> {
  if (!state.blueprint || state.blueprint.length === 0) {
    return {
      errors: [...(state.errors || []), "Validator ran without a blueprint"],
      currentStep: "validator",
      nextStep: "refiner",
    };
  }

  const errors: string[] = [...(state.errors || [])];
  const validatedBlueprint: SectionConfig[] = [];

  for (let i = 0; i < state.blueprint.length; i++) {
    const rawSection = state.blueprint[i] as SectionConfig;

    // ── 4.1 Component Type ───────────────────────────────────────────────────
    const entry = getRegistryEntry(rawSection.type);
    if (!entry) {
      errors.push(`Validator: Removed section at index ${i} with unknown type "${rawSection.type}"`);
      console.warn(`[Validator] Unknown component type: ${rawSection.type}`);
      continue;
    }

    // ── 4.2 Variant ──────────────────────────────────────────────────────────
    let variant = rawSection.variant;
    if (!entry.variants.includes(variant)) {
      variant = entry.variants[0] || "default";
      console.warn(`[Validator] Fallback to variant "${variant}" for component "${rawSection.type}"`);
    }

    // ── 4.3 & 4.4 Props Validation ───────────────────────────────────────────
    const rawProps = rawSection.props || {};
    const validProps: Record<string, unknown> = {};
    let missingRequired = false;

    // Iterate over the canonical schema, effectively stripping unknown fields
    for (const [propName, propSchema] of Object.entries(entry.propSchema)) {
      let val = rawProps[propName];

      // If prop is missing, attempt to fill from defaultProps
      if (val === undefined || val === null || val === "") {
        if (entry.defaultProps[propName] !== undefined) {
          val = entry.defaultProps[propName];
        }
      }

      // Check if it's strictly required and still missing
      if (propSchema.required && (val === undefined || val === null || val === "")) {
        errors.push(`Validator: Missing required prop "${propName}" on component "${rawSection.type}"`);
        console.warn(`[Validator] Missing required prop "${propName}" on component "${rawSection.type}". Section removed.`);
        missingRequired = true;
        break; // Stop processing this section and remove it
      }

      // Save the clean prop value if it's present
      if (val !== undefined) {
        validProps[propName] = val;
      }
    }

    if (missingRequired) {
      continue; // Drop the section completely
    }

    // ── 4.5 Final Merge ──────────────────────────────────────────────────────
    const finalProps = {
      ...entry.defaultProps,
      ...validProps,
    };

    validatedBlueprint.push({
      type: rawSection.type,
      variant,
      props: finalProps,
    });
  }

  // Update state with cleaned blueprint and accumulated errors
  return {
    blueprint: validatedBlueprint,
    currentStep: "validator",
    nextStep: "refiner",
    errors: errors.length > 0 ? errors : state.errors, // Keep existing if no new ones
  };
}
