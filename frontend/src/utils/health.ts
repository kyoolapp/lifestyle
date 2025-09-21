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
    case 'veryActive': return 1.9;
    default: return 1.2;
  }
}

export function calculateTDEE(bmr: number, activityLevel: string) {
  return bmr ? Math.round(bmr * getActivityFactor(activityLevel)) : null;
}