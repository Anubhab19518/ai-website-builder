/**
 * @module components/renderer/DynamicRenderer
 *
 * Renders the AI-generated website blueprint by mapping section types
 * to the registered adapter components.
 */

"use client";

import React from "react";
import { getRegistryEntry } from "@/registry/componentRegistry";
import type { SectionConfig } from "@/src/agents/nodes/layoutExecutor";

interface DynamicRendererProps {
  sections: SectionConfig[];
}

export function DynamicRenderer({ sections }: DynamicRendererProps) {
  if (!sections || sections.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-50 text-zinc-400 rounded-xl border border-zinc-200">
        <p>No layout to render yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-white text-zinc-950 rounded-xl border border-zinc-200 shadow-2xl flex flex-col hide-scrollbar">
      {sections.map((section, idx) => {
        const entry = getRegistryEntry(section.type);
        if (!entry) {
          console.warn(`[DynamicRenderer] Unknown component type: ${section.type}`);
          return null;
        }

        const Component = entry.component;
        return (
          <div key={`${section.type}-${idx}`} className="w-full">
            <Component {...section.props} />
          </div>
        );
      })}
    </div>
  );
}
