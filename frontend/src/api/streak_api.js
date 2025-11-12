/**
 * Streak API wrapper for managing activity streaks (water, workout, food, etc.)
 * Provides reusable functions for getting and updating streaks across any activity type.
 */

const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Get current streak for a user for a specific activity type
 * @param {string} userId - The user's Firebase ID
 * @param {string} streakType - Type of streak (default: 'water')
 * @returns {Promise<Object>} Streak data with current_streak, last_logged_date, start_date
 */
export async function getStreak(userId, streakType = 'water') {
  const res = await fetch(`${BASE_URL}/users/${userId}/streak/${streakType}`);
  if (!res.ok) {
    throw new Error(`Failed to get streak: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Update streak for a user when an activity is logged
 * Automatically handles timezone-aware daily resets
 * @param {string} userId - The user's Firebase ID
 * @param {string} streakType - Type of streak (default: 'water')
 * @returns {Promise<Object>} Updated streak data
 */
export async function updateStreak(userId, streakType = 'water') {
  const res = await fetch(`${BASE_URL}/users/${userId}/streak/${streakType}/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    throw new Error(`Failed to update streak: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Get all streaks for a user across all activity types
 * @param {string} userId - The user's Firebase ID
 * @returns {Promise<Object>} Dictionary mapping streak_type to streak data
 */
export async function getAllStreaks(userId) {
  const res = await fetch(`${BASE_URL}/users/${userId}/streaks`);
  if (!res.ok) {
    throw new Error(`Failed to get all streaks: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Manually reset a streak (rarely needed)
 * @param {string} userId - The user's Firebase ID
 * @param {string} streakType - Type of streak to reset (default: 'water')
 * @returns {Promise<Object>} Reset streak data
 */
export async function resetStreak(userId, streakType = 'water') {
  const res = await fetch(`${BASE_URL}/users/${userId}/streak/${streakType}/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    throw new Error(`Failed to reset streak: ${res.statusText}`);
  }
  return res.json();
}
