/**
 * INTEGRATION GUIDE: How to wire RoutineBuilder into WorkoutListDialog
 * 
 * This example shows how to:
 * 1. Load saved routines from backend
 * 2. Display them as workout options
 * 3. Allow users to create new routines
 * 4. Log workouts using templates
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { RoutineBuilder } from './RoutineBuilder';
import { getRoutines } from '../api/routines_api';
import { logWorkout } from '../api/workouts_api';
import { auth } from '../firebase';

interface WorkoutListDialogIntegrationExample {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkoutListDialogIntegration({ open, onOpenChange }: WorkoutListDialogIntegrationExample) {
  const [savedRoutines, setSavedRoutines] = useState<any[]>([]);
  const [showRoutineBuilder, setShowRoutineBuilder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<any>(null);

  // Load saved routines on dialog open
  useEffect(() => {
    if (open && auth.currentUser) {
      loadRoutines();
    }
  }, [open]);

  const loadRoutines = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const routines = await getRoutines(user.uid);
      setSavedRoutines(routines);
    } catch (error) {
      console.error('Error loading routines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoutineSaved = async (routine: any) => {
    // Routine was just saved, reload the list
    await loadRoutines();
    setShowRoutineBuilder(false);
  };

  const handleLogWorkout = async (routine: any) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Format exercises for logging
      const exercisesCompleted = routine.exercises.map((ex: any) => ({
        name: ex.name,
        target: ex.target,
        sets: ex.sets
      }));

      // Calculate total duration from sets
      const estimatedDuration = routine.exercises.length * 15; // ~15 min per exercise

      // Log the workout
      const result = await logWorkout(user.uid, {
        routine_name: routine.name,
        exercises: exercisesCompleted,
        duration_minutes: estimatedDuration,
        shared_with: [] // Can be made dynamic
      });

      alert(`Workout logged! Calories burned: ${result.calories_burned}`);
      onOpenChange(false);
    } catch (error) {
      console.error('Error logging workout:', error);
      alert('Failed to log workout');
    }
  };

  return (
    <div className="space-y-4">
      {/* Create New Routine Button */}
      <Button
        onClick={() => setShowRoutineBuilder(true)}
        className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
      >
        + Create New Routine
      </Button>

      {/* Routine Builder Dialog */}
      <RoutineBuilder
        open={showRoutineBuilder}
        onOpenChange={setShowRoutineBuilder}
        onSaveRoutine={handleRoutineSaved}
      />

      {/* Saved Routines Grid */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm">My Routines</h3>
        
        {loading ? (
          <p className="text-sm text-gray-500">Loading routines...</p>
        ) : savedRoutines.length === 0 ? (
          <p className="text-sm text-gray-500">No saved routines yet. Create one to get started!</p>
        ) : (
          <div className="grid gap-2">
            {savedRoutines.map((routine) => (
              <div
                key={routine.id}
                className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                onClick={() => setSelectedRoutine(routine)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{routine.name}</h4>
                    <p className="text-xs text-gray-500">
                      {routine.exercises.length} exercises
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogWorkout(routine);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Log Workout
                  </Button>
                </div>

                {/* Exercise Preview */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {routine.exercises.slice(0, 3).map((ex: any) => (
                    <span key={ex.id} className="text-xs bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                      {ex.name}
                    </span>
                  ))}
                  {routine.exercises.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{routine.exercises.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Routine Detail (Optional) */}
      {selectedRoutine && (
        <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
          <h4 className="font-semibold mb-2">{selectedRoutine.name}</h4>
          <div className="space-y-1">
            {selectedRoutine.exercises.map((ex: any) => (
              <div key={ex.id} className="text-sm flex justify-between">
                <span>{ex.name}</span>
                <span className="text-gray-500">{ex.sets.length} sets</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setSelectedRoutine(null)}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={() => handleLogWorkout(selectedRoutine)}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Start Workout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * IMPLEMENTATION STEPS:
 * 
 * 1. In WorkoutListDialog.tsx, import:
 *    import { getRoutines } from '../api/routines_api';
 *    import { RoutineBuilder } from './RoutineBuilder';
 * 
 * 2. Add state:
 *    const [savedRoutines, setSavedRoutines] = useState<any[]>([]);
 *    const [showRoutineBuilder, setShowRoutineBuilder] = useState(false);
 * 
 * 3. Load routines on mount:
 *    useEffect(() => {
 *      if (auth.currentUser) {
 *        getRoutines(auth.currentUser.uid)
 *          .then(setSavedRoutines)
 *          .catch(console.error);
 *      }
 *    }, []);
 * 
 * 4. Replace static workout routines with:
 *    {savedRoutines.map((routine) => (
 *      // Display routine card
 *      // Add "Log Workout" button
 *    ))}
 * 
 * 5. Add RoutineBuilder dialog:
 *    <RoutineBuilder
 *      open={showRoutineBuilder}
 *      onOpenChange={setShowRoutineBuilder}
 *      onSaveRoutine={handleRoutineSaved}
 *    />
 * 
 * 6. When logging workout:
 *    await logWorkout(userId, {
 *      routine_name: routine.name,
 *      exercises: routine.exercises,
 *      duration_minutes: estimatedDuration,
 *      shared_with: selectedFriendsToShare
 *    });
 */
