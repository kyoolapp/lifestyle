// src/api/health_api.js

const BASE_URL = (import.meta.env as any).VITE_API_BASE_URL || 'http://localhost:8000';

const getAuthHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
});

/**
 * Log body fat measurement for a user
 */
export async function logBodyFat(userId, measurements) {
  const response = await fetch(`${BASE_URL}/users/${userId}/body-fat/log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({
      height: measurements.height,
      neck: measurements.neck,
      waist: measurements.waist,
      hip: measurements.hip,
      body_fat_percentage: measurements.bodyFat,
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to log body fat');
  }

  return await response.json();
}

/**
 * Get latest body fat measurement for a user
 */
export async function getLatestBodyFat(userId) {
  const response = await fetch(`${BASE_URL}/users/${userId}/body-fat/latest`, {
    method: 'GET',
    headers: getAuthHeader()
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch body fat data');
  }

  return await response.json();
}

/**
 * Get all body fat measurements for a user
 */
export async function getBodyFatHistory(userId) {
  const response = await fetch(`${BASE_URL}/users/${userId}/body-fat/history`, {
    method: 'GET',
    headers: getAuthHeader()
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch body fat history');
  }

  return await response.json();
}
