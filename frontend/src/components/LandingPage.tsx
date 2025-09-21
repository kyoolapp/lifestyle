import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  Droplets, 
  ChefHat, 
  Dumbbell,
  Users,
  Crown,
  Star,
  Check,
  ArrowRight,
  Play,
  Target,
  TrendingUp,
  Shield,
  Smartphone,
  Globe,
  Zap,
  Brain,
  Activity,
  Award,
  Wifi,
  Sparkles,
  Eye,
  BarChart3
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { LandingFeaturesShowcase } from './LandingFeaturesShowcase';
// Using placeholder for Health Hub screenshot

interface LandingPageProps {
  onLogin: () => void;
  onSignUp: () => void;
}

export function LandingPage({ onLogin, onSignUp }: LandingPageProps) {
  
const navigate = useNavigate();
const handleLoginClick = () => {
  navigate("/login");
};


  const features = [
    {
      icon: Heart,
      title: 'Track Your Health',
      description: 'See your weight, BMI, and how many calories you should eat. No confusing numbers - just simple info.',
      color: 'text-red-500'
    },
    {
      icon: Droplets,
      title: 'Remember to Drink Water',
      description: 'Get friendly reminders to drink water throughout the day. Your phone will nudge you when you forget.',
      color: 'text-blue-500'
    },
    {
      icon: ChefHat,
      title: 'Find Healthy Recipes',
      description: 'Type in what\'s in your fridge and get healthy meal ideas. No more "what should I cook tonight?"',
      color: 'text-green-500'
    },
    {
      icon: Dumbbell,
      title: 'Track Your Workouts',
      description: 'Log your walks, gym sessions, or yoga. See your progress over time and celebrate small wins.',
      color: 'text-purple-500'
    },
    {
      icon: Users,
      title: 'Connect with Friends',
      description: 'Add friends, share your progress, and cheer each other on. It\'s way easier when you\'re not alone.',
      color: 'text-orange-500'
    },
    {
      icon: Target,
      title: 'Set Simple Goals',
      description: 'Pick goals that actually make sense for your life. No crazy 30-day challenges - just real progress.',
      color: 'text-cyan-500'
    }
  ];

  const benefits = [
    {
      title: 'Health Hub - Your Complete Wellness Dashboard',
      description: 'Introducing Health Hub: Everything you need for a healthy lifestyle in one beautifully designed, AI-powered interface that adapts to your age and lifestyle. This is the evolution of health tracking.',
      image: 'https://images.unsplash.com/photo-1570894808314-677b57f25e45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGglMjBhcHAlMjBkYXNoYm9hcmQlMjBpbnRlcmZhY2V8ZW58MXx8fHwxNzU3OTczNzYwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      features: ['Real-time health metrics', 'Personalized daily targets', 'Smart progress tracking', 'Integrated Safe Zone technology']
    },
    {
      title: 'Safe Zone Technology',
      description: 'Revolutionary AI that learns your patterns and warns you before high-calorie choices derail your progress. No more guesswork.',
      image: 'https://images.unsplash.com/photo-1644127307101-f34996697a3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhjYWxvcmllJTIwdHJhY2tpbmclMjBhcHAlMjBpbnRlcmZhY2V8ZW58MXx8fHwxNzU3ODgwMDUxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      features: ['Proactive calorie warnings', 'Age-based recommendations', 'Personalized safe limits']
    },
    {
      title: 'Social Health Community',
      description: 'Connect with like-minded individuals, share your journey, and get inspired by others who understand your health goals.',
      image: 'https://images.unsplash.com/photo-1750041888982-67a58e6c9014?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGglMjBhcHAlMjBkYXNoYm9hcmQlMjBpbnRlcmZhY2V8ZW58MXx8fHwxNzU3ODgwMDQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      features: ['Community challenges', 'Progress sharing', 'Motivational support']
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Fitness Enthusiast',
      content: 'Health Hub transformed my health routine. The water tracking alone helped me lose 10 pounds!',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Busy Professional',
      content: 'Finally, an app that tracks everything I need. The recipe suggestions save me hours of meal planning.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'New Mom',
      content: 'The social features keep me motivated. Seeing others achieve their goals inspires me daily.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      rating: 5
    }
  ];

  const featureShowcase = {
    title: "Health Hub: Where health journeys adapt together, succeed together",
    description: "Multiple health goals come together with intelligent insights to create lasting change. With Health Hub's Safe Zone technology, you can build personalized, adaptive wellness strategies for every aspect of your life — all with AI assistance, of course. Start achieving more, together.",
    tabs: [
      {
        id: 'safe-zone',
        label: 'Safe Zone Technology',
        title: 'Intelligent Calorie Monitoring',
        description: 'Set up personalized calorie boundaries for your health goals. Let AI work with the data you need and nothing else.',
        image: 'https://images.unsplash.com/photo-1644127307101-f34996697a3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhjYWxvcmllJTIwdHJhY2tpbmclMjBhcHAlMjBpbnRlcmZhY2V8ZW58MXx8fHwxNzU3ODgwMDUxfDA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      {
        id: 'community',
        label: 'Social Wellness',
        title: 'Community-Driven Health',
        description: 'Connect with like-minded individuals and build accountability partnerships that drive real results.',
        image: 'https://images.unsplash.com/photo-1584846981296-618299947480?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBoZWFsdGglMjB0cmFja2luZyUyMGFwcHxlbnwxfHx8fDE3NTc4ODAwNDh8MA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      {
        id: 'health-hub',
        label: 'Health Hub',
        title: 'Complete Health Monitoring',
        description: 'Experience the power of Health Hub - a comprehensive dashboard that brings all your health data together in one intelligent interface designed for real results.',
        image: 'https://images.unsplash.com/photo-1570894808314-677b57f25e45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGglMjBhcHAlMjBkYXNoYm9hcmQlMjBpbnRlcmZhY2V8ZW58MXx8fHwxNzU3OTczNzYwfDA&ixlib=rb-4.1.0&q=80&w=1080'
      }
    ]
  };

  const advancedFeatures = [
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Smart recommendations based on your unique health patterns and goals.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Zap,
      title: 'Real-time Alerts',
      description: 'Instant notifications when you\'re approaching your safe zone limits.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Activity,
      title: 'Continuous Monitoring',
      description: 'Track your progress 24/7 with seamless device integration.',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: Award,
      title: 'Achievement System',
      description: 'Gamified experience that celebrates your health milestones.',
      color: 'from-blue-500 to-indigo-500'
    }
  ];

  const stats = [
    { number: '47', label: 'Active Users (Help us get to 50K!)' },
    { number: '23', label: 'Recipes Shared (Your grandma\'s recipe could be #24!)' },
    { number: '156', label: 'Workouts Logged (We need more gym selfies!)' },
    { number: '4.9', label: 'App Store Rating (OK, this one is real!)' }
  ];
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
      {/* Subtle background elements inspired by Zoho CRM */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,206,84,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_80%,rgba(34,197,94,0.06),transparent_50%)]" />
      
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">H</span>
              </div>
              <span className="text-xl font-bold">Health Hub</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
              <a href="#success-stories" className="text-muted-foreground hover:text-foreground transition-colors">Success Stories</a>
              <a href="#what-people-say" className="text-muted-foreground hover:text-foreground transition-colors">What People Say</a>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={onLogin}>
                Get Started
              </Button>
              {/*<Button onClick={onSignUp}>
                Get Started
              </Button>*/}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-12">
            {/* Content */}
            <div className="max-w-4xl space-y-8">
              <div>
                <Badge className="mb-6 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-blue-700 border-blue-200/50 hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-indigo-600/10">
                  🧠 AI-Powered Safe Zone Technology
                </Badge>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-slate-900 text-center">
                  Finally, A Health App
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 block">
                    That Actually Helps
                  </span>
                </h1>
                
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Stop you before you eat that donut. Reminds you to drink water. 
                  Connects you with friends who get it. It's like having a smart friend who cares about your health.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg" onClick={onSignUp}>
                    Try It Free Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-slate-300 hover:bg-slate-50">
                    <Play className="mr-2 w-5 h-5" />
                    Watch How It Works
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-600 max-w-2xl mx-auto">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                    Works for your age (no one-size-fits-all BS)
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                    Warns you before you mess up your diet
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                    Free to try • No credit card needed
                  </div>
                </div>
              </div>
            </div>
            
            {/* App Screenshot - Centered */}
            <div className="relative max-w-4xl w-full">
              <div className="relative">
                {/* Main app screenshot with sophisticated frame */}
                <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/30" />
                  <div className="relative p-1">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1570894808314-677b57f25e45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGglMjBhcHAlMjBkYXNoYm9hcmQlMjBpbnRlcmZhY2V8ZW58MXx8fHwxNzU3OTczNzYwfDA&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="Health Hub Dashboard - Complete Health Monitoring Interface"
                      className="w-full h-auto rounded-xl"
                    />
                  </div>
                </div>
                
                {/* Floating elements showcasing features */}
                <div className="absolute -top-6 -left-6 bg-white rounded-xl shadow-lg border border-slate-200/50 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <Droplets className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">Daily Water Goal</div>
                      <div className="text-xs text-slate-500">2.1L / 2.5L completed</div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg border border-slate-200/50 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">Safe Zone Active</div>
                      <div className="text-xs text-green-600">Calorie monitoring ON</div>
                    </div>
                  </div>
                </div>
                
                {/* Subtle background effects */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Let's Be Honest Here... 🤷‍♂️
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We're not gonna lie to you with fake big numbers. We're a small team building something awesome, 
              and we need YOUR help to grow! Here's where we actually stand:
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2 text-blue-600">{stat.number}</div>
                <div className="text-muted-foreground text-sm leading-relaxed">{stat.label}</div>
              </div>
            ))}
          </div>
          
          <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50">
            <h3 className="text-xl font-bold mb-4">
              Help Us Make These Numbers Epic! 🚀
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Know someone who's tired of boring health apps? Your mom who keeps asking about your diet? 
              That friend who takes gym mirror selfies? <strong>Send them our way!</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Check out this honest health app!',
                      text: 'Finally, a health app that actually helps (and admits when they need help growing)!',
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    // You could add a toast notification here
                  }
                }}
              >
                Share with Friends 📱
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.open('mailto:?subject=Check out this awesome health app!&body=Hey! Found this health app that\'s actually honest about being small and asks for help. Pretty refreshing! Check it out: ' + window.location.href, '_blank')}
              >
                Email Your Family 📧
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Every share helps us compete with those big corporate health apps that track everything but help nothing! 💪
            </p>
          </div>
        </div>
      </section>

      {/* Explore Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-slate-50/30 to-blue-50/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Explore Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the intelligent features designed specifically for your lifestyle. 
              See how Health Hub adapts to your needs and helps you succeed.
            </p>
          </div>
          <LandingFeaturesShowcase 
            onSignUp={onSignUp}
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Here's How Health Hub Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              It's super simple! Track your health, get smart warnings when you're about to eat too much, 
              and connect with friends who cheer you on.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section id="success-stories" className="py-20 bg-white/50 backdrop-blur-sm px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Real People, Real Results
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Check out what happened when people just like you started using Health Hub. 
              No fancy diets, no crazy workouts - just smart help that actually works. 
              These folks lost weight, felt better, and finally found something that stuck.
            </p>
          </div>
          
          <div className="space-y-24">
            {benefits.map((benefit, index) => (
              <div key={index} className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                <div className={`lg:col-span-5 ${index % 2 === 1 ? 'lg:col-start-8' : ''}`}>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900">{benefit.title}</h3>
                      <p className="text-lg text-slate-600 mb-6">{benefit.description}</p>
                    </div>
                    
                    {benefit.features && (
                      <div className="space-y-3">
                        {benefit.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex-shrink-0" />
                            <span className="text-slate-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Button variant="outline" className="border-slate-300 hover:bg-slate-50">
                      Explore Feature
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className={`lg:col-span-7 ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  <div className="relative">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
                      <ImageWithFallback
                        src={benefit.image}
                        alt={benefit.title}
                        className="w-full h-auto"
                      />
                    </div>
                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl -z-10 blur-xl transform translate-y-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What People Say Section */}
      <section id="what-people-say" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What People Are Saying
            </h2>
            <p className="text-xl text-muted-foreground">
              Real reviews from real people (we didn't pay them to say this!)
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <ImageWithFallback
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="font-medium">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase Section */}
      <section id="showcase" className="py-24 bg-gradient-to-br from-slate-50/80 via-blue-50/40 to-indigo-50/30 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(59,130,246,0.08),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 leading-tight">
              {featureShowcase.title}
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              {featureShowcase.description}
            </p>
            <Button className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-3">
              Learn more <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Feature Tabs */}
          <div className="mt-20">
            <div className="flex justify-center mb-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-slate-200/50 shadow-lg">
                <div className="flex gap-2">
                  {featureShowcase.tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Tab Content */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/50 shadow-2xl overflow-hidden">
              <div className="p-8 text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  {featureShowcase.tabs[0].title}
                </h3>
                <p className="text-lg text-slate-600 mb-8">
                  {featureShowcase.tabs[0].description}
                </p>
              </div>
              <div className="px-8 pb-8">
                <div className="relative bg-gradient-to-br from-slate-100 to-slate-200/50 rounded-2xl overflow-hidden">
                  <ImageWithFallback
                    src={featureShowcase.tabs[0].image}
                    alt={featureShowcase.tabs[0].title}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              Advanced Features for Every Health Goal
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Discover the intelligent features that make KyoolApp your ultimate health companion
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advancedFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:-translate-y-2">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Actually Stick to Your Health Goals?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Thousands of people are already using KyoolApp to get healthier without the stress. Your turn!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3" onClick={onSignUp}>
              Let's Do This - It's Free!
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3" onClick={onLogin}>
              I Already Have an Account
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Secure & Private
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Mobile Optimized
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Available Worldwide
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">K</span>
                </div>
                <span className="text-xl font-bold">KyoolApp</span>
              </div>
              <p className="text-slate-300 mb-6 leading-relaxed">
                The health app that actually helps you stick to your goals. 
                No confusing features, no overwhelming data - just simple help that works.
              </p>
              <div className="flex gap-4">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" onClick={onSignUp}>
                  Start Free Trial
                </Button>
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  Download App
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg">What You Get</h4>
              <ul className="space-y-3 text-slate-300">
                <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors flex items-center gap-2"><Heart className="w-4 h-4" />Track Your Health</a></li>
                <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors flex items-center gap-2"><Droplets className="w-4 h-4" />Water Reminders</a></li>
                <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors flex items-center gap-2"><ChefHat className="w-4 h-4" />Recipe Ideas</a></li>
                <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors flex items-center gap-2"><Shield className="w-4 h-4" />Smart Warnings</a></li>
                <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors flex items-center gap-2"><Users className="w-4 h-4" />Friend Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg">How It's Smart</h4>
              <ul className="space-y-3 text-slate-300">
                <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors flex items-center gap-2"><Brain className="w-4 h-4" />Learns Your Habits</a></li>
                <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors flex items-center gap-2"><Zap className="w-4 h-4" />Instant Alerts</a></li>
                <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors flex items-center gap-2"><Activity className="w-4 h-4" />24/7 Tracking</a></li>
                <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors flex items-center gap-2"><BarChart3 className="w-4 h-4" />Simple Progress</a></li>
                <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors flex items-center gap-2"><Wifi className="w-4 h-4" />Works with Your Phone</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg">Learn More</h4>
              <ul className="space-y-3 text-slate-300">
                <li><a href="#success-stories" className="hover:text-blue-400 transition-colors flex items-center gap-2"><Eye className="w-4 h-4" />See How It Works</a></li>
                <li><a href="#what-people-say" className="hover:text-blue-400 transition-colors flex items-center gap-2"><Star className="w-4 h-4" />Real User Stories</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2"><Sparkles className="w-4 h-4" />Health Tips</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2"><Award className="w-4 h-4" />Why It Works</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2"><Target className="w-4 h-4" />Getting Started</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-12 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <span>© 2024 KyoolApp. All rights reserved.</span>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>HIPAA Compliant</span>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Privacy Policy</a>
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Terms of Service</a>
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Security</a>
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}