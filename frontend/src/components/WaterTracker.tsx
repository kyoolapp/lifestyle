import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  Droplets, 
  Plus, 
  Minus,
  Target,
  Calendar,
  TrendingUp
} from 'lucide-react';

export function WaterTracker() {
  const [dailyGoal] = useState(8); // glasses
  const [todayIntake, setTodayIntake] = useState(5);
  const [glassSize] = useState(250); // ml

  // Mock weekly data
  const weeklyData = [
    { day: 'Mon', intake: 7, goal: 8 },
    { day: 'Tue', intake: 8, goal: 8 },
    { day: 'Wed', intake: 6, goal: 8 },
    { day: 'Thu', intake: 9, goal: 8 },
    { day: 'Fri', intake: 7, goal: 8 },
    { day: 'Sat', intake: 5, goal: 8 },
    { day: 'Sun', intake: 5, goal: 8 }, // today
  ];

  const reminders = [
    { time: '08:00', message: 'Start your day with a glass of water' },
    { time: '12:00', message: 'Lunch time hydration check' },
    { time: '15:00', message: 'Afternoon water break' },
    { time: '18:00', message: 'Evening hydration reminder' },
    { time: '21:00', message: 'Last glass before bed' },
  ];

  const addWater = () => {
    if (todayIntake < 15) { // max 15 glasses
      setTodayIntake(todayIntake + 1);
    }
  };

  const removeWater = () => {
    if (todayIntake > 0) {
      setTodayIntake(todayIntake - 1);
    }
  };

  const getProgressColor = () => {
    const percentage = (todayIntake / dailyGoal) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMotivationMessage = () => {
    const percentage = (todayIntake / dailyGoal) * 100;
    if (percentage >= 100) return "🎉 Great job! You've reached your daily goal!";
    if (percentage >= 75) return "💪 Almost there! Keep it up!";
    if (percentage >= 50) return "👍 You're doing well, stay hydrated!";
    return "💧 Let's start hydrating! Your body will thank you.";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Water Tracker</h1>
        <p className="text-muted-foreground mt-1">Stay hydrated and track your daily water intake</p>
      </div>

      {/* Today's Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-blue-500 mb-2">
                  {todayIntake}
                </div>
                <p className="text-muted-foreground">of {dailyGoal} glasses</p>
                <p className="text-sm text-muted-foreground">
                  {todayIntake * glassSize}ml of {dailyGoal * glassSize}ml
                </p>
              </div>

              <Progress 
                value={(todayIntake / dailyGoal) * 100} 
                className="h-3 mb-4"
              />

              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={removeWater}
                    disabled={todayIntake === 0}
                    className="mb-2"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <p className="text-xs text-muted-foreground">-{glassSize}ml</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <Droplets className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">{glassSize}ml glass</p>
                </div>
                
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={addWater}
                    disabled={todayIntake >= 15}
                    className="mb-2"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <p className="text-xs text-muted-foreground">+{glassSize}ml</p>
                </div>
              </div>

              <div className="text-center">
                <Badge 
                  variant={todayIntake >= dailyGoal ? 'default' : 'secondary'}
                  className="mb-2"
                >
                  {((todayIntake / dailyGoal) * 100).toFixed(0)}% Complete
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {getMotivationMessage()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Daily Goal</span>
                <span className="font-medium">{dailyGoal} glasses</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Remaining</span>
                <span className="font-medium">
                  {Math.max(0, dailyGoal - todayIntake)} glasses
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Average this week</span>
                <span className="font-medium">
                  {(weeklyData.reduce((sum, day) => sum + day.intake, 0) / weeklyData.length).toFixed(1)} glasses
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Streak</span>
                <span className="font-medium">3 days</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weeklyData.map((day, index) => (
              <div key={index} className="text-center">
                <p className="text-xs text-muted-foreground mb-2">{day.day}</p>
                <div className="relative h-20 bg-muted rounded-lg flex items-end justify-center p-1">
                  <div 
                    className={`w-full rounded transition-all ${
                      day.intake >= day.goal ? 'bg-green-500' : 'bg-blue-400'
                    }`}
                    style={{ 
                      height: `${Math.max(10, (day.intake / day.goal) * 100)}%`,
                      maxHeight: '100%'
                    }}
                  />
                  <span className="absolute bottom-1 text-xs font-medium text-white">
                    {day.intake}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hydration Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Hydration Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reminders.map((reminder, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{reminder.time}</p>
                  <p className="text-xs text-muted-foreground">{reminder.message}</p>
                </div>
                <Button variant="ghost" size="sm">
                  ✓
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Hydration Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Droplets className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Start your day with water</p>
                <p className="text-sm text-muted-foreground">
                  Drink a glass of water as soon as you wake up to kickstart your metabolism.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Set regular reminders</p>
                <p className="text-sm text-muted-foreground">
                  Use app notifications to remind yourself to drink water throughout the day.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}