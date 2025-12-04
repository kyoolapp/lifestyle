import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle, ArrowLeft, Trash2, Play, Pause, Check } from 'lucide-react';
import { logWorkout, checkTodayWorkout } from '../api/workouts_api';
import { auth } from '../firebase';
import { ExerciseLibrary } from './ExerciseLibrary';
import { useUnitSystem } from '../context/UnitContext';
import { motion } from 'framer-motion';

interface Exercise {
  id: string;
  name: string;
  target?: string;
  bodyPart?: string;
  equipment?: string;
  gifUrl?: string;
  targetMuscles?: string[];
  instructions?: string[];
}

interface LoggedSet {
  weight: number;
  reps: number;
  restTime?: string; // Actual rest time taken (MM:SS)
}

interface WorkoutExercise extends Exercise {
  sets: LoggedSet[];
  restTimer: string;
  completedSets: LoggedSet[];
  currentSetIndex: number;
}

interface WorkoutLoggerProps {
  routine?: any;
}

export function WorkoutLogger({ routine: initialRoutine }: WorkoutLoggerProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const routine = initialRoutine || location.state?.routine;
  const { unitSystem } = useUnitSystem();
  
  // Determine if this is standalone mode (no routine)
  const isStandalone = !routine;

  // State for standalone mode timer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false); // Start as false - user must click Start
  const [workoutStarted, setWorkoutStarted] = useState<boolean>(false); // Track if workout has started

  // Rest timer state
  const [restTimerSeconds, setRestTimerSeconds] = useState<number>(0);
  const [restTimerActive, setRestTimerActive] = useState<boolean>(false);
  const [activeRestExerciseIndex, setActiveRestExerciseIndex] = useState<number | null>(null);
  const [restStartTime, setRestStartTime] = useState<number>(0); // Track when rest started

  const [durationMinutes, setDurationMinutes] = useState<number>(
    (routine?.exercises?.length || 0) * 15
  );
  const [exerciseData, setExerciseData] = useState<WorkoutExercise[]>(
    (routine?.exercises || []).map((ex: any) => ({
      id: ex.id || Math.random().toString(),
      name: ex.name,
      target: ex.target || 'general',
      sets: (ex.sets || [{ reps: 10, weight: 0 }]).map((s: any) => ({
        reps: s.reps || 10,
        weight: s.weight || 0,
      })),
      restTimer: ex.restTimer || '02:00',
      completedSets: [],
      currentSetIndex: 0,
    }))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyLoggedToday, setAlreadyLoggedToday] = useState(false);

  // Real-time timer effect for all workouts (standalone or routine-based)
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Rest timer countdown effect
  useEffect(() => {
    if (!restTimerActive || restTimerSeconds <= 0) {
      if (restTimerSeconds === 0 && restTimerActive) {
        // Timer completed naturally - store the preset rest time
        if (activeRestExerciseIndex !== null) {
          const updated = [...exerciseData];
          const lastSetIndex = updated[activeRestExerciseIndex].completedSets.length - 1;
          if (lastSetIndex >= 0 && !updated[activeRestExerciseIndex].completedSets[lastSetIndex].restTime) {
            // Store the preset rest timer value
            updated[activeRestExerciseIndex].completedSets[lastSetIndex].restTime = 
              updated[activeRestExerciseIndex].restTimer;
            setExerciseData(updated);
          }
        }
        setRestTimerActive(false);
        // Show notification that rest is over
      }
      return;
    }

    const interval = setInterval(() => {
      setRestTimerSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimerActive, restTimerSeconds, activeRestExerciseIndex, exerciseData]);

  // Check if today's workout is already logged on mount
  useEffect(() => {
    const checkTodayLoggedStatus = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const response = await checkTodayWorkout(user.uid);
        if (response && response.data) {
          setAlreadyLoggedToday(response.data.has_logged_today);
        }
      } catch (error) {
        console.error('Error checking today workout status:', error);
      }
    };

    checkTodayLoggedStatus();
  }, []);

  // Format time from seconds
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Parse rest timer MM:SS format to seconds
  const parseRestTimer = (timeStr: string): number => {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return (minutes || 0) * 60 + (seconds || 0);
  };

  // Get actual duration in minutes
  const getActualDuration = () => {
    return Math.ceil(elapsedSeconds / 60);
  };

  // Get unit label
  const getWeightLabel = () => {
    return unitSystem === 'metric' ? 'kg' : 'lbs';
  };

  const handleAddExerciseFromLibrary = (exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      ...exercise,
      sets: [{ reps: 10, weight: 0 }],
      restTimer: '02:00',
      completedSets: [],
      currentSetIndex: 0,
    };
    setExerciseData([...exerciseData, newExercise]);
  };

  const handleRemoveExercise = (index: number) => {
    setExerciseData(exerciseData.filter((_: any, i: number) => i !== index));
  };

  const handleLogSet = (exerciseIndex: number) => {
    const exercise = exerciseData[exerciseIndex];
    const currentSet = exercise.sets[exercise.currentSetIndex];

    if (!currentSet || currentSet.reps === 0) {
      setError('Reps must be greater than 0');
      return;
    }

    const updated = [...exerciseData];
    updated[exerciseIndex].completedSets.push({
      weight: currentSet.weight,
      reps: currentSet.reps,
    });
    
    // Move to next set
    if (updated[exerciseIndex].currentSetIndex < updated[exerciseIndex].sets.length - 1) {
      updated[exerciseIndex].currentSetIndex += 1;
      
      // Start rest timer and record start time
      const restSeconds = parseRestTimer(updated[exerciseIndex].restTimer);
      setRestTimerSeconds(restSeconds);
      setRestTimerActive(true);
      setActiveRestExerciseIndex(exerciseIndex);
      setRestStartTime(Date.now()); // Capture when rest started
    } else {
      // All sets completed for this exercise
      updated[exerciseIndex].currentSetIndex = updated[exerciseIndex].sets.length;
    }

    setExerciseData(updated);
    setError(null);
  };

  const handleSkipRest = () => {
    // Calculate actual rest time
    if (activeRestExerciseIndex !== null && restStartTime > 0) {
      const actualRestMs = Date.now() - restStartTime;
      const actualRestSeconds = Math.floor(actualRestMs / 1000);
      const actualRestFormatted = formatTime(actualRestSeconds);
      
      // Store actual rest time on the last completed set
      const updated = [...exerciseData];
      const lastSetIndex = updated[activeRestExerciseIndex].completedSets.length - 1;
      if (lastSetIndex >= 0) {
        updated[activeRestExerciseIndex].completedSets[lastSetIndex].restTime = actualRestFormatted;
        setExerciseData(updated);
      }
    }
    
    setRestTimerActive(false);
    setRestTimerSeconds(0);
    setActiveRestExerciseIndex(null);
    setRestStartTime(0);
  };

  const handleUndoSet = (exerciseIndex: number) => {
    const updated = [...exerciseData];
    if (updated[exerciseIndex].completedSets.length > 0) {
      updated[exerciseIndex].completedSets.pop();
      updated[exerciseIndex].currentSetIndex = Math.max(0, updated[exerciseIndex].currentSetIndex - 1);
      
      setExerciseData(updated);
      
      // Stop rest timer if active
      setRestTimerActive(false);
      setRestTimerSeconds(0);
      setActiveRestExerciseIndex(null);
      setRestStartTime(0);
    }
  };

  const handleUpdateRestTimer = (exerciseIndex: number, value: string) => {
    const updated = [...exerciseData];
    updated[exerciseIndex].restTimer = value;
    setExerciseData(updated);
  };

  const handleStartWorkout = () => {
    if (exerciseData.length === 0) {
      setError('Please add at least one exercise before starting');
      return;
    }
    setWorkoutStarted(true);
    setIsTimerRunning(true);
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate that at least one exercise has completed sets
      if (exerciseData.length === 0) {
        throw new Error('Please add at least one exercise');
      }

      const hasCompletedSets = exerciseData.some((ex) => ex.completedSets.length > 0);
      if (!hasCompletedSets) {
        throw new Error('Please log at least one set');
      }

      // Get the actual duration
      const finalDuration = getActualDuration();

      if (finalDuration <= 0) {
        throw new Error('Duration must be greater than 0');
      }

      // Format exercises for API - only include exercises with completed sets
      const exercisesCompleted = exerciseData
        .filter((ex) => ex.completedSets.length > 0)
        .map((ex: any) => ({
          name: ex.name,
          sets: ex.completedSets.map((set: LoggedSet) => ({
            weight: set.weight,
            reps: set.reps,
            ...(set.restTime && { restTime: set.restTime }), // Include if available
          })),
          restTimer: ex.restTimer,
          unitSystem: unitSystem,
        }));

      // Call the API
      await logWorkout(user.uid, {
        routineName: routine?.name || 'Standalone Workout',
        exercisesCompleted,
        durationMinutes: finalDuration,
        sharedWith: [],
      });

      // Store workout completion flag for FitnessTracker
      localStorage.setItem(`workout_completed_today_${user.uid}`, JSON.stringify({
        completed: true,
        workoutName: routine?.name || 'Standalone Workout',
        timestamp: new Date().toISOString()
      }));

      // Dispatch event for ActivityFeed to refresh
      window.dispatchEvent(new CustomEvent('workoutCompleted', {
        detail: {
          userId: user.uid,
          workoutName: routine?.name || 'Standalone Workout',
          duration: finalDuration,
          timestamp: new Date().toISOString()
        }
      }));

      // Success feedback and navigate back
      alert(
        `Workout logged successfully!\n${routine?.name || 'Standalone Workout'}\n${formatTime(elapsedSeconds)}`
      );
      navigate(-1);
    } catch (err: any) {
      console.error('Error logging workout:', err);
      setError(err.message || 'Failed to log workout');
    } finally {
      setIsLoading(false);
    }
  };

  const getExerciseColor = (index: number) => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'];
    return colors[index % colors.length];
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  if (!isStandalone && !routine) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-center mb-2">No Routine Selected</h2>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Please select a routine from the Fitness Tracker to log a workout.
          </p>
          <Button onClick={() => navigate(-1)} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-40 border-b bg-background">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="rounded-lg hover:bg-accent p-2 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold">
                  Log Workout
                </h1>
                <p className="text-sm text-muted-foreground">
                  {routine?.name || 'Real-time tracking'}
                </p>
              </div>
              <div className="ml-auto mr-auto text-center">
                <div className="text-3xl font-bold font-mono text-blue-600">
                  {formatTime(elapsedSeconds)}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="mt-2"
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1" />
                      Resume
                    </>
                  )}
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              variant="outline"
              disabled={isLoading || alreadyLoggedToday}
              className="bg-black-000 text-white px-6 py-2 rounded-lg"
            >
              {alreadyLoggedToday ? 'Already Logged Today' : isLoading ? 'Logging...' : 'Finish Workout'}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-w-3xl">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Workout Planning Phase - Before Starting */}
          {!workoutStarted && exerciseData.length > 0 && (
            <div className="flex flex-col gap-4">
              <Card className="p-6 bg-blue-50 border-blue-200">
                <h2 className="text-xl font-semibold mb-2">Ready to start?</h2>
                <p className="text-muted-foreground mb-4">
                  You have {exerciseData.length} exercise{exerciseData.length !== 1 ? 's' : ''} ready. 
                  Click the button below to begin your workout and start the timer.
                </p>
                <Button
                  onClick={handleStartWorkout}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                  size="lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Workout
                </Button>
              </Card>
            </div>
          )}

          {/* Exercises List */}
          <div className="space-y-4">
            {exerciseData.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  No exercises added yet. Add exercises from the library on the right as you work out.
                </p>
              </div>
            ) : (
              exerciseData.map((exercise: any, exerciseIndex: number) => (
                <motion.div
                  key={exerciseIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg bg-card hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Exercise Header */}
                  <div className="flex items-center gap-3 p-4 bg-accent/20">
                    <div
                      className={`w-10 h-10 ${getExerciseColor(
                        exerciseIndex
                      )} rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}
                    >
                      {getInitial(exercise.name)}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-base">{exercise.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {exercise.target || exercise.bodyPart}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveExercise(exerciseIndex)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Exercise Details */}
                  <Separator />
                  <div className="p-4 space-y-4">
                    {/* Rest Timer Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rest Timer</label>
                      <Select value={exercise.restTimer} onValueChange={(value: string) => handleUpdateRestTimer(exerciseIndex, value)}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="00:30">30 seconds</SelectItem>
                          <SelectItem value="01:00">1 minute</SelectItem>
                          <SelectItem value="01:30">1.5 minutes</SelectItem>
                          <SelectItem value="02:00">2 minutes</SelectItem>
                          <SelectItem value="02:30">2.5 minutes</SelectItem>
                          <SelectItem value="03:00">3 minutes</SelectItem>
                          <SelectItem value="03:30">3.5 minutes</SelectItem>
                          <SelectItem value="04:00">4 minutes</SelectItem>
                          <SelectItem value="05:00">5 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sets Summary */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Sets</p>
                      <div className="space-y-2">
                        {exercise.sets.map((set: LoggedSet, setIndex: number) => {
                          const isCurrentSet = setIndex === exercise.currentSetIndex;
                          const isCompleted = setIndex < exercise.completedSets.length;
                          const completedSet = exercise.completedSets[setIndex];

                          return (
                            <div
                              key={setIndex}
                              className={`flex items-center gap-3 p-2 rounded border transition-colors ${
                                isCompleted
                                  ? 'bg-green-50 border-green-200'
                                  : isCurrentSet
                                  ? 'bg-blue-50 border-blue-200'
                                  : 'bg-muted/30 border-transparent'
                              }`}
                            >
                              <span className="text-xs font-medium text-muted-foreground w-16">
                                Set {setIndex + 1}
                              </span>
                              <div className="flex-1 flex gap-2">
                                <div className="flex-1">
                                  <Input
                                    type="number"
                                    step="0.5"
                                    value={isCompleted ? completedSet.weight : (set.weight || '')}
                                    onChange={(e) => {
                                      if (!isCompleted) {
                                        const updated = [...exerciseData];
                                        updated[exerciseIndex].sets[setIndex].weight = parseFloat(e.target.value) || 0;
                                        setExerciseData(updated);
                                      }
                                    }}
                                    readOnly={isCompleted}
                                    placeholder={getWeightLabel()}
                                    className="h-8 text-sm"
                                  />
                                </div>
                                <div className="flex-1">
                                  <Input
                                    type="number"
                                    step="0.5"
                                    value={isCompleted ? completedSet.reps : (set.reps || '')}
                                    onChange={(e) => {
                                      if (!isCompleted) {
                                        const updated = [...exerciseData];
                                        updated[exerciseIndex].sets[setIndex].reps = parseFloat(e.target.value) || 0;
                                        setExerciseData(updated);
                                      }
                                    }}
                                    readOnly={isCompleted}
                                    placeholder="Reps"
                                    className="h-8 text-sm"
                                  />
                                </div>
                              </div>

                              {isCompleted && (
                                <div className="text-green-600">
                                  <Check className="w-4 h-4" />
                                </div>
                              )}

                              {!isCompleted && (
                                <>
                                  {isCurrentSet && exercise.currentSetIndex < exercise.sets.length && (
                                    <Button
                                      size="sm"
                                      variant ="outline"
                                      onClick={() => handleLogSet(exerciseIndex)}
                                      className="bg-green-600 hover:bg-green-700 text-black px-3"
                                    >
                                      Log
                                    </Button>
                                  )}
                                  {exercise.sets.length > 1 && (
                                    <button
                                      onClick={() => {
                                        const updated = [...exerciseData];
                                        updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter(
                                          (_: any, i: number) => i !== setIndex
                                        );
                                        // Adjust currentSetIndex if needed
                                        if (updated[exerciseIndex].currentSetIndex >= updated[exerciseIndex].sets.length) {
                                          updated[exerciseIndex].currentSetIndex = Math.max(0, updated[exerciseIndex].currentSetIndex - 1);
                                        }
                                        setExerciseData(updated);
                                      }}
                                      className="text-red-500 hover:bg-red-50 p-1 rounded text-xs"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <Button
                        onClick={() => {
                          const updated = [...exerciseData];
                          updated[exerciseIndex].sets.push({ 
                            reps: exercise.sets[exercise.sets.length - 1]?.reps || 10, 
                            weight: exercise.sets[exercise.sets.length - 1]?.weight || 0 
                          });
                          setExerciseData(updated);
                        }}
                        className="text-white hover:bg-blue-50 text-sm font-medium px-2 py-1 rounded transition-colors"
                      >
                        + Add set
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Rest Timer Overlay - Active Rest Period */}
        {restTimerActive && activeRestExerciseIndex !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-8 text-center max-w-sm">
              <p className="text-sm text-muted-foreground mb-2">
                Rest time for {exerciseData[activeRestExerciseIndex].name}
              </p>
              <div className="text-6xl font-bold font-mono text-orange-600 mb-6">
                {formatTime(restTimerSeconds)}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Get ready for your next set
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleSkipRest}
                  className="flex-1"
                  variant="outline"
                >
                  Skip Rest
                </Button>
                <Button
                  onClick={handleSkipRest}
                  variant="outline"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={restTimerSeconds > 10}
                >
                  {restTimerSeconds <= 10 ? 'Ready' : `${restTimerSeconds}s`}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Right Sidebar - Exercise Library */}
      <div className="w-96 border-l bg-card overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <ExerciseLibrary
            onAddExercise={handleAddExerciseFromLibrary}
          />
        </div>
      </div>
    </div>
  );
}
