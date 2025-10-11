import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUser } from '../services/api';

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

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch user profile from backend
  const fetchUserProfile = async (userId: string) => {
    try {
      setProfileLoading(true);
      console.log('Fetching user profile from backend:', userId);
      const profile = await getUser(userId);
      console.log('User profile fetched:', profile);
      setUserProfile({
        id: userId,
        ...profile
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Set a minimal profile if backend fails
      setUserProfile({
        id: userId,
        email: user?.email || '',
        name: user?.displayName || '',
        username: '',
        avatar: user?.photoURL || '',
        created_at: new Date().toISOString(),
      });
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      setIsAuthenticated(!!user);
      
      if (user) {
        // User is authenticated, fetch their profile
        await fetchUserProfile(user.uid);
      } else {
        // User is not authenticated, clear profile
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { 
    user, 
    userProfile, 
    isAuthenticated, 
    loading, 
    profileLoading,
    refreshProfile: user ? () => fetchUserProfile(user.uid) : () => {}
  };
}