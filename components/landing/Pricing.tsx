"use client";

import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    tagline: "Experiment at no cost",
    price: "$0",
    period: "/ month",
    highlight: false,
    badge: null,
    features: [
      "10 free monthly credits",
      "Unlock all core platform features",
      "Build web & mobile experiences",
      "Access the latest AI models",
      "One-click LLM integration",
    ],
    cta: "Get Started",
    ctaHref: "/signup",
  },
  {
    name: "Pro",
    tagline: "For serious builders",
    price: "$29",
    period: "/ month",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Everything in Free, plus:",
      "100 credits per month",
      "Private project hosting",
      "Build web & mobile apps",
      "Purchase extra credits as needed",
      "GitHub integration & fork tasks",
      "Priority support",
    ],
    cta: "Start Building",
    ctaHref: "/signup?plan=pro",
  },
  {
    name: "Enterprise",
    tagline: "For teams and organisations",
    price: "Custom",
    period: "pricing",
    highlight: false,
    badge: null,
    features: [
      "Everything in Pro, plus:",
      "Unlimited monthly credits",
      "1M+ context window",
      "Ultra thinking models",
      "Custom AI agents",
      "High-performance compute",
      "SSO & team management",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    ctaHref: "mailto:sales@synthapp.ai",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="pricing-section">
      <div className="section-container">
        <div className="section-heading">
          <p className="section-eyebrow">Simple pricing</p>
          <h2 className="section-title">Plans that grow with you</h2>
          <p className="section-subtitle">
            Flexible tiers designed for solo makers, professional developers, and enterprise teams.
            No hidden fees, ever.
          </p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`pricing-card${plan.highlight ? " pricing-card--highlight" : ""}`}
            >
              {plan.badge && (
                <div className="pricing-badge">{plan.badge}</div>
              )}

              <div className="pricing-header">
                <h3 className="pricing-name">{plan.name}</h3>
                <p className="pricing-tagline">{plan.tagline}</p>
              </div>

              <div className="pricing-price">
                <span className="pricing-amount">{plan.price}</span>
                <span className="pricing-period">{plan.period}</span>
              </div>

              <ul className="pricing-features">
                {plan.features.map((f, i) => (
                  <li key={i} className={`pricing-feature-item${i === 0 && plan.features[0].includes("plus") ? " pricing-feature-divider" : ""}`}>
                    {!(i === 0 && plan.features[0].includes("plus")) && (
                      <Check size={15} strokeWidth={2.5} className="pricing-check" />
                    )}
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.ctaHref} className={`pricing-cta${plan.highlight ? " pricing-cta--primary" : " pricing-cta--secondary"}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pricing;
