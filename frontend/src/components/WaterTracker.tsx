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
  TrendingUp,
  Flame
} from 'lucide-react';
import * as userApi from '../api/user_api';
import { getBrowserTimezone } from '../utils/timezone';
import { useNotifications } from '../contexts/NotificationContext';
import { useStreak, formatStreakDisplay } from '../hooks/useStreak';

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

  /* Glass tumbler animations */
  .glass-reflection {
    background: linear-gradient(135deg, 
      rgba(255,255,255,0.4) 0%, 
      transparent 30%, 
      transparent 70%, 
      rgba(255,255,255,0.2) 100%);
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
  const { streak, updateUserStreak } = useStreak('water', true);
  const [dailyGoal] = useState(8); // glasses (250ml each = 2 liters)
  const [todayIntake, setTodayIntake] = useState(0);
  const [customAmountMl, setCustomAmountMl] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showDragTumblerModal, setShowDragTumblerModal] = useState(false);
  const [dragTumblerAmount, setDragTumblerAmount] = useState(0);
  const [dragBigTumblerAmount, setDragBigTumblerAmount] = useState(0);
  const [showBigTumbler, setShowBigTumbler] = useState(false);
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

  const getWaterDetailedDisplay = (glasses: number) => {
    if (unitSystem === 'metric') {
      return `${(glasses * 250).toFixed(0)}ml`; // 1 glass = 250ml
    } else {
      return `${(glasses * 8.45).toFixed(1)} fl oz`; // 1 glass = 8.45 fl oz
    }
  };

  const getWaterGoalDetailed = (glasses: number) => {
    if (unitSystem === 'metric') {
      return `${(glasses * 250).toFixed(0)}ml`; // 8 glasses = 2000ml
    } else {
      return `${Math.round(glasses * 8.45)} fl oz`; // 8 glasses = ~67.6 fl oz
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
    if (loading || !user?.id || todayIntake >= 8) return;
    
    setLoading(true);
    try {
      const newTotal = Math.min(todayIntake + glasses, 8);
      await userApi.setWaterIntake(user.id, newTotal);
      setTodayIntake(newTotal);
      
      // Update streak for water logging
      await updateUserStreak();
      
      // Update today in weekly data
      const today = new Date().toISOString().split('T')[0];
      setWeeklyData(prev => prev.map(day => 
        day.date === today ? { ...day, intake: newTotal } : day
      ));

      // Refresh weekly data from backend to ensure graph is in sync
      await refreshWeeklyData();

      // Notify other components about the water intake update
      console.log('[WaterTracker] Dispatching waterIntakeUpdated event:', { userId: user.id, glasses: newTotal, glassesAdded: glasses });
      window.dispatchEvent(new CustomEvent('waterIntakeUpdated', {
        detail: { userId: user.id, glasses: newTotal, glassesAdded: glasses }
      }));
      
      // Dispatch activity feed refresh event
      console.log('[WaterTracker] Dispatching activityUpdated event:', { userId: user.id, type: 'water', glassesAdded: glasses });
      window.dispatchEvent(new CustomEvent('activityUpdated', {
        detail: { userId: user.id, type: 'water', glassesAdded: glasses }
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
      
      // Update streak (only if we're still above 0 intake)
      if (newTotal > 0) {
        await updateUserStreak();
      }
      
      // Update today in weekly data
      const today = new Date().toISOString().split('T')[0];
      setWeeklyData(prev => prev.map(day => 
        day.date === today ? { ...day, intake: newTotal } : day
      ));

      // Refresh weekly data from backend to ensure graph is in sync
      await refreshWeeklyData();

      // Notify other components
      window.dispatchEvent(new CustomEvent('waterIntakeUpdated', {
        detail: { userId: user.id, glasses: newTotal, glassesRemoved: glasses }
      }));
      
      // Dispatch activity feed refresh event
      window.dispatchEvent(new CustomEvent('activityUpdated', {
        detail: { userId: user.id, type: 'water', glassesAdded: -glasses }
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

  // Interactive bottle sliding handlers - DISABLED
  /*
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
      const newValue = Math.max(0, Math.min(8, dragStartValue + change));
      
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
      const newValue = Math.max(0, Math.min(8, dragStartValue + change));
      
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
  */

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
                <p className="text-xs md:text-sm text-muted-foreground">
                  {getWaterDetailedDisplay(todayIntake)} of {getWaterGoalDetailed(dailyGoal)}
                </p>
              </div>

              <Progress 
                value={(todayIntake / dailyGoal) * 100} 
                className="h-2 md:h-3 mb-3 md:mb-4"
              />

              <div className="flex items-center justify-center mb-3 md:mb-4">
                <div className="text-center relative">
                  {/* Sport Water Bottle with Handle */}
                  <div className="relative flex flex-col items-center mb-2">
                    
                    {/* Water Bottle SVG */}
                    <div className="relative mx-auto" style={{ width: '220px', height: '300px' }}>
                      <svg 
                        viewBox="0 0 220 300" 
                        className="w-full h-full"
                        style={{ 
                          filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.15))',
                          overflow: 'visible'
                        }}
                      >
                        {/* Bottle Cap with Spout */}
                        <g>
                          {/* Spout/Mouthpiece - centered */}
                          <ellipse cx="110" cy="18" rx="12" ry="6" fill="#00BCD4" />
                          <rect x="98" y="18" width="24" height="8" fill="#00BCD4" />
                          <ellipse cx="110" cy="26" rx="12" ry="6" fill="#0097A7" />
                          
                          {/* Spout lid */}
                          <ellipse cx="110" cy="12" rx="14" ry="7" fill="#263238" opacity="0.9" />
                          <rect x="96" y="12" width="28" height="6" fill="#263238" opacity="0.8" />
                          
                          {/* Bottle Cap Top - centered */}
                          <ellipse cx="110" cy="32" rx="35" ry="10" fill="#546E7A" />
                          <rect x="75" y="32" width="70" height="20" fill="#546E7A" />
                          
                          {/* Cap ridges for grip */}
                          <line x1="82" y1="34" x2="82" y2="50" stroke="#455A64" strokeWidth="2" />
                          <line x1="90" y1="34" x2="90" y2="50" stroke="#455A64" strokeWidth="2" />
                          <line x1="98" y1="34" x2="98" y2="50" stroke="#455A64" strokeWidth="2" />
                          <line x1="106" y1="34" x2="106" y2="50" stroke="#455A64" strokeWidth="2" />
                          <line x1="114" y1="34" x2="114" y2="50" stroke="#455A64" strokeWidth="2" />
                          <line x1="122" y1="34" x2="122" y2="50" stroke="#455A64" strokeWidth="2" />
                          <line x1="130" y1="34" x2="130" y2="50" stroke="#455A64" strokeWidth="2" />
                          <line x1="138" y1="34" x2="138" y2="50" stroke="#455A64" strokeWidth="2" />
                          
                          {/* Cap ring */}
                          <ellipse cx="110" cy="52" rx="35" ry="10" fill="#00BCD4" />
                          <rect x="75" y="52" width="70" height="8" fill="#00BCD4" />
                          <ellipse cx="110" cy="60" rx="35" ry="10" fill="#0097A7" />
                        </g>

                        {/* Handle/Loop */}
                        <g>
                          {/* Outer handle loop - cyan */}
                          <path 
                            d="M 150 80 Q 175 105 175 130 Q 175 155 150 180" 
                            fill="none" 
                            stroke="#00BCD4" 
                            strokeWidth="12"
                            strokeLinecap="round"
                          />
                          {/* Inner handle loop - dark navy */}
                          <path 
                            d="M 150 80 Q 169 105 169 130 Q 169 155 150 180" 
                            fill="none" 
                            stroke="#263238" 
                            strokeWidth="8"
                            strokeLinecap="round"
                          />
                        </g>

                        {/* Bottle Body - Main Container - Wider */}
                        <g>
                          {/* Navy blue outline/border */}
                          <path 
                            d="M 70 65 L 150 65 L 150 250 Q 150 265 132 265 L 88 265 Q 70 265 70 250 Z" 
                            fill="none" 
                            stroke="#263238" 
                            strokeWidth="8"
                            strokeLinejoin="round"
                          />
                          
                          {/* Light blue bottle body background */}
                          <path 
                            d="M 74 68 L 146 68 L 146 250 Q 146 261 132 261 L 88 261 Q 74 261 74 250 Z" 
                            fill="#B3E5FC"
                            opacity="0.4"
                          />
                          
                          {/* Glass reflection on left side */}
                          <path 
                            d="M 85 75 Q 89 80 89 90 L 89 245 Q 89 250 85 253" 
                            fill="none" 
                            stroke="white" 
                            strokeWidth="14"
                            opacity="0.6"
                            strokeLinecap="round"
                          />
                          
                          {/* Animated shimmer */}
                          <path 
                            d="M 90 80 L 90 240" 
                            fill="none" 
                            stroke="white" 
                            strokeWidth="8"
                            opacity="0.5"
                            strokeLinecap="round"
                            style={{ animation: 'waterShine 3s ease-in-out infinite' }}
                          />
                        </g>

                        {/* Water Level Fill */}
                        <defs>
                          <clipPath id="bottleClip">
                            <path d="M 74 68 L 146 68 L 146 250 Q 146 261 132 261 L 88 261 Q 74 261 74 250 Z" />
                          </clipPath>
                          <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#00BCD4" stopOpacity="1" />
                            <stop offset="50%" stopColor="#0097A7" stopOpacity="0.95" />
                            <stop offset="100%" stopColor="#00838F" stopOpacity="0.9" />
                          </linearGradient>
                        </defs>
                        
                        <g clipPath="url(#bottleClip)">
                          {/* Water fill with gradient */}
                          <rect 
                            x="74" 
                            y={261 - (todayIntake / dailyGoal) * 193}
                            width="72" 
                            height={(todayIntake / dailyGoal) * 193}
                            fill="url(#waterGradient)"
                            style={{
                              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                          />
                          
                          {/* Water surface wave */}
                          <ellipse 
                            cx="110" 
                            cy={261 - (todayIntake / dailyGoal) * 193}
                            rx="36" 
                            ry="5"
                            fill="#00BCD4"
                            opacity="0.7"
                            style={{
                              animation: 'smoothWaterSurface 4s ease-in-out infinite',
                              transition: 'cy 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                          />
                          
                          {/* Water surface shine */}
                          <line 
                            x1="88" 
                            y1={261 - (todayIntake / dailyGoal) * 193 + 2}
                            x2="110" 
                            y2={261 - (todayIntake / dailyGoal) * 193 + 2}
                            stroke="white" 
                            strokeWidth="2"
                            opacity="0.6"
                            style={{
                              transition: 'y1 0.8s cubic-bezier(0.4, 0, 0.2, 1), y2 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                          />
                          
                          {/* Animated bubbles */}
                          {todayIntake > 0 && (
                            <>
                              <circle 
                                cx="100" 
                                cy={253 - (todayIntake / dailyGoal) * 193}
                                r="3.5" 
                                fill="white" 
                                opacity="0.5"
                                style={{ animation: 'simpleBubbleFloat 4s ease-in-out infinite' }}
                              />
                              <circle 
                                cx="120" 
                                cy={250 - (todayIntake / dailyGoal) * 193}
                                r="3" 
                                fill="white" 
                                opacity="0.4"
                                style={{ animation: 'simpleBubbleFloat 5s ease-in-out infinite 1s' }}
                              />
                              <circle 
                                cx="108" 
                                cy={255 - (todayIntake / dailyGoal) * 193}
                                r="2.5" 
                                fill="white" 
                                opacity="0.5"
                                style={{ animation: 'simpleBubbleFloat 4.5s ease-in-out infinite 2s' }}
                              />
                            </>
                          )}
                        </g>

                        {/* Bottle shadow/base */}
                        <ellipse cx="110" cy="273" rx="40" ry="8" fill="#B3E5FC" opacity="0.4" />
                      </svg>
                    </div>
                    
                  </div>
                  
                  {/* Custom Amount and Drag Tumbler Buttons */}
                  <div className="flex justify-center gap-3 mt-3">
                    <button
                      onClick={() => setShowCustomModal(true)}
                      disabled={loading || todayIntake >= 8}
                      className="w-12 h-12 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors flex items-center justify-center disabled:opacity-50 shadow-sm"
                      title="Add custom amount"
                    >
                      <div className="grid grid-cols-3 gap-0.5">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setShowDragTumblerModal(true)}
                      disabled={loading || todayIntake >= 8}
                      className="w-12 h-12 rounded-full bg-green-100 hover:bg-green-200 transition-colors flex items-center justify-center disabled:opacity-50 shadow-sm"
                      title="Drag water amount"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 2L16 2C17.1 2 18 2.9 18 4L17 20C17 21.1 16.1 22 15 22L9 22C7.9 22 7 21.1 7 20L6 4C6 2.9 6.9 2 8 2Z" stroke="#10b981" strokeWidth="2" fill="none"/>
                        <path d="M8 14L16 14L15.5 20L8.5 20Z" fill="#10b981" opacity="0.3"/>
                      </svg>
                    </button>

                    <button
                      onClick={async () => {
                        if (loading || todayIntake >= 8) return;
                        const glassesEquivalent = 250 / glassSize;
                        await addWater(glassesEquivalent);
                      }}
                      disabled={loading || todayIntake >= 8}
                      className="w-12 h-12 rounded-full bg-cyan-100 hover:bg-cyan-200 transition-colors flex items-center justify-center disabled:opacity-50 shadow-sm"
                      title="Quick add 250ml"
                    >
                      <div className="flex flex-col items-center justify-center gap-0">
                        <Droplets className="w-3 h-3 text-cyan-600" />
                        <div className="text-[3 px] text-cyan-600 leading-[0.6rem]">250ml</div>
                      </div>  
                    </button>

                    <button
                      onClick={async () => {
                        if (loading || todayIntake <= 0) return;
                        const glassesEquivalent = 250 / glassSize;
                        const newIntake = Math.max(0, todayIntake - glassesEquivalent);
                        await saveWaterIntake(newIntake);
                        setTodayIntake(newIntake);
                        const today = new Date().toISOString().split('T')[0];
                        setWeeklyData(prev => prev.map(day => 
                          day.date === today ? { ...day, intake: newIntake } : day
                        ));
                      }}
                      disabled={loading || todayIntake <= 0}
                      className="w-12 h-12 rounded-full bg-red-100 hover:bg-red-200 transition-colors flex items-center justify-center disabled:opacity-50 shadow-sm"
                      title="Remove 250ml"
                    >
                      <div className="flex flex-col items-center justify-center gap-0">
                        <Droplets className="w-3 h-3 text-red-600" />
                        <div className="text-[3 px] text-red-600 leading-[0.6rem]">-250ml</div>
                      </div>  
                    </button>
                  </div>  
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
                  {getWaterDetailedDisplay(todayIntake)} ({todayIntake.toFixed(2)} glasses)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Remaining</span>
                <span className="font-medium">
                  {getWaterDetailedDisplay(Math.max(0, dailyGoal - todayIntake))}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Streak
                  </span>
                  <Badge variant="secondary" className="text-base">
                    {streak.current_streak} day{streak.current_streak !== 1 ? 's' : ''}
                  </Badge>
                </div>
                {streak.start_date && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Started {streak.start_date}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Average this week</span>
                <span className="font-medium">
                  {getWaterDetailedDisplay(weeklyData.reduce((sum, day) => sum + day.intake, 0) / weeklyData.length)}
                </span>
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
                  {unitSystem === 'metric' ? `${(day.intake * 250).toFixed(0)}ml` : `${(day.intake * 8.45).toFixed(0)}oz`}
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
      
      {/* Custom Amount Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all">
            {/* Header with droplet icon */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Droplets className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Add Water</h3>
              <p className="text-gray-600 font-medium">Enter custom amount</p>
            </div>
            
            <div className="space-y-6">
              {/* Amount input with styled container */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Amount ({unitSystem === 'metric' ? 'ml' : 'fl oz'})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder={unitSystem === 'metric' ? '500' : '16'}
                    value={customAmountMl}
                    onChange={(e) => setCustomAmountMl(e.target.value)}
                    onKeyPress={handleCustomAmountKeyPress}
                    min="1"
                    max={unitSystem === 'metric' ? '2500' : '200'}
                    step="1"
                    className="w-full px-6 py-4 text-lg font-medium border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder-gray-400 text-center"
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
                    {unitSystem === 'metric' ? 'ml' : 'fl oz'}
                  </div>
                </div>
              </div>
              
              {/* Quick amount buttons */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">Quick amounts</p>
                <div className="grid grid-cols-3 gap-3">
                  {unitSystem === 'metric' ? (
                    <>
                      <button 
                        onClick={() => setCustomAmountMl('250')}
                        className="py-3 px-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-700 font-medium transition-colors"
                      >
                        250ml
                      </button>
                      <button 
                        onClick={() => setCustomAmountMl('500')}
                        className="py-3 px-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-700 font-medium transition-colors"
                      >
                        500ml
                      </button>
                      <button 
                        onClick={() => setCustomAmountMl('750')}
                        className="py-3 px-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-700 font-medium transition-colors"
                      >
                        750ml
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => setCustomAmountMl('8')}
                        className="py-3 px-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-700 font-medium transition-colors"
                      >
                        8 fl oz
                      </button>
                      <button 
                        onClick={() => setCustomAmountMl('16')}
                        className="py-3 px-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-700 font-medium transition-colors"
                      >
                        16 fl oz
                      </button>
                      <button 
                        onClick={() => setCustomAmountMl('24')}
                        className="py-3 px-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-700 font-medium transition-colors"
                      >
                        24 fl oz
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowCustomModal(false);
                    setCustomAmountMl('');
                  }}
                  className="flex-1 py-4 rounded-xl border-2 hover:bg-gray-50 font-semibold text-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    const amount = parseFloat(customAmountMl);
                    if (amount && amount > 0) {
                      let amountMl = amount;
                      // Convert from user's unit to ml
                      if (unitSystem === 'imperial') {
                        amountMl = amount * 29.5735;
                      }
                      // Convert ml to glasses
                      const glasses = amountMl / glassSize;
                      addWater(glasses);
                    }
                    setCustomAmountMl('');
                    setShowCustomModal(false);
                  }}
                  disabled={!customAmountMl || parseFloat(customAmountMl) <= 0}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Water
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drag Tumbler Modal */}
      {showDragTumblerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all">
            {/* Header with tumbler icon */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 2L16 2C17.1 2 18 2.9 18 4L17 20C17 21.1 16.1 22 15 22L9 22C7.9 22 7 21.1 7 20L6 4C6 2.9 6.9 2 8 2Z" stroke="#3b82f6" strokeWidth="2" fill="none"/>
                  <path d="M8 14L16 14L15.5 20L8.5 20Z" fill="#3b82f6" opacity="0.3"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Add Water</h3>
              <p className="text-gray-600 font-medium">Drag to set amount</p>
            </div>

            <div className="space-y-6">
              {/* Interactive Tumbler Section */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {showBigTumbler ? 'Choose your glass size' : 'Drag the glass to adjust amount'}
                </label>
                
                {!showBigTumbler ? (
                  // Single Glass Display
                  <div>
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <div 
                          className="relative overflow-hidden shadow-xl select-none transition-all duration-200 cursor-grab hover:shadow-2xl hover:scale-105 border-3 border-gray-900"
                          style={{
                            width: '100px',
                            height: '120px',
                            background: 'linear-gradient(to bottom, #f8fafc, #e2e8f0)',
                            clipPath: 'polygon(20% 0%, 80% 0%, 75% 100%, 25% 100%)',
                            borderRadius: '6px 6px 10px 10px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)'
                          }}
                          onMouseDown={(e) => {
                            const startY = e.clientY;
                            const startAmount = dragTumblerAmount;
                            
                            const handleMouseMove = (moveEvent: MouseEvent) => {
                              const deltaY = startY - moveEvent.clientY;
                              // Extremely sensitive: 1 pixel = 1ml movement
                              const mlChange = deltaY;
                              const glassChange = mlChange / 250; // Convert ml to glasses
                              const newAmount = Math.max(0, Math.min(1, startAmount + glassChange));
                              
                              // Round to nearest ml (1/250 of a glass)
                              const roundedAmount = Math.round(newAmount * 250) / 250;
                              setDragTumblerAmount(roundedAmount);
                            };
                            
                            const handleMouseUp = () => {
                              document.removeEventListener('mousemove', handleMouseMove);
                              document.removeEventListener('mouseup', handleMouseUp);
                            };
                            
                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                            e.preventDefault();
                          }}
                          onTouchStart={(e) => {
                            const startY = e.touches[0].clientY;
                            const startAmount = dragTumblerAmount;
                            
                            const handleTouchMove = (moveEvent: TouchEvent) => {
                              const deltaY = startY - moveEvent.touches[0].clientY;
                              // Extremely sensitive: 1 pixel = 1ml movement
                              const mlChange = deltaY;
                              const glassChange = mlChange / 250;
                              const newAmount = Math.max(0, Math.min(1, startAmount + glassChange));
                              
                              const roundedAmount = Math.round(newAmount * 250) / 250;
                              setDragTumblerAmount(roundedAmount);
                              moveEvent.preventDefault();
                            };
                            
                            const handleTouchEnd = () => {
                              document.removeEventListener('touchmove', handleTouchMove);
                              document.removeEventListener('touchend', handleTouchEnd);
                            };
                            
                            document.addEventListener('touchmove', handleTouchMove, { passive: false });
                            document.addEventListener('touchend', handleTouchEnd);
                            e.preventDefault();
                          }}
                        >
                          {/* Water Fill */}
                          <div 
                            className="absolute bottom-0 w-full transition-all duration-500 ease-out overflow-hidden"
                            style={{ 
                              height: `${(dragTumblerAmount / 1) * 100}%`,
                              clipPath: 'polygon(20% 0%, 80% 0%, 75% 100%, 25% 100%)',
                              borderRadius: '0 0 10px 10px'
                            }}
                          >
                            {dragTumblerAmount > 0 && (
                              <>
                                <div 
                                  className="absolute inset-0 w-full h-full"
                                  style={{
                                    background: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 50%, #0e7490 100%)',
                                    animation: 'smoothWaterSurface 4s ease-in-out infinite'
                                  }}
                                />
                                <div 
                                  className="absolute top-0 left-0 w-full h-1"
                                  style={{
                                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                                    animation: 'subtleShimmer 2s ease-in-out infinite'
                                  }}
                                />
                              </>
                            )}
                          </div>
                          
                          {/* Glass outline */}
                          <svg 
                            className="absolute inset-0 w-full h-full pointer-events-none z-20" 
                            viewBox="0 0 100 120"
                            style={{ overflow: 'visible' }}
                          >
                            <path
                              d="M 20 0 L 80 0 L 75 120 L 25 120 Z"
                              fill="none"
                              stroke="black"
                              strokeWidth="2.5"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Amount Display */}
                    <div className="text-center mb-4">
                      <div className="text-lg font-medium text-gray-600 mb-1">
                        Current amount: <span className="font-bold text-blue-600">{Math.round(dragTumblerAmount * glassSize)}ml</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {dragTumblerAmount.toFixed(1)} glasses (250ml each)
                      </div>
                    </div>
                  </div>
                ) : (
                  // Dual Glass Display
                  <div className="grid grid-cols-2 gap-4">
                    {/* Small Glass */}
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-600 mb-2">Small (250ml)</p>
                      <div className="flex justify-center mb-2">
                        <div 
                          className="relative overflow-hidden shadow-lg cursor-grab hover:shadow-xl transition-all duration-200 border-2 border-gray-700"
                          style={{
                            width: '70px',
                            height: '90px',
                            background: 'linear-gradient(to bottom, #f8fafc, #e2e8f0)',
                            clipPath: 'polygon(20% 0%, 80% 0%, 75% 100%, 25% 100%)',
                            borderRadius: '4px 4px 8px 8px',
                            boxShadow: '0 6px 15px rgba(0,0,0,0.1)'
                          }}
                          onMouseDown={(e) => {
                            const startY = e.clientY;
                            const startAmount = dragTumblerAmount;
                            
                            const handleMouseMove = (moveEvent: MouseEvent) => {
                              const deltaY = startY - moveEvent.clientY;
                              // Extremely sensitive: 1 pixel = 1ml movement
                              const mlChange = deltaY;
                              const glassChange = mlChange / 250; // Convert ml to glasses
                              const newAmount = Math.max(0, Math.min(1, startAmount + glassChange));
                              
                              // Round to nearest ml (1/250 of a glass)
                              const roundedAmount = Math.round(newAmount * 250) / 250;
                              setDragTumblerAmount(roundedAmount);
                            };
                            
                            const handleMouseUp = () => {
                              document.removeEventListener('mousemove', handleMouseMove);
                              document.removeEventListener('mouseup', handleMouseUp);
                            };
                            
                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                            e.preventDefault();
                          }}
                          onTouchStart={(e) => {
                            const startY = e.touches[0].clientY;
                            const startAmount = dragTumblerAmount;
                            
                            const handleTouchMove = (moveEvent: TouchEvent) => {
                              const deltaY = startY - moveEvent.touches[0].clientY;
                              // Extremely sensitive: 1 pixel = 1ml movement
                              const mlChange = deltaY;
                              const glassChange = mlChange / 250;
                              const newAmount = Math.max(0, Math.min(1, startAmount + glassChange));
                              
                              const roundedAmount = Math.round(newAmount * 250) / 250;
                              setDragTumblerAmount(roundedAmount);
                              moveEvent.preventDefault();
                            };
                            
                            const handleTouchEnd = () => {
                              document.removeEventListener('touchmove', handleTouchMove);
                              document.removeEventListener('touchend', handleTouchEnd);
                            };
                            
                            document.addEventListener('touchmove', handleTouchMove, { passive: false });
                            document.addEventListener('touchend', handleTouchEnd);
                            e.preventDefault();
                          }}
                        >
                          <div 
                            className="absolute bottom-0 w-full transition-all duration-300"
                            style={{ 
                              height: `${(dragTumblerAmount / 1) * 100}%`,
                              background: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 70%, #0e7490 100%)',
                              clipPath: 'polygon(20% 0%, 80% 0%, 75% 100%, 25% 100%)',
                              borderRadius: '0 0 8px 8px'
                            }}
                          />
                          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 70 90">
                            <path d="M 14 0 L 56 0 L 52.5 90 L 17.5 90 Z" fill="none" stroke="black" strokeWidth="2"/>
                          </svg>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">{Math.round(dragTumblerAmount * glassSize)}ml</div>
                    </div>

                    {/* Large Glass */}
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-600 mb-2">Large (1000ml)</p>
                      <div className="flex justify-center mb-2">
                        <div 
                          className="relative overflow-hidden shadow-lg cursor-grab hover:shadow-xl transition-all duration-200 border-2 border-gray-700"
                          style={{
                            width: '80px',
                            height: '100px',
                            background: 'linear-gradient(to bottom, #f8fafc, #e2e8f0)',
                            clipPath: 'polygon(15% 0%, 85% 0%, 80% 100%, 20% 100%)',
                            borderRadius: '6px 6px 10px 10px',
                            boxShadow: '0 6px 15px rgba(0,0,0,0.1)'
                          }}
                          onMouseDown={(e) => {
                            const startY = e.clientY;
                            const startAmount = dragBigTumblerAmount;
                            
                            const handleMouseMove = (moveEvent: MouseEvent) => {
                              const deltaY = startY - moveEvent.clientY;
                              // Extremely sensitive: 1 pixel = 1ml movement
                              const mlChange = deltaY;
                              const glassChange = mlChange / 250; // Convert ml to glasses
                              const newAmount = Math.max(0, Math.min(4, startAmount + glassChange));
                              
                              // Round to nearest ml (1/250 of a glass)
                              const roundedAmount = Math.round(newAmount * 250) / 250;
                              setDragBigTumblerAmount(roundedAmount);
                            };
                            
                            const handleMouseUp = () => {
                              document.removeEventListener('mousemove', handleMouseMove);
                              document.removeEventListener('mouseup', handleMouseUp);
                            };
                            
                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                            e.preventDefault();
                          }}
                          onTouchStart={(e) => {
                            const startY = e.touches[0].clientY;
                            const startAmount = dragBigTumblerAmount;
                            
                            const handleTouchMove = (moveEvent: TouchEvent) => {
                              const deltaY = startY - moveEvent.touches[0].clientY;
                              // Extremely sensitive: 1 pixel = 1ml movement
                              const mlChange = deltaY;
                              const glassChange = mlChange / 250;
                              const newAmount = Math.max(0, Math.min(4, startAmount + glassChange));
                              
                              const roundedAmount = Math.round(newAmount * 250) / 250;
                              setDragBigTumblerAmount(roundedAmount);
                              moveEvent.preventDefault();
                            };
                            
                            const handleTouchEnd = () => {
                              document.removeEventListener('touchmove', handleTouchMove);
                              document.removeEventListener('touchend', handleTouchEnd);
                            };
                            
                            document.addEventListener('touchmove', handleTouchMove, { passive: false });
                            document.addEventListener('touchend', handleTouchEnd);
                            e.preventDefault();
                          }}
                        >
                          <div 
                            className="absolute bottom-0 w-full transition-all duration-300"
                            style={{ 
                              height: `${(dragBigTumblerAmount / 4) * 100}%`,
                              background: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 70%, #0e7490 100%)',
                              clipPath: 'polygon(15% 0%, 85% 0%, 80% 100%, 20% 100%)',
                              borderRadius: '0 0 10px 10px'
                            }}
                          />
                          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 80 100">
                            <path d="M 12 0 L 68 0 L 64 100 L 16 100 Z" fill="none" stroke="black" strokeWidth="2"/>
                          </svg>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">{Math.round(dragBigTumblerAmount * glassSize)}ml</div>
                    </div>
                  </div>
                )}

                {/* Add Large Glass Option Button */}
                {!showBigTumbler && (
                  <div className="text-center mt-4">
                    <button 
                      onClick={() => setShowBigTumbler(true)}
                      className="py-2 px-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-700 font-medium transition-colors text-sm"
                    >
                      + Add Large Glass Option
                    </button>
                  </div>
                )}
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowDragTumblerModal(false);
                    setDragTumblerAmount(0);
                    setDragBigTumblerAmount(0);
                    setShowBigTumbler(false);
                  }}
                  className="flex-1 py-4 rounded-xl border-2 hover:bg-gray-50 font-semibold text-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (dragTumblerAmount > 0) {
                      addWater(dragTumblerAmount);
                    }
                    if (dragBigTumblerAmount > 0) {
                      addWater(dragBigTumblerAmount);
                    }
                    setShowDragTumblerModal(false);
                    setDragTumblerAmount(0);
                    setDragBigTumblerAmount(0);
                    setShowBigTumbler(false);
                  }}
                  disabled={dragTumblerAmount <= 0 && dragBigTumblerAmount <= 0}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Water
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}