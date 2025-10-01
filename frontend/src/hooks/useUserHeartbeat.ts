import { useEffect } from 'react';
import { auth } from '../firebase';
import { updateUserActivity } from '../api/user_api';

// Hook to maintain user online status across the app
export function useUserHeartbeat() {
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
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

    // Set up activity event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      unsubscribe();
      if (interval) clearInterval(interval);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, []);
}