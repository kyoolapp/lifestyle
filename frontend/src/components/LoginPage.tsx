import React, { useState } from "react";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export function LoginPage({ onLogin }: { onLogin: (user: any) => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const googleProvider = new GoogleAuthProvider();

  const handleGoogleLogin = async () => {
    try {
      setSubmitting(true);
      setError("");
      const result = await signInWithPopup(auth, googleProvider);
      onLogin(result.user);
    } catch (err) {
      console.error(err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2>Sign in to Kyool</h2>
      <button onClick={handleGoogleLogin} disabled={submitting}>
        {submitting ? "Signing in..." : "Sign in with Google"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
