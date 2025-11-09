import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Target,
  Plus,
  Edit,
  Trash2,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  Flag,
  Dumbbell,
  Droplets,
  Apple,
  Moon,
  Heart,
  Trophy,
  Zap,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as goalsApi from '../api/goals_api';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'fitness' | 'nutrition' | 'hydration' | 'sleep' | 'wellness' | 'weight';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: Date;
  createdDate: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused';
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  title: string;
  targetValue: number;
  isCompleted: boolean;
  completedDate?: Date;
}

interface GoalTemplate {
  title: string;
  description: string;
  category: Goal['category'];
  unit: string;
  suggestedTarget: number;
  icon: React.ComponentType<any>;
}

const goalTemplates: GoalTemplate[] = [
  {
    title: 'Daily Water Intake',
    description: 'Stay hydrated throughout the day',
    category: 'hydration',
    unit: 'glasses',
    suggestedTarget: 8,
    icon: Droplets
  },
  {
    title: 'Weekly Workouts',
    description: 'Maintain consistent exercise routine',
    category: 'fitness',
    unit: 'workouts',
    suggestedTarget: 4,
    icon: Dumbbell
  },
  {
    title: 'Weight Loss',
    description: 'Achieve target weight in a healthy way',
    category: 'weight',
    unit: 'lbs',
    suggestedTarget: 10,
    icon: TrendingUp
  },
  {
    title: 'Sleep Hours',
    description: 'Get adequate rest for recovery',
    category: 'sleep',
    unit: 'hours',
    suggestedTarget: 8,
    icon: Moon
  },
  {
    title: 'Daily Steps',
    description: 'Stay active with daily movement',
    category: 'fitness',
    unit: 'steps',
    suggestedTarget: 10000,
    icon: Heart
  },
  {
    title: 'Protein Intake',
    description: 'Meet daily protein requirements',
    category: 'nutrition',
    unit: 'grams',
    suggestedTarget: 120,
    icon: Apple
  }
];

export function GoalSetting() {
  const [user] = useAuthState(auth);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'fitness' as Goal['category'],
    targetValue: 0,
    currentValue: 0,
    unit: '',
    deadline: '',
    priority: 'medium' as Goal['priority']
  });

  // Load goals from backend on component mount
  useEffect(() => {
    const loadGoals = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Check if there are localStorage goals to migrate
        const localGoals = localStorage.getItem('lifestyle_goals');
        if (localGoals) {
          // Migrate localStorage goals to backend
          const parsedGoals = JSON.parse(localGoals);
          for (const goal of parsedGoals) {
            try {
              await goalsApi.createGoal(user.uid, {
                ...goal,
                deadline: new Date(goal.deadline),
                createdDate: new Date(goal.createdDate)
              });
            } catch (error) {
              console.error('Failed to migrate goal:', goal.title, error);
            }
          }
          // Clear localStorage after migration
          localStorage.removeItem('lifestyle_goals');
        }
        
        // Load goals from backend
        const backendGoals = await goalsApi.getUserGoals(user.uid);
        setGoals(backendGoals);
      } catch (error) {
        console.error('Failed to load goals:', error);
        // Fallback to localStorage if backend fails
        const savedGoals = localStorage.getItem('lifestyle_goals');
        if (savedGoals) {
          const parsedGoals = JSON.parse(savedGoals).map((goal: any) => ({
            ...goal,
            deadline: new Date(goal.deadline),
            createdDate: new Date(goal.createdDate)
          }));
          setGoals(parsedGoals);
        }
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, [user?.uid]);

  // No longer need to save to localStorage - backend handles persistence

  const getCategoryIcon = (category: Goal['category']) => {
    const icons = {
      fitness: Dumbbell,
      nutrition: Apple,
      hydration: Droplets,
      sleep: Moon,
      wellness: Heart,
      weight: TrendingUp
    };
    return icons[category];
  };

  const getCategoryColor = (category: Goal['category']) => {
    const colors = {
      fitness: 'bg-blue-500',
      nutrition: 'bg-green-500',
      hydration: 'bg-cyan-500',
      sleep: 'bg-purple-500',
      wellness: 'bg-pink-500',
      weight: 'bg-orange-500'
    };
    return colors[category];
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    const colors = {
      low: 'bg-gray-500',
      medium: 'bg-yellow-500',
      high: 'bg-red-500'
    };
    return colors[priority];
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline: Date) => {
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleTemplateSelect = (template: GoalTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      title: template.title,
      description: template.description,
      category: template.category,
      targetValue: template.suggestedTarget,
      currentValue: 0,
      unit: template.unit,
      deadline: '',
      priority: 'medium'
    });
    setShowCreateForm(true);
  };

  const handleCreateGoal = async () => {
    if (!formData.title || !formData.deadline || !user?.uid) return;

    const newGoal: Goal = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      targetValue: formData.targetValue,
      currentValue: formData.currentValue,
      unit: formData.unit,
      deadline: new Date(formData.deadline),
      createdDate: new Date(),
      priority: formData.priority,
      status: 'active',
      milestones: []
    };

    try {
      const createdGoal = await goalsApi.createGoal(user.uid, newGoal);
      setGoals([...goals, createdGoal]);
      setShowCreateForm(false);
      setSelectedTemplate(null);
      resetForm();
    } catch (error) {
      console.error('Failed to create goal:', error);
      alert('Failed to create goal. Please try again.');
    }
  };

  const handleUpdateGoal = async (goalId: string, updates: Partial<Goal>) => {
    if (!user?.uid) return;

    try {
      if (updates.currentValue !== undefined || updates.status !== undefined) {
        await goalsApi.updateGoalProgress(user.uid, goalId, updates.currentValue, updates.status);
      }
      
      setGoals(goals.map(goal => 
        goal.id === goalId ? { ...goal, ...updates } : goal
      ));
    } catch (error) {
      console.error('Failed to update goal:', error);
      alert('Failed to update goal. Please try again.');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user?.uid) return;

    try {
      await goalsApi.deleteGoal(user.uid, goalId);
      setGoals(goals.filter(goal => goal.id !== goalId));
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert('Failed to delete goal. Please try again.');
    }
  };

  const handleProgressUpdate = (goalId: string, newValue: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const updatedGoal = { ...goal, currentValue: newValue };
      if (newValue >= goal.targetValue && goal.status !== 'completed') {
        updatedGoal.status = 'completed';
      }
      handleUpdateGoal(goalId, updatedGoal);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'fitness',
      targetValue: 0,
      currentValue: 0,
      unit: '',
      deadline: '',
      priority: 'medium'
    });
  };

  const filteredGoals = goals.filter(goal => {
    if (activeTab === 'active') return goal.status === 'active';
    if (activeTab === 'completed') return goal.status === 'completed';
    return true;
  });

  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const overallProgress = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;

  if (showCreateForm) {
    return (
      <div className="space-y-6 px-2 md:px-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Create New Goal</h1>
            <p className="text-muted-foreground">Set a new health or fitness goal to track your progress</p>
          </div>
          <Button variant="outline" onClick={() => { setShowCreateForm(false); resetForm(); }}>
            Cancel
          </Button>
        </div>

        {/* Goal Templates */}
        {!selectedTemplate && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Choose a Goal Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goalTemplates.map((template, index) => {
                const Icon = template.icon;
                return (
                  <motion.div
                    key={template.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 ${getCategoryColor(template.category)} rounded-xl flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{template.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                            <Badge variant="secondary" className="text-xs">
                              Target: {template.suggestedTarget} {template.unit}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
            
            <div className="text-center pt-4">
              <Button variant="outline" onClick={() => setSelectedTemplate({} as GoalTemplate)}>
                Create Custom Goal
              </Button>
            </div>
          </div>
        )}

        {/* Goal Form */}
        {selectedTemplate && (
          <Card>
            <CardHeader>
              <CardTitle>Goal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Goal Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Enter goal title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as Goal['category']})}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="fitness">Fitness</option>
                    <option value="nutrition">Nutrition</option>
                    <option value="hydration">Hydration</option>
                    <option value="sleep">Sleep</option>
                    <option value="wellness">Wellness</option>
                    <option value="weight">Weight</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border rounded-lg h-20"
                  placeholder="Describe your goal..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Target Value</label>
                  <input
                    type="number"
                    value={formData.targetValue}
                    onChange={(e) => setFormData({...formData, targetValue: Number(e.target.value)})}
                    className="w-full p-3 border rounded-lg"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full p-3 border rounded-lg"
                    placeholder="e.g., glasses, workouts, lbs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value as Goal['priority']})}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={handleCreateGoal} className="flex-1">
                  <Target className="w-4 h-4 mr-2" />
                  Create Goal
                </Button>
                <Button variant="outline" onClick={() => { setShowCreateForm(false); resetForm(); }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 md:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Goal Setting</h1>
          <p className="text-muted-foreground">Track your health and fitness goals</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{goals.length}</p>
                <p className="text-sm text-muted-foreground">Total Goals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedGoals}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeGoals}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(overallProgress)}%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {['active', 'completed', 'all'].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab as any)}
            className="capitalize"
          >
            {tab} ({tab === 'active' ? activeGoals : tab === 'completed' ? completedGoals : goals.length})
          </Button>
        ))}
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredGoals.map((goal, index) => {
            const Icon = getCategoryIcon(goal.category);
            const progress = calculateProgress(goal.currentValue, goal.targetValue);
            const daysRemaining = getDaysRemaining(goal.deadline);
            
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      {/* Goal Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 ${getCategoryColor(goal.category)} rounded-xl flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{goal.title}</h3>
                            <Badge className={`${getPriorityColor(goal.priority)} text-white text-xs`}>
                              {goal.priority}
                            </Badge>
                            {goal.status === 'completed' && (
                              <Badge className="bg-green-500 text-white text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                            </span>
                            <span className="flex items-center gap-1">
                              <BarChart3 className="w-4 h-4" />
                              {goal.currentValue} / {goal.targetValue} {goal.unit}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Section */}
                      <div className="w-full md:w-64 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        
                        {goal.status === 'active' && (
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={goal.currentValue}
                              onChange={(e) => handleProgressUpdate(goal.id, Number(e.target.value))}
                              className="flex-1 px-2 py-1 text-sm border rounded"
                              min="0"
                              max={goal.targetValue}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleProgressUpdate(goal.id, goal.currentValue + 1)}
                            >
                              +1
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filteredGoals.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
            <p className="text-muted-foreground mb-4">
              {activeTab === 'active' 
                ? "Create your first goal to start tracking your progress!" 
                : activeTab === 'completed' 
                ? "Complete some goals to see them here!"
                : "Start by creating your first health or fitness goal!"
              }
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}