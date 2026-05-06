"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { motion, AnimatePresence } from "motion/react";
import { User, Building2, Sparkles, Copy, Check, ArrowRight, Shield } from "lucide-react";

type AccountType = "INDIVIDUAL" | "ORGANIZER";
type Step = "choose" | "form" | "success";

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("choose");
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);

  const handleChoose = (type: AccountType) => {
    setAccountType(type);
    setStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fullName = `${firstName} ${lastName}`.trim();

    await signUp.email(
      {
        name: fullName,
        email,
        password,
        accountType: accountType!,
        organizerName: accountType === "ORGANIZER" ? organizerName : undefined,
      } as Parameters<typeof signUp.email>[0],
      {
        onSuccess: async (ctx) => {
          if (accountType === "ORGANIZER") {
            // Fetch the created user to get the access code
            try {
              const res = await fetch("/api/auth/me");
              if (res.ok) {
                const data = await res.json();
                setAccessCode(data.accessCode || "");
              }
            } catch {
              // Fallback: just move to success without code display
            }
            setStep("success");
            setLoading(false);
          } else {
            router.push("/admin/dashboard");
          }
        },
        onError: (ctx) => {
          setError(ctx.error.message ?? "Something went wrong");
          setLoading(false);
        },
      }
    );
  };

  const copyCode = () => {
    navigator.clipboard.writeText(accessCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  // Shared input styles
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
      <AnimatePresence mode="wait">
        {/* ─── STEP 1: Choose Account Type ─── */}
        {step === "choose" && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <h1
                  className="text-[#0c123b] dark:text-[#e8eeff]"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    fontSize: "28px",
                    letterSpacing: "-0.03em",
                  }}
                >
                  Join Navi
                </h1>
                <p
                  className="mt-2 text-[#3c58a7] dark:text-[#b3c2ff]"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 400,
                    fontSize: "14px",
                  }}
                >
                  Choose how you want to use Navi
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Individual Card */}
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleChoose("INDIVIDUAL")}
                className="group relative p-6 rounded-2xl text-left transition-all duration-300 bg-[#fbeed4] dark:bg-[#111a34] hover:bg-[#f1e5ed] dark:hover:bg-[#18203c] cursor-pointer"
                style={{ border: "1px solid #867bba" }}
                id="account-type-individual"
              >
                <div className="mb-4 w-11 h-11 rounded-xl flex items-center justify-center bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba]/40 group-hover:border-[#2d3895]/60 transition-colors">
                  <User className="w-5 h-5 text-[#3c58a7] dark:text-[#b3c2ff] group-hover:text-[#2d3895] dark:group-hover:text-[#8ea2ff] transition-colors" strokeWidth={1.5} />
                </div>
                <h3
                  className="text-[#0c123b] dark:text-[#e8eeff] mb-1"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    fontSize: "16px",
                  }}
                >
                  Individual
                </h3>
                <p
                  className="text-[#3c58a7] dark:text-[#b3c2ff]"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 400,
                    fontSize: "13px",
                    lineHeight: "1.5",
                  }}
                >
                  Attend events, check in, and view your invitations.
                </p>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-[#2d3895] dark:text-[#8ea2ff]" />
                </div>
              </motion.button>

              {/* Organizer Card */}
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleChoose("ORGANIZER")}
                className="group relative p-6 rounded-2xl text-left transition-all duration-300 bg-[#fbeed4] dark:bg-[#111a34] hover:bg-[#f1e5ed] dark:hover:bg-[#18203c] cursor-pointer"
                style={{ border: "1px solid #2d3895" }}
                id="account-type-organizer"
              >
                <div className="absolute -top-2.5 right-4">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[#fbeed4] dark:text-[#e8eeff]"
                    style={{
                      background: "#2d3895",
                      fontFamily: "var(--font-body)",
                      fontWeight: 500,
                      fontSize: "10px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    <Sparkles className="w-3 h-3" /> PRO
                  </span>
                </div>
                <div className="mb-4 w-11 h-11 rounded-xl flex items-center justify-center bg-[#2d3895]/10 dark:bg-[#2d3895]/20 border border-[#2d3895]/30 group-hover:border-[#2d3895]/60 transition-colors">
                  <Building2 className="w-5 h-5 text-[#2d3895] dark:text-[#8ea2ff] group-hover:text-[#2d3895] transition-colors" strokeWidth={1.5} />
                </div>
                <h3
                  className="text-[#0c123b] dark:text-[#e8eeff] mb-1"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    fontSize: "16px",
                  }}
                >
                  Event Organizer
                </h3>
                <p
                  className="text-[#3c58a7] dark:text-[#b3c2ff]"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 400,
                    fontSize: "13px",
                    lineHeight: "1.5",
                  }}
                >
                  Create events, manage guests, and run check-ins.
                </p>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-[#2d3895] dark:text-[#8ea2ff]" />
                </div>
              </motion.button>
            </div>

            <p
              className="mt-8 text-center text-[#3c58a7] dark:text-[#b3c2ff]"
              style={{ fontFamily: "var(--font-body)", fontSize: "13px" }}
            >
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="underline hover:opacity-80 text-[#2d3895] dark:text-[#8ea2ff]"
                style={{ fontWeight: 500 }}
              >
                Sign In
              </Link>
            </p>
          </motion.div>
        )}

        {/* ─── STEP 2: Registration Form ─── */}
        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm rounded-2xl p-8 bg-[#fbeed4] dark:bg-[#111a34]"
            style={{ border: "1px solid #867bba" }}
          >
            {/* Back button + title */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => { setStep("choose"); setError(""); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba]/40 hover:border-[#2d3895]/60 transition-colors"
                id="back-to-choose"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#3c58a7] dark:text-[#b3c2ff]">
                  <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div>
                <h1
                  className="text-[#0c123b] dark:text-[#e8eeff]"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    fontSize: "22px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {accountType === "ORGANIZER" ? "Organizer Account" : "Create Account"}
                </h1>
                <p
                  className="text-[#3c58a7] dark:text-[#b3c2ff]"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 400,
                    fontSize: "13px",
                  }}
                >
                  {accountType === "ORGANIZER"
                    ? "Set up your organizer profile"
                    : "Enter your details to get started"}
                </p>
              </div>
            </div>

            {/* Account type indicator pill */}
            <div className="mb-5 flex">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  background: accountType === "ORGANIZER" ? "rgba(45,56,149,0.12)" : "rgba(134,123,186,0.12)",
                  border: `1px solid ${accountType === "ORGANIZER" ? "rgba(45,56,149,0.3)" : "rgba(134,123,186,0.3)"}`,
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: "11px",
                  letterSpacing: "0.03em",
                }}
              >
                {accountType === "ORGANIZER" ? (
                  <Building2 className="w-3.5 h-3.5 text-[#2d3895] dark:text-[#8ea2ff]" strokeWidth={1.5} />
                ) : (
                  <User className="w-3.5 h-3.5 text-[#867bba]" strokeWidth={1.5} />
                )}
                <span className={accountType === "ORGANIZER" ? "text-[#2d3895] dark:text-[#8ea2ff]" : "text-[#867bba]"}>
                  {accountType === "ORGANIZER" ? "Event Organizer" : "Individual"}
                </span>
              </span>
            </div>

            {error && (
              <div
                className="mb-4 px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "rgba(220,60,60,0.1)",
                  border: "1px solid rgba(220,60,60,0.3)",
                  color: "#d33",
                  fontFamily: "var(--font-body)",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name fields: side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className={labelClass} style={labelStyle}>
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className={inputClass}
                    style={inputStyle}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className={labelClass} style={labelStyle}>
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className={inputClass}
                    style={inputStyle}
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Organizer Name (conditionally shown) */}
              <AnimatePresence>
                {accountType === "ORGANIZER" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: "hidden" }}
                  >
                    <label htmlFor="organizerName" className={labelClass} style={labelStyle}>
                      Organizer / Company Name
                    </label>
                    <input
                      id="organizerName"
                      type="text"
                      value={organizerName}
                      onChange={(e) => setOrganizerName(e.target.value)}
                      required={accountType === "ORGANIZER"}
                      className={inputClass}
                      style={inputStyle}
                      placeholder="e.g. Acme Events Co."
                    />
                  </motion.div>
                )}
              </AnimatePresence>

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
                  minLength={8}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Min 8 characters"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 hover:brightness-110 active:scale-[0.98]"
                style={{
                  background: "#2d3895",
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: "14px",
                  color: "#fbeed4",
                }}
                id="submit-signup"
              >
                {loading
                  ? "Creating account..."
                  : accountType === "ORGANIZER"
                    ? "Create Organizer Account"
                    : "Create Account"}
              </button>
            </form>

            <p
              className="mt-6 text-center text-[#3c58a7] dark:text-[#b3c2ff]"
              style={{ fontFamily: "var(--font-body)", fontSize: "13px" }}
            >
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="underline hover:opacity-80 text-[#2d3895] dark:text-[#8ea2ff]"
                style={{ fontWeight: 500 }}
              >
                Sign In
              </Link>
            </p>
          </motion.div>
        )}

        {/* ─── STEP 3: Success (Organizer access code reveal) ─── */}
        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md text-center"
          >
            <div
              className="rounded-2xl p-8 sm:p-10 bg-[#fbeed4] dark:bg-[#111a34] relative overflow-hidden"
              style={{ border: "1px solid #2d3895" }}
            >
              {/* Decorative gradient orb */}
              <div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl pointer-events-none"
                style={{ background: "radial-gradient(circle, #2d3895 0%, transparent 70%)" }}
              />

              {/* Success icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring", bounce: 0.4 }}
                className="mx-auto mb-6 w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #2d3895, #3c58a7)",
                  boxShadow: "0 8px 32px rgba(45,56,149,0.3)",
                }}
              >
                <Shield className="w-8 h-8 text-white" strokeWidth={1.5} />
              </motion.div>

              <h1
                className="text-[#0c123b] dark:text-[#e8eeff] mb-2"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "24px",
                  letterSpacing: "-0.02em",
                }}
              >
                Welcome to Navi!
              </h1>
              <p
                className="text-[#3c58a7] dark:text-[#b3c2ff] mb-8"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "1.6",
                }}
              >
                Your organizer account is ready. Save your Access Code below — you can use it for quick logins without a password.
              </p>

              {/* Access Code Display */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="relative mx-auto max-w-xs"
              >
                <div
                  className="rounded-xl p-5 mb-3"
                  style={{
                    background: "rgba(45,56,149,0.06)",
                    border: "1px dashed rgba(45,56,149,0.3)",
                  }}
                >
                  <p
                    className="text-[#3c58a7] dark:text-[#b3c2ff] mb-2"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 500,
                      fontSize: "11px",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Your Access Code
                  </p>
                  <p
                    className="text-[#0c123b] dark:text-[#e8eeff]"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 700,
                      fontSize: "28px",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {accessCode || "—"}
                  </p>
                </div>

                <button
                  onClick={copyCode}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                  style={{
                    background: codeCopied ? "#1a7a3a" : "#2d3895",
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                    fontSize: "13px",
                    color: "#fbeed4",
                  }}
                  id="copy-access-code"
                >
                  {codeCopied ? (
                    <>
                      <Check className="w-4 h-4" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy Access Code
                    </>
                  )}
                </button>
              </motion.div>

              {/* Warning */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-5 text-[#867bba] dark:text-[#867bba]"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  fontSize: "12px",
                  lineHeight: "1.5",
                }}
              >
                ⚠️ Store this code somewhere safe. It&apos;s your quick login key.
              </motion.p>

              {/* CTA to Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-8"
              >
                <button
                  onClick={() => router.push("/admin/dashboard")}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-200 hover:bg-[#f1e5ed] dark:hover:bg-[#18203c]"
                  style={{
                    border: "1px solid #867bba",
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                  id="go-to-dashboard"
                >
                  <span className="text-[#0c123b] dark:text-[#e8eeff]">Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-[#3c58a7] dark:text-[#b3c2ff]" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
