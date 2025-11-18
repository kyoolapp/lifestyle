import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useNavigate } from 'react-router-dom';
import { Target, Plus, ChevronRight, Trophy, Activity, Droplets, ChefHat, Clock } from 'lucide-react';
import { Goal } from '../hooks/useGoals';

interface GoalsWidgetProps {
  goals?: Goal[];
}

export function GoalsWidget({ goals: propGoals }: GoalsWidgetProps) {
  const navigate = useNavigate();

  // Use passed goals or fallback to default goals
  const defaultGoals = [
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
      progressColor: 'bg-rose-500'
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
      progressColor: 'bg-blue-500'
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
      progressColor: 'bg-cyan-500'
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
      progressColor: 'bg-blue-500'
    }
  ];

  const goals = propGoals || defaultGoals;

  const handleCreateNewGoal = () => {
    // Navigate to Profile page and switch to Goals tab
    navigate('/profile?tab=goals');
  };

  const handleViewAllGoals = () => {
    // Navigate to Profile page Goals tab
    navigate('/profile?tab=goals');
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      fitness: 'bg-blue-500',
      nutrition: 'bg-green-500',
      hydration: 'bg-cyan-500',
      sleep: 'bg-purple-500',
      wellness: 'bg-pink-500',
      weight: 'bg-rose-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Goals
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewAllGoals}
            className="text-blue-500 hover:text-blue-600 p-1"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.slice(0, 3).map((goal) => {
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 ${getCategoryColor(goal.category)} rounded-full`} />
                  <span className="font-medium text-sm">{goal.title}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {goal.progress}%
                </span>
              </div>
              <Progress value={goal.progress} className="h-1.5" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{goal.current} / {goal.target}</span>
                {goal.progress === 100 && (
                  <Badge className="bg-green-500 text-white text-xs py-0 px-2">
                    <Trophy className="w-3 h-3 mr-1" />
                    Complete!
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
        
        <div className="space-y-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={handleViewAllGoals}
          >
            View All Goals
          </Button>
          <Button 
            size="sm" 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white" 
            onClick={handleCreateNewGoal}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Goal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}