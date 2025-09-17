import React, { useState } from "react";
import { LandingPage } from "./components/LandingPage";
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
  const [activeTab, setActiveTab] = useState("activity");
  const [user, setUser] = useState({
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    isPremium: false,
    height: 175, // cm
    weight: 85, // kg - higher weight for higher BMI
    age: 48, // 48 years old as requested
    activityLevel: "light", // more realistic for 48 year old
    medicalConditions: [], // for future health tracking
    dailyCalorieTarget: 1800, // calculated based on age, weight, height for weight loss
  });

  const [safeZone, setSafeZone] = useState(false);

  const handleLogin = () => {
    // Mock login - in real app this would handle authentication
    setIsAuthenticated(true);
  };

  const handleSignUp = () => {
    // Mock signup - in real app this would handle registration
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab("activity");
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
        <LandingPage
          onLogin={handleLogin}
          onSignUp={handleSignUp}
        />
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