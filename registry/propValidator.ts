/**
 * @module registry/propValidator
 *
 * Zero-dependency runtime validator for AI-supplied component props.
 *
 * Interprets the existing `PropSchema` structure in componentRegistry to
 * validate props before they are passed to adapter components. This replaces
 * the implicit `Record<string, unknown>` pass-through with explicit type
 * enforcement, enum checks, required-field enforcement, and nested
 * array / object shape validation.
 *
 * No external libraries (zod, ajv, etc.) are needed — the validator is a
 * direct interpreter of the PropSchema union already defined in this project.
 *
 * Design goals:
 *  - All errors are collected (non-short-circuiting) so the AI gets a full
 *    picture of what is wrong in a single pass.
 *  - Dot-path notation for nested errors: "items[0].iconName is required".
 *  - Unknown extra props are warned about but never cause a hard failure —
 *    forward-compat with schema evolution.
 *  - Defaults from PropSchema are applied to missing optional fields.
 */

import type { PropSchema } from "./componentRegistry";

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationWarning {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  /**
   * The coerced & default-filled props ready to pass to the adapter.
   * Only populated when `valid === true`; callers should fall back to
   * `mergedProps` directly if they decide to render despite warnings.
   */
  coercedProps: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function err(path: string, message: string): ValidationError {
  return { path, message };
}

function warn(path: string, message: string): ValidationWarning {
  return { path, message };
}

function jsType(value: unknown): string {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

// ---------------------------------------------------------------------------
// Core recursive validator
// ---------------------------------------------------------------------------

/**
 * Validates `value` against `schema`, collecting errors/warnings into the
 * supplied arrays. Returns the coerced value (with defaults applied).
 *
 * @param value   - The runtime value to validate
 * @param schema  - The PropSchema to validate against
 * @param path    - Dot-path string used in error messages
 * @param errors  - Mutable accumulator for hard errors
 * @param warnings - Mutable accumulator for soft warnings
 */
function validateValue(
  value: unknown,
  schema: PropSchema,
  path: string,
  errors: ValidationError[],
  warnings: ValidationWarning[],
): unknown {
  // Apply default when value is absent
  if (value === undefined || value === null) {
    if (schema.required) {
      errors.push(err(path, `is required but was ${value === null ? "null" : "missing"}`));
    }
    return schema.default ?? value;
  }

  const actual = jsType(value);

  // ── Type check ────────────────────────────────────────────────────────────
  if (actual !== schema.type) {
    errors.push(
      err(path, `must be ${schema.type} but received ${actual} (value: ${JSON.stringify(value)})`)
    );
    // Return as-is — no further structural checks make sense
    return value;
  }

  // ── Enum check ────────────────────────────────────────────────────────────
  if (schema.enum && !schema.enum.includes(value as string)) {
    errors.push(
      err(
        path,
        `must be one of [${schema.enum.map((e) => `"${e}"`).join(", ")}] but received "${value}"`
      )
    );
    return value;
  }

  // ── Array: validate each item against schema.items ────────────────────────
  if (schema.type === "array" && schema.items) {
    const arr = value as unknown[];
    const coerced: unknown[] = arr.map((item, i) =>
      validateValue(item, schema.items!, `${path}[${i}]`, errors, warnings)
    );
    return coerced;
  }

  // ── Object: validate known properties, warn on unknowns ──────────────────
  if (schema.type === "object" && schema.properties) {
    const obj = value as Record<string, unknown>;
    const coerced: Record<string, unknown> = { ...obj };

    // Validate declared properties
    for (const [key, childSchema] of Object.entries(schema.properties)) {
      coerced[key] = validateValue(
        obj[key],
        childSchema,
        `${path}.${key}`,
        errors,
        warnings,
      );
    }

    // Warn on undeclared extra keys
    for (const key of Object.keys(obj)) {
      if (!schema.properties[key]) {
        warnings.push(
          warn(`${path}.${key}`, `is not declared in propSchema — may be ignored`)
        );
      }
    }

    return coerced;
  }

  return value;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Validates `props` against a component's `propSchema`.
 *
 * - Hard errors (wrong type, missing required, bad enum) → `valid: false`
 * - Unknown extra props → warnings only, `valid` stays `true`
 * - Missing optional props with a `default` → filled into `coercedProps`
 *
 * @example
 * ```ts
 * const result = validateProps(
 *   { title: "Why us?", items: [] },
 *   componentRegistry.features.propSchema
 * );
 * if (!result.valid) {
 *   console.error(result.errors);
 * }
 * ```
 */
export function validateProps(
  props: Record<string, unknown>,
  propSchema: Record<string, PropSchema>,
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const coerced: Record<string, unknown> = {};

  // ── Validate each declared prop key ───────────────────────────────────────
  for (const [key, schema] of Object.entries(propSchema)) {
    coerced[key] = validateValue(props[key], schema, key, errors, warnings);
  }

  // ── Pass through undeclared keys (no schema) with a warning ───────────────
  for (const key of Object.keys(props)) {
    if (!propSchema[key]) {
      coerced[key] = props[key]; // keep value, don't block rendering
      warnings.push(warn(key, `is not declared in propSchema — may be ignored by the adapter`));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    coercedProps: errors.length === 0 ? coerced : {},
  };
}

/**
 * Formats a ValidationResult into a human-readable string block.
 * Useful for logging or surfacing in a dev-mode UI overlay.
 */
export function formatValidationResult(
  type: string,
  result: ValidationResult,
): string {
  const lines: string[] = [`[propValidator] "${type}"`];

  if (result.valid) {
    lines.push("  ✓ Props valid");
  } else {
    lines.push(`  ✗ ${result.errors.length} error(s):`);
    for (const e of result.errors) {
      lines.push(`    • ${e.path}: ${e.message}`);
    }
  }

  if (result.warnings.length > 0) {
    lines.push(`  ⚠ ${result.warnings.length} warning(s):`);
    for (const w of result.warnings) {
      lines.push(`    • ${w.path}: ${w.message}`);
    }
  }

  return lines.join("\n");
}
