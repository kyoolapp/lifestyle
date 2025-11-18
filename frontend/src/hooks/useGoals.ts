import { useState, useEffect } from 'react';
import { Target, Activity, Droplets, Dumbbell } from 'lucide-react';

interface Goal {
  id: number;
  title: string;
  target: string;
  current: string;
  progress: number;
  category: string;
  icon?: any;
  color?: string;
  bgColor?: string;
  progressColor?: string;
  deadline?: string;
  streak?: number;
}

const getInitialGoals = (): Goal[] => {
  try {
    const savedGoals = localStorage.getItem('userGoals');
    if (savedGoals) {
      const parsed = JSON.parse(savedGoals);
      // Ensure the goals have the required icon and color properties
      return parsed.map((goal: any) => ({
        ...goal,
        icon: goal.category === 'weight' ? Target :
              goal.category === 'fitness' ? Activity :
              goal.category === 'hydration' ? Droplets :
              Dumbbell,
        color: goal.color || (goal.category === 'weight' ? 'text-rose-500' :
               goal.category === 'fitness' ? 'text-blue-500' :
               goal.category === 'hydration' ? 'text-cyan-500' :
               'text-purple-500'),
        bgColor: goal.bgColor || (goal.category === 'weight' ? 'bg-rose-50' :
                 goal.category === 'fitness' ? 'bg-blue-50' :
                 goal.category === 'hydration' ? 'bg-cyan-50' :
                 'bg-purple-50'),
        progressColor: goal.progressColor || (goal.category === 'weight' ? 'bg-rose-500' :
                       goal.category === 'fitness' ? 'bg-blue-500' :
                       goal.category === 'hydration' ? 'bg-cyan-500' :
                       'bg-purple-500'),
      }));
    }
  } catch (error) {
    console.error('Error loading goals from localStorage:', error);
  }
  
  // Default goals if nothing in localStorage
  return [
    {
      id: 1,
      title: 'Lose 15 pounds',
      target: '150 lbs',
      current: '165 lbs',
      progress: 0,
      category: 'weight',
      icon: Target,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
      progressColor: 'bg-rose-500',
      deadline: 'Dec 31, 2024',
      streak: 0
    },
    {
      id: 2,
      title: 'Walk 10K steps daily',
      target: '10,000 steps',
      current: '0 steps',
      progress: 0,
      category: 'fitness',
      icon: Activity,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      progressColor: 'bg-blue-500',
      deadline: 'Dec 31, 2024',
      streak: 0
    },
    {
      id: 3,
      title: 'Drink 8 glasses of water',
      target: '8 glasses',
      current: '0 glasses',
      progress: 0,
      category: 'hydration',
      icon: Droplets,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50',
      progressColor: 'bg-cyan-500',
      deadline: 'Dec 31, 2024',
      streak: 0
    },
    {
      id: 4,
      title: 'Workout 5 times per week',
      target: '5 workouts',
      current: '0 workouts',
      progress: 0,
      category: 'fitness',
      icon: Activity,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      progressColor: 'bg-blue-500',
      deadline: 'Dec 31, 2024',
      streak: 0
    }
  ];
};

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>(getInitialGoals);

  // Save goals to localStorage whenever goals change
  useEffect(() => {
    try {
      localStorage.setItem('userGoals', JSON.stringify(goals));
    } catch (error) {
      console.error('Error saving goals to localStorage:', error);
    }
  }, [goals]);

  return { goals, setGoals };
};

export type { Goal };