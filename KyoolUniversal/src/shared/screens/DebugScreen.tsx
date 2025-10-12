import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from '../../ui';
import { useAuthState } from '../hooks/useAuth';
import { auth } from '../services/firebase';

export function DebugScreen() {
  const { user, userProfile, isAuthenticated, loading, profileLoading, refreshProfile } = useAuthState();
  const firebaseUser = auth.currentUser;

  const handleRefreshProfile = async () => {
    console.log('=== Manually Refreshing Profile ===');
    await refreshProfile();
  };

  const renderObject = (title: string, obj: any) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.objectContainer}>
        <Text style={styles.objectText}>
          {obj ? JSON.stringify(obj, null, 2) : 'null'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Auth Debug Screen</Text>
        
        <View style={styles.statusSection}>
          <Text style={styles.statusTitle}>Status:</Text>
          <Text style={styles.statusText}>Authenticated: {isAuthenticated ? '✅' : '❌'}</Text>
          <Text style={styles.statusText}>Loading: {loading ? '⏳' : '✅'}</Text>
          <Text style={styles.statusText}>Profile Loading: {profileLoading ? '⏳' : '✅'}</Text>
        </View>

        {renderObject('Firebase User (auth.currentUser)', firebaseUser ? {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        } : null)}

        {renderObject('useAuth Hook - user', user)}

        {renderObject('useAuth Hook - userProfile', userProfile)}

        <TouchableOpacity style={styles.button} onPress={handleRefreshProfile}>
          <Text style={styles.buttonText}>Refresh Profile</Text>
        </TouchableOpacity>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>🐛 Debugging Guide:</Text>
          <Text style={styles.instructionsText}>
            1. Check if Firebase User exists{'\n'}
            2. Check if userProfile was fetched{'\n'}
            3. Compare the data structures{'\n'}
            4. Look for console logs showing API calls{'\n'}
            5. Verify backend responses in Network tab
          </Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  objectContainer: {
    backgroundColor: '#1f2937',
    padding: 12,
    borderRadius: 6,
    maxHeight: 300,
  },
  objectText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#f3f4f6',
    lineHeight: 16,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
});