/**
 * @module registry/componentRegistry
 *
 * Central registry that maps AI-specified component type strings to their
 * adapter components and provides metadata the AI can use to choose the
 * right component and populate its props.
 *
 * Rules:
 *  - Only adapter components from /ai-components are registered here.
 *  - Platform components from /components are NEVER imported directly.
 *  - Each entry includes a JSON-Schema-compatible propSchema for prompt
 *    compression — the AI only needs to read the schema, not the source.
 */

import type { ComponentType } from "react";

import { HeroAdapter }      from "@/ai-components/HeroAdapter";
import { FeaturesAdapter }  from "@/ai-components/FeaturesAdapter";
import { PricingAdapter }   from "@/ai-components/PricingAdapter";
import { LogoStripAdapter } from "@/ai-components/LogoStripAdapter";
import { ChatAdapter }      from "@/ai-components/ChatAdapter";
import { ButtonAdapter }    from "@/ai-components/ButtonAdapter";
import { CardAdapter }      from "@/ai-components/CardAdapter";

// ---------------------------------------------------------------------------
// Registry types
// ---------------------------------------------------------------------------

export interface PropSchema {
  type: "string" | "number" | "boolean" | "array" | "object";
  description: string;
  required?: boolean;
  items?: PropSchema;               // for arrays
  properties?: Record<string, PropSchema>; // for objects
  enum?: string[];
  default?: unknown;
}

export interface ComponentEntry {
  /** Human-readable label */
  label: string;
  /** Description sent to the AI so it understands when to use this component */
  description: string;
  /** The adapter component to render */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
  /** Supported layout/style variants */
  variants: string[];
  /** Default props applied before AI overrides */
  defaultProps: Record<string, unknown>;
  /** JSON-Schema-like description of accepted props (for prompt compression) */
  propSchema: Record<string, PropSchema>;
}

export type ComponentType_t =
  | "hero"
  | "features"
  | "pricing"
  | "logo-strip"
  | "chat"
  | "button"
  | "card";

// ---------------------------------------------------------------------------
// Registry definition
// ---------------------------------------------------------------------------

export const componentRegistry: Record<ComponentType_t, ComponentEntry> = {
  // ─── Landing Sections ────────────────────────────────────────────────────

  hero: {
    label: "Hero Section",
    description:
      "Full-width landing hero with animated typewriter prompt input, feature tags, and social proof. Use this as the first section of any marketing or landing page.",
    component: HeroAdapter,
    variants: ["default"],
    defaultProps: {
      headline: "AI App Builder",
      subheadline:
        "Describe your app idea and watch it come to life. Generate full-stack applications with AI.",
      featureTags: ["Full-Stack Apps", "Auth & Database", "Custom APIs", "Landing Pages"],
      socialProof: "Trusted by 10,000+ developers and teams worldwide",
    },
    propSchema: {
      headline: { type: "string", required: true, description: "Main h1 headline text." },
      subheadline: { type: "string", description: "Supporting paragraph beneath the headline." },
      featureTags: {
        type: "array",
        description: "Short feature labels shown as clickable tag pills.",
        items: { type: "string", description: "Tag label" },
      },
      placeholderPrompts: {
        type: "array",
        description: "Rotating typewriter placeholder strings for the textarea.",
        items: { type: "string", description: "Placeholder text" },
      },
      socialProof: { type: "string", description: "Trust signal line below the input card." },
      ctaHref: { type: "string", description: "Route the form submit navigates to.", default: "/signup" },
    },
  },

  features: {
    label: "Features Section",
    description:
      "Bento-grid of feature cards. Each card has a title, description, icon, accent colour, and optional 'large' (2-column) size. Use for showcasing platform capabilities.",
    component: FeaturesAdapter,
    variants: ["bento-grid"],
    defaultProps: {
      eyebrow: "Platform capabilities",
      title: "Everything you need to ship faster",
      subtitle:
        "Stop wrestling with boilerplate and infrastructure. Let AI handle the heavy lifting while you stay focused on building a great product.",
      items: [],
    },
    propSchema: {
      eyebrow: { type: "string", description: "Small label above the title." },
      title: { type: "string", required: true, description: "Section heading." },
      subtitle: { type: "string", description: "Paragraph below the heading." },
      items: {
        type: "array",
        required: true,
        description: "Array of feature card definitions.",
        items: {
          type: "object",
          description: "Single feature card",
          properties: {
            title: { type: "string", required: true, description: "Card headline." },
            description: { type: "string", required: true, description: "Card body text." },
            iconName: {
              type: "string",
              required: true,
              description:
                "Lucide icon name (PascalCase). Supported: Cpu, Zap, Globe2, ShieldCheck, GitBranch, LayoutTemplate, Star, Layers, Code, Database, Lock, Rocket, MessageSquare, Search, Palette, BarChart, Settings, Users, Bell, FileText, Link, Mail, Phone, Map, Camera, Music, Video, Download, Upload, Share, Heart, Bookmark, Calendar, Clock, Home, User, Package, Box, Briefcase.",
            },
            accent: {
              type: "string",
              description: "Hex accent colour, e.g. '#6366f1'.",
              default: "#6366f1",
            },
            size: {
              type: "string",
              enum: ["small", "large"],
              description: "'large' cards span two bento columns.",
              default: "small",
            },
            tag: { type: "string", description: "Short category badge, e.g. 'Core'." },
          },
        },
      },
    },
  },

  pricing: {
    label: "Pricing Section",
    description:
      "Three-column pricing card grid with feature lists and CTA buttons. Supports highlighted (featured) plan and optional badges.",
    component: PricingAdapter,
    variants: ["3-column-grid"],
    defaultProps: {
      eyebrow: "Simple pricing",
      title: "Plans that grow with you",
      subtitle: "Flexible tiers designed for solo makers, professional developers, and enterprise teams.",
      plans: [],
    },
    propSchema: {
      eyebrow: { type: "string", description: "Small label above the title." },
      title: { type: "string", required: true, description: "Section heading." },
      subtitle: { type: "string", description: "Paragraph below the heading." },
      plans: {
        type: "array",
        required: true,
        description: "Array of pricing plan objects.",
        items: {
          type: "object",
          description: "Single pricing plan",
          properties: {
            name: { type: "string", required: true, description: "Plan name, e.g. 'Pro'." },
            tagline: { type: "string", description: "One-line plan description." },
            price: { type: "string", required: true, description: "Display price, e.g. '$29' or 'Custom'." },
            period: { type: "string", description: "Billing period, e.g. '/ month'.", default: "/ month" },
            features: {
              type: "array",
              required: true,
              description: "List of feature strings. If the first item contains 'plus:' it renders as a divider.",
              items: { type: "string", description: "Feature bullet" },
            },
            ctaLabel: { type: "string", required: true, description: "Button label." },
            ctaHref: { type: "string", required: true, description: "Button destination URL." },
            highlight: { type: "boolean", description: "Render as the featured card.", default: false },
            badge: { type: "string", description: "Badge text, e.g. 'Most Popular'." },
          },
        },
      },
    },
  },

  "logo-strip": {
    label: "Logo Strip / Marquee",
    description:
      "Horizontally scrolling marquee of partner/integration brand logos. Appears between the hero and features sections.",
    component: LogoStripAdapter,
    variants: ["marquee"],
    defaultProps: {
      label: "Loved by teams building with",
    },
    propSchema: {
      label: { type: "string", description: "Caption text above the marquee.", default: "Loved by teams building with" },
      brands: {
        type: "array",
        description:
          "List of brand names to show. Supported: Vercel, Stripe, OpenAI, Supabase, GitHub, Next.js, Figma, AWS, Tailwind. Unknown names render as text pills.",
        items: { type: "string", description: "Brand name" },
      },
    },
  },

  // ─── Chat ─────────────────────────────────────────────────────────────────

  chat: {
    label: "Chat Thread (read-only)",
    description:
      "Renders a read-only conversation thread from a messages array. Does NOT include an input box. Use this to preview or display AI conversations.",
    component: ChatAdapter,
    variants: ["read-only"],
    defaultProps: {
      messages: [],
      loading: false,
    },
    propSchema: {
      messages: {
        type: "array",
        description: "Array of message objects to display.",
        items: {
          type: "object",
          description: "Single message",
          properties: {
            role: { type: "string", enum: ["user", "assistant"], required: true, description: "Message author." },
            content: { type: "string", required: true, description: "Message body text." },
          },
        },
      },
      loading: { type: "boolean", description: "Show typing indicator.", default: false },
    },
  },

  // ─── Primitives ───────────────────────────────────────────────────────────

  button: {
    label: "Button",
    description:
      "Renders a styled CTA or action button. Use `href` to turn it into a link. Supports primary, secondary, ghost, and outline variants.",
    component: ButtonAdapter,
    variants: ["primary", "secondary", "ghost", "outline"],
    defaultProps: {
      label: "Get Started",
      variant: "primary",
    },
    propSchema: {
      label: { type: "string", required: true, description: "Button text." },
      variant: {
        type: "string",
        enum: ["primary", "secondary", "ghost", "outline"],
        description: "Visual style.",
        default: "primary",
      },
      iconName: {
        type: "string",
        description:
          "Optional Lucide icon rendered before the label. Supported: ArrowRight, Star, Code, Download, Share, Mail, ExternalLink, Plus, Trash2, Edit, Check, X, Search, Settings, ChevronRight, ChevronLeft, ChevronDown, ChevronUp.",
      },
      disabled: { type: "boolean", description: "Disables the button.", default: false },
      href: { type: "string", description: "If provided, renders as a Next.js Link." },
    },
  },

  card: {
    label: "Card",
    description:
      "Generic content card with optional title, description, body, and footer. Use to group related information visually.",
    component: CardAdapter,
    variants: ["default", "sm"],
    defaultProps: {
      size: "default",
    },
    propSchema: {
      title: { type: "string", description: "Card heading." },
      description: { type: "string", description: "Subtitle or description below the title." },
      size: {
        type: "string",
        enum: ["default", "sm"],
        description: "Card density. 'sm' uses tighter padding.",
        default: "default",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/**
 * Returns the registry entry for a given component type, or null if unknown.
 */
export function getRegistryEntry(type: string): ComponentEntry | null {
  return componentRegistry[type as ComponentType_t] ?? null;
}

/**
 * Returns all registered component type keys.
 */
export function getRegisteredTypes(): ComponentType_t[] {
  return Object.keys(componentRegistry) as ComponentType_t[];
}

/**
 * Returns a minimal token-compressed schema summary for the AI.
 * Only includes type, required status, and description per prop.
 */
export function getCompressedSchema(type: string): Record<string, string> | null {
  const entry = getRegistryEntry(type);
  if (!entry) return null;

  return Object.fromEntries(
    Object.entries(entry.propSchema).map(([key, schema]) => [
      key,
      `${schema.type}${schema.required ? " (required)" : ""} — ${schema.description}`,
    ])
  );
}
