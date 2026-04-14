"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const org = login(code);
    if (org) {
      router.push("/admin/dashboard");
    } else {
      setError("Invalid access code. Please check and try again.");
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#f8edd6", fontFamily: "var(--font-body)" }}>
      {/* Left panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-16 lg:px-24 max-w-xl">
        <Link href="/" className="inline-flex items-center gap-2 mb-16 hover:opacity-70 transition-opacity">
          <ArrowLeft className="w-4 h-4" style={{ color: "#3c58a7" }} strokeWidth={1.5} />
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", color: "#3c58a7" }}>
            Back to home
          </span>
        </Link>

        <div className="flex items-center gap-2.5 mb-12">
          <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: "#2d3895" }}>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "11px", color: "#fbeed4" }}>N</span>
          </div>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "17px", color: "#0c123b" }}>Navi</span>
        </div>

        <h1 style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "32px", letterSpacing: "-0.03em", color: "#0c123b", lineHeight: 1.15 }}>
          Sign in to your
          <br />
          dashboard
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "15px", color: "#3c58a7", marginTop: "12px", lineHeight: 1.6 }}>
          Enter the access code provided when you purchased your tokens.
        </p>

        <form onSubmit={handleSubmit} className="mt-10">
          <label
            htmlFor="access-code"
            style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", color: "#3c58a7", letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}
          >
            Access Code
          </label>
          <input
            id="access-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="NAVI-XXXX-XXXX"
            className="w-full px-4 py-3 rounded-lg outline-none transition-colors duration-150 focus:border-[#2d3895]"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "15px",
              color: "#0c123b",
              background: "#fbeed4",
              border: "1px solid #867bba",
              letterSpacing: "0.05em",
            }}
          />
          {error && (
            <div className="flex items-center gap-2 mt-3">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#2d3895" }} strokeWidth={1.5} />
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", color: "#2d3895" }}>
                {error}
              </span>
            </div>
          )}
          <button
            type="submit"
            className="w-full mt-6 py-3 rounded-lg transition-colors duration-150 hover:bg-[#3c58a7]"
            style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", color: "#fbeed4", background: "#2d3895" }}
          >
            Sign In
          </button>
        </form>

        <p className="mt-8" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", color: "#3c58a7" }}>
          Demo code: <span style={{ color: "#3c58a7", fontFamily: "monospace" }}>NAVI-DEMO-2026</span>
        </p>
      </div>

      {/* Right panel — decorative */}
      <div className="hidden lg:flex flex-1 items-center justify-center" style={{ background: "#f8edd6", borderLeft: "1px solid #f1e5ed" }}>
        <div className="text-center">
          <p style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "48px", letterSpacing: "-0.04em", color: "#f1e5ed", lineHeight: 1.1 }}>
            Pro check-ins,
            <br />
            effortless
            <br />
            for EOs.
          </p>
        </div>
      </div>
    </div>
  );
}

