import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers, checkFriendshipStatus, sendFriendRequest, getFriendRequestStatus, removeFriend, revokeFriendRequest, acceptFriendRequest, rejectFriendRequest, getIncomingFriendRequests, getOutgoingFriendRequests } from '../api/user_api';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { X, Search, UserPlus, UserMinus, UserCheck, Clock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FriendRequests from './FriendRequests';

interface User {
  id: string;
  username: string;
  name?: string;
  avatar?: string;
  online?: boolean;
}

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchPanel({ isOpen, onClose }: SearchPanelProps) {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<{ [key: string]: boolean }>({});
  const [requestStatus, setRequestStatus] = useState<{ [key: string]: string | null }>({});
  const [friendshipLoading, setFriendshipLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const searchDebounced = setTimeout(async () => {
      if (query.trim().length > 0) {
        setLoading(true);
        try {
          const users = await searchUsers(query);
          const filteredUsers: User[] = users.filter((u: User) => u.id !== user?.uid);
          setResults(filteredUsers);
          
          if (user?.uid) {
            const statusPromises = filteredUsers.map(async (u) => {
              try {
                const areFriends = await checkFriendshipStatus(user.uid, u.id);
                
                const [incomingRequests, outgoingRequests] = await Promise.all([
                  getIncomingFriendRequests(user.uid),
                  getOutgoingFriendRequests(user.uid)
                ]);
                
                let status = null;
                if (areFriends) {
                  status = 'friends';
                } else {
                  const incomingRequest = incomingRequests.find((req: any) => req.sender_id === u.id);
                  const outgoingRequest = outgoingRequests.find((req: any) => req.receiver_id === u.id);
                  
                  if (incomingRequest) {
                    status = 'incoming';
                  } else if (outgoingRequest) {
                    status = 'outgoing';
                  }
                }
                
                return { userId: u.id, areFriends, status };
              } catch (error) {
                console.error(`Error checking status for user ${u.id}:`, error);
                return { userId: u.id, areFriends: false, status: null };
              }
            });
            
            const statuses = await Promise.all(statusPromises);
            const friendshipStatusMap: { [key: string]: boolean } = {};
            const requestStatusMap: { [key: string]: string | null } = {};
            
            statuses.forEach(({ userId, areFriends, status }) => {
              friendshipStatusMap[userId] = areFriends;
              requestStatusMap[userId] = status;
            });
            
            setFriendshipStatus(friendshipStatusMap);
            setRequestStatus(requestStatusMap);
          }
        } catch (error) {
          console.error('Search failed:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchDebounced);
  }, [query, user?.uid]);

  const handleSendFriendRequest = async (receiverId: string) => {
    if (!user?.uid) return;
    
    setFriendshipLoading(prev => ({ ...prev, [receiverId]: true }));
    try {
      await sendFriendRequest(user.uid, receiverId);
      setRequestStatus(prev => ({ ...prev, [receiverId]: 'outgoing' }));
    } catch (error) {
      console.error('Failed to send friend request:', error);
    } finally {
      setFriendshipLoading(prev => ({ ...prev, [receiverId]: false }));
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!user?.uid) return;
    
    setFriendshipLoading(prev => ({ ...prev, [friendId]: true }));
    try {
      await removeFriend(user.uid, friendId);
      setFriendshipStatus(prev => ({ ...prev, [friendId]: false }));
      setRequestStatus(prev => ({ ...prev, [friendId]: null }));
    } catch (error) {
      console.error('Failed to remove friend:', error);
    } finally {
      setFriendshipLoading(prev => ({ ...prev, [friendId]: false }));
    }
  };

  const handleRevokeRequest = async (receiverId: string) => {
    if (!user?.uid) return;
    
    setFriendshipLoading(prev => ({ ...prev, [receiverId]: true }));
    try {
      await revokeFriendRequest(user.uid, receiverId);
      setRequestStatus(prev => ({ ...prev, [receiverId]: null }));
    } catch (error) {
      console.error('Failed to revoke friend request:', error);
    } finally {
      setFriendshipLoading(prev => ({ ...prev, [receiverId]: false }));
    }
  };

  const handleAcceptRequest = async (senderId: string) => {
    if (!user?.uid) return;
    
    setFriendshipLoading(prev => ({ ...prev, [senderId]: true }));
    try {
      await acceptFriendRequest(user.uid, senderId);
      setFriendshipStatus(prev => ({ ...prev, [senderId]: true }));
      setRequestStatus(prev => ({ ...prev, [senderId]: 'friends' }));
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    } finally {
      setFriendshipLoading(prev => ({ ...prev, [senderId]: false }));
    }
  };

  const handleRejectRequest = async (senderId: string) => {
    if (!user?.uid) return;
    
    setFriendshipLoading(prev => ({ ...prev, [senderId]: true }));
    try {
      await rejectFriendRequest(user.uid, senderId);
      setRequestStatus(prev => ({ ...prev, [senderId]: null }));
    } catch (error) {
      console.error('Failed to reject friend request:', error);
    } finally {
      setFriendshipLoading(prev => ({ ...prev, [senderId]: false }));
    }
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/user/${userId}`);
    onClose();
  };

  const renderActionButton = (targetUser: User) => {
    const isFriend = friendshipStatus[targetUser.id];
    
    // Only show friend indicator, no action buttons in search
    if (isFriend) {
      return (
        <Badge variant="secondary" className="text-xs">
        <Users> </Users>
          
        </Badge>
      );
    }
    
    return null;
  };

  // Reset search when panel closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Side Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-80 bg-background border-r border-border z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Search Users</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by username or name..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 pr-4"
                  autoFocus
                />
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Searching...</p>
                  </div>
                </div>
              ) : query.trim() === '' ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">Start typing to search for users</p>
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">No users found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {results.map((targetUser) => (
                    <motion.div
                      key={targetUser.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="relative cursor-pointer" onClick={() => handleViewProfile(targetUser.id)}>
                        <Avatar className="w-10 h-10 hover:ring-2 hover:ring-primary transition-all">
                          <AvatarImage src={targetUser.avatar} />
                          <AvatarFallback>
                            {targetUser.name?.charAt(0).toUpperCase() || targetUser.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                          targetUser.online ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleViewProfile(targetUser.id)}>
                        <p className="text-sm font-medium truncate hover:text-primary transition-colors">
                          {targetUser.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">@{targetUser.username}</p>
                      </div>
                      
                      <div className="flex-shrink-0">
                        {renderActionButton(targetUser)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}