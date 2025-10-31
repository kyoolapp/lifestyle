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

// CSS animations for liquid sloshing effects
const waveStyles = `
  @keyframes waterSlosh {
    0% {
      clip-path: polygon(0% 0%, 12% 8%, 25% 3%, 37% 12%, 50% 5%, 62% 15%, 75% 7%, 87% 18%, 100% 10%, 100% 100%, 0% 100%);
      transform: translateX(0) scale(1) rotateZ(0deg);
    }
    12.5% {
      clip-path: polygon(0% 15%, 12% 2%, 25% 20%, 37% 6%, 50% 22%, 62% 8%, 75% 25%, 87% 4%, 100% 18%, 100% 100%, 0% 100%);
      transform: translateX(-2px) scale(1.03) rotateZ(0.5deg);
    }
    25% {
      clip-path: polygon(0% 8%, 12% 18%, 25% 5%, 37% 25%, 50% 12%, 62% 28%, 75% 15%, 87% 30%, 100% 20%, 100% 100%, 0% 100%);
      transform: translateX(-3px) scale(1.05) rotateZ(1deg);
    }
    37.5% {
      clip-path: polygon(0% 25%, 12% 10%, 25% 30%, 37% 15%, 50% 35%, 62% 18%, 75% 32%, 87% 12%, 100% 28%, 100% 100%, 0% 100%);
      transform: translateX(-2px) scale(1.02) rotateZ(0.5deg);
    }
    50% {
      clip-path: polygon(0% 18%, 12% 35%, 25% 20%, 37% 40%, 50% 25%, 62% 45%, 75% 30%, 87% 42%, 100% 35%, 100% 100%, 0% 100%);
      transform: translateX(0) scale(0.97) rotateZ(0deg);
    }
    62.5% {
      clip-path: polygon(0% 40%, 12% 25%, 25% 45%, 37% 28%, 50% 48%, 62% 32%, 75% 50%, 87% 35%, 100% 45%, 100% 100%, 0% 100%);
      transform: translateX(2px) scale(1.02) rotateZ(-0.5deg);
    }
    75% {
      clip-path: polygon(0% 30%, 12% 50%, 25% 35%, 37% 55%, 50% 38%, 62% 58%, 75% 42%, 87% 60%, 100% 48%, 100% 100%, 0% 100%);
      transform: translateX(3px) scale(1.05) rotateZ(-1deg);
    }
    87.5% {
      clip-path: polygon(0% 55%, 12% 40%, 25% 60%, 37% 45%, 50% 65%, 62% 48%, 75% 62%, 87% 50%, 100% 58%, 100% 100%, 0% 100%);
      transform: translateX(2px) scale(1.03) rotateZ(-0.5deg);
    }
    100% {
      clip-path: polygon(0% 45%, 12% 65%, 25% 48%, 37% 68%, 50% 52%, 62% 70%, 75% 55%, 87% 72%, 100% 60%, 100% 100%, 0% 100%);
      transform: translateX(0) scale(1) rotateZ(0deg);
    }
  }
  
  @keyframes surfaceSlosh {
    0% {
      clip-path: polygon(0% 50%, 16% 30%, 33% 60%, 50% 25%, 66% 65%, 83% 20%, 100% 55%, 100% 100%, 0% 100%);
      transform: translateX(0) scaleY(1);
    }
    16.6% {
      clip-path: polygon(0% 20%, 16% 70%, 33% 35%, 50% 80%, 66% 40%, 83% 75%, 100% 30%, 100% 100%, 0% 100%);
      transform: translateX(-3px) scaleY(1.1);
    }
    33.3% {
      clip-path: polygon(0% 75%, 16% 45%, 33% 85%, 50% 50%, 66% 90%, 83% 55%, 100% 80%, 100% 100%, 0% 100%);
      transform: translateX(-4px) scaleY(1.15);
    }
    50% {
      clip-path: polygon(0% 60%, 16% 90%, 33% 55%, 50% 95%, 66% 60%, 83% 100%, 100% 65%, 100% 100%, 0% 100%);
      transform: translateX(0) scaleY(1.2);
    }
    66.6% {
      clip-path: polygon(0% 95%, 16% 65%, 33% 100%, 50% 70%, 66% 95%, 83% 75%, 100% 90%, 100% 100%, 0% 100%);
      transform: translateX(4px) scaleY(1.15);
    }
    83.3% {
      clip-path: polygon(0% 80%, 16% 100%, 33% 75%, 50% 95%, 66% 80%, 83% 90%, 100% 75%, 100% 100%, 0% 100%);
      transform: translateX(3px) scaleY(1.1);
    }
    100% {
      clip-path: polygon(0% 50%, 16% 30%, 33% 60%, 50% 25%, 66% 65%, 83% 20%, 100% 55%, 100% 100%, 0% 100%);
      transform: translateX(0) scaleY(1);
    }
  }
  
  @keyframes wave {
    0%, 100% {
      transform: translateX(0) scaleX(1);
      opacity: 0.3;
    }
    25% {
      transform: translateX(-2px) scaleX(1.1);
      opacity: 0.6;
    }
    50% {
      transform: translateX(0) scaleX(0.9);
      opacity: 0.4;
    }
    75% {
      transform: translateX(2px) scaleX(1.1);
      opacity: 0.7;
    }
  }

  /* Custom slider styles */
  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    transition: transform 0.2s ease;
  }

  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }

  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  }
`;

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = waveStyles;
  if (!document.head.querySelector('style[data-water-animations]')) {
    styleElement.setAttribute('data-water-animations', 'true');
    document.head.appendChild(styleElement);
  }
}

interface WaterTrackerProps {
  user: any;
}

export function WaterTracker({ user }: WaterTrackerProps) {
  const [dailyGoal] = useState(8); // glasses
  const [todayIntake, setTodayIntake] = useState(0);
  const [glassSize] = useState(250); // ml
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartValue, setDragStartValue] = useState(0);
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

  // Interactive bottle sliding handlers
  const handleBottleMouseDown = (e: React.MouseEvent) => {
    if (loading) return;
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragStartValue(todayIntake);
    e.preventDefault();
  };

  const handleBottleTouchStart = (e: React.TouchEvent) => {
    if (loading) return;
    setIsDragging(true);
    setDragStartY(e.touches[0].clientY);
    setDragStartValue(todayIntake);
    e.preventDefault();
  };

  // Enhanced mouse and touch move handlers for bottle
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = dragStartY - e.clientY; // Inverted for intuitive dragging
      const sensitivity = 8; // More sensitive for better control (8px = 1 glass)
      const change = deltaY / sensitivity;
      const newValue = Math.max(0, Math.min(15, dragStartValue + change));
      
      // Allow fractional values for smoother dragging, round to nearest 0.25
      const roundedValue = Math.round(newValue * 4) / 4;
      
      if (Math.abs(roundedValue - todayIntake) >= 0.25) {
        setWaterIntakeDirectly(roundedValue);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const deltaY = dragStartY - e.touches[0].clientY;
      const sensitivity = 8; // More sensitive for touch
      const change = deltaY / sensitivity;
      const newValue = Math.max(0, Math.min(15, dragStartValue + change));
      
      // Allow fractional values for smoother dragging
      const roundedValue = Math.round(newValue * 4) / 4;
      
      if (Math.abs(roundedValue - todayIntake) >= 0.25) {
        setWaterIntakeDirectly(roundedValue);
      }
      e.preventDefault();
    };

    const handleEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        // Save the final value to backend
        saveWaterIntake(todayIntake);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, dragStartY, dragStartValue, todayIntake]);

  // Direct water intake setter for smooth dragging
  const setWaterIntakeDirectly = (newValue: number) => {
    setTodayIntake(newValue);
    
    // Update today in weekly data
    const today = new Date().toISOString().split('T')[0];
    setWeeklyData(prev => prev.map(day => 
      day.date === today ? { ...day, intake: newValue } : day
    ));
  };

  // Save water intake to backend (called after dragging ends)
  const saveWaterIntake = async (value: number) => {
    if (!user?.id) return;
    
    try {
      await userApi.setWaterIntake(user.id, value);
      
      // Notify other components about the water intake update
      window.dispatchEvent(new CustomEvent('waterIntakeUpdated', {
        detail: { userId: user.id, glasses: value }
      }));
    } catch (error) {
      console.error('Failed to save water intake:', error);
    }
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
    <div className="space-y-4 px-2 md:px-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold">Water Tracker</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Stay hydrated and track your daily water intake</p>
      </div>

      {/* Today's Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4 md:mb-6">
                <div className="text-4xl md:text-6xl font-bold text-blue-500 mb-2">
                  {todayIntake}
                </div>
                <p className="text-muted-foreground text-sm md:text-base">of {dailyGoal} glasses</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {todayIntake * glassSize}ml of {dailyGoal * glassSize}ml
                </p>
              </div>

              <Progress 
                value={(todayIntake / dailyGoal) * 100} 
                className="h-2 md:h-3 mb-3 md:mb-4"
              />

              <div className="flex items-center justify-center gap-3 md:gap-4 mb-3 md:mb-4">
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeWater(1)}
                    disabled={loading || todayIntake === 0}
                    className="mb-1 md:mb-2 w-10 h-10 md:w-12 md:h-12"
                  >
                    <Minus className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                  <p className="text-xs text-muted-foreground">-{glassSize}ml</p>
                </div>
                
                <div className="text-center relative">
                  {/* Interactive Water Bottle with Slider */}
                  <div className="relative flex flex-col items-center mb-2 group">
                    {/* Bottle Cap */}
                    <div className="w-8 h-4 bg-blue-600 rounded-t-lg mb-1 shadow-md"></div>
                    
                    {/* Bottle Neck */}
                    <div className="w-5 h-3 bg-gray-300 border border-gray-400"></div>
                    
                    {/* Main Bottle with Interactive Slider */}
                    <div 
                      className={`relative w-16 h-24 bg-gradient-to-b from-gray-100 to-gray-300 rounded-b-3xl border-2 overflow-hidden shadow-lg select-none transition-all duration-150 ${
                        isDragging 
                          ? 'border-blue-500 shadow-xl cursor-grabbing scale-105' 
                          : 'border-gray-500 cursor-grab hover:border-blue-400 hover:shadow-xl'
                      }`}
                      onMouseDown={(e) => handleBottleMouseDown(e)}
                      onTouchStart={(e) => handleBottleTouchStart(e)}
                    >
                      
                      {/* Animated water level with full sloshing effect */}
                      <div 
                        className="absolute bottom-0 w-full rounded-b-3xl transition-all duration-700 ease-out overflow-hidden"
                        style={{ 
                          height: `${(todayIntake / dailyGoal) * 100}%`,
                        }}
                      >
                        {/* Main water body with sloshing animation */}
                        {todayIntake > 0 && (
                          <>
                            {/* Primary sloshing water layer */}
                            <div 
                              className="absolute inset-0 w-full h-full rounded-b-3xl"
                              style={{
                                background: `linear-gradient(180deg, ${
                                  todayIntake < 4 ? '#f87171, #dc2626' : 
                                  todayIntake <= 6 ? '#facc15, #eab308' : 
                                  '#60a5fa, #3b82f6'
                                })`,
                                clipPath: 'polygon(0% 0%, 15% 5%, 30% 0%, 45% 8%, 60% 2%, 75% 6%, 90% 1%, 100% 4%, 100% 100%, 0% 100%)',
                                animation: 'waterSlosh 2.8s ease-in-out infinite'
                              }}
                            />
                            
                            {/* Secondary sloshing layer for depth */}
                            <div 
                              className="absolute inset-0 w-full h-full rounded-b-3xl"
                              style={{
                                background: `linear-gradient(180deg, ${
                                  todayIntake < 4 ? '#fca5a5, #f87171' : 
                                  todayIntake <= 6 ? '#fde047, #facc15' : 
                                  '#93c5fd, #60a5fa'
                                })`,
                                clipPath: 'polygon(0% 3%, 20% 0%, 40% 6%, 60% 1%, 80% 4%, 100% 0%, 100% 100%, 0% 100%)',
                                animation: 'waterSlosh 2.1s ease-in-out infinite reverse',
                                opacity: 0.7
                              }}
                            />
                            
                            {/* Multi-layer wave effects */}
                            
                            {/* Primary surface wave */}
                            <div 
                              className="absolute top-0 left-0 w-full h-6"
                              style={{
                                background: `linear-gradient(180deg, 
                                  ${todayIntake < 4 ? 'rgba(248, 113, 113, 0.9)' : 
                                    todayIntake <= 6 ? 'rgba(250, 204, 21, 0.9)' : 
                                    'rgba(96, 165, 250, 0.9)'} 0%, 
                                  transparent 100%)`,
                                clipPath: 'polygon(0% 50%, 16% 30%, 33% 60%, 50% 25%, 66% 65%, 83% 20%, 100% 55%, 100% 100%, 0% 100%)',
                                animation: 'surfaceSlosh 3s ease-in-out infinite'
                              }}
                            />
                            
                            {/* Secondary wave layer */}
                            <div 
                              className="absolute top-1 left-0 w-full h-4"
                              style={{
                                background: `linear-gradient(180deg, 
                                  ${todayIntake < 4 ? 'rgba(220, 38, 38, 0.6)' : 
                                    todayIntake <= 6 ? 'rgba(234, 179, 8, 0.6)' : 
                                    'rgba(59, 130, 246, 0.6)'} 0%, 
                                  transparent 100%)`,
                                clipPath: 'polygon(0% 70%, 20% 45%, 40% 75%, 60% 40%, 80% 80%, 100% 50%, 100% 100%, 0% 100%)',
                                animation: 'surfaceSlosh 2.2s ease-in-out infinite reverse'
                              }}
                            />
                            
                            {/* Tertiary ripple layer */}
                            <div 
                              className="absolute top-2 left-0 w-full h-3"
                              style={{
                                background: `linear-gradient(180deg, 
                                  ${todayIntake < 4 ? 'rgba(185, 28, 28, 0.4)' : 
                                    todayIntake <= 6 ? 'rgba(202, 138, 4, 0.4)' : 
                                    'rgba(37, 99, 235, 0.4)'} 0%, 
                                  transparent 100%)`,
                                clipPath: 'polygon(0% 60%, 25% 80%, 50% 55%, 75% 85%, 100% 65%, 100% 100%, 0% 100%)',
                                animation: 'surfaceSlosh 1.8s ease-in-out infinite'
                              }}
                            />
                            

                          </>
                        )}
                      </div>
                      

                    </div>
                    
                    {/* Bottle Brand Label */}
                    <div className="w-8 h-2 bg-blue-300 rounded-full mt-1 opacity-80 border border-blue-400 flex items-center justify-center">
                      <div className="text-[8px] font-bold text-blue-700">H₂O</div>
                    </div>
                    
                    {/* Enhanced drag indicator */}
                    {isDragging && (
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap z-30 shadow-lg border-2 border-white">
                        <div className="text-center">
                          <div className="font-bold">{todayIntake % 1 === 0 ? todayIntake : todayIntake.toFixed(1)} / {dailyGoal}</div>
                          <div className="text-xs opacity-90">{(todayIntake * glassSize).toFixed(0)}ml</div>
                        </div>
                        {/* Arrow pointing to bottle */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-blue-600"></div>
                      </div>
                    )}
                    
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">{glassSize}ml per glass</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className="text-xs text-blue-500">↕️</span>
                      <p className="text-xs text-blue-500">Drag bottle up/down</p>
                    </div>
                    {isDragging && (
                      <p className="text-xs text-green-500 font-medium mt-1 animate-pulse">
                        Keep dragging...
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => addWater(1)}
                    disabled={loading || todayIntake >= 15}
                    className="mb-1 md:mb-2 w-10 h-10 md:w-12 md:h-12"
                  >
                    <Plus className="w-3 h-3 md:w-4 md:h-4" />
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

              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-medium mb-2">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => addWater(2)}
                    disabled={loading || todayIntake >= 15}
                    className="text-xs"
                  >
                    +2 Glasses
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => addWater(4)}
                    disabled={loading || todayIntake >= 15}
                    className="text-xs"
                  >
                    +4 Glasses
                  </Button>
                </div>
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
          <div className="grid grid-cols-7 gap-1 md:gap-4">
            {weeklyData.map((day, index) => (
              <div key={index} className="text-center">
                <p className="text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2">{day.day}</p>
                <div className="relative h-16 md:h-20 w-6 md:w-8 mx-auto bg-gray-200 rounded-full overflow-hidden">
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
                <p className="text-[10px] md:text-xs font-medium mt-1 md:mt-2">
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