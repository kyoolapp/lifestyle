import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { GoogleSignIn } from '../services/googleAuth';
import { Button, Input, SafeAreaView } from '../../ui';
import { calculateBMI, calculateBMR, calculateTDEE, FitnessGoal, ActivityLevel, Gender } from '../utils/health';
import { createOrUpdateUser, isUsernameAvailable } from '../services/api';

interface SignUpScreenProps {
  navigation?: any;
  route?: {
    params?: {
      googleUser?: {
        uid: string;
        displayName: string | null;
        email: string | null;
        photoURL: string | null;
      };
    };
  };
}

export function SignUpScreen({ navigation, route }: SignUpScreenProps) {
  // User state from Google Auth
  const [googleUser, setGoogleUser] = useState<null | {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  }>(null);

  // Form fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [goal, setGoal] = useState<FitnessGoal | ''>('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState<ActivityLevel | ''>('');
  const [accepted, setAccepted] = useState(false);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  // Refs for cleanup
  const signupCompleted = useRef(false);
  const signupStarted = useRef(false);

  // Username format validation
  function validateUsernameFormat(username: string) {
    return /^[a-zA-Z0-9_.]{6,20}$/.test(username);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (signupStarted.current && !signupCompleted.current) {
        console.log('Signing out incomplete signup user');
        auth.signOut();
      }
    };
  }, []);

  // Check for Google user data passed from LoginScreen
  useEffect(() => {
    if (route?.params?.googleUser) {
      setGoogleUser(route.params.googleUser);
      setName(route.params.googleUser.displayName || '');
      signupStarted.current = true;
    }
  }, [route?.params?.googleUser]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const gu = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        };
        setGoogleUser(gu);
        setName(user.displayName || '');
      }
    });
    return unsubscribe;
  }, []);

  // Username availability check
  useEffect(() => {
    if (!username) {
      setUsernameAvailable(true);
      setUsernameError('');
      return;
    }
    if (!validateUsernameFormat(username)) {
      setUsernameAvailable(false);
      setUsernameError('Username must be 6-20 characters, only letters, numbers, _ and . allowed.');
      return;
    }
    
    setUsernameChecking(true);
    isUsernameAvailable(username, googleUser?.uid || 'temp')
      .then((available) => {
        setUsernameAvailable(available);
        setUsernameError(available ? '' : 'Username is already taken');
      })
      .catch(() => {
        setUsernameAvailable(false);
        setUsernameError('Error checking username');
      })
      .finally(() => setUsernameChecking(false));
  }, [username, googleUser?.uid]);

  // Navigate to dashboard when created
  useEffect(() => {
    if (created) {
      console.log('Navigating to dashboard');
      signupCompleted.current = true;
      // Navigation will be handled by auth state change in RootNavigator
    }
  }, [created]);

  const handleGoogleSignIn = async () => {
    try {
      const result = await GoogleSignIn.signIn();
      if (result) {
        signupStarted.current = true;
        const user = result.user;
        const gu = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        };
        setGoogleUser(gu);
        setName(user.displayName || '');
      }
    } catch (error: any) {
      console.error('Google Sign In Error:', error);
      Alert.alert('Google Sign In Failed', error.message || 'An error occurred during Google Sign In');
    }
  };

  const canSubmit = () => {
    return !!googleUser && name.trim().length > 0 && username.trim().length > 0 && accepted && !!goal && usernameAvailable;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      if (!usernameAvailable) {
        setUsernameError('Username is already taken');
      }
      return;
    }

    signupStarted.current = true;
    setSubmitting(true);

    try {
      const ageNum = age.trim() === '' ? null : Math.max(0, Math.min(120, Number(age)));
      const heightNum = height.trim() === '' ? null : Math.max(50, Math.min(250, Number(height)));
      const weightNum = weight.trim() === '' ? null : Math.max(20, Math.min(400, Number(weight)));

      const bmr = calculateBMR(weightNum || 0, heightNum || 0, ageNum || 0, gender as string);
      
      // Generate avatar URL - use Google photo if available, otherwise generate one
      const avatarUrl = googleUser?.photoURL || 
        `https://ui-avatars.com/api/?background=E2E8F0&color=334155&name=${encodeURIComponent(name)}&size=128`;

      const userData = {
        username,
        bmi: calculateBMI(weightNum || 0, heightNum || 0),
        bmr,
        tdee: calculateTDEE(bmr || 0, activity as string),
        activity_level: activity || null,
        name,
        email: googleUser?.email,
        avatar: avatarUrl,
        gender: gender || null,
        height: Number.isFinite(heightNum) ? heightNum : null,
        weight: Number.isFinite(weightNum) ? weightNum : null,
        age: Number.isFinite(ageNum) ? ageNum : null,
        date_joined: new Date().toISOString(),
      };

      console.log('Creating user profile in backend...');
      await createOrUpdateUser(googleUser?.uid!, userData);
      console.log('User profile created successfully in backend');

      setCreated(true);
    } catch (error: any) {
      console.error('Failed to create user profile:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const genderOptions = [
    { label: 'Female', value: 'female' },
    { label: 'Male', value: 'male' },
    { label: 'Non-binary', value: 'nonbinary' },
    { label: 'Prefer not to say', value: 'prefer_not_to_say' },
  ];

  const goalOptions = [
    { label: 'Lose weight', value: 'lose_weight' },
    { label: 'Build muscle', value: 'build_muscle' },
    { label: 'Improve fitness', value: 'get_fitter' },
    { label: 'Eat better', value: 'eat_better' },
    { label: 'Stay healthy', value: 'stay_healthy' },
  ];

  const activityOptions = [
    { label: 'Sedentary (little/no exercise)', value: 'sedentary' },
    { label: 'Light (1–3 days/week)', value: 'light' },
    { label: 'Moderate (3–5 days/week)', value: 'moderate' },
    { label: 'Very Active (6–7 days/week)', value: 'very_active' },
    { label: 'Athlete (intense/2x days)', value: 'athlete' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Create your Kyool account</Text>
          <Text style={styles.subtitle}>Sign in with Google, confirm a few details, and you're in.</Text>
          
          {/* Google Sign In or User Info */}
          {!googleUser ? (
            <Button
              title="Continue with Google"
              onPress={handleGoogleSignIn}
              style={styles.googleButton}
            />
          ) : (
            <View style={styles.userInfo}>
              <Image
                source={{ 
                  uri: googleUser.photoURL || `https://ui-avatars.com/api/?background=E2E8F0&color=334155&name=${encodeURIComponent(googleUser.displayName || 'User')}`
                }}
                style={styles.avatar}
              />
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{googleUser.displayName || 'New User'}</Text>
                <Text style={styles.userEmail}>{googleUser.email}</Text>
              </View>
              <Text style={styles.connectedText}>✓ Google connected</Text>
            </View>
          )}

          {googleUser && (
            <View style={styles.form}>
              <Input
                label="Name"
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                containerStyle={styles.inputContainer}
              />

              <Input
                label="Username"
                value={username}
                onChangeText={setUsername}
                placeholder="Choose a unique username"
                autoCapitalize="none"
                containerStyle={styles.inputContainer}
              />
              {usernameChecking && <Text style={styles.checkingText}>Checking...</Text>}
              {!usernameAvailable && <Text style={styles.errorText}>{usernameError}</Text>}

              {/* Gender Selection */}
              <Text style={styles.sectionLabel}>Gender (optional)</Text>
              <View style={styles.optionContainer}>
                {genderOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.optionButton, gender === option.value && styles.selectedOption]}
                    onPress={() => setGender(option.value as Gender)}
                  >
                    <Text style={[styles.optionText, gender === option.value && styles.selectedOptionText]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Fitness Goal */}
              <Text style={styles.sectionLabel}>Fitness goal *</Text>
              <View style={styles.optionContainer}>
                {goalOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.optionButton, goal === option.value && styles.selectedOption]}
                    onPress={() => setGoal(option.value as FitnessGoal)}
                  >
                    <Text style={[styles.optionText, goal === option.value && styles.selectedOptionText]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Age, Height, Weight */}
              <View style={styles.row}>
                <Input
                  label="Age (years)"
                  value={age}
                  onChangeText={setAge}
                  placeholder="e.g., 48"
                  keyboardType="numeric"
                  containerStyle={StyleSheet.flatten([styles.inputContainer, styles.thirdWidth])}
                />
                <Input
                  label="Height (cm)"
                  value={height}
                  onChangeText={setHeight}
                  placeholder="e.g., 175"
                  keyboardType="numeric"
                  containerStyle={StyleSheet.flatten([styles.inputContainer, styles.thirdWidth])}
                />
                <Input
                  label="Weight (kg)"
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="e.g., 85"
                  keyboardType="numeric"
                  containerStyle={StyleSheet.flatten([styles.inputContainer, styles.thirdWidth])}
                />
              </View>

              {/* Activity Level */}
              <Text style={styles.sectionLabel}>Activity level (optional)</Text>
              <View style={styles.optionContainer}>
                {activityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.optionButton, activity === option.value && styles.selectedOption]}
                    onPress={() => setActivity(option.value as ActivityLevel)}
                  >
                    <Text style={[styles.optionText, activity === option.value && styles.selectedOptionText]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Terms */}
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => setAccepted(!accepted)}
              >
                <View style={[styles.checkbox, accepted && styles.checkedCheckbox]}>
                  {accepted && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termsText}>
                  I agree to the Terms of Service and Privacy Policy.
                </Text>
              </TouchableOpacity>

              <Button
                title="Start My Journey"
                onPress={handleSubmit}
                loading={submitting}
                disabled={!canSubmit()}
                style={styles.submitButton}
              />

              {created && (
                <View style={styles.successContainer}>
                  <Text style={styles.successText}>✓ Account created! Redirecting to your dashboard…</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Sign in</Text>
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
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 40,
  },
  content: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  googleButton: {
    width: '100%',
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  connectedText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  checkingText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
    marginTop: 8,
  },
  optionContainer: {
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  selectedOption: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  optionText: {
    fontSize: 14,
    color: '#64748b',
  },
  selectedOptionText: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  thirdWidth: {
    width: '30%',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedCheckbox: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  submitButton: {
    width: '100%',
    marginTop: 8,
  },
  successContainer: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  successText: {
    color: '#166534',
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
  },
  linkText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
});