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


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState("activity");
  const [user, setUser] = useState(null as any);
  const [safeZone, setSafeZone] = useState(false);

  const handleLogin = () => {
    setShowLogin(true);
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

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab("activity");
    setUser(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "activity":
        return <Dashboard user={user} />;
      case "features":
        return (
          <FeaturesShowcase
            user={user}
            onFeatureSelect={setActiveTab}
          />
        );
      case "health":
        return <HealthMetrics user={user} setUser={setUser} />;
      case "water":
        return <WaterTracker />;
      case "recipes":
        return <RecipeSearch user={user} safeZone={safeZone} />;
      case "fitness":
        return <FitnessTracker />;
      case "devices":
        return <DeviceConnections />;
      case "profile":
        return <Profile user={user} setUser={setUser} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Show landing page for non-authenticated users */}
      {!isAuthenticated ? (
        showLogin ? (
          <LoginPage onLogin={handleGoogleLogin} />
        ) : (
          <LandingPage
            onLogin={handleLogin}
            onSignUp={handleSignUp}
          />
        )
      ) : (
        <>
          {/* Show header only after authentication */}
          <Header
            user={user}
            activeTab={activeTab}
            safeZone={safeZone}
            setSafeZone={setSafeZone}
          />
          <div className="flex h-screen pt-16">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              user={user}
              onLogout={handleLogout}
            />
            <main className="flex-1 overflow-auto">
              <div className="p-3 sm:p-4 lg:p-6 h-full">
                <div className="max-w-7xl mx-auto w-full">
                  {renderContent()}
                </div>
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
}