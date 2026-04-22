"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const FEATURE_TAGS = [
  "Full-Stack Apps",
  "Auth & Database",
  "Custom APIs",
  "Landing Pages",
];

const PLACEHOLDER_PROMPTS = [
  "Build me a SaaS dashboard with authentication...",
  "Create a full-stack e-commerce app with payments...",
  "Generate a portfolio site with blog and CMS...",
  "Make a real-time chat app with WebSockets...",
];

export function Hero() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animated typewriter placeholder
  useEffect(() => {
    let charIdx = 0;
    const target = PLACEHOLDER_PROMPTS[placeholderIdx];
    setDisplayedPlaceholder("");

    const type = () => {
      if (charIdx <= target.length) {
        setDisplayedPlaceholder(target.slice(0, charIdx));
        charIdx++;
        typingRef.current = setTimeout(type, 38);
      } else {
        // Pause then cycle
        typingRef.current = setTimeout(() => {
          setPlaceholderIdx((i) => (i + 1) % PLACEHOLDER_PROMPTS.length);
        }, 2400);
      }
    };
    typingRef.current = setTimeout(type, 600);
    return () => {
      if (typingRef.current) clearTimeout(typingRef.current);
    };
  }, [placeholderIdx]);

  const handleSubmit = () => {
    if (prompt.trim()) {
      router.push(`/signup?prompt=${encodeURIComponent(prompt.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section className="hero-section relative flex flex-col items-center justify-center overflow-hidden">
      {/* Sky background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-sky.png"
        alt=""
        aria-hidden="true"
        className="hero-bg-img"
        draggable={false}
      />

      {/* Bottom fade to white */}
      <div className="hero-bottom-fade" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full hero-content">
        {/* Headline */}
        <h1 className="hero-headline fade-up" style={{ animationDelay: "0.05s" }}>
          AI App Builder
        </h1>

        {/* Sub-headline */}
        <p className="hero-subhead fade-up" style={{ animationDelay: "0.18s" }}>
          Describe your app idea and watch it come to life. Generate full-stack applications&nbsp;
          with auth, databases, APIs, and beautiful UIs — all with AI.
        </p>

        {/* Prompt Input Card */}
        <div
          className="hero-input-card fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="hero-input-inner">
            <textarea
              ref={textareaRef}
              id="hero-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={displayedPlaceholder}
              rows={3}
              className="hero-textarea"
              aria-label="Describe your app idea"
            />
            <button
              onClick={handleSubmit}
              aria-label="Build app"
              className="hero-submit-btn"
            >
              <ArrowRight size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Feature tags */}
          <div className="hero-tags">
            <span className="hero-tags-label">Add Features:</span>
            {FEATURE_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() =>
                  setPrompt((p) =>
                    p ? `${p.trim()}, ${tag}` : tag
                  )
                }
                className="hero-tag-btn"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <p className="hero-social-proof fade-up" style={{ animationDelay: "0.45s" }}>
          Trusted by <strong>10,000+</strong> developers and teams worldwide
        </p>
      </div>
    </section>
  );
}

export default Hero;
