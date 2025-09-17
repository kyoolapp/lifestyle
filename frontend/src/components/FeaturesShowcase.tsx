import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Brain, 
  Shield, 
  Users, 
  Droplets, 
  Heart, 
  ChefHat, 
  Zap, 
  Activity, 
  Award, 
  BarChart3,
  Sparkles,
  Target,
  ArrowRight,
  PlayCircle,
  CheckCircle2
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface FeaturesShowcaseProps {
  user: any;
  onFeatureSelect: (feature: string) => void;
}

export function FeaturesShowcase({ user, onFeatureSelect }: FeaturesShowcaseProps) {
  const [activeFeature, setActiveFeature] = useState('social-wellness');

  const featuresData = {
    'safe-zone': {
      title: 'Safe Zone Technology',
      subtitle: 'AI-Powered Calorie Intelligence',
      description: `Perfect for your health profile: As a ${user.age}-year-old, our AI calculates your optimal daily intake of ${user.dailyCalorieTarget} calories and warns you before high-calorie choices derail your progress.`,
      benefits: [
        'Personalized calorie boundaries based on your age and lifestyle',
        'Real-time warnings before exceeding safe limits',
        'Age-aware recommendations that evolve with you',
        'Smart portion control guidance'
      ],
      image: 'https://images.unsplash.com/photo-1644127307101-f34996697a3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhjYWxvcmllJTIwdHJhY2tpbmclMjBhcHAlMjBpbnRlcmZhY2V8ZW58MXx8fHwxNzU3ODgwMDUxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      action: 'Try Safe Zone',
      route: 'recipes'
    },
    'health-tracking': {
      title: 'Smart Health Tracking',
      subtitle: 'Comprehensive Health Management',
      description: 'Track your vitals, BMI, and health metrics with personalized insights tailored to your life stage and wellness goals.',
      benefits: [
        'Age-specific health benchmarks and targets',
        'Comprehensive BMI and body composition tracking',
        'Daily health metrics monitoring',
        'Integration with medical devices and wearables'
      ],
      image: 'https://images.unsplash.com/photo-1584846981296-618299947480?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBoZWFsdGglMjB0cmFja2luZyUyMGFwcHxlbnwxfHx8fDE3NTc4ODAwNDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      action: 'View Health',
      route: 'health'
    },
    'social-wellness': {
      title: 'Social Wellness Community',
      subtitle: 'Accountability That Works',
      description: 'Connect with others on similar health journeys, share progress, and build lasting accountability partnerships that drive real results.',
      benefits: [
        'Age-group specific communities and challenges',
        'Anonymous progress sharing and motivation',
        'Expert-led wellness discussions and tips',
        'Achievement celebrations and peer support'
      ],
      image: 'https://images.unsplash.com/photo-1750041888982-67a58e6c9014?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGglMjBhcHAlMjBkYXNoYm9hcmQlMjBpbnRlcmZhY2V8ZW58MXx8fHwxNzU3ODgwMDQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      action: 'Join Community',
      route: 'social'
    }
  };

  const quickFeatures = [
    {
      icon: Droplets,
      title: 'Smart Water Tracking',
      description: 'AI-powered hydration reminders',
      color: 'from-blue-500 to-cyan-500',
      route: 'water'
    },
    {
      icon: ChefHat,
      title: 'Recipe Discovery',
      description: 'Healthy recipes by ingredients',
      color: 'from-green-500 to-emerald-500',
      route: 'recipes'
    },
    {
      icon: Activity,
      title: 'Fitness Integration',
      description: 'Comprehensive workout tracking',
      color: 'from-purple-500 to-pink-500',
      route: 'fitness'
    },
    {
      icon: Target,
      title: 'Goal Management',
      description: 'Personalized health objectives',
      color: 'from-orange-500 to-red-500',
      route: 'profile'
    }
  ];

  const currentFeature = featuresData[activeFeature as keyof typeof featuresData];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome to your health journey, {user.name}!
            </h1>
            <p className="text-slate-600">
              Discover the intelligent features designed specifically for your lifestyle
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <div className="text-sm text-slate-600">Your Age</div>
            <div className="text-2xl font-bold text-slate-900">{user.age} years</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <div className="text-sm text-slate-600">Daily Calorie Target</div>
            <div className="text-2xl font-bold text-slate-900">{user.dailyCalorieTarget} cal</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <div className="text-sm text-slate-600">Safe Zone Status</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium text-slate-900">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Feature Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feature Navigation */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Explore Features</h2>
          {Object.entries(featuresData).map(([key, feature]) => (
            <Card 
              key={key}
              className={`cursor-pointer transition-all duration-200 border-2 ${
                activeFeature === key 
                  ? 'border-blue-500 bg-blue-50/50 shadow-lg' 
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
              onClick={() => setActiveFeature(key)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeFeature === key ? 'bg-blue-500' : 'bg-slate-100'
                  }`}>
                    {key === 'safe-zone' && <Shield className={`w-5 h-5 ${activeFeature === key ? 'text-white' : 'text-slate-600'}`} />}
                    {key === 'health-tracking' && <Heart className={`w-5 h-5 ${activeFeature === key ? 'text-white' : 'text-slate-600'}`} />}
                    {key === 'social-wellness' && <Users className={`w-5 h-5 ${activeFeature === key ? 'text-white' : 'text-slate-600'}`} />}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{feature.title}</h3>
                    <p className="text-sm text-slate-600">{feature.subtitle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Details */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-200">
              <ImageWithFallback
                src={currentFeature.image}
                alt={currentFeature.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <Badge className="bg-white/90 text-slate-900 mb-2">
                  {currentFeature.subtitle}
                </Badge>
                <h3 className="text-2xl font-bold text-white mb-2">{currentFeature.title}</h3>
              </div>
            </div>
            
            <CardContent className="p-6">
              <p className="text-slate-600 mb-6 leading-relaxed">
                {currentFeature.description}
              </p>
              
              <div className="space-y-3 mb-6">
                {currentFeature.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3">
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  onClick={() => onFeatureSelect(currentFeature.route)}
                >
                  {currentFeature.action}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button variant="outline">
                  <PlayCircle className="mr-2 w-4 h-4" />
                  Watch Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Access Features */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                onClick={() => onFeatureSelect(feature.route)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}