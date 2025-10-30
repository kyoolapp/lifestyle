import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Progress } from './ui/progress';
import * as userApi from '../api/user_api';
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
  Scale,
  RefreshCw,
  Droplets
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Switch } from './ui/switch';
import { motion } from 'motion/react';

interface HeaderProps {
  user: any;
  activeTab: string;
  safeZone: boolean;
  setSafeZone: (value: boolean) => void;
}

export function Header({ user, activeTab, safeZone, setSafeZone }: HeaderProps) {
  const navigate = useNavigate();
  const [waterIntake, setWaterIntake] = useState(0);
  const [dailyGoal] = useState(8);
  const [loading, setLoading] = useState(false);
  const [lastReminder, setLastReminder] = useState<Date | null>(null);
  const [activeFriends, setActiveFriends] = useState<any[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  
  // Load today's water intake on mount
  useEffect(() => {
    const loadTodayWaterIntake = async () => {
      if (user?.id) {
        try {
          const glasses = await userApi.getTodayWaterIntake(user.id);
          setWaterIntake(glasses);
        } catch (error) {
          console.error('Failed to load water intake:', error);
          setWaterIntake(0);
        }
      }
    };
    
    loadTodayWaterIntake();
  }, [user?.id]);

  // Listen for water intake updates from other components
  useEffect(() => {
    const handleWaterUpdate = (event: CustomEvent) => {
      if (event.detail.userId === user?.id) {
        setWaterIntake(event.detail.glasses);
      }
    };

    window.addEventListener('waterIntakeUpdated', handleWaterUpdate as EventListener);
    
    return () => {
      window.removeEventListener('waterIntakeUpdated', handleWaterUpdate as EventListener);
    };
  }, [user?.id]);

  // Load active friends when component mounts and refresh periodically
  useEffect(() => {
    if (user?.id) {
      loadActiveFriends();
      // Refresh active friends every 2 minutes to update online status
      const interval = setInterval(loadActiveFriends, 120000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  // Load friend requests when component mounts and refresh periodically
  useEffect(() => {
    if (user?.id) {
      // Initial load without notifications to avoid showing notifications for existing requests
      loadFriendRequests(false);
      // More frequent polling for real-time feel - every 10 seconds with notifications
      const interval = setInterval(() => loadFriendRequests(true), 10000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  // Listen for friend request events from other components
  useEffect(() => {
    const handleFriendRequestEvent = (event: CustomEvent) => {
      if (event.detail.userId === user?.id) {
        // Immediately reload friend requests when a new one is detected
        loadFriendRequests(true);
      }
    };

    window.addEventListener('friendRequestReceived', handleFriendRequestEvent as EventListener);
    
    return () => {
      window.removeEventListener('friendRequestReceived', handleFriendRequestEvent as EventListener);
    };
  }, [user?.id]);

  // More aggressive polling when page is visible
  useEffect(() => {
    if (!user?.id) return;

    let fastInterval: number;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When user comes back to the page, immediately check for new requests
        loadFriendRequests(true);
        // Start fast polling (every 5 seconds) when page is visible
        fastInterval = setInterval(() => loadFriendRequests(true), 5000);
      } else {
        // Clear fast polling when page is not visible
        if (fastInterval) {
          clearInterval(fastInterval);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start fast polling if page is currently visible
    if (document.visibilityState === 'visible') {
      fastInterval = setInterval(() => loadFriendRequests(true), 5000);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (fastInterval) {
        clearInterval(fastInterval);
      }
    };
  }, [user?.id]);
  
  const [connectedDevices, setConnectedDevices] = useState([
    { name: 'Apple Watch Series 9', type: 'watch', connected: true, battery: 85 },
    { name: 'iPhone 15 Pro', type: 'phone', connected: true, battery: 73 },
    { name: 'Fitbit Charge 6', type: 'fitness', connected: false, battery: 0 }
  ]);

  // Mock real-time data from devices
  const [realtimeData, setRealtimeData] = useState({
    steps: 0,
    heartRate: 72,
    calories: 0,
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
        steps: prev.steps + Math.floor(Math.random() * 0),
        heartRate: 70 + Math.floor(Math.random() * 10),
        calories: prev.calories + Math.floor(Math.random() * 0)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const addWater = async (glasses = 1) => {
    if (loading || !user?.id || waterIntake >= 15) return;
    
    setLoading(true);
    try {
      const newTotal = Math.min(waterIntake + glasses, 15);
      await userApi.setWaterIntake(user.id, newTotal);
      setWaterIntake(newTotal);
      
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

  const removeWater = async () => {
    if (loading || !user?.id || waterIntake <= 0) return;
    
    setLoading(true);
    try {
      const newTotal = Math.max(waterIntake - 1, 0);
      await userApi.setWaterIntake(user.id, newTotal);
      setWaterIntake(newTotal);
      
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

  const waterPercentage = (waterIntake / dailyGoal) * 100;

  const getWaterColor = () => {
    if (waterIntake === 0) return 'bg-red-500';
    if (waterIntake < 4) return 'bg-red-500';
    if (waterIntake >= 4 && waterIntake <= 6) return 'bg-yellow-500';
    return 'bg-green-500'; // 7+ glasses
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'activity': return 'Activity';
      case 'health': return 'Health';
      case 'water': return 'Water Tracker';
      case 'recipes': return 'Recipes';
      case 'fitness': return 'Fitness';
      case 'profile': return 'Profile';
      default: return 'Home';
    }
  };

  const loadActiveFriends = async () => {
    if (!user?.id) return;
    
    setFriendsLoading(true);
    try {
      const friends = await userApi.getUserFriends(user.id);
      // Filter only online friends
      const onlineFriends = friends.filter((friend: any) => friend.online);
      setActiveFriends(onlineFriends);
    } catch (error) {
      console.error('Failed to load active friends:', error);
      setActiveFriends([]);
    } finally {
      setFriendsLoading(false);
    }
  };

  const loadFriendRequests = async (showNotifications = true) => {
    if (!user?.id) return;
    
    setRequestsLoading(true);
    try {
      const requests = await userApi.getIncomingFriendRequests(user.id);
      
      // Check for new requests and show notifications (only if we have previous state)
      if (showNotifications && friendRequests.length > 0) {
        const newRequests = requests.filter((newReq: any) => 
          !friendRequests.some((existingReq: any) => existingReq.request_id === newReq.request_id)
        );
        
        newRequests.forEach((request: any) => {
          showFriendRequestNotification(request);
        });
      }
      
      setFriendRequests(requests);
    } catch (error) {
      console.error('Failed to load friend requests:', error);
      setFriendRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleAcceptFriendRequest = async (senderId: string, requestId: string) => {
    if (!user?.id) return;
    
    try {
      await userApi.acceptFriendRequest(user.id, senderId);
      setFriendRequests(prev => prev.filter(req => req.request_id !== requestId));
      // Reload active friends to show newly added friend
      loadActiveFriends();
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
  };

  const handleRejectFriendRequest = async (senderId: string, requestId: string) => {
    if (!user?.id) return;
    
    try {
      await userApi.rejectFriendRequest(user.id, senderId);
      setFriendRequests(prev => prev.filter(req => req.request_id !== requestId));
    } catch (error) {
      console.error('Failed to reject friend request:', error);
    }
  };

  const showFriendRequestNotification = (request: any) => {
    // Always show browser notification if permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('👥 New Friend Request', {
        body: `${request.name} (@${request.username}) wants to be your friend`,
        icon: request.avatar || '/default-avatar.png',
        tag: `friend-request-${request.request_id}`, // Prevent duplicate notifications
        requireInteraction: true // Keep notification visible until user interacts
      });
      
      // Auto-close notification after 8 seconds
      setTimeout(() => {
        notification.close();
      }, 8000);
    }
    
    // Also dispatch a custom event for other potential listeners
    window.dispatchEvent(new CustomEvent('newFriendRequestNotification', {
      detail: { request }
    }));
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

  // activeFriends state is already managed above
  const onlineFriends = activeFriends.filter(friend => friend.online);

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-2 md:py-3">
        {/* Left side - Today's Goals (where eyes go first) */}
        <div className="flex items-center gap-2 md:gap-6">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Enhanced Logo */}
            <div className="relative w-8 h-8 md:w-10 md:h-10">
              <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-5 h-5 md:w-6 md:h-6 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xs md:text-sm">💚</span>
                </div>
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl opacity-20 blur-sm -z-10"></div>
            </div>
            
            <div className="hidden sm:block">
              <h1 className="text-base md:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Kyool Health
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                Your Wellness Companion
              </p>
            </div>
          </div>
         
          {/* Today's Goals - Friendly Design */}
          <div className="hidden lg:flex items-center gap-4">
            {/*<div className="flex items-center gap-2">
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
            </div>*/}
            
            {/* Goals Summary & Active Friends */}
            <div className="flex items-center gap-3">
              {/*<div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
                <span className="text-sm font-medium text-green-700">
                  {completedGoals}/3 completed 🎉
                </span>
              </div>*/}
              
              
            </div>
          </div>
          
          {/* Page Badge */}
          {/*{activeTab !== 'activity' && activeTab && (
            <Badge variant="secondary" className="text-xs">
              {getTabTitle()}
            </Badge>
          )}*/}
          
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
        <div className="flex items-center gap-2 md:gap-4">
          {/* Current Weight - Mobile Only */}
          <div className="hidden sm:flex xl:hidden items-center gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-purple-50 rounded-lg border border-purple-200">
            <Scale className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />
            <span className="text-xs md:text-sm font-medium text-purple-700">{user.weight || '75'} kg</span>
          </div>

          {/* Active Friends - Clickable */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-purple-50 rounded-full border border-purple-200 hover:bg-purple-100 transition-colors h-auto text-xs md:text-sm"
                    onClick={loadActiveFriends}
                  >
                    <Users className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />
                    <span className="hidden sm:inline font-medium text-purple-700">
                      {onlineFriends.length} online
                    </span>
                    <span className="sm:hidden font-medium text-purple-700">
                      {onlineFriends.length}
                    </span>
                    
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
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
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={loadActiveFriends}
                        disabled={friendsLoading}
                      >
                        {friendsLoading ? (
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    
                    {friendsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Loading friends...</p>
                        </div>
                      </div>
                    ) : onlineFriends.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 mb-2">No friends are currently online</p>
                        <p className="text-xs text-gray-400">Check back later or invite more friends!</p>
                      </div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {onlineFriends.map((friend: any) => (
                          <div key={friend.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="relative">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={friend.avatar} />
                                <AvatarFallback>
                                  {friend.name?.charAt(0).toUpperCase() || friend.username?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{friend.name}</p>
                              <p className="text-xs text-muted-foreground">@{friend.username}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                Online
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {onlineFriends.length > 0 && (
                      <div className="border-t pt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => navigate('/friends')}
                        >
                          View All Friends
                        </Button>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

          {/* Connected Devices Status - Desktop Only */}
          {/*<div className="hidden xl:flex items-center gap-2">
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
          </div>*/}

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
                  <span className="font-medium">{realtimeData.steps}</span>
                  <span className="text-xs">steps</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Footprints className="w-6 h-6 text-green-500" />
                    </div>
                    {/*<div>
                      <h4 className="font-medium">Daily Steps</h4>
                      <p className="text-sm text-muted-foreground">
                        {realtimeData.steps.toLocaleString()} of 10,000 steps
                      </p>
                    </div>*/}
                  </div>
                  
                  {/*<Progress value={(realtimeData.steps / 10000) * 100} className="h-2" />*/}
                  
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
              <Button variant="ghost" size="sm" className="relative p-1 md:p-2">
                <Bell className="w-4 h-4 md:w-5 md:h-5" />
                {friendRequests.length > 0 && (
                  <motion.div
                    className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Notifications</h4>
                  {friendRequests.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {friendRequests.length} new
                    </Badge>
                  )}
                </div>
                
                <div className="max-h-80 overflow-y-auto space-y-3">
                  {/* Friend Requests */}
                  {friendRequests.map((request) => (
                    <div key={request.request_id} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="relative cursor-pointer" onClick={() => navigate(`/user/${request.sender_id}`)}>
                        <Avatar className="w-10 h-10 hover:ring-2 hover:ring-purple-300 transition-all">
                          <AvatarImage src={request.avatar} />
                          <AvatarFallback>
                            {request.name?.charAt(0).toUpperCase() || request.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          request.online ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4 text-purple-600" />
                          <p className="text-sm font-medium text-purple-900">Friend Request</p>
                        </div>
                        <p className="text-sm text-gray-900 mb-1">
                          <span 
                            className="font-medium hover:text-purple-600 cursor-pointer transition-colors"
                            onClick={() => navigate(`/user/${request.sender_id}`)}
                          >
                            {request.name}
                          </span> (@{request.username}) wants to be your friend
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="h-7 px-3 text-xs"
                            onClick={() => handleAcceptFriendRequest(request.sender_id, request.request_id)}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-3 text-xs"
                            onClick={() => handleRejectFriendRequest(request.sender_id, request.request_id)}
                          >
                            Decline
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-3 text-xs text-purple-600 hover:text-purple-700"
                            onClick={() => navigate(`/user/${request.sender_id}`)}
                          >
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Other Notifications */}
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
                  
                  {friendRequests.length === 0 && (
                    <div className="text-center py-4">
                      <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No new notifications</p>
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Water Bottle Widget */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="relative cursor-pointer group p-1 md:p-2 h-auto hover:bg-muted/30 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-1 md:gap-2">
                  {/* Water Bottle - Same as WaterTracker */}
                  <div className="relative flex flex-col items-center">
                    {/* Bottle Cap */}
                    <div className="w-2 h-1 md:w-3 md:h-1.5 bg-blue-600 rounded-t-lg mb-0.5 shadow-md"></div>
                    
                    {/* Bottle Neck */}
                    <div className="w-1.5 h-1 md:w-2 md:h-1 bg-gray-300 border border-gray-400"></div>
                    
                    {/* Main Bottle */}
                    <div className="relative w-4 h-6 md:w-5 md:h-7 bg-gradient-to-b from-gray-100 to-gray-300 rounded-b-3xl border-2 border-gray-500 overflow-hidden shadow-lg">
                      
                      {/* Water fill with same logic as WaterTracker */}
                      <motion.div 
                        className="absolute bottom-0 w-full rounded-b-3xl transition-all duration-500"
                        style={{ 
                          height: `${Math.min(waterPercentage, 100)}%`,
                          backgroundColor: waterIntake === 0 ? 'transparent' :
                            waterIntake < 4 ? '#f87171' : // red-400  
                            waterIntake <= 6 ? '#facc15' : // yellow-400
                            '#60a5fa' // blue-400
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.min(waterPercentage, 100)}%` }}
                        transition={{ duration: 0.3 }}
                      />
                      
                      {/* Water Surface Animation */}
                      <div 
                        className={`absolute inset-x-0 w-full bg-white h-px animate-pulse ${waterIntake === 0 ? 'opacity-0' : 'opacity-80'}`}
                        style={{ 
                          bottom: `${Math.min(waterPercentage, 100)}%`
                        }}
                      />
                      
                      {/* Measurement lines - fewer for smaller size */}
                      <div className="absolute inset-x-0.5 h-px bg-gray-600 opacity-30" style={{ bottom: '75%' }}></div>
                      <div className="absolute inset-x-0.5 h-px bg-gray-600 opacity-30" style={{ bottom: '50%' }}></div>
                      <div className="absolute inset-x-0.5 h-px bg-gray-600 opacity-30" style={{ bottom: '25%' }}></div>
                    </div>
                  </div>
                  
                  {/* Water count */}
                  <div className="hidden sm:block text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
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
                      onClick={() => addWater(0.25)}
                      disabled={loading || waterIntake >= 15}
                      className="flex flex-col h-12 p-1"
                    >
                      <div className="text-xs font-medium">1/4</div>
                      <div className="text-xs text-muted-foreground">glass</div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addWater(0.5)}
                      disabled={loading || waterIntake >= 15}
                      className="flex flex-col h-12 p-1"
                    >
                      <div className="text-xs font-medium">1/2</div>
                      <div className="text-xs text-muted-foreground">glass</div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addWater(1)}
                      disabled={loading || waterIntake >= 15}
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
                    disabled={loading || waterIntake <= 0}
                    className="flex-1"
                  >
                    <Minus className="w-3 h-3 mr-1" />
                    Remove
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => addWater(1)}
                    disabled={loading || waterIntake >= 15}
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