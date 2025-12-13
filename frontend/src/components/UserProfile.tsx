import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserByUserId, getUserOnlineStatus, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriendshipStatus, checkFriendshipStatus, getIncomingFriendRequests, getOutgoingFriendRequests, revokeFriendRequest, removeFriend, getUserActivities } from '../api/user_api';
import { calculateBMI, calculateBMR, calculateTDEE } from '../utils/health';
import { useUnitSystem } from '../context/UnitContext';
import { heightConversions, weightConversions } from '../utils/unitConversion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ArrowLeft, MessageCircle, UserPlus, CheckCircle, X, Users, Flame, Dumbbell, Clock, Target, Trophy, Heart, Droplets, Activity } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

interface UserProfileProps {
  userId?: string; // Optional prop for direct component usage
}

// Component to display recent activities as cards
function RecentActivityCards({ user, userId, isFriend, currentUserId }: { user: any, userId: string, isFriend: boolean, currentUserId: string }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      // Don't load activities if not friends and not the same user
      if (!isFriend && currentUserId !== userId) {
        console.log('RecentActivityCards: Not friends and not viewing own profile, skipping load');
        setActivities([]);
        setLoading(false);
        return;
      }

      if (!userId) {
        console.log('RecentActivityCards: No userId provided');
        setLoading(false);
        return;
      }

      console.log(`RecentActivityCards: Loading activities for user ${userId}, isFriend=${isFriend}`);
      
      try {
        const data = await getUserActivities(userId, 20);
        console.log(`RecentActivityCards: Got data:`, data);
        
        // If no data from API, use mock data for now
        if (!data || data.length === 0) {
          console.log('RecentActivityCards: No data from API, showing mock data');
          const mockActivities = [
            {
              type: 'water',
              title: 'Logged water intake',
              description: 'Drank 2000ml of water today',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
              type: 'workout',
              title: 'Completed Pull Day B',
              description: 'Finished 3 sets of exercises',
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
            }
          ];
          setActivities(mockActivities);
        } else {
          console.log(`RecentActivityCards: Setting ${data.length} activities from API`);
          setActivities(data);
        }
      } catch (error) {
        console.error('Failed to load activities:', error);
        // Fallback to mock data on error
        const mockActivities = [
          {
            type: 'water',
            title: 'Logged water intake',
            description: 'Drank 2000ml of water today',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            type: 'workout',
            title: 'Completed Pull Day B',
            description: 'Finished 3 sets of exercises',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
          }
        ];
        setActivities(mockActivities);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [userId, isFriend, currentUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading activities...</p>
        </div>
      </div>
    );
  }

  // Check if viewing someone else's profile and not friends
  if (!isFriend && currentUserId !== userId) {
    return (
      <Card className="bg-white border-gray-100">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Add {user?.name} as a friend to see their activities</p>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="bg-white border-gray-100">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No recent activities</p>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'water':
        return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'workout':
        return <Dumbbell className="w-5 h-5 text-red-500" />;
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'fitness':
        return <Activity className="w-5 h-5 text-purple-500" />;
      case 'nutrition':
        return <Heart className="w-5 h-5 text-orange-500" />;
      case 'social':
        return <Users className="w-5 h-5 text-blue-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'water':
        return 'from-blue-500 to-blue-300';
      case 'workout':
        return 'from-red-500 to-red-300';
      case 'achievement':
        return 'from-yellow-500 to-yellow-300';
      case 'fitness':
        return 'from-purple-500 to-purple-300';
      case 'nutrition':
        return 'from-orange-500 to-orange-300';
      case 'social':
        return 'from-blue-600 to-blue-400';
      default:
        return 'from-gray-500 to-gray-300';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        // Transform activity title and description based on viewing context
        let displayTitle = activity.title;
        let displayDescription = activity.description;
        const activityUserName = activity.user?.name || user?.name || 'User';
        
        // If viewing someone else's profile, use their name
        // If viewing own profile, replace their name with "You"
        if (currentUserId === userId) {
          // Viewing own profile - convert to "You"
          displayTitle = activity.title.replace(
            new RegExp(`^${activityUserName}\\s+`),
            'You '
          );
          displayDescription = activity.description.replace(
            new RegExp(`\\b${activityUserName}'s\\b`, 'g'),
            'Your'
          );
        } else {
          // Viewing friend's profile - ensure it uses their name
          displayTitle = activity.title;
          displayDescription = activity.description;
        }

        return (
          <Card key={index} className="bg-white border-gray-100 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Left Border */}
                <div className={`w-1 h-20 bg-gradient-to-b ${getActivityColor(activity.type)} rounded-full flex-shrink-0`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">{displayTitle}</p>
                      <p className="text-xs text-gray-500">{formatTime(activity.timestamp)}</p>
                    </div>
                    {getActivityIcon(activity.type)}
                  </div>
                  {displayDescription && (
                    <p className="text-sm text-gray-600 mb-3">{displayDescription}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function UserProfile({ userId: propUserId }: UserProfileProps) {
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const userId = propUserId || paramUserId;
  const navigate = useNavigate();
  const [currentUser] = useAuthState(auth);
  const { unitSystem, unitPreferences } = useUnitSystem();
  
  const [user, setUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<string>('none');

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId || !currentUser?.uid) return;
      
      setLoading(true);
      try {
        // Load user data
        const userData = await getUserByUserId(userId);
        setUser(userData);
        
        // Load online status
        const onlineStatus = await getUserOnlineStatus(userId);
        setIsOnline(onlineStatus);
        
        // Check if they are already friends
        const areFriends = await checkFriendshipStatus(currentUser.uid, userId);
        
        if (areFriends) {
          setFriendshipStatus('friends');
        } else {
          // Get both incoming and outgoing requests to determine exact status
          const [incomingRequests, outgoingRequests] = await Promise.all([
            getIncomingFriendRequests(currentUser.uid),
            getOutgoingFriendRequests(currentUser.uid)
          ]);
          
          // Check if this user is in my incoming requests (they sent me a request)
          const hasIncomingRequest = incomingRequests.some((req: any) => req.sender_id === userId);
          
          // Check if this user is in my outgoing requests (I sent them a request)
          const hasOutgoingRequest = outgoingRequests.some((req: any) => req.receiver_id === userId);
          
          if (hasIncomingRequest) {
            setFriendshipStatus('received');
          } else if (hasOutgoingRequest) {
            setFriendshipStatus('sent');
          } else {
            setFriendshipStatus('none');
          }
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
        setFriendshipStatus('none');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userId, currentUser?.uid]);

  const handleSendFriendRequest = async () => {
    if (!currentUser?.uid || !userId) return;
    
    setActionLoading(true);
    try {
      await sendFriendRequest(currentUser.uid, userId);
      setFriendshipStatus('sent');
    } catch (error) {
      console.error('Failed to send friend request:', error);
      alert('Failed to send friend request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptFriendRequest = async () => {
    if (!currentUser?.uid || !userId) return;
    
    setActionLoading(true);
    try {
      await acceptFriendRequest(currentUser.uid, userId);
      setFriendshipStatus('friends');
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      alert('Failed to accept friend request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectFriendRequest = async () => {
    if (!currentUser?.uid || !userId) return;
    
    setActionLoading(true);
    try {
      await rejectFriendRequest(currentUser.uid, userId);
      setFriendshipStatus('none');
    } catch (error) {
      console.error('Failed to reject friend request:', error);
      alert('Failed to reject friend request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeFriendRequest = async () => {
    if (!currentUser?.uid || !userId) return;
    
    setActionLoading(true);
    try {
      await revokeFriendRequest(currentUser.uid, userId);
      setFriendshipStatus('none');
    } catch (error) {
      console.error('Failed to revoke friend request:', error);
      alert('Failed to revoke friend request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfriend = async () => {
    if (!currentUser?.uid || !userId) return;
    
    setActionLoading(true);
    try {
      await removeFriend(currentUser.uid, userId);
      setFriendshipStatus('none');
    } catch (error) {
      console.error('Failed to remove friend:', error);
      alert('Failed to remove friend. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const renderActionButtons = () => {
    switch (friendshipStatus) {
      case 'friends':
        return (
          <>
            <Button 
              className="gap-2 bg-slate-900 hover:bg-slate-800 text-white"
              size="sm"
            >
              ⚔️ Challenge
            </Button>
            <Button 
              variant="outline"
              onClick={handleUnfriend}
              disabled={actionLoading}
              className="gap-2"
              size="sm"
            >
              {actionLoading ? 'Removing...' : 'Unfriend'}
            </Button>
          </>
        );
      case 'sent':
        return (
          <Button 
            variant="outline" 
            onClick={handleRevokeFriendRequest}
            disabled={actionLoading}
            className="gap-2"
            size="sm"
          >
            {actionLoading ? 'Removing...' : 'Request Sent'}
          </Button>
        );
      case 'received':
        return (
          <div className="flex gap-2">
            <Button 
              onClick={handleAcceptFriendRequest}
              disabled={actionLoading}
              className="gap-2"
              size="sm"
            >
              {actionLoading ? 'Accepting...' : 'Accept'}
            </Button>
            <Button 
              variant="outline"
              onClick={handleRejectFriendRequest}
              disabled={actionLoading}
              className="gap-2"
              size="sm"
            >
              {actionLoading ? 'Declining...' : 'Decline'}
            </Button>
          </div>
        );
      default:
        return (
          <>
            <Button 
              onClick={handleSendFriendRequest}
              disabled={actionLoading}
              className="gap-2 bg-slate-900 hover:bg-slate-800 text-white"
              size="sm"
            >
              <UserPlus className="w-4 h-4" />
              {actionLoading ? 'Sending...' : 'Add Friend'}
            </Button>
          </>
        );
    }
  };

  // Get workout count for current user
  const [currentUserWorkoutCount, setCurrentUserWorkoutCount] = useState(0);
  const [userWorkoutCount, setUserWorkoutCount] = useState(0);

  useEffect(() => {
    // Set mock data for now
    setCurrentUserWorkoutCount(Math.floor(Math.random() * 30));
    setUserWorkoutCount(user?.workouts_count || Math.floor(Math.random() * 30));
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 text-lg">User not found</p>
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const currentUserPercentage = currentUserWorkoutCount / (currentUserWorkoutCount + userWorkoutCount) * 100 || 0;
  const userPercentage = userWorkoutCount / (currentUserWorkoutCount + userWorkoutCount) * 100 || 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back Button */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center px-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <div className="bg-slate-50">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl overflow-hidden mb-6 shadow-sm mx-8 mt-8">
          {/* Banner */}
          <div 
            className="relative"
            style={{ 
              height: '100px',
              background: 'linear-gradient(to right, #6366F1, #EC4899)'
            }}
          />
          
          {/* Avatar and Info Section */}
          <div className="px-8 pb-6">
            <div className="flex items-end justify-between" style={{ marginTop: '-64px' }}>
              {/* Avatar Group */}
              <div className="flex items-end gap-6">
                <div className="relative">
                  <Avatar 
                    className="flex items-center justify-center flex-shrink-0"
                    style={{ 
                      width: '128px', 
                      height: '128px',
                      border: '4px solid white'
                    }}
                  >
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gray-200 text-gray-400 text-5xl w-full h-full flex items-center justify-center">
                      {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  {/* Status Indicator */}
                  <div 
                    className={`absolute bottom-1 right-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                    style={{ 
                      width: '20px', 
                      height: '20px',
                      border: '3px solid white'
                    }}
                  />
                </div>
                
                {/* User Info */}
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold" style={{ color: '#0F172A' }}>
                      {user.name}
                    </h2>
                    {user.is_verified && (
                      <span className="text-yellow-500 text-2xl">👑</span>
                    )}
                  </div>
                  <p className="text-gray-500 font-medium">@{user.username}</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 mb-4">
                {renderActionButtons()}
                <Button 
                  className="flex items-center gap-2"
                  style={{ 
                    backgroundColor: 'white', 
                    color: '#6B7280',
                    border: '1px solid #D1D5DB'
                  }}
                >
                  <MessageCircle size={18} />
                  <span>Message</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Social Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 mx-8">
          {/* Day Streak */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Flame size={24} className="text-orange-500" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Day Streak</p>
                <p className="text-2xl font-bold" style={{ color: '#0F172A' }}>
                  {user.current_streak || 0}
                </p>
              </div>
            </div>
          </div>
          
          {/* Workouts */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Dumbbell size={24} className="text-blue-500" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Workouts</p>
                <p className="text-2xl font-bold" style={{ color: '#0F172A' }}>
                  {userWorkoutCount}
                </p>
              </div>
            </div>
          </div>
          
          {/* Active Minutes */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock size={24} className="text-green-500" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Active Mins</p>
                <p className="text-2xl font-bold" style={{ color: '#0F172A' }}>
                  {user.active_minutes || 0}
                </p>
              </div>
            </div>
          </div>
          
          {/* Shared Goal */}
          {user.fitness_goals?.[0] && (
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Target size={24} className="text-purple-500" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Shared Goal</p>
                  <p className="text-2xl font-bold" style={{ color: '#0F172A', textTransform: 'capitalize' }}>
                    {user.fitness_goals[0].replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="px-8 pb-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Activity Feed (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-lg text-slate-900 px-2">Recent Activity</h3>
          <RecentActivityCards user={user} userId={userId || ''} isFriend={friendshipStatus === 'friends'} currentUserId={currentUser?.uid || ''} />
        </div>

        {/* RIGHT: Gamification (1/3 width) */}
        <div className="space-y-6">
          
          {/* Trophy Case */}
          <Card className="bg-white border-gray-100">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Trophy Case
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Badge 1 */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 border-2 border-yellow-200">
                  <span className="text-xl">🏆</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">200 Workout Club</p>
                  <p className="text-xs text-gray-500">Completed 200 workouts</p>
                </div>
              </div>

              {/* Badge 2 */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 border-2 border-blue-200">
                  <span className="text-xl">🎖️</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">Consistency King</p>
                  <p className="text-xs text-gray-500">30 day streak</p>
                </div>
              </div>

              {/* Badge 3 */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 border-2 border-purple-200">
                  <span className="text-xl">💪</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">PR Crusher</p>
                  <p className="text-xs text-gray-500">Set 50 personal records</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Head to Head Comparison */}
          <Card className="bg-indigo-900 text-white border-indigo-800 shadow-lg relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-20 -mt-20 pointer-events-none" />
            
            <CardContent className="p-6 relative z-10" style={{ background: 'linear-gradient(to right, rgb(99, 102, 241), rgb(236, 72, 153))' }}>
              <h3 className="font-bold text-sm uppercase tracking-wider text-indigo-200 mb-4">Head to Head</h3>
              
              {/* Names */}
              <div className="flex items-center justify-between mb-3 text-xs font-medium text-indigo-200">
                <span>You</span>
                <span>{user.name}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex mb-2 items-center justify-between text-xs font-semibold text-white">
                  <span>{currentUserWorkoutCount} vs {userWorkoutCount} Workouts</span>
                </div>
                <div className="overflow-hidden h-3 rounded-full bg-indigo-800 flex gap-1">
                  <div 
                    style={{width: `${Math.max(currentUserPercentage, 5)}%`}} 
                    className="bg-pink-500 transition-all duration-500 rounded-full"
                  />
                  <div 
                    style={{width: `${Math.max(userPercentage, 5)}%`}} 
                    className="bg-indigo-400 transition-all duration-500 rounded-full"
                  />
                </div>
              </div>

              {/* Message */}
              <p className="text-xs text-indigo-300 italic mb-4 h-10 flex items-center">
                {userPercentage > currentUserPercentage 
                  ? `${user.name} is beating you` 
                  : 'You are ahead! Keep up the momentum!'}
              </p>

              {/* Nudge Button */}
              <Button 
                className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 border border-white/30 transition-colors"
              >
                Nudge {user.name} 👋
              </Button>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}