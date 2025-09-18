import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Progress } from './ui/progress';
import { 
  Plus, 
  Minus, 
  Bell, 
  Watch,
  Smartphone,
  Activity,
  Zap,
  Target,
  Shield,
  ShieldAlert,
  Footprints,
  Apple,
  CheckCircle2,
  Users,
  Circle,
  Scale
} from 'lucide-react';
import { Switch } from './ui/switch';
import { motion } from 'motion/react';

interface HeaderProps {
  user: any;
  activeTab: string;
  safeZone: boolean;
  setSafeZone: (value: boolean) => void;
}

export function Header({ user, activeTab, safeZone, setSafeZone }: HeaderProps) {
  const [waterIntake, setWaterIntake] = useState(6);
  const [dailyGoal] = useState(8);
  const [lastReminder, setLastReminder] = useState<Date | null>(null);
  const [connectedDevices, setConnectedDevices] = useState([
    { name: 'Apple Watch Series 9', type: 'watch', connected: true, battery: 85 },
    { name: 'iPhone 15 Pro', type: 'phone', connected: true, battery: 73 },
    { name: 'Fitbit Charge 6', type: 'fitness', connected: false, battery: 0 }
  ]);

  // Mock real-time data from devices
  const [realtimeData, setRealtimeData] = useState({
    steps: 8547,
    heartRate: 72,
    calories: 1650,
    activeMinutes: 45
  });

  // Water reminder system
  useEffect(() => {
    const checkReminder = () => {
      const now = new Date();
      const hoursSinceLastReminder = lastReminder 
        ? (now.getTime() - lastReminder.getTime()) / (1000 * 60 * 60)
        : 2; // Assume 2 hours since last reminder if none

      if (hoursSinceLastReminder >= 1) {
        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('💧 Hydration Reminder', {
            body: 'Time to drink some water! Stay hydrated.',
            icon: '/water-icon.png'
          });
        }
        setLastReminder(now);
      }
    };

    const interval = setInterval(checkReminder, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [lastReminder]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Mock device data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData(prev => ({
        ...prev,
        steps: prev.steps + Math.floor(Math.random() * 3),
        heartRate: 70 + Math.floor(Math.random() * 10),
        calories: prev.calories + Math.floor(Math.random() * 2)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const addWater = () => {
    if (waterIntake < 15) {
      setWaterIntake(waterIntake + 1);
    }
  };

  const removeWater = () => {
    if (waterIntake > 0) {
      setWaterIntake(Math.max(waterIntake - 1, 0));
    }
  };

  const waterPercentage = (waterIntake / dailyGoal) * 100;

  const getTabTitle = () => {
    switch (activeTab) {
      case 'activity': return 'Activity';
      case 'health': return 'Health Metrics';
      case 'water': return 'Water Tracker';
      case 'recipes': return 'Recipes';
      case 'fitness': return 'Fitness';
      case 'profile': return 'Profile';
      default: return 'Home';
    }
  };

  // Today's goals data
  const todaysGoals = [
    { 
      id: 'water', 
      label: 'Drink water', 
      current: waterIntake, 
      target: dailyGoal, 
      unit: 'glasses',
      completed: waterIntake >= dailyGoal,
      icon: () => <div className="w-4 h-4 bg-blue-500 rounded-full" />,
      color: 'text-blue-500'
    },
    { 
      id: 'steps', 
      label: 'Walk steps', 
      current: realtimeData.steps, 
      target: 10000, 
      unit: 'steps',
      completed: realtimeData.steps >= 10000,
      icon: Footprints,
      color: 'text-green-500'
    },
    { 
      id: 'calories', 
      label: 'Stay under calories', 
      current: realtimeData.calories, 
      target: user.dailyCalorieTarget || 1800, 
      unit: 'cal',
      completed: realtimeData.calories <= (user.dailyCalorieTarget || 1800),
      icon: Apple,
      color: 'text-red-500'
    }
  ];

  const completedGoals = todaysGoals.filter(goal => goal.completed).length;

  // Mock active friends data
  const activeFriends = [
    { id: 1, name: 'Sarah J.', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face', isOnline: true, lastActive: 'now' },
    { id: 2, name: 'Mike C.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face', isOnline: true, lastActive: '2 min ago' },
    { id: 3, name: 'Emma R.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face', isOnline: true, lastActive: '5 min ago' },
    { id: 4, name: 'Alex K.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face', isOnline: false, lastActive: '1 hour ago' },
    { id: 5, name: 'Lisa M.', avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=40&h-40&fit=crop&crop=face', isOnline: true, lastActive: 'now' },
    { id: 6, name: 'David L.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face', isOnline: false, lastActive: '3 hours ago' }
  ];

  const onlineFriends = activeFriends.filter(friend => friend.isOnline);

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side - Today's Goals (where eyes go first) */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">H</span>
            </div>
            <div className="hidden sm:block">
            <h1 className="text-lg font-semibold">Health Hub</h1>
            <p className="text-sm text-muted-foreground">Stay Healthy</p>
          </div>
          </div>
          
          {/* Today's Goals - Friendly Design */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Today:</span>
              <div className="flex items-center gap-3">
                {todaysGoals.map((goal) => {
                  const Icon = goal.icon;
                  const percentage = Math.min((goal.current / goal.target) * 100, 100);
                  
                  return (
                    <div key={goal.id} className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full">
                      {Icon ? <Icon className={`w-4 h-4 ${goal.color}`} /> : null}
                      <span className="text-sm font-medium">
                        {goal.id === 'steps' ? goal.current.toLocaleString() : 
                         goal.id === 'water' ? (goal.current % 1 === 0 ? goal.current : goal.current.toFixed(1)) : 
                         goal.current}
                        <span className="text-muted-foreground text-xs">/{goal.id === 'steps' ? goal.target.toLocaleString() : goal.target}</span>
                      </span>
                      {goal.completed && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Goals Summary & Active Friends */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
                <span className="text-sm font-medium text-green-700">
                  {completedGoals}/3 completed 🎉
                </span>
              </div>
              
              {/* Active Friends - Clickable */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full border border-purple-200 hover:bg-purple-100 transition-colors h-auto"
                  >
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">
                      {onlineFriends.length} online
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Active Friends</h4>
                        <p className="text-sm text-muted-foreground">
                          {onlineFriends.length} friends are online now
                        </p>
                      </div>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {activeFriends.map((friend) => (
                        <div key={friend.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                              <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                            </div>
                            {friend.isOnline && (
                              <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 text-green-500 fill-green-500 bg-white rounded-full" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{friend.name}</p>
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${friend.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                              <span className="text-xs text-muted-foreground">
                                {friend.isOnline ? 'Online' : `Last seen ${friend.lastActive}`}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            {friend.isOnline && (
                              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-3 text-center">
                      <button className="text-sm text-purple-600 hover:text-purple-700 transition-colors">
                        View all friends
                      </button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Page Badge */}
          {activeTab !== 'activity' && activeTab && (
            <Badge variant="secondary" className="text-xs">
              {getTabTitle()}
            </Badge>
          )}
          
          {/* Safe Zone Toggle - Only show on recipes page */}
          {activeTab === 'recipes' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
              <motion.div
                className={`flex items-center gap-2 transition-colors ${
                  safeZone ? 'text-green-600' : 'text-muted-foreground'
                }`}
                animate={{ scale: safeZone ? 1.05 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {safeZone ? <Shield className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                <span className="text-sm font-medium hidden sm:inline">Safe Zone</span>
              </motion.div>
              <Switch
                checked={safeZone}
                onCheckedChange={setSafeZone}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          )}
        </div>

        {/* Right side - Quick stats and water widget */}
        <div className="flex items-center gap-4">
          {/* Current Weight - Mobile Only */}
          <div className="xl:hidden flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-200">
            <Scale className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">{user.weight || '75'} kg</span>
          </div>

          {/* Connected Devices Status - Desktop Only */}
          <div className="hidden xl:flex items-center gap-2">
            {connectedDevices.filter(d => d.connected).map((device, index) => (
              <Popover key={index}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    {device.type === 'watch' && <Watch className="w-4 h-4" />}
                    {device.type === 'phone' && <Smartphone className="w-4 h-4" />}
                    {device.type === 'fitness' && <Activity className="w-4 h-4" />}
                    <span className="text-xs ml-1">{device.battery}%</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="end">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="font-medium text-sm">{device.name}</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>Battery:</span>
                        <span>{device.battery}%</span>
                      </div>
                      <Progress value={device.battery} className="h-1" />
                    </div>
                    <div className="border-t pt-2 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Steps today:</span>
                        <span>{realtimeData.steps.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Heart rate:</span>
                        <span>{realtimeData.heartRate} bpm</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Calories:</span>
                        <span>{realtimeData.calories}</span>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            ))}
          </div>

          {/* Quick Stats - Clickable */}
          <div className="hidden lg:flex items-center gap-4 text-sm text-muted-foreground">
            {/* Steps Tracker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors h-auto"
                >
                  <Footprints className="w-4 h-4 text-green-500" />
                  <span className="font-medium">{realtimeData.steps.toLocaleString()}</span>
                  <span className="text-xs">steps</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Footprints className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Daily Steps</h4>
                      <p className="text-sm text-muted-foreground">
                        {realtimeData.steps.toLocaleString()} of 10,000 steps
                      </p>
                    </div>
                  </div>
                  
                  <Progress value={(realtimeData.steps / 10000) * 100} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Distance</span>
                      <div className="font-medium">{(realtimeData.steps * 0.0008).toFixed(1)} km</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Calories Burned</span>
                      <div className="font-medium">{Math.round(realtimeData.steps * 0.04)}</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Goal completion:</span>
                      <span>{Math.min(Math.round((realtimeData.steps / 10000) * 100), 100)}%</span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Calories Tracker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors h-auto"
                >
                  <Apple className="w-4 h-4 text-red-500" />
                  <span className="font-medium">{realtimeData.calories}</span>
                  <span className="text-xs">cal</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Apple className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Calories Today</h4>
                      <p className="text-sm text-muted-foreground">
                        {realtimeData.calories} of {user.dailyCalorieTarget || 1800} target
                      </p>
                    </div>
                  </div>
                  
                  <Progress value={(realtimeData.calories / (user.dailyCalorieTarget || 1800)) * 100} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Remaining</span>
                      <div className={`font-medium ${(user.dailyCalorieTarget || 1800) - realtimeData.calories < 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {(user.dailyCalorieTarget || 1800) - realtimeData.calories} cal
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Burned</span>
                      <div className="font-medium">{Math.round(realtimeData.steps * 0.04)} cal</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Daily goal:</span>
                      <span className={realtimeData.calories <= (user.dailyCalorieTarget || 1800) ? 'text-green-600' : 'text-red-500'}>
                        {realtimeData.calories <= (user.dailyCalorieTarget || 1800) ? 'On track' : 'Over limit'}
                      </span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-4 h-4" />
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-3">
                <h4 className="font-medium">Notifications</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-2 bg-blue-50 rounded-lg">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mt-0.5" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium">Hydration Reminder</p>
                      <p className="text-muted-foreground">Time to drink water! You're at {waterIntake}/{dailyGoal} glasses today.</p>
                      <p className="text-xs text-muted-foreground mt-1">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2 bg-green-50 rounded-lg">
                    <Target className="w-4 h-4 text-green-500 mt-0.5" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium">Step Goal Achieved</p>
                      <p className="text-muted-foreground">Congratulations! You've reached your 10K steps goal.</p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Realistic Water Bottle Widget - 64px height, 16px width */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="relative cursor-pointer group p-0 h-auto hover:bg-transparent"
              >
                <div className="relative flex items-center gap-2">
                  {/* Realistic Water Bottle - 16px width, 64px height */}
                  <div className="relative" style={{ width: '16px', height: '64px' }}>
                    {/* Bottle outline with black border */}
                    <div className="absolute inset-0">
                      {/* Bottle cap */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gray-600 rounded-t border-2 border-black" />
                      
                      {/* Bottle neck */}
                      <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-2 h-3 border-2 border-black bg-white" />
                      
                      {/* Main bottle body - realistic shape */}
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-4 h-14 border-2 border-black bg-white overflow-hidden"
                           style={{ 
                             borderRadius: '0 0 8px 8px',
                             clipPath: 'polygon(10% 0%, 90% 0%, 100% 20%, 100% 100%, 0% 100%, 0% 20%)'
                           }}>
                        {/* Blue water fill */}
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 bg-blue-500"
                          style={{ 
                            height: `${Math.min(waterPercentage, 100)}%`,
                            borderRadius: '0 0 6px 6px'
                          }}
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.min(waterPercentage, 100)}%` }}
                          transition={{ duration: 0.5 }}
                        />
                        
                        {/* Water surface ripple effect */}
                        {waterPercentage > 0 && (
                          <motion.div
                            className="absolute inset-x-0 bg-blue-300 h-0.5"
                            style={{ bottom: `${Math.min(waterPercentage, 100)}%` }}
                            animate={{ opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Water count without droplet icon */}
                  <div className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {waterIntake % 1 === 0 ? waterIntake : waterIntake.toFixed(1)}/{dailyGoal}
                  </div>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-500 rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-medium">Water Intake</h4>
                    <p className="text-sm text-muted-foreground">
                      {waterIntake % 1 === 0 ? waterIntake : waterIntake.toFixed(1)} of {dailyGoal} glasses today
                    </p>
                  </div>
                </div>
                
                <Progress value={waterPercentage} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {waterIntake * 250}ml / {dailyGoal * 250}ml
                  </div>
                  <Badge variant={waterPercentage >= 100 ? 'default' : 'secondary'}>
                    {waterPercentage.toFixed(0)}%
                  </Badge>
                </div>
                
                {/* Glass Amount Options */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-center">Add water</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWaterIntake(Math.min(waterIntake + 0.25, 15))}
                      disabled={waterIntake >= 15}
                      className="flex flex-col h-12 p-1"
                    >
                      <div className="text-xs font-medium">1/4</div>
                      <div className="text-xs text-muted-foreground">glass</div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWaterIntake(Math.min(waterIntake + 0.5, 15))}
                      disabled={waterIntake >= 15}
                      className="flex flex-col h-12 p-1"
                    >
                      <div className="text-xs font-medium">1/2</div>
                      <div className="text-xs text-muted-foreground">glass</div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWaterIntake(Math.min(waterIntake + 1, 15))}
                      disabled={waterIntake >= 15}
                      className="flex flex-col h-12 p-1"
                    >
                      <div className="text-xs font-medium">Full</div>
                      <div className="text-xs text-muted-foreground">glass</div>
                    </Button>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeWater}
                    disabled={waterIntake <= 0}
                    className="flex-1"
                  >
                    <Minus className="w-3 h-3 mr-1" />
                    Remove
                  </Button>
                  <Button
                    size="sm"
                    onClick={addWater}
                    disabled={waterIntake >= 15}
                    className="flex-1"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Glass
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground text-center">
                  Target: 2L (8 glasses) daily for optimal health
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}