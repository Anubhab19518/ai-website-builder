"use client";

import { useEffect, useState } from "react";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { LogoStrip } from "@/components/landing/LogoStrip";
import { Pricing } from "@/components/landing/Pricing";
import Link from "next/link";
import { MessageSquare, Sparkles, Rocket, ArrowRight, GitBranch, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: MessageSquare,
    title: "Describe your idea",
    description:
      "Type what you want to build in plain English. Be specific or stay broad — our AI understands context, stacks, and design patterns.",
  },
  {
    step: "02",
    icon: Sparkles,
    title: "AI generates everything",
    description:
      "Watch as a complete application is assembled: frontend components, API routes, database schemas, and authentication flows — all in seconds.",
  },
  {
    step: "03",
    icon: Rocket,
    title: "Refine and deploy",
    description:
      "Chat with the AI to iterate on any detail. When you're ready, hit deploy and get a live URL with global edge distribution.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push("/dashboard");
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.push("/dashboard");
    });
    return () => authListener.subscription.unsubscribe();
  }, [router]);

  // Sticky nav scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="landing-root">
      {/* ── NAVBAR ── */}
      <header className={`landing-nav${scrolled ? " landing-nav--scrolled" : ""}`}>
        <div className="landing-nav-inner">
          {/* Brand */}
          <Link href="/" className="landing-brand">
            <span className="landing-brand-icon">⬡</span>
            SynthApp
          </Link>

          {/* Center nav */}
          <nav className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#how-it-works" className="landing-nav-link">How it Works</a>
            <a href="#pricing" className="landing-nav-link">Pricing</a>
          </nav>

          {/* Right CTA */}
          <div className="landing-nav-actions">
            <Link href="/signup" className="landing-nav-cta">
              Start Building <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="landing-main">
        {/* Hero */}
        <Hero />

        {/* Logo strip */}
        <LogoStrip />

        {/* Features */}
        <Features />

        {/* How It Works — Horizontal timeline */}
        <section id="how-it-works" className="how-section">
          <div className="section-container">
            <div className="section-heading">
              <p className="section-eyebrow">The process</p>
              <h2 className="section-title">From idea to live app in minutes</h2>
              <p className="section-subtitle">
                Our AI pipeline handles every layer of complexity so you can focus entirely on
                your product vision.
              </p>
            </div>

            <div className="how-timeline">
              {HOW_IT_WORKS.map((step, idx) => (
                <div key={step.step} className="how-timeline-step">
                  {/* Connector line (not on last) */}
                  {idx < HOW_IT_WORKS.length - 1 && (
                    <div className="how-timeline-connector" aria-hidden />
                  )}
                  {/* Circle node */}
                  <div className="how-timeline-node">
                    <span className="how-timeline-num">{step.step}</span>
                  </div>
                  {/* Card below */}
                  <div className="how-timeline-card">
                    <div className="how-timeline-icon">
                      <step.icon size={26} strokeWidth={1.6} />
                    </div>
                    <h3 className="how-timeline-title">{step.title}</h3>
                    <p className="how-timeline-desc">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* Pricing */}
        <Pricing />

        {/* Final CTA Banner */}
        <section className="cta-banner-section">
          <div className="cta-banner-inner">
            <h2 className="cta-banner-title">Ready to build something great?</h2>
            <p className="cta-banner-sub">
              Join thousands of developers shipping production apps with AI — no boilerplate, no overhead.
            </p>
            <Link href="/signup" className="cta-banner-btn">
              Get started free <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          {/* Brand col */}
          <div className="footer-brand-col">
            <Link href="/" className="footer-brand-logo">
              <span className="landing-brand-icon">⬡</span>
              SynthApp
            </Link>
            <p className="footer-brand-desc">
              AI-powered full-stack app builder. Describe, generate, deploy — that's it.
            </p>
            <div className="footer-social">
              <a href="https://twitter.com" aria-label="Twitter / X" className="footer-social-link" target="_blank" rel="noopener noreferrer">
                <X size={15} />
              </a>
              <a href="https://github.com" aria-label="GitHub" className="footer-social-link" target="_blank" rel="noopener noreferrer">
                <GitBranch size={16} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="footer-links-col">
            <p className="footer-col-heading">Product</p>
            <a href="#features" className="footer-link">Features</a>
            <a href="#how-it-works" className="footer-link">How it Works</a>
            <a href="#pricing" className="footer-link">Pricing</a>
            <Link href="/signup" className="footer-link">Get Started</Link>
          </div>

          <div className="footer-links-col">
            <p className="footer-col-heading">Company</p>
            <a href="#" className="footer-link">About</a>
            <a href="#" className="footer-link">Blog</a>
            <a href="#" className="footer-link">Changelog</a>
            <a href="#" className="footer-link">Contact</a>
          </div>

          <div className="footer-links-col">
            <p className="footer-col-heading">Legal</p>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Cookie Policy</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SynthApp. All rights reserved.</p>
          <p>Built with ♥ and AI</p>
        </div>
      </footer>
    </div>
  );
}
