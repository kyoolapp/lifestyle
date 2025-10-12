import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../services/firebase';
import { GoogleSignIn } from '../services/googleAuth';
import { Button, Input, SafeAreaView } from '../../ui';
import { getUserByEmail } from '../services/api';

interface LoginScreenProps {
  navigation?: any;
}

export function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const googleProvider = new GoogleAuthProvider()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('Firebase login successful:', user.uid);
      
      // Check if user profile exists in backend, create if not
      try {
        const { getUser, createOrUpdateUser } = await import('../services/api');
        
        try {
          await getUser(user.uid);
          console.log('User profile found in backend');
        } catch (notFoundError) {
          // User doesn't exist in backend, create profile
          console.log('Creating missing user profile in backend...');
          const userData = {
            email: user.email,
            name: user.displayName || '',
            username: '',
            avatar: user.photoURL || '',
            created_at: new Date().toISOString(),
          };
          
          await createOrUpdateUser(user.uid, userData);
          console.log('User profile created successfully in backend');
        }
        
      } catch (backendError: any) {
        console.error('Backend user profile error:', backendError);
        // Don't fail login if backend fails
      }
      
      // Navigation will be handled automatically by the auth state change
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {

      //const result= await signInWithPopup(auth, googleProvider);
      const result = await GoogleSignIn.signIn();
      if (result) {
        // Check if user exists in DB (similar to frontend logic)
        const googleUser = result.user;
        const email = googleUser.email;
        
        try {
          const user = await getUserByEmail(email!);
          if (!user || (user as any).detail === "User not found") {
            // Redirect to signup, passing Google user info
            // For React Native, we pass data through navigation params
            navigation.navigate('SignUp', {
              googleUser: {
                uid: googleUser.uid,
                displayName: googleUser.displayName,
                email: googleUser.email,
                photoURL: googleUser.photoURL,
              },
            });
            return;
          }
          console.log('User profile found in backend, login successful');
        } catch (backendError: any) {
          console.error('Backend user lookup error:', backendError);
          // If backend fails, still allow login with Firebase Auth
        }
        
        // Navigation will be handled by auth state change
      }
    } catch (error: any) {
      console.error('Google Sign In Error:', error);
      Alert.alert('Google Sign In Failed', error.message || 'An error occurred during Google Sign In');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <View style={styles.card}>
            {/* Logo / Title */}
            <View style={styles.header}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>✨</Text>
              </View>
              <View>
                <Text style={styles.brandTitle}>Kyool</Text>
                <Text style={styles.brandSubtitle}>Personalized meals & fitness, simplified</Text>
              </View>
            </View>

            {/* Heading */}
            <Text style={styles.title}>Sign in to Kyool</Text>
            <Text style={styles.subtitle}>Continue with Google to sync your preferences across devices.</Text>

            {/* Benefits */}
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.benefitText}>Save recipes & meal plans</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.benefitText}>Track workouts & progress</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.benefitText}>Smart recommendations</Text>
              </View>
            </View>

            {/* Google Button */}
            <Button
              title={loading ? "Signing in…" : "Sign in with Google"}
              onPress={handleGoogleSignIn}
              loading={loading}
              style={styles.googleButton}
            />
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.linkText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Dark gradient background
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(147, 51, 234, 0.8)', // Purple gradient
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 20,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  brandSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 24,
    lineHeight: 20,
  },
  benefitsList: {
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkmark: {
    color: '#10b981', // Emerald color
    fontSize: 16,
    marginRight: 8,
    fontWeight: 'bold',
  },
  benefitText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.8)',
  },
  googleButton: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  linkText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
});