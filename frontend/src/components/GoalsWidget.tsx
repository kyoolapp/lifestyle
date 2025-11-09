import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Link } from 'react-router-dom';
import { Target, Plus, ChevronRight, Trophy } from 'lucide-react';
import * as goalsApi from '../api/goals_api';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

export function GoalsWidget() {
  const [user] = useAuthState(auth);
  // Load goals from backend
  const [goals, setGoals] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadGoals = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const backendGoals = await goalsApi.getUserGoals(user.uid, 'active');
        setGoals(backendGoals.slice(0, 3)); // Show only first 3 active goals
      } catch (error) {
        console.error('Failed to load goals for widget:', error);
        // Fallback to localStorage
        const savedGoals = localStorage.getItem('lifestyle_goals');
        if (savedGoals) {
          const parsedGoals = JSON.parse(savedGoals).map((goal: any) => ({
            ...goal,
            deadline: new Date(goal.deadline),
            createdDate: new Date(goal.createdDate)
          }));
          setGoals(parsedGoals.filter((g: any) => g.status === 'active').slice(0, 3));
        }
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, [user?.uid]);

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      fitness: 'bg-blue-500',
      nutrition: 'bg-green-500',
      hydration: 'bg-cyan-500',
      sleep: 'bg-purple-500',
      wellness: 'bg-pink-500',
      weight: 'bg-orange-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-blue-500" />
            Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading goals...</p>
        </CardContent>
      </Card>
    );
  }

  if (goals.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-blue-500" />
            Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">No active goals yet</p>
          <Link to="/goals">
            <Button size="sm" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Goals
          </div>
          <Link to="/goals">
            <Button variant="ghost" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => {
          const progress = calculateProgress(goal.currentValue, goal.targetValue);
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 ${getCategoryColor(goal.category)} rounded-full`} />
                  <span className="font-medium text-sm">{goal.title}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-1.5" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                {progress === 100 && (
                  <Badge className="bg-green-500 text-white text-xs py-0 px-2">
                    <Trophy className="w-3 h-3 mr-1" />
                    Complete!
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
        
        <Link to="/goals">
          <Button variant="outline" size="sm" className="w-full mt-3">
            View All Goals
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}