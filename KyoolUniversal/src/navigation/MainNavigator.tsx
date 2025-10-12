import React from 'react';
import { Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../shared/screens/DashboardScreen';
import { ProfileScreen } from '../shared/screens/ProfileScreen';
import { WaterTrackerScreen } from '../shared/screens/WaterTrackerScreen';
import { FriendsScreen } from '../shared/screens/FriendsScreen';
import { FitnessTrackerScreen } from '../shared/screens/FitnessTrackerScreen';
import { RecipeSearchScreen } from '../shared/screens/RecipeSearchScreen';
import { HealthMetricsScreen } from '../shared/screens/HealthMetricsScreen';
import { DeviceConnectionsScreen } from '../shared/screens/DeviceConnectionsScreen';
import { FeaturesShowcaseScreen } from '../shared/screens/FeaturesShowcaseScreen';
import { DebugScreen } from '../shared/screens/DebugScreen';
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
          tabBarLabel: 'Dashboard',
        }}
      >
        {() => <DashboardScreen user={user} userProfile={userProfile} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Features" 
        options={{
          tabBarLabel: 'Features',
        }}
      >
        {(props) => (
          <FeaturesShowcaseScreen 
            {...props} 
            user={user} 
            onFeatureSelect={(tab) => {
              // Navigate to specific feature tab
              if (props.navigation) {
                props.navigation.navigate(tab as any);
              }
            }} 
          />
        )}
      </Tab.Screen>
      <Tab.Screen 
        name="Health" 
        options={{
          tabBarLabel: 'Health',
        }}
      >
        {() => <HealthMetricsScreen user={user} userProfile={userProfile} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Water" 
        options={{
          tabBarLabel: 'Water',
        }}
      >
        {() => <WaterTrackerScreen user={user} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Fitness" 
        options={{
          tabBarLabel: 'Fitness',
        }}
      >
        {() => <FitnessTrackerScreen user={user} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Recipes" 
        options={{
          tabBarLabel: 'Recipes',
        }}
      >
        {() => <RecipeSearchScreen user={user} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Devices" 
        options={{
          tabBarLabel: 'Devices',
        }}
      >
        {() => <DeviceConnectionsScreen user={user} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Friends" 
        options={{
          tabBarLabel: 'Friends',
        }}
      >
        {() => <FriendsScreen user={user} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Profile" 
        options={{
          tabBarLabel: 'Profile',
        }}
      >
        {() => <ProfileScreen user={user} userProfile={userProfile} setUser={(updatedUser) => {
          console.log('User updated:', updatedUser);
        }} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main tab navigation - matches all frontend routes in one place */}
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      
      {/* Modal/Overlay screens for social features */}
      <Stack.Screen 
        name="UserSearch" 
        component={UserSearch}
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Search Users',
        }}
      />
      <Stack.Screen 
        name="ViewAllFriends" 
        component={ViewAllFriends}
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'All Friends',
        }}
      />
      <Stack.Screen 
        name="FriendRequests" 
        component={FriendRequests}
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Friend Requests',
        }}
      />
      <Stack.Screen 
        name="UserProfile" 
        component={UserProfile}
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'User Profile',
        }}
      />
    </Stack.Navigator>
  );
}