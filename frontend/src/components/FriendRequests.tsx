import React, { useState, useEffect } from 'react';
import { getIncomingFriendRequests, getOutgoingFriendRequests, acceptFriendRequest, rejectFriendRequest, revokeFriendRequest } from '../api/user_api';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface FriendRequest {
  request_id: string;
  sender_id?: string;
  receiver_id?: string;
  username: string;
  name: string;
  avatar?: string;
  online: boolean;
  created_at: string;
}

export default function FriendRequests() {
  const [user] = useAuthState(auth);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user?.uid) return;
      
      try {
        const [incoming, outgoing] = await Promise.all([
          getIncomingFriendRequests(user.uid),
          getOutgoingFriendRequests(user.uid)
        ]);
        
        setIncomingRequests(incoming);
        setOutgoingRequests(outgoing);
      } catch (error) {
        console.error('Failed to fetch friend requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user?.uid]);

  const handleAcceptRequest = async (senderId: string, requestId: string) => {
    if (!user?.uid) return;
    
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      await acceptFriendRequest(user.uid, senderId);
      setIncomingRequests(prev => prev.filter(req => req.request_id !== requestId));
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      alert('Failed to accept friend request. Please try again.');
    }
    setActionLoading(prev => ({ ...prev, [requestId]: false }));
  };

  const handleRejectRequest = async (senderId: string, requestId: string) => {
    if (!user?.uid) return;
    
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      await rejectFriendRequest(user.uid, senderId);
      setIncomingRequests(prev => prev.filter(req => req.request_id !== requestId));
    } catch (error) {
      console.error('Failed to reject friend request:', error);
      alert('Failed to reject friend request. Please try again.');
    }
    setActionLoading(prev => ({ ...prev, [requestId]: false }));
  };

  const handleRevokeRequest = async (receiverId: string, requestId: string) => {
    if (!user?.uid) return;
    
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      await revokeFriendRequest(user.uid, receiverId);
      setOutgoingRequests(prev => prev.filter(req => req.request_id !== requestId));
    } catch (error) {
      console.error('Failed to revoke friend request:', error);
      alert('Failed to revoke friend request. Please try again.');
    }
    setActionLoading(prev => ({ ...prev, [requestId]: false }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p>Loading friend requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Friend Requests</h1>
      
      <Tabs defaultValue="incoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="incoming">
            Incoming ({incomingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="outgoing">
            Outgoing ({outgoingRequests.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="incoming" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Incoming Friend Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {incomingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No incoming friend requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incomingRequests.map((request) => (
                    <Card key={request.request_id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={request.avatar} />
                                <AvatarFallback>
                                  {request.name?.charAt(0).toUpperCase() || request.username?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                request.online ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                            </div>
                            <div>
                              <h4 className="font-semibold">{request.name}</h4>
                              <p className="text-sm text-gray-600">@{request.username}</p>
                              <p className="text-xs text-gray-500">{formatDate(request.created_at)}</p>
                              <Badge variant={request.online ? "default" : "secondary"} className="text-xs mt-1">
                                {request.online ? "Online" : "Offline"}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptRequest(request.sender_id!, request.request_id)}
                              disabled={actionLoading[request.request_id]}
                            >
                              {actionLoading[request.request_id] ? 'Accepting...' : 'Accept'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectRequest(request.sender_id!, request.request_id)}
                              disabled={actionLoading[request.request_id]}
                            >
                              {actionLoading[request.request_id] ? 'Rejecting...' : 'Reject'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="outgoing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Outgoing Friend Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {outgoingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No outgoing friend requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {outgoingRequests.map((request) => (
                    <Card key={request.request_id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={request.avatar} />
                                <AvatarFallback>
                                  {request.name?.charAt(0).toUpperCase() || request.username?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                request.online ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                            </div>
                            <div>
                              <h4 className="font-semibold">{request.name}</h4>
                              <p className="text-sm text-gray-600">@{request.username}</p>
                              <p className="text-xs text-gray-500">Sent: {formatDate(request.created_at)}</p>
                              <Badge variant={request.online ? "default" : "secondary"} className="text-xs mt-1">
                                {request.online ? "Online" : "Offline"}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevokeRequest(request.receiver_id!, request.request_id)}
                              disabled={actionLoading[request.request_id]}
                            >
                              {actionLoading[request.request_id] ? 'Revoking...' : 'Revoke'}
                            </Button>
                            <Badge variant="outline" className="text-yellow-600">
                              Pending
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
        </TabsContent>
      </Tabs>
    </div>
  );
}