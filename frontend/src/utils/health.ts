// src/utils/health.ts
export function calculateBMI(weight: number, height: number) {
  if (!weight || !height) return null;
  return +(weight / ((height / 100) ** 2)).toFixed(2);
}

export function calculateBMR(weight: number, height: number, age: number, gender: string) {
  if (!weight || !height || !age || !gender) return null;
  if (gender === 'male') {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  } else {
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }
}

export function getActivityFactor(activityLevel: string) {
  switch (activityLevel) {
    case 'sedentary': return 1.2;
    case 'light': return 1.375;
    case 'moderate': return 1.55;
    case 'active': return 1.725;
    case 'very_active': return 1.9;
    case 'athlete': return 1.9;
    default: return 1.2;
  }
}

export function calculateTDEE(bmr: number, activityLevel: string) {
  return bmr ? Math.round(bmr * getActivityFactor(activityLevel)) : null;
}

/**
 * Calculate body fat percentage using the Navy Method.
 * 
 * For Men: Body Fat % = 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
 * For Women: Body Fat % = 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
 * 
 * All measurements should be in centimeters.
 * 
 * @param gender - 'male' or 'female'
 * @param height - Height in centimeters
 * @param neck - Neck circumference in centimeters
 * @param waist - Waist circumference in centimeters
 * @param hip - Hip circumference in centimeters (required for women, optional for men)
 * @returns Body fat percentage rounded to 1 decimal place, or null if invalid inputs
 */
export function calculateBodyFat(
  gender: string,
  height: number,
  neck: number,
  waist: number,
  hip?: number
): number | null {
  if (!gender || !height || !neck || !waist || height <= 0 || neck <= 0 || waist <= 0) {
    return null;
  }

  if (gender === 'male') {
    // Navy Method for Men
    const abdomen = waist; // Waist measurement for men
    const neckWaistDiff = abdomen - neck;
    
    if (neckWaistDiff <= 0) {
      return null; // Invalid: waist should be larger than neck
    }

    const bodyFat =
      495 / (1.0324 - 0.19077 * Math.log10(neckWaistDiff) + 0.15456 * Math.log10(height)) - 450;
    
    return Math.max(0, Math.round(bodyFat * 10) / 10); // Ensure non-negative and round to 1 decimal
  } else {
    // Navy Method for Women
    if (!hip || hip <= 0) {
      return null; // Hip measurement required for women
    }

    const circumference = waist + hip - neck;
    
    if (circumference <= 0) {
      return null; // Invalid measurements
    }

    const bodyFat =
      495 / (1.29579 - 0.35004 * Math.log10(circumference) + 0.22100 * Math.log10(height)) - 450;
    
    return Math.max(0, Math.round(bodyFat * 10) / 10); // Ensure non-negative and round to 1 decimal
  }
}

/**
 * Classify body fat percentage into categories.
 * Categories based on American Council on Exercise (ACE) standards.
 */
export function getBodyFatCategory(bodyFat: number, gender: string = 'male') {
  if (gender === 'male') {
    if (bodyFat < 6) return { label: 'Essential', color: 'blue', description: 'Minimum necessary body fat' };
    if (bodyFat < 14) return { label: 'Athletic', color: 'green', description: 'Fit and lean' };
    if (bodyFat < 18) return { label: 'Fitness', color: 'green', description: 'Healthy range' };
    if (bodyFat < 25) return { label: 'Average', color: 'yellow', description: 'Typical range' };
    return { label: 'Obese', color: 'red', description: 'Above healthy range' };
  } else {
    if (bodyFat < 12) return { label: 'Essential', color: 'blue', description: 'Minimum necessary body fat' };
    if (bodyFat < 21) return { label: 'Athletic', color: 'green', description: 'Fit and lean' };
    if (bodyFat < 25) return { label: 'Fitness', color: 'green', description: 'Healthy range' };
    if (bodyFat < 32) return { label: 'Average', color: 'yellow', description: 'Typical range' };
    return { label: 'Obese', color: 'red', description: 'Above healthy range' };
  }
}