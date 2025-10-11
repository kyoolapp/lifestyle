import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView, Button } from '../../ui';
import { 
  getUserByUserId, 
  getFriendRequestStatus, 
  sendFriendRequest, 
  acceptFriendRequest,
  rejectFriendRequest,
  revokeFriendRequest,
  removeFriend,
  checkFriendshipStatus
} from '../services/api';
import { useAuthState } from '../hooks/useAuth';

interface UserProfileData {
  id: string;
  username: string;
  name: string;
  avatar: string;
  email: string;
  online: boolean;
  date_joined: string;
  age?: number;
  height?: number;
  weight?: number;
  activity_level?: string;
  bmi?: number;
}

interface UserProfileProps {
  navigation?: any;
  route?: {
    params?: {
      userId: string;
    };
  };
}

export function UserProfile({ navigation, route }: UserProfileProps) {
  const { user: currentUser } = useAuthState();
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState<string>('none');
  const [areFriends, setAreFriends] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const userId = route?.params?.userId;
  const isOwnProfile = userId === currentUser?.uid;

  useEffect(() => {
    if (userId) {
      loadUserProfile();
      if (!isOwnProfile) {
        loadFriendshipData();
      }
    }
  }, [userId]);

  const loadUserProfile = async () => {
    if (!userId) return;
    
    try {
      const userData = await getUserByUserId(userId);
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const loadFriendshipData = async () => {
    if (!userId || !currentUser?.uid) return;
    
    try {
      const [requestStatus, friendship] = await Promise.all([
        getFriendRequestStatus(currentUser.uid, userId),
        checkFriendshipStatus(currentUser.uid, userId)
      ]);
      setFriendStatus(requestStatus);
      setAreFriends(friendship);
    } catch (error) {
      console.error('Failed to load friendship data:', error);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!currentUser?.uid || !userId) return;
    
    setActionLoading(true);
    try {
      await sendFriendRequest(currentUser.uid, userId);
      setFriendStatus('pending_sent');
      Alert.alert('Success', 'Friend request sent!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send friend request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptFriendRequest = async () => {
    if (!currentUser?.uid || !userId) return;
    
    setActionLoading(true);
    try {
      await acceptFriendRequest(currentUser.uid, userId);
      setAreFriends(true);
      setFriendStatus('none');
      Alert.alert('Success', 'Friend request accepted!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to accept friend request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectFriendRequest = async () => {
    if (!currentUser?.uid || !userId) return;
    
    setActionLoading(true);
    try {
      await rejectFriendRequest(currentUser.uid, userId);
      setFriendStatus('none');
      Alert.alert('Success', 'Friend request rejected');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reject friend request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeFriendRequest = async () => {
    if (!currentUser?.uid || !userId) return;
    
    setActionLoading(true);
    try {
      await revokeFriendRequest(currentUser.uid, userId);
      setFriendStatus('none');
      Alert.alert('Success', 'Friend request revoked');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to revoke friend request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!currentUser?.uid || !userId) return;
    
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${user?.name} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await removeFriend(currentUser.uid, userId);
              setAreFriends(false);
              setFriendStatus('none');
              Alert.alert('Success', 'Friend removed');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to remove friend');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderFriendButton = () => {
    if (isOwnProfile) return null;

    if (areFriends) {
      return (
        <Button
          title="Remove Friend"
          onPress={handleRemoveFriend}
          loading={actionLoading}
          variant="outline"
          style={styles.actionButton}
        />
      );
    }

    switch (friendStatus) {
      case 'pending_sent':
        return (
          <Button
            title="Request Sent"
            onPress={handleRevokeFriendRequest}
            loading={actionLoading}
            variant="outline"
            style={styles.actionButton}
          />
        );
      case 'pending_received':
        return (
          <View style={styles.requestButtons}>
            <Button
              title="Accept"
              onPress={handleAcceptFriendRequest}
              loading={actionLoading}
              style={styles.acceptButton}
            />
            <Button
              title="Reject"
              onPress={handleRejectFriendRequest}
              loading={actionLoading}
              variant="outline"
              style={styles.rejectButton}
            />
          </View>
        );
      default:
        return (
          <Button
            title="Add Friend"
            onPress={handleSendFriendRequest}
            loading={actionLoading}
            style={styles.actionButton}
          />
        );
    }
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getActivityLevelText = (level: string) => {
    const levels: { [key: string]: string } = {
      'sedentary': 'Sedentary',
      'light': 'Lightly Active',
      'moderate': 'Moderately Active',
      'very_active': 'Very Active',
      'athlete': 'Athlete'
    };
    return levels[level] || level;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <View style={[styles.onlineIndicator, { backgroundColor: user.online ? '#10b981' : '#6b7280' }]} />
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={[styles.onlineStatus, { color: user.online ? '#10b981' : '#6b7280' }]}>
            {user.online ? 'Online' : 'Offline'}
          </Text>
        </View>

        {renderFriendButton()}

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Joined</Text>
              <Text style={styles.infoValue}>{formatJoinDate(user.date_joined)}</Text>
            </View>
            
            {user.age && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Age</Text>
                <Text style={styles.infoValue}>{user.age} years</Text>
              </View>
            )}
            
            {user.height && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Height</Text>
                <Text style={styles.infoValue}>{user.height} cm</Text>
              </View>
            )}
            
            {user.weight && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Weight</Text>
                <Text style={styles.infoValue}>{user.weight} kg</Text>
              </View>
            )}
            
            {user.bmi && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>BMI</Text>
                <Text style={styles.infoValue}>{user.bmi.toFixed(1)}</Text>
              </View>
            )}
            
            {user.activity_level && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Activity Level</Text>
                <Text style={styles.infoValue}>{getActivityLevelText(user.activity_level)}</Text>
              </View>
            )}
          </View>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  content: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  onlineStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    marginBottom: 24,
  },
  requestButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  acceptButton: {
    flex: 1,
  },
  rejectButton: {
    flex: 1,
  },
  infoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#dc2626',
    fontWeight: '600',
  },
});