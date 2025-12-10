/**
 * Unit Conversion Utilities
 * 
 * This module handles conversion between metric and imperial units.
 * All data is stored in the database using metric units (kg, cm, ml, etc).
 * Frontend displays data based on user's unit preferences.
 */

export type UnitSystem = 'metric' | 'imperial';

/**
 * Conversion factors
 */
const KG_TO_LBS = 2.20462;
const KG_TO_STONE = 0.157473;
const CM_TO_INCHES = 0.393701;
const CM_TO_FEET = 0.0328084;
const LBS_TO_KG = 0.453592;
const STONE_TO_KG = 6.35029;
const INCHES_TO_CM = 2.54;
const FEET_TO_CM = 30.48;
const KM_TO_MI = 0.621371;
const MI_TO_KM = 1.60934;
const KJ_TO_KCAL = 0.239;
const KCAL_TO_KJ = 4.184;
const ML_TO_CUP = 0.004227;
const ML_TO_FL_OZ = 0.033814;
const CUP_TO_ML = 236.588;
const FL_OZ_TO_ML = 29.5735;

/**
 * Weight conversions with support for multiple units
 */
export const weightConversions = {
  /**
   * Convert kg (database) to user's preferred unit
   * @param kg - Weight in kilograms
   * @param unit - 'kg', 'lbs', or 'stone'
   * @returns Weight in the specified unit
   */
  dbToDisplay: (kg: number, unit: string = 'kg'): number => {
    if (!kg) return 0;
    switch (unit) {
      case 'lbs':
        return +(kg * KG_TO_LBS).toFixed(2);
      case 'stone':
        return +(kg * KG_TO_STONE).toFixed(2);
      case 'kg':
      default:
        return +(kg).toFixed(2);
    }
  },

  /**
   * Convert user's input to kg (database format)
   * @param value - Weight in user's preferred unit
   * @param unit - 'kg', 'lbs', or 'stone'
   * @returns Weight in kilograms
   */
  displayToDb: (value: number, unit: string = 'kg'): number => {
    if (!value) return 0;
    switch (unit) {
      case 'lbs':
        return +(value * LBS_TO_KG).toFixed(2);
      case 'stone':
        return +(value * STONE_TO_KG).toFixed(2);
      case 'kg':
      default:
        return +(value).toFixed(2);
    }
  },

  /**
   * Get the unit label for weight
   * @deprecated Use individual weightUnits instead
   */
  getUnit: (unitSystem: UnitSystem): string => {
    return unitSystem === 'imperial' ? 'lbs' : 'kg';
  },
};

/**
 * Height conversions with support for multiple units
 */
export const heightConversions = {
  /**
   * Convert cm (database) to user's preferred unit
   * @param cm - Height in centimeters
   * @param unit - 'cm' or 'ft_in'
   * @returns Height in the specified unit
   */
  dbToDisplay: (cm: number, unit: string = 'cm'): { value: number; feet?: number; inches?: number } => {
    if (!cm) return { value: 0 };
    
    if (unit === 'ft_in') {
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
   * @param unit - 'cm' or 'ft_in'
   * @param feet - Feet (only for ft_in)
   * @param inches - Inches (only for ft_in)
   * @returns Height in centimeters
   */
  displayToDb: (value: number, unit: string = 'cm', feet?: number, inches?: number): number => {
    if (unit === 'ft_in' && feet !== undefined && inches !== undefined) {
      const totalInches = feet * 12 + inches;
      return +(totalInches * INCHES_TO_CM).toFixed(2);
    } else {
      return +value.toFixed(2);
    }
  },

  /**
   * Get the unit label for height
   * @deprecated Use individual heightUnits instead
   */
  getUnit: (unitSystem: UnitSystem): string => {
    return unitSystem === 'imperial' ? 'ft/in' : 'cm';
  },

  /**
   * Format height for display
   */
  format: (cm: number, unit: string = 'cm'): string => {
    if (!cm) return '0';
    
    if (unit === 'ft_in') {
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
 * Distance conversions with support for multiple units
 */
export const distanceConversions = {
  /**
   * Convert km (database) to user's preferred unit
   * @param km - Distance in kilometers
   * @param unit - 'km' or 'mi'
   * @returns Distance in the specified unit
   */
  dbToDisplay: (km: number, unit: string = 'km'): number => {
    if (!km) return 0;
    switch (unit) {
      case 'mi':
        return +(km * KM_TO_MI).toFixed(2);
      case 'km':
      default:
        return +(km).toFixed(2);
    }
  },

  /**
   * Convert user's input to km (database format)
   * @param value - Distance in user's preferred unit
   * @param unit - 'km' or 'mi'
   * @returns Distance in kilometers
   */
  displayToDb: (value: number, unit: string = 'km'): number => {
    if (!value) return 0;
    switch (unit) {
      case 'mi':
        return +(value * MI_TO_KM).toFixed(2);
      case 'km':
      default:
        return +(value).toFixed(2);
    }
  },

  /**
   * Get the unit label for distance
   */
  getUnit: (unit: string): string => {
    return unit === 'mi' ? 'miles' : 'km';
  },
};

/**
 * Energy conversions with support for multiple units
 */
export const energyConversions = {
  /**
   * Convert kcal (database) to user's preferred unit
   * @param kcal - Energy in kilocalories
   * @param unit - 'kcal' or 'kj'
   * @returns Energy in the specified unit
   */
  dbToDisplay: (kcal: number, unit: string = 'kcal'): number => {
    if (!kcal) return 0;
    switch (unit) {
      case 'kj':
        return +(kcal * KCAL_TO_KJ).toFixed(2);
      case 'kcal':
      default:
        return +(kcal).toFixed(2);
    }
  },

  /**
   * Convert user's input to kcal (database format)
   * @param value - Energy in user's preferred unit
   * @param unit - 'kcal' or 'kj'
   * @returns Energy in kilocalories
   */
  displayToDb: (value: number, unit: string = 'kcal'): number => {
    if (!value) return 0;
    switch (unit) {
      case 'kj':
        return +(value * KJ_TO_KCAL).toFixed(2);
      case 'kcal':
      default:
        return +(value).toFixed(2);
    }
  },

  /**
   * Get the unit label for energy
   */
  getUnit: (unit: string): string => {
    return unit === 'kj' ? 'kJ' : 'kcal';
  },
};

/**
 * Water conversions with support for multiple units
 */
export const waterConversions = {
  /**
   * Convert ml (database) to user's preferred unit
   * @param ml - Volume in milliliters
   * @param unit - 'ml' or 'fl_oz'
   * @returns Volume in the specified unit
   */
  dbToDisplay: (ml: number, unit: string = 'ml'): number => {
    if (!ml) return 0;
    switch (unit) {
      case 'fl_oz':
        return +(ml * ML_TO_FL_OZ).toFixed(2);
      case 'ml':
      default:
        return +(ml).toFixed(2);
    }
  },

  /**
   * Convert user's input to ml (database format)
   * @param value - Volume in user's preferred unit
   * @param unit - 'ml' or 'fl_oz'
   * @returns Volume in milliliters
   */
  displayToDb: (value: number, unit: string = 'ml'): number => {
    if (!value) return 0;
    switch (unit) {
      case 'fl_oz':
        return +(value * FL_OZ_TO_ML).toFixed(2);
      case 'ml':
      default:
        return +(value).toFixed(2);
    }
  },

  /**
   * Get the unit label for water
   */
  getUnit: (unit: string): string => {
    switch (unit) {
      case 'fl_oz':
        return 'fl oz';
      case 'ml':
      default:
        return 'ml';
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

/**
 * Weight unit options
 */
export const weightUnits = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'lbs', label: 'Pounds (lbs)' },
  { value: 'stone', label: 'Stone (st)' },
];

/**
 * Height unit options
 */
export const heightUnits = [
  { value: 'cm', label: 'Centimeters (cm)' },
  { value: 'ft_in', label: 'Feet/Inches (ft/in)' },
];

/**
 * Distance unit options
 */
export const distanceUnits = [
  { value: 'km', label: 'Kilometers (km)' },
  { value: 'mi', label: 'Miles (mi)' },
];

/**
 * Energy unit options
 */
export const energyUnits = [
  { value: 'kcal', label: 'Calories (kcal)' },
  { value: 'kj', label: 'Kilojoules (kJ)' },
];

/**
 * Water unit options
 */
export const waterUnits = [
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'fl_oz', label: 'Fluid Ounces (fl oz)' },
];
