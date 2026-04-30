/**
 * @module ai-components/types
 *
 * Canonical prop interfaces for the AI component layer.
 * These are the ONLY types the AI system should use when specifying
 * website sections. They are intentionally simpler and more declarative
 * than the internal platform component props.
 */

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type TextAlign = "left" | "center" | "right";

// ---------------------------------------------------------------------------
// HeroAdapter
// ---------------------------------------------------------------------------

export interface HeroAdapterProps {
  /** Main headline text */
  headline: string;
  /** Supporting paragraph below the headline */
  subheadline?: string;
  /** Optional array of feature tags shown beneath the input */
  featureTags?: string[];
  /** Placeholder prompts that cycle in the textarea */
  placeholderPrompts?: string[];
  /** Social-proof copy, e.g. "Trusted by 10,000+ developers" */
  socialProof?: string;
  /** Route the CTA navigates to when prompt is submitted */
  ctaHref?: string;
}

// ---------------------------------------------------------------------------
// FeaturesAdapter
// ---------------------------------------------------------------------------

export interface FeatureItem {
  title: string;
  description: string;
  /** Lucide icon name (as string), e.g. "Cpu", "Zap", "Globe2" */
  iconName: string;
  /** Hex accent colour, e.g. "#6366f1" */
  accent?: string;
  /** "large" cards span two columns in the bento grid */
  size?: "small" | "large";
  /** Short category label shown as a pill badge */
  tag?: string;
}

export interface FeaturesAdapterProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  items: FeatureItem[];
}

// ---------------------------------------------------------------------------
// PricingAdapter
// ---------------------------------------------------------------------------

export interface PricingPlan {
  name: string;
  tagline?: string;
  /** Display price string, e.g. "$29" or "Custom" */
  price: string;
  period?: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  /** Highlighted (featured) card */
  highlight?: boolean;
  /** Optional badge text, e.g. "Most Popular" */
  badge?: string;
}

export interface PricingAdapterProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  plans: PricingPlan[];
}

// ---------------------------------------------------------------------------
// LogoStripAdapter
// ---------------------------------------------------------------------------

export interface LogoStripAdapterProps {
  /** Label rendered above the scrolling strip */
  label?: string;
  /**
   * Supply your own list of brand names. The adapter maps them to the
   * built-in SVG library. Unknown names fall back to a text pill.
   */
  brands?: string[];
}

// ---------------------------------------------------------------------------
// ChatAdapter (renders a read-only message thread)
// ---------------------------------------------------------------------------

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatAdapterProps {
  messages?: ChatMessage[];
  /** Whether the AI is currently streaming a reply */
  loading?: boolean;
}

// ---------------------------------------------------------------------------
// ButtonAdapter
// ---------------------------------------------------------------------------

export interface ButtonAdapterProps {
  label: string;
  variant?: ButtonVariant;
  /** Lucide icon name to render before the label */
  iconName?: string;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
}

// ---------------------------------------------------------------------------
// CardAdapter
// ---------------------------------------------------------------------------

export interface CardAdapterProps {
  title?: string;
  description?: string;
  /** Arbitrary child content rendered inside the card body */
  children?: React.ReactNode;
  size?: "default" | "sm";
  footer?: React.ReactNode;
}
