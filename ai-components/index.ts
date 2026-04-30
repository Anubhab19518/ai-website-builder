/**
 * @module ai-components
 *
 * Public barrel for the AI component layer.
 *
 * Import everything AI-related from here. Do NOT import individual
 * adapters directly in AI rendering code — use this index or the
 * DynamicRenderer to keep the boundary clean.
 */

export { HeroAdapter }      from "./HeroAdapter";
export { FeaturesAdapter }  from "./FeaturesAdapter";
export { PricingAdapter }   from "./PricingAdapter";
export { LogoStripAdapter } from "./LogoStripAdapter";
export { ChatAdapter }      from "./ChatAdapter";
export { ButtonAdapter }    from "./ButtonAdapter";
export { CardAdapter }      from "./CardAdapter";
export { DynamicRenderer }  from "./DynamicRenderer";

export type {
  HeroAdapterProps,
  FeaturesAdapterProps,
  FeatureItem,
  PricingAdapterProps,
  PricingPlan,
  LogoStripAdapterProps,
  ChatAdapterProps,
  ChatMessage,
  ChatRole,
  ButtonAdapterProps,
  ButtonVariant,
  CardAdapterProps,
  TextAlign,
} from "./types";
