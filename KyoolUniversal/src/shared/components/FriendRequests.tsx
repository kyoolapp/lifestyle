import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView, Button } from '../../ui';
import { 
  getIncomingFriendRequests, 
  getOutgoingFriendRequests, 
  acceptFriendRequest, 
  rejectFriendRequest,
  revokeFriendRequest 
} from '../services/api';
import { useAuthState } from '../hooks/useAuth';

interface FriendRequest {
  id: string;
  username: string;
  name: string;
  avatar: string;
  sent_at: string;
}

interface FriendRequestsProps {
  navigation?: any;
}

export function FriendRequests({ navigation }: FriendRequestsProps) {
  const { user } = useAuthState();
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const [incoming, outgoing] = await Promise.all([
        getIncomingFriendRequests(user.uid),
        getOutgoingFriendRequests(user.uid)
      ]);
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
    } catch (error) {
      console.error('Failed to load friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (senderId: string) => {
    if (!user?.uid) return;
    
    setActionLoading(senderId);
    try {
      await acceptFriendRequest(user.uid, senderId);
      Alert.alert('Success', 'Friend request accepted!');
      loadRequests(); // Reload to update the list
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to accept friend request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (senderId: string) => {
    if (!user?.uid) return;
    
    setActionLoading(senderId);
    try {
      await rejectFriendRequest(user.uid, senderId);
      Alert.alert('Success', 'Friend request rejected');
      loadRequests(); // Reload to update the list
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reject friend request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeRequest = async (receiverId: string) => {
    if (!user?.uid) return;
    
    setActionLoading(receiverId);
    try {
      await revokeFriendRequest(user.uid, receiverId);
      Alert.alert('Success', 'Friend request revoked');
      loadRequests(); // Reload to update the list
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to revoke friend request');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderIncomingRequest = ({ item }: { item: FriendRequest }) => (
    <View style={styles.requestItem}>
      <View style={styles.requestInfo}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.requestDetails}>
          <Text style={styles.requestName}>{item.name}</Text>
          <Text style={styles.requestUsername}>@{item.username}</Text>
          <Text style={styles.requestDate}>Sent {formatDate(item.sent_at)}</Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <Button
          title="Accept"
          onPress={() => handleAcceptRequest(item.id)}
          loading={actionLoading === item.id}
          disabled={!!actionLoading}
          style={styles.acceptButton}
        />
        <Button
          title="Reject"
          onPress={() => handleRejectRequest(item.id)}
          loading={actionLoading === item.id}
          disabled={!!actionLoading}
          variant="outline"
          style={styles.rejectButton}
        />
      </View>
    </View>
  );

  const renderOutgoingRequest = ({ item }: { item: FriendRequest }) => (
    <View style={styles.requestItem}>
      <View style={styles.requestInfo}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.requestDetails}>
          <Text style={styles.requestName}>{item.name}</Text>
          <Text style={styles.requestUsername}>@{item.username}</Text>
          <Text style={styles.requestDate}>Sent {formatDate(item.sent_at)}</Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <Button
          title="Revoke"
          onPress={() => handleRevokeRequest(item.id)}
          loading={actionLoading === item.id}
          disabled={!!actionLoading}
          variant="outline"
          style={styles.revokeButton}
        />
      </View>
    </View>
  );

  const renderEmptyState = () => {
    const isIncoming = activeTab === 'incoming';
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>{isIncoming ? '📨' : '📤'}</Text>
        <Text style={styles.emptyTitle}>
          No {isIncoming ? 'incoming' : 'outgoing'} requests
        </Text>
        <Text style={styles.emptyText}>
          {isIncoming 
            ? 'Friend requests from others will appear here'
            : 'Friend requests you\'ve sent will appear here'
          }
        </Text>
      </View>
    );
  };

  const currentRequests = activeTab === 'incoming' ? incomingRequests : outgoingRequests;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Friend Requests</Text>
        
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'incoming' && styles.activeTab]}
            onPress={() => setActiveTab('incoming')}
          >
            <Text style={[styles.tabText, activeTab === 'incoming' && styles.activeTabText]}>
              Incoming ({incomingRequests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'outgoing' && styles.activeTab]}
            onPress={() => setActiveTab('outgoing')}
          >
            <Text style={[styles.tabText, activeTab === 'outgoing' && styles.activeTabText]}>
              Outgoing ({outgoingRequests.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      ) : (
        <FlatList
          data={currentRequests}
          renderItem={activeTab === 'incoming' ? renderIncomingRequest : renderOutgoingRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 20,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
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
    color: '#0f172a',
  },
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  requestItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  requestDetails: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  requestUsername: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 8,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 8,
  },
  revokeButton: {
    flex: 1,
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
});