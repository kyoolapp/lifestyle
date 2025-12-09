import React, { createContext, useContext, useState, useEffect } from 'react';
import { UnitSystem } from '../utils/unitConversion';
import { auth } from '../firebase';

/**
 * Unit preferences for different measurement types
 */
export interface UnitPreferences {
  weight: 'kg' | 'lbs' | 'stone';
  height: 'cm' | 'ft_in';
  distance: 'km' | 'mi';
  energy: 'kcal' | 'kj';
  water: 'ml' | 'cup' | 'fl_oz';
}

const defaultPreferences: UnitPreferences = {
  weight: 'kg',
  height: 'cm',
  distance: 'km',
  energy: 'kcal',
  water: 'ml',
};

interface UnitContextType {
  // Deprecated: kept for backward compatibility
  unitSystem: UnitSystem;
  setUnitSystem: (system: UnitSystem) => Promise<void>;
  
  // New: individual unit preferences
  unitPreferences: UnitPreferences;
  updateUnitPreference: (preference: keyof UnitPreferences, value: string) => Promise<void>;
  updateAllUnitPreferences: (prefs: Partial<UnitPreferences>) => Promise<void>;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

/**
 * Provider component that manages unit system state globally
 * This should wrap your main app component (in App.tsx)
 */
export function UnitProvider({ children }: { children: React.ReactNode }) {
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>('metric');
  const [unitPreferences, setUnitPreferencesState] = useState<UnitPreferences>(defaultPreferences);

  /**
   * Update a single unit preference and persist to database
   */
  const updateUnitPreference = async (preference: keyof UnitPreferences, value: string): Promise<void> => {
    try {
      const updatedPrefs = { ...unitPreferences, [preference]: value };
      setUnitPreferencesState(updatedPrefs);
      localStorage.setItem('userUnitPreferences', JSON.stringify(updatedPrefs));
      
      // Persist to database if user is authenticated
      const user = auth.currentUser;
      if (user?.email) {
        const BASE_URL = import.meta.env.VITE_API_URL;
        
        try {
          // Get user ID from email
          const userRes = await fetch(`${BASE_URL}/users/by-email/${encodeURIComponent(user.email)}`);
          if (!userRes.ok) {
            console.warn('Failed to fetch user from database, skipping unit preference sync');
            return;
          }
          
          const userData = await userRes.json();
          if (!userData.id) {
            console.warn('User ID not found in response, skipping unit preference sync');
            return;
          }
          
          // Update unit preferences in database
          const updateRes = await fetch(`${BASE_URL}/users/${userData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ unit_preferences: updatedPrefs })
          });
          
          if (!updateRes.ok) {
            console.warn('Failed to update unit preferences in database');
            return;
          }
          
          console.log(`Unit preference ${preference} updated to ${value} in database`);
        } catch (syncErr) {
          console.warn('Error during unit preference sync:', syncErr);
        }
      }
    } catch (err) {
      console.error('Failed to update unit preference:', err);
    }
  };

  /**
   * Update all unit preferences at once
   */
  const updateAllUnitPreferences = async (prefs: Partial<UnitPreferences>): Promise<void> => {
    try {
      const updatedPrefs = { ...unitPreferences, ...prefs };
      setUnitPreferencesState(updatedPrefs);
      localStorage.setItem('userUnitPreferences', JSON.stringify(updatedPrefs));
      
      // Persist to database if user is authenticated
      const user = auth.currentUser;
      if (user?.email) {
        const BASE_URL = import.meta.env.VITE_API_URL;
        
        try {
          // Get user ID from email
          const userRes = await fetch(`${BASE_URL}/users/by-email/${encodeURIComponent(user.email)}`);
          if (!userRes.ok) {
            console.warn('Failed to fetch user from database, skipping unit preferences sync');
            return;
          }
          
          const userData = await userRes.json();
          if (!userData.id) {
            console.warn('User ID not found in response, skipping unit preferences sync');
            return;
          }
          
          // Update all unit preferences in database
          const updateRes = await fetch(`${BASE_URL}/users/${userData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ unit_preferences: updatedPrefs })
          });
          
          if (!updateRes.ok) {
            console.warn('Failed to update unit preferences in database');
            return;
          }
          
          console.log('All unit preferences updated in database');
        } catch (syncErr) {
          console.warn('Error during unit preferences sync:', syncErr);
        }
      }
    } catch (err) {
      console.error('Failed to update unit preferences:', err);
    }
  };

  /**
   * Update unit system (deprecated but kept for backward compatibility)
   * This now updates the weight and distance preferences
   */
  const setUnitSystem = async (system: UnitSystem): Promise<void> => {
    try {
      setUnitSystemState(system);
      localStorage.setItem('userUnitSystem', system);
      
      // Convert to new preferences format
      const newPrefs: Partial<UnitPreferences> = {
        weight: system === 'imperial' ? 'lbs' : 'kg',
        height: system === 'imperial' ? 'ft_in' : 'cm',
        distance: system === 'imperial' ? 'mi' : 'km',
      };
      
      await updateAllUnitPreferences(newPrefs);
    } catch (err) {
      console.error('Failed to update unit system:', err);
    }
  };

  /**
   * Load unit preferences from database when user logs in
   */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user?.email) {
        try {
          const BASE_URL = import.meta.env.VITE_API_URL;
          const res = await fetch(`${BASE_URL}/users/by-email/${encodeURIComponent(user.email)}`);
          if (res.ok) {
            const userData = await res.json();
            
            // Load new unit preferences if available
            if (userData.unit_preferences) {
              const prefs = userData.unit_preferences as UnitPreferences;
              setUnitPreferencesState(prefs);
              localStorage.setItem('userUnitPreferences', JSON.stringify(prefs));
            } else {
              // Fall back to localStorage
              const savedPrefs = localStorage.getItem('userUnitPreferences');
              if (savedPrefs) {
                setUnitPreferencesState(JSON.parse(savedPrefs));
              }
            }
            
            // Also load legacy unit_system for backward compatibility
            const userUnitSystem = (userData.unit_system || 'metric') as UnitSystem;
            setUnitSystemState(userUnitSystem);
            localStorage.setItem('userUnitSystem', userUnitSystem);
          }
        } catch (err) {
          console.error('Failed to load unit preferences from database:', err);
          // Fall back to localStorage
          const savedPrefs = localStorage.getItem('userUnitPreferences');
          if (savedPrefs) {
            setUnitPreferencesState(JSON.parse(savedPrefs));
          }
        }
      } else {
        // User not authenticated - use localStorage or default
        const savedPrefs = localStorage.getItem('userUnitPreferences');
        if (savedPrefs) {
          setUnitPreferencesState(JSON.parse(savedPrefs));
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UnitContext.Provider value={{ unitSystem, setUnitSystem, unitPreferences, updateUnitPreference, updateAllUnitPreferences }}>
      {children}
    </UnitContext.Provider>
  );
}

/**
 * Hook to use the unit system context
 * @returns { unitSystem, setUnitSystem, unitPreferences, updateUnitPreference, updateAllUnitPreferences }
 * @throws Error if used outside UnitProvider
 */
export function useUnitSystem() {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error('useUnitSystem must be used within a UnitProvider');
  }
  return context;
}
