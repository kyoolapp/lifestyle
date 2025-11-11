/**
 * Unit Conversion Utilities
 * 
 * This module handles conversion between metric and imperial units.
 * All data is stored in the database using metric units (kg, cm).
 * Frontend displays data based on user's unit preference.
 */

export type UnitSystem = 'metric' | 'imperial';

/**
 * Conversion factors
 */
const KG_TO_LBS = 2.20462;
const CM_TO_INCHES = 0.393701;
const CM_TO_FEET = 0.0328084;
const LBS_TO_KG = 0.453592;
const INCHES_TO_CM = 2.54;
const FEET_TO_CM = 30.48;

/**
 * Weight conversions
 */
export const weightConversions = {
  /**
   * Convert kg (database) to user's preferred unit
   * @param kg - Weight in kilograms
   * @param unitSystem - 'metric' for kg, 'imperial' for lbs
   * @returns Weight in the specified unit
   */
  dbToDisplay: (kg: number, unitSystem: UnitSystem): number => {
    if (!kg) return 0;
    return unitSystem === 'imperial' ? +(kg * KG_TO_LBS).toFixed(2) : +(kg).toFixed(2);
  },

  /**
   * Convert user's input to kg (database format)
   * @param value - Weight in user's preferred unit
   * @param unitSystem - 'metric' for kg, 'imperial' for lbs
   * @returns Weight in kilograms
   */
  displayToDb: (value: number, unitSystem: UnitSystem): number => {
    if (!value) return 0;
    return unitSystem === 'imperial' ? +(value * LBS_TO_KG).toFixed(2) : +(value).toFixed(2);
  },

  /**
   * Get the unit label for weight
   */
  getUnit: (unitSystem: UnitSystem): string => {
    return unitSystem === 'imperial' ? 'lbs' : 'kg';
  },
};

/**
 * Height conversions
 */
export const heightConversions = {
  /**
   * Convert cm (database) to user's preferred unit
   * @param cm - Height in centimeters
   * @param unitSystem - 'metric' for cm, 'imperial' for feet & inches
   * @returns Height in the specified unit
   */
  dbToDisplay: (cm: number, unitSystem: UnitSystem): { value: number; feet?: number; inches?: number } => {
    if (!cm) return { value: 0 };
    
    if (unitSystem === 'imperial') {
      const totalInches = cm * CM_TO_INCHES;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round((totalInches % 12) * 100) / 100;
      return { value: cm, feet, inches };
    } else {
      return { value: +cm.toFixed(2) };
    }
  },

  /**
   * Convert user's input to cm (database format)
   * @param value - Height value
   * @param unitSystem - 'metric' for cm, 'imperial' for feet & inches
   * @param feet - Feet (only for imperial)
   * @param inches - Inches (only for imperial)
   * @returns Height in centimeters
   */
  displayToDb: (value: number, unitSystem: UnitSystem, feet?: number, inches?: number): number => {
    if (unitSystem === 'imperial' && feet !== undefined && inches !== undefined) {
      const totalInches = feet * 12 + inches;
      return +(totalInches * INCHES_TO_CM).toFixed(2);
    } else {
      return +value.toFixed(2);
    }
  },

  /**
   * Get the unit label for height
   */
  getUnit: (unitSystem: UnitSystem): string => {
    return unitSystem === 'imperial' ? 'ft/in' : 'cm';
  },

  /**
   * Format height for display
   */
  format: (cm: number, unitSystem: UnitSystem): string => {
    if (!cm) return '0';
    
    if (unitSystem === 'imperial') {
      const totalInches = cm * CM_TO_INCHES;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round((totalInches % 12) * 100) / 100;
      return `${feet}'${inches}"`;
    } else {
      return `${cm.toFixed(2)} cm`;
    }
  },
};

/**
 * BMI conversions (note: BMI calculation is the same in both systems when using proper units)
 * This is included for consistency and future enhancements
 */
export const bmiConversions = {
  /**
   * Calculate BMI given weight and height in their respective units
   * @param weight - Weight in user's preferred unit
   * @param height - Height in user's preferred unit
   * @param unitSystem - 'metric' for metric, 'imperial' for imperial
   * @returns BMI value
   */
  calculate: (weight: number, height: number, unitSystem: UnitSystem): number | null => {
    if (!weight || !height) return null;
    
    if (unitSystem === 'imperial') {
      // BMI = (weight in lbs / (height in inches)^2) * 703
      const heightInInches = (height * CM_TO_INCHES) || (height / 2.54); // Support both cm and inches input
      const bmi = (weight / (heightInInches ** 2)) * 703;
      return +bmi.toFixed(2);
    } else {
      // BMI = weight in kg / (height in m)^2
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters ** 2);
      return +bmi.toFixed(2);
    }
  },

  /**
   * Get BMI category
   */
  getCategory: (bmi: number | null): string => {
    if (!bmi) return 'Unknown';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  },
};

/**
 * Height in cm conversion helpers (useful for form inputs that might accept imperial)
 */
export const heightInCmFromImperial = (feet: number, inches: number): number => {
  const totalInches = feet * 12 + inches;
  return +(totalInches * INCHES_TO_CM).toFixed(2);
};

export const heightInFeetInchesFromCm = (cm: number): { feet: number; inches: number } => {
  const totalInches = cm * CM_TO_INCHES;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round((totalInches % 12) * 100) / 100;
  return { feet, inches };
};
