import { auth } from '../firebase';

const API_URL = 'http://localhost:8000';

/**
 * Get auth header with Firebase ID token
 */
const getAuthHeader = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  const token = await user.getIdToken();
  return { 'Authorization': `Bearer ${token}` };
};

/**
 * Save a routine template
 * @param {string} userId - User ID
 * @param {object} routineData - {name, exercises, notes}
 * @returns {Promise<object>} Created routine with ID
 */
export const saveRoutine = async (userId, routineData) => {
  try {
    const authHeader = await getAuthHeader();
    const response = await fetch(
      `${API_URL}/users/${userId}/routines`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify(routineData)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to save routine');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error saving routine:', error);
    throw error;
  }
};

/**
 * Get all routine templates for a user
 * @param {string} userId - User ID
 * @returns {Promise<array>} List of routine templates
 */
export const getRoutines = async (userId) => {
  try {
    const authHeader = await getAuthHeader();
    const response = await fetch(
      `${API_URL}/users/${userId}/routines`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch routines');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching routines:', error);
    throw error;
  }
};

/**
 * Get a specific routine by ID
 * @param {string} userId - User ID
 * @param {string} routineId - Routine ID
 * @returns {Promise<object>} Routine data
 */
export const getRoutine = async (userId, routineId) => {
  try {
    const authHeader = await getAuthHeader();
    const response = await fetch(
      `${API_URL}/users/${userId}/routines/${routineId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Routine not found');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching routine:', error);
    throw error;
  }
};

/**
 * Update an existing routine
 * @param {string} userId - User ID
 * @param {string} routineId - Routine ID
 * @param {object} routineData - Fields to update
 * @returns {Promise<object>} Updated routine
 */
export const updateRoutine = async (userId, routineId, routineData) => {
  try {
    const authHeader = await getAuthHeader();
    const response = await fetch(
      `${API_URL}/users/${userId}/routines/${routineId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify(routineData)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update routine');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error updating routine:', error);
    throw error;
  }
};

/**
 * Delete a routine template
 * @param {string} userId - User ID
 * @param {string} routineId - Routine ID
 * @returns {Promise<object>} Deletion confirmation
 */
export const deleteRoutine = async (userId, routineId) => {
  try {
    const authHeader = await getAuthHeader();
    const response = await fetch(
      `${API_URL}/users/${userId}/routines/${routineId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete routine');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting routine:', error);
    throw error;
  }
};
