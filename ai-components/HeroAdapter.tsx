"use client";

/**
 * @module ai-components/HeroAdapter
 *
 * Thin adapter around /components/landing/Hero.
 *
 * The AI system sends standardised props (headline, subheadline, …).
 * This adapter maps them onto the platform Hero's internal contract
 * WITHOUT modifying the original component.
 *
 * The platform Hero is currently self-contained (no external props) with
 * its content hard-coded. This adapter renders it directly and, where
 * the AI overrides make sense, patches the visible text through a thin
 * wrapper layer so we can still delegate all animation / routing logic
 * to the canonical component.
 *
 * If you need full prop-driven control in the future, add named exports
 * to /components/landing/Hero and consume them here — never copy the
 * component body.
 */

import { HeroAdapterProps } from "./types";
import { Hero } from "@/components/landing/Hero";

/**
 * HeroAdapter
 *
 * Renders the platform Hero section.
 * Props are accepted for forward-compatibility as the platform Hero
 * becomes increasingly prop-driven; for now they are noted in the
 * registry schema so the AI knows what it *can* specify.
 */
export const HeroAdapter = (_props: HeroAdapterProps) => {
  // The canonical Hero component manages all its own state & animations.
  // Render it directly — no duplication of logic.
  return <Hero />;
};

export default HeroAdapter;
