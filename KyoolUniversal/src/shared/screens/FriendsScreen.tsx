import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Avatar } from '../../ui/Avatar';
import { Badge } from '../../ui/Badge';
import { searchUsers, sendFriendRequest, getFriends, removeFriend, acceptFriendRequest, getIncomingFriendRequests } from '../services/api';

interface FriendsScreenProps {
  user?: any;
}

interface Friend {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  isOnline?: boolean;
  status?: 'friends' | 'pending' | 'requested';
}

export function FriendsScreen({ user }: FriendsScreenProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'search' | 'requests'>('friends');

  useEffect(() => {
    loadFriendsData();
  }, [user?.id]);

  const loadFriendsData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Load friends list
      const friendsList = await getFriends(user.id);
      setFriends(friendsList);
      
      // Load pending friend requests
      const requests = await getIncomingFriendRequests(user.id);
      setPendingRequests(requests);
    } catch (error) {
      console.error('Failed to load friends data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user?.id) return;
    
    try {
      setLoading(true);
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert('Error', 'Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (targetUserId: string) => {
    if (!user?.id) return;
    
    try {
      await sendFriendRequest(user.id, targetUserId);
      
      // Update search results to show request sent
      setSearchResults(prev => prev.map(result => 
        result.id === targetUserId 
          ? { ...result, status: 'requested' }
          : result
      ));
      
      Alert.alert('Success', 'Friend request sent!');
    } catch (error) {
      console.error('Failed to send friend request:', error);
      Alert.alert('Error', 'Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (requesterId: string) => {
    if (!user?.id) return;
    
    try {
      await acceptFriendRequest(requesterId, user.id);
      
      // Move from pending to friends
      const acceptedUser = pendingRequests.find(req => req.id === requesterId);
      if (acceptedUser) {
        setFriends(prev => [...prev, { ...acceptedUser, status: 'friends' }]);
        setPendingRequests(prev => prev.filter(req => req.id !== requesterId));
      }
      
      Alert.alert('Success', 'Friend request accepted!');
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!user?.id) return;
    
    Alert.alert(
      'Remove Friend',
      'Are you sure you want to remove this friend?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFriend(user.id, friendId);
              setFriends(prev => prev.filter(friend => friend.id !== friendId));
              Alert.alert('Success', 'Friend removed');
            } catch (error) {
              console.error('Failed to remove friend:', error);
              Alert.alert('Error', 'Failed to remove friend');
            }
          },
        },
      ]
    );
  };

  const renderFriendItem = (friend: Friend, showActions = false) => (
    <View key={friend.id} style={styles.friendItem}>
      <Avatar
        src={friend.profilePicture}
        fallback={friend.name.charAt(0).toUpperCase()}
        size={50}
      />
      <View style={styles.friendInfo}>
        <View style={styles.friendHeader}>
          <Text style={styles.friendName}>{friend.name}</Text>
          {friend.isOnline && (
            <Badge variant="default" style={styles.onlineBadge}>
              Online
            </Badge>
          )}
        </View>
        <Text style={styles.friendEmail}>{friend.email}</Text>
      </View>
      
      {showActions && (
        <View style={styles.friendActions}>
          {friend.status === 'friends' ? (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveFriend(friend.id)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          ) : friend.status === 'pending' ? (
            <View style={styles.pendingActions}>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAcceptRequest(friend.id)}
              >
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.declineButton}
                onPress={() => {/* Handle decline */}}
              >
                <Text style={styles.declineButtonText}>Decline</Text>
              </TouchableOpacity>
            </View>
          ) : friend.status === 'requested' ? (
            <Badge variant="secondary">
              Requested
            </Badge>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleSendFriendRequest(friend.id)}
            >
              <Text style={styles.addButtonText}>Add Friend</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
        <Text style={styles.subtitle}>Connect with your health journey partners</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={() => setActiveTab('search')}
        >
          <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
            Search
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Requests ({pendingRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'friends' && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Your Friends</Text>
            {friends.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No friends yet</Text>
                <Text style={styles.emptySubtext}>Search for users to send friend requests</Text>
              </View>
            ) : (
              <View style={styles.friendsList}>
                {friends.map(friend => renderFriendItem(friend, true))}
              </View>
            )}
          </Card>
        )}

        {activeTab === 'search' && (
          <>
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Find Friends</Text>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                />
                <Button
                  variant="default"
                  size="sm"
                  onPress={handleSearch}
                  disabled={loading || !searchQuery.trim()}
                >
                  Search
                </Button>
              </View>
            </Card>

            {searchResults.length > 0 && (
              <Card style={styles.section}>
                <Text style={styles.sectionTitle}>Search Results</Text>
                <View style={styles.friendsList}>
                  {searchResults.map(result => renderFriendItem(result, true))}
                </View>
              </Card>
            )}
          </>
        )}

        {activeTab === 'requests' && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Friend Requests</Text>
            {pendingRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No pending requests</Text>
                <Text style={styles.emptySubtext}>Friend requests will appear here</Text>
              </View>
            ) : (
              <View style={styles.friendsList}>
                {pendingRequests.map(request => renderFriendItem({ ...request, status: 'pending' }, true))}
              </View>
            )}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  activeTabText: {
    color: '#1f2937',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  friendsList: {
    gap: 12,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
  friendEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  onlineBadge: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  friendActions: {
    marginLeft: 12,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  removeButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  acceptButtonText: {
    color: '#15803d',
    fontSize: 12,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  declineButtonText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
});