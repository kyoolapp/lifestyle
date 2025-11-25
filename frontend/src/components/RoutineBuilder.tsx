import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { 
  Plus, 
  ArrowLeft, 
  Trash2, 
  MoreVertical,
  Search,
  ChevronDown
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { saveRoutine, updateRoutine } from '../api/routines_api';
import { auth } from '../firebase';
import { ExerciseLibrary } from './ExerciseLibrary';
import { motion } from 'motion/react';

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

interface RoutineExercise extends Exercise {
  sets: {
    reps: number;
    weight: number;
  }[];
  restTimer: string;
}

interface RoutineBuilderProps {
  onClose?: () => void;
}

export function RoutineBuilder({ onClose }: RoutineBuilderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [routineName, setRoutineName] = useState('');
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);

  // Load routine for editing if passed via location state
  useEffect(() => {
    const state = location.state as any;
    if (state?.routine) {
      setIsEditing(true);
      setEditingRoutineId(state.routine.id);
      setRoutineName(state.routine.name);
      
      // Convert routine exercises to RoutineExercise format
      const routineExercises = state.routine.exercises.map((ex: any) => ({
        id: ex.id,
        name: ex.name,
        target: ex.target || ex.bodyPart,
        bodyPart: ex.bodyPart,
        equipment: ex.equipment,
        sets: ex.sets && Array.isArray(ex.sets) ? ex.sets : [{ reps: 10, weight: 0 }],
        restTimer: ex.restTimer || '02:00'
      }));
      setExercises(routineExercises);
    }
  }, [location.state]);

  const handleAddExercise = (exercise: Exercise) => {
    const newRoutineExercise: RoutineExercise = {
      ...exercise,
      sets: [{ reps: 10, weight: 0 }],
      restTimer: '02:00'
    };
    setExercises([...exercises, newRoutineExercise]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleUpdateSet = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: number) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updated);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets.push({ reps: 10, weight: 0 });
    setExercises(updated);
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, i) => i !== setIndex);
    setExercises(updated);
  };

  const handleUpdateRestTimer = (exerciseIndex: number, value: string) => {
    const updated = [...exercises];
    updated[exerciseIndex].restTimer = value;
    setExercises(updated);
  };

  const handleSaveRoutine = async () => {
    if (!routineName.trim()) {
      setError('Please enter a routine name');
      return;
    }
    if (exercises.length === 0) {
      setError('Please add at least one exercise');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('User not authenticated');
        setSaving(false);
        return;
      }

      const routineData = {
        name: routineName,
        exercises: exercises.map(ex => ({
          id: ex.id,
          name: ex.name,
          target: ex.target || ex.bodyPart,
          equipment: ex.equipment,
          sets: ex.sets,
          restTimer: ex.restTimer
        }))
      };

      if (isEditing && editingRoutineId) {
        // Update existing routine
        await updateRoutine(user.uid, editingRoutineId, routineData);
      } else {
        // Create new routine
        await saveRoutine(user.uid, routineData);
      }
      
      // Reset form or redirect
      setRoutineName('');
      setExercises([]);
      navigate('/fitness');
    } catch (err: any) {
      setError(err.message || 'Failed to save routine');
    } finally {
      setSaving(false);
    }
  };

  const getExerciseColor = (index: number) => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'];
    return colors[index % colors.length];
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex h-full bg-background">
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
              <h1 className="text-2xl font-semibold">{isEditing ? 'Edit Routine' : 'Create Routine'}</h1>
            </div>
            <Button
              onClick={handleSaveRoutine}
              disabled={saving}
              variant="outline"
              className="bg-blue-600 text-black hover:bg-red-100 px-6 py-2 rounded-lg"
            >
              {saving ? 'Saving...' : isEditing ? 'Update Routine' : 'Save Routine'}
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

          {/* Routine Title */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Routine Title</Label>
            <Input
              placeholder="Workout Routine Title"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              className="text-lg px-4 py-3 border-2 focus:border-blue-500"
            />
          </div>

          {/* Exercises List */}
          <div className="space-y-4">
            {exercises.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No exercises added yet. Add exercises from the library on the right.</p>
              </div>
            ) : 
              exercises.map((exercise, exerciseIndex) => (
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
                    {/* Sets Summary */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Sets</p>
                      <div className="space-y-2">
                        {exercise.sets.map((set, setIndex) => (
                          <div
                            key={setIndex}
                            className="flex items-center gap-3 p-2 bg-muted/30 rounded"
                          >
                            <span className="text-xs font-medium text-muted-foreground w-12">
                              Set {setIndex + 1}
                                </span>
                            <div className="flex-1 flex gap-2">
                              <Input
                                type="number"
                                value={set.weight}
                                onChange={(e) =>
                                  handleUpdateSet(
                                    exerciseIndex,
                                    setIndex,
                                    'weight',
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                placeholder="LBS"
                                className="h-8 text-sm"
                              />
                              <Input
                                type="number"
                                value={set.reps}
                                onChange={(e) =>
                                  handleUpdateSet(
                                    exerciseIndex,
                                    setIndex,
                                    'reps',
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                placeholder="REPS"
                                className="h-8 text-sm"
                              />
                            </div>
                            {exercise.sets.length > 1 && (
                              <button
                                onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                                className="text-red-500 hover:bg-red-50 p-1 rounded text-xs"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => handleAddSet(exerciseIndex)}
                        className="text-blue-600 hover:bg-blue-50 text-sm font-medium px-2 py-1 rounded transition-colors"
                      >
                        + Add set
                      </button>
                    </div>

                    {/* Rest Timer */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rest Timer</label>
                      <Select
                        value={exercise.restTimer}
                        onValueChange={(value: string) =>
                          handleUpdateRestTimer(exerciseIndex, value)
                        }
                      >
                        <SelectTrigger className="w-32 h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="00:30">30 seconds</SelectItem>
                          <SelectItem value="01:00">1 minute</SelectItem>
                          <SelectItem value="01:30">1:30</SelectItem>
                          <SelectItem value="02:00">2 minutes</SelectItem>
                          <SelectItem value="03:00">3 minutes</SelectItem>
                          <SelectItem value="05:00">5 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              ))
            }
        </div>
      </div>
      </div>

      {/* Right Sidebar - Exercise Library */}
      <div className="w-96 border-l bg-card overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <ExerciseLibrary
            onAddExercise={handleAddExercise}
            selectedExercises={exercises.map(e => e.id)}
          />
        </div>
      </div>
    </div>
  );
}
