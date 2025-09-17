import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Dumbbell, 
  Plus, 
  Clock, 
  Flame,
  Target,
  TrendingUp,
  Calendar,
  Activity,
  Heart,
  Footprints,
  Zap,
  Trophy,
  Play,
  Pause,
  Square,
  RotateCcw,
  ChevronRight,
  Award,
  Timer,
  BarChart3,
  MapPin,
  Wind
} from 'lucide-react';
import { motion } from 'motion/react';

export function FitnessTracker() {
  const [activeWorkout, setActiveWorkout] = useState<any>(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Mock real-time data like Fitbit
  const todayStats = {
    steps: 8547,
    distance: 6.8, // km
    calories: 387,
    activeMinutes: 45,
    heartRate: 72,
    sleep: 7.2, // hours
    floors: 12,
    restingHeartRate: 62
  };

  const weeklyStats = {
    totalSteps: 52847,
    totalDistance: 42.5,
    totalCalories: 2840,
    activeMinutes: 267,
    averageHeartRate: 75,
    workoutsCompleted: 4
  };

  const achievements = [
    { id: 1, title: '10K Steps', description: 'Daily step goal achieved', icon: Trophy, color: 'text-yellow-500', unlocked: true },
    { id: 2, title: 'Weekend Warrior', description: '3 workouts this weekend', icon: Award, color: 'text-blue-500', unlocked: true },
    { id: 3, title: 'Consistency King', description: '7 days active streak', icon: Flame, color: 'text-orange-500', unlocked: false },
    { id: 4, title: 'Cardio Champion', description: '30 min cardio session', icon: Heart, color: 'text-red-500', unlocked: true }
  ];

  const workoutOptions = [
    { name: 'Quick Walk', duration: '15 min', icon: Footprints, color: 'bg-green-500' },
    { name: 'HIIT Training', duration: '20 min', icon: Zap, color: 'bg-orange-500' },
    { name: 'Strength Training', duration: '45 min', icon: Dumbbell, color: 'bg-blue-500' },
    { name: 'Yoga Flow', duration: '30 min', icon: Heart, color: 'bg-purple-500' }
  ];

  const recentActivities = [
    { id: 1, name: 'Morning Run', type: 'Running', duration: 32, calories: 287, heartRate: 142, date: 'Today, 7:30 AM' },
    { id: 2, name: 'Strength Training', type: 'Weights', duration: 45, calories: 201, heartRate: 128, date: 'Yesterday, 6:00 PM' },
    { id: 3, name: 'Evening Walk', type: 'Walking', duration: 28, calories: 134, heartRate: 98, date: 'Yesterday, 8:15 PM' }
  ];

  // Timer functions
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Fitness Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your daily activity and health insights</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Play className="w-4 h-4 mr-2" />
              Start Workout
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Choose Your Workout</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-3">
              {workoutOptions.map((workout, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={`p-4 rounded-lg text-left hover:bg-muted/50 transition-colors border border-muted h-auto`}
                  onClick={() => {
                    setActiveWorkout(workout);
                    setIsRunning(true);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${workout.color} rounded-full flex items-center justify-center`}>
                      <workout.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">{workout.name}</h4>
                      <p className="text-sm text-muted-foreground">{workout.duration}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
                  </div>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Workout Timer */}
      {activeWorkout && (
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 ${activeWorkout.color} rounded-full flex items-center justify-center`}>
                  <activeWorkout.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{activeWorkout.name}</h3>
                  <p className="text-muted-foreground">Active Workout</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">{formatTime(timer)}</div>
                <p className="text-sm text-muted-foreground">Elapsed Time</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsRunning(!isRunning)}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setActiveWorkout(null);
                    setTimer(0);
                    setIsRunning(false);
                  }}
                >
                  <Square className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Key Metrics - Fitbit Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Footprints className="w-6 h-6 text-blue-600" />
                </div>
                <Badge variant="secondary" className="text-xs">Daily Goal</Badge>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{todayStats.steps.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">steps</div>
                <Progress value={(todayStats.steps / 10000) * 100} className="h-2" />
                <div className="text-xs text-muted-foreground">{Math.round((todayStats.steps / 10000) * 100)}% of 10K goal</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <Badge variant="secondary" className="text-xs">Resting</Badge>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{todayStats.heartRate}</div>
                <div className="text-sm text-muted-foreground">bpm</div>
                <div className="text-xs text-muted-foreground">Resting HR: {todayStats.restingHeartRate} bpm</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-600" />
                </div>
                <Badge variant="secondary" className="text-xs">Burned</Badge>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{todayStats.calories}</div>
                <div className="text-sm text-muted-foreground">calories</div>
                <div className="text-xs text-muted-foreground">Active: {Math.round(todayStats.calories * 0.3)} cal</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <Badge variant="secondary" className="text-xs">Distance</Badge>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{todayStats.distance}</div>
                <div className="text-sm text-muted-foreground">km</div>
                <div className="text-xs text-muted-foreground">Floors: {todayStats.floors}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weekly Summary - Fitbit Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Weekly Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Footprints className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{weeklyStats.totalSteps.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Steps</p>
                  </div>
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Flame className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">{weeklyStats.totalCalories.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Calories Burned</p>
                  </div>
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Activity className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">{weeklyStats.activeMinutes}</p>
                    <p className="text-sm text-muted-foreground">Active Minutes</p>
                  </div>
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                      : 'bg-muted/30 border-muted'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    achievement.unlocked ? 'bg-yellow-100' : 'bg-muted'
                  }`}>
                    <achievement.icon className={`w-5 h-5 ${
                      achievement.unlocked ? achievement.color : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${achievement.unlocked ? '' : 'text-muted-foreground'}`}>
                      {achievement.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  {achievement.unlocked && <Badge variant="secondary" className="text-xs">Unlocked</Badge>}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Activities
            </div>
            <Button variant="ghost" size="sm">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 hover:from-muted/50 hover:to-muted/20 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  activity.type === 'Running' ? 'bg-green-100' :
                  activity.type === 'Weights' ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  {activity.type === 'Running' ? <Footprints className="w-6 h-6 text-green-600" /> :
                   activity.type === 'Weights' ? <Dumbbell className="w-6 h-6 text-blue-600" /> :
                   <Activity className="w-6 h-6 text-purple-600" />}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium">{activity.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      {activity.duration}m
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {activity.calories} cal
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {activity.heartRate} bpm
                    </div>
                  </div>
                </div>
                
                <div className="text-right text-sm text-muted-foreground">
                  {activity.date}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}