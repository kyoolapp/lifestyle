import React, { useState, useEffect } from 'react';
import { searchUsers, checkFriendshipStatus, sendFriendRequest, getFriendRequestStatus, removeFriend } from '../api/user_api';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

interface User {
    id: string;
    username: string;
    name?: string;
    avatar?: string;
    online?: boolean;
  }

export default function UserSearch() {
  const [user] = useAuthState(auth);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<{ [key: string]: boolean }>({});
  const [requestStatus, setRequestStatus] = useState<{ [key: string]: string | null }>({});
  const [friendshipLoading, setFriendshipLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const searchDebounced = setTimeout(async () => {
      if (query.trim().length > 0) {
        setLoading(true);
        try {
          const users = await searchUsers(query);
          // Filter out current user from results
            const filteredUsers: User[] = users.filter((u: User) => u.id !== user?.uid);
          setResults(filteredUsers);
          
          // Check friendship status and request status for each user
          if (user?.uid) {
            const statusPromises = filteredUsers.map(async (u) => {
              try {
                const areFriends = await checkFriendshipStatus(user.uid, u.id);
                const requestStatus = await getFriendRequestStatus(user.uid, u.id);
                return { userId: u.id, areFriends, requestStatus };
              } catch {
                return { userId: u.id, areFriends: false, requestStatus: null };
              }
            });
            
            const statuses = await Promise.all(statusPromises);
            const friendshipMap: { [key: string]: boolean } = {};
            const requestMap: { [key: string]: string | null } = {};
            statuses.forEach(s => {
              friendshipMap[s.userId] = s.areFriends;
              requestMap[s.userId] = s.requestStatus;
            });
            setFriendshipStatus(friendshipMap);
            setRequestStatus(requestMap);
          }
        } catch (error) {
          console.error('Search failed:', error);
        }
        setLoading(false);
      } else {
        setResults([]);
        setFriendshipStatus({});
      }
    }, 300);

    return () => clearTimeout(searchDebounced);
  }, [query, user?.uid]);

  const handleSendFriendRequest = async (receiverId: string) => {
    if (!user?.uid) return;
    
    setFriendshipLoading(prev => ({ ...prev, [receiverId]: true }));
    try {
      await sendFriendRequest(user.uid, receiverId);
      setRequestStatus(prev => ({ ...prev, [receiverId]: 'pending' }));
    } catch (error) {
      console.error('Failed to send friend request:', error);
      alert('Failed to send friend request. Please try again.');
    }
    setFriendshipLoading(prev => ({ ...prev, [receiverId]: false }));
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!user?.uid) return;
    
    setFriendshipLoading(prev => ({ ...prev, [friendId]: true }));
    try {
      await removeFriend(user.uid, friendId);
      setFriendshipStatus(prev => ({ ...prev, [friendId]: false }));
    } catch (error) {
      console.error('Failed to remove friend:', error);
      alert('Failed to remove friend. Please try again.');
    }
    setFriendshipLoading(prev => ({ ...prev, [friendId]: false }));
  };

  const UserProfile = ({ user: profileUser }: { user: User }) => (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profileUser.avatar} />
              <AvatarFallback>
                {profileUser.name?.charAt(0).toUpperCase() || profileUser.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white ${
              profileUser.online ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold">{profileUser.name}</h3>
            <p className="text-gray-600">@{profileUser.username}</p>
            <Badge variant={profileUser.online ? "default" : "secondary"} className="mt-2">
              {profileUser.online ? "Online" : "Offline"}
            </Badge>
          </div>
          
          <div className="flex space-x-2">
            {friendshipStatus[profileUser.id] ? (
              <Button
                variant="outline"
                onClick={() => handleRemoveFriend(profileUser.id)}
                disabled={friendshipLoading[profileUser.id]}
              >
                {friendshipLoading[profileUser.id] ? 'Removing...' : 'Remove Friend'}
              </Button>
            ) : requestStatus[profileUser.id] === 'pending' ? (
              <Button
                variant="outline"
                disabled={true}
              >
                Request Sent
              </Button>
            ) : (
              <Button
                onClick={() => handleSendFriendRequest(profileUser.id)}
                disabled={friendshipLoading[profileUser.id]}
              >
                {friendshipLoading[profileUser.id] ? 'Sending...' : 'Send Friend Request'}
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Back to Search
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (selectedUser) {
    return <UserProfile user={selectedUser} />;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Search Users</h1>
      
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search by username or name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {loading && (
        <div className="text-center py-8">
          <p>Searching...</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result) => (
            <Card key={result.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center space-x-3 flex-1"
                    onClick={() => setSelectedUser(result)}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={result.avatar} />
                        <AvatarFallback>
                          {result.name?.charAt(0).toUpperCase() || result.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        result.online ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{result.name}</h3>
                      <p className="text-sm text-gray-600">@{result.username}</p>
                      {result.online && <span className="text-xs text-green-600">Online</span>}
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {friendshipStatus[result.id] ? (
                        <Button
                        variant="outline"
                        size="sm"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          handleRemoveFriend(result.id);
                        }}
                        disabled={friendshipLoading[result.id]}
                        >
                        {friendshipLoading[result.id] ? 'Removing...' : 'Friends'}
                        </Button>
                    ) : requestStatus[result.id] === 'pending' ? (
                        <Button
                        variant="outline"
                        size="sm"
                        disabled={true}
                        >
                        Request Sent
                        </Button>
                    ) : (
                        <Button
                        size="sm"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          handleSendFriendRequest(result.id);
                        }}
                        disabled={friendshipLoading[result.id]}
                        >
                        {friendshipLoading[result.id] ? 'Sending...' : 'Send Request'}
                        </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {query.length > 0 && !loading && results.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No users found</p>
        </div>
      )}
    </div>
  );
}