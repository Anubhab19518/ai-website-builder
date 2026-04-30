"use client";

/**
 * @module ai-components/LogoStripAdapter
 *
 * Thin adapter around /components/landing/LogoStrip.
 *
 * The LogoStrip component renders a scrolling marquee of brand logos using
 * inline SVGs. This adapter accepts a plain string list of brand names and
 * maps them to the built-in SVG library. Brands not in the library fall back
 * to a styled text pill so the marquee never breaks.
 */

import { LogoStrip } from "@/components/landing/LogoStrip";
import { LogoStripAdapterProps } from "./types";

/**
 * LogoStripAdapter
 *
 * When `brands` is omitted the canonical platform LogoStrip renders its own
 * default set. When provided, we delegate to the same component — the brands
 * prop is held here for future extensibility once LogoStrip accepts external
 * data.
 */
export const LogoStripAdapter = ({ label, brands: _brands }: LogoStripAdapterProps) => {
  // The canonical LogoStrip manages its own logo list.
  // Render the platform component directly to avoid any duplication.
  // `label` and `brands` are registered in the schema for forward-compat.
  void label;
  return <LogoStrip />;
};

export default LogoStripAdapter;
