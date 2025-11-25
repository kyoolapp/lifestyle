/**
 * Exercise API - Backed by local database (no rate limiting)
 * Fetches exercises from backend instead of ExerciseDB API
 */

const API_BASE = `${import.meta.env.VITE_API_URL}/users`;

// Fallback local data for offline mode
const FALLBACK_DATA = {
  targetMuscles: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'legs', 'hamstrings', 'quadriceps', 'glutes', 'calves', 'core'],
  equipment: ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell', 'resistance band', 'medicine ball']
};

/**
 * Get all available exercises
 */
export async function getAllExercises() {
  try {
    const response = await fetch(`${API_BASE}/exercises/all`);
    if (!response.ok) throw new Error('Failed to fetch exercises');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching all exercises:', error);
    return [];
  }
}

/**
 * Get exercises by target muscle
 * Examples: chest, back, shoulders, legs, biceps, triceps, forearms, etc.
 */
export async function getExercisesByMuscle(muscle) {
  try {
    const response = await fetch(`${API_BASE}/exercises/target/${muscle}`);
    if (!response.ok) throw new Error(`Failed to fetch exercises for muscle: ${muscle}`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Error fetching exercises for muscle ${muscle}:`, error);
    return [];
  }
}

/**
 * Get exercises by equipment type
 * Examples: barbell, dumbbell, cable, machine, kettlebell, medicine ball, etc.
 */
export async function getExercisesByEquipment(equipment) {
  try {
    const response = await fetch(`${API_BASE}/exercises/equipment/${equipment}`);
    if (!response.ok) throw new Error(`Failed to fetch exercises for equipment: ${equipment}`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Error fetching exercises for equipment ${equipment}:`, error);
    return [];
  }
}

/**
 * Get available body parts / target muscles
 */
export async function getBodyParts() {
  try {
    const response = await fetch(`${API_BASE}/exercises/filters`);
    if (!response.ok) throw new Error('Failed to fetch body parts');
    const data = await response.json();
    return data.data?.targetMuscles || FALLBACK_DATA.targetMuscles;
  } catch (error) {
    console.error('Error fetching body parts:', error);
    return FALLBACK_DATA.targetMuscles;
  }
}

/**
 * Get available equipment types
 */
export async function getEquipmentList() {
  try {
    const response = await fetch(`${API_BASE}/exercises/filters`);
    if (!response.ok) throw new Error('Failed to fetch equipment list');
    const data = await response.json();
    return data.data?.equipment || FALLBACK_DATA.equipment;
  } catch (error) {
    console.error('Error fetching equipment list:', error);
    return FALLBACK_DATA.equipment;
  }
}

/**
 * Search exercises by name
 */
export async function searchExercises(query) {
  try {
    const response = await fetch(`${API_BASE}/exercises/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search exercises');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Error searching exercises for query "${query}":`, error);
    return [];
  }
}

/**
 * Format exercise data for UI display
 */
export function formatExercise(exercise) {
  return {
    id: exercise.id,
    name: exercise.name,
    target: exercise.target,
    bodyPart: exercise.bodyPart || exercise.target,
    equipment: exercise.equipment,
    difficulty: exercise.difficulty || 'intermediate',
    instructions: exercise.instructions || []
  };
}
