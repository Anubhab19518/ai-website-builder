"use client";

/**
 * @module ai-components/PricingAdapter
 *
 * Thin adapter around /components/landing/Pricing.
 *
 * The platform Pricing component has its plan data hard-coded. This adapter
 * accepts a structured `plans` array from the AI system and renders it using
 * the exact same CSS classes — no duplication of markup logic.
 */

import { Check } from "lucide-react";
import Link from "next/link";
import { PricingAdapterProps, PricingPlan } from "./types";

/**
 * PricingAdapter
 *
 * Renders a pricing grid from a structured plan list supplied by the AI.
 */
export const PricingAdapter = ({
  eyebrow = "Simple pricing",
  title,
  subtitle,
  plans,
}: PricingAdapterProps) => {
  return (
    <section id="pricing" className="pricing-section">
      <div className="section-container">
        <div className="section-heading">
          {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>

        <div className="pricing-grid">
          {plans.map((plan: PricingPlan) => (
            <div
              key={plan.name}
              className={`pricing-card${plan.highlight ? " pricing-card--highlight" : ""}`}
            >
              {plan.badge && (
                <div className="pricing-badge">{plan.badge}</div>
              )}

              <div className="pricing-header">
                <h3 className="pricing-name">{plan.name}</h3>
                {plan.tagline && (
                  <p className="pricing-tagline">{plan.tagline}</p>
                )}
              </div>

              <div className="pricing-price">
                <span className="pricing-amount">{plan.price}</span>
                {plan.period && (
                  <span className="pricing-period">{plan.period}</span>
                )}
              </div>

              <ul className="pricing-features">
                {plan.features.map((f: string, i: number) => {
                  const isDivider = i === 0 && f.toLowerCase().includes("plus");
                  return (
                    <li
                      key={i}
                      className={`pricing-feature-item${isDivider ? " pricing-feature-divider" : ""}`}
                    >
                      {!isDivider && (
                        <Check size={15} strokeWidth={2.5} className="pricing-check" />
                      )}
                      <span>{f}</span>
                    </li>
                  );
                })}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`pricing-cta${plan.highlight ? " pricing-cta--primary" : " pricing-cta--secondary"}`}
              >
                {plan.ctaLabel}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingAdapter;
