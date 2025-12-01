import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { ExerciseLibrary } from './ExerciseLibrary';
import { getRoutines, saveRoutine, deleteRoutine as deleteRoutineApi, saveSchedule, getSchedule } from '../api/routines_api';
import { logWorkout, getWorkoutConsistency, checkTodayWorkout } from '../api/workouts_api';
import { auth } from '../firebase';
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
  Info,
  AlertCircle,
  BrainCircuit,
  Utensils,
  Droplet,
  PlusCircle,
  Camera,
  StretchHorizontal,
  CircleCheckBig
} from 'lucide-react';
import { motion } from 'motion/react';

interface FitnessTrackerProps {
  selectedWorkout?: any;
  onWorkoutComplete?: () => void;
}

export function FitnessTracker({ selectedWorkout, onWorkoutComplete }: FitnessTrackerProps = {}) {
  const navigate = useNavigate();
  // REMOVED: Mock exerciseLibrary array - use ExerciseLibrary component and backend data instead

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
  
  // Workout Library states
  const [isWorkoutLibraryOpen, setIsWorkoutLibraryOpen] = useState(false);

  // Routine Builder states
  const [savedRoutines, setSavedRoutines] = useState<any[]>([]);
  const [loadingRoutines, setLoadingRoutines] = useState(false);
  const [nextWorkout, setNextWorkout] = useState<any>(null);
  const [consistency7day, setConsistency7day] = useState(0);
  const [consistencyLifetime, setConsistencyLifetime] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [consistencyDailyBreakdown, setConsistencyDailyBreakdown] = useState<any[]>([]);
  const [lastSession, setLastSession] = useState<any>(null);
  const [isRoutineSelectOpen, setIsRoutineSelectOpen] = useState(false);
  const [weeklySchedule, setWeeklySchedule] = useState<Record<string, string>>({}); // day -> routineId
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [workoutCompletedToday, setWorkoutCompletedToday] = useState(false);
  const [completedWorkoutName, setCompletedWorkoutName] = useState('');
  
  // Temporary routine selection (resets at midnight)
  const [temporaryRoutineForToday, setTemporaryRoutineForToday] = useState<any>(null);
  const [temporaryRoutineDate, setTemporaryRoutineDate] = useState<string>('');

  // NOTE: Removed mock routines (Push Day, Pull Day) - use savedRoutines from backend instead

  // Timer functions
  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Load saved routines on mount
  useEffect(() => {
    const loadRoutines = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        
        setLoadingRoutines(true);
        const routines = await getRoutines(user.uid);
        setSavedRoutines(routines);
        
        // Load schedule from Firestore backend
        try {
          const schedule = await getSchedule(user.uid);
          if (schedule && Object.keys(schedule).length > 0) {
            setWeeklySchedule(schedule as Record<string, string>);
          }
        } catch (error) {
          console.error('Error loading schedule from backend, using empty schedule:', error);
        }
        
        // Load temporary routine if it exists and is still valid for today
        const tempRoutineData = localStorage.getItem(`temp_routine_${user.uid}`);
        if (tempRoutineData) {
          try {
            const { routineId, date } = JSON.parse(tempRoutineData);
            const today = new Date().toLocaleDateString('en-US');
            
            if (date === today) {
              // Still valid for today
              const routine = routines.find((r: any) => r.id === routineId);
              if (routine) {
                setTemporaryRoutineForToday(routine);
                setTemporaryRoutineDate(date);
              }
            } else {
              // Expired, remove it
              localStorage.removeItem(`temp_routine_${user.uid}`);
              setTemporaryRoutineForToday(null);
              setTemporaryRoutineDate('');
            }
          } catch (error) {
            console.error('Error parsing temporary routine:', error);
            localStorage.removeItem(`temp_routine_${user.uid}`);
          }
        }

        // Load workout consistency data
        try {
          const consistencyData = await getWorkoutConsistency(user.uid, 7);
          if (consistencyData && consistencyData.data) {
            setConsistency7day(consistencyData.data.consistency_7day || 0);
            setConsistencyLifetime(consistencyData.data.lifetime_consistency || 0);
            setCurrentStreak(consistencyData.data.current_streak || 0);
            setConsistencyDailyBreakdown(consistencyData.data.daily_breakdown || []);
          }
        } catch (error) {
          console.error('Error loading workout consistency:', error);
          // Use defaults if fetch fails
          setConsistency7day(0);
          setConsistencyLifetime(0);
          setCurrentStreak(0);
          setConsistencyDailyBreakdown([]);
        }

        // Check if today's workout is already logged (persisted state)
        try {
          const todayStatus = await checkTodayWorkout(user.uid);
          if (todayStatus && todayStatus.data && todayStatus.data.has_logged_today) {
            setWorkoutCompletedToday(true);
            setCompletedWorkoutName('Today\'s Workout');
          }
        } catch (error) {
          console.error('Error checking today workout status:', error);
        }
      } catch (error) {
        console.error('Error loading routines:', error);
      } finally {
        setLoadingRoutines(false);
      }
    };

    loadRoutines();
  }, []);

  // Check and reset temporary routine at midnight
  useEffect(() => {
    const checkMidnight = () => {
      if (temporaryRoutineForToday && temporaryRoutineDate) {
        const today = new Date().toLocaleDateString('en-US');
        if (today !== temporaryRoutineDate) {
          // Midnight has passed, reset temporary routine
          console.log('Resetting temporary routine at midnight');
          setTemporaryRoutineForToday(null);
          setTemporaryRoutineDate('');
          const user = auth.currentUser;
          if (user) {
            localStorage.removeItem(`temp_routine_${user.uid}`);
          }
        }
      }
    };

    const interval = setInterval(checkMidnight, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [temporaryRoutineForToday, temporaryRoutineDate]);

  // Get today's scheduled workout (prioritize temporary routine)
  useEffect(() => {
    // If there's a temporary routine for today, use that
    if (temporaryRoutineForToday) {
      setNextWorkout(temporaryRoutineForToday);
      return;
    }

    // Otherwise, check the weekly schedule
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    if (weeklySchedule[dayOfWeek]) {
      const scheduledRoutineId = weeklySchedule[dayOfWeek];
      const routine = savedRoutines.find(r => r.id === scheduledRoutineId);
      setNextWorkout(routine || null);
    } else {
      setNextWorkout(null);
    }
  }, [weeklySchedule, savedRoutines, temporaryRoutineForToday]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Refresh consistency data
  const refreshConsistency = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      console.log('Refreshing consistency data...');
      const consistencyData = await getWorkoutConsistency(user.uid, 7);
      if (consistencyData && consistencyData.data) {
        console.log('Consistency data received:', consistencyData.data);
        setConsistency7day(consistencyData.data.consistency_7day || 0);
        setConsistencyLifetime(consistencyData.data.lifetime_consistency || 0);
        setCurrentStreak(consistencyData.data.current_streak || 0);
        setConsistencyDailyBreakdown(consistencyData.data.daily_breakdown || []);
        
        // Check if today has a completed workout
        const today = new Date().toLocaleDateString('en-US');
        const todayData = consistencyData.data.daily_breakdown.find((day: any) => {
          const dayDate = new Date(day.date).toLocaleDateString('en-US');
          return dayDate === today;
        });
        
        console.log('Today data:', todayData);
        if (todayData && (todayData.status === 'completed' || todayData.completed)) {
          console.log('Workout completed today detected!');
          setWorkoutCompletedToday(true);
        }
      }
    } catch (error) {
      console.error('Error refreshing consistency:', error);
    }
  };

  // Refresh consistency data when component comes into focus
  useEffect(() => {
    const handleFocus = async () => {
      console.log('Window focus detected, refreshing consistency');
      await refreshConsistency();
      
      // Check if workout was just completed
      const user = auth.currentUser;
      if (user) {
        const completionData = localStorage.getItem(`workout_completed_today_${user.uid}`);
        if (completionData) {
          try {
            const { workoutName } = JSON.parse(completionData);
            console.log('Workout completion flag found:', workoutName);
            setWorkoutCompletedToday(true);
            setCompletedWorkoutName(workoutName);
            // Clear the flag after reading it
            localStorage.removeItem(`workout_completed_today_${user.uid}`);
          } catch (error) {
            console.error('Error parsing workout completion flag:', error);
          }
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Also refresh when page visibility changes (when user comes back to tab)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        console.log('Page became visible, refreshing consistency');
        await refreshConsistency();
        
        // Check for workout completion flag
        const user = auth.currentUser;
        if (user) {
          const completionData = localStorage.getItem(`workout_completed_today_${user.uid}`);
          if (completionData) {
            try {
              const { workoutName } = JSON.parse(completionData);
              console.log('Workout completion flag found on visibility change:', workoutName);
              setWorkoutCompletedToday(true);
              setCompletedWorkoutName(workoutName);
              localStorage.removeItem(`workout_completed_today_${user.uid}`);
            } catch (error) {
              console.error('Error parsing workout completion flag:', error);
            }
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Refresh consistency when workout completion is detected
  useEffect(() => {
    if (workoutCompletedToday) {
      console.log('Workout completed detected, refreshing consistency after 1 second');
      const timer = setTimeout(() => {
        refreshConsistency();
      }, 1000); // Wait 1 second to ensure Firestore has written the data
      return () => clearTimeout(timer);
    }
  }, [workoutCompletedToday]);

  const handleDeleteRoutine = async (routineId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      if (window.confirm('Are you sure you want to delete this routine?')) {
        await deleteRoutineApi(user.uid, routineId);
        setSavedRoutines(savedRoutines.filter(r => r.id !== routineId));
      }
    } catch (error) {
      console.error('Error deleting routine:', error);
      alert('Failed to delete routine');
    }
  };

  const handleSaveSchedule = async (newSchedule: Record<string, string>) => {
    const user = auth.currentUser;
    if (!user) {
      console.log('No user logged in');
      return;
    }
    
    try {
      console.log('Saving schedule:', newSchedule);
      setWeeklySchedule(newSchedule);
      const result = await saveSchedule(user.uid, newSchedule);
      console.log('Schedule saved successfully:', result);
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Failed to save schedule: ' + (error instanceof Error ? error.message : String(error)));
      // Revert to previous schedule on error
      const prevSchedule = localStorage.getItem(`workout_schedule_${user.uid}`);
      if (prevSchedule) {
        setWeeklySchedule(JSON.parse(prevSchedule));
      }
    }
  };

  const handleSelectTemporaryRoutine = (routine: any) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const today = new Date().toLocaleDateString('en-US');
      const tempData = { routineId: routine.id, date: today };
      
      // Save to localStorage
      localStorage.setItem(`temp_routine_${user.uid}`, JSON.stringify(tempData));
      
      // Update state
      setTemporaryRoutineForToday(routine);
      setTemporaryRoutineDate(today);
      setIsRoutineSelectOpen(false);
      
      console.log(`Selected temporary routine for today: ${routine.name}`);
    } catch (error) {
      console.error('Error setting temporary routine:', error);
      alert('Failed to select routine');
    }
  };

  const handleClearTemporaryRoutine = () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Clear state
      setTemporaryRoutineForToday(null);
      setTemporaryRoutineDate('');
      
      // Clear from localStorage
      localStorage.removeItem(`temp_routine_${user.uid}`);
      
      console.log('Cleared temporary routine for today');
    } catch (error) {
      console.error('Error clearing temporary routine:', error);
      alert('Failed to remove routine');
    }
  };
  
  // NOTE: Removed filteredExercises and categories - use ExerciseLibrary component instead
  
  // NOTE: Removed startWorkoutExecution and related execution mode functions - these referenced deleted mock routines state

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hero Card - Next Workout or Congratulations */}
            {workoutCompletedToday ? (
              <div className="lg:col-span-2 relative bg-gradient-to-br from-green-900 to-green-800 rounded-2xl p-8 text-white shadow-xl border border-green-700 group overflow-hidden">
                <div className="absolute inset-0 rounded-2xl pointer-events-none">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-green-600/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
                </div>
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-green-500 hover:bg-green-700 text-white text-xs">DONE FOR TODAY</Badge>
                      <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                    </div>
                    <h3 className="text-4xl text-green-300 font-bold mb-2">Congrats! 🎉</h3>
                    <p className="text-slate-100 text-lg mb-2 font-semibold">
                      You've completed today's workout!
                    </p>
                    <p className="text-slate-200 text-sm">
                      {completedWorkoutName && `Great job on finishing ${completedWorkoutName}!`}
                      Keep up the amazing consistency!
                    </p>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={async () => {
                        // Refresh consistency one more time before dismissing
                        await refreshConsistency();
                        setWorkoutCompletedToday(false);
                        setCompletedWorkoutName('');
                      }}
                      className="bg-white hover:bg-slate-100 text-slate-900 font-semibold gap-2 shadow-lg"
                    >
                      <Check className="w-5 h-5 fill-slate-900" />
                      Awesome!
                    </Button>
                  </div>
                </div>
              </div>
            ) : nextWorkout ? (
              <div className="lg:col-span-2 relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-slate-700 group overflow-hidden">
                <div className="absolute inset-0 rounded-2xl pointer-events-none">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-purple-500 hover:bg-purple-700 text-white text-xs">NEXT UP</Badge>
                    <span className="text-xs text-slate-400 font-medium">Scheduled for Today</span>
                  </div>
                  <h3 className="text-4xl text-purple-500 font-bold mb-2">{nextWorkout.name}</h3>
                  <p className="text-slate-300 text-sm mb-6 max-w-lg">
                    {nextWorkout.notes || 'Ready to crush your workout!'}
                  </p>
                  <div className="flex items-center gap-6 mb-8 text-slate-300 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span>{nextWorkout.exercises?.length ? Math.ceil(nextWorkout.exercises.length * 10) : 45} Mins</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-purple-400" />
                      <span>{nextWorkout.exercises?.length || 0} Exercises</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-purple-400" />
                      <span>Est. {Math.ceil((nextWorkout.exercises?.length || 0) * 80)} Cal</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('/workout/log', { state: { routine: nextWorkout } })}
                      className="bg-white hover:bg-slate-100 text-slate-900 font-semibold gap-2 shadow-lg group-hover:scale-105 transition-transform"
                    >
                      <Play className="w-5 h-5 fill-slate-900" />
                      Start Workout
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setIsRoutineSelectOpen(true)}
                      className="bg-black text-slate-900 font-semibold hover:bg-black-000"
                    >
                      <ChevronRight className="w-5 h-5" />
                      Change Routine
                    </Button>
                    {temporaryRoutineForToday && (
                      <Button
                        size="lg"
                        variant="destructive"
                        onClick={handleClearTemporaryRoutine}
                        className="gap-2"
                      >
                        <X className="w-5 h-5" />
                        Unschedule
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-2 relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl border border-slate-700 group overflow-hidden flex flex-col justify-between min-h-96">
                <div className="absolute inset-0 rounded-2xl pointer-events-none">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-semibold mb-2 text-slate-900">Nothing Scheduled for Today</h3>
                  <p className="text-slate-300 text-sm">Plan your workout for the day or set up a weekly schedule.</p>
                </div>
                {loadingRoutines ? (
                  <div className="relative z-10 flex items-center gap-2 text-slate-300">
                    <div className="animate-spin rounded-full h-4 w-4 border border-purple-400"></div>
                    <span className="text-sm">Loading routines...</span>
                  </div>
                ) : (
                  <div className="relative z-10 flex gap-3 w-full">
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setIsRoutineSelectOpen(true)}
                      className="bg-white hover:bg-slate-900 text-slate-900 font-semibold gap-2 shadow-lg flex-1"
                    >
                      <Dumbbell className="w-5 h-5" />
                      Select Routine
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setIsScheduleDialogOpen(true)}
                      className="bg-white hover:bg-slate-900 text-slate-900 gap-2 font-semibold shadow-lg  flex-1"
                    >
                      <Calendar className="w-5 h-5" />
                      Schedule Week
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Consistency Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-bold text-slate-900">Consistency</h4>
                  <p className="text-xs text-slate-500">7-Day Streak</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900">{consistency7day}%</div>
                  <p className={`text-xs font-semibold ${consistency7day >= 70 ? 'text-green-600' : consistency7day >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {consistency7day >= 70 ? 'On Track' : consistency7day >= 50 ? 'Improving' : 'Needs Work'}
                  </p>
                </div>
              </div>

              {/* Daily Breakdown with correct order (past 3, today, future 3) */}
              <div className="flex justify-between items-center gap-1 mb-6">
                {consistencyDailyBreakdown.length > 0 ? (
                  consistencyDailyBreakdown.map((dayData: any, idx: number) => {
                    const status = dayData.status || (dayData.completed ? 'completed' : 'missed');
                    let bgClass, icon, title;
                    switch (status) {
                      case 'completed':
                        bgClass = 'bg-green-100 border-green-200 text-green-600';
                        icon = <Check className="w-4 h-4" />;
                        title = `${dayData.date}: Workout completed ✓`;
                        break;
                      case 'missed':
                        bgClass = 'bg-red-50 border-red-100 text-red-500';
                        icon = <X className="w-4 h-4" />;
                        title = `${dayData.date}: Missed workout ✗`;
                        break;
                      case 'pending':
                      default:
                        bgClass = 'bg-slate-100 border-slate-200 text-slate-400';
                        icon = <span className="text-xs">-</span>;
                        title = `${dayData.date}: No decision yet`;
                        break;
                    }
                    
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        <div 
                          className={`w-8 h-8 rounded-full border flex items-center justify-center ${bgClass}`}
                          title={title}
                        >
                          {icon}
                        </div>
                        <span className="text-xs text-slate-400">{dayData.day_of_week}</span>
                      </div>
                    );
                  })
                ) : (
                  // Fallback to mock data if no real data
                  ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                    let status = 'gray';
                    if (idx === 0 || idx === 1 || idx === 3) status = 'green';
                    if (idx === 2) status = 'red';
                    if (idx === 4 || idx === 5) status = 'gray';
                    if (idx === 6) status = 'slate';

                    const bgClass = status === 'green' ? 'bg-green-100 border-green-200 text-green-600' : 
                                   status === 'red' ? 'bg-red-50 border-red-100 text-red-500' :
                                   status === 'slate' ? 'bg-slate-50 border-slate-100 text-slate-300' :
                                   'bg-slate-100 border-slate-200 text-slate-400';
                    
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${bgClass}`}>
                          {status === 'green' && <Check className="w-4 h-4" />}
                          {status === 'red' && <X className="w-4 h-4" />}
                          {status === 'gray' && <span className="text-xs">-</span>}
                          {status === 'slate' && <span className="text-xs">?</span>}
                        </div>
                        <span className="text-xs text-slate-400">{day}</span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-4">
                {/* Current Streak */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-4 h-4 text-orange-600" />
                    <p className="text-xs text-orange-700 font-semibold">Streak</p>
                  </div>
                  <div className="text-2xl font-bold text-orange-900">{currentStreak}</div>
                  <p className="text-xs text-orange-600 mt-1">{currentStreak === 1 ? 'day' : 'days'}</p>
                </div>

                {/* 7-Day Consistency */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-blue-700 font-semibold">7-Day</p>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{consistency7day}%</div>
                  <p className="text-xs text-blue-600 mt-1">This week</p>
                </div>

                {/* Lifetime Consistency */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-purple-600" />
                    <p className="text-xs text-purple-700 font-semibold">Lifetime</p>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">{consistencyLifetime}%</div>
                  <p className="text-xs text-purple-600 mt-1">All time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Bench Press Progress */}
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">Bench Press</CardTitle>
                      <p className="text-xs text-slate-500">Estimated 1RM</p>
                    </div>
                  </div>
                  <Badge className="bg-green-50 text-green-700 hover:bg-green-50">+15 lbs</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-24">
                  {[40, 55, 50, 75].map((height, idx) => (
                    <div key={idx} className="flex-1 bg-purple-300 rounded-t-sm hover:shadow-lg transition-shadow" style={{ height: `${height}%` }}></div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Daily Movement */}
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-sm">Daily Movement</CardTitle>
                  <Badge className="bg-red-100 text-red-600 hover:bg-red-100 animate-pulse">Sedentary!</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-700">8,547 Steps</span>
                    <span className="text-slate-500">Goal: 10k</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                  <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-700">Active Minutes</h5>
                    <p className="text-xs text-slate-500">Only 12 mins movement</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Last Session */}
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-sm">Last Session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm text-slate-700">Pull Day B</span>
                    <span className="text-xs text-slate-400">Yesterday</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <CircleCheckBig className="w-3 h-3 text-green-500" />
                    <span>Completed</span>
                    <span>•</span>
                    <span>55 Mins</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full text-xs" onClick={() => setActiveTab('routines')}>
                  View History
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="routines" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">Workout Routines</h2>
              <p className="text-sm text-muted-foreground mt-1">Create custom routines or select saved templates</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate('/workout/log/standalone')}
                className="gap-2 bg-green-600 hover:bg-green-700"
                variant="outline"
              >
                <Play className="w-4 h-4" />
                Log Workout
              </Button>
              <Button 
                onClick={() => navigate('/routine/new')}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
                variant="outline"
              >
                <Plus className="w-4 h-4" />
                New Routine
              </Button>
            </div>
          </div>

          {/* Weekly Schedule Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <CardTitle>Weekly Schedule</CardTitle>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsScheduleDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  {Object.keys(weeklySchedule).length > 0 ? 'Update' : 'Create'} Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {Object.keys(weeklySchedule).length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    No schedule yet. Create one to organize your weekly workouts.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsScheduleDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Schedule
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                    const routineId = weeklySchedule[day.toLowerCase()];
                    const routine = savedRoutines.find(r => r.id === routineId);
                    
                    return (
                      <div key={day} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-700">{day}</p>
                          {routine ? (
                            <p className="text-sm text-blue-600 font-medium">{routine.name}</p>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">No workout</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Saved Routines */}
          {loadingRoutines ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading routines...</p>
            </div>
          ) : savedRoutines.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No routines yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first routine to get started with Hevy-style workout logging
                </p>
                <Button 
                  onClick={() => navigate('/routine/new')}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create First Routine
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedRoutines.map((routine: any) => (
                <Card key={routine.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div>
                      <CardTitle className="text-lg">{routine.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {routine.exercises?.length || 0} exercises
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Exercise list */}
                    <div className="space-y-2">
                      {routine.exercises?.slice(0, 3).map((exercise: any, idx: number) => (
                        <div key={idx} className="text-sm">
                          <div className="font-medium">{exercise.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {exercise.sets?.length || 0} sets × {exercise.sets?.[0]?.reps || 'varies'} reps
                          </div>
                        </div>
                      ))}
                      {(routine.exercises?.length || 0) > 3 && (
                        <p className="text-xs text-muted-foreground pt-2">
                          +{(routine.exercises?.length || 0) - 3} more
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          navigate('/workout/log', { state: { routine } });
                        }}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Log
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          navigate('/routine/new', { state: { routine } });
                        }}
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600"
                        onClick={() => handleDeleteRoutine(routine.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* REMOVED: Legacy Library Routines section - this was mock data with hardcoded Push Day/Pull Day routines */}
        </TabsContent>

        <TabsContent value="exercises" className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Exercise Library</h2>
            <p className="text-muted-foreground">Browse exercises from our comprehensive database</p>
          </div>

          <ExerciseLibrary 
            showDetailsView={true}
            onAddExercise={(exercise) => {
              // Could open a detail view or add to a workout
              console.log(`Selected: ${exercise.name}`);
            }}
          />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Achievements</h2>
            <p className="text-muted-foreground">Track your fitness milestones and accomplishments</p>
          </div>
          {/* REMOVED: Mock achievements section - was using mock achievements data */}
        </TabsContent>
      </Tabs>

      {/* Routine Selection Dialog */}
      <Dialog open={isRoutineSelectOpen} onOpenChange={setIsRoutineSelectOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select a Routine for Today</DialogTitle>
          </DialogHeader>
          {loadingRoutines ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border border-purple-600"></div>
            </div>
          ) : savedRoutines.length === 0 ? (
            <div className="py-8 text-center">
              <Dumbbell className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <h3 className="font-semibold text-slate-700 mb-2">No Routines Yet</h3>
              <p className="text-slate-500 text-sm mb-4">Create your first routine to get started</p>
              <Button 
                onClick={() => {
                  setIsRoutineSelectOpen(false);
                  navigate('/routine/new');
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Routine
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {savedRoutines.map((routine) => (
                <Card 
                  key={routine.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow hover:border-purple-400"
                  onClick={() => {
                    handleSelectTemporaryRoutine(routine);
                  }}
                >
                  <CardContent className="pt-6">
                    <h4 className="font-bold text-slate-900 mb-2">{routine.name}</h4>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-purple-600" />
                        <span>{routine.exercises?.length || 0} exercises</span>
                      </div>
                      {routine.notes && (
                        <div className="text-slate-500 text-xs">{routine.notes}</div>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full mt-4 gap-2"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleSelectTemporaryRoutine(routine);
                      }}
                    >
                      <Check className="w-4 h-4" />
                      Select This
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Weekly Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Your Weekly Workouts</DialogTitle>
          </DialogHeader>
          {loadingRoutines ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border border-purple-600"></div>
            </div>
          ) : savedRoutines.length === 0 ? (
            <div className="py-8 text-center">
              <Dumbbell className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <h3 className="font-semibold text-slate-700 mb-2">No Routines Yet</h3>
              <p className="text-slate-500 text-sm mb-4">Create routines first to set up your weekly schedule</p>
              <Button 
                onClick={() => {
                  setIsScheduleDialogOpen(false);
                  navigate('/routine/new');
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Routine
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div key={day} className="space-y-2">
                    <Label className="text-sm font-semibold">{day}</Label>
                    <Select
                      value={weeklySchedule[day.toLowerCase()] || 'none'}
                      onValueChange={(routineId: string) => {
                        const newSchedule = { ...weeklySchedule };
                        if (routineId && routineId !== 'none') {
                          newSchedule[day.toLowerCase()] = routineId;
                        } else {
                          // Set to empty string instead of deleting, so Firestore will update the field
                          newSchedule[day.toLowerCase()] = '';
                        }
                        handleSaveSchedule(newSchedule);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="No workout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No workout</SelectItem>
                        {savedRoutines.map((routine) => (
                          <SelectItem key={routine.id} value={routine.id}>
                            {routine.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <Button 
              variant="outline"
                onClick={() => setIsScheduleDialogOpen(false)}
                className="w-full mt-6"
              >
                <Check className="w-4 h-4 mr-2" />
                Save Schedule
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}