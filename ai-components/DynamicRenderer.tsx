"use client";

/**
 * @module ai-components/DynamicRenderer
 *
 * The single entry point the AI system uses to render any registered component.
 *
 * Rules:
 *  - ONLY uses adapter components via the registry.
 *  - NEVER imports from /components directly.
 *  - Merges defaultProps from the registry with AI-supplied overrides.
 *  - Validates merged props against propSchema before mounting.
 *  - Renders a safe fallback when an unknown type is requested.
 *  - Renders a ValidationErrorBanner in dev mode on prop errors.
 */

import { getRegistryEntry } from "@/registry/componentRegistry";
import { validateProps, formatValidationResult, type ValidationResult } from "@/registry/propValidator";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RendererConfig {
  /** Must match a key in componentRegistry, e.g. "hero", "features" */
  type: string;
  /** AI-supplied props that override the registry defaultProps */
  props?: Record<string, unknown>;
}

export interface DynamicRendererProps {
  /**
   * Ordered list of section/component configs to render.
   * Each item becomes one rendered section in the output.
   */
  sections: RendererConfig[];
  /**
   * Controls validation behaviour:
   *  - "warn"  (default) — log errors, render with coercedProps if valid, else mergedProps
   *  - "block" — do not render the section at all when props are invalid
   *  - "silent"— skip validation entirely (useful for prod perf-critical paths)
   */
  validationMode?: "warn" | "block" | "silent";
}

// ---------------------------------------------------------------------------
// Fallback components
// ---------------------------------------------------------------------------

function UnknownSection({ type }: { type: string }) {
  return (
    <div
      style={{
        padding: "2rem",
        border: "1px dashed #6366f1",
        borderRadius: "12px",
        color: "#6366f1",
        background: "rgba(99,102,241,0.04)",
        fontFamily: "monospace",
        fontSize: "14px",
        margin: "1rem 0",
      }}
    >
      ⚠ Unknown component type: <strong>&quot;{type}&quot;</strong>
      <br />
      <span style={{ opacity: 0.7 }}>
        Check the componentRegistry for supported types.
      </span>
    </div>
  );
}

function ValidationErrorBanner({
  type,
  result,
}: {
  type: string;
  result: ValidationResult;
}) {
  return (
    <div
      style={{
        padding: "1.25rem 1.5rem",
        border: "1px solid #ef4444",
        borderRadius: "12px",
        background: "rgba(239,68,68,0.04)",
        fontFamily: "monospace",
        fontSize: "13px",
        lineHeight: "1.6",
        margin: "0.5rem 0",
        color: "#ef4444",
      }}
    >
      <strong>⛔ Prop validation failed — &quot;{type}&quot;</strong>
      <ul style={{ margin: "0.5rem 0 0 1rem", padding: 0 }}>
        {result.errors.map((e, i) => (
          <li key={i}>
            <strong>{e.path}</strong>: {e.message}
          </li>
        ))}
      </ul>
      {result.warnings.length > 0 && (
        <>
          <strong style={{ color: "#f59e0b" }}>⚠ Warnings</strong>
          <ul style={{ margin: "0.25rem 0 0 1rem", padding: 0, color: "#f59e0b" }}>
            {result.warnings.map((w, i) => (
              <li key={i}>
                <strong>{w.path}</strong>: {w.message}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DynamicRenderer
// ---------------------------------------------------------------------------

/**
 * DynamicRenderer
 *
 * Renders an ordered list of sections by:
 *  1. Looking each type up in the registry.
 *  2. Merging registry defaultProps with AI-supplied overrides.
 *  3. **Validating merged props against the propSchema** (new).
 *  4. Mounting the adapter component with coerced (valid) props.
 *
 * @example
 * ```tsx
 * <DynamicRenderer
 *   sections={[
 *     { type: "hero",     props: { headline: "Welcome" } },
 *     { type: "features", props: { title: "Why us?", items: [...] } },
 *     { type: "pricing",  props: { title: "Simple pricing", plans: [...] } },
 *   ]}
 * />
 * ```
 */
export const DynamicRenderer = ({
  sections,
  validationMode = "warn",
}: DynamicRendererProps) => {
  return (
    <>
      {sections.map((section, index) => {
        const entry = getRegistryEntry(section.type);

        if (!entry) {
          return <UnknownSection key={index} type={section.type} />;
        }

        // ── 1. Merge defaults + AI overrides ─────────────────────────────────
        const mergedProps: Record<string, unknown> = {
          ...entry.defaultProps,
          ...(section.props ?? {}),
        };

        // ── 2. Validate (skip in "silent" mode) ───────────────────────────────
        if (validationMode !== "silent") {
          const result = validateProps(mergedProps, entry.propSchema);

          // Always log in dev
          if (process.env.NODE_ENV !== "production") {
            const formatted = formatValidationResult(section.type, result);
            if (!result.valid) {
              console.error(formatted);
            } else if (result.warnings.length > 0) {
              console.warn(formatted);
            }
          }

          if (!result.valid) {
            // "block" mode: render error banner instead of the component
            if (validationMode === "block") {
              return (
                <ValidationErrorBanner
                  key={`${section.type}-${index}-error`}
                  type={section.type}
                  result={result}
                />
              );
            }

            // "warn" mode (default): show banner in dev, still render with mergedProps
            if (process.env.NODE_ENV !== "production") {
              const Adapter = entry.component;
              return (
                <div key={`${section.type}-${index}`}>
                  <ValidationErrorBanner type={section.type} result={result} />
                  <Adapter {...mergedProps} />
                </div>
              );
            }

            // prod + "warn": silently render with mergedProps
            const Adapter = entry.component;
            return <Adapter key={`${section.type}-${index}`} {...mergedProps} />;
          }

          // ── 3. Valid: use coercedProps (defaults filled, types confirmed) ───
          const Adapter = entry.component;
          return (
            <Adapter
              key={`${section.type}-${index}`}
              {...result.coercedProps}
            />
          );
        }

        // ── "silent" mode: no validation, raw mergedProps ─────────────────────
        const Adapter = entry.component;
        return <Adapter key={`${section.type}-${index}`} {...mergedProps} />;
      })}
    </>
  );
};

export default DynamicRenderer;
