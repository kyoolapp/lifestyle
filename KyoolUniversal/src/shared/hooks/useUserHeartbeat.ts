import { useEffect } from 'react';
import { Platform } from 'react-native';
import { auth } from '../services/firebase';
import { updateUserActivity } from '../services/api';

// Hook to maintain user online status across the app
export function useUserHeartbeat() {
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let lastActivity = Date.now();

    const handleActivity = () => {
      const now = Date.now();
      // Only update if it's been more than 30 seconds since last update
      if (now - lastActivity > 30 * 1000) {
        lastActivity = now;
        const user = auth.currentUser;
        if (user) {
          updateUserActivity(user.uid);
        }
      }
    };

    // Wait for auth state to be ready
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        // Clear existing interval if user logs out
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
        return;
      }

      // Update activity immediately
      updateUserActivity(currentUser.uid);

      // Set up periodic heartbeat every 3 minutes
      if (interval) clearInterval(interval); // Clear any existing interval
      interval = setInterval(() => {
        const user = auth.currentUser;
        if (user) {
          updateUserActivity(user.uid);
        }
      }, 3 * 60 * 1000); // 3 minutes
    });

    // Set up activity event listeners (web only)
    if (Platform.OS === 'web') {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        if (typeof document !== 'undefined') {
          document.addEventListener(event, handleActivity, { passive: true });
        }
      });

      return () => {
        unsubscribe();
        if (interval) clearInterval(interval);
        events.forEach(event => {
          if (typeof document !== 'undefined') {
            document.removeEventListener(event, handleActivity);
          }
        });
      };
    }

    // For mobile, we'll rely only on the periodic heartbeat
    return () => {
      unsubscribe();
      if (interval) clearInterval(interval);
    };
  }, []);
}