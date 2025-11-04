import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserFriends, removeFriend } from '../api/user_api';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Users, ArrowLeft, UserPlus } from 'lucide-react';

interface Friend {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  online: boolean;
  last_active?: string;
}

interface ViewAllFriendsProps {
  onBack?: () => void;
  onAddFriends?: () => void;
  user?: any; // Allow passing user from route
}


export default function ViewAllFriends({ onBack, onAddFriends, user: propUser }: ViewAllFriendsProps) {
  const [authUser] = useAuthState(auth);
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use either the passed user or the authenticated user
  const user = propUser || authUser;

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user?.uid && !user?.id) return;
      
      try {
        const userId = user.uid || user.id;
        const friendsList = await getUserFriends(userId);
        setFriends(friendsList);
      } catch (error) {
        console.error('Failed to fetch friends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();

    // Listen for friend removal events
    const handleFriendRemoved = (event: CustomEvent) => {
      const { friendId } = event.detail;
      setFriends(prevFriends => prevFriends.filter(friend => friend.id !== friendId));
    };

    window.addEventListener('friendRemoved', handleFriendRemoved as EventListener);

    return () => {
      window.removeEventListener('friendRemoved', handleFriendRemoved as EventListener);
    };
  }, [user?.uid]);

  const handleViewProfile = (friendId: string) => {
    navigate(`/user/${friendId}`);
  };



  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p>Loading friends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header for standalone usage */}
      {!onBack && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/profile')}
              className="mr-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">My Friends</h1>
          </div>
          <Button onClick={() => navigate('/search')}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Friends
          </Button>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>Friends ({friends.length})</span>
            </div>
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't added any friends yet</p>
              <Button onClick={() => window.location.href = '/search'}>
                Find Friends
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-md"
                  onClick={() => handleViewProfile(friend.id)}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={friend.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {friend.name?.charAt(0).toUpperCase() || friend.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {friend.online && (
                      <div className="absolute -bottom-1 -right-001 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 truncate hover:text-purple-600 transition-colors">
                      {friend.name}
                    </h3>
                      <Users className="w-4 h-4 text-gray-400" />
                    </div>
                    
                    <p className="text-xs text-gray-500 truncate">
                      @{friend.username}
                    </p>
                    
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/*<Badge 
                      variant={friend.online ? "default" : "secondary"} 
                      className={`text-xs ${friend.online ? 'bg-green-500' : 'bg-gray-400'}`}
                    >
                      {friend.online ? "Online" : "Offline"}
                    </Badge>*/}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        handleViewProfile(friend.id);
                      }}
                      className="hover:bg-purple-50 hover:border-purple-300"
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}