import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers, checkFriendshipStatus, sendFriendRequest, getFriendRequestStatus, removeFriend, revokeFriendRequest, acceptFriendRequest, rejectFriendRequest, getIncomingFriendRequests, getOutgoingFriendRequests } from '../api/user_api';
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
  const navigate = useNavigate();
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
                
                // Get both incoming and outgoing requests to determine exact status
                const [incomingRequests, outgoingRequests] = await Promise.all([
                  getIncomingFriendRequests(user.uid),
                  getOutgoingFriendRequests(user.uid)
                ]);
                
                // Check if this user is in my incoming requests (they sent me a request)
                const incomingFromThisUser = incomingRequests.find((req: any) => req.sender_id === u.id);
                // Check if this user is in my outgoing requests (I sent them a request)
                const outgoingToThisUser = outgoingRequests.find((req: any) => req.receiver_id === u.id);
                
                let requestStatus = null;
                if (incomingFromThisUser) {
                  requestStatus = 'received_pending'; // They sent me a request
                } else if (outgoingToThisUser) {
                  requestStatus = 'sent_pending'; // I sent them a request
                }
                
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
      setRequestStatus(prev => ({ ...prev, [receiverId]: 'sent_pending' }));
    } catch (error) {
      console.error('Failed to send friend request:', error);
      alert('Failed to send friend request. Please try again.');
    }
    setFriendshipLoading(prev => ({ ...prev, [receiverId]: false }));
  };

  const handleRevokeFriendRequest = async (receiverId: string) => {
    if (!user?.uid) return;
    
    setFriendshipLoading(prev => ({ ...prev, [receiverId]: true }));
    try {
      await revokeFriendRequest(user.uid, receiverId);
      setRequestStatus(prev => ({ ...prev, [receiverId]: null }));
    } catch (error) {
      console.error('Failed to revoke friend request:', error);
      alert('Failed to revoke friend request. Please try again.');
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

  const handleAcceptFriendRequest = async (senderId: string) => {
    if (!user?.uid) return;
    
    setFriendshipLoading(prev => ({ ...prev, [senderId]: true }));
    try {
      await acceptFriendRequest(user.uid, senderId);
      setFriendshipStatus(prev => ({ ...prev, [senderId]: true }));
      setRequestStatus(prev => ({ ...prev, [senderId]: null }));
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      alert('Failed to accept friend request. Please try again.');
    }
    setFriendshipLoading(prev => ({ ...prev, [senderId]: false }));
  };

  const handleRejectFriendRequest = async (senderId: string) => {
    if (!user?.uid) return;
    
    setFriendshipLoading(prev => ({ ...prev, [senderId]: true }));
    try {
      await rejectFriendRequest(user.uid, senderId);
      setRequestStatus(prev => ({ ...prev, [senderId]: null }));
    } catch (error) {
      console.error('Failed to reject friend request:', error);
      alert('Failed to reject friend request. Please try again.');
    }
    setFriendshipLoading(prev => ({ ...prev, [senderId]: false }));
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
          
          <div className="w-full space-y-3">
            {friendshipStatus[profileUser.id] ? (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => handleRemoveFriend(profileUser.id)}
                  disabled={friendshipLoading[profileUser.id]}
                >
                  {friendshipLoading[profileUser.id] ? 'Removing...' : 'Remove Friend'}
                </Button>
              </div>
            ) : requestStatus[profileUser.id] === 'sent_pending' ? (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => handleRevokeFriendRequest(profileUser.id)}
                  disabled={friendshipLoading[profileUser.id]}
                >
                  {friendshipLoading[profileUser.id] ? 'Removing...' : 'Remove Request'}
                </Button>
              </div>
            ) : requestStatus[profileUser.id] === 'received_pending' ? (
              <div className="space-y-3">
                <div className="text-center">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200 text-sm px-3 py-1">
                    📨 Friend Request Received
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    {profileUser.name} wants to be your friend
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => handleAcceptFriendRequest(profileUser.id)}
                    disabled={friendshipLoading[profileUser.id]}
                    className="flex-1 max-w-32"
                  >
                    {friendshipLoading[profileUser.id] ? 'Accepting...' : 'Accept'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRejectFriendRequest(profileUser.id)}
                    disabled={friendshipLoading[profileUser.id]}
                    className="flex-1 max-w-32"
                  >
                    {friendshipLoading[profileUser.id] ? 'Declining...' : 'Decline'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <Button
                  onClick={() => handleSendFriendRequest(profileUser.id)}
                  disabled={friendshipLoading[profileUser.id]}
                >
                  {friendshipLoading[profileUser.id] ? 'Sending...' : 'Send Friend Request'}
                </Button>
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Back to Search
              </Button>
              <Button 
                variant="default"
                onClick={() => navigate(`/user/${profileUser.id}`)}
              >
                View Full Profile
              </Button>
            </div>
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
      <h1 className="text-2xl font-bold mb-2">Search Users</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Click on any user card to view their profile and manage friend requests
      </p>
      
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
            <Card 
              key={result.id} 
              className={`cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all duration-200 ${
                requestStatus[result.id] === 'received_pending' 
                  ? 'border-purple-200 bg-purple-50/30' 
                  : 'hover:bg-gray-50/50'
              }`}
              onClick={() => navigate(`/user/${result.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="relative cursor-pointer">
                      <Avatar className="hover:ring-2 hover:ring-blue-300 transition-all">
                        <AvatarImage src={result.avatar} />
                        <AvatarFallback>
                          {result.name?.charAt(0).toUpperCase() || result.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {requestStatus[result.id] === 'received_pending' && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">!</span>
                        </div>
                      )}
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        result.online ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold hover:text-blue-600 cursor-pointer transition-colors">{result.name}</h3>
                      <p className="text-sm text-gray-600">@{result.username}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {result.online && <span className="text-xs text-green-600">Online</span>}
                        {requestStatus[result.id] === 'received_pending' && (
                          <span className="text-xs text-purple-600 font-medium">📨 Sent you a friend request</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {friendshipStatus[result.id] && (
                      <span className="text-sm font-medium text-blue-600">👥 Friend</span>
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