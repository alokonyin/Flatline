"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-flatline-deeper flex items-center justify-center px-4 relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-900/20 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 text-center max-w-sm">
          <div className="text-5xl mb-6">📬</div>
          <h2 className="text-xl font-bold mb-2 text-white">Check your email</h2>
          <p className="text-flatline-muted text-sm leading-relaxed">
            We sent a confirmation link to{" "}
            <strong className="text-white">{email}</strong>.
            Click it to activate your account then{" "}
            <Link href="/login" className="text-flatline-red hover:underline">sign in</Link>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-flatline-deeper flex items-center justify-center px-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-flatline-red/6 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <span className="font-bold text-2xl tracking-tight">
              <span className="gradient-text-red">⚡</span>
              <span className="text-white ml-1">Flatline</span>
            </span>
          </Link>
          <p className="text-flatline-muted text-sm mt-2">Start monitoring for free</p>
        </div>

        <div className="border-glow bg-flatline-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-flatline-muted block mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-flatline-dark border border-flatline-border rounded-xl px-4 py-3 text-white placeholder-flatline-muted/60 focus:outline-none focus:border-flatline-red/60 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-flatline-muted block mb-2">Password</label>
              <input
                type="password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-flatline-dark border border-flatline-border rounded-xl px-4 py-3 text-white placeholder-flatline-muted/60 focus:outline-none focus:border-flatline-red/60 transition-colors text-sm"
              />
            </div>

            {error && (
              <p className="text-flatline-red text-xs bg-flatline-red/10 border border-flatline-red/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-flatline-red hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all hover:shadow-glow-red text-sm mt-2"
            >
              {loading ? "Creating account..." : "Create free account"}
            </button>
          </form>
        </div>

        <p className="text-center text-flatline-muted text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-white hover:text-flatline-red transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
