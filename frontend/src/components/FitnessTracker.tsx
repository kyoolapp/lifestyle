import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Separator } from './ui/separator';
import { AppleWatchRoller } from './AppleWatchRoller';
import { EmojiMoodSelector } from './EmojiMoodSelector';
import { WorkoutEditor } from './WorkoutEditor';
import { 
  Dumbbell, 
  Plus, 
  Clock, 
  Flame,
  Target,
  TrendingUp,
  Calendar,
  Activity,
  Heart,
  Footprints,
  Zap,
  Trophy,
  Play,
  Pause,
  Square,
  RotateCcw,
  ChevronRight,
  Award,
  Timer,
  BarChart3,
  MapPin,
  Wind,
  Edit3,
  Trash2,
  Copy,
  Download,
  Share2,
  Check,
  X,
  MoreHorizontal,
  Save,
  Settings,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Search,
  BookOpen,
  Users,
  Shield,
  Zap as ZapIcon,
  Brain,
  HeartHandshake,
  FlameKindling,
  Bone,
  Sparkles,
  Filter,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

interface FitnessTrackerProps {
  selectedWorkout?: any;
  onWorkoutComplete?: () => void;
}

export function FitnessTracker({ selectedWorkout, onWorkoutComplete }: FitnessTrackerProps = {}) {
  // Exercise Library - moved to top to avoid temporal dead zone
  const exerciseLibrary = [
    {
      id: 1,
      name: 'Bench Press',
      category: 'Chest',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      primaryMuscles: ['Pectorals', 'Anterior Deltoids', 'Triceps'],
      secondaryMuscles: ['Core', 'Serratus Anterior'],
      description: 'A fundamental upper body exercise that involves lying on a bench and pressing a barbell from chest level to full arm extension.',
      instructions: [
        'Lie flat on the bench with eyes directly under the barbell',
        'Grip the bar with hands slightly wider than shoulder-width',
        'Keep feet flat on the floor and maintain a slight arch in your back',
        'Lower the bar to your chest with control',
        'Press the bar back up to starting position'
      ],
      benefits: [
        'Builds upper body strength and muscle mass',
        'Improves pushing power for daily activities',
        'Enhances chest, shoulder, and arm definition',
        'Supports functional movement patterns'
      ],
      medicinalValue: 'Strengthens the muscles used in daily pushing activities, improves bone density in the upper body, and can help prevent age-related muscle loss (sarcopenia).',
      problemsSolved: [
        'Weak upper body strength affecting daily tasks',
        'Poor posture from weak chest muscles',
        'Imbalanced muscle development',
        'Low bone density in arms and chest'
      ],
      contraindications: ['Shoulder impingement', 'Recent chest or shoulder surgery', 'Acute lower back pain'],
      tips: [
        'Always use a spotter when lifting heavy weights',
        'Keep your core engaged throughout the movement',
        'Don\'t bounce the bar off your chest',
        'Maintain steady breathing pattern'
      ],
      variations: ['Incline Bench Press', 'Decline Bench Press', 'Dumbbell Bench Press', 'Close-Grip Bench Press']
    },
    {
      id: 2,
      name: 'Squats',
      category: 'Legs',
      equipment: 'Barbell',
      difficulty: 'Beginner',
      primaryMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
      secondaryMuscles: ['Calves', 'Core', 'Lower Back'],
      description: 'Known as the "king of exercises," squats are a compound movement that works multiple muscle groups while mimicking natural movement patterns.',
      instructions: [
        'Stand with feet shoulder-width apart, toes slightly turned out',
        'Place barbell on your upper traps (high bar) or rear delts (low bar)',
        'Keep chest up and core engaged',
        'Lower by pushing hips back and bending knees',
        'Descend until thighs are parallel to floor',
        'Drive through heels to return to starting position'
      ],
      benefits: [
        'Builds functional lower body strength',
        'Improves mobility and flexibility',
        'Burns high calories due to muscle mass involved',
        'Enhances athletic performance',
        'Strengthens core stability'
      ],
      medicinalValue: 'Promotes bone health in the spine and legs, improves balance and reduces fall risk in older adults, enhances metabolic health by building muscle mass.',
      problemsSolved: [
        'Weak glutes leading to lower back pain',
        'Poor knee stability and tracking',
        'Reduced mobility in hips and ankles',
        'Overall lower body weakness',
        'Poor balance and coordination'
      ],
      contraindications: ['Severe knee arthritis', 'Recent knee or hip surgery', 'Acute lower back injury'],
      tips: [
        'Keep knees in line with toes',
        'Don\'t let knees cave inward',
        'Maintain neutral spine throughout',
        'Start with bodyweight before adding load'
      ],
      variations: ['Goblet Squats', 'Front Squats', 'Bulgarian Split Squats', 'Jump Squats']
    },
    {
      id: 3,
      name: 'Deadlifts',
      category: 'Full Body',
      equipment: 'Barbell',
      difficulty: 'Advanced',
      primaryMuscles: ['Hamstrings', 'Glutes', 'Erector Spinae'],
      secondaryMuscles: ['Traps', 'Rhomboids', 'Forearms', 'Core'],
      description: 'A hip-hinge movement that involves lifting a loaded barbell from the ground to hip level, engaging nearly every muscle in the body.',
      instructions: [
        'Stand with feet hip-width apart, bar over mid-foot',
        'Bend at hips and knees to grip the bar',
        'Keep chest up and shoulders over the bar',
        'Drive through heels and extend hips to lift the bar',
        'Keep bar close to body throughout the movement',
        'Stand tall at the top, then reverse the movement'
      ],
      benefits: [
        'Develops total-body strength and power',
        'Improves posterior chain development',
        'Enhances grip strength significantly',
        'Builds functional strength for daily activities',
        'Improves posture and spinal stability'
      ],
      medicinalValue: 'Strengthens the entire posterior chain, crucial for spinal health and injury prevention. Builds bone density throughout the body and improves functional movement patterns.',
      problemsSolved: [
        'Chronic lower back pain from weak posterior chain',
        'Poor posture from weak glutes and hamstrings',
        'Weak grip strength affecting daily tasks',
        'Overall body weakness and poor athleticism',
        'Risk of injury during lifting activities'
      ],
      contraindications: ['Acute lower back injury', 'Herniated discs', 'Recent spinal surgery'],
      tips: [
        'Master the hip hinge pattern first',
        'Keep the bar close to your body',
        'Don\'t round your back',
        'Start with light weight to perfect form'
      ],
      variations: ['Romanian Deadlifts', 'Sumo Deadlifts', 'Trap Bar Deadlifts', 'Single-Leg Deadlifts']
    },
    {
      id: 4,
      name: 'Pull-ups',
      category: 'Back',
      equipment: 'Pull-up Bar',
      difficulty: 'Intermediate',
      primaryMuscles: ['Latissimus Dorsi', 'Rhomboids', 'Middle Traps'],
      secondaryMuscles: ['Biceps', 'Rear Delts', 'Core'],
      description: 'A vertical pulling exercise that involves hanging from a bar and pulling your body weight up until your chin clears the bar.',
      instructions: [
        'Hang from a pull-up bar with palms facing away',
        'Keep hands slightly wider than shoulder-width',
        'Engage core and keep legs straight or slightly bent',
        'Pull your body up until chin clears the bar',
        'Lower yourself with control to full arm extension'
      ],
      benefits: [
        'Builds impressive upper body strength',
        'Improves functional pulling power',
        'Develops V-shaped back appearance',
        'Enhances grip strength and forearm development',
        'Improves shoulder health and stability'
      ],
      medicinalValue: 'Counteracts forward head posture from desk work, strengthens often-neglected pulling muscles, improves shoulder blade stability and reduces upper back pain.',
      problemsSolved: [
        'Rounded shoulders from poor posture',
        'Weak back muscles leading to imbalances',
        'Poor grip strength',
        'Upper crossed syndrome',
        'Lack of functional pulling strength'
      ],
      contraindications: ['Shoulder impingement', 'Recent shoulder surgery', 'Acute elbow tendinitis'],
      tips: [
        'Start with assisted pull-ups or negatives',
        'Focus on pulling with your back, not just arms',
        'Keep shoulders down and back',
        'Don\'t swing or use momentum'
      ],
      variations: ['Chin-ups', 'Wide-Grip Pull-ups', 'Commando Pull-ups', 'Weighted Pull-ups']
    },
    {
      id: 5,
      name: 'Push-ups',
      category: 'Chest',
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      primaryMuscles: ['Pectorals', 'Anterior Deltoids', 'Triceps'],
      secondaryMuscles: ['Core', 'Serratus Anterior'],
      description: 'A fundamental bodyweight exercise that builds upper body strength and can be performed anywhere without equipment.',
      instructions: [
        'Start in plank position with hands under shoulders',
        'Keep body in straight line from head to heels',
        'Lower body until chest nearly touches ground',
        'Push back up to starting position',
        'Maintain core engagement throughout'
      ],
      benefits: [
        'Builds functional pushing strength',
        'Improves core stability and strength',
        'Requires no equipment - can be done anywhere',
        'Enhances shoulder stability',
        'Scalable for all fitness levels'
      ],
      medicinalValue: 'Strengthens stabilizing muscles around the shoulder joint, improves wrist and forearm strength, enhances postural muscles supporting the spine.',
      problemsSolved: [
        'Weak upper body affecting daily activities',
        'Poor core stability',
        'Shoulder instability and weakness',
        'Lack of accessible exercise options',
        'Weak stabilizing muscles'
      ],
      contraindications: ['Wrist pain or carpal tunnel', 'Recent shoulder surgery', 'Acute lower back pain'],
      tips: [
        'Keep your core tight to prevent sagging',
        'Don\'t let your hips pike up',
        'Lower yourself slowly and with control',
        'Modify on knees or incline if needed'
      ],
      variations: ['Incline Push-ups', 'Diamond Push-ups', 'Wide-Grip Push-ups', 'Pike Push-ups']
    },
    {
      id: 6,
      name: 'Plank',
      category: 'Core',
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      primaryMuscles: ['Rectus Abdominis', 'Transverse Abdominis', 'Obliques'],
      secondaryMuscles: ['Shoulders', 'Glutes', 'Back'],
      description: 'An isometric core exercise that involves maintaining a straight body position, building endurance and stability throughout the torso.',
      instructions: [
        'Start in push-up position on forearms',
        'Keep elbows directly under shoulders',
        'Maintain straight line from head to heels',
        'Engage core and breathe normally',
        'Hold position for desired time'
      ],
      benefits: [
        'Builds core endurance and stability',
        'Improves posture and spinal alignment',
        'Reduces risk of back injury',
        'Enhances overall body awareness',
        'Transfers to improved performance in other exercises'
      ],
      medicinalValue: 'Strengthens deep stabilizing muscles of the spine, helps prevent and alleviate lower back pain, improves postural endurance for desk workers.',
      problemsSolved: [
        'Chronic lower back pain',
        'Poor posture and spinal alignment',
        'Weak core affecting daily movements',
        'Lack of body stability and balance',
        'Sports performance limitations'
      ],
      contraindications: ['Acute lower back pain', 'Shoulder impingement', 'Pregnancy (after first trimester)'],
      tips: [
        'Don\'t hold your breath',
        'Keep hips level - don\'t let them sag or pike',
        'Focus on quality over duration',
        'Start with shorter holds and build up'
      ],
      variations: ['Side Plank', 'Plank to Push-up', 'Plank with Leg Lifts', 'Reverse Plank']
    },
    {
      id: 7,
      name: 'Lunges',
      category: 'Legs',
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      primaryMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
      secondaryMuscles: ['Calves', 'Core', 'Hip Stabilizers'],
      description: 'A unilateral lower body exercise that builds strength, balance, and coordination while addressing muscle imbalances between legs.',
      instructions: [
        'Stand tall with feet hip-width apart',
        'Step forward with one leg into a lunge position',
        'Lower hips until both knees are at 90 degrees',
        'Keep front knee over ankle, not pushed out past toes',
        'Push back to starting position',
        'Repeat on other leg'
      ],
      benefits: [
        'Improves balance and coordination',
        'Builds unilateral leg strength',
        'Enhances hip mobility and stability',
        'Functional movement for daily activities',
        'Helps correct muscle imbalances'
      ],
      medicinalValue: 'Improves balance and reduces fall risk in older adults, strengthens hip stabilizers crucial for knee health, enhances functional movement patterns.',
      problemsSolved: [
        'Muscle imbalances between legs',
        'Poor balance and stability',
        'Weak hip stabilizers leading to knee pain',
        'Limited hip mobility',
        'Functional movement deficits'
      ],
      contraindications: ['Severe knee arthritis', 'Recent knee surgery', 'Acute hip flexor strain'],
      tips: [
        'Keep most of your weight on your front leg',
        'Don\'t let your front knee cave inward',
        'Keep your torso upright',
        'Control the descent and ascent'
      ],
      variations: ['Reverse Lunges', 'Walking Lunges', 'Lateral Lunges', 'Curtsy Lunges']
    },
    {
      id: 8,
      name: 'Overhead Press',
      category: 'Shoulders',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      primaryMuscles: ['Anterior Deltoids', 'Medial Deltoids', 'Triceps'],
      secondaryMuscles: ['Upper Chest', 'Core', 'Upper Back'],
      description: 'A vertical pressing movement that builds shoulder strength and stability while challenging core stability and full-body coordination.',
      instructions: [
        'Stand with feet shoulder-width apart',
        'Hold barbell at shoulder level with overhand grip',
        'Keep core tight and chest up',
        'Press bar straight up overhead',
        'Lock out arms at the top',
        'Lower bar back to shoulder level with control'
      ],
      benefits: [
        'Builds shoulder strength and stability',
        'Improves overhead mobility',
        'Enhances core stability under load',
        'Develops functional pressing power',
        'Improves posture and shoulder health'
      ],
      medicinalValue: 'Strengthens often-neglected overhead movement patterns, improves shoulder blade stability, helps prevent shoulder impingement syndrome.',
      problemsSolved: [
        'Weak overhead movement patterns',
        'Poor shoulder stability and mobility',
        'Rounded shoulders and forward head posture',
        'Inability to lift objects overhead safely',
        'Shoulder impingement issues'
      ],
      contraindications: ['Shoulder impingement', 'Recent shoulder surgery', 'Cervical spine issues'],
      tips: [
        'Keep your core engaged throughout',
        'Don\'t arch your back excessively',
        'Press the bar in a straight line',
        'Start with light weight to master the movement'
      ],
      variations: ['Dumbbell Shoulder Press', 'Push Press', 'Arnold Press', 'Pike Push-ups']
    }
  ];

  const [activeWorkout, setActiveWorkout] = useState<any>(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [workoutMode, setWorkoutMode] = useState<'create' | 'execute'>('create');
  const [isWorkoutBuilderOpen, setIsWorkoutBuilderOpen] = useState(false);
  
  // Execution mode states
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [currentWeight, setCurrentWeight] = useState(60);
  const [currentReps, setCurrentReps] = useState(10);
  const [executionData, setExecutionData] = useState<any>({});
  const [previewRoutine, setPreviewRoutine] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Exercise Library states
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  
  // Workout Editor states
  const [isWorkoutEditorOpen, setIsWorkoutEditorOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<any>(null);

  const [workoutRoutines, setWorkoutRoutines] = useState([
    {
      id: 1,
      name: 'Push Day',
      exercises: [
        { id: 'ex-1-1', name: 'Bench Press', sets: 3, reps: '8-12', weight: '80kg', completed: false },
        { id: 'ex-1-2', name: 'Push Ups', sets: 3, reps: '15-20', weight: 'bodyweight', completed: false },
        { id: 'ex-1-3', name: 'Dumbbell Flyes', sets: 3, reps: '12-15', weight: '15kg', completed: false },
        { id: 'ex-1-4', name: 'Inclined Bench Press', sets: 3, reps: '8-10', weight: '70kg', completed: false }
      ],
      duration: '45 min',
      difficulty: 'Intermediate',
      targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
      createdBy: 'John Doe',
      isPublic: true,
      downloads: 24
    },
    {
      id: 2,
      name: 'Pull Day',
      exercises: [
        { id: 'ex-2-1', name: 'Pull-ups', sets: 3, reps: '8-12', weight: 'bodyweight', completed: false },
        { id: 'ex-2-2', name: 'Barbell Rows', sets: 3, reps: '10-12', weight: '60kg', completed: false },
        { id: 'ex-2-3', name: 'Lat Pulldowns', sets: 3, reps: '12-15', weight: '50kg', completed: false }
      ],
      duration: '40 min',
      difficulty: 'Intermediate',
      targetMuscles: ['Back', 'Biceps'],
      createdBy: 'John Doe',
      isPublic: false,
      downloads: 0
    }
  ]);

  const [activeRoutineIndex, setActiveRoutineIndex] = useState(0);
  const [newRoutine, setNewRoutine] = useState({
    name: '',
    exercises: [],
    difficulty: 'Beginner',
    targetMuscles: [],
    isPublic: false
  });

  // Mock real-time data like Fitbit
  const todayStats = {
    steps: 8547,
    distance: 6.8,
    calories: 387,
    activeMinutes: 45,
    heartRate: 72,
    sleep: 7.2,
    floors: 12,
    restingHeartRate: 62
  };

  const weeklyStats = {
    totalSteps: 52847,
    totalDistance: 42.5,
    totalCalories: 2840,
    activeMinutes: 267,
    averageHeartRate: 75,
    workoutsCompleted: 4
  };

  const achievements = [
    { id: 1, title: '10K Steps', description: 'Daily step goal achieved', icon: Trophy, color: 'text-yellow-500', unlocked: true },
    { id: 2, title: 'Weekend Warrior', description: '3 workouts this weekend', icon: Award, color: 'text-blue-500', unlocked: true },
    { id: 3, title: 'Consistency King', description: '7 days active streak', icon: Flame, color: 'text-orange-500', unlocked: false },
    { id: 4, title: 'Cardio Champion', description: '30 min cardio session', icon: Heart, color: 'text-red-500', unlocked: true }
  ];

  const workoutOptions = [
    { name: 'Quick Walk', duration: '15 min', icon: Footprints, color: 'bg-green-500' },
    { name: 'HIIT Training', duration: '20 min', icon: Zap, color: 'bg-orange-500' },
    { name: 'Strength Training', duration: '45 min', icon: Dumbbell, color: 'bg-blue-500' },
    { name: 'Yoga Flow', duration: '30 min', icon: Heart, color: 'bg-purple-500' }
  ];

  const recentActivities = [
    { id: 1, name: 'Morning Run', type: 'Running', duration: 32, calories: 287, heartRate: 142, date: 'Today, 7:30 AM' },
    { id: 2, name: 'Strength Training', type: 'Weights', duration: 45, calories: 201, heartRate: 128, date: 'Yesterday, 6:00 PM' },
    { id: 3, name: 'Evening Walk', type: 'Walking', duration: 28, calories: 134, heartRate: 98, date: 'Yesterday, 8:15 PM' }
  ];

  // Timer functions
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Handle selectedWorkout from home page
  React.useEffect(() => {
    if (selectedWorkout) {
      // Check if the workout already exists in workoutRoutines
      const existingIndex = workoutRoutines.findIndex(routine => 
        routine.name === selectedWorkout.name
      );
      
      if (existingIndex !== -1) {
        // Start existing workout
        startWorkoutExecution(existingIndex);
      } else {
        // Add the workout to routines and start it
        const newWorkout = {
          ...selectedWorkout,
          id: workoutRoutines.length + 1,
          createdBy: 'You',
          isPublic: false,
          downloads: 0
        };
        setWorkoutRoutines(prev => [...prev, newWorkout]);
        
        // Start the workout (it will be at the last index)
        setTimeout(() => {
          startWorkoutExecution(workoutRoutines.length);
        }, 100);
      }
    }
  }, [selectedWorkout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Workout management functions
  const addExerciseToRoutine = (exercise: any) => {
    setNewRoutine(prev => ({
      ...prev,
      exercises: [...prev.exercises, exercise]
    }));
  };

  const removeExerciseFromRoutine = (index: number) => {
    setNewRoutine(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const saveWorkoutRoutine = () => {
    if (newRoutine.name && newRoutine.exercises.length > 0) {
      const routine = {
        id: workoutRoutines.length + 1,
        ...newRoutine,
        duration: `${newRoutine.exercises.length * 15} min`,
        createdBy: 'John Doe',
        downloads: 0
      };
      setWorkoutRoutines([...workoutRoutines, routine]);
      setNewRoutine({
        name: '',
        exercises: [],
        difficulty: 'Beginner',
        targetMuscles: [],
        isPublic: false
      });
      setIsWorkoutBuilderOpen(false);
    }
  };

  const deleteRoutine = (id: number) => {
    setWorkoutRoutines(workoutRoutines.filter(routine => routine.id !== id));
  };

  const duplicateRoutine = (routine: any) => {
    const duplicated = {
      ...routine,
      id: workoutRoutines.length + 1,
      name: `${routine.name} (Copy)`,
      downloads: 0
    };
    setWorkoutRoutines([...workoutRoutines, duplicated]);
  };

  const addToWorkoutPlan = (routine: any) => {
    const duplicated = {
      ...routine,
      id: workoutRoutines.length + 1,
      name: routine.name,
      downloads: 0,
      isPublic: false,
      createdBy: 'You'
    };
    setWorkoutRoutines([...workoutRoutines, duplicated]);
    
    // Update the original routine's download count
    setWorkoutRoutines(prev => prev.map(r => 
      r.id === routine.id ? { ...r, downloads: r.downloads + 1 } : r
    ));
  };

  const openPreview = (routine: any) => {
    setPreviewRoutine(routine);
    setIsPreviewOpen(true);
  };

  const editRoutine = (routine: any) => {
    setEditingRoutine(routine);
    setIsWorkoutEditorOpen(true);
  };

  const updateRoutine = (updatedRoutine: any) => {
    setWorkoutRoutines(prev => prev.map(routine => 
      routine.id === updatedRoutine.id ? updatedRoutine : routine
    ));
  };

  // Filter exercises based on search and category
  const filteredExercises = exerciseLibrary.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(exerciseSearchTerm.toLowerCase()) ||
                         exercise.primaryMuscles.some(muscle => muscle.toLowerCase().includes(exerciseSearchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesEquipment = selectedEquipment === 'all' || exercise.equipment === selectedEquipment;
    
    return matchesSearch && matchesCategory && matchesEquipment;
  });

  const categories = ['all', ...Array.from(new Set(exerciseLibrary.map(ex => ex.category)))];
  const equipmentTypes = ['all', ...Array.from(new Set(exerciseLibrary.map(ex => ex.equipment)))];

  // Execution mode functions
  const startWorkoutExecution = (routineIndex: number) => {
    setActiveRoutineIndex(routineIndex);
    setWorkoutMode('execute');
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setExecutionData({});
    setIsRunning(true);
    setTimer(0);
  };

  const recordSet = () => {
    const key = `${currentExerciseIndex}-${currentSetIndex}`;
    setExecutionData(prev => ({
      ...prev,
      [key]: {
        weight: currentWeight,
        reps: currentReps,
        timestamp: Date.now()
      }
    }));
    setShowMoodSelector(true);
  };

  const handleMoodSelected = (mood: any) => {
    setShowMoodSelector(false);
    
    const currentRoutine = workoutRoutines[activeRoutineIndex];
    const currentExercise = currentRoutine.exercises[currentExerciseIndex];
    
    // Move to next set or exercise
    if (currentSetIndex < currentExercise.sets - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
    } else {
      // Move to next exercise
      if (currentExerciseIndex < currentRoutine.exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSetIndex(0);
      } else {
        // Workout complete
        setWorkoutMode('create');
        setIsRunning(false);
        if (onWorkoutComplete) {
          onWorkoutComplete();
        }
        alert('Workout Complete! Great job! 🎉');
      }
    }
  };

  // Render workout execution mode
  if (workoutMode === 'execute') {
    const currentRoutine = workoutRoutines[activeRoutineIndex];
    const currentExercise = currentRoutine.exercises[currentExerciseIndex];
    const progress = ((currentExerciseIndex * currentExercise.sets + currentSetIndex + 1) / 
                     (currentRoutine.exercises.reduce((acc, ex) => acc + ex.sets, 0))) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        {/* Header with progress */}
        <div className="max-w-md mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setWorkoutMode('create');
                    if (onWorkoutComplete) {
                      onWorkoutComplete();
                    }
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Exit
                </Button>
                <div className="text-2xl font-bold text-blue-600">{formatTime(timer)}</div>
              </div>
              <CardTitle className="text-xl">{currentRoutine.name}</CardTitle>
              <Progress value={progress} className="mt-2" />
              <p className="text-sm text-muted-foreground">
                Exercise {currentExerciseIndex + 1} of {currentRoutine.exercises.length}
              </p>
            </CardHeader>
          </Card>

          {/* Current Exercise */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{currentExercise.name}</CardTitle>
              <Badge variant="outline" className="text-lg">
                Set {currentSetIndex + 1} of {currentExercise.sets}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              {!showMoodSelector ? (
                <>
                  {/* Weight and Reps Rollers */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <Label>Weight (kg)</Label>
                      <AppleWatchRoller
                        value={currentWeight}
                        min={5}
                        max={200}
                        step={2.5}
                        onChange={setCurrentWeight}
                        className="mx-auto mt-2"
                      />
                    </div>
                    <div className="text-center">
                      <Label>Reps</Label>
                      <AppleWatchRoller
                        value={currentReps}
                        min={1}
                        max={50}
                        onChange={setCurrentReps}
                        className="mx-auto mt-2"
                      />
                    </div>
                  </div>

                  {/* Record Set Button */}
                  <Button
                    onClick={recordSet}
                    size="lg"
                    className="w-full"
                  >
                    Record Set
                  </Button>
                </>
              ) : (
                <EmojiMoodSelector
                  onMoodSelected={handleMoodSelected}
                  question="How did that set feel?"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Fitness Tracker</h1>
        <p className="text-muted-foreground mt-1">Track workouts, exercises, and fitness goals</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="routines">Routines</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Today's Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Steps</CardTitle>
                <Footprints className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayStats.steps.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Goal: 10,000</p>
                <Progress value={(todayStats.steps / 10000) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Calories</CardTitle>
                <Flame className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayStats.calories}</div>
                <p className="text-xs text-muted-foreground">Burned today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Minutes</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayStats.activeMinutes}</div>
                <p className="text-xs text-muted-foreground">Goal: 30 min</p>
                <Progress value={(todayStats.activeMinutes / 30) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayStats.heartRate}</div>
                <p className="text-xs text-muted-foreground">bpm current</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Workout Options */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {workoutOptions.map((workout, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-24 flex flex-col gap-2"
                    onClick={() => {
                      setActiveWorkout(workout);
                      setIsRunning(true);
                      setTimer(0);
                    }}
                  >
                    <div className={`w-8 h-8 rounded-full ${workout.color} flex items-center justify-center`}>
                      <workout.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-sm">{workout.name}</div>
                      <div className="text-xs text-muted-foreground">{workout.duration}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <h4 className="font-medium">{activity.name}</h4>
                      <p className="text-sm text-muted-foreground">{activity.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{activity.duration} min</div>
                      <div className="text-sm text-muted-foreground">{activity.calories} cal</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routines" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Workout Routines</h2>
            <Dialog open={isWorkoutBuilderOpen} onOpenChange={setIsWorkoutBuilderOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Routine
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Workout Routine</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="routineName">Routine Name</Label>
                      <Input
                        id="routineName"
                        value={newRoutine.name}
                        onChange={(e) => setNewRoutine({ ...newRoutine, name: e.target.value })}
                        placeholder="Enter routine name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select value={newRoutine.difficulty} onValueChange={(value) => setNewRoutine({ ...newRoutine, difficulty: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Selected Exercises</Label>
                    <div className="border rounded-lg p-4 min-h-[100px]">
                      {newRoutine.exercises.length === 0 ? (
                        <p className="text-muted-foreground text-center">No exercises selected</p>
                      ) : (
                        <div className="space-y-2">
                          {newRoutine.exercises.map((exercise, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <span>{exercise.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExerciseFromRoutine(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Exercise Library</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto">
                      {exerciseLibrary.map((exercise) => (
                        <Card key={exercise.id} className="cursor-pointer hover:bg-muted/50">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-sm">{exercise.name}</CardTitle>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {exercise.difficulty}
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => addExerciseToRoutine({
                                  name: exercise.name,
                                  sets: 3,
                                  reps: '8-12',
                                  weight: 'varies'
                                })}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-xs text-muted-foreground">{exercise.primaryMuscles.join(', ')}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsWorkoutBuilderOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveWorkoutRoutine}>
                      Save Routine
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workoutRoutines.map((routine, index) => (
              <Card key={routine.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{routine.name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{routine.difficulty}</Badge>
                        <Badge variant="secondary">{routine.duration}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => duplicateRoutine(routine)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRoutine(routine.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Target Muscles:</p>
                      <p className="text-sm">{routine.targetMuscles.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Exercises ({routine.exercises.length}):</p>
                      <div className="text-sm">
                        {routine.exercises.slice(0, 3).map((ex, i) => ex.name).join(', ')}
                        {routine.exercises.length > 3 && '...'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => startWorkoutExecution(index)}
                        className="flex-1"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Workout
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPreview(routine)}
                      >
                        Preview
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="exercises" className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Exercise Library</h2>
            <p className="text-muted-foreground">Comprehensive collection of exercises with detailed instructions</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search exercises..."
                  value={exerciseSearchTerm}
                  onChange={(e) => setExerciseSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Equipment" />
              </SelectTrigger>
              <SelectContent>
                {equipmentTypes.map(equipment => (
                  <SelectItem key={equipment} value={equipment}>
                    {equipment === 'all' ? 'All Equipment' : equipment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Exercise Cards */}
          <div className="grid gap-6">
            {filteredExercises.map((exercise) => (
              <Card key={exercise.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {exercise.name}
                        <Badge variant="outline">{exercise.difficulty}</Badge>
                      </CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">{exercise.category}</Badge>
                        <Badge variant="outline">{exercise.equipment}</Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedExercise(selectedExercise?.id === exercise.id ? null : exercise)}
                    >
                      {selectedExercise?.id === exercise.id ? <ChevronRight className="w-4 h-4 rotate-90" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{exercise.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        Primary Muscles
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {exercise.primaryMuscles.map((muscle, i) => (
                          <li key={i}>{muscle}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-green-500" />
                        Benefits
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {exercise.benefits.slice(0, 3).map((benefit, i) => (
                          <li key={i}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {selectedExercise?.id === exercise.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 border-t pt-6"
                    >
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="instructions">
                          <AccordionTrigger className="text-sm">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-blue-500" />
                              Instructions
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                              {exercise.instructions.map((instruction, i) => (
                                <li key={i}>{instruction}</li>
                              ))}
                            </ol>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="medicinal">
                          <AccordionTrigger className="text-sm">
                            <div className="flex items-center gap-2">
                              <HeartHandshake className="w-4 h-4 text-green-500" />
                              Health Benefits
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 text-sm">
                              <div>
                                <h5 className="font-medium mb-2 flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-green-500" />
                                  Medicinal Value
                                </h5>
                                <p className="text-muted-foreground">{exercise.medicinalValue}</p>
                              </div>
                              <div>
                                <h5 className="font-medium mb-2 flex items-center gap-2">
                                  <FlameKindling className="w-4 h-4 text-orange-500" />
                                  Problems Solved
                                </h5>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                  {exercise.problemsSolved.map((problem, i) => (
                                    <li key={i}>{problem}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="safety">
                          <AccordionTrigger className="text-sm">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-red-500" />
                              Safety & Tips
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 text-sm">
                              <div>
                                <h5 className="font-medium mb-2 flex items-center gap-2">
                                  <Info className="w-4 h-4 text-blue-500" />
                                  Tips
                                </h5>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                  {exercise.tips.map((tip, i) => (
                                    <li key={i}>{tip}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium mb-2 flex items-center gap-2 text-red-600">
                                  <Shield className="w-4 h-4" />
                                  Contraindications
                                </h5>
                                <ul className="list-disc list-inside space-y-1 text-red-600">
                                  {exercise.contraindications.map((contraindication, i) => (
                                    <li key={i}>{contraindication}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="variations">
                          <AccordionTrigger className="text-sm">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-purple-500" />
                              Variations
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {exercise.variations.map((variation, i) => (
                                <div key={i} className="p-2 bg-muted/30 rounded text-muted-foreground">
                                  {variation}
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Achievements</h2>
            <p className="text-muted-foreground">Track your fitness milestones and accomplishments</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={achievement.unlocked ? 'border-green-200 bg-green-50' : 'opacity-60'}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${achievement.unlocked ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <achievement.icon className={`w-6 h-6 ${achievement.unlocked ? achievement.color : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{achievement.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    {achievement.unlocked && (
                      <CheckCircle className="w-6 h-6 text-green-500 ml-auto" />
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewRoutine?.name}</DialogTitle>
          </DialogHeader>
          {previewRoutine && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge variant="outline">{previewRoutine.difficulty}</Badge>
                <Badge variant="secondary">{previewRoutine.duration}</Badge>
                <Badge variant="outline">{previewRoutine.exercises.length} exercises</Badge>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Target Muscles</h4>
                <p className="text-sm text-muted-foreground">{previewRoutine.targetMuscles.join(', ')}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Exercises</h4>
                <div className="space-y-2">
                  {previewRoutine.exercises.map((exercise, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="font-medium">{exercise.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {exercise.sets} sets × {exercise.reps} reps
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => {
                  addToWorkoutPlan(previewRoutine);
                  setIsPreviewOpen(false);
                }} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Add to My Routines
                </Button>
                <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}