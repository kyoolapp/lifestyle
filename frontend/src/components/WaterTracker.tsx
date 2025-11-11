import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { useUnitSystem } from '../context/UnitContext';
import { 
  Droplets, 
  Plus, 
  Minus,
  Target,
  Calendar,
  TrendingUp
} from 'lucide-react';
import * as userApi from '../api/user_api';
import { getBrowserTimezone } from '../utils/timezone';
import { useNotifications } from '../contexts/NotificationContext';

// Clean bubble animation with smooth water surface
const waveStyles = `
  /* Gentle water surface movement */
  @keyframes gentleWaterMovement {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-2px);
    }
  }
  
  /* Smooth water surface wave */
  @keyframes smoothWaterSurface {
    0% {
      clip-path: polygon(
        0% 0%, 
        10% 2%, 
        20% 1%, 
        30% 3%, 
        40% 2%, 
        50% 0%, 
        60% 1%, 
        70% 3%, 
        80% 2%, 
        90% 1%, 
        100% 2%, 
        100% 100%, 
        0% 100%
      );
    }
    25% {
      clip-path: polygon(
        0% 2%, 
        10% 0%, 
        20% 3%, 
        30% 1%, 
        40% 0%, 
        50% 2%, 
        60% 3%, 
        70% 1%, 
        80% 0%, 
        90% 2%, 
        100% 1%, 
        100% 100%, 
        0% 100%
      );
    }
    50% {
      clip-path: polygon(
        0% 1%, 
        10% 3%, 
        20% 0%, 
        30% 2%, 
        40% 3%, 
        50% 1%, 
        60% 0%, 
        70% 2%, 
        80% 3%, 
        90% 0%, 
        100% 2%, 
        100% 100%, 
        0% 100%
      );
    }
    75% {
      clip-path: polygon(
        0% 3%, 
        10% 1%, 
        20% 2%, 
        30% 0%, 
        40% 1%, 
        50% 3%, 
        60% 2%, 
        70% 0%, 
        80% 1%, 
        90% 3%, 
        100% 0%, 
        100% 100%, 
        0% 100%
      );
    }
    100% {
      clip-path: polygon(
        0% 0%, 
        10% 2%, 
        20% 1%, 
        30% 3%, 
        40% 2%, 
        50% 0%, 
        60% 1%, 
        70% 3%, 
        80% 2%, 
        90% 1%, 
        100% 2%, 
        100% 100%, 
        0% 100%
      );
    }
  }
  
  /* Simple bubble floating animation */
  @keyframes simpleBubbleFloat {
    0% {
      transform: translateY(40px) scale(0);
      opacity: 0;
    }
    10% {
      opacity: 0.7;
      transform: translateY(35px) scale(1);
    }
    90% {
      opacity: 0.5;
      transform: translateY(-30px) scale(1);
    }
    100% {
      transform: translateY(-40px) scale(0);
      opacity: 0;
    }
  }
  
  /* Subtle shimmer effect */
  @keyframes subtleShimmer {
    0% {
      opacity: 0.3;
      transform: translateX(-50px);
    }
    50% {
      opacity: 0.6;
      transform: translateX(0px);
    }
    100% {
      opacity: 0.3;
      transform: translateX(50px);
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

  /* Hide number input arrows */
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  input[type="number"] {
    -moz-appearance: textfield;
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
  const { addNotification } = useNotifications();
  //const [dailyGoal] = useState(8); // glasses
  const { unitSystem } = useUnitSystem();
  const [dailyGoal] = useState(8); // glasses (250ml each = 2 liters)
  const [todayIntake, setTodayIntake] = useState(0);
  const [customAmountMl, setCustomAmountMl] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderInterval, setReminderInterval] = useState(60); // minutes
  const [reminderInputValue, setReminderInputValue] = useState('60'); // for input display
  const [reminderIntervalId, setReminderIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);
  const [glassSize] = useState(250); // ml
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartValue, setDragStartValue] = useState(0);

  // Water conversion helpers
  const getWaterDisplayValue = (glasses: number) => {
    if (unitSystem === 'metric') {
      return (glasses * 0.25).toFixed(2); // 1 glass = 0.25 liters
    } else {
      return (glasses * 8.45).toFixed(1); // 1 glass = 8.45 fl oz
    }
  };

  const getWaterDisplayUnit = () => {
    return unitSystem === 'metric' ? 'L' : 'fl oz';
  };

  const getWaterGoalDisplay = (glasses: number) => {
    if (unitSystem === 'metric') {
      return (glasses * 0.25).toFixed(2) + 'L'; // 8 glasses = 2L
    } else {
      return Math.round(glasses * 8.45) + ' fl oz'; // 8 glasses = ~67.6 fl oz
    }
  };

  const getWaterButtonLabel = (glasses: number) => {
    if (unitSystem === 'metric') {
      return `${(glasses * 0.25).toFixed(2)}L`;
    } else {
      return `${(glasses * 8.45).toFixed(1)} fl oz`;
    }
  };
  const [weeklyData, setWeeklyData] = useState([
    { day: 'Mon', intake: 0, goal: 8, date: '' },
    { day: 'Tue', intake: 0, goal: 8, date: '' },
    { day: 'Wed', intake: 0, goal: 8, date: '' },
    { day: 'Thu', intake: 0, goal: 8, date: '' },
    { day: 'Fri', intake: 0, goal: 8, date: '' },
    { day: 'Sat', intake: 0, goal: 8, date: '' },
    { day: 'Sun', intake: 0, goal: 8, date: '' }, // today
  ]);

  // Function to refresh weekly data from backend
  const refreshWeeklyData = async () => {
    if (user?.id) {
      try {
        // Load weekly history (last 7 days) from backend
        const history = await userApi.getWaterHistory(user.id, 7);
        
        // Use user's stored timezone to compute dates (same as backend)
        const userTimezone = user?.timezone || getBrowserTimezone() || 'UTC';
        
        // Backend returns dates in user's timezone (YYYY-MM-DD format)
        // Frontend must compute dates using SAME timezone
        const weeklyData = [];
        
        // Generate 7 days backwards to match backend date range
        for (let i = 6; i >= 0; i--) {
          // Format date using Intl API with user's stored timezone
          const date = new Date();
          date.setDate(date.getDate() - i);
          
          // Format as YYYY-MM-DD using user's timezone
          const formatter = new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: userTimezone
          });
          const formattedDate = formatter.format(date);
          
          // Extract day name using the SAME timezone (user's timezone, not browser timezone)
          const dayFormatter = new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            timeZone: userTimezone
          });
          const dayName = dayFormatter.format(date);
          
          // Find matching history entry for this date
          const historyEntry = history.find((h: any) => h.date === formattedDate);
          
          weeklyData.push({
            day: dayName,
            intake: historyEntry ? historyEntry.glasses : 0,
            goal: 8,
            date: formattedDate
          });
        }
        
        setWeeklyData(weeklyData);
        console.log('Weekly water data refreshed from backend:', weeklyData);
      } catch (error) {
        console.error('Failed to refresh weekly water data:', error);
      }
    }
  };

  // Load water data on mount
  useEffect(() => {
    const loadWaterData = async () => {
      if (user?.id) {
        try {
          // Load today's intake
          const todayGlasses = await userApi.getTodayWaterIntake(user.id);
          setTodayIntake(todayGlasses);
          
          // Load weekly history
          await refreshWeeklyData();
        } catch (error) {
          console.error('Failed to load water data:', error);
        }
      }
    };
    
    loadWaterData();
  }, [user?.id, user?.timezone]);

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

      // Refresh weekly data from backend to ensure graph is in sync
      await refreshWeeklyData();

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

      // Refresh weekly data from backend to ensure graph is in sync
      await refreshWeeklyData();

      // Notify other components
      window.dispatchEvent(new CustomEvent('waterIntakeUpdated', {
        detail: { userId: user.id, glasses: newTotal }
      }));
    } catch (error) {
      console.error('Failed to remove water:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCustomAmount = async () => {
    const amount = parseFloat(customAmountMl);
    if (!amount || amount <= 0) return;

    let amountMl = amount;
    // Convert from user's unit to ml
    if (unitSystem === 'imperial') {
      // Input is in fl oz, convert to ml (1 fl oz = 29.5735 ml)
      amountMl = amount * 29.5735;
    }
    // If metric, amount is already in ml

    if (amountMl > 2500) return; // Max 10 glasses worth

    // Convert ml to glasses (250ml = 1 glass)
    const glasses = amountMl / glassSize;

    await addWater(glasses);
    setCustomAmountMl('');
  };

  const handleCustomAmountKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addCustomAmount();
    }
  };

  // Water Reminder Functions

  const showWaterReminder = () => {
    console.log('🔔 showWaterReminder called'); // Debug log
    const remaining = Math.max(0, dailyGoal - todayIntake);
    console.log(`Remaining glasses: ${remaining}`); // Debug log
    
    // Use in-app notification instead of browser notification
    addNotification({
      type: 'water',
      title: '💧 Time to Hydrate!',
      message: `Drink some water! You're at ${todayIntake.toFixed(1)}/${dailyGoal} glasses today. ${remaining.toFixed(1)} remaining.`,
      icon: <Droplets className="w-4 h-4" />,
      color: 'blue'
    });
    
    console.log('✅ In-app notification added to header bell'); // Debug log
  };

  const startWaterReminders = async () => {
    console.log('🚀 Starting water reminders...'); // Debug log
    
    // Validate interval is a positive number
    if (reminderInterval <= 0 || isNaN(reminderInterval)) {
      // Auto-correct to 1 minute and update display
      setReminderInterval(1);
      setReminderInputValue('1');
      addNotification({
        type: 'water',
        title: '⚠️ Invalid Interval',
        message: 'Reminder interval must be a positive number. Set to 1 minute.',
        icon: <Droplets className="w-4 h-4" />,
        color: 'orange'
      });
      return;
    }
    
    // Clear any existing reminder
    if (reminderIntervalId) {
      clearInterval(reminderIntervalId);
    }

    // Convert minutes to milliseconds
    const intervalMs = reminderInterval * 60 * 1000;
    console.log(`⏰ Setting reminder for every ${reminderInterval} minutes (${intervalMs}ms)`); // Debug log
    
    // Set up recurring reminders
    const id = setInterval(() => {
      console.log('⏳ Triggering water reminder...'); // Debug log
      showWaterReminder();
    }, intervalMs);

    setReminderIntervalId(id);
    setReminderEnabled(true);

    // Show confirmation using in-app notification
    addNotification({
      type: 'water',
      title: '✅ Water Reminders Started!',
      message: `You'll receive reminders every ${reminderInterval} minute${reminderInterval > 1 ? 's' : ''} in the header bell.`,
      icon: <Droplets className="w-4 h-4" />,
      color: 'green'
    });
    
    console.log('✅ Water reminders started successfully'); // Debug log
  };

  const stopWaterReminders = () => {
    if (reminderIntervalId) {
      clearInterval(reminderIntervalId);
      setReminderIntervalId(null);
    }
    setReminderEnabled(false);

    // Show confirmation using in-app notification
    addNotification({
      type: 'water',
      title: '⏹️ Water Reminders Stopped',
      message: 'Water reminders have been turned off.',
      icon: <Droplets className="w-4 h-4" />,
      color: 'gray'
    });
  };

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (reminderIntervalId) {
        clearInterval(reminderIntervalId);
      }
    };
  }, [reminderIntervalId]);

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
      
      // Refresh weekly data from backend to ensure graph is in sync
      await refreshWeeklyData();
      
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
                  {getWaterDisplayValue(todayIntake)}
                </div>
                <p className="text-muted-foreground text-sm md:text-base">{getWaterDisplayUnit()} of {getWaterGoalDisplay(dailyGoal)}</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {(todayIntake * glassSize).toFixed(0)}ml of {dailyGoal * glassSize}ml
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
                  <p className="text-xs text-muted-foreground">-{getWaterButtonLabel(1)}</p>
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
                      
                      {/* Clean Water Animation Like Reference */}
                      <div 
                        className="absolute bottom-0 w-full rounded-b-3xl transition-all duration-1000 ease-out overflow-hidden"
                        style={{ 
                          height: `${(todayIntake / dailyGoal) * 100}%`,
                        }}
                      >
                        {/* Simple water body */}
                        {todayIntake > 0 && (
                          <>
                            {/* Main water layer - Always blue with smooth wave surface */}
                            <div 
                              className="absolute inset-0 w-full h-full rounded-b-3xl"
                              style={{
                                background: '#06b6d4', // Always cyan blue
                                animation: 'smoothWaterSurface 6s ease-in-out infinite, gentleWaterMovement 4s ease-in-out infinite'
                              }}
                            />
                            
                            {/* Subtle water surface highlight */}
                            <div 
                              className="absolute top-0 left-0 w-full h-2"
                              style={{
                                background: `linear-gradient(to bottom, 
                                  rgba(255, 255, 255, 0.3) 0%, 
                                  transparent 100%)`,
                                borderRadius: '0 0 50% 50%'
                              }}
                            />
                            
                            {/* Simple shimmer effect */}
                            <div 
                              className="absolute top-2 left-4 w-8 h-1"
                              style={{
                                background: 'rgba(255, 255, 255, 0.4)',
                                borderRadius: '50px',
                                animation: 'subtleShimmer 3s ease-in-out infinite',
                                filter: 'blur(0.5px)'
                              }}
                            />
                            
                            {/* Clean floating bubbles like in reference */}
                            {(todayIntake / dailyGoal) > 0.2 && (
                              <>
                                <div 
                                  className="absolute w-2 h-2 rounded-full"
                                  style={{
                                    left: '30%',
                                    bottom: '20px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                    animation: 'simpleBubbleFloat 4s ease-in-out infinite',
                                    animationDelay: '0s'
                                  }}
                                />
                                <div 
                                  className="absolute w-1.5 h-1.5 rounded-full"
                                  style={{
                                    left: '60%',
                                    bottom: '15px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                    animation: 'simpleBubbleFloat 5s ease-in-out infinite',
                                    animationDelay: '1.5s'
                                  }}
                                />
                                <div 
                                  className="absolute w-1 h-1 rounded-full"
                                  style={{
                                    left: '45%',
                                    bottom: '25px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                                    animation: 'simpleBubbleFloat 3.5s ease-in-out infinite',
                                    animationDelay: '2.5s'
                                  }}
                                />
                                <div 
                                  className="absolute w-1 h-1 rounded-full"
                                  style={{
                                    left: '75%',
                                    bottom: '30px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    animation: 'simpleBubbleFloat 4.5s ease-in-out infinite',
                                    animationDelay: '1s'
                                  }}
                                />
                                <div 
                                  className="absolute w-0.5 h-0.5 rounded-full"
                                  style={{
                                    left: '20%',
                                    bottom: '35px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                                    animation: 'simpleBubbleFloat 3s ease-in-out infinite',
                                    animationDelay: '3s'
                                  }}
                                />
                              </>
                            )} 
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
                  <p className="text-xs text-muted-foreground">+{getWaterButtonLabel(1)}</p>
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
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => addWater(2)}
                    disabled={loading || todayIntake >= 15}
                    className="text-xs"
                  >
                    +{getWaterButtonLabel(2)}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => addWater(4)}
                    disabled={loading || todayIntake >= 15}
                    className="text-xs"
                  >
                    +{getWaterButtonLabel(4)}
                  </Button>
                </div>
                
                {/* Custom Amount Input */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Custom Amount ({unitSystem === 'metric' ? 'ml' : 'fl oz'})
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder={unitSystem === 'metric' ? '250' : '8'}
                      value={customAmountMl}
                      onChange={(e) => setCustomAmountMl(e.target.value)}
                      onKeyPress={handleCustomAmountKeyPress}
                      min="1"
                      max={unitSystem === 'metric' ? '2500' : '200'}
                      step="1"
                      className="flex-1 px-2 py-1 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      disabled={loading || todayIntake >= 15}
                    />
                    <Button 
                      size="sm"
                      onClick={addCustomAmount}
                      disabled={loading || todayIntake >= 15 || !customAmountMl || parseFloat(customAmountMl) <= 0}
                      className="text-xs px-3"
                    >
                      Add
                    </Button>
                  </div>

                </div>
              </div>
            </CardContent>
          </Card>

          {/* Water Reminder Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="w-5 h-5" />
                Water Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Reminder Status */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${reminderEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <div>
                    <p className="text-sm font-medium">
                      {reminderEnabled ? 'Active' : 'Inactive'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reminderEnabled ? `Every ${reminderInterval} min` : 'Set reminder interval'}
                    </p>
                  </div>
                </div>
                <Button
                  variant={reminderEnabled ? "destructive" : "default"}
                  size="sm"
                  onClick={reminderEnabled ? stopWaterReminders : startWaterReminders}
                  disabled={loading}
                  className="text-xs"
                >
                  {reminderEnabled ? 'Stop' : 'Start'}
                </Button>
              </div>

              {/* Interval Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Interval (minutes)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="480"
                      value={reminderInputValue}
                      onChange={(e) => {
                        const value = e.target.value;
                        setReminderInputValue(value);
                        
                        if (value !== '') {
                          const numValue = parseInt(value);
                          if (!isNaN(numValue) && numValue > 0) {
                            setReminderInterval(Math.min(480, numValue)); // Only enforce max, not min during typing
                          }
                        }
                      }}
                      onBlur={() => {
                        // On blur, ensure we have a valid positive value
                        if (reminderInputValue === '' || isNaN(parseInt(reminderInputValue)) || parseInt(reminderInputValue) <= 0) {
                          setReminderInputValue('1');
                          setReminderInterval(1);
                        } else {
                          const numValue = Math.max(1, Math.min(480, parseInt(reminderInputValue)));
                          setReminderInputValue(numValue.toString());
                          setReminderInterval(numValue);
                        }
                      }}
                      className="w-16 px-2 py-1 text-sm border border-border rounded bg-background"
                      style={{
                        MozAppearance: 'textfield',
                        WebkitAppearance: 'none',
                        margin: 0
                      }}
                      onWheel={(e) => e.currentTarget.blur()}
                      disabled={reminderEnabled}
                    />
                    <span className="text-xs text-muted-foreground">min</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-2 gap-2">
                  {[30, 60].map((minutes) => (
                    <Button
                      key={minutes}
                      variant={reminderInterval === minutes ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setReminderInterval(minutes);
                        setReminderInputValue(minutes.toString());
                      }}
                      disabled={reminderEnabled}
                      className="text-xs"
                    >
                      {minutes}m
                    </Button>
                  ))}
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
                <span className="text-sm">Today's Intake</span>
                <span className="font-medium">
                  {(todayIntake * glassSize).toFixed(0)}ml ({todayIntake.toFixed(2)} glasses)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Remaining</span>
                <span className="font-medium">
                  {Math.max(0, dailyGoal - todayIntake).toFixed(2)} glasses
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