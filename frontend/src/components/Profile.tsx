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
  Edit
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="text-xs md:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs md:text-sm">Activity Feed</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs md:text-sm">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 md:space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage 
                      src={user.photoURL || user.avatar}
                      onError={() => {
                        console.warn('Avatar image failed to load:', user.photoURL || user.avatar);
                      }}
                    />
                    <AvatarFallback className="text-xl">
                      {user.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online status indicator */}
                  <div className={`absolute bottom-1 right-2-5 w-3 h-3 rounded-full border-4 border-white ${
                    isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                    <h2 className="text-xl md:text-2xl font-semibold">{user.name}</h2>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${
                        isOnline ? 'text-green-500' : 'text-gray-400'
                      }`}>
                        {isOnline ? 'Online' : 'Offline'}
                      </span>
                      {user.isPremium && (
                        <Badge className="bg-yellow-500 text-yellow-900">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">@{user.username}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-center">
                    <div>
                      <div className="text-lg md:text-xl font-semibold">{userStats.totalWorkouts}</div>
                      <p className="text-xs md:text-sm text-muted-foreground">Workouts</p>
                    </div>
                    <div>
                      <div className="text-lg md:text-xl font-semibold">{userStats.totalRecipes}</div>
                      <p className="text-xs md:text-sm text-muted-foreground">Recipes</p>
                    </div>
                    <div>
                      <div className="text-lg md:text-xl font-semibold">{userStats.followers}</div>
                      <p className="text-xs md:text-sm text-muted-foreground">Followers</p>
                    </div>
                    <div 
                      className="cursor-pointer hover:bg-blue-50 p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200 group"
                      onClick={() => navigate('/friends')}
                      title="View all friends"
                    >
                      <div className="text-xl font-semibold ">
                        {friendsLoading ? '...' : friendsCount}
                      </div>
                      <div >
                        <p className="text-sm text-muted-foreground">Friends</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button variant="outline" onClick={handleShareProfile}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Health Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weight / Height</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {weightConversions.dbToDisplay(user.weight, selectedUnitSystem)} {weightConversions.getUnit(selectedUnitSystem)} / {heightConversions.format(user.height, selectedUnitSystem)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">BMI</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bmi ?? '--'}</div>
                <p className="text-xs text-muted-foreground">Body Mass Index</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">BMR</CardTitle>
                <Droplets className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bmr ?? '--'}</div>
                <p className="text-xs text-muted-foreground">Basal Metabolic Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">TDEE / Maintenance</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tdee ?? '--'}</div>
                <p className="text-xs text-muted-foreground">Total Daily Energy Expenditure</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">30-Day Streak Master</p>
                    <p className="text-sm text-muted-foreground">Maintained daily activity for 30 days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Fitness Enthusiast</p>
                    <p className="text-sm text-muted-foreground">Completed 50+ workouts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Hydration Hero</p>
                    <p className="text-sm text-muted-foreground">Reached daily water goal 30 times</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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