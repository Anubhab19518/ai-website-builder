import { Cpu, Zap, Globe2, ShieldCheck, GitBranch, LayoutTemplate } from "lucide-react";

const FEATURES = [
  {
    title: "AI Code Generation",
    description:
      "Describe your app in plain English. Our models write production-quality React, Next.js, and API routes — no boilerplate, just clean output.",
    icon: Cpu,
    accent: "#6366f1",
    accentBg: "rgba(99,102,241,0.07)",
    size: "large", // spans 2 cols
    tag: "Core",
  },
  {
    title: "Instant Chat Editing",
    description:
      "Ask the AI to tweak colors, restructure layouts, or add features — watch it update live.",
    icon: Zap,
    accent: "#f59e0b",
    accentBg: "rgba(245,158,11,0.07)",
    size: "small",
    tag: "Real-time",
  },
  {
    title: "One-Click Deploy",
    description:
      "From prompt to globally distributed live URL in seconds — fully managed, zero config.",
    icon: Globe2,
    accent: "#3b82f6",
    accentBg: "rgba(59,130,246,0.07)",
    size: "small",
    tag: "Deploy",
  },
  {
    title: "Auth & Database Built In",
    description:
      "Every generated app ships with authentication flows and a Postgres database wired up automatically. Security-first, always.",
    icon: ShieldCheck,
    accent: "#10b981",
    accentBg: "rgba(16,185,129,0.07)",
    size: "small",
    tag: "Security",
  },
  {
    title: "GitHub Integration",
    description:
      "Push to any repo, open PRs, and sync changes. Your codebase stays yours — version-controlled from day one.",
    icon: GitBranch,
    accent: "#8b5cf6",
    accentBg: "rgba(139,92,246,0.07)",
    size: "small",
    tag: "Dev",
  },
  {
    title: "Professional Templates",
    description:
      "Start with battle-tested starter kits for SaaS dashboards, landing pages, e-commerce, or portfolio sites. Customise freely.",
    icon: LayoutTemplate,
    accent: "#ec4899",
    accentBg: "rgba(236,72,153,0.07)",
    size: "large",
    tag: "Design",
  },
];

export function Features() {
  return (
    <section id="features" className="features-section">
      <div className="section-container">
        {/* Heading */}
        <div className="section-heading">
          <p className="section-eyebrow">Platform capabilities</p>
          <h2 className="section-title">Everything you need to ship faster</h2>
          <p className="section-subtitle">
            Stop wrestling with boilerplate and infrastructure. Let AI handle the heavy
            lifting while you stay focused on building a great product.
          </p>
        </div>

        {/* Bento grid */}
        <div className="features-bento">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`feature-bento-card${f.size === "large" ? " feature-bento-card--wide" : ""}`}
            >
              {/* Top row: tag + number */}
              <div className="feature-bento-top">
                <span className="feature-bento-tag" style={{ color: f.accent, background: f.accentBg }}>
                  {f.tag}
                </span>
                <span className="feature-bento-num">0{i + 1}</span>
              </div>

              {/* Icon */}
              <div className="feature-bento-icon" style={{ background: f.accentBg }}>
                <f.icon size={28} style={{ color: f.accent }} strokeWidth={1.6} />
              </div>

              {/* Text */}
              <h3 className="feature-bento-title">{f.title}</h3>
              <p className="feature-bento-desc">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
