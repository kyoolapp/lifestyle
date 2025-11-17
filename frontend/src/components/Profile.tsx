import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateBMI, calculateBMR, calculateTDEE } from '../utils/health';
import { createOrUpdateUser, getUserOnlineStatus, getUserFriends } from '../api/user_api';
import { useUnitSystem } from '../context/UnitContext';
import { weightConversions, heightConversions } from '../utils/unitConversion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { isUsernameAvailable } from "../api/user_api";
import { ThemeToggle } from './ThemeToggle';
import { 
  User, 
  Users,
  Settings, 
  Share2, 
  Crown,
  Heart,
  Droplets,
  Dumbbell,
  ChefHat,
  Calendar,
  TrendingUp,
  Edit,
  Award,
  Target,
  Activity,
  Zap,
  Star,
  Flame,
  ChevronDown,
  Plus,
  X,
  Check,
  MoreHorizontal,
  Trophy,
  Clock
} from 'lucide-react';

interface ProfileProps {
  user: any;
  setUser: (user: any) => void;
}


export function Profile({ user, setUser }: ProfileProps) {
  const navigate = useNavigate();
  const { unitSystem, setUnitSystem } = useUnitSystem();
  const [selectedUnitSystem, setSelectedUnitSystem] = useState<'metric' | 'imperial'>(
    user.unit_system || 'metric'
  );

  function validateUsernameFormat(username: string) {
    return /^[a-zA-Z0-9_.]{6,20}$/.test(username);
  }

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/user/${user.id || user.uid}`;
    const shareData = {
      title: `${user.name}'s Health Profile`,
      text: `Check out ${user.name}'s health and fitness journey on KyoolApp!`,
      url: profileUrl
    };

    try {
      // Try native Web Share API first (mobile/modern browsers)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying URL to clipboard
        await navigator.clipboard.writeText(profileUrl);
        
        // Show success notification (you can replace this with a toast notification)
        alert('Profile link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
      
      // Fallback: try to copy to clipboard
      try {
        await navigator.clipboard.writeText(profileUrl);
        alert('Profile link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
        
        // Final fallback: show URL in prompt
        const userAction = prompt(
          'Copy this link to share your profile:',
          profileUrl
        );
      }
    }
  };


  // Calculate health metrics
  const gender = user.gender || 'male'; // Default to male if not set
  const bmi = calculateBMI(user.weight, user.height);
  const bmr = calculateBMR(user.weight, user.height, user.age, gender);
  const tdee = bmr !== null ? calculateTDEE(bmr, user.activityLevel) : null;
  const maintenanceCalories = tdee;
  // Debug: log user object on every render
  //console.log('Profile user:', user);
  const [isEditing, setIsEditing] = useState(false);
  const [isOnline, setIsOnline] = useState(true); // Default to true for current user
  const [friendsCount, setFriendsCount] = useState(0);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [goalsExpanded, setGoalsExpanded] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<number | null>(null);
  const [updatingGoal, setUpdatingGoal] = useState<number | null>(null);
  const [progressUpdate, setProgressUpdate] = useState({ current: '', progress: 0 });
  const [newGoal, setNewGoal] = useState({ title: '', target: '', category: 'fitness' });
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: 'Lose 15 pounds',
      target: '150 lbs',
      current: '165 lbs',
      progress: 60,
      category: 'weight',
      icon: Target,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
      progressColor: 'bg-rose-500',
      deadline: 'Dec 31, 2024',
      streak: 12
    },
    {
      id: 2,
      title: 'Walk 10K steps daily',
      target: '10,000 steps',
      current: '8,200 steps',
      progress: 82,
      category: 'fitness',
      icon: Activity,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      progressColor: 'bg-blue-500',
      deadline: 'Daily Goal',
      streak: 5
    },
    {
      id: 3,
      title: 'Drink 8 glasses of water',
      target: '8 glasses',
      current: '6 glasses',
      progress: 75,
      category: 'hydration',
      icon: Droplets,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50',
      progressColor: 'bg-cyan-500',
      deadline: 'Daily Goal',
      streak: 15
    },
    {
      id: 4,
      title: 'Workout 5 times per week',
      target: '5 workouts',
      current: '3 workouts',
      progress: 60,
      category: 'fitness',
      icon: Dumbbell,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      progressColor: 'bg-purple-500',
      deadline: 'Weekly Goal',
      streak: 3
    }
  ]);
  const [editForm, setEditForm] = useState({
    name: user.name,
    username: user.username,
    height: user.height,
    weight: user.weight,
    age: user.age,
    activityLevel: user.activityLevel,
    gender: user.gender || 'male',
  });
  const [username, setUsername] = useState<string>("");
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  

  // Mock user stats
  const userStats = {
    joinDate: '2024-01-15',
    totalWorkouts: 45,
    totalRecipes: 23,
    waterGoalsAchieved: 28,
    currentStreak: 7,
    followers: 2000,
    following: 89
  };

  // Mock activity history for sharing
  const sharedHistory = [
    {
      id: 1,
      type: 'workout',
      title: 'Completed 5K Morning Run',
      date: '2024-09-14',
      details: '30 minutes • 300 calories burned',
      likes: 12,
      isPublic: true
    },
    {
      id: 2,
      type: 'recipe',
      title: 'Made Healthy Quinoa Bowl',
      date: '2024-09-13',
      details: '420 calories • High protein',
      likes: 8,
      isPublic: true
    },
    {
      id: 3,
      type: 'milestone',
      title: 'Reached 30-day water goal streak!',
      date: '2024-09-12',
      details: '8 glasses daily for 30 days',
      likes: 25,
      isPublic: true
    },
    {
      id: 4,
      type: 'workout',
      title: 'Weight Training Session',
      date: '2024-09-11',
      details: '45 minutes • Upper body focus',
      likes: 5,
      isPublic: false
    }
  ];

  

  useEffect(() => {
    if (!username) {
      setUsernameAvailable(true);
      setUsernameError("");
      return;
    }
    if (!validateUsernameFormat(username)) {
      setUsernameAvailable(false);
      setUsernameError("Username must be 6-20 characters, only letters, numbers, _ and . allowed.");
      return;
    }
    setUsernameChecking(true);
    isUsernameAvailable(username)
      .then((available) => {
        setUsernameAvailable(available);
        setUsernameError(available ? "" : "Username is already taken");
      })
      .catch(() => {
        setUsernameAvailable(false);
        setUsernameError("Error checking username");
      })
      .finally(() => setUsernameChecking(false));
  }, [username]);

  // Sync unit system state with context
  useEffect(() => {
    setSelectedUnitSystem(unitSystem);
  }, [unitSystem]);

  // Load friends count when component mounts
  useEffect(() => {
    const loadFriendsCount = async () => {
      if (!user?.id && !user?.uid) return;
      
      setFriendsLoading(true);
      try {
        const friends = await getUserFriends(user.id || user.uid);
        setFriendsCount(friends.length);
      } catch (error) {
        console.error('Failed to load friends count:', error);
        setFriendsCount(0);
      } finally {
        setFriendsLoading(false);
      }
    };

    loadFriendsCount();

    // Listen for friend-related events to update count
    const handleFriendUpdate = () => {
      loadFriendsCount();
    };

    window.addEventListener('friendRequestAccepted', handleFriendUpdate);
    window.addEventListener('friendRemoved', handleFriendUpdate);
    window.addEventListener('friendAdded', handleFriendUpdate);

    return () => {
      window.removeEventListener('friendRequestAccepted', handleFriendUpdate);
      window.removeEventListener('friendRemoved', handleFriendUpdate);
      window.removeEventListener('friendAdded', handleFriendUpdate);
    };
  }, [user?.id, user?.uid]);

  const handleSave = () => {
    // Calculate new metrics
    const newBMI = calculateBMI(editForm.weight, editForm.height);
    const newBMR = calculateBMR(editForm.weight, editForm.height, editForm.age, editForm.gender);
    const newTDEE = newBMR !== null ? calculateTDEE(newBMR, editForm.activityLevel) : null;
    const updatedUser = {
      ...user,
      ...editForm,
      bmi: newBMI,
      bmr: newBMR,
      maintenance_calories: newTDEE,
    };
    setUser(updatedUser);
    setIsEditing(false);
    // Update backend
    if (user.id) {
      createOrUpdateUser(user.id, updatedUser);
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: user.name,
      username: user.username,
      height: user.height,
      weight: user.weight,
      age: user.age,
      activityLevel: user.activityLevel,
      gender: user.gender || 'male',
    });
    setIsEditing(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'workout':
        return <Dumbbell className="w-4 h-4" />;
      case 'recipe':
        return <ChefHat className="w-4 h-4" />;
      case 'milestone':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'workout':
        return 'text-blue-600 bg-blue-100';
      case 'recipe':
        return 'text-green-600 bg-green-100';
      case 'milestone':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold">Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage your account and view your health journey</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="text-xs md:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="goals" className="text-xs md:text-sm">Goals</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs md:text-sm">Activity Feed</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs md:text-sm">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Hero Profile Card */}
          <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-sm opacity-30"></div>
                  <Avatar className="relative w-32 h-32 ring-4 ring-white shadow-xl">
                    <AvatarImage 
                      src={user.photoURL || user.avatar}
                      onError={() => {
                        console.warn('Avatar image failed to load:', user.photoURL || user.avatar);
                      }}
                    />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {user.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {/* Enhanced online status */}
                  <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${
                    isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    {isOnline && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                </div>
                
                <div className="flex-1 text-center lg:text-left">
                  <div className="space-y-2 mb-4">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
                      {user.name}
                    </h1>
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                      <p className="text-lg text-muted-foreground">@{user.username}</p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                          isOnline ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                   : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-1.5 ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                        {user.isPremium && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-md">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 bg-blue-500 rounded-lg">
                        <Dumbbell className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{userStats.totalWorkouts}</div>
                      <p className="text-sm text-muted-foreground">Workouts</p>
                    </div>
                    <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 bg-green-500 rounded-lg">
                        <ChefHat className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-green-600">{userStats.totalRecipes}</div>
                      <p className="text-sm text-muted-foreground">Recipes</p>
                    </div>
                    <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 bg-purple-500 rounded-lg">
                        <Heart className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-purple-600">{userStats.followers}</div>
                      <p className="text-sm text-muted-foreground">Followers</p>
                    </div>
                    <div 
                      className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm cursor-pointer hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200 hover:scale-105"
                      onClick={() => navigate('/friends')}
                      title="View all friends"
                    >
                      <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 bg-orange-500 rounded-lg">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-orange-600">
                        {friendsLoading ? '...' : friendsCount}
                      </div>
                      <p className="text-sm text-muted-foreground">Friends</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleShareProfile}
                    className="bg-white/80 backdrop-blur-sm border-white/50 hover:bg-white/90"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Health Metrics */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Health Metrics</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Weight / Height</CardTitle>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {weightConversions.dbToDisplay(user.weight, selectedUnitSystem)} {weightConversions.getUnit(selectedUnitSystem)}
                  </div>
                  <div className="text-lg text-muted-foreground">
                    {heightConversions.format(user.height, selectedUnitSystem)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">BMI</CardTitle>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 mb-1">{bmi ?? '--'}</div>
                  <p className="text-sm text-muted-foreground">Body Mass Index</p>
                  {bmi && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((bmi / 30) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">BMR</CardTitle>
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Zap className="h-4 w-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600 mb-1">{bmr ?? '--'}</div>
                  <p className="text-sm text-muted-foreground">Calories/day</p>
                  <p className="text-xs text-muted-foreground mt-1">Base Metabolic Rate</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">TDEE</CardTitle>
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Target className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600 mb-1">{tdee ?? '--'}</div>
                  <p className="text-sm text-muted-foreground">Calories/day</p>
                  <p className="text-xs text-muted-foreground mt-1">Maintenance Level</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Enhanced Achievements Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                <h2 className="text-xl font-semibold">Achievements</h2>
              </div>
              <Badge variant="secondary" className="text-xs">
                Recent
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-300 rounded-full flex items-center justify-center">
                        <Star className="w-2 h-2 text-yellow-800" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">30-Day Streak Master</h3>
                      <p className="text-sm text-muted-foreground">Maintained daily activity</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span className="text-xs font-medium text-orange-600">30 days</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                        <Dumbbell className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-300 rounded-full flex items-center justify-center">
                        <Star className="w-2 h-2 text-blue-800" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Fitness Enthusiast</h3>
                      <p className="text-sm text-muted-foreground">Completed workouts</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Target className="w-3 h-3 text-blue-500" />
                        <span className="text-xs font-medium text-blue-600">50+ sessions</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                        <Droplets className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-300 rounded-full flex items-center justify-center">
                        <Star className="w-2 h-2 text-green-800" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Hydration Hero</h3>
                      <p className="text-sm text-muted-foreground">Daily water goals</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Droplets className="w-3 h-3 text-green-500" />
                        <span className="text-xs font-medium text-green-600">30 days</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Activity Feed
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Your shared activities and achievements that others can see
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sharedHistory.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{activity.title}</h3>
                          <p className="text-sm text-muted-foreground">{activity.details}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-muted-foreground">{activity.date}</span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Heart className="w-3 h-3" />
                              {activity.likes} likes
                            </div>
                            <Badge variant={activity.isPublic ? 'default' : 'secondary'} className="text-xs">
                              {activity.isPublic ? 'Public' : 'Private'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          {/* Goals Tab Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
              Goals & Progress
            </h2>
            <p className="text-muted-foreground mt-2">
              Track your health and fitness goals with detailed progress monitoring
            </p>
          </div>

          {/* Goals Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-700/50">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {goals.filter(g => g.progress >= 100).length}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Completed Goals</div>
            </Card>
            <Card className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200/50 dark:border-blue-700/50">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {goals.length}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Active Goals</div>
            </Card>
            <Card className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200/50 dark:border-purple-700/50">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length)}%
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Average Progress</div>
            </Card>
            <Card className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200/50 dark:border-orange-700/50">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {Math.round(goals.reduce((acc, goal) => acc + goal.streak, 0) / goals.length)}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">Avg Streak Days</div>
            </Card>
          </div>

          {/* Goals Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {goals.map((goal) => {
              const Icon = goal.icon;
              const isUpdating = updatingGoal === goal.id;
              return (
                <Card key={goal.id} className={`group relative overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}>
                  <CardContent className="p-6">
                    {/* Goal Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl ${goal.bgColor} dark:bg-gray-700/50 flex items-center justify-center ring-2 ring-white dark:ring-gray-600 shadow-lg`}>
                          <Icon className={`w-7 h-7 ${goal.color} dark:${goal.color.replace('500', '400')}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{goal.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {goal.deadline}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-2xl font-bold ${goal.color} dark:${goal.color.replace('500', '400')}`}>{goal.progress}%</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 justify-end">
                          <Flame className="w-3 h-3" />
                          {goal.streak} day streak
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress Update Form or Progress Details */}
                    {isUpdating ? (
                      <div className="space-y-4 mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-900 dark:text-white">Update Progress</h4>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm text-gray-600 dark:text-gray-400">Current Value</Label>
                            <Input 
                              placeholder={goal.current}
                              value={progressUpdate.current}
                              onChange={(e) => setProgressUpdate({...progressUpdate, current: e.target.value})}
                              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            />
                          </div>
                          <div>
                            <Label className="text-sm text-gray-600 dark:text-gray-400">Progress Percentage</Label>
                            <Input 
                              type="number" 
                              min="0" 
                              max="100"
                              value={progressUpdate.progress}
                              onChange={(e) => setProgressUpdate({...progressUpdate, progress: parseInt(e.target.value) || 0})}
                              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => {
                                // Update the goal with new progress
                                setGoals(goals.map(g => 
                                  g.id === goal.id 
                                    ? {
                                        ...g,
                                        current: progressUpdate.current || g.current,
                                        progress: Math.min(progressUpdate.progress, 100),
                                        streak: progressUpdate.progress > g.progress ? g.streak + 1 : g.streak
                                      }
                                    : g
                                ));
                                setUpdatingGoal(null);
                                setProgressUpdate({ current: '', progress: 0 });
                              }}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => {
                                setUpdatingGoal(null);
                                setProgressUpdate({ current: '', progress: 0 });
                              }}
                              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Current: </span>
                            <span className="font-semibold text-gray-900 dark:text-white">{goal.current}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Target: </span>
                            <span className="font-semibold text-gray-900 dark:text-white">{goal.target}</span>
                          </div>
                        </div>
                        
                        {/* Enhanced Progress Bar */}
                        <div className="relative">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${goal.progressColor} dark:${goal.progressColor.replace('500', '400')} relative`}
                              style={{ width: `${Math.min(goal.progress, 100)}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                            </div>
                          </div>
                          {goal.progress >= 100 && (
                            <div className="absolute -top-2 -right-2">
                              <div className="w-8 h-8 bg-green-500 dark:bg-green-400 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-800 shadow-lg">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    {!isUpdating && (
                      <div className="flex gap-2 pt-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 bg-white/70 hover:bg-white dark:bg-gray-700/50 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUpdatingGoal(goal.id);
                            setProgressUpdate({ current: goal.current, progress: goal.progress });
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Update Progress
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-white/70 hover:bg-white dark:bg-gray-700/50 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingGoal(goal.id);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            
            {/* Add New Goal Card */}
            {showAddGoal ? (
              <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Create New Goal</h3>
                    <Input 
                      placeholder="Goal title (e.g., 'Run 5K daily')" 
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                    <Input 
                      placeholder="Target (e.g., '5000 steps')" 
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                    <Select value={newGoal.category} onValueChange={(value) => setNewGoal({...newGoal, category: value})}>
                      <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                        <SelectItem value="fitness">🏃 Fitness & Exercise</SelectItem>
                        <SelectItem value="weight">⚖️ Weight Management</SelectItem>
                        <SelectItem value="hydration">💧 Hydration</SelectItem>
                        <SelectItem value="nutrition">🥗 Nutrition</SelectItem>
                        <SelectItem value="sleep">😴 Sleep & Recovery</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          if (newGoal.title && newGoal.target) {
                            const iconMap: any = {
                              fitness: Activity,
                              weight: Target,
                              hydration: Droplets,
                              nutrition: ChefHat,
                              sleep: Clock
                            };
                            const colorMap: any = {
                              fitness: 'text-blue-500',
                              weight: 'text-rose-500',
                              hydration: 'text-cyan-500',
                              nutrition: 'text-green-500',
                              sleep: 'text-purple-500'
                            };
                            const bgColorMap: any = {
                              fitness: 'bg-blue-50',
                              weight: 'bg-rose-50',
                              hydration: 'bg-cyan-50',
                              nutrition: 'bg-green-50',
                              sleep: 'bg-purple-50'
                            };
                            const newGoalData = {
                              id: Date.now(),
                              title: newGoal.title,
                              target: newGoal.target,
                              current: '0',
                              progress: 0,
                              category: newGoal.category,
                              icon: iconMap[newGoal.category],
                              color: colorMap[newGoal.category],
                              bgColor: bgColorMap[newGoal.category],
                              progressColor: colorMap[newGoal.category].replace('text-', 'bg-'),
                              deadline: 'Daily Goal',
                              streak: 0
                            };
                            setGoals([...goals, newGoalData]);
                            setNewGoal({ title: '', target: '', category: 'fitness' });
                            setShowAddGoal(false);
                          }
                        }}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Create Goal
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowAddGoal(false);
                          setNewGoal({ title: '', target: '', category: 'fitness' });
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card 
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer group"
                onClick={() => setShowAddGoal(true)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                      <Plus className="w-8 h-8 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100 mb-2">
                      Add New Goal
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Set a new health and fitness target to track your progress
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <Button 
                  variant={isEditing ? "ghost" : "outline"} 
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-gender">Gender</Label>
                      <Select onValueChange={(value: any) => setEditForm({ ...editForm, gender: value })} value={editForm.gender}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-name">Full Name</Label>
                      <Input
                        id="edit-name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-username">UserName</Label>
                      <Input
                        id="edit-username"
                        placeholder="Choose a unique username"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    
                        autoComplete="off"
                      />
                      {usernameChecking && <span style={{ color: 'gray' }}>Checking...</span>}
                      {!usernameAvailable && (
                        <React.Fragment>
                          <span style={{ color: 'red' }}>{usernameError}</span>
                        </React.Fragment>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="edit-height">Height (cm)</Label>
                      <Input
                        id="edit-height"
                        type="number"
                        value={editForm.height}
                        onChange={(e) => setEditForm({ ...editForm, height: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-weight">Weight (kg)</Label>
                      <Input
                        id="edit-weight"
                        type="number"
                        value={editForm.weight}
                        onChange={(e) => setEditForm({ ...editForm, weight: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-age">Age</Label>
                      <Input
                        id="edit-age"
                        type="number"
                        value={editForm.age}
                        onChange={(e) => setEditForm({ ...editForm, age: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-activity">Activity Level</Label>
                      <Select onValueChange={(value: any) => setEditForm({ ...editForm, activityLevel: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary</SelectItem>
                          <SelectItem value="light">Light Activity</SelectItem>
                          <SelectItem value="moderate">Moderate Activity</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="veryActive">Very Active</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>Save Changes</Button>
                    <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Full Name</Label>
                    <p className="text-lg">{user.name}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-lg">{user.email}</p>
                  </div>
                  <div>
                    <Label>Height</Label>
                    <p className="text-lg">{user.height} cm</p>
                  </div>
                  <div>
                    <Label>Weight</Label>
                    <p className="text-lg">{user.weight} kg</p>
                  </div>
                  <div>
                    <Label>Age</Label>
                    <p className="text-lg">{user.age} years</p>
                  </div>
                  <div>
                    <Label>Activity Level</Label>
                    <p className="text-lg capitalize">{user.activityLevel}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Measurement Units</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Unit System Preference</Label>
                  <p className="text-sm text-muted-foreground mb-3">Choose how you want to see your health metrics</p>
                  <Select 
                    value={selectedUnitSystem} 
                    onValueChange={async (newUnit: 'metric' | 'imperial') => {
                      try {
                        setSelectedUnitSystem(newUnit);
                        
                        // Update unit system in context (this persists to database and localStorage)
                        await setUnitSystem(newUnit);
                        
                        // Update user in backend with new unit_system
                        const updatedUser = { ...user, unit_system: newUnit };
                        await createOrUpdateUser(user.id || user.uid, updatedUser);
                        
                        // Update local user state
                        setUser(updatedUser);
                        
                        console.log(`Unit system changed to ${newUnit} and saved to database`);
                      } catch (error) {
                        console.error('Failed to update unit system:', error);
                        // Revert the selection on error
                        setSelectedUnitSystem(user.unit_system || 'metric');
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                      <SelectItem value="imperial">Imperial (lbs, ft/in)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Theme Preference</Label>
                  <p className="text-sm text-muted-foreground mb-3">Choose your preferred color theme</p>
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <span className="text-sm text-muted-foreground">
                      Switch between light, dark, and system themes
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Your measurements</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Height</p>
                      <p className="text-sm font-medium">
                        {heightConversions.format(user.height, selectedUnitSystem)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Weight</p>
                      <p className="text-sm font-medium">
                        {weightConversions.dbToDisplay(user.weight, selectedUnitSystem)} {weightConversions.getUnit(selectedUnitSystem)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Profile Visibility</p>
                    <p className="text-sm text-muted-foreground">Allow others to view your profile</p>
                  </div>
                  <Button variant="outline">Public</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Activity Sharing</p>
                    <p className="text-sm text-muted-foreground">Share your workouts and achievements</p>
                  </div>
                  <Button variant="outline">Enabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Recipe Sharing</p>
                    <p className="text-sm text-muted-foreground">Share your favorite recipes</p>
                  </div>
                  <Button variant="outline">Enabled</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}