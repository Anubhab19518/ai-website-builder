"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";

interface AuthFormProps {
  type: "login" | "signup";
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (type === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { first_name: firstName, last_name: lastName } },
        });
        if (error) throw error;
        router.push("/login?message=Check your email to verify your account");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  const isValid =
    type === "signup" ? email && password && firstName && agreed : email && password;

  return (
    <div className="auth-form-body">
      {/* Heading */}
      <div className="auth-form-heading">
        <h1 className="auth-form-title">
          {type === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="auth-form-subtitle">
          {type === "login" ? "Don't have an account? " : "Already have an account? "}
          <Link
            href={type === "login" ? "/signup" : "/login"}
            className="auth-form-link"
          >
            {type === "login" ? "Sign up free" : "Sign in"}
          </Link>
        </p>
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={() => handleOAuth("google")}
        className="auth-oauth-btn"
      >
        <svg className="auth-oauth-icon" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="auth-divider">
        <span className="auth-divider-line" />
        <span className="auth-divider-text">or continue with email</span>
        <span className="auth-divider-line" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="auth-fields">
        {type === "signup" && (
          <div className="auth-name-row">
            <div className="auth-field-wrap">
              <label className="auth-label">First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="Jane"
                className="auth-input"
              />
            </div>
            <div className="auth-field-wrap">
              <label className="auth-label">Last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Smith"
                className="auth-input"
              />
            </div>
          </div>
        )}

        <div className="auth-field-wrap">
          <label className="auth-label">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="auth-input"
          />
        </div>

        <div className="auth-field-wrap">
          <div className="auth-label-row">
            <label className="auth-label">Password</label>
            {type === "login" && (
              <Link href="#" className="auth-forgot">Forgot password?</Link>
            )}
          </div>
          <div className="auth-input-wrap">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={type === "signup" ? "Min. 8 characters" : "Your password"}
              className="auth-input auth-input--password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="auth-eye-btn"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {type === "signup" && (
          <label className="auth-terms-row">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="auth-checkbox"
              required
            />
            <span className="auth-terms-text">
              I agree to the{" "}
              <Link href="#" className="auth-form-link">Terms &amp; Conditions</Link>
            </span>
          </label>
        )}

        {error && <p className="auth-error">{error}</p>}

        <button
          type="submit"
          disabled={loading || !isValid}
          className="auth-submit-btn"
        >
          {loading
            ? "Please wait…"
            : type === "login"
            ? "Sign in"
            : "Create account"}
          {!loading && <ArrowRight size={16} strokeWidth={2.5} />}
        </button>
      </form>
    </div>
  );
}
