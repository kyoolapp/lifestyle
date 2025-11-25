// src/api/workouts_api.js
/**
 * Workouts API wrapper for managing workout logging, history, and retrieval
 */

import { auth } from '../firebase';

const BASE_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    const token = await user.getIdToken();
    return {
      'Authorization': `Bearer ${token}`
    };
  } catch (error) {
    console.error('Failed to get auth token:', error);
    throw error;
  }
};

/**
 * Log a completed workout
 */
export async function logWorkout(userId, workoutData) {
  try {
    const authHeaders = await getAuthHeader();
    const response = await fetch(`${BASE_URL}/users/${userId}/workouts/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({
        routine_name: workoutData.routineName,
        exercises_completed: workoutData.exercisesCompleted,
        duration_minutes: workoutData.durationMinutes,
        shared_with: workoutData.sharedWith || []
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to log workout');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in logWorkout:', error);
    throw error;
  }
}

/**
 * Get user's workout history
 */
export async function getWorkoutHistory(userId, limit = 50) {
  try {
    const authHeaders = await getAuthHeader();
    const response = await fetch(
      `${BASE_URL}/users/${userId}/workouts/history?limit=${limit}`,
      {
        method: 'GET',
        headers: authHeaders
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch workout history');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getWorkoutHistory:', error);
    throw error;
  }
}

/**
 * Get user's latest workout
 */
export async function getLatestWorkout(userId) {
  try {
    const authHeaders = await getAuthHeader();
    const response = await fetch(`${BASE_URL}/users/${userId}/workouts/latest`, {
      method: 'GET',
      headers: authHeaders
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch latest workout');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getLatestWorkout:', error);
    throw error;
  }
}
