import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { createOrUpdateUser } from "../api/user_api";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { calculateBMI, calculateBMR, calculateTDEE } from "../utils/health";
import { Checkbox } from "./ui/checkbox";
import { isUsernameAvailable } from "../api/user_api";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Shield, ArrowRight, CheckCircle2, LogIn } from "lucide-react";
const BASE_URL= import.meta.env.VITE_API_URL; 
type FitnessGoal =
  | "lose_weight"
  | "build_muscle"
  | "get_fitter"
  | "eat_better"
  | "stay_healthy";
type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "very_active"
  | "athlete";

export default function SignUpPage() {
  // Username format validation (same as backend)
  function validateUsernameFormat(username: string) {
    return /^[a-zA-Z0-9_.]{6,20}$/.test(username);
  }
  console.log("SignUpPage mounted/re-rendered");
  const navigate = useNavigate();
  const [googleUser, setGoogleUser] = useState<null | {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  }>(null);

  const [name, setName] = useState("");
  const [gender, setGender] = useState<string>("");
  const [goal, setGoal] = useState<FitnessGoal | "">("");
  const [accepted, setAccepted] = useState(false);

  // NEW fields
  const [age, setAge] = useState<string>(""); // years
  const [height, setHeight] = useState<string>(""); // cm
  const [weight, setWeight] = useState<string>(""); // kg
  const [activity, setActivity] = useState<ActivityLevel | "">("");
  const [username, setUsername] = useState<string>("");
  const [bmr, setBmr] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);
  const signupCompleted = useRef(false);
  const signupStarted = useRef(false);

  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameError, setUsernameError] = useState("");


  useEffect(() => {
    return () => {
      // Only sign out if signup was started but NOT completed
      if (signupStarted.current && !signupCompleted.current) {
        console.log("Signing out incomplete signup user", signupCompleted, signupStarted);
        auth.signOut();
      }
    };
  }, []);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u) {
        const gu = {
          uid: u.uid,
          displayName: u.displayName,
          email: u.email,
          photoURL: u.photoURL,
        };
        setGoogleUser(gu);
        setName(u.displayName ?? "");
      }
    });
    return () => unsub();
  }, []);



  useEffect(() => {
  if (!username) {
    setUsernameAvailable(true);
    setUsernameError("");
    return;
  }
  if (!validateUsernameFormat(username)) {
    setUsernameAvailable(false);
    setUsernameError("Username must be 6-20 characters, only letters, numbers, _ and . allowed.");
    return;
  }
  setUsernameChecking(true);
  isUsernameAvailable(username)
    .then((available) => {
      setUsernameAvailable(available);
      setUsernameError(available ? "" : "Username is already taken");
    })
    .catch(() => {
      setUsernameAvailable(false);
      setUsernameError("Error checking username");
    })
    .finally(() => setUsernameChecking(false));
}, [username]);


  const handleGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    signupStarted.current = true;
    const u = result.user;
    const gu = {
      uid: u.uid,
      displayName: u.displayName,
      email: u.email,
      photoURL: u.photoURL,
    };
    setGoogleUser(gu);
    setName(u.displayName ?? "");
  };

  const canSubmit = useMemo(() => {
    return !!googleUser && name.trim().length > 0 && accepted && !!goal;
  }, [googleUser, name, accepted, goal]);

  const handleSubmit = async (e: React.FormEvent) => {
  //console.log("handleSubmit called");
  // ...existing code...
  //console.log("Before backend createOrUpdateUser");
  e.preventDefault();
  if (!canSubmit || !usernameAvailable) {
  setUsernameError('Username is already taken');
  return;
}
  signupStarted.current = true;
  setSubmitting(true);
  try {
    const ageNum =
      age.trim() === "" ? null : Math.max(0, Math.min(120, Number(age)));
    const heightNum =
      height.trim() === ""
        ? null
        : Math.max(50, Math.min(250, Number(height)));
    const weightNum =
      weight.trim() === ""
        ? null
        : Math.max(20, Math.min(400, Number(weight)));

    const bmr = calculateBMR(weightNum ?? 0, heightNum ?? 0, ageNum ?? 0, gender);
    

    // Generate username from email or name
    //const username = googleUser?.email?.split("@")[0] || name.replace(/\s+/g, "_").toLowerCase();
    const userData = {
      username,
      bmi: calculateBMI(weightNum ?? 0, heightNum ?? 0),
      bmr,
      tdee: calculateTDEE(bmr ?? 0, activity),
      activity_level: activity || null,
      name,
      email: googleUser?.email,
      gender: gender || null,
      height: Number.isFinite(heightNum as number) ? heightNum : null,
      weight: Number.isFinite(weightNum as number) ? weightNum : null,
      age: Number.isFinite(ageNum as number) ? ageNum : null,
      
      date_joined: new Date().toISOString(),
      

      // Optionally add phone_number, food_preferences, allergies, bmi, bmr, maintenance_calories if you collect them
    };

    //console.log("User data to submit:", userData);

    // Call backend to create user in Firestore
  await createOrUpdateUser(googleUser?.uid, userData);
  //console.log("After backend createOrUpdateUser");

    localStorage.setItem("kyool_profile", JSON.stringify(userData));

    // Poll backend for user existence before navigating
    const pollUserExists = async () => {
      const maxAttempts = 10;
      const delay = 300;
      for (let i = 0; i < maxAttempts; i++) {
        try {
          const res = await fetch(`${BASE_URL}/users/by-email/${encodeURIComponent(googleUser?.email ?? "")}`);
          if (res.ok) {
            return true;
          }
        } catch (err) {}
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      return false;
    };

    const exists = await pollUserExists();
    console.log("Poll user exists result:", exists);
    if (exists) {
      setCreated(true);
    } else {
      alert("Account created, but could not verify user in backend. Please try logging in.");
    }
  } finally {
    setSubmitting(false);
  }
};
  useEffect(() => {
    if (created) {
      console.log("useEffect: navigating to dashboard");
      signupCompleted.current = true;
      navigate("/dashboard");
    }
  }, [created, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-2xl shadow-xl border-slate-200/60">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl md:text-3xl font-bold">
              Create your Kyool account
            </CardTitle>
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
              <Shield className="w-4 h-4" />
              <span>Secure & Private</span>
            </div>
          </div>
          <p className="text-slate-500 mt-2">
            Sign in with Google, confirm a few details, and you’re in.
          </p>
        </CardHeader>

        <CardContent className="pt-4">
          {/* Google Sign In */}
          {!googleUser ? (
            <div className="mb-6">
              {/*<Button
                type="button"
                onClick={handleGoogle}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Continue with Google
              </Button>*/}
            </div>
          ) : (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={googleUser.photoURL ?? ""}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover border"
                  onError={(e: any) => {
                    e.currentTarget.src =
                      "https://ui-avatars.com/api/?background=E2E8F0&color=334155&name=" +
                      encodeURIComponent(googleUser.displayName ?? "User");
                  }}
                />
                <div>
                  <div className="font-medium">
                    {googleUser.displayName ?? "New User"}
                  </div>
                  <div className="text-sm text-slate-500">
                    {googleUser.email}
                  </div>
                </div>
              </div>
              <div className="text-green-600 flex items-center gap-1 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Google connected
              </div>
            </div>
          )}

          {/* The Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!googleUser}
              />
              
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Choose a unique username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!googleUser}
                autoComplete="off"
              />
              {usernameChecking && <span style={{ color: 'gray' }}>Checking...</span>}
              {!usernameAvailable && (
                <React.Fragment>
                  <span style={{ color: 'red' }}>{usernameError}</span>
                </React.Fragment>
              )}
            </div>

            {/* Gender + Goal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div >
                <Label>Gender (optional)</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select or skip" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="nonbinary">Non-binary</SelectItem>
                    <SelectItem value="prefer_not_to_say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Fitness goal</Label>
                <Select
                  value={goal}
                  onValueChange={(v: string) => setGoal(v as FitnessGoal)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose_weight">Lose weight</SelectItem>
                    <SelectItem value="build_muscle">Build muscle</SelectItem>
                    <SelectItem value="get_fitter">Improve fitness</SelectItem>
                    <SelectItem value="eat_better">Eat better</SelectItem>
                    <SelectItem value="stay_healthy">Stay healthy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Age + Height + Weight */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="age">Age (years)</Label>
                <Input
                  id="age"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={120}
                  placeholder="e.g., 48"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  disabled={!googleUser}
                />
              </div>
              <div>
                <Label htmlFor="height">Height (cm, optional)</Label>
                <Input
                  id="height"
                  type="number"
                  inputMode="numeric"
                  min={50}
                  max={250}
                  placeholder="e.g., 175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  disabled={!googleUser}
                />
              </div>
              <div>
                <Label htmlFor="weight">Current Weight (kg, optional)</Label>
                <Input
                  id="weight"
                  type="number"
                  inputMode="numeric"
                  min={20}
                  max={400}
                  placeholder="e.g., 85"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  disabled={!googleUser}
                />
              </div>
            </div>

            {/* Activity */}
            <div>
              <Label>Activity level (optional)</Label>
              <Select
                value={activity}
                onValueChange={(v: string) => setActivity(v as ActivityLevel)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose your typical activity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">
                    Sedentary (little/no exercise)
                  </SelectItem>
                  <SelectItem value="light">Light (1–3 days/week)</SelectItem>
                  <SelectItem value="moderate">
                    Moderate (3–5 days/week)
                  </SelectItem>
                  <SelectItem value="very_active">
                    Very Active (6–7 days/week)
                  </SelectItem>
                  <SelectItem value="athlete">
                    Athlete (intense/2x days)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={accepted}
                onCheckedChange={(v: any) => setAccepted(Boolean(v))}
              />
              <Label htmlFor="terms" className="text-slate-600">
                I agree to the{" "}
                <a href="/terms" className="underline underline-offset-2">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="underline underline-offset-2">
                  Privacy Policy
                </a>
                .
              </Label>
            </div>

            <Button
              type="submit"
              disabled={!canSubmit || submitting}
              className="w-full text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Start My Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            {created && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Account created! Redirecting to your dashboard…</span>
              </div>
            )}
          </form>

          {/* Helper link */}
          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <button
              className="underline underline-offset-4"
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
