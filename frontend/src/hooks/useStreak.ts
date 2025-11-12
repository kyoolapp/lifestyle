import { useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase';
import { getStreak, updateStreak, getAllStreaks } from '../api/streak_api';

/**
 * Hook for managing activity streaks (water, workout, food, etc.)
 * Handles fetching streak data and provides methods to update streaks
 * 
 * @param {string} streakType - Type of streak to manage (default: 'water')
 * @param {boolean} autoFetch - Whether to automatically fetch streak on mount (default: true)
 * @returns {Object} Streak data and methods:
 *   - streak: Current streak object {current_streak, last_logged_date, start_date}
 *   - loading: Whether data is being loaded
 *   - error: Any error that occurred
 *   - updateUserStreak: Function to manually update the streak
 *   - refreshStreak: Function to refresh streak data from server
 */
export function useStreak(streakType = 'water', autoFetch = true) {
  const [streak, setStreak] = useState({
    current_streak: 0,
    last_logged_date: null,
    start_date: null,
    streak_type: streakType
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUser = auth.currentUser;

  /**
   * Fetch streak data from server
   */
  const refreshStreak = useCallback(async () => {
    if (!currentUser) {
      setStreak({ current_streak: 0, last_logged_date: null, start_date: null, streak_type: streakType });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getStreak(currentUser.uid, streakType);
      setStreak(data);
    } catch (err) {
      console.error(`Failed to fetch ${streakType} streak:`, err);
      setError(err.message || 'Failed to fetch streak');
    } finally {
      setLoading(false);
    }
  }, [currentUser, streakType]);

  /**
   * Update streak (call this when activity is logged)
   * Returns the updated streak data
   */
  const updateUserStreak = useCallback(async () => {
    if (!currentUser) {
      console.warn('No user authenticated');
      return null;
    }

    try {
      const updatedStreak = await updateStreak(currentUser.uid, streakType);
      setStreak(updatedStreak);
      return updatedStreak;
    } catch (err) {
      console.error(`Failed to update ${streakType} streak:`, err);
      setError(err.message || 'Failed to update streak');
      return null;
    }
  }, [currentUser, streakType]);

  /**
   * Auto-fetch streak on component mount or when user changes
   */
  useEffect(() => {
    if (autoFetch) {
      refreshStreak();
    }
  }, [autoFetch, refreshStreak]);

  return {
    streak,
    loading,
    error,
    updateUserStreak,
    refreshStreak,
    currentStreak: streak.current_streak,
    lastLoggedDate: streak.last_logged_date,
    startDate: streak.start_date
  };
}

/**
 * Hook for managing all streaks for a user
 * Useful for displaying a dashboard of all activity streaks
 * 
 * @param {boolean} autoFetch - Whether to automatically fetch all streaks on mount (default: true)
 * @returns {Object} All streaks data:
 *   - streaks: Dictionary mapping streak_type to streak data
 *   - loading: Whether data is being loaded
 *   - error: Any error that occurred
 *   - getSpecificStreak: Function to get a specific streak's data
 *   - refreshAllStreaks: Function to refresh all streak data
 */
export function useAllStreaks(autoFetch = true) {
  const [streaks, setStreaks] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUser = auth.currentUser;

  /**
   * Fetch all streaks from server
   */
  const refreshAllStreaks = useCallback(async () => {
    if (!currentUser) {
      setStreaks({});
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getAllStreaks(currentUser.uid);
      setStreaks(data.streaks || {});
    } catch (err) {
      console.error('Failed to fetch all streaks:', err);
      setError(err.message || 'Failed to fetch all streaks');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * Get a specific streak's data
   */
  const getSpecificStreak = useCallback((streakType) => {
    return streaks[streakType] || {
      current_streak: 0,
      last_logged_date: null,
      start_date: null,
      streak_type: streakType
    };
  }, [streaks]);

  /**
   * Auto-fetch all streaks on component mount or when user changes
   */
  useEffect(() => {
    if (autoFetch) {
      refreshAllStreaks();
    }
  }, [autoFetch, refreshAllStreaks]);

  return {
    streaks,
    loading,
    error,
    getSpecificStreak,
    refreshAllStreaks
  };
}

/**
 * Format streak data for display
 * @param {Object} streak - Streak data from useStreak hook
 * @returns {string} Human-readable streak display (e.g., "5 day streak")
 */
export function formatStreakDisplay(streak) {
  const count = streak.current_streak || 0;
  if (count === 0) return 'No streak';
  if (count === 1) return '1 day streak';
  return `${count} day streak`;
}

/**
 * Check if user logged today (for determining if they can log again)
 * @param {Object} streak - Streak data from useStreak hook
 * @param {string} userTimezone - User's timezone (IANA format, e.g., 'Asia/Kolkata')
 * @returns {boolean} True if user has already logged today
 */
export function hasLoggedToday(streak, userTimezone = 'UTC') {
  if (!streak.last_logged_date) return false;

  // Get today's date in user's timezone
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: userTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());

  return streak.last_logged_date === today;
}

/**
 * Get days until streak will be reset if user doesn't log
 * Returns how many hours left until midnight in user's timezone
 * @param {Object} streak - Streak data
 * @param {string} userTimezone - User's timezone
 * @returns {number} Hours remaining
 */
export function getHoursUntilStreakReset(streak, userTimezone = 'UTC') {
  if (!streak.last_logged_date) return 24;

  // Get current time in user's timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: userTimezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const timeStr = formatter.format(new Date());
  const [hour, minute, second] = timeStr.split(':').map(Number);
  const currentMinutesInDay = hour * 60 + minute;
  const minutesUntilMidnight = 24 * 60 - currentMinutesInDay;

  return Math.ceil(minutesUntilMidnight / 60);
}
