import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from './ui/dropdown-menu';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
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
  Play
} from 'lucide-react';
import { motion } from 'motion/react';
// Using native date formatting instead of date-fns

interface WorkoutListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentWorkout: any;
  onStartWorkout: (workout: any) => void;
  onSetCurrentWorkout: (workout: any) => void;
}

export function WorkoutListDialog({ 
  open, 
  onOpenChange, 
  currentWorkout, 
  onStartWorkout,
  onSetCurrentWorkout
}: WorkoutListDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Workout List</DialogTitle>
          <DialogDescription>
            Manage your workout routines and track your fitness progress
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Streaks Section */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Your Streaks</h3>
              <div className="grid grid-cols-3 gap-4">
                {streaks.map((streak, index) => {
                  const Icon = streak.icon;
                  return (
                    <motion.div
                      key={streak.type}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                          <Icon className={`w-6 h-6 ${streak.color}`} />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{streak.days}</div>
                          <div className="text-sm text-gray-600">{streak.type}</div>
                          <div className="text-xs text-gray-500">days</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Date Navigation */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Navigate by Date</h3>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Select Date
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date);
                          setIsCalendarOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDate('prev')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {formatDateNavigation(selectedDate)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Goal - {displayedWorkout.goal}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDate('next')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Workout Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Today's Workout</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Change Workout
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {allWorkouts.map((workout) => (
                      <DropdownMenuItem
                        key={workout.id}
                        onClick={() => onSetCurrentWorkout(workout)}
                      >
                        {workout.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{displayedWorkout.name}</h3>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{displayedWorkout.difficulty}</Badge>
                    <Badge variant="secondary">{displayedWorkout.duration}</Badge>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  Target Muscles: {displayedWorkout.targetMuscles.join(', ')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exercise List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Exercises ({displayedWorkout.exercises.length})</CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercise
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {displayedWorkout.exercises.map((exercise: any, index: number) => (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-lg font-semibold text-gray-900">
                        {index + 1}.
                      </div>
                      <div>
                        <div className="font-semibold">{exercise.name}</div>
                        <div className="text-sm text-gray-600">
                          {exercise.sets} sets
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-600">
                        {exercise.sets} sets
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-1">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleRemoveWorkout(exercise.id)}>
                            Remove
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRemindLater(exercise.id)}>
                            Remind me later
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => {
                onStartWorkout(displayedWorkout);
                onOpenChange(false);
              }}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Workout
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-6"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}