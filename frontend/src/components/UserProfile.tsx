import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserByUserId, getUserOnlineStatus, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriendshipStatus, checkFriendshipStatus, getIncomingFriendRequests, getOutgoingFriendRequests, revokeFriendRequest, removeFriend } from '../api/user_api';
import { calculateBMI, calculateBMR, calculateTDEE } from '../utils/health';
import { useUnitSystem } from '../context/UnitContext';
import { heightConversions, weightConversions } from '../utils/unitConversion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ArrowLeft, User, MessageCircle, UserPlus, CheckCircle, X, Users } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

interface UserProfileProps {
  userId?: string; // Optional prop for direct component usage
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

  const renderActionButton = () => {
    switch (friendshipStatus) {
      case 'friends':
        return (
          <div className="flex gap-12">
            <Users className="w-4 h-4" />
            <Button 
              variant="outline"
              onClick={handleUnfriend}
              disabled={actionLoading}
              className="flex items-center gap-2"
            >
              
              {actionLoading ? 'Removing...' : 'Unfriend'}
            </Button>
          </div>
        );
      case 'sent':
        return (
          <Button 
            variant="outline" 
            onClick={handleRevokeFriendRequest}
            disabled={actionLoading}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            {actionLoading ? 'Removing...' : 'Request Sent'}
          </Button>
        );
      case 'received':
        return (
          <div className="flex gap-2">
            <Button 
              onClick={handleAcceptFriendRequest}
              disabled={actionLoading}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {actionLoading ? 'Accepting...' : 'Accept'}
            </Button>
            <Button 
              variant="outline"
              onClick={handleRejectFriendRequest}
              disabled={actionLoading}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              {actionLoading ? 'Declining...' : 'Decline'}
            </Button>
          </div>
        );
      default:
        return (
          <Button 
            onClick={handleSendFriendRequest}
            disabled={actionLoading}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {actionLoading ? 'Sending...' : 'Add Friend'}
          </Button>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">User not found</p>
        </div>
      </div>
    );
  }

  // Calculate health metrics if available
  const bmi = user.weight && user.height ? calculateBMI(user.weight, user.height) : null;
  const bmr = user.weight && user.height && user.age ? calculateBMR(user.weight, user.height, user.age, user.gender || 'male') : null;
  const tdee = bmr ? calculateTDEE(bmr, user.activityLevel || 'sedentary') : null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl">
                  {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute bottom-1 right-2-5 w-3 h-3 rounded-full border-4 border-white ${
                isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div>
                  <h3 className="text-2xl font-bold">@{user.username}</h3>
                  <p className="text-gray-600">{user.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  
                  {/*<Badge variant={isOnline ? "default" : "secondary"}>
                    {isOnline ? "Online" : "Offline"}
                  </Badge>*/}
                  {friendshipStatus === 'received' && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                      📨 Friend Request Received
                    </Badge>
                  )}
                  {friendshipStatus === 'sent' && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                      ⏳ Friend Request Sent
                    </Badge>
                  )}
                  {renderActionButton()}
                </div>
              </div>
              
              {user.bio && (
                <p className="text-gray-700 mb-4">{user.bio}</p>
              )}
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                {user.age && (
                  <div>
                    <span className="text-gray-500">Age</span>
                    <div className="font-medium">{user.age} years</div>
                  </div>
                )}
                {user.location && (
                  <div>
                    <span className="text-gray-500">Location</span>
                    <div className="font-medium">{user.location}</div>
                  </div>
                )}
                {user.height && (
                  <div>
                    <span className="text-gray-500">Height</span>
                    <div className="font-medium">{heightConversions.format(user.height, unitPreferences.height)}</div>
                  </div>
                )}
                {user.weight && (
                  <div>
                    <span className="text-gray-500">Weight</span>
                    <div className="font-medium">{weightConversions.dbToDisplay(user.weight, unitPreferences.weight).toFixed(1)} {unitPreferences.weight}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Metrics - Only show if user has shared this info */}
      {(bmi || bmr || tdee) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Health Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {bmi && (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{bmi.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">BMI</div>
                </div>
              )}
              {bmr && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{Math.round(bmr)}</div>
                  <div className="text-sm text-gray-600">BMR (cal/day)</div>
                </div>
              )}
              {tdee && (
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{Math.round(tdee)}</div>
                  <div className="text-sm text-gray-600">TDEE (cal/day)</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Level & Goals */}
      {(user.activityLevel || user.fitnessGoals?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Fitness & Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.activityLevel && (
                <div>
                  <span className="text-gray-500 text-sm">Activity Level</span>
                  <div className="font-medium capitalize">{user.activityLevel.replace('_', ' ')}</div>
                </div>
              )}
              {user.fitnessGoals?.length > 0 && (
                <div>
                  <span className="text-gray-500 text-sm">Fitness Goals</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user.fitnessGoals.map((goal: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {goal.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}