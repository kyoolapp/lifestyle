import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Avatar } from '../../ui/Avatar';
import { calculateBMI, calculateBMR, calculateTDEE } from '../utils/health';
import { createOrUpdateUser, getUserFriends } from '../services/api';

interface ProfileScreenProps {
  user?: any;
  setUser?: (user: any) => void;
}

export function ProfileScreen({ user, setUser }: ProfileScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const currentUser = user || auth.currentUser;
  
  const [editForm, setEditForm] = useState({
    name: currentUser?.displayName || currentUser?.name || '',
    username: currentUser?.username || '',
    height: currentUser?.height?.toString() || '',
    weight: currentUser?.weight?.toString() || '',
    age: currentUser?.age?.toString() || '',
    activityLevel: currentUser?.activityLevel || 'moderate',
    gender: currentUser?.gender || 'male',
  });

  // Calculate health metrics
  const bmi = calculateBMI(parseFloat(editForm.weight), parseFloat(editForm.height));
  const bmr = calculateBMR(parseFloat(editForm.weight), parseFloat(editForm.height), parseInt(editForm.age), editForm.gender);
  const tdee = bmr ? calculateTDEE(bmr, editForm.activityLevel) : null;

  // Mock user stats
  const userStats = {
    totalWorkouts: 45,
    totalRecipes: 23,
    friendsCount: friends.length,
    currentStreak: 7,
  };

  useEffect(() => {
    loadFriends();
  }, [currentUser]);

  const loadFriends = async () => {
    if (!currentUser?.uid) return;
    
    try {
      const friendsData = await getUserFriends(currentUser.uid);
      setFriends(friendsData || []);
    } catch (error) {
      console.log('Failed to load friends:', error);
    }
  };

  const handleSave = async () => {
    if (!currentUser?.uid) return;

    setLoading(true);
    try {
      const updatedUserData = {
        ...currentUser,
        ...editForm,
        height: parseFloat(editForm.height) || currentUser.height,
        weight: parseFloat(editForm.weight) || currentUser.weight,
        age: parseInt(editForm.age) || currentUser.age,
      };

      await createOrUpdateUser(currentUser.uid, updatedUserData);
      if (setUser) {
        setUser(updatedUserData);
      }
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: currentUser?.displayName || currentUser?.name || '',
      username: currentUser?.username || '',
      height: currentUser?.height?.toString() || '',
      weight: currentUser?.weight?.toString() || '',
      age: currentUser?.age?.toString() || '',
      activityLevel: currentUser?.activityLevel || 'moderate',
      gender: currentUser?.gender || 'male',
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getActivityLevelLabel = (level: string) => {
    switch (level) {
      case 'sedentary': return 'Sedentary';
      case 'light': return 'Light Activity';
      case 'moderate': return 'Moderate Activity';
      case 'active': return 'Very Active';
      case 'very_active': return 'Extra Active';
      default: return 'Moderate Activity';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account and view your health journey</Text>
        </View>
        
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Avatar
                source={currentUser?.photoURL ? { uri: currentUser.photoURL } : undefined}
                fallback={currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                size={80}
              />
              <View style={[styles.onlineIndicator, { backgroundColor: isOnline ? '#10b981' : '#6b7280' }]} />
            </View>
            
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{currentUser?.displayName || currentUser?.name || 'User'}</Text>
                <Text style={[styles.onlineStatus, { color: isOnline ? '#10b981' : '#6b7280' }]}>
                  {isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
              <Text style={styles.username}>@{currentUser?.username || 'username'}</Text>
              <Text style={styles.email}>{currentUser?.email}</Text>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userStats.totalWorkouts}</Text>
                  <Text style={styles.statLabel}>Workouts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userStats.totalRecipes}</Text>
                  <Text style={styles.statLabel}>Recipes</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userStats.friendsCount}</Text>
                  <Text style={styles.statLabel}>Friends</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userStats.currentStreak}</Text>
                  <Text style={styles.statLabel}>Streak</Text>
                </View>
              </View>
            </View>
          </View>
          
          <Button
            title={isEditing ? 'Cancel' : 'Edit Profile'}
            onPress={isEditing ? handleCancel : () => setIsEditing(true)}
            variant="outline"
            style={styles.editButton}
          />
        </Card>

        {/* Health Metrics */}
        <Card style={styles.metricsCard}>
          <Text style={styles.sectionTitle}>Health Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{bmi ? bmi.toFixed(1) : 'N/A'}</Text>
              <Text style={styles.metricLabel}>BMI</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{bmr || 'N/A'}</Text>
              <Text style={styles.metricLabel}>BMR</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{tdee || 'N/A'}</Text>
              <Text style={styles.metricLabel}>TDEE</Text>
            </View>
          </View>
        </Card>

        {/* Profile Details */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Profile Details</Text>
          
          {isEditing ? (
            <View style={styles.editForm}>
              <Input
                label="Name"
                value={editForm.name}
                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                placeholder="Enter your name"
                containerStyle={styles.inputContainer}
              />
              
              <Input
                label="Username"
                value={editForm.username}
                onChangeText={(text) => setEditForm({ ...editForm, username: text })}
                placeholder="Enter username"
                containerStyle={styles.inputContainer}
              />
              
              <Input
                label="Height (cm)"
                value={editForm.height}
                onChangeText={(text) => setEditForm({ ...editForm, height: text })}
                placeholder="Enter height in cm"
                keyboardType="numeric"
                containerStyle={styles.inputContainer}
              />
              
              <Input
                label="Weight (kg)"
                value={editForm.weight}
                onChangeText={(text) => setEditForm({ ...editForm, weight: text })}
                placeholder="Enter weight in kg"
                keyboardType="numeric"
                containerStyle={styles.inputContainer}
              />
              
              <Input
                label="Age"
                value={editForm.age}
                onChangeText={(text) => setEditForm({ ...editForm, age: text })}
                placeholder="Enter your age"
                keyboardType="numeric"
                containerStyle={styles.inputContainer}
              />
              
              <View style={styles.buttonRow}>
                <Button
                  title="Save"
                  onPress={handleSave}
                  loading={loading}
                  style={styles.saveButton}
                />
                <Button
                  title="Cancel"
                  onPress={handleCancel}
                  variant="outline"
                  style={styles.cancelButton}
                />
              </View>
            </View>
          ) : (
            <View style={styles.detailsView}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Height:</Text>
                <Text style={styles.detailValue}>{currentUser?.height ? `${currentUser.height} cm` : 'Not set'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Weight:</Text>
                <Text style={styles.detailValue}>{currentUser?.weight ? `${currentUser.weight} kg` : 'Not set'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Age:</Text>
                <Text style={styles.detailValue}>{currentUser?.age || 'Not set'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Gender:</Text>
                <Text style={styles.detailValue}>{currentUser?.gender || 'Not set'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Activity Level:</Text>
                <Text style={styles.detailValue}>{getActivityLevelLabel(currentUser?.activityLevel || 'moderate')}</Text>
              </View>
            </View>
          )}
        </Card>

        <Button
          title="Sign Out"
          variant="destructive"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
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
    paddingBottom: 30,
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
  profileCard: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginRight: 8,
  },
  onlineStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  username: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  editButton: {
    alignSelf: 'flex-start',
  },
  metricsCard: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  detailsCard: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  editForm: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  detailsView: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  detailValue: {
    fontSize: 14,
    color: '#64748b',
  },
  logoutButton: {
    marginHorizontal: 24,
    marginTop: 8,
  },
});