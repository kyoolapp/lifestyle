import React, { useState, useEffect } from 'react';
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
import * as userApi from '../api/user_api';

interface WaterTrackerProps {
  user: any;
}

export function WaterTracker({ user }: WaterTrackerProps) {
  const [dailyGoal] = useState(8); // glasses
  const [todayIntake, setTodayIntake] = useState(0);
  const [glassSize] = useState(250); // ml
  const [loading, setLoading] = useState(false);
  const [weeklyData, setWeeklyData] = useState([
    { day: 'Mon', intake: 0, goal: 8, date: '' },
    { day: 'Tue', intake: 0, goal: 8, date: '' },
    { day: 'Wed', intake: 0, goal: 8, date: '' },
    { day: 'Thu', intake: 0, goal: 8, date: '' },
    { day: 'Fri', intake: 0, goal: 8, date: '' },
    { day: 'Sat', intake: 0, goal: 8, date: '' },
    { day: 'Sun', intake: 0, goal: 8, date: '' }, // today
  ]);

  // Load water data on mount
  useEffect(() => {
    const loadWaterData = async () => {
      if (user?.id) {
        try {
          // Load today's intake
          const todayGlasses = await userApi.getTodayWaterIntake(user.id);
          setTodayIntake(todayGlasses);
          
          // Load weekly history (last 7 days)
          const history = await userApi.getWaterHistory(user.id, 7);
          
          // Create weekly data for the last 7 days
          const today = new Date();
          const weeklyData = [];
          const options: Intl.DateTimeFormatOptions = {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                            //hour: 'numeric',
                            //minute: 'numeric',
                            //second: 'numeric',
                            //timeZoneName: 'short', // Optional: to display the time zone abbreviation
                          };


          for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const formatter = new Intl.DateTimeFormat('en-CA', options);
            const formattedDate = formatter.format(date);
            //console.log(formattedDate);

            console.log('Processing date1:', formattedDate);
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayName = dayNames[date.getDay()];
            console.log('DAYNAME:', dayName.toString());
            //const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
            //console.log('Processing date:', dateString);
            // Find matching history entry for this date
            const historyEntry = history.find((h: any) => h.date === formattedDate);
            
            weeklyData.push({
              day: dayName,
              intake: historyEntry ? historyEntry.glasses : 0,
              goal: 8,
              date: formattedDate
            });
            console.log('Weekly data entry:', weeklyData[weeklyData.length - 1]);
            console.log('END OF LOOP');
          }
          
          setWeeklyData(weeklyData);
        } catch (error) {
          console.error('Failed to load water data:', error);
        }
      }
    };
    
    loadWaterData();
  }, [user?.id]);

  // Listen for water intake updates from other components (like Header)
  useEffect(() => {
    const handleWaterUpdate = (event: CustomEvent) => {
      if (event.detail.userId === user?.id) {
        setTodayIntake(event.detail.glasses);
        
        // Update today in weekly data (find today's date)
        const today = new Date().toISOString().split('T')[0];
        setWeeklyData(prev => prev.map(day => 
          day.date === today ? { ...day, intake: event.detail.glasses } : day
        ));
      }
    };

    window.addEventListener('waterIntakeUpdated', handleWaterUpdate as EventListener);
    
    return () => {
      window.removeEventListener('waterIntakeUpdated', handleWaterUpdate as EventListener);
    };
  }, [user?.id]);

  const reminders = [
    { time: '08:00', message: 'Start your day with a glass of water' },
    { time: '12:00', message: 'Lunch time hydration check' },
    { time: '15:00', message: 'Afternoon water break' },
    { time: '18:00', message: 'Evening hydration reminder' },
    { time: '21:00', message: 'Last glass before bed' },
  ];

  const addWater = async (glasses = 1) => {
    if (loading || !user?.id || todayIntake >= 15) return;
    
    setLoading(true);
    try {
      const newTotal = Math.min(todayIntake + glasses, 15);
      await userApi.setWaterIntake(user.id, newTotal);
      setTodayIntake(newTotal);
      
      // Update today in weekly data
      const today = new Date().toISOString().split('T')[0];
      setWeeklyData(prev => prev.map(day => 
        day.date === today ? { ...day, intake: newTotal } : day
      ));

      // Notify other components about the water intake update
      window.dispatchEvent(new CustomEvent('waterIntakeUpdated', {
        detail: { userId: user.id, glasses: newTotal }
      }));
    } catch (error) {
      console.error('Failed to add water:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeWater = async (glasses = 1) => {
    if (loading || !user?.id || todayIntake <= 0) return;
    
    setLoading(true);
    try {
      const newTotal = Math.max(todayIntake - glasses, 0);
      await userApi.setWaterIntake(user.id, newTotal);
      setTodayIntake(newTotal);
      
      // Update today in weekly data
      const today = new Date().toISOString().split('T')[0];
      setWeeklyData(prev => prev.map(day => 
        day.date === today ? { ...day, intake: newTotal } : day
      ));

      // Notify other components about the water intake update
      window.dispatchEvent(new CustomEvent('waterIntakeUpdated', {
        detail: { userId: user.id, glasses: newTotal }
      }));
    } catch (error) {
      console.error('Failed to remove water:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = () => {
    if (todayIntake === 0) return 'bg-red-500';
    if (todayIntake < 4) return 'bg-red-500';
    if (todayIntake >= 4 && todayIntake <= 6) return 'bg-yellow-500';
    return 'bg-green-500'; // 7+ glasses
  };

  const getCurrentStreak = () => {
    let streak = 0;
    // Count consecutive days from today backwards where goal was met
    for (let i = weeklyData.length - 1; i >= 0; i--) {
      if (weeklyData[i].intake >= weeklyData[i].goal) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
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
                    onClick={() => removeWater(1)}
                    disabled={loading || todayIntake === 0}
                    className="mb-2"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <p className="text-xs text-muted-foreground">-{glassSize}ml</p>
                </div>
                
                <div className="text-center">
                  {/* Large Water Bottle Visualization */}
                  <div className="relative flex flex-col items-center mb-2">
                    {/* Bottle Cap */}
                    <div className="w-8 h-4 bg-blue-600 rounded-t-lg mb-1 shadow-md"></div>
                    
                    {/* Bottle Neck */}
                    <div className="w-5 h-3 bg-gray-300 border border-gray-400"></div>
                    
                    {/* Main Bottle */}
                    <div className="relative w-16 h-24 bg-gradient-to-b from-gray-100 to-gray-300 rounded-b-3xl border-2 border-gray-500 overflow-hidden shadow-lg">
                      
                      {/* Always show water level with calculated height */}
                      <div 
                        className="absolute bottom-0 w-full rounded-b-3xl transition-all duration-500 bg-blue-400"
                        style={{ 
                          height: `${(todayIntake / dailyGoal) * 100}%`,
                          backgroundColor: todayIntake === 0 ? 'transparent' :
                            todayIntake < 4 ? '#f87171' : // red-400  
                            todayIntake <= 6 ? '#facc15' : // yellow-400
                            '#60a5fa' // blue-400
                        }}
                      />
                      
                      {/* Water Surface Animation - only show if water exists */}
                      <div 
                        className={`absolute inset-x-0 w-full bg-white h-0.5 animate-pulse ${todayIntake === 0 ? 'opacity-0' : 'opacity-80'}`}
                        style={{ 
                          bottom: `${(todayIntake / dailyGoal) * 100}%`
                        }}
                      />
                      
                      {/* Measurement lines */}
                      <div className="absolute inset-x-2 h-0.5 bg-gray-600 opacity-50" style={{ bottom: '87.5%' }}></div>
                      <div className="absolute inset-x-2 h-0.5 bg-gray-600 opacity-50" style={{ bottom: '75%' }}></div>
                      <div className="absolute inset-x-2 h-0.5 bg-gray-600 opacity-50" style={{ bottom: '62.5%' }}></div>
                      <div className="absolute inset-x-2 h-0.5 bg-gray-600 opacity-50" style={{ bottom: '50%' }}></div>
                      <div className="absolute inset-x-2 h-0.5 bg-gray-600 opacity-50" style={{ bottom: '37.5%' }}></div>
                      <div className="absolute inset-x-2 h-0.5 bg-gray-600 opacity-50" style={{ bottom: '25%' }}></div>
                      <div className="absolute inset-x-2 h-0.5 bg-gray-600 opacity-50" style={{ bottom: '12.5%' }}></div>
                      
                      {/* Droplet icon overlay */}
                      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <Droplets className={`w-6 h-6 ${todayIntake === 0 ? 'text-gray-400 opacity-40' : 'text-white opacity-90'} drop-shadow-md`} />
                      </div>
                    </div>
                    
                    {/* Bottle Brand Label */}
                    <div className="w-8 h-2 bg-blue-300 rounded-full mt-1 opacity-80 border border-blue-400 flex items-center justify-center">
                      <div className="text-[8px] font-bold text-blue-700">H₂O</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{glassSize}ml glass</p>
                </div>
                
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => addWater(1)}
                    disabled={loading || todayIntake >= 15}
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
                <span className="font-medium">{getCurrentStreak()} days</span>
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
          <div className="grid grid-cols-7 gap-4">
            {weeklyData.map((day, index) => (
              <div key={index} className="text-center">
                <p className="text-xs text-muted-foreground mb-2">{day.day}</p>
                <div className="relative h-20 w-8 mx-auto bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`absolute bottom-0 w-full transition-all duration-300 rounded-full ${
                      day.intake === 0 ? 'bg-red-500' :
                      day.intake < 4 ? 'bg-red-500' :
                      day.intake >= 4 && day.intake <= 6 ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}
                    style={{ 
                      height: `${Math.max(5, (day.intake / day.goal) * 100)}%`
                    }}
                  />
                </div>
                <p className="text-xs font-medium mt-2">
                  {day.intake}/{day.goal}
                </p>
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