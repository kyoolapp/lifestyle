import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Shield, 
  Users, 
  Heart, 
  ArrowRight,
  PlayCircle,
  CheckCircle2
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const fadeInUpKeyframes = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

interface LandingFeaturesShowcaseProps {
  onSignUp: () => void;
}

export function LandingFeaturesShowcase({ onSignUp }: LandingFeaturesShowcaseProps) {
  const [activeFeature, setActiveFeature] = useState('social-wellness');

  const featuresData = {
    'safe-zone': {
      title: 'Safe Zone Technology',
      subtitle: 'AI-Powered Calorie Intelligence',
      description: 'Revolutionary AI that learns your patterns and warns you before high-calorie choices derail your progress. Get personalized calorie boundaries based on your age and lifestyle.',
      benefits: [
        'Personalized calorie boundaries based on your age and lifestyle',
        'Real-time warnings before exceeding safe limits',
        'Age-aware recommendations that evolve with you',
        'Smart portion control guidance'
      ],
      image: 'https://images.unsplash.com/photo-1644127307101-f34996697a3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhjYWxvcmllJTIwdHJhY2tpbmclMjBhcHAlMjBpbnRlcmZhY2V8ZW58MXx8fHwxNzU3ODgwMDUxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      action: 'Try Safe Zone'
    },
    'health-tracking': {
      title: 'Smart Health Tracking',
      subtitle: 'Comprehensive Health Management',
      description: 'Track your vitals, BMI, and health metrics with personalized insights tailored to your life stage and wellness goals. Complete health monitoring in one place.',
      benefits: [
        'Age-specific health benchmarks and targets',
        'Comprehensive BMI and body composition tracking',
        'Daily health metrics monitoring',
        'Integration with medical devices and wearables'
      ],
      image: 'https://images.unsplash.com/photo-1584846981296-618299947480?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBoZWFsdGglMjB0cmFja2luZyUyMGFwcHxlbnwxfHx8fDE3NTc4ODAwNDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      action: 'Start Tracking'
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
      action: 'Join Community'
    }
  };

  const currentFeature = featuresData[activeFeature as keyof typeof featuresData];

  return (
    <>
      <style>{fadeInUpKeyframes}</style>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Feature Navigation */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Explore Features</h2>
        {Object.entries(featuresData).map(([key, feature]) => (
          <Card 
            key={key}
            className={`cursor-pointer transition-all duration-300 border-2 transform hover:scale-105 ${
              activeFeature === key 
                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-xl ring-2 ring-blue-200' 
                : 'border-slate-200 hover:border-blue-300 hover:shadow-lg hover:bg-slate-50'
            }`}
            onClick={() => setActiveFeature(key)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  activeFeature === key 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg' 
                    : 'bg-slate-100 group-hover:bg-slate-200'
                }`}>
                  {key === 'safe-zone' && <Shield className={`w-6 h-6 transition-all duration-300 ${activeFeature === key ? 'text-white' : 'text-slate-600'}`} />}
                  {key === 'health-tracking' && <Heart className={`w-6 h-6 transition-all duration-300 ${activeFeature === key ? 'text-white' : 'text-slate-600'}`} />}
                  {key === 'social-wellness' && <Users className={`w-6 h-6 transition-all duration-300 ${activeFeature === key ? 'text-white' : 'text-slate-600'}`} />}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold transition-colors duration-300 ${
                    activeFeature === key ? 'text-blue-900' : 'text-slate-900'
                  }`}>{feature.title}</h3>
                  <p className={`text-sm transition-colors duration-300 ${
                    activeFeature === key ? 'text-blue-700' : 'text-slate-600'
                  }`}>{feature.subtitle}</p>
                </div>
                {/* Click indicator */}
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeFeature === key ? 'bg-blue-500' : 'bg-transparent'
                }`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Details */}
      <div className="lg:col-span-2">
        <Card className="border-0 shadow-2xl overflow-hidden transition-all duration-500 transform">
          <div className="relative h-72 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
            <ImageWithFallback
              src={currentFeature.image}
              alt={currentFeature.title}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            
            {/* Animated background elements */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-16 h-16 bg-blue-400/20 rounded-full blur-lg animate-pulse" />
            
            <div className="absolute bottom-6 left-6 right-6">
              <Badge className="bg-white/95 text-slate-900 mb-3 backdrop-blur-sm">
                {currentFeature.subtitle}
              </Badge>
              <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{currentFeature.title}</h3>
            </div>
          </div>
          
          <CardContent className="p-8">
            <p className="text-slate-600 mb-8 leading-relaxed text-lg">
              {currentFeature.description}
            </p>
            
            <div className="space-y-4 mb-8">
              {currentFeature.benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 p-3 rounded-lg bg-green-50/50 hover:bg-green-50 transition-colors duration-200"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.5s ease-out forwards'
                  }}
                >
                  <CheckCircle2 className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 font-medium">{benefit}</span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={onSignUp}
              >
                {currentFeature.action}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
              >
                <PlayCircle className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  );
}