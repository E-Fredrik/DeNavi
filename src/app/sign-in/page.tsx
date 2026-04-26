"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <div className="min-h-screen pt-20 px-4 flex items-center justify-center bg-[#f8edd6] dark:bg-[#0b1022]">
      <div
        className="w-full max-w-sm rounded-xl p-8 bg-[#fbeed4] dark:bg-[#111a34]"
        style={{ border: "1px solid #867bba" }}
      >
        <h1
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: "24px",
            letterSpacing: "-0.02em",
            marginBottom: "8px",
          }}
          className="text-[#0c123b] dark:text-[#e8eeff]"
        >
          Sign In
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            fontSize: "14px",
            marginBottom: "24px",
          }}
          className="text-[#3c58a7] dark:text-[#b3c2ff]"
        >
          Welcome back. Enter your credentials to continue.
        </p>

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
          <div>
            <label
              htmlFor="email"
              className="block mb-1.5 text-[#3c58a7] dark:text-[#b3c2ff]"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "12px",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg outline-none transition-colors bg-[#f1e5ed] dark:bg-[#18203c] text-[#0c123b] dark:text-[#e8eeff]"
              style={{
                border: "1px solid #867bba",
                fontFamily: "var(--font-body)",
                fontSize: "14px",
              }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-1.5 text-[#3c58a7] dark:text-[#b3c2ff]"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "12px",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg outline-none transition-colors bg-[#f1e5ed] dark:bg-[#18203c] text-[#0c123b] dark:text-[#e8eeff]"
              style={{
                border: "1px solid #867bba",
                fontFamily: "var(--font-body)",
                fontSize: "14px",
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg hover:bg-[#3c58a7] transition-colors disabled:opacity-50"
            style={{
              background: "#2d3895",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "14px",
              color: "#fbeed4",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

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
    </div>
  );
}
