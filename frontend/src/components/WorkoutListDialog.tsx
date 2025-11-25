import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from './ui/dropdown-menu';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MoreVertical,
  Calendar as CalendarIcon,
  Target,
  Clock,
  Flame,
  Footprints,
  Droplets,
  Play,
  Share2,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { logWorkout } from '../api/workouts_api';
// Using native date formatting instead of date-fns

interface WorkoutListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentWorkout: any;
  onStartWorkout: (workout: any) => void;
  onSetCurrentWorkout: (workout: any) => void;
  user?: any;
  friends?: any[];
}

export function WorkoutListDialog({ 
  open, 
  onOpenChange, 
  currentWorkout, 
  onStartWorkout,
  onSetCurrentWorkout,
  user,
  friends = []
}: WorkoutListDialogProps) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isLoggingWorkout, setIsLoggingWorkout] = useState(false);
  const [workoutToLog, setWorkoutToLog] = useState<any>(null);

  // All available workout routines
  const allWorkouts = [
    {
      id: 1,
      name: 'Push Day',
      difficulty: 'Intermediate',
      duration: '45 min',
      targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
      goal: 'Chest',
      exercises: [
        { id: 1, name: 'Bench Press', sets: 3, reps: '8-12', weight: '80kg' },
        { id: 2, name: 'Push-ups', sets: 3, reps: '15-20', weight: 'bodyweight' },
        { id: 3, name: 'Dumbbell Flyes', sets: 3, reps: '12-15', weight: '15kg' },
        { id: 4, name: 'Inclined Bench Press', sets: 3, reps: '8-10', weight: '70kg' }
      ]
    },
    {
      id: 2,
      name: 'Pull Day',
      difficulty: 'Intermediate', 
      duration: '40 min',
      targetMuscles: ['Back', 'Biceps'],
      goal: 'Back',
      exercises: [
        { id: 1, name: 'Pull-ups', sets: 3, reps: '8-12', weight: 'bodyweight' },
        { id: 2, name: 'Barbell Rows', sets: 3, reps: '10-12', weight: '60kg' },
        { id: 3, name: 'Lat Pulldowns', sets: 3, reps: '12-15', weight: '50kg' }
      ]
    },
    {
      id: 3,
      name: 'Leg Day',
      difficulty: 'Advanced',
      duration: '50 min', 
      targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
      goal: 'Legs',
      exercises: [
        { id: 1, name: 'Squats', sets: 4, reps: '8-10', weight: '100kg' },
        { id: 2, name: 'Deadlifts', sets: 3, reps: '6-8', weight: '120kg' },
        { id: 3, name: 'Lunges', sets: 3, reps: '12-15', weight: '20kg' }
      ]
    }
  ];

  // Streak data
  const streaks = [
    { type: 'Workout', days: 5, icon: Flame, color: 'text-orange-500' },
    { type: 'Walking', days: 12, icon: Footprints, color: 'text-green-500' },
    { type: 'Water', days: 8, icon: Droplets, color: 'text-blue-500' }
  ];

  const handleRemoveWorkout = (workoutId: number) => {
    console.log('Remove workout:', workoutId);
    // In a real app, this would remove the workout
  };

  const handleRemindLater = (workoutId: number) => {
    console.log('Remind later:', workoutId);
    // In a real app, this would set a reminder
  };

  const formatDateNavigation = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const displayedWorkout = currentWorkout || allWorkouts[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Select Your Workout</DialogTitle>
          <DialogDescription>
            Choose a workout routine and log it with your friends
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Workout Selection Grid */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Available Workouts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {allWorkouts.map((workout) => (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (workout.id - 1) * 0.1 }}
                  onClick={() => onSetCurrentWorkout(workout)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    displayedWorkout.id === workout.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="font-semibold text-sm mb-2">{workout.name}</div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div><strong>Duration:</strong> {workout.duration}</div>
                    <div><strong>Difficulty:</strong> {workout.difficulty}</div>
                    <div><strong>Muscles:</strong> {workout.targetMuscles.join(', ')}</div>
                    <div><strong>Exercises:</strong> {workout.exercises.length}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Selected Workout Details */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2">{displayedWorkout.name}</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <div><strong>Duration:</strong> {displayedWorkout.duration}</div>
              <div><strong>Difficulty:</strong> {displayedWorkout.difficulty}</div>
              <div><strong>Target Muscles:</strong> {displayedWorkout.targetMuscles.join(', ')}</div>
              <div><strong>Exercises:</strong> {displayedWorkout.exercises.length}</div>
            </div>
          </div>

          {/* Exercise List (Compact) */}
          <div>
            <h3 className="font-semibold mb-2">Exercises ({displayedWorkout.exercises.length})</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {displayedWorkout.exercises.map((exercise: any, index: number) => (
                <div key={exercise.id} className="text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                  <div className="font-medium">{index + 1}. {exercise.name}</div>
                  <div className="text-xs text-muted-foreground">{exercise.sets} sets • {exercise.reps} reps • {exercise.weight}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => {
                onOpenChange(false);
                navigate('/workout/log/standalone');
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Finish & Log Workout
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Share Workout Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Your Workout
            </DialogTitle>
            <DialogDescription>
              Select friends to share your completed workout with
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Friends List */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {friends && friends.length > 0 ? (
                friends.map((friend) => (
                  <div key={friend.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg border">
                    <Checkbox
                      id={`friend-${friend.id}`}
                      checked={selectedFriends.includes(friend.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedFriends([...selectedFriends, friend.id]);
                        } else {
                          setSelectedFriends(selectedFriends.filter(id => id !== friend.id));
                        }
                      }}
                    />
                    <Label 
                      htmlFor={`friend-${friend.id}`}
                      className="cursor-pointer flex-1"
                    >
                      {friend.name || friend.email}
                    </Label>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No friends to share with yet.
                </div>
              )}
            </div>

            {/* Summary */}
            {workoutToLog && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="text-sm">
                  <div className="font-semibold">{workoutToLog.name}</div>
                  <div className="text-gray-600">{workoutToLog.exercises?.length || 0} exercises • {workoutToLog.duration}</div>
                </div>
                {selectedFriends.length > 0 && (
                  <div className="text-xs text-gray-600">
                    Sharing with {selectedFriends.length} friend{selectedFriends.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowShareDialog(false);
                  setSelectedFriends([]);
                }}
                disabled={isLoggingWorkout}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!user?.id || !workoutToLog) return;

                  try {
                    setIsLoggingWorkout(true);
                    
                    await logWorkout(user.id, {
                      routineName: workoutToLog.name,
                      exercisesCompleted: workoutToLog.exercises.map((ex: any) => ({
                        name: ex.name,
                        sets: ex.sets,
                        reps: ex.reps,
                        weight: ex.weight,
                        duration_minutes: (ex.sets || 3) * 5 // Estimate 5 min per set
                      })),
                      durationMinutes: parseInt(workoutToLog.duration) || 45,
                      sharedWith: selectedFriends
                    });

                    // Dispatch event for real-time updates
                    window.dispatchEvent(new CustomEvent('workoutCompleted', {
                      detail: {
                        userId: user.id,
                        routineName: workoutToLog.name,
                        exercisesCount: workoutToLog.exercises?.length || 0,
                        sharedWith: selectedFriends
                      }
                    }));

                    // Close dialogs
                    setShowShareDialog(false);
                    setSelectedFriends([]);
                    setWorkoutToLog(null);
                    onOpenChange(false);

                    // Show success message
                    alert(`Workout logged! ${selectedFriends.length > 0 ? `Shared with ${selectedFriends.length} friend${selectedFriends.length !== 1 ? 's' : ''}.` : 'Not shared with anyone.'}`);
                  } catch (err) {
                    console.error('Failed to log workout:', err);
                    alert('Failed to log workout. Please try again.');
                  } finally {
                    setIsLoggingWorkout(false);
                  }
                }}
                disabled={isLoggingWorkout}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoggingWorkout ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Log Workout
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}