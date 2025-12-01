import { auth } from '../firebase';

const API_URL = import.meta.env.VITE_API_URL;;

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

/**
 * Save the user's weekly workout schedule
 * @param {string} userId - User ID
 * @param {object} schedule - Day names mapped to routine IDs
 *                           Example: {monday: "routine-id-1", tuesday: "routine-id-2", ...}
 * @returns {Promise<object>} Saved schedule data
 */
export const saveSchedule = async (userId, schedule) => {
  try {
    const authHeader = await getAuthHeader();
    console.log('Sending schedule to backend:', { userId, schedule, url: `${API_URL}/users/${userId}/schedule` });
    
    const response = await fetch(
      `${API_URL}/users/${userId}/schedule`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify(schedule)
      }
    );

    console.log('Schedule save response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Schedule save error response:', error);
      throw new Error(error.detail || 'Failed to save schedule');
    }

    const result = await response.json();
    console.log('Schedule saved successfully:', result);
    return result.data;
  } catch (error) {
    console.error('Error saving schedule:', error);
    throw error;
  }
};

/**
 * Get the user's weekly workout schedule
 * @param {string} userId - User ID
 * @returns {Promise<object>} Schedule data with day names mapped to routine IDs
 */
export const getSchedule = async (userId) => {
  try {
    const authHeader = await getAuthHeader();
    const response = await fetch(
      `${API_URL}/users/${userId}/schedule`,
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
      throw new Error(error.detail || 'Failed to fetch schedule');
    }

    const result = await response.json();
    return result.data || {};
  } catch (error) {
    console.error('Error fetching schedule:', error);
    throw error;
  }
};
