import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Brain, 
  Heart, 
  Moon, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Coffee,
  Utensils,
  Dumbbell,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';

interface AdaptiveAICoachProps {
  user: any;
  currentWorkout?: any;
  onWorkoutAdjustment?: (adjustment: any) => void;
}

interface HealthMetrics {
  mood: number; // 1-10
  energy: number; // 1-10
  stress: number; // 1-10
  sleepQuality: number; // 1-10
  heartRate: number;
  recoveryScore: number; // 1-100
  nutritionScore: number; // 1-100
}

export function AdaptiveAICoach({ user, currentWorkout, onWorkoutAdjustment }: AdaptiveAICoachProps) {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({
    mood: 7,
    energy: 6,
    stress: 4,
    sleepQuality: 7,
    heartRate: 72,
    recoveryScore: 78,
    nutritionScore: 82
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);

  // Simulate real-time heart rate monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setHealthMetrics(prev => ({
        ...prev,
        heartRate: 70 + Math.floor(Math.random() * 20) // 70-90 bpm
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // AI Analysis based on health metrics
  useEffect(() => {
    analyzeHealthData();
  }, [healthMetrics]);

  const analyzeHealthData = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const recommendations = generateAIRecommendations();
      setAiRecommendations(recommendations);
      setIsAnalyzing(false);
    }, 1500);
  };

  const generateAIRecommendations = () => {
    const recommendations = [];
    const { mood, energy, stress, sleepQuality, recoveryScore, nutritionScore, heartRate } = healthMetrics;

    // Workout intensity recommendations
    if (energy < 5 || recoveryScore < 60) {
      recommendations.push({
        type: 'workout_adjustment',
        priority: 'high',
        title: 'Reduce Workout Intensity',
        description: 'Your energy and recovery scores suggest a lighter workout today. Consider yoga or walking.',
        action: 'Switch to Recovery Mode',
        icon: RefreshCw,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50'
      });
    }

    // Stress-based recommendations
    if (stress > 7) {
      recommendations.push({
        type: 'stress_management',
        priority: 'high',
        title: 'Stress Relief Focus',
        description: 'High stress detected. Incorporate meditation or breathing exercises before your workout.',
        action: 'Start Meditation',
        icon: Heart,
        color: 'text-red-500',
        bgColor: 'bg-red-50'
      });
    }

    // Sleep-based recommendations
    if (sleepQuality < 6) {
      recommendations.push({
        type: 'recovery',
        priority: 'medium',
        title: 'Prioritize Recovery',
        description: 'Poor sleep quality detected. Focus on restorative activities and avoid high-intensity training.',
        action: 'Recovery Plan',
        icon: Moon,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50'
      });
    }

    // Nutrition integration
    if (nutritionScore < 70) {
      recommendations.push({
        type: 'nutrition',
        priority: 'medium',
        title: 'Nutrition Optimization',
        description: 'Your recent meals could better support your fitness goals. Consider pre-workout nutrition.',
        action: 'Meal Suggestions',
        icon: Utensils,
        color: 'text-green-500',
        bgColor: 'bg-green-50'
      });
    }

    // Heart rate monitoring
    if (heartRate > 85) {
      recommendations.push({
        type: 'heart_rate',
        priority: 'high',
        title: 'Heart Rate Alert',
        description: 'Elevated resting heart rate detected. Consider reducing workout intensity.',
        action: 'Adjust Intensity',
        icon: Activity,
        color: 'text-red-500',
        bgColor: 'bg-red-50'
      });
    }

    // Positive reinforcement
    if (mood > 7 && energy > 7) {
      recommendations.push({
        type: 'optimization',
        priority: 'low',
        title: 'Peak Performance Day',
        description: 'Great mood and energy levels! This is a perfect day for challenging yourself.',
        action: 'Increase Challenge',
        icon: Zap,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50'
      });
    }

    return recommendations.slice(0, 3); // Limit to top 3 recommendations
  };

  const handleActionClick = (recommendation: any) => {
    if (recommendation.type === 'workout_adjustment' && onWorkoutAdjustment) {
      onWorkoutAdjustment({
        type: 'intensity_reduction',
        reason: recommendation.description,
        newIntensity: 'light'
      });
    }
    // Handle other action types...
  };

  const getOverallHealthScore = () => {
    const { mood, energy, stress, sleepQuality, recoveryScore, nutritionScore } = healthMetrics;
    const stressInverted = 10 - stress; // Invert stress score
    return Math.round((mood + energy + stressInverted + sleepQuality + (recoveryScore/10) + (nutritionScore/10)) / 6 * 10);
  };

  const healthScore = getOverallHealthScore();

  return (
    <div className="space-y-6">
      {/* AI Health Analysis Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Adaptive AI Health Coach
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Real-time analysis of your mood, recovery, stress, and nutrition for personalized guidance
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Health Score */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold">{healthScore}%</span>
              <Badge variant={healthScore > 80 ? 'default' : healthScore > 60 ? 'secondary' : 'destructive'}>
                {healthScore > 80 ? 'Excellent' : healthScore > 60 ? 'Good' : 'Needs Attention'}
              </Badge>
            </div>
            <Progress value={healthScore} className="h-2" />
            <p className="text-sm text-muted-foreground">Overall Wellness Score</p>
          </div>

          {/* Health Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium">Mood</span>
              </div>
              <div className="space-y-1">
                <Progress value={healthMetrics.mood * 10} className="h-2" />
                <span className="text-xs text-muted-foreground">{healthMetrics.mood}/10</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Energy</span>
              </div>
              <div className="space-y-1">
                <Progress value={healthMetrics.energy * 10} className="h-2" />
                <span className="text-xs text-muted-foreground">{healthMetrics.energy}/10</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Stress</span>
              </div>
              <div className="space-y-1">
                <Progress value={healthMetrics.stress * 10} className="h-2" />
                <span className="text-xs text-muted-foreground">{healthMetrics.stress}/10</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Sleep</span>
              </div>
              <div className="space-y-1">
                <Progress value={healthMetrics.sleepQuality * 10} className="h-2" />
                <span className="text-xs text-muted-foreground">{healthMetrics.sleepQuality}/10</span>
              </div>
            </div>
          </div>

          {/* Real-time Monitoring */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Activity className="w-4 h-4 text-red-500" />
                <motion.span 
                  className="text-sm font-semibold"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {healthMetrics.heartRate} BPM
                </motion.span>
              </div>
              <p className="text-xs text-muted-foreground">Live Heart Rate</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold">{healthMetrics.recoveryScore}%</span>
              </div>
              <p className="text-xs text-muted-foreground">Recovery Score</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Utensils className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold">{healthMetrics.nutritionScore}%</span>
              </div>
              <p className="text-xs text-muted-foreground">Nutrition Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Recommendations
            {isAnalyzing && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiRecommendations.map((rec, index) => {
            const Icon = rec.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${rec.bgColor} hover:shadow-md transition-all`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Icon className={`w-5 h-5 ${rec.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <Badge 
                        variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleActionClick(rec)}
                      className="h-8"
                    >
                      {rec.action}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {aiRecommendations.length === 0 && !isAnalyzing && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-medium mb-2">All Systems Go! 🎉</h3>
              <p className="text-sm text-muted-foreground">
                Your health metrics look great. Keep up the excellent work!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}