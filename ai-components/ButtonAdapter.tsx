"use client";

/**
 * @module ai-components/ButtonAdapter
 *
 * Thin adapter around /components/ui/button.
 *
 * Maps AI-friendly prop names (label, variant, iconName, href) onto the
 * platform Button's CVA-based interface without duplicating any logic.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Star, Code, Download, Share, Mail, ExternalLink,
  LucideIcon, Plus, Trash2, Edit, Check, X, Search, Settings,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
} from "lucide-react";
import { ButtonAdapterProps, ButtonVariant } from "./types";

// ---------------------------------------------------------------------------
// Icon registry
// ---------------------------------------------------------------------------
const ICON_MAP: Record<string, LucideIcon> = {
  ArrowRight, Star, Code, Download, Share, Mail, ExternalLink,
  Plus, Trash2, Edit, Check, X, Search, Settings,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
};

function resolveIcon(name: string): LucideIcon | null {
  return ICON_MAP[name] ?? null;
}

// Map AI variant names → shadcn/CVA variant names
const VARIANT_MAP: Record<ButtonVariant, "default" | "secondary" | "ghost" | "outline"> = {
  primary: "default",
  secondary: "secondary",
  ghost: "ghost",
  outline: "outline",
};

/**
 * ButtonAdapter
 *
 * Renders a platform Button with AI-normalised props.
 * When `href` is provided the button renders as a Next.js Link.
 */
export const ButtonAdapter = ({
  label,
  variant = "primary",
  iconName,
  disabled,
  onClick,
  href,
}: ButtonAdapterProps) => {
  const Icon = iconName ? resolveIcon(iconName) : null;
  const cvVariant = VARIANT_MAP[variant];

  const inner = (
    <>
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </>
  );

  if (href) {
    return (
      <Button variant={cvVariant} disabled={disabled} asChild>
        <Link href={href}>{inner}</Link>
      </Button>
    );
  }

  return (
    <Button variant={cvVariant} disabled={disabled} onClick={onClick}>
      {inner}
    </Button>
  );
};

export default ButtonAdapter;
