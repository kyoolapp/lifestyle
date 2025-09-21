//App.tsx
import React, { useEffect, useState } from "react";
import { getUserByEmail } from "./api/user_api";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

import { LandingPage } from "./components/LandingPage";
import SignUpPage from "./components/SignUpPage";
import { LoginPage } from "./components/LoginPage";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { HealthMetrics } from "./components/HealthMetrics";
import { WaterTracker } from "./components/WaterTracker";
import { RecipeSearch } from "./components/RecipeSearch";
import { Profile } from "./components/Profile";
import { FitnessTracker } from "./components/FitnessTracker";
import { DeviceConnections } from "./components/DeviceConnections";
import { FeaturesShowcase } from "./components/FeaturesShowcase";

import { auth } from "./firebase";

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAppUser, setIsAppUser] = useState(true); // true by default for non-auth
  const [activeTab, setActiveTab] = useState("activity");
  const [user, setUser] = useState<any>(null);
  const [safeZone, setSafeZone] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync active tab with route
  useEffect(() => {
    switch (location.pathname) {
      case "/dashboard":
        setActiveTab("activity");
        break;
      case "/features":
        setActiveTab("features");
        break;
      case "/health":
        setActiveTab("health");
        break;
      case "/water":
        setActiveTab("water");
        break;
      case "/recipes":
        setActiveTab("recipes");
        break;
      case "/fitness":
        setActiveTab("fitness");
        break;
      case "/devices":
        setActiveTab("devices");
        break;
      case "/profile":
        setActiveTab("profile");
        break;
      default:
        setActiveTab("");
    }
  }, [location.pathname]);

  // Log state each render (dev)
  useEffect(() => {
    //console.log("AppRoutes render: isAuthenticated:", isAuthenticated, "user:", user);
  });

  // After login and backend user check, go to dashboard if on /, /login, or /signup
  useEffect(() => {
    if (
      isAuthenticated &&
      isAppUser &&
      ["/", "/login", "/signup"].includes(location.pathname)
    ) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isAppUser, location.pathname, navigate]);

  // Firebase auth listener + backend user check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setIsAuthenticated(true);
        setUser({
          id: u.uid,
          name: u.displayName,
          email: u.email,
          avatar: u.photoURL,
        });
          // Check backend for user existence
          try {
            const res = await fetch(`http://127.0.0.1:8000/users/by-email/${encodeURIComponent(u.email ?? "")}`);
            if (res.ok) {
              const userData = await res.json();
              setIsAppUser(true);
              // Patch: preserve avatar/photoURL from Firebase user if backend user lacks it
              setUser({
                ...userData,
                avatar: userData.avatar || u.photoURL,
                photoURL: u.photoURL,
              });
            } else {
              setIsAppUser(false);
              setUser(null);
            }
          } catch (err) {
            setIsAppUser(false);
            setUser(null);
          }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setIsAppUser(true);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = () => navigate("/login");
  const handleSignUp = () => navigate("/signup");

  const handleLogout = async () => {
    await auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
    navigate("/"); // back to landing
  };

  // Protected wrapper
  function PrivateRoute({ children }: { children: React.ReactNode }) {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    if (!isAppUser) {
      // Block access if not in backend DB
      return <Navigate to="/signup" replace />;
    }
    return (
      <>
        <Header
          user={user}
          activeTab={activeTab}
          safeZone={safeZone}
          setSafeZone={setSafeZone}
        />
        <div className="flex h-screen pt-16">
          <Sidebar user={user} onLogout={handleLogout} />
          <main className="flex-1 overflow-auto">
            <div className="p-3 sm:p-4 lg:p-6 h-full">
              <div className="max-w-7xl mx-auto w-full">{children}</div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage onLogin={handleLogin} onSignUp={handleSignUp} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Private */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard user={user} />
            </PrivateRoute>
          }
        />
        <Route
          path="/features"
          element={
            <PrivateRoute>
              <FeaturesShowcase user={user} onFeatureSelect={setActiveTab} />
            </PrivateRoute>
          }
        />
        <Route
          path="/health"
          element={
            <PrivateRoute>
              <HealthMetrics user={user} setUser={setUser} />
            </PrivateRoute>
          }
        />
        <Route
          path="/water"
          element={
            <PrivateRoute>
              <WaterTracker />
            </PrivateRoute>
          }
        />
        <Route
          path="/recipes"
          element={
            <PrivateRoute>
              <RecipeSearch user={user} safeZone={safeZone} />
            </PrivateRoute>
          }
        />
        <Route
          path="/fitness"
          element={
            <PrivateRoute>
              <FitnessTracker />
            </PrivateRoute>
          }
        />
        <Route
          path="/devices"
          element={
            <PrivateRoute>
              <DeviceConnections />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile user={user} setUser={setUser} />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}
