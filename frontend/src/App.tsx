import React, { useState } from "react";
import { LandingPage } from "./components/LandingPage";
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
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { auth } from "./firebase"; // Adjust path if needed


export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState("activity");
  const [user, setUser] = useState(null as any);
  const [safeZone, setSafeZone] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync activeTab with route
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

  // Debug: log state on every render
  useEffect(() => {
    console.log('AppRoutes render: isAuthenticated:', isAuthenticated, 'user:', user);
  });

  // Redirect to dashboard only after login or from landing page
  useEffect(() => {
    if (isAuthenticated && (location.pathname === "/login" || location.pathname === "/")) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, location.pathname, navigate]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Firebase Auth State Changed:', user);
      if (user) {
        console.log('User detected after redirect:', user);
        setIsAuthenticated(true);
        setUser({
          id: user.uid,
          name: user.displayName,
          email: user.email,
          avatar: user.photoURL,
          // ...other fields
        });
      } else {
        console.log('No user detected after redirect.');
        setIsAuthenticated(false);
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    setShowLogin(true);
  };

  const handleGoogleLogin = (user:any) => {
    setIsAuthenticated(true);
    setShowLogin(false);
    setUser({
      id: user.uid,
      name: user.displayName,
      email: user.email,
      avatar: user.photoURL,
      isPremium: false,
      height: 175,
      weight: 85,
      age: 48,
      activityLevel: "light",
      medicalConditions: [],
      dailyCalorieTarget: 1800,
    });
  };

  const handleLogout = async () => {
    await auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
    navigate("/"); // Redirect to landing page
  };

  // Auth-protected route wrapper
  function PrivateRoute({ children }: { children: React.ReactNode }) {
    return isAuthenticated ? (
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
    ) : (
      <Navigate to="/login" replace />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<LandingPage onLogin={handleLogin} onSignUp={handleSignUp} />} />
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