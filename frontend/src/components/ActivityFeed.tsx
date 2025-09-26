import React, { useState, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { WorkoutListDialog } from './WorkoutListDialog';
import { QuickWalkTimer } from './QuickWalkTimer';
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

interface ActivityFeedProps {
  user: any;
  onViewAllFriends: () => void;
  onStartWorkout?: (workout: any) => void;
}

export const ActivityFeed = memo(function ActivityFeed({ user, onViewAllFriends, onStartWorkout }: ActivityFeedProps) {
  const [isWorkoutListOpen, setIsWorkoutListOpen] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<any>(null);
  const [visibleActivities, setVisibleActivities] = useState(5);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showQuickWalkTimer, setShowQuickWalkTimer] = useState(false);

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

  const activities = [
    {
      id: 1,
      type: 'achievement',
      icon: Trophy,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      title: 'Daily Water Goal Complete!',
      description: 'You reached your 8 glasses water goal',
      time: '2 minutes ago',
      user: { name: 'You', avatar: user.avatar },
      likes: 0,
      comments: 0
    },
    {
      id: 2,
      type: 'social',
      icon: Users,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      title: 'Sarah J. shared a healthy recipe',
      description: 'Mediterranean Quinoa Bowl - only 340 calories!',
      time: '15 minutes ago',
      user: { name: 'Sarah J.', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face' },
      likes: 12,
      comments: 3
    },
    {
      id: 3,
      type: 'fitness',
      icon: Activity,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      title: 'You completed a 45-min walk',
      description: '6,847 steps • 287 calories burned',
      time: '1 hour ago',
      user: { name: 'You', avatar: user.avatar },
      likes: 0,
      comments: 0
    },
    {
      id: 4,
      type: 'safe-zone',
      icon: Target,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      title: 'Safe Zone Alert Helped You!',
      description: 'Avoided 650 calories by choosing grilled chicken over fried',
      time: '2 hours ago',
      user: { name: 'You', avatar: user.avatar },
      likes: 0,
      comments: 0
    },
    {
      id: 5,
      type: 'nutrition',
      icon: ChefHat,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      title: 'Mike C. is on a 7-day healthy streak!',
      description: 'Stayed within calorie goals for a full week',
      time: '3 hours ago',
      user: { name: 'Mike C.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' },
      likes: 24,
      comments: 8
    }
  ];

  const quickStats = [
    { label: 'Today\'s Steps', value: '8,547', change: '+12%', icon: Activity, color: 'text-blue-500' },
    { label: 'Water Intake', value: '7/8', change: '87%', icon: Droplets, color: 'text-cyan-500' },
    { label: 'Calories Left', value: '480', change: 'Good', icon: Target, color: 'text-green-500' },
    { label: 'Active Friends', value: '23', change: '+3', icon: Users, color: 'text-purple-500' }
  ];

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setVisibleActivities(prev => Math.min(prev + 5, activities.length));
    setIsLoadingMore(false);
  };

  const displayedActivities = activities.slice(0, visibleActivities);
  const hasMoreActivities = visibleActivities < activities.length;

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
    <div className="space-y-6">
      <WorkoutListDialog
        open={isWorkoutListOpen}
        onOpenChange={setIsWorkoutListOpen}
        currentWorkout={currentWorkout}
        onStartWorkout={onStartWorkout || (() => {})}
        onSetCurrentWorkout={handleSetCurrentWorkout}
      />
      {/* Header with Quick Stats */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Your Activity</h1>
          <p className="text-muted-foreground">Your Fitness, Fully Personalized</p>
        </div>

        {/* Quick Stats Cards - No animations for better performance */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            const isActiveFriends = stat.label === 'Active Friends';
            
            return (
              <div key={index}>
                <Card 
                  className={`hover:shadow-md transition-shadow ${
                    isActiveFriends ? 'cursor-pointer hover:bg-accent/50' : ''
                  }`}
                  onClick={isActiveFriends ? onViewAllFriends : undefined}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xl font-bold">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Workouts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Dumbbell className="w-5 h-5" />
              Quick Workouts
            </h2>
            <p className="text-muted-foreground text-sm">Ready-to-go workout routines</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side - Push Day workout */}
          <div className="w-full">
            {(() => {
              const displayWorkout = currentWorkout || workoutRoutines[0];
              return (
                <Card className="hover:shadow-lg transition-all duration-200 border border-gray-200 rounded-2xl bg-white">
                  <CardContent className="p-6">
                    {/* Header with title and action buttons */}
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{displayWorkout.name}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        onClick={() => {/* More options would go here */}}
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </Button>
                    </div>

                    {/* Badges */}
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
                    </div>

                    {/* Target Muscles */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Target Muscles:</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayWorkout.targetMuscles.join(', ')}
                      </p>
                    </div>

                    {/* Exercises */}
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-2">Exercises ({displayWorkout.exercises.length}):</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayWorkout.exercises.slice(0, 3).map((ex: { name: any; }) => ex.name).join(', ')}
                        {displayWorkout.exercises.length > 3 && '...'}
                      </p>
                    </div>

                    {/* Action Buttons */}
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
          </div>

          {/* Right side - Responsive Grid of Quick Workouts */}
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
              {quickWorkouts.map((workout) => {
                const Icon = workout.icon;
                return (
                  <div key={workout.id}>
                    <Card 
                      className={`cursor-pointer transition-all duration-200 border ${workout.borderColor} ${workout.bgColor} ${workout.hoverColor} hover:shadow-md group`}
                      onClick={() => handleQuickWorkoutClick(workout)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="space-y-3">
                          {/* Icon */}
                          <div className="w-12 h-12 mx-auto rounded-full bg-white flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Icon className={`w-6 h-6 ${workout.iconColor}`} />
                          </div>
                          
                          {/* Content */}
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
          </div>
        </div>
      </div>

      {/* Social Health Community Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">Social Health Community</h2>
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
            {displayedActivities.map((activity) => {
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

                    {/* Social Actions (for social activities) */}
                    {(activity.likes > 0 || activity.comments > 0) && (
                      <div className="flex items-center gap-4 mt-3 pt-2 border-t border-white/50">
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{activity.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <MessageCircle className="w-3 h-3" />
                          <span>{activity.comments}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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