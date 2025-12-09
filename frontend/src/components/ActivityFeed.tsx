import React, { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { WorkoutListDialog } from './WorkoutListDialog';
import { QuickWalkTimer } from './QuickWalkTimer';
import { useUnitSystem } from '../context/UnitContext';
import { waterConversions, energyConversions } from '../utils/unitConversion';
import { 
  Heart, 
  Droplets, 
  ChefHat, 
  Activity, 
  Users, 
  Target,
  Trophy,
  TrendingUp,
  Clock,
  MessageCircle,
  ThumbsUp,
  Play,
  MoreVertical,
  Dumbbell,
  Footprints,
  Zap
} from 'lucide-react';
import * as userApi from '../api/user_api';
import { GoalsWidget } from './GoalsWidget';
import { useGoals } from '../hooks/useGoals';
import { formatRelativeTime } from '../utils/timeFormat';

interface ActivityFeedProps {
  user: any;
  onViewAllFriends: () => void;
  onStartWorkout?: (workout: any) => void;
}

export const ActivityFeed = memo(function ActivityFeed({ user, onViewAllFriends, onStartWorkout }: ActivityFeedProps) {
  const navigate = useNavigate();
  const { goals } = useGoals();
  const { unitPreferences } = useUnitSystem();
  const [isWorkoutListOpen, setIsWorkoutListOpen] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<any>(null);
  const [visibleActivities, setVisibleActivities] = useState(5);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showQuickWalkTimer, setShowQuickWalkTimer] = useState(false);
  const [realActivities, setRealActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  
  // Reactions system
  const [activityReactions, setActivityReactions] = useState<{[key: string]: any}>({});
  const [reactingToActivity, setReactingToActivity] = useState<string | null>(null);
  
  // Reaction types
  const reactionTypes = [
    { emoji: '👍', label: 'Great job!', type: 'support', color: 'text-blue-500' },
    { emoji: '💪', label: 'Strong!', type: 'strength', color: 'text-red-500' },
    { emoji: '💧', label: 'Hydrated!', type: 'hydration', color: 'text-cyan-500' },
    { emoji: '🔥', label: 'On fire!', type: 'streak', color: 'text-orange-500' },
    { emoji: '🎯', label: 'Goal!', type: 'achievement', color: 'text-green-500' }
  ];

  // Workout routines data (from FitnessTracker)
  const workoutRoutines = [
    {
      id: 1,
      name: 'Push Day',
      difficulty: 'Intermediate',
      duration: '45 min',
      targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
      exercises: [
        { name: 'Bench Press', sets: 3, reps: '8-12', weight: '80kg' },
        { name: 'Push Ups', sets: 3, reps: '15-20', weight: 'bodyweight' },
        { name: 'Dumbbell Flyes', sets: 3, reps: '12-15', weight: '15kg' },
        { name: 'Inclined Bench Press', sets: 3, reps: '8-10', weight: '70kg' }
      ]
    },
    {
      id: 2,
      name: 'Pull Day',
      difficulty: 'Intermediate',
      duration: '40 min',
      targetMuscles: ['Back', 'Biceps'],
      exercises: [
        { name: 'Pull-ups', sets: 3, reps: '8-12', weight: 'bodyweight' },
        { name: 'Barbell Rows', sets: 3, reps: '10-12', weight: '60kg' },
        { name: 'Lat Pulldowns', sets: 3, reps: '12-15', weight: '50kg' }
      ]
    },
    {
      id: 3,
      name: 'Leg Day',
      difficulty: 'Advanced',
      duration: '50 min',
      targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
      exercises: [
        { name: 'Squats', sets: 4, reps: '8-10', weight: '100kg' },
        { name: 'Deadlifts', sets: 3, reps: '6-8', weight: '120kg' },
        { name: 'Lunges', sets: 3, reps: '12-15', weight: '20kg' }
      ]
    }
  ];

  const handleStartWorkout = (routine: any) => {
    if (onStartWorkout) {
      onStartWorkout(routine);
    } else {
      console.log('Starting workout:', routine.name);
      alert(`Starting ${routine.name} workout!`);
    }
  };

  const handleOpenWorkoutList = () => {
    setIsWorkoutListOpen(true);
  };

  const handleSetCurrentWorkout = (workout: any) => {
    setCurrentWorkout(workout);
  };

  const handleQuickWalkClick = () => {
    setShowQuickWalkTimer(true);
  };

  const handleBackFromTimer = () => {
    setShowQuickWalkTimer(false);
  };

  // Mapping function to convert backend activity data to UI format
  const mapActivityToUIFormat = (backendActivity: any, index: number) => {
    const typeConfig: any = {
      water: {
        icon: Droplets,
        iconColor: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      workout: {
        icon: Dumbbell,
        iconColor: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      },
      nutrition: {
        icon: ChefHat,
        iconColor: 'text-orange-500',
        bgColor: '',
        borderColor: 'border-gray-200 dark:border-gray-700'
      },
      achievement: {
        icon: Trophy,
        iconColor: 'text-yellow-500',
        bgColor: '',
        borderColor: 'border-gray-200 dark:border-gray-700'
      },
      fitness: {
        icon: Activity,
        iconColor: 'text-purple-500',
        bgColor: '',
        borderColor: 'border-gray-200 dark:border-gray-700'
      },
      social: {
        icon: Users,
        iconColor: 'text-blue-500',
        bgColor: '',
        borderColor: 'border-gray-200 dark:border-gray-700'
      },
      'safe-zone': {
        icon: Target,
        iconColor: 'text-green-500',
        bgColor: '',
        borderColor: 'border-gray-200 dark:border-gray-700'
      }
    };

    const config = typeConfig[backendActivity.type] || typeConfig.achievement;

    return {
      id: index,
      type: backendActivity.type,
      icon: config.icon,
      iconColor: config.iconColor,
      bgColor: config.bgColor,
      borderColor: config.borderColor,
      title: backendActivity.title,
      description: backendActivity.description,
      time: formatRelativeTime(backendActivity.timestamp),
      user: backendActivity.user || { name: 'User', avatar: '' },
      likes: 0,
      comments: 0,
      reactions: activityReactions[`activity-${index}`] || []
    };
  };
  
  // Handle adding reaction to activity
  const handleReaction = async (activityId: string, reactionType: any) => {
    if (!user?.id) return;
    
    const reactionKey = `activity-${activityId}`;
    const currentReactions = activityReactions[reactionKey] || [];
    
    // Check if user already reacted with this type
    const existingReaction = currentReactions.find(
      (r: any) => r.userId === user.id && r.type === reactionType.type
    );
    
    let newReactions;
    if (existingReaction) {
      // Remove reaction if already exists
      newReactions = currentReactions.filter(
        (r: any) => !(r.userId === user.id && r.type === reactionType.type)
      );
    } else {
      // Remove any other reaction from this user first (one reaction per user)
      const withoutUserReactions = currentReactions.filter((r: any) => r.userId !== user.id);
      // Add new reaction
      newReactions = [...withoutUserReactions, {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name || 'You',
        userAvatar: user.avatar || '',
        type: reactionType.type,
        emoji: reactionType.emoji,
        label: reactionType.label,
        timestamp: new Date().toISOString()
      }];
    }
    
    setActivityReactions(prev => ({
      ...prev,
      [reactionKey]: newReactions
    }));
    
    // Here you would normally save to backend
    console.log('Reaction added:', { activityId, reactionType, newReactions });
  };
  
  // Get reaction summary for display
  const getReactionSummary = (reactions: any[]) => {
    if (!reactions || reactions.length === 0) return null;
    
    const reactionCounts = reactions.reduce((acc, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
      return acc;
    }, {} as {[key: string]: number});
    
    const total = reactions.length;
    const topReactions = Object.entries(reactionCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3);
    
    return { total, topReactions, reactions };
  };

  // Load real activities from backend
  useEffect(() => {
    if (!user?.id) return;

    const loadActivities = async () => {
      setLoadingActivities(true);
      try {
        const activities = await userApi.getUserActivities(user.id, 50);
        const mappedActivities = activities.map((activity: any, index: number) => 
          mapActivityToUIFormat(activity, index)
        );
        setRealActivities(mappedActivities);
      } catch (err) {
        console.error('Failed to load activities:', err);
        setRealActivities([]);
      }
      setLoadingActivities(false);
    };

    loadActivities();

    // Refresh activities when friend or water events occur
    const refreshActivities = () => {
      console.log('[ActivityFeed] Event received - refreshing activities');
      loadActivities();
    };

    console.log('[ActivityFeed] Setting up event listeners for:', user.id);
    window.addEventListener('waterIntakeUpdated', refreshActivities as EventListener);
    window.addEventListener('activityUpdated', refreshActivities as EventListener);
    window.addEventListener('friendAdded', refreshActivities as EventListener);
    window.addEventListener('friendRemoved', refreshActivities as EventListener);
    window.addEventListener('friendRequestAccepted', refreshActivities as EventListener);
    window.addEventListener('workoutCompleted', refreshActivities as EventListener);

    return () => {
      window.removeEventListener('waterIntakeUpdated', refreshActivities as EventListener);
      window.removeEventListener('activityUpdated', refreshActivities as EventListener);
      window.removeEventListener('friendAdded', refreshActivities as EventListener);
      window.removeEventListener('friendRemoved', refreshActivities as EventListener);
      window.removeEventListener('friendRequestAccepted', refreshActivities as EventListener);
      window.removeEventListener('workoutCompleted', refreshActivities as EventListener);
    };
  }, [user?.id]);

  // Live stats (replace previously hard-coded quickStats values)
  const [todaySteps, setTodaySteps] = useState<number | null>(null); // left null if not available
  const [todayCalories, setTodayCalories] = useState<number | null>(null); // left null if not available
  const [waterIntake, setWaterIntake] = useState<number>(0);
  const waterGoal = 8;
  const [activeFriendsCount, setActiveFriendsCount] = useState<number>(0);
  const [friends, setFriends] = useState<any[]>([]);

  // Load water intake and friends (online) when user changes
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!user?.id) return;
      try {
        const glasses = await userApi.getTodayWaterIntake(user.id);
        if (mounted) setWaterIntake(Number(glasses || 0));
      } catch (err) {
        console.error('Failed to load today water intake:', err);
      }

      try {
        const friendsList = await userApi.getUserFriends(user.id);
        if (mounted) {
          // friends may include `online` property from backend; fallback to false
          const onlineCount = Array.isArray(friendsList) ? friendsList.filter((f: any) => !!f.online).length : 0;
          setActiveFriendsCount(onlineCount);
          setFriends(Array.isArray(friendsList) ? friendsList : []);
        }
      } catch (err) {
        console.error('Failed to load friends:', err);
      }
    };

    load();

    return () => { mounted = false; };
  }, [user?.id]);

  // Listen to global events that update these numbers in real-time
  useEffect(() => {
    if (!user?.id) return;

    const onWater = (e: any) => {
      if (e?.detail?.userId === user.id) setWaterIntake(Number(e.detail.glasses || 0));
    };

    const refreshFriends = async () => {
      try {
        const friends = await userApi.getUserFriends(user.id);
        const onlineCount = Array.isArray(friends) ? friends.filter((f: any) => !!f.online).length : 0;
        setActiveFriendsCount(onlineCount);
      } catch (err) {
        console.error('Failed to refresh friends:', err);
      }
    };

    const onFriendChange = () => { refreshFriends(); };

    window.addEventListener('waterIntakeUpdated', onWater as EventListener);
    window.addEventListener('friendAdded', onFriendChange as EventListener);
    window.addEventListener('friendRemoved', onFriendChange as EventListener);
    window.addEventListener('friendRequestAccepted', onFriendChange as EventListener);

    return () => {
      window.removeEventListener('waterIntakeUpdated', onWater as EventListener);
      window.removeEventListener('friendAdded', onFriendChange as EventListener);
      window.removeEventListener('friendRemoved', onFriendChange as EventListener);
      window.removeEventListener('friendRequestAccepted', onFriendChange as EventListener);
    };
  }, [user?.id]);

  const quickStats = [
    { label: "Today's Steps", value: todaySteps != null ? String(todaySteps) : '0', change: '+0%', icon: Activity, color: 'text-blue-500' },
    { 
      label: 'Water Intake', 
      value: `${waterConversions.dbToDisplay(waterIntake * 250, unitPreferences.water).toFixed(2)}/${waterConversions.dbToDisplay(waterGoal * 250, unitPreferences.water).toFixed(2)} ${waterConversions.getUnit(unitPreferences.water)}`, 
      change: `${Math.round((waterIntake / waterGoal) * 100)}%`, 
      icon: Droplets, 
      color: 'text-cyan-500' 
    },
    { label: "Today's Calories", value: todayCalories != null ? `${energyConversions.dbToDisplay(todayCalories, unitPreferences.energy).toFixed(0)} ${energyConversions.getUnit(unitPreferences.energy)}` : '0', change: '+0%', icon: Target, color: 'text-blue-500' },
    { label: 'Active Friends', value: String(activeFriendsCount), change: activeFriendsCount > 0 ? `+${activeFriendsCount}` : '+0', icon: Users, color: 'text-purple-500' }
  ];

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setVisibleActivities(prev => Math.min(prev + 5, realActivities.length));
    setIsLoadingMore(false);
  };

  const displayedActivities = realActivities.slice(0, visibleActivities);
  const hasMoreActivities = visibleActivities < realActivities.length;

  // Quick workout types data
  const quickWorkouts = [
    {
      id: 'quick-walk',
      name: 'Quick Walk',
      duration: '15 min',
      icon: Footprints,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      hoverColor: 'hover:bg-green-200',
      borderColor: 'border-green-300',
      description: 'Light cardio walk'
    },
    {
      id: 'hiit-training',
      name: 'HIIT Training',
      duration: '20 min',
      icon: Zap,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-100',
      hoverColor: 'hover:bg-orange-200',
      borderColor: 'border-orange-300',
      description: 'High intensity workout'
    },
    {
      id: 'strength-training',
      name: 'Strength Training',
      duration: '45 min',
      icon: Dumbbell,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      hoverColor: 'hover:bg-blue-200',
      borderColor: 'border-blue-300',
      description: 'Muscle building'
    },
    {
      id: 'yoga-flow',
      name: 'Yoga Flow',
      duration: '30 min',
      icon: Heart,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100',
      hoverColor: 'hover:bg-purple-200',
      borderColor: 'border-purple-300',
      description: 'Mindful movement'
    }
  ];

  const handleQuickWorkoutClick = (workout: any) => {
    if (workout.id === 'quick-walk') {
      handleQuickWalkClick();
    } else {
      console.log(`Starting ${workout.name}`);
      alert(`${workout.name} - Coming soon!`);
    }
  };

  // Show Quick Walk Timer if active
  if (showQuickWalkTimer) {
    return <QuickWalkTimer onBack={handleBackFromTimer} />;
  }

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      <WorkoutListDialog
        open={isWorkoutListOpen}
        onOpenChange={setIsWorkoutListOpen}
        currentWorkout={currentWorkout}
        onStartWorkout={onStartWorkout || (() => {})}
        onSetCurrentWorkout={handleSetCurrentWorkout}
        user={user}
        friends={friends}
      />
      {/* Header with Quick Stats */}
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">Your Activity</h1>
            <p className="text-muted-foreground text-sm md:text-base">Your Fitness, Fully Personalized</p>
          </div>
          {/*<Button
          variant="outline"
            onClick={() => navigate('/workout/log/standalone')}
            className="bg-gray-900 hover:bg-gray-800 text-black gap-2"
          >
            <Play className="w-4 h-4" />
            Log Workout
          </Button>*/}
        </div>

        {/* Quick Stats Cards - No animations for better performance */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            const isActiveFriends = stat.label === 'Active Friends';
            const isWaterIntake = stat.label === 'Water Intake';
            
            return (
              <div key={index}>
                <Card 
                  className={`hover:shadow-md transition-shadow ${
                    isActiveFriends || isWaterIntake ? 'cursor-pointer hover:bg-accent/50' : ''
                  }`}
                  onClick={() => {
                    if (isActiveFriends) {
                      onViewAllFriends();
                    } else if (isWaterIntake) {
                      navigate('/water');
                    }
                  }}
                >
                  <CardContent className="p-2 md:p-4">
                    <div className="flex items-center justify-between mb-1 md:mb-2">
                      <Icon className={`w-3 h-3 md:w-4 md:h-4 ${stat.color}`} />
                      <span className="text-[10px] md:text-xs text-green-600 font-medium">{stat.change}</span>
                    </div>
                    <div className="space-y-0.5 md:space-y-1">
                      <div className="text-lg md:text-xl font-bold">{stat.value}</div>
                      <div className="text-[10px] md:text-xs text-muted-foreground leading-tight">{stat.label}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Workouts Section  */}
      <div className="space-y-4">
        {/*<div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Dumbbell className="w-5 h-5" />
              Quick Workouts
            </h2>
            <p className="text-muted-foreground text-sm">Ready-to-go workout routines</p>
          </div>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
          {/* Left side - Push Day workout */}
          {/*<div className="w-full">
            {(() => {
              const displayWorkout = currentWorkout || workoutRoutines[0];
              return (
                <Card className="hover:shadow-lg transition-all duration-200 border border-gray-200 rounded-2xl bg-white">
                  <CardContent className="p-6">*/}
                    {/* Header with title and action buttons */}
                    {/*<div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{displayWorkout.name}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        onClick={() => /*}{/* More options would go here }
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </Button>
                    </div>*/}

                    {/* Badges 
                    <div className="flex gap-2 mb-4">
                      <Badge 
                        variant="secondary" 
                        className="bg-gray-100 text-gray-700 hover:bg-gray-100 px-3 py-1 rounded-full"
                      >
                        {displayWorkout.difficulty}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className="bg-gray-100 text-gray-700 hover:bg-gray-100 px-3 py-1 rounded-full"
                      >
                        {displayWorkout.duration}
                      </Badge>
                    </div>*/}

                    {/* Target Muscles 
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Target Muscles:</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayWorkout.targetMuscles.join(', ')}
                      </p>
                    </div>*/}

                    {/* Exercises 
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-2">Exercises ({displayWorkout.exercises.length}):</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayWorkout.exercises.slice(0, 3).map((ex: { name: any; }) => ex.name).join(', ')}
                        {displayWorkout.exercises.length > 3 && '...'}
                      </p>
                    </div>*/}

                    {/* Action Buttons 
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleStartWorkout(displayWorkout)}
                        className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-xl py-3 h-auto"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Workout
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleOpenWorkoutList}
                        className="px-6 border-gray-200 hover:bg-gray-50 rounded-xl py-3 h-auto"
                      >
                        Workout List
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </div>*/}

          {/* Right side - Responsive Grid of Quick Workouts 
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2 md:gap-3">
              {quickWorkouts.map((workout) => {
                const Icon = workout.icon;
                return (
                  <div key={workout.id}>
                    <Card 
                      className={`cursor-pointer transition-all duration-200 border ${workout.borderColor} ${workout.bgColor} ${workout.hoverColor} hover:shadow-md group`}
                      onClick={() => handleQuickWorkoutClick(workout)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="space-y-3">*/}
                          {/* Icon 
                          <div className="w-12 h-12 mx-auto rounded-full bg-white flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Icon className={`w-6 h-6 ${workout.iconColor}`} />
                          </div>*/}
                          
                          {/* Content 
                          <div className="space-y-1">
                            <h3 className="font-semibold text-sm text-gray-900">{workout.name}</h3>
                            <p className="text-xs text-muted-foreground">{workout.duration}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>*/}
        </div>
      </div>

      {/* Goals and Social Health Community Section */}
      <div className="grid lg:grid-cols-3 gap-3 md:gap-6">
        {/* Goals Widget */}
        <div className="lg:col-span-1">
          <GoalsWidget goals={goals} />
        </div>
        
        {/* Social Health Community Section */}
        <div className="lg:col-span-2">
          <div className="grid lg:grid-cols-2 gap-3 md:gap-6">
            <Card className="lg:col-span-1">
          <CardContent className="p-4 md:p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg md:text-xl font-semibold mb-2">Social Health Community</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Connect with like-minded individuals, share your journey, and get inspired by others who understand your health goals.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm">Community challenges</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm">Progress sharing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm">Motivational support</span>
                </div>
              </div>
              
              <div className="pt-2">
                <button 
                  onClick={onViewAllFriends}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
                >
                  View all friends →
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="w-full h-48 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
              <div className="space-y-4 text-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold">Join the Community</h3>
                  <p className="text-sm text-white/80">Connect with health enthusiasts</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
          </div>
        </div>
      </div>

      {/* Activity Feed - Simplified without heavy animations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loadingActivities && displayedActivities.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading your activities...</p>
              </div>
            ) : displayedActivities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No activities yet. Start logging water, working out, or adding friends to see them here!
                </p>
              </div>
            ) : (
              displayedActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className={`flex gap-4 p-4 rounded-lg border ${activity.borderColor} ${activity.bgColor} hover:shadow-sm transition-shadow`}
                  >
                    {/* Activity Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        <Icon className={`w-5 h-5 ${activity.iconColor}`} />
                      </div>
                    </div>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm leading-tight">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                          
                          {/* User and Time */}
                          <div className="flex items-center gap-2 mt-2">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={activity.user.avatar} />
                              <AvatarFallback className="text-xs">{activity.user.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{activity.user.name}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span className="text-xs text-muted-foreground">{activity.time}</span>
                            </div>
                          </div>
                        </div>

                        {/* Activity Type Badge */}
                        <Badge variant="secondary" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>

                      {/* Reactions Section */}
                      <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                        {(() => {
                          const reactionSummary = getReactionSummary(activity.reactions);
                          const userReaction = activity.reactions?.find((r: any) => r.userId === user?.id);
                          
                          return (
                            <div className="space-y-2">
                              {/* Reaction Summary */}
                              {reactionSummary && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    {reactionSummary.topReactions.map(([emoji, count]) => (
                                      <span key={emoji} className="flex items-center gap-0.5">
                                        {String(emoji)}<span>{String(count)}</span>
                                      </span>
                                    ))}
                                  </div>
                                  <span>•</span>
                                  <span>
                                    {reactionSummary.total === 1 
                                      ? '1 person reacted'
                                      : `${reactionSummary.total} people reacted`
                                    }
                                  </span>
                                </div>
                              )}
                              
                              {/* Reaction Buttons */}
                              <div className="flex items-center gap-1">
                                {reactionTypes.map((reaction) => {
                                  const isSelected = userReaction?.type === reaction.type;
                                  return (
                                    <button
                                      key={reaction.type}
                                      onClick={() => handleReaction(activity.id, reaction)}
                                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${
                                        isSelected 
                                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700'
                                          : 'text-muted-foreground hover:text-foreground'
                                      }`}
                                      title={reaction.label}
                                    >
                                      <span className="text-sm">{reaction.emoji}</span>
                                      <span className="hidden sm:inline">{reaction.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Load More */}
          {hasMoreActivities && (
            <div className="text-center mt-6">
              <Button
                variant="ghost"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="text-sm"
              >
                {isLoadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  'Load more activities...'
                )}
              </Button>
            </div>
          )}
          
          {!hasMoreActivities && displayedActivities.length > 5 && (
            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                You've reached the end of your activity feed
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});