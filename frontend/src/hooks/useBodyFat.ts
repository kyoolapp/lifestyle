import { useState, useEffect, useCallback } from 'react';

interface BodyFatLog {
  id: string;
  date: Date;
  height: number;
  neck: number;
  waist: number;
  hip?: number;
  bodyFat: number;
  timestamp: string;
}

interface UseBodyFatReturn {
  latestLog: BodyFatLog | null;
  bodyFat: number | null;
  logs: BodyFatLog[];
  loading: boolean;
  error: string | null;
  logBodyFat: (measurements: {
    height: number;
    neck: number;
    waist: number;
    hip?: number;
    bodyFat: number;
  }) => Promise<void>;
  refreshLogs: () => Promise<void>;
}

export function useBodyFat(userId?: string, autoFetch = true): UseBodyFatReturn {
  const [latestLog, setLatestLog] = useState<BodyFatLog | null>(null);
  const [logs, setLogs] = useState<BodyFatLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestBodyFat = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = (import.meta.env as any).VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/users/${userId}/body-fat/latest`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setLatestLog(null);
          setLogs([]);
          return;
        }
        throw new Error('Failed to fetch body fat data');
      }

      const data = await response.json();
      
      const formattedLog: BodyFatLog = {
        id: data.id || data.timestamp,
        date: new Date(data.timestamp),
        height: data.height,
        neck: data.neck,
        waist: data.waist,
        hip: data.hip,
        bodyFat: data.body_fat,
        timestamp: data.timestamp,
      };

      setLatestLog(formattedLog);
      // If API returns logs array, parse it
      if (data.logs && Array.isArray(data.logs)) {
        setLogs(data.logs.map((log: any) => ({
          id: log.id || log.timestamp,
          date: new Date(log.timestamp),
          height: log.height,
          neck: log.neck,
          waist: log.waist,
          hip: log.hip,
          bodyFat: log.body_fat,
          timestamp: log.timestamp,
        })));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch body fat data');
      setLatestLog(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const logBodyFat = useCallback(async (measurements: {
    height: number;
    neck: number;
    waist: number;
    hip?: number;
    bodyFat: number;
  }) => {
    if (!userId) throw new Error('User ID not available');

    try {
      setLoading(true);
      setError(null);

      const apiUrl = (import.meta.env as any).VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/users/${userId}/body-fat/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to log body fat');
      }

      const data = await response.json();
      
      const newLog: BodyFatLog = {
        id: data.id || data.timestamp,
        date: new Date(data.timestamp),
        height: data.height,
        neck: data.neck,
        waist: data.waist,
        hip: data.hip,
        bodyFat: data.body_fat,
        timestamp: data.timestamp,
      };

      setLatestLog(newLog);
      setLogs([newLog, ...logs]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to log body fat';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, logs]);

  const refreshLogs = useCallback(async () => {
    await fetchLatestBodyFat();
  }, [fetchLatestBodyFat]);

  // Auto-fetch on mount if userId is available
  useEffect(() => {
    if (autoFetch && userId) {
      fetchLatestBodyFat();
    }
  }, [userId, autoFetch, fetchLatestBodyFat]);

  return {
    latestLog,
    bodyFat: latestLog?.bodyFat || null,
    logs,
    loading,
    error,
    logBodyFat,
    refreshLogs,
  };
}

/**
 * Format body fat display with category
 */
export function formatBodyFatDisplay(bodyFat: number | null, gender: string = 'male'): string {
  if (bodyFat === null) return 'Not Available';
  return `${bodyFat}%`;
}

/**
 * Get color for body fat category
 */
export function getBodyFatColor(bodyFat: number, gender: string = 'male'): string {
  if (gender === 'male' || gender === 'm') {
    if (bodyFat < 6) return 'text-blue-600';
    if (bodyFat < 14) return 'text-green-600';
    if (bodyFat < 18) return 'text-green-500';
    if (bodyFat < 25) return 'text-yellow-600';
    return 'text-red-600';
  } else {
    if (bodyFat < 12) return 'text-blue-600';
    if (bodyFat < 21) return 'text-green-600';
    if (bodyFat < 25) return 'text-green-500';
    if (bodyFat < 32) return 'text-yellow-600';
    return 'text-red-600';
  }
}

/**
 * Get background color for body fat category
 */
export function getBodyFatBgColor(bodyFat: number, gender: string = 'male'): string {
  if (gender === 'male' || gender === 'm') {
    if (bodyFat < 6) return 'bg-blue-100';
    if (bodyFat < 14) return 'bg-green-100';
    if (bodyFat < 18) return 'bg-green-50';
    if (bodyFat < 25) return 'bg-yellow-100';
    return 'bg-red-100';
  } else {
    if (bodyFat < 12) return 'bg-blue-100';
    if (bodyFat < 21) return 'bg-green-100';
    if (bodyFat < 25) return 'bg-green-50';
    if (bodyFat < 32) return 'bg-yellow-100';
    return 'bg-red-100';
  }
}
