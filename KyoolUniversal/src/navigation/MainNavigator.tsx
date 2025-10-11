import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../shared/screens/DashboardScreen';
import { ProfileScreen } from '../shared/screens/ProfileScreen';
import { WaterTrackerScreen } from '../shared/screens/WaterTrackerScreen';
import { FriendsScreen } from '../shared/screens/FriendsScreen';
import { FitnessTrackerScreen } from '../shared/screens/FitnessTrackerScreen';
import { RecipeSearchScreen } from '../shared/screens/RecipeSearchScreen';
import { UserSearch, ViewAllFriends, FriendRequests, UserProfile } from '../shared/components';
import { useAuthState } from '../shared/hooks/useAuth';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { user, userProfile } = useAuthState();
  
  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        options={{
          tabBarLabel: 'Home',
        }}
      >
        {() => <DashboardScreen user={user} userProfile={userProfile} />}
      </Tab.Screen>
      <Tab.Screen 
        name="WaterTracker" 
        options={{
          tabBarLabel: 'Water',
        }}
      >
        {() => <WaterTrackerScreen user={user} userProfile={userProfile} />}
      </Tab.Screen>
      <Tab.Screen 
        name="FitnessTracker" 
        options={{
          tabBarLabel: 'Fitness',
        }}
      >
        {() => <FitnessTrackerScreen user={user} userProfile={userProfile} />}
      </Tab.Screen>
      <Tab.Screen 
        name="RecipeSearch" 
        options={{
          tabBarLabel: 'Recipes',
        }}
      >
        {() => <RecipeSearchScreen user={user} userProfile={userProfile} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Friends" 
        options={{
          tabBarLabel: 'Friends',
        }}
      >
        {() => <FriendsScreen user={user} userProfile={userProfile} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Profile" 
        options={{
          tabBarLabel: 'Profile',
        }}
      >
        {() => <ProfileScreen user={user} userProfile={userProfile} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main tab navigation */}
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      
      {/* Modal/Stack screens - these match the frontend routes */}
      <Stack.Screen name="UserSearch" component={UserSearch} />
      <Stack.Screen name="ViewAllFriends" component={ViewAllFriends} />
      <Stack.Screen name="FriendRequests" component={FriendRequests} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
    </Stack.Navigator>
  );
}