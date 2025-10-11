import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from '../../ui';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Avatar } from '../../ui/Avatar';
import { Badge } from '../../ui/Badge';
import { getUserFriends, getTodayWaterIntake } from '../services/api';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar: string;
  created_at: string;
  last_active?: string;
  online?: boolean;
}

interface DashboardScreenProps {
  user?: any;
  userProfile?: UserProfile | null;
}

interface ActivityItem {
  id: string;
  type: 'workout' | 'water' | 'weight' | 'social';
  title: string;
  description: string;
  time: string;
  user?: {
    name: string;
    avatar?: string;
    username: string;
  };
}

export function DashboardScreen({ user, userProfile }: DashboardScreenProps) {
  const [friends, setFriends] = useState([]);
  const [waterIntake, setWaterIntake] = useState(0);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick stats data
  const todayStats = {
    waterGlasses: waterIntake,
    waterGoal: 8,
    workoutsCompleted: 1,
    caloriesBurned: 245,
    stepsWalked: 3247,
    stepsGoal: 10000,
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Load friends
      try {
        const friendsData = await getUserFriends(user.id);
        setFriends(friendsData || []);
      } catch (error) {
        console.log('Failed to load friends:', error);
      }
      
      // Load water intake
      try {
        const water = await getTodayWaterIntake(user.id);
        setWaterIntake(water || 0);
      } catch (error) {
        console.log('Failed to load water intake:', error);
      }
      
      // Mock activity feed data
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'workout',
          title: 'Morning Push Workout',
          description: 'Completed 45 min push day routine',
          time: '2 hours ago',
          user: { name: user?.name || 'User', avatar: user?.avatar, username: user?.username || 'user' },
        },
        {
          id: '2',
          type: 'water',
          title: 'Hydration Milestone',
          description: 'Reached 6/8 glasses of water',
          time: '1 hour ago',
          user: { name: user?.name || 'User', avatar: user?.avatar, username: user?.username || 'user' },
        },
        {
          id: '3',
          type: 'social',
          title: 'New Friend',
          description: 'Connected with Alex Chen',
          time: '3 hours ago',
          user: { name: 'Alex Chen', avatar: undefined, username: 'alexc' },
        },
      ];
      
      setActivities(mockActivities);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { id: 'water', title: 'Log Water', icon: '💧', color: '#3b82f6' },
    { id: 'workout', title: 'Start Workout', icon: '💪', color: '#ef4444' },
    { id: 'weight', title: 'Log Weight', icon: '⚖️', color: '#8b5cf6' },
    { id: 'recipe', title: 'Find Recipe', icon: '🍽️', color: '#f59e0b' },
  ];

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'water':
        Alert.alert('Water Tracker', 'Navigate to water tracker');
        break;
      case 'workout':
        Alert.alert('Fitness', 'Navigate to fitness tracker');
        break;
      case 'weight':
        Alert.alert('Health', 'Navigate to health metrics');
        break;
      case 'recipe':
        Alert.alert('Recipes', 'Navigate to recipe search');
        break;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Welcome Header */}
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'User'}!</Text>
          </View>
          <Avatar
            source={user?.avatar ? { uri: user.avatar } : undefined}
            fallback={user?.name?.[0] || 'U'}
            size={50}
          />
        </View>

        {/* Today's Stats */}
        <Card style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{todayStats.waterGlasses}/{todayStats.waterGoal}</Text>
              <Text style={styles.statLabel}>Water 💧</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{todayStats.workoutsCompleted}</Text>
              <Text style={styles.statLabel}>Workouts 💪</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{todayStats.caloriesBurned}</Text>
              <Text style={styles.statLabel}>Calories 🔥</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{todayStats.stepsWalked}</Text>
              <Text style={styles.statLabel}>Steps 👟</Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.quickActionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionButton, { borderColor: action.color }]}
                onPress={() => handleQuickAction(action.id)}
              >
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Friends Section */}
        <Card style={styles.friendsCard}>
          <View style={styles.friendsHeader}>
            <Text style={styles.sectionTitle}>Friends ({friends.length})</Text>
            <Button
              title="View All"
              onPress={() => Alert.alert('Friends', 'Navigate to friends screen')}
              variant="outline"
              size="sm"
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.friendsList}>
            {friends.slice(0, 5).map((friend: any) => (
              <View key={friend.id} style={styles.friendItem}>
                <Avatar
                  source={friend.avatar ? { uri: friend.avatar } : undefined}
                  fallback={friend.name?.[0] || 'F'}
                  size={40}
                />
                <Text style={styles.friendName} numberOfLines={1}>{friend.name}</Text>
                <Badge variant={friend.online ? 'default' : 'secondary'}>
                  {friend.online ? 'Online' : 'Offline'}
                </Badge>
              </View>
            ))}
            {friends.length === 0 && (
              <Text style={styles.emptyText}>No friends yet. Start connecting!</Text>
            )}
          </ScrollView>
        </Card>

        {/* Activity Feed */}
        <Card style={styles.activityCard}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {activities.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <Avatar
                source={activity.user?.avatar ? { uri: activity.user.avatar } : undefined}
                fallback={activity.user?.name?.[0] || 'U'}
                size={35}
              />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
              <Badge variant={activity.type === 'workout' ? 'default' : 'secondary'}>
                {activity.type}
              </Badge>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748b',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 15,
  },
  statsCard: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  quickActionsCard: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '47%',
    padding: 15,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  friendsCard: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  friendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  friendsList: {
    flexDirection: 'row',
  },
  friendItem: {
    alignItems: 'center',
    marginRight: 15,
    width: 60,
  },
  friendName: {
    fontSize: 12,
    marginTop: 5,
    marginBottom: 2,
    textAlign: 'center',
    color: '#1e293b',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  activityCard: {
    marginHorizontal: 24,
    marginBottom: 30,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  activityDescription: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
});