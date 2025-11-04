// App.tsx
import React, { useEffect, useState } from "react";
import { getUserByEmail } from "./api/user_api";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Link, // <-- from old App.tsx
} from "react-router-dom";

// PUBLIC landing (from old App.tsx needs these)
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { WaitlistDialog } from "./components/WaitlistDialog";
import { AnimatedStatsSection } from "./components/AnimatedStatsSection";
import { FeatureCard } from "./components/FeatureCard";
import {
  Target,
  Clock,
  TrendingUp,
  Users,
  ChevronRight,
  Sparkles,
  Shield,
  Star,
  CheckCircle,
} from "lucide-react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { Toaster } from "./components/ui/sonner";

// Auth + main pages
// (Kept your existing pages; we’ll use LoginPage/SignUpPage and your real Dashboard)
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
import { UserProfile } from "./components/UserProfile";
import { Explore } from "./components/Explore";
import { GoalSetting } from "./components/GoalSetting";
import ViewAllFriends from "./components/ViewAllFriends";
import UserSearch from "./components/UserSearch";

import { auth } from "./firebase";


const BASE_URL= import.meta.env.VITE_API_URL;

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
  const [waitlistOpen, setWaitlistOpen] = useState(false); // needed by Home
  const navigate = useNavigate();
  const location = useLocation();

  // ===== Home (Landing) from old App.tsx =====
  const features = [
    {
      icon: Target,
      title: "Executive-Focused",
      description: "Designed specifically for busy leaders and decision-makers",
      benefit: "Tailored to C-suite demands and executive lifestyles",
      colorScheme: "blue",
    },
    {
      icon: Clock,
      title: "Time-Efficient",
      description: "Solutions that work around your schedule, not against it",
      benefit: "5-minute routines that deliver noticeable results",
      colorScheme: "green",
    },
    {
      icon: TrendingUp,
      title: "Performance-Driven",
      description: "Boost your energy, focus, and leadership impact",
      benefit: "Measurable improvements in decision-making and productivity",
      colorScheme: "purple",
    },
    {
      icon: Users,
      title: "Specialized Support",
      description: "Practical insights shaped by real executive challenges",
      benefit: "Access to early executive community insights & resources",
      colorScheme: "orange",
    },
  ];

  const stats = [
    {
      icon: "⚖️",
      number: "78%",
      label: "of executives struggle with work-life balance",
      backgroundColor: "bg-red-50 dark:bg-red-950/20",
    },
    {
      icon: "⚡",
      number: "65%",
      label: "face chronic stress and burnout daily",
      backgroundColor: "bg-orange-50 dark:bg-orange-950/20",
    },
    {
      icon: "🍽️",
      number: "52%",
      label: "regularly skip meals due to meetings",
      backgroundColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      icon: "⏳",
      number: "43%",
      label: "average less than 6 hours of sleep",
      backgroundColor: "bg-purple-50 dark:bg-purple-950/20",
    },
  ];

  const Home = () => (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1551890299-1bc7ea6f0054?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5yaXNlJTIwbW91bnRhaW4lMjBzdWNjZXNzfGVufDF8fHx8MTc1ODU1MjEwMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Sunrise over mountain peak"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>
        
        {/* Floating elements - reduced for performance */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-white/20 rounded-full opacity-60" />
        <div className="absolute top-40 right-20 w-1 h-1 bg-white/30 rounded-full opacity-70" />
        <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-white/25 rounded-full opacity-65" />
        
        <div className="relative z-10 px-4 py-24 w-full">
          <div className="max-w-5xl mx-auto text-center text-white">
            <div className="mb-8 inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Sparkles className="w-4 h-4 mr-2 text-yellow-300" />
              <span className="text-sm font-medium">Coming Soon • Limited Early Access</span>
            </div>
            
            <h1 className="mb-8 font-extrabold tracking-tight text-center leading-[0.9]
               text-[48px] md:text-[80px] lg:text-[112px]">
  <span className="block text-white">Your Health.</span>
  <span className="block text-white mt-1">Your Success.</span>
  <span className="block text-yellow-300 font-bold leading-[0.95] mt-3
                   text-[40px] md:text-[64px] lg:text-[88px]">
    Simplified.
  </span>
</h1>


            <p className="mb-4 text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light">
              The first lifestyle app designed exclusively for executives who
              refuse to compromise their health for success.
            </p>

            <p className="mb-10 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              Transform your wellbeing without sacrificing your career.
            </p>

            <div className="mb-8 inline-flex items-center px-4 py-2 rounded-full bg-yellow-400/20 backdrop-blur-sm border border-yellow-300/30">
              <span className="text-yellow-300 text-sm font-medium">
                ⚡ Spots are limited • Join 237 executives on the waitlist
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button
                size="lg"
                onClick={() => setWaitlistOpen(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 text-lg px-10 py-4 rounded-full font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Get Early Access
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Link to="/login">
                <Button
                  size="lg"
                  className="bg-yellow-400/20 text-yellow-300 border-yellow-300/30 hover:bg-yellow-400/30 text-lg px-8 py-4 rounded-full backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Get Started
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-white/60">
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2" />
          </div>
        </div>
      </div>

      {/* Problem Statement */}
      <section className="py-24 px-4 bg-gradient-to-br from-red-50/50 via-orange-50/30 to-yellow-50/50 dark:from-red-950/10 dark:via-orange-950/10 dark:to-yellow-950/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
              Critical Health Data
            </div>
            <h2 className="mb-6 text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              The Executive Health Crisis is Real
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Corporate success shouldn't come at the cost of your health. The
              data reveals a troubling reality about executive wellness that
              demands immediate attention.
            </p>
          </div>

          <AnimatedStatsSection stats={stats} />

          <div className="mt-16 text-center">
            <div className="inline-block p-8 bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-xl">
              <p className="text-lg font-medium text-foreground mb-2">
                It doesn't have to be this way.
              </p>
              <p className="text-muted-foreground">
                KA is designed to break this cycle and restore balance to
                executive life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Preview */}
      <section className="py-24 px-4 bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-40 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-20 right-40 w-48 h-48 bg-green-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Target className="w-4 h-4 mr-2" />
              Our Approach
            </div>
            <h2 className="mb-6 text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Built for Your Reality
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              KA understands the unique challenges of executive life. We create
              health solutions that adapt to your schedule — not the other way
              around.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                benefit={feature.benefit}
                colorScheme={feature.colorScheme}
              />
            ))}
          </div>

          <div className="mt-20 text-center">
            <div className="inline-block p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl border border-primary/20">
              <p className="text-lg font-medium text-foreground mb-2">
                Every feature designed with executive schedules in mind
              </p>
              <p className="text-muted-foreground">
                No generic fitness apps. No one-size-fits-all solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Get */}
      <section className="py-24 px-4 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950/50 dark:via-blue-950/30 dark:to-indigo-950/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative">
          <div className="mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Features Preview
            </div>
            <h2 className="mb-6 text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              What You'll Get
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Skip the guesswork: Get tailored routines that adapt to your
              schedule and executive lifestyle.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="p-8 border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="mb-4 text-xl font-semibold">Smart Scheduling</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Health routines that adapt to your calendar, travel, and work
                  demands
                </p>
                <div className="text-sm text-blue-700 dark:text-blue-300 bg-blue-500/15 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50">
                  <span className="font-medium">Example:</span> 7am flight? Get
                  a 5-minute pre-travel energy routine
                </div>
              </div>
            </Card>

            <Card className="p-8 border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="mb-4 text-xl font-semibold">Executive Nutrition</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Meal strategies for business dinners, airport food, and
                  late-night work sessions
                </p>
                <div className="text-sm text-green-700 dark:text-green-300 bg-green-500/15 rounded-xl p-4 border border-green-200/50 dark:border-green-800/50">
                  <span className="font-medium">Example:</span> Best choices at
                  common airport chains and hotel restaurants
                </div>
              </div>
            </Card>

            <Card className="p-8 border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="mb-4 text-xl font-semibold">Performance Metrics</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Track how health improvements translate to better
                  decision-making and leadership
                </p>
                <div className="text-sm text-purple-700 dark:text-purple-300 bg-purple-500/15 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/50">
                  <span className="font-medium">Example:</span> Energy levels
                  vs. quarterly performance correlation
                </div>
              </div>
            </Card>
          </div>

          <div className="bg-white/70 dark:bg-card/70 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-lg">
            <p className="text-lg font-medium text-foreground mb-3">
              Everything designed around your executive reality
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              No generic advice. No unrealistic expectations. Just practical
              solutions that work within the constraints of executive life.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-4 bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto text-center relative">
          <div className="mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Shield className="w-4 h-4 mr-2" />
              Trust & Credibility
            </div>
            <h2 className="mb-6 text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Built by Executives, for Executives
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Every feature is shaped by real executive challenges and validated
              by leaders who understand your world.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 border border-primary/20 bg-gradient-to-br from-white/80 to-primary/5 dark:from-card/80 dark:to-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="mb-4 text-lg font-semibold">Designed for Executives</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Created specifically for leaders and high performers balancing
                  demanding careers and health goals.
                </p>
              </div>
            </Card>

            <Card className="p-8 border border-primary/20 bg-gradient-to-br from-white/80 to-primary/5 dark:from-card/80 dark:to-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <h3 className="mb-4 text-lg font-semibold">Data-Informed</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Built using insights from executive routines, productivity
                  research, and real-world health challenges.
                </p>
              </div>
            </Card>

            <Card className="p-8 border border-primary/20 bg-gradient-to-br from-white/80 to-primary/5 dark:from-card/80 dark:to-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="mb-4 text-lg font-semibold">Early Access Community</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Shaped by feedback from our first group of executives who are
                  guiding the KA experience.
                </p>
              </div>
            </Card>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">237+</div>
              <p className="text-muted-foreground">Executives on waitlist</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">C-Suite</div>
              <p className="text-muted-foreground">Target demographic</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">2025</div>
              <p className="text-muted-foreground">Early access launch</p>
            </div>
          </div>
        </div>
      </section>

      {/* Minimalist Waitlist Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-40 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        </div>

        <div className="absolute top-10 left-10 w-2 h-2 bg-white/30 rounded-full opacity-80" />
        <div className="absolute top-20 right-20 w-1 h-1 bg-white/40 rounded-full opacity-70" />
        <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-white/35 rounded-full opacity-75" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="mb-8">
            <h2 className="mb-8 text-4xl md:text-6xl font-bold text-white">
              Your Health. Your Edge.
            </h2>

            <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-10">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse" />
              <span className="text-white text-lg font-medium">
                237 executives already on the waitlist
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-white/90">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span className="font-medium">Priority Coaching Access</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span className="font-medium">1-Month Free Trial</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span className="font-medium">Lifetime Discount</span>
            </div>
          </div>

          <div className="mt-16 inline-block p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <p className="text-white/90 font-medium mb-2">
              Limited spots available for early access
            </p>
            <p className="text-white/70 text-sm">
              Be among the first to experience KA before public launch
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 border-t border-border/50 bg-gradient-to-br from-muted/30 via-background to-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
              <span className="text-2xl font-bold text-primary">KA</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Executive Lifestyle Transformation
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Designed for leaders who demand excellence in all areas of life.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <h4 className="font-medium mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Features</li>
                <li>Pricing</li>
                <li>Early Access</li>
              </ul>
            </div>
            <div className="text-center">
              <h4 className="font-medium mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About</li>
                <li>Privacy</li>
                <li>Terms</li>
              </ul>
            </div>
            <div className="text-center">
              <h4 className="font-medium mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Help Center</li>
                <li>Contact</li>
                <li>Community</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/30 text-center">
            <p className="text-sm text-muted-foreground">© 2025 KA. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modal + Toaster */}
      <WaitlistDialog open={waitlistOpen} onOpenChange={setWaitlistOpen} />
      <Toaster position="top-right" />
    </div>
  );

  // ===== keep your tab sync logic =====
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

  // After login + backend check, go to dashboard if on /, /login, or /signup
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
        try {
          const res = await fetch(
            `${BASE_URL}/users/by-email/${encodeURIComponent(
              u.email ?? ""
            )}`
          );
          if (res.ok) {
            const userData = await res.json();
            setIsAppUser(true);
            setUser({
              ...userData,
              id: userData.id || userData.userId || userData.uid || u.uid,
              avatar: userData.avatar || u.photoURL,
              photoURL: u.photoURL,
            });
          } else {
            setIsAppUser(false);
            setUser(null);
          }
        } catch {
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
          <main className="flex-1 overflow-auto sm:ml-0">
            <div className="p-2 sm:p-4 lg:p-6 h-full">
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
        {/* Public routes — "/" now uses the imported Home from old App.tsx */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Private routes */}
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
              <WaterTracker user={user} />
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
          path="/explore"
          element={
            <PrivateRoute>
              <Explore />
            </PrivateRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <PrivateRoute>
              <GoalSetting />
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
        <Route
          path="/friends"
          element={
            <PrivateRoute>
              <ViewAllFriends user={user} />
            </PrivateRoute>
          }
        />
        <Route
          path="/search"
          element={
            <PrivateRoute>
              <UserSearch />
            </PrivateRoute>
          }
        />
        <Route
          path="/user/:userId"
          element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
