import React, { useState, useEffect } from 'react';
import { getUserFriends, removeFriend } from '../api/user_api';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

interface Friend {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  online: boolean;
  last_active?: string;
}

interface ViewAllFriendsProps {
  onBack: () => void;
  onAddFriends: () => void;
  // existing props
}


export default function ViewAllFriends({ onBack, onAddFriends }: ViewAllFriendsProps) {
  const [user] = useAuthState(auth);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user?.uid) return;
      
      try {
        const friendsList = await getUserFriends(user.uid);
        setFriends(friendsList);
      } catch (error) {
        console.error('Failed to fetch friends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [user?.uid]);

  const handleRemoveFriend = async (friendId: string) => {
    if (!user?.uid) return;
    
    const confirmed = window.confirm('Are you sure you want to remove this friend?');
    if (!confirmed) return;

    try {
      await removeFriend(user.uid, friendId);
      setFriends(prev => prev.filter(f => f.id !== friendId));
      if (selectedFriend?.id === friendId) {
        setSelectedFriend(null);
      }
    } catch (error) {
      console.error('Failed to remove friend:', error);
      alert('Failed to remove friend. Please try again.');
    }
  };

  const FriendProfile = ({ friend }: { friend: Friend }) => (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={friend.avatar} />
              <AvatarFallback>
                {friend.name?.charAt(0).toUpperCase() || friend.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white ${
              friend.online ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold">{friend.name}</h3>
            <p className="text-gray-600">@{friend.username}</p>
            <Badge variant={friend.online ? "default" : "secondary"} className="mt-2">
              {friend.online ? "Online" : "Offline"}
            </Badge>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => handleRemoveFriend(friend.id)}
            >
              Remove Friend
            </Button>
            <Button variant="outline" onClick={() => setSelectedFriend(null)}>
              Back to Friends
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (selectedFriend) {
    return <FriendProfile friend={selectedFriend} />;
  }

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>My Friends ({friends.length})</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <Card key={friend.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div 
                      className="flex flex-col items-center space-y-3"
                      onClick={() => setSelectedFriend(friend)}
                    >
                      <div className="relative">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={friend.avatar} />
                          <AvatarFallback>
                            {friend.name?.charAt(0).toUpperCase() || friend.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          friend.online ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="text-center">
                        <h4 className="font-medium">{friend.name}</h4>
                        <p className="text-sm text-gray-600">@{friend.username}</p>
                        <Badge 
                          variant={friend.online ? "default" : "secondary"} 
                          className="text-xs mt-1"
                        >
                          {friend.online ? "Online" : "Offline"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}