"use client";

/**
 * @module ai-components/FeaturesAdapter
 *
 * Thin adapter around /components/landing/Features.
 *
 * The platform Features component hard-codes its feature list internally.
 * This adapter accepts a structured `items` array from the AI system and
 * maps each item into the shape that the original bento-grid markup expects,
 * reusing the exact same CSS classes so styling remains identical.
 *
 * No component logic is duplicated — only the data layer is parameterised.
 */

import {
  Cpu, Zap, Globe2, ShieldCheck, GitBranch, LayoutTemplate,
  LucideIcon, Star, Layers, Code, Database, Lock, Rocket,
  MessageSquare, Search, Image, Palette, BarChart, Settings,
  Users, Bell, FileText, Link, Mail, Phone, Map, Camera,
  Music, Video, Download, Upload, Share, Heart, Bookmark,
  Calendar, Clock, Home, User, Package, Box, Briefcase,
} from "lucide-react";
import { FeaturesAdapterProps, FeatureItem } from "./types";

// ---------------------------------------------------------------------------
// Icon registry — maps string names (from AI output) → Lucide components
// ---------------------------------------------------------------------------
const ICON_MAP: Record<string, LucideIcon> = {
  Cpu, Zap, Globe2, ShieldCheck, GitBranch, LayoutTemplate,
  Star, Layers, Code, Database, Lock, Rocket,
  MessageSquare, Search, Image, Palette, BarChart, Settings,
  Users, Bell, FileText, Link, Mail, Phone, Map, Camera,
  Music, Video, Download, Upload, Share, Heart, Bookmark,
  Calendar, Clock, Home, User, Package, Box, Briefcase,
};

function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Star;
}

function buildAccentBg(accent: string): string {
  // Convert hex to a semi-transparent rgba via CSS. We use a simple fallback.
  // For full accuracy the adapter accepts accentBg directly if needed.
  return `${accent}12`; // 12 = ~7% opacity in hex alpha
}

/**
 * FeaturesAdapter
 *
 * Accepts a structured list of feature items and renders them using the
 * exact same bento-grid markup and CSS classes as /components/landing/Features.
 */
export const FeaturesAdapter = ({
  eyebrow = "Platform capabilities",
  title,
  subtitle,
  items = [],
}: FeaturesAdapterProps) => {
  const safeItems = Array.isArray(items) ? items : [];

  if (!safeItems.length) {
    return <div className="opacity-50 py-12 text-center text-zinc-500">Loading features...</div>;
  }

  return (
    <section id="features" className="features-section">
      <div className="section-container">
        <div className="section-heading">
          {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>

        <div className="features-bento">
          {safeItems.map((item: FeatureItem, i: number) => {
            const Icon = resolveIcon(item.iconName);
            const accent = item.accent ?? "#6366f1";
            const accentBg = buildAccentBg(accent);

            return (
              <div
                key={item.title}
                className={`feature-bento-card${item.size === "large" ? " feature-bento-card--wide" : ""}`}
              >
                <div className="feature-bento-top">
                  {item.tag && (
                    <span
                      className="feature-bento-tag"
                      style={{ color: accent, background: accentBg }}
                    >
                      {item.tag}
                    </span>
                  )}
                  <span className="feature-bento-num">0{i + 1}</span>
                </div>

                <div className="feature-bento-icon" style={{ background: accentBg }}>
                  <Icon size={28} style={{ color: accent }} strokeWidth={1.6} />
                </div>

                <h3 className="feature-bento-title">{item.title}</h3>
                <p className="feature-bento-desc">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesAdapter;
