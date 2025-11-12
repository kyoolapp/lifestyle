import React, { createContext, useContext, useState, useEffect } from 'react';
import { UnitSystem } from '../utils/unitConversion';
import { auth } from '../firebase';

interface UnitContextType {
  unitSystem: UnitSystem;
  setUnitSystem: (system: UnitSystem) => Promise<void>;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

/**
 * Provider component that manages unit system state globally
 * This should wrap your main app component (in App.tsx)
 */
export function UnitProvider({ children }: { children: React.ReactNode }) {
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>('metric');

  /**
   * Update unit system and persist to localStorage and database
   * This is now async to ensure database updates complete before continuing
   */
  const setUnitSystem = async (system: UnitSystem): Promise<void> => {
    try {
      setUnitSystemState(system);
      localStorage.setItem('userUnitSystem', system);
      
      // Persist to database if user is authenticated
      const user = auth.currentUser;
      if (user?.email) {
        const BASE_URL = import.meta.env.VITE_API_URL;
        
        try {
          // First, get the user ID from email
          const userRes = await fetch(`${BASE_URL}/users/by-email/${encodeURIComponent(user.email)}`);
          if (!userRes.ok) {
            console.warn('Failed to fetch user from database, skipping unit system sync');
            return;
          }
          
          const userData = await userRes.json();
          
          // Check if user ID exists
          if (!userData.id) {
            console.warn('User ID not found in response, skipping unit system sync');
            return;
          }
          
          // Use PATCH endpoint for partial update (only unit_system field)
          const updateRes = await fetch(`${BASE_URL}/users/${userData.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ unit_system: system })
          });
          
          if (!updateRes.ok) {
            console.warn('Failed to update unit system in database');
            return;
          }
          
          console.log(`Unit system updated to ${system} in database`);
        } catch (syncErr) {
          console.warn('Error during unit system sync:', syncErr);
          // Continue without database sync - local state is already updated
        }
      }
    } catch (err) {
      console.error('Failed to update unit system:', err);
      // Still keep the local state even if database update fails
      // so the app continues to work
    }
  };

  /**
   * Load unit system from database when user logs in or component mounts
   */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user?.email) {
        try {
          const BASE_URL = import.meta.env.VITE_API_URL;
          const res = await fetch(`${BASE_URL}/users/by-email/${encodeURIComponent(user.email)}`);
          if (res.ok) {
            const userData = await res.json();
            const userUnitSystem = (userData.unit_system || 'metric') as UnitSystem;
            setUnitSystemState(userUnitSystem);
            localStorage.setItem('userUnitSystem', userUnitSystem);
          }
        } catch (err) {
          console.error('Failed to load user unit system from database:', err);
          // Fall back to localStorage
          const savedUnit = localStorage.getItem('userUnitSystem') as UnitSystem | null;
          if (savedUnit) {
            setUnitSystemState(savedUnit);
          }
        }
      } else {
        // User not authenticated - use localStorage or default
        const savedUnit = localStorage.getItem('userUnitSystem') as UnitSystem | null;
        setUnitSystemState(savedUnit || 'metric');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UnitContext.Provider value={{ unitSystem, setUnitSystem }}>
      {children}
    </UnitContext.Provider>
  );
}

/**
 * Hook to use the unit system context
 * @returns { unitSystem, setUnitSystem } - Current unit system and function to update it
 * @throws Error if used outside UnitProvider
 */
export function useUnitSystem() {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error('useUnitSystem must be used within a UnitProvider');
  }
  return context;
}
