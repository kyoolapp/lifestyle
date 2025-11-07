// Frontend Integration Guide for Timezone Support
// Path: src/utils/timezone.ts (or similar)

/**
 * Get the user's browser timezone using the Intl API
 * 
 * @returns {string} IANA timezone name (e.g., "Asia/Kolkata", "America/New_York")
 */
export const getBrowserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn('Failed to detect timezone, defaulting to UTC:', error);
    return 'UTC';
  }
};

/**
 * Get current date in user's local timezone as YYYY-MM-DD string
 * 
 * @returns {string} Date string in format YYYY-MM-DD
 */
export const getLocalDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format timestamp for display in user's local timezone
 * 
 * @param {string | Date} timestamp - ISO string or Date object
 * @returns {string} Formatted date/time string
 */
export const formatLocalDateTime = (timestamp: string | Date): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: getBrowserTimezone()
  });
  
  return formatter.format(date);
};

/**
 * Check if a timestamp is from today (user's local timezone)
 * 
 * @param {string | Date} timestamp - ISO string or Date object
 * @returns {boolean} True if timestamp is from today
 */
export const isToday = (timestamp: string | Date): boolean => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const todayString = getLocalDateString();
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  
  return dateString === todayString;
};

// ===== Usage Examples =====

/**
 * Example 1: Send timezone during user signup
 */
export const signupWithTimezone = async (userData: any) => {
  const timezone = getBrowserTimezone();
  
  const response = await fetch('/api/users/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...userData,
      timezone  // Send IANA timezone to backend
    })
  });
  
  return response.json();
};

/**
 * Example 2: Log water intake with timezone context
 */
export const logWater = async (userId: string, glasses: number) => {
  const timezone = getBrowserTimezone();
  const localDate = getLocalDateString();
  
  const response = await fetch('/api/water/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      glasses,
      timezone,      // Optional: for backend validation/logging
      local_date: localDate  // Optional: for client-side verification
    })
  });
  
  return response.json();
};

/**
 * Example 3: React Hook for timezone
 */
import { useEffect, useState } from 'react';

export const useTimezone = () => {
  const [timezone, setTimezone] = useState<string>('UTC');
  const [localDate, setLocalDate] = useState<string>('');
  
  useEffect(() => {
    // Set timezone on component mount
    const tz = getBrowserTimezone();
    setTimezone(tz);
    setLocalDate(getLocalDateString());
    
    // Update local date at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    const timer = setTimeout(() => {
      setLocalDate(getLocalDateString());
    }, timeUntilMidnight);
    
    return () => clearTimeout(timer);
  }, []);
  
  return { timezone, localDate };
};

/**
 * Example 4: WaterTracker Component Integration
 */
/*
import { useTimezone } from '@/utils/timezone';

export const WaterTracker = ({ userId }: { userId: string }) => {
  const { timezone, localDate } = useTimezone();
  const [waterIntake, setWaterIntake] = useState(0);
  
  // Fetch today's water intake
  useEffect(() => {
    const fetchWater = async () => {
      // Reset is handled server-side, so just fetch
      const response = await fetch(`/api/water/today?user_id=${userId}`);
      const data = await response.json();
      setWaterIntake(data.glasses);
    };
    
    fetchWater();
  }, [userId, localDate]); // Refetch if localDate changes (midnight crossed)
  
  const handleAddWater = async (glasses: number) => {
    const result = await logWater(userId, glasses);
    setWaterIntake(result.total_today);
  };
  
  return (
    <div>
      <p>Today ({localDate}): {waterIntake} glasses</p>
      <button onClick={() => handleAddWater(1)}>+ 1 glass</button>
      <p>Your timezone: {timezone}</p>
    </div>
  );
};
*/
