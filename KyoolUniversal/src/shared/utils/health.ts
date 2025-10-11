// Health utility functions for calculating BMI, BMR, TDEE
// Based on frontend/src/utils/health.ts

export function calculateBMI(weight: number, height: number): number | null {
  if (!weight || !height) return null;
  return +(weight / ((height / 100) ** 2)).toFixed(2);
}

export function calculateBMR(weight: number, height: number, age: number, gender: string): number | null {
  if (!weight || !height || !age || !gender) return null;
  if (gender === 'male') {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  } else {
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }
}

export function getActivityFactor(activityLevel: string): number {
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

export function calculateTDEE(bmr: number, activityLevel: string): number | null {
  return bmr ? Math.round(bmr * getActivityFactor(activityLevel)) : null;
}

export type FitnessGoal = "lose_weight" | "build_muscle" | "get_fitter" | "eat_better" | "stay_healthy";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "very_active" | "athlete";
export type Gender = "male" | "female" | "nonbinary" | "prefer_not_to_say";

export interface UserProfileData {
  username: string;
  name: string;
  email: string;
  avatar?: string;
  age?: number;
  height?: number;
  weight?: number;
  gender?: Gender;
  activity_level?: ActivityLevel;
  fitness_goal?: FitnessGoal;
  bmi?: number;
  bmr?: number;
  tdee?: number;
  date_joined?: string;
}