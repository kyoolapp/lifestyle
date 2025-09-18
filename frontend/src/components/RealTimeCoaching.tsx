import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Activity, 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  TrendingDown, 
  TrendingUp,
  Pause,
  Play,
  RotateCcw,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RealTimeCoachingProps {
  isWorkoutActive: boolean;
  currentExercise?: string;
  onWorkoutPause?: () => void;
  onWorkoutResume?: () => void;
  onExerciseChange?: (newExercise: string) => void;
}

interface WorkoutMetrics {
  heartRate: number;
  intensity: 'low' | 'moderate' | 'high' | 'peak';
  fatigue: number; // 1-10
  form: 'excellent' | 'good' | 'needs_improvement';
  rpe: number; // Rate of Perceived Exertion 1-10
}

export function RealTimeCoaching({ 
  isWorkoutActive, 
  currentExercise = "Push-ups",
  onWorkoutPause,
  onWorkoutResume,
  onExerciseChange
}: RealTimeCoachingProps) {
  const [metrics, setMetrics] = useState<WorkoutMetrics>({
    heartRate: 72,
    intensity: 'moderate',
    fatigue: 3,
    form: 'good',
    rpe: 5
  });

  const [coachingMessage, setCoachingMessage] = useState<any>(null);
  const [messageHistory, setMessageHistory] = useState<any[]>([]);

  // Simulate real-time metrics during workout
  useEffect(() => {
    if (!isWorkoutActive) return;

    const interval = setInterval(() => {
      setMetrics(prev => {
        const newHeartRate = Math.max(65, Math.min(180, 
          prev.heartRate + (Math.random() - 0.5) * 8
        ));
        
        const newFatigue = Math.max(1, Math.min(10,
          prev.fatigue + (Math.random() - 0.3) * 0.5
        ));

        const newRpe = Math.max(1, Math.min(10,
          prev.rpe + (Math.random() - 0.4) * 0.8
        ));

        let newIntensity: WorkoutMetrics['intensity'] = 'moderate';
        if (newHeartRate < 100) newIntensity = 'low';
        else if (newHeartRate < 140) newIntensity = 'moderate';
        else if (newHeartRate < 160) newIntensity = 'high';
        else newIntensity = 'peak';

        const newForm: WorkoutMetrics['form'] = 
          newFatigue > 7 ? 'needs_improvement' :
          newFatigue > 5 ? 'good' : 'excellent';

        return {
          heartRate: Math.round(newHeartRate),
          intensity: newIntensity,
          fatigue: Math.round(newFatigue * 10) / 10,
          form: newForm,
          rpe: Math.round(newRpe * 10) / 10
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isWorkoutActive]);

  // AI Coaching Logic
  useEffect(() => {
    if (!isWorkoutActive) return;

    const coaching = generateRealTimeCoaching(metrics);
    if (coaching) {
      setCoachingMessage(coaching);
      setMessageHistory(prev => [coaching, ...prev.slice(0, 4)]); // Keep last 5 messages
    }
  }, [metrics, isWorkoutActive]);

  const generateRealTimeCoaching = (metrics: WorkoutMetrics) => {
    const { heartRate, intensity, fatigue, form, rpe } = metrics;

    // High heart rate warning
    if (heartRate > 170) {
      return {
        type: 'warning',
        priority: 'high',
        title: 'Heart Rate Alert',
        message: 'Your heart rate is very high. Consider slowing down or taking a brief rest.',
        action: 'Reduce Intensity',
        icon: AlertTriangle,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        actionType: 'reduce_intensity'
      };
    }

    // Fatigue detection
    if (fatigue > 8) {
      return {
        type: 'adjustment',
        priority: 'high',
        title: 'Fatigue Detected',
        message: 'You\'re showing signs of fatigue. Let\'s switch to a recovery exercise.',
        action: 'Switch Exercise',
        icon: TrendingDown,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        actionType: 'switch_exercise'
      };
    }

    // Form correction
    if (form === 'needs_improvement') {
      return {
        type: 'form',
        priority: 'medium',
        title: 'Form Check',
        message: 'Your form may be compromising due to fatigue. Focus on quality over quantity.',
        action: 'Form Tips',
        icon: RotateCcw,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        actionType: 'form_correction'
      };
    }

    // Low intensity encouragement
    if (heartRate < 90 && intensity === 'low') {
      return {
        type: 'encouragement',
        priority: 'low',
        title: 'Push a Little Harder',
        message: 'You have more in the tank! Try increasing your pace or resistance.',
        action: 'Increase Intensity',
        icon: TrendingUp,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        actionType: 'increase_intensity'
      };
    }

    // Perfect zone encouragement
    if (intensity === 'moderate' && form === 'excellent') {
      return {
        type: 'positive',
        priority: 'low',
        title: 'Perfect Zone!',
        message: 'You\'re in the sweet spot! Great form and intensity.',
        action: 'Keep Going',
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        actionType: 'maintain'
      };
    }

    return null;
  };

  const handleCoachingAction = (actionType: string) => {
    switch (actionType) {
      case 'reduce_intensity':
        onWorkoutPause?.();
        break;
      case 'switch_exercise':
        onExerciseChange?.('Light Stretching');
        break;
      case 'increase_intensity':
        // Could increase workout difficulty
        break;
      default:
        break;
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low': return 'text-blue-500';
      case 'moderate': return 'text-green-500';
      case 'high': return 'text-yellow-500';
      case 'peak': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getFormColor = (form: string) => {
    switch (form) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-yellow-500';
      case 'needs_improvement': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (!isWorkoutActive) {
    return (
      <Card className="opacity-50">
        <CardContent className="p-6 text-center">
          <Play className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">Real-time Coaching Inactive</h3>
          <p className="text-sm text-muted-foreground">
            Start a workout to activate AI coaching and real-time adjustments
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Real-time Metrics Dashboard */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Live Workout Monitoring</h3>
            <Badge variant="outline" className="text-green-600 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              Active
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Activity className="w-4 h-4 text-red-500" />
                <motion.span 
                  className="font-semibold"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {metrics.heartRate}
                </motion.span>
              </div>
              <p className="text-xs text-muted-foreground">BPM</p>
            </div>

            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className={`w-4 h-4 ${getIntensityColor(metrics.intensity)}`} />
                <span className="font-semibold capitalize">{metrics.intensity}</span>
              </div>
              <p className="text-xs text-muted-foreground">Intensity</p>
            </div>

            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className={`w-4 h-4 ${getFormColor(metrics.form)}`} />
                <span className="font-semibold capitalize">{metrics.form.replace('_', ' ')}</span>
              </div>
              <p className="text-xs text-muted-foreground">Form</p>
            </div>

            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Heart className="w-4 h-4 text-purple-500" />
                <span className="font-semibold">{metrics.rpe}/10</span>
              </div>
              <p className="text-xs text-muted-foreground">RPE</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Coaching Message */}
      <AnimatePresence>
        {coachingMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`border-l-4 ${
              coachingMessage.priority === 'high' ? 'border-l-red-500' :
              coachingMessage.priority === 'medium' ? 'border-l-yellow-500' :
              'border-l-green-500'
            }`}>
              <CardContent className={`p-4 ${coachingMessage.bgColor}`}>
                <div className="flex items-start gap-3">
                  <coachingMessage.icon className={`w-5 h-5 ${coachingMessage.color} mt-0.5`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{coachingMessage.title}</h4>
                      <Badge variant={
                        coachingMessage.priority === 'high' ? 'destructive' :
                        coachingMessage.priority === 'medium' ? 'secondary' : 
                        'outline'
                      } className="text-xs">
                        AI Coach
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {coachingMessage.message}
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCoachingAction(coachingMessage.actionType)}
                      className="h-8"
                    >
                      {coachingMessage.action}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coaching History */}
      {messageHistory.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-medium text-sm">Recent Coaching</h4>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {messageHistory.map((msg, index) => (
                <div key={index} className="text-xs p-2 bg-muted/30 rounded flex items-center gap-2">
                  <msg.icon className={`w-3 h-3 ${msg.color}`} />
                  <span className="flex-1 truncate">{msg.title}: {msg.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}