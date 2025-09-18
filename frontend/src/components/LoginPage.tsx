import React, { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { Button } from "./ui/button";
import { Shield, Sparkles, CheckCircle2, Loader2 } from "lucide-react";

// NOTE: Functionality preserved exactly: same named export, same popup flow, same states
export function LoginPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const googleProvider = new GoogleAuthProvider();

  const handleGoogleLogin = async () => {
    try {
      setSubmitting(true);
      setError("");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("signInWithPopup result:", result);
      // No onLogin calls — App.tsx can listen to auth state
    } catch (err: any) {
      console.error(err);
      if (err?.code === "auth/popup-closed-by-user") {
        setError("Popup was closed before completing sign in.");
      } else if (err?.code === "auth/cancelled-popup-request") {
        setError("Another sign-in is already in progress. Try again.");
      } else if (err?.code === "auth/network-request-failed") {
        setError("Network error. Check your connection and try again.");
      } else {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-900">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
        <div className="mx-auto w-full max-w-md">
          <div className="relative rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
            {/* Logo / Title */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 text-white shadow-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-black">Kyool</h1>
                <p className="text-sm text-white/60">Personalized meals & fitness, simplified</p>
              </div>
            </div>

            {/* Heading */}
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-white">Sign in to Kyool</h2>
            <p className="mb-6 text-sm text-white/70">Continue with Google to sync your preferences across devices.</p>

            {/* Benefits */}
            <ul className="mb-6 space-y-2 text-sm text-black/80">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-black" /> Save recipes & meal plans</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Track workouts & progress</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Smart recommendations</li>
            </ul>

            {/* Google Button (unchanged flow) */}
            <div className="grid gap-3">
<Button
  onClick={handleGoogleLogin}
  disabled={submitting}
  className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500"
>
  {submitting ? (
    <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
  ) : (
    <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.9 16.6 19.1 14 24 14c3 0 5.7 1.1 7.8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.5 26.7 36 24 36c-5.3 0-10-3.3-11.8-8l-6.6 5.1C8.9 39.7 15.9 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.3 3.8-4.9 6.5-9.3 6.5-5.3 0-10-3.3-11.8-8l-6.6 5.1C8.9 39.7 15.9 44 24 44c8.1 0 15.3-5.3 17.9-12.5 0-1.2.1-2.3.1-3.5 0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  )}
  <span>{submitting ? "Signing in…" : "Sign in with Google"}</span>
</Button>

            </div>

            {/* Error message */}
            {error && (
              <div role="alert" aria-live="polite" className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 flex items-center justify-between text-xs text-white/60">
              <div className="space-x-3">
                <a href="#" className="underline-offset-2 hover:underline">Privacy</a>
                <a href="#" className="underline-offset-2 hover:underline">Terms</a>
              </div>
            </div>
          </div>

          <p className="mx-auto mt-4 max-w-md text-center text-xs text-white/50">
            By continuing, you agree to our Terms of Service and acknowledge our Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}