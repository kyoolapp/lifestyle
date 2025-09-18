import React, { useState } from "react";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { Button } from './ui/button';

export function LoginPage() {

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const googleProvider = new GoogleAuthProvider();

  // Remove getRedirectResult for popup method

  const handleGoogleLogin = async () => {
    try {
      setSubmitting(true);
      setError("");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("signInWithPopup result:", result);
      // No need to call onLogin here; user will be handled in App.tsx after popup
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
      <div className="flex items-center gap-3">
              <Button onClick={handleGoogleLogin} disabled={submitting}>
                {submitting ? "Signing in..." : "Sign in with Google"}
              </Button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
