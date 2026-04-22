"use client";

import { ReactNode, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Cpu, Zap, Globe2, ShieldCheck, Sparkles } from "lucide-react";

// Floating stat/feature cards shown on the left panel
const FLOAT_CARDS = [
  {
    id: 1,
    icon: <Cpu size={16} className="text-indigo-500" />,
    title: "AI Code Generation",
    sub: "Instant full-stack output",
    style: { top: "18%", left: "8%" },
    delay: "0s",
    duration: "7s",
  },
  {
    id: 2,
    icon: <Zap size={16} className="text-amber-500" />,
    title: "Real-time Editing",
    sub: "Chat → update in seconds",
    style: { top: "36%", right: "6%" },
    delay: "1.6s",
    duration: "9s",
  },
  {
    id: 3,
    icon: <Globe2 size={16} className="text-blue-500" />,
    title: "One-Click Deploy",
    sub: "Live URL in under 30s",
    style: { bottom: "30%", left: "6%" },
    delay: "3s",
    duration: "8s",
  },
  {
    id: 4,
    icon: <ShieldCheck size={16} className="text-emerald-500" />,
    title: "Auth & Database",
    sub: "Built-in, zero config",
    style: { bottom: "15%", right: "8%" },
    delay: "0.8s",
    duration: "10s",
  },
];

// Stat badge at the top of the panel
const STAT = { value: "10,000+", label: "apps built with SynthApp" };

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-root">
      {/* ── LEFT PANEL ── */}
      <div className="auth-panel">
        {/* Sky background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/auth-panel.png"
          alt=""
          aria-hidden
          className="auth-panel-bg"
          draggable={false}
        />
        {/* Bottom fade */}
        <div className="auth-panel-fade" />

        {/* Content layer */}
        <div className="auth-panel-content">
          {/* Brand at top */}
          <Link href="/" className="auth-panel-brand">
            <span className="auth-panel-brand-icon">⬡</span>
            SynthApp
          </Link>

          {/* Stat pill */}
          <div className="auth-panel-stat">
            <Sparkles size={13} className="text-indigo-500" />
            <span className="auth-panel-stat-value">{STAT.value}</span>
            <span className="auth-panel-stat-label">{STAT.label}</span>
          </div>

          {/* Floating feature cards */}
          {FLOAT_CARDS.map((card) => (
            <div
              key={card.id}
              className="auth-float-card"
              style={{
                ...card.style,
                animationDelay: card.delay,
                animationDuration: card.duration,
              }}
            >
              <div className="auth-float-card-icon">{card.icon}</div>
              <div>
                <p className="auth-float-card-title">{card.title}</p>
                <p className="auth-float-card-sub">{card.sub}</p>
              </div>
            </div>
          ))}

          {/* Bottom tagline */}
          <div className="auth-panel-tagline">
            <p className="auth-panel-tagline-text">
              Describe it.<br />Build it.<br />Ship it.
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div className="auth-form-panel">
        {/* Back link */}
        <Link href="/" className="auth-back-link">
          <ArrowLeft size={15} strokeWidth={2.5} />
          Back to site
        </Link>

        <div className="auth-form-inner">
          {children}
        </div>
      </div>
    </div>
  );
}
