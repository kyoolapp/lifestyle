import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from '../shared/screens/LoginScreen';
import { SignUpScreen } from '../shared/screens/SignUpScreen';
import { LandingScreen } from '../shared/screens/LandingScreen';

const Stack = createStackNavigator();

export function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}