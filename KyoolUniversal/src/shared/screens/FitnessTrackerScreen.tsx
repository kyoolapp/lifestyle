import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';

interface FitnessTrackerScreenProps {
  user?: any;
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  completed: boolean;
}

interface WorkoutRoutine {
  id: number;
  name: string;
  exercises: Exercise[];
  duration: string;
  difficulty: string;
  targetMuscles: string[];
  createdBy: string;
}

export function FitnessTrackerScreen({ user }: FitnessTrackerScreenProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'routines' | 'exercises'>('overview');
  const [workoutRoutines, setWorkoutRoutines] = useState<WorkoutRoutine[]>([
    {
      id: 1,
      name: 'Push Day',
      exercises: [
        { id: 'ex-1-1', name: 'Bench Press', sets: 3, reps: '8-12', weight: '80kg', completed: false },
        { id: 'ex-1-2', name: 'Push Ups', sets: 3, reps: '15-20', weight: 'bodyweight', completed: false },
        { id: 'ex-1-3', name: 'Dumbbell Flyes', sets: 3, reps: '12-15', weight: '15kg', completed: false },
      ],
      duration: '45 min',
      difficulty: 'Intermediate',
      targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
      createdBy: 'You',
    },
    {
      id: 2,
      name: 'Pull Day',
      exercises: [
        { id: 'ex-2-1', name: 'Pull-ups', sets: 3, reps: '8-12', weight: 'bodyweight', completed: false },
        { id: 'ex-2-2', name: 'Barbell Rows', sets: 3, reps: '10-12', weight: '60kg', completed: false },
        { id: 'ex-2-3', name: 'Lat Pulldowns', sets: 3, reps: '12-15', weight: '50kg', completed: false },
      ],
      duration: '40 min',
      difficulty: 'Intermediate',
      targetMuscles: ['Back', 'Biceps'],
      createdBy: 'You',
    },
    {
      id: 3,
      name: 'Leg Day',
      exercises: [
        { id: 'ex-3-1', name: 'Squats', sets: 4, reps: '8-10', weight: '100kg', completed: false },
        { id: 'ex-3-2', name: 'Lunges', sets: 3, reps: '12 each leg', weight: '20kg DBs', completed: false },
        { id: 'ex-3-3', name: 'Deadlifts', sets: 3, reps: '6-8', weight: '120kg', completed: false },
      ],
      duration: '50 min',
      difficulty: 'Advanced',
      targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
      createdBy: 'You',
    },
  ]);

  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutRoutine | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  // Mock fitness data
  const todayStats = {
    steps: 8547,
    distance: 6.8,
    calories: 387,
    activeMinutes: 45,
    heartRate: 72,
    workouts: 1,
  };

  const weeklyStats = {
    totalWorkouts: 4,
    totalCalories: 1840,
    totalTime: 180, // minutes
    avgHeartRate: 75,
  };

  const quickWorkouts = [
    { name: 'Quick Walk', duration: '15 min', icon: '🚶', color: '#10b981' },
    { name: 'HIIT Training', duration: '20 min', icon: '⚡', color: '#f59e0b' },
    { name: 'Strength Training', duration: '45 min', icon: '💪', color: '#3b82f6' },
    { name: 'Yoga Flow', duration: '30 min', icon: '🧘', color: '#8b5cf6' },
  ];

  const recentActivities = [
    { id: 1, name: 'Morning Run', duration: 32, calories: 287, date: 'Today, 7:30 AM' },
    { id: 2, name: 'Strength Training', duration: 45, calories: 201, date: 'Yesterday, 6:00 PM' },
    { id: 3, name: 'Evening Walk', duration: 28, calories: 134, date: 'Yesterday, 8:15 PM' },
  ];

  const exerciseLibrary = [
    {
      id: 1,
      name: 'Bench Press',
      category: 'Chest',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      primaryMuscles: ['Pectorals', 'Triceps', 'Anterior Deltoids'],
      description: 'A fundamental upper body exercise that builds chest strength and muscle mass.',
    },
    {
      id: 2,
      name: 'Squats',
      category: 'Legs',
      equipment: 'Barbell',
      difficulty: 'Beginner',
      primaryMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
      description: 'The king of exercises that works multiple muscle groups and builds functional strength.',
    },
    {
      id: 3,
      name: 'Pull-ups',
      category: 'Back',
      equipment: 'Pull-up Bar',
      difficulty: 'Intermediate',
      primaryMuscles: ['Latissimus Dorsi', 'Rhomboids', 'Biceps'],
      description: 'A challenging bodyweight exercise that builds impressive upper body strength.',
    },
    {
      id: 4,
      name: 'Deadlifts',
      category: 'Full Body',
      equipment: 'Barbell',
      difficulty: 'Advanced',
      primaryMuscles: ['Hamstrings', 'Glutes', 'Erector Spinae'],
      description: 'A compound movement that engages nearly every muscle in the body.',
    },
  ];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startWorkout = (routine: WorkoutRoutine) => {
    setActiveWorkout(routine);
    setCurrentExerciseIndex(0);
    setTimer(0);
    setIsRunning(true);
    Alert.alert('Workout Started!', `Starting ${routine.name}. Good luck! 💪`);
  };

  const completeExercise = () => {
    if (!activeWorkout) return;

    const updatedRoutines = workoutRoutines.map(routine => {
      if (routine.id === activeWorkout.id) {
        const updatedExercises = [...routine.exercises];
        updatedExercises[currentExerciseIndex].completed = true;
        return { ...routine, exercises: updatedExercises };
      }
      return routine;
    });

    setWorkoutRoutines(updatedRoutines);

    if (currentExerciseIndex < activeWorkout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      // Workout completed
      setIsRunning(false);
      setActiveWorkout(null);
      setCurrentExerciseIndex(0);
      Alert.alert('🎉 Workout Complete!', 'Great job! You\'ve finished your workout!');
    }
  };

  const endWorkout = () => {
    Alert.alert(
      'End Workout',
      'Are you sure you want to end this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Workout',
          style: 'destructive',
          onPress: () => {
            setIsRunning(false);
            setActiveWorkout(null);
            setCurrentExerciseIndex(0);
            setTimer(0);
          },
        },
      ]
    );
  };

  const renderTabButton = (tab: string, label: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab as any)}
    >
      <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // If workout is active, show workout execution screen
  if (activeWorkout && isRunning) {
    const currentExercise = activeWorkout.exercises[currentExerciseIndex];
    const progress = ((currentExerciseIndex + 1) / activeWorkout.exercises.length) * 100;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.workoutHeader}>
          <View style={styles.workoutHeaderTop}>
            <TouchableOpacity onPress={endWorkout} style={styles.endButton}>
              <Text style={styles.endButtonText}>← End</Text>
            </TouchableOpacity>
            <Text style={styles.timerText}>{formatTime(timer)}</Text>
          </View>
          <Text style={styles.workoutTitle}>{activeWorkout.name}</Text>
          <Text style={styles.progressText}>
            Exercise {currentExerciseIndex + 1} of {activeWorkout.exercises.length}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <ScrollView style={styles.workoutContent}>
          <Card style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{currentExercise.name}</Text>
            <View style={styles.exerciseDetails}>
              <Badge variant="default" style={styles.exerciseBadge}>
                {currentExercise.sets} sets × {currentExercise.reps} reps
              </Badge>
              <Badge variant="secondary" style={styles.exerciseBadge}>
                {currentExercise.weight}
              </Badge>
            </View>
            
            <View style={styles.exerciseInstructions}>
              <Text style={styles.instructionTitle}>Instructions:</Text>
              <Text style={styles.instructionText}>
                • Focus on proper form and controlled movement{'\n'}
                • Breathe steadily throughout the exercise{'\n'}
                • Complete all sets before moving to next exercise{'\n'}
                • Rest 60-90 seconds between sets
              </Text>
            </View>

            <Button
              variant="default"
              size="lg"
              onPress={completeExercise}
              style={styles.completeButton}
            >
              Complete Exercise
            </Button>
          </Card>

          {/* Show remaining exercises */}
          <Card style={styles.remainingCard}>
            <Text style={styles.remainingTitle}>Remaining Exercises</Text>
            {activeWorkout.exercises.slice(currentExerciseIndex + 1).map((exercise, index) => (
              <View key={exercise.id} style={styles.remainingExercise}>
                <Text style={styles.remainingExerciseName}>
                  {currentExerciseIndex + index + 2}. {exercise.name}
                </Text>
                <Text style={styles.remainingExerciseDetail}>
                  {exercise.sets} × {exercise.reps}
                </Text>
              </View>
            ))}
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fitness Tracker</Text>
        <Text style={styles.subtitle}>Track workouts and achieve your fitness goals</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton('overview', 'Overview')}
        {renderTabButton('routines', 'Routines')}
        {renderTabButton('exercises', 'Exercises')}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && (
          <>
            {/* Today's Stats */}
            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{todayStats.steps.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Steps</Text>
                <Text style={styles.statGoal}>Goal: 10,000</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{todayStats.calories}</Text>
                <Text style={styles.statLabel}>Calories</Text>
                <Text style={styles.statGoal}>Burned today</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{todayStats.activeMinutes}</Text>
                <Text style={styles.statLabel}>Active Min</Text>
                <Text style={styles.statGoal}>Goal: 30 min</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{todayStats.heartRate}</Text>
                <Text style={styles.statLabel}>Heart Rate</Text>
                <Text style={styles.statGoal}>bpm current</Text>
              </Card>
            </View>

            {/* Quick Workouts */}
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Workouts</Text>
              <View style={styles.quickWorkoutsGrid}>
                {quickWorkouts.map((workout, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.quickWorkoutButton, { backgroundColor: workout.color + '15' }]}
                    onPress={() => {
                      setTimer(0);
                      setIsRunning(true);
                      Alert.alert('Quick Workout Started!', `Starting ${workout.name}. Let\'s go! 🔥`);
                    }}
                  >
                    <Text style={styles.quickWorkoutIcon}>{workout.icon}</Text>
                    <Text style={styles.quickWorkoutName}>{workout.name}</Text>
                    <Text style={styles.quickWorkoutDuration}>{workout.duration}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {/* Recent Activities */}
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activities</Text>
              {recentActivities.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityName}>{activity.name}</Text>
                    <Text style={styles.activityDate}>{activity.date}</Text>
                  </View>
                  <View style={styles.activityStats}>
                    <Text style={styles.activityDuration}>{activity.duration} min</Text>
                    <Text style={styles.activityCalories}>{activity.calories} cal</Text>
                  </View>
                </View>
              ))}
            </Card>
          </>
        )}

        {activeTab === 'routines' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Workout Routines</Text>
              <Button variant="default" size="sm">
                + Create
              </Button>
            </View>

            {workoutRoutines.map((routine) => (
              <Card key={routine.id} style={styles.routineCard}>
                <View style={styles.routineHeader}>
                  <Text style={styles.routineName}>{routine.name}</Text>
                  <View style={styles.routineBadges}>
                    <Badge variant="outline" style={styles.routineBadge}>
                      {routine.difficulty}
                    </Badge>
                    <Badge variant="secondary" style={styles.routineBadge}>
                      {routine.duration}
                    </Badge>
                  </View>
                </View>

                <Text style={styles.routineTarget}>
                  Target: {routine.targetMuscles.join(', ')}
                </Text>
                <Text style={styles.routineExercises}>
                  {routine.exercises.length} exercises
                </Text>

                <View style={styles.routineActions}>
                  <Button
                    variant="default"
                    size="sm"
                    onPress={() => startWorkout(routine)}
                    style={styles.startButton}
                  >
                    ▶ Start Workout
                  </Button>
                  <Button variant="outline" size="sm">
                    Preview
                  </Button>
                </View>
              </Card>
            ))}
          </>
        )}

        {activeTab === 'exercises' && (
          <>
            <Text style={styles.sectionTitle}>Exercise Library</Text>
            <Text style={styles.sectionSubtitle}>
              Comprehensive collection of exercises with detailed instructions
            </Text>

            {exerciseLibrary.map((exercise) => (
              <Card key={exercise.id} style={styles.exerciseLibraryCard}>
                <View style={styles.exerciseLibraryHeader}>
                  <Text style={styles.exerciseLibraryName}>{exercise.name}</Text>
                  <Badge variant="outline" style={styles.exerciseLibraryBadge}>
                    {exercise.difficulty}
                  </Badge>
                </View>
                <View style={styles.exerciseLibraryBadges}>
                  <Badge variant="secondary" style={styles.exerciseLibraryBadge}>
                    {exercise.category}
                  </Badge>
                  <Badge variant="outline" style={styles.exerciseLibraryBadge}>
                    {exercise.equipment}
                  </Badge>
                </View>
                <Text style={styles.exerciseLibraryDescription}>
                  {exercise.description}
                </Text>
                <Text style={styles.exerciseLibraryMuscles}>
                  Primary: {exercise.primaryMuscles.join(', ')}
                </Text>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  activeTabButtonText: {
    color: '#1f2937',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  statGoal: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    marginTop: -8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickWorkoutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickWorkoutButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickWorkoutIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickWorkoutName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  quickWorkoutDuration: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  activityDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  activityStats: {
    alignItems: 'flex-end',
  },
  activityDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  activityCalories: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  routineCard: {
    marginBottom: 16,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  routineName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  routineBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  routineBadge: {
    // Badge styles are handled internally
  },
  routineTarget: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  routineExercises: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  routineActions: {
    flexDirection: 'row',
    gap: 12,
  },
  startButton: {
    flex: 1,
  },
  exerciseLibraryCard: {
    marginBottom: 16,
  },
  exerciseLibraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  exerciseLibraryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  exerciseLibraryBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  exerciseLibraryBadge: {
    // Badge styles are handled internally
  },
  exerciseLibraryDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  exerciseLibraryMuscles: {
    fontSize: 12,
    color: '#9ca3af',
  },
  // Workout execution styles
  workoutHeader: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  workoutHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  endButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  endButtonText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  workoutContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  exerciseCard: {
    marginBottom: 16,
    alignItems: 'center',
    paddingVertical: 24,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  exerciseDetails: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  exerciseBadge: {
    // Badge styles are handled internally
  },
  exerciseInstructions: {
    width: '100%',
    marginBottom: 24,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  completeButton: {
    width: '100%',
  },
  remainingCard: {
    marginBottom: 24,
  },
  remainingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  remainingExercise: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  remainingExerciseName: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  remainingExerciseDetail: {
    fontSize: 12,
    color: '#9ca3af',
  },
});