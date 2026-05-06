"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { motion, AnimatePresence } from "motion/react";
import { Mail, KeyRound, ArrowRight, AlertCircle } from "lucide-react";

type LoginMode = "email" | "access-code";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await signIn.email(
      { email, password },
      {
        onSuccess: () => {
          router.push("/admin/dashboard");
        },
        onError: (ctx) => {
          setError(ctx.error.message ?? "Invalid email or password");
          setLoading(false);
        },
      }
    );
  };

  const handleAccessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/access-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode: accessCode.trim().toUpperCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid access code");
        setLoading(false);
        return;
      }

      // Session cookie is set by the API — redirect to dashboard
      router.push("/admin/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // Shared styles
  const inputClass =
    "w-full px-3.5 py-2.5 rounded-lg outline-none transition-all duration-200 bg-[#f1e5ed] dark:bg-[#18203c] text-[#0c123b] dark:text-[#e8eeff] focus:ring-2 focus:ring-[#2d3895]/40";
  const inputStyle = {
    border: "1px solid #867bba",
    fontFamily: "var(--font-body)",
    fontSize: "14px",
  };
  const labelClass = "block mb-1.5 text-[#3c58a7] dark:text-[#b3c2ff]";
  const labelStyle = {
    fontFamily: "var(--font-body)",
    fontWeight: 500 as const,
    fontSize: "12px",
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
  };

  return (
    <div className="min-h-screen pt-20 px-4 flex items-center justify-center bg-[#f8edd6] dark:bg-[#0b1022]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div
          className="rounded-2xl p-8 bg-[#fbeed4] dark:bg-[#111a34]"
          style={{ border: "1px solid #867bba" }}
        >
          <h1
            className="text-[#0c123b] dark:text-[#e8eeff]"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "24px",
              letterSpacing: "-0.02em",
              marginBottom: "8px",
            }}
          >
            Sign In
          </h1>
          <p
            className="text-[#3c58a7] dark:text-[#b3c2ff]"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: "14px",
              marginBottom: "20px",
            }}
          >
            Welcome back. Choose your login method.
          </p>

          {/* Mode Toggle */}
          <div
            className="flex mb-6 p-1 rounded-xl bg-[#f1e5ed] dark:bg-[#18203c]"
            style={{ border: "1px solid rgba(134,123,186,0.3)" }}
          >
            <button
              onClick={() => { setMode("email"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-200 ${
                mode === "email"
                  ? "bg-[#fbeed4] dark:bg-[#111a34] shadow-sm"
                  : "hover:bg-[#fbeed4]/50 dark:hover:bg-[#111a34]/50"
              }`}
              style={{
                border: mode === "email" ? "1px solid #867bba" : "1px solid transparent",
                fontFamily: "var(--font-body)",
                fontWeight: mode === "email" ? 500 : 400,
                fontSize: "13px",
              }}
              id="mode-email"
            >
              <Mail className={`w-4 h-4 ${mode === "email" ? "text-[#2d3895] dark:text-[#8ea2ff]" : "text-[#867bba]"}`} strokeWidth={1.5} />
              <span className={mode === "email" ? "text-[#0c123b] dark:text-[#e8eeff]" : "text-[#867bba]"}>
                Email
              </span>
            </button>
            <button
              onClick={() => { setMode("access-code"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-200 ${
                mode === "access-code"
                  ? "bg-[#fbeed4] dark:bg-[#111a34] shadow-sm"
                  : "hover:bg-[#fbeed4]/50 dark:hover:bg-[#111a34]/50"
              }`}
              style={{
                border: mode === "access-code" ? "1px solid #867bba" : "1px solid transparent",
                fontFamily: "var(--font-body)",
                fontWeight: mode === "access-code" ? 500 : 400,
                fontSize: "13px",
              }}
              id="mode-access-code"
            >
              <KeyRound className={`w-4 h-4 ${mode === "access-code" ? "text-[#2d3895] dark:text-[#8ea2ff]" : "text-[#867bba]"}`} strokeWidth={1.5} />
              <span className={mode === "access-code" ? "text-[#0c123b] dark:text-[#e8eeff]" : "text-[#867bba]"}>
                Access Code
              </span>
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 px-3 py-2.5 rounded-lg text-sm flex items-start gap-2"
                style={{
                  background: "rgba(220,60,60,0.08)",
                  border: "1px solid rgba(220,60,60,0.2)",
                  fontFamily: "var(--font-body)",
                  overflow: "hidden",
                }}
              >
                <AlertCircle className="w-4 h-4 text-[#d33] shrink-0 mt-0.5" strokeWidth={1.5} />
                <span style={{ color: "#d33" }}>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Content */}
          <AnimatePresence mode="wait">
            {mode === "email" ? (
              <motion.form
                key="email-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleEmailSubmit}
                className="flex flex-col gap-4"
              >
                <div>
                  <label htmlFor="email" className={labelClass} style={labelStyle}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputClass}
                    style={inputStyle}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className={labelClass} style={labelStyle}>
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={inputClass}
                    style={inputStyle}
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 hover:brightness-110 active:scale-[0.98]"
                  style={{
                    background: "#2d3895",
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                    fontSize: "14px",
                    color: "#fbeed4",
                  }}
                  id="submit-email-signin"
                >
                  {loading ? "Signing in..." : "Sign In"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="access-code-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleAccessCodeSubmit}
                className="flex flex-col gap-4"
              >
                <div>
                  <label htmlFor="accessCode" className={labelClass} style={labelStyle}>
                    Access Code
                  </label>
                  <input
                    id="accessCode"
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    required
                    className={`${inputClass} tracking-widest text-center`}
                    style={{
                      ...inputStyle,
                      fontSize: "18px",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                    }}
                    placeholder="NAV-XXXXXX"
                    maxLength={10}
                  />
                  <p
                    className="mt-2 text-[#867bba]"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "12px",
                    }}
                  >
                    Enter the code you received when you created your organizer account.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 hover:brightness-110 active:scale-[0.98]"
                  style={{
                    background: "#2d3895",
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                    fontSize: "14px",
                    color: "#fbeed4",
                  }}
                  id="submit-access-code-signin"
                >
                  {loading ? "Verifying..." : "Log In with Access Code"}
                  {!loading && <KeyRound className="w-4 h-4" />}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <p
            className="mt-6 text-center text-[#3c58a7] dark:text-[#b3c2ff]"
            style={{ fontFamily: "var(--font-body)", fontSize: "13px" }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="underline hover:opacity-80 text-[#2d3895] dark:text-[#8ea2ff]"
              style={{ fontWeight: 500 }}
            >
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
